import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { fetchCurrentAccount } from "@/hooks/useAccount";

// ======================================================
// TYPES
// ======================================================

export interface FlashSale {
  id: string;
  product_id: string;
  title: string;
  sale_price: number;
  original_price: number;
  starts_at: string;
  ends_at: string;
  quantity_limit: number;
  quantity_sold: number;
  status: 'active' | 'paused' | 'ended';
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  products?: {
    id: string;
    name: string;
    images: string[];
    sku: string;
    seller_id?: string;
    owner_type?: "admin" | "seller";
  };
}

export interface FlashSalePurchase {
  id: string;
  flash_sale_id: string;
  order_id: string | null;
  user_id: string | null;
  quantity: number;
  unit_price: number;
  purchased_at: string;
}

export interface CreateFlashSaleData {
  product_id: string;
  title: string;
  sale_price: number;
  original_price: number;
  ends_at: string;
  quantity_limit: number;
}

export interface UpdateFlashSaleData {
  title?: string;
  sale_price?: number;
  ends_at?: string;
  quantity_limit?: number;
  status?: 'active' | 'paused' | 'ended';
}

const FLASH_SALES_KEY = 'flash_sales';
const PURCHASES_KEY = 'flash_sale_purchases';
const SELLER_FLASH_SALES_KEY = 'seller_flash_sales';

const FLASH_SALE_SELECT = '*, products(id, name, images, sku)';
const SELLER_FLASH_SALE_SELECT =
  '*, products!inner(id, name, images, sku, seller_id, owner_type)';

// ======================================================
// FLASH SALES HOOKS
// ======================================================

export const useFlashSales = (status?: string) => {
  return useQuery({
    queryKey: [FLASH_SALES_KEY, status],
    queryFn: async () => {
      let query = supabase
        .from('flash_sales')
        .select(FLASH_SALE_SELECT)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as FlashSale[];
    },
    refetchInterval: 30000, // Auto-refresh every 30s to update status
  });
};

export const useFlashSale = (id: string) => {
  return useQuery({
    queryKey: [FLASH_SALES_KEY, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flash_sales')
        .select(FLASH_SALE_SELECT)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as FlashSale;
    },
    enabled: !!id,
  });
};

export const useFlashSalePurchases = (flashSaleId: string) => {
  return useQuery({
    queryKey: [PURCHASES_KEY, flashSaleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flash_sale_purchases')
        .select('*')
        .eq('flash_sale_id', flashSaleId)
        .order('purchased_at', { ascending: false });
      if (error) throw error;
      return data as FlashSalePurchase[];
    },
    enabled: !!flashSaleId,
  });
};

export const useCreateFlashSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateFlashSaleData) => {
      const account = await fetchCurrentAccount();

      if (!account || account.role !== "admin") {
        throw new Error("Admin access required");
      }

      const { data: result, error } = await supabase
        .from('flash_sales')
        .insert([{
          ...data,
          starts_at: new Date().toISOString(),
          status: 'active',
          created_by: account.userId,
        }])
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FLASH_SALES_KEY] });
    },
  });
};

export const useUpdateFlashSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateFlashSaleData }) => {
      const account = await fetchCurrentAccount();

      if (!account || account.role !== "admin") {
        throw new Error("Admin access required");
      }

      const { data: result, error } = await supabase
        .from('flash_sales')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FLASH_SALES_KEY] });
    },
  });
};

export const useDeleteFlashSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const account = await fetchCurrentAccount();

      if (!account || account.role !== "admin") {
        throw new Error("Admin access required");
      }

      const { error } = await supabase
        .from('flash_sales')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FLASH_SALES_KEY] });
    },
  });
};

export const useSellerFlashSales = (status?: string) => {
  return useQuery({
    queryKey: [SELLER_FLASH_SALES_KEY, status],
    queryFn: async () => {
      const account = await fetchCurrentAccount();

      if (!account?.seller || account.seller.status !== "approved") {
        return [];
      }

      let query = supabase
        .from('flash_sales')
        .select(SELLER_FLASH_SALE_SELECT)
        .eq('products.seller_id', account.seller.id)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as FlashSale[];
    },
    refetchInterval: 30000,
  });
};

