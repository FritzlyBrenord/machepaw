"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { CURRENT_ACCOUNT_QUERY_KEY, fetchCurrentAccount } from "@/hooks/useAccount";
import type {
  Address,
  AdminSeller,
  AdminSellerDossier,
  AdminStats,
  AdminUser,
  SellerApplication,
  SellerKycDocument,
  SellerKycDocumentType,
} from "@/data/types";

const ADMIN_USERS_QUERY_KEY = ["admin-users"];
const ADMIN_SELLERS_QUERY_KEY = ["admin-sellers-overview"];
const ADMIN_OVERVIEW_QUERY_KEY = ["admin-overview"];

type UserRow = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  avatar?: string | null;
  role: AdminUser["role"];
  is_blocked?: boolean | null;
  created_at: string;
};

type OrderAggregateRow = {
  user_id: string;
  total: number | string;
};

type AdminSellerRow = {
  review_id: string;
  seller_id?: string | null;
  application_id?: string | null;
  user_id: string;
  business_name: string;
  business_type: AdminSeller["businessType"];
  description?: string | null;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  tax_id?: string | null;
  status: AdminSeller["status"];
  logo?: string | null;
  banner?: string | null;
  is_verified?: boolean | null;
  kyc_status?: AdminSeller["kycStatus"] | null;
  kyc_submitted_at?: string | null;
  kyc_reviewed_at?: string | null;
  kyc_review_notes?: string | null;
  total_sales?: number | null;
  total_revenue?: number | null;
  rating?: number | null;
  review_count?: number | null;
  commission_rate?: number | null;
  blocked_until?: string | null;
  block_reason?: string | null;
  categories?: string[] | null;
  products_count?: number | null;
  has_physical_store?: boolean | null;
  physical_store_address?: Address | string | null;
  product_types?: string | null;
  estimated_products?: number | null;
  legal_name?: string | null;
  identity_document_number?: string | null;
  application_status?: string | null;
  current_step?: number | null;
  rejection_reason?: string | null;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  submitted_at?: string | null;
  created_at: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
};

type SellerApplicationRow = {
  id: string;
  user_id: string;
  status: SellerApplication["status"];
  current_step: 1 | 2 | 3;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  business_name: string;
  business_type: SellerApplication["businessType"];
  has_physical_store: boolean;
  physical_store_address?: Address | string | null;
  tax_id?: string | null;
  product_categories?: string[] | null;
  product_types?: string | null;
  business_description?: string | null;
  estimated_products?: number | null;
  submitted_at?: string | null;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  rejection_reason?: string | null;
  reviewed_notes?: string | null;
  legal_name?: string | null;
  identity_document_number?: string | null;
  kyc_status?: SellerApplication["kycStatus"] | null;
};

type SellerKycDocumentRow = {
  id: string;
  user_id: string;
  seller_id?: string | null;
  seller_application_id?: string | null;
  document_type: SellerKycDocumentType;
  storage_bucket: string;
  storage_path: string;
  file_name?: string | null;
  mime_type?: string | null;
  status: SellerKycDocument["status"];
  notes?: string | null;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  created_at: string;
  updated_at: string;
};

function asAddress(value: Address | string | null | undefined): Address | undefined {
  if (!value) {
    return undefined;
  }

  if (typeof value === "string") {
    return JSON.parse(value) as Address;
  }

  return value;
}

function mapSellerApplication(
  row: SellerApplicationRow,
  documents: SellerKycDocument[],
): SellerApplication {
  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    step: row.current_step,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    businessName: row.business_name,
    businessType: row.business_type,
    hasPhysicalStore: row.has_physical_store,
    physicalStoreAddress: asAddress(row.physical_store_address),
    taxId: row.tax_id || undefined,
    categories: row.product_categories || [],
    productTypes: row.product_types || "",
    description: row.business_description || "",
    estimatedProducts: row.estimated_products || 0,
    submittedAt: row.submitted_at || undefined,
    reviewedAt: row.reviewed_at || undefined,
    reviewedBy: row.reviewed_by || undefined,
    rejectionReason: row.rejection_reason || undefined,
    reviewedNotes: row.reviewed_notes || undefined,
    legalName: row.legal_name || undefined,
    identityDocumentNumber: row.identity_document_number || undefined,
    kycStatus: row.kyc_status || "not_submitted",
    kycDocuments: documents,
  };
}

