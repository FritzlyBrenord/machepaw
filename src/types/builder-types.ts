// ============================================
// E-COMMERCE BUILDER - Type Definitions
// ============================================

import type { CSSProperties } from "react";

// --- Base Types ---

type PrimitiveStyleValue = string | number | boolean | null | undefined;

export type SectionPropsMap = Record<string, any>;

export type ProductSectionSource =
  | 'all'
  | 'new'
  | 'featured'
  | 'bestseller'
  | 'discounted'
  | 'topRated'
  | 'topSales'
  | 'mostViewed'
  | 'category'
  | 'tag';

export type ProductSectionSort =
  | 'storeDefault'
  | 'newest'
  | 'priceAsc'
  | 'priceDesc'
  | 'rating'
  | 'sales'
  | 'views'
  | 'discount'
  | 'nameAsc';

export interface StyleProps {
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  paddingY?: string | number;
  paddingX?: string | number;
  marginY?: string | number;
  marginX?: string | number;
  borderWidth?: string | number;
  borderColor?: string;
  borderRadius?: string | number;
  fontFamily?: string;
  fontSize?: string | number;
  fontWeight?: string | number;
  lineHeight?: string | number;
  letterSpacing?: string | number;
  textAlign?: CSSProperties['textAlign'];
  maxWidth?: string | number;
  minHeight?: string | number;
  containerWidth?: 'full' | 'container' | 'narrow' | string;
  [key: string]: PrimitiveStyleValue;
}

export interface NavigationLink {
  label: string;
  link: string;
  icon?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  images?: string[];
  badge?: string;
  rating?: number;
  reviewCount?: number;
  sku?: string;
  inStock?: boolean;
  sizes?: string[];
  colors?: { name: string; hex: string }[];
  storage?: string[];
  description?: string;
}

export interface Category {
  name: string;
  image: string;
  productCount?: number;
  link: string;
}

export interface Testimonial {
  name: string;
  role: string;
  content: string;
  avatar?: string;
  rating?: number;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  content: string;
  verified?: boolean;
  avatar?: string;
  photos?: string[];
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  color?: string;
  storage?: string;
}

export interface Order {
  id: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: number;
}

export interface FooterColumn {
  title: string;
  links: { label: string; url: string }[];
}

export interface TrustBadge {
  icon: string;
  title: string;
  description: string;
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
}

// --- Section Types ---

export type SectionType = string;

// New 100% configurable architecture
export interface NewSectionProps {
  [key: string]: any;
  content?: Record<string, any>;
  config?: Record<string, any>;
  style?: Record<string, any>;
  styles?: StyleProps;
  classes?: Record<string, string | undefined>;
  id?: string;
  testId?: string;
}

// Legacy architecture (backward compatibility)
export interface LegacySectionProps extends Record<string, unknown> {
  styles?: StyleProps;
}

export interface Section {
  id: string;
  type: SectionType;
  order: number;
  props: NewSectionProps | LegacySectionProps | (SectionPropsMap & { styles?: StyleProps });
  visible?: boolean;
  disabled?: boolean;
}

// --- Page Types ---

export interface PageMeta {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
}

export interface Page {
  id: string;
  name: string;
  slug: string;
  isHome: boolean;
  meta: PageMeta;
  sections: Section[];
}

// --- Project Types ---

export interface ProjectSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  fontFamily: string;
  fontSize?: string | number;
  borderRadius?: string | number;
  containerWidth?: string;
  [key: string]: unknown;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  pages: Page[];
  globalSections?: {
    header?: Section;
    footer?: Section;
    announcementBar?: Section;
  };
  settings: ProjectSettings;
  createdAt: string;
  updatedAt: string;
}

// --- Template Types ---

export type TemplateCategory = 'fashion' | 'electronics' | 'home' | 'beauty' | 'food' | 'general' | 'luxury';

export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: TemplateCategory;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  project: Project;
}

// --- Editor State Types ---

export type DevicePreview = 'desktop' | 'tablet' | 'mobile';

export interface EditorState {
  project: Project;
  currentPageId: string;
  selectedSectionId: string | null;
  isPreview: boolean;
  devicePreview: DevicePreview;
}

export interface EditorActions {
  // Init
  init: () => void;

