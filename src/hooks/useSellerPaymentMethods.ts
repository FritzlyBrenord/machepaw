"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { CURRENT_ACCOUNT_QUERY_KEY, fetchCurrentAccount } from "@/hooks/useAccount";
import {
  SELLER_PAYMENT_METHODS,
  type SellerPaymentMethodCode,
} from "@/data/paymentMethods";
import type { SellerPaymentMethod } from "@/data/types";

const SELLER_PAYMENT_METHODS_QUERY_KEY = ["seller-payment-methods"];

type SellerPaymentMethodRow = {
  id: string;
  seller_id: string;
  method_code: SellerPaymentMethodCode;
  is_active: boolean;
  merchant_first_name?: string | null;
  merchant_last_name?: string | null;
  merchant_agent_code?: string | null;
  created_at: string;
  updated_at: string;
};

export type SellerPaymentMethodInput = {
  methodCode: SellerPaymentMethodCode;
  isActive: boolean;
  merchantFirstName?: string;
  merchantLastName?: string;
  merchantAgentCode?: string;
};

function mapSellerPaymentMethodRow(row: SellerPaymentMethodRow): SellerPaymentMethod {
  return {
    id: row.id,
    sellerId: row.seller_id,
    methodCode: row.method_code,
    isActive: row.is_active,
    merchantFirstName: row.merchant_first_name || undefined,
    merchantLastName: row.merchant_last_name || undefined,
    merchantAgentCode: row.merchant_agent_code || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeMethodText(value?: string | null) {
  return String(value || "").trim();
}

export function useSellerPaymentMethodsQuery(sellerId?: string) {
  return useQuery({
    queryKey: [...SELLER_PAYMENT_METHODS_QUERY_KEY, sellerId],
    queryFn: async () => {
      if (!sellerId) {
        return [];
      }

      const { data, error } = await supabase
        .from("seller_payment_methods")
        .select(
          "id,seller_id,method_code,is_active,merchant_first_name,merchant_last_name,merchant_agent_code,created_at,updated_at",
        )
        .eq("seller_id", sellerId)
        .order("created_at", { ascending: true });

      if (error) {
        throw error;
      }

      return (data || []).map((row) => mapSellerPaymentMethodRow(row as SellerPaymentMethodRow));
    },
    enabled: Boolean(sellerId),
  });
}

export function useUpsertSellerPaymentMethodsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (methods: SellerPaymentMethodInput[]) => {
      const account = await fetchCurrentAccount();
      const seller = account?.seller;

      if (!seller) {
        throw new Error("Seller account required");
      }

      const allowPickup = Boolean(seller.shippingSettings?.allowPickup && seller.pickupAddress);

      const rows = methods.map((method) => {
        const definition = SELLER_PAYMENT_METHODS.find((item) => item.code === method.methodCode);

        if (!definition) {
          throw new Error("Mode de paiement invalide.");
        }

        const isActive = Boolean(method.isActive);

        if (isActive && !definition.operational) {
          throw new Error(`${definition.label} n'est pas encore operationnel.`);
        }

        const merchantFirstName = normalizeMethodText(method.merchantFirstName);
        const merchantLastName = normalizeMethodText(method.merchantLastName);
        const merchantAgentCode = normalizeMethodText(method.merchantAgentCode);

        if (isActive && method.methodCode === "store_pickup" && !allowPickup) {
          throw new Error(
            "Activez d'abord le retrait en magasin dans la partie Livraison avant d'activer ce mode.",
          );
        }

        if (isActive && method.methodCode !== "store_pickup" && definition.requiresManualEntry) {
          if (!merchantFirstName || !merchantLastName) {
            throw new Error(
              `Le prenom et le nom du compte sont obligatoires pour ${definition.label}.`,
            );
          }

          if (!/^[0-9]{6}$/.test(merchantAgentCode)) {
            throw new Error("Le code agent doit contenir exactement 6 chiffres.");
          }
        }

        return {
          seller_id: seller.id,
          method_code: method.methodCode,
          is_active: isActive,
          merchant_first_name: definition.requiresManualEntry ? merchantFirstName || null : null,
          merchant_last_name: definition.requiresManualEntry ? merchantLastName || null : null,
          merchant_agent_code: definition.requiresManualEntry ? merchantAgentCode || null : null,
        };
      });

      const { data, error } = await supabase
        .from("seller_payment_methods")
        .upsert(rows, { onConflict: "seller_id,method_code" })
        .select(
          "id,seller_id,method_code,is_active,merchant_first_name,merchant_last_name,merchant_agent_code,created_at,updated_at",
        );

      if (error) {
        throw error;
      }

      return (data || []).map((row) => mapSellerPaymentMethodRow(row as SellerPaymentMethodRow));
    },
    onSuccess: async () => {
      const account = await fetchCurrentAccount();
      const sellerId = account?.seller?.id;

      if (sellerId) {
        await queryClient.invalidateQueries({
          queryKey: [...SELLER_PAYMENT_METHODS_QUERY_KEY, sellerId],
        });
      }

      await queryClient.invalidateQueries({ queryKey: CURRENT_ACCOUNT_QUERY_KEY });
    },
  });
}
