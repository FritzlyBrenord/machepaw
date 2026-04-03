"use client";

// ============================================
// PROMO BAR — 100% Configurable Architecture
// ============================================

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "@/lib/router";
import { SectionWrapper, SectionContainer } from "@/components/SectionWrapper";
import { cn, useSectionStyles } from "@/hooks/useSectionStyles";
import promoBarSchema from "./PromoBar.schema";

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────
export interface PromoBarContent {
  text?: string;
  buttonText?: string;
  buttonLink?: string;
}

export interface PromoBarConfig {
  showCloseButton?: boolean;
  closable?: boolean;
  align?: "left" | "center" | "right";
}

export interface PromoBarStyle {
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

export interface PromoBarClasses {
  root?: string;
  content?: string;
  text?: string;
  button?: string;
  closeButton?: string;
}

export interface PromoBarProps {
  id?: string;
  testId?: string;
  content?: PromoBarContent;
  config?: PromoBarConfig;
  style?: PromoBarStyle;
  classes?: PromoBarClasses;
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
// MAIN PROMO BAR COMPONENT
// ─────────────────────────────────────────
export function PromoBar({
  id,
  testId,
  content = {},
  config = {},
  style = {},
  classes = {},
}: PromoBarProps) {
  const navigate = useNavigate();

  // ── EXTRACT CONTENT ──
  const {
    text = "Offre spéciale : -20% sur votre première commande !",
    buttonText,
    buttonLink,
  } = content;

  // ── EXTRACT CONFIG ──
  const { showCloseButton = true, closable = true, align = "center" } = config;

  // ── EXTRACT STYLE ──
  const { colors: styleColors = {}, spacing: styleSpacing = {} } = style;

  const {
    background: backgroundColor = "accent",
    text: textColor = "black",
    accent: accentColor = "primary",
  } = styleColors;

  const { container = "contained", paddingY = "4" } = styleSpacing;

  // ── STATE ──
  const [isVisible, setIsVisible] = useState(true);

  // ── HOOKS ──
  const { css } = useSectionStyles(style);

  // ── HELPERS ──
  const resolvedBgColor = resolveColor(backgroundColor, "#c9a96e");
  const resolvedTextColor = resolveColor(textColor, "#1a1a1a");
  const resolvedAccentColor = resolveColor(accentColor, "#1a1a1a");

  if (!isVisible) return null;

  const alignClass = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  }[align];

  const handleButtonClick = () => {
    if (buttonLink) {
      navigate(buttonLink.replace(/^\//, ""));
    }
  };

  // ── RENDER ──
  return (
    <SectionWrapper
      id={id}
      testId={testId}
      as="div"
      className={cn("w-full relative", classes?.root)}
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
        <div
          className={cn(
            "flex items-center gap-4",
            alignClass,
            classes?.content,
          )}
        >
          <p
            className={cn(
              "text-sm sm:text-base font-medium text-center",
              classes?.text,
            )}
          >
            {text}
          </p>
          {buttonText && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleButtonClick}
              className={cn(classes?.button)}
              style={{
                borderColor: resolvedTextColor,
                color: resolvedTextColor,
                backgroundColor: "transparent",
              }}
            >
              {buttonText}
            </Button>
          )}
        </div>
      </SectionContainer>

      {showCloseButton && closable && (
        <button
          onClick={() => setIsVisible(false)}
          className={cn(
            "absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:opacity-70 transition-opacity",
            classes?.closeButton,
          )}
        >
          <X className="w-5 h-5" style={{ color: resolvedTextColor }} />
        </button>
      )}
    </SectionWrapper>
  );
}

Object.assign(PromoBar, { schema: promoBarSchema });

export const schema = promoBarSchema;

export default PromoBar;
