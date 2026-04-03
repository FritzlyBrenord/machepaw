"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckoutContent as CheckoutContentLayout } from "@/sections/Commande/Checkout/CheckoutContent";
import type {
  CheckoutContentProps,
  CheckoutContentRuntimeProps,
} from "@/sections/Commande/Checkout/CheckoutContent";
import {
  buildManualPaymentInstructions,
  canSellerPaymentMethodBeUsedForFulfillment,
  type SellerPaymentMethodCode,
  type SellerPaymentMethodView,
} from "@/data/paymentMethods";
import type { Address } from "@/data/types";
import {
  useAddBoutiqueClientAddressMutation,
  useBoutiqueClientAddressesQuery,
  useBoutiqueClientSessionQuery,
  useCreateBoutiqueOrderMutation,
  useUploadBoutiquePaymentProofMutation,
} from "@/hooks/useBoutiqueClient";
import { useAdminSettingsQuery } from "@/hooks/useAdminSettings";
import { useCartPickupInfo } from "@/hooks/useCartPickupInfo";
import { useDynamicShippingFee } from "@/hooks/useDynamicShipping";
import { getBoutiqueCartItemId, getBoutiqueCartItems } from "@/lib/boutique";
import { useNavigate, useParams } from "@/lib/router";
import type { StorefrontSectionStoreData } from "@/lib/storefront-section-data";
import { formatPrice, getEstimatedDeliveryRange } from "@/lib/utils";
import { useCart } from "@/store";

interface ConnectedCheckoutContentProps {
  id?: string;
  testId?: string;
  title?: string;
  subtitle?: string;
  content?: CheckoutContentProps["content"];
  config?: CheckoutContentProps["config"];
  style?: CheckoutContentProps["style"];
  classes?: CheckoutContentProps["classes"];
  showSteps?: boolean;
  steps?: string;
  storefrontStore?: StorefrontSectionStoreData | null;
  styles?: {
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
    paddingY?: string | number;
  };
}

function buildCheckoutStyle(
  style?: CheckoutContentProps["style"],
  legacyStyles?: ConnectedCheckoutContentProps["styles"],
): CheckoutContentProps["style"] {
  const legacyStyle: CheckoutContentProps["style"] = {
    colors: {
      background: legacyStyles?.backgroundColor,
      text: legacyStyles?.textColor,
      accent: legacyStyles?.accentColor,
    },
    spacing: {
      paddingY:
        typeof legacyStyles?.paddingY === "number"
          ? String(Math.max(0, Math.round(legacyStyles.paddingY / 4)))
          : typeof legacyStyles?.paddingY === "string"
            ? legacyStyles.paddingY
          : undefined,
      container: "contained",
    },
  };

  return {
    colors: {
      ...legacyStyle.colors,
      ...(style?.colors || {}),
    },
    spacing: {
      ...legacyStyle.spacing,
      ...(style?.spacing || {}),
    },
  };
}

function buildCheckoutContent(
  content?: CheckoutContentProps["content"],
  legacySteps?: string,
): CheckoutContentProps["content"] {
  const stepLabels = String(legacySteps || "")
    .split(/\r?\n|,/)
    .map((label) => label.trim())
    .filter(Boolean);

  return {
    deliveryStepTitle: stepLabels[0],
    paymentStepTitle: stepLabels[1],
    reviewStepTitle: stepLabels[2],
    ...(content || {}),
  };
}

function buildCheckoutConfig(
  config?: CheckoutContentProps["config"],
  showSteps?: boolean,
): CheckoutContentProps["config"] {
  return {
    ...(typeof showSteps === "boolean" ? { showSteps } : {}),
    ...(config || {}),
  };
}

