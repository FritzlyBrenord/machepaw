"use client";

// ============================================
// CHECKOUT SUMMARY — 100% Configurable Architecture
// ============================================

import { Edit2 } from "lucide-react";
import { motion } from "framer-motion";
import { SectionWrapper, SectionContainer } from "@/components/SectionWrapper";
import { cn, useSectionStyles } from "@/hooks/useSectionStyles";
import { checkoutSummarySchema } from "./CheckoutSummary.schema";

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────
export interface CheckoutItem {
  id: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
}

export interface CheckoutSummaryContent {
  title?: string;
  editLabel?: string;
  subtotalLabel?: string;
  shippingLabel?: string;
  discountLabel?: string;
  totalLabel?: string;
  items?: CheckoutItem[];
  subtotal?: number;
  shipping?: number;
  discount?: number;
  total?: number;
}

export interface CheckoutSummaryConfig {
  showItemImages?: boolean;
  editable?: boolean;
  showDiscount?: boolean;
  animation?: {
    entrance?: "fade-in" | "slide-up" | "scale-in" | "none";
  };
}

export interface CheckoutSummaryStyle {
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
  };
}

export interface CheckoutSummaryClasses {
  root?: string;
  card?: string;
  title?: string;
  editButton?: string;
  items?: string;
  item?: string;
  itemImage?: string;
  itemDetails?: string;
  subtotal?: string;
  shipping?: string;
  discount?: string;
  total?: string;
}

export interface CheckoutSummaryProps {
  id?: string;
  testId?: string;
  content?: CheckoutSummaryContent;
  config?: CheckoutSummaryConfig;
  style?: CheckoutSummaryStyle;
  classes?: CheckoutSummaryClasses;
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
// MAIN CHECKOUT SUMMARY COMPONENT
// ─────────────────────────────────────────
export function CheckoutSummary({
  id,
  testId,
  content = {},
  config = {},
  style = {},
  classes = {},
}: CheckoutSummaryProps) {
  // ── EXTRACT CONTENT ──
  const {
    title = "Résumé de la commande",
    editLabel = "Modifier",
    subtotalLabel = "Sous-total",
    shippingLabel = "Livraison",
    discountLabel = "Réduction",
    totalLabel = "Total",
    items = [],
    subtotal = 0,
    shipping = 0,
    discount = 0,
    total = 0,
  } = content;

  // ── EXTRACT CONFIG ──
  const {
    showItemImages = true,
    editable = true,
    showDiscount = true,
    animation = { entrance: "fade-in" },
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

  const { container = "narrow", paddingY = "10" } = styleSpacing;

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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={cn("p-6 rounded-lg border", classes?.card)}
          style={{
            borderColor: resolvedBorderColor,
            backgroundColor: resolvedCardBgColor,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className={cn("text-lg font-semibold", classes?.title)}
              style={{ color: resolvedTextColor }}
            >
              {title}
            </h3>
            {editable && (
              <button
                className={cn(
                  "text-sm flex items-center gap-1",
                  classes?.editButton,
                )}
                style={{ color: resolvedAccentColor }}
              >
                <Edit2 className="w-4 h-4" />
                {editLabel}
              </button>
            )}
          </div>

          {/* Items */}
          <div className={cn("space-y-4 mb-4", classes?.items)}>
            {items.map((item) => (
              <div key={item.id} className={cn("flex gap-4", classes?.item)}>
                {showItemImages && (
                  <div
                    className={cn(
                      "w-16 h-16 rounded overflow-hidden flex-shrink-0",
                      classes?.itemImage,
                    )}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className={cn("flex-1", classes?.itemDetails)}>
                  <p
                    className="font-medium"
                    style={{ color: resolvedTextColor }}
                  >
                    {item.name}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: `${resolvedTextColor}99` }}
                  >
                    Qté: {item.quantity}
                  </p>
                </div>
                <p
                  className="font-semibold"
                  style={{ color: resolvedTextColor }}
                >
                  {(item.price * item.quantity).toFixed(2)}€
                </p>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div
            className="border-t my-4"
            style={{ borderColor: resolvedBorderColor }}
          />

          {/* Summary */}
          <div className="space-y-2">
            <div className={cn("flex justify-between", classes?.subtotal)}>
              <span style={{ color: `${resolvedTextColor}99` }}>
                {subtotalLabel}
              </span>
              <span style={{ color: resolvedTextColor }}>
                {subtotal.toFixed(2)}€
              </span>
            </div>
            <div className={cn("flex justify-between", classes?.shipping)}>
              <span style={{ color: `${resolvedTextColor}99` }}>
                {shippingLabel}
              </span>
              <span style={{ color: resolvedTextColor }}>
                {shipping === 0 ? "Gratuit" : `${shipping.toFixed(2)}€`}
              </span>
            </div>
            {showDiscount && discount > 0 && (
              <div className={cn("flex justify-between", classes?.discount)}>
                <span style={{ color: `${resolvedTextColor}99` }}>
                  {discountLabel}
                </span>
                <span style={{ color: resolvedAccentColor }}>
                  -{discount.toFixed(2)}€
                </span>
              </div>
            )}
            <div
              className="border-t pt-2 mt-2"
              style={{ borderColor: resolvedBorderColor }}
            >
              <div
                className={cn(
                  "flex justify-between font-bold text-lg",
                  classes?.total,
                )}
              >
                <span style={{ color: resolvedTextColor }}>{totalLabel}</span>
                <span style={{ color: resolvedAccentColor }}>
                  {total.toFixed(2)}€
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </SectionContainer>
    </SectionWrapper>
  );
}

export default CheckoutSummary;

Object.assign(CheckoutSummary, { schema: checkoutSummarySchema });

export const schema = checkoutSummarySchema;
