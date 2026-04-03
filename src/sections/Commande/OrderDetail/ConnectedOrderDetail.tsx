"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  ExternalLink,
  MapPin,
  Package,
  Phone,
  Receipt,
  ShieldCheck,
  Truck,
  UserRound,
} from "lucide-react";
import { PickupReceipt } from "@/components/boutique/PickupReceipt";
import { Button } from "@/components/ui/button";
import {
  useBoutiqueClientOrderQuery,
  useBoutiqueClientSessionQuery,
} from "@/hooks/useBoutiqueClient";
import type { StorefrontSectionStoreData } from "@/lib/storefront-section-data";
import { cn, formatDate, formatPrice, getEstimatedDeliveryRange } from "@/lib/utils";
import { getSellerPaymentMethodLabel } from "@/data/paymentMethods";
import type { Address, OrderItem } from "@/data/types";
import { orderDetailSchema } from "./OrderDetail.schema";

interface ConnectedOrderDetailProps {
  id?: string;
  orderId?: string;
  storefrontStore?: StorefrontSectionStoreData | null;
  isPreview?: boolean;
  styles?: {
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
    paddingY?: number;
  };
}

const statusClasses: Record<string, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  confirmed: "border-sky-200 bg-sky-50 text-sky-700",
  processing: "border-violet-200 bg-violet-50 text-violet-700",
  ready_for_pickup: "border-orange-200 bg-orange-50 text-orange-700",
  shipped: "border-indigo-200 bg-indigo-50 text-indigo-700",
  delivered: "border-emerald-200 bg-emerald-50 text-emerald-700",
  cancelled: "border-rose-200 bg-rose-50 text-rose-700",
  refunded: "border-neutral-200 bg-neutral-100 text-neutral-700",
};

const statusLabels: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmee",
  processing: "En preparation",
  ready_for_pickup: "Prete a retirer",
  shipped: "Expediee",
  delivered: "Livree",
  cancelled: "Annulee",
  refunded: "Remboursee",
};

const statusDescriptions: Record<string, string> = {
  pending: "La boutique verifie encore votre commande et votre paiement.",
  confirmed: "Votre commande a ete validee et transmise a la boutique.",
  processing: "La boutique prepare actuellement vos articles.",
  ready_for_pickup: "Votre commande est prete a etre retiree en boutique.",
  shipped: "Votre commande est en cours d'acheminement.",
  delivered: "Votre commande a ete remise avec succes.",
  cancelled: "Cette commande a ete annulee.",
  refunded: "Cette commande a ete remboursee.",
};

const deliverySteps = [
  { id: "confirmed", label: "Confirmee", icon: CheckCircle2 },
  { id: "processing", label: "Preparation", icon: Package },
  { id: "shipped", label: "Expedition", icon: Truck },
  { id: "delivered", label: "Livraison", icon: MapPin },
];

function getOrderSteps(fulfillmentMethod?: "delivery" | "pickup") {
  if (fulfillmentMethod === "pickup") {
    return [
      { id: "confirmed", label: "Confirmee", icon: CheckCircle2 },
      { id: "processing", label: "Preparation", icon: Package },
      { id: "ready_for_pickup", label: "Retrait", icon: MapPin },
      { id: "delivered", label: "Finalisee", icon: CheckCircle2 },
    ];
  }

  return deliverySteps;
}

function resolveProgressPercent(status: string) {
  switch (status) {
    case "confirmed":
      return 25;
    case "processing":
      return 55;
    case "ready_for_pickup":
    case "shipped":
      return 82;
    case "delivered":
    case "cancelled":
    case "refunded":
      return 100;
    case "pending":
    default:
      return 10;
  }
}

