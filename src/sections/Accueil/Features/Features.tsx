"use client";

// ============================================
// FEATURES — 100% Configurable Architecture
// ============================================

import {
  Truck,
  Shield,
  RotateCcw,
  Headphones,
  Star,
  Clock,
  Lock,
  Award,
  Zap,
  Heart,
} from "lucide-react";
import { motion } from "framer-motion";
import { SectionWrapper, SectionContainer } from "@/components/SectionWrapper";
import { cn, useSectionStyles } from "@/hooks/useSectionStyles";
import featuresSchema from "./Features.schema";

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────
const iconMap: Record<string, React.ElementType> = {
  Truck,
  Shield,
  RotateCcw,
  Headphones,
  Star,
  Clock,
  Lock,
  Award,
  Zap,
  Heart,
};

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface FeaturesContent {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  features?: Feature[];
}

export interface FeaturesConfig {
  layout?: "grid" | "row" | "list";
  columns?: 2 | 3 | 4;
  showEyebrow?: boolean;
  animation?: {
    entrance?: "fade-in" | "slide-up" | "scale-in" | "none";
    stagger?: boolean;
    hover?: "lift" | "scale" | "glow" | "none";
  };
}

export interface FeaturesStyle {
  colors?: {
    background?: string;
    text?: string;
    accent?: string;
  };
  spacing?: {
    paddingY?: string;
    container?: "full" | "contained" | "narrow";
    gap?: string;
  };
}

export interface FeaturesClasses {
  root?: string;
  header?: string;
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  grid?: string;
  card?: string;
  icon?: string;
  featureTitle?: string;
  featureDescription?: string;
}

export interface FeaturesProps {
  id?: string;
  testId?: string;
  content?: FeaturesContent;
  config?: FeaturesConfig;
  style?: FeaturesStyle;
  classes?: FeaturesClasses;
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
// MAIN FEATURES COMPONENT
// ─────────────────────────────────────────
export function Features({
  id,
  testId,
  content = {},
  config = {},
  style = {},
  classes = {},
}: FeaturesProps) {
  // ── EXTRACT CONTENT ──
  const {
    title = "Pourquoi nous choisir",
    subtitle = "Nous nous engageons à vous offrir la meilleure expérience d'achat",
    eyebrow = "Nos Engagements",
    features = [],
  } = content;

  // ── EXTRACT CONFIG ──
  const {
    layout = "grid",
    columns = 4,
    showEyebrow = true,
    animation = { entrance: "fade-in", stagger: true, hover: "lift" },
  } = config;

  // ── EXTRACT STYLE ──
  const { colors: styleColors = {}, spacing: styleSpacing = {} } = style;

  const {
    background: backgroundColor = "secondary",
    text: textColor = "primary",
    accent: accentColor = "accent",
  } = styleColors;

  const { container = "contained", paddingY = "16", gap = "6" } = styleSpacing;

  // ── HOOKS ──
  const { css } = useSectionStyles(style);

  // ── HELPERS ──
  const resolvedBgColor = resolveColor(backgroundColor, "#f9f7f4");
  const resolvedTextColor = resolveColor(textColor, "#1a1a1a");
  const resolvedAccentColor = resolveColor(accentColor, "#c9a96e");

  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }[columns];

  const getHoverEffect = () => {
    switch (animation.hover) {
      case "lift":
        return "hover:-translate-y-1";
      case "scale":
        return "hover:scale-[1.02]";
      default:
        return "";
    }
  };

  // ── RENDER ──
  return (
    <SectionWrapper
      id={id}
      testId={testId}
      as="section"
      animation={{ entrance: animation.entrance, stagger: animation.stagger }}
      className={cn("w-full relative overflow-hidden", classes?.root)}
      style={{
        backgroundColor: resolvedBgColor,
        color: resolvedTextColor,
        ...css,
      }}
    >
      {/* Background Effects */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, ${resolvedTextColor} 0px, ${resolvedTextColor} 1px, transparent 1px, transparent 32px)`,
        }}
      />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${resolvedAccentColor}18, transparent 70%)`,
        }}
      />

      <SectionContainer
        size={container}
        className="relative"
        style={{
          paddingTop: `${parseInt(paddingY) * 0.25}rem`,
          paddingBottom: `${parseInt(paddingY) * 0.25}rem`,
        }}
      >
        {/* Section Header */}
        <motion.div
          className={cn("text-center mb-16", classes?.header)}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Ornament */}
          {showEyebrow && (
            <div
              className={cn(
                "flex items-center justify-center gap-3 mb-4",
                classes?.eyebrow,
              )}
            >
              <div
                className="h-px w-10"
                style={{
                  background: `linear-gradient(to right, transparent, ${resolvedAccentColor})`,
                }}
              />
              <span
                className="text-[10px] tracking-[0.35em] uppercase font-medium"
                style={{ color: resolvedAccentColor }}
              >
                {eyebrow}
              </span>
              <div
                className="h-px w-10"
                style={{
                  background: `linear-gradient(to left, transparent, ${resolvedAccentColor})`,
                }}
              />
            </div>
          )}

          <h2
            className={cn(
              "text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight mb-3",
              classes?.title,
            )}
            style={{ color: resolvedTextColor }}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              className={cn(
                "text-base font-light max-w-xl mx-auto",
                classes?.subtitle,
              )}
              style={{ color: `${resolvedTextColor}70` }}
            >
              {subtitle}
            </p>
          )}
        </motion.div>

        {/* Features Grid */}
        <div
          className={cn(
            "grid",
            layout === "row" ? "grid-cols-2 lg:grid-cols-4" : gridCols,
            classes?.grid,
          )}
          style={{ gap: `${parseInt(gap) * 0.25}rem` }}
        >
          {features.map((feature, index) => {
            const Icon = iconMap[feature.icon] || Star;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={cn(
                  "group relative flex flex-col items-center text-center p-8 rounded-2xl transition-all duration-300 cursor-default",
                  getHoverEffect(),
                  classes?.card,
                )}
                style={{
                  backgroundColor: `${resolvedTextColor}04`,
                  border: `1px solid ${resolvedTextColor}08`,
                }}
              >
                {/* Hover glow fill */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(ellipse at 50% 0%, ${resolvedAccentColor}10, transparent 70%)`,
                  }}
                />

                {/* Icon */}
                <div className={cn("relative mb-6", classes?.icon)}>
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: `linear-gradient(135deg, ${resolvedAccentColor}22, ${resolvedAccentColor}08)`,
                      border: `1px solid ${resolvedAccentColor}30`,
                    }}
                  >
                    <Icon
                      className="w-7 h-7"
                      style={{ color: resolvedAccentColor }}
                    />
                  </div>
                  {/* Icon glow */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                    style={{ backgroundColor: `${resolvedAccentColor}25` }}
                  />
                </div>

                {/* Top accent line */}
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-0 group-hover:w-16 transition-all duration-500"
                  style={{ backgroundColor: resolvedAccentColor }}
                />

                <h3
                  className={cn(
                    "text-base font-semibold mb-2 relative z-10",
                    classes?.featureTitle,
                  )}
                  style={{ color: resolvedTextColor }}
                >
                  {feature.title}
                </h3>
                <p
                  className={cn(
                    "text-sm leading-relaxed font-light relative z-10",
                    classes?.featureDescription,
                  )}
                  style={{ color: `${resolvedTextColor}70` }}
                >
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </SectionContainer>
    </SectionWrapper>
  );
}

Object.assign(Features, { schema: featuresSchema });

export const schema = featuresSchema;

export default Features;
