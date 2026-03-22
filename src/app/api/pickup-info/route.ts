import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Address } from "@/data/types";

function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(supabaseUrl, supabaseKey);
}

type ProductOriginRow = {
  id: string;
  owner_type?: "admin" | "seller" | null;
  seller_id?: string | null;
  owner_id?: string | null;
  owner_name?: string | null;
};

type SellerPickupRow = {
  business_name?: string | null;
  pickup_address?: Address | null;
  shipping_settings?: {
    allowDelivery?: boolean;
    allowPickup?: boolean;
    basePrice?: number;
    pricePerKm?: number;
    locationName?: string;
    latitude?: number;
    longitude?: number;
  } | null;
};

type PickupResponse = {
  allowDelivery: boolean;
  allowPickup: boolean;
  deliveryConfigured: boolean;
  pickupConfigured: boolean;
  pickupAddressText: string;
  sourceType: "admin" | "seller" | null;
  sourceLabel?: string;
  isMixedOrigins: boolean;
  message?: string;
};

function formatPickupAddress(address?: Partial<Address> | null) {
  if (!address) {
    return "";
  }

  return [address.address, address.city, address.country, address.phone]
    .filter((value) => String(value || "").trim() !== "")
    .join(", ");
}

function hasFiniteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value);
}

async function resolveOwnerToSellerId(
  supabase: SupabaseClient,
  ownerIds: string[],
) {
  const uniqueOwnerIds = Array.from(new Set(ownerIds.filter(Boolean)));

  if (uniqueOwnerIds.length === 0) {
    return new Map<string, string>();
  }

  const { data: sellersByOwner } = await supabase
    .from("sellers")
    .select("id, user_id")
    .in("user_id", uniqueOwnerIds);

  const ownerToSellerId = new Map<string, string>();

  for (const seller of sellersByOwner || []) {
    const row = seller as { id?: string | null; user_id?: string | null };

    if (row.user_id && row.id) {
      ownerToSellerId.set(row.user_id, row.id);
    }
  }

  return ownerToSellerId;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const productIds = Array.from(
      new Set(
        ((body.productIds as unknown[]) || [])
          .map((value) => String(value || "").trim())
          .filter(Boolean),
      ),
    );
    const adminPickup = (body.adminSettings || {}) as {
      allowDelivery?: boolean;
      allowPickup?: boolean;
      pickupAddress?: string;
    };

    if (productIds.length === 0) {
      return NextResponse.json({
        allowDelivery: true,
        allowPickup: false,
        deliveryConfigured: true,
        pickupConfigured: false,
        pickupAddressText: "",
        sourceType: null,
        isMixedOrigins: false,
      } satisfies PickupResponse);
    }

    const supabase = createServerSupabaseClient();
    const { data: products, error } = await supabase
      .from("products")
      .select("id, owner_type, seller_id, owner_id, owner_name")
      .in("id", productIds);

    if (error) {
      throw error;
    }

    const productRows = (products || []) as ProductOriginRow[];
    const missingSellerOwnerIds = productRows
      .filter(
        (row) =>
          row.owner_type === "seller" &&
          !row.seller_id &&
          String(row.owner_id || "").trim() !== "",
      )
      .map((row) => String(row.owner_id));

    if (missingSellerOwnerIds.length > 0) {
      const ownerToSellerId = await resolveOwnerToSellerId(
        supabase,
        missingSellerOwnerIds,
      );

      for (const row of productRows) {
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

    const originMap = new Map<string, ProductOriginRow>();

    for (const row of productRows) {
      if (row.owner_type === "seller" && row.seller_id) {
        originMap.set(`seller:${row.seller_id}`, row);
      } else {
        originMap.set("admin", row);
      }
    }

    if (originMap.size > 1) {
      return NextResponse.json({
        allowDelivery: true,
        allowPickup: false,
        deliveryConfigured: true,
        pickupConfigured: false,
        pickupAddressText: "",
        sourceType: null,
        isMixedOrigins: true,
        message:
          "Le retrait en magasin n'est pas disponible pour un panier contenant plusieurs boutiques.",
      } satisfies PickupResponse);
    }

    const onlyOrigin = Array.from(originMap.values())[0];

    if (!onlyOrigin || onlyOrigin.owner_type !== "seller" || !onlyOrigin.seller_id) {
      const adminPickupConfigured = Boolean(adminPickup.allowPickup && adminPickup.pickupAddress);
      return NextResponse.json({
        allowDelivery: adminPickup.allowDelivery ?? true,
        allowPickup: Boolean(adminPickup.allowPickup && adminPickup.pickupAddress),
        deliveryConfigured: adminPickup.allowDelivery ?? true,
        pickupConfigured: adminPickupConfigured,
        pickupAddressText: adminPickup.pickupAddress || "",
        sourceType: "admin",
        sourceLabel: "Administration",
        isMixedOrigins: false,
        message: adminPickupConfigured
          ? undefined
          : "Le retrait admin n'est pas active pour le moment.",
      } satisfies PickupResponse);
    }

    const { data: seller, error: sellerError } = await supabase
      .from("sellers")
      .select("business_name, pickup_address, shipping_settings")
      .eq("id", onlyOrigin.seller_id)
      .single();

    if (sellerError) {
      throw sellerError;
    }

    const sellerRow = seller as SellerPickupRow;
    const pickupAddressText = formatPickupAddress(sellerRow.pickup_address);
    const pickupConfigured = Boolean(
      sellerRow.pickup_address?.address &&
        sellerRow.pickup_address?.city &&
        sellerRow.pickup_address?.country,
    );
    const allowPickup =
      typeof sellerRow.shipping_settings?.allowPickup === "boolean"
        ? sellerRow.shipping_settings.allowPickup && pickupConfigured
        : pickupConfigured;
    const deliveryConfigured = Boolean(
      sellerRow.shipping_settings?.locationName &&
        hasFiniteNumber(sellerRow.shipping_settings?.basePrice) &&
        hasFiniteNumber(sellerRow.shipping_settings?.pricePerKm) &&
        hasFiniteNumber(sellerRow.shipping_settings?.latitude) &&
        hasFiniteNumber(sellerRow.shipping_settings?.longitude),
    );
    const allowDelivery =
      typeof sellerRow.shipping_settings?.allowDelivery === "boolean"
        ? sellerRow.shipping_settings.allowDelivery && deliveryConfigured
        : deliveryConfigured;
    const message =
      !allowDelivery && !allowPickup
        ? "Cette boutique n'a pas encore configure de livraison ni de retrait."
        : !allowDelivery
          ? "Cette boutique vendeur n'autorise pas encore la livraison."
          : !allowPickup
            ? "Cette boutique vendeur n'autorise pas encore le retrait sur place."
            : undefined;

    return NextResponse.json({
      allowDelivery,
      allowPickup,
      deliveryConfigured,
      pickupConfigured,
      pickupAddressText,
      sourceType: "seller",
      sourceLabel: sellerRow.business_name || onlyOrigin.owner_name || "Boutique vendeur",
      isMixedOrigins: false,
      message,
    } satisfies PickupResponse);
  } catch (error: unknown) {
    console.error("Erreur API pickup-info:", error);
    return NextResponse.json(
      { error: "Erreur serveur pickup-info" },
      { status: 500 },
    );
  }
}
