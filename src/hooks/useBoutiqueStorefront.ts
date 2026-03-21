"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { mapSupabaseProductToProduct } from "@/lib/storefront";
import { useBoutiqueStore } from "@/components/boutique/BoutiqueStoreProvider";
import type { Product, SupabaseProduct } from "@/data/types";
import type { SellerPaymentMethodView } from "@/data/paymentMethods";
import type { Announcement } from "@/hooks/useAnnouncements";
import type { FlashSale } from "@/hooks/usePromotions";

function enrichBoutiqueProduct(product: SupabaseProduct, store: ReturnType<typeof useBoutiqueStore>) {
  return {
    ...mapSupabaseProductToProduct(product),
    ownerType: "seller" as const,
    ownerName: store.businessName,
    sellerId: store.id,
    storeSlug: store.storeSlug,
  } satisfies Product;
}

export function useBoutiqueProductsQuery() {
  const store = useBoutiqueStore();

  return useQuery({
    queryKey: ["boutique-products", store.id, store.storeSlug],
    queryFn: async () => {
      const baseQuery = supabase
        .from("products")
        .select("*")
        .eq("status", "active")
        .order("is_featured", { ascending: false })
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });

      const [{ data: sellerProducts, error: sellerProductsError }, { data: ownerProducts, error: ownerProductsError }] =
        await Promise.all([
          baseQuery.eq("seller_id", store.id),
          supabase
            .from("products")
            .select("*")
            .eq("status", "active")
            .eq("owner_type", "seller")
            .eq("owner_id", store.userId)
            .order("is_featured", { ascending: false })
            .order("priority", { ascending: false })
            .order("created_at", { ascending: false }),
        ]);

      if (sellerProductsError) {
        throw sellerProductsError;
      }

      if (ownerProductsError) {
        throw ownerProductsError;
      }

      const mergedProducts = [
        ...((sellerProducts || []) as SupabaseProduct[]),
        ...((ownerProducts || []) as SupabaseProduct[]).filter(
          (product) => !(sellerProducts || []).some((existing) => existing.id === product.id),
        ),
      ];

      return mergedProducts.map((product) =>
        enrichBoutiqueProduct(product, store),
      );
    },
  });
}

export function useBoutiqueProductQuery(productId: string) {
  const store = useBoutiqueStore();

  return useQuery({
    queryKey: ["boutique-product", store.id, store.storeSlug, productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .eq("seller_id", store.id)
        .eq("status", "active")
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        return enrichBoutiqueProduct(data as SupabaseProduct, store);
      }

      const { data: fallbackData, error: fallbackError } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .eq("owner_type", "seller")
        .eq("owner_id", store.userId)
        .eq("status", "active")
        .maybeSingle();

      if (fallbackError) {
        throw fallbackError;
      }

      return fallbackData ? enrichBoutiqueProduct(fallbackData as SupabaseProduct, store) : null;
    },
    enabled: !!productId,
  });
}

export function useBoutiqueAnnouncementsQuery(placement?: Announcement["placement"]) {
  const store = useBoutiqueStore();

  return useQuery({
    queryKey: ["boutique-announcements", store.userId, placement],
    queryFn: async () => {
      const now = new Date().toISOString();
      let query = supabase
        .from("announcements")
        .select("*")
        .eq("created_by", store.userId)
        .eq("is_active", true)
        .lte("starts_at", now)
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });

      if (placement) {
        query = query.eq("placement", placement);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return ((data || []) as Announcement[]).filter(
        (announcement) =>
          !announcement.ends_at || new Date(announcement.ends_at) > new Date(),
      );
    },
  });
}

export function useBoutiqueFlashSalesQuery() {
  const { data: products = [] } = useBoutiqueProductsQuery();
  const productIds = products.map((product) => product.id);

  return useQuery({
    queryKey: ["boutique-flash-sales", productIds],
    queryFn: async () => {
      if (productIds.length === 0) {
        return [];
      }

      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("flash_sales")
        .select("*, products!inner(id, name, images, sku, seller_id, owner_type)")
        .eq("status", "active")
        .lte("starts_at", now)
        .gt("ends_at", now)
        .in("product_id", productIds)
        .order("ends_at", { ascending: true });

      if (error) {
        throw error;
      }

      return (data || []) as unknown as FlashSale[];
    },
    enabled: productIds.length > 0,
  });
}

export function useBoutiquePaymentMethodsQuery() {
  const store = useBoutiqueStore();

  return useQuery({
    queryKey: ["boutique-payment-methods", store.storeSlug],
    queryFn: async () => {
      const response = await fetch(`/api/boutique/${store.storeSlug}/payment-methods`, {
        credentials: "include",
        cache: "no-store",
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof payload?.error === "string"
            ? payload.error
            : "Impossible de charger les moyens de paiement de la boutique.",
        );
      }

      return ((payload?.methods || []) as SellerPaymentMethodView[]).filter(Boolean);
    },
    enabled: Boolean(store.storeSlug),
    staleTime: 0,
    refetchOnMount: "always",
  });
}
