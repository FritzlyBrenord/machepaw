"use client";

// ============================================
// COUNTDOWN — 100% Configurable Architecture
// ============================================

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "@/lib/router";
import { SectionWrapper, SectionContainer } from "@/components/SectionWrapper";
import { cn, useSectionStyles } from "@/hooks/useSectionStyles";
import countdownSchema from "./Countdown.schema";

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────
export interface CountdownContent {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  endDate?: string;
  labels?: {
    days?: string;
    hours?: string;
    minutes?: string;
    seconds?: string;
  };
}

export interface CountdownConfig {
  showLabels?: boolean;
  showButton?: boolean;
  size?: "sm" | "md" | "lg";
}

export interface CountdownStyle {
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

export interface CountdownClasses {
  root?: string;
  title?: string;
  subtitle?: string;
  timer?: string;
  timeBlock?: string;
  button?: string;
}

export interface CountdownProps {
  id?: string;
  testId?: string;
  content?: CountdownContent;
  config?: CountdownConfig;
  style?: CountdownStyle;
  classes?: CountdownClasses;
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

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// ─────────────────────────────────────────
// MAIN COUNTDOWN COMPONENT
// ─────────────────────────────────────────
export function Countdown({
  id,
  testId,
  content = {},
  config = {},
  style = {},
  classes = {},
}: CountdownProps) {
  const navigate = useNavigate();

  // ── EXTRACT CONTENT ──
  const {
    title = "Offre Limitée",
    subtitle = "Profitez de notre promotion avant qu'il ne soit trop tard !",
    buttonText,
    buttonLink,
    endDate: endDateProp,
    labels = {
      days: "Jours",
      hours: "Heures",
      minutes: "Minutes",
      seconds: "Secondes",
    },
  } = content;

  // Stable default end date (memoized to prevent infinite loop)
  const endDate = useMemo(() => {
    return (
      endDateProp ||
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    );
  }, [endDateProp]);

  // ── EXTRACT CONFIG ──
  const { showLabels = true, showButton = true, size = "md" } = config;

  // ── EXTRACT STYLE ──
  const { colors: styleColors = {}, spacing: styleSpacing = {} } = style;

  const {
    background: backgroundColor = "accent",
    text: textColor = "black",
    accent: accentColor = "primary",
  } = styleColors;

  const { container = "narrow", paddingY = "16" } = styleSpacing;

  // ── STATE ──
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // ── HOOKS ──
  const { css } = useSectionStyles(style);

  // ── HELPERS ──
  const resolvedBgColor = resolveColor(backgroundColor, "#c9a96e");
  const resolvedTextColor = resolveColor(textColor, "#1a1a1a");
  const resolvedAccentColor = resolveColor(accentColor, "#1a1a1a");

  useEffect(() => {
    const calculateTimeLeft = (): TimeLeft => {
      const difference = new Date(endDate).getTime() - new Date().getTime();

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }

      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  const timeBlocks = [
    { value: timeLeft.days, label: labels.days },
    { value: timeLeft.hours, label: labels.hours },
    { value: timeLeft.minutes, label: labels.minutes },
    { value: timeLeft.seconds, label: labels.seconds },
  ];

  const sizeClasses = {
    sm: {
      block: "w-12 h-12 sm:w-16 sm:h-16",
      value: "text-xl sm:text-2xl",
      label: "text-xs",
    },
    md: {
      block: "w-16 h-16 sm:w-24 sm:h-24",
      value: "text-2xl sm:text-4xl",
      label: "text-xs sm:text-sm",
    },
    lg: {
      block: "w-20 h-20 sm:w-32 sm:h-32",
      value: "text-3xl sm:text-5xl",
      label: "text-sm sm:text-base",
    },
  }[size];

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
      as="section"
      className={cn("w-full", classes?.root)}
      style={{
        backgroundColor: resolvedBgColor,
        color: resolvedTextColor,
        ...css,
      }}
    >
      <SectionContainer
        size={container}
        className="text-center"
        style={{
          paddingTop: `${parseInt(paddingY) * 0.25}rem`,
          paddingBottom: `${parseInt(paddingY) * 0.25}rem`,
        }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={cn("text-3xl sm:text-4xl font-bold mb-2", classes?.title)}
          style={{ color: resolvedTextColor }}
        >
          {title}
        </motion.h2>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className={cn("text-lg mb-8", classes?.subtitle)}
            style={{ color: `${resolvedTextColor}cc` }}
          >
            {subtitle}
          </motion.p>
        )}

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className={cn(
            "flex justify-center gap-4 sm:gap-8 mb-8",
            classes?.timer,
          )}
        >
          {timeBlocks.map((block, index) => (
            <div key={index} className={cn("text-center", classes?.timeBlock)}>
              <div
                className={cn(
                  "rounded-lg flex items-center justify-center mb-2",
                  sizeClasses.block,
                )}
                style={{ backgroundColor: `${resolvedTextColor}20` }}
              >
                <span className={cn("font-bold", sizeClasses.value)}>
                  {String(block.value).padStart(2, "0")}
                </span>
              </div>
              {showLabels && (
                <span
                  className={cn(sizeClasses.label)}
                  style={{ color: `${resolvedTextColor}cc` }}
                >
                  {block.label}
                </span>
              )}
            </div>
          ))}
        </motion.div>

        {showButton && buttonText && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Button
              size="lg"
              onClick={handleButtonClick}
              className={cn(classes?.button)}
              style={{
                backgroundColor: resolvedTextColor,
                color: resolvedBgColor,
              }}
            >
              {buttonText}
            </Button>
          </motion.div>
        )}
      </SectionContainer>
    </SectionWrapper>
  );
}

Object.assign(Countdown, { schema: countdownSchema });

export const schema = countdownSchema;

export default Countdown;
