"use client";

// ============================================
// CHECKOUT FORM — 100% Configurable Architecture
// ============================================

import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionWrapper, SectionContainer } from "@/components/SectionWrapper";
import { cn, useSectionStyles } from "@/hooks/useSectionStyles";
import { checkoutFormSchema } from "./CheckoutForm.schema";

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────
export interface CheckoutFormContent {
  title?: string;
  steps?: string[] | string;
}

export interface CheckoutFormConfig {
  currentStep?: number;
  showSteps?: boolean;
  animation?: {
    entrance?: "fade-in" | "slide-up" | "scale-in" | "none";
  };
}

export interface CheckoutFormStyle {
  colors?: {
    background?: string;
    text?: string;
    accent?: string;
  };
  spacing?: {
    paddingY?: string;
    container?: "full" | "contained" | "narrow";
  };
}

export interface CheckoutFormClasses {
  root?: string;
  title?: string;
  steps?: string;
  stepIndicator?: string;
  form?: string;
}

export interface CheckoutFormProps {
  id?: string;
  testId?: string;
  title?: string;
  steps?: string[] | string;
  content?: CheckoutFormContent;
  config?: CheckoutFormConfig;
  style?: CheckoutFormStyle;
  classes?: CheckoutFormClasses;
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
// MAIN CHECKOUT FORM COMPONENT
// ─────────────────────────────────────────
export function CheckoutForm({
  id,
  testId,
  title: legacyTitle,
  steps: legacySteps,
  content = {},
  config = {},
  style = {},
  classes = {},
}: CheckoutFormProps) {
  // ── EXTRACT CONTENT ──
  const normalizeSteps = (value: string[] | string | undefined): string[] => {
    if (Array.isArray(value)) {
      return value
        .map((step) => String(step).trim())
        .filter((step) => step.length > 0);
    }

    if (typeof value === "string") {
      return value
        .split(/\r?\n/)
        .map((step) => step.trim())
        .filter((step) => step.length > 0);
    }

    return [];
  };

  const title = content.title || legacyTitle || "Paiement";
  const resolvedSteps = (() => {
    const nextSteps = normalizeSteps(content.steps || legacySteps);
    return nextSteps.length > 0
      ? nextSteps
      : ["Livraison", "Paiement", "Confirmation"];
  })();

  // ── EXTRACT CONFIG ──
  const {
    currentStep = 1,
    showSteps = true,
    animation = { entrance: "fade-in" },
  } = config;

  // ── EXTRACT STYLE ──
  const { colors: styleColors = {}, spacing: styleSpacing = {} } = style;

  const {
    background: backgroundColor = "secondary",
    text: textColor = "primary",
    accent: accentColor = "accent",
  } = styleColors;

  const { container = "narrow", paddingY = "16" } = styleSpacing;

  // ── HOOKS ──
  const { css } = useSectionStyles(style);

  // ── HELPERS ──
  const resolvedBgColor = resolveColor(backgroundColor, "#f5f5f5");
  const resolvedTextColor = resolveColor(textColor, "#1a1a1a");
  const resolvedAccentColor = resolveColor(accentColor, "#c9a96e");

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

        {/* Steps */}
        {showSteps && resolvedSteps.length > 0 && (
          <div
            className={cn(
              "flex items-center justify-between mb-8",
              classes?.steps,
            )}
          >
            {resolvedSteps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold",
                    classes?.stepIndicator,
                  )}
                  style={{
                    backgroundColor:
                      index < currentStep
                        ? resolvedAccentColor
                        : index === currentStep - 1
                          ? resolvedAccentColor
                          : "#e5e5e5",
                    color:
                      index < currentStep || index === currentStep - 1
                        ? "#ffffff"
                        : resolvedTextColor,
                  }}
                >
                  {index < currentStep - 1 ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className="ml-2 text-sm hidden sm:block"
                  style={{
                    color:
                      index === currentStep - 1
                        ? resolvedTextColor
                        : `${resolvedTextColor}99`,
                  }}
                >
                  {step}
                </span>
                {index < resolvedSteps.length - 1 && (
                  <div
                    className="w-12 sm:w-24 h-px mx-2 sm:mx-4"
                    style={{
                      backgroundColor:
                        index < currentStep - 1
                          ? resolvedAccentColor
                          : "#e5e5e5",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Form Content */}
        <div className={cn("space-y-6", classes?.form)}>
          {/* Form fields would be rendered here based on current step */}
          <div
            className="p-6 bg-white rounded-lg border"
            style={{ borderColor: "#e5e5e5" }}
          >
            <p style={{ color: `${resolvedTextColor}99` }}>
              Formulaire de paiement - Étape {currentStep}
            </p>
          </div>
        </div>
      </SectionContainer>
    </SectionWrapper>
  );
}

export default CheckoutForm;

Object.assign(CheckoutForm, { schema: checkoutFormSchema });

export const schema = checkoutFormSchema;
