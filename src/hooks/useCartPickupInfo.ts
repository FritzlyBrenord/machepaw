import { useQuery } from "@tanstack/react-query";
import type { CartItem } from "@/data/types";

type MinimalStorefrontSettings = {
  allowPickup?: boolean;
  pickupAddress?: string;
};

export type CartPickupInfo = {
  allowPickup: boolean;
  pickupAddressText: string;
  sourceType: "admin" | "seller" | null;
  sourceLabel?: string;
  isMixedOrigins: boolean;
  message?: string;
};

export function useCartPickupInfo(
  items: CartItem[],
  settings?: MinimalStorefrontSettings,
) {
  const productIds = Array.from(
    new Set(items.map((item) => item.product.id).filter(Boolean)),
  );

  return useQuery({
    queryKey: [
      "cart-pickup-info",
      productIds,
      settings?.allowPickup,
      settings?.pickupAddress,
    ],
    enabled: productIds.length > 0,
    queryFn: async (): Promise<CartPickupInfo> => {
      const response = await fetch("/api/pickup-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productIds,
          adminPickup: {
            allowPickup: Boolean(settings?.allowPickup),
            pickupAddress: settings?.pickupAddress || "",
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Impossible de recuperer le point de retrait.");
      }

      return (await response.json()) as CartPickupInfo;
    },
    staleTime: 5 * 60 * 1000,
  });
}
