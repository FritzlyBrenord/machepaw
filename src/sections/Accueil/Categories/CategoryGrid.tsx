"use client";

import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { SectionContainer, SectionWrapper } from "@/components/SectionWrapper";
import { cn } from "@/hooks/useSectionStyles";
import type { Category, CategoryGridProps } from "@/types/section-config-types";
import categoryGridSchema from "./CategoryGrid.schema";

type CategoryGridViewAllButton = {
  text?: string;
  href?: string;
  link?: string;
};

type CategoryGridSlidesConfig = {
  enabled?: boolean;
  autoplay?: boolean;
  interval?: number;
  infinite?: boolean;
  showArrows?: boolean;
  showDots?: boolean;
};

type CategoryGridContentExtras = NonNullable<CategoryGridProps["content"]> & {
  viewAllButton?: CategoryGridViewAllButton;
};

type CategoryGridConfigExtras = NonNullable<CategoryGridProps["config"]> & {
  titleAlignment?: "left" | "center" | "right";
  titlePosition?: "top" | "bottom";
  showViewAllButton?: boolean;
  viewAllButtonPosition?: "header-right" | "header-bottom" | "footer";
  viewAllButtonStyle?: "text" | "underline" | "outline" | "solid";
  slides?: CategoryGridSlidesConfig;
};

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

function resolveFontFamily(fontFamily?: string): string | undefined {
  if (!fontFamily) return undefined;

  const fontMap: Record<string, string> = {
    sans: "ui-sans-serif, system-ui, sans-serif",
    serif: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, monospace",
    inter: "'Inter', ui-sans-serif, system-ui, sans-serif",
    roboto: "'Roboto', ui-sans-serif, system-ui, sans-serif",
    poppins: "'Poppins', ui-sans-serif, system-ui, sans-serif",
    montserrat: "'Montserrat', ui-sans-serif, system-ui, sans-serif",
    playfair: "'Playfair Display', ui-serif, Georgia, serif",
    merriweather: "'Merriweather', ui-serif, Georgia, serif",
    bebasneue: "'Bebas Neue', sans-serif",
    oswald: "'Oswald', sans-serif",
    urbanist: "'Urbanist', ui-sans-serif, system-ui, sans-serif",
  };

  return fontMap[fontFamily] || fontFamily;
}

