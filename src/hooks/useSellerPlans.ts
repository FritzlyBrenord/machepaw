"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { CURRENT_ACCOUNT_QUERY_KEY, fetchCurrentAccount, useCurrentAccountQuery } from "@/hooks/useAccount";
import { normalizePlanFeatures, normalizePlanLimits } from "@/data/sellerPlans";
import type {
  SellerPlan,
  SellerPlanRequest,
  SellerPlanRequestStatus,
} from "@/data/types";

const SELLER_PLANS_QUERY_KEY = ["seller-plans"];
const SELLER_PLAN_REQUESTS_QUERY_KEY = ["seller-plan-requests"];
const ADMIN_SELLER_PLANS_QUERY_KEY = ["admin-seller-plans"];
const ADMIN_SELLER_PLAN_REQUESTS_QUERY_KEY = ["admin-seller-plan-requests"];

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

type SellerPlanRequestRow = {
  id: string;
  seller_id: string;
  plan_id: string;
  status: SellerPlanRequestStatus;
  payment_method?: SellerPlanRequest["paymentMethod"] | null;
  payment_first_name?: string | null;
  payment_last_name?: string | null;
  payment_reference?: string | null;
  payment_proof_url?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
};

type SellerIdentityRow = {
  id: string;
  user_id: string;
  business_name: string;
  contact_email?: string | null;
};

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

function getPaymentProofUrl(path?: string | null) {
  if (!path) {
    return undefined;
  }

  if (path.startsWith("http")) {
    return path;
  }

  return supabase.storage.from("payment-proofs").getPublicUrl(path).data.publicUrl;
}

async function fetchPlansMap(planIds: string[]) {
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

function mapPlanRequestRow(
  row: SellerPlanRequestRow,
  planMap: Record<string, SellerPlan>,
  sellerMap?: Record<string, SellerIdentityRow>,
): SellerPlanRequest {
  const seller = sellerMap?.[row.seller_id];

  return {
    id: row.id,
    sellerId: row.seller_id,
    planId: row.plan_id,
    status: row.status,
    paymentMethod: row.payment_method || undefined,
    paymentFirstName: row.payment_first_name || undefined,
    paymentLastName: row.payment_last_name || undefined,
    paymentReference: row.payment_reference || undefined,
    paymentProofUrl: getPaymentProofUrl(row.payment_proof_url),
    reviewedBy: row.reviewed_by || undefined,
    reviewedAt: row.reviewed_at || undefined,
    rejectionReason: row.rejection_reason || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    plan: planMap[row.plan_id],
    sellerBusinessName: seller?.business_name,
    sellerUserId: seller?.user_id,
    sellerContactEmail: seller?.contact_email || undefined,
  };
}

export function useSellerPlansQuery() {
  return useQuery({
    queryKey: SELLER_PLANS_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seller_plans")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) {
        throw error;
      }

      return ((data || []) as SellerPlanRow[]).map(mapSellerPlanRow);
    },
  });
}

