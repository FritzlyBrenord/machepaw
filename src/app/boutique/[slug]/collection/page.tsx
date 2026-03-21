"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Grid3X3, LayoutList, SlidersHorizontal, X } from "lucide-react";
import { PRODUCT_ONTOLOGY } from "@/data/productOntology";
import { BoutiqueProductCard } from "@/components/boutique/BoutiqueProductCard";
import { Button } from "@/components/ui/Button";
import { useBoutiqueStore } from "@/components/boutique/BoutiqueStoreProvider";
import { useBoutiqueProductsQuery } from "@/hooks/useBoutiqueStorefront";
import { useStorefront } from "@/components/StorefrontProvider";
import { cn } from "@/lib/utils";

const sortOptions = [
  { value: "newest", label: "Nouveautes" },
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix decroissant" },
  { value: "rating", label: "Mieux notes" },
  { value: "bestseller", label: "Populaires" },
] as const;

export default function BoutiqueCollectionPage() {
  const searchParams = useSearchParams();
  const store = useBoutiqueStore();
  const { data: products = [], isLoading } = useBoutiqueProductsQuery();
  const { formatPrice } = useStorefront();

  const categorySlug = searchParams.get("category");
  const search = searchParams.get("search") || "";
  const promoOnly = searchParams.get("promo") === "true";

  const [selectedCategory, setSelectedCategory] = useState<string | null>(categorySlug);
  const [selectedPriceRange, setSelectedPriceRange] = useState<[number, number] | null>(null);
  const [sortBy, setSortBy] = useState<(typeof sortOptions)[number]["value"]>("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    products.forEach((product) => product.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags).slice(0, 12);
  }, [products]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

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
    const currentCategory = categorySlug || selectedCategory;
    const query = search.trim().toLowerCase();

    if (currentCategory) {
      result = result.filter(
        (product) =>
          product.categoryId === currentCategory ||
          product.categorySlug === currentCategory,
      );
    }

    if (query) {
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
  }, [categorySlug, products, promoOnly, search, selectedCategory, selectedPriceRange, selectedTags, sortBy]);

  const activeFiltersCount =
    (selectedCategory ? 1 : 0) +
    (selectedPriceRange ? 1 : 0) +
    selectedTags.length;

  const pageTitle = search
    ? `Recherche dans ${store.businessName}`
    : categorySlug
      ? PRODUCT_ONTOLOGY.find((category) => category.id === categorySlug)?.name || "Collection"
      : promoOnly
        ? "Promotions de la boutique"
        : "Toute la collection";

  const resetFilters = () => {
    setSelectedCategory(null);
    setSelectedPriceRange(null);
    setSelectedTags([]);
    setSortBy("newest");
  };

  return (
    <div className="min-h-screen bg-[#fbf8f3] pb-20">
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 xl:px-12">
          <p className="text-xs uppercase tracking-[0.28em] text-neutral-400">Boutique collection</p>
          <h1 className="mt-3 text-4xl font-semibold text-neutral-900">{pageTitle}</h1>
          <p className="mt-3 text-neutral-500">
            {filteredProducts.length} produit{filteredProducts.length > 1 ? "s" : ""} dans {store.businessName}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex gap-8">
          <aside className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-28 space-y-8 rounded-[1.75rem] border border-neutral-200 bg-white p-6">
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500">Categories</h3>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(null)}
                    className={cn(
                      "block w-full rounded-2xl px-3 py-2 text-left text-sm transition-colors",
                      !selectedCategory ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-50",
                    )}
                  >
                    Toute la boutique
                  </button>
                  {PRODUCT_ONTOLOGY.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setSelectedCategory(category.id)}
                      className={cn(
                        "block w-full rounded-2xl px-3 py-2 text-left text-sm transition-colors",
                        selectedCategory === category.id
                          ? "bg-neutral-900 text-white"
                          : "text-neutral-600 hover:bg-neutral-50",
                      )}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500">Prix</h3>
                <div className="space-y-2">
                  {priceRanges.map((range) => (
                    <button
                      key={range.label}
                      type="button"
                      onClick={() => setSelectedPriceRange([range.min, range.max])}
                      className={cn(
                        "block w-full rounded-2xl px-3 py-2 text-left text-sm transition-colors",
                        selectedPriceRange?.[0] === range.min
                          ? "bg-neutral-900 text-white"
                          : "text-neutral-600 hover:bg-neutral-50",
                      )}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() =>
                        setSelectedTags((current) =>
                          current.includes(tag)
                            ? current.filter((item) => item !== tag)
                            : [...current, tag],
                        )
                      }
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs transition-colors",
                        selectedTags.includes(tag)
                          ? "border-neutral-900 bg-neutral-900 text-white"
                          : "border-neutral-200 text-neutral-600 hover:border-neutral-300",
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {activeFiltersCount > 0 ? (
                <Button variant="outline" fullWidth onClick={resetFilters}>
                  Reinitialiser
                </Button>
              ) : null}
            </div>
          </aside>

          <div className="flex-1">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-neutral-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowFilters((current) => !current)}
                  className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm lg:hidden"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filtres
                </button>
                <p className="text-sm text-neutral-500">
                  {filteredProducts.length} produit{filteredProducts.length > 1 ? "s" : ""}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
                  className="rounded-full border border-neutral-200 px-4 py-2 text-sm outline-none"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="hidden items-center rounded-full border border-neutral-200 sm:flex">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={cn("rounded-l-full p-2", viewMode === "grid" ? "bg-neutral-900 text-white" : "text-neutral-600")}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={cn("rounded-r-full p-2", viewMode === "list" ? "bg-neutral-900 text-white" : "text-neutral-600")}
                  >
                    <LayoutList className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {showFilters ? (
              <div className="mb-6 space-y-4 rounded-[1.5rem] border border-neutral-200 bg-white p-4 lg:hidden">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500">Filtres boutique</h2>
                  <button type="button" onClick={() => setShowFilters(false)}>
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {PRODUCT_ONTOLOGY.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setSelectedCategory(category.id)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs transition-colors",
                        selectedCategory === category.id
                          ? "border-neutral-900 bg-neutral-900 text-white"
                          : "border-neutral-200 text-neutral-600",
                      )}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {activeFiltersCount > 0 ? (
              <div className="mb-6 flex flex-wrap items-center gap-2">
                <span className="text-sm text-neutral-500">Filtres actifs:</span>
                {selectedCategory ? (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(null)}
                    className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-sm"
                  >
                    {PRODUCT_ONTOLOGY.find((category) => category.id === selectedCategory)?.name || selectedCategory}
                  </button>
                ) : null}
                {selectedPriceRange ? (
                  <button
                    type="button"
                    onClick={() => setSelectedPriceRange(null)}
                    className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-sm"
                  >
                    {formatPrice(selectedPriceRange[0])} - {formatPrice(selectedPriceRange[1])}
                  </button>
                ) : null}
                {selectedTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTags((current) => current.filter((item) => item !== tag))}
                    className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-sm"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            ) : null}

            {isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-96 animate-pulse rounded-[1.85rem] bg-neutral-200" />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div
                className={cn(
                  viewMode === "grid"
                    ? "grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
                    : "space-y-4",
                )}
              >
                {filteredProducts.map((product) => (
                  <BoutiqueProductCard
                    key={product.id}
                    product={product}
                    variant={viewMode === "list" ? "horizontal" : "default"}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-[1.75rem] border border-dashed border-neutral-300 bg-white p-10 text-center">
                <p className="text-lg text-neutral-500">Aucun produit ne correspond a vos criteres.</p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Button onClick={resetFilters}>Reinitialiser les filtres</Button>
                  <Link href={`/boutique/${store.storeSlug}`}>
                    <Button variant="outline">Retour a la boutique</Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
