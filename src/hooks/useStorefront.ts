"use client";

import { useQuery } from "@tanstack/react-query";
import type { Product } from "@/data/types";
import { supabase } from "@/lib/supabase";
import { mapSupabaseProductToProduct } from "@/lib/storefront";

const STOREFRONT_PRODUCTS_QUERY_KEY = ["storefront-products"];

// ─── All active products ───────────────────────────────────────────────────
export function useStorefrontProductsQuery() {
  return useQuery({
    queryKey: STOREFRONT_PRODUCTS_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("status", "active")
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map(mapSupabaseProductToProduct) as Product[];
    },
  });
}

// ─── Single product ────────────────────────────────────────────────────────
export function useStorefrontProductQuery(productId: string) {
  return useQuery({
    queryKey: [...STOREFRONT_PRODUCTS_QUERY_KEY, productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .eq("status", "active")
        .single();

      if (error) throw error;
      return mapSupabaseProductToProduct(data);
    },
    enabled: !!productId,
  });
}

// ─── Featured products (is_featured = true) ────────────────────────────────
export function useFeaturedProductsQuery(limit = 8) {
  return useQuery({
    queryKey: ["storefront-featured", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("status", "active")
        .eq("is_featured", true)
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []).map(mapSupabaseProductToProduct) as Product[];
    },
  });
}

// ─── Newest products (by created_at) ──────────────────────────────────────
export function useNewestProductsQuery(limit = 10) {
  return useQuery({
    queryKey: ["storefront-newest", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []).map(mapSupabaseProductToProduct) as Product[];
    },
  });
}

// ─── Popular products (by sales then rating) ──────────────────────────────
export function usePopularProductsQuery(limit = 10) {
  return useQuery({
    queryKey: ["storefront-popular", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("status", "active")
        .order("sales", { ascending: false })
        .order("rating", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []).map(mapSupabaseProductToProduct) as Product[];
    },
  });
}

// ─── Trending products (most views last 7 days via product_views table) ───
export function useTrendingProductsQuery(limit = 10) {
  return useQuery({
    queryKey: ["storefront-trending", limit],
    queryFn: async () => {
      // Try the trending_products view (needs add-product-analytics.sql run)
      // Fallback to popular if view doesn't exist yet
      const { data, error } = await supabase
        .from("trending_products")
        .select("*")
        .limit(limit);

      if (error) {
        // Fallback: use existing views column on products
        const { data: fallback, error: fe } = await supabase
          .from("products")
          .select("*")
          .eq("status", "active")
          .order("views", { ascending: false })
          .order("sales", { ascending: false })
          .limit(limit);
        if (fe) return [];
        return (fallback || []).map(mapSupabaseProductToProduct) as Product[];
      }

      return (data || []).map(mapSupabaseProductToProduct) as Product[];
    },
  });
}

// ─── Products by category ─────────────────────────────────────────────────
export function useCategoryProductsQuery(categoryId: string, limit = 10) {
  return useQuery({
    queryKey: ["storefront-category", categoryId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("status", "active")
        .eq("category_id", categoryId)
        .order("priority", { ascending: false })
        .order("sales", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []).map(mapSupabaseProductToProduct) as Product[];
    },
    enabled: !!categoryId,
  });
}

// ─── Log a product view ───────────────────────────────────────────────────
export async function logProductView(productId: string) {
  try {
    // Get or create a session ID from localStorage
    let sessionId = localStorage.getItem("__pv_session");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem("__pv_session", sessionId);
    }
    await supabase
      .from("product_views")
      .insert({ product_id: productId, session_id: sessionId });
  } catch (_) {
    // Silent fail — analytics shouldn't break anything
  }
}
