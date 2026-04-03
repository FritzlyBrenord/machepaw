"use client";

// ============================================
// PAYMENT METHODS — 100% Configurable Architecture
// ============================================

import { CreditCard, Wallet, Smartphone, Lock, Check } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { SectionWrapper, SectionContainer } from "@/components/SectionWrapper";
import { cn, useSectionStyles } from "@/hooks/useSectionStyles";
import { paymentMethodsSchema } from "./PaymentMethods.schema";

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────
export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

export interface PaymentMethodsContent {
  title?: string;
  methods?: PaymentMethod[];
  securityLabel?: string;
}

export interface PaymentMethodsConfig {
  showSecurityBadges?: boolean;
  layout?: "list" | "grid";
  animation?: {
    entrance?: "fade-in" | "slide-up" | "scale-in" | "none";
  };
}

export interface PaymentMethodsStyle {
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

export interface PaymentMethodsClasses {
  root?: string;
  title?: string;
  methods?: string;
  method?: string;
  selectedMethod?: string;
  securityBadge?: string;
}

export interface PaymentMethodsProps {
  id?: string;
  testId?: string;
  content?: PaymentMethodsContent;
  config?: PaymentMethodsConfig;
  style?: PaymentMethodsStyle;
  classes?: PaymentMethodsClasses;
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
// MAIN PAYMENT METHODS COMPONENT
// ─────────────────────────────────────────
export function PaymentMethods({
  id,
  testId,
  content = {},
  config = {},
  style = {},
  classes = {},
}: PaymentMethodsProps) {
  // ── EXTRACT CONTENT ──
  const {
    title = "Moyens de paiement",
    methods = [],
    securityLabel = "Paiement sécurisé SSL",
  } = content;

  // ── EXTRACT CONFIG ──
  const {
    showSecurityBadges = true,
    layout = "list",
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

  // ── STATE ──
  const [selectedMethod, setSelectedMethod] = useState(methods[0]?.id);

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

  const iconMap: Record<string, React.ElementType> = {
    CreditCard,
    Wallet,
    Smartphone,
    Calendar: Check,
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
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={cn("text-lg font-semibold mb-4", classes?.title)}
          style={{ color: resolvedTextColor }}
        >
          {title}
        </motion.h3>

        <div
          className={cn(
            `space-y-3 ${layout === "grid" ? "grid grid-cols-2 gap-3" : ""}`,
            classes?.methods,
          )}
        >
          {methods.map((method) => {
            const Icon = iconMap[method.icon] || CreditCard;
            const isSelected = selectedMethod === method.id;

            return (
              <motion.button
                key={method.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                onClick={() => setSelectedMethod(method.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-4 rounded-lg border transition-all",
                  isSelected ? classes?.selectedMethod : classes?.method,
                )}
                style={{
                  borderColor: isSelected
                    ? resolvedAccentColor
                    : resolvedBorderColor,
                  backgroundColor: isSelected
                    ? `${resolvedAccentColor}10`
                    : resolvedCardBgColor,
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: isSelected
                      ? resolvedAccentColor
                      : `${resolvedTextColor}10`,
                  }}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{
                      color: isSelected ? "#ffffff" : resolvedTextColor,
                    }}
                  />
                </div>
                <div className="flex-1 text-left">
                  <p
                    className="font-medium"
                    style={{ color: resolvedTextColor }}
                  >
                    {method.name}
                  </p>
                  {method.description && (
                    <p
                      className="text-sm"
                      style={{ color: `${resolvedTextColor}99` }}
                    >
                      {method.description}
                    </p>
                  )}
                </div>
                {isSelected && (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: resolvedAccentColor }}
                  >
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {showSecurityBadges && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={cn(
              "flex items-center gap-2 mt-4 pt-4 border-t",
              classes?.securityBadge,
            )}
            style={{ borderColor: resolvedBorderColor }}
          >
            <Lock className="w-4 h-4" style={{ color: resolvedAccentColor }} />
            <span
              className="text-sm"
              style={{ color: `${resolvedTextColor}99` }}
            >
              {securityLabel}
            </span>
          </motion.div>
        )}
      </SectionContainer>
    </SectionWrapper>
  );
}

export default PaymentMethods;

Object.assign(PaymentMethods, { schema: paymentMethodsSchema });

export const schema = paymentMethodsSchema;
