"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Plus,
  Clock,
  Package,
  X,
  Pause,
  Play,
  CalendarClock,
  Loader2,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { SellerWorkspaceShell } from "@/components/SellerWorkspaceShell";
import { Button } from "@/components/ui/button";
import {
  useSellerFlashSales,
  useUpdateSellerFlashSale,
  useDeleteSellerFlashSale,
  getTimeRemaining,
  formatCountdown,
  type FlashSale,
} from "@/hooks/usePromotions";
import { cn } from "@/lib/utils";

function Countdown({ endsAt, status }: { endsAt: string; status: string }) {
  const [seconds, setSeconds] = useState(getTimeRemaining(endsAt));

  useEffect(() => {
    if (status !== "active") return;
    const interval = setInterval(() => {
      setSeconds(getTimeRemaining(endsAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [endsAt, status]);

  const isUrgent = seconds < 3600 && seconds > 0;
  const isExpired = seconds <= 0;

  if (isExpired || status === "ended") {
    return (
      <span className="rounded-lg bg-red-50 px-2 py-1 text-xs font-bold text-red-600">
        Terminée
      </span>
    );
  }

  if (status === "paused") {
    return (
      <span className="rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold text-amber-600">
        En pause
      </span>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-sm font-bold",
        isUrgent
          ? "animate-pulse bg-red-50 text-red-600"
          : "bg-green-50 text-green-700",
      )}
    >
      <Clock className="h-4 w-4" />
      {formatCountdown(seconds)}
    </div>
  );
}

function StockBar({ sold, limit }: { sold: number; limit: number }) {
  if (limit === 0) {
    return (
      <span className="text-xs text-neutral-500">
        {sold} vendu(s) · Sans limite
      </span>
    );
  }

  const pct = Math.min(100, Math.round((sold / limit) * 100));

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="font-medium text-neutral-700">
          {sold} / {limit} vendus
        </span>
        <span
          className={cn(
            "font-bold",
            pct >= 80 ? "text-red-600" : "text-neutral-600",
          )}
        >
          {pct}%
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-neutral-200">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            pct >= 80
              ? "bg-red-500"
              : pct >= 50
                ? "bg-amber-500"
                : "bg-green-500",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ExtendModal({
  sale,
  onClose,
  onExtend,
}: {
  sale: FlashSale;
  onClose: () => void;
  onExtend: (newEndsAt: string) => void;
}) {
  const [newDate, setNewDate] = useState(
    new Date(new Date(sale.ends_at).getTime() + 3600000)
      .toISOString()
      .slice(0, 16),
  );

  return (
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
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <CalendarClock className="h-5 w-5 text-blue-600" />
            Prolonger l'offre
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-neutral-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-4 text-sm text-neutral-500">
          Nouvelle date de fin pour <strong>{sale.title}</strong>
        </p>
        <input
          type="datetime-local"
          value={newDate}
          onChange={(event) => setNewDate(event.target.value)}
          min={new Date().toISOString().slice(0, 16)}
          className="mb-6 w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none"
        />
        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={onClose}>
            Annuler
          </Button>
          <Button
            fullWidth
            onClick={() => {
              if (newDate) onExtend(new Date(newDate).toISOString());
            }}
          >
            Prolonger
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function SellerPromotionsPage() {
  const { data: sales = [], isLoading } = useSellerFlashSales();
  const updateSale = useUpdateSellerFlashSale();
  const deleteSale = useDeleteSellerFlashSale();

  const [filter, setFilter] = useState<"all" | "active" | "paused" | "ended">(
    "all",
  );
  const [extendingSale, setExtendingSale] = useState<FlashSale | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = sales.filter(
    (sale) => filter === "all" || sale.status === filter,
  );

  const stats = {
    active: sales.filter((sale) => sale.status === "active").length,
    totalSold: sales.reduce((sum, sale) => sum + sale.quantity_sold, 0),
    ended: sales.filter((sale) => sale.status === "ended").length,
  };

  const handleTogglePause = async (sale: FlashSale) => {
    await updateSale.mutateAsync({
      id: sale.id,
      data: { status: sale.status === "active" ? "paused" : "active" },
    });
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await deleteSale.mutateAsync(id);
    setDeletingId(null);
  };

  const handleExtend = async (newEndsAt: string) => {
    if (!extendingSale) return;
    await updateSale.mutateAsync({
      id: extendingSale.id,
      data: { ends_at: newEndsAt, status: "active" },
    });
    setExtendingSale(null);
  };

  return (
    <SellerWorkspaceShell
      title="Ventes flash"
      description="Gérez les offres flash de votre boutique avec la même logique que l'espace admin."
      actions={
        <Link href="/vendeur/promotions/nouveau">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle offre
          </Button>
        </Link>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2.5">
              <Zap className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Offres actives</p>
              <p className="text-2xl font-bold text-neutral-900">
                {stats.active}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2.5">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Total vendu en flash</p>
              <p className="text-2xl font-bold text-neutral-900">
                {stats.totalSold}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-neutral-100 p-2.5">
              <Clock className="h-5 w-5 text-neutral-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Terminées</p>
              <p className="text-2xl font-bold text-neutral-900">
                {stats.ended}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-fit rounded-lg bg-neutral-100 p-1">
        <div className="flex gap-2">
          {(["all", "active", "paused", "ended"] as const).map((value) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-medium capitalize transition-colors",
                filter === value
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700",
              )}
            >
              {value === "all"
                ? "Toutes"
                : value === "active"
                  ? "Actives"
                  : value === "paused"
                    ? "En pause"
                    : "Terminées"}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center">
          <Zap className="mx-auto mb-3 h-10 w-10 text-neutral-300" />
          <p className="text-neutral-500">
            Aucune vente flash pour votre boutique
          </p>
          <Link href="/vendeur/promotions/nouveau">
            <Button className="mt-4">Créer une offre</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((sale) => (
              <motion.div
                key={sale.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-xl border border-neutral-200 bg-white p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                    {sale.products?.images?.[0] ? (
                      <Image
                        src={sale.products.images[0]}
                        alt={sale.products.name || ""}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-6 w-6 text-neutral-400" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="truncate font-semibold text-neutral-900">
                          {sale.title}
                        </p>
                        <p className="truncate text-sm text-neutral-500">
                          {sale.products?.name} · SKU: {sale.products?.sku}
                        </p>
                      </div>
                      <Countdown endsAt={sale.ends_at} status={sale.status} />
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-red-600">
                        {sale.sale_price.toLocaleString()} HTG
                      </span>
                      <span className="text-sm text-neutral-400 line-through">
                        {sale.original_price.toLocaleString()} HTG
                      </span>
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">
                        -
                        {Math.round(
                          (1 - sale.sale_price / sale.original_price) * 100,
                        )}
                        %
                      </span>
                    </div>

                    <StockBar
                      sold={sale.quantity_sold}
                      limit={sale.quantity_limit}
                    />
                  </div>

                  <div className="flex flex-shrink-0 items-center gap-2">
                    {sale.status !== "ended" ? (
                      <button
                        onClick={() => void handleTogglePause(sale)}
                        className="rounded-lg border border-neutral-200 p-2 transition-colors hover:bg-neutral-50"
                        title={
                          sale.status === "active"
                            ? "Mettre en pause"
                            : "Reprendre"
                        }
                      >
                        {sale.status === "active" ? (
                          <Pause className="h-4 w-4 text-amber-600" />
                        ) : (
                          <Play className="h-4 w-4 text-green-600" />
                        )}
                      </button>
                    ) : null}

                    <button
                      onClick={() => setExtendingSale(sale)}
                      className="rounded-lg border border-neutral-200 p-2 transition-colors hover:bg-neutral-50"
                      title="Prolonger"
                    >
                      <CalendarClock className="h-4 w-4 text-blue-600" />
                    </button>

                    <button
                      onClick={() => void handleDelete(sale.id)}
                      disabled={deletingId === sale.id}
                      className="rounded-lg border border-neutral-200 p-2 transition-colors hover:bg-red-50"
                      title="Supprimer"
                    >
                      {deletingId === sale.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-600" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {extendingSale ? (
          <ExtendModal
            sale={extendingSale}
            onClose={() => setExtendingSale(null)}
            onExtend={handleExtend}
          />
        ) : null}
      </AnimatePresence>
    </SellerWorkspaceShell>
  );
}
