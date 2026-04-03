"use client";

// ============================================
// ANNOUNCEMENT BAR — 100% Configurable Architecture
// ============================================

import { useState, useEffect } from "react";
import { announcementBarSchema } from "./AnnouncementBar.schema";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  Tag,
  Clock,
  Gift,
  Star,
  type LucideIcon,
} from "lucide-react";
import { cn, useSectionStyles } from "@/hooks/useSectionStyles";
import type {
  AnnouncementBarContent,
  AnnouncementBarProps,
} from "@/types/section-config-types";

type AnnouncementMessage = NonNullable<AnnouncementBarContent["messages"]>[number];
type NormalizedAnnouncementMessage = {
  text: string;
  link?: string;
  icon?: string;
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
// ICON MAP
// ─────────────────────────────────────────
const iconMap: Record<string, LucideIcon> = {
  truck: Truck,
  rotateCcw: RotateCcw,
  sparkles: Sparkles,
  tag: Tag,
  clock: Clock,
  gift: Gift,
  star: Star,
};

// ─────────────────────────────────────────
// MARQUEE COMPONENT (for marquee variant)
// ─────────────────────────────────────────
function Marquee({
  messages,
  icon,
  textColor,
  accentColor,
  speed = 30,
}: {
  messages: Array<{ text: string; icon?: string }>;
  icon?: string;
  textColor: string;
  accentColor: string;
  speed?: number;
}) {
  const duplicatedMessages = [...messages, ...messages, ...messages];

  return (
    <div className="overflow-hidden whitespace-nowrap">
      <motion.div
        className="inline-flex gap-8"
        animate={{ x: ["0%", "-33.33%"] }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {duplicatedMessages.map((message, index) => {
          const IconComponent = message.icon
            ? iconMap[message.icon] || Sparkles
            : icon
              ? iconMap[icon]
              : null;
          return (
            <div key={index} className="flex items-center gap-2 px-4">
              {IconComponent && (
                <IconComponent
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: accentColor }}
                />
              )}
              <span
                className="text-sm font-medium"
                style={{ color: textColor }}
              >
                {message.text}
              </span>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────
// MAIN ANNOUNCEMENT BAR COMPONENT
// ─────────────────────────────────────────
export function AnnouncementBar({
  id,
  testId,
  content = {},
  config = {},
  style = {},
  classes = {},
}: AnnouncementBarProps) {
  // ── EXTRACT CONTENT ──
  const {
    messages = [],
    autoRotate = true,
    interval = 5000,
    dismissible = false,
    icon,
  } = content;

  const rawMessages = messages as AnnouncementBarContent["messages"] | string;

  const messageList: Array<string | AnnouncementMessage> = Array.isArray(rawMessages)
    ? rawMessages
    : typeof rawMessages === "string"
      ? rawMessages
          .split("\n")
          .map((message: string) => message.trim())
          .filter(Boolean)
      : [];

  // Normalize messages to object format
  const normalizedMessages: NormalizedAnnouncementMessage[] = messageList.map((msg: string | AnnouncementMessage) =>
    typeof msg === "string" ? { text: msg } : msg,
  );

  // ── EXTRACT CONFIG ──
  const {
    variant = "default",
    layout = "center",
    showCloseButton = false,
    showNavigation = true,
    showDots = false,
    animation = { entrance: "slide-down", duration: "normal" },
  } = config;

  // ── EXTRACT STYLE ──
  const {
    colors: styleColors = {},
    typography: styleTypography = {},
    spacing: styleSpacing = {},
  } = style;

  const {
    background: backgroundColor = "primary",
    text: textColor = "white",
    accent: accentColor = "accent",
  } = styleColors;

  const { textTransform = "uppercase", fontSize = "sm" } = styleTypography;

  const { paddingY = "3", container = "full" } = styleSpacing;

  // ── STATE ──
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  // ── HOOKS ──
  useEffect(() => {
    if (!autoRotate || normalizedMessages.length <= 1 || variant === "marquee")
      return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % normalizedMessages.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoRotate, interval, normalizedMessages.length, variant]);

  // ── HELPERS ──
  const resolvedBgColor = resolveColor(backgroundColor, "#1a1a1a");
  const resolvedTextColor = resolveColor(textColor, "#ffffff");
  const resolvedAccentColor = resolveColor(accentColor, "#c9a96e");

  const goToPrevious = () => {
    setCurrentIndex(
      (prev) =>
        (prev - 1 + normalizedMessages.length) % normalizedMessages.length,
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % normalizedMessages.length);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  // Get current icon
  const currentMessage = normalizedMessages[currentIndex];
  const CurrentIcon = currentMessage?.icon
    ? iconMap[currentMessage.icon] || Sparkles
    : icon
      ? iconMap[icon]
      : Sparkles;

  // ── RENDER ──
  if (normalizedMessages.length === 0 || isDismissed) return null;

  // Marquee variant
  if (variant === "marquee") {
    return (
      <div
        id={id}
        data-testid={testId}
        className={cn(
          "w-full overflow-hidden",
          textTransform === "uppercase" && "uppercase",
          textTransform === "lowercase" && "lowercase",
          textTransform === "capitalize" && "capitalize",
          classes.root,
        )}
        style={{
          backgroundColor: resolvedBgColor,
          color: resolvedTextColor,
          paddingTop: `${parseInt(paddingY) * 0.25}rem`,
          paddingBottom: `${parseInt(paddingY) * 0.25}rem`,
        }}
      >
        <Marquee
          messages={normalizedMessages}
          icon={icon}
          textColor={resolvedTextColor}
          accentColor={resolvedAccentColor}
          speed={interval / 100}
        />
      </div>
    );
  }

  // Default / Rotating / Minimal variants
  return (
    <motion.div
      id={id}
      data-testid={testId}
      className={cn("w-full relative", classes.root)}
      style={{
        backgroundColor: resolvedBgColor,
        color: resolvedTextColor,
        paddingTop: `${parseInt(paddingY) * 0.25}rem`,
        paddingBottom: `${parseInt(paddingY) * 0.25}rem`,
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={cn(
          "px-4 sm:px-6 lg:px-8",
          container === "contained" && "max-w-7xl mx-auto",
          classes.inner,
        )}
      >
        <div
          className={cn(
            "flex items-center relative",
            layout === "center" && "justify-center",
            layout === "split" && "justify-between",
            classes.inner,
          )}
        >
          {/* Navigation - Previous */}
          {showNavigation && normalizedMessages.length > 1 && (
            <button
              onClick={goToPrevious}
              className={cn(
                "p-1 hover:opacity-70 transition-opacity",
                layout === "center" && "absolute left-0",
                classes.arrow,
              )}
              aria-label="Message précédent"
            >
              <ChevronLeft
                className="w-4 h-4"
                style={{ color: resolvedTextColor }}
              />
            </button>
          )}

          {/* Message Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              className={cn(
                "flex items-center gap-2",
                layout === "center" && "px-8",
                classes.message,
              )}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {variant !== "minimal" && CurrentIcon && (
                <CurrentIcon
                  className={cn("w-4 h-4 flex-shrink-0", classes.icon)}
                  style={{ color: resolvedAccentColor }}
                />
              )}
              <span
                className={cn(
                  "font-medium text-center",
                  fontSize === "xs" && "text-xs",
                  fontSize === "sm" && "text-sm",
                  fontSize === "base" && "text-base",
                  textTransform === "uppercase" && "uppercase tracking-wider",
                  textTransform === "lowercase" && "lowercase",
                  textTransform === "capitalize" && "capitalize",
                )}
              >
                {currentMessage?.text}
              </span>
            </motion.div>
          </AnimatePresence>

          {/* Navigation - Next */}
          {showNavigation && normalizedMessages.length > 1 && (
            <button
              onClick={goToNext}
              className={cn(
                "p-1 hover:opacity-70 transition-opacity",
                layout === "center" && "absolute right-0",
                layout === "split" && "absolute right-8",
                classes.arrow,
              )}
              aria-label="Message suivant"
            >
              <ChevronRight
                className="w-4 h-4"
                style={{ color: resolvedTextColor }}
              />
            </button>
          )}

          {/* Dots Indicator */}
          {showDots && normalizedMessages.length > 1 && (
            <div
              className={cn(
                "absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1.5",
                classes.closeButton,
              )}
            >
              {normalizedMessages.map((_: NormalizedAnnouncementMessage, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className="w-1.5 h-1.5 rounded-full transition-colors"
                  style={{
                    backgroundColor:
                      index === currentIndex
                        ? resolvedAccentColor
                        : `${resolvedTextColor}40`,
                  }}
                  aria-label={`Aller au message ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Close Button */}
          {(dismissible || showCloseButton) && (
            <button
              onClick={handleDismiss}
              className={cn(
                "p-1 hover:opacity-70 transition-opacity",
                layout === "center" && "absolute right-0",
                layout === "split" && "static ml-4",
                classes.closeButton,
              )}
              aria-label="Fermer"
            >
              <X className="w-4 h-4" style={{ color: resolvedTextColor }} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

Object.assign(AnnouncementBar, { schema: announcementBarSchema });

export const schema = announcementBarSchema;

export default AnnouncementBar;
