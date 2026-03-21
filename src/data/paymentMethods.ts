export type SellerPaymentMethodCode =
  | "moncash_manual"
  | "natcash_manual"
  | "store_pickup"
  | "moncash_auto"
  | "natcash_auto"
  | "paypal"
  | "stripe"
  | "card"
  | "other";

export type SellerPaymentFulfillmentMode = "any" | "delivery" | "pickup";

export type SellerPaymentMethodDefinition = {
  code: SellerPaymentMethodCode;
  label: string;
  description: string;
  operational: boolean;
  fulfillmentMode: SellerPaymentFulfillmentMode;
  requiresManualEntry: boolean;
};

export type SellerPaymentMethodView = SellerPaymentMethodDefinition & {
  isActive: boolean;
  merchantFirstName?: string | null;
  merchantLastName?: string | null;
  merchantAgentCode?: string | null;
};

export const SELLER_PAYMENT_METHODS: SellerPaymentMethodDefinition[] = [
  {
    code: "moncash_manual",
    label: "MonCash manuel",
    description: "Paiement manuel via MonCash, avec validation par le client.",
    operational: true,
    fulfillmentMode: "any",
    requiresManualEntry: true,
  },
  {
    code: "natcash_manual",
    label: "NatCash manuel",
    description: "Paiement manuel via NatCash, avec validation par le client.",
    operational: true,
    fulfillmentMode: "any",
    requiresManualEntry: true,
  },
  {
    code: "store_pickup",
    label: "Paiement au magasin",
    description: "Le client paie sur place lors du retrait.",
    operational: true,
    fulfillmentMode: "pickup",
    requiresManualEntry: false,
  },
  {
    code: "moncash_auto",
    label: "MonCash automatique",
    description: "Paiement automatique MonCash - bientot disponible.",
    operational: false,
    fulfillmentMode: "delivery",
    requiresManualEntry: false,
  },
  {
    code: "natcash_auto",
    label: "NatCash automatique",
    description: "Paiement automatique NatCash - bientot disponible.",
    operational: false,
    fulfillmentMode: "delivery",
    requiresManualEntry: false,
  },
  {
    code: "paypal",
    label: "PayPal",
    description: "Paiement PayPal - bientot disponible.",
    operational: false,
    fulfillmentMode: "any",
    requiresManualEntry: false,
  },
  {
    code: "stripe",
    label: "Stripe",
    description: "Paiement Stripe - bientot disponible.",
    operational: false,
    fulfillmentMode: "any",
    requiresManualEntry: false,
  },
  {
    code: "card",
    label: "Carte bancaire",
    description: "Paiement par carte bancaire - bientot disponible.",
    operational: false,
    fulfillmentMode: "any",
    requiresManualEntry: false,
  },
  {
    code: "other",
    label: "Autre",
    description: "Autre mode de paiement - bientot disponible.",
    operational: false,
    fulfillmentMode: "any",
    requiresManualEntry: false,
  },
];

export function findSellerPaymentMethodDefinition(
  code?: string | null,
): SellerPaymentMethodDefinition | undefined {
  const normalizedCode = String(code || "").trim().toLowerCase();

  return SELLER_PAYMENT_METHODS.find((method) => method.code === normalizedCode);
}

export function getSellerPaymentMethodDefinition(code?: string | null) {
  return findSellerPaymentMethodDefinition(code) || SELLER_PAYMENT_METHODS[0];
}

export function isSellerPaymentMethodOperational(code?: string | null) {
  return Boolean(findSellerPaymentMethodDefinition(code)?.operational);
}

export function canSellerPaymentMethodBeUsedForFulfillment(
  code: string,
  fulfillmentMode: "delivery" | "pickup",
) {
  const method = findSellerPaymentMethodDefinition(code);

  if (!method) {
    return false;
  }

  return (
    method.operational &&
    (method.fulfillmentMode === "any" || method.fulfillmentMode === fulfillmentMode)
  );
}

export function getSellerPaymentMethodLabel(code?: string | null) {
  const normalizedCode = String(code || "").trim().toLowerCase();

  if (!normalizedCode) {
    return "Non precise";
  }

  const legacyLabels: Record<string, string> = {
    moncash: "MonCash manuel",
    natcash: "NatCash manuel",
    delivery: "Paiement a la livraison",
  };

  if (legacyLabels[normalizedCode]) {
    return legacyLabels[normalizedCode];
  }

  return findSellerPaymentMethodDefinition(normalizedCode)?.label || code || "Non precise";
}

export function buildManualPaymentInstructions(
  code: string,
  accountFirstName?: string | null,
  accountLastName?: string | null,
  agentCode?: string | null,
) {
  const method = findSellerPaymentMethodDefinition(code);

  if (!method?.requiresManualEntry) {
    return [];
  }

  const accountName = [accountFirstName, accountLastName].filter(Boolean).join(" ");

  return [
    "1. Composez *202#.",
    "2. Choisissez 3 pour continuer.",
    `3. Entrez le numero agent: ${agentCode || "Non renseigne"}.`,
    "4. Continuez le paiement.",
    `5. Verifiez le nom et le prenom: ${accountName || "Non renseigne"}.`,
    "6. Confirmez puis conservez la reference de transaction.",
    '7. Retournez sur la boutique et cliquez sur "Commander".',
  ];
}
