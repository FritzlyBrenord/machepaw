"use client";

import { useQuery } from "@tanstack/react-query";
import type { Product } from "@/data/types";
import { supabase } from "@/lib/supabase";
import { mapSupabaseProductToProduct } from "@/lib/commerce";

const CATALOG_PRODUCTS_QUERY_KEY = ["catalog-products"];

export function useCatalogProductsQuery() {
  return useQuery({
    queryKey: CATALOG_PRODUCTS_QUERY_KEY,
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

export function useCatalogProductQuery(productId: string) {
  return useQuery({
    queryKey: [...CATALOG_PRODUCTS_QUERY_KEY, productId],
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

export function useFeaturedCatalogProductsQuery(limit = 8) {
  return useQuery({
    queryKey: ["catalog-featured", limit],
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

export function useNewestCatalogProductsQuery(limit = 10) {
  return useQuery({
    queryKey: ["catalog-newest", limit],
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

export function usePopularCatalogProductsQuery(limit = 10) {
  return useQuery({
    queryKey: ["catalog-popular", limit],
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

export function useTrendingCatalogProductsQuery(limit = 10) {
  return useQuery({
    queryKey: ["catalog-trending", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trending_products")
        .select("*")
        .limit(limit);

      if (error) {
        const { data: fallback, error: fallbackError } = await supabase
          .from("products")
          .select("*")
          .eq("status", "active")
          .order("views", { ascending: false })
          .order("sales", { ascending: false })
          .limit(limit);

        if (fallbackError) {
          return [];
        }

        return (fallback || []).map(mapSupabaseProductToProduct) as Product[];
      }

      return (data || []).map(mapSupabaseProductToProduct) as Product[];
    },
  });
}

export function useCategoryCatalogProductsQuery(categoryId: string, limit = 10) {
  return useQuery({
    queryKey: ["catalog-category", categoryId, limit],
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

export async function logCatalogProductView(productId: string) {
  try {
    let sessionId = localStorage.getItem("__pv_session");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem("__pv_session", sessionId);
    }
    await supabase
      .from("product_views")
      .insert({ product_id: productId, session_id: sessionId });
  } catch {
    return;
  }
}
