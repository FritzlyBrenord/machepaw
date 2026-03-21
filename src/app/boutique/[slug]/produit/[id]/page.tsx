"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  Shield,
  Star,
  Truck,
} from "lucide-react";
import { BoutiqueProductCard } from "@/components/boutique/BoutiqueProductCard";
import { Button } from "@/components/ui/Button";
import { useStorefront } from "@/components/StorefrontProvider";
import { useBoutiqueStore } from "@/components/boutique/BoutiqueStoreProvider";
import {
  useBoutiqueProductQuery,
  useBoutiqueProductsQuery,
} from "@/hooks/useBoutiqueStorefront";
import { useCart, useWishlist } from "@/store";
import {
  areRequiredSelectionsComplete,
  buildDefaultAttributeSelections,
  getDiscountedPrice,
  getDisplayAttributes,
} from "@/lib/storefront";
import { cn, getEstimatedDeliveryRange } from "@/lib/utils";

export default function BoutiqueProductPage() {
  const params = useParams();
  const productId = params.id as string;
  const store = useBoutiqueStore();
  const { data: product, isLoading } = useBoutiqueProductQuery(productId);
  const { data: products = [] } = useBoutiqueProductsQuery();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { formatPrice } = useStorefront();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "attributes">("description");
  const [selectedAttributes, setSelectedAttributes] = useState(
    buildDefaultAttributeSelections(product?.attributes),
  );
  const [showAdded, setShowAdded] = useState(false);

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
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 xl:px-12">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center">
        <h1 className="text-3xl font-semibold text-neutral-900">Produit introuvable</h1>
        <p className="mt-4 text-neutral-500">
          Ce produit n&apos;est pas disponible dans la boutique {store.businessName}.
        </p>
        <Link href={`/boutique/${store.storeSlug}/collection`} className="mt-6 inline-flex">
          <Button>Retour a la collection</Button>
        </Link>
      </div>
    );
  }

  const discountedPrice = getDiscountedPrice(product);
  const canAddToCart =
    product.stock > 0 &&
    areRequiredSelectionsComplete(product.attributes, selectedAttributes);
  const displayAttributes = getDisplayAttributes(product.attributes, selectedAttributes);
  const deliveryRange = getEstimatedDeliveryRange(
    product.minProcessingDays ?? 1,
    product.maxProcessingDays ?? 3,
  );

  const handleAddToCart = () => {
    if (!canAddToCart) {
      return;
    }

    addToCart(product, quantity, {
      selectedAttributes,
      unitPrice: discountedPrice,
    });
    setShowAdded(true);
    window.setTimeout(() => setShowAdded(false), 1800);
  };

  return (
    <div className="min-h-screen bg-[#fbf8f3] pb-20">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 xl:px-12">
        <nav className="mb-8 flex items-center gap-2 text-sm text-neutral-500">
          <Link href={`/boutique/${store.storeSlug}`} className="hover:text-neutral-900">
            Boutique
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href={`/boutique/${store.storeSlug}/collection`} className="hover:text-neutral-900">
            Collection
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link
            href={`/boutique/${store.storeSlug}/collection/${product.categoryId || product.categorySlug}`}
            className="hover:text-neutral-900"
          >
            {product.category}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-neutral-900">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-white">
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              {product.images.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedImage((current) =>
                        current === 0 ? product.images.length - 1 : current - 1,
                      )
                    }
                    className="absolute left-4 top-1/2 rounded-full bg-white/90 p-2"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedImage((current) =>
                        current === product.images.length - 1 ? 0 : current + 1,
                      )
                    }
                    className="absolute right-4 top-1/2 rounded-full bg-white/90 p-2"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              ) : null}
            </div>

            {product.images.length > 1 ? (
              <div className="flex gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "relative h-20 w-20 overflow-hidden rounded-2xl border-2 bg-white",
                      selectedImage === index
                        ? "border-neutral-900"
                        : "border-transparent hover:border-neutral-300",
                    )}
                  >
                    <Image src={image} alt={`${product.name} ${index + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="rounded-[2rem] border border-neutral-200 bg-white p-6 lg:p-8">
            <p className="text-xs uppercase tracking-[0.24em] text-neutral-400">{product.category}</p>
            <p className="mt-2 text-sm uppercase tracking-[0.24em] text-neutral-500">
              Boutique {store.businessName}
            </p>
            <h1 className="mt-4 text-4xl font-semibold text-neutral-900">{product.name}</h1>

            <div className="mt-5 flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    className={cn(
                      "h-4 w-4",
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
              <span className={cn("text-sm font-medium", product.stock > 0 ? "text-emerald-600" : "text-red-500")}>
                {product.stock > 0 ? "En stock" : "Rupture"}
              </span>
            </div>

            <div className="mt-6 flex items-baseline gap-4">
              <span className="text-3xl font-semibold text-neutral-900">
                {formatPrice(discountedPrice)}
              </span>
              {product.discount ? (
                <span className="text-xl text-neutral-400 line-through">
                  {formatPrice(product.price)}
                </span>
              ) : null}
            </div>

            <p className="mt-6 text-sm leading-7 text-neutral-600">{product.description}</p>

            {displayAttributes.length > 0 ? (
              <div className="mt-8 space-y-5 rounded-[1.5rem] border border-neutral-200 p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-neutral-900">Options</h2>
                  {!canAddToCart ? (
                    <span className="text-sm text-amber-600">Choisissez toutes les options requises</span>
                  ) : null}
                </div>

                {displayAttributes.map((attribute) => (
                  <div key={attribute.attributeId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-neutral-900">{attribute.name}</span>
                      {attribute.selectedValue ? (
                        <span className="text-sm text-neutral-500">{attribute.selectedValue}</span>
                      ) : null}
                    </div>
                    {attribute.requiresChoice ? (
                      <div className="flex flex-wrap gap-2">
                        {attribute.options.map((option) => {
                          const isSelected = attribute.selectedValue === option;
                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() =>
                                setSelectedAttributes((current) => [
                                  ...current.filter(
                                    (selection) =>
                                      selection.attributeId !== attribute.attributeId,
                                  ),
                                  {
                                    attributeId: attribute.attributeId,
                                    name: attribute.name,
                                    value: option,
                                  },
                                ])
                              }
                              className={cn(
                                "rounded-full border px-4 py-2 text-sm transition-colors",
                                isSelected
                                  ? "border-neutral-900 bg-neutral-900 text-white"
                                  : "border-neutral-200 text-neutral-700 hover:border-neutral-300",
                              )}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-500">{attribute.options[0] || "Non renseigne"}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : null}

            <div className="mt-8 flex items-center gap-3">
              <div className="flex items-center rounded-full border border-neutral-200">
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  className="p-3"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((current) => current + 1)}
                  className="p-3"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <Button onClick={handleAddToCart} disabled={!canAddToCart} className="flex-1">
                Ajouter au panier
              </Button>
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className="rounded-full border border-neutral-200 p-3"
              >
                <Heart
                  className={cn(
                    "h-5 w-5",
                    isInWishlist(product.id) ? "fill-red-500 text-red-500" : "text-neutral-600",
                  )}
                />
              </button>
            </div>

            {showAdded ? (
              <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <Check className="h-4 w-4" />
                Produit ajoute au panier de la boutique
              </div>
            ) : null}

            <div className="mt-8 grid gap-4 rounded-[1.5rem] bg-neutral-50 p-5 sm:grid-cols-2">
              <div className="flex gap-3">
                <Truck className="mt-1 h-5 w-5 text-neutral-700" />
                <div>
                  <p className="text-sm font-medium text-neutral-900">Livraison estimee</p>
                  <p className="text-sm text-neutral-500">Prevue du {deliveryRange}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Shield className="mt-1 h-5 w-5 text-neutral-700" />
                <div>
                  <p className="text-sm font-medium text-neutral-900">Commande boutique</p>
                  <p className="text-sm text-neutral-500">
                    Checkout limite a cette boutique sous /boutique/{store.storeSlug}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 border-t border-neutral-200 pt-6">
              <div className="flex gap-5 border-b border-neutral-200 pb-4">
                {[
                  { key: "description", label: "Description" },
                  { key: "specs", label: "Specifications" },
                  { key: "attributes", label: "Attributs" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key as typeof activeTab)}
                    className={cn(
                      "text-sm font-medium transition-colors",
                      activeTab === tab.key ? "text-neutral-900" : "text-neutral-500",
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="pt-6">
                {activeTab === "description" ? (
                  <p className="text-sm leading-7 text-neutral-600">{product.description}</p>
                ) : null}
                {activeTab === "specs" ? (
                  Object.keys(product.specifications || {}).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex items-start justify-between gap-4 border-b border-neutral-100 pb-3 text-sm">
                          <span className="text-neutral-500">{key}</span>
                          <span className="text-right text-neutral-900">{value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-500">Aucune specification renseignee.</p>
                  )
                ) : null}
                {activeTab === "attributes" ? (
                  displayAttributes.length > 0 ? (
                    <div className="space-y-3">
                      {displayAttributes.map((attribute) => (
                        <div key={attribute.attributeId} className="flex items-start justify-between gap-4 border-b border-neutral-100 pb-3 text-sm">
                          <span className="text-neutral-500">{attribute.name}</span>
                          <span className="text-right text-neutral-900">
                            {attribute.selectedValue || attribute.options[0] || "Non renseigne"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-500">Aucun attribut supplementaire.</p>
                  )
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <section className="mt-16">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-neutral-400">Meme boutique</p>
              <h2 className="mt-2 text-3xl font-semibold text-neutral-900">Produits similaires</h2>
            </div>
            <Link
              href={`/boutique/${store.storeSlug}/collection`}
              className="text-sm font-medium text-neutral-700 underline underline-offset-4"
            >
              Voir toute la collection
            </Link>
          </div>

          {similarProducts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {similarProducts.map((item) => (
                <BoutiqueProductCard key={item.id} product={item} />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.75rem] border border-dashed border-neutral-300 bg-white p-10 text-center text-sm text-neutral-500">
              Aucun produit similaire dans cette boutique pour le moment.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
