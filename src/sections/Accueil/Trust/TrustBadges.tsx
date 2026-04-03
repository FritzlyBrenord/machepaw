"use client";

// ============================================
// TRUST BADGES — 100% Configurable Architecture
// ============================================

import {
  Truck,
  Shield,
  RefreshCw,
  Headphones,
  Star,
  Clock,
  Lock,
  Award,
  Package,
  CreditCard,
  HeartHandshake,
  BadgeCheck,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { SectionWrapper, SectionContainer } from "@/components/SectionWrapper";
import { cn, useSectionStyles } from "@/hooks/useSectionStyles";
import type { TrustBadgesProps } from "@/types/section-config-types";
import trustBadgesSchema from "./TrustBadges.schema";

// ─────────────────────────────────────────
// ICON MAP
// ─────────────────────────────────────────
const iconMap: Record<string, LucideIcon> = {
  Truck,
  Shield,
  RotateCcw: RefreshCw,
  Headphones,
  Star,
  Clock,
  Lock,
  Award,
  Package,
  CreditCard,
  HeartHandshake,
  BadgeCheck,
};

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
// BADGE ITEM COMPONENT
// ─────────────────────────────────────────
function BadgeItem({
  badge,
  index,
  totalItems,
  textColor,
  accentColor,
  divider,
  variant,
  classes,
}: {
  badge: { icon: string; title: string; description?: string };
  index: number;
  totalItems: number;
  textColor: string;
  accentColor: string;
  divider: boolean;
  variant: string;
  classes?: {
    item?: string;
    icon?: string;
    iconWrapper?: string;
    title?: string;
    description?: string;
    divider?: string;
  };
}) {
  const Icon = iconMap[badge.icon] || Star;
  const isLast = index === totalItems - 1;
  const showDivider = divider && !isLast;

  // Variant-specific styles
  const isCard = variant === "cards";
  const isMinimal = variant === "minimal";
  const isGrid = variant === "grid-3" || variant === "grid-4";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={cn(
        "relative flex items-center gap-4 group",
        isCard && "flex-col text-center p-6 rounded-2xl",
        isMinimal && "flex-col text-center",
        isGrid && "flex-col text-center",
        classes?.item,
      )}
      style={{
        backgroundColor: isCard ? `${textColor}05` : undefined,
        border: isCard ? `1px solid ${textColor}10` : undefined,
      }}
    >
      {/* Divider (row mode only) */}
      {showDivider &&
        (variant === "row-divided" || variant === "row-compact") && (
          <div
            className={cn(
              "absolute right-0 top-1/2 -translate-y-1/2 hidden lg:block",
              classes?.divider,
            )}
            style={{
              width: "1px",
              height: "2rem",
              backgroundColor: `${textColor}20`,
            }}
          />
        )}

      {/* Icon */}
      <div
        className={cn(
          "rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110",
          isCard || isGrid ? "w-14 h-14 mb-2" : "w-11 h-11 shrink-0",
          isMinimal && "w-10 h-10",
          classes?.iconWrapper,
        )}
        style={{
          background: isMinimal
            ? "transparent"
            : `linear-gradient(135deg, ${accentColor}25, ${accentColor}10)`,
          border: isMinimal ? "none" : `1px solid ${accentColor}30`,
        }}
      >
        <Icon
          className={cn(
            isCard || isGrid ? "w-6 h-6" : "w-5 h-5",
            isMinimal && "w-5 h-5",
            classes?.icon,
          )}
          style={{ color: accentColor }}
        />
      </div>

      {/* Text */}
      <div className={cn(isCard || isGrid || isMinimal ? "text-center" : "")}>
        <h4
          className={cn(
            "font-semibold",
            isCard && "text-base",
            isMinimal && "text-sm",
            !isCard && !isMinimal && "text-sm",
            classes?.title,
          )}
          style={{ color: textColor }}
        >
          {badge.title}
        </h4>
        {badge.description && !isMinimal && (
          <p
            className={cn(
              "mt-0.5 text-xs",
              isCard && "mt-1",
              classes?.description,
            )}
            style={{ color: `${textColor}60` }}
          >
            {badge.description}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────
// MAIN TRUST BADGES COMPONENT
// ─────────────────────────────────────────
export function TrustBadges({
  id,
  testId,
  content = {},
  config = {},
  style = {},
  classes = {},
}: TrustBadgesProps) {
  // ── EXTRACT CONTENT ──
  const { badges = [] } = content;

  // ── EXTRACT CONFIG ──
  const {
    variant = "row-divided",
    divider = true,
    columns = 4,
    animation = { entrance: "fade-in", stagger: true },
  } = config;

  // ── EXTRACT STYLE ──
  const {
    colors: styleColors = {},
    spacing: styleSpacing = {},
    effects: styleEffects = {},
  } = style;

  const {
    background: backgroundColor = "secondary",
    text: textColor = "primary",
    accent: accentColor = "accent",
    border: borderColor,
  } = styleColors;

  const { container = "contained", paddingY = "12", gap = "6" } = styleSpacing;

  const { overlay: showTopBorder = true } = styleEffects;

  // ── HOOKS ──
  const { css } = useSectionStyles(style);

  // ── HELPERS ──
  const resolvedBgColor = resolveColor(backgroundColor, "#fafaf9");
  const resolvedTextColor = resolveColor(textColor, "#1a1a1a");
  const resolvedAccentColor = resolveColor(accentColor, "#c9a96e");
  const resolvedBorderColor = borderColor
    ? resolveColor(borderColor, `${resolvedAccentColor}25`)
    : `${resolvedAccentColor}25`;

  // ── GRID CLASSES ──
  const getGridClasses = () => {
    if (variant === "row-divided" || variant === "row-compact") {
      return "grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6";
    }
    if (variant === "grid-3") {
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";
    }
    if (variant === "grid-4") {
      return "grid-cols-2 lg:grid-cols-4 gap-6";
    }
    if (variant === "cards") {
      return `grid-cols-1 sm:grid-cols-2 lg:grid-cols-${Math.min(columns, 4)} gap-6`;
    }
    return "grid-cols-2 lg:grid-cols-4 gap-4";
  };

  // ── RENDER ──
  if (badges.length === 0) return null;

  return (
    <SectionWrapper
      id={id}
      testId={testId}
      as="section"
      animation={animation}
      className={cn("w-full relative overflow-hidden", classes.root)}
      style={{
        backgroundColor: resolvedBgColor,
        color: resolvedTextColor,
        ...css,
      }}
    >
      {/* Top border line */}
      {showTopBorder && (
        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{
            background: `linear-gradient(to right, transparent, ${resolvedBorderColor}, transparent)`,
          }}
        />
      )}

      {/* Bottom border line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background: `linear-gradient(to right, transparent, ${resolvedAccentColor}15, transparent)`,
        }}
      />

      <SectionContainer
        size={container}
        className={cn("relative", classes.container)}
        style={{
          paddingTop: `${parseInt(paddingY) * 0.25}rem`,
          paddingBottom: `${parseInt(paddingY) * 0.25}rem`,
        }}
      >
        <div
          className={cn("grid", getGridClasses(), classes.inner)}
          style={{ gap: `${parseInt(gap) * 0.25}rem` }}
        >
          {badges.map((badge, index) => (
            <BadgeItem
              key={index}
              badge={badge}
              index={index}
              totalItems={badges.length}
              textColor={resolvedTextColor}
              accentColor={resolvedAccentColor}
              divider={divider}
              variant={variant}
              classes={{
                item: classes.item,
                icon: classes.icon,
                iconWrapper: classes.iconWrapper,
                title: classes.title,
                description: classes.description,
                divider: classes.divider,
              }}
            />
          ))}
        </div>
      </SectionContainer>
    </SectionWrapper>
  );
}

Object.assign(TrustBadges, { schema: trustBadgesSchema });

export const schema = trustBadgesSchema;

export default TrustBadges;
