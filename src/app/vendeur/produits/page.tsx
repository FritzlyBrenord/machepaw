"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  Loader2,
  Package,
  Plus,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { SellerWorkspaceShell } from "@/components/SellerWorkspaceShell";
import { ProductDetailModal } from "@/components/admin/ProductDetailModal";
import { Button } from "@/components/ui/button";
import { PRODUCT_ONTOLOGY } from "@/data/productOntology";
import type { SupabaseProduct } from "@/data/types";
import {
  useDeleteSellerProductMutation,
  useSellerProductsQuery,
  useUpdateSellerProductStatusMutation,
  useUpdateSellerProductStockMutation,
} from "@/hooks/useSellerWorkspace";
import { cn, formatPrice } from "@/lib/utils";

const statusConfig = {
  active: {
    label: "Actif",
    color: "bg-emerald-100 text-emerald-800",
    icon: CheckCircle,
  },
  inactive: {
    label: "Hors ligne",
    color: "bg-neutral-200 text-neutral-700",
    icon: XCircle,
  },
  pending: {
    label: "En attente",
    color: "bg-amber-100 text-amber-800",
    icon: Clock,
  },
  rejected: {
    label: "Refuse",
    color: "bg-rose-100 text-rose-800",
    icon: XCircle,
  },
  out_of_stock: {
    label: "Rupture",
    color: "bg-red-100 text-red-800",
    icon: AlertCircle,
  },
} as const;

