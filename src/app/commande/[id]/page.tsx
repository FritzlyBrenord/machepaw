"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  CreditCard,
  Download,
  Printer,
  HelpCircle,
} from "lucide-react";
import { useSingleOrderQuery } from "@/hooks/useOrders";
import { useStorefront } from "@/components/StorefrontProvider";
import { Button } from "@/components/ui/Button";
import { getSellerPaymentMethodLabel } from "@/data/paymentMethods";
import { cn, getEstimatedDeliveryRange, formatDate } from "@/lib/utils";
import { ProductRecommendations } from "@/components/ProductRecommendations";

const orderSteps = [
  { id: "confirmed", label: "Commande confirmée", icon: CheckCircle },
  { id: "processing", label: "En préparation", icon: Package },
  { id: "shipped", label: "Expédiée", icon: Truck },
  { id: "delivered", label: "Livrée", icon: MapPin },
];

function getOrderSteps(fulfillmentMethod?: "delivery" | "pickup") {
  if (fulfillmentMethod === "pickup") {
    return [
      { id: "confirmed", label: "Commande confirmée", icon: CheckCircle },
      { id: "processing", label: "En préparation", icon: Package },
      { id: "ready_for_pickup", label: "Prête à retirer", icon: MapPin },
      { id: "delivered", label: "Remise au client", icon: CheckCircle },
    ];
  }

  return orderSteps;
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
  pending: "En attente de confirmation",
  confirmed: "Commande confirmée",
  processing: "En préparation",
  ready_for_pickup: "Prête à retirer",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
  refunded: "Remboursée",
};

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const { formatPrice } = useStorefront();

  const { data: order, isLoading } = useSingleOrderQuery(orderId);

  if (isLoading) {
    return (
      <div className="min-h-screen py-40 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen py-40">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-light text-neutral-900 mb-4">
            Commande non trouvée
          </h1>
          <p className="text-neutral-500 mb-8">
            La commande que vous recherchez n&apos;existe pas ou a été
            supprimée.
          </p>
          <Link href="/profil">
            <Button>Voir mes commandes</Button>
          </Link>
        </div>
      </div>
    );
  }

  const orderSteps = getOrderSteps(order.fulfillmentMethod);
  const currentStepIndex = orderSteps.findIndex((s) => s.id === order.status);
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

  const maxMinDays = order.items?.length > 0 ? Math.max(...order.items.map((item: any) => item.product.minProcessingDays ?? 1)) : 1;
  const maxMaxDays = order.items?.length > 0 ? Math.max(...order.items.map((item: any) => item.product.maxProcessingDays ?? 3)) : 3;
  const deliveryRange = order.estimatedDelivery 
    ? formatDate(order.estimatedDelivery) 
    : getEstimatedDeliveryRange(maxMinDays, maxMaxDays, order.createdAt);

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-light text-neutral-900">
                Commande {order.id}
              </h1>
              <p className="text-neutral-500 mt-1">
                Passée le {formatDate(order.createdAt)}
              </p>
            </div>
            <div
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium border",
                statusColors[order.status],
              )}
            >
              {statusLabels[order.status]}
            </div>
          </div>
        </motion.div>

        {/* Progress Tracker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-neutral-200 p-6 mb-6"
        >
          <h2 className="font-medium text-neutral-900 mb-6">
            Suivi de livraison
          </h2>

          {/* Progress Bar */}
          <div className="relative mb-8">
            <div className="h-2 bg-neutral-100 rounded-full">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-neutral-900 rounded-full"
              />
            </div>

            {/* Steps */}
            <div className="flex justify-between mt-4">
              {orderSteps.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                        isCompleted
                          ? "bg-neutral-900 text-white"
                          : "bg-neutral-100 text-neutral-400",
                      )}
                    >
                      <step.icon className="w-5 h-5" />
                    </div>
                    <span
                      className={cn(
                        "text-xs mt-2 text-center max-w-[80px]",
                        isCompleted
                          ? "text-neutral-900 font-medium"
                          : "text-neutral-400",
                        isCurrent && "text-amber-600",
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tracking Info */}
          {order.trackingNumber && (
            <div className="bg-neutral-50 p-4 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="text-sm text-neutral-500">Numéro de suivi</p>
                    <p className="font-medium text-neutral-900">
                      {order.trackingNumber}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Suivre le colis
                </Button>
              </div>
            </div>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-white border border-neutral-200"
          >
            <div className="p-6 border-b border-neutral-200">
              <h2 className="font-medium text-neutral-900">
                Articles commandés
              </h2>
            </div>
            <div className="p-6">
              {order.items.map((item: any, index: number) => (
                <motion.div
                  key={item.product.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex gap-4 py-4 border-b border-neutral-100 last:border-0"
                >
                  <div className="relative w-20 h-20 bg-neutral-100 shrink-0">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <Link
                      href={`/produit/${item.product.id}`}
                      className="font-medium text-neutral-900 hover:text-neutral-600 transition-colors"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-sm text-neutral-500 mt-1">
                      Qté: {item.quantity}
                    </p>
                    <p className="font-medium text-neutral-900 mt-2">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="p-6 bg-neutral-50 border-t border-neutral-200">
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
                <div className="flex justify-between text-lg font-medium text-neutral-900 pt-2 border-t border-neutral-200">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Shipping Address */}
            <div className="bg-white border border-neutral-200 p-6">
              <h3 className="font-medium text-neutral-900 mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Adresse de livraison
              </h3>
              <div className="text-sm text-neutral-600 space-y-1">
                <p className="font-medium text-neutral-900">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.postalCode}{" "}
                  {order.shippingAddress.city}
                </p>
                <p className="font-medium">{order.shippingAddress.country}</p>
                <p className="pt-2">{order.shippingAddress.phone}</p>
              </div>
              
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <p className="text-sm text-neutral-500 mb-1 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Livraison estimée
                </p>
                <p className="font-medium text-neutral-900 text-sm">
                  {order.fulfillmentMethod === "pickup"
                    ? order.status === "delivered"
                      ? `Remise le ${formatDate(order.deliveredAt || order.updatedAt)}`
                      : order.status === "ready_for_pickup"
                        ? `Prête à retirer depuis le ${formatDate(order.updatedAt)}`
                        : `Prévue du ${deliveryRange}`
                    : order.status === "delivered" 
                      ? `Livrée le ${formatDate(order.deliveredAt || order.updatedAt)}`
                      : order.status === "cancelled" || order.status === "refunded"
                        ? `${statusLabels[order.status]} le ${formatDate(order.updatedAt)}`
                        : `Prévue du ${deliveryRange}`
                  }
                </p>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white border border-neutral-200 p-6">
              <h3 className="font-medium text-neutral-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Paiement
              </h3>
              <div className="text-sm text-neutral-600 space-y-1">
                <p className="uppercase">Méthode: {getSellerPaymentMethodLabel(order.paymentMethod)}</p>
                <p className="capitalize">Statut: {order.paymentStatus || 'En attente'}</p>
                {order.paymentId && (
                  <p className="text-xs mt-2 bg-neutral-100 p-1 rounded font-mono">
                    Ref: {order.paymentId}
                  </p>
                )}
                {order.paymentProofUrl && (
                  <a 
                    href={order.paymentProofUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block mt-2 text-xs text-blue-600 hover:underline"
                  >
                    Voir la preuve de paiement
                  </a>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white border border-neutral-200 p-6 space-y-3">
              <h3 className="font-medium text-neutral-900 mb-4">Actions</h3>
              <Button variant="outline" fullWidth size="sm">
                <Download className="w-4 h-4 mr-2" />
                Télécharger la facture
              </Button>
              <Button variant="outline" fullWidth size="sm">
                <Printer className="w-4 h-4 mr-2" />
                Imprimer
              </Button>
              <Button variant="outline" fullWidth size="sm">
                <HelpCircle className="w-4 h-4 mr-2" />
                Besoin d&apos;aide ?
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 bg-white border border-neutral-200 p-6"
        >
          <h2 className="font-medium text-neutral-900 mb-6">Historique</h2>
          <div className="space-y-6">
            {[
              {
                date: order.createdAt,
                title: "Commande passée",
                desc: "Votre commande a été reçue et confirmée",
              },
              ...((order.paymentStatus === "paid" || order.paymentStatus === "confirmed" || order.status !== "pending")
                ? [
                    {
                      date: order.createdAt,
                      title: "Paiement confirmé",
                      desc: "Le paiement a été accepté",
                    },
                  ]
                : [
                    {
                      date: order.createdAt,
                      title: "Paiement en attente",
                      desc: "Nous vérifions votre paiement",
                    },
                  ]),
              ...(order.status !== "pending"
                ? [
                    {
                      date: order.updatedAt,
                      title: "En préparation",
                      desc: "Nous préparons votre commande",
                    },
                  ]
                : []),
              ...(order.fulfillmentMethod === "pickup"
                ? [
                    ...(order.status === "ready_for_pickup" || order.status === "delivered"
                      ? [
                          {
                            date: order.updatedAt,
                            title: "Commande prête à retirer",
                            desc: "Votre commande peut être récupérée en boutique",
                          },
                        ]
                      : []),
                    ...(order.status === "delivered"
                      ? [
                          {
                            date: order.deliveredAt || order.updatedAt,
                            title: "Commande remise",
                            desc: "La commande a été remise au client",
                          },
                        ]
                      : []),
                  ]
                : [
                    ...(order.status === "shipped" || order.status === "delivered"
                      ? [
                          {
                            date: order.updatedAt,
                            title: "Commande expédiée",
                            desc: `Votre colis est en route. N° de suivi: ${order.trackingNumber || "Non renseigné"}`,
                          },
                        ]
                      : []),
                    ...(order.status === "delivered"
                      ? [
                          {
                            date: order.deliveredAt || order.updatedAt,
                            title: "Commande livrée",
                            desc: "Votre colis a été livré",
                          },
                        ]
                      : []),
                  ]),
            ].map((event, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-neutral-900" />
                  {index !== 3 && (
                    <div className="w-0.5 h-full bg-neutral-200 mt-2" />
                  )}
                </div>
                <div className="pb-6">
                  <p className="text-sm text-neutral-400">
                    {formatDate(event.date)}
                  </p>
                  <p className="font-medium text-neutral-900">{event.title}</p>
                  <p className="text-sm text-neutral-600">{event.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
        
        {/* Recommendations */}
        <ProductRecommendations 
          title="Continuez vos achats" 
          subtitle="Découvrez d'autres pépites de notre collection"
        />
      </div>
    </div>
  );
}