function mapSellerKycDocument(row: SellerKycDocumentRow): SellerKycDocument {
  return {
    id: row.id,
    userId: row.user_id,
    sellerId: row.seller_id || undefined,
    sellerApplicationId: row.seller_application_id || undefined,
    documentType: row.document_type,
    storageBucket: row.storage_bucket,
    storagePath: row.storage_path,
    fileName: row.file_name || undefined,
    mimeType: row.mime_type || undefined,
    status: row.status,
    notes: row.notes || undefined,
    reviewedAt: row.reviewed_at || undefined,
    reviewedBy: row.reviewed_by || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapAdminUser(row: UserRow, orders: OrderAggregateRow[]): AdminUser {
  const userOrders = orders.filter((order) => order.user_id === row.id);
  const totalSpent = userOrders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0,
  );

  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone || undefined,
    avatar: row.avatar || undefined,
    addresses: [],
    wishlist: [],
    orders: [],
    createdAt: row.created_at,
    role: row.role,
    isBlocked: Boolean(row.is_blocked),
    ordersCount: userOrders.length,
    totalSpent,
  };
}

function mapAdminSeller(row: AdminSellerRow): AdminSeller {
  return {
    reviewId: row.review_id,
    id: row.seller_id || row.review_id,
    userId: row.user_id,
    applicationId: row.application_id || undefined,
    applicationStatus: row.application_status || undefined,
    currentStep: row.current_step || undefined,
    status: row.status,
    businessName: row.business_name,
    businessType: row.business_type,
    hasPhysicalStore: Boolean(row.has_physical_store),
    physicalStoreAddress: asAddress(row.physical_store_address),
    taxId: row.tax_id || undefined,
    description: row.description || "",
    categories: row.categories || [],
    contactPerson: row.contact_person,
    contactPhone: row.contact_phone,
    contactEmail: row.contact_email,
    logo: row.logo || undefined,
    banner: row.banner || undefined,
    createdAt: row.created_at,
    updatedAt: row.reviewed_at || row.created_at,
    products: [],
    totalSales: Number(row.total_sales || 0),
    totalRevenue: Number(row.total_revenue || 0),
    rating: Number(row.rating || 0),
    reviewCount: Number(row.review_count || 0),
    applicationDate: row.submitted_at || row.created_at,
    legalName: row.legal_name || undefined,
    identityDocumentNumber: row.identity_document_number || undefined,
    productTypes: row.product_types || undefined,
    estimatedProducts: row.estimated_products || 0,
    applicationFirstName: row.first_name || undefined,
    applicationLastName: row.last_name || undefined,
    applicationEmail: row.email || undefined,
    applicationPhone: row.contact_phone || undefined,
    isVerified: Boolean(row.is_verified),
    commissionRate: Number(row.commission_rate || 0),
    productsCount: Number(row.products_count || 0),
    blockedUntil: row.blocked_until || undefined,
    blockReason: row.block_reason || undefined,
    rejectionReason: row.rejection_reason || undefined,
    kycStatus: row.kyc_status || "not_submitted",
    kycSubmittedAt: row.kyc_submitted_at || undefined,
    kycReviewedAt: row.kyc_reviewed_at || undefined,
    kycReviewNotes: row.kyc_review_notes || undefined,
  };
}

export function useAdminUsersQuery() {
  return useQuery({
    queryKey: ADMIN_USERS_QUERY_KEY,
    queryFn: async () => {
      const [usersResult, ordersResult] = await Promise.all([
        supabase.from("users").select("*").order("created_at", { ascending: false }),
        supabase.from("orders").select("user_id,total"),
      ]);

      if (usersResult.error) {
        throw usersResult.error;
      }

      if (ordersResult.error) {
        throw ordersResult.error;
      }

      const orders = (ordersResult.data || []) as OrderAggregateRow[];

      return ((usersResult.data || []) as UserRow[]).map((row) =>
        mapAdminUser(row, orders),
      );
    },
  });
}

export function useAdminSellersOverviewQuery() {
  return useQuery({
    queryKey: ADMIN_SELLERS_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_seller_overview")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return ((data || []) as AdminSellerRow[]).map(mapAdminSeller);
    },
  });
}

