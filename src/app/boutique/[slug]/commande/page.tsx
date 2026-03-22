"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  CreditCard,
  LogIn,
  MapPin,
  Package,
  Plus,
  Store,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { useStorefront } from "@/components/StorefrontProvider";
import { useBoutiqueStore } from "@/components/boutique/BoutiqueStoreProvider";
import {
  useBoutiquePaymentMethodsQuery,
  useBoutiqueProductsQuery,
} from "@/hooks/useBoutiqueStorefront";
import {
  useAddBoutiqueClientAddressMutation,
  useBoutiqueClientAddressesQuery,
  useBoutiqueClientSessionQuery,
  useCreateBoutiqueOrderMutation,
  useUploadBoutiquePaymentProofMutation,
} from "@/hooks/useBoutiqueClient";
import { useCart } from "@/store";
import { useStore as useGlobalStore } from "@/store";
import { Button } from "@/components/ui/Button";
import { AddressForm } from "@/components/checkout/AddressForm";
import type { Address } from "@/data/types";
import {
  getBoutiqueBasePath,
  getBoutiqueCartItemId,
  getBoutiqueCartItems,
} from "@/lib/boutique";
import { cn, getEstimatedDeliveryRange } from "@/lib/utils";
import { useDynamicShippingFee } from "@/hooks/useDynamicShipping";
import { useCartPickupInfo } from "@/hooks/useCartPickupInfo";
import {
  buildManualPaymentInstructions,
  canSellerPaymentMethodBeUsedForFulfillment,
  type SellerPaymentMethodCode,
} from "@/data/paymentMethods";

const steps = [
  { id: "shipping", label: "Livraison" },
  { id: "payment", label: "Paiement" },
  { id: "confirmation", label: "Confirmation" },
];

