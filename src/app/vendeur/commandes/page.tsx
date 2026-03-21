"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  Loader2,
  MapPin,
  Package,
  Truck,
  User,
  X,
  XCircle,
} from "lucide-react";
import { SellerWorkspaceShell } from "@/components/SellerWorkspaceShell";
import { Button } from "@/components/ui/Button";
import type { SellerWorkspaceOrderItem } from "@/data/types";
import {
  useSellerOrderItemsQuery,
  useUpdateSellerOrderItemStatusMutation,
} from "@/hooks/useSellerWorkspace";
import { cn, formatDate, formatPrice } from "@/lib/utils";

const statusConfig = {
  pending: {
    label: "En attente",
    color: "bg-amber-100 text-amber-800",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmee",
    color: "bg-sky-100 text-sky-800",
    icon: CheckCircle,
  },
  processing: {
    label: "Preparation",
    color: "bg-blue-100 text-blue-800",
    icon: Package,
  },
  shipped: {
    label: "Expediee",
    color: "bg-violet-100 text-violet-800",
    icon: Truck,
  },
  delivered: {
    label: "Livree",
    color: "bg-emerald-100 text-emerald-800",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Annulee",
    color: "bg-rose-100 text-rose-800",
    icon: XCircle,
  },
  refunded: {
    label: "Remboursee",
    color: "bg-neutral-200 text-neutral-700",
    icon: AlertCircle,
  },
} as const;

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message?: string }).message || "");
  }

  return "Impossible de mettre a jour cette ligne de commande vendeur.";
}

