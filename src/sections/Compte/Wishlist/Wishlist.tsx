"use client";

// ============================================
// WISHLIST — 100% Configurable Architecture
// ============================================

import { ShoppingBag, X, Heart } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SectionWrapper, SectionContainer } from "@/components/SectionWrapper";
import { useCart } from "@/store";
import { buildCartProduct } from "@/lib/cart-product";
import { cn, useSectionStyles } from "@/hooks/useSectionStyles";
import { wishlistSchema } from "./Wishlist.schema";

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────
export interface WishlistProduct {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  inStock?: boolean;
}

export interface WishlistContent {
  title?: string;
  emptyMessage?: string;
  addToCartText?: string;
  removeText?: string;
  products?: WishlistProduct[];
}

export interface WishlistConfig {
  columns?: 2 | 3 | 4;
  showAddToCart?: boolean;
  showRemove?: boolean;
  showStockStatus?: boolean;
  animation?: {
    entrance?: "fade-in" | "slide-up" | "scale-in" | "none";
    stagger?: boolean;
  };
}

export interface WishlistStyle {
  colors?: {
    background?: string;
    text?: string;
    accent?: string;
    cardBg?: string;
    border?: string;
  };
  spacing?: {
    paddingY?: string;
    container?: "full" | "contained" | "narrow";
    gap?: string;
  };
}

export interface WishlistClasses {
  root?: string;
  title?: string;
  emptyState?: string;
  grid?: string;
  card?: string;
  image?: string;
  productName?: string;
  price?: string;
  oldPrice?: string;
  addToCartButton?: string;
  removeButton?: string;
}

export interface WishlistProps {
  id?: string;
  testId?: string;
  content?: WishlistContent;
  config?: WishlistConfig;
  style?: WishlistStyle;
  classes?: WishlistClasses;
}

// ─────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────
function resolveColor(color: string | undefined, defaultColor: string): string {
  if (!color) return defaultColor;
  const colorMap: Record<string, string> = {
    primary: "var(--color-primary, #1a1a1a)",
    secondary: "var(--color-secondary, #f5f5f5)",
    accent: "var(--color-accent, #c9a96e)",
    muted: "var(--color-muted, #6b7280)",
    white: "#ffffff",
    black: "#000000",
    transparent: "transparent",
  };
  return colorMap[color] || color;
}

// ─────────────────────────────────────────
// MAIN WISHLIST COMPONENT
// ─────────────────────────────────────────
export function Wishlist({
  id,
  testId,
  content = {},
  config = {},
  style = {},
  classes = {},
}: WishlistProps) {
  // ── EXTRACT CONTENT ──
  const {
    title = "Ma Liste de Souhaits",
    emptyMessage = "Votre liste de souhaits est vide",
    addToCartText = "Ajouter au panier",
    removeText = "Retirer",
    products: initialProducts = [],
  } = content;

  // ── EXTRACT CONFIG ──
  const {
    columns = 4,
    showAddToCart = true,
    showRemove = true,
    showStockStatus = true,
    animation = { entrance: "fade-in", stagger: true },
  } = config;

  // ── EXTRACT STYLE ──
  const { colors: styleColors = {}, spacing: styleSpacing = {} } = style;

  const {
    background: backgroundColor = "white",
    text: textColor = "primary",
    accent: accentColor = "accent",
    cardBg: cardBgColor = "white",
    border: borderColor,
  } = styleColors;

  const { container = "contained", paddingY = "16", gap = "6" } = styleSpacing;

  // ── STATE ──
  const [products, setProducts] = useState(initialProducts);

  // ── HOOKS ──
  const { addToCart } = useCart();
  const { css } = useSectionStyles(style);

  // ── HELPERS ──
  const resolvedBgColor = resolveColor(backgroundColor, "#ffffff");
  const resolvedTextColor = resolveColor(textColor, "#1a1a1a");
  const resolvedAccentColor = resolveColor(accentColor, "#c9a96e");
  const resolvedCardBgColor = resolveColor(cardBgColor, "#ffffff");
  const resolvedBorderColor = borderColor
    ? resolveColor(borderColor, "#e5e5e5")
    : "#e5e5e5";

  const removeProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const handleAddToCart = (product: WishlistProduct) => {
    addToCart(
      buildCartProduct({
        id: product.id,
        name: product.name,
        price: product.price,
        oldPrice: product.oldPrice,
        image: product.image,
        inStock: product.inStock,
      }),
      1,
    );
    toast.success(`${product.name} ajouté au panier`);
  };

  const columnClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  }[columns];

  // ── RENDER ──
  return (
    <SectionWrapper
      id={id}
      testId={testId}
      as="section"
      animation={animation}
      className={cn("w-full", classes?.root)}
      style={{
        backgroundColor: resolvedBgColor,
        color: resolvedTextColor,
        ...css,
      }}
    >
      <SectionContainer
        size={container}
        style={{
          paddingTop: `${parseInt(paddingY) * 0.25}rem`,
          paddingBottom: `${parseInt(paddingY) * 0.25}rem`,
        }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={cn("text-2xl font-bold mb-6", classes?.title)}
          style={{ color: resolvedTextColor }}
        >
          {title}
        </motion.h2>

        {products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn("text-center py-16", classes?.emptyState)}
          >
            <Heart
              className="w-16 h-16 mx-auto mb-4"
              style={{ color: `${resolvedTextColor}33` }}
            />
            <p className="text-lg" style={{ color: `${resolvedTextColor}99` }}>
              {emptyMessage}
            </p>
          </motion.div>
        ) : (
          <div
            className={cn("grid", columnClasses, classes?.grid)}
            style={{ gap: `${parseInt(gap) * 0.25}rem` }}
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "group relative rounded-lg border overflow-hidden",
                  classes?.card,
                )}
                style={{
                  backgroundColor: resolvedCardBgColor,
                  borderColor: resolvedBorderColor,
                }}
              >
                {/* Image */}
                <div
                  className={cn(
                    "relative aspect-square overflow-hidden bg-gray-100",
                    classes?.image,
                  )}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  {showRemove && (
                    <button
                      onClick={() => removeProduct(product.id)}
                      className={cn(
                        "absolute top-3 right-3 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
                        classes?.removeButton,
                      )}
                      style={{ backgroundColor: resolvedAccentColor }}
                      title={removeText}
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  )}
                  {showStockStatus && !product.inStock && (
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                    >
                      <span className="text-white font-medium px-3 py-1 rounded bg-black/50">
                        Rupture de stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3
                    className={cn("font-medium mb-2", classes?.productName)}
                    style={{ color: resolvedTextColor }}
                  >
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <span
                        className={cn("font-bold", classes?.price)}
                        style={{ color: resolvedAccentColor }}
                      >
                        {product.price}€
                      </span>
                      {product.oldPrice && (
                        <span
                          className={cn(
                            "ml-2 line-through text-sm",
                            classes?.oldPrice,
                          )}
                          style={{ color: `${resolvedTextColor}66` }}
                        >
                          {product.oldPrice}€
                        </span>
                      )}
                    </div>
                    {showAddToCart && product.inStock && (
                      <Button
                        type="button"
                        size="sm"
                        className={cn(classes?.addToCartButton)}
                        style={{
                          backgroundColor: resolvedAccentColor,
                          color: "#ffffff",
                        }}
                        onClick={() => handleAddToCart(product)}
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </SectionContainer>
    </SectionWrapper>
  );
}

export default Wishlist;

Object.assign(Wishlist, { schema: wishlistSchema });

export const schema = wishlistSchema;