function buildPickupFallbackAddress(
  customer: {
    firstName: string;
    lastName: string;
    phone?: string;
  },
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

export default function BoutiqueCheckoutPage() {
  const store = useBoutiqueStore();
  const { items, clearCart, clearCartItems } = useCart();
  const { data: session, isLoading: sessionLoading } = useBoutiqueClientSessionQuery(
    store.storeSlug,
  );
  const hasActiveBoutiqueCustomer = session?.customer.status === "active";
  const { data: boutiqueAddresses = [] } = useBoutiqueClientAddressesQuery(
    store.storeSlug,
    hasActiveBoutiqueCustomer,
  );
  const addBoutiqueAddressMutation = useAddBoutiqueClientAddressMutation(store.storeSlug);
  const uploadPaymentProofMutation = useUploadBoutiquePaymentProofMutation(
    store.storeSlug,
  );
  const createBoutiqueOrderMutation = useCreateBoutiqueOrderMutation(store.storeSlug);
  const { formatPrice, settings } = useStorefront();
  const { data: boutiqueProducts = [] } = useBoutiqueProductsQuery();
  const {
    data: boutiquePaymentMethods = [],
    isLoading: paymentMethodsLoading,
    error: paymentMethodsError,
  } = useBoutiquePaymentMethodsQuery();
  const basePath = getBoutiqueBasePath(store.storeSlug);
  const boutiqueClientHref = `${basePath}/client`;
  const checkoutPath = `${basePath}/commande`;
  const clientRedirectHref = `${boutiqueClientHref}?redirect=${encodeURIComponent(checkoutPath)}`;

  const boutiqueItems = useMemo(
    () => getBoutiqueCartItems(items, { sellerId: store.id, storeSlug: store.storeSlug }),
    [items, store.id, store.storeSlug],
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderReference, setOrderReference] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState<"delivery" | "pickup">("delivery");
  const [paymentMethod, setPaymentMethod] = useState<SellerPaymentMethodCode | "">("");
  const [paymentId, setPaymentId] = useState("");
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [paymentProofUrl, setPaymentProofUrl] = useState("");
  const [paymentAcknowledged, setPaymentAcknowledged] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("mode") === "pickup") {
        setDeliveryMode("pickup");
      }
    }
  }, []);

  useEffect(() => {
    if (!selectedAddressId && boutiqueAddresses.length > 0) {
      const defaultAddress =
        boutiqueAddresses.find((address) => address.isDefault) || boutiqueAddresses[0];
      setSelectedAddressId(defaultAddress?.id || "");
    }
  }, [boutiqueAddresses, selectedAddressId]);

  const selectedAddress =
    boutiqueAddresses.find((address) => address.id === selectedAddressId) ||
    boutiqueAddresses[0];

  const boutiqueSubtotal = boutiqueItems.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0,
  );
  const maxMinDays =
    boutiqueItems.length > 0
      ? Math.max(...boutiqueItems.map((item) => item.product.minProcessingDays ?? 1))
      : 1;
  const maxMaxDays =
    boutiqueItems.length > 0
      ? Math.max(...boutiqueItems.map((item) => item.product.maxProcessingDays ?? 3))
      : 3;
  const deliveryRange = getEstimatedDeliveryRange(maxMinDays, maxMaxDays);

  const { data: dynamicShippingFee = 0, isLoading: isShippingLoading } =
    useDynamicShippingFee(
      boutiqueItems,
      undefined,
      selectedAddress?.latitude,
      selectedAddress?.longitude,
    );
  const { data: pickupInfo } = useCartPickupInfo(boutiqueItems, settings);
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
  const availablePaymentMethods = useMemo(
    () =>
      boutiquePaymentMethods.filter((method) =>
        canSellerPaymentMethodBeUsedForFulfillment(method.code, deliveryMode),
      ),
    [boutiquePaymentMethods, deliveryMode],
  );
  const selectedPaymentMethodDefinition = useMemo(() => {
    if (!paymentMethod) {
      return availablePaymentMethods[0] || null;
    }

    return (
      availablePaymentMethods.find((method) => method.code === paymentMethod) || null
    );
  }, [availablePaymentMethods, paymentMethod]);
  const manualPaymentInstructions = useMemo(
    () =>
      selectedPaymentMethodDefinition?.requiresManualEntry
        ? buildManualPaymentInstructions(
            selectedPaymentMethodDefinition.code,
            selectedPaymentMethodDefinition.merchantFirstName,
            selectedPaymentMethodDefinition.merchantLastName,
            selectedPaymentMethodDefinition.merchantAgentCode,
          )
        : [],
    [selectedPaymentMethodDefinition],
  );
  const requiresManualPaymentAcknowledgement =
    Boolean(selectedPaymentMethodDefinition?.requiresManualEntry);

  useEffect(() => {
    if (!availableFulfillmentModes.length) {
      return;
    }

    if (!availableFulfillmentModes.includes(deliveryMode)) {
      setDeliveryMode(availableFulfillmentModes[0]);
    }
  }, [availableFulfillmentModes, deliveryMode]);

  useEffect(() => {
    if (availablePaymentMethods.length === 0) {
      setPaymentMethod("");
      return;
    }

    const fallbackMethod =
      deliveryMode === "pickup"
        ? availablePaymentMethods.find((method) => method.code === "store_pickup") ||
          availablePaymentMethods[0]
        : availablePaymentMethods.find((method) => method.code !== "store_pickup") ||
          availablePaymentMethods[0];

    if (!paymentMethod || !availablePaymentMethods.some((method) => method.code === paymentMethod)) {
      setPaymentMethod(fallbackMethod?.code || "");
    }
  }, [availablePaymentMethods, deliveryMode, paymentMethod]);

  useEffect(() => {
    setPaymentAcknowledged(false);
  }, [selectedPaymentMethodDefinition?.code, deliveryMode]);

  const freeShippingThreshold = settings?.freeShippingThreshold || 0;
  const isActuallyFree = freeShippingThreshold > 0 && boutiqueSubtotal >= freeShippingThreshold;
  const shippingAmount =
    deliveryMode === "pickup" || !availableFulfillmentModes.includes("delivery")
      ? 0
      : isActuallyFree
        ? 0
        : dynamicShippingFee;
  const taxRate = settings?.taxRate || 0;
  const taxAmount = (boutiqueSubtotal * taxRate) / 100;
  const finalTotal = boutiqueSubtotal + shippingAmount + taxAmount;
  const pickupFallbackAddress = session
    ? buildPickupFallbackAddress(
        session.customer,
        store.businessName,
        pickupInfo?.pickupAddressText,
      )
    : null;

  const recommendations = boutiqueProducts
    .filter((product) => !boutiqueItems.some((item) => item.product.id === product.id))
    .slice(0, 4);
  const canProceedWithPayment =
    Boolean(selectedPaymentMethodDefinition) &&
    (!requiresManualPaymentAcknowledgement ||
      (Boolean(paymentId.trim()) &&
        Boolean(paymentFile || paymentProofUrl) &&
        paymentAcknowledged));

  if (boutiqueItems.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen bg-[#fbf8f3] px-4 py-20">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-neutral-200 bg-white p-10 text-center">
          <h1 className="text-3xl font-semibold text-neutral-900">Panier boutique vide</h1>
          <p className="mt-4 text-neutral-500">
            Ajoutez des produits de {store.businessName} avant de lancer ce checkout boutique.
          </p>
          <Link href={`${basePath}/collection`} className="mt-6 inline-flex">
            <Button>Voir la collection</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-[#fbf8f3] px-4 py-20">
        <div className="mx-auto max-w-4xl animate-pulse rounded-[2rem] border border-neutral-200 bg-white p-10">
          <div className="h-8 w-56 rounded bg-neutral-200" />
          <div className="mt-5 h-4 w-full rounded bg-neutral-100" />
          <div className="mt-3 h-4 w-2/3 rounded bg-neutral-100" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#fbf8f3] px-4 py-20">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-neutral-200 bg-white p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-700">
            <Store className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold text-neutral-900">
            Connectez-vous a cette boutique
          </h1>
          <p className="mt-4 text-neutral-500">
            Pour commander chez {store.businessName}, vous devez d&apos;abord vous connecter ou vous inscrire via le compte client de cette boutique.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href={clientRedirectHref}>
              <Button>
                <LogIn className="mr-2 h-4 w-4" />
                Se connecter
              </Button>
            </Link>
            <Link href={clientRedirectHref}>
              <Button variant="outline">Creer mon compte</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!hasActiveBoutiqueCustomer) {
    return (
      <div className="min-h-screen bg-[#fbf8f3] px-4 py-20">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-neutral-200 bg-white p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-700">
            <Store className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold text-neutral-900">
            {session?.customer.status === "blocked"
              ? "Compte client boutique bloque"
              : "Activez votre compte client boutique"}
          </h1>
          <p className="mt-4 text-neutral-500">
            {session?.customer.status === "blocked"
              ? `Cette boutique a suspendu votre acces client local. La commande est indisponible tant que ce compte reste bloque.`
              : `Cette commande exige une session client active pour ${store.businessName}.`}
          </p>
          <div className="mt-8 flex justify-center">
            <Link href={clientRedirectHref}>
              <Button>
                {session?.customer.status === "blocked"
                  ? "Voir mon espace client boutique"
                  : "Activer mon compte client pour cette boutique"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleAddAddress = async (data: Address) => {
    const savedAddress = await addBoutiqueAddressMutation.mutateAsync(data);
    setSelectedAddressId(savedAddress.id || "");
    setIsAddingAddress(false);
  };

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      if (currentStep === steps.length - 2) {
        if (!selectedPaymentMethodDefinition) {
          alert("Veuillez choisir un mode de paiement actif pour cette boutique.");
          return;
        }

        if (requiresManualPaymentAcknowledgement && !paymentAcknowledged) {
          alert("Veuillez confirmer que vous avez bien lu et verifie le nom et le code agent.");
          return;
        }

        if (
          requiresManualPaymentAcknowledgement &&
          (!paymentId.trim() || (!paymentFile && !paymentProofUrl))
        ) {
          alert("Veuillez fournir la reference de transaction et une capture d'ecran.");
          return;
        }

        setIsProcessing(true);
        try {
          const orderShippingAddress =
            deliveryMode === "delivery"
              ? selectedAddress
              : selectedAddress || pickupFallbackAddress;

          if (!orderShippingAddress) {
            throw new Error(
              deliveryMode === "delivery"
                ? "Ajoutez une adresse de livraison avant de continuer."
                : "Impossible de preparer les coordonnees de retrait pour cette commande.",
            );
          }

          let proofPath = paymentProofUrl;

          if (selectedPaymentMethodDefinition.requiresManualEntry && paymentFile) {
            const uploadResult = await uploadPaymentProofMutation.mutateAsync(paymentFile);
            proofPath = uploadResult.filePath;
            setPaymentProofUrl(proofPath);
          }

          const orderResult = await createBoutiqueOrderMutation.mutateAsync({
            shippingAmount,
            fulfillmentMethod: deliveryMode,
            taxAmount,
            paymentMethod: selectedPaymentMethodDefinition.code,
            paymentId: selectedPaymentMethodDefinition.requiresManualEntry ? paymentId : undefined,
            paymentProofUrl: selectedPaymentMethodDefinition.requiresManualEntry
              ? proofPath
              : undefined,
            shippingAddress: orderShippingAddress,
            items: boutiqueItems.map((item) => ({
              productId: item.product.id,
              quantity: item.quantity,
            })),
            notes:
              deliveryMode === "pickup"
              ? `[RETRAIT BOUTIQUE - ${store.businessName}]\n${notes}`
                : notes,
          });

          const createdBoutiqueCartItemIds = boutiqueItems.map((item) =>
            getBoutiqueCartItemId(item),
          );

          clearCartItems(createdBoutiqueCartItemIds);

          const createdOrderId =
            orderResult.order?.order_id || orderResult.order?.order_number || "";

          let resolvedOrderReference =
            orderResult.order?.order_number || orderResult.order?.order_id || "";

          if (createdOrderId) {
            const detailResponse = await fetch(
              `/api/boutique-auth/${store.storeSlug}/orders/${createdOrderId}`,
              {
                credentials: "include",
                cache: "no-store",
              },
            );

            if (detailResponse.ok) {
              const detailPayload = (await detailResponse.json()) as {
                order?: { orderNumber?: string; id?: string } | null;
              };

              resolvedOrderReference =
                detailPayload.order?.orderNumber ||
                detailPayload.order?.id ||
                resolvedOrderReference;
            }
          }

          if (createdBoutiqueCartItemIds.length > 0) {
            const remainingBoutiqueItems = getBoutiqueCartItems(
              useGlobalStore.getState().items,
              { sellerId: store.id, storeSlug: store.storeSlug },
            );

            if (
              remainingBoutiqueItems.length > 0 &&
              remainingBoutiqueItems.length === useGlobalStore.getState().items.length
            ) {
              clearCart();
            }
          }

          setOrderReference(resolvedOrderReference);
          setOrderComplete(true);
          setCurrentStep((current) => current + 1);
        } catch (error: unknown) {
          console.error("Failed to create boutique order:", error);
          alert(
            `Erreur: ${
              error instanceof Error ? error.message : "Impossible de creer la commande boutique."
            }`,
          );
        } finally {
          setIsProcessing(false);
        }
      } else {
        setCurrentStep((current) => current + 1);
      }
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-[#fbf8f3] px-4 py-20">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-neutral-200 bg-white p-10 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <Check className="h-10 w-10" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold text-neutral-900">Commande boutique confirmee</h1>
          <p className="mt-4 text-neutral-500">
            Merci. Votre commande pour {store.businessName} a bien ete enregistree.
          </p>
          <p className="mt-4 text-xl font-semibold text-neutral-900">{orderReference}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {orderReference ? (
              <Link href={`${basePath}/commande/${orderReference}`}>
                <Button>Voir cette commande</Button>
              </Link>
            ) : null}
            <Link href={`${basePath}/profil`}>
              <Button variant="outline">Mon compte client boutique</Button>
            </Link>
            <Link href={basePath}>
              <Button variant="outline">Retour a la boutique</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf8f3] pb-20">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between gap-4">
          <Link
            href={`${basePath}/panier`}
            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-700 underline underline-offset-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au panier boutique
          </Link>
          <h1 className="text-2xl font-semibold text-neutral-900">Checkout boutique</h1>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-4">
              <div className={cn("flex items-center gap-2", index <= currentStep ? "text-neutral-900" : "text-neutral-400")}>
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm",
                    index < currentStep
                      ? "bg-emerald-500 text-white"
                      : index === currentStep
                        ? "bg-neutral-900 text-white"
                        : "bg-neutral-200 text-neutral-600",
                  )}
                >
                  {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <span className="hidden text-sm sm:inline">{step.label}</span>
              </div>
              {index < steps.length - 1 ? <ChevronRight className="h-4 w-4 text-neutral-300" /> : null}
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {currentStep === 0 ? (
              <section className="space-y-6 rounded-[2rem] border border-neutral-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-neutral-900">
                    {deliveryMode === "pickup" ? "Retrait en boutique" : "Adresse de livraison"}
                  </h2>
                  {deliveryMode === "delivery" && boutiqueAddresses.length > 0 && !isAddingAddress ? (
                    <Button variant="outline" size="sm" onClick={() => setIsAddingAddress(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Nouvelle adresse
                    </Button>
                  ) : null}
                </div>

                {availableFulfillmentModes.length > 1 ? (
                  <div className="flex rounded-full bg-neutral-100 p-1">
                    <button
                      type="button"
                      onClick={() => setDeliveryMode("delivery")}
                      className={cn(
                        "flex-1 rounded-full px-4 py-2 text-sm font-medium",
                        deliveryMode === "delivery" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500",
                      )}
                    >
                      Livraison
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryMode("pickup")}
                      className={cn(
                        "flex-1 rounded-full px-4 py-2 text-sm font-medium",
                        deliveryMode === "pickup" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500",
                      )}
                    >
                      Retrait
                    </button>
                  </div>
                ) : availableFulfillmentModes.length === 1 ? (
                  <div className="rounded-full bg-neutral-100 px-4 py-2 text-center text-sm font-medium text-neutral-700">
                    Mode disponible: {availableFulfillmentModes[0] === "delivery" ? "Livraison" : "Retrait en magasin"}
                  </div>
                ) : null}

                {availableFulfillmentModes.length === 0 ? (
                  <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
                    {pickupInfo?.message || "Cette boutique n'accepte pas encore les commandes."}
                  </div>
                ) : deliveryMode === "pickup" ? (
                  <div className="rounded-[1.5rem] border border-neutral-200 bg-neutral-50 p-5">
                    <div className="flex items-start gap-3">
                      <Store className="mt-0.5 h-5 w-5 text-neutral-600" />
                      <div className="space-y-2 text-sm">
                        <p className="font-medium text-neutral-900">Adresse de retrait</p>
                        <p className="rounded-2xl border border-neutral-200 bg-white p-3 text-neutral-500">
                          {pickupInfo?.pickupAddressText || "Adresse du point de retrait non renseignee."}
                        </p>
                        <p className="text-neutral-500">
                          Votre commande sera preparee puis remise sur place par la boutique.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : isAddingAddress ? (
                  <AddressForm
                    onSubmit={handleAddAddress}
                    onCancel={() => setIsAddingAddress(false)}
                    title="Ajouter une adresse"
                    submitLabel="Continuer avec cette adresse"
                  />
                ) : (
                  <div className="space-y-3">
                    {boutiqueAddresses.map((address) => (
                      <label
                        key={address.id}
                        className={cn(
                          "block rounded-[1.5rem] border p-4 transition-colors",
                          selectedAddressId === address.id
                            ? "border-neutral-900 bg-neutral-50"
                            : "border-neutral-200",
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="boutique-address"
                            checked={selectedAddressId === address.id}
                            onChange={() => setSelectedAddressId(address.id || "")}
                            className="mt-1"
                          />
                          <div className="text-sm">
                            <p className="font-medium text-neutral-900">
                              {address.firstName} {address.lastName}
                            </p>
                            <p className="mt-1 text-neutral-500">
                              {[address.address, address.city, address.country].filter(Boolean).join(", ")}
                            </p>
                            {address.phone ? (
                              <p className="mt-2 text-xs text-neutral-500">Tel: {address.phone}</p>
                            ) : null}
                          </div>
                        </div>
                      </label>
                    ))}

                    {boutiqueAddresses.length === 0 ? (
                      <div className="rounded-[1.5rem] border-2 border-dashed border-neutral-300 p-8 text-center">
                        <MapPin className="mx-auto h-10 w-10 text-neutral-300" />
                        <p className="mt-4 text-neutral-500">
                          Ajoutez votre premiere adresse pour cette boutique.
                        </p>
                        <Button onClick={() => setIsAddingAddress(true)} className="mt-4">
                          Ajouter une adresse
                        </Button>
                      </div>
                    ) : null}
                  </div>
                )}
              </section>
            ) : null}

            {currentStep === 1 ? (
              <section className="space-y-6 rounded-[2rem] border border-neutral-200 bg-white p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-neutral-900">Paiement</h2>
                    <p className="mt-1 text-sm text-neutral-500">
                      Selectionnez un moyen de paiement actif propose par cette
                      boutique.
                    </p>
                  </div>
                  <div className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
                    {deliveryMode === "pickup" ? "Retrait en boutique" : "Livraison"}
                  </div>
                </div>

                {paymentMethodsLoading ? (
                  <div className="rounded-[1.5rem] border border-dashed border-neutral-300 bg-neutral-50 p-6 text-sm text-neutral-500">
                    Chargement des modes de paiement de la boutique...
                  </div>
                ) : paymentMethodsError ? (
                  <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
                    {paymentMethodsError instanceof Error
                      ? paymentMethodsError.message
                      : "Impossible de charger les modes de paiement de la boutique."}
                  </div>
                ) : availablePaymentMethods.length === 0 ? (
                  <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
                    Cette boutique n&apos;a pas encore de mode de paiement actif pour
                    ce mode de livraison. Reessayez plus tard ou contactez la
                    boutique.
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {availablePaymentMethods.map((option) => {
                      const isSelected = selectedPaymentMethodDefinition?.code === option.code;
                      return (
                        <button
                          key={option.code}
                          type="button"
                          onClick={() => setPaymentMethod(option.code)}
                          className={cn(
                            "flex items-start justify-between rounded-[1.5rem] border p-4 text-left transition-colors",
                            isSelected
                              ? "border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900"
                              : "border-neutral-200",
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <CreditCard className="mt-0.5 h-5 w-5 text-neutral-600" />
                            <div>
                              <p className="font-medium text-neutral-900">{option.label}</p>
                              <p className="mt-1 text-xs text-neutral-500">
                                {option.description}
                              </p>
                              {option.requiresManualEntry ? (
                                <p className="mt-2 text-xs font-medium text-neutral-700">
                                  Compte: {option.merchantFirstName || "Non renseigne"}{" "}
                                  {option.merchantLastName || ""}
                                  {" "}
                                  {option.merchantAgentCode
                                    ? `- Code agent ${option.merchantAgentCode}`
                                    : ""}
                                </p>
                              ) : (
                                <p className="mt-2 text-xs font-medium text-neutral-700">
                                  Paiement au magasin reserve au retrait en boutique.
                                </p>
                              )}
                            </div>
                          </div>
                          {isSelected ? <Check className="mt-1 h-4 w-4" /> : null}
                        </button>
                      );
                    })}
                  </div>
                )}

                {selectedPaymentMethodDefinition ? (
                  <div className="space-y-4 rounded-[1.5rem] border border-neutral-200 bg-neutral-50 p-5">
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                      <p className="font-medium">
                        {requiresManualPaymentAcknowledgement
                          ? `Instructions ${selectedPaymentMethodDefinition.label}`
                          : "Paiement au magasin"}
                      </p>
                      {requiresManualPaymentAcknowledgement ? (
                        <div className="mt-3 space-y-2">
                          {manualPaymentInstructions.map((instruction) => (
                            <p key={instruction}>{instruction}</p>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2">
                          Vous paierez directement au magasin lorsque votre commande
                          sera prete a retirer. Aucun numero de transaction n&apos;est
                          requis.
                        </p>
                      )}
                    </div>

                    {requiresManualPaymentAcknowledgement ? (
                      <>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-sm font-medium text-neutral-700">
                              ID ou reference de transaction
                            </label>
                            <input
                              type="text"
                              value={paymentId}
                              onChange={(event) => setPaymentId(event.target.value)}
                              className="w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none focus:border-neutral-900"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-neutral-700">
                              Preuve de paiement
                            </label>
                            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[1.5rem] border-2 border-dashed border-neutral-300 bg-white p-8 text-center">
                              {paymentFile ? (
                                <>
                                  <ImageIcon className="h-8 w-8 text-emerald-600" />
                                  <p className="text-sm font-medium text-emerald-700">
                                    {paymentFile.name}
                                  </p>
                                </>
                              ) : (
                                <>
                                  <Upload className="h-8 w-8 text-neutral-400" />
                                  <p className="text-sm text-neutral-500">
                                    Cliquez pour televerser la preuve
                                  </p>
                                </>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(event) =>
                                  setPaymentFile(event.target.files?.[0] || null)
                                }
                              />
                            </label>
                          </div>
                        </div>
                        <label
                          htmlFor="payment-acknowledgement"
                          className="flex cursor-pointer items-start gap-3 rounded-[1.5rem] border border-neutral-200 bg-white p-4 text-sm text-neutral-700"
                        >
                          <input
                            id="payment-acknowledgement"
                            type="checkbox"
                            checked={paymentAcknowledged}
                            onChange={(event) => setPaymentAcknowledged(event.target.checked)}
                            className="mt-1 h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                          />
                          <span>
                            Je confirme avoir lu et verifie le nom, le prenom et le code agent
                            affiche. Si je saisis un code erroné, la boutique ne peut pas etre
                            tenue responsable.
                            <Link
                              href="#avertissement-paiement"
                              className="ml-1 font-medium text-neutral-900 underline underline-offset-4"
                            >
                              Lire l&apos;avertissement
                            </Link>
                          </span>
                        </label>
                        <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-600">
                          <p id="avertissement-paiement" className="font-medium text-neutral-900">
                            Avant de continuer
                          </p>
                          <p className="mt-1">
                            Le client doit voir les noms et le code agent ci-dessus,
                            puis saisir la reference de transaction avant de cliquer
                            sur Commander.
                          </p>
                        </div>
                      </>
                    ) : null}
                  </div>
                ) : null}

                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">Notes de commande</label>
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={4}
                    className="w-full rounded-[1.5rem] border border-neutral-200 px-4 py-3 outline-none focus:border-neutral-900"
                  />
                </div>
              </section>
            ) : null}

            <div className="flex gap-3">
              {currentStep > 0 ? (
                <Button variant="outline" onClick={() => setCurrentStep((current) => current - 1)}>
                  Retour
                </Button>
              ) : null}
              {!isAddingAddress ? (
                <Button
                  onClick={handleNext}
                  isLoading={isProcessing}
                  fullWidth
                  disabled={
                    (currentStep === 0 &&
                      deliveryMode === "delivery" &&
                      !selectedAddress) ||
                    (currentStep === 0 && availableFulfillmentModes.length === 0) ||
                    (currentStep === 1 &&
                      (paymentMethodsLoading ||
                        availablePaymentMethods.length === 0 ||
                        (requiresManualPaymentAcknowledgement && !paymentAcknowledged) ||
                        !canProceedWithPayment))
                  }
                >
                  {currentStep === steps.length - 2
                    ? `Commander ${formatPrice(finalTotal)}`
                    : "Continuer"}
                </Button>
              ) : null}
            </div>
          </div>

          <div className="lg:pl-8">
            <div className="sticky top-28 space-y-6 rounded-[2rem] border border-neutral-200 bg-white p-6">
              <h3 className="flex items-center gap-2 text-xl font-semibold text-neutral-900">
                <Package className="h-5 w-5" />
                Recapitulatif
              </h3>

              {deliveryMode === "delivery" && selectedAddress ? (
                <div className="rounded-[1.5rem] bg-neutral-50 p-4 text-sm text-neutral-600">
                  <p className="font-medium text-neutral-900">
                    Livrer a
                  </p>
                  <p className="mt-2">
                    {selectedAddress.firstName} {selectedAddress.lastName}
                  </p>
                  <p>{[selectedAddress.address, selectedAddress.city, selectedAddress.country].filter(Boolean).join(", ")}</p>
                </div>
              ) : null}

              {deliveryMode === "delivery" && !selectedAddress ? (
                <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800">
                  Ajoutez une adresse dans votre espace client boutique avant de confirmer cette commande.
                </div>
              ) : null}

              {boutiqueItems.length > 0 ? (
                <div className="rounded-[1.5rem] bg-neutral-50 p-4 text-sm text-neutral-600">
                  {deliveryMode === "delivery" && availableFulfillmentModes.includes("delivery") ? (
                    <>
                      <p className="font-medium text-neutral-900">Livraison estimee</p>
                      <p className="mt-2">Prevue du {deliveryRange}</p>
                    </>
                  ) : availableFulfillmentModes.includes("pickup") ? (
                    <>
                      <p className="font-medium text-neutral-900">Point de retrait</p>
                      <p className="mt-2">{pickupInfo?.pickupAddressText || "Adresse du point de retrait non renseignee."}</p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-neutral-900">Commande indisponible</p>
                      <p className="mt-2">{pickupInfo?.message || "Cette boutique n'accepte pas encore les commandes."}</p>
                    </>
                  )}
                </div>
              ) : null}

              {availableFulfillmentModes.length === 0 && pickupInfo?.message ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                  {pickupInfo.message}
                </div>
              ) : null}

              <div className="space-y-3 border-b border-neutral-200 pb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Articles ({boutiqueItems.length})</span>
                  <span>{formatPrice(boutiqueSubtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">{deliveryMode === "pickup" ? "Retrait" : "Livraison"}</span>
                  <span>{isShippingLoading ? "Calcul..." : shippingAmount === 0 ? "Gratuite" : formatPrice(shippingAmount)}</span>
                </div>
                {taxRate > 0 ? (
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Taxes ({taxRate}%)</span>
                    <span>{formatPrice(taxAmount)}</span>
                  </div>
                ) : null}
              </div>

              <div className="flex justify-between">
                <span className="text-lg font-semibold text-neutral-900">Total</span>
                <span className="text-2xl font-semibold text-neutral-900">{formatPrice(finalTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {recommendations.length > 0 ? (
          <section className="mt-16">
            <div className="mb-6">
              <p className="text-xs uppercase tracking-[0.28em] text-neutral-400">Suggestions boutique</p>
              <h2 className="mt-2 text-3xl font-semibold text-neutral-900">Derniere chance avant de confirmer</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {recommendations.map((product) => (
                <Link
                  key={product.id}
                  href={`/boutique/${store.storeSlug}/produit/${product.id}`}
                  className="block"
                >
                  <div className="relative h-72 overflow-hidden rounded-[1.5rem] bg-white">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-neutral-900">{product.name}</h3>
                  <p className="mt-1 text-sm text-neutral-500">{formatPrice(product.price)}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
