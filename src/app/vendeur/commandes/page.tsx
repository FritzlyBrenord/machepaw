"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  MapPin,
  Package,
  RotateCcw,
  Search,
  Truck,
  User,
  X,
  XCircle,
} from "lucide-react";
import { SellerWorkspaceShell } from "@/components/SellerWorkspaceShell";
import { Button } from "@/components/ui/Button";
import type { AdminOrder, OrderStatus } from "@/data/types";
import { getSellerPaymentMethodLabel } from "@/data/paymentMethods";
import {
  useSellerOrdersQuery,
  useUpdateSellerOrderDeliveryDateMutation,
  useUpdateSellerOrderPaymentStatusMutation,
  useUpdateSellerOrderItemStatusMutation,
} from "@/hooks/useSellerWorkspace";
import { cn, formatDate, formatPrice, getEstimatedDeliveryRange } from "@/lib/utils";

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "En attente", color: "bg-amber-100 text-amber-700", icon: Clock },
  confirmed: { label: "Confirmee", color: "bg-blue-100 text-blue-700", icon: CheckCircle },
  processing: { label: "En preparation", color: "bg-purple-100 text-purple-700", icon: Package },
  ready_for_pickup: { label: "Pret a retirer", color: "bg-amber-100 text-amber-700", icon: MapPin },
  shipped: { label: "Expediee", color: "bg-indigo-100 text-indigo-700", icon: Truck },
  delivered: { label: "Livree", color: "bg-green-100 text-green-700", icon: CheckCircle },
  cancelled: { label: "Annulee", color: "bg-red-100 text-red-700", icon: XCircle },
  refunded: { label: "Remboursee", color: "bg-gray-100 text-gray-700", icon: RotateCcw },
};

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message?: string }).message || "");
  }
  return "Impossible de mettre a jour cette commande.";
}

function isPickupOrder(order: AdminOrder) {
  return order.fulfillmentMethod === "pickup" || order.paymentMethod === "store_pickup";
}

function canSellerConfirmPayment(order: AdminOrder) {
  if (["cancelled", "delivered", "refunded"].includes(order.status)) {
    return false;
  }

  if (order.paymentStatus === "paid" || order.paymentStatus === "confirmed") {
    return false;
  }

  if (isPickupOrder(order) && order.status === "pending") {
    return false;
  }

  return true;
}

function canAdvanceSellerOrder(order: AdminOrder) {
  if (["cancelled", "delivered", "refunded"].includes(order.status)) {
    return false;
  }

  if (isPickupOrder(order)) {
    if (order.status === "pending") {
      return true;
    }

    if (order.status === "confirmed" || order.status === "processing") {
      return order.paymentStatus === "paid" || order.paymentStatus === "confirmed";
    }

    if (order.status === "ready_for_pickup") {
      return true;
    }

    return false;
  }

  const paymentIsSettled =
    order.paymentStatus === "paid" ||
    order.paymentStatus === "confirmed" ||
    order.paymentMethod === "delivery";

  if (!paymentIsSettled) {
    return false;
  }

  if (order.status === "pending") {
    return true;
  }

  if (order.status === "confirmed") {
    return true;
  }

  if (order.status === "processing" || order.status === "shipped") {
    return true;
  }

  return false;
}

function getAdvanceSellerOrderLabel(order: AdminOrder) {
  if (order.status === "pending") {
    return "Valider la commande";
  }

  if (isPickupOrder(order)) {
    if (order.status === "confirmed" || order.status === "processing") {
      return "Marquer pret a retirer";
    }

    if (order.status === "ready_for_pickup") {
      return "Remettre au client";
    }
  }

  if (order.status === "confirmed") {
    return "Mettre en preparation";
  }

  if (order.status === "processing") {
    return "Marquer expediee";
  }

  if (order.status === "shipped") {
    return "Marquer livree";
  }

  return "Avancer le statut";
}

