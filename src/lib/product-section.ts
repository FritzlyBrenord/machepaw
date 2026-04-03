import {
  normalizeBoutiqueCategoryLabel,
  resolveBoutiqueCollectionCategoryId,
} from "@/lib/boutique";
import { getDiscountedPrice } from "@/lib/commerce";
import type { Product as StoreProduct } from "@/data/types";
import type {
  Product as BuilderProduct,
  ProductSectionSort,
  ProductSectionSource,
} from "@/types/builder-types";

export type SectionDisplayProduct = BuilderProduct;

export function normalizeProductSectionValue(value?: string | null) {
  return (value || "").trim().toLowerCase();
}

export function mapStoreProductToSectionProduct(
  product: StoreProduct,
): SectionDisplayProduct {
  const discountedPrice = getDiscountedPrice(product);
  const oldPrice =
    product.originalPrice && product.originalPrice > discountedPrice
      ? product.originalPrice
      : product.discount && product.price > discountedPrice
        ? product.price
        : undefined;

  return {
    id: product.id,
    name: product.name,
    price: discountedPrice,
    oldPrice,
    image: product.images?.[0] || "/images/placeholder.jpg",
    images: product.images,
    badge:
      product.discount && product.discount > 0
        ? `-${product.discount}%`
        : product.isNew
          ? "Nouveau"
          : product.isFeatured
            ? "Vedette"
            : product.isBestseller
              ? "Best-seller"
              : undefined,
    rating: product.rating,
    reviewCount: product.reviewCount,
    description: product.description,
  };
}

export function matchesProductCategory(product: StoreProduct, category: string) {
  const normalizedCategory = normalizeBoutiqueCategoryLabel(category);
  const normalizedCategoryId = normalizeBoutiqueCategoryLabel(
    resolveBoutiqueCollectionCategoryId(category),
  );

  if (!normalizedCategory && !normalizedCategoryId) {
    return true;
  }

  return [
    product.categoryId,
    product.categorySlug,
    product.category,
    product.subcategory,
  ].some((value) => {
    const normalizedValue = normalizeBoutiqueCategoryLabel(value || "");
    return (
      normalizedValue === normalizedCategory ||
      normalizedValue === normalizedCategoryId
    );
  });
}

export function matchesProductSearch(product: StoreProduct, query: string) {
  const normalizedQuery = normalizeProductSectionValue(query);

  if (!normalizedQuery) {
    return true;
  }

  return (
    normalizeProductSectionValue(product.name).includes(normalizedQuery) ||
    normalizeProductSectionValue(product.description).includes(normalizedQuery) ||
    normalizeProductSectionValue(product.category).includes(normalizedQuery) ||
    normalizeProductSectionValue(product.subcategory).includes(normalizedQuery) ||
    (product.tags || []).some((tag) =>
      normalizeProductSectionValue(tag).includes(normalizedQuery),
    )
  );
}

export function normalizeProductSource(
  value?: string | null,
): ProductSectionSource | undefined {
  switch (normalizeProductSectionValue(value)) {
    case "all":
      return "all";
    case "new":
    case "nouveautes":
    case "nouveaute":
    case "new_arrivals":
      return "new";
    case "featured":
    case "vedette":
    case "featured_products":
      return "featured";
    case "bestseller":
    case "best-seller":
      return "bestseller";
    case "discounted":
    case "promo":
    case "promotion":
    case "promotions":
    case "flash_sales":
      return "discounted";
    case "toprated":
    case "rating":
      return "topRated";
    case "topsales":
    case "sales":
      return "topSales";
    case "mostviewed":
    case "views":
      return "mostViewed";
    case "category":
    case "categorie":
      return "category";
    case "tag":
    case "tags":
      return "tag";
    default:
      return undefined;
  }
}

export function normalizeProductSort(
  value?: string | null,
): ProductSectionSort | undefined {
  switch (normalizeProductSectionValue(value)) {
    case "storedefault":
    case "default":
      return "storeDefault";
    case "new":
    case "newest":
    case "recent":
      return "newest";
    case "priceasc":
    case "price-asc":
      return "priceAsc";
    case "pricedesc":
    case "price-desc":
      return "priceDesc";
    case "rating":
      return "rating";
    case "sales":
      return "sales";
    case "views":
      return "views";
    case "discount":
      return "discount";
    case "name":
    case "nameasc":
      return "nameAsc";
    default:
      return undefined;
  }
}

function isDiscounted(product: StoreProduct) {
  return (product.discount || 0) > 0 || Boolean(product.originalPrice);
}

export function matchesProductSource(
  product: StoreProduct,
  productSource: ProductSectionSource,
  filterValue: string,
) {
  switch (productSource) {
    case "new":
      return Boolean(product.isNew);
    case "featured":
      return Boolean(product.isFeatured);
    case "bestseller":
      return Boolean(product.isBestseller);
    case "discounted":
      return isDiscounted(product);
    case "topRated":
      return Number(product.rating || 0) > 0;
    case "topSales":
      return Number(product.sales || 0) > 0;
    case "mostViewed":
      return Number(product.views || 0) > 0;
    case "category":
      if (!normalizeProductSectionValue(filterValue)) {
        return false;
      }
      return matchesProductCategory(product, filterValue);
    case "tag":
      return (product.tags || []).some(
        (tag) =>
          normalizeProductSectionValue(tag) ===
          normalizeProductSectionValue(filterValue),
      );
    case "all":
    default:
      return true;
  }
}

