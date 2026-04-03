"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  X,
  Upload,
  CheckCircle,
  Package,
  Tag,
  DollarSign,
  Boxes,
  FileText,
  ChevronRight,
  AlertCircle,
  ImageIcon,
  Palette,
  Trash2,
  Loader2,
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { useCreateProduct, useUploadProductImages } from "@/hooks/useProducts";
import { useAdmin } from "@/store/adminStore";
import {
  PRODUCT_ONTOLOGY,
  getSubcategories,
  getAttributesForSubcategory,
} from "@/data/productOntology";
import { cn } from "@/lib/utils";
import type { CategoryAttribute, ProductAttributeValue } from "@/data/types";

const steps = [
  { id: 1, label: "Informations de base", icon: FileText },
  { id: 2, label: "Images (max 5)", icon: ImageIcon },
  { id: 3, label: "Attributs dynamiques", icon: Palette },
  { id: 4, label: "Prix & Stock", icon: DollarSign },
  { id: 5, label: "Confirmation", icon: CheckCircle },
];

export default function AdminAddProductPage() {
  const router = useRouter();
  const createProduct = useCreateProduct();
  const uploadImages = useUploadProductImages();
  const { adminSettings } = useAdmin();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    subcategory: "",
    price: "",
    originalPrice: "",
    stock: "",
    sku: "",
    tags: "",
    features: [""],
    specifications: {} as Record<string, string>,
    images: [] as string[],
    imageFiles: [] as File[],
    attributes: [] as ProductAttributeValue[],
    hasVariants: false,
    currencyCode: "HTG",
    isFeatured: false,
    minProcessingDays: "1",
    maxProcessingDays: "5",
  });

  const availableSubcategories = getSubcategories(formData.categoryId);
  const defaultAttributes = getAttributesForSubcategory(
    formData.categoryId,
    formData.subcategory,
  );

  const handleAddFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ""] });
  };

  const handleRemoveFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      const remainingSlots = 5 - formData.images.length;
      const filesToProcess = files.slice(0, remainingSlots);

      filesToProcess.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, reader.result as string],
            imageFiles: [...prev.imageFiles, file],
          }));
        };
        reader.readAsDataURL(file);
      });
    },
    [formData.images.length],
  );

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imageFiles: prev.imageFiles.filter((_, i) => i !== index),
    }));
  };

  const handleAttributeChange = (
    attribute: Omit<CategoryAttribute, "categoryId">,
    value: string | string[],
  ) => {
    setFormData((prev) => {
      const existingIndex = prev.attributes.findIndex(
        (a) => a.attributeId === attribute.name,
      );
      const newAttribute: ProductAttributeValue = {
        attributeId: attribute.name,
        name: attribute.name,
        value,
      };

      if (existingIndex >= 0) {
        const newAttributes = [...prev.attributes];
        newAttributes[existingIndex] = newAttribute;
        return { ...prev, attributes: newAttributes };
      }
      return { ...prev, attributes: [...prev.attributes, newAttribute] };
    });
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      let uploadedImageUrls: string[] = [];
      if (formData.imageFiles.length > 0) {
        const tempProductId = `temp-${Date.now()}`;
        uploadedImageUrls = await uploadImages.mutateAsync({
          productId: tempProductId,
          files: formData.imageFiles,
        });
      }

      await createProduct.mutateAsync({
        name: formData.name,
        description: formData.description,
        category_id: formData.categoryId,
        subcategory: formData.subcategory,
        price: parseFloat(formData.price),
        original_price: formData.originalPrice
          ? parseFloat(formData.originalPrice)
          : undefined,
        stock: parseInt(formData.stock),
        sku: formData.sku || `SKU-${Date.now()}`,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        features: formData.features.filter(Boolean),
        specifications: formData.specifications,
        images:
          uploadedImageUrls.length > 0
            ? uploadedImageUrls
            : ["/images/placeholder.jpg"],
        attributes: formData.attributes,
        has_variants: formData.hasVariants,
        currency_code: formData.currencyCode as any,
        is_featured: formData.isFeatured,
        min_processing_days: parseInt(formData.minProcessingDays) || 1,
        max_processing_days: parseInt(formData.maxProcessingDays) || 5,
      });

      setIsLoading(false);
      setIsSuccess(true);
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Erreur lors de la création du produit");
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.name &&
          formData.description &&
          formData.categoryId &&
          formData.subcategory
        );
      case 2:
        return formData.images.length > 0;
      case 3:
        return true;
      case 4:
        return formData.price && formData.stock;
      default:
        return true;
    }
  };

  if (isSuccess) {
    return (
      <AdminLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-semibold text-neutral-900 mb-2">
              Produit créé avec succès !
            </h1>
            <p className="text-neutral-500 mb-8 max-w-md mx-auto">
              Le produit a été ajouté au catalogue et est maintenant visible par
              les clients.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/admin/produits">
                <Button variant="outline">Voir tous les produits</Button>
              </Link>
              <Button onClick={() => router.refresh()}>
                Ajouter un autre produit
              </Button>
            </div>
          </motion.div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/admin/produits">
            <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">
              Ajouter un produit
            </h1>
            <p className="text-neutral-500">
              Créez un nouveau produit pour le catalogue
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="bg-white p-4 rounded-lg border border-neutral-200">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium",
                    currentStep === step.id
                      ? "bg-neutral-900 text-white"
                      : currentStep > step.id
                        ? "bg-green-100 text-green-700"
                        : "bg-neutral-100 text-neutral-500",
                  )}
                >
                  {currentStep > step.id ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <span
                  className={cn(
                    "ml-2 text-sm font-medium hidden sm:block",
                    currentStep === step.id
                      ? "text-neutral-900"
                      : "text-neutral-500",
                  )}
                >
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-12 sm:w-20 h-0.5 mx-2 sm:mx-4",
                      currentStep > step.id ? "bg-green-500" : "bg-neutral-200",
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-lg border border-neutral-200"
        >
          {/* Step 1: Informations */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-neutral-900">
                Informations du produit
              </h2>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Nom du produit *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ex: Montre Royal Oak Chronograph"
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Décrivez le produit en détail..."
                  rows={4}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Catégorie *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        categoryId: e.target.value,
                        subcategory: "", // Reset subcategory when category changes
                        attributes: [], // Reset attributes
                      })
                    }
                    className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900"
                  >
                    <option value="">Sélectionnez une catégorie</option>
                    {PRODUCT_ONTOLOGY.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Sous-catégorie *
                  </label>
                  <select
                    value={formData.subcategory}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        subcategory: e.target.value,
                        attributes: [], // Reset attributes when subcategory changes
                      })
                    }
                    disabled={!formData.categoryId}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900 disabled:bg-neutral-100 disabled:text-neutral-400"
                  >
                    <option value="">Sélectionnez une sous-catégorie</option>
                    {availableSubcategories.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Tags (séparés par des virgules)
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    placeholder="luxe, montre, or, automatique"
                    className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Caractéristiques
                </label>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) =>
                          handleFeatureChange(index, e.target.value)
                        }
                        placeholder={`Caractéristique ${index + 1}`}
                        className="flex-1 px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900"
                      />
                      {formData.features.length > 1 && (
                        <button
                          onClick={() => handleRemoveFeature(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={handleAddFeature}
                    className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter une caractéristique
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Images */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-neutral-900">
                Images du produit
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((image, index) => (
                  <div
                    key={index}
                    className="relative aspect-square bg-neutral-100 rounded-lg overflow-hidden"
                  >
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <label className="aspect-square border-2 border-dashed border-neutral-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-neutral-400 transition-colors">
                  <Upload className="w-8 h-8 text-neutral-400 mb-2" />
                  <span className="text-sm text-neutral-500">
                    Ajouter une image
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <p className="text-sm text-neutral-500">
                Format recommandé : JPG ou PNG, taille minimale 800x800px
              </p>
            </div>
          )}

          {/* Step 3: Dynamic Attributes */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-neutral-900">
                  Attributs du produit
                </h2>
                {formData.subcategory && (
                  <span className="text-sm text-neutral-500">
                    Sous-catégorie:{" "}
                    {
                      availableSubcategories.find(
                        (s) => s.id === formData.subcategory,
                      )?.name
                    }
                  </span>
                )}
              </div>

              {formData.subcategory ? (
                <div className="space-y-4">
                  <p className="text-sm text-neutral-500">
                    Renseignez les spécificités liés à cette sous-catégorie.
                  </p>

                  {defaultAttributes.map((attr) => {
                    const attrId = attr.name;
                    const existingValue = formData.attributes.find(
                      (a) => a.attributeId === attrId || a.name === attrId,
                    )?.value;

                    return (
                      <div
                        key={attrId}
                        className="border border-neutral-200 rounded-lg p-4"
                      >
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          {attr.label}
                          {attr.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </label>

                        {attr.type === "color" && (
                          <div className="flex flex-wrap gap-2">
                            {attr.options?.map((color) => {
                              const values = Array.isArray(existingValue)
                                ? existingValue
                                : typeof existingValue === "string" &&
                                    existingValue !== ""
                                  ? [existingValue]
                                  : [];
                              const isSelected = values.includes(color);

                              return (
                                <button
                                  key={color}
                                  onClick={() => {
                                    const newValues = isSelected
                                      ? values.filter((v) => v !== color)
                                      : [...values, color];
                                    handleAttributeChange(
                                      { ...attr, id: attrId } as any,
                                      newValues,
                                    );
                                  }}
                                  className={cn(
                                    "px-3 py-2 rounded-lg border text-sm transition-colors",
                                    isSelected
                                      ? "border-neutral-900 bg-neutral-900 text-white"
                                      : "border-neutral-200 hover:border-neutral-400",
                                  )}
                                >
                                  {color}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {attr.type === "select" && (
                          <select
                            value={(existingValue as string) || ""}
                            onChange={(e) =>
                              handleAttributeChange(
                                { ...attr, id: attrId } as any,
                                e.target.value,
                              )
                            }
                            className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900"
                          >
                            <option value="">Sélectionnez...</option>
                            {attr.options?.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        )}

                        {attr.type === "multiselect" && (
                          <div className="flex flex-wrap gap-2">
                            {attr.options?.map((opt) => {
                              const values = (existingValue as string[]) || [];
                              const isSelected = values.includes(opt);

                              return (
                                <button
                                  key={opt}
                                  onClick={() => {
                                    const newValues = isSelected
                                      ? values.filter((v) => v !== opt)
                                      : [...values, opt];
                                    handleAttributeChange(
                                      { ...attr, id: attrId } as any,
                                      newValues,
                                    );
                                  }}
                                  className={cn(
                                    "px-3 py-2 rounded-lg border text-sm transition-colors",
                                    isSelected
                                      ? "border-neutral-900 bg-neutral-900 text-white"
                                      : "border-neutral-200 hover:border-neutral-400",
                                  )}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {attr.type === "text" && (
                          <input
                            type="text"
                            value={(existingValue as string) || ""}
                            onChange={(e) =>
                              handleAttributeChange(
                                { ...attr, id: attrId } as any,
                                e.target.value,
                              )
                            }
                            placeholder={`Entrez ${attr.label.toLowerCase()}`}
                            className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900"
                          />
                        )}

                        {attr.type === "number" && (
                          <input
                            type="number"
                            value={(existingValue as string) || ""}
                            onChange={(e) =>
                              handleAttributeChange(
                                { ...attr, id: attrId } as any,
                                e.target.value,
                              )
                            }
                            placeholder="0"
                            className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900"
                          />
                        )}

                        {attr.type === "boolean" && (
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={existingValue === "true"}
                              onChange={(e) =>
                                handleAttributeChange(
                                  { ...attr, id: attrId } as any,
                                  e.target.checked ? "true" : "false",
                                )
                              }
                              className="w-5 h-5 rounded border-neutral-300"
                            />
                            <span className="text-sm text-neutral-700">
                              Oui
                            </span>
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  <Palette className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                  <p>
                    Veuillez d&apos;abord sélectionner une catégorie et une
                    sous-catégorie à l&apos;étape 1.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Price & Stock */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-neutral-900">
                Prix et stock
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Devise
                  </label>
                  <select
                    value={formData.currencyCode}
                    onChange={(e) =>
                      setFormData({ ...formData, currencyCode: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900 bg-white"
                  >
                    {(adminSettings?.currencies || []).map((curr) => (
                      <option key={curr.code} value={curr.code}>
                        {curr.code} ({curr.symbol})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Prix de vente *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Prix original
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          originalPrice: e.target.value,
                        })
                      }
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Quantité en stock *
                  </label>
                  <div className="relative">
                    <Boxes className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({ ...formData, stock: e.target.value })
                      }
                      placeholder="0"
                      className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    SKU (référence)
                  </label>
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) =>
                        setFormData({ ...formData, sku: e.target.value })
                      }
                      placeholder="SKU-001"
                      className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Jours de préparation (Min)
                  </label>
                  <select
                    value={formData.minProcessingDays}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minProcessingDays: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900 bg-white"
                  >
                    {[1, 2, 3, 4, 5, 7, 10].map((day) => (
                      <option key={`min-${day}`} value={day}>
                        {day} jour{day > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Jours de préparation (Max)
                  </label>
                  <select
                    value={formData.maxProcessingDays}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxProcessingDays: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900 bg-white"
                  >
                    {[1, 2, 3, 4, 5, 7, 10, 14, 21, 30].map((day) => (
                      <option key={`max-${day}`} value={day}>
                        {day} jour{day > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="text-xs text-neutral-500">
                Remarque : Assurez-vous que le produit sera prêt à être expédié
                dans cet intervalle. Ce délai sera utilisé pour calculer la date
                de livraison prévue pour le client.
              </p>

              <div className="pt-4 border-t border-neutral-100">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className={cn(
                      "w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out relative",
                      formData.isFeatured ? "bg-neutral-900" : "bg-neutral-200",
                    )}
                  >
                    <div
                      className={cn(
                        "w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out",
                        formData.isFeatured ? "translate-x-6" : "translate-x-0",
                      )}
                    />
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) =>
                      setFormData({ ...formData, isFeatured: e.target.checked })
                    }
                    className="hidden"
                  />
                  <div>
                    <span className="block text-sm font-medium text-neutral-900">
                      Produit en vedette
                    </span>
                    <span className="block text-xs text-neutral-500 max-w-md">
                      Mettre ce produit en avant sur la page d&apos;accueil et
                      dans les sections spéciales.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Step 5: Confirmation */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-neutral-900">
                Confirmation
              </h2>

              <div className="bg-neutral-50 p-6 rounded-lg space-y-4">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Nom</span>
                  <span className="font-medium">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Catégorie</span>
                  <span className="font-medium">
                    {
                      PRODUCT_ONTOLOGY.find((c) => c.id === formData.categoryId)
                        ?.name
                    }{" "}
                    &gt;{" "}
                    {
                      availableSubcategories.find(
                        (s) => s.id === formData.subcategory,
                      )?.name
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">En vedette</span>
                  <span
                    className={cn(
                      "font-medium",
                      formData.isFeatured
                        ? "text-green-600"
                        : "text-neutral-400",
                    )}
                  >
                    {formData.isFeatured ? "Oui" : "Non"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Prix</span>
                  <span className="font-medium">
                    {formData.price} {formData.currencyCode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Stock</span>
                  <span className="font-medium">{formData.stock} unités</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Images</span>
                  <span className="font-medium">
                    {formData.images.length} image(s)
                  </span>
                </div>
              </div>

              <p className="text-sm text-neutral-500">
                Vérifiez les informations avant de créer le produit. Le produit
                sera immédiatement visible dans le catalogue.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-neutral-200">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={currentStep === 1}
            >
              Précédent
            </Button>
            {currentStep < 5 ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed()}
              >
                Suivant
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={createProduct.isPending || uploadImages.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {createProduct.isPending || uploadImages.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  "Créer le produit"
                )}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
