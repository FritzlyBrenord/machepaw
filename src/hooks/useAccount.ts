"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type {
  Address,
  Seller,
  SellerCurrentPlanStatus,
  SellerKycStatus,
  SellerNotificationSettings,
  SellerPayoutDetails,
  SellerPlan,
  SellerShippingSettings,
  UserRole,
} from "@/data/types";
import { normalizePlanFeatures, normalizePlanLimits } from "@/data/sellerPlans";

const CURRENT_ACCOUNT_QUERY_KEY = ["current-account"];

type UserRow = {
  id: string;
  auth_id?: string | null;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  avatar?: string | null;
  role: UserRole;
  is_blocked?: boolean | null;
};

type SellerRow = {
  id: string;
  user_id: string;
  status: Seller["status"];
  business_name: string;
  store_slug?: string | null;
  business_type: Seller["businessType"];
  has_physical_store: boolean;
  physical_store_address?: Address | null;
  tax_id?: string | null;
  description?: string | null;
  categories?: string[] | null;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  logo?: string | null;
  banner?: string | null;
  storefront_theme_slug?: string | null;
  storefront_theme_config?: Record<string, unknown> | null;
  total_sales?: number | null;
  total_revenue?: number | null;
  rating?: number | null;
  review_count?: number | null;
  products_count?: number | null;
  is_verified?: boolean | null;
  commission_rate?: number | null;
  kyc_status?: SellerKycStatus | null;
  kyc_submitted_at?: string | null;
  kyc_reviewed_at?: string | null;
  kyc_review_notes?: string | null;
  payout_details?: SellerPayoutDetails | null;
  notification_settings?: SellerNotificationSettings | null;
  shipping_settings?: SellerShippingSettings | null;
  pickup_address?: Address | null;
  base_shipping_price?: number | null;
  price_per_km?: number | null;
  location_name?: string | null;
  location_type?: string | null;
  location_dept?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  current_plan_id?: string | null;
  current_plan_status?: SellerCurrentPlanStatus | null;
  current_plan_request_id?: string | null;
  requested_plan_id?: string | null;
  plan_selection_completed?: boolean | null;
  plan_started_at?: string | null;
  plan_expires_at?: string | null;
  plan_payment_method?: Seller["planPaymentMethod"] | null;
  plan_payment_first_name?: string | null;
  plan_payment_last_name?: string | null;
  plan_payment_reference?: string | null;
  plan_payment_proof_url?: string | null;
  plan_reviewed_at?: string | null;
  plan_updated_at?: string | null;
  created_at: string;
  updated_at: string;
};

type SellerPlanRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number | string;
  promo_price?: number | string | null;
  currency_code: SellerPlan["currencyCode"];
  billing_interval: SellerPlan["billingInterval"];
  is_active?: boolean | null;
  is_featured?: boolean | null;
  sort_order?: number | null;
  features?: unknown;
  limits?: unknown;
  created_at: string;
  updated_at: string;
};

export type CurrentAccount = {
  userId: string;
  authId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  isBlocked: boolean;
  seller: Seller | null;
};

const defaultNotificationSettings: SellerNotificationSettings = {
  newOrders: true,
  newMessages: true,
  productReviews: true,
  promotions: false,
  newsletter: true,
};

const defaultShippingSettings: SellerShippingSettings = {
  freeShipping: false,
  allowDelivery: false,
  allowPickup: false,
};

function asAddress(value: unknown): Address | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  return value as Address;
}