// Typography helper functions
function getFontSizeClass(
  size: string | undefined,
  type: "title" | "subtitle" = "title",
): string {
  const sizeMap: Record<string, Record<string, string>> = {
    title: {
      "2xl": "text-2xl md:text-3xl",
      "3xl": "text-3xl md:text-4xl",
      "4xl": "text-4xl md:text-5xl",
      "5xl": "text-5xl md:text-6xl",
      "6xl": "text-6xl md:text-7xl",
    },
    subtitle: {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
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

function getTextAlignClass(align: string | undefined): string {
  const alignMap: Record<string, string> = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };
  return alignMap[align || ""] || "text-center";
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

function CategoryCard({
  category,
  index,
  aspectRatio,
  hoverEffect,
  showProductCount,
  accentColor,
  fontFamily,
  classes,
  isBentoLarge = false,
  cardStyle,
}: {
  category: Category;
  index: number;
  aspectRatio: string;
  hoverEffect: string;
  showProductCount: boolean;
  accentColor: string;
  fontFamily?: string;
  classes?: {
    item?: string;
    link?: string;
    imageWrapper?: string;
    image?: string;
    imageHover?: string;
    overlay?: string;
    content?: string;
    title?: string;
    subtitle?: string;
    count?: string;
    badge?: string;
  };
  isBentoLarge?: boolean;
  cardStyle?: {
    variant?: string;
    borderRadius?: string;
    borderWidth?: string;
    shadow?: string;
    titlePosition?: string;
  };
}) {
  const aspectClasses: Record<string, string> = {
    square: "aspect-square",
    portrait: "aspect-[3/4]",
    landscape: "aspect-video",
    "4/5": "aspect-[4/5]",
    "3/4": "aspect-[3/4]",
  };

  const hoverClasses: Record<string, string> = {
    zoom: "group-hover:scale-110",
    "zoom-slow": "group-hover:scale-110",
    darken: "",
    reveal: "",
    swap: "",
    play: "",
    none: "",
  };

  // Card style configurations
  const borderRadiusClasses: Record<string, string> = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-lg",
    lg: "rounded-2xl",
    xl: "rounded-3xl",
    full: "rounded-full",
  };

  const borderWidthClasses: Record<string, string> = {
    "0": "border-0",
    "1": "border",
    "2": "border-2",
    "4": "border-4",
  };

  const shadowClasses: Record<string, string> = {
    none: "shadow-none",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
  };

  const cardVariant = cardStyle?.variant || "default";
  const borderRadius = cardStyle?.borderRadius || "md";
  const borderWidth = cardStyle?.borderWidth || "0";
  const shadow = cardStyle?.shadow || "none";
  const titlePosition = cardStyle?.titlePosition || "overlay";

  const href = category.href || category.link || "#";

  // Card variant styles
  const isCardVariant =
    cardVariant === "card" ||
    cardVariant === "frame" ||
    cardVariant === "elegant" ||
    cardVariant === "luxury";
  const isMinimalVariant = cardVariant === "minimal";
  const isModernVariant = cardVariant === "modern";

  return (
    <motion.a
      href={href}
      className={cn(
        "group relative block overflow-hidden bg-neutral-100",
        borderRadiusClasses[borderRadius],
        borderWidthClasses[borderWidth],
        shadowClasses[shadow],
        isCardVariant && "border-gray-200",
        isCardVariant && titlePosition === "below" && "flex flex-col",
        isMinimalVariant && "bg-transparent",
        isBentoLarge
          ? "aspect-square md:aspect-auto md:h-full"
          : aspectClasses[aspectRatio] || "aspect-square",
        hoverEffect === "lift" &&
          "group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)]",
        hoverEffect === "glow" &&
          "group-hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]",
        classes?.item,
        classes?.link,
      )}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {/* Title above image for card variant */}
      {isCardVariant && titlePosition === "above" && (
        <div className={cn("p-4 text-center", classes?.content)}>
          <h3
            className={cn(
              "text-lg font-semibold text-gray-900",
              classes?.title,
            )}
            style={{ fontFamily }}
          >
            {category.name}
          </h3>
        </div>
      )}

      <div
        className={cn(
          "relative h-full w-full overflow-hidden",
          borderRadiusClasses[borderRadius],
          isCardVariant && titlePosition === "below"
            ? "flex-1"
            : "absolute inset-0",
          classes?.imageWrapper,
        )}
      >
        <motion.img
          src={category.image}
          alt={category.name}
          className={cn(
            "h-full w-full object-cover transition-transform duration-700 ease-out",
            hoverClasses[hoverEffect] || hoverClasses.zoom,
            classes?.image,
          )}
          whileHover={
            hoverEffect === "zoom" || hoverEffect === "zoom-slow"
              ? { scale: 1.1 }
              : {}
          }
          transition={{ duration: hoverEffect === "zoom-slow" ? 1.2 : 0.7 }}
        />

        {hoverEffect === "swap" && category.hoverImage ? (
          <img
            src={category.hoverImage}
            alt={category.name}
            className={cn(
              "absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100",
              classes?.imageHover,
            )}
          />
        ) : null}

        {/* Overlay for non-card variants or overlay position */}
        {(!isCardVariant || titlePosition === "overlay") && (
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-90",
              isMinimalVariant && "from-black/60 via-black/10",
              classes?.overlay,
            )}
          />
        )}

        {/* Badge */}
        {category.badge ? (
          <div className={cn("absolute left-4 top-4 z-10", classes?.badge)}>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider",
                cardVariant === "luxury" && "border border-white/30",
              )}
              style={{ backgroundColor: accentColor, color: "#fff" }}
            >
              {category.badge}
            </span>
          </div>
        ) : null}

        {/* Content overlay (for default, overlay, or modern variants) */}
        {(!isCardVariant || titlePosition === "overlay") && (
          <div
            className={cn(
              "absolute inset-0 flex flex-col justify-end p-6 sm:p-8",
              classes?.content,
            )}
          >
            <div className="translate-y-4 transform transition-transform duration-500 ease-out group-hover:translate-y-0">
              <h3
                className={cn(
                  "mb-2 text-2xl tracking-tight text-white sm:text-3xl",
                  cardVariant === "luxury" && "font-light tracking-wider",
                  cardVariant === "modern" && "font-bold",
                  classes?.title,
                )}
                style={{ fontFamily }}
              >
                {category.name}
              </h3>

              {category.description ? (
                <p
                  className={cn(
                    "mb-3 text-sm text-white/70",
                    classes?.subtitle,
                  )}
                  style={{ fontFamily }}
                >
                  {category.description}
                </p>
              ) : null}

              <div className="flex items-center justify-between">
                {showProductCount && category.productCount !== undefined ? (
                  <p
                    className={cn(
                      "text-sm font-medium uppercase tracking-widest text-white/70",
                      classes?.count,
                    )}
                  >
                    {category.productCount} produits
                  </p>
                ) : null}

                <div
                  className="flex items-center gap-2 opacity-0 transition-opacity duration-500 delay-100 group-hover:opacity-100"
                  style={{ color: accentColor }}
                >
                  <span className="text-sm font-semibold uppercase tracking-wider">
                    Explorer
                  </span>
                  <ArrowRight className="h-5 w-5 transition-transform duration-500 group-hover:translate-x-2" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Title below image for card variant */}
      {isCardVariant && titlePosition === "below" && (
        <div className={cn("p-4", classes?.content)}>
          <h3
            className={cn(
              "text-lg font-semibold text-gray-900",
              cardVariant === "luxury" && "font-light tracking-wide",
              classes?.title,
            )}
            style={{ fontFamily }}
          >
            {category.name}
          </h3>
          {category.description && (
            <p className={cn("mt-1 text-sm text-gray-500", classes?.subtitle)}>
              {category.description}
            </p>
          )}
          {showProductCount && category.productCount !== undefined && (
            <p className={cn("mt-2 text-xs text-gray-400", classes?.count)}>
              {category.productCount} produits
            </p>
          )}
        </div>
      )}
    </motion.a>
  );
}

