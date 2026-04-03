// ============================================
// CONFIGURABLE SECTIONS - Type Definitions
// ============================================
// Architecture 100% configurable via props
// content / config / style / classes
// ============================================

import type { CSSProperties, JSX, ReactNode } from "react";

// ─────────────────────────────────────────
// 1. BASE STYLING TOKENS
// ─────────────────────────────────────────

export type SpacingToken = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12' | '16' | '20' | '24' | '32' | '40' | '48' | '64';
export type SizeToken = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl' | '9xl';
export type ColorToken = 'primary' | 'secondary' | 'accent' | 'muted' | 'white' | 'black' | 'transparent' | string;
export type FontWeightToken = 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
export type LineHeightToken = 'none' | 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose';
export type LetterSpacingToken = 'tighter' | 'tight' | 'normal' | 'wide' | 'wider' | 'widest';
export type TextAlignToken = 'left' | 'center' | 'right' | 'justify';
export type TextTransformToken = 'none' | 'uppercase' | 'lowercase' | 'capitalize';
export type BorderWidthToken = '0' | '1' | '2' | '4' | '8';
export type BorderStyleToken = 'solid' | 'dashed' | 'dotted' | 'none';
export type BorderRadiusToken = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
export type ShadowToken = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'inner';
export type BlurToken = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export type ContainerToken = 'full' | 'contained' | 'narrow' | 'narrower';
export type AnimationDurationToken = 'fast' | 'normal' | 'slow';
export type GradientDirectionToken = 'to-t' | 'to-b' | 'to-l' | 'to-r' | 'to-tl' | 'to-tr' | 'to-bl' | 'to-br';

// ─────────────────────────────────────────
// 2. BASE STYLE INTERFACE (All sections)
// ─────────────────────────────────────────

