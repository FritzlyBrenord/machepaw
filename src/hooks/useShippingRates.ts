import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface ShippingRate {
  id: string;
  name: string;
  base_rate: number;
  per_kg_rate: number;
  free_shipping_threshold: number | null;
  is_active: boolean;
  base_price: number;
  price_per_km: number;
  latitude: number;
  longitude: number;
  currency_code: string;
  is_free_enabled: boolean;
  priority: number;
}

export function useShippingRates() {
  return useQuery({
    queryKey: ["shipping-rates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shipping_rates")
        .select("*")
        .eq("is_active", true)
        .order("priority", { ascending: false })
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as ShippingRate[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes cache
  });
}

export function useDefaultShippingRate() {
  return useQuery({
    queryKey: ["default-shipping-rate"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shipping_rates")
        .select("*")
        .eq("is_active", true)
        .order("priority", { ascending: false })
        .order("created_at", { ascending: true })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data as ShippingRate | null;
    },
    staleTime: 10 * 60 * 1000,
  });
}
