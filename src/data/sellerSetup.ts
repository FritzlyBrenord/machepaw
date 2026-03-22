import { canSellerPaymentMethodBeUsedForFulfillment } from "@/data/paymentMethods";
import type { Seller, SellerPaymentMethod } from "@/data/types";

type SellerFulfillmentMode = "delivery" | "pickup";

export type SellerSetupStatus = {
  isComplete: boolean;
  shippingReady: boolean;
  paymentsReady: boolean;
  hasAnyFulfillmentMode: boolean;
  deliveryEnabled: boolean;
  deliveryReady: boolean;
  pickupEnabled: boolean;
  pickupReady: boolean;
  hasAnyActivePaymentMethod: boolean;
  deliveryPaymentReady: boolean;
  pickupPaymentReady: boolean;
  availableModes: SellerFulfillmentMode[];
  shippingIssues: string[];
  paymentIssues: string[];
};

function hasText(value?: string | null) {
  return Boolean(String(value || "").trim());
}

function isFiniteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value);
}

export function getSellerDeliveryStatus(seller?: Seller | null) {
  const settings = seller?.shippingSettings;
  const hasLocationName = hasText(settings?.locationName);
  const hasCoordinates =
    isFiniteNumber(settings?.latitude) && isFiniteNumber(settings?.longitude);
  const hasBasePrice = isFiniteNumber(settings?.basePrice) && Number(settings?.basePrice) >= 0;
  const hasPricePerKm =
    isFiniteNumber(settings?.pricePerKm) && Number(settings?.pricePerKm) >= 0;
  const enabled =
    typeof settings?.allowDelivery === "boolean"
      ? settings.allowDelivery
      : hasLocationName || hasBasePrice || hasPricePerKm || hasCoordinates;

  return {
    enabled,
    ready: Boolean(enabled && hasLocationName && hasCoordinates && hasBasePrice && hasPricePerKm),
  };
}

export function getSellerPickupStatus(seller?: Seller | null) {
  const enabled =
    seller?.shippingSettings?.allowPickup ?? Boolean(seller?.pickupAddress?.address);
  const ready =
    Boolean(enabled) &&
    hasText(seller?.pickupAddress?.address) &&
    hasText(seller?.pickupAddress?.city) &&
    hasText(seller?.pickupAddress?.country);

  return {
    enabled: Boolean(enabled),
    ready,
  };
}

export function getSellerSetupStatus(
  seller?: Seller | null,
  paymentMethods: SellerPaymentMethod[] = [],
): SellerSetupStatus {
  const delivery = getSellerDeliveryStatus(seller);
  const pickup = getSellerPickupStatus(seller);
  const availableModes = ([
    delivery.enabled ? "delivery" : null,
    pickup.enabled ? "pickup" : null,
  ].filter(Boolean) as SellerFulfillmentMode[]);
  const activePaymentMethods = paymentMethods.filter((method) => method.isActive);
  const deliveryPaymentReady = activePaymentMethods.some((method) =>
    canSellerPaymentMethodBeUsedForFulfillment(method.methodCode, "delivery"),
  );
  const pickupPaymentReady = activePaymentMethods.some((method) =>
    canSellerPaymentMethodBeUsedForFulfillment(method.methodCode, "pickup"),
  );

  const shippingIssues: string[] = [];
  const paymentIssues: string[] = [];

  if (!delivery.enabled && !pickup.enabled) {
    shippingIssues.push("Activez au moins un mode: livraison ou retrait en magasin.");
  }

  if (delivery.enabled && !delivery.ready) {
    shippingIssues.push(
      "La livraison est active, mais la localisation pivot, les coordonnees et les tarifs ne sont pas encore completes.",
    );
  }

  if (pickup.enabled && !pickup.ready) {
    shippingIssues.push(
      "Le retrait est actif, mais l'adresse de retrait n'est pas encore complete.",
    );
  }

  if (activePaymentMethods.length === 0) {
    paymentIssues.push("Activez au moins un mode de paiement pour votre boutique.");
  }

  if (delivery.enabled && !deliveryPaymentReady) {
    paymentIssues.push(
      "Ajoutez un mode de paiement compatible avec la livraison.",
    );
  }

  if (pickup.enabled && !pickupPaymentReady) {
    paymentIssues.push(
      "Ajoutez un mode de paiement compatible avec le retrait en magasin.",
    );
  }

  const shippingReady = shippingIssues.length === 0;
  const paymentsReady = paymentIssues.length === 0;

  return {
    isComplete: shippingReady && paymentsReady,
    shippingReady,
    paymentsReady,
    hasAnyFulfillmentMode: availableModes.length > 0,
    deliveryEnabled: delivery.enabled,
    deliveryReady: delivery.ready,
    pickupEnabled: pickup.enabled,
    pickupReady: pickup.ready,
    hasAnyActivePaymentMethod: activePaymentMethods.length > 0,
    deliveryPaymentReady,
    pickupPaymentReady,
    availableModes,
    shippingIssues,
    paymentIssues,
  };
}
