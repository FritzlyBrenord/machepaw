"use client";

import { useState } from "react";
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
import { SellerWorkspaceShell } from "@/components/SellerWorkspaceShell";
import { Button } from "@/components/ui/button";
import { useSellerProductsQuery } from "@/hooks/useSellerWorkspace";
import { useCreateSellerFlashSale } from "@/hooks/usePromotions";
import type { SupabaseProduct } from "@/data/types";

export default function SellerNewFlashSalePage() {
  const router = useRouter();
  const createSale = useCreateSellerFlashSale();
  const { data: products = [] } = useSellerProductsQuery();
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

  const activeProducts = products.filter(
    (product) => product.status === "active",
  );

  const searchResults = activeProducts
    .filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .slice(0, 6);

  const handleSelectProduct = (product: SupabaseProduct) => {
    setSelectedProduct(product);
    setSearchQuery(product.name);
    setShowDropdown(false);
    setFormData((prev) => ({
      ...prev,
      title: `Vente Flash – ${product.name}`,
      sale_price: String(Math.round(product.price * 0.8)),
    }));
  };

  const discount =
    selectedProduct && formData.sale_price
      ? Math.round(
          (1 - parseFloat(formData.sale_price) / selectedProduct.price) * 100,
        )
      : 0;

  const canSubmit =
    Boolean(selectedProduct) &&
    Boolean(formData.title.trim()) &&
    Boolean(formData.sale_price) &&
    parseFloat(formData.sale_price) > 0 &&
    Boolean(
      selectedProduct &&
      parseFloat(formData.sale_price) < selectedProduct.price,
    ) &&
    Boolean(formData.ends_at);

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
          ? parseInt(formData.quantity_limit, 10)
          : 0,
      });
      router.push("/vendeur/promotions");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Une erreur est survenue",
      );
    }
  };
  return (
    <SellerWorkspaceShell
      title="Nouvelle vente flash"
      description="Créez une offre flash sur l'un de vos produits actifs. L'offre démarre immédiatement."
      actions={
        <Button
          variant="outline"
          onClick={() => router.push("/vendeur/promotions")}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Retour
        </Button>
      }
    >
      <div className="mx-auto max-w-2xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 rounded-xl border border-neutral-200 bg-white p-6"
        >
          {error ? (
            <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          ) : null}

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              <Package className="mr-1 inline h-4 w-4" />
              Sélectionner un produit *
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setShowDropdown(true);
                  if (!event.target.value) setSelectedProduct(null);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Rechercher un produit actif par nom ou SKU..."
                className="w-full rounded-lg border border-neutral-200 py-3 pl-10 pr-4 text-sm focus:border-neutral-900 focus:outline-none"
              />

              {showDropdown && searchQuery && searchResults.length > 0 ? (
                <div className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-xl">
                  {searchResults.map((product) => (
                    <button
                      key={product.id}
                      onMouseDown={() => handleSelectProduct(product)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-neutral-50"
                    >
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package className="m-2.5 h-5 w-5 text-neutral-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-neutral-900">
                          {product.name}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {product.sku} · {product.price.toLocaleString()} HTG
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {selectedProduct ? (
              <div className="mt-3 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-white">
                  {selectedProduct.images?.[0] ? (
                    <Image
                      src={selectedProduct.images[0]}
                      alt={selectedProduct.name}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Package className="m-3 h-6 w-6 text-neutral-400" />
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
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Titre de l'offre *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(event) =>
                setFormData({ ...formData, title: event.target.value })
              }
              placeholder="Ex: Vente Flash – Montre Luxe"
              className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                <Tag className="mr-1 inline h-4 w-4" />
                Prix promotionnel (HTG) *
              </label>
              <input
                type="number"
                value={formData.sale_price}
                onChange={(event) =>
                  setFormData({ ...formData, sale_price: event.target.value })
                }
                placeholder="0"
                min="0"
                className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none"
              />
              {discount > 0 ? (
                <p className="mt-1 text-xs font-medium text-green-600">
                  Réduction: {discount}%
                </p>
              ) : null}
              {formData.sale_price &&
              selectedProduct &&
              parseFloat(formData.sale_price) >= selectedProduct.price ? (
                <p className="mt-1 text-xs text-red-600">
                  Le prix promo doit être inférieur au prix original
                </p>
              ) : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                <ShoppingBag className="mr-1 inline h-4 w-4" />
                Quantité max à vendre
              </label>
              <input
                type="number"
                value={formData.quantity_limit}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    quantity_limit: event.target.value,
                  })
                }
                placeholder="0 = sans limite"
                min="0"
                className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none"
              />
              <p className="mt-1 text-xs text-neutral-400">0 = aucune limite</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                <CalendarClock className="mr-1 inline h-4 w-4" />
                Date de début
              </label>
              <div className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-500">
                Maintenant (automatique)
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                <CalendarClock className="mr-1 inline h-4 w-4" />
                Date de fin *
              </label>
              <input
                type="datetime-local"
                value={formData.ends_at}
                onChange={(event) =>
                  setFormData({ ...formData, ends_at: event.target.value })
                }
                min={new Date().toISOString().slice(0, 16)}
                className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none"
              />
            </div>
          </div>
        </motion.div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/vendeur/promotions")}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || createSale.isPending}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600"
          >
            {createSale.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Création...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Lancer l'offre flash
              </>
            )}
          </Button>
        </div>
      </div>
    </SellerWorkspaceShell>
  );
}
