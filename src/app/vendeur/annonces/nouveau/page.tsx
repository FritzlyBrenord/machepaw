"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  AlertCircle,
  Bell,
  ChevronLeft,
  Clock,
  Image as ImageIcon,
  Layout,
  Link2,
  Loader2,
  Megaphone,
  Package,
  Palette,
  Search,
  Upload,
  X,
} from "lucide-react";
import { SellerWorkspaceShell } from "@/components/SellerWorkspaceShell";
import { Button } from "@/components/ui/button";
import {
  SELLER_WEEKLY_ANNOUNCEMENT_LIMIT,
  useCreateSellerAnnouncement,
} from "@/hooks/useAnnouncements";
import { useSellerProductsQuery } from "@/hooks/useSellerWorkspace";
import { uploadImage } from "@/lib/supabase";
import type { SupabaseProduct } from "@/data/types";
import { cn } from "@/lib/utils";

const ANNOUNCEMENT_TYPES = [
  {
    value: "hero_slide",
    placement: "hero",
    label: "Banniere hero",
    icon: Layout,
    description: "Slide principal de l'accueil",
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
    description: "Message court en haut du site",
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
    description: "Fenetre qui s'ouvre automatiquement",
    color: "border-amber-300 bg-amber-50",
    iconColor: "text-amber-600",
    needsImage: true,
    needsButtonText: true,
    needsContent: true,
  },
] as const;

type AnnouncementTypeConfig = (typeof ANNOUNCEMENT_TYPES)[number];

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
      <label className="mb-1.5 block text-sm font-medium text-neutral-700">
        <ImageIcon className="mr-1 inline h-4 w-4" />
        Image de l'annonce
      </label>
      {imageUrl ? (
        <div className="relative h-40 overflow-hidden rounded-xl border border-neutral-200">
          <Image src={imageUrl} alt="Apercu" fill className="object-cover" />
          <button
            onClick={onClear}
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-black/80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-300 text-neutral-500 transition-colors hover:border-neutral-500 hover:text-neutral-700"
        >
          {isUploading ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <>
              <Upload className="h-8 w-8" />
              <p className="text-sm font-medium">Cliquer pour uploader</p>
              <p className="text-xs">PNG, JPG, WebP - Max 5MB</p>
            </>
          )}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFileSelect(file);
        }}
      />
    </div>
  );
}

