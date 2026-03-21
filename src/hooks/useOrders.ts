"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { fetchCurrentAccount } from "@/hooks/useAccount";
import type { AdminOrder, OrderStatus } from "@/data/types";

const ORDERS_QUERY_KEY = ["orders"];
const ADMIN_ORDERS_QUERY_KEY = ["admin-orders"];

// Mapper for Supabase order to AdminOrder/Order type
export const mapSupabaseOrderToOrder = (item: any): any => {
  return {
    id: item.order_number || item.id,
    orderNumber: item.order_number,
    userId: item.user_id,
    status: item.status as OrderStatus,
    subtotal: Number(item.subtotal),
    shipping: Number(item.shipping),
    tax: Number(item.tax),
    discount: Number(item.discount || 0),
    total: Number(item.total),
    currency: item.currency || 'HTG',
    shippingAddress: typeof item.shipping_address === 'string' 
      ? JSON.parse(item.shipping_address) 
      : item.shipping_address,
    trackingNumber: item.tracking_number,
    estimatedDelivery: item.estimated_delivery,
    deliveredAt: item.delivered_at,
    paymentMethod: item.payment_method,
    paymentStatus: item.payment_status,
    paymentId: item.payment_id,
    paymentProofUrl: item.payment_proof_url
      ? (item.payment_proof_url.startsWith('http')
          ? item.payment_proof_url
          : supabase.storage.from('payment-proofs').getPublicUrl(item.payment_proof_url).data.publicUrl)
      : undefined,
    notes: item.notes,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    items: (item.items || []).map((oi: any) => ({
      id: oi.id,
      productId: oi.product_id,
      name: oi.name,
      sku: oi.sku,
      image: oi.image,
      price: Number(oi.price),
      quantity: Number(oi.quantity),
      total: Number(oi.total),
      product: {
        id: oi.product_id,
        name: oi.name,
        images: [oi.image],
        price: Number(oi.price),
        minProcessingDays: oi.min_processing_days,
        maxProcessingDays: oi.max_processing_days,
      }
    }))
  };
};

// --- Client: Fetch User Orders ---
export function useUserOrdersQuery(userId?: string) {
  return useQuery({
    queryKey: [...ORDERS_QUERY_KEY, userId],
    queryFn: async () => {
      const account = await fetchCurrentAccount();

      if (!account) return [];

      const targetUserId =
        account.role === "admin" && userId ? userId : account.userId;
      
      const { data, error } = await supabase
        .from("order_details")
        .select("*")
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map(mapSupabaseOrderToOrder);
    },
    enabled: !!userId || userId === undefined,
  });
}

// --- Fetch Single Order ---
export function useSingleOrderQuery(orderNumber?: string) {
  return useQuery({
    queryKey: [...ORDERS_QUERY_KEY, orderNumber],
    queryFn: async () => {
      if (!orderNumber) return null;

      const account = await fetchCurrentAccount();

      if (!account) {
        return null;
      }
      
      let query = supabase
        .from("order_details")
        .select("*")
        .eq("order_number", orderNumber);

      if (account.role !== "admin") {
        query = query.eq("user_id", account.userId);
      }

      const { data, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows found
        throw error;
      }
      return mapSupabaseOrderToOrder(data);
    },
    enabled: !!orderNumber,
  });
}

// --- Admin: Fetch All Orders ---
export function useAdminOrdersQuery() {
  return useQuery({
    queryKey: ADMIN_ORDERS_QUERY_KEY,
    queryFn: async () => {
      const account = await fetchCurrentAccount();

      if (!account || account.role !== "admin") {
        return [];
      }

      const { data, error } = await supabase
        .from("order_details")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map(mapSupabaseOrderToOrder);
    },
  });
}

// --- Admin: Update Order Status ---
export function useUpdateOrderStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status, trackingNumber }: { orderId: string, status: OrderStatus, trackingNumber?: string }) => {
      const account = await fetchCurrentAccount();

      if (!account || account.role !== "admin") {
        throw new Error("Admin access required");
      }

      // Need to find the UUID if orderId is the order_number
      const { data: order } = await supabase
        .from("orders")
        .select("id")
        .eq("order_number", orderId)
        .maybeSingle();
      
      const targetId = order?.id || orderId;

      const { data, error } = await supabase
        .from("orders")
        .update({ 
          status, 
          tracking_number: trackingNumber,
          updated_at: new Date().toISOString()
        })
        .eq("id", targetId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
    },
  });
}

export function useUpdateOrderPaymentStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, paymentStatus }: { orderId: string, paymentStatus: string }) => {
      const account = await fetchCurrentAccount();

      if (!account || account.role !== "admin") {
        throw new Error("Admin access required");
      }

      const { data: order } = await supabase
        .from("orders")
        .select("id")
        .eq("order_number", orderId)
        .maybeSingle();
      
      const targetId = order?.id || orderId;

      const { data, error } = await supabase
        .from("orders")
        .update({ 
          payment_status: paymentStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", targetId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
    },
  });
}

export function useUpdateOrderDeliveryDateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, estimatedDelivery }: { orderId: string, estimatedDelivery: string | null }) => {
      const account = await fetchCurrentAccount();

      if (!account || account.role !== "admin") {
        throw new Error("Admin access required");
      }

      const { data: order } = await supabase
        .from("orders")
        .select("id")
        .eq("order_number", orderId)
        .maybeSingle();
      
      const targetId = order?.id || orderId;

      const { data, error } = await supabase
        .from("orders")
        .update({ 
          estimated_delivery: estimatedDelivery,
          updated_at: new Date().toISOString()
        })
        .eq("id", targetId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
    },
  });
}
