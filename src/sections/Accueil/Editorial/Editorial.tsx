"use client";

// ============================================
// EDITORIAL — 100% Configurable Architecture
// ============================================

import { ArrowRight, Quote } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "@/lib/router";
import { SectionWrapper, SectionContainer } from "@/components/SectionWrapper";
import { cn, useSectionStyles } from "@/hooks/useSectionStyles";
import type {
  EditorialProps,
  EditorialCTA,
} from "@/types/section-config-types";
import editorialSchema from "./Editorial.schema";

// ─────────────────────────────────────────
// HELPER: Resolve color token
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
// EYEBROW COMPONENT
// ─────────────────────────────────────────
function Eyebrow({
  text,
  style,
  accentColor,
  classes,
}: {
  text: string;
  style?: "none" | "line" | "pill" | "badge";
  accentColor: string;
  classes?: string;
}) {
  if (style === "none") {
    return (
      <p
        className={cn("text-xs uppercase tracking-[0.28em]", classes)}
        style={{ color: accentColor }}
      >
        {text}
      </p>
    );
  }

  if (style === "pill" || style === "badge") {
    return (
      <span
        className={cn(
          "inline-block px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] rounded-full",
          classes,
        )}
        style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
      >
        {text}
      </span>
    );
  }

  // Default: line style
  return (
    <div className={cn("flex items-center gap-3", classes)}>
      <div className="h-px w-8" style={{ backgroundColor: accentColor }} />
      <span
        className="text-xs uppercase tracking-[0.28em]"
        style={{ color: accentColor }}
      >
        {text}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────
// QUOTE COMPONENT
// ─────────────────────────────────────────
function QuoteBlock({
  quote,
  accentColor,
  textColor,
  classes,
}: {
  quote: { text: string; author?: string; role?: string };
  accentColor: string;
  textColor: string;
  classes?: string;
}) {
  return (
    <blockquote
      className={cn("relative pl-6 border-l-2 my-8", classes)}
      style={{ borderColor: accentColor }}
    >
      <Quote
        className="absolute -left-3 -top-2 w-6 h-6 opacity-20"
        style={{ color: accentColor }}
      />
      <p
        className="text-lg sm:text-xl italic leading-relaxed font-light"
        style={{ color: `${textColor}cc` }}
      >
        &ldquo;{quote.text}&rdquo;
      </p>
      {(quote.author || quote.role) && (
        <footer className="mt-3 text-sm" style={{ color: `${textColor}80` }}>
          {quote.author && (
            <cite className="not-italic font-medium">{quote.author}</cite>
          )}
          {quote.role && (
            <span className="ml-2 text-xs tracking-wider uppercase">
              {quote.role}
            </span>
          )}
        </footer>
      )}
    </blockquote>
  );
}

// ─────────────────────────────────────────
// CTA BUTTON COMPONENT
// ─────────────────────────────────────────
function CTAButton({
  cta,
  accentColor,
  textColor,
  classes,
}: {
  cta: EditorialCTA;
  accentColor: string;
  textColor: string;
  classes?: string;
}) {
  const navigate = useNavigate();
  const { text, href, style = "underline", icon } = cta;

  const handleClick = () => {
    if (href.startsWith("/")) {
      navigate(href as any);
    } else {
      window.location.href = href;
    }
  };

  const styleClasses = {
    solid: "px-6 py-3 rounded-none text-white font-medium",
    outline: "px-6 py-3 border-2 bg-transparent font-medium",
    underline: "underline underline-offset-4 font-medium",
    text: "font-medium hover:underline",
  };

  const styleProps = {
    solid: { backgroundColor: accentColor },
    outline: { borderColor: textColor, color: textColor },
    underline: { color: accentColor },
    text: { color: accentColor },
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-2 text-sm tracking-wide transition-all hover:opacity-80",
        styleClasses[style],
        classes,
      )}
      style={styleProps[style]}
    >
      {text}
      {(icon || style === "underline") && <ArrowRight className="h-4 w-4" />}
    </button>
  );
}

