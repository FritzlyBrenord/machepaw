"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { ProductCard } from "./ui/ProductCard";
import { useFeaturedProductsQuery } from "@/hooks/useStorefront";

interface ProductRecommendationsProps {
  title?: string;
  subtitle?: string;
  limit?: number;
}

export function ProductRecommendations({
  title = "Vous pourriez aussi aimer",
  subtitle = "Découvrez nos produits les plus populaires",
  limit = 4
}: ProductRecommendationsProps) {
  const { data: products = [], isLoading } = useFeaturedProductsQuery();

  if (isLoading) {
    return (
      <div className="py-12 border-t border-neutral-100 mt-12">
        <div className="h-8 w-64 bg-neutral-100 animate-pulse rounded mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-neutral-100 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  // Slice to limit
  const displayProducts = products.slice(0, limit);

  return (
    <div className="py-12 border-t border-neutral-100 mt-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs uppercase tracking-widest font-bold text-amber-600">Recommandations</span>
          </div>
          <h2 className="text-2xl font-light text-neutral-900">{title}</h2>
          <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-4 sm:gap-x-6">
        {displayProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
