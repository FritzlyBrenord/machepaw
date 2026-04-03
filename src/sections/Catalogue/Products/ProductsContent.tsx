"use client";

import { productsContentSchema } from "./ProductsContent.schema";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "@/lib/router";
import {
  categories as sampleCategories,
  products as sampleProducts,
} from "@/lib/products-data";
import {
  buildCatalogFromStorefrontStore,
  type StorefrontCatalogCategory,
  type StorefrontCatalogProduct,
} from "@/lib/storefront-catalog";
import type { StorefrontSectionStoreData } from "@/lib/storefront-section-data";
import { useEcommerceStore } from "@/store/ecommerce-store";
import { useCart } from "@/store";
import { buildCartProduct } from "@/lib/cart-product";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  ShoppingCart,
  Search,
  Filter,
  Star,
  Grid3X3,
  LayoutList,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { ProductsContentProps } from "@/types/builder-types";

type SortMode = "price-asc" | "price-desc" | "name" | "rating";
type ViewMode = "grid" | "list";

type ProductsContentBlockItem = Partial<StorefrontCatalogProduct> & {
  id?: string;
  name?: string;
  price?: number;
  oldPrice?: number;
  image?: string;
  badge?: string;
  rating?: number;
  reviewCount?: number;
  category?: string;
  description?: string;
};

type ProductsContentMigratedProps = ProductsContentSectionProps & {
  content?: {
    title?: string | null;
    subtitle?: string | null;
    // Recherche
    searchPlaceholder?: string;
    // Filtres
    categoriesLabel?: string;
    allCategoriesLabel?: string;
    priceLabel?: string;
    minPricePlaceholder?: string;
    maxPricePlaceholder?: string;
    filtersButtonLabel?: string;
    resetFiltersLabel?: string;
    // Tri
    sortLabel?: string;
    sortNameLabel?: string;
    sortPriceAscLabel?: string;
    sortPriceDescLabel?: string;
    sortRatingLabel?: string;
    // Résultats
    resultsFoundLabel?: string;
    categoryBadgeLabel?: string;
    searchBadgeLabel?: string;
    // Etat vide
    emptyStateTitle?: string;
    emptyStateDescription?: string;
    // Produit
    addToCartLabel?: string;
    currencyLabel?: string;
    // Toast
    addedToCartMessage?: string;
    addedToWishlistMessage?: string;
    removedFromWishlistMessage?: string;
    products?: ProductsContentBlockItem[];
  };
  config?: {
    showFilters?: boolean;
    showSearch?: boolean;
    showSort?: boolean;
    showViewModeToggle?: boolean;
    columns?: number;
    gridColumns?: number;
    filterStyle?: string;
    cardStyle?: string;
    showRating?: boolean;
    showBadges?: boolean;
    showWishlistButton?: boolean;
    enablePriceFilter?: boolean;
    enableCategoryFilter?: boolean;
  };
  style?: {
    colors?: {
      background?: string;
      text?: string;
      accent?: string;
    };
    spacing?: {
      paddingY?: string | number;
      container?: "full" | "contained" | "narrow";
    };
  };
  classes?: {
    root?: string;
  };
  products?: ProductsContentBlockItem[];
};

interface ProductsContentSectionProps extends ProductsContentProps {
  storefrontStore?: StorefrontSectionStoreData | null;
}

