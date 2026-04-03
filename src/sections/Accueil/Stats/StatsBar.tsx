"use client";

// ============================================
// STATS BAR — 100% Configurable Architecture
// ============================================

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { SectionWrapper, SectionContainer } from "@/components/SectionWrapper";
import { cn, useSectionStyles } from "@/hooks/useSectionStyles";
import type { StatsBarProps, StatItem } from "@/types/section-config-types";
import statsBarSchema from "./StatsBar.schema";

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
// ANIMATED COUNTER COMPONENT
// ─────────────────────────────────────────
function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  duration = 2,
  accentColor,
  classes,
}: {
  value: string | number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  accentColor: string;
  classes?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Extract numeric value from string (e.g., "100%" -> 100, "1,234" -> 1234)
  const numericValue =
    typeof value === "string"
      ? parseInt(value.replace(/[^0-9]/g, ""), 10) || 0
      : value;

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * numericValue));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, numericValue, duration]);

  return (
    <motion.span
      ref={ref}
      className={cn("tabular-nums", classes)}
      style={{ color: accentColor }}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </motion.span>
  );
}

// ─────────────────────────────────────────
// STAT ITEM COMPONENT
// ─────────────────────────────────────────
function StatItemComponent({
  item,
  index,
  totalItems,
  textColor,
  accentColor,
  divider,
  animated,
  variant,
  classes,
}: {
  item: StatItem;
  index: number;
  totalItems: number;
  textColor: string;
  accentColor: string;
  divider: boolean;
  animated: boolean;
  variant: string;
  classes?: {
    item?: string;
    value?: string;
    label?: string;
    divider?: string;
    icon?: string;
  };
}) {
  const isLastItem = index === totalItems - 1;
  const showDivider = divider && !isLastItem;

  // Icon component (if icon provided)
  const IconComponent = item.icon
    ? () => (
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center mb-3",
            classes?.icon,
          )}
          style={{ backgroundColor: `${accentColor}15` }}
        >
          {/* Icon would be rendered here - using placeholder for now */}
          <div
            className="w-5 h-5"
            style={{
              backgroundColor: accentColor,
              maskImage: `url(${item.icon})`,
            }}
          />
        </div>
      )
    : null;

  return (
    <motion.div
      className={cn(
        "relative flex flex-col",
        variant === "horizontal" && "flex-row items-center gap-4",
        variant === "cards" && "p-6 rounded-2xl",
        variant === "grid-3" || variant === "grid-4"
          ? "text-center"
          : "text-center",
        classes?.item,
      )}
      style={{
        backgroundColor: variant === "cards" ? `${textColor}05` : undefined,
      }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      {/* Divider (vertical for horizontal, horizontal for grid) */}
      {showDivider && variant === "horizontal" && (
        <div
          className={cn(
            "absolute right-0 top-1/2 -translate-y-1/2 w-px h-12",
            classes?.divider,
          )}
          style={{ backgroundColor: `${textColor}20` }}
        />
      )}

      {/* Icon */}
      {item.icon && variant !== "minimal" && IconComponent && <IconComponent />}

      {/* Value */}
      <div
        className={cn(variant === "horizontal" && "flex items-baseline gap-1")}
      >
        {animated ? (
          <AnimatedCounter
            value={item.value}
            prefix={item.prefix}
            suffix={item.suffix}
            accentColor={accentColor}
            classes={cn(
              "text-3xl sm:text-4xl font-semibold",
              variant === "minimal" && "text-2xl sm:text-3xl font-light",
              classes?.value,
            )}
          />
        ) : (
          <span
            className={cn(
              "text-3xl sm:text-4xl font-semibold tabular-nums",
              variant === "minimal" && "text-2xl sm:text-3xl font-light",
              classes?.value,
            )}
            style={{ color: accentColor }}
          >
            {item.prefix}
            {item.value}
            {item.suffix}
          </span>
        )}
      </div>

      {/* Label */}
      <p
        className={cn(
          "text-sm mt-2 uppercase tracking-[0.2em]",
          variant === "minimal" && "text-xs tracking-[0.15em] normal-case",
          classes?.label,
        )}
        style={{ color: `${textColor}b3` }}
      >
        {item.label}
      </p>
    </motion.div>
  );
}

// ─────────────────────────────────────────
// MAIN STATS BAR COMPONENT
// ─────────────────────────────────────────
export function StatsBar({
  id,
  testId,
  content = {},
  config = {},
  style = {},
  classes = {},
}: StatsBarProps) {
  // ── EXTRACT CONTENT ──
  const { items = [], animated = true } = content;

  // ── EXTRACT CONFIG ──
  const {
    variant = "horizontal",
    divider = true,
    columns = 4,
    animation = { entrance: "slide-up", stagger: true },
  } = config;

  // ── EXTRACT STYLE ──
  const {
    colors: styleColors = {},
    typography: styleTypography = {},
    spacing: styleSpacing = {},
  } = style;

  const {
    background: backgroundColor = "secondary",
    text: textColor = "primary",
    accent: accentColor = "accent",
  } = styleColors;

  const {
    valueSize = "3xl",
    labelSize = "xs",
    textTransform = "uppercase",
    textAlign = "center",
  } = styleTypography;

  const { container = "contained", paddingY = "12", gap = "8" } = styleSpacing;

  // ── HOOKS ──
  const { css } = useSectionStyles(style);

  // ── HELPERS ──
  const resolvedBgColor = resolveColor(backgroundColor, "#f8f5f0");
  const resolvedTextColor = resolveColor(textColor, "#1a1a1a");
  const resolvedAccentColor = resolveColor(accentColor, "#c9a96e");

  // ── GRID CONFIG ──
  const gridCols = {
    horizontal: items.length <= 4 ? items.length : 4,
    "grid-3": 3,
    "grid-4": 4,
    cards: columns,
    minimal: items.length,
  };

  const getGridClasses = () => {
    const colCount = gridCols[variant as keyof typeof gridCols] || 4;

    if (colCount === 2) return "grid-cols-1 sm:grid-cols-2";
    if (colCount === 3) return "grid-cols-1 sm:grid-cols-3";
    if (colCount === 4) return "grid-cols-2 lg:grid-cols-4";
    if (colCount >= 5) return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5";

    return "grid-cols-2 lg:grid-cols-4";
  };

  // ── RENDER ──
  if (items.length === 0) return null;

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
      <SectionContainer
        size={container}
        className={cn("relative", classes.container)}
      >
        {/* Stats Grid */}
        <div
          className={cn(
            "grid gap-6",
            variant === "horizontal" && "divide-x divide-opacity-10",
            getGridClasses(),
            classes.inner,
          )}
          style={{
            gap: `${parseInt(gap) * 0.25}rem`,
            paddingTop: `${parseInt(paddingY) * 0.25}rem`,
            paddingBottom: `${parseInt(paddingY) * 0.25}rem`,
          }}
        >
          {items.map((item, index) => (
            <StatItemComponent
              key={`${item.value}-${item.label}-${index}`}
              item={item}
              index={index}
              totalItems={items.length}
              textColor={resolvedTextColor}
              accentColor={resolvedAccentColor}
              divider={divider}
              animated={animated}
              variant={variant}
              classes={{
                item: classes.item,
                value: classes.value,
                label: classes.label,
                divider: classes.divider,
                icon: classes.icon,
              }}
            />
          ))}
        </div>
      </SectionContainer>
    </SectionWrapper>
  );
}

Object.assign(StatsBar, { schema: statsBarSchema });

export const schema = statsBarSchema;

export default StatsBar;
