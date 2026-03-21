"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Package, Plus, Upload, X } from "lucide-react";
import { PRODUCT_ONTOLOGY } from "@/data/productOntology";
import type { SupabaseProduct } from "@/data/types";
import { Button } from "@/components/ui/Button";

type DraftImage = {
  file: File;
  preview: string;
};

export type SellerProductFormSubmission = {
  name: string;
  description: string;
  categoryId: string;
  price: number;
  originalPrice?: number;
  stock: number;
  sku: string;
  tags: string[];
  features: string[];
  existingImages: string[];
  newFiles: File[];
  minProcessingDays: number;
  maxProcessingDays: number;
};

type SellerProductFormProps = {
  mode: "create" | "edit";
  product?: SupabaseProduct | null;
  isSubmitting?: boolean;
  onSubmit: (values: SellerProductFormSubmission) => Promise<void> | void;
};

const DEFAULT_FEATURES = [""];

export function SellerProductForm({
  mode,
  product,
  isSubmitting = false,
  onSubmit,
}: SellerProductFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [stock, setStock] = useState("");
  const [sku, setSku] = useState("");
  const [tags, setTags] = useState("");
  const [features, setFeatures] = useState<string[]>(DEFAULT_FEATURES);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<DraftImage[]>([]);
  const [minProcessingDays, setMinProcessingDays] = useState("1");
  const [maxProcessingDays, setMaxProcessingDays] = useState("3");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!product) {
      return;
    }

    setName(product.name || "");
    setDescription(product.description || "");
    setCategoryId(product.category_id || "");
    setPrice(String(product.price || ""));
    setOriginalPrice(
      product.original_price ? String(product.original_price) : "",
    );
    setStock(String(product.stock || 0));
    setSku(product.sku || "");
    setTags((product.tags || []).join(", "));
    setFeatures(product.features?.length ? product.features : DEFAULT_FEATURES);
    setExistingImages(product.images || []);
    setNewImages([]);
    setMinProcessingDays(String(product.min_processing_days || 1));
    setMaxProcessingDays(String(product.max_processing_days || 3));
    setError(null);
  }, [product]);

  const totalImageCount = existingImages.length + newImages.length;

  const canSubmit = useMemo(() => {
    return Boolean(
      name.trim() &&
        description.trim() &&
        categoryId &&
        price &&
        stock &&
        totalImageCount > 0,
    );
  }, [categoryId, description, name, price, stock, totalImageCount]);

  const addFeature = () => {
    setFeatures((current) => [...current, ""]);
  };

  const updateFeature = (index: number, value: string) => {
    setFeatures((current) =>
      current.map((feature, currentIndex) =>
        currentIndex === index ? value : feature,
      ),
    );
  };

  const removeFeature = (index: number) => {
    setFeatures((current) => {
      const next = current.filter((_, currentIndex) => currentIndex !== index);
      return next.length ? next : DEFAULT_FEATURES;
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const remainingSlots = Math.max(0, 5 - totalImageCount);
    const filesToUse = files.slice(0, remainingSlots);

    if (!filesToUse.length) {
      return;
    }

    setNewImages((current) => [
      ...current,
      ...filesToUse.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      })),
    ]);

    event.target.value = "";
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((current) =>
      current.filter((_, currentIndex) => currentIndex !== index),
    );
  };

  const removeNewImage = (index: number) => {
    setNewImages((current) => {
      const draft = current[index];

      if (draft) {
        URL.revokeObjectURL(draft.preview);
      }

      return current.filter((_, currentIndex) => currentIndex !== index);
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const parsedPrice = Number(price);
    const parsedOriginalPrice = Number(originalPrice);
    const parsedStock = Number(stock);
    const parsedMinProcessingDays = Number(minProcessingDays || 1);
    const parsedMaxProcessingDays = Number(maxProcessingDays || 3);

    if (!canSubmit) {
      setError("Completez les champs obligatoires et ajoutez au moins une image.");
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setError("Le prix doit etre superieur a zero.");
      return;
    }

    if (!Number.isFinite(parsedStock) || parsedStock < 0) {
      setError("Le stock doit etre superieur ou egal a zero.");
      return;
    }

    if (
      !Number.isFinite(parsedMinProcessingDays) ||
      !Number.isFinite(parsedMaxProcessingDays) ||
      parsedMinProcessingDays <= 0 ||
      parsedMaxProcessingDays <= 0 ||
      parsedMinProcessingDays > parsedMaxProcessingDays
    ) {
      setError("Le delai de preparation doit etre valide.");
      return;
    }

    await onSubmit({
      name: name.trim(),
      description: description.trim(),
      categoryId,
      price: parsedPrice,
      originalPrice:
        Number.isFinite(parsedOriginalPrice) && parsedOriginalPrice > 0
          ? parsedOriginalPrice
          : undefined,
      stock: parsedStock,
      sku: sku.trim() || `SKU-${Date.now()}`,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      features: features.map((feature) => feature.trim()).filter(Boolean),
      existingImages,
      newFiles: newImages.map((image) => image.file),
      minProcessingDays: parsedMinProcessingDays,
      maxProcessingDays: parsedMaxProcessingDays,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">
              {mode === "create" ? "Nouveau produit" : "Modifier le produit"}
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Votre boutique sera associee automatiquement au produit publie.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-neutral-700">
              Nom du produit
            </label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex: Sac en cuir artisanal"
              className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none transition-colors focus:border-neutral-900"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-neutral-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              placeholder="Decrivez votre produit, son etat, ses points forts et les informations utiles."
              className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none transition-colors focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Categorie
            </label>
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 outline-none transition-colors focus:border-neutral-900"
            >
              <option value="">Selectionnez une categorie</option>
              {PRODUCT_ONTOLOGY.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              SKU / reference
            </label>
            <input
              type="text"
              value={sku}
              onChange={(event) => setSku(event.target.value)}
              placeholder="SKU-001"
              className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none transition-colors focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Prix de vente
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="0.00"
              className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none transition-colors focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Prix barre
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={originalPrice}
              onChange={(event) => setOriginalPrice(event.target.value)}
              placeholder="Optionnel"
              className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none transition-colors focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Stock
            </label>
            <input
              type="number"
              min="0"
              value={stock}
              onChange={(event) => setStock(event.target.value)}
              placeholder="0"
              className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none transition-colors focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Tags
            </label>
            <input
              type="text"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="artisanat, cuir, premium"
              className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none transition-colors focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Preparation min (jours)
            </label>
            <input
              type="number"
              min="1"
              value={minProcessingDays}
              onChange={(event) => setMinProcessingDays(event.target.value)}
              className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none transition-colors focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Preparation max (jours)
            </label>
            <input
              type="number"
              min="1"
              value={maxProcessingDays}
              onChange={(event) => setMaxProcessingDays(event.target.value)}
              className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none transition-colors focus:border-neutral-900"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Caracteristiques</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Ajoutez les points forts que le client doit voir rapidement.
            </p>
          </div>

          <Button type="button" variant="outline" onClick={addFeature}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter
          </Button>
        </div>

        <div className="mt-6 space-y-3">
          {features.map((feature, index) => (
            <div key={`${index}-${feature}`} className="flex gap-3">
              <input
                type="text"
                value={feature}
                onChange={(event) => updateFeature(index, event.target.value)}
                placeholder={`Caracteristique ${index + 1}`}
                className="flex-1 rounded-xl border border-neutral-200 px-4 py-3 outline-none transition-colors focus:border-neutral-900"
              />
              <button
                type="button"
                onClick={() => removeFeature(index)}
                className="rounded-xl border border-neutral-200 px-3 text-neutral-500 transition-colors hover:border-neutral-300 hover:text-neutral-900"
                aria-label="Supprimer la caracteristique"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-6">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Images du produit</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Ajoutez jusqu'a 5 images. Le produit doit garder au moins une image.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {existingImages.map((image, index) => (
            <div
              key={`existing-${image}-${index}`}
              className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50"
            >
              <div className="relative aspect-square">
                <Image src={image} alt={name || "Produit"} fill className="object-cover" />
              </div>
              <button
                type="button"
                onClick={() => removeExistingImage(index)}
                className="absolute right-3 top-3 rounded-full bg-black/70 p-2 text-white transition-colors hover:bg-black"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}

          {newImages.map((image, index) => (
            <div
              key={`new-${image.preview}-${index}`}
              className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50"
            >
              <div className="aspect-square">
                <img
                  src={image.preview}
                  alt={image.file.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => removeNewImage(index)}
                className="absolute right-3 top-3 rounded-full bg-black/70 p-2 text-white transition-colors hover:bg-black"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}

          {totalImageCount < 5 ? (
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 text-center transition-colors hover:border-neutral-400 hover:bg-neutral-100">
              <Upload className="h-8 w-8 text-neutral-400" />
              <span className="mt-3 text-sm font-medium text-neutral-700">
                Ajouter une image
              </span>
              <span className="mt-1 text-xs text-neutral-500">PNG, JPG ou WebP</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          ) : null}
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3 text-sm text-neutral-500">
          <Package className="mt-0.5 h-5 w-5 text-neutral-400" />
          <p>
            {mode === "create"
              ? "Les produits crees ici sont publies pour votre boutique vendeur."
              : "Les modifications sont appliquees uniquement a votre propre catalogue vendeur."}
          </p>
        </div>

        <Button type="submit" disabled={!canSubmit || isSubmitting}>
          {isSubmitting
            ? mode === "create"
              ? "Publication..."
              : "Enregistrement..."
            : mode === "create"
              ? "Publier le produit"
              : "Enregistrer les changements"}
        </Button>
      </div>
    </form>
  );
}
