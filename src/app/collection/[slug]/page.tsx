"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Filter, ChevronDown, Grid3X3, List, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/ui/ProductCard";
import { Button } from "@/components/ui/Button";
import { PRODUCT_ONTOLOGY } from "@/data/productOntology";
import { useStorefrontProductsQuery } from "@/hooks/useStorefront";
import { useFilters } from "@/store";

const sortOptions = [
  { value: "newest", label: "Plus récents" },
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
  { value: "rating", label: "Mieux notés" },
  { value: "bestseller", label: "Best-sellers" },
];

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const category = PRODUCT_ONTOLOGY.find((item) => item.id === slug);
  const { data: products = [] } = useStorefrontProductsQuery();
  const { sortBy, setSortBy, selectedPriceRange, setPriceRange, resetFilters } =
    useFilters();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const categoryProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          product.categoryId === category?.id || product.categorySlug === category?.id,
      ),
    [category?.id, products],
  );

  const sortedProducts = useMemo(() => {
    const result = selectedPriceRange
      ? categoryProducts.filter(
          (product) =>
            product.price >= selectedPriceRange[0] &&
            product.price <= selectedPriceRange[1],
        )
      : [...categoryProducts];

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
  }, [categoryProducts, selectedPriceRange, sortBy]);

  const maxPrice = Math.max(...categoryProducts.map((product) => product.price), 0);
  const priceRanges = [
    { label: "Tous les prix", value: null as [number, number] | null },
    { label: "Moins de 5 000", value: [0, 5000] as [number, number] },
    { label: "5 000 - 20 000", value: [5000, 20000] as [number, number] },
    {
      label: "Plus de 20 000",
      value: [20000, Math.max(maxPrice, 20000)] as [number, number],
    },
  ];

  if (!category) {
    return (
      <div className="min-h-screen pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-light text-neutral-900 mb-4">
            Catégorie non trouvée
          </h1>
          <p className="text-neutral-500 mb-8">
            La catégorie que vous recherchez n&apos;existe pas.
          </p>
          <Link href="/collection">
            <Button>Voir toute la collection</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="bg-neutral-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <span className="text-amber-400 text-sm uppercase tracking-[0.3em] mb-4 block">
              Collection
            </span>
            <h1 className="text-4xl md:text-5xl font-light mb-4">
              {category.name}
            </h1>
            <p className="text-white/70">
              Découvrez tous les produits publiés dans cette catégorie.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-28 space-y-8">
              <div>
                <h3 className="font-medium text-neutral-900 mb-4 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  Fourchette de prix
                </h3>
                <div className="space-y-2">
                  {priceRanges.map((range) => (
                    <button
                      key={range.label}
                      onClick={() => setPriceRange(range.value)}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                        selectedPriceRange?.[0] === range.value?.[0] ||
                        (!selectedPriceRange && !range.value)
                          ? "bg-neutral-900 text-white"
                          : "hover:bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="flex items-center gap-2 px-4 py-2 border border-neutral-200 text-sm"
            >
              <Filter className="w-4 h-4" />
              Filtres
            </button>
          </div>

          {isMobileFilterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="lg:hidden overflow-hidden"
            >
              <div className="py-4 border-b border-neutral-200">
                <h3 className="font-medium text-neutral-900 mb-4">
                  Fourchette de prix
                </h3>
                <div className="flex flex-wrap gap-2">
                  {priceRanges.map((range) => (
                    <button
                      key={range.label}
                      onClick={() => setPriceRange(range.value)}
                      className={`px-3 py-1 text-sm border transition-colors ${
                        selectedPriceRange?.[0] === range.value?.[0] ||
                        (!selectedPriceRange && !range.value)
                          ? "bg-neutral-900 text-white border-neutral-900"
                          : "border-neutral-200 text-neutral-600"
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-neutral-200">
              <p className="text-sm text-neutral-500">
                {sortedProducts.length} produit{sortedProducts.length > 1 ? "s" : ""}
              </p>

              <div className="flex items-center gap-4">
                <div className="relative group">
                  <button className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900">
                    Trier par
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-lg border border-neutral-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSortBy(option.value as typeof sortBy)}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          sortBy === option.value
                            ? "bg-neutral-50 text-neutral-900 font-medium"
                            : "text-neutral-600 hover:bg-neutral-50"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="hidden sm:flex items-center border border-neutral-200">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 ${viewMode === "grid" ? "bg-neutral-100" : ""}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 ${viewMode === "list" ? "bg-neutral-100" : ""}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div
              className={`grid gap-6 ${
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                  : "grid-cols-1"
              }`}
            >
              {sortedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ProductCard
                    product={product}
                    variant={viewMode === "list" ? "horizontal" : "default"}
                  />
                </motion.div>
              ))}
            </div>

            {sortedProducts.length === 0 && (
              <div className="text-center py-16">
                <p className="text-neutral-500 mb-4">
                  Aucun produit trouvé dans cette catégorie.
                </p>
                <Button onClick={resetFilters} variant="outline">
                  Réinitialiser les filtres
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
