"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { CURRENT_ACCOUNT_QUERY_KEY, fetchCurrentAccount } from "@/hooks/useAccount";
import { getAttributesForSubcategory } from "@/data/productOntology";
import type {
  Address,
  ProductAttributeValue,
  ProductVariant,
  SellerApplication,
  SellerKycDocument,
  SellerKycDocumentType,
  SellerWorkspaceOrderItem,
  SupabaseProduct,
} from "@/data/types";

const SELLER_APPLICATION_QUERY_KEY = ["seller-application"];
const SELLER_PRODUCTS_QUERY_KEY = ["seller-products"];
const SELLER_ORDER_ITEMS_QUERY_KEY = ["seller-order-items"];

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
  physical_store_address?: Address | null;
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

type SellerOrderItemRow = {
  id: string;
  order_id: string;
  order_number: string;
  product_id: string;
  product_name: string;
  sku?: string | null;
  image?: string | null;
  price: number | string;
  quantity: number;
  total: number | string;
  item_status: SellerWorkspaceOrderItem["itemStatus"];
  order_status: SellerWorkspaceOrderItem["orderStatus"];
  payment_status?: string | null;
  payment_method?: string | null;
  payment_id?: string | null;
  payment_proof_url?: string | null;
  tracking_number?: string | null;
  shipping_address: Address | string;
  customer_id: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  created_at: string;
  updated_at: string;
};

export type SellerApplicationSubmission = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  businessName: string;
  businessType: SellerApplication["businessType"];
  hasPhysicalStore: boolean;
  physicalStoreAddress?: Address;
  taxId?: string;
  categories: string[];
  productTypes: string;
  description: string;
  estimatedProducts: number;
  legalName?: string;
  identityDocumentNumber?: string;
};

export type SellerKycUploadInput = {
  sellerApplicationId?: string;
  documentType: SellerKycDocumentType;
  file: File;
};

export type CreateSellerProductInput = {
  name: string;
  description: string;
  categoryId: string;
  subcategory?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  sku: string;
  currencyCode?: "HTG" | "USD" | "EUR" | "DOP";
  tags: string[];
  features: string[];
  specifications?: Record<string, string>;
  attributes?: ProductAttributeValue[];
  hasVariants?: boolean;
  variants?: ProductVariant[];
  isFeatured?: boolean;
  files: File[];
  minProcessingDays?: number;
  maxProcessingDays?: number;
};

export type UpdateSellerProductInput = {
  productId: string;
  name: string;
  description: string;
  categoryId: string;
  subcategory?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  sku: string;
  currencyCode?: "HTG" | "USD" | "EUR" | "DOP";
  tags: string[];
  features: string[];
  specifications?: Record<string, string>;
  attributes?: ProductAttributeValue[];
  hasVariants?: boolean;
  variants?: ProductVariant[];
  isFeatured?: boolean;
  images: string[];
  minProcessingDays?: number;
  maxProcessingDays?: number;
};

function asAddress(value: Address | string): Address {
  if (typeof value === "string") {
    return JSON.parse(value) as Address;
  }

  return value;
}

function hasSellerAttributeValue(
  value: ProductAttributeValue["value"] | undefined,
) {
  if (Array.isArray(value)) {
    return value.some((item) => String(item).trim() !== "");
  }

  return String(value || "").trim() !== "";
}

function formatSupabaseLikeError(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (error && typeof error === "object") {
    const supabaseError = error as {
      message?: unknown;
      details?: unknown;
      hint?: unknown;
      code?: unknown;
      statusCode?: unknown;
    };

    const parts = [
      typeof supabaseError.message === "string" ? supabaseError.message : null,
      typeof supabaseError.details === "string"
        ? `Details: ${supabaseError.details}`
        : null,
      typeof supabaseError.hint === "string"
        ? `Hint: ${supabaseError.hint}`
        : null,
      typeof supabaseError.code === "string"
        ? `Code: ${supabaseError.code}`
        : null,
      typeof supabaseError.statusCode === "number"
        ? `Status: ${supabaseError.statusCode}`
        : null,
    ].filter(Boolean);

    if (parts.length > 0) {
      return parts.join(" | ");
    }
  }

  return fallbackMessage;
}