async function createSignedDocumentUrl(bucket: string, path: string) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 60 * 60);

  if (error) {
    throw error;
  }

  return data.signedUrl;
}

export function useAdminSellerDossierQuery(seller: AdminSeller | null) {
  return useQuery({
    queryKey: [
      "admin-seller-dossier",
      seller?.reviewId,
      seller?.applicationId,
      seller?.id,
      seller?.userId,
    ],
    enabled: Boolean(seller),
    queryFn: async () => {
      if (!seller) {
        return null;
      }

      const applicationQuery = seller.applicationId
        ? supabase
            .from("seller_applications")
            .select("*")
            .eq("id", seller.applicationId)
            .maybeSingle()
        : supabase
            .from("seller_applications")
            .select("*")
            .eq("user_id", seller.userId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

      const [applicationResult, documentsResult] = await Promise.all([
        applicationQuery,
        supabase
          .from("seller_kyc_documents")
          .select("*")
          .eq("user_id", seller.userId)
          .order("created_at", { ascending: false }),
      ]);

      if (applicationResult.error) {
        throw applicationResult.error;
      }

      if (documentsResult.error) {
        throw documentsResult.error;
      }

      const documents = await Promise.all(
        ((documentsResult.data || []) as SellerKycDocumentRow[]).map(
          async (row) => {
            const document = mapSellerKycDocument(row);

            try {
              return {
                ...document,
                previewUrl: await createSignedDocumentUrl(
                  document.storageBucket,
                  document.storagePath,
                ),
              };
            } catch {
              return document;
            }
          },
        ),
      );

      const applicationRow = applicationResult.data as SellerApplicationRow | null;

      const dossier: AdminSellerDossier = {
        seller,
        application: applicationRow
          ? mapSellerApplication(applicationRow, documents)
          : undefined,
        documents,
      };

      return dossier;
    },
  });
}

export function useAdminOverviewQuery() {
  return useQuery({
    queryKey: ADMIN_OVERVIEW_QUERY_KEY,
    queryFn: async () => {
      const [
        usersResult,
        sellersResult,
        productsResult,
        ordersResult,
      ] = await Promise.all([
        supabase.from("users").select("id", { count: "exact", head: true }),
        supabase.from("sellers").select("id,status", { count: "exact" }),
        supabase.from("products").select("id,status", { count: "exact" }),
        supabase.from("orders").select("id,status,total,created_at"),
      ]);

      if (usersResult.error) throw usersResult.error;
      if (sellersResult.error) throw sellersResult.error;
      if (productsResult.error) throw productsResult.error;
      if (ordersResult.error) throw ordersResult.error;

      const sellers = sellersResult.data || [];
      const products = productsResult.data || [];
      const orders = ordersResult.data || [];
      const today = new Date().toDateString();

      const stats: AdminStats = {
        totalUsers: usersResult.count || 0,
        totalSellers: sellers.length,
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, order) => sum + Number(order.total || 0), 0),
        pendingOrders: orders.filter((order) => order.status === "pending").length,
        pendingSellers: sellers.filter((seller) => seller.status === "pending").length,
        pendingProducts: products.filter((product) => product.status === "pending").length,
        todayRevenue: orders
          .filter((order) => new Date(order.created_at).toDateString() === today)
          .reduce((sum, order) => sum + Number(order.total || 0), 0),
        todayOrders: orders.filter(
          (order) => new Date(order.created_at).toDateString() === today,
        ).length,
        newUsersToday: 0,
        newSellersToday: 0,
        weeklyRevenue: [],
        topProducts: [],
        topSellers: [],
      };

      return stats;
    },
  });
}

export function useUpdateUserRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: AdminUser["role"];
    }) => {
      const { error } = await supabase
        .from("users")
        .update({
          role,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: CURRENT_ACCOUNT_QUERY_KEY });
    },
  });
}

export function useToggleUserBlockMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      isBlocked,
    }: {
      userId: string;
      isBlocked: boolean;
    }) => {
      const { error } = await supabase
        .from("users")
        .update({
          is_blocked: isBlocked,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
    },
  });
}

