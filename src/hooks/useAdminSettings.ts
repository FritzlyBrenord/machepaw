import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { AdminSettings, ShippingRate, CurrencySetting } from "@/data/types";

// --- Mappers ---

type ShippingRateRow = {
  id: string;
  name: string;
  base_rate: number | string | null;
  per_kg_rate: number | string | null;
  free_shipping_threshold?: number | string | null;
  is_active: boolean;
  regions?: string[] | null;
  min_quantity?: number | null;
  max_quantity?: number | null;
  category_id?: string | null;
  country?: string | null;
  city?: string | null;
  zone_scope?: ShippingRate["zoneScope"] | null;
  zone_values?: string[] | null;
  country_code?: string | null;
  priority?: number | null;
  sort_order?: number | null;
  base_price?: number | string | null;
  price_per_km?: number | string | null;
  location_name?: string | null;
  location_type?: string | null;
  location_dept?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
};


type SettingsRow = {
  site_name?: string | null;
  site_description?: string | null;
  contact_email?: string | null;
  support_phone?: string | null;
  maintenance_mode?: boolean | null;
  allow_new_registrations?: boolean | null;
  require_email_verification?: boolean | null;
  seller_commission_rate?: number | string | null;
  auto_approve_sellers?: boolean | null;
  default_shipping_base_rate?: number | string | null;
  tax_rate?: number | string | null;
  base_price?: number | string | null;
  price_per_km?: number | string | null;
  location_name?: string | null;
  location_type?: string | null;
  location_dept?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  allow_pickup?: boolean | null;
  pickup_address?: string | null;
};

const getLegacyScope = (rate: ShippingRateRow): ShippingRate["zoneScope"] => {
  if (rate.zone_scope) {
    return rate.zone_scope;
  }

  if (rate.city) {
    return "city";
  }

  if (rate.country) {
    return "country";
  }

  return "global";
};

const getLegacyZoneValues = (rate: ShippingRateRow) => {
  if (Array.isArray(rate.zone_values) && rate.zone_values.length > 0) {
    return rate.zone_values;
  }

  if (rate.city) {
    return [rate.city];
  }

  if (rate.country) {
    return [rate.country];
  }

  return Array.isArray(rate.regions) ? rate.regions : [];
};

const mapDbToShippingRate = (rate: ShippingRateRow): ShippingRate => ({
  id: rate.id,
  name: rate.name,
  baseRate: Number(rate.base_rate),
  perKgRate: Number(rate.per_kg_rate),
  freeShippingThreshold: rate.free_shipping_threshold ? Number(rate.free_shipping_threshold) : undefined,
  isActive: rate.is_active,
  zoneScope: getLegacyScope(rate),
  zoneValues: getLegacyZoneValues(rate),
  countryCode: rate.country_code || rate.country || undefined,
  priority: rate.priority ?? rate.sort_order ?? 0,
  regions: rate.regions || [],
  minQuantity: rate.min_quantity ?? undefined,
  maxQuantity: rate.max_quantity ?? undefined,
  categoryId: rate.category_id ?? undefined,
  country: rate.country ?? undefined,
  city: rate.city ?? undefined,
  basePrice: rate.base_price ? Number(rate.base_price) : undefined,
  pricePerKm: rate.price_per_km ? Number(rate.price_per_km) : undefined,
  locationName: rate.location_name ?? undefined,
  locationType: rate.location_type ?? undefined,
  locationDept: rate.location_dept ?? undefined,
  latitude: rate.latitude ? Number(rate.latitude) : undefined,
  longitude: rate.longitude ? Number(rate.longitude) : undefined,
});


const mapShippingRateToDb = (rate: Partial<ShippingRate>) => ({
  name: rate.name,
  base_rate: rate.baseRate,
  per_kg_rate: rate.perKgRate,
  free_shipping_threshold: rate.freeShippingThreshold,
  is_active: rate.isActive,
  regions: rate.zoneValues || rate.regions,
  zone_scope: rate.zoneScope || (rate.city ? "city" : rate.country ? "country" : "global"),
  zone_values: rate.zoneValues || rate.regions || [],
  country_code: rate.countryCode || rate.country,
  priority: rate.priority ?? 0,
  min_quantity: rate.minQuantity,
  max_quantity: rate.maxQuantity,
  category_id: rate.categoryId,
  country:
    rate.country ||
    (rate.zoneScope === "country" ? rate.zoneValues?.[0] : rate.countryCode) ||
    null,
  city:
    rate.city ||
    (rate.zoneScope === "city" && rate.zoneValues?.length === 1
      ? rate.zoneValues[0]
      : null),
  base_price: rate.basePrice,
  price_per_km: rate.pricePerKm,
  location_name: rate.locationName,
  location_type: rate.locationType,
  location_dept: rate.locationDept,
  latitude: rate.latitude,
  longitude: rate.longitude,
});


