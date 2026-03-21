"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Sparkles,
  Truck,
  Shield,
  RotateCcw,
  Headphones,
  Zap,
  X,
  ChevronRight,
  ChevronLeft,
  Star,
  TrendingUp,
  AlertCircle,
  Tag,
  Timer,
  Clock,
  Flame,
  Crown,
  Brain,
  ShoppingBag,
} from "lucide-react";
import { HeroSlider } from "@/components/HeroSlider";
import { ProductCard } from "@/components/ui/ProductCard";
import { Button } from "@/components/ui/Button";
import { PRODUCT_ONTOLOGY } from "@/data/productOntology";
import type { Product } from "@/data/types";
import {
  useFeaturedProductsQuery,
  useNewestProductsQuery,
  usePopularProductsQuery,
  useTrendingProductsQuery,
  useCategoryProductsQuery,
} from "@/hooks/useStorefront";
import { useFlashSales, getTimeRemaining } from "@/hooks/usePromotions";
import { useActiveAnnouncements } from "@/hooks/useAnnouncements";
import { useStorefront } from "@/components/StorefrontProvider";
import { getDiscountedPrice } from "@/lib/storefront";
import { useCart, useWishlist } from "@/store";
import { useRouter } from "next/navigation";
import {
  buildDefaultAttributeSelections,
  productRequiresConfiguration,
} from "@/lib/storefront";
import { Heart, Eye } from "lucide-react";

// ─────────────────────────────────────────────
// Benefits
// ─────────────────────────────────────────────
const benefits = [
  {
    icon: Truck,
    title: "Livraison flexible",
    description: "Tarifs pilotés par vos règles de livraison",
    color: "from-blue-500/20 to-blue-600/10",
    iconColor: "text-blue-500",
  },
  {
    icon: Shield,
    title: "Paiement sécurisé",
    description: "Transactions protégées de bout en bout",
    color: "from-emerald-500/20 to-emerald-600/10",
    iconColor: "text-emerald-500",
  },
  {
    icon: RotateCcw,
    title: "Retours faciles",
    description: "Suivi clair de vos achats",
    color: "from-purple-500/20 to-purple-600/10",
    iconColor: "text-purple-500",
  },
  {
    icon: Headphones,
    title: "Service premium",
    description: "Assistance client rapide",
    color: "from-amber-500/20 to-amber-600/10",
    iconColor: "text-amber-500",
  },
];