export function useApproveSellerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sellerId,
      applicationId,
      userId,
    }: {
      sellerId?: string;
      applicationId?: string;
      userId: string;
    }) => {
      const admin = await fetchCurrentAccount();
      const reviewedBy = admin?.userId || null;

      let resolvedSellerId = sellerId;

      if (!resolvedSellerId && applicationId) {
        const { data: application, error: applicationError } = await supabase
          .from("seller_applications")
          .select("*")
          .eq("id", applicationId)
          .single();

        if (applicationError) {
          throw applicationError;
        }

        const { data: insertedSeller, error: insertError } = await supabase
          .from("sellers")
          .insert({
            user_id: application.user_id,
            status: "approved",
            business_name: application.business_name,
            business_type: application.business_type,
            has_physical_store: application.has_physical_store,
            tax_id: application.tax_id,
            description: application.business_description,
            categories: application.product_categories,
            contact_person: `${application.first_name} ${application.last_name}`.trim(),
            contact_phone: application.phone,
            contact_email: application.email,
            kyc_status: "approved",
            kyc_submitted_at: application.submitted_at,
            kyc_reviewed_at: new Date().toISOString(),
            commission_rate: 10,
          })
          .select("id")
          .single();

        if (insertError) {
          throw insertError;
        }

        resolvedSellerId = insertedSeller.id;
      }

      if (resolvedSellerId) {
        const { error: sellerError } = await supabase
          .from("sellers")
          .update({
            status: "approved",
            kyc_status: "approved",
            kyc_reviewed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", resolvedSellerId);

        if (sellerError) {
          throw sellerError;
        }
      }

      if (applicationId) {
        const { error: applicationError } = await supabase
          .from("seller_applications")
          .update({
            status: "approved",
            kyc_status: "approved",
            reviewed_at: new Date().toISOString(),
            reviewed_by: reviewedBy,
          })
          .eq("id", applicationId);

        if (applicationError) {
          throw applicationError;
        }
      }

      const { error: userError } = await supabase
        .from("users")
        .update({
          role: "seller",
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (userError) {
        throw userError;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ADMIN_SELLERS_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: ADMIN_OVERVIEW_QUERY_KEY });
    },
  });
}

export function useRejectSellerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sellerId,
      applicationId,
      reason,
    }: {
      sellerId?: string;
      applicationId?: string;
      reason: string;
    }) => {
      const admin = await fetchCurrentAccount();
      const reviewedBy = admin?.userId || null;

      if (sellerId) {
        const { error: sellerError } = await supabase
          .from("sellers")
          .update({
            status: "rejected",
            rejection_reason: reason,
            kyc_status: "rejected",
            kyc_review_notes: reason,
            updated_at: new Date().toISOString(),
          })
          .eq("id", sellerId);

        if (sellerError) {
          throw sellerError;
        }
      }

      if (applicationId) {
        const { error: applicationError } = await supabase
          .from("seller_applications")
          .update({
            status: "rejected",
            rejection_reason: reason,
            reviewed_notes: reason,
            kyc_status: "rejected",
            reviewed_at: new Date().toISOString(),
            reviewed_by: reviewedBy,
          })
          .eq("id", applicationId);

        if (applicationError) {
          throw applicationError;
        }
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ADMIN_SELLERS_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: ADMIN_OVERVIEW_QUERY_KEY });
    },
  });
}

export function useBlockSellerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sellerId,
      reason,
    }: {
      sellerId: string;
      reason: string;
    }) => {
      const { error } = await supabase
        .from("sellers")
        .update({
          status: "suspended",
          block_reason: reason,
          blocked_until: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", sellerId);

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ADMIN_SELLERS_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: ADMIN_OVERVIEW_QUERY_KEY });
    },
  });
}

export function useUnblockSellerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sellerId: string) => {
      const { error } = await supabase
        .from("sellers")
        .update({
          status: "approved",
          block_reason: null,
          blocked_until: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", sellerId);

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ADMIN_SELLERS_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: ADMIN_OVERVIEW_QUERY_KEY });
    },
  });
}

export function useVerifySellerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sellerId: string) => {
      const { error } = await supabase
        .from("sellers")
        .update({
          is_verified: true,
          kyc_status: "approved",
          kyc_reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", sellerId);

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ADMIN_SELLERS_QUERY_KEY });
    },
  });
}

export {
  ADMIN_OVERVIEW_QUERY_KEY,
  ADMIN_SELLERS_QUERY_KEY,
  ADMIN_USERS_QUERY_KEY,
};
