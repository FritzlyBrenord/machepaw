import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import haitiData from "@/data/haitiData.json";

function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(supabaseUrl, supabaseKey);
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const radiusKm = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return radiusKm * c;
}

function getLocationDepartment(entry: Record<string, unknown>) {
  const match = Object.entries(entry).find(([key]) =>
    key.toLowerCase().includes("part"),
  );

  return typeof match?.[1] === "string" ? match[1] : "";
}

function findCoordinatesByLocation(name?: string | null, department?: string | null) {
  const normalizedName = (name || "").trim().toLowerCase();
  const normalizedDepartment = (department || "").trim().toLowerCase();
  const entries = (haitiData as Array<Record<string, unknown>>) || [];

  const exactMatch = normalizedName
    ? entries.find(
        (entry) => String(entry.name || "").trim().toLowerCase() === normalizedName,
      )
    : null;

  if (exactMatch) {
    return {
      latitude: Number(exactMatch.lat || 0),
      longitude: Number(exactMatch.lng || 0),
    };
  }

  const departmentMatch = normalizedDepartment
    ? entries.find(
        (entry) =>
          getLocationDepartment(entry).trim().toLowerCase() === normalizedDepartment,
      )
    : null;

  if (departmentMatch) {
    return {
      latitude: Number(departmentMatch.lat || 0),
      longitude: Number(departmentMatch.lng || 0),
    };
  }

  return null;
}

type LegacySellerPayload = {
  sellerId?: string | null;
  ownerType?: string | null;
};

type ShippingOrigin =
  | { type: "admin" }
  | { type: "seller"; sellerId: string };

type ProductOriginRow = {
  id: string;
  owner_type?: string | null;
  seller_id?: string | null;
  owner_id?: string | null;
};

type SellerShippingRow = {
  shipping_settings?: Record<string, unknown> | null;
  base_shipping_price?: number | string | null;
  price_per_km?: number | string | null;
  location_name?: string | null;
  location_dept?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
};

function getUniqueOriginsFromProducts(productRows: ProductOriginRow[]) {
  const originMap = new Map<string, ShippingOrigin>();

  for (const row of productRows) {
    if (row.owner_type === "seller" && row.seller_id) {
      originMap.set(`seller:${row.seller_id}`, {
        type: "seller",
        sellerId: row.seller_id,
      });
    } else {
      originMap.set("admin", { type: "admin" });
    }
  }

  return Array.from(originMap.values());
}

async function resolveSellerIdsByOwner(
  supabase: any,
  ownerIds: string[],
) {
  const uniqueOwnerIds = Array.from(new Set(ownerIds.filter(Boolean)));

  if (uniqueOwnerIds.length === 0) {
    return new Map<string, string>();
  }

  const { data: sellers } = await supabase
    .from("sellers")
    .select("id, user_id")
    .in("user_id", uniqueOwnerIds);

  const ownerToSellerId = new Map<string, string>();

  for (const seller of sellers || []) {
    const row = seller as { id?: string | null; user_id?: string | null };

    if (row.user_id && row.id) {
      ownerToSellerId.set(row.user_id, row.id);
    }
  }

  return ownerToSellerId;
}