  // Project actions
  setProject: (project: Project) => void;
  loadTemplate: (template: Template) => void;
  updateProjectSettings: (settings: Partial<ProjectSettings>) => void;
  exportProject: () => string;
  importProject: (json: string) => boolean;

  // Page actions
  setCurrentPage: (pageId: string) => void;
  addPage: (page: Page) => void;
  updatePage: (pageId: string, updates: Partial<Page>) => void;
  deletePage: (pageId: string) => void;
  duplicatePage: (pageId: string) => void;

  // Global sections actions
  setGlobalSection: (type: 'header' | 'footer' | 'announcementBar', section: Section | undefined) => void;
  updateGlobalSectionProps: (type: 'header' | 'footer' | 'announcementBar', props: SectionPropsMap) => void;
  updateGlobalSectionStyles: (type: 'header' | 'footer' | 'announcementBar', styles: Partial<StyleProps>) => void;

  // Section actions
  addSection: (type: SectionType, insertIndex?: number) => void;
  updateSection: (sectionId: string, updates: Partial<Section>) => void;
  updateSectionProps: (sectionId: string, props: SectionPropsMap) => void;
  updateSectionStyles: (sectionId: string, styles: Partial<StyleProps>) => void;
  deleteSection: (sectionId: string) => void;
  duplicateSection: (sectionId: string) => void;
  moveSection: (fromIndex: number, toIndex: number) => void;
  toggleSectionVisibility: (sectionId: string) => void;
  selectSection: (sectionId: string | null) => void;

  // History actions
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  saveToHistory: () => void;

  // Preview
  togglePreview: () => void;
  setPreview: (isPreview: boolean) => void;
  setDevicePreview: (device: DevicePreview) => void;
}

export type EditorStore = EditorState & EditorActions;

// --- Hero Slideshow Types ---

export interface HeroSlide {
  id?: string;
  title?: string | { lines?: Array<{ text: string; style?: string; color?: string; highlight?: boolean }>; single?: string; as?: string };
  subtitle?: string;
  body?: string;
  cta?: {
    primary?: { text: string; href: string; icon?: boolean; style?: string };
    secondary?: { text: string; href: string; icon?: boolean; style?: string };
  };
  media?: {
    type?: 'image' | 'video' | 'carousel';
    src?: string | string[];
    videoSrc?: string;
    poster?: string;
    alt?: string;
    parallax?: boolean;
    zoomOnHover?: boolean;
  };
  textColor?: string;
  accentColor?: string;
  overlay?: {
    enabled?: boolean;
    type?: 'gradient' | 'solid' | 'blur';
    opacity?: number;
    color?: string;
  };
}

export interface HeroSlideshowConfig {
  enabled?: boolean;
  autoplay?: boolean;
  interval?: number;
  transition?: 'fade' | 'slide' | 'zoom';
  duration?: number;
  showArrows?: boolean;
  showDots?: boolean;
  pauseOnHover?: boolean;
  loop?: boolean;
}

// --- Component Prop Types ---

export interface HeaderModernProps {
  id: string;
  logo: { text: string; image?: string };
  navigation: NavigationLink[];
  ctaButton?: { text: string; link: string; variant?: string };
  showSearch?: boolean;
  showCart?: boolean;
  showAccount?: boolean;
  isPreview?: boolean;
  styles?: StyleProps;
}

export interface HeroProps {
  id: string;
  content?: {
    pretitle?: { text: string; style?: string; icon?: string };
    title?: string | { lines?: Array<{ text: string; style?: string; color?: string; highlight?: boolean }>; single?: string; as?: string };
    subtitle?: string;
    body?: string;
    cta?: {
      primary?: { text: string; href: string; icon?: boolean; style?: string };
      secondary?: { text: string; href: string; icon?: boolean; style?: string };
    };
    media?: {
      type?: 'image' | 'video' | 'carousel';
      src?: string | string[];
      videoSrc?: string;
      poster?: string;
      alt?: string;
      parallax?: boolean;
      zoomOnHover?: boolean;
    };
    slides?: HeroSlide[];
    showScrollIndicator?: boolean;
    metrics?: Array<{ value: string; label: string; prefix?: string; suffix?: string }>;
  };
  config?: {
    variant?: string;
    ratio?: string;
    verticalAlign?: string;
    animation?: {
      entrance?: string;
      duration?: string;
      stagger?: boolean;
    };
    overlay?: {
      enabled?: boolean;
      type?: string;
      opacity?: number;
      color?: string;
    };
    titleAnimation?: string;
    slideshow?: HeroSlideshowConfig;
  };
  style?: {
    colors?: {
      background?: string;
      text?: string;
      accent?: string;
    };
    typography?: {
      textAlign?: string;
      titleWeight?: string;
      titleLineHeight?: string;
      titleLetterSpacing?: string;
    };
    spacing?: {
      container?: string;
      minHeight?: string;
      paddingY?: string | number;
    };
  };
  classes?: Record<string, string>;
  styles?: StyleProps;
}