function getEffectiveSort(
  sortBy: ProductSectionSort,
  productSource: ProductSectionSource,
) {
  if (sortBy !== "storeDefault") {
    return sortBy;
  }

  switch (productSource) {
    case "new":
      return "newest";
    case "topRated":
      return "rating";
    case "topSales":
      return "sales";
    case "mostViewed":
      return "views";
    case "discounted":
      return "discount";
    default:
      return "storeDefault";
  }
}

function sortStoreProducts(
  products: StoreProduct[],
  sortBy: ProductSectionSort,
  productSource: ProductSectionSource,
) {
  const effectiveSort = getEffectiveSort(sortBy, productSource);
  const nextProducts = [...products];

  switch (effectiveSort) {
    case "newest":
      return nextProducts.sort((a, b) => {
        const aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bValue - aValue;
      });
    case "priceAsc":
      return nextProducts.sort(
        (a, b) => getDiscountedPrice(a) - getDiscountedPrice(b),
      );
    case "priceDesc":
      return nextProducts.sort(
        (a, b) => getDiscountedPrice(b) - getDiscountedPrice(a),
      );
    case "rating":
      return nextProducts.sort(
        (a, b) => Number(b.rating || 0) - Number(a.rating || 0),
      );
    case "sales":
      return nextProducts.sort(
        (a, b) => Number(b.sales || 0) - Number(a.sales || 0),
      );
    case "views":
      return nextProducts.sort(
        (a, b) => Number(b.views || 0) - Number(a.views || 0),
      );
    case "discount":
      return nextProducts.sort(
        (a, b) => Number(b.discount || 0) - Number(a.discount || 0),
      );
    case "nameAsc":
      return nextProducts.sort((a, b) => a.name.localeCompare(b.name));
    case "storeDefault":
    default:
      return nextProducts;
  }
}

export function resolveSectionStoreProducts(
  products: StoreProduct[],
  options: {
    productSource?: ProductSectionSource;
    filterValue?: string;
    sortBy?: ProductSectionSort;
    categoryParam?: string;
    searchQuery?: string;
    promoOnly?: boolean;
    maxItems?: number;
  },
) {
  const productSource = options.productSource || "all";
  const filterValue = options.filterValue || "";
  const sortBy = options.sortBy || "storeDefault";
  const categoryParam = options.categoryParam || "";
  const searchQuery = options.searchQuery || "";
  const promoOnly = options.promoOnly === true;

  const filteredProducts = sortStoreProducts(
    products
      .filter((product) =>
        matchesProductSource(product, productSource, filterValue),
      )
      .filter((product) => matchesProductCategory(product, categoryParam))
      .filter((product) => matchesProductSearch(product, searchQuery))
      .filter((product) => !promoOnly || isDiscounted(product)),
    sortBy,
    productSource,
  );

  if (typeof options.maxItems === "number" && options.maxItems > 0) {
    return filteredProducts.slice(0, options.maxItems);
  }

  return filteredProducts;
}

export function buildProductSectionRouteParams(
  productSource?: ProductSectionSource,
  filterValue?: string,
): Record<string, string> {
  const safeValue = (filterValue || "").trim();

  switch (productSource) {
    case "new":
      return { filter: "new" };
    case "featured":
      return { filter: "featured" };
    case "bestseller":
      return { filter: "bestseller" };
    case "discounted":
      return { promo: "true" };
    case "category":
      return safeValue ? { category: safeValue } : {};
    case "tag":
      return safeValue ? { search: safeValue } : {};
    case "topRated":
      return { sort: "rating" };
    case "topSales":
      return { sort: "sales" };
    case "mostViewed":
      return { sort: "views" };
    default:
      return {};
  }
}

export function getProductSectionEmptyState(
  productSource?: ProductSectionSource,
  filterValue?: string,
) {
  const safeValue = (filterValue || "").trim();

  switch (productSource) {
    case "new":
      return {
        title: "Aucune nouveaute pour le moment",
        subtitle: "Les derniers produits ajoutes par cette boutique apparaitront ici.",
      };
    case "featured":
      return {
        title: "Aucun produit en vedette",
        subtitle: "Le vendeur peut mettre certains articles en avant pour les afficher ici.",
      };
    case "bestseller":
      return {
        title: "Aucun best-seller disponible",
        subtitle: "Les produits les plus vendus de la boutique apparaitront ici.",
      };
    case "discounted":
      return {
        title: "Aucune promotion active",
        subtitle: "Les produits en reduction apparaitront ici des qu une offre sera disponible.",
      };
    case "category":
      return {
        title: safeValue
          ? `Aucun produit dans ${safeValue}`
          : "Aucune categorie selectionnee",
        subtitle:
          "Ajoutez des produits dans cette categorie ou choisissez une autre categorie dans les proprietes de la section.",
      };
    case "tag":
      return {
        title: safeValue
          ? `Aucun produit pour le tag ${safeValue}`
          : "Aucun tag selectionne",
        subtitle:
          "Renseignez un tag dans les proprietes de la section pour afficher les bons produits.",
      };
    default:
      return {
        title: "Aucun produit disponible pour le moment",
        subtitle: "Les produits ajoutes par cette boutique apparaitront ici.",
      };
  }
}