function getOriginsFromLegacyPayload(sellers: LegacySellerPayload[]) {
  const originMap = new Map<string, ShippingOrigin>();

  for (const seller of sellers) {
    if (seller.ownerType === "seller" && seller.sellerId) {
      originMap.set(`seller:${seller.sellerId}`, {
        type: "seller",
        sellerId: seller.sellerId,
      });
    } else {
      originMap.set("admin", { type: "admin" });
    }
  }

  return Array.from(originMap.values());
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      addressId,
      addressLat,
      addressLng,
      productIds = [],
      sellers = [],
    } = body as {
      addressId?: string;
      addressLat?: number;
      addressLng?: number;
      productIds?: unknown[];
      sellers?: LegacySellerPayload[];
    };

    const supabase = createServerSupabaseClient();

    let targetLat = Number(addressLat || 0);
    let targetLng = Number(addressLng || 0);

    if (!targetLat || !targetLng) {
      if (!addressId) {
        return NextResponse.json(
          { error: "Coordonnees ou addressId requis" },
          { status: 400 },
        );
      }

      const { data: address } = await supabase
        .from("addresses")
        .select("latitude, longitude, commune, city, department, arrondissement")
        .eq("id", addressId)
        .single();

      if (address) {
        targetLat = Number(address.latitude || 0);
        targetLng = Number(address.longitude || 0);

        if (!targetLat || !targetLng) {
          const resolvedAddressCoordinates = findCoordinatesByLocation(
            (address.commune || address.city || address.arrondissement) as string | null,
            address.department as string | null,
          );

          if (resolvedAddressCoordinates) {
            targetLat = resolvedAddressCoordinates.latitude;
            targetLng = resolvedAddressCoordinates.longitude;

            await supabase
              .from("addresses")
              .update({ latitude: targetLat, longitude: targetLng })
              .eq("id", addressId);
          }
        }
      }
    }

    if (!targetLat || !targetLng) {
      return NextResponse.json(
        { error: "Coordonnees de destination introuvables." },
        { status: 400 },
      );
    }

    let originsToProcess: ShippingOrigin[] = [];
    const uniqueProductIds = Array.from(
      new Set(
        (productIds || [])
          .map((value) => String(value || "").trim())
          .filter(Boolean),
      ),
    );

    if (uniqueProductIds.length > 0) {
      const { data: productRows } = await supabase
        .from("products")
        .select("id, owner_type, seller_id, owner_id")
        .in("id", uniqueProductIds);

      const normalizedProductRows = (productRows || []) as ProductOriginRow[];
      const missingSellerOwnerIds = normalizedProductRows
        .filter(
          (row) =>
            row.owner_type === "seller" &&
            !row.seller_id &&
            String(row.owner_id || "").trim() !== "",
        )
        .map((row) => String(row.owner_id));

      if (missingSellerOwnerIds.length > 0) {
        const ownerToSellerId = await resolveSellerIdsByOwner(
          supabase,
          missingSellerOwnerIds,
        );

        for (const row of normalizedProductRows) {
          if (
            row.owner_type === "seller" &&
            !row.seller_id &&
            row.owner_id &&
            ownerToSellerId.has(row.owner_id)
          ) {
            row.seller_id = ownerToSellerId.get(row.owner_id) || row.seller_id;
          }
        }
      }

      originsToProcess = getUniqueOriginsFromProducts(normalizedProductRows);
    }

    if (originsToProcess.length === 0 && Array.isArray(sellers) && sellers.length > 0) {
      originsToProcess = getOriginsFromLegacyPayload(sellers);
    }

    if (originsToProcess.length === 0) {
      originsToProcess = [{ type: "admin" }];
    }

    let totalShippingFee = 0;

    for (const origin of originsToProcess) {
      let originLat = 0;
      let originLng = 0;
      let basePrice = 0;
      let pricePerKm = 0;

      if (origin.type === "admin") {
        const { data: adminShipping } = await supabase
          .from("shipping_rates")
          .select("base_price, price_per_km, latitude, longitude, location_name")
          .eq("is_active", true)
          .order("priority", { ascending: false })
          .order("created_at", { ascending: true })
          .limit(1)
          .single();

        if (adminShipping) {
          basePrice = Number(adminShipping.base_price || 0);
          pricePerKm = Number(adminShipping.price_per_km || 0);
          originLat = Number(adminShipping.latitude || 0);
          originLng = Number(adminShipping.longitude || 0);

          if ((!originLat || !originLng) && adminShipping.location_name) {
            const fallbackCoordinates = findCoordinatesByLocation(
              adminShipping.location_name,
              null,
            );

            originLat = Number(fallbackCoordinates?.latitude || 0);
            originLng = Number(fallbackCoordinates?.longitude || 0);
          }
        }
      } else {
        const { data: seller } = await supabase
          .from("sellers")
          .select(
            "shipping_settings, base_shipping_price, price_per_km, location_name, location_dept, latitude, longitude",
          )
          .eq("id", origin.sellerId)
          .single();

        if (seller) {
          const row = seller as SellerShippingRow;
          const shipSettings = row.shipping_settings || {};

          basePrice = Number(
            shipSettings.basePrice ?? row.base_shipping_price ?? 0,
          );
          pricePerKm = Number(
            shipSettings.pricePerKm ?? row.price_per_km ?? 0,
          );
          originLat = Number(shipSettings.latitude ?? row.latitude ?? 0);
          originLng = Number(shipSettings.longitude ?? row.longitude ?? 0);

          if ((!originLat || !originLng) && (shipSettings.locationName || row.location_name)) {
            const fallbackCoordinates = findCoordinatesByLocation(
              String(shipSettings.locationName ?? row.location_name ?? ""),
              String(shipSettings.locationDept ?? row.location_dept ?? ""),
            );

            originLat = Number(fallbackCoordinates?.latitude || 0);
            originLng = Number(fallbackCoordinates?.longitude || 0);
          }
        }
      }

      if (!originLat || !originLng) {
        continue;
      }

      const distanceKm = haversine(targetLat, targetLng, originLat, originLng);
      const shippingFee =
        distanceKm <= 2 ? basePrice : basePrice + distanceKm * pricePerKm;

      totalShippingFee += shippingFee;
    }

    return NextResponse.json({ shippingFee: Math.round(totalShippingFee) });
  } catch (error: unknown) {
    console.error("Erreur API shippingFee:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
