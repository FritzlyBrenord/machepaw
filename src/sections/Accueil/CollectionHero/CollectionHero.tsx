"use client";

// ============================================
// COLLECTION HERO — 100% Configurable Architecture
// ============================================

import { motion } from "framer-motion";
import { SectionWrapper, SectionContainer } from "@/components/SectionWrapper";
import { cn, useSectionStyles } from "@/hooks/useSectionStyles";
import collectionHeroSchema from "./CollectionHero.schema";

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────
export interface CollectionHeroContent {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  image?: string;
}

export interface CollectionHeroConfig {
  overlayOpacity?: number;
  minHeight?: string;
  showEyebrow?: boolean;
  animation?: {
    entrance?: "fade-in" | "slide-up" | "scale-in" | "none";
  };
}

export interface CollectionHeroStyle {
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

export interface CollectionHeroClasses {
  root?: string;
  overlay?: string;
  content?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}

export interface CollectionHeroProps {
  id?: string;
  testId?: string;
  content?: CollectionHeroContent;
  config?: CollectionHeroConfig;
  style?: CollectionHeroStyle;
  classes?: CollectionHeroClasses;
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
// MAIN COLLECTION HERO COMPONENT
// ─────────────────────────────────────────
export function CollectionHero({
  id,
  testId,
  content = {},
  config = {},
  style = {},
  classes = {},
}: CollectionHeroProps) {
  // ── EXTRACT CONTENT ──
  const {
    title = "Nouvelle Collection",
    subtitle,
    eyebrow = "Catalogue",
    image,
  } = content;

  // ── EXTRACT CONFIG ──
  const {
    overlayOpacity = 0.45,
    minHeight = "400px",
    showEyebrow = true,
    animation = { entrance: "fade-in" },
  } = config;

  // ── EXTRACT STYLE ──
  const { colors: styleColors = {}, spacing: styleSpacing = {} } = style;

  const {
    background: backgroundColor = "primary",
    text: textColor = "white",
    accent: accentColor = "accent",
  } = styleColors;

  const { container = "contained", paddingY = "16" } = styleSpacing;

  // ── HOOKS ──
  const { css } = useSectionStyles(style);

  // ── HELPERS ──
  const resolvedBgColor = resolveColor(backgroundColor, "#111111");
  const resolvedTextColor = resolveColor(textColor, "#ffffff");
  const resolvedAccentColor = resolveColor(accentColor, "#c9a96e");

  // ── RENDER ──
  return (
    <SectionWrapper
      id={id}
      testId={testId}
      as="section"
      animation={animation}
      className={cn("relative isolate overflow-hidden", classes?.root)}
      style={{
        backgroundColor: resolvedBgColor,
        color: resolvedTextColor,
        minHeight,
        ...css,
      }}
    >
      {/* Background Image */}
      {image && (
        <div className="absolute inset-0">
          <img src={image} alt={title} className="h-full w-full object-cover" />
          <div
            className={cn("absolute inset-0", classes?.overlay)}
            style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }}
          />
        </div>
      )}

      <SectionContainer
        size={container}
        className="relative"
        style={{
          paddingTop: `${parseInt(paddingY) * 0.25}rem`,
          paddingBottom: `${parseInt(paddingY) * 0.25}rem`,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={cn("max-w-3xl py-8 sm:py-12", classes?.content)}
        >
          {showEyebrow && (
            <p
              className={cn(
                "text-xs uppercase tracking-[0.28em]",
                classes?.eyebrow,
              )}
              style={{ color: `${resolvedTextColor}cc` }}
            >
              {eyebrow}
            </p>
          )}
          <h1
            className={cn(
              "mt-4 text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl",
              classes?.title,
            )}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className={cn(
                "mt-4 max-w-2xl text-sm uppercase tracking-[0.18em] sm:text-base",
                classes?.subtitle,
              )}
            >
              {subtitle}
            </p>
          )}
        </motion.div>
      </SectionContainer>
    </SectionWrapper>
  );
}

Object.assign(CollectionHero, { schema: collectionHeroSchema });

export const schema = collectionHeroSchema;

export default CollectionHero;