export function useSellerPlanRequestsQuery() {
  const { data: account } = useCurrentAccountQuery();
  const sellerId = account?.seller?.id;

  return useQuery({
    queryKey: [...SELLER_PLAN_REQUESTS_QUERY_KEY, sellerId],
    enabled: Boolean(sellerId),
    queryFn: async () => {
      if (!sellerId) {
        return [];
      }

      const { data, error } = await supabase
        .from("seller_plan_requests")
        .select("*")
        .eq("seller_id", sellerId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      const rows = (data || []) as SellerPlanRequestRow[];
      const planMap = await fetchPlansMap(
        Array.from(new Set(rows.map((row) => row.plan_id).filter(Boolean))),
      );

      return rows.map((row) => mapPlanRequestRow(row, planMap));
    },
  });
}

type CreateSellerPlanRequestInput = {
  planId: string;
  paymentMethod?: SellerPlanRequest["paymentMethod"];
  paymentFirstName?: string;
  paymentLastName?: string;
  paymentReference?: string;
  paymentProofFile?: File | null;
};

export function useCreateSellerPlanRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateSellerPlanRequestInput) => {
      const account = await fetchCurrentAccount();

      if (!account?.seller || account.seller.status !== "approved") {
        throw new Error("Compte vendeur approuve requis.");
      }

      const { data: existingRequest, error: existingRequestError } = await supabase
        .from("seller_plan_requests")
        .select("id,status")
        .eq("seller_id", account.seller.id)
        .in("status", ["pending_review", "draft"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingRequestError) {
        throw existingRequestError;
      }

      if (existingRequest) {
        throw new Error("Une demande de plan est deja en attente de verification.");
      }

      const { data: planRow, error: planError } = await supabase
        .from("seller_plans")
        .select("*")
        .eq("id", input.planId)
        .single();

      if (planError) {
        throw planError;
      }

      const plan = mapSellerPlanRow(planRow as SellerPlanRow);
      const effectivePrice = Number(plan.promoPrice ?? plan.price ?? 0);
      let paymentProofPath: string | null = null;

      if (effectivePrice > 0) {
        if (!input.paymentProofFile) {
          throw new Error("La capture du paiement est obligatoire pour un plan payant.");
        }

        const safeName = input.paymentProofFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        const paymentPath = `seller-plan-payments/${account.seller.id}/${Date.now()}-${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from("payment-proofs")
          .upload(paymentPath, input.paymentProofFile, {
            upsert: true,
          });

        if (uploadError) {
          throw uploadError;
        }

        paymentProofPath = paymentPath;
      }

      const { data, error } = await supabase
        .from("seller_plan_requests")
        .insert({
          seller_id: account.seller.id,
          plan_id: input.planId,
          payment_method: effectivePrice > 0 ? input.paymentMethod || null : null,
          payment_first_name: effectivePrice > 0 ? input.paymentFirstName || null : null,
          payment_last_name: effectivePrice > 0 ? input.paymentLastName || null : null,
          payment_reference: effectivePrice > 0 ? input.paymentReference || null : null,
          payment_proof_url: paymentProofPath,
        })
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return data as SellerPlanRequestRow;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: CURRENT_ACCOUNT_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: SELLER_PLAN_REQUESTS_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: SELLER_PLANS_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: ADMIN_SELLER_PLANS_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: ADMIN_SELLER_PLAN_REQUESTS_QUERY_KEY });
    },
  });
}

export function useAdminSellerPlansQuery() {
  return useQuery({
    queryKey: ADMIN_SELLER_PLANS_QUERY_KEY,
    queryFn: async () => {
      const [plansResult, sellersResult, requestsResult] = await Promise.all([
        supabase.from("seller_plans").select("*").order("sort_order", { ascending: true }),
        supabase.from("sellers").select("id,current_plan_id,current_plan_status"),
        supabase.from("seller_plan_requests").select("plan_id,status"),
      ]);

      if (plansResult.error) {
        throw plansResult.error;
      }

      if (sellersResult.error) {
        throw sellersResult.error;
      }

      if (requestsResult.error) {
        throw requestsResult.error;
      }

      const sellers = sellersResult.data || [];
      const requests = requestsResult.data || [];

      return ((plansResult.data || []) as SellerPlanRow[]).map((row) => {
        const plan = mapSellerPlanRow(row);
        const subscribersCount = sellers.filter(
          (seller) => seller.current_plan_id === plan.id,
        ).length;
        const activeSubscribersCount = sellers.filter(
          (seller) =>
            seller.current_plan_id === plan.id && seller.current_plan_status === "active",
        ).length;
        const pendingRequestsCount = requests.filter(
          (request) =>
            request.plan_id === plan.id && request.status === "pending_review",
        ).length;

        return {
          ...plan,
          subscribersCount,
          activeSubscribersCount,
          pendingRequestsCount,
        };
      });
    },
  });
}

export function useAdminSellerPlanRequestsQuery() {
  return useQuery({
    queryKey: ADMIN_SELLER_PLAN_REQUESTS_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seller_plan_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      const rows = (data || []) as SellerPlanRequestRow[];
      const sellerIds = Array.from(new Set(rows.map((row) => row.seller_id)));
      const planIds = Array.from(new Set(rows.map((row) => row.plan_id)));

      const [planMap, sellersResult] = await Promise.all([
        fetchPlansMap(planIds),
        sellerIds.length
          ? supabase
              .from("sellers")
              .select("id,user_id,business_name,contact_email")
              .in("id", sellerIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (sellersResult.error) {
        throw sellersResult.error;
      }

      const sellerMap = ((sellersResult.data || []) as SellerIdentityRow[]).reduce<
        Record<string, SellerIdentityRow>
      >((accumulator, row) => {
        accumulator[row.id] = row;
        return accumulator;
      }, {});

      return rows.map((row) => mapPlanRequestRow(row, planMap, sellerMap));
    },
  });
}

type UpdateSellerPlanInput = {
  planId: string;
  name: string;
  description: string;
  price: number;
  promoPrice?: number | null;
  currencyCode: SellerPlan["currencyCode"];
  billingInterval: SellerPlan["billingInterval"];
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  features: SellerPlan["features"];
  limits: SellerPlan["limits"];
};

export function useUpdateSellerPlanMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateSellerPlanInput) => {
      const { error } = await supabase
        .from("seller_plans")
        .update({
          name: input.name,
          description: input.description,
          price: input.price,
          promo_price: input.promoPrice ?? null,
          currency_code: input.currencyCode,
          billing_interval: input.billingInterval,
          is_active: input.isActive,
          is_featured: input.isFeatured,
          sort_order: input.sortOrder,
          features: input.features,
          limits: input.limits,
          updated_at: new Date().toISOString(),
        })
        .eq("id", input.planId);

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: SELLER_PLANS_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: ADMIN_SELLER_PLANS_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: CURRENT_ACCOUNT_QUERY_KEY });
    },
  });
}

type ReviewSellerPlanRequestInput = {
  requestId: string;
  status: "approved" | "rejected" | "cancelled";
  rejectionReason?: string;
};

export function useReviewSellerPlanRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ReviewSellerPlanRequestInput) => {
      const account = await fetchCurrentAccount();

      if (!account || account.role !== "admin") {
        throw new Error("Acces admin requis.");
      }

      const { error } = await supabase
        .from("seller_plan_requests")
        .update({
          status: input.status,
          reviewed_by: account.userId,
          reviewed_at: new Date().toISOString(),
          rejection_reason:
            input.status === "rejected" ? input.rejectionReason || "Paiement non valide." : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", input.requestId);

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: CURRENT_ACCOUNT_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: SELLER_PLAN_REQUESTS_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: ADMIN_SELLER_PLANS_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: ADMIN_SELLER_PLAN_REQUESTS_QUERY_KEY });
    },
  });
}

export {
  ADMIN_SELLER_PLAN_REQUESTS_QUERY_KEY,
  ADMIN_SELLER_PLANS_QUERY_KEY,
  SELLER_PLAN_REQUESTS_QUERY_KEY,
  SELLER_PLANS_QUERY_KEY,
};
