"use client";

import { useMemo, useState } from "react";
import type { CSSProperties, MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingBag, Star } from "lucide-react";
import type { Product } from "@/data/types";
import { useCart, useWishlist } from "@/store";
import { Button } from "@/components/ui/Button";
import { useStorefront } from "@/components/StorefrontProvider";
import {
  useBoutiqueStore,
  useBoutiqueTheme,
} from "@/components/boutique/BoutiqueStoreProvider";
import {
  buildDefaultAttributeSelections,
  getDiscountedPrice,
  productRequiresConfiguration,
} from "@/lib/storefront";
import { getBoutiqueBasePath } from "@/lib/boutique";
import {
  getBoutiqueHeadingClass,
  getBoutiqueOutlineButtonStyle,
  getBoutiquePrimaryButtonStyle,
  getBoutiqueRadiusClass,
  getBoutiqueSurfaceStyle,
} from "@/lib/boutiqueTheme";

export function BoutiqueProductCard({
  product,
  variant = "default",
}: {
  product: Product;
  variant?: "default" | "horizontal";
}) {
  const router = useRouter();
  const store = useBoutiqueStore();
  const theme = useBoutiqueTheme();
  const headingClass = getBoutiqueHeadingClass(theme);
  const radiusClass = getBoutiqueRadiusClass(theme);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { formatPrice } = useStorefront();
  const [imageError, setImageError] = useState(false);

  const discountedPrice = getDiscountedPrice(product);
  const requiresConfiguration = productRequiresConfiguration(product);
  const inWishlist = isInWishlist(product.id);
  const href = `${getBoutiqueBasePath(store.storeSlug)}/produit/${product.id}`;

  const cardStyle = useMemo<CSSProperties>(() => {
    if (theme.layout.cardStyle === "glass") {
      return {
        backgroundColor: "rgba(255,255,255,0.04)",
        borderColor: theme.palette.border,
        color: theme.palette.text,
        backdropFilter: "blur(18px)",
      };
    }

    if (theme.layout.cardStyle === "framed") {
      return {
        backgroundColor: theme.palette.surfaceAlt,
        borderColor: theme.palette.border,
        color: theme.palette.text,
        boxShadow: "0 20px 48px rgba(24, 24, 24, 0.06)",
      };
    }

    return getBoutiqueSurfaceStyle(theme);
  }, [theme]);

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
      <article
        className={`grid gap-4 border p-4 sm:grid-cols-[160px,1fr] ${radiusClass}`}
        style={cardStyle}
      >
        <Link
          href={href}
          className="relative h-40 overflow-hidden rounded-[1.35rem] bg-neutral-100"
        >
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
            <p
              className="text-[11px] uppercase tracking-[0.24em]"
              style={{ color: theme.palette.muted }}
            >
              {product.category}
            </p>
            <Link
              href={href}
              className={`text-lg ${headingClass}`}
              style={{ color: theme.palette.text }}
            >
              {product.name}
            </Link>
            <div
              className="flex items-center gap-1 text-sm"
              style={{ color: theme.palette.muted }}
            >
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {product.rating.toFixed(1)} ({product.reviewCount})
            </div>
            <p
              className="line-clamp-2 text-sm leading-6"
              style={{ color: theme.palette.muted }}
            >
              {product.description}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className="text-lg font-semibold"
                style={{ color: theme.palette.text }}
              >
                {formatPrice(discountedPrice)}
              </span>
              {product.discount ? (
                <span
                  className="text-sm line-through"
                  style={{ color: theme.palette.muted }}
                >
                  {formatPrice(product.price)}
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleWishlist}
                className="rounded-full border p-2 transition hover:opacity-90"
                style={getBoutiqueOutlineButtonStyle(theme)}
              >
                <Heart
                  className={`h-4 w-4 ${
                    inWishlist ? "fill-red-500 text-red-500" : ""
                  }`}
                />
              </button>
              <Button
                onClick={handleAddToCart}
                className="rounded-full"
                style={getBoutiquePrimaryButtonStyle(theme)}
              >
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
    <article
      className={`group overflow-hidden border transition-transform duration-300 hover:-translate-y-1 ${radiusClass}`}
      style={cardStyle}
    >
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
              <span
                className="rounded-full px-3 py-1 text-[11px] font-medium"
                style={{
                  backgroundColor: theme.palette.buttonPrimary,
                  color: theme.palette.buttonPrimaryText,
                }}
              >
                Vedette
              </span>
            ) : null}
            {product.discount ? (
              <span
                className="rounded-full px-3 py-1 text-[11px] font-medium"
                style={{
                  backgroundColor: theme.palette.accent,
                  color: theme.palette.accentContrast,
                }}
              >
                -{product.discount}%
              </span>
            ) : null}
          </div>
        </Link>
        <button
          type="button"
          onClick={handleWishlist}
          className="absolute right-4 top-4 rounded-full p-2 shadow-sm"
          style={{
            backgroundColor: theme.palette.surface,
            color: theme.palette.text,
          }}
        >
          <Heart
            className={`h-4 w-4 ${
              inWishlist ? "fill-red-500 text-red-500" : ""
            }`}
          />
        </button>
      </div>

      <div className="space-y-3 p-5">
        <Link href={href} className="block space-y-3">
          <div className="space-y-1">
            <p
              className="text-[11px] uppercase tracking-[0.24em]"
              style={{ color: theme.palette.muted }}
            >
              {product.category}
            </p>
            <h3
              className={`line-clamp-2 text-lg ${headingClass}`}
              style={{ color: theme.palette.text }}
            >
              {product.name}
            </h3>
          </div>

          <div
            className="flex items-center gap-1 text-sm"
            style={{ color: theme.palette.muted }}
          >
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            {product.rating.toFixed(1)} ({product.reviewCount})
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className="text-lg font-semibold"
                style={{ color: theme.palette.text }}
              >
                {formatPrice(discountedPrice)}
              </span>
              {product.discount ? (
                <span
                  className="text-sm line-through"
                  style={{ color: theme.palette.muted }}
                >
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
            className="inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition hover:opacity-90"
            style={getBoutiquePrimaryButtonStyle(theme)}
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            {requiresConfiguration ? "Detail" : "Ajouter"}
          </button>
        </div>
      </div>
    </article>
  );
}