function logSupabaseLikeError(
  context: string,
  error: unknown,
  extra?: Record<string, unknown>,
) {
  if (error && typeof error === "object") {
    const supabaseError = error as {
      message?: unknown;
      details?: unknown;
      hint?: unknown;
      code?: unknown;
      statusCode?: unknown;
    };

    console.error(context, {
      message:
        typeof supabaseError.message === "string"
          ? supabaseError.message
          : undefined,
      details:
        typeof supabaseError.details === "string"
          ? supabaseError.details
          : undefined,
      hint:
        typeof supabaseError.hint === "string" ? supabaseError.hint : undefined,
      code:
        typeof supabaseError.code === "string" ? supabaseError.code : undefined,
      statusCode:
        typeof supabaseError.statusCode === "number"
          ? supabaseError.statusCode
          : undefined,
      name: error instanceof Error ? error.name : undefined,
      ...extra,
    });
    return;
  }

  console.error(context, {
    value: error,
    type: typeof error,
    ...extra,
  });
}

function validateSellerProductInput(
  input: Pick<
    CreateSellerProductInput,
    | "name"
    | "description"
    | "categoryId"
    | "subcategory"
    | "price"
    | "stock"
    | "sku"
    | "currencyCode"
    | "attributes"
    | "minProcessingDays"
    | "maxProcessingDays"
  > & {
    imageCount: number;
    requireImage: boolean;
  },
) {
  if (
    !input.name.trim() ||
    !input.description.trim() ||
    !input.categoryId ||
    !input.subcategory?.trim()
  ) {
    throw new Error(
      "Le nom, la description, la categorie et la sous-categorie sont obligatoires.",
    );
  }

  if (input.requireImage && input.imageCount <= 0) {
    throw new Error("Ajoutez au moins une image produit.");
  }

  const missingRequiredAttributes = getAttributesForSubcategory(
    input.categoryId,
    input.subcategory,
  )
    .filter((attribute) => attribute.required)
    .filter((attribute) => {
      const value = (input.attributes || []).find(
        (item) =>
          item.attributeId === attribute.name || item.name === attribute.name,
      )?.value;

      return !hasSellerAttributeValue(value);
    })
    .map((attribute) => attribute.label);

  if (missingRequiredAttributes.length > 0) {
    throw new Error(
      `Attributs obligatoires manquants: ${missingRequiredAttributes.join(", ")}.`,
    );
  }

  if (
    !input.currencyCode ||
    !Number.isFinite(input.price) ||
    input.price <= 0 ||
    !Number.isFinite(input.stock) ||
    input.stock < 0 ||
    !input.sku.trim() ||
    !Number.isFinite(input.minProcessingDays) ||
    !Number.isFinite(input.maxProcessingDays) ||
    (input.minProcessingDays || 0) < 1 ||
    (input.maxProcessingDays || 0) < (input.minProcessingDays || 0)
  ) {
    throw new Error(
      "La devise, le prix de vente, le stock, le SKU et les jours de preparation sont obligatoires et doivent etre valides.",
    );
  }
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
    physicalStoreAddress: row.physical_store_address || undefined,
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

function mapSellerOrderItem(row: SellerOrderItemRow): SellerWorkspaceOrderItem {
  const paymentProofPath = row.payment_proof_url
    ? row.payment_proof_url.startsWith("http")
      ? row.payment_proof_url
      : supabase.storage
          .from("payment-proofs")
          .getPublicUrl(row.payment_proof_url).data.publicUrl
    : undefined;

  return {
    id: row.id,
    orderId: row.order_id,
    orderNumber: row.order_number,
    productId: row.product_id,
    productName: row.product_name,
    sku: row.sku || undefined,
    image: row.image || undefined,
    quantity: Number(row.quantity || 0),
    price: Number(row.price || 0),
    total: Number(row.total || 0),
    itemStatus: row.item_status,
    orderStatus: row.order_status,
    paymentStatus: row.payment_status || undefined,
    paymentMethod: row.payment_method || undefined,
    paymentId: row.payment_id || undefined,
    paymentProofPath,
    trackingNumber: row.tracking_number || undefined,
    shippingAddress: asAddress(row.shipping_address),
    customerId: row.customer_id || "unknown-customer",
    customerName:
      `${row.customer_first_name || ""} ${row.customer_last_name || ""}`.trim() ||
      "Client",
    customerEmail: row.customer_email || "Email indisponible",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
}

async function getSignedPublicUrl(bucket: string, path: string) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export function useSellerApplicationQuery() {
  return useQuery({
    queryKey: SELLER_APPLICATION_QUERY_KEY,
    queryFn: async () => {
      const account = await fetchCurrentAccount();

      if (!account) {
        return null;
      }

      const { data: applicationRow, error: applicationError } = await supabase
        .from("seller_applications")
        .select("*")
        .eq("user_id", account.userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (applicationError) {
        throw applicationError;
      }

      if (!applicationRow) {
        return null;
      }

      const { data: documentRows, error: documentsError } = await supabase
        .from("seller_kyc_documents")
        .select("*")
        .eq("user_id", account.userId)
        .order("created_at", { ascending: false });

      if (documentsError) {
        throw documentsError;
      }

      const documents = (documentRows || []).map((row) =>
        mapSellerKycDocument(row as SellerKycDocumentRow),
      );

      return mapSellerApplication(
        applicationRow as SellerApplicationRow,
        documents,
      );
    },
  });
}

export function useSubmitSellerApplicationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SellerApplicationSubmission) => {
      const account = await fetchCurrentAccount();

      if (!account) {
        throw new Error("Authentication required");
      }

      const payload = {
        user_id: account.userId,
        status: "pending" as const,
        current_step: 3 as const,
        first_name: input.firstName,
        last_name: input.lastName,
        email: input.email,
        phone: input.phone,
        business_name: input.businessName,
        business_type: input.businessType,
        has_physical_store: input.hasPhysicalStore,
        physical_store_address: input.physicalStoreAddress || null,
        tax_id: input.taxId || null,
        product_categories: input.categories,
        product_types: input.productTypes,
        business_description: input.description,
        estimated_products: input.estimatedProducts,
        legal_name: input.legalName || null,
        identity_document_number: input.identityDocumentNumber || null,
        kyc_status: "pending" as const,
        submitted_at: new Date().toISOString(),
      };

      const { data: existing, error: existingError } = await supabase
        .from("seller_applications")
        .select("id")
        .eq("user_id", account.userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingError) {
        throw existingError;
      }

      if (existing?.id) {
        const { data, error } = await supabase
          .from("seller_applications")
          .update(payload)
          .eq("id", existing.id)
          .select("*")
          .single();

        if (error) {
          throw error;
        }

        if (!data?.id) {
          throw new Error(
            "Supabase n'a retourne aucune ligne seller_applications apres la mise a jour.",
          );
        }

        return data as SellerApplicationRow;
      }

      const { data, error } = await supabase
        .from("seller_applications")
        .insert(payload)
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      if (!data?.id) {
        throw new Error(
          "Supabase n'a retourne aucune ligne seller_applications apres l'insertion.",
        );
      }

      return data as SellerApplicationRow;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: SELLER_APPLICATION_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: CURRENT_ACCOUNT_QUERY_KEY });
    },
  });
}

export function useUploadSellerKycDocumentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SellerKycUploadInput) => {
      const account = await fetchCurrentAccount();

      if (!account) {
        throw new Error("Authentication required");
      }

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        throw new Error("Authentication required");
      }

      const storagePath = `${authUser.id}/${input.documentType}-${Date.now()}-${sanitizeFileName(
        input.file.name,
      )}`;

      const { error: uploadError } = await supabase.storage
        .from("seller-kyc")
        .upload(storagePath, input.file, {
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data, error } = await supabase
        .from("seller_kyc_documents")
        .insert({
          user_id: account.userId,
          seller_id: account.seller?.id || null,
          seller_application_id: input.sellerApplicationId || null,
          document_type: input.documentType,
          storage_bucket: "seller-kyc",
          storage_path: storagePath,
          file_name: input.file.name,
          mime_type: input.file.type || null,
          status: "pending",
        })
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return mapSellerKycDocument(data as SellerKycDocumentRow);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: SELLER_APPLICATION_QUERY_KEY });
    },
  });
}

export function useSellerProductsQuery() {
  return useQuery({
    queryKey: SELLER_PRODUCTS_QUERY_KEY,
    queryFn: async () => {
      const account = await fetchCurrentAccount();

      if (!account?.seller) {
        return [];
      }

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("seller_id", account.seller.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return (data || []) as SupabaseProduct[];
    },
  });
}

export function useSellerProductQuery(productId?: string) {
  return useQuery({
    queryKey: [...SELLER_PRODUCTS_QUERY_KEY, productId],
    queryFn: async () => {
      if (!productId) {
        return null;
      }

      const account = await fetchCurrentAccount();

      if (!account?.seller) {
        return null;
      }

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .eq("seller_id", account.seller.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return (data || null) as SupabaseProduct | null;
    },
    enabled: Boolean(productId),
  });
}

export function useCreateSellerProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateSellerProductInput) => {
      const account = await fetchCurrentAccount();

      if (!account?.seller || account.seller.status !== "approved") {
        throw new Error("An approved seller account is required");
      }

      validateSellerProductInput({
        ...input,
        imageCount: input.files.length,
        requireImage: true,
      });

      const productId = crypto.randomUUID();
      const uploadedUrls: string[] = [];

      for (let index = 0; index < input.files.length; index += 1) {
        const file = input.files[index];
        const storagePath = `products/${productId}/${Date.now()}-${index}-${sanitizeFileName(
          file.name,
        )}`;

        const { error: uploadError } = await supabase.storage
          .from("products-images")
          .upload(storagePath, file, {
            upsert: true,
          });

        if (uploadError) {
          logSupabaseLikeError("Supabase seller product image upload error", uploadError, {
            bucket: "products-images",
            storagePath,
            fileName: file.name,
            productId,
          });
          throw new Error(
            formatSupabaseLikeError(
              uploadError,
              "Erreur Supabase lors de l'upload de l'image produit.",
            ),
          );
        }

        uploadedUrls.push(await getSignedPublicUrl("products-images", storagePath));
      }

      const payload = {
        id: productId,
        name: input.name,
        description: input.description,
        price: input.price,
        original_price: input.originalPrice || null,
        images: uploadedUrls.length ? uploadedUrls : ["/images/placeholder.jpg"],
        category_id: input.categoryId,
        subcategory: input.subcategory || null,
        tags: input.tags,
        stock: input.stock,
        sku: input.sku,
        features: input.features,
        specifications: input.specifications || {},
        attributes: input.attributes || [],
        currency_code: input.currencyCode || "HTG",
        owner_type: "seller" as const,
        owner_id: account.userId,
        seller_id: account.seller.id,
        owner_name: account.seller.businessName,
        status: "active" as const,
        is_featured: input.isFeatured || false,
        priority: 0,
        views: 0,
        sales: 0,
        rating: 0,
        review_count: 0,
        discount: 0,
        is_new: true,
        is_bestseller: false,
        has_variants: input.hasVariants || false,
        min_processing_days: input.minProcessingDays || 1,
        max_processing_days: input.maxProcessingDays || 5,
      };

      const { data, error } = await supabase
        .from("products")
        .insert(payload)
        .select("*")
        .single();

      if (error) {
        logSupabaseLikeError("Supabase seller product insert error", error, {
          productId,
          sellerId: account.seller.id,
          categoryId: input.categoryId,
          subcategory: input.subcategory || null,
          currencyCode: input.currencyCode || "HTG",
          imageCount: uploadedUrls.length,
        });
        throw new Error(
          formatSupabaseLikeError(
            error,
            "Erreur Supabase lors de l'enregistrement du produit vendeur.",
          ),
        );
      }

      return data as SupabaseProduct;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: SELLER_PRODUCTS_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateSellerProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateSellerProductInput) => {
      const account = await fetchCurrentAccount();

      if (!account?.seller) {
        throw new Error("Seller account required");
      }

      validateSellerProductInput({
        ...input,
        imageCount: input.images.length,
        requireImage: true,
      });

      const { data, error } = await supabase
        .from("products")
        .update({
          name: input.name,
          description: input.description,
          category_id: input.categoryId,
          subcategory: input.subcategory || null,
          price: input.price,
          original_price: input.originalPrice || null,
          stock: input.stock,
          sku: input.sku,
          currency_code: input.currencyCode || "HTG",
          tags: input.tags,
          features: input.features,
          specifications: input.specifications || {},
          attributes: input.attributes || [],
          has_variants: input.hasVariants || false,
          is_featured: input.isFeatured || false,
          images: input.images,
          min_processing_days: input.minProcessingDays || 1,
          max_processing_days: input.maxProcessingDays || 5,
          status: input.stock <= 0 ? "out_of_stock" : undefined,
          updated_at: new Date().toISOString(),
        })
        .eq("id", input.productId)
        .eq("seller_id", account.seller.id)
        .select("*")
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Produit vendeur introuvable ou non accessible.");
      }

      return data as SupabaseProduct;
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: SELLER_PRODUCTS_QUERY_KEY });
      await queryClient.invalidateQueries({
        queryKey: [...SELLER_PRODUCTS_QUERY_KEY, data.id],
      });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateSellerProductStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      status,
    }: {
      productId: string;
      status: SupabaseProduct["status"];
    }) => {
      const account = await fetchCurrentAccount();

      if (!account?.seller) {
        throw new Error("Seller account required");
      }

      const { error } = await supabase
        .from("products")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", productId)
        .eq("seller_id", account.seller.id);

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: SELLER_PRODUCTS_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteSellerProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const account = await fetchCurrentAccount();

      if (!account?.seller) {
        throw new Error("Seller account required");
      }

      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId)
        .eq("seller_id", account.seller.id);

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: SELLER_PRODUCTS_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateSellerProductStockMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      stock,
    }: {
      productId: string;
      stock: number;
    }) => {
      const account = await fetchCurrentAccount();

      if (!account?.seller) {
        throw new Error("Seller account required");
      }

      const nextStatus: SupabaseProduct["status"] =
        stock <= 0 ? "out_of_stock" : "active";

      const { data, error } = await supabase
        .from("products")
        .update({
          stock,
          status: nextStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", productId)
        .eq("seller_id", account.seller.id)
        .select("*")
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Produit vendeur introuvable ou non accessible.");
      }

      return data as SupabaseProduct;
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: SELLER_PRODUCTS_QUERY_KEY });
      await queryClient.invalidateQueries({
        queryKey: [...SELLER_PRODUCTS_QUERY_KEY, data.id],
      });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useSellerOrderItemsQuery() {
  return useQuery({
    queryKey: SELLER_ORDER_ITEMS_QUERY_KEY,
    queryFn: async () => {
      const account = await fetchCurrentAccount();

      if (!account?.seller) {
        return [];
      }

      const { data, error } = await supabase
        .from("seller_order_items_view")
        .select("*")
        .eq("seller_id", account.seller.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return (data || []).map((row) =>
        mapSellerOrderItem(row as SellerOrderItemRow),
      );
    },
  });
}

export function useUpdateSellerOrderItemStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderItemId,
      status,
      trackingNumber,
    }: {
      orderItemId: string;
      status: SellerWorkspaceOrderItem["itemStatus"];
      trackingNumber?: string;
    }) => {
      const { error } = await supabase.rpc("seller_update_order_item_status", {
        p_order_item_id: orderItemId,
        p_status: status,
        p_tracking_number: trackingNumber || null,
      });

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: SELLER_ORDER_ITEMS_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export {
  SELLER_APPLICATION_QUERY_KEY,
  SELLER_ORDER_ITEMS_QUERY_KEY,
  SELLER_PRODUCTS_QUERY_KEY,
};