export default function SellerOrdersPage() {
  const { data: orderItems = [], isLoading } = useSellerOrderItemsQuery();
  const updateOrderItemStatus = useUpdateSellerOrderItemStatusMutation();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedItem, setSelectedItem] = useState<SellerWorkspaceOrderItem | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    return orderItems.filter((item) => {
      const haystack = [
        item.orderNumber,
        item.productName,
        item.customerName,
        item.customerEmail,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = haystack.includes(search.toLowerCase());
      const matchesStatus = statusFilter ? item.itemStatus === statusFilter : true;

      return matchesSearch && matchesStatus;
    });
  }, [orderItems, search, statusFilter]);

  const pendingCount = orderItems.filter((item) =>
    ["pending", "confirmed", "processing"].includes(item.itemStatus),
  ).length;
  const shippedCount = orderItems.filter(
    (item) => item.itemStatus === "shipped",
  ).length;
  const deliveredCount = orderItems.filter(
    (item) => item.itemStatus === "delivered",
  ).length;

  const updateStatus = async (
    item: SellerWorkspaceOrderItem,
    nextStatus: SellerWorkspaceOrderItem["itemStatus"],
    trackingNumber?: string,
  ) => {
    try {
      setError(null);
      await updateOrderItemStatus.mutateAsync({
        orderItemId: item.id,
        status: nextStatus,
        trackingNumber,
      });
      setSelectedItem((current) =>
        current?.id === item.id
          ? {
              ...current,
              itemStatus: nextStatus,
              trackingNumber: trackingNumber || current.trackingNumber,
            }
          : current,
      );
    } catch (mutationError) {
      setError(getErrorMessage(mutationError));
    }
  };

  const handleAdvance = async (item: SellerWorkspaceOrderItem) => {
    if (item.itemStatus === "pending") {
      await updateStatus(item, "confirmed");
      return;
    }

    if (item.itemStatus === "confirmed") {
      await updateStatus(item, "processing");
      return;
    }

    if (item.itemStatus === "processing") {
      const trackingNumber =
        window.prompt("Numero de suivi pour cette expedition (optionnel)") ||
        undefined;
      await updateStatus(item, "shipped", trackingNumber);
      return;
    }

    if (item.itemStatus === "shipped") {
      await updateStatus(item, "delivered");
    }
  };

  const handleCancel = async (item: SellerWorkspaceOrderItem) => {
    await updateStatus(item, "cancelled");
  };

  return (
    <SellerWorkspaceShell
      title="Commandes vendeur"
      description="Vous ne voyez ici que les lignes de commande de vos propres produits."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <p className="text-sm text-neutral-500">Lignes commande</p>
          <p className="mt-2 text-2xl font-semibold text-neutral-900">
            {orderItems.length}
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <p className="text-sm text-neutral-500">A traiter</p>
          <p className="mt-2 text-2xl font-semibold text-amber-700">
            {pendingCount}
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <p className="text-sm text-neutral-500">Expediees</p>
          <p className="mt-2 text-2xl font-semibold text-violet-700">
            {shippedCount}
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <p className="text-sm text-neutral-500">Livrees</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-700">
            {deliveredCount}
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher par commande, produit ou client"
            className="flex-1 rounded-xl border border-neutral-200 px-4 py-3 outline-none transition-colors focus:border-neutral-900"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-3 outline-none transition-colors focus:border-neutral-900"
          >
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmee</option>
            <option value="processing">Preparation</option>
            <option value="shipped">Expediee</option>
            <option value="delivered">Livree</option>
            <option value="cancelled">Annulee</option>
          </select>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead className="bg-neutral-50 text-left text-xs uppercase tracking-[0.18em] text-neutral-400">
              <tr>
                <th className="px-6 py-4">Commande</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Produit</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Paiement</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-sm text-neutral-500">
                    Chargement des commandes vendeur...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-sm text-neutral-500">
                    Aucune ligne de commande pour ce filtre.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const StatusIcon =
                    statusConfig[item.itemStatus as keyof typeof statusConfig]
                      ?.icon || Clock;
                  const canProcess =
                    item.paymentStatus === "paid" ||
                    item.paymentStatus === "confirmed" ||
                    item.paymentMethod === "delivery";
                  const canAdvance =
                    canProcess &&
                    ["pending", "confirmed", "processing", "shipped"].includes(
                      item.itemStatus,
                    );
                  const canCancel = !["cancelled", "delivered"].includes(
                    item.itemStatus,
                  );

                  return (
                    <tr key={item.id} className="hover:bg-neutral-50/80">
                      <td className="px-6 py-5">
                        <p className="font-medium text-neutral-900">
                          {item.orderNumber}
                        </p>
                        <p className="mt-1 text-xs text-neutral-400">
                          {item.quantity} article(s) sur cette ligne
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <p className="text-sm font-medium text-neutral-900">
                          {item.customerName}
                        </p>
                        <p className="mt-1 text-xs text-neutral-500">
                          {item.customerEmail}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <p className="font-medium text-neutral-900">
                          {item.productName}
                        </p>
                        <p className="mt-1 text-xs text-neutral-500">
                          SKU: {item.sku || "Non defini"}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <p className="font-medium text-neutral-900">
                          {formatPrice(item.total, "HTG")}
                        </p>
                        <p className="mt-1 text-xs text-neutral-500">
                          {formatPrice(item.price, "HTG")} x {item.quantity}
                        </p>
                      </td>

                      <td className="px-6 py-5 text-sm text-neutral-600">
                        <p>{item.paymentMethod || "Non precise"}</p>
                        <p className="mt-1 text-xs text-neutral-500">
                          {item.paymentStatus || "pending"}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium",
                            statusConfig[
                              item.itemStatus as keyof typeof statusConfig
                            ]?.color || "bg-neutral-100 text-neutral-700",
                          )}
                        >
                          <StatusIcon className="h-3.5 w-3.5" />
                          {statusConfig[
                            item.itemStatus as keyof typeof statusConfig
                          ]?.label || item.itemStatus}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-sm text-neutral-600">
                        {formatDate(item.createdAt)}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedItem(item)}
                            className="rounded-xl border border-neutral-200 p-2 text-neutral-600 transition-colors hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900"
                            title="Voir"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {canAdvance ? (
                            <button
                              onClick={() => handleAdvance(item)}
                              className="rounded-xl border border-neutral-200 p-2 text-emerald-700 transition-colors hover:border-emerald-200 hover:bg-emerald-50"
                              title="Avancer le statut"
                            >
                              {updateOrderItemStatus.isPending &&
                              selectedItem?.id === item.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </button>
                          ) : null}

                          {canCancel ? (
                            <button
                              onClick={() => handleCancel(item)}
                              className="rounded-xl border border-neutral-200 p-2 text-red-600 transition-colors hover:border-red-200 hover:bg-red-50"
                              title="Annuler"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <AnimatePresence>
        {selectedItem ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-3xl bg-white shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-5">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900">
                    {selectedItem.orderNumber}
                  </h2>
                  <p className="mt-1 text-sm text-neutral-500">
                    Dossier vendeur de la ligne de commande
                  </p>
                </div>

                <button
                  onClick={() => setSelectedItem(null)}
                  className="rounded-xl border border-neutral-200 p-2 text-neutral-500 transition-colors hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6 p-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl bg-neutral-50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                      Produit
                    </p>
                    <p className="mt-2 font-semibold text-neutral-900">
                      {selectedItem.productName}
                    </p>
                    <p className="mt-1 text-sm text-neutral-500">
                      {formatPrice(selectedItem.price, "HTG")} x{" "}
                      {selectedItem.quantity}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-neutral-50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                      Total vendeur
                    </p>
                    <p className="mt-2 font-semibold text-neutral-900">
                      {formatPrice(selectedItem.total, "HTG")}
                    </p>
                    <p className="mt-1 text-sm text-neutral-500">
                      Statut: {selectedItem.itemStatus}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-neutral-50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                      Paiement
                    </p>
                    <p className="mt-2 font-semibold text-neutral-900">
                      {selectedItem.paymentMethod || "Non precise"}
                    </p>
                    <p className="mt-1 text-sm text-neutral-500">
                      {selectedItem.paymentStatus || "pending"}
                    </p>
                  </div>
                </div>

                <section className="rounded-2xl border border-neutral-200 p-5">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-neutral-400" />
                    <h3 className="font-semibold text-neutral-900">Client</h3>
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-neutral-500">Nom</p>
                      <p className="mt-1 font-medium text-neutral-900">
                        {selectedItem.customerName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Email</p>
                      <p className="mt-1 font-medium text-neutral-900">
                        {selectedItem.customerEmail}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-neutral-200 p-5">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-neutral-400" />
                    <h3 className="font-semibold text-neutral-900">
                      Livraison
                    </h3>
                  </div>
                  <div className="mt-4 text-sm leading-6 text-neutral-600">
                    <p className="font-medium text-neutral-900">
                      {selectedItem.shippingAddress.firstName}{" "}
                      {selectedItem.shippingAddress.lastName}
                    </p>
                    <p>{selectedItem.shippingAddress.address}</p>
                    <p>
                      {selectedItem.shippingAddress.city},{" "}
                      {selectedItem.shippingAddress.postalCode}
                    </p>
                    <p>{selectedItem.shippingAddress.country}</p>
                    <p className="mt-2">
                      Telephone: {selectedItem.shippingAddress.phone}
                    </p>
                  </div>
                </section>

                <section className="rounded-2xl border border-neutral-200 p-5">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-neutral-400" />
                    <h3 className="font-semibold text-neutral-900">
                      Chronologie
                    </h3>
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-neutral-500">Commande creee</p>
                      <p className="mt-1 font-medium text-neutral-900">
                        {formatDate(selectedItem.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Numero de suivi</p>
                      <p className="mt-1 font-medium text-neutral-900">
                        {selectedItem.trackingNumber || "Pas encore renseigne"}
                      </p>
                    </div>
                  </div>
                </section>

                {selectedItem.paymentProofPath ? (
                  <section className="rounded-2xl border border-neutral-200 p-5">
                    <p className="text-sm font-semibold text-neutral-900">
                      Preuve de paiement
                    </p>
                    <a
                      href={selectedItem.paymentProofPath}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 block overflow-hidden rounded-2xl border border-neutral-200"
                    >
                      <img
                        src={selectedItem.paymentProofPath}
                        alt="Preuve de paiement"
                        className="max-h-[420px] w-full object-contain bg-neutral-50"
                      />
                    </a>
                  </section>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </SellerWorkspaceShell>
  );
}