function ProductSearchField({
  products,
  selectedProduct,
  onSelect,
  onClear,
}: {
  products: SupabaseProduct[];
  selectedProduct: SupabaseProduct | null;
  onSelect: (product: SupabaseProduct) => void;
  onClear: () => void;
}) {
  const [query, setQuery] = useState(selectedProduct?.name || "");
  const [open, setOpen] = useState(false);

  const results = products
    .filter(
      (product) =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.sku?.toLowerCase().includes(query.toLowerCase()),
    )
    .slice(0, 6);

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-neutral-700">
        <Package className="mr-1 inline h-4 w-4" />
        Lier a un produit{" "}
        <span className="font-normal text-neutral-400">(optionnel)</span>
      </label>
      {selectedProduct ? (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-white">
            {selectedProduct.images?.[0] ? (
              <Image
                src={selectedProduct.images[0]}
                alt={selectedProduct.name}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            ) : (
              <Package className="m-2.5 h-5 w-5 text-neutral-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-green-900">
              {selectedProduct.name}
            </p>
            <p className="text-xs text-green-700">
              Lien:{" "}
              <code className="rounded bg-white/60 px-1">
                /collection?search={selectedProduct.name}
              </code>
            </p>
          </div>
          <button
            onClick={onClear}
            className="text-neutral-400 transition-colors hover:text-red-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 200)}
            placeholder="Rechercher un produit..."
            className="w-full rounded-lg border border-neutral-200 py-3 pl-10 pr-4 text-sm focus:border-neutral-900 focus:outline-none"
          />
          <AnimatePresence>
            {open && query && results.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl"
              >
                {results.map((product) => (
                  <button
                    key={product.id}
                    onMouseDown={() => {
                      onSelect(product);
                      setQuery(product.name);
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-neutral-50"
                  >
                    <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded bg-neutral-100">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          width={32}
                          height={32}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package className="m-2 h-4 w-4 text-neutral-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-neutral-900">
                        {product.name}
                      </p>
                      <p className="text-xs text-neutral-400">{product.sku}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      )}
      {!selectedProduct ? (
        <p className="mt-1 text-xs text-neutral-400">
          Si aucun produit n'est selectionne, vous pouvez saisir un lien
          personnalise.
        </p>
      ) : null}
    </div>
  );
}

export default function SellerNewAnnouncementPage() {
  const router = useRouter();
  const createAnnouncement = useCreateSellerAnnouncement();
  const { data: products = [] } = useSellerProductsQuery();

  const [selectedType, setSelectedType] =
    useState<AnnouncementTypeConfig | null>(null);
  const [selectedProduct, setSelectedProduct] =
    useState<SupabaseProduct | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const activeProducts = products.filter(
    (product) => product.status === "active",
  );

  const linkUrl = selectedProduct
    ? `/collection?search=${encodeURIComponent(selectedProduct.name)}`
    : formData.custom_link_url;

  const handleImageUpload = useCallback(async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("L'image ne doit pas depasser 5MB");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const ext = file.name.split(".").pop();
      const path = `announcements/${Date.now()}.${ext}`;
      const url = await uploadImage("products-images", path, file);
      if (!url) throw new Error("Echec de l'upload");
      setImageUrl(url);
    } catch (uploadingError) {
      setUploadError(
        uploadingError instanceof Error
          ? uploadingError.message
          : "Erreur lors de l'upload",
      );
    } finally {
      setIsUploading(false);
    }
  }, []);

  const canSubmit =
    Boolean(selectedType) &&
    Boolean(formData.title.trim()) &&
    (!selectedType?.needsImage || Boolean(imageUrl));

  const handleSubmit = async () => {
    if (!canSubmit || !selectedType) return;

    setError(null);

    try {
      await createAnnouncement.mutateAsync({
        title: formData.title,
        content: formData.content || undefined,
        type: selectedType.value,
        placement: selectedType.placement,
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
      router.push("/vendeur/annonces");
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
      title="Nouvelle annonce"
      description={`Publiez une annonce vendeur avec controle automatique. Quota: ${SELLER_WEEKLY_ANNOUNCEMENT_LIMIT} annonces par 7 jours.`}
      actions={
        <Button
          variant="outline"
          onClick={() => router.push("/vendeur/annonces")}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Retour
        </Button>
      }
    >
      <div className="mx-auto max-w-2xl space-y-5">
        {error ? (
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        ) : null}

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          Le systeme limite automatiquement les annonces vendeur pour proteger
          l'accueil: un seul emplacement actif par type et un quota
          hebdomadaire.
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-neutral-200 bg-white p-5"
        >
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-900">
            1 · Type d'annonce
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
                    "flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all",
                    isSelected
                      ? type.color
                      : "border-neutral-200 hover:border-neutral-300",
                  )}
                >
                  <Icon
                    className={cn(
                      "mt-0.5 h-5 w-5 flex-shrink-0",
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
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {type.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-4 rounded-xl border border-neutral-200 bg-white p-5"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-900">
            2 · Contenu
          </h2>

          {selectedType?.needsImage ? (
            <>
              {uploadError ? (
                <p className="flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5" /> {uploadError}
                </p>
              ) : null}
              <ImageUploadZone
                imageUrl={imageUrl}
                isUploading={isUploading}
                onFileSelect={handleImageUpload}
                onClear={() => setImageUrl(null)}
              />
            </>
          ) : null}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              Titre *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(event) =>
                setFormData({ ...formData, title: event.target.value })
              }
              placeholder="Ex: Nouvelle collection disponible"
              className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </div>

          {selectedType?.needsContent ? (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Description
              </label>
              <textarea
                value={formData.content}
                onChange={(event) =>
                  setFormData({ ...formData, content: event.target.value })
                }
                rows={2}
                placeholder="Texte secondaire de l'annonce..."
                className="w-full resize-none rounded-lg border border-neutral-200 px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none"
              />
            </div>
          ) : null}

          <ProductSearchField
            products={activeProducts}
            selectedProduct={selectedProduct}
            onSelect={(product) => {
              setSelectedProduct(product);
              if (
                !imageUrl &&
                selectedType?.needsImage &&
                product.images?.[0]
              ) {
                setImageUrl(product.images[0]);
              }
            }}
            onClear={() => setSelectedProduct(null)}
          />

          {!selectedProduct ? (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                <Link2 className="mr-1 inline h-4 w-4" />
                Lien personnalise
              </label>
              <input
                type="text"
                value={formData.custom_link_url}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    custom_link_url: event.target.value,
                  })
                }
                placeholder="/collection ou https://..."
                className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none"
              />
            </div>
          ) : null}

          {selectedType?.needsButtonText ? (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Texte du bouton / CTA
              </label>
              <input
                type="text"
                value={formData.link_text}
                onChange={(event) =>
                  setFormData({ ...formData, link_text: event.target.value })
                }
                placeholder={
                  selectedProduct
                    ? `Voir ${selectedProduct.name}`
                    : "Ex: Decouvrir"
                }
                className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none"
              />
            </div>
          ) : null}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4 rounded-xl border border-neutral-200 bg-white p-5"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-900">
            3 · Affichage & couleurs
          </h2>

          <div className="flex items-center justify-between rounded-lg bg-neutral-50 p-3">
            <div>
              <p className="text-sm font-medium text-neutral-900">
                Activer immediatement
              </p>
              <p className="text-xs text-neutral-500">
                Votre annonce sera visible des la sauvegarde si elle passe les
                limites automatiques.
              </p>
            </div>
            <button
              onClick={() =>
                setFormData({ ...formData, is_active: !formData.is_active })
              }
              className={cn(
                "relative h-6 w-10 rounded-full transition-colors",
                formData.is_active ? "bg-neutral-900" : "bg-neutral-300",
              )}
            >
              <span
                className={cn(
                  "absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all",
                  formData.is_active ? "left-5" : "left-1",
                )}
              />
            </button>
          </div>

          {selectedType?.value === "popup" ? (
            <>
              <div className="flex items-center justify-between rounded-lg bg-neutral-50 p-3">
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    Afficher a chaque visite
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
                    "relative h-6 w-10 rounded-full transition-colors",
                    formData.show_on_every_visit
                      ? "bg-neutral-900"
                      : "bg-neutral-300",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all",
                      formData.show_on_every_visit ? "left-5" : "left-1",
                    )}
                  />
                </button>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  <Clock className="mr-1 inline h-4 w-4" />
                  Delai avant affichage (secondes)
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={formData.display_delay_seconds}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      display_delay_seconds:
                        parseInt(event.target.value, 10) || 0,
                    })
                  }
                  className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none"
                />
                <p className="mt-1 text-xs text-neutral-400">
                  0 = affichage immediat
                </p>
              </div>
            </>
          ) : null}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                <Palette className="mr-1 inline h-4 w-4" />
                Couleur de fond
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.background_color}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      background_color: event.target.value,
                    })
                  }
                  className="h-11 w-12 cursor-pointer rounded-lg border border-neutral-200 p-1"
                />
                <input
                  type="text"
                  value={formData.background_color}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      background_color: event.target.value,
                    })
                  }
                  className="flex-1 rounded-lg border border-neutral-200 px-3 text-sm focus:border-neutral-900 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Couleur du texte
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.text_color}
                  onChange={(event) =>
                    setFormData({ ...formData, text_color: event.target.value })
                  }
                  className="h-11 w-12 cursor-pointer rounded-lg border border-neutral-200 p-1"
                />
                <input
                  type="text"
                  value={formData.text_color}
                  onChange={(event) =>
                    setFormData({ ...formData, text_color: event.target.value })
                  }
                  className="flex-1 rounded-lg border border-neutral-200 px-3 text-sm focus:border-neutral-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Date de fin (optionnel)
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
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Priorite vendeur
              </label>
              <input
                type="number"
                min="0"
                max="5"
                value={formData.priority}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    priority: parseInt(event.target.value, 10) || 0,
                  })
                }
                className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none"
              />
              <p className="mt-1 text-xs text-neutral-400">
                Le systeme vendeur limite automatiquement la priorite.
              </p>
            </div>
          </div>

          {formData.title && selectedType ? (
            <div>
              <p className="mb-2 flex items-center gap-1 text-sm font-medium text-neutral-700">
                <Megaphone className="h-4 w-4" /> Previsualisation
              </p>
              <div
                className="overflow-hidden rounded-xl"
                style={{ backgroundColor: formData.background_color }}
              >
                {imageUrl && selectedType.needsImage ? (
                  <div className="relative h-32 w-full">
                    <Image
                      src={imageUrl}
                      alt="preview"
                      fill
                      className="object-cover opacity-60"
                    />
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center"
                      style={{ color: formData.text_color }}
                    >
                      <p className="text-base font-bold drop-shadow">
                        {formData.title}
                      </p>
                      {formData.content ? (
                        <p className="mt-1 text-xs drop-shadow">
                          {formData.content}
                        </p>
                      ) : null}
                      {formData.link_text ? (
                        <span className="mt-2 rounded-full border border-current px-3 py-1 text-xs">
                          {formData.link_text}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div
                    className="flex items-center justify-between px-4 py-3"
                    style={{ color: formData.text_color }}
                  >
                    <p className="text-sm font-medium">{formData.title}</p>
                    {formData.link_text ? (
                      <span className="ml-4 whitespace-nowrap text-xs underline opacity-90">
                        {formData.link_text}
                      </span>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </motion.div>

        <div className="flex justify-end gap-3 pb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/vendeur/annonces")}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || createAnnouncement.isPending || isUploading}
            className="flex items-center gap-2"
          >
            {createAnnouncement.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Publication...
              </>
            ) : (
              <>
                <Megaphone className="h-4 w-4" />
                Publier l'annonce
              </>
            )}
          </Button>
        </div>
      </div>
    </SellerWorkspaceShell>
  );
}
