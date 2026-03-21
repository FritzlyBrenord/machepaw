"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Address, Order } from "@/data/types";

type BoutiqueClientSession = {
  store: {
    id: string;
    storeSlug: string;
    businessName: string;
  };
  customer: {
    id: string;
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    avatar?: string;
    status: "active" | "blocked";
    createdAt: string;
    updatedAt: string;
    lastLoginAt?: string;
  };
};

const sessionKey = (slug: string) => ["boutique-client-session", slug];
const addressesKey = (slug: string) => ["boutique-client-addresses", slug];
const ordersKey = (slug: string) => ["boutique-client-orders", slug];

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof payload?.error === "string"
        ? payload.error
        : "Une erreur est survenue.";
    throw new Error(message);
  }

  return payload as T;
}

async function fetchBoutiqueClientSession(slug: string) {
  const response = await fetch(`/api/boutique-auth/${slug}/session`, {
    credentials: "include",
    cache: "no-store",
  });
  const payload = await parseResponse<{ session: BoutiqueClientSession | null }>(response);
  return payload.session;
}

export function useBoutiqueClientSessionQuery(slug: string) {
  return useQuery({
    queryKey: sessionKey(slug),
    queryFn: () => fetchBoutiqueClientSession(slug),
    enabled: Boolean(slug),
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useBoutiqueClientRegisterMutation(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      password: string;
    }) => {
      const response = await fetch(`/api/boutique-auth/${slug}/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      return parseResponse<{ success: boolean }>(response);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: sessionKey(slug) });
      await queryClient.refetchQueries({
        queryKey: sessionKey(slug),
        type: "active",
      });
      await queryClient.invalidateQueries({ queryKey: addressesKey(slug) });
      await queryClient.invalidateQueries({ queryKey: ordersKey(slug) });
    },
  });
}

export function useBoutiqueClientLoginMutation(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { email: string; password: string }) => {
      const response = await fetch(`/api/boutique-auth/${slug}/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      return parseResponse<{ success: boolean }>(response);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: sessionKey(slug) });
      await queryClient.refetchQueries({
        queryKey: sessionKey(slug),
        type: "active",
      });
      await queryClient.invalidateQueries({ queryKey: addressesKey(slug) });
      await queryClient.invalidateQueries({ queryKey: ordersKey(slug) });
    },
  });
}

export function useBoutiqueClientLogoutMutation(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/boutique-auth/${slug}/logout`, {
        method: "POST",
        credentials: "include",
      });

      return parseResponse<{ success: boolean }>(response);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: sessionKey(slug) });
      await queryClient.refetchQueries({
        queryKey: sessionKey(slug),
        type: "active",
      });
      await queryClient.invalidateQueries({ queryKey: addressesKey(slug) });
      await queryClient.invalidateQueries({ queryKey: ordersKey(slug) });
    },
  });
}

export function useBoutiqueClientProfileMutation(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      firstName: string;
      lastName: string;
      phone?: string;
      avatar?: string;
    }) => {
      const response = await fetch(`/api/boutique-auth/${slug}/profile`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      return parseResponse<{ success: boolean }>(response);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: sessionKey(slug) });
      await queryClient.refetchQueries({
        queryKey: sessionKey(slug),
        type: "active",
      });
    },
  });
}

export function useBoutiqueClientAvatarUploadMutation(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/boutique-auth/${slug}/profile/avatar`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      return parseResponse<{ avatarUrl: string }>(response);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: sessionKey(slug) });
      await queryClient.refetchQueries({
        queryKey: sessionKey(slug),
        type: "active",
      });
    },
  });
}

export function useBoutiqueClientAddressesQuery(slug: string, enabled = true) {
  return useQuery({
    queryKey: addressesKey(slug),
    queryFn: async () => {
      const response = await fetch(`/api/boutique-auth/${slug}/addresses`, {
        credentials: "include",
        cache: "no-store",
      });
      const payload = await parseResponse<{ addresses: Address[] }>(response);
      return payload.addresses;
    },
    enabled: Boolean(slug && enabled),
  });
}

export function useAddBoutiqueClientAddressMutation(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (address: Address) => {
      const response = await fetch(`/api/boutique-auth/${slug}/addresses`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(address),
      });
      const payload = await parseResponse<{ address: Address }>(response);
      return payload.address;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: addressesKey(slug) });
    },
  });
}

export function useUpdateBoutiqueClientAddressMutation(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, address }: { id: string; address: Address }) => {
      const response = await fetch(`/api/boutique-auth/${slug}/addresses/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(address),
      });
      const payload = await parseResponse<{ address: Address }>(response);
      return payload.address;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: addressesKey(slug) });
    },
  });
}

export function useDeleteBoutiqueClientAddressMutation(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (addressId: string) => {
      const response = await fetch(`/api/boutique-auth/${slug}/addresses/${addressId}`, {
        method: "DELETE",
        credentials: "include",
      });
      return parseResponse<{ success: boolean }>(response);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: addressesKey(slug) });
    },
  });
}

export function useBoutiqueClientOrdersQuery(slug: string, enabled = true) {
  return useQuery({
    queryKey: ordersKey(slug),
    queryFn: async () => {
      const response = await fetch(`/api/boutique-auth/${slug}/orders`, {
        credentials: "include",
        cache: "no-store",
      });
      const payload = await parseResponse<{ orders: Order[] }>(response);
      return payload.orders;
    },
    enabled: Boolean(slug && enabled),
  });
}

export function useBoutiqueClientOrderQuery(
  slug: string,
  orderId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: [...ordersKey(slug), orderId],
    queryFn: async () => {
      const response = await fetch(`/api/boutique-auth/${slug}/orders/${orderId}`, {
        credentials: "include",
        cache: "no-store",
      });
      const payload = await parseResponse<{ order: Order | null }>(response);
      return payload.order;
    },
    enabled: Boolean(slug && orderId && enabled),
  });
}

export function useUploadBoutiquePaymentProofMutation(slug: string) {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/boutique-auth/${slug}/payment-proof`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      return parseResponse<{ filePath: string }>(response);
    },
  });
}

export function useCreateBoutiqueOrderMutation(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      shippingAddress: Address;
      items: { productId: string; quantity: number }[];
      shippingAmount: number;
      fulfillmentMethod?: "delivery" | "pickup";
      taxAmount: number;
      paymentMethod?: string;
      paymentId?: string;
      paymentProofUrl?: string;
      notes?: string;
    }) => {
      const response = await fetch(`/api/boutique-auth/${slug}/orders`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      return parseResponse<{
        order: {
          order_id: string;
          order_number: string;
          subtotal: number;
          shipping: number;
          tax: number;
          total: number;
        } | null;
      }>(response);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ordersKey(slug) });
    },
  });
}
