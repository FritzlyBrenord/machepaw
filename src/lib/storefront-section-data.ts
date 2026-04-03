import { resolveCategoryLabels } from "@/lib/category-labels";
import {
  getDefaultHeaderNavigationSettings,
  normalizeHeaderNavigationSettings,
} from "@/lib/header-navigation";
import type { Project, Section } from "@/types/builder-types";

export type StorefrontSectionStoreData = {
  sellerId?: string;
  businessName?: string;
  storeSlug?: string;
  logo?: string;
  banner?: string;
  contactPhone?: string;
  contactEmail?: string;
  locationName?: string;
  locationDept?: string;
  shippingSettings?: {
    freeShippingThreshold?: number;
    allowDelivery?: boolean;
    allowPickup?: boolean;
    pickupAddress?: string;
    basePrice?: number;
    pricePerKm?: number;
    locationName?: string;
    locationDept?: string;
    latitude?: number;
    longitude?: number;
  };
  pickupAddress?: {
    address?: string;
    city?: string;
    country?: string;
    phone?: string;
  };
  categories?: string[];
  navigationLinks?: Array<{
    label: string;
    link: string;
  }>;
  categoryCollections?: Array<{
    name: string;
    image: string;
    productCount?: number;
    link: string;
  }>;
  products?: Array<{
    id?: string;
    name?: string;
    price?: number;
    oldPrice?: number;
    categoryId?: string;
    category?: string;
    subcategory?: string;
    image?: string;
    images?: string[];
    rating?: number;
    reviewCount?: number;
    badge?: string;
    isNew?: boolean;
    isBestseller?: boolean;
    isFeatured?: boolean;
    views?: number;
    sales?: number;
    lastOrderedAt?: string;
    totalOrderedQuantity?: number;
    createdAt?: string;
    status?: string;
    stock?: number;
  }>;
};

export type StorefrontProductOrderMetric = {
  productId: string;
  orderCount: number;
  orderedQuantity: number;
  lastOrderedAt?: string;
};

type HeaderNavigationItem = {
  id: string;
  label: string;
  link: string;
  enabled: boolean;
};

type HeaderSectionPropsLike = {
  [key: string]: any;
  navigationSettings?: unknown;
};

type StorefrontSectionPropsLike = HeaderSectionPropsLike & {
  content?: Record<string, any>;
  config?: Record<string, any>;
  style?: Record<string, any>;
  classes?: Record<string, string | undefined>;
  styles?: Record<string, any>;
  title?: string;
  subtitle?: string;
  columns?: unknown;
  logo?: {
    [key: string]: unknown;
    text?: string;
    image?: string;
  };
  contactInfo?: {
    [key: string]: unknown;
    title?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  social?: {
    [key: string]: unknown;
    whatsapp?: string;
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    youtube?: string;
  };
};

function isPlainObject(value: unknown): value is Record<string, any> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function mergeDeep<T extends Record<string, any>>(
  base: T,
  override?: Record<string, any> | null,
): T {
  if (!override) {
    return { ...base };
  }

  const result: Record<string, any> = { ...base };

  Object.entries(override).forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }

    if (isPlainObject(value) && isPlainObject(result[key])) {
      result[key] = mergeDeep(result[key], value);
      return;
    }

    result[key] = value;
  });

  return result as T;
}

function normalizeSpacingValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(Math.max(0, Math.round(value / 4)));
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();
    const pxMatch = trimmedValue.match(/^(\d+(?:\.\d+)?)px$/i);

    if (pxMatch) {
      return String(Math.max(0, Math.round(Number(pxMatch[1]) / 4)));
    }

    return trimmedValue;
  }

  return undefined;
}

function normalizeContainerValue(value: unknown) {
  if (value === "container") {
    return "contained";
  }

  return typeof value === "string" && value.trim() ? value : undefined;
}

function normalizeHref(value?: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function normalizeHeaderLogo(value: unknown) {
  if (!value) {
    return undefined;
  }

  if (typeof value === "string") {
    return {
      type: "text",
      text: value,
    };
  }

  if (!isPlainObject(value)) {
    return undefined;
  }

  return {
    ...value,
    type: value.type || (value.image ? "image" : value.svg ? "svg" : "text"),
  };
}

function normalizeHeaderNavigation(value: unknown): Array<Record<string, any>> {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => isPlainObject(item))
    .map((item, index) => {
      const href = normalizeHref(item.href || item.link || item.url) || "#";

      return {
        ...item,
        id: String(item.id || `nav-${index}`),
        label: String(item.label || item.text || ""),
        href,
        link: href,
        enabled: item.enabled !== false,
        children: normalizeHeaderNavigation(item.children),
        featured: isPlainObject(item.featured)
          ? {
              ...item.featured,
              cta: isPlainObject(item.featured.cta)
                ? {
                    ...item.featured.cta,
                    href:
                      normalizeHref(
                        item.featured.cta.href ||
                          item.featured.cta.link ||
                          item.featured.cta.url,
                      ) || "#",
                  }
                : item.featured.cta,
            }
          : item.featured,
      };
    });
}

function normalizeHeaderNavigationSettingsItems(
  value: unknown,
): Array<Record<string, any>> {
  if (!isPlainObject(value)) {
    return [];
  }

  return Object.entries(value)
    .filter(([key, item]) => /^menu\d+$/.test(key) && isPlainObject(item))
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([key, item], index) => {
      const href = normalizeHref(item.link || item.href || item.url) || "#";

      return {
        id: String(item.id || key || `nav-${index}`),
        label: String(item.label || item.text || ""),
        href,
        link: href,
        enabled: item.enabled !== false,
      };
    });
}

function normalizeFooterColumns(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((column) => isPlainObject(column))
    .map((column) => ({
      ...column,
      title: String(column.title || ""),
      links:
        typeof column.links === "string"
          ? column.links
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean)
              .map((line) => {
                const [labelPart, hrefPart] = line.split("|");
                const href = normalizeHref(hrefPart) || "#";

                return {
                  label: (labelPart || "Lien").trim(),
                  href,
                  link: href,
                  url: href,
                };
              })
          : Array.isArray(column.links)
            ? column.links
                .filter((link) => isPlainObject(link))
                .map((link) => {
                  const href = normalizeHref(link.href || link.link || link.url) || "#";

                  return {
                    ...link,
                    href,
                    link: href,
                    url: href,
                  };
                })
            : [],
    }));
}

function normalizeSocialLinks(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .filter((item) => isPlainObject(item))
      .map((item) => ({
        ...item,
        platform: String(item.platform || ""),
        url: String(item.url || ""),
      }))
      .filter((item) => item.platform && item.url);
  }

  if (isPlainObject(value)) {
    return Object.entries(value)
      .filter(([, url]) => typeof url === "string" && url.trim().length > 0)
      .map(([platform, url]) => ({
        platform,
        url: String(url),
      }));
  }

  return [];
}

function normalizeCategoryItems(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => isPlainObject(item))
    .map((item) => {
      const href =
        normalizeHref(item.href || item.link || item.url) ||
        (item.name ? `/produits?category=${encodeURIComponent(String(item.name))}` : "/produits");

      return {
        ...item,
        name: String(item.name || item.title || ""),
        image: String(item.image || item.src || ""),
        description:
          item.description || item.caption || item.subtitle || undefined,
        productCount:
          typeof item.productCount === "number"
            ? item.productCount
            : typeof item.productCount === "string" && item.productCount.trim()
              ? Number(item.productCount)
            : typeof item.count === "number"
              ? item.count
              : typeof item.count === "string" && item.count.trim()
                ? Number(item.count)
              : undefined,
        href,
        link: href,
      };
    });
}

function normalizeProductItems(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => isPlainObject(item))
    .map((item) => {
      const href =
        normalizeHref(item.href || item.link || item.url) ||
        (item.id ? `/product?id=${encodeURIComponent(String(item.id))}` : "/product");

      return {
        ...item,
        id: String(item.id || item.slug || item.name || ""),
        name: String(item.name || item.title || ""),
        price:
          typeof item.price === "number"
            ? item.price
            : Number(item.price || 0),
        oldPrice:
          typeof item.oldPrice === "number"
            ? item.oldPrice
            : item.oldPrice != null && `${item.oldPrice}`.trim().length > 0
              ? Number(item.oldPrice)
              : undefined,
        image: String(item.image || item.thumbnail || item.images?.[0] || ""),
        hoverImage: item.hoverImage || item.secondaryImage || undefined,
        rating:
          typeof item.rating === "number"
            ? item.rating
            : item.rating != null && `${item.rating}`.trim().length > 0
              ? Number(item.rating)
              : undefined,
        reviewCount:
          typeof item.reviewCount === "number"
            ? item.reviewCount
            : typeof item.reviews === "number"
              ? item.reviews
              : item.reviewCount != null && `${item.reviewCount}`.trim().length > 0
                ? Number(item.reviewCount)
                : undefined,
        href,
        link: href,
      };
    });
}

function normalizeTestimonials(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => isPlainObject(item))
    .map((item) => ({
      ...item,
      quote: String(item.quote || item.content || ""),
      author: String(item.author || item.name || ""),
    }));
}

