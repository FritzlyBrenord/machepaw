"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  CreditCard,
  MapPin,
  Package,
  Truck,
} from "lucide-react";
import { useBoutiqueStore } from "@/components/boutique/BoutiqueStoreProvider";
import { PickupReceipt } from "@/components/boutique/PickupReceipt";
import { useStorefront } from "@/components/StorefrontProvider";
import { Button } from "@/components/ui/Button";
import { useBoutiqueClientOrderQuery } from "@/hooks/useBoutiqueClient";
import type { OrderItem } from "@/data/types";
import { getSellerPaymentMethodLabel } from "@/data/paymentMethods";
import { cn, formatDate, getEstimatedDeliveryRange } from "@/lib/utils";

const deliverySteps = [
  { id: "confirmed", label: "Commande confirmee", icon: CheckCircle },
  { id: "processing", label: "En preparation", icon: Package },
  { id: "shipped", label: "Expediee", icon: Truck },
  { id: "delivered", label: "Livree", icon: MapPin },
];

function getOrderSteps(fulfillmentMethod?: "delivery" | "pickup") {
  if (fulfillmentMethod === "pickup") {
    return [
      { id: "confirmed", label: "Commande confirmee", icon: CheckCircle },
      { id: "processing", label: "En preparation", icon: Package },
      { id: "ready_for_pickup", label: "Prete a retirer", icon: MapPin },
      { id: "delivered", label: "Remise au client", icon: CheckCircle },
    ];
  }

  return deliverySteps;
}

