"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Plus,
  Clock,
  TrendingUp,
  Package,
  X,
  Edit,
  Trash2,
  Pause,
  Play,
  CalendarClock,
  Loader2,
  AlertCircle,
  ShoppingCart,
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/Button";
import {
  useFlashSales,
  useUpdateFlashSale,
  useDeleteFlashSale,
  getTimeRemaining,
  formatCountdown,
  type FlashSale,
} from "@/hooks/usePromotions";
import { cn } from "@/lib/utils";

// --- Live Countdown Component ---
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
      <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">
        Terminée
      </span>
    );
  }

  if (status === "paused") {
    return (
      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
        En pause
      </span>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono font-bold text-sm",
        isUrgent
          ? "bg-red-50 text-red-600 animate-pulse"
          : "bg-green-50 text-green-700"
      )}
    >
      <Clock className="w-4 h-4" />
      {formatCountdown(seconds)}
    </div>
  );
}

// --- Stock Bar Component ---
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
        <span className="text-neutral-700 font-medium">{sold} / {limit} vendus</span>
        <span className={cn("font-bold", pct >= 80 ? "text-red-600" : "text-neutral-600")}>
          {pct}%
        </span>
      </div>
      <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            pct >= 80 ? "bg-red-500" : pct >= 50 ? "bg-amber-500" : "bg-green-500"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// --- Extend Date Modal ---
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
      .slice(0, 16)
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-blue-600" />
            Prolonger l&apos;offre
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-neutral-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-neutral-500 mb-4">
          Nouvelle date de fin pour &quot;<strong>{sale.title}</strong>&quot;
        </p>
        <input
          type="datetime-local"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          min={new Date().toISOString().slice(0, 16)}
          className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-neutral-900 mb-6"
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

// --- Main Page ---
export default function AdminPromotionsPage() {
  const { data: sales = [], isLoading } = useFlashSales();
  const updateSale = useUpdateFlashSale();
  const deleteSale = useDeleteFlashSale();

  const [filter, setFilter] = useState<"all" | "active" | "paused" | "ended">("all");
  const [extendingSale, setExtendingSale] = useState<FlashSale | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = sales.filter((s) => filter === "all" || s.status === filter);

  const stats = {
    active: sales.filter((s) => s.status === "active").length,
    totalSold: sales.reduce((sum, s) => sum + s.quantity_sold, 0),
    ended: sales.filter((s) => s.status === "ended").length,
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
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900 flex items-center gap-2">
              <Zap className="w-6 h-6 text-amber-500" />
              Ventes Flash
            </h1>
            <p className="text-neutral-500 mt-1">
              Gérez vos offres promotionnelles avec compte à rebours
            </p>
          </div>
          <Link href="/admin/promotions/nouveau">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nouvelle offre
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2.5 rounded-lg">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Offres actives</p>
                <p className="text-2xl font-bold text-neutral-900">{stats.active}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2.5 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Total vendu en flash</p>
                <p className="text-2xl font-bold text-neutral-900">{stats.totalSold}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <div className="flex items-center gap-3">
              <div className="bg-neutral-100 p-2.5 rounded-lg">
                <Clock className="w-5 h-5 text-neutral-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Terminées</p>
                <p className="text-2xl font-bold text-neutral-900">{stats.ended}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 bg-neutral-100 p-1 rounded-lg w-fit">
          {(["all", "active", "paused", "ended"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize",
                filter === f
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              {f === "all" ? "Toutes" : f === "active" ? "Actives" : f === "paused" ? "En pause" : "Terminées"}
            </button>
          ))}
        </div>

        {/* Flash Sales List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
            <Zap className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500">Aucune vente flash</p>
            <Link href="/admin/promotions/nouveau">
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
                  className="bg-white rounded-xl border border-neutral-200 p-5"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                      {sale.products?.images?.[0] ? (
                        <Image
                          src={sale.products.images[0]}
                          alt={sale.products.name || ""}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-neutral-400" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-neutral-900 truncate">{sale.title}</p>
                          <p className="text-sm text-neutral-500 truncate">
                            {sale.products?.name} · SKU: {sale.products?.sku}
                          </p>
                        </div>
                        <Countdown endsAt={sale.ends_at} status={sale.status} />
                      </div>

                      {/* Pricing */}
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-red-600">
                          {sale.sale_price.toLocaleString()} HTG
                        </span>
                        <span className="text-sm text-neutral-400 line-through">
                          {sale.original_price.toLocaleString()} HTG
                        </span>
                        <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                          -{Math.round((1 - sale.sale_price / sale.original_price) * 100)}%
                        </span>
                      </div>

                      <StockBar sold={sale.quantity_sold} limit={sale.quantity_limit} />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {sale.status !== "ended" && (
                        <button
                          onClick={() => handleTogglePause(sale)}
                          className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
                          title={sale.status === "active" ? "Mettre en pause" : "Reprendre"}
                        >
                          {sale.status === "active" ? (
                            <Pause className="w-4 h-4 text-amber-600" />
                          ) : (
                            <Play className="w-4 h-4 text-green-600" />
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => setExtendingSale(sale)}
                        className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
                        title="Prolonger"
                      >
                        <CalendarClock className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(sale.id)}
                        disabled={deletingId === sale.id}
                        className="p-2 rounded-lg border border-neutral-200 hover:bg-red-50 transition-colors"
                        title="Supprimer"
                      >
                        {deletingId === sale.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                        ) : (
                          <Trash2 className="w-4 h-4 text-red-600" />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Extend Modal */}
      <AnimatePresence>
        {extendingSale && (
          <ExtendModal
            sale={extendingSale}
            onClose={() => setExtendingSale(null)}
            onExtend={handleExtend}
          />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