// ─────────────────────────────────────────
// IMAGE FRAME COMPONENT
// ─────────────────────────────────────────
function ImageFrame({
  src,
  alt,
  aspectRatio,
  frame,
  accentColor,
  classes,
}: {
  src: string;
  alt: string;
  aspectRatio?: string;
  frame?: {
    enabled?: boolean;
    border?: string;
    color?: string;
    offset?: string;
  };
  accentColor: string;
  classes?: {
    imageWrapper?: string;
    image?: string;
    imageFrame?: string;
    caption?: string;
  };
  caption?: string;
}) {
  const aspectClass =
    aspectRatio === "1/1"
      ? "aspect-square"
      : aspectRatio === "16/9"
        ? "aspect-video"
        : aspectRatio === "4/5"
          ? "aspect-[4/5]"
          : "aspect-[3/4]";

  const frameEnabled = frame?.enabled;
  const frameBorder = frame?.border || "2";
  const frameColor = frame?.color || accentColor;
  const frameOffset = frame?.offset || "4";

  return (
    <div className={cn("relative", classes?.imageWrapper)}>
      {/* Decorative frame */}
      {frameEnabled && (
        <div
          className={cn("absolute -z-10 border-2", classes?.imageFrame)}
          style={{
            borderColor: resolveColor(frameColor, accentColor),
            top: `${parseInt(frameOffset) * 0.25}rem`,
            left: `${parseInt(frameOffset) * 0.25}rem`,
            right: `-${parseInt(frameOffset) * 0.25}rem`,
            bottom: `-${parseInt(frameOffset) * 0.25}rem`,
          }}
        />
      )}

      {/* Main image container */}
      <div
        className={cn(
          "overflow-hidden bg-white shadow-sm",
          aspectClass,
          classes?.image,
        )}
        style={{
          borderRadius: frameEnabled ? "0" : "2rem",
        }}
      >
        <motion.img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          initial={{ scale: 1.1 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// MAIN EDITORIAL COMPONENT
// ─────────────────────────────────────────
export function Editorial({
  id,
  testId,
  content = {},
  config = {},
  style = {},
  classes = {},
}: EditorialProps) {
  const navigate = useNavigate();

  // ── EXTRACT CONTENT ──
  const { eyebrow, title, body, quote, cta, media } = content;

  // ── EXTRACT CONFIG ──
  const {
    variant = "text-image",
    ratio = "50:50",
    verticalAlign = "center",
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
    border: borderColor,
  } = styleColors;

  const {
    titleSize = "4xl",
    titleWeight = "semibold",
    titleLineHeight = "tight",
    textAlign = "left",
  } = styleTypography;

  const { container = "contained", paddingY = "16", gap = "10" } = styleSpacing;

  // ── HOOKS ──
  const { css } = useSectionStyles(style);

  // ── HELPERS ──
  const resolvedBgColor = resolveColor(backgroundColor, "#f8f5f0");
  const resolvedTextColor = resolveColor(textColor, "#1a1a1a");
  const resolvedAccentColor = resolveColor(accentColor, "#c9a96e");

  // ── LAYOUT CONFIG ──
  const isImageLeft = variant === "image-text" || variant === "text-over";
  const isTextOver = variant === "text-over" || variant === "full-bleed";
  const isSticky = variant === "sticky-image";

  // Ratio handling
  const [textRatio, imageRatio] = ratio.split(":").map((r) => parseInt(r, 10));
  const textColSpan = textRatio || 6;
  const imageColSpan = imageRatio || 6;

  // ── CONTENT RENDERER ──
  const ContentBlock = (
    <motion.div
      className={cn("space-y-6", classes.textColumn)}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Eyebrow */}
      {eyebrow && (
        <Eyebrow
          text={eyebrow.text}
          style={eyebrow.style}
          accentColor={resolvedAccentColor}
          classes={classes.eyebrow}
        />
      )}

      {/* Title */}
      {title && (
        <h2
          className={cn(
            "tracking-tight",
            titleSize === "3xl" && "text-3xl sm:text-4xl",
            titleSize === "4xl" && "text-3xl sm:text-4xl md:text-5xl",
            titleSize === "5xl" && "text-4xl sm:text-5xl md:text-6xl",
            titleWeight === "light" && "font-light",
            titleWeight === "normal" && "font-normal",
            titleWeight === "medium" && "font-medium",
            titleWeight === "semibold" && "font-semibold",
            titleWeight === "bold" && "font-bold",
            titleLineHeight === "tight" && "leading-[1.1]",
            titleLineHeight === "normal" && "leading-normal",
            titleLineHeight === "relaxed" && "leading-relaxed",
            classes.title,
          )}
          style={{ color: resolvedTextColor }}
        >
          {title}
        </h2>
      )}

      {/* Body */}
      {body && (
        <div
          className={cn(
            "max-w-2xl text-base leading-8",
            textAlign === "center" && "text-center mx-auto",
            textAlign === "right" && "text-right ml-auto",
            classes.body,
          )}
          style={{ color: `${resolvedTextColor}cc` }}
        >
          {body}
        </div>
      )}

      {/* Quote */}
      {quote && (
        <QuoteBlock
          quote={quote}
          accentColor={resolvedAccentColor}
          textColor={resolvedTextColor}
          classes={classes.quote}
        />
      )}

      {/* CTA Buttons */}
      {cta && (
        <div className={cn("flex flex-wrap gap-4 pt-2", classes.ctaGroup)}>
          {Array.isArray(cta) ? (
            cta.map((ctaItem, i) => (
              <CTAButton
                key={i}
                cta={ctaItem}
                accentColor={resolvedAccentColor}
                textColor={resolvedTextColor}
                classes={classes.eyebrow}
              />
            ))
          ) : (
            <CTAButton
              cta={cta}
              accentColor={resolvedAccentColor}
              textColor={resolvedTextColor}
              classes={classes.eyebrow}
            />
          )}
        </div>
      )}
    </motion.div>
  );

  // ── IMAGE RENDERER ──
  const ImageBlock = media && (
    <motion.div
      className={cn(classes.mediaColumn)}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
    >
      <ImageFrame
        src={media.src}
        alt={title || "Editorial image"}
        aspectRatio={media.aspectRatio}
        frame={media.frame}
        accentColor={resolvedAccentColor}
        classes={classes}
      />

      {/* Caption */}
      {media.caption && (
        <p
          className={cn("mt-4 text-sm italic text-center", classes.caption)}
          style={{ color: `${resolvedTextColor}60` }}
        >
          {media.caption}
        </p>
      )}
    </motion.div>
  );

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
        {/* Grid Layout */}
        <div
          className={cn(
            "grid gap-10 items-center",
            variant === "collage" && "grid-cols-1 md:grid-cols-3",
            !isTextOver && `lg:grid-cols-12`,
            classes.grid,
          )}
          style={{ gap: `${parseInt(gap) * 0.25}rem` }}
        >
          {variant === "image-text" ? (
            <>
              <div className={cn("lg:col-span-6", classes.mediaColumn)}>
                {ImageBlock}
              </div>
              <div className={cn("lg:col-span-6", classes.textColumn)}>
                {ContentBlock}
              </div>
            </>
          ) : variant === "text-over" ? (
            <div className="relative">
              {ImageBlock}
              <div
                className={cn(
                  "absolute inset-0 flex items-center justify-center p-8",
                  classes.content,
                )}
              >
                <div
                  className="max-w-2xl p-8 backdrop-blur-md"
                  style={{ backgroundColor: `${resolvedBgColor}cc` }}
                >
                  {ContentBlock}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className={cn("lg:col-span-6", classes.textColumn)}>
                {ContentBlock}
              </div>
              <div className={cn("lg:col-span-6", classes.mediaColumn)}>
                {ImageBlock}
              </div>
            </>
          )}
        </div>
      </SectionContainer>
    </SectionWrapper>
  );
}

Object.assign(Editorial, { schema: editorialSchema });

export const schema = editorialSchema;

export default Editorial;