function mapSellerPlanRow(row: SellerPlanRow): SellerPlan {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    price: Number(row.price || 0),
    promoPrice:
      row.promo_price === null || row.promo_price === undefined
        ? undefined
        : Number(row.promo_price || 0),
    currencyCode: row.currency_code,
    billingInterval: row.billing_interval,
    isActive: Boolean(row.is_active ?? true),
    isFeatured: Boolean(row.is_featured),
    sortOrder: Number(row.sort_order || 0),
    features: normalizePlanFeatures(row.features),
    limits: normalizePlanLimits(row.limits),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function fetchSellerPlansMap(planIds: string[]) {
  if (!planIds.length) {
    return {} as Record<string, SellerPlan>;
  }

  const { data, error } = await supabase
    .from("seller_plans")
    .select("*")
    .in("id", planIds);

  if (error) {
    throw error;
  }

  return ((data || []) as SellerPlanRow[]).reduce<Record<string, SellerPlan>>(
    (accumulator, row) => {
      accumulator[row.id] = mapSellerPlanRow(row);
      return accumulator;
    },
    {},
  );
}

function mapSellerRow(row: SellerRow, planMap: Record<string, SellerPlan>): Seller {
  const mergedShippingSettings: SellerShippingSettings = {
    ...defaultShippingSettings,
    ...(row.shipping_settings || {}),
    basePrice:
      row.shipping_settings?.basePrice ?? Number(row.base_shipping_price || 0),
    pricePerKm:
      row.shipping_settings?.pricePerKm ?? Number(row.price_per_km || 0),
    locationName: row.shipping_settings?.locationName || row.location_name || undefined,
    locationType: row.shipping_settings?.locationType || row.location_type || undefined,
    locationDept: row.shipping_settings?.locationDept || row.location_dept || undefined,
    latitude:
      (row.shipping_settings?.latitude ?? Number(row.latitude ?? 0)) || undefined,
    longitude:
      (row.shipping_settings?.longitude ?? Number(row.longitude ?? 0)) || undefined,
    allowDelivery:
      row.shipping_settings?.allowDelivery ??
      Boolean(row.shipping_settings?.locationName || row.location_name),
    allowPickup:
      row.shipping_settings?.allowPickup ??
      Boolean(row.pickup_address),
  };

  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    businessName: row.business_name,
    storeSlug: row.store_slug || undefined,
    businessType: row.business_type,
    hasPhysicalStore: row.has_physical_store,
    physicalStoreAddress: asAddress(row.physical_store_address),
    taxId: row.tax_id || undefined,
    description: row.description || "",
    categories: row.categories || [],
    contactPerson: row.contact_person,
    contactPhone: row.contact_phone,
    contactEmail: row.contact_email,
    logo: row.logo || undefined,
    banner: row.banner || undefined,
    storefrontThemeSlug: row.storefront_theme_slug || undefined,
    storefrontThemeConfig: row.storefront_theme_config || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    products: [],
    totalSales: Number(row.total_sales || 0),
    totalRevenue: Number(row.total_revenue || 0),
    rating: Number(row.rating || 0),
    reviewCount: Number(row.review_count || 0),
    isVerified: Boolean(row.is_verified),
    commissionRate: Number(row.commission_rate || 0),
    kycStatus: row.kyc_status || "not_submitted",
    kycSubmittedAt: row.kyc_submitted_at || undefined,
    kycReviewedAt: row.kyc_reviewed_at || undefined,
    kycReviewNotes: row.kyc_review_notes || undefined,
    notificationSettings: row.notification_settings || defaultNotificationSettings,
    shippingSettings: mergedShippingSettings,
    payoutDetails: row.payout_details || undefined,
    pickupAddress: asAddress(row.pickup_address),
    currentPlanId: row.current_plan_id || undefined,
    currentPlanStatus: row.current_plan_status || "none",
    currentPlanRequestId: row.current_plan_request_id || undefined,
    requestedPlanId: row.requested_plan_id || undefined,
    planSelectionCompleted: Boolean(row.plan_selection_completed),
    planStartedAt: row.plan_started_at || undefined,
    planExpiresAt: row.plan_expires_at || undefined,
    planPaymentMethod: row.plan_payment_method || undefined,
    planPaymentFirstName: row.plan_payment_first_name || undefined,
    planPaymentLastName: row.plan_payment_last_name || undefined,
    planPaymentReference: row.plan_payment_reference || undefined,
    planPaymentProofUrl: row.plan_payment_proof_url || undefined,
    planReviewedAt: row.plan_reviewed_at || undefined,
    planUpdatedAt: row.plan_updated_at || undefined,
    currentPlan: row.current_plan_id ? planMap[row.current_plan_id] || undefined : undefined,
    requestedPlan: row.requested_plan_id
      ? planMap[row.requested_plan_id] || undefined
      : undefined,
  };
}

