"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Megaphone,
  ChevronLeft,
  Loader2,
  Layout,
  Bell,
  Image as ImageIcon,
  LayoutDashboard,
  Clock,
  Link2,
  Palette,
  AlertCircle,
  Eye,
  Upload,
  Search,
  Package,
  X,
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { useCreateAnnouncement } from "@/hooks/useAnnouncements";
import { useProducts } from "@/hooks/useProducts";
import { uploadImage } from "@/lib/supabase";
import type { SupabaseProduct } from "@/data/types";
import { cn } from "@/lib/utils";

// ============================================================
// TYPE CONFIGURATION
// ============================================================
const ANNOUNCEMENT_TYPES = [
  {
    value: "hero_slide",
    placement: "hero",
    label: "Bannière Hero",
    icon: Layout,
    description: "Slide principal de la page d'accueil",
    color: "border-purple-300 bg-purple-50",
    iconColor: "text-purple-600",
    needsImage: true,
    needsButtonText: true,
    needsContent: true,
  },
  {
    value: "notification_bar",
    placement: "top_bar",
    label: "Barre de notification",
    icon: Bell,
    description: "Bande de texte en haut du site",
    color: "border-blue-300 bg-blue-50",
    iconColor: "text-blue-600",
    needsImage: false,
    needsButtonText: false,
    needsContent: true,
  },
  {
    value: "popup",
    placement: "popup",
    label: "Popup",
    icon: ImageIcon,
    description: "Fenêtre automatique à l'ouverture",
    color: "border-amber-300 bg-amber-50",
    iconColor: "text-amber-600",
    needsImage: true,
    needsButtonText: true,
    needsContent: true,
  },
  {
    value: "banner",
    placement: "sidebar",
    label: "Bannière / Autre",
    icon: LayoutDashboard,
    description: "Autre espace promotionnel",
    color: "border-neutral-300 bg-neutral-50",
    iconColor: "text-neutral-600",
    needsImage: true,
    needsButtonText: true,
    needsContent: true,
  },
] as const;

type AnnouncementTypeConfig = (typeof ANNOUNCEMENT_TYPES)[number];