export default function SellerOrdersPage() {
  const { data: orders = [], isLoading } = useSellerOrdersQuery();
  const updateOrderItemStatus = useUpdateSellerOrderItemStatusMutation();
  const updateOrderPaymentStatus = useUpdateSellerOrderPaymentStatusMutation();
  const updateOrderDeliveryDate = useUpdateSellerOrderDeliveryDateMutation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [deliveryDateDraft, setDeliveryDateDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedOrder?.estimatedDelivery) {
      setDeliveryDateDraft("");
      return;
    }

    setDeliveryDateDraft(
      new Date(selectedOrder.estimatedDelivery).toISOString().split("T")[0],
    );
  }, [selectedOrder?.estimatedDelivery, selectedOrder?.id]);

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        const text = [
          order.id,
          order.orderNumber,
          order.shippingAddress.address,
          order.shippingAddress.city,
          order.shippingAddress.country,
          order.shippingAddress.phone,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return text.includes(searchQuery.toLowerCase()) && (!statusFilter || order.status === statusFilter);
      }),
    [orders, searchQuery, statusFilter],
  );

  const pendingCount = orders.filter((order) => order.status === "pending").length;
  const progressCount = orders.filter((order) =>
    ["confirmed", "processing", "ready_for_pickup", "shipped"].includes(order.status),
  ).length;
  const deliveredCount = orders.filter((order) => order.status === "delivered").length;

  const updateOrder = async (order: AdminOrder, nextStatus: OrderStatus, trackingNumber?: string) => {
    try {
      setError(null);
      const itemIds = order.items.map((item) => item.id).filter((id): id is string => Boolean(id));
      await Promise.all(
        itemIds.map((orderItemId) =>
          updateOrderItemStatus.mutateAsync({ orderItemId, status: nextStatus, trackingNumber }),
        ),
      );
      setSelectedOrder((current) =>
        current?.id === order.id
          ? {
              ...current,
              status: nextStatus,
              trackingNumber: trackingNumber || current.trackingNumber,
              deliveredAt: nextStatus === "delivered" ? current.deliveredAt || new Date().toISOString() : current.deliveredAt,
              items: current.items.map((item) => ({ ...item, status: nextStatus })),
            }
          : current,
      );
    } catch (mutationError) {
      setError(getErrorMessage(mutationError));
    }
  };

  const handleAdvance = async (order: AdminOrder) => {
    if (order.status === "pending") return void updateOrder(order, "confirmed");
    if (order.fulfillmentMethod === "pickup" || order.paymentMethod === "store_pickup") {
      if (order.status === "confirmed") return void updateOrder(order, "ready_for_pickup");
      if (order.status === "processing") return void updateOrder(order, "ready_for_pickup");
      if (order.status === "ready_for_pickup") return void updateOrder(order, "delivered");
      return;
    }

    if (order.status === "confirmed") return void updateOrder(order, "processing");
    if (order.status === "processing") {
      const trackingNumber = window.prompt("Numero de suivi pour cette expedition (optionnel)") || undefined;
      return void updateOrder(order, "shipped", trackingNumber);
    }
    if (order.status === "shipped") return void updateOrder(order, "delivered");
  };

  const handleCancel = async (order: AdminOrder) => updateOrder(order, "cancelled");

  const handleConfirmPayment = async (order: AdminOrder) => {
    try {
      setError(null);
      await updateOrderPaymentStatus.mutateAsync({
        orderId: order.id,
        paymentStatus: "paid",
      });
      setSelectedOrder((current) =>
        current?.id === order.id
          ? {
              ...current,
              paymentStatus: "paid",
            }
          : current,
      );
    } catch (mutationError) {
      setError(getErrorMessage(mutationError));
    }
  };

  const handleDeliveryDateChange = async (order: AdminOrder, nextValue: string) => {
    try {
      setError(null);
      const estimatedDelivery = nextValue
        ? new Date(`${nextValue}T00:00:00`).toISOString()
        : null;

      await updateOrderDeliveryDate.mutateAsync({
        orderId: order.id,
        estimatedDelivery,
      });

      setSelectedOrder((current) =>
        current?.id === order.id
          ? {
              ...current,
              estimatedDelivery: estimatedDelivery || undefined,
            }
          : current,
      );
      setDeliveryDateDraft(nextValue);
    } catch (mutationError) {
      setError(getErrorMessage(mutationError));
    }
  };

  const selectedMinDays =
    selectedOrder && selectedOrder.items.length > 0
      ? Math.max(
          ...selectedOrder.items.map((item) => item.product.minProcessingDays ?? 1),
        )
      : 1;
  const selectedMaxDays =
    selectedOrder && selectedOrder.items.length > 0
      ? Math.max(
          ...selectedOrder.items.map((item) => item.product.maxProcessingDays ?? 3),
        )
      : 3;
  const selectedCanConfirmPayment = selectedOrder !== null && canSellerConfirmPayment(selectedOrder);
  const selectedTimingText = selectedOrder
    ? selectedOrder.status === "delivered"
      ? selectedOrder.fulfillmentMethod === "pickup"
        ? `Remise le ${formatDate(selectedOrder.deliveredAt || selectedOrder.updatedAt)}`
        : `Livree le ${formatDate(selectedOrder.deliveredAt || selectedOrder.updatedAt)}`
      : selectedOrder.status === "cancelled" || selectedOrder.status === "refunded"
        ? `${statusConfig[selectedOrder.status].label} le ${formatDate(selectedOrder.updatedAt)}`
        : selectedOrder.estimatedDelivery
          ? selectedOrder.fulfillmentMethod === "pickup"
            ? `Prete a retirer le ${formatDate(selectedOrder.estimatedDelivery)}`
            : `Livraison prevue le ${formatDate(selectedOrder.estimatedDelivery)}`
          : `Prevue du ${getEstimatedDeliveryRange(selectedMinDays, selectedMaxDays, selectedOrder.createdAt)}`
    : "";

  return (
    <SellerWorkspaceShell title="Commandes vendeur" description="Gestion des commandes de votre boutique avec le meme parcours que l'administration.">
      {isLoading ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50"><div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent" /></div> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-neutral-200 bg-white p-4"><p className="text-sm text-neutral-500">Total commandes</p><p className="mt-2 text-2xl font-semibold text-neutral-900">{orders.length}</p></div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4"><p className="text-sm text-neutral-500">En attente</p><p className="mt-2 text-2xl font-semibold text-amber-600">{pendingCount}</p></div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4"><p className="text-sm text-neutral-500">En cours</p><p className="mt-2 text-2xl font-semibold text-blue-600">{progressCount}</p></div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4"><p className="text-sm text-neutral-500">Livrees</p><p className="mt-2 text-2xl font-semibold text-green-600">{deliveredCount}</p></div>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Rechercher une commande..." className="w-full rounded-lg border border-neutral-200 py-2 pl-10 pr-4 focus:border-neutral-900 focus:outline-none" />
          </div>
          <select value={statusFilter || ""} onChange={(e) => setStatusFilter(e.target.value || null)} className="rounded-lg border border-neutral-200 px-4 py-2 focus:border-neutral-900 focus:outline-none">
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmee</option>
            <option value="processing">En preparation</option>
            <option value="ready_for_pickup">Pret a retirer</option>
            <option value="shipped">Expediee</option>
            <option value="delivered">Livree</option>
            <option value="cancelled">Annulee</option>
            <option value="refunded">Remboursee</option>
          </select>
        </div>
      </div>

      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div> : null}

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-neutral-200 bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Commande</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Client</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Total</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Statut</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Date</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-neutral-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredOrders.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-neutral-500">Aucune commande trouvee</td></tr>
              ) : filteredOrders.map((order) => {
                const config = statusConfig[order.status] || statusConfig.pending;
                const StatusIcon = config.icon;
                const canConfirmPayment = canSellerConfirmPayment(order);
                const canAdvance = canAdvanceSellerOrder(order);
                const canCancel = !["cancelled", "delivered"].includes(order.status);
                return (
                  <tr key={order.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-4"><p className="font-medium text-neutral-900">{order.orderNumber || order.id}</p><p className="text-sm text-neutral-500">{order.items.length} article(s)</p></td>
                    <td className="px-4 py-4"><div className="flex items-center gap-2"><User className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-900">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</span></div></td>
                    <td className="px-4 py-4"><p className="font-medium text-neutral-900">{formatPrice(order.total, order.currency || "HTG")}</p><p className="text-sm text-neutral-500">Livraison: {formatPrice(order.shipping, order.currency || "HTG")}</p></td>
                    <td className="px-4 py-4"><span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium", config.color)}><StatusIcon className="h-3 w-3" />{config.label}</span></td>
                    <td className="px-4 py-4 text-sm text-neutral-600"><div className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(order.createdAt)}</div></td>
                    <td className="px-4 py-4"><div className="flex items-center justify-end gap-1"><button onClick={() => { setSelectedOrder(order); setShowDetailModal(true); }} className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100" title="Voir les details"><Eye className="h-4 w-4" /></button>{canConfirmPayment ? <button onClick={() => handleConfirmPayment(order)} className="rounded-lg p-2 text-green-600 transition-colors hover:bg-green-50" title="Confirmer le paiement"><DollarSign className="h-4 w-4" /></button> : null}{canCancel ? <button onClick={() => handleCancel(order)} className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50" title="Annuler"><XCircle className="h-4 w-4" /></button> : null}{canAdvance ? <button onClick={() => handleAdvance(order)} className="rounded-lg border border-transparent p-2 text-green-600 transition-colors hover:border-green-200 hover:bg-green-50" title="Avancer le statut"><CheckCircle className="h-4 w-4" /></button> : null}</div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showDetailModal && selectedOrder ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-lg bg-white">
              <div className="border-b border-neutral-200 p-6"><div className="flex items-center justify-between"><h2 className="text-xl font-semibold text-neutral-900">Details de la commande</h2><button onClick={() => setShowDetailModal(false)} className="rounded-lg p-2 hover:bg-neutral-100"><X className="h-5 w-5" /></button></div></div>
              <div className="space-y-6 p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-neutral-500">Commande</p>
                    <p className="text-lg font-semibold text-neutral-900">
                      {selectedOrder.orderNumber || selectedOrder.id}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm",
                      statusConfig[selectedOrder.status]?.color || "bg-neutral-100 text-neutral-700",
                    )}
                  >
                    {statusConfig[selectedOrder.status]?.label || selectedOrder.status}
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg bg-neutral-50 p-4">
                    <p className="mb-1 text-sm text-neutral-500">Date de commande</p>
                    <p className="font-medium text-neutral-900">{formatDate(selectedOrder.createdAt)}</p>
                  </div>
                  <div className="rounded-lg bg-neutral-50 p-4">
                    <p className="mb-1 text-sm text-neutral-500">Recapitulatif financier</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Sous-total :</span>
                        <span className="font-medium">{formatPrice(selectedOrder.subtotal || 0, selectedOrder.currency || "HTG")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">
                          {selectedOrder.fulfillmentMethod === "pickup" ? "Retrait / livraison locale :" : "Livraison :"}
                        </span>
                        <span className="font-medium">{formatPrice(selectedOrder.shipping || 0, selectedOrder.currency || "HTG")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Taxes :</span>
                        <span className="font-medium">{formatPrice(selectedOrder.tax || 0, selectedOrder.currency || "HTG")}</span>
                      </div>
                      <div className="mt-1 flex justify-between border-t border-neutral-200 pt-1">
                        <span className="font-semibold text-neutral-900">Total :</span>
                        <span className="font-semibold text-neutral-900">{formatPrice(selectedOrder.total, selectedOrder.currency || "HTG")}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-sm text-neutral-500">Articles</p>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div
                        key={item.id || `${item.product.id}-${index}`}
                        className="flex items-center justify-between rounded-lg bg-neutral-50 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 overflow-hidden rounded-lg bg-white">
                            {item.product.images[0] ? (
                              <img
                                src={item.product.images[0]}
                                alt={item.product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Package className="h-5 w-5 text-neutral-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-neutral-900">{item.product.name}</p>
                            <p className="text-sm text-neutral-500">
                              Qte: {item.quantity} x {formatPrice(item.price, selectedOrder.currency || "HTG")}
                            </p>
                          </div>
                        </div>
                        <p className="font-medium text-neutral-900">
                          {formatPrice(item.price * item.quantity, selectedOrder.currency || "HTG")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-sm text-neutral-500">
                    {selectedOrder.fulfillmentMethod === "pickup" ? "Point de retrait" : "Adresse de livraison"}
                  </p>
                  <div className="rounded-lg bg-neutral-50 p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="mb-2 flex items-start gap-2">
                          <MapPin className="mt-1 h-4 w-4 text-neutral-400" />
                          <div>
                            <p className="font-medium text-neutral-900">
                              {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}
                            </p>
                            <p className="text-neutral-600">{selectedOrder.shippingAddress.address}</p>
                            <p className="text-neutral-600">
                              {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}
                            </p>
                            <p className="font-medium text-neutral-600">{selectedOrder.shippingAddress.country}</p>
                            <p className="mt-1 text-neutral-500">Tel: {selectedOrder.shippingAddress.phone}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 border-l border-neutral-200 pl-4">
                        <div className="flex items-start gap-2">
                          <Truck className="mt-1 h-4 w-4 text-neutral-400" />
                          <div className="w-full">
                            <p className="text-sm font-medium text-neutral-900">
                              {selectedOrder.fulfillmentMethod === "pickup" ? "Estimation de retrait" : "Estimation de livraison"}
                            </p>
                            <p className="mt-1 text-sm text-neutral-600">{selectedTimingText}</p>
                            <p className="mt-2 text-xs text-neutral-500">
                              {selectedOrder.fulfillmentMethod === "pickup"
                                ? "Le client peut venir recuperer sa commande en boutique une fois le statut pret a retirer atteint."
                                : "La commande est envoyee au client selon le statut de livraison."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedOrder.paymentMethod ? (
                  <div>
                    <p className="mb-3 text-sm text-neutral-500">Informations de paiement</p>
                    <div className="space-y-3 rounded-lg bg-neutral-50 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600">Methode:</span>
                        <span className="font-medium">
                          {getSellerPaymentMethodLabel(selectedOrder.paymentMethod)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600">Statut paiement:</span>
                        <span className="font-medium capitalize">
                          {selectedOrder.paymentStatus === "paid"
                            ? "Paye"
                            : selectedOrder.paymentStatus === "confirmed"
                              ? "Confirme"
                              : selectedOrder.paymentStatus === "failed"
                                ? "Echoue"
                                : selectedOrder.paymentStatus === "refunded"
                                  ? "Rembourse"
                                  : "En attente"}
                        </span>
                      </div>
                      {selectedOrder.paymentId ? (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-600">ID Transaction:</span>
                          <span className="rounded bg-neutral-200 px-2 font-mono">{selectedOrder.paymentId}</span>
                        </div>
                      ) : null}
                      {selectedOrder.paymentProofUrl ? (
                        <a
                          href={selectedOrder.paymentProofUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex text-sm font-medium text-neutral-700 underline underline-offset-4"
                        >
                          Voir la preuve de paiement
                        </a>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                <div className="rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm text-sky-800">
                  <p className="font-medium">Parcours vendeur</p>
                  <p className="mt-1">
                    {isPickupOrder(selectedOrder)
                      ? "Retrait: validez la commande, confirmez le paiement au comptoir, puis remettez la commande au client."
                      : "Livraison: confirmez le paiement, validez la commande, preparez-la, expediez-la puis marquez-la livree."}
                  </p>
                </div>

                <div>
                  <p className="mb-3 text-sm text-neutral-500">Date limite (Fixe)</p>
                  <div className="space-y-3 rounded-lg bg-neutral-50 p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        type="date"
                        value={deliveryDateDraft}
                        onChange={async (e) => {
                          const nextValue = e.target.value;
                          setDeliveryDateDraft(nextValue);
                          await handleDeliveryDateChange(selectedOrder, nextValue);
                        }}
                        className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                      />
                      {selectedOrder.estimatedDelivery ? (
                        <button
                          type="button"
                          onClick={async () => {
                            setDeliveryDateDraft("");
                            await handleDeliveryDateChange(selectedOrder, "");
                          }}
                          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        >
                          Supprimer la date
                        </button>
                      ) : null}
                    </div>
                    <p className="text-xs text-neutral-500">
                      {selectedOrder.fulfillmentMethod === "pickup"
                        ? "Cette date sert de repere pour que le client sache quand venir retirer la commande."
                        : "Cette date sert de repere pour la livraison du client."}
                    </p>
                  </div>
                </div>

                {selectedOrder.trackingNumber ? (
                  <div>
                    <p className="mb-1 text-sm text-neutral-500">Numero de suivi</p>
                    <p className="font-medium text-neutral-900">{selectedOrder.trackingNumber}</p>
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" fullWidth onClick={() => setShowDetailModal(false)}>
                    Fermer
                  </Button>
                  {selectedCanConfirmPayment ? (
                    <Button
                      fullWidth
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={async () => {
                        await handleConfirmPayment(selectedOrder);
                      }}
                    >
                      Confirmer le paiement
                    </Button>
                  ) : null}
                      {selectedOrder.status !== "cancelled" && selectedOrder.status !== "delivered" && selectedOrder.status !== "refunded" ? (
                        <Button
                          fullWidth
                          className="bg-red-600 hover:bg-red-700"
                          onClick={async () => {
                            await handleCancel(selectedOrder);
                        setShowDetailModal(false);
                      }}
                    >
                      Annuler
                    </Button>
                  ) : null}
                  {selectedCanConfirmPayment ? (
                    <Button
                      fullWidth
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={async () => {
                        await handleConfirmPayment(selectedOrder);
                      }}
                    >
                      Confirmer le paiement
                    </Button>
                  ) : null}
                  {selectedOrder.status !== "cancelled" && selectedOrder.status !== "delivered" && selectedOrder.status !== "refunded" ? (
                    <Button
                      fullWidth
                      className="bg-neutral-900 hover:bg-neutral-800"
                      onClick={async () => {
                        await handleAdvance(selectedOrder);
                        setShowDetailModal(false);
                      }}
                    >
                      {getAdvanceSellerOrderLabel(selectedOrder)}
                    </Button>
                  ) : null}
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </SellerWorkspaceShell>
  );
}