async function resolveSellerRow(row: SellerRow) {
  const planIds = Array.from(
    new Set([row.current_plan_id, row.requested_plan_id].filter(Boolean) as string[]),
  );
  const planMap = await fetchSellerPlansMap(planIds);
  return mapSellerRow(row, planMap);
}

export async function fetchCurrentAccount(): Promise<CurrentAccount | null> {
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw authError;
  }

  if (!authUser) {
    return null;
  }

  const { data: userRow, error: userError } = await supabase
    .from("users")
    .select("*")
    .or(`id.eq.${authUser.id},auth_id.eq.${authUser.id}`)
    .maybeSingle();

  if (userError) {
    throw userError;
  }

  if (!userRow) {
    const { data: sellerRow, error: sellerError } = await supabase
      .from("sellers")
      .select("*")
      .eq("user_id", authUser.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (sellerError) {
      throw sellerError;
    }

    if (authUser.user_metadata?.role === "admin") {
      return {
        userId: authUser.id,
        authId: authUser.id,
        email: authUser.email || "",
        firstName: authUser.user_metadata?.first_name || "",
        lastName: authUser.user_metadata?.last_name || "",
        phone: authUser.user_metadata?.phone || undefined,
        avatar: authUser.user_metadata?.avatar_url || undefined,
        role: "admin",
        isBlocked: false,
        seller: null,
      };
    }

    if (sellerRow) {
      return {
        userId: authUser.id,
        authId: authUser.id,
        email: authUser.email || "",
        firstName: authUser.user_metadata?.first_name || "",
        lastName: authUser.user_metadata?.last_name || "",
        phone: authUser.user_metadata?.phone || undefined,
        avatar: authUser.user_metadata?.avatar_url || undefined,
        role: "seller" as UserRole,
        isBlocked: false,
        seller: await resolveSellerRow(sellerRow as SellerRow),
      };
    }

    return {
      userId: authUser.id,
      authId: authUser.id,
      email: authUser.email || "",
      firstName: authUser.user_metadata?.first_name || "",
      lastName: authUser.user_metadata?.last_name || "",
      phone: authUser.user_metadata?.phone || undefined,
      avatar: authUser.user_metadata?.avatar_url || undefined,
      role: (authUser.user_metadata?.role === "admin" ? "admin" : "customer") as UserRole,
      isBlocked: false,
      seller: null,
    };
  }

  const resolvedUserRow = userRow as UserRow;

  const { data: sellerRow, error: sellerError } = await supabase
    .from("sellers")
    .select("*")
    .eq("user_id", resolvedUserRow.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (sellerError) {
    throw sellerError;
  }

  const resolvedRole =
    resolvedUserRow.role === "admin"
      ? "admin"
      : sellerRow
        ? "seller"
        : resolvedUserRow.role;

  return {
    userId: resolvedUserRow.id,
    authId: resolvedUserRow.auth_id || authUser.id,
    email: resolvedUserRow.email,
    firstName: resolvedUserRow.first_name,
    lastName: resolvedUserRow.last_name,
    phone: resolvedUserRow.phone || undefined,
    avatar: resolvedUserRow.avatar || undefined,
    role: (authUser.user_metadata?.role === "admin" ? "admin" : resolvedRole) as UserRole,
    isBlocked: Boolean(resolvedUserRow.is_blocked),
    seller: sellerRow ? await resolveSellerRow(sellerRow as SellerRow) : null,
  };
}

export function useCurrentAccountQuery() {
  return useQuery({
    queryKey: CURRENT_ACCOUNT_QUERY_KEY,
    queryFn: fetchCurrentAccount,
  });
}

type UpdateAccountProfileInput = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
};

