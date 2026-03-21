"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  X,
  Package,
  Tag,
  DollarSign,
  Boxes,
  Eye,
  EyeOff,
  Star,
  Calendar,
  Edit2,
  Trash2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  User,
  Folder,
} from "lucide-react";
import { PRODUCT_ONTOLOGY } from "@/data/productOntology";
import { Button } from "@/components/ui/Button";
import { cn, formatDate } from "@/lib/utils";
import { useCurrencyConverter } from "@/store/adminStore";
import type { SupabaseProduct } from "@/data/types";

interface ProductDetailModalProps {
  product: SupabaseProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (product: SupabaseProduct) => void;
  onViewSeller: (product: SupabaseProduct) => void;
  onDelete: (product: SupabaseProduct) => void;
  onToggleStatus: (product: SupabaseProduct, newStatus: string) => void;
  onUpdateStock: (product: SupabaseProduct, newStock: number) => void;
}

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

export function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onEdit,
  onViewSeller,
  onDelete,
  onToggleStatus,
  onUpdateStock,
}: ProductDetailModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isEditingStock, setIsEditingStock] = useState(false);
  const [stockValue, setStockValue] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { formatPrice } = useCurrencyConverter();

  if (!product) return null;

  const StatusIcon =
    statusConfig[product.status as keyof typeof statusConfig]?.icon || Clock;

  const handleStockUpdate = () => {
    const newStock = parseInt(stockValue);
    if (!isNaN(newStock) && newStock >= 0) {
      onUpdateStock(product, newStock);
      setIsEditingStock(false);
      setStockValue("");
    }
  };

  const handleToggleOnline = () => {
    const newStatus = product.status === "active" ? "inactive" : "active";
    onToggleStatus(product, newStatus);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-10 bg-white rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "p-2 rounded-lg",
                    statusConfig[product.status as keyof typeof statusConfig]
                      ?.color,
                  )}
                >
                  <StatusIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">
                    {product.name}
                  </h2>
                  <p className="text-sm text-neutral-500">{product.sku}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(product)}
                  className="flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Modifier
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-neutral-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid lg:grid-cols-2 gap-6 p-6">
                {/* Left: Images */}
                <div className="space-y-4">
                  <div className="relative aspect-square bg-neutral-100 rounded-lg overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <Image
                        src={product.images[activeImageIndex]}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400">
                        <Package className="w-16 h-16" />
                      </div>
                    )}

                    {/* Navigation */}
                    {product.images && product.images.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            setActiveImageIndex((prev) => Math.max(0, prev - 1))
                          }
                          disabled={activeImageIndex === 0}
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full disabled:opacity-30"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() =>
                            setActiveImageIndex((prev) =>
                              Math.min(product.images.length - 1, prev + 1),
                            )
                          }
                          disabled={
                            activeImageIndex === product.images.length - 1
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full disabled:opacity-30"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnails */}
                  {product.images && product.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {product.images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImageIndex(idx)}
                          className={cn(
                            "w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2",
                            activeImageIndex === idx
                              ? "border-neutral-900"
                              : "border-transparent",
                          )}
                        >
                          <Image
                            src={img}
                            alt={`${product.name} ${idx + 1}`}
                            width={64}
                            height={64}
                            className="object-cover w-full h-full"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Info */}
                <div className="space-y-6">
                  {/* Status & Actions */}
                  <div className="flex flex-wrap gap-3">
                    <span
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5",
                        statusConfig[
                          product.status as keyof typeof statusConfig
                        ]?.color,
                      )}
                    >
                      <StatusIcon className="w-4 h-4" />
                      {statusConfig[product.status as keyof typeof statusConfig]
                        ?.label || product.status}
                    </span>

                    {product.is_featured && (
                      <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-purple-700 flex items-center gap-1.5">
                        <Star className="w-4 h-4" />
                        Mise en avant
                      </span>
                    )}

                    <button
                      onClick={handleToggleOnline}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 transition-colors",
                        product.status === "active"
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                      )}
                    >
                      {product.status === "active" ? (
                        <>
                          <Eye className="w-4 h-4" /> En ligne
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-4 h-4" /> Hors ligne
                        </>
                      )}
                    </button>
                  </div>

                  {/* Price */}
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-neutral-900">
                        {formatPrice(product.price, (product as any).currency_code)}
                      </span>
                      {product.original_price &&
                        product.original_price > product.price && (
                          <span className="text-lg text-neutral-400 line-through">
                            {formatPrice(product.original_price, (product as any).currency_code)}
                          </span>
                        )}
                    </div>
                    {product.original_price &&
                      product.original_price > product.price && (
                        <p className="text-sm text-green-600 mt-1">
                          Promo: -
                          {Math.round(
                            (1 - product.price / product.original_price) * 100,
                          )}
                          %
                        </p>
                      )}
                  </div>

                  {/* Stock Management */}
                  <div className="border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Boxes className="w-5 h-5 text-neutral-500" />
                        <div>
                          <p className="font-medium text-neutral-900">Stock</p>
                          <p className="text-2xl font-bold text-neutral-900">
                            {product.stock}
                          </p>
                        </div>
                      </div>

                      {!isEditingStock ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setStockValue(product.stock.toString());
                            setIsEditingStock(true);
                          }}
                        >
                          Modifier
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={stockValue}
                            onChange={(e) => setStockValue(e.target.value)}
                            className="w-20 px-2 py-1 border border-neutral-200 rounded"
                            min="0"
                          />
                          <Button size="sm" onClick={handleStockUpdate}>
                            OK
                          </Button>
                          <button
                            onClick={() => setIsEditingStock(false)}
                            className="p-1 text-neutral-500 hover:text-neutral-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Owner */}
                  <div className="border border-neutral-200 rounded-lg p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-3">
                        <User className="mt-0.5 h-5 w-5 text-neutral-500" />
                        <div>
                          <p className="font-medium text-neutral-900">
                            Propriétaire du produit
                          </p>
                          <p className="mt-1 text-sm text-neutral-700">
                            {product.owner_name || "Propriétaire inconnu"}
                          </p>
                          <p className="mt-1 text-xs text-neutral-500">
                            {product.owner_type === "seller"
                              ? "Compte vendeur"
                              : "Compte administrateur"}
                          </p>
                        </div>
                      </div>

                      {product.owner_type === "seller" && product.seller_id ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewSeller(product)}
                        >
                          Voir le dossier vendeur
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-neutral-50 p-3 rounded-lg text-center">
                      <Eye className="w-5 h-5 mx-auto mb-1 text-neutral-500" />
                      <p className="text-lg font-semibold">{product.views}</p>
                      <p className="text-xs text-neutral-500">Vues</p>
                    </div>
                    <div className="bg-neutral-50 p-3 rounded-lg text-center">
                      <BarChart3 className="w-5 h-5 mx-auto mb-1 text-neutral-500" />
                      <p className="text-lg font-semibold">{product.sales}</p>
                      <p className="text-xs text-neutral-500">Ventes</p>
                    </div>
                    <div className="bg-neutral-50 p-3 rounded-lg text-center">
                      <Star className="w-5 h-5 mx-auto mb-1 text-neutral-500" />
                      <p className="text-lg font-semibold">
                        {product.rating.toFixed(1)}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {product.review_count} avis
                      </p>
                    </div>
                  </div>

                  {/* Category & Tags */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Folder className="w-4 h-4 text-neutral-500" />
                      <span className="text-sm text-neutral-500">
                        Catégorie:
                      </span>
                      <span className="text-sm font-medium">
                        {(() => {
                          const cat = PRODUCT_ONTOLOGY.find(
                            (c) => c.id === product.category_id,
                          );
                          const sub = cat?.subcategories.find(
                            (s) => s.id === product.subcategory,
                          );
                          return (
                            <>
                              {cat?.name || product.category_id}
                              {sub && (
                                <span className="text-neutral-400 font-normal">
                                  {" "}
                                  / {sub.name}
                                </span>
                              )}
                            </>
                          );
                        })()}
                      </span>
                    </div>

                    {product.tags && product.tags.length > 0 && (
                      <div className="flex items-start gap-2">
                        <Tag className="w-4 h-4 text-neutral-500 mt-0.5" />
                        <div className="flex flex-wrap gap-1">
                          {product.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-neutral-100 text-neutral-700 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="font-medium text-neutral-900 mb-2">
                      Description
                    </h3>
                    <p className="text-sm text-neutral-600 whitespace-pre-wrap">
                      {product.description}
                    </p>
                  </div>

                  {/* Features */}
                  {product.features && product.features.length > 0 && (
                    <div>
                      <h3 className="font-medium text-neutral-900 mb-2">
                        Caractéristiques
                      </h3>
                      <ul className="space-y-1">
                        {product.features.map((feature, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-neutral-600 flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Created/Updated */}
                  <div className="pt-4 border-t border-neutral-200 text-sm text-neutral-500 space-y-1">
                    <p className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Créé le: {formatDate(product.created_at)}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Mis à jour: {formatDate(product.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Delete Confirmation */}
            {showDeleteConfirm && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-lg p-6 max-w-sm mx-4"
                >
                  <div className="flex items-center gap-3 text-red-600 mb-4">
                    <AlertCircle className="w-6 h-6" />
                    <h3 className="font-semibold">Confirmer la suppression</h3>
                  </div>
                  <p className="text-neutral-600 mb-6">
                    Êtes-vous sûr de vouloir supprimer &quot;{product.name}
                    &quot; ? Cette action est irréversible.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Annuler
                    </Button>
                    <Button
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      onClick={() => {
                        onDelete(product);
                        setShowDeleteConfirm(false);
                      }}
                    >
                      Supprimer
                    </Button>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
