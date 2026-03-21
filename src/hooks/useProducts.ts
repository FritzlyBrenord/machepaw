import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, uploadImage, deleteImage } from '@/lib/supabase';
import { fetchCurrentAccount } from "@/hooks/useAccount";
import type { SupabaseProduct, ProductVariant, ProductAttributeValue } from '@/data/types';

const PRODUCTS_QUERY_KEY = 'products';

// ==========================================
// FETCH PRODUCTS
// ==========================================

export const useProducts = (options?: {
  status?: string;
  categoryId?: string;
  search?: string;
  ownerType?: 'admin' | 'seller';
  limit?: number;
}) => {
  return useQuery({
    queryKey: [PRODUCTS_QUERY_KEY, options],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*, sellers(business_name)')
        .order('created_at', { ascending: false });

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.categoryId) {
        query = query.eq('category_id', options.categoryId);
      }

      if (options?.ownerType) {
        query = query.eq('owner_type', options.ownerType);
      }

      if (options?.search) {
        query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%`);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as SupabaseProduct[];
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: [PRODUCTS_QUERY_KEY, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as SupabaseProduct;
    },
    enabled: !!id,
  });
};

// ==========================================
// CREATE PRODUCT
// ==========================================

interface CreateProductData {
  name: string;
  description: string;
  price: number;
  original_price?: number;
  category_id: string;
  subcategory?: string;
  stock: number;
  sku: string;
  currency_code?: "HTG" | "USD" | "EUR" | "DOP";
  images: string[];
  features: string[];
  specifications: Record<string, string>;
  tags: string[];
  attributes?: ProductAttributeValue[];
  has_variants?: boolean;
  variants?: ProductVariant[];
  is_featured?: boolean;
  min_processing_days?: number;
  max_processing_days?: number;
}

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProductData) => {
      const account = await fetchCurrentAccount();

      if (!account || account.role !== "admin") {
        throw new Error("Admin access required");
      }

      const { variants, ...cleanData } = data;
      const ownerName =
        `${account.firstName || ""} ${account.lastName || ""}`.trim() ||
        account.email ||
        "Admin";

      const { data: product, error } = await supabase
        .from('products')
        .insert([
          {
            ...cleanData,
            owner_type: 'admin',
            owner_id: account.userId,
            owner_name: ownerName,
            status: 'active',
            is_featured: data.is_featured || false,
            priority: 0,
            views: 0,
            sales: 0,
            rating: 0,
            review_count: 0,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("SUPABASE ERROR INSERTING PRODUCT:", JSON.stringify(error, null, 2));
        throw new Error(error.message || "Failed to create product");
      }
      
      return product as SupabaseProduct;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY] });
    },
  });
};

// ==========================================
// UPDATE PRODUCT
// ==========================================

interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProductData) => {
      const { id, variants, ...updates } = data;

      const { data: product, error } = await supabase
        .from('products')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return product as SupabaseProduct;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY, data.id] });
    },
  });
};

// ==========================================
// DELETE PRODUCT
// ==========================================

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // First, delete product images from storage
      const { data: product } = await supabase
        .from('products')
        .select('images')
        .eq('id', id)
        .single();

      if (product?.images) {
        for (const imageUrl of product.images) {
          const path = imageUrl.split('/').pop();
          if (path) {
            await deleteImage('products-images', `products/${id}/${path}`);
          }
        }
      }

      // Delete product
      const { error } = await supabase.from('products').delete().eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY] });
    },
  });
};

// ==========================================
// TOGGLE PRODUCT STATUS (Online/Offline)
// ==========================================

export const useToggleProductStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('products')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as SupabaseProduct;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY, data.id] });
    },
  });
};

// ==========================================
// UPDATE STOCK
// ==========================================

export const useUpdateStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, stock }: { id: string; stock: number }) => {
      const { data, error } = await supabase
        .from('products')
        .update({ 
          stock, 
          updated_at: new Date().toISOString(),
          status: stock === 0 ? 'out_of_stock' : 'active'
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as SupabaseProduct;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY, data.id] });
    },
  });
};

// ==========================================
// UPLOAD PRODUCT IMAGES
// ==========================================

export const useUploadProductImages = () => {
  return useMutation({
    mutationFn: async ({ 
      productId, 
      files 
    }: { 
      productId: string; 
      files: File[] 
    }) => {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const path = `products/${productId}/${Date.now()}-${i}-${file.name}`;
        
        const url = await uploadImage('products-images', path, file);
        if (url) {
          uploadedUrls.push(url);
        }
      }

      return uploadedUrls;
    },
  });
};

// ==========================================
// FEATURED PRODUCT
// ==========================================

export const useToggleFeatured = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isFeatured }: { id: string; isFeatured: boolean }) => {
      const { data, error } = await supabase
        .from('products')
        .update({ is_featured: isFeatured, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as SupabaseProduct;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY] });
    },
  });
};