function formatPaymentStatusLabel(value?: string) {
  const normalizedValue = String(value || "en_attente")
    .trim()
    .replace(/-/g, "_")
    .toLowerCase();

  const map: Record<string, string> = {
    pending: "En attente",
    en_attente: "En attente",
    paid: "Paye",
    completed: "Paye",
    approved: "Approuve",
    failed: "Echoue",
    cancelled: "Annule",
    refunded: "Rembourse",
  };

  if (map[normalizedValue]) {
    return map[normalizedValue];
  }

  return normalizedValue
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildAddressLines(address: Address) {
  return [
    address.address,
    address.apartment,
    address.commune,
    address.city,
    address.country,
  ].filter((value) => typeof value === "string" && value.trim().length > 0);
}

function buildDeliveryText(
  fulfillmentMethod: "delivery" | "pickup" | undefined,
  status: string,
  deliveryRange: string,
  deliveredAt?: string,
  updatedAt?: string,
) {
  if (fulfillmentMethod === "pickup") {
    if (status === "delivered") {
      return `Commande remise le ${formatDate(deliveredAt || updatedAt || new Date().toISOString())}`;
    }

    if (status === "ready_for_pickup") {
      return `Disponible au retrait depuis le ${formatDate(updatedAt || new Date().toISOString())}`;
    }

    return `Retrait estime du ${deliveryRange}`;
  }

  if (status === "delivered") {
    return `Livree le ${formatDate(deliveredAt || updatedAt || new Date().toISOString())}`;
  }

  return `Livraison estimee du ${deliveryRange}`;
}

export function ConnectedOrderDetail({
  orderId,
  storefrontStore,
  isPreview,
  styles,
}: ConnectedOrderDetailProps) {
  const storeSlug = storefrontStore?.storeSlug || "";
  const resolvedBusinessName = storefrontStore?.businessName || "Boutique";
  const isPreviewMode = Boolean(isPreview || !orderId);

  const previewOrder = useMemo(() => {
    if (!isPreviewMode) {
      return null;
    }

    return {
      id: "ORD-MOCK-2026",
      status: "processing",
      total: 4500,
      subtotal: 3900,
      tax: 450,
      shipping: 150,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedDelivery: null,
      paymentMethod: "card",
      paymentStatus: "paid",
      fulfillmentMethod: "delivery",
      shippingAddress: {
        firstName: "Jean",
        lastName: "Dupont",
        address: "123 Rue de la Paix",
        city: "Paris",
        postalCode: "",
        country: "France",
        phone: "+33000000000",
      },
      items: [
        {
          id: "item-1",
          quantity: 1,
          price: 3900,
          product: {
            id: "prod-1",
            name: "Produit Premium",
            description: "Piece premium de demonstration pour la preview builder.",
            price: 3900,
            category: "Collection",
            images: ["/images/placeholder.jpg"],
            tags: [],
            rating: 4.8,
            reviewCount: 12,
            stock: 5,
            sku: "PREVIEW-001",
            features: [],
            specifications: {},
            minProcessingDays: 1,
            maxProcessingDays: 3,
          },
        },
      ],
    } as any;
  }, [isPreviewMode]);

  const { data: realSession, isLoading: sessionLoading } =
    useBoutiqueClientSessionQuery(storeSlug);
  const { data: realOrder, isLoading: orderLoading } = useBoutiqueClientOrderQuery(
    storeSlug,
    orderId || "",
    Boolean(realSession?.customer) && !isPreviewMode,
  );

  const session = isPreviewMode ? { customer: { id: "mock" } } : realSession;
  const order = isPreviewMode ? previewOrder : realOrder;
  const isDataLoading = !isPreviewMode && (sessionLoading || orderLoading);

  const deliveryRange = useMemo(() => {
    if (!order) {
      return "";
    }

    const maxMinDays =
      order.items.length > 0
        ? Math.max(...order.items.map((item: OrderItem) => item.product.minProcessingDays ?? 1))
        : 1;
    const maxMaxDays =
      order.items.length > 0
        ? Math.max(...order.items.map((item: OrderItem) => item.product.maxProcessingDays ?? 3))
        : 3;

    return order.estimatedDelivery
      ? formatDate(order.estimatedDelivery)
      : getEstimatedDeliveryRange(maxMinDays, maxMaxDays, order.createdAt);
  }, [order]);

  const containerStyle = styles
    ? {
        backgroundColor: styles.backgroundColor,
        color: styles.textColor,
        paddingTop: `${styles.paddingY || 60}px`,
        paddingBottom: `${styles.paddingY || 60}px`,
      }
    : undefined;
  const bgClass = styles?.backgroundColor
    ? ""
    : "bg-[linear-gradient(180deg,#f6f1e7_0%,#fbf8f3_42%,#ffffff_100%)]";

  if (isDataLoading) {
    return (
      <div
        className={`min-h-screen px-4 py-12 sm:px-6 lg:px-8 ${bgClass}`}
        style={containerStyle}
      >
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[2rem] border border-white/80 bg-white/80 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="animate-pulse space-y-6">
              <div className="h-4 w-32 rounded-full bg-neutral-200" />
              <div className="h-12 w-72 rounded-2xl bg-neutral-200" />
              <div className="grid gap-4 md:grid-cols-3">
                <div className="h-24 rounded-[1.5rem] bg-neutral-100" />
                <div className="h-24 rounded-[1.5rem] bg-neutral-100" />
                <div className="h-24 rounded-[1.5rem] bg-neutral-100" />
              </div>
              <div className="h-72 rounded-[2rem] bg-neutral-100" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session?.customer) {
    const redirectHref = storeSlug
      ? `/boutique/${storeSlug}/commande/${encodeURIComponent(orderId || "")}`
      : "/commande";

    return (
      <div
        className={`min-h-screen px-4 py-12 sm:px-6 lg:px-8 ${bgClass}`}
        style={containerStyle}
      >
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/80 bg-white/90 p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-900 text-white shadow-lg">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <p className="mt-6 text-xs uppercase tracking-[0.3em] text-neutral-400">
            Acces protege
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
            Connectez-vous pour voir votre commande
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-neutral-600 sm:text-base">
            Cette page contient les details prives de votre commande chez{" "}
            {resolvedBusinessName}. Connectez-vous ou creez votre compte client pour continuer.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href={`/connexion?redirect=${encodeURIComponent(redirectHref)}`}>
              <Button className="w-full sm:w-auto">Se connecter</Button>
            </Link>
            <Link href={`/inscription?redirect=${encodeURIComponent(redirectHref)}`}>
              <Button variant="outline" className="w-full sm:w-auto">
                Creer mon compte
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div
        className={`min-h-screen px-4 py-12 sm:px-6 lg:px-8 ${bgClass}`}
        style={containerStyle}
      >
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/80 bg-white/90 p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-900">
            <Receipt className="h-8 w-8" />
          </div>
          <p className="mt-6 text-xs uppercase tracking-[0.3em] text-neutral-400">
            Commande indisponible
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
            Commande introuvable
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-neutral-600 sm:text-base">
            Cette commande n&apos;existe pas ou n&apos;est pas rattachee a {resolvedBusinessName}.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href={storeSlug ? `/boutique/${storeSlug}/compte` : "/compte"}>
              <Button className="w-full sm:w-auto">Retour a mon compte</Button>
            </Link>
            <Link href={storeSlug ? `/boutique/${storeSlug}` : "/"}>
              <Button variant="outline" className="w-full sm:w-auto">
                Retour a la boutique
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const orderSteps = getOrderSteps(order.fulfillmentMethod);
  const currentStepIndex =
    order.status === "pending"
      ? -1
      : orderSteps.findIndex((step) => step.id === order.status);
  const progressPercent = resolveProgressPercent(order.status);
  const orderSubtotal = order.subtotal ?? order.total - order.shipping - order.tax;
  const orderItemCount = order.items.reduce(
    (count: number, item: OrderItem) => count + item.quantity,
    0,
  );
  const deliveryText = buildDeliveryText(
    order.fulfillmentMethod,
    order.status,
    deliveryRange,
    order.deliveredAt,
    order.updatedAt,
  );
  const addressLines = buildAddressLines(order.shippingAddress);
  const isClosedState = order.status === "cancelled" || order.status === "refunded";

  return (
    <div
      className={`min-h-screen px-4 py-8 sm:px-6 sm:py-10 lg:px-8 ${bgClass}`}
      style={containerStyle}
    >
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-[2rem] border border-neutral-900/10 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_34%),linear-gradient(135deg,#111827_0%,#1f2937_42%,#3f3f46_100%)] p-6 text-white shadow-[0_30px_90px_rgba(17,24,39,0.26)] sm:p-8 lg:p-10">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </button>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.85fr)] lg:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.34em] text-white/45">
                Detail de commande
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                {order.orderNumber || order.id}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
                Suivez votre commande pas a pas, consultez vos articles, votre mode de livraison et
                les informations de paiement depuis un espace plus clair et plus premium.
              </p>
            </div>

            <div className="space-y-3">
              <div
                className={cn(
                  "inline-flex rounded-full border px-4 py-2 text-sm font-medium",
                  statusClasses[order.status] || statusClasses.pending,
                )}
              >
                {statusLabels[order.status] || order.status}
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                <div className="rounded-[1.4rem] border border-white/10 bg-white/6 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/45">Total</p>
                  <p className="mt-3 text-xl font-semibold">{formatPrice(order.total)}</p>
                </div>
                <div className="rounded-[1.4rem] border border-white/10 bg-white/6 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/45">Articles</p>
                  <p className="mt-3 text-xl font-semibold">{orderItemCount}</p>
                </div>
                <div className="rounded-[1.4rem] border border-white/10 bg-white/6 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/45">Date</p>
                  <p className="mt-3 text-base font-semibold">{formatDate(order.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] border border-black/5 bg-white/90 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.06)] backdrop-blur sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-neutral-400">
                Suivi intelligent
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">
                Etat actuel de la commande
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-600">
                {statusDescriptions[order.status] || "Le statut de votre commande a ete mis a jour."}
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700">
              <Clock3 className="h-4 w-4" />
              {order.fulfillmentMethod === "pickup" ? "Retrait boutique" : "Livraison"}
            </div>
          </div>

          {isClosedState ? (
            <div
              className={cn(
                "mt-6 rounded-[1.6rem] border p-5",
                statusClasses[order.status] || statusClasses.refunded,
              )}
            >
              <p className="font-medium">
                {order.status === "cancelled"
                  ? "La commande a ete annulee."
                  : "La commande a ete remboursee."}
              </p>
              <p className="mt-2 text-sm opacity-90">
                Consultez votre espace client ou contactez la boutique si vous souhaitez plus de
                details.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-6 h-2 overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#0f172a_0%,#334155_100%)] transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {orderSteps.map((step, index) => {
                  const isReached = currentStepIndex >= index;
                  const isCurrent = currentStepIndex === index;

                  return (
                    <div
                      key={step.id}
                      className={cn(
                        "rounded-[1.5rem] border p-4 transition-all",
                        isReached
                          ? "border-neutral-900/10 bg-neutral-950 text-white shadow-lg"
                          : "border-neutral-200 bg-neutral-50 text-neutral-500",
                        isCurrent && "ring-2 ring-neutral-900/10",
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div
                          className={cn(
                            "flex h-11 w-11 items-center justify-center rounded-2xl",
                            isReached ? "bg-white/12" : "bg-white",
                          )}
                        >
                          <step.icon className="h-5 w-5" />
                        </div>
                        <span className="text-xs uppercase tracking-[0.24em]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <p className="mt-4 text-sm font-medium">{step.label}</p>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_360px]">
          <div className="space-y-6">
            <section className="rounded-[2rem] border border-black/5 bg-white/90 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.06)] backdrop-blur sm:p-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-neutral-400">
                    Articles
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">
                    Votre selection
                  </h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2 text-sm text-neutral-700">
                  <Package className="h-4 w-4" />
                  {orderItemCount} article{orderItemCount > 1 ? "s" : ""}
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {order.items.map((item: OrderItem, index: number) => (
                  <article
                    key={item.id || `${item.product.id}-${index}`}
                    className="rounded-[1.6rem] border border-neutral-200 bg-white p-4 shadow-sm sm:p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <div className="relative h-24 w-full overflow-hidden rounded-[1.3rem] bg-neutral-100 sm:h-28 sm:w-28 sm:flex-shrink-0">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col gap-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <Link
                              href={storeSlug ? `/boutique/${storeSlug}/produit/${item.product.id}` : "/product"}
                              className="block truncate text-lg font-semibold text-neutral-950 transition hover:text-neutral-700"
                            >
                              {item.product.name}
                            </Link>
                            <div className="mt-3 flex flex-wrap gap-2 text-xs">
                              <span className="rounded-full bg-neutral-100 px-3 py-1 font-medium text-neutral-700">
                                Quantite {item.quantity}
                              </span>
                              {item.sku ? (
                                <span className="rounded-full bg-neutral-100 px-3 py-1 font-medium text-neutral-700">
                                  SKU {item.sku}
                                </span>
                              ) : null}
                            </div>
                          </div>

                          <div className="text-left sm:text-right">
                            <p className="text-sm text-neutral-500">
                              {formatPrice(item.price)} unite
                            </p>
                            <p className="mt-2 text-xl font-semibold text-neutral-950">
                              {formatPrice(item.total || item.price * item.quantity)}
                            </p>
                          </div>
                        </div>

                        {item.product.description ? (
                          <p className="line-clamp-2 text-sm leading-6 text-neutral-600">
                            {item.product.description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {order.notes ? (
              <section className="rounded-[2rem] border border-black/5 bg-white/90 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.06)] backdrop-blur sm:p-8">
                <p className="text-xs uppercase tracking-[0.28em] text-neutral-400">
                  Notes
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">
                  Informations supplementaires
                </h2>
                <div className="mt-6 rounded-[1.5rem] bg-neutral-50 p-5 text-sm leading-7 text-neutral-600">
                  {order.notes}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
            <section className="rounded-[2rem] border border-black/5 bg-white/90 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.06)] backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-950 text-white">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-neutral-400">
                    Resume financier
                  </p>
                  <h3 className="text-lg font-semibold text-neutral-950">
                    Total de la commande
                  </h3>
                </div>
              </div>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between text-neutral-600">
                  <span>Sous-total</span>
                  <span>{formatPrice(orderSubtotal)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>{order.fulfillmentMethod === "pickup" ? "Retrait" : "Livraison"}</span>
                  <span>{formatPrice(order.shipping)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Taxes</span>
                  <span>{formatPrice(order.tax)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-neutral-200 pt-4 text-lg font-semibold text-neutral-950">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-black/5 bg-white/90 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.06)] backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-900">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-neutral-400">
                    Livraison
                  </p>
                  <h3 className="text-lg font-semibold text-neutral-950">
                    {order.fulfillmentMethod === "pickup"
                      ? "Retrait boutique"
                      : "Adresse de livraison"}
                  </h3>
                </div>
              </div>

              <div className="mt-6 rounded-[1.5rem] bg-neutral-50 p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-neutral-900 shadow-sm">
                    <UserRound className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 text-sm text-neutral-600">
                    <p className="font-medium text-neutral-950">
                      {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                    </p>
                    <div className="mt-2 space-y-1">
                      {addressLines.map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                    </div>
                    {order.shippingAddress.phone ? (
                      <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm">
                        <Phone className="h-3.5 w-3.5" />
                        {order.shippingAddress.phone}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-neutral-200 bg-white p-4 text-sm text-neutral-600">
                <p className="flex items-center gap-2 font-medium text-neutral-950">
                  <CalendarDays className="h-4 w-4" />
                  Suivi previsionnel
                </p>
                <p className="mt-2 leading-6">{deliveryText}</p>
              </div>
            </section>

            <section className="rounded-[2rem] border border-black/5 bg-white/90 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.06)] backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-900">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-neutral-400">
                    Paiement
                  </p>
                  <h3 className="text-lg font-semibold text-neutral-950">
                    Informations de paiement
                  </h3>
                </div>
              </div>

              <div className="mt-6 space-y-4 text-sm text-neutral-600">
                <div className="rounded-[1.4rem] bg-neutral-50 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-neutral-400">
                    Methode
                  </p>
                  <p className="mt-2 font-medium text-neutral-950">
                    {getSellerPaymentMethodLabel(order.paymentMethod)}
                  </p>
                </div>

                <div className="rounded-[1.4rem] bg-neutral-50 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-neutral-400">
                    Statut de paiement
                  </p>
                  <p className="mt-2 font-medium text-neutral-950">
                    {formatPaymentStatusLabel(order.paymentStatus)}
                  </p>
                </div>

                {order.paymentId ? (
                  <div className="rounded-[1.4rem] bg-neutral-50 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-neutral-400">
                      Reference
                    </p>
                    <p className="mt-2 break-all font-medium text-neutral-950">
                      {order.paymentId}
                    </p>
                  </div>
                ) : null}

                {order.paymentProofUrl ? (
                  <a
                    href={order.paymentProofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-[1.2rem] border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
                  >
                    Voir la preuve de paiement
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ) : null}
              </div>
            </section>

            {order.fulfillmentMethod === "pickup" && storefrontStore ? (
              <PickupReceipt store={storefrontStore} order={order} />
            ) : null}

            <section className="rounded-[2rem] border border-black/5 bg-[linear-gradient(135deg,#faf7f1_0%,#ffffff_100%)] p-6 shadow-[0_20px_80px_rgba(15,23,42,0.06)] backdrop-blur">
              <p className="text-xs uppercase tracking-[0.28em] text-neutral-400">
                Actions rapides
              </p>
              <h3 className="mt-2 text-lg font-semibold text-neutral-950">
                Continuer votre parcours
              </h3>
              <div className="mt-5 flex flex-col gap-3">
                <Link href={storeSlug ? `/boutique/${storeSlug}/compte` : "/compte"}>
                  <Button variant="outline" className="w-full">
                    Mon compte client
                  </Button>
                </Link>
                <Link href={storeSlug ? `/boutique/${storeSlug}` : "/"}>
                  <Button className="w-full">Retour a la boutique</Button>
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

Object.assign(ConnectedOrderDetail, { schema: orderDetailSchema });

export const schema = orderDetailSchema;