function normalizeValue(value?: string) {
  return String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function resolveCategorySlug(
  rawCategory: string | undefined,
  availableCategories: StorefrontCatalogCategory[],
) {
  const normalizedCategory = normalizeValue(rawCategory);

  if (!normalizedCategory || normalizedCategory === "all") {
    return "all";
  }

  const matchedCategory = availableCategories.find(
    (category) =>
      normalizeValue(category.slug) === normalizedCategory ||
      normalizeValue(category.name) === normalizedCategory ||
      normalizeValue(category.id) === normalizedCategory,
  );

  return matchedCategory?.slug || rawCategory || "all";
}

function buildFallbackCategories(
  products: StorefrontCatalogProduct[],
  explicitCategories: StorefrontCatalogCategory[],
) {
  if (explicitCategories.length > 0) {
    return explicitCategories.map((category) => ({
      ...category,
      productCount:
        typeof category.productCount === "number"
          ? category.productCount
          : products.filter(
              (product) =>
                normalizeValue(product.category) ===
                normalizeValue(category.slug),
            ).length,
    }));
  }

  const categoryMap = new Map<string, StorefrontCatalogCategory>();

  products.forEach((product) => {
    const categorySlug = product.category || "produits";
    const existingCategory = categoryMap.get(categorySlug);

    if (existingCategory) {
      existingCategory.productCount = (existingCategory.productCount || 0) + 1;
      return;
    }

    categoryMap.set(categorySlug, {
      id: product.categoryId || categorySlug,
      name: product.categoryName || product.category || "Produits",
      slug: categorySlug,
      image: product.image,
      productCount: 1,
    });
  });

  return Array.from(categoryMap.values()).sort((left, right) =>
    left.name.localeCompare(right.name, "fr"),
  );
}

function getGridClass(columns?: number) {
  switch (columns) {
    case 2:
      return "grid-cols-1 sm:grid-cols-2";
    case 3:
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    case 4:
    default:
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
  }
}

function resolveColorToken(color: string | undefined, fallback: string) {
  if (!color) return fallback;

  const colorMap: Record<string, string> = {
    primary: "var(--color-primary, #1a1a1a)",
    secondary: "var(--color-secondary, #f5f5f5)",
    accent: "var(--color-accent, #c9a96e)",
    muted: "var(--color-muted, #6b7280)",
    white: "#ffffff",
    black: "#000000",
    transparent: "transparent",
  };

  return colorMap[color] || color;
}

function resolveSpacingPx(
  value: string | number | undefined,
  fallback: string | number,
) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (/^\d+$/.test(trimmed)) {
      return parseInt(trimmed, 10) * 4;
    }
    const pxMatch = trimmed.match(/^(\d+(?:\.\d+)?)px$/i);
    if (pxMatch) {
      return Number(pxMatch[1]);
    }
  }

  if (typeof fallback === "number" && Number.isFinite(fallback)) {
    return fallback;
  }

  if (typeof fallback === "string") {
    const trimmed = fallback.trim();
    if (/^\d+$/.test(trimmed)) {
      return parseInt(trimmed, 10) * 4;
    }
    const pxMatch = trimmed.match(/^(\d+(?:\.\d+)?)px$/i);
    if (pxMatch) {
      return Number(pxMatch[1]);
    }
  }

  return 60;
}