// ============================================================
// IMAGE UPLOAD COMPONENT
// ============================================================
function ImageUploadZone({
  imageUrl,
  isUploading,
  onFileSelect,
  onClear,
}: {
  imageUrl: string | null;
  isUploading: boolean;
  onFileSelect: (file: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-1.5">
        <ImageIcon className="w-4 h-4 inline mr-1" />
        Image de l&apos;annonce
      </label>
      {imageUrl ? (
        <div className="relative rounded-xl overflow-hidden border border-neutral-200 h-40">
          <Image src={imageUrl} alt="Aperçu" fill className="object-cover" />
          <button
            onClick={onClear}
            className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="w-full h-40 border-2 border-dashed border-neutral-300 rounded-xl hover:border-neutral-500 transition-colors flex flex-col items-center justify-center gap-2 text-neutral-500 hover:text-neutral-700"
        >
          {isUploading ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : (
            <>
              <Upload className="w-8 h-8" />
              <p className="text-sm font-medium">Cliquer pour uploader</p>
              <p className="text-xs">PNG, JPG, WebP — Max 5MB</p>
            </>
          )}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
        }}
      />
    </div>
  );
}

// ============================================================
// PRODUCT SEARCH COMPONENT
// ============================================================
function ProductSearchField({
  products,
  selectedProduct,
  onSelect,
  onClear,
}: {
  products: SupabaseProduct[];
  selectedProduct: SupabaseProduct | null;
  onSelect: (p: SupabaseProduct) => void;
  onClear: () => void;
}) {
  const [query, setQuery] = useState(selectedProduct?.name || "");
  const [open, setOpen] = useState(false);

  const results = products
    .filter(
      (p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.sku?.toLowerCase().includes(query.toLowerCase()),
    )
    .slice(0, 6);

  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-1.5">
        <Package className="w-4 h-4 inline mr-1" />
        Lier à un produit{" "}
        <span className="text-neutral-400 font-normal">(optionnel)</span>
      </label>
      {selectedProduct ? (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="w-10 h-10 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-neutral-200">
            {selectedProduct.images?.[0] ? (
              <Image
                src={selectedProduct.images[0]}
                alt={selectedProduct.name}
                width={40}
                height={40}
                className="object-cover w-full h-full"
              />
            ) : (
              <Package className="w-5 h-5 m-2.5 text-neutral-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-900 truncate">
              {selectedProduct.name}
            </p>
            <p className="text-xs text-green-700">
              Lien:{" "}
              <code className="bg-white/60 px-1 rounded">
                /collection?search={selectedProduct.name}
              </code>
            </p>
          </div>
          <button
            onClick={onClear}
            className="text-neutral-400 hover:text-red-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 200)}
            placeholder="Rechercher un produit..."
            className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-neutral-900"
          />
          <AnimatePresence>
            {open && query && results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-xl shadow-xl z-20 overflow-hidden"
              >
                {results.map((product) => (
                  <button
                    key={product.id}
                    onMouseDown={() => {
                      onSelect(product);
                      setQuery(product.name);
                      setOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 bg-neutral-100 rounded overflow-hidden flex-shrink-0">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      ) : (
                        <Package className="w-4 h-4 m-2 text-neutral-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-neutral-400">{product.sku}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
      {!selectedProduct && (
        <p className="text-xs text-neutral-400 mt-1">
          Si aucun produit sélectionné, saisissez un lien personnalisé
          ci-dessous
        </p>
      )}
    </div>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function AdminNewAnnouncementPage() {
  const router = useRouter();
  const createAnnouncement = useCreateAnnouncement();
  const { data: products = [] } = useProducts({ status: "active" });

  const [selectedType, setSelectedType] =
    useState<AnnouncementTypeConfig | null>(null);
  const [selectedProduct, setSelectedProduct] =
    useState<SupabaseProduct | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    link_text: "",
    custom_link_url: "",
    is_active: true,
    show_on_every_visit: false,
    display_delay_seconds: 0,
    ends_at: "",
    background_color: "#1a1a1a",
    text_color: "#ffffff",
    priority: 0,
  });
  const [error, setError] = useState<string | null>(null);

  // Derived: link URL is either auto from product or custom
  const linkUrl = selectedProduct
    ? `/collection?search=${encodeURIComponent(selectedProduct.name)}`
    : formData.custom_link_url;

  const handleImageUpload = useCallback(async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("L'image ne doit pas dépasser 5MB");
      return;
    }
    setIsUploading(true);
    setUploadError(null);
    try {
      const ext = file.name.split(".").pop();
      const path = `announcements/${Date.now()}.${ext}`;
      const url = await uploadImage("products-images", path, file);
      if (!url) throw new Error("Échec de l'upload");
      setImageUrl(url);
    } catch (e: any) {
      setUploadError(e?.message || "Erreur lors de l'upload");
    } finally {
      setIsUploading(false);
    }
  }, []);

  const canSubmit =
    selectedType &&
    formData.title.trim() &&
    (!selectedType.needsImage || imageUrl);

  const handleSubmit = async () => {
    if (!canSubmit || !selectedType) return;
    setError(null);
    try {
      await createAnnouncement.mutateAsync({
        title: formData.title,
        content: formData.content || undefined,
        type: selectedType.value as any,
        placement: selectedType.placement as any,
        image_url: imageUrl || undefined,
        link_url: linkUrl || undefined,
        link_text: formData.link_text || undefined,
        is_active: formData.is_active,
        show_on_every_visit: formData.show_on_every_visit,
        display_delay_seconds: formData.display_delay_seconds,
        ends_at: formData.ends_at
          ? new Date(formData.ends_at).toISOString()
          : undefined,
        background_color: formData.background_color,
        text_color: formData.text_color,
        priority: formData.priority,
      });
      router.push("/admin/annonces");
    } catch (err: any) {
      setError(err?.message || "Une erreur est survenue");
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> Retour
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-neutral-900 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-blue-500" />
              Nouvelle Annonce
            </h1>
            <p className="text-neutral-500 text-xs">
              Bannière, popup, barre de notification
            </p>
          </div>
        </div>

        {/* Global error */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* ── STEP 1: Type ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-neutral-200 p-5"
        >
          <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide mb-4">
            1 · Type d&apos;annonce
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {ANNOUNCEMENT_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedType?.value === type.value;
              return (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type)}
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all",
                    isSelected
                      ? type.color
                      : "border-neutral-200 hover:border-neutral-300",
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 mt-0.5 flex-shrink-0",
                      isSelected ? type.iconColor : "text-neutral-500",
                    )}
                  />
                  <div>
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        isSelected ? type.iconColor : "text-neutral-900",
                      )}
                    >
                      {type.label}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {type.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ── STEP 2: Content ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4"
        >
          <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide">
            2 · Contenu
          </h2>

          {/* Image upload — only for types that need it */}
          {selectedType?.needsImage && (
            <>
              {uploadError && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {uploadError}
                </p>
              )}
              <ImageUploadZone
                imageUrl={imageUrl}
                isUploading={isUploading}
                onFileSelect={handleImageUpload}
                onClear={() => setImageUrl(null)}
              />
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Titre *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder={
                selectedType?.value === "notification_bar"
                  ? "Ex: Livraison gratuite pour toute commande +10 000 HTG"
                  : "Ex: Soldes d'été – jusqu'à 40% de réduction"
              }
              className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-neutral-900"
            />
          </div>

          {selectedType?.needsContent && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Description
              </label>
              <textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                rows={2}
                placeholder="Texte secondaire de l'annonce (optionnel)..."
                className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-neutral-900 resize-none"
              />
            </div>
          )}

          {/* Product selector */}
          <ProductSearchField
            products={products}
            selectedProduct={selectedProduct}
            onSelect={(p) => {
              setSelectedProduct(p);
              // Auto-use product image if no image yet and type needs one
              if (!imageUrl && selectedType?.needsImage && p.images?.[0]) {
                setImageUrl(p.images[0]);
              }
            }}
            onClear={() => setSelectedProduct(null)}
          />

          {/* Custom link — only shown when no product selected */}
          {!selectedProduct && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                <Link2 className="w-4 h-4 inline mr-1" />
                Lien personnalisé
              </label>
              <input
                type="text"
                value={formData.custom_link_url}
                onChange={(e) =>
                  setFormData({ ...formData, custom_link_url: e.target.value })
                }
                placeholder="/collection ou https://..."
                className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-neutral-900"
              />
            </div>
          )}

          {/* Button text — only for types that need it */}
          {selectedType?.needsButtonText && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Texte du bouton / CTA
              </label>
              <input
                type="text"
                value={formData.link_text}
                onChange={(e) =>
                  setFormData({ ...formData, link_text: e.target.value })
                }
                placeholder={
                  selectedProduct
                    ? `Voir ${selectedProduct.name}`
                    : "Ex: Découvrir la collection"
                }
                className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-neutral-900"
              />
            </div>
          )}
        </motion.div>

        {/* ── STEP 3: Display Settings ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4"
        >
          <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide">
            3 · Affichage & Couleurs
          </h2>

          {/* Active toggle */}
          <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-neutral-900">
                Activer immédiatement
              </p>
              <p className="text-xs text-neutral-500">
                L&apos;annonce sera visible dès la sauvegarde
              </p>
            </div>
            <button
              onClick={() =>
                setFormData({ ...formData, is_active: !formData.is_active })
              }
              className={cn(
                "w-10 h-6 rounded-full transition-colors relative",
                formData.is_active ? "bg-neutral-900" : "bg-neutral-300",
              )}
            >
              <span
                className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all",
                  formData.is_active ? "left-5" : "left-1",
                )}
              />
            </button>
          </div>

          {/* Popup-specific settings */}
          {selectedType?.value === "popup" && (
            <>
              <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    Afficher à chaque visite
                  </p>
                  <p className="text-xs text-neutral-500">
                    Sinon: une seule fois par session
                  </p>
                </div>
                <button
                  onClick={() =>
                    setFormData({
                      ...formData,
                      show_on_every_visit: !formData.show_on_every_visit,
                    })
                  }
                  className={cn(
                    "w-10 h-6 rounded-full transition-colors relative",
                    formData.show_on_every_visit
                      ? "bg-neutral-900"
                      : "bg-neutral-300",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all",
                      formData.show_on_every_visit ? "left-5" : "left-1",
                    )}
                  />
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Délai avant affichage (secondes)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.display_delay_seconds}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      display_delay_seconds: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-neutral-900"
                />
                <p className="text-xs text-neutral-400 mt-1">
                  0 = s&apos;affiche immédiatement à l&apos;ouverture
                </p>
              </div>
            </>
          )}

          {/* Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                <Palette className="w-4 h-4 inline mr-1" /> Couleur de fond
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.background_color}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      background_color: e.target.value,
                    })
                  }
                  className="w-12 h-11 border border-neutral-200 rounded-lg cursor-pointer p-1"
                />
                <input
                  type="text"
                  value={formData.background_color}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      background_color: e.target.value,
                    })
                  }
                  className="flex-1 border border-neutral-200 rounded-lg px-3 text-sm focus:outline-none focus:border-neutral-900"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Couleur du texte
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.text_color}
                  onChange={(e) =>
                    setFormData({ ...formData, text_color: e.target.value })
                  }
                  className="w-12 h-11 border border-neutral-200 rounded-lg cursor-pointer p-1"
                />
                <input
                  type="text"
                  value={formData.text_color}
                  onChange={(e) =>
                    setFormData({ ...formData, text_color: e.target.value })
                  }
                  className="flex-1 border border-neutral-200 rounded-lg px-3 text-sm focus:outline-none focus:border-neutral-900"
                />
              </div>
            </div>
          </div>

          {/* Dates & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Date de fin (optionnel)
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
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Priorité
              </label>
              <input
                type="number"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-neutral-900"
              />
              <p className="text-xs text-neutral-400 mt-1">
                Plus élevé = affiché en premier
              </p>
            </div>
          </div>

          {/* Live Preview */}
          {formData.title && selectedType && (
            <div>
              <p className="text-sm font-medium text-neutral-700 mb-2 flex items-center gap-1">
                <Eye className="w-4 h-4" /> Aperçu
              </p>
              <div
                className="rounded-xl overflow-hidden"
                style={{ backgroundColor: formData.background_color }}
              >
                {imageUrl && selectedType.needsImage && (
                  <div className="relative h-32 w-full">
                    <Image
                      src={imageUrl}
                      alt="preview"
                      fill
                      className="object-cover opacity-60"
                    />
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
                      style={{ color: formData.text_color }}
                    >
                      <p className="font-bold text-base drop-shadow">
                        {formData.title}
                      </p>
                      {formData.content && (
                        <p className="text-xs mt-1 drop-shadow">
                          {formData.content}
                        </p>
                      )}
                      {formData.link_text && (
                        <span className="mt-2 text-xs border border-current px-3 py-1 rounded-full">
                          {formData.link_text}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {!imageUrl && (
                  <div
                    className="px-4 py-3 flex items-center justify-between"
                    style={{ color: formData.text_color }}
                  >
                    <p className="text-sm font-medium">{formData.title}</p>
                    {formData.link_text && (
                      <span className="text-xs underline opacity-90 ml-4 whitespace-nowrap">
                        {formData.link_text}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pb-6">
          <Button variant="outline" onClick={() => router.back()}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || createAnnouncement.isPending || isUploading}
            className="flex items-center gap-2"
          >
            {createAnnouncement.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Publication...
              </>
            ) : (
              <>
                <Megaphone className="w-4 h-4" />
                Publier l&apos;annonce
              </>
            )}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