export const useCreateSellerFlashSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFlashSaleData) => {
      const account = await fetchCurrentAccount();

      if (!account?.seller || account.seller.status !== "approved") {
        throw new Error("Approved seller access required");
      }

      const { data: ownedProduct, error: productError } = await supabase
        .from('products')
        .select('id, price, seller_id, status')
        .eq('id', data.product_id)
        .eq('seller_id', account.seller.id)
        .maybeSingle();

      if (productError) throw productError;
      if (!ownedProduct) {
        throw new Error("Produit vendeur introuvable ou non accessible.");
      }
      if (ownedProduct.status !== "active") {
        throw new Error("Seuls les produits actifs peuvent recevoir une vente flash.");
      }
      if (data.sale_price >= Number(ownedProduct.price)) {
        throw new Error("Le prix promotionnel doit etre inferieur au prix du produit.");
      }

      const { data: result, error } = await supabase
        .from('flash_sales')
        .insert([
          {
            ...data,
            original_price: Number(ownedProduct.price),
            starts_at: new Date().toISOString(),
            status: 'active',
            created_by: account.userId,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FLASH_SALES_KEY] });
      queryClient.invalidateQueries({ queryKey: [SELLER_FLASH_SALES_KEY] });
    },
  });
};

export const useUpdateSellerFlashSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateFlashSaleData;
    }) => {
      const account = await fetchCurrentAccount();

      if (!account?.seller || account.seller.status !== "approved") {
        throw new Error("Approved seller access required");
      }

      const { data: ownedSale, error: ownedSaleError } = await supabase
        .from('flash_sales')
        .select(SELLER_FLASH_SALE_SELECT)
        .eq('id', id)
        .eq('products.seller_id', account.seller.id)
        .maybeSingle();

      if (ownedSaleError) throw ownedSaleError;
      if (!ownedSale) {
        throw new Error("Vente flash vendeur introuvable ou non accessible.");
      }

      const originalPrice = Number(ownedSale.original_price || 0);
      if (
        data.sale_price !== undefined &&
        originalPrice > 0 &&
        Number(data.sale_price) >= originalPrice
      ) {
        throw new Error("Le prix promotionnel doit etre inferieur au prix original.");
      }

      const { data: result, error } = await supabase
        .from('flash_sales')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FLASH_SALES_KEY] });
      queryClient.invalidateQueries({ queryKey: [SELLER_FLASH_SALES_KEY] });
    },
  });
};

export const useDeleteSellerFlashSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const account = await fetchCurrentAccount();

      if (!account?.seller || account.seller.status !== "approved") {
        throw new Error("Approved seller access required");
      }

      const { data: ownedSale, error: ownedSaleError } = await supabase
        .from('flash_sales')
        .select(SELLER_FLASH_SALE_SELECT)
        .eq('id', id)
        .eq('products.seller_id', account.seller.id)
        .maybeSingle();

      if (ownedSaleError) throw ownedSaleError;
      if (!ownedSale) {
        throw new Error("Vente flash vendeur introuvable ou non accessible.");
      }

      const { error } = await supabase
        .from('flash_sales')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FLASH_SALES_KEY] });
      queryClient.invalidateQueries({ queryKey: [SELLER_FLASH_SALES_KEY] });
    },
  });
};

// Helper: Get time remaining (in seconds) for a flash sale
export const getTimeRemaining = (endsAt: string): number => {
  const now = new Date().getTime();
  const end = new Date(endsAt).getTime();
  return Math.max(0, Math.floor((end - now) / 1000));
};

// Helper: Format countdown as HH:MM:SS or DD:HH:MM:SS
export const formatCountdown = (totalSeconds: number): string => {
  if (totalSeconds <= 0) return '00:00:00';
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  if (days > 0) return `${days}J ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};