export function ProductsContent({
  id,
  title,
  subtitle,
  showFilters = true,
  gridColumns,
  columns,
  storefrontStore,
  styles,
  content = {},
  config = {},
  style = {},
  classes = {},
  products: legacyProducts,
}: ProductsContentMigratedProps) {
  const navigate = useNavigate();
  const params = useParams();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useEcommerceStore();
  const resolvedTitle = content.title ?? title;
  const resolvedSubtitle = content.subtitle ?? subtitle;
  const resolvedShowFilters = config.showFilters ?? showFilters;
  const resolvedShowSearch = config.showSearch ?? true;
  const resolvedShowSort = config.showSort ?? true;
  const resolvedShowViewModeToggle = config.showViewModeToggle ?? true;
  const resolvedShowRating = config.showRating ?? true;
  const resolvedShowBadges = config.showBadges ?? true;
  const resolvedShowWishlistButton = config.showWishlistButton ?? true;
  const resolvedEnablePriceFilter = config.enablePriceFilter ?? true;
  const resolvedEnableCategoryFilter = config.enableCategoryFilter ?? true;

  // Content labels
  const resolvedSearchPlaceholder =
    content.searchPlaceholder ?? "Rechercher un produit...";
  const resolvedCategoriesLabel = content.categoriesLabel ?? "Categories";
  const resolvedAllCategoriesLabel =
    content.allCategoriesLabel ?? "Toutes les categories";
  const resolvedPriceLabel = content.priceLabel ?? "Prix";
  const resolvedMinPricePlaceholder = content.minPricePlaceholder ?? "Min";
  const resolvedMaxPricePlaceholder = content.maxPricePlaceholder ?? "Max";
  const resolvedFiltersButtonLabel = content.filtersButtonLabel ?? "Filtres";
  const resolvedResetFiltersLabel =
    content.resetFiltersLabel ?? "Reinitialiser";
  const resolvedSortNameLabel = content.sortNameLabel ?? "Nom";
  const resolvedSortPriceAscLabel =
    content.sortPriceAscLabel ?? "Prix croissant";
  const resolvedSortPriceDescLabel =
    content.sortPriceDescLabel ?? "Prix decroissant";
  const resolvedSortRatingLabel = content.sortRatingLabel ?? "Mieux notes";
  const resolvedResultsFoundLabel =
    content.resultsFoundLabel ?? "{count} produit(s) trouve(s)";
  const resolvedCategoryBadgeLabel = content.categoryBadgeLabel ?? "Categorie:";
  const resolvedSearchBadgeLabel = content.searchBadgeLabel ?? "Recherche:";
  const resolvedEmptyStateTitle =
    content.emptyStateTitle ?? "Aucun produit trouve";
  const resolvedEmptyStateDescription =
    content.emptyStateDescription ??
    "Essayez de modifier vos filtres ou votre recherche";
  const resolvedAddToCartLabel = content.addToCartLabel ?? "Ajouter au panier";
  const resolvedCurrencyLabel = content.currencyLabel ?? "EUR";
  const resolvedAddedToCartMessage =
    content.addedToCartMessage ?? "{name} ajoute au panier";
  const resolvedAddedToWishlistMessage =
    content.addedToWishlistMessage ?? "Ajoute aux favoris";
  const resolvedRemovedFromWishlistMessage =
    content.removedFromWishlistMessage ?? "Retire des favoris";

  const storefrontCatalog = useMemo(
    () => buildCatalogFromStorefrontStore(storefrontStore),
    [storefrontStore],
  );
  const hasStorefrontStore = Boolean(
    storefrontStore?.sellerId || storefrontStore?.storeSlug,
  );

  const configuredProducts = useMemo<StorefrontCatalogProduct[]>(() => {
    const sourceProducts =
      Array.isArray(content.products) && content.products.length > 0
        ? content.products
        : Array.isArray(legacyProducts)
          ? legacyProducts
          : [];

    return sourceProducts.map((product, index) => ({
      id: String(product.id || `product-${index}`),
      name: String(product.name || "Produit"),
      price: Number(product.price || 0),
      oldPrice:
        typeof product.oldPrice === "number" ? product.oldPrice : undefined,
      image: String(product.image || "/images/placeholder.jpg"),
      images:
        Array.isArray(product.images) && product.images.length > 0
          ? product.images.filter(
              (image): image is string => typeof image === "string",
            )
          : undefined,
      badge: typeof product.badge === "string" ? product.badge : undefined,
      rating: typeof product.rating === "number" ? product.rating : undefined,
      reviewCount:
        typeof product.reviewCount === "number"
          ? product.reviewCount
          : undefined,
      category: String(product.category || "produits"),
      categoryName: String(
        product.categoryName || product.category || "Produits",
      ),
      categorySlug: String(
        product.categorySlug || product.category || "produits",
      ),
      sellerId: storefrontStore?.sellerId,
      storeSlug: storefrontStore?.storeSlug,
      description:
        typeof product.description === "string"
          ? product.description
          : undefined,
    }));
  }, [
    content.products,
    legacyProducts,
    storefrontStore?.sellerId,
    storefrontStore?.storeSlug,
  ]);

  const availableProducts = useMemo<StorefrontCatalogProduct[]>(
    () =>
      (hasStorefrontStore
        ? storefrontCatalog.products
        : configuredProducts.length
          ? configuredProducts
          : sampleProducts
      ).map((product) => ({
        ...product,
        categoryName:
          "categoryName" in product && typeof product.categoryName === "string"
            ? product.categoryName
            : product.category,
        categorySlug:
          "categorySlug" in product && typeof product.categorySlug === "string"
            ? product.categorySlug
            : product.category,
      })),
    [configuredProducts, hasStorefrontStore, storefrontCatalog.products],
  );

  const availableCategories = useMemo(
    () =>
      buildFallbackCategories(
        availableProducts,
        hasStorefrontStore
          ? storefrontCatalog.categories
          : storefrontCatalog.categories.length
            ? storefrontCatalog.categories
            : sampleCategories,
      ),
    [availableProducts, hasStorefrontStore, storefrontCatalog.categories],
  );

  const maxCatalogPrice = useMemo(() => {
    const maxPrice = availableProducts.reduce(
      (highestPrice, product) =>
        Math.max(highestPrice, Number(product.price || 0)),
      0,
    );

    return Math.max(500, Math.ceil(maxPrice / 50) * 50 || 500);
  }, [availableProducts]);

  const routeCategory = params.category || "all";
  const routeSearch = params.search || "";
  const routeSort = (params.sort as SortMode | undefined) || "name";
  const routeView = (params.view as ViewMode | undefined) || "grid";
  const routeMinPrice = Number(params.minPrice || 0);
  const routeMaxPrice = Number(params.maxPrice || maxCatalogPrice);

  const [selectedCategory, setSelectedCategory] = useState<string>(
    resolveCategorySlug(routeCategory, availableCategories),
  );
  const [searchQuery, setSearchQuery] = useState(routeSearch);
  const [sortBy, setSortBy] = useState<SortMode>(routeSort);
  const [viewMode, setViewMode] = useState<ViewMode>(routeView);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number.isFinite(routeMinPrice) ? routeMinPrice : 0,
    Number.isFinite(routeMaxPrice) && routeMaxPrice > 0
      ? routeMaxPrice
      : maxCatalogPrice,
  ]);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setSelectedCategory(
      resolveCategorySlug(routeCategory, availableCategories),
    );
  }, [availableCategories, routeCategory]);

  useEffect(() => {
    setSearchQuery(routeSearch);
  }, [routeSearch]);

  useEffect(() => {
    setSortBy(routeSort);
  }, [routeSort]);

  useEffect(() => {
    setViewMode(routeView);
  }, [routeView]);

  useEffect(() => {
    setPriceRange([
      Number.isFinite(routeMinPrice) ? routeMinPrice : 0,
      Number.isFinite(routeMaxPrice) && routeMaxPrice > 0
        ? routeMaxPrice
        : maxCatalogPrice,
    ]);
  }, [maxCatalogPrice, routeMaxPrice, routeMinPrice]);

  useEffect(() => {
    const nextParams: Record<string, string> = {};

    if (selectedCategory !== "all") {
      nextParams.category = selectedCategory;
    }

    if (searchQuery.trim()) {
      nextParams.search = searchQuery.trim();
    }

    if (priceRange[0] > 0) {
      nextParams.minPrice = String(priceRange[0]);
    }

    if (priceRange[1] < maxCatalogPrice) {
      nextParams.maxPrice = String(priceRange[1]);
    }

    if (sortBy !== "name") {
      nextParams.sort = sortBy;
    }

    if (viewMode !== "grid") {
      nextParams.view = viewMode;
    }

    const currentParams = {
      category: params.category || "",
      search: params.search || "",
      minPrice: params.minPrice || "",
      maxPrice: params.maxPrice || "",
      sort: params.sort || "",
      view: params.view || "",
    };

    if (
      currentParams.category !== (nextParams.category || "") ||
      currentParams.search !== (nextParams.search || "") ||
      currentParams.minPrice !== (nextParams.minPrice || "") ||
      currentParams.maxPrice !== (nextParams.maxPrice || "") ||
      currentParams.sort !== (nextParams.sort || "") ||
      currentParams.view !== (nextParams.view || "")
    ) {
      navigate("products", nextParams);
    }
  }, [
    maxCatalogPrice,
    navigate,
    params.category,
    params.maxPrice,
    params.minPrice,
    params.search,
    params.sort,
    params.view,
    priceRange,
    searchQuery,
    selectedCategory,
    sortBy,
    viewMode,
  ]);

  const filteredProducts = useMemo(() => {
    let result = [...availableProducts];
    const normalizedSelectedCategory = normalizeValue(selectedCategory);

    if (normalizedSelectedCategory !== "all") {
      result = result.filter((product) => {
        const matchedCategory = availableCategories.find(
          (category) => category.slug === product.category,
        );

        return (
          normalizeValue(product.category) === normalizedSelectedCategory ||
          normalizeValue(product.categoryName) === normalizedSelectedCategory ||
          normalizeValue(matchedCategory?.slug) ===
            normalizedSelectedCategory ||
          normalizeValue(matchedCategory?.name) === normalizedSelectedCategory
        );
      });
    }

    if (searchQuery.trim()) {
      const query = normalizeValue(searchQuery);
      result = result.filter(
        (product) =>
          normalizeValue(product.name).includes(query) ||
          normalizeValue(product.description).includes(query) ||
          normalizeValue(product.categoryName).includes(query),
      );
    }

    result = result.filter(
      (product) =>
        product.price >= priceRange[0] && product.price <= priceRange[1],
    );

    result.sort((left, right) => {
      switch (sortBy) {
        case "price-asc":
          return left.price - right.price;
        case "price-desc":
          return right.price - left.price;
        case "rating":
          return (right.rating || 0) - (left.rating || 0);
        case "name":
        default:
          return left.name.localeCompare(right.name, "fr");
      }
    });

    return result;
  }, [
    availableCategories,
    availableProducts,
    priceRange,
    searchQuery,
    selectedCategory,
    sortBy,
  ]);

  const activeCategory = availableCategories.find(
    (category) =>
      category.slug ===
      resolveCategorySlug(selectedCategory, availableCategories),
  );

  const handleAddToCart = (product: StorefrontCatalogProduct) => {
    addToCart(
      buildCartProduct({
        ...product,
        sellerId: storefrontStore?.sellerId || product.sellerId,
        storeSlug: storefrontStore?.storeSlug || product.storeSlug,
      }),
      1,
    );
    toast.success(resolvedAddedToCartMessage.replace("{name}", product.name));
  };

  const handleToggleWishlist = (product: StorefrontCatalogProduct) => {
    toggleWishlist({
      ...product,
      sellerId: storefrontStore?.sellerId || product.sellerId,
      storeSlug: storefrontStore?.storeSlug || product.storeSlug,
    });
    const isAdded = !isInWishlist(product.id);
    toast.success(
      isAdded
        ? resolvedAddedToWishlistMessage
        : resolvedRemovedFromWishlistMessage,
    );
  };

  const clearAllFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setSortBy("name");
    setViewMode("grid");
    setPriceRange([0, maxCatalogPrice]);
  };

  const mergedStyles = {
    backgroundColor: resolveColorToken(
      style.colors?.background,
      styles?.backgroundColor || "#f9fafb",
    ),
    textColor: resolveColorToken(
      style.colors?.text,
      styles?.textColor || "#1a1a1a",
    ),
    accentColor: resolveColorToken(
      style.colors?.accent,
      styles?.accentColor || "#c9a96e",
    ),
    paddingY: resolveSpacingPx(style.spacing?.paddingY, styles?.paddingY || 60),
    ...(styles || {}),
  };
  const desktopColumns = Number(
    config.columns || config.gridColumns || columns || gridColumns || 4,
  );

  return (
    <div
      id={id}
      className={cn("min-h-screen", classes.root)}
      style={{
        backgroundColor: mergedStyles.backgroundColor,
        color: mergedStyles.textColor,
        paddingTop: `${mergedStyles.paddingY}px`,
        paddingBottom: `${mergedStyles.paddingY}px`,
      }}
    >
      {resolvedTitle ? (
        <div className="mx-auto max-w-7xl px-4 pb-6 text-center">
          <h1 className="text-3xl font-bold">{resolvedTitle}</h1>
          {resolvedSubtitle ? (
            <p
              className="mt-2"
              style={{ color: mergedStyles.textColor, opacity: 0.7 }}
            >
              {resolvedSubtitle}
            </p>
          ) : null}
        </div>
      ) : null}

      <div
        className="sticky top-0 z-20 border-b"
        style={{ backgroundColor: mergedStyles.backgroundColor }}
      >
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            {resolvedShowSearch ? (
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder={resolvedSearchPlaceholder}
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="pl-10"
                />
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-2">
              {resolvedShowSort ? (
                <select
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(event.target.value as SortMode)
                  }
                  className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="name">{resolvedSortNameLabel}</option>
                  <option value="price-asc">{resolvedSortPriceAscLabel}</option>
                  <option value="price-desc">
                    {resolvedSortPriceDescLabel}
                  </option>
                  <option value="rating">{resolvedSortRatingLabel}</option>
                </select>
              ) : null}

              {resolvedShowViewModeToggle ? (
                <div className="flex overflow-hidden rounded-lg border">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`p-2 ${viewMode === "grid" ? "bg-primary text-white" : "bg-white"}`}
                  >
                    <Grid3X3 className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`p-2 ${viewMode === "list" ? "bg-primary text-white" : "bg-white"}`}
                  >
                    <LayoutList className="h-5 w-5" />
                  </button>
                </div>
              ) : null}

              {resolvedShowFilters ? (
                <Button
                  variant="outline"
                  onClick={() => setShowFiltersMobile(!showFiltersMobile)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  {resolvedFiltersButtonLabel}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          {resolvedShowFilters ? (
            <aside
              className={`lg:w-72 ${showFiltersMobile ? "block" : "hidden lg:block"}`}
            >
              <div className="space-y-6 rounded-lg bg-white p-4 shadow-sm">
                <div>
                  {resolvedEnableCategoryFilter ? (
                    <>
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="font-semibold">
                          {resolvedCategoriesLabel}
                        </h3>
                        <button
                          type="button"
                          onClick={clearAllFilters}
                          className="text-xs text-gray-500 hover:text-gray-900"
                        >
                          {resolvedResetFiltersLabel}
                        </button>
                      </div>
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => setSelectedCategory("all")}
                          className={`w-full rounded-lg px-3 py-2 text-left transition-colors ${
                            selectedCategory === "all"
                              ? "bg-primary text-white"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          {resolvedAllCategoriesLabel}
                        </button>
                        {availableCategories.map((category) => (
                          <button
                            key={category.slug}
                            type="button"
                            onClick={() => setSelectedCategory(category.slug)}
                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors ${
                              selectedCategory === category.slug
                                ? "bg-primary text-white"
                                : "hover:bg-gray-100"
                            }`}
                          >
                            <span>{category.name}</span>
                            <span className="text-xs opacity-70">
                              ({category.productCount || 0})
                            </span>
                          </button>
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>

                {resolvedEnablePriceFilter ? (
                  <div>
                    <h3 className="mb-3 font-semibold">{resolvedPriceLabel}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={priceRange[0]}
                          onChange={(event) =>
                            setPriceRange([
                              Number(event.target.value || 0),
                              priceRange[1],
                            ])
                          }
                          className="w-24"
                          placeholder={resolvedMinPricePlaceholder}
                        />
                        <span>-</span>
                        <Input
                          type="number"
                          value={priceRange[1]}
                          onChange={(event) =>
                            setPriceRange([
                              priceRange[0],
                              Number(event.target.value || maxCatalogPrice),
                            ])
                          }
                          className="w-24"
                          placeholder={resolvedMaxPricePlaceholder}
                        />
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={maxCatalogPrice}
                        value={priceRange[1]}
                        onChange={(event) =>
                          setPriceRange([
                            priceRange[0],
                            Number(event.target.value),
                          ])
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            </aside>
          ) : null}

          <main className="flex-1">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-gray-600">
                {resolvedResultsFoundLabel.replace(
                  "{count}",
                  String(filteredProducts.length),
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {activeCategory ? (
                  <Badge variant="outline">
                    {resolvedCategoryBadgeLabel} {activeCategory.name}
                  </Badge>
                ) : null}
                {searchQuery.trim() ? (
                  <Badge variant="outline" className="gap-2">
                    {resolvedSearchBadgeLabel} {searchQuery.trim()}
                    <button type="button" onClick={() => setSearchQuery("")}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ) : null}
              </div>
            </div>

            <div
              className={`grid gap-4 ${
                viewMode === "grid"
                  ? getGridClass(desktopColumns)
                  : "grid-cols-1"
              }`}
            >
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className={`group overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-lg ${
                    viewMode === "list" ? "flex" : ""
                  }`}
                >
                  <div
                    className={`relative overflow-hidden ${
                      viewMode === "list"
                        ? "w-48 flex-shrink-0"
                        : "aspect-[4/5]"
                    }`}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full cursor-pointer object-cover transition-transform duration-300 group-hover:scale-105"
                      onClick={() => navigate("product", { id: product.id })}
                    />

                    {resolvedShowBadges && product.badge ? (
                      <Badge className="absolute left-2 top-2 bg-red-500">
                        {product.badge}
                      </Badge>
                    ) : null}

                    {resolvedShowWishlistButton ? (
                      <button
                        type="button"
                        onClick={() => handleToggleWishlist(product)}
                        className="absolute right-2 top-2 rounded-full bg-white p-2 shadow-md opacity-0 transition-opacity hover:bg-gray-100 group-hover:opacity-100"
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            isMounted && isInWishlist(product.id)
                              ? "fill-red-500 text-red-500"
                              : "text-gray-600"
                          }`}
                        />
                      </button>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      className="absolute bottom-0 left-0 right-0 translate-y-0 bg-primary py-2 text-white transition-transform sm:translate-y-full sm:group-hover:translate-y-0"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        {resolvedAddToCartLabel}
                      </span>
                    </button>
                  </div>

                  <div className="flex-1 p-4">
                    <p className="mb-1 text-xs uppercase tracking-wide text-gray-500">
                      {product.categoryName}
                    </p>
                    <h3
                      className="mb-2 cursor-pointer font-medium text-gray-900 transition-colors hover:text-primary"
                      onClick={() => navigate("product", { id: product.id })}
                    >
                      {product.name}
                    </h3>

                    {resolvedShowRating && product.rating ? (
                      <div className="mb-2 flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">
                          {product.rating}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({product.reviewCount || 0})
                        </span>
                      </div>
                    ) : null}

                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">
                        {product.price.toFixed(2)} {resolvedCurrencyLabel}
                      </span>
                      {product.oldPrice ? (
                        <span className="text-sm text-gray-500 line-through">
                          {product.oldPrice.toFixed(2)} {resolvedCurrencyLabel}
                        </span>
                      ) : null}
                    </div>

                    {viewMode === "list" ? (
                      <div className="mt-4 flex gap-2">
                        <Button
                          onClick={() => handleAddToCart(product)}
                          className="flex-1"
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          {resolvedAddToCartLabel}
                        </Button>
                        {resolvedShowWishlistButton ? (
                          <Button
                            variant="outline"
                            onClick={() => handleToggleWishlist(product)}
                          >
                            <Heart
                              className={`h-4 w-4 ${
                                isMounted && isInWishlist(product.id)
                                  ? "fill-red-500 text-red-500"
                                  : ""
                              }`}
                            />
                          </Button>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
                  <Search className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  {resolvedEmptyStateTitle}
                </h3>
                <p className="text-gray-500">{resolvedEmptyStateDescription}</p>
              </div>
            ) : null}
          </main>
        </div>
      </div>
    </div>
  );
}

Object.assign(ProductsContent, { schema: productsContentSchema });

export const schema = productsContentSchema;

export default ProductsContent;