function normalizeAttributeName(value?: string) {
  return String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function buildPickupFallbackAddress(
  customer: { firstName: string; lastName: string; phone?: string },
  businessName: string,
  pickupAddressText?: string,
): Address {
  return {
    firstName: customer.firstName,
    lastName: customer.lastName,
    address: pickupAddressText || `Retrait en magasin - ${businessName}`,
    city: businessName,
    postalCode: "",
    country: "Haiti",
    phone: customer.phone || "",
  };
}

async function fetchBoutiquePaymentMethods(slug: string) {
  const response = await fetch(`/api/boutique/${slug}/payment-methods`, {
    credentials: "include",
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      typeof payload?.error === "string"
        ? payload.error
        : "Impossible de charger les modes de paiement.",
    );
  }

  return Array.isArray(payload?.methods)
    ? (payload.methods as SellerPaymentMethodView[])
    : [];
}

export function ConnectedCheckoutContent({
  id,
  testId,
  title,
  subtitle,
  content,
  config,
  style,
  classes,
  showSteps,
  steps,
  storefrontStore,
  styles,
}: ConnectedCheckoutContentProps) {
  const navigate = useNavigate();
  const params = useParams();
  const { items, clearCart, clearCartItems } = useCart();
  const { data: adminSettings } = useAdminSettingsQuery();
  const storeSlug = storefrontStore?.storeSlug || "";
  const sellerId = storefrontStore?.sellerId || "";
  const isBoutiqueMode = Boolean(storeSlug || sellerId);
  const resolvedContent = buildCheckoutContent(content, steps);
  const resolvedConfig = buildCheckoutConfig(config, showSteps);
  const resolvedStyle = buildCheckoutStyle(style, styles);

  const boutiqueItems = useMemo(
    () =>
      isBoutiqueMode
        ? getBoutiqueCartItems(items, { sellerId, storeSlug })
        : [],
    [isBoutiqueMode, items, sellerId, storeSlug],
  );

  const { data: session } = useBoutiqueClientSessionQuery(storeSlug);
  const hasActiveBoutiqueCustomer = session?.customer?.status === "active";
  const { data: boutiqueAddresses = [] } = useBoutiqueClientAddressesQuery(
    storeSlug,
    hasActiveBoutiqueCustomer,
  );
  const addAddressMutation = useAddBoutiqueClientAddressMutation(storeSlug);
  const createOrderMutation = useCreateBoutiqueOrderMutation(storeSlug);
  const uploadPaymentProofMutation = useUploadBoutiquePaymentProofMutation(storeSlug);
  const paymentMethodsQuery = useQuery({
    queryKey: ["boutique-payment-methods", storeSlug],
    queryFn: () => fetchBoutiquePaymentMethods(storeSlug),
    enabled: isBoutiqueMode && Boolean(storeSlug),
    staleTime: 60_000,
  });

  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState<"delivery" | "pickup">(
    () => (params.mode === "pickup" ? "pickup" : "delivery"),
  );
  const [paymentMethodCode, setPaymentMethodCode] = useState<SellerPaymentMethodCode | "">("");
  const [paymentId, setPaymentId] = useState("");
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [paymentProofLabel, setPaymentProofLabel] = useState("");
  const [paymentProofUrl, setPaymentProofUrl] = useState("");
  const [paymentAcknowledged, setPaymentAcknowledged] = useState(false);
  const [notes, setNotes] = useState("");

  const defaultSelectedAddressId =
    boutiqueAddresses.find((address) => address.isDefault)?.id ||
    boutiqueAddresses[0]?.id ||
    "";
  const effectiveSelectedAddressId = selectedAddressId || defaultSelectedAddressId;

  const selectedAddress =
    boutiqueAddresses.find((address) => address.id === effectiveSelectedAddressId) ||
    boutiqueAddresses.find((address) => address.isDefault) ||
    boutiqueAddresses[0];

  const pickupAddressText =
    storefrontStore?.shippingSettings?.pickupAddress ||
    [
      storefrontStore?.pickupAddress?.address,
      storefrontStore?.pickupAddress?.city,
      storefrontStore?.pickupAddress?.country,
    ]
      .filter((value) => typeof value === "string" && value.trim().length > 0)
      .join(", ");

  const { data: pickupInfo } = useCartPickupInfo(boutiqueItems, {
    allowDelivery: storefrontStore?.shippingSettings?.allowDelivery ?? true,
    allowPickup: Boolean(storefrontStore?.shippingSettings?.allowPickup && pickupAddressText),
    pickupAddress: pickupAddressText,
  });

  const availableFulfillmentModes = useMemo(() => {
    const modes: Array<"delivery" | "pickup"> = [];
    if (pickupInfo?.allowDelivery ?? true) {
      modes.push("delivery");
    }
    if (pickupInfo?.allowPickup) {
      modes.push("pickup");
    }
    return modes;
  }, [pickupInfo?.allowDelivery, pickupInfo?.allowPickup]);

  const activeDeliveryMode = availableFulfillmentModes.includes(deliveryMode)
    ? deliveryMode
    : availableFulfillmentModes[0] || "delivery";

  const maxMinDays =
    boutiqueItems.length > 0
      ? Math.max(...boutiqueItems.map((item) => item.product.minProcessingDays ?? 1))
      : 1;
  const maxMaxDays =
    boutiqueItems.length > 0
      ? Math.max(...boutiqueItems.map((item) => item.product.maxProcessingDays ?? 3))
      : 3;
  const deliveryEstimateText =
    activeDeliveryMode === "delivery"
      ? `Prevue du ${getEstimatedDeliveryRange(maxMinDays, maxMaxDays)}`
      : undefined;

  const { data: dynamicShippingFee = 0, isLoading: isShippingLoading } =
    useDynamicShippingFee(
      boutiqueItems,
      selectedAddress?.id,
      selectedAddress?.latitude,
      selectedAddress?.longitude,
    );

  const freeShippingThreshold =
    Number(
      adminSettings?.freeShippingThreshold ||
        storefrontStore?.shippingSettings?.freeShippingThreshold ||
        0,
    ) || 0;
  const taxRate = Number(adminSettings?.taxRate || 0) || 0;
  const subtotal = boutiqueItems.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0,
  );
  const isActuallyFree =
    freeShippingThreshold > 0 && subtotal >= freeShippingThreshold;
  const shippingAmount =
    activeDeliveryMode === "pickup" || !availableFulfillmentModes.includes("delivery")
      ? 0
      : isActuallyFree
        ? 0
        : dynamicShippingFee;
  const taxAmount = taxRate > 0 ? (subtotal * taxRate) / 100 : 0;
  const totalAmount = subtotal + shippingAmount + taxAmount;
  const freeShippingMessage =
    freeShippingThreshold > 0
      ? isActuallyFree
        ? "Livraison gratuite appliquee."
        : `Plus que ${formatPrice(
            Math.max(freeShippingThreshold - subtotal, 0),
          )} pour la livraison gratuite`
      : undefined;

  const availablePaymentMethods = useMemo(
    () =>
      (paymentMethodsQuery.data || []).filter((method) =>
        canSellerPaymentMethodBeUsedForFulfillment(method.code, activeDeliveryMode),
      ),
    [paymentMethodsQuery.data, activeDeliveryMode],
  );

  const fallbackPaymentMethod =
    activeDeliveryMode === "pickup"
      ? availablePaymentMethods.find((method) => method.code === "store_pickup") ||
        availablePaymentMethods[0]
      : availablePaymentMethods.find((method) => method.code !== "store_pickup") ||
        availablePaymentMethods[0];
  const effectivePaymentMethodCode =
    paymentMethodCode &&
    availablePaymentMethods.some((method) => method.code === paymentMethodCode)
      ? paymentMethodCode
      : fallbackPaymentMethod?.code || "";
  const isPaymentAcknowledged =
    paymentAcknowledged && paymentMethodCode === effectivePaymentMethodCode;

  const selectedPaymentMethod =
    availablePaymentMethods.find((method) => method.code === effectivePaymentMethodCode) || null;
  const manualPaymentInstructions = selectedPaymentMethod?.requiresManualEntry
    ? buildManualPaymentInstructions(
        selectedPaymentMethod.code,
        selectedPaymentMethod.merchantFirstName,
        selectedPaymentMethod.merchantLastName,
        selectedPaymentMethod.merchantAgentCode,
      )
    : [];

  const cartItems = boutiqueItems.map((item) => {
    const attributes = new Map(
      (item.selectedAttributes || []).map((attribute) => [
        normalizeAttributeName(attribute.name),
        attribute.value,
      ]),
    );

    return {
      id: item.id || item.product.id,
      name: item.product.name,
      price: item.unitPrice,
      quantity: item.quantity,
      image: item.product.images[0] || "/images/placeholder.jpg",
      size: attributes.get("taille") || attributes.get("size") || undefined,
      color: attributes.get("couleur") || attributes.get("color") || undefined,
      storage: attributes.get("stockage") || attributes.get("storage") || undefined,
    };
  });

  const boutiqueCartItemIds = useMemo(
    () => boutiqueItems.map((item) => getBoutiqueCartItemId(item)),
    [boutiqueItems],
  );

  const customerStatusMessage = !session
    ? "Connectez-vous ou inscrivez-vous a cette boutique pour poursuivre."
    : !hasActiveBoutiqueCustomer
      ? "Votre compte client boutique doit etre actif pour commander."
      : !selectedAddress && activeDeliveryMode === "delivery"
        ? "Ajoutez une adresse de livraison avant de continuer."
        : undefined;

  const handleSaveAddress = async (address: Address) => {
    try {
      const savedAddress = await addAddressMutation.mutateAsync(address);
      setSelectedAddressId(savedAddress.id || "");
      setIsAddingAddress(false);
      toast.success("Adresse enregistree.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Impossible d'enregistrer l'adresse.");
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedPaymentMethod) {
      toast.error("Choisissez un mode de paiement.");
      return;
    }

    const orderShippingAddress =
      activeDeliveryMode === "delivery"
        ? selectedAddress
        : session
          ? buildPickupFallbackAddress(
              session.customer,
              storefrontStore?.businessName || "Boutique",
              pickupInfo?.pickupAddressText || pickupAddressText,
            )
          : undefined;

    if (!orderShippingAddress) {
      toast.error("Ajoutez une adresse de livraison avant de continuer.");
      return;
    }

    if (
      selectedPaymentMethod.requiresManualEntry &&
      (!paymentId.trim() || (!paymentFile && !paymentProofUrl) || !paymentAcknowledged)
    ) {
      toast.error("Completez la reference et la preuve de paiement.");
      return;
    }

    try {
      let proofUrl = paymentProofUrl;

      if (selectedPaymentMethod.requiresManualEntry && paymentFile) {
        const upload = await uploadPaymentProofMutation.mutateAsync(paymentFile);
        proofUrl = upload.filePath;
        setPaymentProofUrl(proofUrl);
      }

      const result = await createOrderMutation.mutateAsync({
        shippingAddress: orderShippingAddress,
        items: boutiqueItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        shippingAmount,
        fulfillmentMethod: activeDeliveryMode,
        taxAmount,
        paymentMethod: selectedPaymentMethod.code,
        paymentId: selectedPaymentMethod.requiresManualEntry ? paymentId : undefined,
        paymentProofUrl: selectedPaymentMethod.requiresManualEntry ? proofUrl : undefined,
        notes,
      });

      if (isBoutiqueMode) {
        clearCartItems(boutiqueCartItemIds);
      } else {
        clearCart();
      }

      toast.success("Commande confirmee.");
      navigate("order-confirmation", {
        id: result.order?.order_number || result.order?.order_id || "",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Impossible de creer la commande.");
    }
  };

  if (!isBoutiqueMode) {
    return (
      <CheckoutContentLayout
        id={id}
        testId={testId}
        title={title}
        subtitle={subtitle}
        content={resolvedContent}
        config={resolvedConfig}
        style={resolvedStyle}
        classes={classes}
      />
    );
  }

  const runtime: CheckoutContentRuntimeProps = {
    cartItems,
    subtotal,
    shippingAmount,
    taxAmount: taxAmount || undefined,
    taxRate: taxRate || undefined,
    totalAmount,
    shippingLoading: isShippingLoading,
    deliveryEstimateText,
    freeShippingMessage,
    availableFulfillmentModes,
    deliveryMode: activeDeliveryMode,
    onDeliveryModeChange: setDeliveryMode,
    customerConnected: Boolean(session),
    customerActive: hasActiveBoutiqueCustomer,
    customerStatusMessage,
    customerActionLabel: "Voir mon espace client boutique",
    onCustomerAction: () => navigate("account"),
    addresses: boutiqueAddresses,
    selectedAddressId: effectiveSelectedAddressId,
    onSelectAddress: setSelectedAddressId,
    isAddingAddress,
    onStartAddAddress: () => setIsAddingAddress(true),
    onCancelAddAddress: () => setIsAddingAddress(false),
    onSaveAddress: handleSaveAddress,
    isSavingAddress: addAddressMutation.isPending,
    pickupAddressText: pickupInfo?.pickupAddressText || pickupAddressText,
    pickupSourceLabel: pickupInfo?.sourceLabel,
    unavailableMessage: pickupInfo?.message,
    paymentMethods: availablePaymentMethods,
    paymentMethodsLoading: paymentMethodsQuery.isLoading,
    paymentMethodsError:
      paymentMethodsQuery.error instanceof Error
        ? paymentMethodsQuery.error.message
        : undefined,
    selectedPaymentMethod,
    onSelectPaymentMethod: (code) => {
      setPaymentMethodCode(code);
      setPaymentAcknowledged(false);
    },
    manualPaymentInstructions,
    requiresManualPaymentAcknowledgement: Boolean(selectedPaymentMethod?.requiresManualEntry),
    paymentId,
    onPaymentIdChange: setPaymentId,
    paymentProofLabel: paymentFile?.name || paymentProofLabel,
    paymentProofReady: Boolean(paymentFile || paymentProofUrl),
    onPaymentFileChange: (file) => {
      setPaymentFile(file);
      setPaymentProofLabel(file?.name || "");
      if (!file) {
        setPaymentProofUrl("");
      }
    },
    paymentAcknowledged: isPaymentAcknowledged,
    onPaymentAcknowledgedChange: setPaymentAcknowledged,
    notes,
    onNotesChange: setNotes,
    onPlaceOrder: handlePlaceOrder,
    isProcessing:
      createOrderMutation.isPending || uploadPaymentProofMutation.isPending,
    onBackToCart: () => navigate("cart"),
    onContinueShopping: () => navigate("products"),
  };

  return (
    <CheckoutContentLayout
      id={id}
      testId={testId}
      title={title}
      subtitle={subtitle}
      content={resolvedContent}
      config={resolvedConfig}
      style={resolvedStyle}
      classes={classes}
      runtime={runtime}
    />
  );
}
