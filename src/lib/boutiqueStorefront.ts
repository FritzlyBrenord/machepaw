import { createServerSupabaseClient } from "@/lib/serverSupabase";

export type BoutiqueStoreRecord = {
  id: string;
  userId: string;
  businessName: string;
  storeSlug: string;
  description?: string;
  logo?: string;
  banner?: string;
  storefrontThemeSlug?: string;
  storefrontThemeConfig?: Record<string, unknown>;
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
  description?: string | null;
  logo?: string | null;
  banner?: string | null;
  storefront_theme_slug?: string | null;
  storefront_theme_config?: Record<string, unknown> | null;
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

function mapSellerRow(row: SellerStoreRow): BoutiqueStoreRecord {
  return {
    id: row.id,
    userId: row.user_id,
    businessName: row.business_name,
    storeSlug: row.store_slug,
    description: row.description || undefined,
    logo: row.logo || undefined,
    banner: row.banner || undefined,
    storefrontThemeSlug: row.storefront_theme_slug || undefined,
    storefrontThemeConfig: row.storefront_theme_config || undefined,
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

export async function getApprovedSellerBySlug(slug: string) {
  const normalizedSlug = slug.trim().toLowerCase();

  if (!normalizedSlug) {
    return null;
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("sellers")
    .select("*")
    .eq("store_slug", normalizedSlug)
    .eq("status", "approved")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapSellerRow(data as unknown as SellerStoreRow) : null;
}
