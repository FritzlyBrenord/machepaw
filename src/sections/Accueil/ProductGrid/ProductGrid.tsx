"use client";

import { productGridSchema } from "./ProductGrid.schema";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  ShoppingBag,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "@/lib/router";
import { useEcommerceStore } from "@/store/ecommerce-store";
import { useCart } from "@/store";
import { buildCartProduct } from "@/lib/cart-product";
import { toast } from "sonner";
import { SectionContainer, SectionWrapper } from "@/components/SectionWrapper";
import { cn } from "@/hooks/useSectionStyles";
import type {
  ProductCardConfig,
  ProductGridProps,
} from "@/types/section-config-types";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProductGridSlidesConfig = {
  enabled?: boolean;
  slidesToShow?: number;
  slidesToScroll?: number;
  infinite?: boolean;
  showArrows?: boolean;
  showDots?: boolean;
  autoplay?: boolean;
  interval?: number;
};

type ProductGridConfigExtras = NonNullable<ProductGridProps["config"]> & {
  titleAlignment?: "left" | "center" | "right";
  slides?: ProductGridSlidesConfig;
  /** NEW — the active card variant key chosen by the user */
  cardVariant?: CardVariant;
};

type ProductGridItem = NonNullable<
  NonNullable<ProductGridProps["content"]>["products"]
>[number];

/**
 * All available card frame variants.
 * Adding a new one here automatically makes it available everywhere.
 */
export type CardVariant =
  | "standard" // Clean white card, subtle radius, no shadow
  | "minimal" // No background, no border — pure image + text
  | "luxury" // Deep shadow, generous padding
  | "elegant" // Hairline border, very soft shadow
  | "glass" // Frosted-glass backdrop-blur effect
  | "gradient" // Accent-tinted gradient background
  | "outlined" // Bold accent-colored border, flat bg
  | "dark"; // Dark background, light text

// ─── Card variant definitions ─────────────────────────────────────────────────

export interface CardVariantDef {
  /** className applied to the outer wrapper */
  wrapperClass: string;
  /** inline style computed from current color palette */
  wrapperStyle: (colors: {
    bg: string;
    text: string;
    accent: string;
  }) => React.CSSProperties;
  /** extra className on the image container */
  imageClass?: string;
  /** extra className on the info section */
  infoClass?: string;
  /** when true, inner text color switches to light (for dark bg) */
  invertText?: boolean;
}

export const CARD_VARIANTS: Record<CardVariant, CardVariantDef> = {
  standard: {
    wrapperClass: "rounded-xl",
    wrapperStyle: ({ bg }) => ({ backgroundColor: bg }),
    imageClass: "rounded-lg overflow-hidden",
    infoClass: "px-1",
  },
  minimal: {
    wrapperClass: "bg-transparent",
    wrapperStyle: () => ({}),
    imageClass: "rounded-xl overflow-hidden",
    infoClass: "px-0",
  },
  luxury: {
    wrapperClass: "rounded-3xl p-3 shadow-[0_24px_56px_-16px_rgba(0,0,0,0.38)]",
    wrapperStyle: ({ bg }) => ({ backgroundColor: bg }),
    imageClass: "rounded-2xl overflow-hidden",
    infoClass: "px-1",
  },
  elegant: {
    wrapperClass:
      "rounded-2xl border p-3 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.18)]",
    wrapperStyle: ({ bg, text }) => ({
      backgroundColor: bg,
      borderColor: `${text}10`,
    }),
    imageClass: "rounded-xl overflow-hidden",
    infoClass: "px-1",
  },
  glass: {
    wrapperClass:
      "rounded-2xl border p-3 shadow-[0_8px_32px_0_rgba(31,38,135,0.13)]",
    wrapperStyle: () => ({
      backgroundColor: "rgba(255,255,255,0.18)",
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      borderColor: "rgba(255,255,255,0.28)",
    }),
    imageClass: "rounded-xl overflow-hidden",
    infoClass: "px-1",
  },
  gradient: {
    wrapperClass: "rounded-2xl p-3",
    wrapperStyle: ({ accent }) => ({
      background: `linear-gradient(145deg, ${accent}18 0%, ${accent}07 60%, transparent 100%)`,
      border: `1px solid ${accent}25`,
    }),
    imageClass: "rounded-xl overflow-hidden",
    infoClass: "px-1",
  },
  outlined: {
    wrapperClass: "rounded-2xl p-3",
    wrapperStyle: ({ accent, bg }) => ({
      backgroundColor: bg,
      border: `2.5px solid ${accent}`,
    }),
    imageClass: "rounded-xl overflow-hidden",
    infoClass: "px-1",
  },
  dark: {
    wrapperClass: "rounded-2xl p-3 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.55)]",
    wrapperStyle: () => ({ backgroundColor: "#18181b" }),
    imageClass: "rounded-xl overflow-hidden",
    infoClass: "px-1",
    invertText: true,
  },
};

/** Metadata used by the visual picker */
export const CARD_VARIANT_META: Record<
  CardVariant,
  { label: string; description: string }
