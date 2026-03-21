"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { fetchCurrentAccount, useCurrentAccountQuery } from "@/hooks/useAccount";
import type { Address, BoutiqueCustomer } from "@/data/types";

const BOUTIQUE_CUSTOMER_QUERY_KEY = ["boutique-customer"];
const BOUTIQUE_CUSTOMER_ADDRESSES_QUERY_KEY = ["boutique-customer-addresses"];

type BoutiqueCustomerRow = {
  id: string;
  seller_id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  status: "active" | "blocked";
  created_at: string;
  updated_at: string;
  last_login_at?: string | null;
};

type BoutiqueCustomerAddressRow = {
  id: string;
  seller_id: string;
  user_id: string;
  boutique_customer_id: string;
  label?: string | null;
  first_name: string;
  last_name: string;
  address: string;
  apartment?: string | null;
  department?: string | null;
  arrondissement?: string | null;
  commune?: string | null;
  communal_section?: string | null;
  city: string;
  postal_code: string;
  country: string;
  phone: string;
  latitude?: number | null;
  longitude?: number | null;
  is_default?: boolean | null;
};

function mapBoutiqueCustomerRow(row: BoutiqueCustomerRow): BoutiqueCustomer {
  return {
    id: row.id,
    sellerId: row.seller_id,
    userId: row.user_id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone || undefined,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLoginAt: row.last_login_at || undefined,
  };
}

function mapBoutiqueAddressRow(row: BoutiqueCustomerAddressRow): Address {
  return {
    id: row.id,
    label: row.label || undefined,
    firstName: row.first_name,
    lastName: row.last_name,
    address: row.address,
    apartment: row.apartment || undefined,
    department: row.department || undefined,
    arrondissement: row.arrondissement || undefined,
    commune: row.commune || undefined,
    communalSection: row.communal_section || undefined,
    city: row.city,
    postalCode: row.postal_code,
    country: row.country,
    phone: row.phone,
    latitude: row.latitude || undefined,
    longitude: row.longitude || undefined,
    isDefault: row.is_default || false,
  };
}

async function fetchRequiredAccount() {
  const account = await fetchCurrentAccount();

  if (!account) {
    throw new Error("Authentication required");
  }

  return account;
}

export async function fetchBoutiqueCustomer(sellerId: string) {
  const account = await fetchCurrentAccount();

  if (!account) {
    return null;
  }

  const { data, error } = await supabase
    .from("boutique_customers")
    .select("*")
    .eq("seller_id", sellerId)
    .eq("user_id", account.userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapBoutiqueCustomerRow(data as BoutiqueCustomerRow) : null;
}

async function ensureBoutiqueCustomerRecord(sellerId: string) {
  const account = await fetchRequiredAccount();

  const { data: existingCustomer, error: existingCustomerError } = await supabase
    .from("boutique_customers")
    .select("*")
    .eq("seller_id", sellerId)
    .eq("user_id", account.userId)
    .maybeSingle();

  if (existingCustomerError) {
    throw existingCustomerError;
  }

  if (existingCustomer) {
    if ((existingCustomer as BoutiqueCustomerRow).status === "blocked") {
      throw new Error(
        "Votre compte client pour cette boutique est bloque. Contactez directement la boutique.",
      );
    }

    const { data, error } = await supabase
      .from("boutique_customers")
      .update({
        email: account.email,
        first_name: account.firstName,
        last_name: account.lastName,
        phone: account.phone || null,
        last_login_at: new Date().toISOString(),
      })
      .eq("id", (existingCustomer as BoutiqueCustomerRow).id)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return mapBoutiqueCustomerRow(data as BoutiqueCustomerRow);
  }

  const payload = {
    seller_id: sellerId,
    user_id: account.userId,
    email: account.email,
    first_name: account.firstName,
    last_name: account.lastName,
    phone: account.phone || null,
    status: "active" as const,
    last_login_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("boutique_customers")
    .upsert(payload, { onConflict: "seller_id,user_id" })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapBoutiqueCustomerRow(data as BoutiqueCustomerRow);
}

export async function fetchBoutiqueCustomerAddresses(sellerId: string) {
  const account = await fetchCurrentAccount();

  if (!account) {
    return [];
  }

  const { data, error } = await supabase
    .from("boutique_customer_addresses")
    .select("*")
    .eq("seller_id", sellerId)
    .eq("user_id", account.userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return ((data || []) as BoutiqueCustomerAddressRow[]).map(mapBoutiqueAddressRow);
}

async function clearDefaultBoutiqueAddresses(sellerId: string, userId: string, keepId?: string) {
  let query = supabase
    .from("boutique_customer_addresses")
    .update({ is_default: false })
    .eq("seller_id", sellerId)
    .eq("user_id", userId)
    .eq("is_default", true);

  if (keepId) {
    query = query.neq("id", keepId);
  }

  const { error } = await query;

  if (error) {
    throw error;
  }
}

export function useBoutiqueCustomerQuery(sellerId: string) {
  const { data: account } = useCurrentAccountQuery();

  return useQuery({
    queryKey: [...BOUTIQUE_CUSTOMER_QUERY_KEY, sellerId, account?.userId],
    queryFn: () => fetchBoutiqueCustomer(sellerId),
    enabled: Boolean(sellerId && account?.userId),
  });
}

export function useJoinBoutiqueCustomerMutation(sellerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => ensureBoutiqueCustomerRecord(sellerId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...BOUTIQUE_CUSTOMER_QUERY_KEY, sellerId],
      });
    },
  });
}