export function CategoryGrid({
  id,
  testId,
  content = {},
  config = {},
  style = {},
  classes = {},
}: CategoryGridProps) {
  const extendedContent = content as CategoryGridContentExtras;
  const extendedConfig = config as CategoryGridConfigExtras;
  const {
    title,
    subtitle,
    categories = [],
    showTitle = true,
    showSubtitle = true,
  } = extendedContent;

  const {
    variant = "mosaic-2x2",
    aspectRatio = "3/4",
    gap = "6",
    hoverEffect = "zoom",
    showProductCount = true,
    animation = { entrance: "stagger", stagger: true },
    // New props from registry
    titleAlignment,
    titlePosition,
    showViewAllButton,
    viewAllButtonPosition,
    viewAllButtonStyle,
    slides,
    header,
    cardStyle,
  } = extendedConfig;
  const columns =
    typeof extendedConfig.columns === "string"
      ? parseInt(extendedConfig.columns, 10)
      : extendedConfig.columns || 4;

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

  // Extract all typography props from registry
  const {
    titleSize: styleTitleSize,
    textAlign: styleTextAlign,
    fontFamily,
    // New typography props
    titleFontFamily,
    titleFontSize,
    titleFontWeight,
    titleTextTransform,
    titleLetterSpacing,
    titleLineHeight,
    subtitleFontSize,
    subtitleFontStyle,
  } = styleTypography;

  // Determine effective alignment (config overrides style)
  const effectiveAlignment = titleAlignment || styleTextAlign || "center";
  const effectiveTitlePosition = titlePosition || "top";

  // Determine effective title size
  const titleSize = titleFontSize || styleTitleSize || "4xl";

  const {
    container = "contained",
    paddingY = "16",
    gap: styleGap,
  } = styleSpacing;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
    loop: slides?.infinite ?? true,
  });

  // Carousel autoplay
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi],
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi],
  );
  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi],
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  // Autoplay effect
  useEffect(() => {
    if (!emblaApi || !slides?.enabled || !slides?.autoplay) return;
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, slides?.interval || 5000);
    return () => clearInterval(interval);
  }, [emblaApi, slides?.enabled, slides?.autoplay, slides?.interval]);

  const resolvedBgColor = resolveColor(backgroundColor, "#f5f5f5");
  const resolvedTextColor = resolveColor(textColor, "#1a1a1a");
  const resolvedAccentColor = resolveColor(accentColor, "#c9a96e");
  const resolvedFontFamily = resolveFontFamily(
    titleFontFamily ||
      (typeof fontFamily === "string" ? fontFamily : undefined),
  );
  const effectiveGap = styleGap || gap;

  // Get view all button config
  const viewAllConfig: CategoryGridViewAllButton =
    extendedContent.viewAllButton || {
      text: "Voir tout",
      href: "/categories",
    };

  const bentoColSpans = (index: number): string => {
    const pattern = index % 5;

    if (pattern === 0) return "md:col-span-2 md:row-span-2";
    if (columns === 3 && pattern === 3) return "md:col-span-2";
    if (columns >= 4 && pattern === 4) return "md:col-span-2";

    return "";
  };

  const getGridClasses = () => {
    if (variant === "mosaic-2x2") return "grid-cols-1 sm:grid-cols-2";
    if (variant === "mosaic-3")
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    if (variant === "bento")
      return "grid-cols-1 md:grid-cols-3 lg:grid-cols-4 auto-rows-[250px] md:auto-rows-[300px]";

    const colMap: Record<number, string> = {
      2: "grid-cols-1 sm:grid-cols-2",
      3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
    };

    return colMap[columns] || colMap[4];
  };

  if (!categories.length) return null;

  const isCarousel =
    variant === "horizontal" || variant === "carousel" || slides?.enabled;
  const isBento = variant === "bento";
  const showCarouselArrows = slides?.enabled && slides?.showArrows !== false;
  const showCarouselDots = slides?.enabled && slides?.showDots === true;
  const gapClass =
    effectiveGap === "0"
      ? "gap-0"
      : effectiveGap === "2"
        ? "gap-2"
        : effectiveGap === "4"
          ? "gap-4"
          : effectiveGap === "6"
            ? "gap-4 sm:gap-6 lg:gap-8"
            : effectiveGap === "8"
              ? "gap-6 lg:gap-8"
              : "gap-4 sm:gap-6 lg:gap-8";

  return (
    <SectionWrapper
      id={id}
      testId={testId}
      as="section"
      animation={animation}
      className={cn("relative w-full overflow-hidden", classes.root)}
      style={{ backgroundColor: resolvedBgColor }}
    >
      <SectionContainer
        size={container}
        className={cn("relative", classes.container)}
        style={{
          paddingTop: `${parseInt(String(paddingY), 10) * 0.25}rem`,
          paddingBottom: `${parseInt(String(paddingY), 10) * 0.25}rem`,
        }}
      >
        {(showTitle && title) || (showSubtitle && subtitle) ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "mb-12 max-w-3xl",
              getTextAlignClass(
                header?.title?.textAlign || titleAlignment || "center",
              ),
              classes.inner,
            )}
          >
            {showTitle && title ? (
              <h2
                className={cn(
                  "mb-4 tracking-tight",
                  getFontSizeClass(header?.title?.fontSize || "4xl", "title"),
                  getFontWeightClass(header?.title?.fontWeight),
                  getTextTransformClass(header?.title?.textTransform),
                  header?.title?.fontStyle === "italic" && "italic",
                  classes.title,
                )}
                style={{
                  color: resolvedTextColor,
                  fontFamily: resolveFontFamily(header?.title?.fontFamily),
                }}
              >
                {title}
              </h2>
            ) : null}
            {showSubtitle && subtitle ? (
              <p
                className={cn(
                  getFontSizeClass(
                    header?.subtitle?.fontSize || "lg",
                    "subtitle",
                  ),
                  header?.subtitle?.fontStyle === "italic" && "italic",
                  classes.subtitle,
                )}
                style={{
                  color: `${resolvedTextColor}b3`,
                  fontFamily: resolveFontFamily(header?.subtitle?.fontFamily),
                }}
              >
                {subtitle}
              </p>
            ) : null}

            {/* View All Button - Header Bottom Position */}
            {showViewAllButton && viewAllButtonPosition === "header-bottom" ? (
              <div className="mt-6">
                <a
                  href={viewAllConfig.href || "/categories"}
                  className={cn(
                    "inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wider transition-all",
                    viewAllButtonStyle === "underline" &&
                      "underline underline-offset-4",
                    viewAllButtonStyle === "outline" &&
                      "border rounded-full px-4 py-2",
                    viewAllButtonStyle === "solid" &&
                      "rounded-full px-4 py-2 text-white",
                  )}
                  style={{
                    color:
                      viewAllButtonStyle === "solid"
                        ? "#fff"
                        : resolvedAccentColor,
                    borderColor:
                      viewAllButtonStyle === "outline"
                        ? resolvedAccentColor
                        : undefined,
                    backgroundColor:
                      viewAllButtonStyle === "solid"
                        ? resolvedAccentColor
                        : undefined,
                  }}
                >
                  {viewAllConfig.text || "Voir tout"}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            ) : null}
          </motion.div>
        ) : null}

        {isCarousel ? (
          <div className="overflow-hidden px-4 sm:px-6 lg:px-8" ref={emblaRef}>
            <div className="flex gap-4 pb-8 pt-4 sm:gap-6 lg:gap-8">
              {categories.map((category, index) => (
                <div
                  key={index}
                  className="min-w-0 flex-[0_0_85%] sm:flex-[0_0_45%] md:flex-[0_0_35%] lg:flex-[0_0_28%]"
                >
                  <CategoryCard
                    category={category}
                    index={index}
                    aspectRatio={aspectRatio}
                    hoverEffect={hoverEffect}
                    showProductCount={showProductCount}
                    accentColor={resolvedAccentColor}
                    fontFamily={resolvedFontFamily}
                    classes={classes}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={cn("grid", getGridClasses(), gapClass, classes.grid)}>
            {categories.map((category, index) => (
              <div key={index} className={isBento ? bentoColSpans(index) : ""}>
                <CategoryCard
                  category={category}
                  index={index}
                  aspectRatio={aspectRatio}
                  hoverEffect={hoverEffect}
                  showProductCount={showProductCount}
                  accentColor={resolvedAccentColor}
                  fontFamily={resolvedFontFamily}
                  classes={classes}
                  isBentoLarge={
                    isBento && bentoColSpans(index).includes("row-span-2")
                  }
                  cardStyle={cardStyle}
                />
              </div>
            ))}
          </div>
        )}

        {/* Carousel Navigation Arrows */}
        {showCarouselArrows ? (
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={scrollPrev}
              className="flex h-10 w-10 items-center justify-center rounded-full border transition-all"
              style={{
                borderColor: `${resolvedAccentColor}40`,
                color: resolvedAccentColor,
              }}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={scrollNext}
              className="flex h-10 w-10 items-center justify-center rounded-full border transition-all"
              style={{
                borderColor: `${resolvedAccentColor}40`,
                color: resolvedAccentColor,
              }}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        ) : null}

        {/* Carousel Dots */}
        {showCarouselDots && scrollSnaps.length > 0 ? (
          <div className="flex justify-center gap-2 mt-4">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  selectedIndex === index ? "w-6" : "w-2 hover:opacity-70",
                )}
                style={{
                  backgroundColor:
                    selectedIndex === index
                      ? resolvedAccentColor
                      : `${resolvedTextColor}50`,
                }}
              />
            ))}
          </div>
        ) : null}

        {/* View All Button - Footer Position */}
        {showViewAllButton && viewAllButtonPosition === "footer" ? (
          <motion.div
            className={cn(
              "mt-10 flex",
              effectiveAlignment === "center" && "justify-center",
              effectiveAlignment === "right" && "justify-end",
            )}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <a
              href={viewAllConfig.href || "/categories"}
              className={cn(
                "inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wider transition-all",
                viewAllButtonStyle === "underline" &&
                  "underline underline-offset-4",
                viewAllButtonStyle === "outline" &&
                  "border rounded-full px-4 py-2",
                viewAllButtonStyle === "solid" &&
                  "rounded-full px-4 py-2 text-white",
              )}
              style={{
                color:
                  viewAllButtonStyle === "solid" ? "#fff" : resolvedAccentColor,
                borderColor:
                  viewAllButtonStyle === "outline"
                    ? resolvedAccentColor
                    : undefined,
                backgroundColor:
                  viewAllButtonStyle === "solid"
                    ? resolvedAccentColor
                    : undefined,
              }}
            >
              {viewAllConfig.text || "Voir tout"}
              <ArrowRight className="h-4 w-4" />
            </a>
          </motion.div>
        ) : null}
      </SectionContainer>
    </SectionWrapper>
  );
}

Object.assign(CategoryGrid, { schema: categoryGridSchema });

export const schema = categoryGridSchema;

export default CategoryGrid;
