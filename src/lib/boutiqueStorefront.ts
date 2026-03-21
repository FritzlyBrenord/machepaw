import { createServerSupabaseClient } from "@/lib/serverSupabase";

export type BoutiqueStoreRecord = {
  id: string;
  userId: string;
  businessName: string;
  storeSlug: string;
  description?: string;
  logo?: string;
  banner?: string;
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
    .select(
      [
        "id",
        "user_id",
        "business_name",
        "store_slug",
        "description",
        "logo",
        "banner",
        "is_verified",
        "rating",
        "review_count",
        "total_sales",
        "products_count",
        "location_name",
        "location_dept",
        "shipping_settings",
        "pickup_address",
        "created_at",
      ].join(", "),
    )
    .eq("store_slug", normalizedSlug)
    .eq("status", "approved")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapSellerRow(data as unknown as SellerStoreRow) : null;
}
