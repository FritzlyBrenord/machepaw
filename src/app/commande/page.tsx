"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Truck,
  Check,
  Package,
  ChevronRight,
  Plus,
  MapPin,
  Smartphone,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { useStorefront } from "@/components/StorefrontProvider";
import { useCart, useUser } from "@/store";
import { Button } from "@/components/ui/Button";
import { calculateShippingAmount } from "@/lib/storefront";
import { AddressForm } from "@/components/checkout/AddressForm";
import { useAuth } from "@/hooks/useAuth";
import type { Address } from "@/data/types";
import { cn, getEstimatedDeliveryRange } from "@/lib/utils";
import { ProductRecommendations } from "@/components/ProductRecommendations";
import { useDynamicShippingFee } from "@/hooks/useDynamicShipping";
import { useCartPickupInfo } from "@/hooks/useCartPickupInfo";

const steps = [
  { id: "shipping", label: "Livraison" },
  { id: "payment", label: "Paiement" },
  { id: "confirmation", label: "Confirmation" },
];

export default function CheckoutPage() {
  const { items, getCartTotal, clearCart } = useCart();
  const { addresses, addAddress, setAddresses } = useUser();
  const { 
    fetchAddresses,
    addAddressInDb, 
    createOrderInDb, 
    uploadPaymentProof 
  } = useAuth();
  const { shippingRates, formatPrice, settings } = useStorefront();

  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderReference, setOrderReference] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState(addresses[0]?.id || "");
  const [isAddingAddress, setIsAddingAddress] = useState(addresses.length === 0);
  const [deliveryMode, setDeliveryMode] = useState<"delivery" | "pickup">("delivery");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const qs = new URLSearchParams(window.location.search);
      const mode = qs.get("mode");
      if (mode === "pickup") setDeliveryMode("pickup");
    }
  }, []);

  const maxMinDays = items.length > 0 ? Math.max(...items.map((item) => item.product.minProcessingDays ?? 1)) : 1;
  const maxMaxDays = items.length > 0 ? Math.max(...items.map((item) => item.product.maxProcessingDays ?? 3)) : 3;
  const deliveryRange = getEstimatedDeliveryRange(maxMinDays, maxMaxDays);
  const [paymentMethod, setPaymentMethod] = useState<"moncash" | "natcash" | "delivery">("moncash");
  const [paymentId, setPaymentId] = useState("");
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [paymentProofUrl, setPaymentProofUrl] = useState("");
  const [notes, setNotes] = useState("");
  
  // Safety check: ensure cart is cleared if order is complete
  useEffect(() => {
    if (orderComplete && items.length > 0) {
      const timer = setTimeout(() => clearCart(), 100);
      return () => clearTimeout(timer);
    }
  }, [orderComplete, items.length, clearCart]);

  useEffect(() => {
    let isMounted = true;

    if (addresses.length > 0) {
      return;
    }

    void fetchAddresses().then((data) => {
      if (isMounted && data.length > 0) {
        setAddresses(data);
        setSelectedAddressId((current) => current || data[0]?.id || "");
      }
    });

    return () => {
      isMounted = false;
    };
  }, [addresses.length, fetchAddresses, setAddresses]);

  const selectedAddress =
    addresses.find((address) => address.id === selectedAddressId) || addresses[0];

  const cartTotal = getCartTotal();
  
  const { data: dynamicShippingFee = 0, isLoading: isShippingLoading } = useDynamicShippingFee(
    items,
    selectedAddressId
  );
  const { data: pickupInfo } = useCartPickupInfo(items, settings);

  useEffect(() => {
    if (deliveryMode === "pickup" && !pickupInfo?.allowPickup) {
      setDeliveryMode("delivery");
    }
  }, [deliveryMode, pickupInfo?.allowPickup]);

  const freeShippingThreshold = settings?.freeShippingThreshold || 0;
  const isActuallyFree = freeShippingThreshold > 0 && cartTotal >= freeShippingThreshold;
  const finalShippingFee = deliveryMode === "pickup" 
    ? 0 
    : (isActuallyFree ? 0 : dynamicShippingFee || 0);

  const shippingSummary = { amount: finalShippingFee };

  const taxRate = settings?.taxRate || 0;
  const taxAmount = (cartTotal * taxRate) / 100;

  const finalTotal = cartTotal + shippingSummary.amount + taxAmount;

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-light mb-4">Votre panier est vide</h1>
          <Link href="/collection">
            <Button>Continuer les achats</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleNextStep = async () => {
    if (currentStep < steps.length - 1) {
      if (currentStep === steps.length - 2) {
        if (paymentMethod !== "delivery" && (!paymentId || (!paymentFile && !paymentProofUrl))) {
          alert("Veuillez fournir l'ID de paiement et une capture d'écran.");
          return;
        }

        setIsProcessing(true);
        try {
          let proofPath = paymentProofUrl;
          if (paymentFile) {
            proofPath = await uploadPaymentProof(paymentFile);
            setPaymentProofUrl(proofPath);
          }

          const orderData = {
            subtotal: cartTotal,
            shipping: shippingSummary.amount,
            tax: taxAmount,
            total: finalTotal,
            paymentMethod: paymentMethod,
            paymentId: paymentId,
            paymentProofUrl: proofPath,
            shippingAddress: selectedAddress,
            notes:
              deliveryMode === "pickup"
                ? `[RETRAIT EN MAGASIN${pickupInfo?.sourceLabel ? ` - ${pickupInfo.sourceLabel}` : ""}]\n${notes}`
                : notes
          };

          const orderResult = await createOrderInDb(orderData, items);
          setOrderReference(orderResult?.order_number || "");
          
          clearCart(); // Clear cart first to ensure persistence
          setOrderComplete(true);
          setCurrentStep(currentStep + 1);
        } catch (err: any) {
          console.error("Failed to create order:", err);
          alert(`Erreur: ${err.message || JSON.stringify(err)}`);
        } finally {
          setIsProcessing(false);
        }
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAddAddress = async (data: Address) => {
    try {
      const result = await addAddressInDb(data);
      const newAddr = { ...data, id: result.id };
      addAddress(newAddr);
      setSelectedAddressId(result.id);
      setIsAddingAddress(false);
    } catch (err) {
      console.error("Failed to save address:", err);
      alert("Erreur lors de l'enregistrement de l'adresse");
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen py-40">
        <div className="max-w-xl mx-auto px-4 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Check className="w-10 h-10 text-green-600" />
          </motion.div>
          <h1 className="text-3xl font-light text-neutral-900 mb-4">
            Commande confirmée
          </h1>
          <p className="text-neutral-600 mb-2">
            Merci pour votre commande. Votre numéro est:
          </p>
          <p className="text-xl font-medium text-neutral-900 mb-6">
            {orderReference}
          </p>
          <p className="text-neutral-500 mb-8">
            Le total a été calculé avec la règle de livraison actuellement
            applicable à votre destination.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/profil">
              <Button variant="outline">Voir mes commandes</Button>
            </Link>
            <Link href="/">
              <Button>Retour à l&apos;accueil</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/panier"
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au panier
          </Link>
          <h1 className="text-2xl font-light">Commande</h1>
        </div>

        <div className="flex items-center justify-center gap-4 mb-12">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-4">
              <div
                className={`flex items-center gap-2 ${
                  index <= currentStep ? "text-neutral-900" : "text-neutral-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    index < currentStep
                      ? "bg-green-500 text-white"
                      : index === currentStep
                        ? "bg-neutral-900 text-white"
                        : "bg-neutral-200 text-neutral-600"
                  }`}
                >
                  {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                <span className="hidden sm:block text-sm">{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-neutral-300" />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {currentStep === 0 && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-medium flex items-center gap-2">
                      <Truck className="w-5 h-5" />
                      {deliveryMode === "pickup" ? "Coordonnées de facturation" : "Adresse de livraison"}
                    </h2>
                    {addresses.length > 0 && !isAddingAddress && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsAddingAddress(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Nouvelle adresse
                      </Button>
                    )}
                  </div>

                  {isAddingAddress ? (
                    <AddressForm
                      onSubmit={handleAddAddress}
                      onCancel={() => setIsAddingAddress(addresses.length === 0 ? false : false)}
                      title="Ajouter une nouvelle adresse"
                      submitLabel="Continuer avec cette adresse"
                    />
                  ) : (
                    <div className="space-y-3">
                      {addresses.map((address) => (
                        <label
                          key={address.id}
                          className={cn(
                            "flex items-start gap-3 p-4 border transition-all cursor-pointer hover:border-neutral-900",
                            selectedAddressId === address.id 
                              ? "border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900" 
                              : "border-neutral-200"
                          )}
                        >
                          <input
                            type="radio"
                            name="address"
                            checked={selectedAddressId === address.id}
                            onChange={() => setSelectedAddressId(address.id || "")}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium">
                                {address.firstName} {address.lastName}
                              </p>
                              {address.label && (
                                <span className="text-xs bg-neutral-200 px-2 py-0.5 rounded">
                                  {address.label}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-neutral-600">{address.address}</p>
                            {address.apartment && (
                              <p className="text-sm text-neutral-600">{address.apartment}</p>
                            )}
                            <p className="text-sm text-neutral-600">
                              {address.city}, {address.postalCode}
                            </p>
                            {(address.commune || address.arrondissement || address.department) && (
                              <p className="text-sm text-neutral-600 italic">
                                {[address.commune, address.arrondissement, address.department]
                                  .filter(Boolean)
                                  .join(", ")}
                              </p>
                            )}
                            <p className="text-sm text-neutral-900 mt-1 font-medium">{address.country}</p>
                            {address.phone && (
                              <p className="text-xs text-neutral-500 mt-2">Tel: {address.phone}</p>
                            )}
                          </div>
                        </label>
                      ))}

                      {addresses.length === 0 && (
                        <div className="p-8 border-2 border-dashed border-neutral-200 text-center rounded-lg">
                          <MapPin className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                          <p className="text-neutral-500 mb-6">Vous n&apos;avez pas encore d&apos;adresse enregistrée.</p>
                          <Button onClick={() => setIsAddingAddress(true)}>
                            Ajouter ma première adresse
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {currentStep === 1 && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-xl font-medium">Mode de paiement</h2>
                  
                  <div className="grid gap-4">
                    <button
                      onClick={() => setPaymentMethod("moncash")}
                      className={cn(
                        "flex items-center justify-between p-4 border transition-all text-left",
                        paymentMethod === "moncash" ? "border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900" : "border-neutral-200"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-red-600" />
                        <div>
                          <p className="font-medium">Mon Cash</p>
                          <p className="text-xs text-neutral-500">Paiement manuel via Mon Cash</p>
                        </div>
                      </div>
                      {paymentMethod === "moncash" && <Check className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => setPaymentMethod("natcash")}
                      className={cn(
                        "flex items-center justify-between p-4 border transition-all text-left",
                        paymentMethod === "natcash" ? "border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900" : "border-neutral-200"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium">NatCash</p>
                          <p className="text-xs text-neutral-500">Paiement manuel via NatCash</p>
                        </div>
                      </div>
                      {paymentMethod === "natcash" && <Check className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => setPaymentMethod("delivery")}
                      className={cn(
                        "flex items-center justify-between p-4 border transition-all text-left",
                        paymentMethod === "delivery" ? "border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900" : "border-neutral-200"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Truck className="w-5 h-5 text-neutral-600" />
                        <div>
                          <p className="font-medium">Paiement à la livraison</p>
                          <p className="text-xs text-neutral-500">Payer en espèces lors de la réception</p>
                        </div>
                      </div>
                      {paymentMethod === "delivery" && <Check className="w-4 h-4" />}
                    </button>
                  </div>

                  {paymentMethod !== "delivery" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="p-6 border border-neutral-200 bg-neutral-50 space-y-4 rounded-lg"
                    >
                      <div className="bg-amber-50 border border-amber-200 p-4 rounded-md mb-4 text-sm text-amber-800">
                        <p className="font-medium mb-1">Instructions de paiement :</p>
                        <p>1. Effectuez le transfert vers notre numéro (ex: +509 3xxx-xxxx).</p>
                        <p>{`2. Copiez l'ID de transaction reçu par SMS.`}</p>
                        <p>{`3. Prenez une capture d'écran du message de confirmation.`}</p>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-1.5 block">ID de Transaction</label>
                        <input
                          type="text"
                          value={paymentId}
                          onChange={(e) => setPaymentId(e.target.value)}
                          placeholder="Ex: 23456789"
                          className="w-full px-4 py-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Preuve de paiement (Screenshot)</label>
                        <div className="relative group">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setPaymentFile(e.target.files?.[0] || null)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div className={cn(
                            "border-2 border-dashed p-8 text-center transition-colors rounded-lg",
                            paymentFile ? "border-green-300 bg-green-50" : "border-neutral-200 hover:border-neutral-400"
                          )}>
                            {paymentFile ? (
                              <div className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                  <ImageIcon className="w-6 h-6" />
                                </div>
                                <p className="text-sm font-medium text-green-800 truncate max-w-xs">{paymentFile.name}</p>
                                <p className="text-xs text-green-600">Fichier prêt pour le téléchargement</p>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2">
                                <Upload className="w-8 h-8 text-neutral-400" />
                                <p className="text-sm text-neutral-600 font-medium">Cliquez pour télécharger la capture d&apos;écran</p>
                                <p className="text-xs text-neutral-400 uppercase tracking-wider">JPG, PNG ou WEBP jusqu&apos;à 10MB</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Notes de commande (optionnel)</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Instructions spéciales pour la livraison..."
                      className="w-full px-4 py-3 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-white h-24 resize-none"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-4 mt-8 pt-6 border-t border-neutral-100">
              {currentStep > 0 && (
                <Button variant="outline" onClick={handlePrevStep}>
                  Retour
                </Button>
              )}
              {!isAddingAddress && (
                <Button
                  onClick={handleNextStep}
                  isLoading={isProcessing}
                  fullWidth={currentStep === 0 && addresses.length === 0}
                  disabled={(currentStep === 0 && !selectedAddress) || items.length === 0}
                >
                  {currentStep === steps.length - 2
                    ? "Payer " + formatPrice(finalTotal)
                    : "Continuer vers le paiement"}
                </Button>
              )}
            </div>
          </div>

          <div className="lg:pl-8">
            <div className="bg-neutral-50 p-6 sticky top-24 border border-neutral-100 rounded-sm">
              <h3 className="font-medium text-neutral-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Récapitulatif
              </h3>
              
              {selectedAddress && (
                <div className="mb-6 p-3 bg-white border border-neutral-200 rounded text-xs text-neutral-600">
                  <p className="font-medium text-neutral-900 mb-1">
                    {deliveryMode === "pickup" ? "Client :" : "Livrer à :"}
                  </p>
                  <p>{selectedAddress.firstName} {selectedAddress.lastName}</p>
                  <p className="truncate">{selectedAddress.address}</p>
                  <p>{selectedAddress.city}, {selectedAddress.country}</p>
                </div>
              )}

              {!pickupInfo?.allowPickup && pickupInfo?.message ? (
                <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  {pickupInfo.message}
                </div>
              ) : null}

              {items.length > 0 && (
                <div className="mb-6 p-3 bg-neutral-100 border border-neutral-200 rounded text-xs text-neutral-600">
                  {deliveryMode === "delivery" ? (
                    <>
                      <p className="font-medium text-neutral-900 mb-1 flex items-center gap-2">
                        <Truck className="w-4 h-4" />
                        Livraison estimée
                      </p>
                      <p>Prévue du <span className="font-medium text-neutral-900">{deliveryRange}</span></p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-neutral-900 mb-1 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Point de retrait
                      </p>
                      <p className="truncate" title={pickupInfo?.pickupAddressText || ""}>
                        {pickupInfo?.pickupAddressText || "Adresse du point de retrait non renseignee."}
                      </p>
                      {pickupInfo?.sourceLabel ? (
                        <p className="mt-1 text-[11px] text-neutral-500">
                          Retrait gere par: {pickupInfo.sourceLabel}
                        </p>
                      ) : null}
                    </>
                  )}
                </div>
              )}

              <div className="space-y-3 pb-4 border-b border-neutral-200">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Articles ({items.length})</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600 flex items-center gap-1">
                    Livraison 
                  </span>
                  <span className="font-medium">
                    {isShippingLoading 
                      ? "Calcul..." 
                      : shippingSummary.amount === 0
                        ? "Gratuite"
                        : formatPrice(shippingSummary.amount)}
                  </span>
                </div>
                {taxRate > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600 flex items-center gap-1">
                      Taxes ({taxRate}%)
                    </span>
                    <span className="font-medium">
                      {formatPrice(taxAmount)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex justify-between pt-4">
                <span className="font-medium text-lg">Total</span>
                <span className="text-2xl font-semibold text-neutral-900">
                  {formatPrice(finalTotal)}
                </span>
              </div>
              
              <p className="mt-4 text-[10px] text-neutral-400 text-center uppercase tracking-widest">
                Paiement sécurisé SSL
              </p>
            </div>
          </div>
        </div>
        
        {/* Recommendations */}
        <ProductRecommendations 
          title="Dernière chance" 
          subtitle="Ajoutez un dernier article à votre commande"
        />
      </div>
    </div>
  );
}