function normalizeReviews(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => isPlainObject(item))
    .map((item, index) => ({
      ...item,
      id: String(item.id || `review-${index}`),
      author: String(item.author || item.name || ""),
      rating:
        typeof item.rating === "number"
          ? item.rating
          : item.rating != null && `${item.rating}`.trim().length > 0
            ? Number(item.rating)
            : 0,
      date: String(item.date || item.createdAt || ""),
      content: String(item.content || item.quote || item.review || ""),
      verified: item.verified === true,
      avatar:
        typeof item.avatar === "string" && item.avatar.trim().length > 0
          ? item.avatar
          : undefined,
      photos: Array.isArray(item.photos)
        ? item.photos.filter((photo): photo is string => typeof photo === "string")
        : Array.isArray(item.images)
          ? item.images.filter((photo): photo is string => typeof photo === "string")
          : undefined,
    }));
}

function normalizeNewsletterConfig(value: unknown) {
  if (typeof value === "boolean") {
    return { enabled: value };
  }

  if (isPlainObject(value)) {
    return {
      enabled: value.enabled !== false,
      ...value,
    };
  }

  return undefined;
}

function normalizeLegacyStyle(styles?: Record<string, any>) {
  if (!styles) {
    return {};
  }

  return {
    colors: {
      background: styles.backgroundColor,
      text: styles.textColor,
      accent: styles.accentColor,
      cardBg: styles.cardBg ?? styles.cardBackground,
      border: styles.borderColor,
    },
    spacing: {
      paddingY: normalizeSpacingValue(styles.paddingY),
      paddingX: normalizeSpacingValue(styles.paddingX),
      marginY: normalizeSpacingValue(styles.marginY),
      marginX: normalizeSpacingValue(styles.marginX),
      container: normalizeContainerValue(styles.containerWidth),
      maxWidth:
        typeof styles.maxWidth === "string" || typeof styles.maxWidth === "number"
          ? String(styles.maxWidth)
          : undefined,
      minHeight:
        typeof styles.minHeight === "string" || typeof styles.minHeight === "number"
          ? String(styles.minHeight)
          : undefined,
    },
    typography: {
      fontFamily: styles.fontFamily,
      fontSize:
        typeof styles.fontSize === "number" ? `${styles.fontSize}px` : styles.fontSize,
      fontWeight:
        typeof styles.fontWeight === "number"
          ? String(styles.fontWeight)
          : styles.fontWeight,
      lineHeight:
        typeof styles.lineHeight === "number"
          ? String(styles.lineHeight)
          : styles.lineHeight,
      letterSpacing:
        typeof styles.letterSpacing === "number"
          ? `${styles.letterSpacing}px`
          : styles.letterSpacing,
      textAlign: styles.textAlign,
    },
    border: {
      width:
        typeof styles.borderWidth === "number"
          ? String(styles.borderWidth)
          : styles.borderWidth,
      color: styles.borderColor,
      radius:
        typeof styles.borderRadius === "number"
          ? `${styles.borderRadius}px`
          : styles.borderRadius,
    },
  };
}