const mapDbToSettings = (settings: SettingsRow): Partial<AdminSettings> => ({
  siteName: settings.site_name ?? undefined,
  siteDescription: settings.site_description ?? undefined,
  contactEmail: settings.contact_email ?? undefined,
  supportPhone: settings.support_phone ?? undefined,
  maintenanceMode: settings.maintenance_mode ?? undefined,
  allowNewRegistrations: settings.allow_new_registrations ?? undefined,
  requireEmailVerification: settings.require_email_verification ?? undefined,
  sellerCommissionRate: Number(settings.seller_commission_rate),
  autoApproveSellers: settings.auto_approve_sellers ?? undefined,
  defaultShippingBaseRate: Number(settings.default_shipping_base_rate || 0),
  taxRate: settings.tax_rate ? Number(settings.tax_rate) : undefined,
  allowPickup: settings.allow_pickup ?? undefined,
  pickupAddress: settings.pickup_address ?? undefined,
});


const mapSettingsToDb = (settings: Partial<AdminSettings>) => ({
  site_name: settings.siteName,
  site_description: settings.siteDescription,
  contact_email: settings.contactEmail,
  support_phone: settings.supportPhone,
  maintenance_mode: settings.maintenanceMode,
  allow_new_registrations: settings.allowNewRegistrations,
  require_email_verification: settings.requireEmailVerification,
  seller_commission_rate: settings.sellerCommissionRate,
  auto_approve_sellers: settings.autoApproveSellers,
  default_shipping_base_rate: settings.defaultShippingBaseRate,
  tax_rate: settings.taxRate,
  allow_pickup: settings.allowPickup,
  pickup_address: settings.pickupAddress,
});


// --- Hooks ---

export function useAdminSettingsQuery() {
  return useQuery({
    queryKey: ["admin-settings-full"],
    queryFn: async () => {
      // 1. Fetch General Settings
      const { data: settingsData, error: settingsError } = await supabase
        .from("settings")
        .select("*")
        .single();

      if (settingsError && settingsError.code !== "PGRST116") throw settingsError;

      // 2. Fetch Currencies
      const { data: currenciesData, error: currenciesError } = await supabase
        .from("currencies")
        .select("*")
        .order("is_default", { ascending: false });

      if (currenciesError) throw currenciesError;

      // 3. Fetch Shipping Rates
      const { data: shippingData, error: shippingError } = await supabase
        .from("shipping_rates")
        .select("*")
        .order("created_at", { ascending: true });

      if (shippingError) throw shippingError;

      const settings = settingsData ? mapDbToSettings(settingsData) : {};
      const rates = (shippingData || []).map(mapDbToShippingRate);
      const firstRate = rates[0];

      return {
        ...settings,
        currencies: (currenciesData || []).map(c => ({
          code: c.code,
          name: c.name,
          symbol: c.symbol,
          exchangeRate: Number(c.exchange_rate),
          isActive: c.is_active,
          isDefault: c.is_default,
          decimals: c.decimals
        })),
        shippingRates: rates,
        // Map global distance fields from the first rate
        basePrice: firstRate?.basePrice,
        pricePerKm: firstRate?.pricePerKm,
        locationName: firstRate?.locationName,
        locationType: firstRate?.locationType,
        locationDept: firstRate?.locationDept,
        latitude: firstRate?.latitude,
        longitude: firstRate?.longitude,
      } as AdminSettings;
    }
  });
}


export function useUpdateAdminSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Partial<AdminSettings>) => {
      const dbPayload = mapSettingsToDb(settings);
      // We assume there's only one settings row
      const { data: existing } = await supabase.from("settings").select("id").single();

      let result;
      if (existing) {
        result = await supabase.from("settings").update(dbPayload).eq("id", existing.id);
      } else {
        result = await supabase.from("settings").insert(dbPayload);
      }

      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings-full"] });
    }
  });
}

export function useUpsertShippingRateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rate: Partial<ShippingRate> & { id?: string }) => {
      const dbPayload = mapShippingRateToDb(rate);

      let result;
      if (rate.id && !rate.id.startsWith("ship-")) { // Real UUID from DB
        result = await supabase.from("shipping_rates").update(dbPayload).eq("id", rate.id);
      } else {
        result = await supabase.from("shipping_rates").insert(dbPayload);
      }

      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings-full"] });
    }
  });
}

export function useDeleteShippingRateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rateId: string) => {
      if (rateId.startsWith("ship-")) return; // Local temp ID
      const { error } = await supabase.from("shipping_rates").delete().eq("id", rateId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings-full"] });
    }
  });
}

export function useUpsertCurrencyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (currency: CurrencySetting) => {
      const dbPayload = {
        code: currency.code,
        name: currency.name,
        symbol: currency.symbol,
        exchange_rate: currency.exchangeRate,
        is_active: currency.isActive,
        is_default: currency.isDefault,
        decimals: currency.decimals,
      };

      if (currency.isDefault) {
        await supabase.from("currencies").update({ is_default: false }).neq("code", currency.code);
      }

      const { data: existing } = await supabase
        .from("currencies")
        .select("id")
        .eq("code", currency.code)
        .maybeSingle();

      let result;
      if (existing) {
        result = await supabase.from("currencies").update(dbPayload).eq("id", existing.id);
      } else {
        result = await supabase.from("currencies").insert(dbPayload);
      }

      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings-full"] });
    }
  });
}

export function useDeleteCurrencyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      const { error } = await supabase.from("currencies").delete().eq("code", code);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings-full"] });
    }
  });
}
