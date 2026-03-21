import type { Address, Order, OrderItem, OrderStatus } from "@/data/types";
import { supabase } from "@/lib/supabase";

type BoutiqueAddressRow = {
  id: string;
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

export function mapBoutiqueAddressRow(row: BoutiqueAddressRow): Address {
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

export function mapBoutiqueOrderRow(item: any): Order {
  const items = (item.items || []).map((orderItem: any) => {
    const image = orderItem.image;
    const mappedItem: OrderItem = {
      id: orderItem.id,
      sellerId: orderItem.seller_id,
      ownerId: orderItem.owner_id,
      ownerName: orderItem.owner_name,
      sku: orderItem.sku,
      image,
      total: Number(orderItem.total),
      status: orderItem.status as OrderStatus,
      quantity: Number(orderItem.quantity),
      price: Number(orderItem.price),
      product: {
        id: orderItem.product_id,
        name: orderItem.name,
        description: "",
        images: image ? [image] : [],
        category: "",
        tags: [],
        rating: 0,
        reviewCount: 0,
        stock: 0,
        sku: orderItem.sku || "",
        features: [],
        specifications: {},
        price: Number(orderItem.price),
        sellerId: orderItem.seller_id,
        ownerId: orderItem.owner_id,
        ownerName: orderItem.owner_name,
        minProcessingDays: orderItem.min_processing_days,
        maxProcessingDays: orderItem.max_processing_days,
      },
    };

    return mappedItem;
  });

  return {
    id: item.order_number || item.id,
    orderNumber: item.order_number,
    userId: item.user_id,
    status: item.status as OrderStatus,
    fulfillmentMethod: item.fulfillment_method || undefined,
    subtotal: Number(item.subtotal),
    shipping: Number(item.shipping),
    tax: Number(item.tax),
    discount: Number(item.discount || 0),
    total: Number(item.total),
    currency: item.currency || "HTG",
    shippingAddress:
      typeof item.shipping_address === "string"
        ? JSON.parse(item.shipping_address)
        : item.shipping_address,
    trackingNumber: item.tracking_number || undefined,
    estimatedDelivery: item.estimated_delivery || undefined,
    deliveredAt: item.delivered_at || undefined,
    paymentMethod: item.payment_method || undefined,
    paymentStatus: item.payment_status || undefined,
    paymentId: item.payment_id || undefined,
    paymentProofUrl: item.payment_proof_url
      ? item.payment_proof_url.startsWith("http")
        ? item.payment_proof_url
        : supabase.storage.from("payment-proofs").getPublicUrl(item.payment_proof_url).data.publicUrl
      : undefined,
    notes: item.notes || undefined,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    items,
  };
}