export function useBoutiqueCustomerAddressesQuery(
  sellerId: string,
  enabled = true,
) {
  const { data: account } = useCurrentAccountQuery();

  return useQuery({
    queryKey: [...BOUTIQUE_CUSTOMER_ADDRESSES_QUERY_KEY, sellerId, account?.userId],
    queryFn: () => fetchBoutiqueCustomerAddresses(sellerId),
    enabled: Boolean(sellerId && account?.userId && enabled),
  });
}

export function useAddBoutiqueCustomerAddressMutation(sellerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (address: Address) => {
      const account = await fetchRequiredAccount();
      const boutiqueCustomer = await ensureBoutiqueCustomerRecord(sellerId);

      if (address.isDefault) {
        await clearDefaultBoutiqueAddresses(sellerId, account.userId);
      }

      const payload = {
        seller_id: sellerId,
        user_id: account.userId,
        boutique_customer_id: boutiqueCustomer.id,
        label: address.label || "Domicile",
        first_name: address.firstName || "",
        last_name: address.lastName || "",
        address: address.address || "",
        apartment: address.apartment || null,
        department: address.department || null,
        arrondissement: address.arrondissement || null,
        commune: address.commune || null,
        communal_section: address.communalSection || null,
        city: address.country === "Haiti" ? address.commune || address.city || "" : address.city || "",
        postal_code: address.country === "Haiti" ? address.postalCode || "" : address.postalCode || "",
        country: address.country || "Haiti",
        phone: address.phone || "",
        latitude: address.latitude || null,
        longitude: address.longitude || null,
        is_default: Boolean(address.isDefault),
      };

      const { data, error } = await supabase
        .from("boutique_customer_addresses")
        .insert(payload)
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return mapBoutiqueAddressRow(data as BoutiqueCustomerAddressRow);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...BOUTIQUE_CUSTOMER_ADDRESSES_QUERY_KEY, sellerId],
      });
      await queryClient.invalidateQueries({
        queryKey: [...BOUTIQUE_CUSTOMER_QUERY_KEY, sellerId],
      });
    },
  });
}

export function useUpdateBoutiqueCustomerAddressMutation(sellerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, address }: { id: string; address: Address }) => {
      const account = await fetchRequiredAccount();

      if (address.isDefault) {
        await clearDefaultBoutiqueAddresses(sellerId, account.userId, id);
      }

      const payload = {
        label: address.label || "Domicile",
        first_name: address.firstName,
        last_name: address.lastName,
        address: address.address,
        apartment: address.apartment || null,
        department: address.department || null,
        arrondissement: address.arrondissement || null,
        commune: address.commune || null,
        communal_section: address.communalSection || null,
        city: address.country === "Haiti" ? address.commune || address.city || "" : address.city,
        postal_code: address.postalCode || "",
        country: address.country,
        phone: address.phone,
        latitude: address.latitude || null,
        longitude: address.longitude || null,
        is_default: Boolean(address.isDefault),
      };

      const { data, error } = await supabase
        .from("boutique_customer_addresses")
        .update(payload)
        .eq("id", id)
        .eq("seller_id", sellerId)
        .eq("user_id", account.userId)
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return mapBoutiqueAddressRow(data as BoutiqueCustomerAddressRow);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...BOUTIQUE_CUSTOMER_ADDRESSES_QUERY_KEY, sellerId],
      });
    },
  });
}

export function useDeleteBoutiqueCustomerAddressMutation(sellerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (addressId: string) => {
      const account = await fetchRequiredAccount();
      const { error } = await supabase
        .from("boutique_customer_addresses")
        .delete()
        .eq("id", addressId)
        .eq("seller_id", sellerId)
        .eq("user_id", account.userId);

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...BOUTIQUE_CUSTOMER_ADDRESSES_QUERY_KEY, sellerId],
      });
    },
  });
}
