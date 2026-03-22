"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Copy, ExternalLink, Share2, Store } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type SellerStoreLinkCardProps = {
  businessName?: string;
  storeSlug?: string;
  className?: string;
};

function getStorePath(storeSlug?: string) {
  return storeSlug ? `/boutique/${storeSlug}` : "";
}

function getStoreUrl(storeSlug?: string) {
  const storePath = getStorePath(storeSlug);

  if (!storePath) {
    return "";
  }

  if (typeof window === "undefined") {
    return storePath;
  }

  return new URL(storePath, window.location.origin).toString();
}

export function SellerStoreLinkCard({
  businessName,
  storeSlug,
  className,
}: SellerStoreLinkCardProps) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const storePath = getStorePath(storeSlug);
  const hasPublicStore = Boolean(storeSlug);

  const isAbortLikeError = (error: unknown) => {
    if (!error || typeof error !== "object") {
      return false;
    }

    const candidate = error as { name?: string; message?: string };
    const message = (candidate.message || "").toLowerCase();

    return (
      candidate.name === "AbortError" ||
      message.includes("lock broken by another request") ||
      message.includes("share canceled") ||
      message.includes("share cancelled")
    );
  };

  const handleCopy = async () => {
    const storeUrl = getStoreUrl(storeSlug);

    if (!storeUrl) {
      setFeedback("Ajoutez d'abord l'adresse publique de la boutique dans les parametres.");
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(storeUrl);
      } else if (typeof window !== "undefined") {
        window.prompt("Copiez le lien de votre boutique :", storeUrl);
      }

      setFeedback("Lien de boutique copie.");
    } catch {
      setFeedback("Impossible de copier automatiquement le lien pour le moment.");
    }
  };

  const handleShare = async () => {
    if (isSharing) {
      return;
    }

    const storeUrl = getStoreUrl(storeSlug);

    if (!storeUrl) {
      setFeedback("Ajoutez d'abord l'adresse publique de la boutique dans les parametres.");
      return;
    }

    try {
      setIsSharing(true);

      if (navigator.share) {
        await navigator.share({
          title: businessName ? `Boutique ${businessName}` : "Ma boutique LUXE",
          text: businessName
            ? `Decouvrez la boutique ${businessName} sur LUXE.`
            : "Decouvrez ma boutique sur LUXE.",
          url: storeUrl,
        });
        setFeedback("Partage ouvert dans les applications disponibles.");
        return;
      }

      await handleCopy();
      setFeedback("Partage natif indisponible ici, le lien a ete copie.");
    } catch (error) {
      if (isAbortLikeError(error)) {
        return;
      }

      setFeedback("Impossible d'ouvrir le partage pour le moment.");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-[2rem] border border-neutral-200 bg-gradient-to-br from-white via-neutral-50 to-amber-50/60 p-5 shadow-sm",
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-8 top-0 h-28 w-28 rounded-full bg-amber-200/30 blur-3xl" />
      <div className="pointer-events-none absolute left-10 top-10 h-20 w-20 rounded-full bg-neutral-900/5 blur-2xl" />

      <div className="relative flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl bg-neutral-900 p-3 text-white shadow-lg shadow-neutral-900/10">
              <Store className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                Lien direct boutique
              </p>
              <h2 className="mt-1 text-lg font-semibold text-neutral-900">
                Partagez votre boutique facilement
              </h2>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {businessName ? (
              <span className="inline-flex items-center rounded-full border border-neutral-200 bg-white/80 px-3 py-1 text-xs font-medium text-neutral-700">
                {businessName}
              </span>
            ) : null}
            <span
              className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
                hasPublicStore
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700",
              )}
            >
              {hasPublicStore ? "Boutique publique active" : "Lien public a configurer"}
            </span>
          </div>

          <p className="mt-4 text-sm leading-6 text-neutral-500">
            Ouvrez, copiez ou partagez votre boutique avec un lien propre et direct.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-white/80 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
            <span className="text-[11px] uppercase tracking-[0.18em] text-neutral-400">
              Adresse publique
            </span>
            <p className="min-w-0 flex-1 truncate font-mono text-sm text-neutral-900">
              {storePath || "Configurez le slug public dans les parametres vendeur."}
            </p>
          </div>

          {feedback ? (
            <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              {feedback}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/80 bg-white/70 p-2 shadow-sm backdrop-blur xl:justify-end">
          <Link
            href={storePath || "/vendeur/parametres"}
            target={storePath ? "_blank" : undefined}
            className="block"
          >
            <Button variant="outline" className="min-w-[118px]">
              <ExternalLink className="mr-2 h-4 w-4" />
              Ouvrir
            </Button>
          </Link>

          <Button variant="outline" onClick={() => void handleCopy()} className="min-w-[118px]">
            <Copy className="mr-2 h-4 w-4" />
            Copier
          </Button>

          <Button
            onClick={() => void handleShare()}
            className="min-w-[118px]"
            disabled={isSharing}
          >
            <Share2 className="mr-2 h-4 w-4" />
            {isSharing ? "Ouverture..." : "Partager"}
          </Button>
        </div>
      </div>
    </div>
  );
}
