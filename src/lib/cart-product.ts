import type { Product } from "@/data/types";

type CartProductInput = {
  id?: string;
  name?: string;
  price?: number;
  oldPrice?: number;
  image?: string;
  images?: string[];
  badge?: string;
  rating?: number;
  reviewCount?: number;
  sku?: string;
  inStock?: boolean;
  stock?: number;
  sizes?: string[];
  colors?: { name: string; hex: string }[];
  storage?: string[];
  description?: string;
  category?: string;
  categoryName?: string;
  categorySlug?: string;
  subcategory?: string;
  sellerId?: string;
  storeSlug?: string;
  minProcessingDays?: number;
  maxProcessingDays?: number;
};

export function buildCartProduct(input: CartProductInput): Product {
  const fallbackImage = input.image || input.images?.[0] || "/images/placeholder.jpg";
  const images =
    Array.isArray(input.images) && input.images.length > 0
      ? input.images
      : [fallbackImage];
  const stock =
    typeof input.stock === "number"
      ? input.stock
      : input.inStock === false
        ? 0
        : 1;

  return {
    id: String(input.id || ""),
    name: String(input.name || "Produit"),
    description: input.description || "",
    price: Number(input.price || 0),
    originalPrice:
      typeof input.oldPrice === "number" && Number.isFinite(input.oldPrice)
        ? input.oldPrice
        : undefined,
    images,
    category:
      input.categoryName ||
      input.category ||
      input.categorySlug ||
      "produits",
    categorySlug: input.categorySlug,
    subcategory: input.subcategory,
    tags: [],
    rating:
      typeof input.rating === "number" && Number.isFinite(input.rating)
        ? input.rating
        : 0,
    reviewCount:
      typeof input.reviewCount === "number" && Number.isFinite(input.reviewCount)
        ? input.reviewCount
        : 0,
    stock,
    sku: input.sku || "",
    features: [],
    specifications: {},
    sellerId: input.sellerId,
    storeSlug: input.storeSlug,
    minProcessingDays: input.minProcessingDays,
    maxProcessingDays: input.maxProcessingDays,
  };
}
