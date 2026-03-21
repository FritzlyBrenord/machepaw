"use client";

import { useState } from "react";
import type { MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingBag, Star } from "lucide-react";
import type { Product } from "@/data/types";
import { useCart, useWishlist } from "@/store";
import { Button } from "@/components/ui/Button";
import { useStorefront } from "@/components/StorefrontProvider";
import { useBoutiqueStore } from "@/components/boutique/BoutiqueStoreProvider";
import {
  buildDefaultAttributeSelections,
  getDiscountedPrice,
  productRequiresConfiguration,
} from "@/lib/storefront";
import { getBoutiqueBasePath } from "@/lib/boutique";

export function BoutiqueProductCard({
  product,
  variant = "default",
}: {
  product: Product;
  variant?: "default" | "horizontal";
}) {
  const router = useRouter();
  const store = useBoutiqueStore();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { formatPrice } = useStorefront();
  const [imageError, setImageError] = useState(false);

  const discountedPrice = getDiscountedPrice(product);
  const requiresConfiguration = productRequiresConfiguration(product);
  const inWishlist = isInWishlist(product.id);
  const href = `${getBoutiqueBasePath(store.storeSlug)}/produit/${product.id}`;

  const handleAddToCart = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (requiresConfiguration) {
      router.push(href);
      return;
    }

    addToCart(product, 1, {
      selectedAttributes: buildDefaultAttributeSelections(product.attributes),
      unitPrice: discountedPrice,
    });
  };

  const handleWishlist = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    toggleWishlist(product.id);
  };

  if (variant === "horizontal") {
    return (
      <article className="grid gap-4 rounded-[1.75rem] border border-neutral-200 bg-white p-4 sm:grid-cols-[160px,1fr]">
        <Link href={href} className="relative h-40 overflow-hidden rounded-[1.35rem] bg-neutral-100">
          <Image
            src={imageError ? "/images/placeholder.jpg" : product.images[0]}
            alt={product.name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        </Link>
        <div className="flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.24em] text-neutral-400">
              {product.category}
            </p>
            <Link href={href} className="text-lg font-semibold text-neutral-900 hover:text-neutral-700">
              {product.name}
            </Link>
            <div className="flex items-center gap-1 text-sm text-neutral-500">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {product.rating.toFixed(1)} ({product.reviewCount})
            </div>
            <p className="line-clamp-2 text-sm leading-6 text-neutral-500">
              {product.description}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-neutral-900">
                {formatPrice(discountedPrice)}
              </span>
              {product.discount ? (
                <span className="text-sm text-neutral-400 line-through">
                  {formatPrice(product.price)}
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleWishlist}
                className="rounded-full border border-neutral-200 p-2 text-neutral-700 transition hover:bg-neutral-50"
              >
                <Heart className={`h-4 w-4 ${inWishlist ? "fill-red-500 text-red-500" : ""}`} />
              </button>
              <Button onClick={handleAddToCart}>
                <ShoppingBag className="mr-2 h-4 w-4" />
                {requiresConfiguration ? "Voir le detail" : "Ajouter"}
              </Button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group overflow-hidden rounded-[1.85rem] border border-neutral-200 bg-white transition-transform duration-300 hover:-translate-y-1">
      <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
        <Link href={href} className="block h-full w-full">
          <Image
            src={imageError ? "/images/placeholder.jpg" : product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            {product.isFeatured ? (
              <span className="rounded-full bg-neutral-900 px-3 py-1 text-[11px] font-medium text-white">
                Vedette
              </span>
            ) : null}
            {product.discount ? (
              <span className="rounded-full bg-rose-500 px-3 py-1 text-[11px] font-medium text-white">
                -{product.discount}%
              </span>
            ) : null}
          </div>
        </Link>
          <button
            type="button"
            onClick={handleWishlist}
            className="absolute right-4 top-4 rounded-full bg-white/95 p-2 text-neutral-700 shadow-sm"
          >
            <Heart className={`h-4 w-4 ${inWishlist ? "fill-red-500 text-red-500" : ""}`} />
          </button>
      </div>

      <div className="space-y-3 p-5">
        <Link href={href} className="block space-y-3">
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.24em] text-neutral-400">
              {product.category}
            </p>
            <h3 className="line-clamp-2 text-lg font-semibold text-neutral-900">
              {product.name}
            </h3>
          </div>

          <div className="flex items-center gap-1 text-sm text-neutral-500">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            {product.rating.toFixed(1)} ({product.reviewCount})
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-neutral-900">
                {formatPrice(discountedPrice)}
              </span>
              {product.discount ? (
                <span className="text-sm text-neutral-400 line-through">
                  {formatPrice(product.price)}
                </span>
              ) : null}
            </div>
          </div>
        </Link>
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={handleAddToCart}
            className="inline-flex items-center rounded-full bg-[#171411] px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            {requiresConfiguration ? "Detail" : "Ajouter"}
          </button>
        </div>
      </div>
    </article>
  );
}
