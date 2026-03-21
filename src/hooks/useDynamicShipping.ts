import { useQuery } from "@tanstack/react-query";
import type { CartItem } from "@/data/types";

export function useDynamicShippingFee(
  items: CartItem[], 
  addressId?: string, 
  addressLat?: number, 
  addressLng?: number
) {
  // Only query if we have items AND either an addressId or explicit coordinates
  const enabled = items.length > 0 && !!(addressId || (addressLat && addressLng));

  console.log("=== DYNAMIC SHIPPING HOOK DEBUG ===");
  console.log("Items:", items);
  console.log("Address ID:", addressId);
  console.log("Address Lat:", addressLat);
  console.log("Address Lng:", addressLng);
  console.log("Query enabled:", enabled);
  console.log("======================================");

  const productIds = Array.from(
    new Set(items.map((item) => item.product.id).filter(Boolean)),
  );

  console.log("Product IDs payload:", productIds);

  return useQuery({
    queryKey: ["shipping-fee-dynamic", addressId, addressLat, addressLng, productIds],
    queryFn: async () => {
      console.log("=== API CALL START ===");
      console.log("Sending payload:", {
        addressId,
        addressLat,
        addressLng,
        productIds
      });

      const response = await fetch("/api/shippingFee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId,
          addressLat,
          addressLng,
          productIds
        })
      });

      console.log("API response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error response:", errorText);
        throw new Error("Erreur calcul livraison");
      }

      const data = await response.json();
      console.log("API response data:", data);
      console.log("=== API CALL END ===");
      
      return data.shippingFee as number;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
    retry: 1
  });
}