export interface BaseSectionStyle {
  spacing?: {
    padding?: SpacingToken | string;
    paddingX?: SpacingToken | string;
    paddingY?: SpacingToken | string;
    margin?: SpacingToken | string;
    gap?: SpacingToken | string;
    container?: ContainerToken;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
    minHeight?: string;
    [key: string]: string | number | boolean | undefined;
  };
  colors?: {
    background?: ColorToken;
    text?: ColorToken;
    textMuted?: ColorToken;
    accent?: ColorToken;
    border?: ColorToken;
    overlay?: ColorToken;
    backgroundScrolled?: ColorToken;
    textScrolled?: ColorToken;
    cardBackground?: ColorToken;
    cardBg?: ColorToken;
    success?: ColorToken;
    [key: string]: string | number | undefined;
  };
  typography?: {
    fontFamily?: 'sans' | 'serif' | 'mono' | 'custom' | string;
    fontSize?: SizeToken | string;
    titleSize?: SizeToken | string;
    titleWeight?: FontWeightToken;
    titleLineHeight?: LineHeightToken;
    titleLetterSpacing?: LetterSpacingToken;
    textAlign?: TextAlignToken;
    textTransform?: TextTransformToken;
    fontWeight?: FontWeightToken | string;
    lineHeight?: LineHeightToken | string;
    letterSpacing?: LetterSpacingToken | string;
    bodySize?: SizeToken | string;
    bodyLineHeight?: LineHeightToken | string;
    valueSize?: SizeToken | string;
    valueWeight?: FontWeightToken | string;
    labelSize?: SizeToken | string;
    labelLetterSpacing?: LetterSpacingToken | string;
    labelTransform?: TextTransformToken | string;
    quoteSize?: SizeToken | string;
    quoteStyle?: string;
    [key: string]: string | undefined;
  };
  border?: {
    width?: BorderWidthToken;
    style?: BorderStyleToken;
    radius?: BorderRadiusToken;
    color?: ColorToken;
    input?: string;
    inputRadius?: BorderRadiusToken | string;
    imageRadius?: BorderRadiusToken | string;
    [key: string]: string | undefined;
  };
  shadow?: ShadowToken;
  effects?: {
    overlay?: {
      enabled?: boolean;
      type?: 'solid' | 'gradient' | 'blur' | 'noise' | 'vignette';
      opacity?: number;
      gradientDirection?: GradientDirectionToken;
    };
    backdropBlur?: BlurToken;
    opacity?: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// ─────────────────────────────────────────
// 3. BASE CONFIG INTERFACE (All sections)
// ─────────────────────────────────────────

export interface BaseSectionConfig {
  variant?: string;
  layout?: string;
  animation?: {
    entrance?: 'fade-in' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale-in' | 'stagger' | 'none' | string;
    duration?: AnimationDurationToken;
    stagger?: boolean;
    staggerDelay?: number;
    hover?: 'lift' | 'zoom' | 'glow' | 'none';
    scroll?: boolean;
  };
  responsive?: {
    mobile?: Record<string, unknown>;
    tablet?: Record<string, unknown>;
    desktop?: Record<string, unknown>;
  };
  [key: string]: unknown;
}

// ─────────────────────────────────────────
// 4. BASE CLASSES INTERFACE (All sections)
// ─────────────────────────────────────────

export interface BaseSectionClasses {
  root?: string;
  container?: string;
  wrapper?: string;
  inner?: string;
  [key: string]: string | undefined;
}

// ─────────────────────────────────────────
// 5. SECTION 1: ANNOUNCEMENT BAR
// ─────────────────────────────────────────

export interface AnnouncementBarContent {
  messages?: string[] | Array<{ text: string; link?: string; icon?: string }>;
  autoRotate?: boolean;
  interval?: number;
  dismissible?: boolean;
  icon?: string;
}

export interface AnnouncementBarConfig extends BaseSectionConfig {
  variant?: 'default' | 'minimal' | 'rotating' | 'marquee';
  layout?: 'center' | 'slider' | 'split';
  showCloseButton?: boolean;
  showNavigation?: boolean;
  showDots?: boolean;
}

export interface AnnouncementBarClasses extends BaseSectionClasses {
  inner?: string;
  message?: string;
  icon?: string;
  closeButton?: string;
  arrow?: string;
}

export interface AnnouncementBarProps {
  id?: string;
  testId?: string;
  content?: AnnouncementBarContent;
  config?: AnnouncementBarConfig;
  style?: BaseSectionStyle;
  classes?: AnnouncementBarClasses;
}

// ─────────────────────────────────────────
// 6. SECTION 2: HEADER MODERN
// ─────────────────────────────────────────

export interface HeaderNavigationItem {
  id?: string;
  label?: string;
  href?: string;
  link?: string;
  icon?: string;
  megaMenu?: boolean;
  enabled?: boolean;
  children?: HeaderNavigationItem[];
  featured?: {
    title?: string;
    description?: string;
    image?: string;
    cta?: { text: string; href?: string; link?: string };
  };
  [key: string]: unknown;
}

export interface HeaderLogo {
  show?: boolean;
  showText?: boolean;
  showIcon?: boolean;
  type?: 'text' | 'image' | 'svg' | 'initial';
  text?: string;
  image?: string;
  svg?: ReactNode;
  letterSpacing?: string;
  fontSize?: SizeToken | string;
  fontWeight?: FontWeightToken | string;
  fontStyle?: 'normal' | 'italic';
  textTransform?: TextTransformToken;
  fontFamily?: string;
  [key: string]: unknown;
}

export interface HeaderModernContent {
  logo?: HeaderLogo;
  navigation?: HeaderNavigationItem[];
  actions?: Array<'search' | 'account' | 'cart' | 'wishlist'>;
  ctaButton?: { text: string; href?: string; link?: string; variant?: string };
  cartBadge?: { style?: 'dot' | 'number' | 'pulse' };
  [key: string]: unknown;
}

export interface HeaderModernConfig extends BaseSectionConfig {
  variant?: 'default' | 'minimal' | 'split' | 'centered' | 'transparent' | 'floating';
  behavior?: {
    sticky?: boolean;
    hideOnScroll?: boolean;
    transparentAtTop?: boolean;
    blurOnScroll?: boolean;
    elevatedOnScroll?: boolean;
  };
  navigation?: {
    fontFamily?: string;
    fontWeight?: FontWeightToken | string;
    fontStyle?: 'normal' | 'italic';
    textTransform?: TextTransformToken;
    fontSize?: SizeToken | string;
    letterSpacing?: string;
    hoverEffect?: 'opacity' | 'underline' | 'underline-slide' | 'highlight' | 'box' | 'box-rounded' | 'pill' | 'glow' | 'scale' | 'color' | 'none';
    hoverColor?: string;
    hoverBgColor?: string;
    hoverUnderlineHeight?: number;
    hoverUnderlineOffset?: number;
  };
  search?: {
    style?: 'icon' | 'inline' | 'expandable' | 'drawer';
    inlineWidth?: 'sm' | 'md' | 'lg' | 'xl';
    inlinePlaceholder?: string;
    inlineRounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  };
  iconSize?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface HeaderModernClasses extends BaseSectionClasses {
  inner?: string;
  logo?: string;
  logoText?: string;
  logoImage?: string;
  nav?: string;
  navList?: string;
  navItem?: string;
  navLink?: string;
  ctaButton?: string;
  actions?: string;
  actionButton?: string;
  mobileMenu?: string;
  mobileMenuButton?: string;
}

export interface HeaderModernProps {
  id?: string;
  testId?: string;
  content?: HeaderModernContent;
  config?: HeaderModernConfig;
  style?: BaseSectionStyle & {
    colors?: BaseSectionStyle['colors'] & {
      backgroundScrolled?: ColorToken;
      textScrolled?: ColorToken;
    };
  };
  classes?: HeaderModernClasses;
}

// ─────────────────────────────────────────
// 7. SECTION 3: HERO
// ─────────────────────────────────────────

export interface HeroTitleLine {
  text: string;
  style?: 'normal' | 'italic' | 'bold' | 'highlight';
  highlight?: boolean;
  color?: ColorToken;
}

export interface HeroTitle {
  lines?: HeroTitleLine[];
  as?: 'h1' | 'h2' | 'h3';
  single?: string; // Alternative: simple string
}

export interface HeroPreTitle {
  text: string;
  style?: 'none' | 'line' | 'pill' | 'badge';
  icon?: string;
}

export interface HeroCTA {
  primary?: {
    text: string;
    href: string;
    icon?: string;
    style?: 'solid' | 'outline' | 'ghost' | 'text';
  };
  secondary?: {
    text: string;
    href: string;
    icon?: string;
    style?: 'solid' | 'outline' | 'ghost' | 'text';
  };
}

export interface HeroMedia {
  type: 'image' | 'video' | 'carousel' | 'embed';
  src?: string | string[];
  videoSrc?: string;
  embedUrl?: string;
  poster?: string;
  alt?: string;
  parallax?: boolean;
  zoomOnHover?: boolean;
  aspectRatio?: string;
}

export interface HeroContent {
  // Visibility toggles
  showPretitle?: boolean;
  showTitle?: boolean;
  showSubtitle?: boolean;
  showBody?: boolean;
  showMedia?: boolean;
  showCTA?: boolean;
  showMetrics?: boolean;
  showScrollIndicator?: boolean;
  // Content
  pretitle?: HeroPreTitle;
  title?: HeroTitle | string;
  subtitle?: string;
  body?: string;
  cta?: HeroCTA;
  media?: HeroMedia;
  metrics?: Array<{ value: string; label: string; prefix?: string; suffix?: string }>;
  slides?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

export interface HeroTypographyConfig {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  fontStyle?: 'normal' | 'italic';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  lineHeight?: string;
  letterSpacing?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
}

export interface HeroAnimationConfig {
  entrance?: 'none' | 'fade-in' | 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale-in' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'reveal-up' | 'blur-in' | 'bounce' | 'flip' | 'rotate' | string;
  duration?: 'fast' | 'normal' | 'slow' | 'very-slow' | number;
  stagger?: boolean;
  staggerDelay?: number;
  easing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear' | 'spring' | 'bounce' | 'smooth' | string;
  parallax?: boolean;
  parallaxSpeed?: number;
  hover?: 'none' | 'scale' | 'lift' | 'glow' | 'shake' | 'pulse' | 'lift' | 'zoom' | string;
  scroll?: boolean;
}

export interface HeroLayoutConfig {
  type?: 'content-over-media' | 'split-left' | 'split-right' | 'stacked-top' | 'stacked-bottom' | 'side-by-side';
  mediaPosition?: 'left' | 'right' | 'background';
  contentPosition?: 'left' | 'center' | 'right';
  contentWidth?: 'narrow' | 'medium' | 'wide' | 'full';
  gap?: string;
  mediaWidth?: string;
}

export interface HeroConfig extends BaseSectionConfig {
  variant?: 'fullscreen-center' | 'fullscreen-left' | 'fullscreen-right' | 'fullscreen-cinematic' | 'split' | 'minimal' | 'carousel' | 'video-bg' | 'editorial';
  ratio?: string;
  verticalAlign?: 'top' | 'center' | 'bottom';
  overlay?: {
    enabled?: boolean;
    type?: 'solid' | 'gradient' | 'blur' | 'vignette';
    opacity?: number;
    color?: ColorToken;
  };
  titleAnimation?: 'none' | 'split-text' | 'letter-by-letter' | 'word-by-word' | 'fade-up';
  // New layout config
  layoutConfig?: HeroLayoutConfig;
  // Typography configs
  typography?: {
    title?: HeroTypographyConfig;
    subtitle?: HeroTypographyConfig;
    pretitle?: HeroTypographyConfig;
    body?: HeroTypographyConfig;
  };
  // Extended animation config (extends BaseSectionConfig.animation)
  heroAnimation?: HeroAnimationConfig;
}

export interface HeroClasses extends BaseSectionClasses {
  mediaWrapper?: string;
  media?: string;
  overlay?: string;
  content?: string;
  pretitle?: string;
  title?: string;
  titleLine?: string;
  subtitle?: string;
  body?: string;
  ctaGroup?: string;
  ctaPrimary?: string;
  ctaSecondary?: string;
  scrollIndicator?: string;
  metrics?: string;
}

export interface HeroProps {
  id?: string;
  testId?: string;
  content?: HeroContent;
  config?: HeroConfig;
  style?: BaseSectionStyle;
  classes?: HeroClasses;
  storefrontStore?: Record<string, unknown> | null;
}

// ─────────────────────────────────────────
// 8. SECTION 4: STATS BAR
// ─────────────────────────────────────────

export interface StatItem {
  value: string | number;
  label: string;
  prefix?: string;
  suffix?: string;
  icon?: string;
  animated?: boolean;
}

export interface StatsBarContent {
  items?: StatItem[];
  animated?: boolean;
}

export interface StatsBarConfig extends BaseSectionConfig {
  variant?: 'horizontal' | 'grid-3' | 'grid-4' | 'cards' | 'minimal';
  divider?: boolean;
  columns?: number;
}

export interface StatsBarClasses extends BaseSectionClasses {
  inner?: string;
  item?: string;
  value?: string;
  label?: string;
  divider?: string;
  icon?: string;
}

export interface StatsBarProps {
  id?: string;
  testId?: string;
  content?: StatsBarContent;
  config?: StatsBarConfig;
  style?: BaseSectionStyle;
  classes?: StatsBarClasses;
}

// ─────────────────────────────────────────
// 9. SECTION 5: CATEGORY GRID
// ─────────────────────────────────────────

export interface Category {
  name: string;
  href?: string;
  link?: string;
  image: string;
  hoverImage?: string;
  description?: string;
  productCount?: number;
  badge?: string;
  [key: string]: unknown;
}

export interface CategoryGridContent {
  title?: string;
  subtitle?: string;
  showTitle?: boolean;
  showSubtitle?: boolean;
  categories?: Category[];
  [key: string]: unknown;
}

export interface CategoryGridHeaderConfig {
  title?: {
    textAlign?: 'left' | 'center' | 'right';
    fontFamily?: string;
    fontSize?: '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
    fontWeight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
    fontStyle?: 'normal' | 'italic';
    textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  };
  subtitle?: {
    textAlign?: 'left' | 'center' | 'right';
    fontFamily?: string;
    fontSize?: 'sm' | 'base' | 'lg' | 'xl';
    fontStyle?: 'normal' | 'italic';
  };
}

export interface CategoryGridCardStyleConfig {
  variant?: 'default' | 'card' | 'minimal' | 'luxury' | 'elegant' | 'modern' | 'frame';
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  borderWidth?: '0' | '1' | '2' | '4';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  titlePosition?: 'overlay' | 'below' | 'above';
}

export interface CategoryGridConfig extends BaseSectionConfig {
  variant?: 'mosaic-2x2' | 'mosaic-3' | 'horizontal' | 'list' | 'circular' | 'overlay-text' | 'reveal-text' | 'bento' | 'carousel' | string;
  columns?: number;
  aspectRatio?: 'square' | 'portrait' | 'landscape' | '4/5' | '3/4' | string;
  gap?: '0' | '2' | '4' | '6' | '8' | '12';
  hoverEffect?: 'zoom' | 'zoom-slow' | 'darken' | 'reveal' | 'swap' | 'play' | 'none' | 'lift' | 'glow' | string;
  showProductCount?: boolean;
  header?: CategoryGridHeaderConfig;
  cardStyle?: CategoryGridCardStyleConfig;
}

export interface CategoryGridClasses extends BaseSectionClasses {
  grid?: string;
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
}

export interface CategoryGridProps {
  id?: string;
  testId?: string;
  content?: CategoryGridContent;
  config?: CategoryGridConfig;
  style?: BaseSectionStyle;
  classes?: CategoryGridClasses;
}

// ─────────────────────────────────────────
// 10. SECTION 6: PRODUCT GRID
// ─────────────────────────────────────────

export interface ProductCardConfig {
  image?: {
    aspectRatio?: string;
    hoverEffect?: 'zoom' | 'swap' | 'none';
    hoverScale?: number;
    objectFit?: 'cover' | 'contain';
  };
  info?: {
    position?: 'below' | 'overlay' | 'aside';
    alignment?: 'left' | 'center' | 'right';
    showRating?: boolean;
    showPrice?: boolean;
    showBadge?: boolean;
  };
  badge?: {
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    style?: 'pill' | 'rectangle' | 'none';
  };
  quickView?: boolean;
  wishlist?: boolean;
  addToCart?: {
    show?: boolean;
    style?: 'solid' | 'outline' | 'ghost' | 'icon-only' | 'under-image' | 'on-hover';
    position?: 'bottom' | 'overlay' | 'inline';
    size?: 'sm' | 'md' | 'lg';
    text?: string;
  };
  style?: {
    variant?: 'standard' | 'minimal' | 'luxury' | 'elegant' | 'card' | 'overlay';
    borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    shadow?: 'none' | 'sm' | 'md' | 'lg';
  };
}

export interface ProductGridContent {
  title?: string;
  subtitle?: string;
  eyebrowText?: string;
  showTitle?: boolean;
  showSubtitle?: boolean;
  showEyebrowText?: boolean;
  viewAllButton?: {
    text?: string;
    href?: string;
  };
  products?: Array<{
    id: string;
    name: string;
    price: number;
    oldPrice?: number;
    image: string;
    hoverImage?: string;
    rating?: number;
    reviewCount?: number;
    badge?: string;
    href?: string;
    link?: string;
  }>;
  filters?: {
    enabled?: boolean;
    position?: 'sidebar' | 'top' | 'drawer' | 'hidden';
    facets?: string[];
    sortOptions?: string[];
  };
  storefrontStore?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ProductGridHeaderConfig {
  eyebrow?: {
    fontFamily?: string;
    fontSize?: 'xs' | 'sm' | 'base';
    fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
    textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  };
  title?: {
    textAlign?: 'left' | 'center' | 'right';
    fontFamily?: string;
    fontSize?: '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
    fontWeight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
    fontStyle?: 'normal' | 'italic';
    textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  };
  subtitle?: {
    textAlign?: 'left' | 'center' | 'right';
    fontFamily?: string;
    fontSize?: 'sm' | 'base' | 'lg' | 'xl';
    fontStyle?: 'normal' | 'italic';
  };
}

export interface ProductGridConfig extends BaseSectionConfig {
  variant?: 'grid-2' | 'grid-3' | 'grid-4' | 'grid-5' | 'masonry' | 'horizontal' | 'compact' | 'editorial' | 'asymmetric' | 'carousel' | string;
  cardStyle?: 'minimal' | 'standard' | 'luxury' | 'card';
  dynamicSource?:
    | 'newest'
    | 'featured'
    | 'recommended'
    | 'for_you'
    | 'best_selling'
    | 'most_demanded'
    | 'recently_ordered'
    | 'most_viewed'
    | 'price_below'
    | 'price_above'
    | 'category'
    | 'random';
  priceThreshold?: number;
  categoryFilter?: string;
  showViewAllButton?: boolean;
  viewAllButtonPosition?: 'header-right' | 'header-bottom' | 'footer';
  viewAllButtonStyle?: 'text' | 'underline' | 'outline' | 'solid';
  showQuickView?: boolean;
  showWishlist?: boolean;
  infiniteScroll?: boolean;
  loadMore?: 'button' | 'infinite' | 'none';
  productsPerPage?: number;
  columns?: number;
  header?: ProductGridHeaderConfig;
}

export interface ProductGridClasses extends BaseSectionClasses {
  header?: string;
  title?: string;
  subtitle?: string;
  filterBar?: string;
  filterButton?: string;
  sortSelect?: string;
  grid?: string;
  productCard?: string;
  cardImageWrapper?: string;
  cardImage?: string;
  cardImageSecondary?: string;
  cardBadge?: string;
  cardWishlist?: string;
  cardQuickView?: string;
  cardAddToCart?: string;
  cardInfo?: string;
  cardTitle?: string;
  cardPrice?: string;
  cardOldPrice?: string;
  cardRating?: string;
  loadMore?: string;
}

export interface ProductGridProps {
  id?: string;
  testId?: string;
  content?: ProductGridContent;
  config?: ProductGridConfig;
  cardConfig?: ProductCardConfig;
  style?: BaseSectionStyle;
  classes?: ProductGridClasses;
}

// ─────────────────────────────────────────
// 11. SECTION 7: EDITORIAL
// ─────────────────────────────────────────

export interface EditorialQuote {
  text: string;
  author?: string;
  role?: string;
}

export interface EditorialMedia {
  type: 'image' | 'video';
  src: string;
  aspectRatio?: string;
  frame?: {
    enabled?: boolean;
    border?: BorderWidthToken;
    color?: ColorToken;
    offset?: SpacingToken;
  };
  caption?: string;
}

export interface EditorialCTA {
  text: string;
  href: string;
  style?: 'solid' | 'outline' | 'underline' | 'text';
  icon?: string;
}

export interface EditorialContent {
  eyebrow?: { text: string; style?: 'none' | 'line' | 'pill' | 'badge' };
  title?: string;
  body?: string;
  quote?: EditorialQuote;
  cta?: EditorialCTA | EditorialCTA[];
  media?: EditorialMedia;
}

export interface EditorialConfig extends BaseSectionConfig {
  variant?: 'text-image' | 'image-text' | 'text-over' | 'full-bleed' | 'asymmetric' | 'sticky-image' | 'collage';
  ratio?: string; // e.g., '45:55', '40:60'
  verticalAlign?: 'top' | 'center' | 'bottom' | 'stretch';
}

export interface EditorialClasses extends BaseSectionClasses {
  grid?: string;
  textColumn?: string;
  mediaColumn?: string;
  eyebrow?: string;
  title?: string;
  body?: string;
  quote?: string;
  ctaGroup?: string;
  imageWrapper?: string;
  image?: string;
  imageFrame?: string;
  caption?: string;
}

export interface EditorialProps {
  id?: string;
  testId?: string;
  content?: EditorialContent;
  config?: EditorialConfig;
  style?: BaseSectionStyle;
  classes?: EditorialClasses;
}

// ─────────────────────────────────────────
// 12. SECTION 8: TRUST BADGES
// ─────────────────────────────────────────

export interface TrustBadgeItem {
  icon: string;
  title: string;
  description?: string;
}

export interface TrustBadgesContent {
  badges?: TrustBadgeItem[];
}

export interface TrustBadgesConfig extends BaseSectionConfig {
  variant?: 'row-divided' | 'row-compact' | 'grid-3' | 'grid-4' | 'cards' | 'minimal';
  divider?: boolean;
  columns?: number;
}

export interface TrustBadgesClasses extends BaseSectionClasses {
  inner?: string;
  item?: string;
  icon?: string;
  iconWrapper?: string;
  title?: string;
  description?: string;
  divider?: string;
}

export interface TrustBadgesProps {
  id?: string;
  testId?: string;
  content?: TrustBadgesContent;
  config?: TrustBadgesConfig;
  style?: BaseSectionStyle;
  classes?: TrustBadgesClasses;
}

// ─────────────────────────────────────────
// 13. SECTION 9: TESTIMONIALS
// ─────────────────────────────────────────

export interface Testimonial {
  quote: string;
  author: string;
  role?: string;
  avatar?: string;
  rating?: number;
}

export interface TestimonialsContent {
  title?: string;
  subtitle?: string;
  testimonials?: Testimonial[];
}

export interface TestimonialsConfig extends BaseSectionConfig {
  variant?: 'single' | 'slider' | 'grid-2' | 'grid-3' | 'grid-4' | 'masonry' | 'cards' | 'minimal';
  quoteStyle?: 'normal' | 'italic' | 'serif' | 'large';
  showQuotes?: boolean;
  showAvatar?: boolean;
  showRating?: boolean;
  autoplay?: boolean;
  interval?: number;
  showNavigation?: boolean;
  showDots?: boolean;
  loop?: boolean;
}

export interface TestimonialsClasses extends BaseSectionClasses {
  title?: string;
  subtitle?: string;
  slider?: string;
  slide?: string;
  grid?: string;
  card?: string;
  quoteIcon?: string;
  quote?: string;
  author?: string;
  role?: string;
  avatar?: string;
  rating?: string;
  navigation?: string;
  arrow?: string;
  dots?: string;
}

export interface TestimonialsProps {
  id?: string;
  testId?: string;
  content?: TestimonialsContent;
  config?: TestimonialsConfig;
  style?: BaseSectionStyle;
  classes?: TestimonialsClasses;
}

// ─────────────────────────────────────────
// 14. SECTION 10: NEWSLETTER
// ─────────────────────────────────────────

export interface NewsletterField {
  name: string;
  label: string;
  type?: 'email' | 'text' | 'checkbox';
  required?: boolean;
  placeholder?: string;
}

export interface NewsletterContent {
  title?: string;
  description?: string;
  subtitle?: string;
  placeholder?: string;
  buttonText?: string;
  privacyText?: string;
  successMessage?: string;
  fields?: NewsletterField[] | Array<'email' | 'name' | 'preferences'>;
  imageUrl?: string;
  [key: string]: unknown;
}

export interface NewsletterConfig extends BaseSectionConfig {
  variant?: 'inline' | 'centered' | 'split' | 'minimal' | 'card' | 'fullscreen';
  fields?: Array<'email' | 'name' | 'preferences'>;
  showPrivacy?: boolean;
  requirePrivacy?: boolean;
}

export interface NewsletterClasses extends BaseSectionClasses {
  content?: string;
  title?: string;
  description?: string;
  form?: string;
  inputGroup?: string;
  input?: string;
  button?: string;
  checkbox?: string;
  privacy?: string;
  successMessage?: string;
  errorMessage?: string;
}

export interface NewsletterProps {
  id?: string;
  testId?: string;
  content?: NewsletterContent;
  config?: NewsletterConfig;
  style?: BaseSectionStyle;
  classes?: NewsletterClasses;
}

// ─────────────────────────────────────────
// 15. SECTION 11: FOOTER MODERN
// ─────────────────────────────────────────

export interface FooterColumn {
  title: string;
  links: Array<{ label: string; href?: string; link?: string; url?: string; external?: boolean }>;
}

export interface FooterNewsletter {
  enabled?: boolean;
  title?: string;
  description?: string;
  placeholder?: string;
  buttonText?: string;
}

export interface FooterSocialLink {
  platform: 'instagram' | 'facebook' | 'twitter' | 'pinterest' | 'youtube' | 'tiktok' | 'linkedin' | 'whatsapp' | string;
  url: string;
}

export interface FooterModernContent {
  logo?: HeaderLogo | string;
  description?: string;
  columns?: FooterColumn[];
  newsletter?: FooterNewsletter;
  social?: FooterSocialLink[] | Record<string, string>;
  copyright?: string;
  legalLinks?: Array<{ label: string; href?: string; link?: string; url?: string }>;
  paymentIcons?: string[];
  contactInfo?: {
    title?: string;
    address?: string;
    phone?: string;
    email?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface FooterModernConfig extends BaseSectionConfig {
  variant?: 'asymmetric' | 'grid-4' | 'minimal' | 'centered' | 'newsletter-top';
  columnsRatio?: string; // e.g., '2:1:1'
  showNewsletter?: boolean;
  showSocial?: boolean;
  showPayment?: boolean;
}

export interface FooterModernClasses extends BaseSectionClasses {
  inner?: string;
  topSection?: string;
  mainSection?: string;
  logoColumn?: string;
  navColumns?: string;
  navColumn?: string;
  newsletterColumn?: string;
  contactColumn?: string;
  logo?: string;
  navTitle?: string;
  navList?: string;
  navLink?: string;
  newsletterForm?: string;
  bottomSection?: string;
  copyright?: string;
  legalLinks?: string;
  socialLinks?: string;
  socialLink?: string;
  contactItem?: string;
}

export interface FooterModernProps {
  id?: string;
  testId?: string;
  content?: FooterModernContent;
  config?: FooterModernConfig;
  style?: BaseSectionStyle;
  classes?: FooterModernClasses;
}

// ─────────────────────────────────────────
// 16. UTILITY TYPES
// ─────────────────────────────────────────

export type SectionVariant = string;
export type SectionLayout = string;

export interface SectionWrapperProps {
  id?: string;
  children: ReactNode;
  animation?: BaseSectionConfig['animation'];
  className?: string;
  style?: CSSProperties;
  as?: keyof JSX.IntrinsicElements | string;
}

// Union type for all section props
export type ConfigurableSectionProps =
  | AnnouncementBarProps
  | HeaderModernProps
  | HeroProps
  | StatsBarProps
  | CategoryGridProps
  | ProductGridProps
  | EditorialProps
  | TrustBadgesProps
  | TestimonialsProps
  | NewsletterProps
  | FooterModernProps;
