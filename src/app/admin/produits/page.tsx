"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Search,
  Filter,
  Eye,
  ExternalLink,
  Edit,
  Trash2,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  Store,
  Shield,
  AlertCircle,
  X,
  Loader2,
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/Button";
import { ProductDetailModal } from "@/components/admin/ProductDetailModal";
import { PRODUCT_ONTOLOGY } from "@/data/productOntology";
import {
  useProducts,
  useDeleteProduct,
  useToggleProductStatus,
  useUpdateStock,
} from "@/hooks/useProducts";
import { formatPrice as utilsFormatPrice, cn } from "@/lib/utils";
import { useCurrencyConverter } from "@/store/adminStore";
import type { SupabaseProduct } from "@/data/types";

const statusConfig = {
  active: {
    label: "Actif",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle,
  },
  inactive: {
    label: "Inactif",
    color: "bg-gray-100 text-gray-700",
    icon: XCircle,
  },
  pending: {
    label: "En attente",
    color: "bg-amber-100 text-amber-700",
    icon: Clock,
  },
  rejected: {
    label: "Rejeté",
    color: "bg-red-100 text-red-700",
    icon: XCircle,
  },
  out_of_stock: {
    label: "Rupture",
    color: "bg-red-100 text-red-700",
    icon: AlertCircle,
  },
};

const ownerTypeConfig = {
  admin: { label: "Admin", icon: Shield, color: "text-blue-600" },
  seller: { label: "Vendeur", icon: Store, color: "text-purple-600" },
};

