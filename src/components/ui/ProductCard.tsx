"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Star, Eye } from "lucide-react";
import type { Product } from "@/data/types";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { useStorefront } from "@/components/StorefrontProvider";
import { useCart, useWishlist } from "@/store";
import {
  buildDefaultAttributeSelections,
  getDiscountedPrice,
  productRequiresConfiguration,
} from "@/lib/storefront";

interface ProductCardProps {
  product: Product;
  variant?: "default" | "compact" | "horizontal";
}

export function ProductCard({
  product,
  variant = "default",
}: ProductCardProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { formatPrice } = useStorefront();
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const discountedPrice = getDiscountedPrice(product);
  const inWishlist = isInWishlist(product.id);
  const requiresConfiguration = productRequiresConfiguration(product);
  const sellerStoreName =
    product.ownerType === "seller" && product.ownerName
      ? product.ownerName
      : null;
  const fallbackImage =
    "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400";

  const handleOpenProduct = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    router.push(`/produit/${product.id}`);
  };

  const handleAddToCart = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (requiresConfiguration) {
      router.push(`/produit/${product.id}`);
      return;
    }

    addToCart(product, 1, {
      selectedAttributes: buildDefaultAttributeSelections(product.attributes),
      unitPrice: discountedPrice,
    });
  };

  const handleToggleWishlist = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    toggleWishlist(product.id);
  };

  const actionLabel = requiresConfiguration
    ? "Choisir les options"
    : "Ajouter au panier";

  if (variant === "horizontal") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="group flex gap-4 bg-white"
      >
        <Link
          href={`/produit/${product.id}`}
          className="relative w-32 h-32 shrink-0 overflow-hidden"
        >
          <Image
            src={imageError ? fallbackImage : product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
          {!!product.discount && (
            <Badge variant="destructive" className="absolute top-2 left-2">
              -{product.discount}%
            </Badge>
          )}
        </Link>
        <div className="flex-1 flex flex-col justify-between py-1">
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">
              {product.category}
            </p>
            {sellerStoreName ? (
              <p className="mb-1 text-[11px] uppercase tracking-[0.2em] text-neutral-400">
                Boutique {sellerStoreName}
              </p>
            ) : null}
            <Link href={`/produit/${product.id}`}>
              <h3 className="font-medium text-neutral-900 line-clamp-1 group-hover:text-neutral-600 transition-colors">
                {product.name}
              </h3>
            </Link>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-sm text-neutral-600">
                {product.rating} ({product.reviewCount})
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-900">
                {formatPrice(discountedPrice)}
              </span>
              {!!product.discount && (
                <span className="text-sm text-neutral-400 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleToggleWishlist}
                className="p-2 hover:bg-neutral-100 transition-colors"
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${
                    inWishlist
                      ? "fill-red-500 text-red-500"
                      : "text-neutral-600"
                  }`}
                />
              </button>
              <button
                onClick={
                  requiresConfiguration ? handleOpenProduct : handleAddToCart
                }
                className="p-2 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
                aria-label={actionLabel}
              >
                <ShoppingBag className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group relative bg-white"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/produit/${product.id}`} className="block">
        <div className="relative aspect-3/4 overflow-hidden bg-neutral-100 mb-4">
          <Image
            src={imageError ? fallbackImage : product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            onError={() => setImageError(true)}
          />

          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNew && <Badge variant="primary">Nouveau</Badge>}
            {product.isBestseller && (
              <Badge variant="secondary">Best-seller</Badge>
            )}
            {!!product.discount && (
              <Badge variant="destructive">-{product.discount}%</Badge>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-3 right-3 flex flex-col gap-2"
          >
            <button
              onClick={handleToggleWishlist}
              className="p-2.5 bg-white shadow-lg hover:bg-neutral-100 transition-colors"
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  inWishlist ? "fill-red-500 text-red-500" : "text-neutral-700"
                }`}
              />
            </button>
            <button
              onClick={handleOpenProduct}
              className="p-2.5 bg-white shadow-lg hover:bg-neutral-100 transition-colors"
            >
              <Eye className="w-4 h-4 text-neutral-700" />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-0 left-0 right-0 p-3"
          >
            <Button
              variant="white"
              size="sm"
              fullWidth
              onClick={
                requiresConfiguration ? handleOpenProduct : handleAddToCart
              }
              className="shadow-lg"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              {actionLabel}
            </Button>
          </motion.div>
        </div>

        <div className="space-y-2 px-3">
          <p className="text-xs text-neutral-500 uppercase tracking-wider">
            {product.category}
          </p>
          {sellerStoreName ? (
            <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-400">
              Boutique {sellerStoreName}
            </p>
          ) : null}
          <h3 className="font-medium text-neutral-900 line-clamp-1 group-hover:text-neutral-600 transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, index) => (
              <Star
                key={index}
                className={`w-3 h-3 ${
                  index < Math.floor(product.rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-neutral-300"
                }`}
              />
            ))}
            <span className="text-xs text-neutral-500 ml-1">
              ({product.reviewCount})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-900">
              {formatPrice(discountedPrice)}
            </span>
            {!!product.discount && (
              <span className="text-sm text-neutral-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
