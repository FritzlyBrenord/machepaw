"use client";

// ============================================
// TESTIMONIALS — 100% Configurable Architecture
// ============================================

import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionWrapper, SectionContainer } from "@/components/SectionWrapper";
import { cn, useSectionStyles } from "@/hooks/useSectionStyles";
import type {
  TestimonialsProps,
  Testimonial,
} from "@/types/section-config-types";
import testimonialsSchema from "./Testimonials.schema";

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
// STAR RATING COMPONENT
// ─────────────────────────────────────────
function StarRating({
  rating,
  accentColor,
  classes,
}: {
  rating: number;
  accentColor: string;
  classes?: string;
}) {
  return (
    <div className={cn("flex gap-0.5", classes)}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className="w-3.5 h-3.5"
          fill={s <= rating ? accentColor : "none"}
          style={{ color: accentColor }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────
// AVATAR COMPONENT
// ─────────────────────────────────────────
function Avatar({
  src,
  name,
  accentColor,
  classes,
}: {
  src?: string;
  name: string;
  accentColor: string;
  classes?: string;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn("w-12 h-12 rounded-full object-cover ring-2", classes)}
        style={{ ringColor: accentColor } as React.CSSProperties}
      />
    );
  }
  return (
    <div
      className={cn(
        "w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold text-white",
        classes,
      )}
      style={{ backgroundColor: accentColor }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

// ─────────────────────────────────────────
// TESTIMONIAL CARD COMPONENT
// ─────────────────────────────────────────
function TestimonialCard({
  testimonial,
  textColor,
  accentColor,
  quoteStyle,
  showQuotes,
  showAvatar,
  showRating,
  classes,
  isDark = false,
}: {
  testimonial: Testimonial;
  textColor: string;
  accentColor: string;
  quoteStyle: string;
  showQuotes: boolean;
  showAvatar: boolean;
  showRating: boolean;
  classes?: {
    card?: string;
    quoteIcon?: string;
    quote?: string;
    author?: string;
    role?: string;
    avatar?: string;
    rating?: string;
  };
  isDark?: boolean;
}) {
  return (
    <div
      className={cn(
        "group relative flex flex-col gap-5 p-7 rounded-2xl transition-all duration-300 hover:-translate-y-1",
        classes?.card,
      )}
      style={{
        backgroundColor: isDark ? `${textColor}06` : `${textColor}04`,
        border: `1px solid ${textColor}${isDark ? "12" : "08"}`,
      }}
    >
      {/* Top hover line */}
      <div
        className="absolute top-0 left-6 right-6 h-px scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
        style={{ backgroundColor: accentColor }}
      />

      {/* Quote mark */}
      {showQuotes && (
        <div
          className={cn(
            "text-5xl leading-none font-serif select-none",
            classes?.quoteIcon,
          )}
          style={{ color: `${accentColor}40` }}
        >
          <Quote className="w-8 h-8" />
        </div>
      )}

      {/* Rating */}
      {showRating && testimonial.rating && (
        <StarRating
          rating={testimonial.rating}
          accentColor={accentColor}
          classes={classes?.rating}
        />
      )}

      {/* Quote text */}
      <p
        className={cn(
          "text-sm leading-relaxed font-light flex-1 -mt-2",
          quoteStyle === "italic" && "italic",
          quoteStyle === "serif" && "font-serif",
          quoteStyle === "large" && "text-base sm:text-lg",
          classes?.quote,
        )}
        style={{ color: `${textColor}CC` }}
      >
        &ldquo;{testimonial.quote}&rdquo;
      </p>

      {/* Author */}
      <div
        className="flex items-center gap-3 pt-2"
        style={{ borderTop: `1px solid ${textColor}0A` }}
      >
        {showAvatar && (
          <Avatar
            src={testimonial.avatar}
            name={testimonial.author}
            accentColor={accentColor}
            classes={classes?.avatar}
          />
        )}
        <div>
          <p
            className={cn("text-sm font-semibold", classes?.author)}
            style={{ color: textColor }}
          >
            {testimonial.author}
          </p>
          {testimonial.role && (
            <p
              className={cn("text-xs", classes?.role)}
              style={{ color: `${textColor}60` }}
            >
              {testimonial.role}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// CAROUSEL COMPONENT
// ─────────────────────────────────────────
function TestimonialsCarousel({
  testimonials,
  textColor,
  accentColor,
  showQuotes,
  showAvatar,
  showRating,
  autoplay,
  interval,
  showNavigation,
  showDots,
  classes,
  isDark,
}: {
  testimonials: Testimonial[];
  textColor: string;
  accentColor: string;
  showQuotes: boolean;
  showAvatar: boolean;
  showRating: boolean;
  autoplay: boolean;
  interval: number;
  showNavigation: boolean;
  showDots: boolean;
  classes?: {
    slider?: string;
    slide?: string;
    quoteIcon?: string;
    quote?: string;
    author?: string;
    role?: string;
    avatar?: string;
    rating?: string;
    navigation?: string;
    arrow?: string;
    dots?: string;
  };
  isDark: boolean;
}) {
  const [current, setCurrent] = useState(0);
  const [dir, setDir] = useState(1);

  // Auto-advance
  useEffect(() => {
    if (!autoplay || testimonials.length <= 1) return;
    const timer = setInterval(() => {
      setDir(1);
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, interval);
    return () => clearInterval(timer);
  }, [autoplay, interval, testimonials.length]);

  const go = (next: number) => {
    setDir(
      next > current || (next === 0 && current === testimonials.length - 1)
        ? 1
        : -1,
    );
    setCurrent(next);
  };

  const slideVariants = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 60 : -60 }),
    center: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as any },
    },
    exit: (d: number) => ({
      opacity: 0,
      x: d > 0 ? -60 : 60,
      transition: { duration: 0.3 },
    }),
  };

  const t = testimonials[current];

  return (
    <div className={cn("relative max-w-3xl mx-auto", classes?.slider)}>
      {/* Card */}
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl p-10 sm:p-14 text-center min-h-[320px] flex flex-col items-center justify-center",
          classes?.slide,
        )}
        style={{
          backgroundColor: isDark ? `${textColor}06` : `${textColor}04`,
          border: `1px solid ${accentColor}20`,
        }}
      >
        {/* Ambient glow */}
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 70% 50% at 50% 0%, ${accentColor}10, transparent 60%)`,
          }}
        />

        <AnimatePresence custom={dir} mode="wait">
          <motion.div
            key={current}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="relative z-10 flex flex-col items-center gap-5 w-full"
          >
            {/* Large decorative quote */}
            {showQuotes && (
              <div
                className={cn(
                  "text-7xl leading-none font-serif select-none absolute -top-8 left-1/2 -translate-x-1/2",
                  classes?.quoteIcon,
                )}
                style={{ color: `${accentColor}20` }}
              >
                <Quote className="w-16 h-16" />
              </div>
            )}

            {/* Rating */}
            {showRating && t.rating && (
              <StarRating
                rating={t.rating}
                accentColor={accentColor}
                classes={classes?.rating}
              />
            )}

            {/* Quote */}
            <p
              className={cn(
                "text-lg sm:text-xl font-light leading-relaxed max-w-xl",
                classes?.quote,
              )}
              style={{ color: `${textColor}CC` }}
            >
              &ldquo;{t.quote}&rdquo;
            </p>

            {/* Author */}
            <div className="flex items-center gap-3 mt-2">
              {showAvatar && (
                <Avatar
                  src={t.avatar}
                  name={t.author}
                  accentColor={accentColor}
                  classes={classes?.avatar}
                />
              )}
              <div className="text-left">
                <p
                  className={cn("font-semibold text-sm", classes?.author)}
                  style={{ color: textColor }}
                >
                  {t.author}
                </p>
                {t.role && (
                  <p
                    className={cn("text-xs", classes?.role)}
                    style={{ color: `${textColor}60` }}
                  >
                    {t.role}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      {showNavigation && (
        <div
          className={cn(
            "flex items-center justify-center gap-4 mt-8",
            classes?.navigation,
          )}
        >
          <motion.button
            onClick={() =>
              go((current - 1 + testimonials.length) % testimonials.length)
            }
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center border transition-all",
              classes?.arrow,
            )}
            style={{ borderColor: `${accentColor}40`, color: accentColor }}
            whileHover={{
              scale: 1.1,
              backgroundColor: accentColor,
              color: "#fff",
              borderColor: accentColor,
            }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.button>

          {/* Dots */}
          {showDots && (
            <div className={cn("flex gap-2", classes?.dots)}>
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => go(i)}
                  className="transition-all duration-300 rounded-full"
                  style={{
                    width: i === current ? "24px" : "8px",
                    height: "8px",
                    backgroundColor:
                      i === current ? accentColor : `${accentColor}40`,
                  }}
                />
              ))}
            </div>
          )}

          <motion.button
            onClick={() => go((current + 1) % testimonials.length)}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center border transition-all",
              classes?.arrow,
            )}
            style={{ borderColor: `${accentColor}40`, color: accentColor }}
            whileHover={{
              scale: 1.1,
              backgroundColor: accentColor,
              color: "#fff",
              borderColor: accentColor,
            }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// MAIN TESTIMONIALS COMPONENT
// ─────────────────────────────────────────
export function Testimonials({
  id,
  testId,
  content = {},
  config = {},
  style = {},
  classes = {},
}: TestimonialsProps) {
  // ── EXTRACT CONTENT ──
  const { title, subtitle, testimonials = [] } = content;

  // ── EXTRACT CONFIG ──
  const {
    variant = "slider",
    quoteStyle = "normal",
    showQuotes = true,
    showAvatar = true,
    showRating = true,
    autoplay = true,
    interval = 7000,
    showNavigation = true,
    showDots = false,
    loop = true,
    animation = { entrance: "fade-in", stagger: true },
  } = config;

  // ── EXTRACT STYLE ──
  const {
    colors: styleColors = {},
    typography: styleTypography = {},
    spacing: styleSpacing = {},
    effects: styleEffects = {},
  } = style;

  const {
    background: backgroundColor = "white",
    text: textColor = "primary",
    accent: accentColor = "accent",
  } = styleColors;

  const { titleSize = "4xl", textAlign = "center" } = styleTypography;

  const { container = "contained", paddingY = "16" } = styleSpacing;

  // ── HOOKS ──
  const { css } = useSectionStyles(style);

  // ── HELPERS ──
  const resolvedBgColor = resolveColor(backgroundColor, "#ffffff");
  const resolvedTextColor = resolveColor(textColor, "#1a1a1a");
  const resolvedAccentColor = resolveColor(accentColor, "#c9a96e");

  // Check if dark background
  const isDark =
    backgroundColor === "black" ||
    backgroundColor === "primary" ||
    resolvedBgColor.toLowerCase() === "#1a1a1a" ||
    resolvedBgColor.toLowerCase() === "#0a0a0a" ||
    resolvedBgColor.toLowerCase() === "#111111";

  // ── GRID CLASSES ──
  const getGridClasses = () => {
    if (variant === "grid-2") return "grid-cols-1 md:grid-cols-2";
    if (variant === "grid-3")
      return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    if (variant === "grid-4")
      return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
    if (variant === "masonry") return "columns-1 md:columns-2 lg:columns-3";
    return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
  };

  // ── RENDER ──
  if (testimonials.length === 0) return null;

  const isCarousel = variant === "slider" || variant === "single";

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
      {/* Background accents */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 80% 50%, ${resolvedAccentColor}0A, transparent)`,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 40% 40% at 20% 80%, ${resolvedAccentColor}06, transparent)`,
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
        {/* Header */}
        {(title || subtitle) && (
          <motion.div
            className={cn(
              "mb-16",
              textAlign === "center" && "text-center max-w-3xl mx-auto",
              textAlign === "left" && "text-left",
              textAlign === "right" && "text-right",
              classes.inner,
            )}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
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
                Avis Clients
              </span>
              <div
                className="h-px w-10"
                style={{
                  background: `linear-gradient(to left, transparent, ${resolvedAccentColor})`,
                }}
              />
            </div>

            {title && (
              <h2
                className={cn(
                  "font-light tracking-tight mb-3",
                  titleSize === "3xl" && "text-3xl sm:text-4xl",
                  titleSize === "4xl" && "text-3xl sm:text-4xl lg:text-5xl",
                  titleSize === "5xl" && "text-4xl sm:text-5xl lg:text-6xl",
                  classes.title,
                )}
                style={{ color: resolvedTextColor }}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p
                className={cn(
                  "text-base font-light max-w-xl mx-auto",
                  classes.subtitle,
                )}
                style={{ color: `${resolvedTextColor}70` }}
              >
                {subtitle}
              </p>
            )}
          </motion.div>
        )}

        {/* Testimonials Content */}
        {isCarousel ? (
          <TestimonialsCarousel
            testimonials={testimonials}
            textColor={resolvedTextColor}
            accentColor={resolvedAccentColor}
            showQuotes={showQuotes}
            showAvatar={showAvatar}
            showRating={showRating}
            autoplay={autoplay}
            interval={interval}
            showNavigation={showNavigation}
            showDots={showDots}
            classes={classes}
            isDark={isDark}
          />
        ) : (
          <div className={cn("grid gap-6", getGridClasses(), classes.grid)}>
            {testimonials.map((testimonial, i) => (
              <TestimonialCard
                key={i}
                testimonial={testimonial}
                textColor={resolvedTextColor}
                accentColor={resolvedAccentColor}
                quoteStyle={quoteStyle}
                showQuotes={showQuotes}
                showAvatar={showAvatar}
                showRating={showRating}
                classes={classes}
                isDark={isDark}
              />
            ))}
          </div>
        )}
      </SectionContainer>
    </SectionWrapper>
  );
}

Object.assign(Testimonials, { schema: testimonialsSchema });

export const schema = testimonialsSchema;

export default Testimonials;