export interface ProductGridProps {
  id: string;
  title: string;
  subtitle?: string;
  columns?: 2 | 3 | 4 | 5;
  showFilters?: boolean;
  layoutMode?: 'grid' | 'carousel';
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
  productsToShow?: number;
  products: Product[];
  styles?: StyleProps;
}

export interface FooterModernProps {
  id: string;
  logo: { text: string; image?: string };
  copyright: string;
  newsletter?: boolean;
  columns?: FooterColumn[];
  socialLinks?: { platform: string; url: string }[];
  contactInfo?: {
    title?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  social?: {
    whatsapp?: string;
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    youtube?: string;
  };
  styles?: StyleProps;
}

export interface AnnouncementBarProps {
  id: string;
  messages: string[];
  autoRotate?: boolean;
  interval?: number;
  showIcons?: boolean;
  styles?: StyleProps;
}

export interface CategoryGridProps {
  id: string;
  title: string;
  subtitle?: string;
  columns?: 2 | 3 | 4 | 5;
  layoutStyle?: 'grid' | 'carousel' | 'bento';
  imageAspect?: 'square' | 'portrait' | 'landscape';
  hoverEffect?: 'zoom' | 'lift' | 'glow' | 'none';
  animation?: 'none' | 'stagger' | 'slideUp';
  showProductCount?: boolean;
  categories: Category[];
  className?: string;
  style?: CSSProperties;
  styles?: StyleProps;
}

export interface PromoBarProps {
  id: string;
  text: string;
  buttonText?: string;
  buttonLink?: string;
  showCloseButton?: boolean;
  position?: 'top' | 'bottom' | 'inline';
  styles?: StyleProps;
}

export interface TrustBadgesProps {
  id: string;
  layout?: 'row' | 'grid';
  badges: TrustBadge[];
  styles?: StyleProps;
}

export interface TestimonialsProps {
  id: string;
  title: string;
  subtitle?: string;
  testimonials: Testimonial[];
  layout?: 'grid' | 'carousel';
  styles?: StyleProps;
}

export interface NewsletterProps {
  id: string;
  title: string;
  subtitle?: string;
  buttonText: string;
  placeholder?: string;
  showPrivacyCheckbox?: boolean;
  privacyText?: string;
  styles?: StyleProps;
}

export interface BreadcrumbProps {
  id: string;
  items: { label: string; link: string }[];
  showHome?: boolean;
  separator?: 'slash' | 'chevron';
  styles?: StyleProps;
}

export interface ProductDetailProps {
  id: string;
  product: Product;
  showReviews?: boolean;
  showRelatedProducts?: boolean;
  showRecentlyViewed?: boolean;
  showSizeGuide?: boolean;
  showShippingInfo?: boolean;
  styles?: StyleProps;
}

export interface ReviewsProps {
  id: string;
  title: string;
  showRating?: boolean;
  showPhotos?: boolean;
  showVerifiedBadge?: boolean;
  layout?: 'list' | 'grid';
  reviews: Review[];
  styles?: StyleProps;
}

export interface RelatedProductsProps {
  id: string;
  title: string;
  columns?: 2 | 3 | 4 | 5;
  showAddToCart?: boolean;
  products: Product[];
  styles?: StyleProps;
}

export interface CartProps {
  id: string;
  title: string;
  emptyMessage: string;
  showCouponField?: boolean;
  showShippingCalculator?: boolean;
  cartItems: CartItem[];
  shippingAmount?: number;
  totalAmount?: number;
  checkoutLabel?: string;
  continueShoppingLabel?: string;
  onContinueShopping?: () => void;
  onUpdateQuantity?: (itemId: string, quantity: number) => void;
  onRemoveItem?: (itemId: string) => void;
  onClearCart?: () => void;
  onCheckout?: () => void;
  availableFulfillmentModes?: Array<"delivery" | "pickup">;
  deliveryMode?: "delivery" | "pickup";
  onDeliveryModeChange?: (mode: "delivery" | "pickup") => void;
  shippingLabel?: string;
  shippingLoading?: boolean;
  deliveryEstimateText?: string;
  customerConnected?: boolean;
  customerActive?: boolean;
  customerStatusMessage?: string;
  customerActionLabel?: string;
  onCustomerAction?: () => void;
  addressName?: string;
  addressLine?: string;
  addressActionLabel?: string;
  onAddressAction?: () => void;
  pickupAddressText?: string;
  pickupSourceLabel?: string;
  unavailableMessage?: string;
  taxRate?: number;
  taxAmount?: number;
  freeShippingMessage?: string;
  checkoutDisabled?: boolean;
  securePaymentText?: string;
  styles?: StyleProps;
}

export interface CheckoutFormProps {
  id: string;
  title: string;
  steps: string[];
  currentStep: number;
  styles?: StyleProps;
}

export interface CheckoutSummaryProps {
  id: string;
  title: string;
  showItemImages?: boolean;
  editable?: boolean;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  styles?: StyleProps;
}

export interface PaymentMethodsProps {
  id: string;
  title: string;
  showSecurityBadges?: boolean;
  layout?: 'list' | 'grid';
  methods: PaymentMethod[];
  styles?: StyleProps;
}

export interface AccountProfileProps {
  id: string;
  title: string;
  showAvatar?: boolean;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  styles?: StyleProps;
}

export interface OrderHistoryProps {
  id: string;
  title: string;
  showFilters?: boolean;
  itemsPerPage?: number;
  orders: Order[];
  styles?: StyleProps;
}

export interface WishlistProps {
  id: string;
  title: string;
  emptyMessage: string;
  addToCartText: string;
  products: Product[];
  styles?: StyleProps;
}

export interface SearchBarProps {
  id: string;
  placeholder?: string;
  showCategories?: boolean;
  showFilters?: boolean;
  showPopularSearches?: boolean;
  popularSearches?: string[];
  styles?: StyleProps;
}

export interface FeaturesProps {
  id: string;
  title: string;
  subtitle?: string;
  layout?: 'grid' | 'row';
  features: Feature[];
  styles?: StyleProps;
}

export interface BannerProps {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  ctaText?: string;
  ctaLink?: string;
  position?: 'left' | 'right';
  styles?: StyleProps;
}

export interface CountdownProps {
  id: string;
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  endDate: string;
  showLabels?: boolean;
  styles?: StyleProps;
}

export interface StatsBarProps {
  id: string;
  items: Array<{
    value: string;
    label: string;
  }>;
  divider?: boolean;
  styles?: StyleProps;
}

export interface CollectionHeroProps {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  overlayOpacity?: number;
  styles?: StyleProps;
}

export interface EditorialProps {
  id: string;
  layout?: 'image-left' | 'image-right';
  image?: string;
  eyebrow?: string;
  title?: string;
  body?: string;
  ctaText?: string;
  ctaLink?: string;
  ctaStyle?: 'solid' | 'outline' | 'underline';
  imageAspectRatio?: string;
  styles?: StyleProps;
}

export interface WishlistContentProps {
  id: string;
  title?: string;
  emptyMessage?: string;
  showEmptyState?: boolean;
  showProducts?: boolean;
  styles?: StyleProps;
}

export interface AccountContentProps {
  id: string;
  title?: string;
  subtitle?: string;
  showOrders?: boolean;
  showAddresses?: boolean;
  showProfile?: boolean;
  styles?: StyleProps;
}

export interface ProductsContentProps {
  id: string;
  title?: string | null;
  subtitle?: string | null;
  showFilters?: boolean;
  gridColumns?: number;
  columns?: number;
  filterStyle?: string;
  cardStyle?: string;
  showRating?: boolean;
  styles?: StyleProps;
}

export interface ProductDetailContentProps {
  id: string;
  showReviews?: boolean;
  showSizeGuide?: boolean;
  showShippingInfo?: boolean;
  showRelatedProducts?: boolean;
  styles?: StyleProps;
}

export interface OrderDetailSectionProps {
  id: string;
  styles?: StyleProps;
}
