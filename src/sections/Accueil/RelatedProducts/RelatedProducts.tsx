"use client";

// ============================================
// RELATED PRODUCTS — 100% Configurable Architecture
// ============================================

import { Star, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/store";
import { buildCartProduct } from "@/lib/cart-product";
import { toast } from "sonner";
import { useNavigate } from "@/lib/router";
import { SectionWrapper, SectionContainer } from "@/components/SectionWrapper";
import { cn, useSectionStyles } from "@/hooks/useSectionStyles";
import relatedProductsSchema from "./RelatedProducts.schema";

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────
export interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  rating?: number;
  category?: string;
}

export interface RelatedProductsContent {
  title?: string;
  products?: RelatedProduct[];
}

export interface RelatedProductsConfig {
  columns?: 2 | 3 | 4 | 5;
  showAddToCart?: boolean;
  showRating?: boolean;
  animation?: {
    entrance?: "fade-in" | "slide-up" | "scale-in" | "none";
    stagger?: boolean;
  };
}

export interface RelatedProductsStyle {
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

export interface RelatedProductsClasses {
  root?: string;
  title?: string;
  grid?: string;
  card?: string;
  image?: string;
  productName?: string;
  price?: string;
  addToCartButton?: string;
}

export interface RelatedProductsProps {
  id?: string;
  testId?: string;
  content?: RelatedProductsContent;
  config?: RelatedProductsConfig;
  style?: RelatedProductsStyle;
  classes?: RelatedProductsClasses;
  storefrontStore?: {
    sellerId?: string;
    storeSlug?: string;
  };
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
// MAIN RELATED PRODUCTS COMPONENT
// ─────────────────────────────────────────
export function RelatedProducts({
  id,
  testId,
  content = {},
  config = {},
  style = {},
  classes = {},
  storefrontStore,
}: RelatedProductsProps) {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // ── EXTRACT CONTENT ──
  const { title = "Produits similaires", products = [] } = content;

  // ── EXTRACT CONFIG ──
  const {
    columns = 4,
    showAddToCart = true,
    showRating = true,
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

  // ── HOOKS ──
  const { css } = useSectionStyles(style);

  // ── HELPERS ──
  const resolvedBgColor = resolveColor(backgroundColor, "#ffffff");
  const resolvedTextColor = resolveColor(textColor, "#1a1a1a");
  const resolvedAccentColor = resolveColor(accentColor, "#c9a96e");
  const resolvedCardBgColor = resolveColor(cardBgColor, "#ffffff");
  const resolvedBorderColor = borderColor
    ? resolveColor(borderColor, "#e5e5e5")
    : "#e5e5e5";

  const columnClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
  }[columns];

  const handleAddToCart = (e: React.MouseEvent, product: RelatedProduct) => {
    e.stopPropagation();
    addToCart(
      buildCartProduct({
        ...product,
        sellerId: storefrontStore?.sellerId,
        storeSlug: storefrontStore?.storeSlug,
        images: [product.image],
      }),
      1,
    );
    toast.success(`${product.name} ajouté au panier`);
  };

  const handleProductClick = (productId: string) => {
    navigate("product", { id: productId });
  };

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
          className={cn("text-2xl sm:text-3xl font-bold mb-8", classes?.title)}
          style={{ color: resolvedTextColor }}
        >
          {title}
        </motion.h2>

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
              onClick={() => handleProductClick(product.id)}
              className={cn(
                "group rounded-lg overflow-hidden border cursor-pointer transition-all hover:shadow-lg",
                classes?.card,
              )}
              style={{
                backgroundColor: resolvedCardBgColor,
                borderColor: resolvedBorderColor,
              }}
            >
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
                {showAddToCart && (
                  <button
                    type="button"
                    onClick={(e) => handleAddToCart(e, product)}
                    className={cn(
                      "absolute bottom-3 right-3 rounded-full p-3 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100",
                      classes?.addToCartButton,
                    )}
                    style={{ backgroundColor: resolvedAccentColor }}
                  >
                    <ShoppingBag className="w-5 h-5 text-white" />
                  </button>
                )}
              </div>
              <div className="p-4">
                <h3
                  className={cn("font-medium mb-1", classes?.productName)}
                  style={{ color: resolvedTextColor }}
                >
                  {product.name}
                </h3>
                {showRating && product.rating && (
                  <div className="flex items-center gap-1 mb-2">
                    <Star
                      className="w-4 h-4 fill-current"
                      style={{ color: resolvedAccentColor }}
                    />
                    <span
                      className="text-sm"
                      style={{ color: `${resolvedTextColor}99` }}
                    >
                      {product.rating}
                    </span>
                  </div>
                )}
                <span
                  className={cn("font-bold", classes?.price)}
                  style={{ color: resolvedTextColor }}
                >
                  {product.price}€
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionContainer>
    </SectionWrapper>
  );
}

Object.assign(RelatedProducts, { schema: relatedProductsSchema });

export const schema = relatedProductsSchema;

export default RelatedProducts;