// ─────────────────────────────────────────────
// Notification Bar
// ─────────────────────────────────────────────
function NotificationBar() {
  const { data: bars = [] } = useActiveAnnouncements("top_bar");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (bars.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx((i) => (i + 1) % bars.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [bars.length]);

  if (dismissed || bars.length === 0) return null;
  const bar = bars[currentIdx];

  return (
    <div
      className="relative z-50 flex items-center justify-center px-10 py-2.5 text-center text-sm font-medium transition-all"
      style={{
        backgroundColor: bar.background_color || "#1a1a1a",
        color: bar.text_color || "#fff",
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={bar.id}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="flex items-center gap-3"
        >
          <span>{bar.title}</span>
          {bar.link_url && (
            <Link
              href={bar.link_url}
              className="underline underline-offset-2 hover:opacity-80"
            >
              {bar.link_text || "En savoir plus"} →
            </Link>
          )}
        </motion.div>
      </AnimatePresence>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:opacity-70 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Announcement Popup
// ─────────────────────────────────────────────
function AnnouncementPopup() {
  const { data: popups = [] } = useActiveAnnouncements("popup");
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [selectedPopupId, setSelectedPopupId] = useState<string | null>(null);
  const popup = popups.find((item) => item.id === selectedPopupId) || null;

  useEffect(() => {
    if (dismissed || popups.length === 0) return;

    const eligiblePopups = popups.filter((item) => {
        const key = `popup_seen_${item.id}`;
        return item.show_on_every_visit || !sessionStorage.getItem(key);
      });

    if (eligiblePopups.length === 0) return;

    const candidate =
      eligiblePopups[Math.floor(Math.random() * eligiblePopups.length)];

    setSelectedPopupId(candidate.id);
    setVisible(false);

    const delay = (candidate.display_delay_seconds || 0) * 1000;
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [popups, dismissed]);

  const handleClose = () => {
    setVisible(false);
    setDismissed(true);
    if (popup) sessionStorage.setItem(`popup_seen_${popup.id}`, "1");
  };

  if (!popup || !visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-md w-full rounded-2xl overflow-hidden shadow-2xl"
            style={{ backgroundColor: popup.background_color || "#1a1a1a" }}
          >
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            {popup.image_url && (
              <div className="relative h-52 w-full">
                <Image
                  src={popup.image_url}
                  alt={popup.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            )}
            <div
              className="p-6 text-center"
              style={{ color: popup.text_color || "#fff" }}
            >
              <h2 className="text-2xl font-bold mb-2">{popup.title}</h2>
              {popup.content && (
                <p className="text-sm opacity-80 mb-4">{popup.content}</p>
              )}
              {popup.link_url && (
                <Link href={popup.link_url} onClick={handleClose}>
                  <button
                    className="w-full py-3 px-6 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
                    style={{
                      backgroundColor: popup.text_color || "#fff",
                      color: popup.background_color || "#000",
                    }}
                  >
                    {popup.link_text || "Voir"}
                  </button>
                </Link>
              )}
              <button
                onClick={handleClose}
                className="mt-3 text-xs opacity-50 hover:opacity-80 transition-opacity block mx-auto"
              >
                Non merci
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────
// Countdown
// ─────────────────────────────────────────────
function DigitBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex gap-0.5">
        {value.split("").map((d, i) => (
          <span
            key={i}
            className="bg-white/15 backdrop-blur-sm text-white font-mono font-black text-xl sm:text-2xl md:text-3xl w-9 sm:w-11 h-11 sm:h-14 flex items-center justify-center rounded-md border border-white/10 shadow-inner"
          >
            {d}
          </span>
        ))}
      </div>
      <span className="text-[10px] uppercase tracking-widest text-white/50 font-medium">
        {label}
      </span>
    </div>
  );
}

function SectionCountdown({ endsAt }: { endsAt: string }) {
  const [seconds, setSeconds] = useState(getTimeRemaining(endsAt));
  useEffect(() => {
    const i = setInterval(() => setSeconds(getTimeRemaining(endsAt)), 1000);
    return () => clearInterval(i);
  }, [endsAt]);
  const days = Math.floor(seconds / 86400);
  const hrs = Math.floor((seconds % 86400) / 3600);
  const min = Math.floor((seconds % 3600) / 60);
  const sec = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div className="flex items-end gap-2 sm:gap-3">
      {days > 0 && (
        <DigitBlock value={String(days).padStart(2, "0")} label="Jours" />
      )}
      <DigitBlock value={pad(hrs)} label="Heures" />
      <span className="text-white/50 font-bold text-2xl pb-6 leading-none">
        :
      </span>
      <DigitBlock value={pad(min)} label="Minutes" />
      <span className="text-white/50 font-bold text-2xl pb-6 leading-none">
        :
      </span>
      <DigitBlock value={pad(sec)} label="Secondes" />
    </div>
  );
}

// ─────────────────────────────────────────────
// Premium Flash Sale Card - Enhanced Design
// ─────────────────────────────────────────────
function PremiumSaleCard({
  sale,
  formatPrice,
}: {
  sale: {
    title?: string | null;
    sale_price: number;
    original_price: number;
    quantity_sold?: number | null;
    quantity_limit?: number | null;
    ends_at?: string | null;
    products?: {
      name?: string | null;
      images?: string[] | null;
      category_id?: string | null;
    } | null;
  };
  formatPrice: (n: number) => string;
}) {
  const quantitySold = sale.quantity_sold ?? 0;
  const quantityLimit = sale.quantity_limit ?? 0;
  const discount = Math.round(
    (1 - sale.sale_price / sale.original_price) * 100,
  );
  const stockPct =
    quantityLimit > 0
      ? Math.min(
          100,
          Math.round((quantitySold / quantityLimit) * 100),
        )
      : null;
  const href = sale.products?.name
    ? `/collection?search=${encodeURIComponent(sale.products.name)}`
    : "/collection";

  // Déterminer l'urgence visuelle selon le stock
  const urgencyLevel =
    stockPct !== null && stockPct >= 80
      ? "critical"
      : stockPct !== null && stockPct >= 50
        ? "high"
        : "normal";
  const urgencyColors = {
    critical: "from-red-500 to-rose-600",
    high: "from-amber-500 to-orange-600",
    normal: "from-emerald-500 to-teal-600",
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl shadow-black/40 hover:shadow-red-500/10 transition-shadow duration-500"
    >
      {/* Badge promotionnel flottant avec animation */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        className="absolute -top-1 -right-1 z-20"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-red-500 blur-xl opacity-50 animate-pulse" />
          <div className="relative bg-gradient-to-br from-red-500 to-red-600 text-white px-4 py-2 rounded-bl-2xl rounded-tr-2xl font-black text-sm shadow-lg flex items-center gap-1.5">
            <Zap className="w-4 h-4 fill-current animate-pulse" />
            <span className="text-lg">-{discount}%</span>
          </div>
          {/* Effet ruban */}
          <div className="absolute -bottom-2 right-0 w-4 h-4 bg-red-700 clip-path-triangle" />
        </div>
      </motion.div>

      {/* Compteur visuel dynamique (optionnel si vous avez un timer) */}
      <div className="absolute top-4 left-4 z-20">
        <div className="bg-black/60 backdrop-blur-md rounded-full px-3 py-1.5 flex items-center gap-1.5 border border-white/10">
          <Timer className="w-3 h-3 text-red-400" />
          <span className="text-[11px] font-bold text-white/90 tracking-wider uppercase">
            Flash
          </span>
        </div>
      </div>

      <Link
        href={href}
        className="relative h-60 sm:h-72 block overflow-hidden flex-shrink-0"
      >
        {sale.products?.images?.[0] ? (
          <>
            <Image
              src={sale.products.images[0]}
              alt={sale.products.name || sale.title || "Produit en promotion"}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            />
            {/* Overlay gradient dynamique */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

            {/* Effet de scanline subtil au hover */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent translate-y-full group-hover:translate-y-[-200%] transition-transform duration-1000 ease-in-out" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/5 to-white/10">
            <Zap className="w-16 h-16 text-white/10" />
          </div>
        )}

        {/* Prix flottant avec glassmorphism */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-white/60 uppercase tracking-widest font-semibold mb-1">
                Prix Flash
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-black text-white drop-shadow-lg tracking-tight">
                  {formatPrice(sale.sale_price)}
                </span>
                <span className="text-sm text-white/50 line-through font-medium decoration-red-400/50 decoration-2">
                  {formatPrice(sale.original_price)}
                </span>
              </div>
            </div>

            {/* Indicateur d'économie */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg px-2 py-1 border border-white/10">
              <span className="text-[10px] font-bold text-emerald-400">
                -{formatPrice(sale.original_price - sale.sale_price)}
              </span>
            </div>
          </div>
        </div>
      </Link>

      <div className="p-5 flex flex-col flex-1 gap-4 bg-gradient-to-b from-transparent to-white/[0.02]">
        {/* Titre avec effet de highlight */}
        <div className="space-y-1">
          <h3 className="font-bold text-white text-base leading-tight line-clamp-2 group-hover:text-red-200 transition-colors duration-300">
            {sale.title || sale.products?.name || "Offre flash"}
          </h3>
          {sale.products?.name && (
            <p className="text-xs text-white/40 font-medium truncate flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {sale.products.name}
            </p>
          )}
        </div>

        {/* Barre de progression améliorée avec indicateurs visuels */}
        {stockPct !== null && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full animate-pulse ${
                    urgencyLevel === "critical"
                      ? "bg-red-400"
                      : urgencyLevel === "high"
                        ? "bg-amber-400"
                        : "bg-emerald-400"
                  }`}
                />
                <span className="font-bold text-white/80">
                  {quantitySold} vendus
                </span>
              </div>
              <span
                className={`font-semibold ${
                  urgencyLevel === "critical"
                    ? "text-red-400"
                    : urgencyLevel === "high"
                      ? "text-amber-400"
                      : "text-emerald-400"
                }`}
              >
                {Math.max(0, quantityLimit - quantitySold)} restants
              </span>
            </div>

            {/* Barre avec segments */}
            <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stockPct}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${urgencyColors[urgencyLevel]} shadow-lg`}
              />
              {/* Effet de brillance sur la barre */}
              <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white/20 to-transparent animate-shimmer" />
            </div>

            {/* Message d'urgence conditionnel */}
            {stockPct >= 80 && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[11px] font-bold text-red-400 flex items-center gap-1"
              >
                <AlertCircle className="w-3 h-3" />
                Plus que quelques unités !
              </motion.p>
            )}
          </div>
        )}

        {/* Bouton d'action premium */}
        <Link href={href} className="mt-auto block">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-white to-white/90 text-neutral-900 text-sm font-black hover:from-red-50 hover:to-white transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-black/20 group/btn relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Voir l&apos;offre
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </span>
            {/* Effet de glow au hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
          </motion.button>
        </Link>
      </div>

      {/* Bordure lumineuse animée au hover */}
      <div className="absolute inset-0 rounded-3xl border border-white/0 group-hover:border-red-500/30 transition-colors duration-500 pointer-events-none" />
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Flash Sales Section
// ─────────────────────────────────────────────
function FlashSalesSection() {
  const { data: sales = [] } = useFlashSales("active");
  const { formatPrice } = useStorefront();
  const activeSales = sales
    .filter((s) => getTimeRemaining(s.ends_at) > 0)
    .slice(0, 4);
  if (activeSales.length === 0) return null;
  const soonestSale = [...activeSales].sort(
    (a, b) => new Date(a.ends_at).getTime() - new Date(b.ends_at).getTime(),
  )[0];

  return (
    <section className="relative overflow-hidden py-14 sm:py-20">
      <Image
        src="https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1920&q=80"
        alt="Flash Sales Background"
        fill
        className="object-cover object-center"
        priority
      />
      <div className="absolute inset-0 bg-black/70" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/60" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 right-0 w-[600px] h-[600px] bg-red-700/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-20 w-[400px] h-[400px] bg-amber-600/10 rounded-full blur-3xl" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10"
        >
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-400/20 border border-amber-400/30">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <span className="text-amber-400 text-xs uppercase tracking-[0.25em] font-semibold">
                Offres Éclair
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-white leading-tight">
              Ventes <span className="font-bold italic">Flash</span>
            </h2>
            <p className="text-white/50 text-sm mt-2">
              Quantités limitées — Des prix exceptionnels pour une durée limitée
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            <div>
              <p className="text-white/40 text-xs uppercase tracking-widest mb-2">
                Se termine dans
              </p>
              <SectionCountdown endsAt={soonestSale.ends_at} />
            </div>
            <Link href="/collection" className="sm:mb-1">
              <button className="flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white border border-white/20 hover:border-white/40 rounded-xl px-4 py-2.5 transition-all hover:bg-white/5">
                Tout voir <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-5">
          {activeSales.map((sale, i) => (
            <motion.div
              key={sale.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: i * 0.1,
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
            >
              <PremiumSaleCard sale={sale} formatPrice={formatPrice} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Horizontal Slider
// ─────────────────────────────────────────────
function HorizontalProductSlider({
  products,
  isLoading,
}: {
  products: Product[];
  isLoading: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      ro.disconnect();
    };
  }, [checkScroll, products]);

  const scroll = (dir: "left" | "right") => {
    if (!ref.current) return;
    ref.current.scrollBy({
      left: dir === "left" ? -300 : 300,
      behavior: "smooth",
    });
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="w-56 flex-shrink-0 bg-neutral-100 h-80 animate-pulse rounded-xl"
          />
        ))}
      </div>
    );
  }

  if (!products.length) return null;

  return (
    <div className="relative">
      {/* Prev arrow — visible only when there is scroll to the left */}
      {canLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-[40%] -translate-y-1/2 -translate-x-5 z-20 w-10 h-10 bg-white shadow-xl rounded-full flex items-center justify-center border border-neutral-100 hover:bg-neutral-50 transition-all"
        >
          <ChevronLeft className="w-5 h-5 text-neutral-700" />
        </button>
      )}
      {/* Next arrow — visible only when there is more content to scroll to */}
      {canRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-[40%] -translate-y-1/2 translate-x-5 z-20 w-10 h-10 bg-white shadow-xl rounded-full flex items-center justify-center border border-neutral-100 hover:bg-neutral-50 transition-all"
        >
          <ChevronRight className="w-5 h-5 text-neutral-700" />
        </button>
      )}

      {/* Outer wrapper clips x overflow but allows y so card shadows/buttons show */}
      <div className="overflow-x-hidden">
        <style>{".slider-track::-webkit-scrollbar{display:none}"}</style>
        <div
          ref={ref}
          className="slider-track flex gap-4 overflow-x-auto overflow-y-visible py-4 px-1"
          style={
            {
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            } as React.CSSProperties
          }
          onScroll={checkScroll}
        >
          {products.map((product) => (
            <div key={product.id} className="w-52 sm:w-60 flex-shrink-0">
              <ProductCard product={product} variant="default" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Section header helper
// ─────────────────────────────────────────────
function SectionHeader({
  icon: Icon,
  eyebrow,
  title,
  href,
  accentColor = "text-amber-600",
  iconBg = "bg-amber-50",
}: {
  icon: React.ElementType;
  eyebrow: string;
  title: string;
  href: string;
  accentColor?: string;
  iconBg?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex items-end justify-between mb-10 gap-4"
    >
      <div>
        <div className="flex items-center gap-2.5 mb-2">
          <div
            className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center`}
          >
            <Icon className={`w-4 h-4 ${accentColor}`} />
          </div>
          <span
            className={`${accentColor} text-xs uppercase tracking-[0.2em] font-semibold`}
          >
            {eyebrow}
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-light text-neutral-900">
          {title}
        </h2>
      </div>
      <Link href={href}>
        <button className="flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors border border-neutral-200 hover:border-neutral-400 rounded-xl px-4 py-2 whitespace-nowrap">
          Voir tout <ChevronRight className="w-4 h-4" />
        </button>
      </Link>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Featured Section — Split layout (hero + grid)
// ─────────────────────────────────────────────
function FeaturedSection({
  products,
  isLoading,
}: {
  products: Product[];
  isLoading: boolean;
}) {
  const { formatPrice } = useStorefront();
  const router = useRouter();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  if (isLoading) {
    return (
      <section className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid grid-cols-12 gap-6 h-[520px]">
            <div className="col-span-12 lg:col-span-5 bg-neutral-200 animate-pulse rounded-2xl" />
            <div className="col-span-12 lg:col-span-7 grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-neutral-200 animate-pulse rounded-xl"
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!products.length) return null;

  const [hero, ...rest] = products;
  const gridProducts = rest.slice(0, 4);
  const heroDiscounted = getDiscountedPrice(hero);
  const heroInWishlist = isInWishlist(hero.id);

  return (
    <section className="py-16 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <SectionHeader
          icon={Crown}
          eyebrow="Sélection exclusive"
          title="Produits en Vedette"
          href="/collection?featured=true"
          accentColor="text-amber-600"
          iconBg="bg-amber-50"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Hero product — left half */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-5 group relative rounded-2xl overflow-hidden bg-white shadow-sm border border-neutral-100 cursor-pointer"
            onClick={() => router.push(`/produit/${hero.id}`)}
          >
            <div className="relative h-80 lg:h-full min-h-[360px]">
              <Image
                src={hero.images[0]}
                alt={hero.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span className="bg-amber-400 text-neutral-900 text-xs font-black px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <Crown className="w-3 h-3" />
                </span>
                {!!hero.discount && (
                  <span className="bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full">
                    -{hero.discount}%
                  </span>
                )}
              </div>

              {/* Wishlist */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist(hero.id);
                }}
                className="absolute top-4 right-4 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${heroInWishlist ? "fill-red-500 text-red-500" : "text-neutral-600"}`}
                />
              </button>

              {/* Info overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="flex items-center gap-1 mb-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${i < Math.floor(hero.rating) ? "fill-amber-400 text-amber-400" : "text-white/30"}`}
                    />
                  ))}
                  <span className="text-xs text-white/60 ml-1">
                    ({hero.reviewCount})
                  </span>
                </div>
                <p className="text-xs text-white/60 uppercase tracking-wider mb-1">
                  {hero.category}
                </p>
                <h3 className="text-white font-semibold text-lg leading-snug mb-3 line-clamp-2">
                  {hero.name}
                </h3>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white">
                      {formatPrice(heroDiscounted)}
                    </span>
                    {!!hero.discount && (
                      <span className="text-sm text-white/50 line-through">
                        {formatPrice(hero.price)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (productRequiresConfiguration(hero)) {
                        router.push(`/produit/${hero.id}`);
                      } else {
                        addToCart(hero, 1, {
                          selectedAttributes: buildDefaultAttributeSelections(
                            hero.attributes,
                          ),
                          unitPrice: heroDiscounted,
                        });
                      }
                    }}
                    className="flex items-center gap-2 bg-white text-neutral-900 text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-amber-400 transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Grid of 4 products — right half */}
          <div className="lg:col-span-7">
            {gridProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 h-full">
                {gridProducts.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.09 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-neutral-400"></div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Simple grid section
// ─────────────────────────────────────────────
function ProductGridSection({
  icon,
  eyebrow,
  title,
  href,
  products,
  isLoading,
  bg = "bg-white",
  accentColor,
  iconBg,
}: {
  icon: React.ElementType;
  eyebrow: string;
  title: string;
  href: string;
  products: Product[];
  isLoading: boolean;
  bg?: string;
  accentColor?: string;
  iconBg?: string;
}) {
  return (
    <section className={`py-16 ${bg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <SectionHeader
          icon={icon}
          eyebrow={eyebrow}
          title={title}
          href={href}
          accentColor={accentColor}
          iconBg={iconBg}
        />
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-neutral-100 h-80 animate-pulse rounded-xl"
              />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {products.slice(0, 8).map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Slider section (horizontal scroll)
// ─────────────────────────────────────────────
function SliderSection({
  icon,
  eyebrow,
  title,
  href,
  products,
  isLoading,
  bg = "bg-neutral-50",
  accentColor,
  iconBg,
}: {
  icon: React.ElementType;
  eyebrow: string;
  title: string;
  href: string;
  products: Product[];
  isLoading: boolean;
  bg?: string;
  accentColor?: string;
  iconBg?: string;
}) {
  return (
    <section className={`py-16 ${bg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <SectionHeader
          icon={icon}
          eyebrow={eyebrow}
          title={title}
          href={href}
          accentColor={accentColor}
          iconBg={iconBg}
        />
        <HorizontalProductSlider products={products} isLoading={isLoading} />
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Category Products Row
// ─────────────────────────────────────────────
function CategoryRow({
  categoryId,
  categoryName,
}: {
  categoryId: string;
  categoryName: string;
}) {
  const { data: products = [], isLoading } = useCategoryProductsQuery(
    categoryId,
    10,
  );
  if (!isLoading && products.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
          <span className="w-1 h-5 bg-amber-400 rounded-full inline-block" />
          {categoryName}
        </h3>
        <Link
          href={`/collection/${categoryId}`}
          className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
        >
          Voir plus <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <HorizontalProductSlider products={products} isLoading={isLoading} />
    </div>
  );
}

function CategoryProductsSection() {
  // Show top 3 categories
  const topCategories = PRODUCT_ONTOLOGY.slice(0, 3);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-purple-600 text-xs uppercase tracking-[0.2em] font-semibold">
              Explorez
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-light text-neutral-900">
            Par Catégorie
          </h2>
        </motion.div>

        {topCategories.map((cat) => (
          <CategoryRow
            key={cat.id}
            categoryId={cat.id}
            categoryName={cat.name}
          />
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// AI Recommendations Section
// ─────────────────────────────────────────────
function AIRecommendationsSection({
  featuredProducts,
  popularProducts,
}: {
  featuredProducts: Product[];
  popularProducts: Product[];
}) {
  // Merge featured + popular, shuffle a bit, deduplicate
  const allCandidates = [...featuredProducts, ...popularProducts];
  const seen = new Set<string>();
  const unique = allCandidates.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });

  // Quick deterministic shuffle using index
  const recommended = unique
    .map((p, i) => ({ p, sort: (i * 7 + 3) % unique.length }))
    .sort((a, b) => a.sort - b.sort)
    .map((x) => x.p)
    .slice(0, 8);

  if (recommended.length === 0) return null;

  return (
    <section className="py-16 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-amber-50" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2"></div>
          <h2 className="text-2xl md:text-3xl font-light text-neutral-900">
            Recommandé{" "}
            <span className="font-semibold text-violet-700">pour vous</span>
          </h2>
          <p className="text-neutral-500 text-sm mt-1">
            Sélectionné selon vos préférences et les tendances actuelles
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 ">
          {recommended.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Categories Grid
// ─────────────────────────────────────────────
function CategoriesGrid() {
  return (
    <section className="py-16 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="text-amber-600 text-xs uppercase tracking-[0.2em] mb-3 block font-semibold">
            Nos Collections
          </span>
          <h2 className="text-2xl md:text-3xl font-light text-neutral-900">
            Explorer par catégorie
          </h2>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {PRODUCT_ONTOLOGY.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
            >
              <Link
                href={`/collection/${category.id}`}
                className="group block bg-white border border-neutral-100 hover:border-amber-200 p-5 min-h-36 rounded-xl hover:shadow-md transition-all"
              >
                <div className="h-full flex flex-col justify-between">
                  <span className="text-xs uppercase tracking-[0.25em] text-neutral-400 group-hover:text-amber-500 transition-colors">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-neutral-900 group-hover:text-amber-700 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1">
                      {category.subcategories.length} sous-catégorie
                      {category.subcategories.length > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function HomePage() {
  const { data: featuredProducts = [], isLoading: loadingFeatured } =
    useFeaturedProductsQuery(8);
  const { data: newestProducts = [], isLoading: loadingNewest } =
    useNewestProductsQuery(12);
  const { data: popularProducts = [], isLoading: loadingPopular } =
    usePopularProductsQuery(8);
  const { data: trendingProducts = [], isLoading: loadingTrending } =
    useTrendingProductsQuery(10);

  return (
    <div className="min-h-screen">
      {/* Top Notification Bar */}
      <NotificationBar />

      {/* Hero Slider */}
      <HeroSlider />

      {/* Benefits Bar — premium redesign */}
      <section className="bg-white border-b border-neutral-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-4 p-3.5 rounded-xl bg-gradient-to-br ${benefit.color}`}
              >
                <div className="w-11 h-11 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                  <benefit.icon className={`w-5 h-5 ${benefit.iconColor}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 text-sm">
                    {benefit.title}
                  </h3>
                  <p className="text-xs text-neutral-500 leading-snug">
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ⚡ Flash Sales */}
      <FlashSalesSection />

      {/* 🌟 Featured Products — split layout */}
      <FeaturedSection
        products={featuredProducts}
        isLoading={loadingFeatured}
      />

      {/* 🆕 Nouveautés — horizontal slider */}
      <SliderSection
        icon={Clock}
        eyebrow="Nouveautés"
        title="Derniers Arrivages"
        href="/collection?sort=newest"
        products={newestProducts}
        isLoading={loadingNewest}
        bg="bg-white"
        accentColor="text-blue-600"
        iconBg="bg-blue-50"
      />

      {/* 🔥 Populaires — grid */}
      <ProductGridSection
        icon={Flame}
        eyebrow="Populaires"
        title="Les Plus Vendus"
        href="/collection?sort=popular"
        products={popularProducts}
        isLoading={loadingPopular}
        bg="bg-neutral-50"
        accentColor="text-red-600"
        iconBg="bg-red-50"
      />

      {/* 📈 Tendances — slider */}
      <SliderSection
        icon={TrendingUp}
        eyebrow="Tendances"
        title="Ce qui est Tendance"
        href="/collection?sort=trending"
        products={trendingProducts}
        isLoading={loadingTrending}
        bg="bg-white"
        accentColor="text-emerald-600"
        iconBg="bg-emerald-50"
      />

      {/* 🏷️ Catégories Grid */}
      <CategoriesGrid />

      {/* 📦 Produits par Catégorie */}
      <CategoryProductsSection />

      {/* 🤖 IA Recommandations */}
      <AIRecommendationsSection
        featuredProducts={featuredProducts}
        popularProducts={popularProducts}
      />

      {/* Announcement Popup */}
      <AnnouncementPopup />
    </div>
  );
}
