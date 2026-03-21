"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Truck,
  Shield,
  MapPin,
  ChevronDown,
  Settings,
} from "lucide-react";
import {
  HAITI_DEPARTMENTS,
  getArrondissementsByDepartment,
  getCommunesByArrondissement,
  getSectionsByCommune,
} from "@/data/haitiCities";
import { useStorefront } from "@/components/StorefrontProvider";
import { useCart, useUser } from "@/store";
import { Button } from "@/components/ui/Button";
import { calculateShippingAmount } from "@/lib/storefront";
import { ProductRecommendations } from "@/components/ProductRecommendations";
import { cn, getEstimatedDeliveryRange } from "@/lib/utils";

import { useDynamicShippingFee } from "@/hooks/useDynamicShipping";
import { useCartPickupInfo } from "@/hooks/useCartPickupInfo";
import {
  useShippingRates,
  useDefaultShippingRate,
} from "@/hooks/useShippingRates";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, getCartTotal, getCartCount } =
    useCart();
  const { addresses, isAuthenticated } = useUser();
  const router = useRouter();
  const { shippingRates, formatPrice, settings } = useStorefront();
  const defaultAddress = addresses[0];
  const { data: defaultShippingRate } = useDefaultShippingRate();

  const cartTotal = getCartTotal();

  const cartCount = getCartCount();

  const maxMinDays =
    items.length > 0
      ? Math.max(...items.map((item) => item.product.minProcessingDays ?? 1))
      : 1;
  const maxMaxDays =
    items.length > 0
      ? Math.max(...items.map((item) => item.product.maxProcessingDays ?? 3))
      : 3;
  const deliveryRange = getEstimatedDeliveryRange(maxMinDays, maxMaxDays);

  const { data: dynamicShippingFee = 0, isLoading: isShippingLoading } =
    useDynamicShippingFee(items, defaultAddress?.id, undefined, undefined);
  const { data: pickupInfo } = useCartPickupInfo(items, settings);

  // Debug logs
  console.log("=== SHIPPING DEBUG ===");
  console.log("Items in cart:", items);
  console.log("Default address:", defaultAddress);
  console.log("Address ID:", defaultAddress?.id);
  console.log("Dynamic shipping fee:", dynamicShippingFee);
  console.log("Is shipping loading:", isShippingLoading);
  console.log("===================");

  // Get free shipping threshold from default rate or settings
  const freeShippingThreshold =
    defaultShippingRate?.free_shipping_threshold ||
    settings?.freeShippingThreshold ||
    0;

  const [deliveryMode, setDeliveryMode] = useState<"delivery" | "pickup">("delivery");

  useEffect(() => {
    if (deliveryMode === "pickup" && !pickupInfo?.allowPickup) {
      setDeliveryMode("delivery");
    }
  }, [deliveryMode, pickupInfo?.allowPickup]);

  // Determine if shipping is actually free based on threshold
  const isActuallyFree =
    freeShippingThreshold > 0 && cartTotal >= freeShippingThreshold;
  const finalShippingFee = deliveryMode === "pickup" ? 0 : (isActuallyFree ? 0 : dynamicShippingFee || 0);

  console.log("Final shipping calculation:", {
    freeShippingThreshold,
    cartTotal,
    isActuallyFree,
    finalShippingFee,
    defaultShippingRate,
  });

  const shippingSummary = {
    amount: finalShippingFee,
    isFree: isActuallyFree,
    rate: defaultShippingRate,
    threshold: freeShippingThreshold,
  };

  const taxRate = settings?.taxRate || 0;
  const taxAmount = (cartTotal * taxRate) / 100;

  const finalTotal = cartTotal + shippingSummary.amount + taxAmount;

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 text-center">
          <ShoppingBag className="w-20 h-20 text-neutral-300 mx-auto mb-6" />
          <h1 className="text-3xl font-light text-neutral-900 mb-4">
            Votre panier est vide
          </h1>
          <p className="text-neutral-500 mb-8 max-w-md mx-auto">
            Découvrez notre catalogue réel et ajoutez vos produits préférés.
          </p>
          <Link href="/collection">
            <Button size="lg">Continuer les achats</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <h1 className="text-3xl font-light text-neutral-900 mb-8">
          Mon Panier ({cartCount} article{cartCount > 1 ? "s" : ""})
        </h1>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {items.map((item, index) => (
                <motion.div
                  key={item.id || item.product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="flex gap-6 pb-6 border-b border-neutral-100"
                >
                  <Link
                    href={`/produit/${item.product.id}`}
                    className="relative w-32 h-40 bg-neutral-100 shrink-0"
                  >
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </Link>

                  <div className="flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">
                          {item.product.category}
                        </p>
                        <Link
                          href={`/produit/${item.product.id}`}
                          className="font-medium text-neutral-900 hover:text-neutral-600 transition-colors"
                        >
                          {item.product.name}
                        </Link>
                        {item.selectedAttributes?.length > 0 && (
                          <p className="text-sm text-neutral-500 mt-2">
                            {item.selectedAttributes
                              .map(
                                (attribute) =>
                                  `${attribute.name}: ${attribute.value}`,
                              )
                              .join(" • ")}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() =>
                          removeFromCart(item.id || item.product.id)
                        }
                        className="p-2 text-neutral-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <p className="text-sm text-neutral-500 mb-4">
                      SKU: {item.product.sku || "N/A"}
                    </p>

                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center border border-neutral-200">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id || item.product.id,
                              item.quantity - 1,
                            )
                          }
                          className="p-2 hover:bg-neutral-100 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id || item.product.id,
                              item.quantity + 1,
                            )
                          }
                          className="p-2 hover:bg-neutral-100 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="font-medium text-neutral-900">
                          {formatPrice(item.unitPrice * item.quantity)}
                        </p>
                        {!!item.product.discount && (
                          <p className="text-sm text-neutral-400 line-through">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <Link
              href="/collection"
              className="inline-flex items-center gap-2 mt-8 text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Continuer les achats
            </Link>
          </div>

          <div className="lg:pl-8">
            <div className="bg-neutral-50 p-6 sticky top-24 space-y-6">
              <h2 className="text-xl font-medium text-neutral-900">
                Récapitulatif
              </h2>

              {pickupInfo?.allowPickup && (
                <div className="flex bg-neutral-100 p-1 rounded-lg">
                  <button
                    onClick={() => setDeliveryMode("delivery")}
                    className={cn(
                      "flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors",
                      deliveryMode === "delivery"
                        ? "bg-white text-neutral-900 shadow-sm"
                        : "text-neutral-500 hover:text-neutral-700"
                    )}
                  >
                    Livraison
                  </button>
                  <button
                    onClick={() => setDeliveryMode("pickup")}
                    className={cn(
                      "flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors",
                      deliveryMode === "pickup"
                        ? "bg-white text-neutral-900 shadow-sm"
                        : "text-neutral-500 hover:text-neutral-700"
                    )}
                  >
                    Retrait
                  </button>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <div className="flex items-start gap-3 mb-3">
                    <MapPin className="w-5 h-5 text-neutral-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      {deliveryMode === "delivery" ? (
                        <>
                          <p className="text-sm font-medium text-neutral-900">
                            Estimation de livraison
                          </p>
                          {items.length > 0 && (
                            <p className="text-xs text-neutral-500 mt-0.5 mb-3">
                              Prévue du {deliveryRange}
                            </p>
                          )}
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-neutral-900">
                            Point de retrait
                          </p>
                          <p className="text-xs text-neutral-600 mt-1 mb-3 bg-white p-2 border border-neutral-200 rounded">
                            {pickupInfo?.pickupAddressText || "Adresse du point de retrait non renseignee."}
                          </p>
                          {pickupInfo?.sourceLabel ? (
                            <p className="text-[11px] text-neutral-500">
                              Retrait gere par: {pickupInfo.sourceLabel}
                            </p>
                          ) : null}
                        </>
                      )}

                      {deliveryMode === "delivery" && (
                        <div className="space-y-3">
                          {!isAuthenticated ? (
                            <div className="p-4 bg-orange-50 border border-orange-100 rounded-lg">
                              <p className="text-sm text-orange-800">
                                Veuillez vous{" "}
                                <Link
                                  href="/auth/login?redirect=/panier"
                                  className="font-bold underline"
                                >
                                  connecter
                                </Link>{" "}
                                pour voir vos tarifs de livraison.
                              </p>
                            </div>
                          ) : addresses.length > 0 ? (
                            <div className="p-4 bg-white border border-neutral-200 rounded-lg">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="text-sm font-medium text-neutral-900">
                                    {defaultAddress.firstName}{" "}
                                    {defaultAddress.lastName}
                                  </p>
                                  <p className="text-xs text-neutral-500 mt-1">
                                    {[
                                      defaultAddress.communalSection,
                                      defaultAddress.commune,
                                      defaultAddress.arrondissement,
                                      defaultAddress.department,
                                    ]
                                      .filter(Boolean)
                                      .join(", ")}
                                  </p>
                                  <p className="text-xs text-neutral-500">
                                    {defaultAddress.city || defaultAddress.country}
                                  </p>
                                </div>
                                <Link
                                  href="/profil/adresses"
                                  className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors"
                                >
                                  <Settings className="w-4 h-4" />
                                </Link>
                              </div>
                            </div>
                          ) : (
                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                              <p className="text-sm text-blue-800 mb-2">
                                Aucune adresse trouvée dans votre profil.
                              </p>
                              <Link href="/profil/adresses">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full"
                                >
                                  Ajouter une adresse
                                </Button>
                              </Link>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pb-6 border-b border-neutral-200">
                  <div className="flex justify-between text-neutral-600">
                    <span>Sous-total</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Livraison</span>
                    <span>
                      {shippingSummary.isFree ? (
                        <span className="text-green-600 font-medium">
                          Gratuite
                        </span>
                      ) : (
                        formatPrice(shippingSummary.amount)
                      )}
                    </span>
                  </div>

                  {taxRate > 0 && (
                    <div className="flex justify-between text-neutral-600">
                      <span>Taxes ({taxRate}%)</span>
                      <span>{formatPrice(taxAmount)}</span>
                    </div>
                  )}

                  {shippingSummary.threshold > 0 && (
                    <div className="text-xs text-neutral-500">
                      {shippingSummary.isFree ? (
                        <span className="text-green-600">
                          ✓ Livraison gratuite appliquée (seuil:{" "}
                          {formatPrice(shippingSummary.threshold)})
                        </span>
                      ) : (
                        <span>
                          Plus que{" "}
                          {formatPrice(shippingSummary.threshold - cartTotal)}{" "}
                          pour la livraison gratuite
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {!pickupInfo?.allowPickup && pickupInfo?.message ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  {pickupInfo.message}
                </div>
              ) : null}

              <div className="flex justify-between">
                <span className="text-lg font-medium text-neutral-900">
                  Total
                </span>
                <span className="text-xl font-medium text-neutral-900">
                  {formatPrice(finalTotal)}
                </span>
              </div>

              <Button
                size="lg"
                fullWidth
                className="mb-4"
                onClick={() => {
                  if (isAuthenticated) {
                    router.push(`/commande?mode=${deliveryMode}`);
                  } else {
                    router.push(`/auth/login?redirect=/panier&mode=${deliveryMode}`);
                  }
                }}
              >
                Passer la commande
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <div className="flex items-center gap-2 text-sm text-neutral-500 justify-center">
                <Shield className="w-4 h-4" />
                Paiement sécurisé
              </div>

              <div className="pt-6 border-t border-neutral-200 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Truck className="w-5 h-5 text-neutral-400" />
                  <span className="text-neutral-600">
                    Les frais suivent vos règles de livraison enregistrées en
                    base.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recommendations */}
        <ProductRecommendations 
          title="Complétez votre look" 
          subtitle="D'autres produits qui pourraient vous intéresser"
        />
      </div>
    </div>
  );
}
