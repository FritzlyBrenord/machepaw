"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Grid3X3, List } from "lucide-react";
import { PRODUCT_ONTOLOGY } from "@/data/productOntology";
import { BoutiqueProductCard } from "@/components/boutique/BoutiqueProductCard";
import { Button } from "@/components/ui/Button";
import { useBoutiqueStore } from "@/components/boutique/BoutiqueStoreProvider";
import { useBoutiqueProductsQuery } from "@/hooks/useBoutiqueStorefront";
import { cn } from "@/lib/utils";

export default function BoutiqueCategoryPage() {
  const params = useParams();
  const categorySlug = params.category as string;
  const store = useBoutiqueStore();
  const { data: products = [], isLoading } = useBoutiqueProductsQuery();
  const category = PRODUCT_ONTOLOGY.find((item) => item.id === categorySlug);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const categoryProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          product.categoryId === categorySlug || product.categorySlug === categorySlug,
      ),
    [categorySlug, products],
  );

  if (!category) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center">
        <h1 className="text-3xl font-semibold text-neutral-900">Categorie introuvable</h1>
        <p className="mt-4 text-neutral-500">
          Cette categorie n&apos;existe pas pour la boutique {store.businessName}.
        </p>
        <Link href={`/boutique/${store.storeSlug}/collection`} className="mt-6 inline-flex">
          <Button>Voir toute la collection</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf8f3] pb-20">
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 xl:px-12">
          <p className="text-xs uppercase tracking-[0.28em] text-neutral-400">Categorie boutique</p>
          <h1 className="mt-3 text-4xl font-semibold text-neutral-900">{category.name}</h1>
          <p className="mt-3 max-w-2xl text-neutral-500">
            {`Explorez les produits ${category.name} publies par ${store.businessName}.`}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 xl:px-12">
        <div className="mb-6 flex items-center justify-between rounded-[1.5rem] border border-neutral-200 bg-white p-4">
          <p className="text-sm text-neutral-500">
            {categoryProducts.length} produit{categoryProducts.length > 1 ? "s" : ""}
          </p>
          <div className="flex items-center rounded-full border border-neutral-200">
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
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-96 animate-pulse rounded-[1.85rem] bg-neutral-200" />
            ))}
          </div>
        ) : categoryProducts.length > 0 ? (
          <div
            className={cn(
              viewMode === "grid"
                ? "grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
                : "space-y-4",
            )}
          >
            {categoryProducts.map((product) => (
              <BoutiqueProductCard
                key={product.id}
                product={product}
                variant={viewMode === "list" ? "horizontal" : "default"}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[1.75rem] border border-dashed border-neutral-300 bg-white p-10 text-center">
            <p className="text-lg text-neutral-500">Aucun produit dans cette categorie pour le moment.</p>
            <Link href={`/boutique/${store.storeSlug}/collection`} className="mt-6 inline-flex">
              <Button variant="outline">Retour a la collection</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