export default function SellerProductsPage() {
  const { data: products = [], isLoading } = useSellerProductsQuery();
  const deleteProduct = useDeleteSellerProductMutation();
  const updateStatus = useUpdateSellerProductStatusMutation();
  const updateStock = useUpdateSellerProductStockMutation();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedProduct, setSelectedProduct] =
    useState<SupabaseProduct | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const filteredProducts = products.filter((product) => {
    const haystack = [
      product.name,
      product.sku,
      product.owner_name,
      PRODUCT_ONTOLOGY.find((category) => category.id === product.category_id)
        ?.name,
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = haystack.includes(search.toLowerCase());
    const matchesStatus = statusFilter ? product.status === statusFilter : true;

    return matchesSearch && matchesStatus;
  });

  const handleDelete = async () => {
    if (!selectedProduct) {
      return;
    }

    await deleteProduct.mutateAsync(selectedProduct.id);
    setSelectedProduct(null);
    setShowDeleteModal(false);
  };

  const handleToggleStatus = async (
    product: SupabaseProduct,
    nextStatus: string,
  ) => {
    await updateStatus.mutateAsync({
      productId: product.id,
      status: nextStatus as SupabaseProduct["status"],
    });
  };

  const handleUpdateStock = async (
    product: SupabaseProduct,
    nextStock: number,
  ) => {
    await updateStock.mutateAsync({
      productId: product.id,
      stock: nextStock,
    });
  };

  return (
    <SellerWorkspaceShell
      title="Produits vendeur"
      description="Gerrez uniquement les produits de votre boutique, sans dependance au panneau admin."
      actions={
        <Link href="/vendeur/produits/nouveau">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Publier un produit
          </Button>
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <p className="text-sm text-neutral-500">Total produits</p>
          <p className="mt-2 text-2xl font-semibold text-neutral-900">
            {products.length}
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <p className="text-sm text-neutral-500">Actifs</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-700">
            {products.filter((product) => product.status === "active").length}
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <p className="text-sm text-neutral-500">En attente</p>
          <p className="mt-2 text-2xl font-semibold text-amber-700">
            {products.filter((product) => product.status === "pending").length}
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <p className="text-sm text-neutral-500">Rupture</p>
          <p className="mt-2 text-2xl font-semibold text-red-700">
            {
              products.filter((product) => product.status === "out_of_stock")
                .length
            }
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher par nom, SKU ou categorie"
              className="w-full rounded-xl border border-neutral-200 py-3 pl-10 pr-4 outline-none transition-colors focus:border-neutral-900"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-3 outline-none transition-colors focus:border-neutral-900"
          >
            <option value="">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Hors ligne</option>
            <option value="pending">En attente</option>
            <option value="rejected">Refuse</option>
            <option value="out_of_stock">Rupture</option>
          </select>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-neutral-50 text-left text-xs uppercase tracking-[0.18em] text-neutral-400">
              <tr>
                <th className="px-6 py-4">Produit</th>
                <th className="px-6 py-4">Prix</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Performance</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-sm text-neutral-500"
                  >
                    Chargement du catalogue vendeur...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-sm text-neutral-500"
                  >
                    Aucun produit vendeur pour ce filtre.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const StatusIcon =
                    statusConfig[product.status as keyof typeof statusConfig]
                      ?.icon || Clock;

                  return (
                    <tr key={product.id} className="hover:bg-neutral-50/80">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-neutral-100">
                            {product.images?.[0] ? (
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-neutral-400">
                                <Package className="h-5 w-5" />
                              </div>
                            )}
                          </div>

                          <div>
                            <p className="font-medium text-neutral-900">
                              {product.name}
                            </p>
                            <p className="mt-1 text-sm text-neutral-500">
                              {PRODUCT_ONTOLOGY.find(
                                (category) =>
                                  category.id === product.category_id,
                              )?.name || product.category_id}
                            </p>
                            <p className="mt-1 text-xs text-neutral-400">
                              SKU: {product.sku || "Non defini"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <p className="font-medium text-neutral-900">
                          {formatPrice(
                            Number(product.price || 0),
                            product.currency_code || "HTG",
                          )}
                        </p>
                        {product.original_price ? (
                          <p className="mt-1 text-sm text-neutral-400 line-through">
                            {formatPrice(
                              Number(product.original_price || 0),
                              product.currency_code || "HTG",
                            )}
                          </p>
                        ) : null}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-3 py-1 text-xs font-medium",
                            product.stock > 10
                              ? "bg-emerald-100 text-emerald-800"
                              : product.stock > 0
                                ? "bg-amber-100 text-amber-800"
                                : "bg-red-100 text-red-800",
                          )}
                        >
                          {product.stock} en stock
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium",
                            statusConfig[
                              product.status as keyof typeof statusConfig
                            ]?.color || "bg-neutral-100 text-neutral-700",
                          )}
                        >
                          <StatusIcon className="h-3.5 w-3.5" />
                          {statusConfig[
                            product.status as keyof typeof statusConfig
                          ]?.label || product.status}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-sm text-neutral-600">
                        <p>{product.sales || 0} vente(s)</p>
                        <p className="mt-1">{product.views || 0} vue(s)</p>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowDetailModal(true);
                            }}
                            className="rounded-xl border border-neutral-200 p-2 text-neutral-600 transition-colors hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900"
                            title="Voir"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <Link href={`/vendeur/produits/${product.id}/edit`}>
                            <button
                              className="rounded-xl border border-neutral-200 p-2 text-blue-600 transition-colors hover:border-blue-200 hover:bg-blue-50"
                              title="Modifier"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </Link>

                          <button
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowDeleteModal(true);
                            }}
                            className="rounded-xl border border-neutral-200 p-2 text-red-600 transition-colors hover:border-red-200 hover:bg-red-50"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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
        {showDeleteModal && selectedProduct ? (
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
              className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
            >
              <h2 className="text-xl font-semibold text-neutral-900">
                Supprimer ce produit ?
              </h2>
              <p className="mt-3 text-sm leading-6 text-neutral-500">
                Cette action supprimera definitivement{" "}
                <span className="font-medium text-neutral-900">
                  {selectedProduct.name}
                </span>{" "}
                de votre boutique.
              </p>

              <div className="mt-6 flex gap-3">
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
                  {deleteProduct.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Suppression...
                    </>
                  ) : (
                    "Supprimer"
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <ProductDetailModal
        product={selectedProduct}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onEdit={(product) => {
          window.location.href = `/vendeur/produits/${product.id}/edit`;
        }}
        onDelete={(product) => {
          setSelectedProduct(product);
          setShowDeleteModal(true);
        }}
        onToggleStatus={handleToggleStatus}
        onUpdateStock={handleUpdateStock}
      />
    </SellerWorkspaceShell>
  );
}