export function normalizeSectionProps(section: Section): Section {
  const nextSection = cloneSection(section);
  const rawProps = (nextSection.props || {}) as StorefrontSectionPropsLike;
  let derivedStyle = normalizeLegacyStyle(rawProps.styles);

  let derivedContent: Record<string, any> = {};
  let derivedConfig: Record<string, any> = {};
  let derivedCardConfig: Record<string, any> = {};

  switch (nextSection.type) {
    case "announcementBar":
      derivedContent = {
        messages: rawProps.messages,
        autoRotate: rawProps.autoRotate,
        interval: rawProps.interval,
        dismissible: rawProps.dismissible,
        icon: rawProps.icon,
      };
      derivedConfig = {
        variant: rawProps.variant,
        layout: rawProps.layout,
        showCloseButton: rawProps.showCloseButton,
        showNavigation: rawProps.showNavigation,
        showDots: rawProps.showDots,
      };
      break;

    case "searchBar":
      derivedContent = {
        placeholder: rawProps.content?.placeholder || rawProps.placeholder,
        popularSearchesLabel:
          rawProps.content?.popularSearchesLabel || rawProps.popularSearchesLabel,
        popularSearches:
          rawProps.content?.popularSearches || rawProps.popularSearches,
      };
      derivedConfig = {
        showFilters: rawProps.config?.showFilters ?? rawProps.showFilters,
        showPopularSearches:
          rawProps.config?.showPopularSearches ?? rawProps.showPopularSearches,
        size: rawProps.config?.size || rawProps.size,
      };
      break;

    case "breadcrumb": {
      const rawItems = Array.isArray(rawProps.items)
        ? rawProps.items
        : Array.isArray(rawProps.content?.items)
          ? rawProps.content.items
          : [];
      const normalizedItems = rawItems
        .filter((item) => isPlainObject(item) || typeof item === "string")
        .map((item, index) => {
          if (typeof item === "string") {
            return { label: item, link: "#" };
          }

          const link = normalizeHref(item.link || item.href) || undefined;

          return {
            ...item,
            label: String(item.label || item.text || `Item ${index + 1}`),
            link,
            icon: typeof item.icon === "string" ? item.icon : undefined,
          };
        });

      derivedContent = {
        homeLabel: rawProps.content?.homeLabel || rawProps.homeLabel,
        separator: rawProps.content?.separator || rawProps.separator,
        backLabel: rawProps.content?.backLabel || rawProps.backLabel,
        showHomeIcon: rawProps.content?.showHomeIcon ?? rawProps.showHomeIcon,
      };
      derivedConfig = {
        variant: rawProps.config?.variant || rawProps.variant,
        showHome: rawProps.config?.showHome ?? rawProps.showHome,
        clickable: rawProps.config?.clickable ?? rawProps.clickable,
        maxItems: rawProps.config?.maxItems ?? rawProps.maxItems,
      };
      nextSection.props = {
        ...rawProps,
        items: normalizedItems,
        content: mergeDeep(derivedContent, rawProps.content),
        config: mergeDeep(derivedConfig, rawProps.config),
        cardConfig: mergeDeep(derivedCardConfig, rawProps.cardConfig),
        style: mergeDeep(derivedStyle, rawProps.style),
        classes: mergeDeep({}, rawProps.classes),
      };

      return nextSection;
    }

    case "headerModern":
    case "headerMinimal": {
      const derivedActions = Array.isArray(rawProps.actions)
        ? rawProps.actions
        : [
            rawProps.showSearch !== false ? "search" : null,
            rawProps.showAccount !== false ? "account" : null,
            rawProps.showCart !== false ? "cart" : null,
          ].filter(Boolean);

      derivedContent = {
        logo: normalizeHeaderLogo(rawProps.logo),
        navigation: normalizeHeaderNavigation(
          rawProps.navigation ||
            rawProps.blocks ||
            normalizeHeaderNavigationSettingsItems(rawProps.navigationSettings),
        ),
        actions: derivedActions,
        ctaButton: isPlainObject(rawProps.ctaButton)
          ? {
              ...rawProps.ctaButton,
              href:
                normalizeHref(
                  rawProps.ctaButton.href ||
                    rawProps.ctaButton.link ||
                    rawProps.ctaButton.url,
                ) || "#",
            }
          : undefined,
      };
      derivedConfig = {
        variant:
          rawProps.variant || (nextSection.type === "headerMinimal" ? "minimal" : undefined),
        behavior: {
          sticky: rawProps.sticky,
          hideOnScroll: rawProps.hideOnScroll,
          transparentAtTop: rawProps.transparentAtTop,
          blurOnScroll: rawProps.blurOnScroll,
          elevatedOnScroll: rawProps.elevatedOnScroll,
        },
        searchStyle: rawProps.searchStyle,
      };
      break;
    }

    case "hero":
      derivedContent = {
        pretitle:
          typeof rawProps.pretitle === "string"
            ? { text: rawProps.pretitle, style: "line" }
            : rawProps.pretitle,
        title: rawProps.title,
        subtitle: rawProps.subtitle,
        body: rawProps.body,
        showScrollIndicator:
          rawProps.showScrollIndicator ?? rawProps.content?.showScrollIndicator,
        metrics: Array.isArray(rawProps.metrics) ? rawProps.metrics : undefined,
        cta:
          rawProps.cta ||
          rawProps.ctaText ||
          rawProps.secondaryCtaText
            ? {
                primary: rawProps.ctaText
                  ? {
                      text: rawProps.ctaText,
                      href: normalizeHref(rawProps.ctaLink) || "/produits",
                    }
                  : undefined,
                secondary: rawProps.secondaryCtaText
                  ? {
                      text: rawProps.secondaryCtaText,
                      href:
                        normalizeHref(rawProps.secondaryCtaLink) || "/a-propos",
                    }
                  : undefined,
              }
            : undefined,
        media:
          rawProps.media ||
          (normalizeHref(rawProps.backgroundImage)
            ? {
                type: "image",
                src: rawProps.backgroundImage,
                alt: rawProps.title,
              }
            : undefined),
        // Preserve slides from content — critical for slideshow mode
        slides: Array.isArray(rawProps.content?.slides)
          ? rawProps.content.slides
          : Array.isArray(rawProps.slides)
            ? rawProps.slides
            : undefined,
      };
      derivedConfig = {
        variant:
          rawProps.variant ||
          (rawProps.layout === "centered" ? "fullscreen-center" : rawProps.layout),
        verticalAlign: rawProps.verticalAlign,
        titleAnimation: rawProps.titleAnimation || rawProps.animation,
        animation: isPlainObject(rawProps.animation)
          ? rawProps.animation
          : {
              entrance: rawProps.animation,
            },
        overlay: isPlainObject(rawProps.overlay)
          ? rawProps.overlay
          : {
              enabled:
                rawProps.overlayEnabled ??
                (rawProps.overlayOpacity !== undefined ||
                  rawProps.overlayColor !== undefined ||
                  rawProps.overlayType !== undefined),
              opacity: rawProps.overlayOpacity,
              color: rawProps.overlayColor,
              type: rawProps.overlayType,
            },
        slideshow: isPlainObject(rawProps.slideshow)
          ? rawProps.slideshow
          : {
              enabled: rawProps.enableSlideshow,
              autoplay: rawProps.autoplay,
              interval: rawProps.interval,
              transition: rawProps.transition,
              duration: rawProps.duration,
              showArrows: rawProps.showArrows,
              showDots: rawProps.showDots,
              pauseOnHover: rawProps.pauseOnHover,
              loop: rawProps.loop,
            },
      };
      derivedStyle = mergeDeep(derivedStyle, {
        typography: {
          textAlign: rawProps.alignment || rawProps.textAlign,
        },
      });
      break;

    case "statsBar":
      derivedContent = {
        items: rawProps.items,
        animated: rawProps.animated,
      };
      derivedConfig = {
        variant: rawProps.variant,
        divider: rawProps.divider,
        columns: rawProps.columns,
      };
      break;

    case "categoryGrid":
      derivedContent = {
        title: rawProps.title,
        subtitle: rawProps.subtitle,
        viewAllButton:
          rawProps.viewAllButton ||
          rawProps.viewAllButtonText ||
          rawProps.viewAllButtonHref ||
          rawProps.viewAllButtonLink
            ? {
                text:
                  rawProps.viewAllButton?.text ||
                  rawProps.viewAllButtonText ||
                  "Voir tout",
                href:
                  normalizeHref(
                    rawProps.viewAllButton?.href ||
                      rawProps.viewAllButton?.link ||
                      rawProps.viewAllButtonHref ||
                      rawProps.viewAllButtonLink,
                  ) || "/categories",
              }
            : undefined,
        categories: normalizeCategoryItems(rawProps.categories),
      };
      derivedConfig = {
        variant: rawProps.variant || rawProps.layout,
        columns: rawProps.columns,
        aspectRatio: rawProps.aspectRatio,
        gap: rawProps.gap,
        hoverEffect: rawProps.hoverEffect,
        showProductCount: rawProps.showProductCount,
        titleAlignment: rawProps.titleAlignment,
        titlePosition: rawProps.titlePosition,
        showViewAllButton:
          rawProps.showViewAllButton ??
          (rawProps.viewAllButton ||
          rawProps.viewAllButtonText ||
          rawProps.viewAllButtonHref ||
          rawProps.viewAllButtonLink
            ? true
            : undefined),
        viewAllButtonPosition: rawProps.viewAllButtonPosition,
        viewAllButtonStyle: rawProps.viewAllButtonStyle,
        slides: isPlainObject(rawProps.slides) ? rawProps.slides : undefined,
      };
      break;

    case "collectionHero":
      derivedContent = {
        title: rawProps.title,
        subtitle: rawProps.subtitle,
        eyebrow: rawProps.eyebrow,
        image: rawProps.image,
      };
      derivedConfig = {
        overlayOpacity: rawProps.overlayOpacity,
        minHeight: rawProps.minHeight || rawProps.styles?.minHeight,
        showEyebrow: rawProps.showEyebrow,
      };
      break;

    case "banner":
      derivedContent = {
        title: rawProps.title,
        subtitle: rawProps.subtitle,
        image: rawProps.image,
        ctaText: rawProps.ctaText,
        ctaLink: normalizeHref(rawProps.ctaLink || rawProps.link),
      };
      derivedConfig = {
        variant:
          rawProps.variant ||
          (rawProps.position === "left"
            ? "reversed"
            : rawProps.position === "center"
              ? "centered"
              : undefined),
        imagePosition: rawProps.imagePosition || rawProps.position,
        showCta: rawProps.showCta ?? Boolean(rawProps.ctaText),
      };
      break;

    case "countdown":
      derivedContent = {
        title: rawProps.title,
        subtitle: rawProps.subtitle,
        buttonText: rawProps.buttonText,
        buttonLink: normalizeHref(rawProps.buttonLink || rawProps.link),
        endDate: rawProps.endDate,
        labels: isPlainObject(rawProps.labels) ? rawProps.labels : undefined,
      };
      derivedConfig = {
        showLabels: rawProps.showLabels,
        showButton: rawProps.showButton ?? Boolean(rawProps.buttonText),
        size: rawProps.size,
      };
      break;

    case "productGrid":
      derivedContent = {
        title: rawProps.title,
        subtitle: rawProps.subtitle,
        eyebrowText: rawProps.eyebrowText,
        viewAllButton:
          rawProps.viewAllButton ||
          rawProps.viewAllButtonText ||
          rawProps.viewAllButtonHref ||
          rawProps.viewAllButtonLink
            ? {
                text:
                  rawProps.viewAllButton?.text ||
                  rawProps.viewAllButtonText ||
                  "Voir tout",
                href:
                  normalizeHref(
                    rawProps.viewAllButton?.href ||
                      rawProps.viewAllButton?.link ||
                      rawProps.viewAllButtonHref ||
                      rawProps.viewAllButtonLink,
                  ) || "/produits",
              }
            : undefined,
        products: normalizeProductItems(rawProps.products),
        filters: isPlainObject(rawProps.filters)
          ? rawProps.filters
          : {
              enabled: rawProps.showFilters,
            },
      };
      derivedConfig = {
        variant: rawProps.variant || rawProps.layoutMode,
        columns: rawProps.columns,
        cardStyle: rawProps.cardStyle,
        dynamicSource: rawProps.dynamicSource,
        priceThreshold: rawProps.priceThreshold,
        categoryFilter: rawProps.categoryFilter,
        showViewAllButton:
          rawProps.showViewAllButton ??
          (rawProps.viewAllButton ||
          rawProps.viewAllButtonText ||
          rawProps.viewAllButtonHref ||
          rawProps.viewAllButtonLink
            ? true
            : rawProps.showFilters),
        viewAllButtonPosition: rawProps.viewAllButtonPosition,
        viewAllButtonStyle: rawProps.viewAllButtonStyle,
        showQuickView: rawProps.showQuickView,
        showWishlist: rawProps.showWishlist,
        infiniteScroll: rawProps.infiniteScroll,
        loadMore: rawProps.loadMore,
        productsPerPage: rawProps.productsPerPage || rawProps.productsToShow,
      };
      derivedCardConfig = {
        image: {
          aspectRatio:
            rawProps.cardConfig?.image?.aspectRatio || rawProps.aspectRatio,
          hoverEffect:
            rawProps.cardConfig?.image?.hoverEffect || rawProps.hoverEffect,
          hoverScale:
            rawProps.cardConfig?.image?.hoverScale || rawProps.hoverScale,
          objectFit:
            rawProps.cardConfig?.image?.objectFit || rawProps.imageFit,
        },
        info: {
          alignment:
            rawProps.cardConfig?.info?.alignment || rawProps.infoAlignment,
          showRating:
            rawProps.cardConfig?.info?.showRating ?? rawProps.showRating,
          showPrice:
            rawProps.cardConfig?.info?.showPrice ?? rawProps.showPrice,
          showBadge:
            rawProps.cardConfig?.info?.showBadge ??
            rawProps.showBadge ??
            rawProps.showBadges,
        },
        badge: {
          position:
            rawProps.cardConfig?.badge?.position || rawProps.badgePosition,
          style: rawProps.cardConfig?.badge?.style || rawProps.badgeStyle,
        },
        quickView:
          rawProps.cardConfig?.quickView ?? rawProps.showQuickView,
        wishlist:
          rawProps.cardConfig?.wishlist ?? rawProps.showWishlist,
      };
      break;

    case "editorial":
      derivedContent = {
        eyebrow:
          typeof rawProps.eyebrow === "string"
            ? { text: rawProps.eyebrow, style: "line" }
            : rawProps.eyebrow,
        title: rawProps.title,
        body: rawProps.body,
        quote: rawProps.quote,
        cta:
          rawProps.cta ||
          rawProps.ctaText
            ? [
                {
                  text: rawProps.ctaText || "Decouvrir",
                  href: normalizeHref(rawProps.ctaLink) || "/produits",
                  style: rawProps.ctaStyle,
                },
              ]
            : undefined,
        media:
          rawProps.media ||
          (normalizeHref(rawProps.image)
            ? {
                type: "image",
                src: rawProps.image,
                aspectRatio: rawProps.imageAspectRatio,
              }
            : undefined),
      };
      derivedConfig = {
        variant:
          rawProps.variant ||
          (rawProps.layout === "image-left"
            ? "image-text"
            : rawProps.layout === "image-right"
              ? "text-image"
              : rawProps.layout),
        ratio: rawProps.ratio,
        verticalAlign: rawProps.verticalAlign,
      };
      break;

    case "promoBar":
      derivedContent = {
        text: rawProps.text,
        buttonText: rawProps.buttonText,
        buttonLink: normalizeHref(rawProps.buttonLink || rawProps.link),
      };
      derivedConfig = {
        showCloseButton: rawProps.showCloseButton,
        closable: rawProps.closable,
        align: rawProps.align,
      };
      break;

    case "trustBadges":
      derivedContent = {
        badges: rawProps.badges,
      };
      derivedConfig = {
        variant: rawProps.variant || rawProps.layout,
        divider: rawProps.divider,
        columns: rawProps.columns,
      };
      break;

    case "testimonials":
      derivedContent = {
        title: rawProps.title,
        subtitle: rawProps.subtitle,
        testimonials: normalizeTestimonials(rawProps.testimonials),
      };
      derivedConfig = {
        variant: rawProps.variant || rawProps.layout,
        autoplay: rawProps.autoplay,
        interval: rawProps.interval,
        quoteStyle: rawProps.quoteStyle,
        showQuotes: rawProps.showQuotes,
        showAvatar: rawProps.showAvatar,
        showRating: rawProps.showRating,
        showNavigation: rawProps.showNavigation,
        showDots: rawProps.showDots,
      };
      break;

    case "reviews":
      derivedContent = {
        title: rawProps.title,
        reviews: normalizeReviews(rawProps.reviews),
      };
      derivedConfig = {
        showRating: rawProps.showRating,
        showPhotos: rawProps.showPhotos,
        showVerifiedBadge: rawProps.showVerifiedBadge,
        showDate: rawProps.showDate,
        layout: rawProps.layout,
        columns: rawProps.columns,
      };
      break;

    case "relatedProducts":
      derivedContent = {
        title: rawProps.title,
        products: normalizeProductItems(rawProps.products),
      };
      derivedConfig = {
        columns: rawProps.columns,
        showAddToCart: rawProps.showAddToCart,
        showRating: rawProps.showRating,
      };
      break;

    case "features":
      derivedContent = {
        title: rawProps.title,
        subtitle: rawProps.subtitle,
        eyebrow: rawProps.eyebrow,
        features: Array.isArray(rawProps.features) ? rawProps.features : undefined,
      };
      derivedConfig = {
        layout: rawProps.layout,
        columns: rawProps.columns,
        showEyebrow: rawProps.showEyebrow,
        animation: isPlainObject(rawProps.animation)
          ? rawProps.animation
          : {
              entrance: rawProps.animation,
              hover: rawProps.hover,
            },
      };
      break;

    case "newsletter":
      derivedContent = {
        title: rawProps.title,
        description: rawProps.description || rawProps.subtitle,
        placeholder: rawProps.placeholder,
        buttonText: rawProps.buttonText,
        privacyText: rawProps.privacyText,
        successMessage: rawProps.successMessage,
        fields: rawProps.fields,
        imageUrl: rawProps.imageUrl,
      };
      derivedConfig = {
        variant: rawProps.variant,
        showPrivacy: rawProps.showPrivacy ?? rawProps.showPrivacyCheckbox,
        requirePrivacy: rawProps.requirePrivacy,
      };
      break;

    case "footerModern":
    case "footerMinimal":
      derivedContent = {
        logo: normalizeHeaderLogo(rawProps.logo),
        description: rawProps.description,
        columns: normalizeFooterColumns(rawProps.columns),
        newsletter: normalizeNewsletterConfig(rawProps.newsletter),
        social: normalizeSocialLinks(rawProps.socialLinks || rawProps.social),
        copyright: rawProps.copyright,
        legalLinks: Array.isArray(rawProps.legalLinks)
          ? rawProps.legalLinks.map((link) => {
              const href = normalizeHref(link?.href || link?.link || link?.url) || "#";
              return {
                ...link,
                href,
                link: href,
                url: href,
              };
            })
          : undefined,
        contactInfo: rawProps.contactInfo,
      };
      derivedConfig = {
        variant:
          rawProps.variant || (nextSection.type === "footerMinimal" ? "minimal" : undefined),
        columnsRatio: rawProps.columnsRatio,
        showNewsletter: rawProps.showNewsletter,
        showSocial: rawProps.showSocial,
        showPayment: rawProps.showPayment,
      };
      break;

    case "login":
      derivedContent = {
        title: rawProps.title,
        subtitle: rawProps.subtitle,
        emailLabel: rawProps.emailLabel,
        emailPlaceholder: rawProps.emailPlaceholder,
        passwordLabel: rawProps.passwordLabel,
        passwordPlaceholder: rawProps.passwordPlaceholder,
        rememberMeLabel: rawProps.rememberMeLabel,
        forgotPasswordLabel: rawProps.forgotPasswordLabel,
        submitButtonText: rawProps.submitButtonText,
        loadingText: rawProps.loadingText,
        socialLoginDivider: rawProps.socialLoginDivider,
        noAccountText: rawProps.noAccountText,
        registerLinkText: rawProps.registerLinkText,
      };
      derivedConfig = {
        variant:
          rawProps.variant ||
          (rawProps.layout === "split-image" ? "split" : rawProps.layout),
        showEmail: rawProps.showEmail,
        showPassword: rawProps.showPassword,
        showRememberMe: rawProps.showRememberMe,
        showForgotPassword: rawProps.showForgotPassword,
        showSocialLogin: rawProps.showSocialLogin,
        socialProviders: rawProps.socialProviders,
      };
      break;

    case "register":
      derivedContent = {
        title: rawProps.title,
        subtitle: rawProps.subtitle,
        firstNameLabel: rawProps.firstNameLabel,
        firstNamePlaceholder: rawProps.firstNamePlaceholder,
        lastNameLabel: rawProps.lastNameLabel,
        lastNamePlaceholder: rawProps.lastNamePlaceholder,
        emailLabel: rawProps.emailLabel,
        emailPlaceholder: rawProps.emailPlaceholder,
        phoneLabel: rawProps.phoneLabel,
        phonePlaceholder: rawProps.phonePlaceholder,
        passwordLabel: rawProps.passwordLabel,
        passwordPlaceholder: rawProps.passwordPlaceholder,
        passwordConfirmLabel: rawProps.passwordConfirmLabel,
        passwordConfirmPlaceholder: rawProps.passwordConfirmPlaceholder,
        termsLabel: rawProps.termsLabel,
        newsletterLabel: rawProps.newsletterLabel,
        submitButtonText: rawProps.submitButtonText,
        loadingText: rawProps.loadingText,
        socialLoginDivider: rawProps.socialLoginDivider,
        hasAccountText: rawProps.hasAccountText,
        loginLinkText: rawProps.loginLinkText,
      };
      derivedConfig = {
        variant:
          rawProps.variant ||
          (rawProps.layout === "split-image" ? "split" : rawProps.layout),
        showFirstName: rawProps.showFirstName,
        showLastName: rawProps.showLastName,
        showEmail: rawProps.showEmail,
        showPhone: rawProps.showPhone,
        showPassword: rawProps.showPassword,
        showPasswordConfirm: rawProps.showPasswordConfirm,
        showTerms: rawProps.showTerms,
        showNewsletter: rawProps.showNewsletter,
        showSocialLogin: rawProps.showSocialLogin,
        socialProviders: rawProps.socialProviders,
        requireTerms: rawProps.requireTerms,
      };
      break;

    case "cart":
      derivedContent = {
        title: rawProps.title,
        emptyMessage: rawProps.emptyMessage,
      };
      derivedConfig = {
        variant: rawProps.variant,
        showCouponField: rawProps.showCouponField,
        showShippingCalculator: rawProps.showShippingCalculator,
        showSecurePayment: rawProps.showSecurePayment,
        enableClearCart: rawProps.enableClearCart,
        showDeliveryModeSelector: rawProps.showDeliveryModeSelector,
      };
      break;

    case "productDetail":
      derivedContent = {
        product: rawProps.product,
        addToCartLabel: rawProps.addToCartLabel,
        sizeGuideLabel: rawProps.sizeGuideLabel,
        shippingLabels: rawProps.shippingLabels,
      };
      derivedConfig = {
        showReviews: rawProps.showReviews,
        showSizeGuide: rawProps.showSizeGuide,
        showShippingInfo: rawProps.showShippingInfo,
        showWishlist: rawProps.showWishlist,
      };
      break;

    case "productsContent":
      derivedContent = {
        title: rawProps.title,
        subtitle: rawProps.subtitle,
        products: normalizeProductItems(rawProps.products),
      };
      derivedConfig = {
        showFilters: rawProps.showFilters,
        columns: rawProps.columns || rawProps.gridColumns,
        gridColumns: rawProps.gridColumns,
        filterStyle: rawProps.filterStyle,
        cardStyle: rawProps.cardStyle,
        showRating: rawProps.showRating,
      };
      break;

    case "productDetailContent":
      derivedContent = {
        product: rawProps.product,
        addToCartLabel: rawProps.addToCartLabel,
        buyNowLabel: rawProps.buyNowLabel,
        outOfStockLabel: rawProps.outOfStockLabel,
        inStockLabel: rawProps.inStockLabel,
        quantityLabel: rawProps.quantityLabel,
        descriptionLabel: rawProps.descriptionLabel,
        specificationsLabel: rawProps.specificationsLabel,
        reviewsLabel: rawProps.reviewsLabel,
        shippingLabel: rawProps.shippingLabel,
        returnsLabel: rawProps.returnsLabel,
        shareLabel: rawProps.shareLabel,
        wishlistLabel: rawProps.wishlistLabel,
        relatedProductsTitle: rawProps.relatedProductsTitle,
        freeShippingMessage: rawProps.freeShippingMessage,
      };
      derivedConfig = {
        showReviews: rawProps.showReviews,
        showSizeGuide: rawProps.showSizeGuide,
        showShippingInfo: rawProps.showShippingInfo,
        showRelatedProducts: rawProps.showRelatedProducts,
        enableWishlist: rawProps.enableWishlist,
        enableShare: rawProps.enableShare,
        showQuantitySelector: rawProps.showQuantitySelector,
        showBadges: rawProps.showBadges,
      };
      break;

    case "accountDashboard":
    case "accountContent":
      derivedContent = {
        title: rawProps.content?.title || rawProps.title,
        subtitle: rawProps.content?.subtitle || rawProps.subtitle,
        welcomeMessage: rawProps.content?.welcomeMessage,
        memberSinceLabel: rawProps.content?.memberSinceLabel,
        ordersLabel: rawProps.content?.ordersLabel,
        inProgressLabel: rawProps.content?.inProgressLabel,
        addressesLabel: rawProps.content?.addressesLabel,
        loyaltyPointsLabel: rawProps.content?.loyaltyPointsLabel,
        noOrdersMessage: rawProps.content?.noOrdersMessage,
        addAddressLabel: rawProps.content?.addAddressLabel,
        defaultAddressLabel: rawProps.content?.defaultAddressLabel,
        editLabel: rawProps.content?.editLabel,
        deleteLabel: rawProps.content?.deleteLabel,
        logoutLabel: rawProps.content?.logoutLabel,
        saveLabel: rawProps.content?.saveLabel,
        cancelLabel: rawProps.content?.cancelLabel,
        loginTitle: rawProps.content?.loginTitle,
        loginSubtitle: rawProps.content?.loginSubtitle,
        loginButtonLabel: rawProps.content?.loginButtonLabel,
        registerButtonLabel: rawProps.content?.registerButtonLabel,
      };
      derivedConfig = {
        variant: rawProps.config?.variant || rawProps.variant,
        showStats: rawProps.config?.showStats ?? rawProps.showStats,
        showOrders: rawProps.config?.showOrders ?? rawProps.showOrders,
        showAddresses: rawProps.config?.showAddresses ?? rawProps.showAddresses,
        showProfile: rawProps.config?.showProfile ?? rawProps.showProfile,
        showLogout: rawProps.config?.showLogout ?? rawProps.showLogout,
        enableAccountDelete:
          rawProps.config?.enableAccountDelete ?? rawProps.enableAccountDelete,
      };
      break;

    case "accountProfile":
      derivedContent = {
        title: rawProps.content?.title || rawProps.title,
        user: rawProps.content?.user || rawProps.user,
        labels: rawProps.content?.labels || rawProps.labels,
      };
      derivedConfig = {
        showAvatar: rawProps.config?.showAvatar ?? rawProps.showAvatar,
        editable: rawProps.config?.editable ?? rawProps.editable,
        animation: rawProps.config?.animation || rawProps.animation,
      };
      break;

    case "orderHistory":
      derivedContent = {
        title: rawProps.content?.title || rawProps.title,
        orders: rawProps.content?.orders || rawProps.orders,
        statusLabels: rawProps.content?.statusLabels || rawProps.statusLabels,
      };
      derivedConfig = {
        showOrderDetails:
          rawProps.config?.showOrderDetails ?? rawProps.showOrderDetails,
        animation: rawProps.config?.animation || rawProps.animation,
      };
      break;

    case "wishlist":
      derivedContent = {
        title: rawProps.content?.title || rawProps.title,
        emptyMessage: rawProps.content?.emptyMessage || rawProps.emptyMessage,
        addToCartText: rawProps.content?.addToCartText || rawProps.addToCartText,
        removeText: rawProps.content?.removeText || rawProps.removeText,
        products: rawProps.content?.products || rawProps.products,
      };
      derivedConfig = {
        columns: rawProps.config?.columns || rawProps.columns,
        showAddToCart: rawProps.config?.showAddToCart ?? rawProps.showAddToCart,
        showRemove: rawProps.config?.showRemove ?? rawProps.showRemove,
        showStockStatus:
          rawProps.config?.showStockStatus ?? rawProps.showStockStatus,
        animation: rawProps.config?.animation || rawProps.animation,
      };
      break;

    case "wishlistContent":
      derivedContent = {
        title: rawProps.content?.title || rawProps.title,
        emptyMessage: rawProps.content?.emptyMessage || rawProps.emptyMessage,
        emptyButtonLabel:
          rawProps.content?.emptyButtonLabel || rawProps.emptyButtonLabel,
        addToCartLabel: rawProps.content?.addToCartLabel || rawProps.addToCartLabel,
        removeLabel: rawProps.content?.removeLabel || rawProps.removeLabel,
      };
      derivedConfig = {
        variant: rawProps.config?.variant || rawProps.variant,
        columns: rawProps.config?.columns || rawProps.columns,
        showEmptyState: rawProps.config?.showEmptyState ?? rawProps.showEmptyState,
        showRemoveButton:
          rawProps.config?.showRemoveButton ?? rawProps.showRemoveButton,
        showAddToCart: rawProps.config?.showAddToCart ?? rawProps.showAddToCart,
        enableAnimations:
          rawProps.config?.enableAnimations ?? rawProps.enableAnimations,
      };
      break;

    case "checkoutForm":
      derivedContent = {
        title: rawProps.content?.title || rawProps.title,
        steps: rawProps.content?.steps || rawProps.steps || rawProps.stepLabels,
      };
      derivedConfig = {
        currentStep: rawProps.config?.currentStep ?? rawProps.currentStep,
        showSteps: rawProps.config?.showSteps ?? rawProps.showSteps,
        animation: rawProps.config?.animation || rawProps.animation,
      };
      break;

    case "checkoutSummary":
      derivedContent = {
        title: rawProps.content?.title || rawProps.title,
        editLabel: rawProps.content?.editLabel || rawProps.editLabel,
        subtotalLabel: rawProps.content?.subtotalLabel || rawProps.subtotalLabel,
        shippingLabel: rawProps.content?.shippingLabel || rawProps.shippingLabel,
        discountLabel: rawProps.content?.discountLabel || rawProps.discountLabel,
        totalLabel: rawProps.content?.totalLabel || rawProps.totalLabel,
        items: rawProps.content?.items || rawProps.items,
        subtotal: rawProps.content?.subtotal ?? rawProps.subtotal,
        shipping: rawProps.content?.shipping ?? rawProps.shipping,
        discount: rawProps.content?.discount ?? rawProps.discount,
        total: rawProps.content?.total ?? rawProps.total,
      };
      derivedConfig = {
        showItemImages:
          rawProps.config?.showItemImages ?? rawProps.showItemImages,
        editable: rawProps.config?.editable ?? rawProps.editable,
        showDiscount: rawProps.config?.showDiscount ?? rawProps.showDiscount,
        animation: rawProps.config?.animation || rawProps.animation,
      };
      break;

    case "paymentMethods":
      derivedContent = {
        title: rawProps.content?.title || rawProps.title,
        methods: rawProps.content?.methods || rawProps.methods,
        securityLabel: rawProps.content?.securityLabel || rawProps.securityLabel,
      };
      derivedConfig = {
        showSecurityBadges:
          rawProps.config?.showSecurityBadges ?? rawProps.showSecurityBadges,
        layout: rawProps.config?.layout || rawProps.layout,
        animation: rawProps.config?.animation || rawProps.animation,
      };
      break;

    case "checkoutContent":
      derivedContent = {
        title: rawProps.title || rawProps.content?.title,
        subtitle: rawProps.subtitle || rawProps.content?.subtitle,
        stepLabels:
          rawProps.stepLabels || rawProps.steps || rawProps.content?.stepLabels,
        backToCartLabel:
          rawProps.content?.backToCartLabel || rawProps.backToCartLabel,
        deliveryStepTitle:
          rawProps.content?.deliveryStepTitle || rawProps.deliveryStepTitle,
        paymentStepTitle:
          rawProps.content?.paymentStepTitle || rawProps.paymentStepTitle,
        reviewStepTitle:
          rawProps.content?.reviewStepTitle || rawProps.reviewStepTitle,
        placeOrderLabel:
          rawProps.content?.placeOrderLabel || rawProps.placeOrderLabel,
        processingLabel:
          rawProps.content?.processingLabel || rawProps.processingLabel,
        orderSummaryLabel:
          rawProps.content?.orderSummaryLabel || rawProps.orderSummaryLabel,
        subtotalLabel: rawProps.content?.subtotalLabel || rawProps.subtotalLabel,
        shippingLabel: rawProps.content?.shippingLabel || rawProps.shippingLabel,
        totalLabel: rawProps.content?.totalLabel || rawProps.totalLabel,
        notesPlaceholder:
          rawProps.content?.notesPlaceholder || rawProps.notesPlaceholder,
        securePaymentText:
          rawProps.content?.securePaymentText || rawProps.securePaymentText,
      };
      derivedConfig = {
        variant: rawProps.config?.variant || rawProps.variant,
        showSteps: rawProps.config?.showSteps ?? rawProps.showSteps,
        showOrderSummary:
          rawProps.config?.showOrderSummary ?? rawProps.showOrderSummary,
        showSecurePayment:
          rawProps.config?.showSecurePayment ?? rawProps.showSecurePayment,
        enableNotes: rawProps.config?.enableNotes ?? rawProps.enableNotes,
      };
      break;

    case "orderConfirmationContent":
      derivedContent = {
        title: rawProps.content?.title || rawProps.title,
        subtitle: rawProps.content?.subtitle || rawProps.subtitle,
        orderNumberLabel:
          rawProps.content?.orderNumberLabel || rawProps.orderNumberLabel,
        dateLabel: rawProps.content?.dateLabel || rawProps.dateLabel,
        totalLabel: rawProps.content?.totalLabel || rawProps.totalLabel,
        itemsLabel: rawProps.content?.itemsLabel || rawProps.itemsLabel,
        trackingTitle: rawProps.content?.trackingTitle || rawProps.trackingTitle,
        receivedStatus: rawProps.content?.receivedStatus || rawProps.receivedStatus,
        processingStatus:
          rawProps.content?.processingStatus || rawProps.processingStatus,
        shippedStatus: rawProps.content?.shippedStatus || rawProps.shippedStatus,
        deliveredStatus:
          rawProps.content?.deliveredStatus || rawProps.deliveredStatus,
        homeButtonLabel:
          rawProps.content?.homeButtonLabel || rawProps.homeButtonLabel,
        continueShoppingLabel:
          rawProps.content?.continueShoppingLabel ||
          rawProps.continueShoppingLabel,
        loadingMessage:
          rawProps.content?.loadingMessage || rawProps.loadingMessage,
        notFoundMessage:
          rawProps.content?.notFoundMessage || rawProps.notFoundMessage,
      };
      derivedConfig = {
        variant: rawProps.config?.variant || rawProps.variant,
        showOrderDetails:
          rawProps.config?.showOrderDetails ?? rawProps.showOrderDetails,
        showTracking: rawProps.config?.showTracking ?? rawProps.showTracking,
        showItemsList: rawProps.config?.showItemsList ?? rawProps.showItemsList,
        enableAnimations:
          rawProps.config?.enableAnimations ?? rawProps.enableAnimations,
      };
      break;

    default:
      break;
  }

  nextSection.props = {
    ...rawProps,
    content: mergeDeep(derivedContent, rawProps.content),
    config: mergeDeep(derivedConfig, rawProps.config),
    cardConfig: mergeDeep(derivedCardConfig, rawProps.cardConfig),
    style: mergeDeep(derivedStyle, rawProps.style),
    classes: mergeDeep({}, rawProps.classes),
  };

  return nextSection;
}