> = {
  standard: { label: "Standard", description: "Classique et propre" },
  minimal: { label: "Minimal", description: "Sans cadre, image pure" },
  luxury: { label: "Luxury", description: "Ombre profonde, raffiné" },
  elegant: { label: "Élégant", description: "Bordure fine, sobre" },
  glass: { label: "Glass", description: "Effet verre dépoli" },
  gradient: { label: "Gradient", description: "Fond dégradé accent" },
  outlined: { label: "Outlined", description: "Contour coloré accent" },
  dark: { label: "Dark", description: "Fond sombre, texte clair" },
};

// ─── Visual Variant Picker ────────────────────────────────────────────────────
// This component is exported so the editor sidebar can embed it.

export function CardVariantPicker({
  value,
  onChange,
  accentColor,
  backgroundColor = "#ffffff",
}: {
  value: CardVariant;
  onChange: (v: CardVariant) => void;
  accentColor: string;
  backgroundColor?: string;
}) {
  const variants = Object.keys(CARD_VARIANTS) as CardVariant[];

  /** Render a tiny preview block that mimics each variant */
  const preview = (v: CardVariant) => {
    const def = CARD_VARIANTS[v];
    const style = def.wrapperStyle({
      bg: backgroundColor,
      text: "#1a1a1a",
      accent: accentColor,
    });
    return (
      <div
        className={cn("h-11 w-full transition-all", def.wrapperClass)}
        style={{ ...style, minHeight: "2.75rem" }}
      >
        {/* tiny image placeholder */}
        <div
          className="h-full w-full rounded-md"
          style={{
            backgroundColor: v === "dark" ? "#27272a" : `${accentColor}18`,
          }}
        />
      </div>
    );
  };

  return (
    <div className="grid grid-cols-4 gap-2 p-1">
      {variants.map((v) => {
        const meta = CARD_VARIANT_META[v];
        const selected = v === value;
        return (
          <button
            key={v}
            onClick={() => onChange(v)}
            title={meta.description}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-xl p-2 transition-all",
              selected ? "ring-2 ring-offset-1" : "hover:bg-black/5",
            )}
            style={
              selected
                ? {
                    outlineColor: accentColor,
                    boxShadow: `0 0 0 2px ${accentColor}`,
                  }
                : {}
            }
          >
            {preview(v)}
            <span
              className="text-[9px] font-bold uppercase tracking-wide leading-none"
              style={{ color: selected ? accentColor : "#9ca3af" }}
            >
              {meta.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Typography / color helpers ───────────────────────────────────────────────

function resolveFontFamily(fontFamily?: string): string | undefined {
  if (!fontFamily) return undefined;
  const fontMap: Record<string, string> = {
    sans: "ui-sans-serif, system-ui, sans-serif",
    serif: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, monospace",
    inter: "'Inter', ui-sans-serif, system-ui, sans-serif",
    roboto: "'Roboto', ui-sans-serif, system-ui, sans-serif",
    poppins: "'Poppins', ui-sans-serif, system-ui, sans-serif",
    montserrat: "'Montserrat', ui-sans-serif, system-ui, sans-serif",
    playfair: "'Playfair Display', ui-serif, Georgia, serif",
    merriweather: "'Merriweather', ui-serif, Georgia, serif",
    bebasneue: "'Bebas Neue', sans-serif",
    oswald: "'Oswald', sans-serif",
    urbanist: "'Urbanist', ui-sans-serif, system-ui, sans-serif",
  };
  return fontMap[fontFamily] || fontFamily;
}

function getFontSizeClass(
  size: string | undefined,
  type: "title" | "subtitle" | "eyebrow" = "title",
): string {
  const sizeMap: Record<string, Record<string, string>> = {
    title: {
      "2xl": "text-2xl sm:text-3xl",
      "3xl": "text-3xl sm:text-4xl",
      "4xl": "text-4xl sm:text-5xl",
      "5xl": "text-5xl sm:text-6xl",
      "6xl": "text-6xl sm:text-7xl",
    },
    subtitle: {
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
    },
    eyebrow: { xs: "text-xs", sm: "text-sm", base: "text-base" },
  };
  return sizeMap[type][size || ""] || sizeMap[type]["base"] || "";
}

function getFontWeightClass(weight: string | undefined): string {
  const m: Record<string, string> = {
    light: "font-light",
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
    extrabold: "font-extrabold",
  };
  return m[weight || ""] || "";
}

function getTextAlignClass(align: string | undefined): string {
  return (
    { left: "text-left", center: "text-center", right: "text-right" }[
      align || ""
    ] || ""
  );
}

function getTextTransformClass(transform: string | undefined): string {
  return (
    {
      none: "",
      uppercase: "uppercase",
      lowercase: "lowercase",
      capitalize: "capitalize",
    }[transform || ""] || ""
  );
}

function resolveColor(color: string | undefined, defaultColor: string): string {
  if (!color) return defaultColor;
  const m: Record<string, string> = {
    primary: "var(--color-primary, #1a1a1a)",
    secondary: "var(--color-secondary, #f5f5f5)",
    accent: "var(--color-accent, #c9a96e)",
    muted: "var(--color-muted, #6b7280)",
    white: "#ffffff",
    black: "#000000",
    transparent: "transparent",
  };
  return m[color] || color;
}

function getGridClasses(variant: string, columns?: number): string {
  if (columns) {
    const colMap: Record<number, string> = {
      2: "grid-cols-1 sm:grid-cols-2",
      3: "grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      5: "grid-cols-2 sm:grid-cols-3 xl:grid-cols-5",
    };
    return colMap[columns] || colMap[4];
  }
  const variantMap: Record<string, string> = {
    "grid-2": "grid-cols-1 sm:grid-cols-2",
    "grid-3": "grid-cols-2 lg:grid-cols-3",
    "grid-4": "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    "grid-5": "grid-cols-2 sm:grid-cols-3 xl:grid-cols-5",
    masonry: "columns-1 sm:columns-2 lg:columns-3 xl:columns-4",
    compact: "grid-cols-2 lg:grid-cols-4 gap-0",
  };
  return variantMap[variant] || variantMap["grid-4"];
}

// ─── SectionHeader ────────────────────────────────────────────────────────────

function SectionHeader({
  title,
  subtitle,
  textColor,
  accentColor,
  onViewAll,
  showViewAll,
  eyebrowText = "Notre Selection",
  alignment = "left",
  fontFamily,
  viewAllText = "Voir tout",
  viewAllStyle = "text",
  headerConfig,
  showTitle = true,
  showSubtitle = true,
  showEyebrow = true,
  classes,
}: {
  title: string;
  subtitle?: string;
  textColor: string;
  accentColor: string;
  onViewAll: () => void;
  showViewAll: boolean;
  eyebrowText?: string;
  alignment?: "left" | "center" | "right";
  fontFamily?: string;
  viewAllText?: string;
  viewAllStyle?: "text" | "underline" | "outline" | "solid";
  headerConfig?: {
    eyebrow?: {
      fontFamily?: string;
      fontSize?: string;
      fontWeight?: string;
      textTransform?: string;
    };
    title?: {
      fontFamily?: string;
      fontSize?: string;
      fontWeight?: string;
      fontStyle?: string;
      textTransform?: string;
      textAlign?: string;
    };
    subtitle?: {
      fontFamily?: string;
      fontSize?: string;
      fontStyle?: string;
      textAlign?: string;
    };
  };
  showTitle?: boolean;
  showSubtitle?: boolean;
  showEyebrow?: boolean;
  classes?: {
    root?: string;
    title?: string;
    subtitle?: string;
    viewAll?: string;
  };
}) {
  const alignClasses = {
    left: "items-start text-left",
    center: "items-center text-center",
    right: "items-end text-right",
  };
  const viewAllClasses = {
    text: "border-transparent px-0 py-0",
    underline: "border-transparent px-0 py-0 underline underline-offset-4",
    outline: "rounded-full border px-4 py-2",
    solid: "rounded-full border px-4 py-2 text-white",
  };

  return (
    <motion.div
      className={cn(
        "mb-12 gap-4",
        alignment === "center"
          ? "flex flex-col items-center"
          : "flex flex-col sm:flex-row sm:items-end sm:justify-between",
        classes?.root,
      )}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={cn("flex flex-col", alignClasses[alignment])}>
        {showEyebrow && eyebrowText ? (
          <div
            className={cn(
              "mb-3 flex items-center gap-3",
              alignment === "center" && "justify-center",
              alignment === "right" && "justify-end",
            )}
          >
            <div
              className="h-px w-8"
              style={{ backgroundColor: accentColor }}
            />
            <span
              className={cn(
                "tracking-[0.3em]",
                getFontSizeClass(
                  headerConfig?.eyebrow?.fontSize || "sm",
                  "eyebrow",
                ),
                getFontWeightClass(
                  headerConfig?.eyebrow?.fontWeight || "semibold",
                ),
                getTextTransformClass(headerConfig?.eyebrow?.textTransform) ||
                  "uppercase",
              )}
              style={{
                color: accentColor,
                fontFamily: resolveFontFamily(
                  headerConfig?.eyebrow?.fontFamily,
                ),
              }}
            >
              {eyebrowText}
            </span>
          </div>
        ) : null}

        {showTitle && title ? (
          <h2
            className={cn(
              "tracking-tight leading-tight",
              getFontSizeClass(headerConfig?.title?.fontSize || "4xl", "title"),
              getFontWeightClass(headerConfig?.title?.fontWeight),
              getTextTransformClass(headerConfig?.title?.textTransform),
              headerConfig?.title?.fontStyle === "italic" && "italic",
              getTextAlignClass(headerConfig?.title?.textAlign),
              classes?.title,
            )}
            style={{
              color: textColor,
              fontFamily: resolveFontFamily(
                headerConfig?.title?.fontFamily || fontFamily,
              ),
            }}
          >
            {title}
          </h2>
        ) : null}

        {showSubtitle && subtitle ? (
          <p
            className={cn(
              "mt-2",
              getFontSizeClass(
                headerConfig?.subtitle?.fontSize || "base",
                "subtitle",
              ),
              headerConfig?.subtitle?.fontStyle === "italic" && "italic",
              getTextAlignClass(headerConfig?.subtitle?.textAlign),
              classes?.subtitle,
            )}
            style={{
              color: `${textColor}80`,
              fontFamily: resolveFontFamily(
                headerConfig?.subtitle?.fontFamily || fontFamily,
              ),
            }}
          >
            {subtitle}
          </p>
        ) : null}
      </div>

      {showViewAll ? (
        <button
          onClick={onViewAll}
          className={cn(
            "group flex shrink-0 items-center gap-2.5 text-sm font-medium uppercase tracking-[0.1em] transition-all",
            viewAllClasses[viewAllStyle],
            classes?.viewAll,
          )}
          style={{
            color: viewAllStyle === "solid" ? "#ffffff" : `${textColor}80`,
            borderColor:
              viewAllStyle === "outline" ? `${accentColor}50` : "transparent",
            backgroundColor:
              viewAllStyle === "solid" ? accentColor : "transparent",
          }}
        >
          <span className="group-hover:text-current transition-colors">
            {viewAllText}
          </span>
          <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
            <ArrowRight className="h-4 w-4" style={{ color: accentColor }} />
          </motion.div>
        </button>
      ) : null}
    </motion.div>
  );
}

// ─── ProductCard ──────────────────────────────────────────────────────────────

function ProductCard({
  product,
  accentColor,
  textColor,
  backgroundColor,
  onProductClick,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  index,
  cardVariant = "standard",
  cardConfig,
  classes,
}: {
  product: ProductGridItem;
  accentColor: string;
  textColor: string;
  backgroundColor: string;
  onProductClick: (p: ProductGridItem) => void;
  onAddToCart: (e: React.MouseEvent, p: ProductGridItem) => void;
  onToggleWishlist: (e: React.MouseEvent, p: ProductGridItem) => void;
  isWishlisted: boolean;
  index: number;
  cardVariant?: CardVariant;
  cardConfig?: ProductCardConfig;
  classes?: {
    card?: string;
    imageWrapper?: string;
    image?: string;
    imageSecondary?: string;
    badge?: string;
    wishlist?: string;
    quickView?: string;
    addToCart?: string;
    info?: string;
    title?: string;
    price?: string;
    oldPrice?: string;
    rating?: string;
  };
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(
          ((product.oldPrice - product.price) / product.oldPrice) * 100,
        )
      : null;

  const {
    image: imageConfig = {},
    info: infoConfig = {},
    badge: badgeConfig = {},
    quickView: showQuickView = true,
    wishlist: showWishlist = true,
    addToCart: addToCartConfig = {},
  } = cardConfig || {};
  const {
    aspectRatio = "3/4",
    hoverEffect = "zoom",
    hoverScale = 1.08,
    objectFit = "cover",
  } = imageConfig;
  const {
    showRating = true,
    showPrice = true,
    showBadge = true,
    alignment = "left",
  } = infoConfig;
  const { position: badgePosition = "top-left", style: badgeStyle = "pill" } =
    badgeConfig;
  const {
    show: showAddToCart = true,
    style: addToCartStyle = "solid",
    position: addToCartPosition = "bottom",
    size: addToCartSize = "md",
    text: addToCartText = "Ajouter au panier",
  } = addToCartConfig;

  // Resolve variant definition
  const variantDef = CARD_VARIANTS[cardVariant] || CARD_VARIANTS.standard;
  const effectiveTextColor = variantDef.invertText ? "#f4f4f5" : textColor;
  const wrapperStyle = variantDef.wrapperStyle({
    bg: backgroundColor,
    text: textColor,
    accent: accentColor,
  });

  const alignClasses = {
    left: "items-start text-left",
    center: "items-center text-center",
    right: "items-end text-right",
  };
  const badgePositionClasses = {
    "top-left": "top-3 left-3",
    "top-right": "top-3 right-3",
    "bottom-left": "bottom-3 left-3",
    "bottom-right": "bottom-3 right-3",
  };
  const addToCartSizeClasses: Record<string, string> = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-xs",
    lg: "px-6 py-3 text-sm",
  };
  const addToCartStyleClasses: Record<string, string> = {
    solid: "text-white",
    outline: "border-2 bg-transparent",
    ghost: "bg-transparent hover:bg-opacity-10",
    "icon-only": "p-2",
  };
  const hoverTransform =
    hoverEffect === "zoom" ? { scale: isHovered ? hoverScale : 1 } : {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={cn(
        "group relative flex flex-col cursor-pointer transition-shadow duration-300",
        variantDef.wrapperClass,
        classes?.card,
      )}
      style={wrapperStyle}
      onClick={() => onProductClick(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div
        className={cn(
          "relative overflow-hidden",
          variantDef.imageClass,
          classes?.imageWrapper,
        )}
        style={{ aspectRatio, backgroundColor: `${effectiveTextColor}08` }}
      >
        {!imageLoaded && (
          <div
            className="absolute inset-0 animate-pulse"
            style={{ backgroundColor: `${effectiveTextColor}08` }}
          />
        )}

        <motion.img
          src={product.image}
          alt={product.name}
          onLoad={() => setImageLoaded(true)}
          className={cn(
            "h-full w-full transition-opacity duration-300",
            imageLoaded ? "opacity-100" : "opacity-0",
            classes?.image,
          )}
          style={{
            objectFit,
            transition:
              "transform 0.7s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s",
          }}
          animate={hoverTransform}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        />

        {hoverEffect === "swap" && product.hoverImage && (
          <img
            src={product.hoverImage}
            alt={product.name}
            className={cn(
              "absolute inset-0 h-full w-full opacity-0 transition-opacity duration-500 group-hover:opacity-100",
              classes?.imageSecondary,
            )}
            style={{ objectFit }}
          />
        )}

        <div
          className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)",
          }}
        />

        {/* Badges */}
        <div
          className={cn(
            "absolute flex flex-col gap-1.5",
            badgePositionClasses[badgePosition],
          )}
        >
          {showBadge && badgeStyle !== "none" && product.badge && (
            <span
              className={cn(
                "px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white",
                badgeStyle === "pill" && "rounded-full",
                badgeStyle === "rectangle" && "rounded-none",
                classes?.badge,
              )}
              style={{ backgroundColor: accentColor }}
            >
              {product.badge}
            </span>
          )}
          {discount && (
            <span className="rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-white">
              -{discount}%
            </span>
          )}
        </div>

        {/* Wishlist */}
        {showWishlist && (
          <button
            onClick={(e) => onToggleWishlist(e, product)}
            className={cn(
              "absolute right-3 top-3 flex h-9 w-9 scale-90 items-center justify-center rounded-full backdrop-blur-md opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100",
              classes?.wishlist,
            )}
            style={{
              backgroundColor: isWishlisted
                ? accentColor
                : "rgba(255,255,255,0.9)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
            }}
          >
            <Heart
              className="h-4 w-4"
              style={{ color: isWishlisted ? "#fff" : textColor }}
              fill={isWishlisted ? "currentColor" : "none"}
            />
          </button>
        )}

        {/* Add to Cart — overlay */}
        {showAddToCart && addToCartPosition === "overlay" && (
          <div className="absolute bottom-3 left-3 right-3">
            <button
              type="button"
              onClick={(e) => onAddToCart(e, product)}
              className={cn(
                "w-full flex items-center justify-center gap-2 rounded-xl font-semibold tracking-wide transition-all",
                addToCartSizeClasses[addToCartSize],
                addToCartStyleClasses[addToCartStyle],
                addToCartStyle === "solid" && "hover:opacity-90",
                addToCartStyle === "outline" && "hover:bg-opacity-10",
                classes?.addToCart,
              )}
              style={{
                backgroundColor:
                  addToCartStyle === "solid" ? accentColor : "transparent",
                borderColor:
                  addToCartStyle === "outline" ? accentColor : "transparent",
                color: "#fff",
              }}
            >
              <ShoppingBag
                className={cn(
                  "flex-shrink-0",
                  addToCartSize === "sm"
                    ? "h-3 w-3"
                    : addToCartSize === "lg"
                      ? "h-4 w-4"
                      : "h-3.5 w-3.5",
                )}
              />
              {addToCartStyle !== "icon-only" && addToCartText}
            </button>
          </div>
        )}

        {/* Quick view + add to cart — slide up */}
        {addToCartPosition === "bottom" &&
          (showQuickView || showAddToCart) && (
            <div
              className={cn(
                "absolute bottom-0 left-0 right-0 flex translate-y-0 p-3 transition-transform duration-400 ease-out sm:translate-y-full sm:group-hover:translate-y-0",
                showQuickView && showAddToCart ? "gap-2" : "gap-0",
                classes?.quickView,
              )}
              style={{
                transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              {showQuickView && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onProductClick(product);
                  }}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold tracking-wide text-white backdrop-blur-md",
                    showAddToCart ? "flex-1" : "flex-1",
                  )}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.15)",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Voir
                </button>
              )}
              {showAddToCart && (
                <button
                  type="button"
                  onClick={(e) => onAddToCart(e, product)}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold tracking-wide text-white transition-all",
                    showQuickView ? "flex-[2]" : "flex-1",
                    classes?.addToCart,
                  )}
                  style={{ backgroundColor: accentColor }}
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  {addToCartText}
                </button>
              )}
            </div>
          )}
      </div>

      {/* Info */}
      <div
        className={cn(
          "flex flex-col gap-1.5 pt-4",
          alignClasses[alignment],
          variantDef.infoClass,
          classes?.info,
        )}
      >
        {showRating && product.rating != null && (
          <div className={cn("flex items-center gap-1.5", classes?.rating)}>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="h-3 w-3"
                  fill={
                    star <= Math.round(product.rating || 0)
                      ? accentColor
                      : "none"
                  }
                  style={{ color: accentColor }}
                />
              ))}
            </div>
            {product.reviewCount != null && (
              <span
                className="text-[11px]"
                style={{ color: `${effectiveTextColor}50` }}
              >
                ({product.reviewCount})
              </span>
            )}
          </div>
        )}
        <h3
          className={cn(
            "truncate text-sm font-medium leading-snug transition-opacity group-hover:opacity-80",
            classes?.title,
          )}
          style={{ color: effectiveTextColor }}
        >
          {product.name}
        </h3>
        {showPrice && (
          <div className="mt-0.5 flex items-center gap-2">
            <span
              className={cn("text-base font-semibold", classes?.price)}
              style={{ color: effectiveTextColor }}
            >
              {product.price.toLocaleString("fr-FR", {
                style: "currency",
                currency: "HTG",
                maximumFractionDigits: 0,
              })}
            </span>
            {product.oldPrice != null && product.oldPrice > product.price && (
              <span
                className={cn("text-sm line-through", classes?.oldPrice)}
                style={{ color: `${effectiveTextColor}45` }}
              >
                {product.oldPrice.toLocaleString("fr-FR", {
                  style: "currency",
                  currency: "HTG",
                  maximumFractionDigits: 0,
                })}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── NavBtn ───────────────────────────────────────────────────────────────────

function NavBtn({
  direction,
  onClick,
  accentColor,
}: {
  direction: "left" | "right";
  onClick: () => void;
  accentColor: string;
}) {
  const Icon = direction === "left" ? ChevronLeft : ChevronRight;
  return (
    <motion.button
      onClick={onClick}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all"
      style={{ borderColor: `${accentColor}40`, color: accentColor }}
      whileHover={{
        scale: 1.08,
        backgroundColor: accentColor,
        color: "#fff",
        borderColor: accentColor,
      }}
      whileTap={{ scale: 0.95 }}
    >
      <Icon className="h-4 w-4" />
    </motion.button>
  );
}

// ─── ProductGrid ──────────────────────────────────────────────────────────────

export function ProductGrid({
  id,
  testId,
  content = {},
  config = {},
  cardConfig,
  style = {},
  classes = {},
}: ProductGridProps) {
  const extendedConfig = config as ProductGridConfigExtras;
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useEcommerceStore();
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [visibleCount, setVisibleCount] = useState(0);

  const {
    title = "Selection",
    subtitle,
    products = [],
    filters,
    eyebrowText = "Notre Selection",
    viewAllButton,
    showTitle = true,
    showSubtitle = true,
    showEyebrowText = true,
  } = content;

  const {
    variant = "grid-4",
    cardStyle = "standard",
    showViewAllButton,
    viewAllButtonPosition = "header-right",
    viewAllButtonStyle = "text",
    showQuickView = true,
    showWishlist = true,
    loadMore = "button",
    productsPerPage = 8,
    animation = { entrance: "slide-up", stagger: true },
    slides,
  } = extendedConfig;

  // ── Active card variant — 3-level priority ──
  // 1. cardConfig.style.variant (per-instance override)
  // 2. config.cardVariant (registry setting)
  // 3. config.cardStyle (legacy fallback)
  const activeCardVariant: CardVariant =
    (cardConfig?.style?.variant as CardVariant) ||
    extendedConfig.cardVariant ||
    (cardStyle as CardVariant) ||
    "standard";

  const parsedColumns =
    typeof extendedConfig.columns === "string"
      ? parseInt(extendedConfig.columns, 10)
      : extendedConfig.columns;
  const columns =
    parsedColumns ||
    (variant.includes("grid-") ? parseInt(variant.split("-")[1], 10) : 4);

  const {
    colors: styleColors = {},
    spacing: styleSpacing = {},
    typography: styleTypography = {},
  } = style;
  const {
    background: backgroundColor = "white",
    text: textColor = "#1a1a1a",
    accent: accentColor = "#c9a96e",
  } = styleColors;
  const { container = "contained", paddingY = "16", gap = "6" } = styleSpacing;
  const { textAlign: styleTextAlign = "left" } = styleTypography;

  const headerConfig = extendedConfig?.header;
  const eyebrowConfig = headerConfig?.eyebrow;
  const titleConfig = headerConfig?.title;
  const subtitleConfig = headerConfig?.subtitle;

  const effectiveAlignment = (titleConfig?.textAlign ||
    extendedConfig.titleAlignment ||
    styleTextAlign ||
    "left") as "left" | "center" | "right";

  const perPage =
    Number.isFinite(Number(productsPerPage)) && Number(productsPerPage) > 0
      ? Number(productsPerPage)
      : products.length;
  useEffect(() => {
    setVisibleCount(perPage);
  }, [perPage, products.length]);

  const handleProductClick = (product: ProductGridItem) => {
    const targetHref =
      typeof product.href === "string" && product.href.trim().length > 0
        ? product.href
        : typeof product.link === "string" && product.link.trim().length > 0
          ? product.link
          : "";
    if (targetHref) {
      navigate(targetHref);
      return;
    }
    navigate("product", { id: product.id });
  };

  const handleAddToCart = (
    event: React.MouseEvent,
    product: ProductGridItem,
  ) => {
    event.stopPropagation();
    addToCart(
      buildCartProduct({
        ...product,
        sellerId:
          (content as Record<string, any>).storefrontStore?.sellerId ||
          (product as Record<string, any>).sellerId,
        storeSlug:
          (content as Record<string, any>).storefrontStore?.storeSlug ||
          (product as Record<string, any>).storeSlug,
      }),
      1,
    );
    toast.success(`${product.name} ajoute au panier`);
  };

  const handleToggleWishlist = (
    event: React.MouseEvent,
    product: ProductGridItem,
  ) => {
    event.stopPropagation();
    const wasInWishlisted = isInWishlist(product.id);
    toggleWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: "",
      sellerId:
        (content as Record<string, any>).storefrontStore?.sellerId ||
        (product as Record<string, any>).sellerId,
      storeSlug:
        (content as Record<string, any>).storefrontStore?.storeSlug ||
        (product as Record<string, any>).storeSlug,
    });
    toast.success(
      wasInWishlisted ? "Retire des favoris" : "Ajoute aux favoris",
    );
  };

  const handleViewAll = () => navigate(viewAllButton?.href || "/produits");
  const scrollCarousel = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({
      left:
        direction === "left"
          ? -carouselRef.current.clientWidth * 0.8
          : carouselRef.current.clientWidth * 0.8,
      behavior: "smooth",
    });
  };

  if (!products.length) return null;

  const isCarousel =
    variant === "horizontal" || variant === "carousel" || slides?.enabled;
  const shouldShowViewAll = showViewAllButton ?? filters?.enabled ?? false;
  const slidesToShow = slides?.slidesToShow || 4;
  const showLoadMore =
    loadMore === "button" &&
    !isCarousel &&
    perPage > 0 &&
    visibleCount < products.length;

  const visibleProducts = products.slice(
    0,
    isCarousel && slides?.enabled
      ? Math.min(products.length, slidesToShow * 2)
      : isCarousel
        ? perPage
        : loadMore === "button"
          ? visibleCount
          : perPage,
  );

  const resolvedBg = resolveColor(backgroundColor, "#ffffff");
  const resolvedText = resolveColor(textColor, "#1a1a1a");
  const resolvedAccent = resolveColor(accentColor, "#c9a96e");
  type ProductCardStyleVariant = NonNullable<ProductCardConfig["style"]>["variant"];
  const resolvedProductCardVariant: ProductCardStyleVariant =
    activeCardVariant === "standard" ||
    activeCardVariant === "minimal" ||
    activeCardVariant === "luxury" ||
    activeCardVariant === "elegant"
      ? activeCardVariant
      : "card";

  // Build effectiveCardConfig with all fields forwarded
  const effectiveCardConfig: ProductCardConfig = {
    image: {
      aspectRatio: cardConfig?.image?.aspectRatio || "3/4",
      hoverEffect: cardConfig?.image?.hoverEffect || "zoom",
      hoverScale: cardConfig?.image?.hoverScale ?? 1.08,
      objectFit: cardConfig?.image?.objectFit || "cover",
    },
    info: {
      alignment:
        cardConfig?.info?.alignment ||
        (effectiveAlignment as "left" | "center" | "right"),
      showRating: cardConfig?.info?.showRating ?? true,
      showPrice: cardConfig?.info?.showPrice ?? true,
      showBadge: cardConfig?.info?.showBadge ?? true,
    },
    badge: {
      position: cardConfig?.badge?.position || "top-left",
      style: cardConfig?.badge?.style || "pill",
    },
    quickView: showQuickView ?? cardConfig?.quickView ?? true,
    wishlist: showWishlist ?? cardConfig?.wishlist ?? true,
    addToCart: {
      show: cardConfig?.addToCart?.show ?? true,
      style: cardConfig?.addToCart?.style || "solid",
      position: cardConfig?.addToCart?.position || "bottom",
      size: cardConfig?.addToCart?.size || "md",
      text: cardConfig?.addToCart?.text || "Ajouter au panier",
    },
    style: {
      variant: resolvedProductCardVariant,
      borderRadius: cardConfig?.style?.borderRadius || "md",
      shadow: cardConfig?.style?.shadow || "none",
    },
  };

  const gapClass =
    gap === "0"
      ? "gap-0"
      : gap === "2"
        ? "gap-2"
        : gap === "4"
          ? "gap-4"
          : gap === "6"
            ? "gap-5 lg:gap-7"
            : gap === "8"
              ? "gap-8"
              : "gap-5 lg:gap-7";

  const sharedCardProps = {
    accentColor: resolvedAccent,
    textColor: resolvedText,
    backgroundColor: resolvedBg,
    onProductClick: handleProductClick,
    onAddToCart: handleAddToCart,
    onToggleWishlist: handleToggleWishlist,
    cardVariant: activeCardVariant,
    cardConfig: effectiveCardConfig,
    classes: {
      card: classes.productCard,
      imageWrapper: classes.cardImageWrapper,
      image: classes.cardImage,
      imageSecondary: classes.cardImageSecondary,
      badge: classes.cardBadge,
      wishlist: classes.cardWishlist,
      quickView: classes.cardQuickView,
      addToCart: classes.cardAddToCart,
      info: classes.cardInfo,
      title: classes.cardTitle,
      price: classes.cardPrice,
      oldPrice: classes.cardOldPrice,
      rating: classes.cardRating,
    },
  };

  return (
    <SectionWrapper
      id={id}
      testId={testId}
      as="section"
      animation={animation}
      className={cn("relative w-full overflow-hidden", classes.root)}
      style={{ backgroundColor: resolvedBg, color: resolvedText }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${resolvedText} 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      <SectionContainer
        size={container}
        className={cn("relative", classes.container)}
        style={{
          paddingTop: `${parseInt(String(paddingY), 10) * 0.25}rem`,
          paddingBottom: `${parseInt(String(paddingY), 10) * 0.25}rem`,
        }}
      >
        <SectionHeader
          title={title}
          subtitle={subtitle}
          textColor={resolvedText}
          accentColor={resolvedAccent}
          onViewAll={handleViewAll}
          showViewAll={
            shouldShowViewAll && viewAllButtonPosition === "header-right"
          }
          eyebrowText={eyebrowText}
          alignment={effectiveAlignment}
          fontFamily={resolveFontFamily(titleConfig?.fontFamily)}
          viewAllText={viewAllButton?.text || "Voir tout"}
          viewAllStyle={viewAllButtonStyle}
          headerConfig={{
            eyebrow: eyebrowConfig,
            title: titleConfig,
            subtitle: subtitleConfig,
          }}
          showTitle={showTitle}
          showSubtitle={showSubtitle}
          showEyebrow={showEyebrowText}
          classes={{
            root: classes.header,
            title: classes.title,
            subtitle: classes.subtitle,
            viewAll: classes.filterBar,
          }}
        />

        {shouldShowViewAll && viewAllButtonPosition === "header-bottom" && (
          <div
            className={cn(
              "mb-8 flex",
              effectiveAlignment === "center" && "justify-center",
              effectiveAlignment === "right" && "justify-end",
            )}
          >
            <button
              onClick={handleViewAll}
              className="group inline-flex items-center gap-2.5 text-sm font-medium uppercase tracking-[0.1em] transition-all"
              style={{ color: resolvedAccent }}
            >
              <span>{viewAllButton?.text || "Voir tout"}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        )}

        {isCarousel && (
          <div className="mb-4 flex justify-end gap-2">
            <NavBtn
              direction="left"
              onClick={() => scrollCarousel("left")}
              accentColor={resolvedAccent}
            />
            <NavBtn
              direction="right"
              onClick={() => scrollCarousel("right")}
              accentColor={resolvedAccent}
            />
          </div>
        )}

        {isCarousel ? (
          <div
            ref={carouselRef}
            className={cn(
              "flex gap-5 overflow-x-auto scroll-smooth pb-4",
              classes.grid,
            )}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {visibleProducts.map((product, index) => (
              <div
                key={product.id}
                className="min-w-[220px] shrink-0 sm:min-w-[260px] lg:min-w-[280px]"
              >
                <ProductCard
                  product={product}
                  index={index}
                  isWishlisted={isInWishlist(product.id)}
                  {...sharedCardProps}
                />
              </div>
            ))}
          </div>
        ) : (
          <div
            className={cn(
              "grid",
              getGridClasses(variant, columns),
              gapClass,
              classes.grid,
            )}
          >
            {visibleProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                isWishlisted={isInWishlist(product.id)}
                {...sharedCardProps}
              />
            ))}
          </div>
        )}

        {showLoadMore && (
          <motion.div
            className={cn("mt-14 text-center", classes.loadMore)}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <motion.button
              onClick={() =>
                setVisibleCount((c) => Math.min(c + perPage, products.length))
              }
              className="group inline-flex items-center gap-3 rounded-full px-10 py-4 text-sm font-semibold uppercase tracking-[0.12em] transition-all"
              style={{ backgroundColor: resolvedAccent, color: "#fff" }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Voir plus de produits
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </motion.button>
          </motion.div>
        )}

        {shouldShowViewAll && viewAllButtonPosition === "footer" && (
          <motion.div
            className={cn(
              "mt-10 flex",
              effectiveAlignment === "center" && "justify-center",
              effectiveAlignment === "right" && "justify-end",
            )}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <button
              onClick={handleViewAll}
              className="group inline-flex items-center gap-2.5 text-sm font-medium uppercase tracking-[0.1em] transition-all"
              style={{ color: resolvedAccent }}
            >
              <span>{viewAllButton?.text || "Voir tout"}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>
        )}
      </SectionContainer>
    </SectionWrapper>
  );
}

Object.assign(ProductGrid, { schema: productGridSchema });
export const schema = productGridSchema;
export default ProductGrid;
