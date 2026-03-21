"use client";

import { useCallback, useState } from "react";
import { supabase, uploadImage } from "@/lib/supabase";
import { useStore } from "@/store";
import { useRouter } from "next/navigation";
import type { Address, CartItem } from "@/data/types";

type AuthMetadata = Record<string, unknown>;

type AddressRow = {
  id: string;
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
  is_default?: boolean | null;
  label?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

type CheckoutOrderInput = {
  shipping: number;
  tax: number;
  paymentMethod?: string;
  paymentId?: string;
  paymentProofUrl?: string;
  shippingAddress: Address;
  notes?: string;
};

type MarketplaceOrderResult = {
  order_id: string;
  order_number: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
};

function getErrorMessage(error: unknown, fallback = "Une erreur est survenue") {
  return error instanceof Error ? error.message : fallback;
}

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { setUser, setAuthenticated } = useStore();

  const signUp = async (email: string, password: string, metadata?: AuthMetadata) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) throw error;
      return data;
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Impossible de creer le compte.");
      setError(message);
      throw err instanceof Error ? err : new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Connexion impossible.");
      setError(message);
      throw err instanceof Error ? err : new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      return data;
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Connexion Google impossible.");
      setError(message);
      throw err instanceof Error ? err : new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setAuthenticated(false);
      router.push("/");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Deconnexion impossible."));
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (metadata: AuthMetadata) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: metadata,
      });

      if (error) throw error;
      
      // Update local store (AuthProvider will catch it too)
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || "",
          firstName: data.user.user_metadata?.first_name || "",
          lastName: data.user.user_metadata?.last_name || "",
          avatar: data.user.user_metadata?.avatar_url || "",
          addresses: [], // Initialized as empty, will be fetched separately
          wishlist: [],
          orders: [],
          createdAt: data.user.created_at,
        });
      }
      
      return data;
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Mise a jour du profil impossible.");
      setError(message);
      throw err instanceof Error ? err : new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const fileExt = file.name.split(".").pop();
      const filePath = `${userData.user.id}/avatar.${fileExt}`;

      const publicUrl = await uploadImage("avatars", filePath, file);
      if (!publicUrl) throw new Error("Upload failed");

      // Update profile with new avatar URL
      await updateProfile({ avatar_url: publicUrl });
      
      return publicUrl;
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Upload avatar impossible.");
      setError(message);
      throw err instanceof Error ? err : new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false });

    if (error) {
      console.error("Error fetching addresses:", error);
      return [];
    }

    return (data as AddressRow[]).map((addr) => ({
      id: addr.id,
      firstName: addr.first_name,
      lastName: addr.last_name,
      address: addr.address,
      apartment: addr.apartment || undefined,
      city: addr.city,
      postalCode: addr.postal_code,
      country: addr.country,
      phone: addr.phone,
      isDefault: addr.is_default || undefined,
      communalSection: addr.communal_section || undefined,
      arrondissement: addr.arrondissement || undefined,
      department: addr.department || undefined,
      commune: addr.commune || undefined,
      label: addr.label || undefined,
      latitude: addr.latitude || undefined,
      longitude: addr.longitude || undefined,
    }));
  }, []);

  const addAddressInDb = async (address: Address) => {
    console.log("addAddressInDb called with:", address);
    
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    console.log("User authenticated:", user.id);

    // Préparer les données pour l'insertion - seulement les champs qui existent dans la BD
    const addressData = {
      user_id: user.id,
      first_name: address.firstName || '',
      last_name: address.lastName || '',
      address: address.address || '',
      apartment: address.apartment || null,
      department: address.department || null,
      commune: address.commune || null,
      city: address.country === 'Haiti' ? (address.commune || '') : (address.city || ''),
      postal_code: address.country === 'Haiti' ? '' : (address.postalCode || ''),
      country: address.country || 'Haiti',
      phone: address.phone || '',
      is_default: address.isDefault || false,
      communal_section: address.communalSection || null,
      arrondissement: address.arrondissement || null,
      label: address.label || 'Domicile',
      // Inclure les coordonnées si elles existent
      latitude: address.latitude || null,
      longitude: address.longitude || null,
    };

    console.log("Prepared address data for DB:", addressData);

    const { data, error } = await supabase
      .from("addresses")
      .insert(addressData)
      .select()
      .single();

    if (error) {
      console.error("Supabase error inserting address:", {
        error,
        details: error.details,
        hint: error.hint,
        code: error.code,
        message: error.message,
        addressData
      });
      throw new Error(`Erreur base de données: ${error.message || 'Erreur inconnue'}`);
    }

    console.log("Address successfully inserted:", data);
    return data;
  };

  const updateAddressInDb = async (id: string, address: Address) => {
    const { error } = await supabase
      .from("addresses")
      .update({
        first_name: address.firstName,
        last_name: address.lastName,
        address: address.address,
        apartment: address.apartment,
        department: address.department,
        commune: address.commune,
        city: address.city,
        postal_code: address.postalCode,
        country: address.country,
        phone: address.phone,
        is_default: address.isDefault,
        communal_section: address.communalSection,
        arrondissement: address.arrondissement,
        label: address.label,
        // Inclure les coordonnées si elles existent
        latitude: address.latitude || null,
        longitude: address.longitude || null,
      })
      .eq("id", id);

    if (error) throw error;
  };

  const deleteAddressFromDb = async (id: string) => {
    const { error } = await supabase
      .from("addresses")
      .delete()
      .eq("id", id);

    if (error) throw error;
  };

  const uploadPaymentProof = async (file: File): Promise<string> => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Not authenticated");

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const filePath = `${userData.user.id}/${Date.now()}-${sanitizedName}`;

    const { error: uploadError } = await supabase.storage
      .from("payment-proofs")
      .upload(filePath, file, {
        upsert: true,
      });

    if (uploadError) throw uploadError;

    return filePath;
  };

  const createOrderInDb = async (
    orderData: CheckoutOrderInput,
    items: CartItem[],
  ): Promise<MarketplaceOrderResult | null> => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Not authenticated");

    const rpcItems = items.map((item) => ({
      product_id: item.product.id,
      quantity: item.quantity,
    }));

    const { data, error: orderError } = await supabase.rpc(
      "create_marketplace_order",
      {
        p_shipping_address: orderData.shippingAddress,
        p_items: rpcItems,
        p_shipping_amount: orderData.shipping || 0,
        p_tax_amount: orderData.tax || 0,
        p_payment_method: orderData.paymentMethod || null,
        p_payment_id: orderData.paymentId || null,
        p_payment_proof_path: orderData.paymentProofUrl || null,
        p_notes: orderData.notes || null,
      },
    );

    if (orderError) {
      console.error("Supabase RPC Error Details:", JSON.stringify(orderError, null, 2));
      throw new Error(`RPC Error: ${orderError.message || JSON.stringify(orderError)}`);
    }

    return Array.isArray(data)
      ? (data[0] as MarketplaceOrderResult | null)
      : (data as MarketplaceOrderResult | null);
  };

  return {
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
    uploadAvatar,
    uploadPaymentProof,
    fetchAddresses,
    addAddressInDb,
    updateAddressInDb,
    deleteAddressFromDb,
    createOrderInDb,
    loading,
    error,
  };
}
