"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { SlidersHorizontal, Grid3X3, LayoutList, X } from "lucide-react";
import { ProductCard } from "@/components/ui/ProductCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PRODUCT_ONTOLOGY } from "@/data/productOntology";
import { useStorefront } from "@/components/StorefrontProvider";
import { useStorefrontProductsQuery } from "@/hooks/useStorefront";
import { useFilters } from "@/store";
import { cn } from "@/lib/utils";

const sortOptions = [
  { value: "newest", label: "Nouveautés" },
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
  { value: "rating", label: "Meilleures notes" },
  { value: "bestseller", label: "Populaires" },
];

export default function CollectionPage() {
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get("category");
  const searchQuery = searchParams.get("search");
  const promoOnly = searchParams.get("promo") === "true";
  const { data: products = [], isLoading } = useStorefrontProductsQuery();
  const { formatPrice } = useStorefront();
  const {
    selectedCategory,
    selectedPriceRange,
    selectedTags,
    sortBy,
    setCategory,
    setPriceRange,
    toggleTag,
    setSortBy,
    resetFilters,
  } = useFilters();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    products.forEach((product) => {
      product.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).slice(0, 15);
  }, [products]);

  const maxPrice = useMemo(
    () => Math.max(...products.map((product) => product.price), 0),
    [products],
  );

  const priceRanges = useMemo(
    () => [
      { label: "Moins de 5 000", min: 0, max: 5000 },
      { label: "5 000 - 20 000", min: 5000, max: 20000 },
      { label: "20 000 - 50 000", min: 20000, max: 50000 },
      { label: "Plus de 50 000", min: 50000, max: Math.max(maxPrice, 50000) },
    ],
    [maxPrice],
  );

  const filteredProducts = useMemo(() => {
    let result = [...products];
    const categoryToUse = categorySlug || selectedCategory;

    if (categoryToUse) {
      result = result.filter(
        (product) =>
          product.categoryId === categoryToUse ||
          product.categorySlug === categoryToUse ||
          product.category === categoryToUse,
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.tags.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    if (promoOnly) {
      result = result.filter((product) => (product.discount || 0) > 0);
    }

    if (selectedPriceRange) {
      result = result.filter(
        (product) =>
          product.price >= selectedPriceRange[0] &&
          product.price <= selectedPriceRange[1],
      );
    }

    if (selectedTags.length > 0) {
      result = result.filter((product) =>
        selectedTags.some((tag) => product.tags.includes(tag)),
      );
    }

    result.sort((left, right) => {
      switch (sortBy) {
        case "price-asc":
          return left.price - right.price;
        case "price-desc":
          return right.price - left.price;
        case "rating":
          return right.rating - left.rating;
        case "bestseller":
          return Number(Boolean(right.isBestseller)) - Number(Boolean(left.isBestseller));
        case "newest":
        default:
          return (
            new Date(right.createdAt || 0).getTime() -
            new Date(left.createdAt || 0).getTime()
          );
      }
    });

    return result;
  }, [
    categorySlug,
    products,
    promoOnly,
    searchQuery,
    selectedCategory,
    selectedPriceRange,
    selectedTags,
    sortBy,
  ]);

  useEffect(() => {
    if (categorySlug) {
      const category = PRODUCT_ONTOLOGY.find((item) => item.id === categorySlug);
      if (category) {
        setCategory(category.id);
      }
    }
  }, [categorySlug, setCategory]);

  const activeFiltersCount =
    (selectedCategory ? 1 : 0) +
    (selectedPriceRange ? 1 : 0) +
    selectedTags.length;

  const pageTitle = searchQuery
    ? `Résultats pour "${searchQuery}"`
    : categorySlug
      ? PRODUCT_ONTOLOGY.find((category) => category.id === categorySlug)?.name ||
        "Collection"
      : promoOnly
        ? "Promotions"
        : "Toute la collection";

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-light text-neutral-900 mb-2">
              {pageTitle}
            </h1>
            <p className="text-neutral-500">
              {filteredProducts.length} produit
              {filteredProducts.length > 1 ? "s" : ""} trouvé
              {filteredProducts.length > 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
              className="px-4 py-2 border border-neutral-200 text-sm focus:outline-none focus:border-neutral-900"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="hidden md:flex border border-neutral-200">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 transition-colors",
                  viewMode === "grid"
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-600 hover:bg-neutral-100",
                )}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 transition-colors",
                  viewMode === "list"
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-600 hover:bg-neutral-100",
                )}
              >
                <LayoutList className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => setShowMobileFilters(true)}
              className="md:hidden flex items-center gap-2 px-4 py-2 border border-neutral-200"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtres
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 bg-neutral-900 text-white text-xs flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex gap-8">
          <aside className="hidden md:block w-64 shrink-0">
            <div className="sticky top-24 space-y-8">
              <div>
                <h3 className="font-medium text-neutral-900 mb-4">Catégories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setCategory(null)}
                    className={cn(
                      "block w-full text-left px-3 py-2 text-sm transition-colors",
                      !selectedCategory
                        ? "bg-neutral-100 text-neutral-900"
                        : "text-neutral-600 hover:bg-neutral-50",
                    )}
                  >
                    Toutes les catégories
                  </button>
                  {PRODUCT_ONTOLOGY.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setCategory(category.id)}
                      className={cn(
                        "block w-full text-left px-3 py-2 text-sm transition-colors",
                        selectedCategory === category.id
                          ? "bg-neutral-100 text-neutral-900"
                          : "text-neutral-600 hover:bg-neutral-50",
                      )}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-neutral-900 mb-4">Prix</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setPriceRange(null)}
                    className={cn(
                      "block w-full text-left px-3 py-2 text-sm transition-colors",
                      !selectedPriceRange
                        ? "bg-neutral-100 text-neutral-900"
                        : "text-neutral-600 hover:bg-neutral-50",
                    )}
                  >
                    Tous les prix
                  </button>
                  {priceRanges.map((range) => (
                    <button
                      key={range.label}
                      onClick={() => setPriceRange([range.min, range.max])}
                      className={cn(
                        "block w-full text-left px-3 py-2 text-sm transition-colors",
                        selectedPriceRange?.[0] === range.min
                          ? "bg-neutral-100 text-neutral-900"
                          : "text-neutral-600 hover:bg-neutral-50",
                      )}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-neutral-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        "px-3 py-1 text-xs border transition-colors",
                        selectedTags.includes(tag)
                          ? "bg-neutral-900 text-white border-neutral-900"
                          : "border-neutral-200 text-neutral-600 hover:border-neutral-400",
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {activeFiltersCount > 0 && (
                <Button variant="outline" size="sm" fullWidth onClick={resetFilters}>
                  Réinitialiser les filtres
                </Button>
              )}
            </div>
          </aside>

          <div className="flex-1">
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-sm text-neutral-500">Filtres actifs:</span>
                {selectedCategory && (
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => setCategory(null)}
                  >
                    {PRODUCT_ONTOLOGY.find((category) => category.id === selectedCategory)?.name ||
                      selectedCategory}
                    <X className="w-3 h-3" />
                  </Badge>
                )}
                {selectedPriceRange && (
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => setPriceRange(null)}
                  >
                    {formatPrice(selectedPriceRange[0])} -{" "}
                    {formatPrice(selectedPriceRange[1])}
                    <X className="w-3 h-3" />
                  </Badge>
                )}
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                    <X className="w-3 h-3" />
                  </Badge>
                ))}
                <button
                  onClick={resetFilters}
                  className="text-sm text-neutral-500 hover:text-neutral-900 underline"
                >
                  Tout effacer
                </button>
              </div>
            )}

            {isLoading ? (
              <div
                className={cn(
                  viewMode === "grid"
                    ? "grid grid-cols-2 md:grid-cols-3 gap-6"
                    : "space-y-4",
                )}
              >
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="bg-neutral-100 h-80 animate-pulse" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-lg text-neutral-500 mb-4">
                  Aucun produit ne correspond à vos critères
                </p>
                <Button onClick={resetFilters}>Réinitialiser les filtres</Button>
              </div>
            ) : (
              <div
                className={cn(
                  viewMode === "grid"
                    ? "grid grid-cols-2 md:grid-cols-3 gap-6"
                    : "space-y-4",
                )}
              >
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ProductCard
                      product={product}
                      variant={viewMode === "list" ? "horizontal" : "default"}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showMobileFilters && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowMobileFilters(false)}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="absolute right-0 top-0 bottom-0 w-80 bg-white overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-light">Filtres</h2>
                <button onClick={() => setShowMobileFilters(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="font-medium text-neutral-900 mb-4">Catégories</h3>
                  <div className="space-y-2">
                    {PRODUCT_ONTOLOGY.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setCategory(category.id)}
                        className={cn(
                          "block w-full text-left px-3 py-2 text-sm transition-colors",
                          selectedCategory === category.id
                            ? "bg-neutral-100 text-neutral-900"
                            : "text-neutral-600",
                        )}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-neutral-900 mb-4">Prix</h3>
                  <div className="space-y-2">
                    {priceRanges.map((range) => (
                      <button
                        key={range.label}
                        onClick={() => setPriceRange([range.min, range.max])}
                        className={cn(
                          "block w-full text-left px-3 py-2 text-sm transition-colors",
                          selectedPriceRange?.[0] === range.min
                            ? "bg-neutral-100 text-neutral-900"
                            : "text-neutral-600",
                        )}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>

                {activeFiltersCount > 0 && (
                  <Button fullWidth onClick={resetFilters}>
                    Réinitialiser ({activeFiltersCount})
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
