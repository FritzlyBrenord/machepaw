"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Eye,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  RotateCcw,
  MapPin,
  User,
  DollarSign,
  Calendar,
  X,
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/Button";
import {
  useAdminOrdersQuery,
  useUpdateOrderStatusMutation,
  useUpdateOrderPaymentStatusMutation,
  useUpdateOrderDeliveryDateMutation,
} from "@/hooks/useOrders";
import { formatPrice, formatDate, getEstimatedDeliveryRange, cn } from "@/lib/utils";
import type { AdminOrder, OrderStatus } from "@/data/types";

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "En attente", color: "bg-amber-100 text-amber-700", icon: Clock },
  confirmed: { label: "Confirmé", color: "bg-blue-100 text-blue-700", icon: CheckCircle },
  processing: { label: "En préparation", color: "bg-purple-100 text-purple-700", icon: Package },
  shipped: { label: "Expédié", color: "bg-indigo-100 text-indigo-700", icon: Truck },
  delivered: { label: "Livré", color: "bg-green-100 text-green-700", icon: CheckCircle },
  cancelled: { label: "Annulé", color: "bg-red-100 text-red-700", icon: XCircle },
  refunded: { label: "Remboursé", color: "bg-gray-100 text-gray-700", icon: RotateCcw },
};

export default function AdminOrdersPage() {
  const { data: orders = [], isLoading } = useAdminOrdersQuery();
  const updateStatusMutation = useUpdateOrderStatusMutation();
  const updatePaymentMutation = useUpdateOrderPaymentStatusMutation();
  const updateDeliveryDateMutation = useUpdateOrderDeliveryDateMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shippingAddress.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? order.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const maxMinDays = 1; // Default
  const maxMaxDays = 3; // Default

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    let trackingNumber;
    if (status === "shipped") {
      trackingNumber = prompt("Entrez le numéro de suivi (optionnel):") || undefined;
    }
    
    try {
      await updateStatusMutation.mutateAsync({ orderId, status, trackingNumber });
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Erreur lors de la mise à jour du statut");
    }
  };

  const handleCancel = async (orderId: string) => {
    const reason = prompt("Raison de l'annulation:");
    if (reason) {
      try {
        await updateStatusMutation.mutateAsync({ orderId, status: "cancelled" });
      } catch (err) {
        console.error("Failed to cancel order:", err);
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {isLoading && (
          <div className="fixed inset-0 bg-white/50 flex items-center justify-center z-50">
            <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Gestion des commandes</h1>
            <p className="text-neutral-500">Gérez toutes les commandes de la plateforme</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-neutral-200">
            <p className="text-sm text-neutral-500">Total commandes</p>
            <p className="text-2xl font-semibold text-neutral-900">{orders.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-neutral-200">
            <p className="text-sm text-neutral-500">En attente</p>
            <p className="text-2xl font-semibold text-amber-600">
              {orders.filter((o) => o.status === "pending").length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-neutral-200">
            <p className="text-sm text-neutral-500">En cours</p>
            <p className="text-2xl font-semibold text-blue-600">
              {orders.filter((o) => ["confirmed", "processing", "shipped"].includes(o.status)).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-neutral-200">
            <p className="text-sm text-neutral-500">Livrées</p>
            <p className="text-2xl font-semibold text-green-600">
              {orders.filter((o) => o.status === "delivered").length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg border border-neutral-200">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Rechercher une commande..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter || ""}
                onChange={(e) => setStatusFilter(e.target.value || null)}
                className="px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900"
              >
                <option value="">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmé</option>
                <option value="processing">En préparation</option>
                <option value="shipped">Expédié</option>
                <option value="delivered">Livré</option>
                <option value="cancelled">Annulé</option>
                <option value="refunded">Remboursé</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
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
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-neutral-500">
                      Aucune commande trouvée
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                      const status = order.status as OrderStatus;
                      const config = statusConfig[status];
                      const StatusIcon = config.icon;
                      return (
                        <tr key={order.id} className="hover:bg-neutral-50">
                          <td className="px-4 py-4">
                            <div>
                              <p className="font-medium text-neutral-900">{order.id}</p>
                              <p className="text-sm text-neutral-500">{order.items.length} article(s)</p>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-neutral-400" />
                              <span className="text-sm text-neutral-900">
                                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div>
                              <p className="font-medium text-neutral-900">{formatPrice(order.total)}</p>
                              <p className="text-sm text-neutral-500">
                                Livraison: {formatPrice(order.shipping)}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full",
                                config.color
                              )}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {config.label}
                            </span>
                          </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1 text-sm text-neutral-600">
                            <Calendar className="w-3 h-3" />
                            {formatDate(order.createdAt)}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowDetailModal(true);
                              }}
                              className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                              title="Voir détails"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            
                            {/* Annulation is always possible if not already completed/cancelled */}
                            {order.status !== "cancelled" && order.status !== "refunded" && order.status !== "delivered" && (
                                <button
                                  onClick={() => handleCancel(order.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Annuler"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                            )}

                            {/* Payment confirmation logic */}
                            {!(order.paymentStatus === "paid" || order.paymentStatus === "confirmed" || order.paymentMethod === "delivery") && order.status !== "cancelled" && (
                               <button
                                 onClick={async () => {
                                   try {
                                     await updatePaymentMutation.mutateAsync({ orderId: order.id, paymentStatus: 'paid' });
                                   } catch (err: any) {
                                     alert(`Erreur DB: ${err.message || JSON.stringify(err)}`);
                                     console.error(err);
                                   }
                                 }}
                                 className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-1 border border-transparent hover:border-green-200"
                                 title="Valider le paiement pour traiter la commande"
                               >
                                 <DollarSign className="w-4 h-4" />
                               </button>
                            )}

                            {/* Status progression logic (only if payment is confirmed) */}
                            {(order.paymentStatus === "paid" || order.paymentStatus === "confirmed" || order.paymentMethod === "delivery") && (
                              <>
                                {order.status === "pending" && (
                                    <button
                                      onClick={() => handleStatusChange(order.id, "confirmed")}
                                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                      title="Confirmer la commande"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                    </button>
                                )}
                                {order.status === "confirmed" && (
                                  <button
                                    onClick={() => handleStatusChange(order.id, "processing")}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Marquer en préparation"
                                  >
                                    <Package className="w-4 h-4" />
                                  </button>
                                )}
                                {order.status === "processing" && (
                                  <button
                                    onClick={() => handleStatusChange(order.id, "shipped")}
                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                    title="Marquer expédié"
                                  >
                                    <Truck className="w-4 h-4" />
                                  </button>
                                )}
                                {order.status === "shipped" && (
                                  <button
                                    onClick={() => handleStatusChange(order.id, "delivered")}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Marquer livré"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Modal */}
        <AnimatePresence>
          {showDetailModal && selectedOrder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto"
              >
                <div className="p-6 border-b border-neutral-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-neutral-900">
                      Détails de la commande
                    </h2>
                    <button
                      onClick={() => setShowDetailModal(false)}
                      className="p-2 hover:bg-neutral-100 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-500">Commande</p>
                      <p className="text-lg font-semibold text-neutral-900">{selectedOrder.id}</p>
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full",
                        statusConfig[selectedOrder.status as OrderStatus].color
                      )}
                    >
                      {statusConfig[selectedOrder.status as OrderStatus].label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-neutral-50 p-4 rounded-lg">
                      <p className="text-sm text-neutral-500 mb-1">Date de commande</p>
                      <p className="font-medium text-neutral-900">
                        {formatDate(selectedOrder.createdAt)}
                      </p>
                    </div>
                    <div className="bg-neutral-50 p-4 rounded-lg">
                      <p className="text-sm text-neutral-500 mb-1">Récapitulatif financier</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Sous-total :</span>
                          <span className="font-medium">{formatPrice(selectedOrder.subtotal || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">
                            {selectedOrder.notes?.includes("[RETRAIT") ? "Frais de retrait :" : "Livraison :"}
                          </span>
                          <span className="font-medium">{formatPrice(selectedOrder.shipping || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Taxes :</span>
                          <span className="font-medium">{formatPrice(selectedOrder.tax || 0)}</span>
                        </div>
                        <div className="flex justify-between border-t border-neutral-200 mt-1 pt-1">
                          <span className="text-neutral-900 font-semibold">Total :</span>
                          <span className="text-neutral-900 font-semibold">{formatPrice(selectedOrder.total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-neutral-500 mb-3">Articles</p>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white rounded-lg overflow-hidden">
                              {item.product.images[0] ? (
                                <img
                                  src={item.product.images[0]}
                                  alt={item.product.name}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-5 h-5 text-neutral-400" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-neutral-900">{item.product.name}</p>
                              <p className="text-sm text-neutral-500">
                                Qté: {item.quantity} × {formatPrice(item.price)}
                              </p>
                            </div>
                          </div>
                          <p className="font-medium text-neutral-900">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-neutral-500 mb-3">Adresse de livraison</p>
                    <div className="bg-neutral-50 p-4 rounded-lg">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-2 mb-2">
                            <MapPin className="w-4 h-4 text-neutral-400 mt-1" />
                            <div>
                              <p className="font-medium text-neutral-900">
                                {selectedOrder.shippingAddress.firstName}{" "}
                                {selectedOrder.shippingAddress.lastName}
                              </p>
                              <p className="text-neutral-600">{selectedOrder.shippingAddress.address}</p>
                              <p className="text-neutral-600">
                                {selectedOrder.shippingAddress.city},{" "}
                                {selectedOrder.shippingAddress.postalCode}
                              </p>
                              <p className="text-neutral-600 font-medium">{selectedOrder.shippingAddress.country}</p>
                              <p className="text-neutral-500 mt-1">
                                Tél: {selectedOrder.shippingAddress.phone}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex-1 border-l border-neutral-200 pl-4">
                          <div className="flex items-start gap-2">
                            <Truck className="w-4 h-4 text-neutral-400 mt-1" />
                            <div className="w-full">
                              <p className="text-sm font-medium text-neutral-900">Estimation de livraison</p>
                              <div className="space-y-2 mt-1">
                                <p className="text-sm text-neutral-600">
                                  {selectedOrder.notes?.includes("[RETRAIT EN MAGASIN]") 
                                    ? "Retrait en magasin (Prêt sous 24h)"
                                    : (() => {
                                        if (selectedOrder.status === "delivered") {
                                          return `Livrée le ${formatDate(selectedOrder.deliveredAt || selectedOrder.updatedAt)}`;
                                        }
                                        if (selectedOrder.status === "cancelled" || selectedOrder.status === "refunded") {
                                          return `${statusConfig[selectedOrder.status as OrderStatus].label} le ${formatDate(selectedOrder.updatedAt)}`;
                                        }
                                        
                                        const minDays = selectedOrder.items.length > 0 
                                          ? Math.max(...selectedOrder.items.map(i => i.product.minProcessingDays ?? 1)) 
                                          : 1;
                                        const maxDays = selectedOrder.items.length > 0 
                                          ? Math.max(...selectedOrder.items.map(i => i.product.maxProcessingDays ?? 3)) 
                                          : 3;
                                        // Use order creation date as base for fixed estimation
                                        return `Prévue du ${getEstimatedDeliveryRange(minDays, maxDays, selectedOrder.createdAt)}`;
                                      })()
                                  }
                                </p>
                                
                                <div className="pt-2 border-t border-dashed border-neutral-200">
                                  <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                                    Date Limite (Fixe)
                                  </label>
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="date"
                                      defaultValue={selectedOrder.estimatedDelivery ? new Date(selectedOrder.estimatedDelivery).toISOString().split('T')[0] : ''}
                                      onChange={async (e) => {
                                        const newDate = e.target.value;
                                        if (newDate) {
                                          try {
                                            await updateDeliveryDateMutation.mutateAsync({ 
                                              orderId: selectedOrder.id, 
                                              estimatedDelivery: new Date(newDate).toISOString() 
                                            });
                                          } catch (err) {
                                            alert("Erreur lors de la mise à jour de la date");
                                          }
                                        }
                                      }}
                                      className="text-xs border border-neutral-200 rounded px-2 py-1 focus:outline-none focus:border-neutral-900 bg-white"
                                    />
                                    {selectedOrder.estimatedDelivery && (
                                      <button 
                                        onClick={async () => {
                                          if (confirm("Supprimer la date limite personnalisée ?")) {
                                            await updateDeliveryDateMutation.mutateAsync({ 
                                              orderId: selectedOrder.id, 
                                              estimatedDelivery: null 
                                            });
                                          }
                                        }}
                                        className="text-[10px] text-neutral-400 hover:text-red-500 underline"
                                      >
                                        Effacer
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedOrder.paymentMethod && (
                    <div>
                      <p className="text-sm text-neutral-500 mb-3">Informations de paiement</p>
                      <div className="bg-neutral-50 p-4 rounded-lg space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-neutral-600">Méthode:</span>
                          <span className="font-medium uppercase">{selectedOrder.paymentMethod}</span>
                        </div>
                        {selectedOrder.paymentId && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-neutral-600">ID Transaction:</span>
                            <span className="font-mono bg-neutral-200 px-2 rounded">{selectedOrder.paymentId}</span>
                          </div>
                        )}
                        {selectedOrder.paymentProofUrl && (
                          <div>
                            <p className="text-sm text-neutral-600 mb-2">Preuve de paiement (cliquez pour agrandir):</p>
                            <button 
                              onClick={() => setEnlargedImage(selectedOrder.paymentProofUrl!)}
                              className="w-full relative aspect-video bg-white border border-neutral-200 rounded overflow-hidden hover:opacity-90 transition-opacity"
                            >
                              <img 
                                src={selectedOrder.paymentProofUrl} 
                                alt="Preuve de paiement" 
                                className="object-contain w-full h-full"
                              />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedOrder.trackingNumber && (
                    <div>
                      <p className="text-sm text-neutral-500 mb-1">Numéro de suivi</p>
                      <p className="font-medium text-neutral-900">{selectedOrder.trackingNumber}</p>
                    </div>
                  )}

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        fullWidth
                        onClick={() => setShowDetailModal(false)}
                      >
                        Fermer
                      </Button>
                      
                      {!(selectedOrder.paymentStatus === "paid" || selectedOrder.paymentStatus === "confirmed" || selectedOrder.paymentMethod === "delivery") && selectedOrder.status !== "cancelled" && (
                        <Button
                          fullWidth
                          className="bg-green-600 hover:bg-green-700"
                          onClick={async () => {
                            try {
                              await updatePaymentMutation.mutateAsync({ orderId: selectedOrder.id, paymentStatus: 'paid' });
                            } catch (err: any) {
                              alert(`Erreur DB: ${err.message || JSON.stringify(err)}`);
                              console.error(err);
                            }
                          }}
                        >
                          Valider paiement
                        </Button>
                      )}

                      {(selectedOrder.paymentStatus === "paid" || selectedOrder.paymentStatus === "confirmed" || selectedOrder.paymentMethod === "delivery") && selectedOrder.status === "pending" && (
                        <Button
                          fullWidth
                          onClick={() => {
                            handleStatusChange(selectedOrder.id, "confirmed");
                            setShowDetailModal(false);
                          }}
                        >
                          Confirmer la commande
                        </Button>
                      )}
                    </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Enlarged Image Lightbox */}
        <AnimatePresence>
          {enlargedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEnlargedImage(null)}
              className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4 cursor-pointer"
            >
              <button
                onClick={() => setEnlargedImage(null)}
                className="absolute top-6 right-6 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
              <motion.img
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                src={enlargedImage}
                alt="Enlarged proof"
                className="max-w-full max-h-full object-contain shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
