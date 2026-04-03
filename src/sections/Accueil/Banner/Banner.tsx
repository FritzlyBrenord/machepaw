"use client";

// ============================================
// BANNER — 100% Configurable Architecture
// ============================================

import { ArrowRight, ArrowUpRight, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@/lib/router";
import { SectionWrapper, SectionContainer } from "@/components/SectionWrapper";
import { cn, useSectionStyles } from "@/hooks/useSectionStyles";
import bannerSchema from "./Banner.schema";

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────
export interface BannerContent {
  title?: string;
  subtitle?: string;
  image?: string;
  ctaText?: string;
  ctaLink?: string;
  showTitle?: boolean;
  showSubtitle?: boolean;
  showImage?: boolean;
  showCta?: boolean;
}

export interface BannerTypographyConfig {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  fontStyle?: string;
  textAlign?: string;
  textTransform?: string;
}

export interface BannerHeaderConfig {
  title?: BannerTypographyConfig;
  subtitle?: BannerTypographyConfig;
}

export interface BannerCardStyle {
  variant?: "standard" | "minimal" | "card" | "luxury" | "elegant";
  borderRadius?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
  shadow?: "none" | "sm" | "md" | "lg";
}

export interface BannerCtaConfig {
  style?: "solid" | "outline" | "ghost" | "underline";
  size?: "sm" | "md" | "lg";
  icon?: "arrow-right" | "arrow-up-right" | "chevron-right" | "none";
  showIcon?: boolean;
  position?: "inline" | "below";
}

export interface BannerImageConfig {
  aspectRatio?: "4/3" | "16/9" | "3/4" | "1/1" | "21/9";
  hoverEffect?: "none" | "zoom" | "scale";
  hoverScale?: number;
  objectFit?: "cover" | "contain";
  borderRadius?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
}

export interface BannerConfig {
  variant?: "default" | "reversed" | "centered" | "card" | "minimal" | "luxury";
  imagePosition?: "left" | "right";
  showCta?: boolean;
  contentWidth?: "narrow" | "medium" | "wide" | "full";
  header?: BannerHeaderConfig;
  cardStyle?: BannerCardStyle;
  cta?: BannerCtaConfig;
  image?: BannerImageConfig;
  animation?: {
    entrance?: "fade-in" | "slide-up" | "slide-left" | "slide-right" | "none";
    duration?: "fast" | "normal" | "slow";
  };
}

export interface BannerStyle {
  colors?: {
    background?: string;
    text?: string;
    accent?: string;
  };
  spacing?: {
    paddingY?: string;
    container?: "full" | "contained" | "narrow";
  };
  border?: {
    imageRadius?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
  };
}

export interface BannerClasses {
  root?: string;
  container?: string;
  content?: string;
  title?: string;
  subtitle?: string;
  image?: string;
  cta?: string;
}

export interface BannerProps {
  id?: string;
  testId?: string;
  content?: BannerContent;
  config?: BannerConfig;
  style?: BannerStyle;
  classes?: BannerClasses;
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

function resolveFontFamily(fontFamily: string | undefined): string {
  const fontMap: Record<string, string> = {
    inter: "var(--font-sans, 'Inter', system-ui, sans-serif)",
    roboto: "'Roboto', sans-serif",
    poppins: "'Poppins', sans-serif",
    montserrat: "'Montserrat', sans-serif",
    playfair: "'Playfair Display', serif",
    merriweather: "'Merriweather', serif",
    bebasneue: "'Bebas Neue', sans-serif",
    oswald: "'Oswald', sans-serif",
    urbanist: "'Urbanist', sans-serif",
  };
  return fontMap[fontFamily || ""] || "inherit";
}

function getFontSizeClass(size: string | undefined): string {
  const sizeMap: Record<string, string> = {
    "2xl": "text-2xl sm:text-3xl",
    "3xl": "text-3xl sm:text-4xl",
    "4xl": "text-4xl sm:text-5xl",
    "5xl": "text-5xl sm:text-6xl",
    "6xl": "text-6xl sm:text-7xl",
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };
  return sizeMap[size || ""] || "text-4xl sm:text-5xl";
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
  return weightMap[weight || ""] || "font-bold";
}

function getTextAlignClass(align: string | undefined): string {
  const alignMap: Record<string, string> = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };
  return alignMap[align || ""] || "text-left";
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

function getBorderRadiusClass(radius: string | undefined): string {
  const radiusMap: Record<string, string> = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    "3xl": "rounded-3xl",
  };
  return radiusMap[radius || ""] || "rounded-lg";
}

function getShadowClass(shadow: string | undefined): string {
  const shadowMap: Record<string, string> = {
    none: "",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
  };
  return shadowMap[shadow || ""] || "";
}

function getButtonSizeClass(size: string | undefined): string {
  const sizeMap: Record<string, string> = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-base",
    lg: "h-12 px-6 text-lg",
  };
  return sizeMap[size || ""] || "h-12 px-6 text-lg";
}

