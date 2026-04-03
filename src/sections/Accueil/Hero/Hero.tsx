"use client";

import { heroSchema } from "./Hero.schema";
import { useRef, useState, useEffect, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type Variants,
  AnimatePresence,
} from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ArrowDown,
} from "lucide-react";
import {
  SectionWrapper,
  SectionContainer,
  SectionOverlay,
  NoiseTexture,
  CornerAccents,
  ScrollIndicator,
} from "@/components/SectionWrapper";
import { cn, useSectionStyles } from "@/hooks/useSectionStyles";
import type {
  HeroProps,
  HeroTitle,
  HeroTitleLine,
  HeroPreTitle,
  HeroCTA,
  HeroMedia,
} from "@/types/section-config-types";

// ─────────────────────────────────────────
// SLIDE TYPES
// ─────────────────────────────────────────
export interface HeroSlide {
  id?: string;
  pretitle?: HeroPreTitle;
  title?: HeroTitle | string;
  subtitle?: string;
  body?: string;
  cta?: HeroCTA;
  media?: HeroMedia;
  textColor?: string;
  accentColor?: string;
  overlay?: {
    enabled?: boolean;
    type?: "gradient" | "solid" | "blur";
    opacity?: number;
    color?: string;
  };
}

export interface HeroSlideshowConfig {
  enabled?: boolean;
  autoplay?: boolean;
  interval?: number;
  transition?: "fade" | "slide" | "zoom";
  duration?: number;
  showArrows?: boolean;
  showDots?: boolean;
  pauseOnHover?: boolean;
  loop?: boolean;
}

// ─────────────────────────────────────────
// HELPERS
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

const fontFamilyMap: Record<string, string> = {
  inherit: "inherit",
  serif: "Georgia, 'Times New Roman', serif",
  sans: "system-ui, -apple-system, sans-serif",
  display: "'Playfair Display', Georgia, serif",
  mono: "ui-monospace, SFMono-Regular, monospace",
  inter: "'Inter', system-ui, sans-serif",
  roboto: "'Roboto', system-ui, sans-serif",
  poppins: "'Poppins', system-ui, sans-serif",
  montserrat: "'Montserrat', system-ui, sans-serif",
  lato: "'Lato', system-ui, sans-serif",
  opensans: "'Open Sans', system-ui, sans-serif",
  raleway: "'Raleway', system-ui, sans-serif",
  nunito: "'Nunito', system-ui, sans-serif",
  playfair: "'Playfair Display', Georgia, serif",
  merriweather: "'Merriweather', Georgia, serif",
  crimsontext: "'Crimson Text', Georgia, serif",
  librebaskerville: "'Libre Baskerville', Georgia, serif",
  cormorant: "'Cormorant Garamond', Georgia, serif",
  bebasneue: "'Bebas Neue', sans-serif",
  oswald: "'Oswald', sans-serif",
  urbanist: "'Urbanist', system-ui, sans-serif",
  spacegrotesk: "'Space Grotesk', system-ui, sans-serif",
  sora: "'Sora', system-ui, sans-serif",
  jakarta: "'Plus Jakarta Sans', system-ui, sans-serif",
  manrope: "'Manrope', system-ui, sans-serif",
  outfit: "'Outfit', system-ui, sans-serif",
};

function getFontFamilyStyle(fontFamily: string | undefined): string {
  if (!fontFamily) return fontFamilyMap.inherit;
  return fontFamilyMap[fontFamily] || fontFamilyMap.inherit;
}

function getFontSizeClass(
  size: string | undefined,
  type: "title" | "subtitle" | "pretitle" | "body" = "title",
): string {
  const sizeMap: Record<string, Record<string, string>> = {
    title: {
      "2xl": "text-2xl sm:text-3xl md:text-4xl",
      "3xl": "text-3xl sm:text-4xl md:text-5xl",
      "4xl": "text-4xl sm:text-5xl md:text-6xl",
      "5xl": "text-4xl sm:text-5xl md:text-6xl lg:text-7xl",
      "6xl": "text-5xl sm:text-6xl md:text-7xl lg:text-8xl",
      "7xl": "text-6xl sm:text-7xl md:text-8xl lg:text-9xl",
      "8xl": "text-7xl sm:text-8xl md:text-9xl",
    },
    subtitle: {
      sm: "text-sm sm:text-base",
      base: "text-base sm:text-lg",
      lg: "text-lg sm:text-xl",
      xl: "text-xl sm:text-2xl",
      "2xl": "text-2xl sm:text-3xl",
      "3xl": "text-3xl sm:text-4xl",
    },
    pretitle: {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
    },
    body: {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
    },
  };
  return sizeMap[type][size || ""] || sizeMap[type]["base"] || "";
}

function getFontWeightClass(weight: string | undefined): string {
  const weightMap: Record<string, string> = {
    light: "font-light",
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
    extrabold: "font-extrabold",
  };
  return weightMap[weight || ""] || "";
}

function getLineHeightClass(lineHeight: string | undefined): string {
  const lineHeightMap: Record<string, string> = {
    none: "leading-none",
    tight: "leading-tight",
    snug: "leading-snug",
    normal: "leading-normal",
    relaxed: "leading-relaxed",
    loose: "leading-loose",
  };
  return lineHeightMap[lineHeight || ""] || "";
}

function getLetterSpacingClass(letterSpacing: string | undefined): string {
  const letterSpacingMap: Record<string, string> = {
    tighter: "tracking-tighter",
    tight: "tracking-tight",
    normal: "tracking-normal",
    wide: "tracking-wide",
    wider: "tracking-wider",
    widest: "tracking-widest",
  };
  return letterSpacingMap[letterSpacing || ""] || "";
}

function getTextTransformClass(transform: string | undefined): string {
  const transformMap: Record<string, string> = {
    none: "",
    uppercase: "uppercase",
    lowercase: "lowercase",
    capitalize: "capitalize",
  };
  return transformMap[transform || ""] || "";
}

