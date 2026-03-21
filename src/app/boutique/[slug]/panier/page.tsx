"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ChevronDown,
  MapPin,
  Minus,
  Plus,
  Settings,
  Shield,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";
import { useStorefront } from "@/components/StorefrontProvider";
import { useBoutiqueStore } from "@/components/boutique/BoutiqueStoreProvider";
import { useBoutiqueProductsQuery } from "@/hooks/useBoutiqueStorefront";
import {
  useBoutiqueClientAddressesQuery,
  useBoutiqueClientSessionQuery,
} from "@/hooks/useBoutiqueClient";
import { useCart } from "@/store";
import { Button } from "@/components/ui/Button";
import {
  getBoutiqueBasePath,
  getBoutiqueCartItemId,
  getBoutiqueCartItems,
} from "@/lib/boutique";
import { cn, getEstimatedDeliveryRange } from "@/lib/utils";
import { useDynamicShippingFee } from "@/hooks/useDynamicShipping";
import { useCartPickupInfo } from "@/hooks/useCartPickupInfo";

export default function BoutiqueCartPage() {
  const store = useBoutiqueStore();
  const router = useRouter();
  const { items, removeFromCart, updateQuantity } = useCart();
  const { data: session } = useBoutiqueClientSessionQuery(store.storeSlug);
  const hasActiveBoutiqueCustomer = session?.customer.status === "active";
  const { data: boutiqueAddresses = [] } = useBoutiqueClientAddressesQuery(
    store.storeSlug,
    hasActiveBoutiqueCustomer,
  );
  const { formatPrice, settings } = useStorefront();
  const { data: boutiqueProducts = [] } = useBoutiqueProductsQuery();
  const basePath = getBoutiqueBasePath(store.storeSlug);

  const boutiqueItems = useMemo(
    () => getBoutiqueCartItems(items, { sellerId: store.id, storeSlug: store.storeSlug }),
    [items, store.id, store.storeSlug],
  );
  const defaultAddress =
    boutiqueAddresses.find((address) => address.isDefault) || boutiqueAddresses[0];
  const boutiqueSubtotal = boutiqueItems.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0,
  );
  const boutiqueCount = boutiqueItems.reduce((count, item) => count + item.quantity, 0);

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
      defaultAddress?.latitude,
      defaultAddress?.longitude,
    );
  const { data: pickupInfo } = useCartPickupInfo(boutiqueItems, settings);
  const [deliveryMode, setDeliveryMode] = useState<"delivery" | "pickup">("delivery");
  const boutiqueClientHref = `${basePath}/client`;
  const checkoutHref = `${basePath}/commande?mode=${deliveryMode}`;
  const clientRedirectHref = `${boutiqueClientHref}?redirect=${encodeURIComponent(checkoutHref)}`;

  useEffect(() => {
    if (deliveryMode === "pickup" && !pickupInfo?.allowPickup) {
      setDeliveryMode("delivery");
    }
  }, [deliveryMode, pickupInfo?.allowPickup]);

  const freeShippingThreshold = settings?.freeShippingThreshold || 0;
  const isActuallyFree = freeShippingThreshold > 0 && boutiqueSubtotal >= freeShippingThreshold;
  const shippingAmount = deliveryMode === "pickup" ? 0 : isActuallyFree ? 0 : dynamicShippingFee;
  const taxRate = settings?.taxRate || 0;
  const taxAmount = (boutiqueSubtotal * taxRate) / 100;
  const finalTotal = boutiqueSubtotal + shippingAmount + taxAmount;

  const recommendations = boutiqueProducts
    .filter((product) => !boutiqueItems.some((item) => item.product.id === product.id))
    .slice(0, 4);

  if (boutiqueItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#fbf8f3] px-4 py-20">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-neutral-200 bg-white p-10 text-center">
          <ShoppingBag className="mx-auto h-16 w-16 text-neutral-300" />
          <h1 className="mt-6 text-3xl font-semibold text-neutral-900">
            Panier vide pour cette boutique
          </h1>
          <p className="mt-4 text-neutral-500">
            Vous n&apos;avez encore aucun article de {store.businessName} dans ce panier boutique.
          </p>
          <Link href={`${basePath}/collection`} className="mt-8 inline-flex">
            <Button>Decouvrir la collection</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf8f3] pb-20">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 xl:px-12">
        <h1 className="text-4xl font-semibold text-neutral-900">
          Panier boutique ({boutiqueCount} article{boutiqueCount > 1 ? "s" : ""})
        </h1>
        <p className="mt-2 text-neutral-500">
          Checkout limite a {store.businessName}. Les autres articles hors boutique ne sont pas inclus ici.
        </p>

        <div className="mt-10 grid gap-12 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            {boutiqueItems.map((item) => (
              <article
                key={getBoutiqueCartItemId(item)}
                className="grid gap-4 rounded-[1.75rem] border border-neutral-200 bg-white p-5 sm:grid-cols-[160px,1fr]"
              >
                <Link
                  href={`/boutique/${store.storeSlug}/produit/${item.product.id}`}
                  className="relative h-44 overflow-hidden rounded-[1.5rem] bg-neutral-100"
                >
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </Link>

                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.24em] text-neutral-400">
                        {item.product.category}
                      </p>
                      <Link
                        href={`/boutique/${store.storeSlug}/produit/${item.product.id}`}
                        className="mt-2 block text-xl font-semibold text-neutral-900"
                      >
                        {item.product.name}
                      </Link>
                      {item.selectedAttributes?.length ? (
                        <p className="mt-2 text-sm text-neutral-500">
                          {item.selectedAttributes
                            .map((attribute) => `${attribute.name}: ${attribute.value}`)
                            .join(" - ")}
                        </p>
                      ) : null}
                      <p className="mt-2 text-sm text-neutral-500">
                        SKU: {item.product.sku || "N/A"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(getBoutiqueCartItemId(item))}
                      className="rounded-full border border-neutral-200 p-2 text-neutral-500 transition hover:border-red-200 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center rounded-full border border-neutral-200">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            getBoutiqueCartItemId(item),
                            item.quantity - 1,
                          )
                        }
                        className="p-3"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-12 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            getBoutiqueCartItemId(item),
                            item.quantity + 1,
                          )
                        }
                        className="p-3"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-semibold text-neutral-900">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </p>
                      {item.product.discount ? (
                        <p className="text-sm text-neutral-400 line-through">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </article>
            ))}

            <Link
              href={`${basePath}/collection`}
              className="inline-flex items-center gap-2 text-sm font-medium text-neutral-700 underline underline-offset-4"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              Continuer les achats dans la boutique
            </Link>
          </div>

          <div className="lg:pl-8">
            <div className="sticky top-28 space-y-6 rounded-[2rem] border border-neutral-200 bg-white p-6">
              <h2 className="text-xl font-semibold text-neutral-900">Recapitulatif boutique</h2>

              {pickupInfo?.allowPickup ? (
                <div className="flex rounded-full bg-neutral-100 p-1">
                  <button
                    type="button"
                    onClick={() => setDeliveryMode("delivery")}
                    className={cn(
                      "flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                      deliveryMode === "delivery"
                        ? "bg-white text-neutral-900 shadow-sm"
                        : "text-neutral-500",
                    )}
                  >
                    Livraison
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryMode("pickup")}
                    className={cn(
                      "flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                      deliveryMode === "pickup"
                        ? "bg-white text-neutral-900 shadow-sm"
                        : "text-neutral-500",
                    )}
                  >
                    Retrait
                  </button>
                </div>
              ) : null}

              <div className="rounded-[1.5rem] bg-neutral-50 p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 h-5 w-5 text-neutral-500" />
                  <div className="space-y-2 text-sm">
                    {deliveryMode === "delivery" ? (
                      <>
                        <p className="font-medium text-neutral-900">Estimation de livraison</p>
                        <p className="text-neutral-500">Prevue du {deliveryRange}</p>
                        {!session ? (
                          <p className="text-amber-700">
                            Connectez-vous ou inscrivez-vous a cette boutique pour utiliser vos adresses de livraison.
                          </p>
                        ) : !hasActiveBoutiqueCustomer ? (
                          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-3 text-blue-800">
                            <p>
                              {session?.customer.status === "blocked"
                                ? "Votre compte client boutique est bloque. Ouvrez votre espace client pour voir le statut."
                                : "Vous devez d'abord vous connecter a votre compte client boutique."}
                            </p>
                            <Link href={clientRedirectHref} className="mt-3 inline-flex text-sm font-medium underline underline-offset-4">
                              Voir mon espace client boutique
                            </Link>
                          </div>
                        ) : defaultAddress ? (
                          <div className="rounded-2xl border border-neutral-200 bg-white p-3">
                            <p className="font-medium text-neutral-900">
                              {defaultAddress.firstName} {defaultAddress.lastName}
                            </p>
                            <p className="mt-1 text-neutral-500">
                              {[defaultAddress.address, defaultAddress.city, defaultAddress.country]
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                            <Link href={boutiqueClientHref} className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-neutral-700 underline underline-offset-4">
                              <Settings className="h-3.5 w-3.5" />
                              Gerer mes adresses boutique
                            </Link>
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-3 text-blue-800">
                            <p>Aucune adresse n'est encore enregistree pour cette boutique.</p>
                            <Link href={boutiqueClientHref} className="mt-3 inline-flex text-sm font-medium underline underline-offset-4">
                              Ajouter une adresse boutique
                            </Link>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="font-medium text-neutral-900">Point de retrait</p>
                        <p className="rounded-2xl border border-neutral-200 bg-white p-3 text-neutral-500">
                          {pickupInfo?.pickupAddressText || "Adresse du point de retrait non renseignee."}
                        </p>
                        {pickupInfo?.sourceLabel ? (
                          <p className="text-xs text-neutral-500">
                            Retrait gere par: {pickupInfo.sourceLabel}
                          </p>
                        ) : null}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-b border-neutral-200 pb-5 text-sm">
                <div className="flex justify-between text-neutral-600">
                  <span>Sous-total</span>
                  <span>{formatPrice(boutiqueSubtotal)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Livraison</span>
                  <span>
                    {isShippingLoading ? "Calcul..." : shippingAmount === 0 ? "Gratuite" : formatPrice(shippingAmount)}
                  </span>
                </div>
                {taxRate > 0 ? (
                  <div className="flex justify-between text-neutral-600">
                    <span>Taxes ({taxRate}%)</span>
                    <span>{formatPrice(taxAmount)}</span>
                  </div>
                ) : null}
                {freeShippingThreshold > 0 ? (
                  <div className="text-xs text-neutral-500">
                    {isActuallyFree
                      ? `Livraison gratuite appliquee (seuil: ${formatPrice(freeShippingThreshold)})`
                      : `Plus que ${formatPrice(freeShippingThreshold - boutiqueSubtotal)} pour la livraison gratuite`}
                  </div>
                ) : null}
              </div>

              {!pickupInfo?.allowPickup && pickupInfo?.message ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                  {pickupInfo.message}
                </div>
              ) : null}

              <div className="flex justify-between">
                <span className="text-lg font-semibold text-neutral-900">Total</span>
                <span className="text-2xl font-semibold text-neutral-900">{formatPrice(finalTotal)}</span>
              </div>

              <Button
                fullWidth
                size="lg"
                onClick={() => {
                  if (!session || !hasActiveBoutiqueCustomer) {
                    router.push(clientRedirectHref);
                  } else {
                    router.push(checkoutHref);
                  }
                }}
              >
                Commander dans cette boutique
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
                <Shield className="h-4 w-4" />
                Paiement securise pour la boutique
              </div>
            </div>
          </div>
        </div>

        {recommendations.length > 0 ? (
          <section className="mt-16">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-neutral-400">Recommandations</p>
                <h2 className="mt-2 text-3xl font-semibold text-neutral-900">A ajouter a votre commande</h2>
              </div>
              <button
                type="button"
                className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {recommendations.map((product) => (
                <div key={product.id}>
                  <Link
                    href={`/boutique/${store.storeSlug}/produit/${product.id}`}
                    className="block"
                  >
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      width={320}
                      height={380}
                      className="h-72 w-full rounded-[1.5rem] object-cover"
                    />
                    <h3 className="mt-4 text-lg font-semibold text-neutral-900">{product.name}</h3>
                    <p className="mt-1 text-sm text-neutral-500">{formatPrice(product.price)}</p>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