function getCtaIcon(iconType: string | undefined) {
  const iconMap = {
    "arrow-right": ArrowRight,
    "arrow-up-right": ArrowUpRight,
    "chevron-right": ChevronRight,
    none: null,
  };
  return iconMap[iconType || "arrow-right"] || ArrowRight;
}

// ─────────────────────────────────────────
// MAIN BANNER COMPONENT
// ─────────────────────────────────────────
export function Banner({
  id,
  testId,
  content = {},
  config = {},
  style = {},
  classes = {},
}: BannerProps) {
  const navigate = useNavigate();

  // ── EXTRACT CONTENT ──
  const {
    title = "Nouvelle Collection",
    subtitle = "Découvrez nos nouveaux produits exclusifs",
    image = "/images/banner-placeholder.jpg",
    ctaText = "Découvrir",
    ctaLink = "/products",
    showTitle = true,
    showSubtitle = true,
    showImage = true,
    showCta = true,
  } = content;

  // ── EXTRACT CONFIG ──
  const {
    variant = "default",
    imagePosition = "right",
    showCta: configShowCta = true,
    contentWidth = "medium",
    header = {},
    cardStyle = {},
    cta = {},
    image: imageConfig = {},
    animation = { entrance: "fade-in", duration: "normal" },
  } = config;

  const { title: titleTypography = {}, subtitle: subtitleTypography = {} } =
    header;

  const {
    variant: cardVariant = "standard",
    borderRadius: cardBorderRadius = "lg",
    shadow: cardShadow = "none",
  } = cardStyle;

  const {
    style: ctaStyle = "solid",
    size: ctaSize = "lg",
    icon: ctaIcon = "arrow-right",
    showIcon: showCtaIcon = true,
    position: ctaPosition = "inline",
  } = cta;

  const {
    aspectRatio: imageAspectRatio = "4/3",
    hoverEffect: imageHoverEffect = "zoom",
    hoverScale: imageHoverScale = 1.08,
    objectFit: imageObjectFit = "cover",
    borderRadius: imageBorderRadius = "lg",
  } = imageConfig;

  // ── EXTRACT STYLE ──
  const {
    colors: styleColors = {},
    spacing: styleSpacing = {},
    border: styleBorder = {},
  } = style;

  const {
    background: backgroundColor = "primary",
    text: textColor = "white",
    accent: accentColor = "accent",
  } = styleColors;

  const { container = "contained", paddingY = "16" } = styleSpacing;
  const { imageRadius = "lg" } = styleBorder;

  // ── HOOKS ──
  const { css } = useSectionStyles(style);

  // ── HELPERS ──
  const resolvedBgColor = resolveColor(backgroundColor, "#1a1a1a");
  const resolvedTextColor = resolveColor(textColor, "#ffffff");
  const resolvedAccentColor = resolveColor(accentColor, "#c9a96e");

  const isReversed = imagePosition === "left" || variant === "reversed";
  const isCentered = variant === "centered";
  const isCard = variant === "card" || cardVariant === "card";
  const isLuxury = variant === "luxury" || cardVariant === "luxury";
  const isMinimal = variant === "minimal" || cardVariant === "minimal";

  // Content width classes
  const contentWidthClass = {
    narrow: "max-w-lg",
    medium: "max-w-xl",
    wide: "max-w-2xl",
    full: "",
  }[contentWidth];

  // Card style classes
  const cardRadiusClass = getBorderRadiusClass(cardBorderRadius);
  const cardShadowClass = getShadowClass(cardShadow);
  const imageRadiusClass = getBorderRadiusClass(
    imageBorderRadius || imageRadius,
  );

  // Typography styles
  const titleFontFamily = resolveFontFamily(titleTypography.fontFamily);
  const titleFontSize = getFontSizeClass(titleTypography.fontSize);
  const titleFontWeight = getFontWeightClass(titleTypography.fontWeight);
  const titleTextAlign = getTextAlignClass(titleTypography.textAlign);
  const titleTextTransform = getTextTransformClass(
    titleTypography.textTransform,
  );
  const titleFontStyle =
    titleTypography.fontStyle === "italic" ? "italic" : "normal";

  const subtitleFontFamily = resolveFontFamily(subtitleTypography.fontFamily);
  const subtitleFontSize = getFontSizeClass(subtitleTypography.fontSize);
  const subtitleFontStyle =
    subtitleTypography.fontStyle === "italic" ? "italic" : "normal";

  // CTA Icon
  const CtaIcon = getCtaIcon(ctaIcon);

  const handleCtaClick = () => {
    if (ctaLink) {
      navigate(ctaLink.replace(/^\//, ""));
    }
  };

  // Card container styles
  const cardContainerStyles = isCard
    ? `${cardRadiusClass} ${cardShadowClass} overflow-hidden`
    : "";

  // Image hover styles
  const imageHoverStyles =
    imageHoverEffect !== "none"
      ? {
          whileHover: { scale: imageHoverScale },
          transition: { duration: 0.5 },
        }
      : {};

  // ── RENDER ──
  return (
    <SectionWrapper
      id={id}
      testId={testId}
      as="section"
      animation={animation}
      className={cn(
        "w-full overflow-hidden",
        isCard && "p-4 md:p-8",
        classes?.root,
      )}
      style={{
        backgroundColor: resolvedBgColor,
        color: resolvedTextColor,
        ...css,
      }}
    >
      <div
        className={cn(
          "mx-auto",
          cardContainerStyles,
          isCard && "bg-white/5 backdrop-blur-sm",
        )}
        style={{ backgroundColor: isCard ? `${resolvedBgColor}20` : undefined }}
      >
        <SectionContainer
          size={container}
          className={cn(
            "grid grid-cols-1 gap-8 items-center",
            isCentered ? "lg:grid-cols-1 text-center" : "lg:grid-cols-2",
            isLuxury && "gap-12",
            classes?.container,
          )}
          style={{
            paddingTop: `${parseInt(paddingY) * 0.25}rem`,
            paddingBottom: `${parseInt(paddingY) * 0.25}rem`,
          }}
        >
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: isReversed ? 30 : -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              isReversed ? "lg:order-2" : "lg:order-1",
              isCentered && "mx-auto",
              contentWidthClass,
              classes?.content,
            )}
          >
            {showTitle && title && (
              <h2
                className={cn(
                  "mb-4",
                  titleFontSize,
                  titleFontWeight,
                  titleTextAlign,
                  titleTextTransform,
                  isMinimal && "tracking-tight",
                  isLuxury && "tracking-wide",
                  classes?.title,
                )}
                style={{
                  color: resolvedTextColor,
                  fontFamily: titleFontFamily,
                  fontStyle: titleFontStyle,
                }}
              >
                {title}
              </h2>
            )}

            {showSubtitle && subtitle && (
              <p
                className={cn(
                  "mb-6",
                  subtitleFontSize,
                  subtitleFontStyle === "italic" && "italic",
                  isCentered && "mx-auto",
                  classes?.subtitle,
                )}
                style={{
                  color: `${resolvedTextColor}cc`,
                  fontFamily: subtitleFontFamily,
                  fontStyle: subtitleFontStyle,
                }}
              >
                {subtitle}
              </p>
            )}

            {showCta && configShowCta && ctaText && (
              <div
                className={cn(
                  ctaPosition === "below" && "mt-8",
                  isCentered && "flex justify-center",
                )}
              >
                {ctaStyle === "underline" ? (
                  <motion.button
                    onClick={handleCtaClick}
                    className={cn(
                      "group relative inline-flex items-center gap-2 text-lg font-medium",
                      classes?.cta,
                    )}
                    style={{ color: resolvedAccentColor }}
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <span className="relative">
                      {ctaText}
                      <span
                        className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full transition-all duration-300"
                        style={{ backgroundColor: resolvedAccentColor }}
                      />
                    </span>
                    {showCtaIcon && CtaIcon && <CtaIcon className="w-4 h-4" />}
                  </motion.button>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      size={ctaSize}
                      onClick={handleCtaClick}
                      className={cn(
                        "group transition-all",
                        ctaStyle === "outline" &&
                          "border-2 bg-transparent hover:bg-white/10",
                        ctaStyle === "ghost" &&
                          "bg-transparent hover:bg-white/10",
                        ctaPosition === "below" && "mt-4",
                        classes?.cta,
                      )}
                      style={{
                        backgroundColor:
                          ctaStyle === "solid"
                            ? resolvedAccentColor
                            : undefined,
                        borderColor:
                          ctaStyle === "outline"
                            ? resolvedAccentColor
                            : undefined,
                        color:
                          ctaStyle === "solid"
                            ? "#000000"
                            : resolvedAccentColor,
                      }}
                    >
                      <span className={getButtonSizeClass(ctaSize)}>
                        <span className="flex items-center gap-2">
                          {ctaText}
                          {showCtaIcon && CtaIcon && (
                            <CtaIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          )}
                        </span>
                      </span>
                    </Button>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>

          {/* Image */}
          {showImage && !isCentered && (
            <motion.div
              initial={{ opacity: 0, x: isReversed ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.1,
              }}
              className={cn(
                isReversed ? "lg:order-1" : "lg:order-2",
                classes?.image,
              )}
            >
              <div
                className={cn(
                  "overflow-hidden",
                  imageRadiusClass,
                  isLuxury && "relative",
                )}
                style={{ aspectRatio: imageAspectRatio }}
              >
                {isLuxury && (
                  <div
                    className="absolute inset-0 z-10 pointer-events-none"
                    style={{
                      border: `1px solid ${resolvedAccentColor}40`,
                      borderRadius: "inherit",
                    }}
                  />
                )}
                <motion.img
                  src={image}
                  alt={title}
                  className={cn(
                    "w-full h-full",
                    imageObjectFit === "cover"
                      ? "object-cover"
                      : "object-contain",
                  )}
                  {...imageHoverStyles}
                />
              </div>
            </motion.div>
          )}
        </SectionContainer>
      </div>
    </SectionWrapper>
  );
}

Object.assign(Banner, { schema: bannerSchema });

export const schema = bannerSchema;

export default Banner;
