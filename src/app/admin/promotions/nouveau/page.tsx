"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Zap,
  Search,
  Package,
  ChevronLeft,
  Loader2,
  CalendarClock,
  Tag,
  ShoppingBag,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import { useCreateFlashSale } from "@/hooks/usePromotions";
import type { SupabaseProduct } from "@/data/types";
import { cn } from "@/lib/utils";

export default function AdminNewFlashSalePage() {
  const router = useRouter();
  const createSale = useCreateFlashSale();
  const { data: products = [] } = useProducts({ status: "active" });
  const defaultEndsAt = new Date(Date.now() + 86400000)
    .toISOString()
    .slice(0, 16);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] =
    useState<SupabaseProduct | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    sale_price: "",
    ends_at: defaultEndsAt,
    quantity_limit: "",
  });
  const [error, setError] = useState<string | null>(null);

  const searchResults = products
    .filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .slice(0, 6);

  const handleSelectProduct = (product: SupabaseProduct) => {
    setSelectedProduct(product);
    setSearchQuery(product.name);
    setShowDropdown(false);
    setFormData((prev) => ({
      ...prev,
      title: `Vente Flash – ${product.name}`,
      sale_price: String(Math.round(product.price * 0.8)), // default: 20% off
    }));
  };

  const discount =
    selectedProduct && formData.sale_price
      ? Math.round(
          (1 - parseFloat(formData.sale_price) / selectedProduct.price) * 100,
        )
      : 0;

  const canSubmit =
    selectedProduct &&
    formData.title.trim() &&
    formData.sale_price &&
    parseFloat(formData.sale_price) > 0 &&
    parseFloat(formData.sale_price) < selectedProduct.price &&
    formData.ends_at;

  const handleSubmit = async () => {
    if (!canSubmit || !selectedProduct) return;
    setError(null);
    try {
      await createSale.mutateAsync({
        product_id: selectedProduct.id,
        title: formData.title,
        sale_price: parseFloat(formData.sale_price),
        original_price: selectedProduct.price,
        ends_at: new Date(formData.ends_at).toISOString(),
        quantity_limit: formData.quantity_limit
          ? parseInt(formData.quantity_limit)
          : 0,
      });
      router.push("/admin/promotions");
    } catch (err: any) {
      setError(err?.message || "Une erreur est survenue");
    }
  };
  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> Retour
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900 flex items-center gap-2">
              <Zap className="w-6 h-6 text-amber-500" />
              Nouvelle Vente Flash
            </h1>
            <p className="text-neutral-500 text-sm">
              L&apos;offre démarre immédiatement à la création
            </p>
          </div>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-neutral-200 p-6 space-y-6"
        >
          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* 1. Product Search */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              <Package className="w-4 h-4 inline mr-1" />
              Sélectionner un produit *
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                  if (!e.target.value) setSelectedProduct(null);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Rechercher un produit par nom ou SKU..."
                className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-neutral-900"
              />
              {showDropdown && searchQuery && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-xl z-10 overflow-hidden">
                  {searchResults.map((product) => (
                    <button
                      key={product.id}
                      onMouseDown={() => handleSelectProduct(product)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors text-left"
                    >
                      <div className="w-10 h-10 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <Package className="w-5 h-5 m-2.5 text-neutral-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {product.sku} · {product.price.toLocaleString()} HTG
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected product summary */}
            {selectedProduct && (
              <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-neutral-200">
                  {selectedProduct.images?.[0] ? (
                    <Image
                      src={selectedProduct.images[0]}
                      alt={selectedProduct.name}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <Package className="w-6 h-6 m-3 text-neutral-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-green-900">
                    {selectedProduct.name}
                  </p>
                  <p className="text-xs text-green-700">
                    Prix original:{" "}
                    <strong>
                      {selectedProduct.price.toLocaleString()} HTG
                    </strong>
                    {" · "}Stock: <strong>{selectedProduct.stock}</strong>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 2. Title */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Titre de l&apos;offre *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Ex: Vente Flash – Montre Luxe"
              className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-neutral-900"
            />
          </div>

          {/* 3. Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Prix promotionnel (HTG) *
              </label>
              <input
                type="number"
                value={formData.sale_price}
                onChange={(e) =>
                  setFormData({ ...formData, sale_price: e.target.value })
                }
                placeholder="0"
                min="0"
                className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-neutral-900"
              />
              {discount > 0 && (
                <p className="text-xs text-green-600 mt-1 font-medium">
                  Réduction: {discount}%
                </p>
              )}
              {formData.sale_price &&
                selectedProduct &&
                parseFloat(formData.sale_price) >= selectedProduct.price && (
                  <p className="text-xs text-red-600 mt-1">
                    Le prix promo doit être inférieur au prix original
                  </p>
                )}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                <ShoppingBag className="w-4 h-4 inline mr-1" />
                Quantité max à vendre
              </label>
              <input
                type="number"
                value={formData.quantity_limit}
                onChange={(e) =>
                  setFormData({ ...formData, quantity_limit: e.target.value })
                }
                placeholder="0 = sans limite"
                min="0"
                className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-neutral-900"
              />
              <p className="text-xs text-neutral-400 mt-1">0 = aucune limite</p>
            </div>
          </div>

          {/* 4. Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                <CalendarClock className="w-4 h-4 inline mr-1" />
                Date de début
              </label>
              <div className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-sm bg-neutral-50 text-neutral-500">
                Maintenant (automatique)
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                <CalendarClock className="w-4 h-4 inline mr-1" />
                Date de fin *
              </label>
              <input
                type="datetime-local"
                value={formData.ends_at}
                onChange={(e) =>
                  setFormData({ ...formData, ends_at: e.target.value })
                }
                min={new Date().toISOString().slice(0, 16)}
                className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-neutral-900"
              />
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => router.back()}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || createSale.isPending}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600"
          >
            {createSale.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Création...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Lancer l&apos;offre Flash
              </>
            )}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