export function useUpdateAccountProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateAccountProfileInput) => {
      const account = await fetchCurrentAccount();

      if (!account) {
        throw new Error("Authentication required");
      }

      const updates = {
        ...(input.firstName !== undefined ? { first_name: input.firstName } : {}),
        ...(input.lastName !== undefined ? { last_name: input.lastName } : {}),
        ...(input.phone !== undefined ? { phone: input.phone } : {}),
        ...(input.avatar !== undefined ? { avatar: input.avatar } : {}),
        updated_at: new Date().toISOString(),
      };

      const { error: dbError } = await supabase
        .from("users")
        .update(updates)
        .eq("id", account.userId);

      if (dbError) {
        throw dbError;
      }

      const { error: authError } = await supabase.auth.updateUser({
        data: {
          ...(input.firstName !== undefined ? { first_name: input.firstName } : {}),
          ...(input.lastName !== undefined ? { last_name: input.lastName } : {}),
          ...(input.phone !== undefined ? { phone: input.phone } : {}),
          ...(input.avatar !== undefined ? { avatar_url: input.avatar } : {}),
        },
      });

      if (authError) {
        throw authError;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: CURRENT_ACCOUNT_QUERY_KEY });
    },
  });
}

type UpdateSellerProfileInput = {
  businessName?: string;
  storeSlug?: string;
  description?: string;
  logo?: string | null;
  banner?: string | null;
  storefrontThemeSlug?: string | null;
  storefrontThemeConfig?: Record<string, unknown> | null;
  contactEmail?: string;
  contactPhone?: string;
  contactPerson?: string;
  notificationSettings?: SellerNotificationSettings;
  shippingSettings?: SellerShippingSettings;
  payoutDetails?: SellerPayoutDetails;
  pickupAddress?: Address | null;
};

export function useUpdateSellerProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateSellerProfileInput) => {
      const account = await fetchCurrentAccount();

      if (!account?.seller) {
        throw new Error("Seller account required");
      }

      const payload = {
        ...(input.businessName !== undefined ? { business_name: input.businessName } : {}),
        ...(input.storeSlug !== undefined ? { store_slug: input.storeSlug || null } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.logo !== undefined ? { logo: input.logo } : {}),
        ...(input.banner !== undefined ? { banner: input.banner } : {}),
        ...(input.storefrontThemeSlug !== undefined
          ? { storefront_theme_slug: input.storefrontThemeSlug }
          : {}),
        ...(input.storefrontThemeConfig !== undefined
          ? { storefront_theme_config: input.storefrontThemeConfig }
          : {}),
        ...(input.contactEmail !== undefined ? { contact_email: input.contactEmail } : {}),
        ...(input.contactPhone !== undefined ? { contact_phone: input.contactPhone } : {}),
        ...(input.contactPerson !== undefined ? { contact_person: input.contactPerson } : {}),
        ...(input.notificationSettings !== undefined
          ? { notification_settings: input.notificationSettings }
          : {}),
        ...(input.shippingSettings !== undefined
          ? {
              shipping_settings: input.shippingSettings,
              base_shipping_price: input.shippingSettings.basePrice ?? 0,
              price_per_km: input.shippingSettings.pricePerKm ?? 0,
              location_name: input.shippingSettings.locationName ?? null,
              location_type: input.shippingSettings.locationType ?? null,
              location_dept: input.shippingSettings.locationDept ?? null,
              latitude: input.shippingSettings.latitude ?? null,
              longitude: input.shippingSettings.longitude ?? null,
            }
          : {}),
        ...(input.payoutDetails !== undefined ? { payout_details: input.payoutDetails } : {}),
        ...(input.pickupAddress !== undefined ? { pickup_address: input.pickupAddress } : {}),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("sellers")
        .update(payload)
        .eq("id", account.seller.id);

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: CURRENT_ACCOUNT_QUERY_KEY });
    },
  });
}

export { CURRENT_ACCOUNT_QUERY_KEY };