function getTextAlignClass(align: string | undefined): string {
  const alignMap: Record<string, string> = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
    justify: "text-justify",
  };
  return alignMap[align || ""] || "text-center";
}

// ─────────────────────────────────────────────────────────
// LUXURY PARTICLE SYSTEM
// ─────────────────────────────────────────────────────────
function Particle({
  x,
  y,
  size,
  delay,
  duration,
  color,
  opacity,
}: {
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
  opacity: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        backgroundColor: color,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, opacity, opacity * 0.5, opacity * 0.9, 0],
        scale: [0, 1, 0.7, 1.1, 0],
        y: [-10, -45, -30, -70, -90],
        x: [0, 8, -4, 12, -8],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
        repeatDelay: 0.5 + Math.random() * 2,
      }}
    />
  );
}

function ParticleField({ accentColor }: { accentColor: string }) {
  const particles = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    x: 3 + (i * 94) / 22 + Math.sin(i * 1.3) * 7,
    y: 8 + (i * 88) / 22 + Math.cos(i * 1.8) * 9,
    size: 1 + (i % 5) * 0.9,
    delay: i * 0.28,
    duration: 3.5 + (i % 6) * 0.7,
    color:
      i % 4 === 0
        ? accentColor
        : i % 4 === 1
          ? `${accentColor}90`
          : `${accentColor}50`,
    opacity: 0.15 + (i % 3) * 0.25,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <Particle key={p.id} {...p} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// PREMIUM ORNAMENTAL SEPARATOR
// ─────────────────────────────────────────────────────────
function GoldenOrnament({ color }: { color: string }) {
  return (
    <motion.div
      className="flex items-center gap-3 justify-center"
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ duration: 1.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Left line with diamond */}
      <div className="flex items-center gap-1.5">
        <div
          className="h-px w-16"
          style={{
            background: `linear-gradient(to right, transparent, ${color}80)`,
          }}
        />
        <div
          className="w-1 h-1 rotate-45"
          style={{ backgroundColor: `${color}60` }}
        />
        <div
          className="h-px w-6"
          style={{
            background: `linear-gradient(to right, ${color}80, ${color})`,
          }}
        />
      </div>

      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      >
        <Sparkles style={{ color }} className="w-3 h-3" />
      </motion.div>

      {/* Right line with diamond */}
      <div className="flex items-center gap-1.5">
        <div
          className="h-px w-6"
          style={{
            background: `linear-gradient(to left, ${color}80, ${color})`,
          }}
        />
        <div
          className="w-1 h-1 rotate-45"
          style={{ backgroundColor: `${color}60` }}
        />
        <div
          className="h-px w-16"
          style={{
            background: `linear-gradient(to left, transparent, ${color}80)`,
          }}
        />
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────
// PRESTIGE BADGE
// ─────────────────────────────────────────────────────────
function PrestigeBadge({
  text,
  accentColor,
}: {
  text?: string;
  accentColor: string;
}) {
  return (
    <motion.div
      className="inline-flex items-center gap-2.5"
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="w-6 h-px" style={{ backgroundColor: accentColor }} />
      <span
        className="text-[10px] tracking-[0.3em] uppercase font-medium"
        style={{ color: accentColor }}
      >
        {text || "Collection Exclusive"}
      </span>
      <div className="w-6 h-px" style={{ backgroundColor: accentColor }} />
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────
// TITLE RENDERER — FIX: justify-center on flex h1
// ─────────────────────────────────────────────────────────
function TitleRenderer({
  title,
  textColor,
  animation,
  titleClasses,
  textAlign = "center",
}: {
  title: HeroTitle | string;
  textColor: string;
  animation: string;
  titleClasses?: string;
  textAlign?: string;
}) {
  const normalizedTitle = ((): string => {
    if (typeof title === "string") return title;
    if (!title) return "";
    const t = title as any;
    if (t.single && typeof t.single === "string") return t.single;
    if (Array.isArray(t.lines) && t.lines.length > 0)
      return t.lines.map((l: any) => l.text || "").join(" ");
    if (t.text && typeof t.text === "string") return t.text;
    if (t.value && typeof t.value === "string") return t.value;
    const strValue = Object.values(t).find((v) => typeof v === "string");
    if (strValue) return strValue as string;
    return "";
  })();

  const titleLines: HeroTitleLine[] = [
    { text: normalizedTitle || "", style: "normal" },
  ];

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.07, delayChildren: 0.25 },
    },
  };

  const word: Variants = {
    hidden: {
      opacity: 0,
      y: animation === "none" ? 0 : 60,
      rotateX: animation === "none" ? 0 : -25,
      filter: animation === "none" ? "none" : "blur(8px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      filter: "blur(0px)",
      transition: {
        duration: 1.0,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    },
  };

  const As = "h1";

  // ── FIX: justify-center/end on flex title ──
  const justifyClass =
    textAlign === "center"
      ? "justify-center"
      : textAlign === "right"
        ? "justify-end"
        : "justify-start";

  return (
    <motion.div
      className="overflow-hidden"
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      style={{ perspective: "1000px" }}
    >
      <As
        className={cn(
          "flex flex-wrap gap-x-[0.22em]",
          justifyClass, // ── FIX appliqué ici ──
          titleClasses,
        )}
        style={{ color: textColor }}
      >
        {titleLines.map((line, i) =>
          (typeof line.text === "string" ? line.text : String(line.text || ""))
            .split(" ")
            .map((word_text, wi) => (
              <motion.span
                key={`${i}-${wi}`}
                variants={word}
                className={cn(
                  "inline-block",
                  line.style === "bold" && "font-bold",
                  line.style === "italic" && "italic",
                  line.highlight && "text-accent",
                )}
                style={{
                  transformOrigin: "bottom center",
                  color: line.color || textColor,
                }}
              >
                {word_text}
              </motion.span>
            )),
        )}
      </As>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────
// PRE TITLE RENDERER
// ─────────────────────────────────────────────────────────
function PreTitleRenderer({
  pretitle,
  accentColor,
  layout,
}: {
  pretitle: HeroPreTitle;
  accentColor: string;
  layout: string;
}) {
  if (layout === "centered") {
    return <GoldenOrnament color={accentColor} />;
  }
  return <PrestigeBadge text={pretitle.text} accentColor={accentColor} />;
}

// ─────────────────────────────────────────────────────────
// PREMIUM CTA BUTTON
// ─────────────────────────────────────────────────────────
function CTAButton({
  cta,
  accentColor,
  textColor,
  variant = "primary",
  classes,
}: {
  cta: NonNullable<HeroCTA["primary"]> | NonNullable<HeroCTA["secondary"]>;
  accentColor: string;
  textColor: string;
  variant?: "primary" | "secondary";
  classes?: string;
}) {
  const style = cta.style || (variant === "primary" ? "solid" : "text");

  if (style === "solid") {
    return (
      <motion.a
        href={cta.href}
        className={cn(
          "group relative overflow-hidden inline-flex items-center gap-3",
          "px-9 py-4 text-xs font-semibold tracking-[0.15em] uppercase",
          classes,
        )}
        style={{ backgroundColor: accentColor, color: "#fff" }}
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {/* Shimmer */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.22) 50%, transparent 75%)",
          }}
          initial={{ x: "-200%" }}
          whileHover={{ x: "200%" }}
          transition={{ duration: 0.55, ease: "easeInOut" }}
        />
        {/* Bottom edge highlight */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px opacity-40"
          style={{ backgroundColor: "#fff" }}
        />
        <span className="relative z-10 leading-none">{cta.text}</span>
        {cta.icon && cta.icon !== "none" && (
          <motion.div
            className="relative z-10"
            initial={{ x: 0 }}
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
          </motion.div>
        )}
      </motion.a>
    );
  }

  if (style === "outline") {
    return (
      <motion.a
        href={cta.href}
        className={cn(
          "group relative inline-flex items-center gap-3",
          "px-9 py-4 text-xs font-semibold tracking-[0.15em] uppercase",
          "border transition-colors duration-300",
          classes,
        )}
        style={{ borderColor: `${textColor}50`, color: textColor }}
        whileHover={{
          borderColor: textColor,
          backgroundColor: `${textColor}08`,
          y: -1,
        }}
        whileTap={{ scale: 0.97 }}
      >
        <span className="leading-none">{cta.text}</span>
        {cta.icon && cta.icon !== "none" && (
          <motion.div
            initial={{ x: 0 }}
            whileHover={{ x: 4 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
          </motion.div>
        )}
      </motion.a>
    );
  }

  // Text/underline (default secondary)
  return (
    <motion.a
      href={cta.href}
      className={cn(
        "group inline-flex items-center gap-3 text-xs font-medium tracking-[0.18em] uppercase",
        classes,
      )}
      style={{ color: `${textColor}b0` }}
      whileHover={{ x: 5, color: textColor }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <span className="leading-none">{cta.text}</span>
      <div className="relative flex items-center">
        <motion.div
          className="h-px"
          style={{ backgroundColor: accentColor }}
          initial={{ width: "18px" }}
          whileHover={{ width: "36px" }}
          transition={{ duration: 0.25 }}
        />
        <motion.div
          initial={{ opacity: 0, x: -4 }}
          whileHover={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          <ArrowRight
            className="w-3 h-3 ml-1"
            style={{ color: accentColor }}
            strokeWidth={2.5}
          />
        </motion.div>
      </div>
    </motion.a>
  );
}

// ─────────────────────────────────────────────────────────
// METRICS STRIP
// ─────────────────────────────────────────────────────────
function MetricsStrip({
  metrics,
  accentColor,
  textColor,
}: {
  metrics: Array<{
    value: string;
    label: string;
    prefix?: string;
    suffix?: string;
  }>;
  accentColor: string;
  textColor: string;
}) {
  return (
    <motion.div
      className="flex items-center gap-8 md:gap-12 mt-10 pt-8 flex-wrap"
      style={{ borderTop: `1px solid ${textColor}12` }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5, duration: 0.8 }}
    >
      {metrics.map((m, i) => (
        <motion.div
          key={i}
          className="flex flex-col"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 + i * 0.1, duration: 0.6 }}
        >
          <span
            className="text-2xl font-light tracking-tight leading-none"
            style={{ color: accentColor }}
          >
            {m.prefix || ""}
            {m.value}
            {m.suffix || ""}
          </span>
          <span
            className="text-[10px] tracking-[0.22em] uppercase mt-1.5 font-medium"
            style={{ color: `${textColor}50` }}
          >
            {m.label}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────
// MEDIA BACKGROUND
// ─────────────────────────────────────────────────────────
function MediaBackground({
  media,
  parallaxY,
}: {
  media: HeroMedia;
  parallaxY: any;
}) {
  const {
    type,
    src,
    videoSrc,
    poster,
    alt = "",
    parallax = false,
    zoomOnHover,
  } = media;
  const mediaStyle = parallax ? { y: parallaxY } : {};

  if (type === "video" && videoSrc) {
    return (
      <motion.video
        style={mediaStyle}
        autoPlay
        muted
        loop
        playsInline
        poster={poster}
        className={cn(
          "absolute inset-0 w-full h-full object-cover",
          zoomOnHover && "hover:scale-105 transition-transform duration-[2s]",
        )}
      >
        <source src={videoSrc} type="video/mp4" />
      </motion.video>
    );
  }

  if (type === "carousel" && Array.isArray(src)) {
    return (
      <motion.div
        style={{ backgroundImage: `url("${src[0]}")`, ...mediaStyle }}
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat will-change-transform"
      />
    );
  }

  const imageSrc = Array.isArray(src) ? src[0] : src;

  return (
    <motion.div
      style={{
        backgroundImage: imageSrc ? `url("${imageSrc}")` : undefined,
        ...mediaStyle,
      }}
      className={cn(
        "absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat will-change-transform z-0",
        zoomOnHover &&
          "group-hover:scale-105 transition-transform duration-[2000ms]",
        !imageSrc && "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900",
      )}
    />
  );
}

// ─────────────────────────────────────────────────────────
// PREMIUM SCROLL INDICATOR
// ─────────────────────────────────────────────────────────
function PremiumScrollIndicator({
  color,
  accentColor,
}: {
  color: string;
  accentColor: string;
}) {
  return (
    <motion.div
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2, duration: 0.8 }}
    >
      <motion.div
        className="flex flex-col items-center gap-1.5"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Scroll track */}
        <div
          className="w-px h-12 relative overflow-hidden"
          style={{ backgroundColor: `${color}20` }}
        >
          <motion.div
            className="absolute top-0 left-0 w-full"
            style={{ backgroundColor: accentColor }}
            animate={{
              height: ["0%", "100%", "0%"],
              top: ["0%", "0%", "100%"],
            }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <span
          className="text-[9px] tracking-[0.3em] uppercase rotate-90 origin-center mt-6"
          style={{ color: `${color}50` }}
        >
          scroll
        </span>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────
// LUXURY BACKGROUND ELEMENTS (no media)
// ─────────────────────────────────────────────────────────
function LuxuryBackground({ accentColor }: { accentColor: string }) {
  return (
    <>
      <NoiseTexture opacity={0.025} />

      {/* Central radial glow */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 65% 55% at 50% 38%, ${accentColor}14, transparent 68%)`,
        }}
      />

      {/* Top-left ambient */}
      <div
        className="absolute top-0 left-0 w-72 h-72 z-[1] pointer-events-none"
        style={{
          background: `radial-gradient(circle at 0% 0%, ${accentColor}0a, transparent 70%)`,
        }}
      />

      {/* Bottom-right ambient */}
      <div
        className="absolute bottom-0 right-0 w-[500px] h-[500px] z-[1] pointer-events-none"
        style={{
          background: `radial-gradient(circle at 100% 100%, ${accentColor}0d, transparent 65%)`,
        }}
      />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(${accentColor} 1px, transparent 1px), linear-gradient(90deg, ${accentColor} 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      <ParticleField accentColor={accentColor} />
    </>
  );
}

// ─────────────────────────────────────────────────────────
// SLIDE COUNTER
// ─────────────────────────────────────────────────────────
function SlideCounter({
  current,
  total,
  textColor,
  accentColor,
}: {
  current: number;
  total: number;
  textColor: string;
  accentColor: string;
}) {
  return (
    <div className="absolute bottom-8 right-8 z-20 flex items-center gap-2">
      <span
        className="text-base font-light tabular-nums leading-none"
        style={{ color: accentColor }}
      >
        {String(current + 1).padStart(2, "0")}
      </span>
      <div className="w-8 h-px" style={{ backgroundColor: `${textColor}30` }} />
      <span
        className="text-xs font-light tabular-nums leading-none"
        style={{ color: `${textColor}40` }}
      >
        {String(total).padStart(2, "0")}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// HERO SLIDER
// ─────────────────────────────────────────────────────────
interface HeroSliderProps {
  slides: HeroSlide[];
  config?: HeroSlideshowConfig;
  globalTextColor: string;
  globalAccentColor: string;
  globalOverlay?: {
    enabled?: boolean;
    type?: "gradient" | "solid" | "blur" | "vignette";
    opacity?: number;
    color?: string;
  };
  variant: string;
  titleAnimation: string;
  classes: Record<string, string | undefined>;
  textAlign: string;
  isFullscreen: boolean;
  showScrollIndicator: boolean;
  titleWeight?: string;
  titleLineHeight?: string;
  titleLetterSpacing?: string;
}

function HeroSlider({
  slides,
  config = {},
  globalTextColor,
  globalAccentColor,
  globalOverlay,
  variant,
  titleAnimation,
  classes,
  textAlign,
  isFullscreen,
  showScrollIndicator,
  titleWeight = "light",
  titleLineHeight = "tight",
  titleLetterSpacing = "tighter",
}: HeroSliderProps) {
  const {
    autoplay = true,
    interval = 5000,
    transition = "fade",
    duration = 0.8,
    showArrows = true,
    showDots = true,
    pauseOnHover = true,
    loop = true,
  } = config;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(1);

  const goToSlide = useCallback(
    (index: number) => {
      setDirection(index > currentIndex ? 1 : -1);
      setCurrentIndex(index);
    },
    [currentIndex],
  );

  const nextSlide = useCallback(() => {
    setDirection(1);
    if (currentIndex < slides.length - 1) setCurrentIndex((p) => p + 1);
    else if (loop) setCurrentIndex(0);
  }, [currentIndex, slides.length, loop]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    if (currentIndex > 0) setCurrentIndex((p) => p - 1);
    else if (loop) setCurrentIndex(slides.length - 1);
  }, [currentIndex, slides.length, loop]);

  useEffect(() => {
    if (!autoplay || isPaused || slides.length <= 1) return;
    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [autoplay, isPaused, interval, nextSlide, slides.length]);

  const currentSlide: any = slides[currentIndex] || {};

  const rawSrc: string =
    currentSlide.media?.src || currentSlide["media.src"] || "";
  const rawVideoSrc: string =
    currentSlide.media?.videoSrc || currentSlide["media.videoSrc"] || "";
  const rawMediaType: string =
    currentSlide.media?.type || currentSlide["media.type"] || "image";

  const slideMedia =
    rawSrc || rawVideoSrc
      ? {
          type: rawMediaType as "image" | "video" | "carousel",
          src: rawSrc || undefined,
          videoSrc: rawVideoSrc || undefined,
        }
      : undefined;

  const slidePretitle =
    currentSlide.pretitle ||
    (currentSlide["pretitle.text"]
      ? { text: currentSlide["pretitle.text"] }
      : undefined);

  const slideCta =
    currentSlide.cta ||
    (currentSlide["cta.primary.text"] || currentSlide["cta.secondary.text"]
      ? {
          primary: currentSlide["cta.primary.text"]
            ? {
                text: currentSlide["cta.primary.text"],
                href: currentSlide["cta.primary.href"] || "#",
              }
            : undefined,
          secondary: currentSlide["cta.secondary.text"]
            ? {
                text: currentSlide["cta.secondary.text"],
                href: currentSlide["cta.secondary.href"] || "#",
              }
            : undefined,
        }
      : undefined);

  const slideOverlay =
    currentSlide.overlay ||
    (typeof currentSlide["overlay.enabled"] !== "undefined"
      ? {
          enabled: currentSlide["overlay.enabled"],
          type:
            currentSlide["overlay.type"] || globalOverlay?.type || "gradient",
          color:
            currentSlide["overlay.color"] || globalOverlay?.color || "#000000",
          opacity:
            currentSlide["overlay.opacity"] ?? globalOverlay?.opacity ?? 0.45,
        }
      : globalOverlay);

  const textColor: string = currentSlide.textColor || globalTextColor;
  const accentColor: string = currentSlide.accentColor || globalAccentColor;

  const transitionVariants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slide: {
      initial: { x: direction > 0 ? "8%" : "-8%", opacity: 0 },
      animate: { x: "0%", opacity: 1 },
      exit: { x: direction > 0 ? "-8%" : "8%", opacity: 0 },
    },
    zoom: {
      initial: { scale: 1.06, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0.95, opacity: 0 },
    },
  };

  const variants = transitionVariants[transition];

  // Text align classes for slideshow
  const contentAlignClass =
    textAlign === "center"
      ? "items-center text-center"
      : textAlign === "right"
        ? "items-end text-right"
        : "items-start text-left";

  const ctaJustify =
    textAlign === "center"
      ? "justify-center"
      : textAlign === "right"
        ? "justify-end"
        : "justify-start";

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={variants.initial}
          animate={variants.animate}
          exit={variants.exit}
          transition={{ duration, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          {/* Slide background */}
          {slideMedia && (
            <div className="absolute inset-0 z-0">
              <MediaBackground media={slideMedia} parallaxY={0} />
              {slideOverlay?.enabled !== false && (
                <SectionOverlay
                  type={slideOverlay?.type || globalOverlay?.type || "gradient"}
                  opacity={
                    slideOverlay?.opacity ?? globalOverlay?.opacity ?? 0.45
                  }
                  color={
                    slideOverlay?.color || globalOverlay?.color || "#000000"
                  }
                  gradientDirection="to-b"
                  zIndex={1}
                />
              )}
              {/* Vignette */}
              <div
                className="absolute inset-0 z-[2] pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 85% 85% at 50% 50%, transparent 35%, rgba(0,0,0,0.55) 100%)",
                }}
              />
            </div>
          )}

          {/* Slide content */}
          <div
            className={cn(
              "relative z-10 w-full h-full flex items-center",
              variant === "fullscreen-left" && "justify-start",
              variant === "fullscreen-right" && "justify-end",
              (variant === "fullscreen-center" || variant === "carousel") &&
                "justify-center",
            )}
          >
            <SectionContainer size="contained" className="w-full">
              <div
                className={cn(
                  "flex flex-col gap-6",
                  contentAlignClass,
                  isFullscreen ? "max-w-4xl w-full" : "max-w-2xl w-full",
                  textAlign === "center" && "mx-auto",
                )}
              >
                {slidePretitle && (
                  <PreTitleRenderer
                    pretitle={slidePretitle}
                    accentColor={accentColor}
                    layout={textAlign === "center" ? "centered" : "split"}
                  />
                )}

                {currentSlide.title && (
                  <TitleRenderer
                    title={currentSlide.title}
                    textColor={textColor}
                    animation={titleAnimation}
                    textAlign={textAlign}
                    titleClasses={cn(
                      classes.title,
                      "text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light tracking-[-0.02em] leading-[1.05]",
                      titleWeight === "bold" && "font-bold",
                      titleWeight === "medium" && "font-medium",
                      titleWeight === "normal" && "font-normal",
                    )}
                  />
                )}

                {currentSlide.subtitle && (
                  <motion.p
                    className={cn(
                      "text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed font-light",
                      textAlign === "center" && "mx-auto",
                    )}
                    style={{ color: `${textColor}95` }}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.7 }}
                  >
                    {currentSlide.subtitle}
                  </motion.p>
                )}

                {currentSlide.body && (
                  <motion.p
                    className={cn(
                      "text-sm sm:text-base max-w-xl leading-relaxed",
                      textAlign === "center" && "mx-auto",
                    )}
                    style={{ color: `${textColor}75` }}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.7 }}
                  >
                    {currentSlide.body}
                  </motion.p>
                )}

                {slideCta && (slideCta.primary || slideCta.secondary) && (
                  <motion.div
                    className={cn("flex flex-wrap gap-5 mt-3", ctaJustify)}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55, duration: 0.7 }}
                  >
                    {slideCta.primary && (
                      <CTAButton
                        cta={slideCta.primary}
                        accentColor={accentColor}
                        textColor={textColor}
                        variant="primary"
                        classes={classes.ctaPrimary}
                      />
                    )}
                    {slideCta.secondary && (
                      <CTAButton
                        cta={slideCta.secondary}
                        accentColor={accentColor}
                        textColor={textColor}
                        variant="secondary"
                        classes={classes.ctaSecondary}
                      />
                    )}
                  </motion.div>
                )}
              </div>
            </SectionContainer>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {showArrows && slides.length > 1 && (
        <>
          <motion.button
            onClick={prevSlide}
            className="absolute left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center"
            style={{
              border: `1px solid ${globalTextColor}25`,
              backgroundColor: `${globalTextColor}08`,
              backdropFilter: "blur(8px)",
              color: globalTextColor,
            }}
            whileHover={{ scale: 1.05, borderColor: `${globalTextColor}55` }}
            whileTap={{ scale: 0.95 }}
            aria-label="Slide précédent"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
          </motion.button>
          <motion.button
            onClick={nextSlide}
            className="absolute right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center"
            style={{
              border: `1px solid ${globalTextColor}25`,
              backgroundColor: `${globalTextColor}08`,
              backdropFilter: "blur(8px)",
              color: globalTextColor,
            }}
            whileHover={{ scale: 1.05, borderColor: `${globalTextColor}55` }}
            whileTap={{ scale: 0.95 }}
            aria-label="Slide suivant"
          >
            <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
          </motion.button>
        </>
      )}

      {/* Dots */}
      {showDots && slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2 items-center">
          {slides.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => goToSlide(index)}
              className="rounded-full transition-all duration-400 origin-center"
              style={{
                width: index === currentIndex ? 28 : 6,
                height: 3,
                backgroundColor:
                  index === currentIndex
                    ? globalAccentColor
                    : `${globalTextColor}35`,
                borderRadius: 2,
              }}
              animate={{
                width: index === currentIndex ? 28 : 6,
                backgroundColor:
                  index === currentIndex
                    ? globalAccentColor
                    : `${globalTextColor}35`,
              }}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Slide Counter */}
      <SlideCounter
        current={currentIndex}
        total={slides.length}
        textColor={globalTextColor}
        accentColor={globalAccentColor}
      />

      {/* Progress bar */}
      {autoplay && !isPaused && slides.length > 1 && (
        <motion.div
          key={currentIndex}
          className="absolute bottom-0 left-0 h-[2px] z-20 origin-left"
          style={{ backgroundColor: globalAccentColor, opacity: 0.6 }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: interval / 1000, ease: "linear" }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// MAIN HERO COMPONENT
// ─────────────────────────────────────────────────────────
export function Hero({
  id,
  testId,
  content = {},
  config = {},
  style = {},
  classes = {},
  storefrontStore,
}: HeroProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const parallaxOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  // ── CONTENT ──
  const {
    pretitle,
    title,
    subtitle,
    body,
    cta,
    media,
    showScrollIndicator = true,
    metrics,
    slides,
    showPretitle = true,
    showTitle = true,
    showSubtitle = true,
    showBody = false,
    showMedia = true,
    showCTA = true,
    showMetrics = false,
  } = content;

  // ── SLIDESHOW ──
  const slideshowSlides = Array.isArray(slides) ? (slides as HeroSlide[]) : [];
  const slideshowConfig: HeroSlideshowConfig = config.slideshow || {};
  const hasSlideshow = slideshowConfig.enabled && slideshowSlides.length > 0;

  // ── CONFIG ──
  const {
    variant = "fullscreen-center",
    verticalAlign = "center",
    titleAnimation = "split-text",
    overlay: overlayConfig = {},
    // FIX: read from layoutConfig (not layout)
    layoutConfig = {},
    // FIX: read from heroAnimation (not animation)
    heroAnimation = {},
  } = config;

  const {
    type: layoutType = "content-over-media",
    mediaPosition = "background",
    contentPosition = "center",
    contentWidth = "wide",
    gap = "6",
    mediaWidth = "50",
  } = layoutConfig;

  const {
    entrance = "fade-up",
    duration: animDuration = "normal",
    stagger = true,
    staggerDelay = 0.1,
    easing = "smooth",
    parallax: animationParallax = false,
    parallaxSpeed = 0.5,
    hover: hoverAnimation = "none",
  } = heroAnimation;

  const {
    enabled: overlayEnabled = true,
    type: overlayType = "gradient",
    opacity: overlayOpacity = 0.45,
    color: overlayColor = "#000000",
  } = overlayConfig;

  // ── STYLE ──
  const {
    colors: styleColors = {},
    typography: styleTypography = {},
    spacing: styleSpacing = {},
  } = style;

  const {
    background: bgColor = "transparent",
    text: textColor = "#ffffff",
    accent: accentColor = "#c9a96e",
  } = styleColors;

  const {
    textAlign = "center",
    titleWeight = "light",
    titleLineHeight = "tight",
    titleLetterSpacing = "tighter",
  } = styleTypography;

  const {
    container = "contained",
    minHeight = variant.startsWith("fullscreen") ? "100vh" : "600px",
    configPaddingY,
  } = styleSpacing as any;

  const paddingY =
    configPaddingY ?? (variant.startsWith("fullscreen") ? "0" : "16");

  // ── TYPOGRAPHY CONFIG ──
  const { typography: typographyConfig = {} } = config;
  const {
    title: titleTypography = {},
    subtitle: subtitleTypography = {},
    pretitle: pretitleTypography = {},
    body: bodyTypography = {},
  } = typographyConfig as any;

  // ── VARIANT CLASSES ──
  const variantClasses: Record<string, string> = {
    "fullscreen-center": "min-h-screen flex items-center justify-center",
    "fullscreen-left": "min-h-screen flex items-center justify-start",
    "fullscreen-right": "min-h-screen flex items-center justify-end",
    split: "min-h-[80vh] flex items-center",
    minimal: "min-h-[600px] flex items-center",
    carousel: "min-h-screen flex items-center",
    "video-bg": "min-h-screen flex items-center",
    editorial: "min-h-[90vh] flex items-center",
  };

  const vAlignClasses: Record<string, string> = {
    top: "items-start",
    center: "items-center",
    bottom: "items-end",
  };

  // ── TEXT ALIGN (includes items-center for flex column) ──
  const alignClasses: Record<string, string> = {
    center: "items-center text-center",
    left: "items-start text-left",
    right: "items-end text-right",
  };

  const effectiveTextAlign = titleTypography.textAlign || textAlign;
  const textAlignClass =
    alignClasses[effectiveTextAlign] || alignClasses.center;
  const vAlignClass = vAlignClasses[verticalAlign] || vAlignClasses.center;

  const ctaJustify =
    effectiveTextAlign === "center"
      ? "justify-center"
      : effectiveTextAlign === "right"
        ? "justify-end"
        : "justify-start";

  // ── LAYOUT CLASSES ──
  const layoutClasses: Record<string, string> = {
    "content-over-media": "relative w-full h-full",
    "split-left":
      "grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center",
    "split-right":
      "grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center",
    "side-by-side":
      "grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center",
    "stacked-top": "flex flex-col gap-8",
    "stacked-bottom": "flex flex-col-reverse gap-8",
  };

  const contentWidthClasses: Record<string, string> = {
    narrow: "max-w-lg",
    medium: "max-w-2xl",
    wide: "max-w-4xl",
    full: "max-w-none w-full",
  };

  const currentLayoutClass =
    layoutClasses[layoutType] || layoutClasses["content-over-media"];
  const currentContentWidthClass =
    contentWidthClasses[contentWidth] || contentWidthClasses.wide;

  // ── HOOKS ──
  const { css } = useSectionStyles(style);

  // ── DERIVED ──
  const hasMedia = Boolean(media && (media.src || media.videoSrc));
  const isFullscreen = variant.startsWith("fullscreen");
  const shouldShowScrollIndicator = showScrollIndicator && !hasSlideshow;

  // ── STAGGER DELAYS ──
  const d1 = stagger ? staggerDelay : 0.1;
  const d2 = stagger ? staggerDelay * 3 : 0.2;
  const d3 = stagger ? staggerDelay * 5 : 0.25;
  const d4 = stagger ? staggerDelay * 7 : 0.3;
  const d5 = stagger ? staggerDelay * 9 : 0.35;

  return (
    <SectionWrapper
      id={id}
      testId={testId}
      as="section"
      ref={ref}
      animation={config.animation}
      className={cn(
        "relative w-full overflow-hidden group",
        variantClasses[variant] || variantClasses["fullscreen-center"],
        classes.root,
      )}
      style={{
        backgroundColor:
          hasMedia || hasSlideshow ? "#000" : resolveColor(bgColor, "#080808"),
        minHeight,
        ...css,
      }}
    >
      {/* ────────────── SLIDESHOW MODE ────────────── */}
      {hasSlideshow ? (
        <div className="absolute inset-0">
          <HeroSlider
            slides={slideshowSlides}
            config={slideshowConfig}
            globalTextColor={textColor}
            globalAccentColor={accentColor}
            globalOverlay={overlayConfig}
            variant={variant}
            titleAnimation={titleAnimation}
            classes={classes}
            textAlign={effectiveTextAlign}
            isFullscreen={isFullscreen}
            showScrollIndicator={shouldShowScrollIndicator}
            titleWeight={titleWeight}
            titleLineHeight={titleLineHeight}
            titleLetterSpacing={titleLetterSpacing}
          />
        </div>
      ) : (
        <>
          {/* ── BACKGROUND MEDIA ── */}
          {showMedia && media && layoutType === "content-over-media" && (
            <MediaBackground media={media} parallaxY={parallaxY} />
          )}

          {/* ── OVERLAY ── */}
          {hasMedia && overlayEnabled && (
            <>
              <SectionOverlay
                type={overlayType}
                opacity={overlayOpacity}
                color={overlayColor}
                gradientDirection="to-b"
                zIndex={1}
              />
              {/* Vignette */}
              <div
                className="absolute inset-0 z-[2] pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 82% 82% at 50% 50%, transparent 32%, rgba(0,0,0,0.58) 100%)",
                }}
              />
              {/* Bottom fade */}
              <div
                className="absolute bottom-0 left-0 right-0 h-40 z-[2] pointer-events-none"
                style={{
                  background: `linear-gradient(to top, ${overlayColor}40, transparent)`,
                }}
              />
            </>
          )}

          {/* ── NO-MEDIA PREMIUM BACKGROUND ── */}
          {!hasMedia && <LuxuryBackground accentColor={accentColor} />}

          {/* ── CORNER ACCENTS ── */}
          {!hasMedia && <CornerAccents color={accentColor} />}

          {/* ── TOP ACCENT LINE ── */}
          <motion.div
            className="absolute left-0 right-0 top-0 z-10 h-px pointer-events-none"
            style={{
              background: `linear-gradient(to right, transparent 5%, ${accentColor}35 40%, ${accentColor}35 60%, transparent 95%)`,
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
          {/* ── BOTTOM ACCENT LINE ── */}
          <motion.div
            className="absolute left-0 right-0 bottom-0 z-10 h-px pointer-events-none"
            style={{
              background: `linear-gradient(to right, transparent 20%, ${accentColor}18 50%, transparent 80%)`,
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 2, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* ── CONTENT ── */}
          <motion.div
            className={cn(
              "relative z-10 w-full",
              layoutType === "content-over-media" && "flex",
              layoutType !== "content-over-media" && currentLayoutClass,
              // For split layouts, ensure the grid row has a minimum height so the image column can self-stretch
              (layoutType === "split-left" ||
                layoutType === "split-right" ||
                layoutType === "side-by-side") &&
                "min-h-[500px]",
              vAlignClass,
            )}
            style={{
              opacity:
                layoutType === "content-over-media" ? parallaxOpacity : 1,
            }}
          >
            {/* Media for split layouts */}
            {showMedia &&
              hasMedia &&
              media &&
              layoutType !== "content-over-media" && (
                <div
                  className={cn(
                    "relative overflow-hidden",
                    // split-left: image is on the LEFT (order-1), text on RIGHT (order-2)
                    layoutType === "split-left" && "order-1",
                    // split-right: image is on the RIGHT (order-2), text on LEFT (order-1)
                    layoutType === "split-right" && "order-2",
                    layoutType === "stacked-top" &&
                      "order-1 w-full h-72 md:h-[480px]",
                    layoutType === "stacked-bottom" &&
                      "order-2 w-full h-72 md:h-[480px]",
                    // For split/side-by-side: need explicit height so absolute image is visible
                    (layoutType === "split-left" ||
                      layoutType === "split-right" ||
                      layoutType === "side-by-side") &&
                      "h-[400px] lg:h-auto lg:min-h-[500px] lg:self-stretch",
                    (layoutType === "split-left" ||
                      layoutType === "split-right" ||
                      layoutType === "side-by-side") &&
                      (mediaWidth === "40"
                        ? "lg:col-span-5"
                        : mediaWidth === "60"
                          ? "lg:col-span-7"
                          : "lg:col-span-6"),
                  )}
                >
                  <MediaBackground media={media} parallaxY={0} />
                </div>
              )}

            {/* Content wrapper */}
            <div
              className={cn(
                "flex w-full",
                layoutType === "split-left" && "order-2",
                layoutType === "split-right" && "order-1",
                layoutType === "stacked-top" && "order-2",
                layoutType === "stacked-bottom" && "order-1",
                isFullscreen &&
                  layoutType === "content-over-media" &&
                  "justify-center items-center",
                layoutType === "content-over-media" && "h-full",
                classes.container,
              )}
            >
              <SectionContainer
                size={layoutType === "content-over-media" ? container : "full"}
                className={cn(
                  "w-full",
                  layoutType !== "content-over-media" && "py-12 lg:py-20",
                )}
              >
                <div
                  className={cn(
                    "flex flex-col relative",
                    gap ? `gap-${gap}` : "gap-6",
                    // FIX: use full alignClasses (includes items-center) not just getTextAlignClass
                    textAlignClass,
                    layoutType !== "content-over-media"
                      ? "max-w-none"
                      : cn(currentContentWidthClass, "mx-auto"),
                    classes.content,
                  )}
                  style={{
                    fontFamily: getFontFamilyStyle(titleTypography.fontFamily),
                  }}
                >
                  {/* Pre-title */}
                  {showPretitle && pretitle && (
                    <motion.div
                      className={cn(classes.pretitle)}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.7,
                        delay: d1,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      style={{
                        fontFamily: getFontFamilyStyle(
                          pretitleTypography.fontFamily,
                        ),
                        fontSize: pretitleTypography.fontSize,
                        fontWeight: pretitleTypography.fontWeight,
                        letterSpacing: pretitleTypography.letterSpacing,
                      }}
                    >
                      <PreTitleRenderer
                        pretitle={pretitle}
                        accentColor={accentColor}
                        layout={
                          effectiveTextAlign === "center" ? "centered" : "split"
                        }
                      />
                    </motion.div>
                  )}

                  {/* Title — FIX: pass textAlign prop */}
                  {showTitle && title && (
                    <TitleRenderer
                      title={title}
                      textColor={textColor}
                      animation={titleAnimation}
                      textAlign={effectiveTextAlign}
                      titleClasses={cn(
                        classes.title,
                        getFontSizeClass(titleTypography.fontSize, "title") ||
                          "text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl",
                        getFontWeightClass(titleTypography.fontWeight) ||
                          "font-light",
                        getLineHeightClass(titleTypography.lineHeight) ||
                          "leading-[1.05]",
                        getLetterSpacingClass(titleTypography.letterSpacing) ||
                          "tracking-[-0.02em]",
                        getTextTransformClass(titleTypography.textTransform),
                        titleTypography.fontStyle === "italic" && "italic",
                      )}
                    />
                  )}

                  {/* Subtitle */}
                  {showSubtitle && subtitle && (
                    <motion.p
                      className={cn(
                        "max-w-2xl leading-relaxed",
                        effectiveTextAlign === "center" && "mx-auto",
                        getFontSizeClass(
                          subtitleTypography.fontSize,
                          "subtitle",
                        ) || "text-base sm:text-lg md:text-xl",
                        getFontWeightClass(subtitleTypography.fontWeight) ||
                          "font-light",
                        getTextAlignClass(
                          subtitleTypography.textAlign || effectiveTextAlign,
                        ),
                        subtitleTypography.fontStyle === "italic" && "italic",
                        classes.subtitle,
                      )}
                      style={{
                        color: `${textColor}95`,
                        fontFamily: getFontFamilyStyle(
                          subtitleTypography.fontFamily,
                        ),
                      }}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.8,
                        delay: d2,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      {subtitle}
                    </motion.p>
                  )}

                  {/* Body */}
                  {showBody && body && (
                    <motion.p
                      className={cn(
                        "max-w-xl leading-relaxed",
                        effectiveTextAlign === "center" && "mx-auto",
                        getFontSizeClass(bodyTypography.fontSize, "body") ||
                          "text-sm sm:text-base",
                        getFontWeightClass(bodyTypography.fontWeight),
                        getLineHeightClass(bodyTypography.lineHeight) ||
                          "leading-relaxed",
                        classes.body,
                      )}
                      style={{
                        color: `${textColor}75`,
                        fontFamily: getFontFamilyStyle(
                          bodyTypography.fontFamily,
                        ),
                      }}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.8,
                        delay: d3,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      {body}
                    </motion.p>
                  )}

                  {/* CTA */}
                  {showCTA && cta && (cta.primary || cta.secondary) && (
                    <motion.div
                      className={cn(
                        "flex flex-wrap gap-5 mt-3",
                        ctaJustify,
                        classes.ctaGroup,
                      )}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.8,
                        delay: d4,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      {cta.primary && (
                        <CTAButton
                          cta={cta.primary}
                          accentColor={accentColor}
                          textColor={textColor}
                          variant="primary"
                          classes={classes.ctaPrimary}
                        />
                      )}
                      {cta.secondary && (
                        <CTAButton
                          cta={cta.secondary}
                          accentColor={accentColor}
                          textColor={textColor}
                          variant="secondary"
                          classes={classes.ctaSecondary}
                        />
                      )}
                    </motion.div>
                  )}

                  {/* Metrics */}
                  {showMetrics && metrics && metrics.length > 0 && (
                    <MetricsStrip
                      metrics={metrics}
                      accentColor={accentColor}
                      textColor={textColor}
                    />
                  )}
                </div>
              </SectionContainer>
            </div>
          </motion.div>

          {/* ── SCROLL INDICATOR ── */}
          {isFullscreen &&
            shouldShowScrollIndicator &&
            layoutType === "content-over-media" && (
              <PremiumScrollIndicator
                color={textColor}
                accentColor={accentColor}
              />
            )}
        </>
      )}
    </SectionWrapper>
  );
}

export default Hero;

Object.assign(Hero, { schema: heroSchema });
export const schema = heroSchema;
