"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Star,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { ProductCard } from "@/components/ui/ProductCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useStorefront } from "@/components/StorefrontProvider";
import {
  useStorefrontProductQuery,
  useStorefrontProductsQuery,
} from "@/hooks/useStorefront";
import { useCart, useWishlist } from "@/store";
import {
  areRequiredSelectionsComplete,
  buildDefaultAttributeSelections,
  getDiscountedPrice,
  getDisplayAttributes,
} from "@/lib/storefront";
import { cn, getEstimatedDeliveryRange } from "@/lib/utils";

export default function ProductPage() {
  const params = useParams();
  const productId = params.id as string;
  const { data: product, isLoading } = useStorefrontProductQuery(productId);
  const { data: products = [] } = useStorefrontProductsQuery();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { formatPrice } = useStorefront();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "attributes">(
    "description",
  );
  const [showAddedToCart, setShowAddedToCart] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState(
    buildDefaultAttributeSelections(product?.attributes),
  );

  useEffect(() => {
    setSelectedAttributes(buildDefaultAttributeSelections(product?.attributes));
    setSelectedImage(0);
    setQuantity(1);
  }, [product]);

  const similarProducts = useMemo(() => {
    if (!product) {
      return [];
    }

    return products
      .filter(
        (candidate) =>
          candidate.id !== product.id &&
          (candidate.categoryId === product.categoryId ||
            candidate.tags.some((tag) => product.tags.includes(tag))),
      )
      .slice(0, 4);
  }, [product, products]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-block w-10 h-10 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-light mb-4">Produit non trouvé</h1>
          <Link href="/collection">
            <Button>Retour à la collection</Button>
          </Link>
        </div>
      </div>
    );
  }

  const discountedPrice = getDiscountedPrice(product);
  const inWishlist = isInWishlist(product.id);
  const sellerStoreName =
    product.ownerType === "seller" && product.ownerName
      ? product.ownerName
      : null;
  const displayAttributes = getDisplayAttributes(
    product.attributes,
    selectedAttributes,
  );
  const canAddToCart =
    product.stock > 0 &&
    areRequiredSelectionsComplete(product.attributes, selectedAttributes);

  const deliveryRange = getEstimatedDeliveryRange(
    product?.minProcessingDays ?? 1,
    product?.maxProcessingDays ?? 3
  );

  const handleAddToCart = () => {
    if (!canAddToCart) {
      return;
    }

    addToCart(product, quantity, {
      selectedAttributes,
      unitPrice: discountedPrice,
    });
    setShowAddedToCart(true);
    setTimeout(() => setShowAddedToCart(false), 2000);
  };

  const updateAttributeSelection = (attributeId: string, name: string, value: string) => {
    setSelectedAttributes((current) => {
      const remainingSelections = current.filter(
        (selection) => selection.attributeId !== attributeId,
      );

      return [...remainingSelections, { attributeId, name, value }];
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 mb-8">
        <nav className="flex items-center gap-2 text-sm text-neutral-500">
          <Link href="/" className="hover:text-neutral-900">
            Accueil
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/collection" className="hover:text-neutral-900">
            Collection
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link
            href={`/collection/${product.categoryId || product.categorySlug}`}
            className="hover:text-neutral-900"
          >
            {product.category}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-neutral-900">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="relative aspect-square bg-neutral-100 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={product.images[selectedImage]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelectedImage((current) =>
                        current === 0 ? product.images.length - 1 : current - 1,
                      )
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      setSelectedImage((current) =>
                        current === product.images.length - 1 ? 0 : current + 1,
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNew && <Badge variant="primary">Nouveau</Badge>}
                {product.isBestseller && (
                  <Badge variant="secondary">Best-seller</Badge>
                )}
                {!!product.discount && (
                  <Badge variant="destructive">-{product.discount}%</Badge>
                )}
              </div>
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "relative w-20 h-20 border-2 transition-colors overflow-hidden",
                      selectedImage === index
                        ? "border-neutral-900"
                        : "border-transparent hover:border-neutral-300",
                    )}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} - ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:pl-8">
            <p className="text-sm text-neutral-500 uppercase tracking-wider mb-2">
              {product.category}
            </p>

            {sellerStoreName ? (
              <p className="mb-3 text-sm uppercase tracking-[0.24em] text-neutral-400">
                Boutique {sellerStoreName}
              </p>
            ) : null}

            <h1 className="text-3xl md:text-4xl font-light text-neutral-900 mb-4">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    className={cn(
                      "w-4 h-4",
                      index < Math.floor(product.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-neutral-300",
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-neutral-600">
                {product.rating.toFixed(1)} ({product.reviewCount} avis)
              </span>
              <span
                className={cn(
                  "text-sm font-medium",
                  product.stock > 0 ? "text-green-600" : "text-red-500",
                )}
              >
                {product.stock > 0 ? "En stock" : "Rupture"}
              </span>
            </div>

            <div className="flex items-baseline gap-4 mb-8">
              <span className="text-3xl font-medium text-neutral-900">
                {formatPrice(discountedPrice)}
              </span>
              {!!product.discount && (
                <>
                  <span className="text-xl text-neutral-400 line-through">
                    {formatPrice(product.price)}
                  </span>
                  <Badge variant="destructive">
                    Économisez {product.discount}%
                  </Badge>
                </>
              )}
            </div>

            <p className="text-neutral-600 mb-8 leading-relaxed">
              {product.description}
            </p>

            {displayAttributes.length > 0 && (
              <div className="space-y-5 mb-8 rounded-2xl border border-neutral-200 p-5">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-lg font-medium text-neutral-900">
                    Attributs du produit
                  </h2>
                  {!canAddToCart && (
                    <span className="text-sm text-amber-600">
                      Choisissez toutes les options requises
                    </span>
                  )}
                </div>

                {displayAttributes.map((attribute) => (
                  <div key={attribute.attributeId} className="space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-medium text-neutral-900 capitalize">
                        {attribute.name}
                      </span>
                      {attribute.selectedValue && (
                        <span className="text-sm text-neutral-500">
                          {attribute.selectedValue}
                        </span>
                      )}
                    </div>

                    {attribute.requiresChoice ? (
                      <div className="flex flex-wrap gap-2">
                        {attribute.options.map((option) => {
                          const isSelected = attribute.selectedValue === option;

                          return (
                            <button
                              key={option}
                              onClick={() =>
                                updateAttributeSelection(
                                  attribute.attributeId,
                                  attribute.name,
                                  option,
                                )
                              }
                              className={cn(
                                "px-4 py-2 text-sm border transition-colors",
                                isSelected
                                  ? "bg-neutral-900 text-white border-neutral-900"
                                  : "border-neutral-200 text-neutral-700 hover:border-neutral-900",
                              )}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-sm text-neutral-600">
                        {attribute.options[0] || "Non renseigné"}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {product.features.length > 0 && (
              <div className="space-y-3 mb-8">
                {product.features.slice(0, 3).map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2 text-sm text-neutral-600"
                  >
                    <Check className="w-4 h-4 text-green-600" />
                    {feature}
                  </div>
                ))}
              </div>
            )}

            <div className="mb-8">
              <label className="text-sm font-medium text-neutral-900 mb-2 block">
                Quantité
              </label>
              <div className="flex items-center border border-neutral-200 w-fit">
                <button
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  className="p-3 hover:bg-neutral-100 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-16 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity((current) => current + 1)}
                  className="p-3 hover:bg-neutral-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mb-8 p-4 bg-neutral-50 rounded-xl flex items-start gap-4 border border-neutral-100">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border border-neutral-100 mt-0.5">
                <Truck className="w-5 h-5 text-neutral-900" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-neutral-900 mb-1">Livraison estimée</h3>
                <p className="text-sm text-neutral-600">
                  Prévue du <span className="font-medium text-neutral-900">{deliveryRange}</span>
                </p>
              </div>
            </div>

            <div className="flex gap-4 mb-8">
              <Button
                size="lg"
                fullWidth
                onClick={handleAddToCart}
                disabled={!canAddToCart}
              >
                Ajouter au panier
              </Button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={cn(
                  "p-4 border transition-colors",
                  inWishlist
                    ? "border-red-500 bg-red-50"
                    : "border-neutral-200 hover:border-neutral-400",
                )}
              >
                <Heart
                  className={cn(
                    "w-6 h-6",
                    inWishlist ? "fill-red-500 text-red-500" : "text-neutral-600",
                  )}
                />
              </button>
              <button className="p-4 border border-neutral-200 hover:border-neutral-400 transition-colors">
                <Share2 className="w-6 h-6 text-neutral-600" />
              </button>
            </div>

            <AnimatePresence>
              {showAddedToCart && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mb-4 p-4 bg-green-50 border border-green-200 text-green-800 flex items-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Produit ajouté au panier
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-3 gap-4 py-6 border-t border-neutral-200">
              <div className="text-center">
                <Truck className="w-6 h-6 mx-auto mb-2 text-neutral-400" />
                <p className="text-xs text-neutral-600">
                  Livraison calculée selon la destination
                </p>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 mx-auto mb-2 text-neutral-400" />
                <p className="text-xs text-neutral-600">Paiement sécurisé</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-6 h-6 mx-auto mb-2 text-neutral-400" />
                <p className="text-xs text-neutral-600">Support après achat</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <div className="flex border-b border-neutral-200">
            {[
              { key: "description", label: "Description" },
              { key: "specs", label: "Spécifications" },
              { key: "attributes", label: "Attributs" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={cn(
                  "px-8 py-4 text-sm font-medium transition-colors border-b-2 -mb-px",
                  activeTab === tab.key
                    ? "border-neutral-900 text-neutral-900"
                    : "border-transparent text-neutral-500 hover:text-neutral-700",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="py-8">
            {activeTab === "description" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl"
              >
                <p className="text-neutral-600 leading-relaxed text-lg">
                  {product.description}
                </p>
                {product.features.length > 0 && (
                  <div className="mt-8">
                    <h3 className="font-medium text-neutral-900 mb-4">
                      Caractéristiques
                    </h3>
                    <ul className="space-y-3">
                      {product.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          <span className="text-neutral-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "specs" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl"
              >
                {Object.keys(product.specifications || {}).length > 0 ? (
                  <table className="w-full">
                    <tbody>
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <tr key={key} className="border-b border-neutral-100">
                          <td className="py-4 text-neutral-500 w-1/3">{key}</td>
                          <td className="py-4 text-neutral-900">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-neutral-500">
                    Aucune spécification technique renseignée.
                  </p>
                )}
              </motion.div>
            )}

            {activeTab === "attributes" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl space-y-4"
              >
                {displayAttributes.length > 0 ? (
                  displayAttributes.map((attribute) => (
                    <div
                      key={attribute.attributeId}
                      className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-neutral-100 pb-4"
                    >
                      <div>
                        <p className="font-medium text-neutral-900 capitalize">
                          {attribute.name}
                        </p>
                        <p className="text-sm text-neutral-500">
                          {attribute.requiresChoice
                            ? "Option à sélectionner"
                            : "Valeur fixe"}
                        </p>
                      </div>
                      <div className="text-neutral-700">
                        {attribute.selectedValue ||
                          attribute.options.join(", ") ||
                          "Non renseigné"}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-neutral-500">
                    Aucun attribut dynamique renseigné.
                  </p>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {similarProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-light text-neutral-900 mb-8">
              Produits similaires
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {similarProducts.map((similarProduct, index) => (
                <motion.div
                  key={similarProduct.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                >
                  <ProductCard product={similarProduct} />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