export default function AdminProductsPage() {
  const { data: products, isLoading } = useProducts();
  const deleteProduct = useDeleteProduct();
  const toggleStatus = useToggleProductStatus();
  const updateStock = useUpdateStock();
  const { formatPrice, displayCurrency } = useCurrencyConverter();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [ownerFilter, setOwnerFilter] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] =
    useState<SupabaseProduct | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredProducts =
    products?.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.owner_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter
        ? product.status === statusFilter
        : true;
      const matchesOwner = ownerFilter
        ? product.owner_type === ownerFilter
        : true;
      return matchesSearch && matchesStatus && matchesOwner;
    }) || [];

  const handleDelete = async () => {
    if (selectedProduct) {
      setDeletingId(selectedProduct.id);
      await deleteProduct.mutateAsync(selectedProduct.id);
      setDeletingId(null);
      setShowDeleteModal(false);
      setSelectedProduct(null);
    }
  };

  const handleToggleStatus = async (
    product: SupabaseProduct,
    newStatus: string,
  ) => {
    await toggleStatus.mutateAsync({ id: product.id, status: newStatus });
  };

  const handleUpdateStock = async (
    product: SupabaseProduct,
    newStock: number,
  ) => {
    await updateStock.mutateAsync({ id: product.id, stock: newStock });
  };

  const getSellerProfileHref = (product: SupabaseProduct) =>
    product.owner_type === "seller" && product.seller_id
      ? `/admin/vendeurs?sellerId=${product.seller_id}`
      : null;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Chargement des produits...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">
              Gestion des produits
            </h1>
            <p className="text-neutral-500">
              Gérez tous les produits de la plateforme
            </p>
          </div>
          <Link href="/admin/produits/nouveau">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Ajouter un produit
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-neutral-200">
            <p className="text-sm text-neutral-500">Total</p>
            <p className="text-2xl font-semibold text-neutral-900">
              {products?.length || 0}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-neutral-200">
            <p className="text-sm text-neutral-500">Actifs</p>
            <p className="text-2xl font-semibold text-green-600">
              {products?.filter((p) => p.status === "active").length || 0}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-neutral-200">
            <p className="text-sm text-neutral-500">En attente</p>
            <p className="text-2xl font-semibold text-amber-600">
              {products?.filter((p) => p.status === "pending").length || 0}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-neutral-200">
            <p className="text-sm text-neutral-500">Produits vendeur</p>
            <p className="text-2xl font-semibold text-purple-600">
              {products?.filter((p) => p.owner_type === "seller").length || 0}
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
                placeholder="Rechercher un produit..."
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
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="pending">En attente</option>
                <option value="rejected">Rejeté</option>
              </select>
              <select
                value={ownerFilter || ""}
                onChange={(e) => setOwnerFilter(e.target.value || null)}
                className="px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900"
              >
                <option value="">Tous les types</option>
                <option value="admin">Admin</option>
                <option value="seller">Vendeur</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">
                    Produit
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">
                    Prix
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">
                    Propriétaire
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">
                    Note
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-neutral-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-12 text-center text-neutral-500"
                    >
                      Aucun produit trouvé
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const StatusIcon =
                      statusConfig[product.status as keyof typeof statusConfig]
                        ?.icon || Clock;
                    const OwnerIcon =
                      ownerTypeConfig[
                        product.owner_type as keyof typeof ownerTypeConfig
                      ]?.icon || Store;
                    return (
                      <tr key={product.id} className="hover:bg-neutral-50">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-neutral-100 rounded-lg overflow-hidden">
                              {product.images[0] ? (
                                <Image
                                  src={product.images[0]}
                                  alt={product.name}
                                  width={48}
                                  height={48}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Plus className="w-5 h-5 text-neutral-400" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-neutral-900">
                                {product.name}
                              </p>
                              <div className="flex items-center gap-1 text-sm text-neutral-500">
                                <span>{product.sku}</span>
                                <span>•</span>
                                <span className="text-xs px-2 py-0.5 bg-neutral-100 rounded text-neutral-600">
                                  {
                                    PRODUCT_ONTOLOGY.find(
                                      (c) => c.id === product.category_id,
                                    )?.name || product.category_id
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                         <td className="px-4 py-4">
                           <div>
                             <p className="font-medium text-neutral-900">
                               {formatPrice(product.price, (product as any).currency_code)}
                             </p>
                             {product.original_price && (
                               <p className="text-sm text-neutral-500 line-through">
                                 {formatPrice(product.original_price, (product as any).currency_code)}
                               </p>
                             )}
                           </div>
                         </td>
                        <td className="px-4 py-4">
                          <span
                            className={cn(
                              "px-2 py-1 text-xs rounded-full",
                              product.stock > 10
                                ? "bg-green-100 text-green-700"
                                : product.stock > 0
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-red-100 text-red-700",
                            )}
                          >
                            {product.stock} en stock
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <OwnerIcon
                              className={`w-4 h-4 ${ownerTypeConfig[product.owner_type as keyof typeof ownerTypeConfig]?.color || "text-neutral-500"}`}
                            />
                            <div>
                              <p className="text-sm font-medium text-neutral-900">
                                {product.owner_name}
                              </p>
                              <p className="text-xs text-neutral-500">
                                {ownerTypeConfig[
                                  product.owner_type as keyof typeof ownerTypeConfig
                                ]?.label || product.owner_type}
                              </p>
                              {getSellerProfileHref(product) ? (
                                <Link
                                  href={getSellerProfileHref(product)!}
                                  className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-neutral-700 hover:text-neutral-900"
                                >
                                  Voir le dossier vendeur
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </Link>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full",
                              statusConfig[
                                product.status as keyof typeof statusConfig
                              ]?.color || "bg-gray-100 text-gray-700",
                            )}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig[
                              product.status as keyof typeof statusConfig
                            ]?.label || product.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            <span className="text-sm font-medium text-neutral-900">
                              {product.rating}
                            </span>
                            <span className="text-sm text-neutral-500">
                              ({product.review_count})
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1">
                            {deletingId === product.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedProduct(product);
                                    setShowDetailModal(true);
                                  }}
                                  className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                                  title="Voir détails"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <Link
                                  href={`/admin/produits/${product.id}/edit`}
                                >
                                  <button
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Modifier"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                </Link>
                                <button
                                  onClick={() => {
                                    setSelectedProduct(product);
                                    setShowDeleteModal(true);
                                  }}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
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

        {/* Delete Modal */}
        <AnimatePresence>
          {showDeleteModal && selectedProduct && (
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
                className="bg-white rounded-lg max-w-md w-full p-6"
              >
                <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                  Confirmer la suppression
                </h2>
                <p className="text-neutral-500 mb-6">
                  Êtes-vous sûr de vouloir supprimer &quot;
                  {selectedProduct.name}&quot; ? Cette action est irréversible.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    fullWidth
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Supprimer
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product Detail Modal */}
        <ProductDetailModal
          product={selectedProduct}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          onEdit={(product) => {
            window.location.href = `/admin/produits/${product.id}/edit`;
          }}
          onViewSeller={(product) => {
            const href = getSellerProfileHref(product);

            if (!href) {
              return;
            }

            window.location.href = href;
          }}
          onDelete={(product) => {
            setSelectedProduct(product);
            setShowDeleteModal(true);
          }}
          onToggleStatus={handleToggleStatus}
          onUpdateStock={handleUpdateStock}
        />
      </div>
    </AdminLayout>
  );
}