const statusColors: Record<string, string> = {
  pending: "text-amber-600 bg-amber-50 border-amber-200",
  confirmed: "text-blue-600 bg-blue-50 border-blue-200",
  processing: "text-purple-600 bg-purple-50 border-purple-200",
  ready_for_pickup: "text-amber-600 bg-amber-50 border-amber-200",
  shipped: "text-indigo-600 bg-indigo-50 border-indigo-200",
  delivered: "text-green-600 bg-green-50 border-green-200",
  cancelled: "text-red-600 bg-red-50 border-red-200",
  refunded: "text-gray-600 bg-gray-50 border-gray-200",
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

export default function BoutiqueOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const store = useBoutiqueStore();
  const { formatPrice } = useStorefront();
  const orderId = params.id as string;
  const { data: order, isLoading } = useBoutiqueClientOrderQuery(
    store.storeSlug,
    orderId,
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fbf8f3] px-4 py-20">
        <div className="mx-auto flex max-w-4xl justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#fbf8f3] px-4 py-20">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-neutral-200 bg-white p-10 text-center">
          <h1 className="text-3xl font-semibold text-neutral-900">
            Commande introuvable dans cette boutique
          </h1>
          <p className="mt-4 text-neutral-500">
            Cette commande n&apos;existe pas, ou elle n&apos;appartient pas a la boutique {store.businessName}.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href={`/boutique/${store.storeSlug}/profil`}>
              <Button>Retour a mon compte client</Button>
            </Link>
            <Link href={`/boutique/${store.storeSlug}`}>
              <Button variant="outline">Retour a la boutique</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const orderSteps = getOrderSteps(order.fulfillmentMethod);
  const currentStepIndex = orderSteps.findIndex((step) => step.id === order.status);
  const orderSubtotal = order.subtotal ?? order.total - order.shipping - order.tax;
  const progressPercent =
    order.status === "delivered"
      ? 100
      : order.status === "ready_for_pickup" || order.status === "shipped"
        ? 75
        : order.status === "processing"
          ? 50
          : order.status === "confirmed"
            ? 25
            : 0;

  const maxMinDays =
    order.items.length > 0
      ? Math.max(
          ...order.items.map((item: OrderItem) => item.product.minProcessingDays ?? 1),
        )
      : 1;
  const maxMaxDays =
    order.items.length > 0
      ? Math.max(
          ...order.items.map((item: OrderItem) => item.product.maxProcessingDays ?? 3),
        )
      : 3;
  const deliveryRange = order.estimatedDelivery
    ? formatDate(order.estimatedDelivery)
    : getEstimatedDeliveryRange(maxMinDays, maxMaxDays, order.createdAt);

  return (
    <div className="min-h-screen bg-[#fbf8f3] px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[2rem] border border-neutral-200 bg-white p-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition hover:text-neutral-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </button>

          <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-neutral-400">
                Commande boutique
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-neutral-900">
                {order.orderNumber || order.id}
              </h1>
              <p className="mt-3 text-neutral-500">
                Passee le {formatDate(order.createdAt)} chez {store.businessName}
              </p>
            </div>
            <div
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium",
                statusColors[order.status],
              )}
            >
              {statusLabels[order.status] || order.status}
            </div>
          </div>
        </div>

        <section className="rounded-[2rem] border border-neutral-200 bg-white p-8">
          <h2 className="text-xl font-semibold text-neutral-900">Suivi de la commande</h2>
          <div className="mt-6">
            <div className="h-2 rounded-full bg-neutral-100">
              <div
                className="h-2 rounded-full bg-neutral-900 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-4">
              {orderSteps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full",
                      index <= currentStepIndex
                        ? "bg-neutral-900 text-white"
                        : "bg-neutral-100 text-neutral-400",
                    )}
                  >
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span
                    className={cn(
                      "text-sm",
                      index <= currentStepIndex ? "text-neutral-900" : "text-neutral-400",
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.5fr,0.9fr]">
          <section className="rounded-[2rem] border border-neutral-200 bg-white p-8">
            <h2 className="text-xl font-semibold text-neutral-900">Articles commandes</h2>
            <div className="mt-6 space-y-5">
              {order.items.map((item: OrderItem, index: number) => (
                <article
                  key={item.id || `${item.product.id}-${index}`}
                  className="flex gap-4 border-b border-neutral-100 pb-5 last:border-b-0 last:pb-0"
                >
                  <div className="relative h-24 w-24 overflow-hidden rounded-[1.25rem] bg-neutral-100">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <Link
                      href={`/boutique/${store.storeSlug}/produit/${item.product.id}`}
                      className="text-lg font-semibold text-neutral-900 transition hover:text-neutral-700"
                    >
                      {item.product.name}
                    </Link>
                    <p className="mt-2 text-sm text-neutral-500">
                      Quantite: {item.quantity}
                    </p>
                    {item.sku ? (
                      <p className="mt-1 text-sm text-neutral-500">SKU: {item.sku}</p>
                    ) : null}
                    <p className="mt-3 text-base font-semibold text-neutral-900">
                      {formatPrice(item.total ?? item.price * item.quantity)}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-8 rounded-[1.5rem] bg-neutral-50 p-5">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-neutral-600">
                  <span>Sous-total</span>
                  <span>{formatPrice(orderSubtotal)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Livraison</span>
                  <span>{formatPrice(order.shipping)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Taxes</span>
                  <span>{formatPrice(order.tax)}</span>
                </div>
                <div className="flex justify-between border-t border-neutral-200 pt-3 text-lg font-semibold text-neutral-900">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </section>

          <div className="space-y-6">
            <section className="rounded-[2rem] border border-neutral-200 bg-white p-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-neutral-900">
                <MapPin className="h-5 w-5" />
                {order.fulfillmentMethod === "pickup"
                  ? "Retrait en boutique"
                  : "Livraison"}
              </h3>
              <div className="mt-4 space-y-1 text-sm text-neutral-600">
                <p className="font-medium text-neutral-900">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                <p>{order.shippingAddress.address}</p>
                <p>
                  {[order.shippingAddress.city, order.shippingAddress.country]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                <p className="pt-2">{order.shippingAddress.phone}</p>
              </div>
              <div className="mt-5 rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-600">
                <p className="flex items-center gap-2 font-medium text-neutral-900">
                  <Clock className="h-4 w-4" />
                  {order.fulfillmentMethod === "pickup"
                    ? "Retrait estime"
                    : "Livraison estimee"}
                </p>
                <p className="mt-2">
                  {order.fulfillmentMethod === "pickup"
                    ? order.status === "delivered"
                      ? `Remise le ${formatDate(order.deliveredAt || order.updatedAt)}`
                      : order.status === "ready_for_pickup"
                        ? `Prete a retirer depuis le ${formatDate(order.updatedAt)}`
                        : `Prevue du ${deliveryRange}`
                    : order.status === "delivered"
                      ? `Livree le ${formatDate(order.deliveredAt || order.updatedAt)}`
                      : `Prevue du ${deliveryRange}`}
                </p>
              </div>
            </section>

            <section className="rounded-[2rem] border border-neutral-200 bg-white p-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-neutral-900">
                <CreditCard className="h-5 w-5" />
                Paiement
              </h3>
              <div className="mt-4 space-y-2 text-sm text-neutral-600">
                <p>Methode: {getSellerPaymentMethodLabel(order.paymentMethod)}</p>
                <p>Statut: {order.paymentStatus || "En attente"}</p>
                {order.paymentId ? <p>Reference: {order.paymentId}</p> : null}
                {order.paymentProofUrl ? (
                  <a
                    href={order.paymentProofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex text-sm font-medium text-neutral-700 underline underline-offset-4"
                  >
                    Voir la preuve de paiement
                  </a>
                ) : null}
              </div>
            </section>

            {order.fulfillmentMethod === "pickup" ? (
              <PickupReceipt store={store} order={order} />
            ) : null}

            <section className="rounded-[2rem] border border-neutral-200 bg-white p-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-neutral-900">
                <Clock className="h-5 w-5" />
                Historique
              </h3>
              <div className="mt-4 space-y-4 text-sm text-neutral-600">
                <div>
                  <p className="font-medium text-neutral-900">Commande passee</p>
                  <p className="mt-1">Votre commande a ete recue et enregistree.</p>
                  <p className="mt-1 text-xs text-neutral-400">{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <p className="font-medium text-neutral-900">
                    {order.fulfillmentMethod === "pickup"
                      ? order.status === "ready_for_pickup" || order.status === "delivered"
                        ? "Commande prete a retirer"
                        : "Commande en preparation"
                      : order.status === "shipped" || order.status === "delivered"
                        ? "Commande expediee"
                        : "Commande en preparation"}
                  </p>
                  <p className="mt-1">
                    {order.fulfillmentMethod === "pickup"
                      ? "Votre commande sera disponible au point de retrait de cette boutique."
                      : "Votre commande est en cours de traitement par le vendeur."}
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">
                    {formatDate(order.updatedAt)}
                  </p>
                </div>
                {order.fulfillmentMethod === "pickup" && order.status === "delivered" ? (
                  <div>
                    <p className="font-medium text-neutral-900">Commande remise</p>
                    <p className="mt-1">La commande a ete remise au client en boutique.</p>
                    <p className="mt-1 text-xs text-neutral-400">
                      {formatDate(order.deliveredAt || order.updatedAt)}
                    </p>
                  </div>
                ) : null}
                {order.fulfillmentMethod !== "pickup" &&
                (order.status === "shipped" || order.status === "delivered") ? (
                  <div>
                    <p className="font-medium text-neutral-900">Commande expediee</p>
                    <p className="mt-1">
                      N° de suivi: {order.trackingNumber || "Non renseigne"}
                    </p>
                    <p className="mt-1 text-xs text-neutral-400">
                      {formatDate(order.updatedAt)}
                    </p>
                  </div>
                ) : null}
              </div>
            </section>

            <section className="rounded-[2rem] border border-neutral-200 bg-white p-6">
              <div className="flex flex-wrap gap-3">
                <Link href={`/boutique/${store.storeSlug}/profil`} className="flex-1">
                  <Button fullWidth variant="outline">
                    Mon compte client
                  </Button>
                </Link>
                <Link href={`/boutique/${store.storeSlug}/collection`} className="flex-1">
                  <Button fullWidth>Continuer les achats</Button>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