export function normalizeProjectSections(project: Project): Project {
  const nextProject = JSON.parse(JSON.stringify(project)) as Project;

  nextProject.pages = (nextProject.pages || []).map((page) => ({
    ...page,
    sections: (page.sections || []).map((section) => normalizeSectionProps(section)),
  }));

  if (nextProject.globalSections) {
    nextProject.globalSections = {
      ...nextProject.globalSections,
      announcementBar: nextProject.globalSections.announcementBar
        ? normalizeSectionProps(nextProject.globalSections.announcementBar)
        : nextProject.globalSections.announcementBar,
      header: nextProject.globalSections.header
        ? normalizeSectionProps(nextProject.globalSections.header)
        : nextProject.globalSections.header,
      footer: nextProject.globalSections.footer
        ? normalizeSectionProps(nextProject.globalSections.footer)
        : nextProject.globalSections.footer,
    };
  }

  return nextProject;
}

function cloneSection(section: Section): Section {
  return JSON.parse(JSON.stringify(section)) as Section;
}

function shuffleArray<T>(items: T[]) {
  const nextItems = [...items];

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const current = nextItems[index];
    nextItems[index] = nextItems[randomIndex];
    nextItems[randomIndex] = current;
  }

  return nextItems;
}

function normalizeText(value?: string | null) {
  return (value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function replaceStoreName(text: unknown, businessName?: string) {
  if (typeof text !== "string" || !businessName?.trim()) {
    return text;
  }

  return text.replace(
    /Élégance|Elegance|ELEGANCE|l'Univers Élégance|l'Univers Elegance|Univers Élégance|Univers Elegance/gi,
    (match) => {
      if (/univers/i.test(match)) {
        return `l'Univers ${businessName.trim()}`;
      }

      return businessName.trim();
    },
  );
}

function buildFooterAddress(store?: StorefrontSectionStoreData | null) {
  const pickupAddress = store?.pickupAddress;
  const addressParts = [
    pickupAddress?.address,
    pickupAddress?.city,
    pickupAddress?.country,
  ].filter((value) => typeof value === "string" && value.trim().length > 0);

  if (addressParts.length > 0) {
    return addressParts.join(", ");
  }

  return [store?.locationName, store?.locationDept]
    .filter((value) => typeof value === "string" && value.trim().length > 0)
    .join(", ");
}

function sanitizeWhatsappLink(value?: string) {
  const rawValue = String(value || "").trim();

  if (!rawValue) {
    return "";
  }

  if (/^https?:\/\//i.test(rawValue)) {
    return rawValue;
  }

  const digits = rawValue.replace(/[^\d]/g, "");
  return digits ? `https://wa.me/${digits}` : rawValue;
}

function getProductImage(product: NonNullable<StorefrontSectionStoreData["products"]>[number]) {
  const firstGalleryImage = Array.isArray(product.images)
    ? product.images.find((image) => typeof image === "string" && image.trim().length > 0)
    : undefined;

  if (firstGalleryImage) {
    return firstGalleryImage;
  }

  return typeof product.image === "string" && product.image.trim().length > 0
    ? product.image
    : "";
}

export function buildDynamicCategoryGrid(store?: StorefrontSectionStoreData | null) {
  const products = (store?.products || []).filter((product) => {
    const status = String(product.status || "active").toLowerCase();
    const stock = typeof product.stock === "number" ? product.stock : 1;
    return status === "active" && stock > 0;
  });

  const categoryMap = new Map<
    string,
    { name: string; productCount: number; image: string }
  >();

  products.forEach((product) => {
    const categoryLabel = resolveCategoryLabels([
      product.category || product.categoryId || "",
    ])[0];

    if (!categoryLabel) {
      return;
    }

    const normalizedCategory = categoryLabel.trim().toLowerCase();

    if (!normalizedCategory) {
      return;
    }

    const image = getProductImage(product);
    const existingCategory = categoryMap.get(normalizedCategory);

    if (existingCategory) {
      existingCategory.productCount += 1;
      if (!existingCategory.image && image) {
        existingCategory.image = image;
      }
      return;
    }

    categoryMap.set(normalizedCategory, {
      name: categoryLabel,
      productCount: 1,
      image,
    });
  });

  return shuffleArray(Array.from(categoryMap.values()))
    .filter((category) => category.productCount > 0 && category.image)
    .slice(0, 4)
    .map((category) => ({
      name: category.name,
      image: category.image,
      productCount: category.productCount,
      link: `/produits?category=${encodeURIComponent(category.name)}`,
    }));
}

function getProductBadge(product: NonNullable<StorefrontSectionStoreData["products"]>[number]) {
  if (typeof product.badge === "string" && product.badge.trim()) {
    return product.badge;
  }

  if (product.isNew) {
    return "Nouveau";
  }

  if (product.isFeatured) {
    return "Populaire";
  }

  if (product.isBestseller) {
    return "Best-seller";
  }

  return undefined;
}

export function buildStorefrontProductOrderMetrics(
  items: Array<{
    productId?: unknown;
    quantity?: unknown;
    createdAt?: unknown;
  }>,
) {
  return items.reduce<Record<string, StorefrontProductOrderMetric>>((accumulator, item) => {
    const productId = String(item.productId || "").trim();

    if (!productId) {
      return accumulator;
    }

    const rawQuantity = Number(item.quantity);
    const quantity = Number.isFinite(rawQuantity) && rawQuantity > 0 ? rawQuantity : 1;
    const createdAt =
      typeof item.createdAt === "string" && item.createdAt.trim().length > 0
        ? item.createdAt
        : undefined;
    const currentMetric = accumulator[productId] || {
      productId,
      orderCount: 0,
      orderedQuantity: 0,
      lastOrderedAt: undefined,
    };
    const currentLastOrderedAt = currentMetric.lastOrderedAt
      ? new Date(currentMetric.lastOrderedAt).getTime()
      : 0;
    const nextLastOrderedAt = createdAt ? new Date(createdAt).getTime() : 0;

    accumulator[productId] = {
      productId,
      orderCount: currentMetric.orderCount + 1,
      orderedQuantity: currentMetric.orderedQuantity + quantity,
      lastOrderedAt:
        nextLastOrderedAt > currentLastOrderedAt
          ? createdAt
          : currentMetric.lastOrderedAt,
    };

    return accumulator;
  }, {});
}

function getTimestamp(value?: string) {
  return value ? new Date(value).getTime() || 0 : 0;
}

type DynamicGridProduct = {
  id: string;
  name: string;
  price: number;
  oldPrice: number | undefined;
  image: string;
  rating: number | undefined;
  reviewCount: number | undefined;
  badge: string | undefined;
  category: string | undefined;
  categoryKey: string;
  isFeatured: boolean;
  isNew: boolean;
  isBestseller: boolean;
  views: number;
  sales: number;
  lastOrderedAt: string | undefined;
  totalOrderedQuantity: number;
  createdAt: string;
};

function sortProductsByNewest(products: DynamicGridProduct[]) {
  return [...products].sort((left, right) => {
    const rightTime = getTimestamp(right.createdAt);
    const leftTime = getTimestamp(left.createdAt);

    if (rightTime !== leftTime) {
      return rightTime - leftTime;
    }

    return Number(right.isNew) - Number(left.isNew);
  });
}

function sortProductsByRecommendation(products: DynamicGridProduct[]) {
  return [...products].sort((left, right) => {
    const rightScore =
      Number(right.isFeatured) * 30 +
      Number(right.isBestseller) * 24 +
      Math.min(24, right.sales * 4) +
      Math.min(16, right.views / 4) +
      (right.rating || 0) * 10 +
      Math.min(12, (right.reviewCount || 0) / 2) +
      Number(right.isNew) * 10;
    const leftScore =
      Number(left.isFeatured) * 30 +
      Number(left.isBestseller) * 24 +
      Math.min(24, left.sales * 4) +
      Math.min(16, left.views / 4) +
      (left.rating || 0) * 10 +
      Math.min(12, (left.reviewCount || 0) / 2) +
      Number(left.isNew) * 10;

    if (rightScore !== leftScore) {
      return rightScore - leftScore;
    }

    return getTimestamp(right.createdAt) - getTimestamp(left.createdAt);
  });
}

function sortProductsForYou(products: DynamicGridProduct[]) {
  const prices = products
    .map((product) => product.price)
    .filter((price) => Number.isFinite(price));
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : minPrice;
  const priceRange = Math.max(1, maxPrice - minPrice);
  const categoryPopularity = products.reduce<Record<string, number>>((accumulator, product) => {
    accumulator[product.categoryKey] = (accumulator[product.categoryKey] || 0) + 1;
    return accumulator;
  }, {});

  return [...products].sort((left, right) => {
    const rightAffordability = 1 - Math.min(1, (right.price - minPrice) / priceRange);
    const leftAffordability = 1 - Math.min(1, (left.price - minPrice) / priceRange);
    const rightScore =
      rightAffordability * 26 +
      Number(right.isNew) * 12 +
      Number(right.isFeatured) * 16 +
      Number(right.isBestseller) * 14 +
      Math.min(16, right.sales * 3) +
      Math.min(10, categoryPopularity[right.categoryKey] || 0) +
      (right.rating || 0) * 6;
    const leftScore =
      leftAffordability * 26 +
      Number(left.isNew) * 12 +
      Number(left.isFeatured) * 16 +
      Number(left.isBestseller) * 14 +
      Math.min(16, left.sales * 3) +
      Math.min(10, categoryPopularity[left.categoryKey] || 0) +
      (left.rating || 0) * 6;

    if (rightScore !== leftScore) {
      return rightScore - leftScore;
    }

    return getTimestamp(right.createdAt) - getTimestamp(left.createdAt);
  });
}

function buildDynamicProductGrid(
  section: Section,
  store?: StorefrontSectionStoreData | null,
) {
  const nextProps = section.props || {};
  const manualProducts = normalizeProductItems(
    nextProps.content?.products || nextProps.products,
  );
  const rawSource = String(
    nextProps.dynamicSource || nextProps.config?.dynamicSource || "newest",
  );
  const sourceAliases: Record<string, string> = {
    "best-sellers": "best_selling",
  };
  const source = sourceAliases[rawSource] || rawSource;
  const limit = Math.max(
    1,
    Math.min(
      24,
      Number(nextProps.productsToShow || nextProps.config?.productsPerPage || 8),
    ),
  );
  const threshold = Math.max(
    0,
    Number(nextProps.priceThreshold || nextProps.config?.priceThreshold || 0),
  );
  const categoryFilter = normalizeText(
    String(
      nextProps.categoryFilter ||
        nextProps.config?.categoryFilter ||
        nextProps.content?.categoryFilter ||
      "",
    ),
  );

  if (source === "manual") {
    return manualProducts.slice(0, limit);
  }

  const baseProducts: DynamicGridProduct[] = (store?.products || [])
    .filter((product) => {
      const status = String(product.status || "active").toLowerCase();
      const stock = typeof product.stock === "number" ? product.stock : 1;
      return status === "active" && stock > 0 && product.id && product.name;
    })
    .map((product) => {
      const categoryLabel = resolveCategoryLabels([
        product.category || product.categoryId || "",
      ])[0];
      const image = getProductImage(product);

      return {
        id: String(product.id),
        name: String(product.name),
        price: Number(product.price || 0),
        oldPrice:
          typeof product.oldPrice === "number" && Number.isFinite(product.oldPrice)
            ? product.oldPrice
            : undefined,
        image,
        rating:
          typeof product.rating === "number" && Number.isFinite(product.rating)
            ? product.rating
            : undefined,
        reviewCount:
          typeof product.reviewCount === "number" && Number.isFinite(product.reviewCount)
            ? product.reviewCount
            : undefined,
        badge: getProductBadge(product),
        category: categoryLabel,
        categoryKey: normalizeText(categoryLabel || product.categoryId || product.category || ""),
        isFeatured: Boolean(product.isFeatured),
        isNew: Boolean(product.isNew),
        isBestseller: Boolean(product.isBestseller),
        views: Number(product.views || 0),
        sales: Number(product.sales || 0),
        lastOrderedAt:
          typeof product.lastOrderedAt === "string" && product.lastOrderedAt.trim()
            ? product.lastOrderedAt
            : undefined,
        totalOrderedQuantity: Math.max(
          0,
          Number(product.totalOrderedQuantity || product.sales || 0),
        ),
        createdAt: product.createdAt || "",
      } satisfies DynamicGridProduct;
    })
    .filter((product) => product.image);

  if (baseProducts.length === 0) {
    return manualProducts.slice(0, limit);
  }

  let filteredProducts: DynamicGridProduct[] = [...baseProducts];

  if (source === "featured") {
    filteredProducts = filteredProducts
      .filter((product) => product.isFeatured)
      .sort((left, right) => getTimestamp(right.createdAt) - getTimestamp(left.createdAt));
  } else if (source === "category") {
    filteredProducts = filteredProducts
      .filter((product) => categoryFilter && product.categoryKey === categoryFilter)
      .sort((left, right) => getTimestamp(right.createdAt) - getTimestamp(left.createdAt));
  } else if (source === "price_below") {
    filteredProducts = filteredProducts
      .filter((product) => product.price <= threshold)
      .sort((left, right) => right.price - left.price);
  } else if (source === "price_above") {
    filteredProducts = filteredProducts
      .filter((product) => product.price >= threshold)
      .sort((left, right) => left.price - right.price);
  } else if (source === "best_selling" || source === "most_demanded") {
    filteredProducts = filteredProducts
      .filter(
        (product) =>
          product.totalOrderedQuantity > 0 || product.sales > 0 || product.isBestseller,
      )
      .sort((left, right) => {
        if (right.totalOrderedQuantity !== left.totalOrderedQuantity) {
          return right.totalOrderedQuantity - left.totalOrderedQuantity;
        }
        if (right.sales !== left.sales) {
          return right.sales - left.sales;
        }
        return getTimestamp(right.lastOrderedAt) - getTimestamp(left.lastOrderedAt);
      });
  } else if (source === "recently_ordered") {
    filteredProducts = filteredProducts
      .filter(
        (product) =>
          Boolean(product.lastOrderedAt) ||
          product.totalOrderedQuantity > 0 ||
          product.sales > 0,
      )
      .sort((left, right) => {
        const rightLastOrder = getTimestamp(right.lastOrderedAt);
        const leftLastOrder = getTimestamp(left.lastOrderedAt);

        if (rightLastOrder !== leftLastOrder) {
          return rightLastOrder - leftLastOrder;
        }

        if (right.totalOrderedQuantity !== left.totalOrderedQuantity) {
          return right.totalOrderedQuantity - left.totalOrderedQuantity;
        }

        return right.sales - left.sales;
      });
  } else if (source === "most_viewed") {
    filteredProducts = filteredProducts
      .filter((product) => product.views > 0)
      .sort((left, right) => right.views - left.views);
  } else if (source === "recommended") {
    filteredProducts = sortProductsByRecommendation(filteredProducts);
  } else if (source === "for_you") {
    filteredProducts = sortProductsForYou(filteredProducts);
  } else if (source === "random") {
    filteredProducts = shuffleArray(filteredProducts);
  } else {
    filteredProducts = sortProductsByNewest(filteredProducts);
  }

  if (filteredProducts.length === 0) {
    filteredProducts = sortProductsByNewest(baseProducts);
  }

  return filteredProducts.slice(0, limit).map((product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    oldPrice: product.oldPrice,
    image: product.image,
    rating: product.rating,
    reviewCount: product.reviewCount,
    badge: product.badge,
    sellerId: store?.sellerId,
    storeSlug: store?.storeSlug,
    href: `/product?id=${encodeURIComponent(product.id)}`,
    link: `/product?id=${encodeURIComponent(product.id)}`,
  }));
}

function buildStoreCategoryNavigation(
  store?: StorefrontSectionStoreData | null,
  maxCategories = 4,
): HeaderNavigationItem[] {
  const categoryLabels = resolveCategoryLabels(store?.categories || []);

  return categoryLabels.slice(0, maxCategories).map((label, index) => ({
    id: `store-category-${index}`,
    label,
    link: `/produits?category=${encodeURIComponent(label)}`,
    enabled: true,
  }));
}

export function resolveStorefrontNavigationLinks(
  headerProps: HeaderSectionPropsLike | null | undefined,
  store?: StorefrontSectionStoreData | null,
) {
  const navigationSettings = normalizeHeaderNavigationSettings(
    headerProps?.navigationSettings || getDefaultHeaderNavigationSettings(),
  );

  const customNavigation = [
    navigationSettings.menu1,
    navigationSettings.menu2,
    navigationSettings.menu3,
    navigationSettings.menu4,
    navigationSettings.menu5,
    navigationSettings.menu6,
  ]
    .filter((item) => item.enabled)
    .map((item) => ({
      label: item.text,
      link: item.link,
    }));

  const remainingSlots = Math.max(0, 6 - customNavigation.length);
  const storeNavigation = navigationSettings.showCategories
    ? buildStoreCategoryNavigation(
        store,
        Math.min(navigationSettings.maxCategories, remainingSlots),
      ).map((item) => ({
          label: item.label,
          link: item.link,
        }))
    : [];

  return [...customNavigation, ...storeNavigation].slice(0, 6);
}

export function applyStorefrontDataToSection(
  section: Section,
  store?: StorefrontSectionStoreData | null,
): Section {
  const normalizedSection = normalizeSectionProps(section);

  if (!store) {
    return normalizedSection;
  }

  if (
    normalizedSection.type !== "headerModern" &&
    normalizedSection.type !== "headerMinimal" &&
    normalizedSection.type !== "categoryGrid" &&
    normalizedSection.type !== "productGrid" &&
    normalizedSection.type !== "newsletter" &&
    normalizedSection.type !== "footerModern" &&
    normalizedSection.type !== "footerMinimal" &&
    normalizedSection.type !== "login" &&
    normalizedSection.type !== "register" &&
    normalizedSection.type !== "accountDashboard" &&
    normalizedSection.type !== "accountContent" &&
    normalizedSection.type !== "orderConfirmationContent" &&
    normalizedSection.type !== "orderDetail"
  ) {
    return normalizedSection;
  }

  if (
    normalizedSection.type === "login" ||
    normalizedSection.type === "register" ||
    normalizedSection.type === "accountDashboard" ||
    normalizedSection.type === "accountContent" ||
    normalizedSection.type === "orderConfirmationContent" ||
    normalizedSection.type === "orderDetail"
  ) {
    const nextSection = cloneSection(normalizedSection);
    nextSection.props = {
      ...(nextSection.props || {}),
      storefrontStore: store,
    };
    return nextSection;
  }

  const nextSection = cloneSection(normalizedSection);
  const nextProps = (nextSection.props || {}) as StorefrontSectionPropsLike;
  const nextContent = isPlainObject(nextProps.content) ? nextProps.content : {};
  const currentLogo: Record<string, any> =
    normalizeHeaderLogo(nextContent.logo || nextProps.logo) || {};

  if (
    normalizedSection.type === "footerModern" ||
    normalizedSection.type === "footerMinimal"
  ) {
    const nextContactInfo = {
      ...(nextContent.contactInfo || nextProps.contactInfo || {}),
      title:
        nextContent.contactInfo?.title ||
        nextProps.contactInfo?.title ||
        "Restons en contact",
      address:
        buildFooterAddress(store) ||
        nextContent.contactInfo?.address ||
        nextProps.contactInfo?.address ||
        "",
      phone:
        store.contactPhone ||
        store.pickupAddress?.phone ||
        nextContent.contactInfo?.phone ||
        nextProps.contactInfo?.phone ||
        "",
      email:
        store.contactEmail ||
        nextContent.contactInfo?.email ||
        nextProps.contactInfo?.email ||
        "",
    };
    const socialMap = new Map<string, string>();

    normalizeSocialLinks(nextContent.social || nextProps.social).forEach((item) => {
      socialMap.set(item.platform, item.url);
    });

    if (!socialMap.get("whatsapp") && nextProps.social?.whatsapp) {
      socialMap.set("whatsapp", sanitizeWhatsappLink(nextProps.social.whatsapp));
    } else if (socialMap.get("whatsapp")) {
      socialMap.set("whatsapp", sanitizeWhatsappLink(socialMap.get("whatsapp")));
    }

    nextSection.props = {
      ...nextProps,
      content: {
        ...nextContent,
        logo: {
          ...currentLogo,
          text: store.businessName?.trim() || currentLogo.text,
          image: store.logo || currentLogo.image,
        },
        contactInfo: nextContactInfo,
        social: Array.from(socialMap.entries()).map(([platform, url]) => ({
          platform,
          url,
        })),
        columns:
          normalizedSection.type === "footerModern" && store.navigationLinks?.length
            ? [
                {
                  title: "Navigation",
                  links: store.navigationLinks.map((item) => ({
                    label: item.label,
                    href: item.link,
                    link: item.link,
                    url: item.link,
                  })),
                },
              ]
            : nextContent.columns,
      },
      logo: {
        ...currentLogo,
        text: store.businessName?.trim() || currentLogo.text,
        image: store.logo || currentLogo.image,
      },
      contactInfo: nextContactInfo,
      social: {
        whatsapp: socialMap.get("whatsapp") || "",
        instagram: socialMap.get("instagram") || "",
        facebook: socialMap.get("facebook") || "",
        tiktok: socialMap.get("tiktok") || "",
        youtube: socialMap.get("youtube") || "",
      },
      columns:
        normalizedSection.type === "footerModern" && store.navigationLinks?.length
          ? [
              {
                title: "Navigation",
                links: store.navigationLinks.map((item) => ({
                  label: item.label,
                  href: item.link,
                  link: item.link,
                  url: item.link,
                })),
              },
            ]
          : nextProps.columns,
    };

    return nextSection;
  }

  if (normalizedSection.type === "categoryGrid") {
    const dynamicCategories = store.categoryCollections || buildDynamicCategoryGrid(store);

    nextSection.props = {
      ...nextProps,
      content: {
        ...nextContent,
        categories: dynamicCategories.map((category) => ({
          ...category,
          href: category.link,
          link: category.link,
        })),
      },
      columns: 4,
      categories: dynamicCategories.map((category) => ({
        ...category,
        href: category.link,
      })),
      storefrontStore: store,
    };

    return nextSection;
  }

  if (normalizedSection.type === "productGrid") {
    const dynamicProducts = buildDynamicProductGrid(normalizedSection, store);

    nextSection.props = {
      ...nextProps,
      content: {
        ...nextContent,
        products: dynamicProducts,
        storefrontStore: store,
      },
      products: dynamicProducts,
      storefrontStore: store,
    };

    return nextSection;
  }

  if (normalizedSection.type === "newsletter") {
    nextSection.props = {
      ...nextProps,
      content: {
        ...nextContent,
        title: replaceStoreName(nextContent.title || nextProps.title, store.businessName),
        description: replaceStoreName(
          nextContent.description || nextProps.subtitle,
          store.businessName,
        ),
      },
      title: replaceStoreName(nextProps.title, store.businessName),
      subtitle: replaceStoreName(nextProps.subtitle, store.businessName),
      storefrontStore: store,
    };

    return nextSection;
  }

  const navigationSettings = normalizeHeaderNavigationSettings(
    nextProps.navigationSettings || getDefaultHeaderNavigationSettings(),
  );
  const mergedNavigation = resolveStorefrontNavigationLinks(nextProps, store).map(
    (item, index) => ({
      id: `storefront-nav-${index}`,
      label: item.label,
      href: item.link,
      link: item.link,
      enabled: true,
    }),
  );

  nextSection.props = {
    ...nextProps,
    content: {
      ...nextContent,
      logo: {
        ...currentLogo,
        text: store.businessName?.trim() || currentLogo.text,
        image: store.logo || currentLogo.image,
      },
      navigation: mergedNavigation,
    },
    logo: {
      ...currentLogo,
      text: store.businessName?.trim() || currentLogo.text,
      image: store.logo || currentLogo.image,
    },
    navigationSettings,
    navigation: mergedNavigation,
    blocks: mergedNavigation,
    storefrontStore: store,
  };

  return nextSection;
}
