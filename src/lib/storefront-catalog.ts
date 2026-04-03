import { resolveCategoryLabels } from "@/lib/category-labels";
import { PRODUCT_ONTOLOGY } from "@/data/productOntology";
import type { StorefrontSectionStoreData } from "@/lib/storefront-section-data";
import type { Category, Product } from "@/types/ecommerce-types";

const FALLBACK_IMAGE = "/images/placeholder.jpg";

export type StorefrontCatalogProduct = Product & {
  categoryId?: string;
  categoryName: string;
  categorySlug: string;
  createdAt?: string;
  isFeatured?: boolean;
  isNew?: boolean;
  status?: string;
  stock?: number;
};

export type StorefrontCatalogCategory = Category;

function normalizeValue(value?: string | null) {
  return (value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function slugifyCategory(value?: string | null) {
  const normalized = normalizeValue(value);

  if (!normalized) {
    return "produits";
  }

  return normalized
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "produits";
}

function resolveDisplayCategoryName(
  subcategory?: string | null,
  category?: string | null,
  categoryId?: string | null,
) {
  const normalizedSubcategory = normalizeValue(subcategory);

  if (normalizedSubcategory) {
    for (const ontologyCategory of PRODUCT_ONTOLOGY) {
      const matchedSubcategory = ontologyCategory.subcategories.find(
        (item) =>
          normalizeValue(item.id) === normalizedSubcategory ||
          normalizeValue(item.name) === normalizedSubcategory,
      );

      if (matchedSubcategory?.name) {
        return matchedSubcategory.name;
      }
    }
  }

  return (
    resolveCategoryLabels([
      subcategory || category || categoryId || "",
      category || categoryId || "",
    ])[0] || "Produits"
  );
}

function getProductImage(
  product: NonNullable<StorefrontSectionStoreData["products"]>[number],
) {
  const galleryImage = Array.isArray(product.images)
    ? product.images.find((image) => typeof image === "string" && image.trim().length > 0)
    : undefined;

  if (galleryImage) {
    return galleryImage;
  }

  if (typeof product.image === "string" && product.image.trim().length > 0) {
    return product.image;
  }

  return FALLBACK_IMAGE;
}

export function buildCatalogFromStorefrontStore(
  store?: StorefrontSectionStoreData | null,
): {
  products: StorefrontCatalogProduct[];
  categories: StorefrontCatalogCategory[];
} {
  const productsSource = store?.products || [];
  const categoryMap = new Map<string, StorefrontCatalogCategory>();

  const products = productsSource
    .filter((product) => product.id && product.name)
    .map((product) => {
      const categoryName =
        resolveDisplayCategoryName(
          product.subcategory,
          product.category,
          product.categoryId,
        );
      const categorySlug = slugifyCategory(categoryName);
      const image = getProductImage(product);

      const existingCategory = categoryMap.get(categorySlug);
      if (existingCategory) {
        existingCategory.productCount = (existingCategory.productCount || 0) + 1;
        if (!existingCategory.image && image) {
          existingCategory.image = image;
        }
      } else {
        categoryMap.set(categorySlug, {
          id: product.categoryId || categorySlug,
          name: categoryName,
          slug: categorySlug,
          image,
          productCount: 1,
        });
      }

      return {
        id: String(product.id),
        name: String(product.name),
        price: Number(product.price || 0),
        oldPrice:
          typeof product.oldPrice === "number" && Number.isFinite(product.oldPrice)
            ? product.oldPrice
            : undefined,
        image,
        images: Array.isArray(product.images) && product.images.length > 0
          ? product.images
          : [image],
        badge:
          typeof product.badge === "string" && product.badge.trim()
            ? product.badge
            : product.isNew
              ? "Nouveau"
              : undefined,
        rating:
          typeof product.rating === "number" && Number.isFinite(product.rating)
            ? product.rating
            : undefined,
        reviewCount:
          typeof product.reviewCount === "number" && Number.isFinite(product.reviewCount)
            ? product.reviewCount
            : undefined,
        category: categorySlug,
        categoryId: product.categoryId,
        categoryName,
        categorySlug,
        sellerId: store?.sellerId,
        storeSlug: store?.storeSlug,
        description: "",
        inStock: (product.stock || 0) > 0,
        quantity: product.stock,
        createdAt: product.createdAt,
        isFeatured: Boolean(product.isFeatured),
        isNew: Boolean(product.isNew),
        status: product.status,
        stock: product.stock,
      } satisfies StorefrontCatalogProduct;
    });

  return {
    products,
    categories: Array.from(categoryMap.values()).sort((left, right) =>
      left.name.localeCompare(right.name, "fr"),
    ),
  };
}
