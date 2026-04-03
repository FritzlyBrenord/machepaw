import { createServerSupabaseClient } from "@/lib/serverSupabase";
import { mapSupabaseProductToProduct } from "@/lib/commerce";
import {
  buildStorefrontProductOrderMetrics,
  type StorefrontProductOrderMetric,
} from "@/lib/storefront-section-data";
import type { Product, SupabaseProduct } from "@/data/types";

export type BoutiqueStoreRecord = {
  id: string;
  userId: string;
  businessName: string;
  storeSlug: string;
  categories: string[];
  description?: string;
  logo?: string;
  banner?: string;
  contactPhone?: string;
  contactEmail?: string;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  totalSales: number;
  productsCount: number;
  locationName?: string;
  locationDept?: string;
  shippingSettings?: Record<string, unknown>;
  pickupAddress?: {
    address?: string;
    city?: string;
    country?: string;
    phone?: string;
  };
  createdAt: string;
};

type SellerStoreRow = {
  id: string;
  user_id: string;
  business_name: string;
  store_slug: string;
  categories?: string[] | null;
  description?: string | null;
  logo?: string | null;
  banner?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  is_verified?: boolean | null;
  rating?: number | null;
  review_count?: number | null;
  total_sales?: number | null;
  products_count?: number | null;
  location_name?: string | null;
  location_dept?: string | null;
  shipping_settings?: Record<string, unknown> | null;
  pickup_address?: {
    address?: string;
    city?: string;
    country?: string;
    phone?: string;
  } | null;
  created_at: string;
};

async function fetchSellerCategoryFallback(userId: string) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("seller_applications")
    .select("product_categories,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const categories = data?.product_categories;
  return Array.isArray(categories)
    ? categories.filter((value): value is string => typeof value === "string")
    : [];
}

async function resolveCategoryNames(rawValues: string[]) {
  const normalizedValues = Array.from(
    new Set(
      rawValues
        .map((value) => String(value || "").trim())
        .filter((value) => value.length > 0),
    ),
  );

  if (normalizedValues.length === 0) {
    return [];
  }

  const supabase = createServerSupabaseClient();
  const [byIdResponse, bySlugResponse] = await Promise.all([
    supabase
      .from("categories")
      .select("id,name,slug")
      .in("id", normalizedValues),
    supabase
      .from("categories")
      .select("id,name,slug")
      .in("slug", normalizedValues),
  ]);

  if (byIdResponse.error) {
    throw byIdResponse.error;
  }

  if (bySlugResponse.error) {
    throw bySlugResponse.error;
  }

  const rows = [...(byIdResponse.data || []), ...(bySlugResponse.data || [])];
  const resolvedMap = new Map<string, string>();

  rows.forEach((row) => {
    if (typeof row.id === "string" && typeof row.name === "string") {
      resolvedMap.set(row.id, row.name);
    }
    if (typeof row.slug === "string" && typeof row.name === "string") {
      resolvedMap.set(row.slug, row.name);
    }
    if (typeof row.name === "string") {
      resolvedMap.set(row.name, row.name);
    }
  });

  const seen = new Set<string>();

  return normalizedValues
    .map((value) => resolvedMap.get(value) || value)
    .filter((value) => value.length > 0)
    .filter((value) => {
      const key = value.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
}

async function mapSellerRow(row: SellerStoreRow): Promise<BoutiqueStoreRecord> {
  const categorySource =
    Array.isArray(row.categories) && row.categories.length > 0
      ? row.categories.filter((category): category is string => typeof category === "string")
      : await fetchSellerCategoryFallback(row.user_id);
  const categories = await resolveCategoryNames(categorySource);

  return {
    id: row.id,
    userId: row.user_id,
    businessName: row.business_name,
    storeSlug: row.store_slug,
    categories,
    description: row.description || undefined,
    logo: row.logo || undefined,
    banner: row.banner || undefined,
    contactPhone: row.contact_phone || undefined,
    contactEmail: row.contact_email || undefined,
    isVerified: Boolean(row.is_verified),
    rating: Number(row.rating || 0),
    reviewCount: Number(row.review_count || 0),
    totalSales: Number(row.total_sales || 0),
    productsCount: Number(row.products_count || 0),
    locationName: row.location_name || undefined,
    locationDept: row.location_dept || undefined,
    shippingSettings: row.shipping_settings || undefined,
    pickupAddress: row.pickup_address || undefined,
    createdAt: row.created_at,
  };
}

export async function getApprovedSellerBySlug(
  slug: string,
  allowUnpublished = process.env.NODE_ENV !== "production",
) {
  const normalizedSlug = slug.trim().toLowerCase();

  if (!normalizedSlug) {
    return null;
  }

  const supabase = createServerSupabaseClient();
  let query = supabase.from("sellers").select("*").eq("store_slug", normalizedSlug);

  if (!allowUnpublished) {
    query = query.eq("status", "approved");
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw error;
  }

  return data ? await mapSellerRow(data as unknown as SellerStoreRow) : null;
}

function enrichStoreProduct(
  product: SupabaseProduct,
  store: BoutiqueStoreRecord,
) {
  return {
    ...mapSupabaseProductToProduct(product),
    ownerType: "seller" as const,
    ownerName: store.businessName,
    sellerId: store.id,
    storeSlug: store.storeSlug,
  } satisfies Product;
}

export async function getApprovedSellerProducts(store: BoutiqueStoreRecord) {
  const supabase = createServerSupabaseClient();

  const sellerProductsQuery = supabase
    .from("products")
    .select("*")
    .eq("status", "active")
    .eq("seller_id", store.id)
    .order("is_featured", { ascending: false })
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false });

  const ownerProductsQuery = supabase
    .from("products")
    .select("*")
    .eq("status", "active")
    .eq("owner_type", "seller")
    .eq("owner_id", store.userId)
    .order("is_featured", { ascending: false })
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false });

  const [
    { data: sellerProducts, error: sellerProductsError },
    { data: ownerProducts, error: ownerProductsError },
  ] = await Promise.all([sellerProductsQuery, ownerProductsQuery]);

  if (sellerProductsError) {
    throw sellerProductsError;
  }

  if (ownerProductsError) {
    throw ownerProductsError;
  }

  const mergedProducts = [
    ...((sellerProducts || []) as SupabaseProduct[]),
    ...((ownerProducts || []) as SupabaseProduct[]).filter(
      (product) =>
        !(sellerProducts || []).some((existing) => existing.id === product.id),
    ),
  ];

  return mergedProducts.map((product) => enrichStoreProduct(product, store));
}

type SellerOrderMetricRow = {
  product_id?: string | null;
  quantity?: number | string | null;
  created_at?: string | null;
};

export async function getApprovedSellerProductOrderMetrics(
  store: BoutiqueStoreRecord,
): Promise<Record<string, StorefrontProductOrderMetric>> {
  const supabase = createServerSupabaseClient();

  try {
    const { data, error } = await supabase
      .from("seller_order_items_view")
      .select("product_id,quantity,created_at")
      .eq("seller_id", store.id)
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      throw error;
    }

    return buildStorefrontProductOrderMetrics(
      ((data || []) as SellerOrderMetricRow[]).map((row) => ({
        productId: row.product_id,
        quantity: row.quantity,
        createdAt: row.created_at,
      })),
    );
  } catch (error) {
    console.error("Unable to load storefront order metrics.", error);
    return {};
  }
}
