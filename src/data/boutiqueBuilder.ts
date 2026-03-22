import type { BoutiqueThemeSlug } from "@/data/boutiqueThemes";

export type BoutiqueBuilderSectionType =
  | "hero"
  | "benefits"
  | "categories"
  | "flash_sales"
  | "featured_products"
  | "promotions"
  | "new_arrivals"
  | "category_rows";

export type BoutiqueBuilderAlignment = "left" | "center";
export type BoutiqueBuilderLayoutMode =
  | "theme"
  | "simple"
  | "slider"
  | "editorial"
  | "grid"
  | "stacked";
export type BoutiqueBuilderDensity = "compact" | "normal" | "relaxed";
export type BoutiqueBuilderFontScale = "sm" | "md" | "lg";

export interface BoutiqueBuilderSectionStyle {
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  panelColor?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  alignment?: BoutiqueBuilderAlignment;
  layout?: BoutiqueBuilderLayoutMode;
}

export interface BoutiqueBuilderSection {
  id: string;
  type: BoutiqueBuilderSectionType;
  label: string;
  enabled: boolean;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  maxItems?: number;
  style: BoutiqueBuilderSectionStyle;
}

export interface BoutiqueBuilderHomepageConfig {
  global: {
    fontScale: BoutiqueBuilderFontScale;
    density: BoutiqueBuilderDensity;
    contentWidth: "normal" | "wide";
  };
  sections: BoutiqueBuilderSection[];
}

export interface BoutiqueBuilderConfig {
  version: 1;
  homepage: BoutiqueBuilderHomepageConfig;
}

export interface BoutiqueStorefrontConfigRecord extends Record<string, unknown> {
  builder?: BoutiqueBuilderConfig;
}

const SECTION_BASE: Record<
  BoutiqueBuilderSectionType,
  Omit<BoutiqueBuilderSection, "id">
> = {
  hero: {
    type: "hero",
    label: "Hero",
    enabled: true,
    eyebrow: "Boutique premium",
    title: "Decouvrez {storeName}",
    subtitle:
      "Une page d'accueil plus professionnelle, plus claire et plus premium pour donner envie des le premier ecran.",
    ctaLabel: "Explorer la collection",
    ctaHref: "/collection",
    secondaryCtaLabel: "A propos",
    secondaryCtaHref: "/a-propos",
    style: {
      alignment: "left",
      layout: "theme",
      overlayOpacity: 0.72,
    },
  },
  benefits: {
    type: "benefits",
    label: "Points forts",
    enabled: true,
    eyebrow: "Confiance",
    title: "Pourquoi commander dans cette boutique",
    subtitle:
      "Livraison, paiement et experience client restent lies a l'univers de cette boutique.",
    maxItems: 4,
    style: {
      layout: "grid",
    },
  },
  categories: {
    type: "categories",
    label: "Categories",
    enabled: true,
    eyebrow: "Collections",
    title: "Explorer par categorie",
    subtitle:
      "Donnez un acces rapide aux univers les plus importants de votre catalogue.",
    maxItems: 6,
    style: {
      layout: "grid",
    },
  },
  flash_sales: {
    type: "flash_sales",
    label: "Ventes flash",
    enabled: true,
    eyebrow: "Promotions",
    title: "Ventes flash de la boutique",
    subtitle:
      "Mettez les remises urgentes en avant avec une section a fort contraste.",
    maxItems: 3,
    ctaLabel: "Voir les offres",
    ctaHref: "/collection?promo=true",
    style: {
      layout: "grid",
    },
  },
  featured_products: {
    type: "featured_products",
    label: "Produits vedettes",
    enabled: true,
    eyebrow: "Selection",
    title: "Produits en vedette",
    subtitle:
      "La selection principale de votre boutique, placee au centre de l'accueil.",
    maxItems: 5,
    ctaLabel: "Voir tout",
    ctaHref: "/collection",
    style: {
      layout: "theme",
    },
  },
  promotions: {
    type: "promotions",
    label: "Promotions",
    enabled: true,
    eyebrow: "Offres",
    title: "Promotions a ne pas manquer",
    subtitle: "Une grille rapide pour mettre en avant les remises disponibles.",
    maxItems: 4,
    ctaLabel: "Voir toutes les promotions",
    ctaHref: "/collection?promo=true",
    style: {
      layout: "grid",
    },
  },
  new_arrivals: {
    type: "new_arrivals",
    label: "Nouveautes",
    enabled: true,
    eyebrow: "Nouveautes",
    title: "Derniers arrivages",
    subtitle:
      "Les references les plus recentes publiees dans votre boutique.",
    maxItems: 8,
    ctaLabel: "Voir toute la boutique",
    ctaHref: "/collection",
    style: {
      layout: "grid",
    },
  },
  category_rows: {
    type: "category_rows",
    label: "Blocs categories",
    enabled: true,
    eyebrow: "Categorie",
    title: "Blocs categories",
    subtitle:
      "Sections supplementaires par categorie pour prolonger la visite.",
    maxItems: 3,
    ctaLabel: "Voir la categorie",
    ctaHref: "/collection",
    style: {
      layout: "stacked",
    },
  },
};

const DEFAULT_SECTION_ORDER: BoutiqueBuilderSectionType[] = [
  "hero",
  "benefits",
  "categories",
  "flash_sales",
  "featured_products",
  "promotions",
  "new_arrivals",
  "category_rows",
];

function cloneSection(
  type: BoutiqueBuilderSectionType,
  storeName: string,
): BoutiqueBuilderSection {
  const base = SECTION_BASE[type];

  return {
    ...base,
    id: type,
    title: base.title?.replaceAll("{storeName}", storeName),
    subtitle: base.subtitle?.replaceAll("{storeName}", storeName),
    eyebrow: base.eyebrow?.replaceAll("{storeName}", storeName),
    label: base.label,
    style: { ...base.style },
  };
}

export function createDefaultBoutiqueBuilderConfig(
  storeName: string,
  _themeSlug?: BoutiqueThemeSlug,
): BoutiqueBuilderConfig {
  return {
    version: 1,
    homepage: {
      global: {
        fontScale: "md",
        density: "normal",
        contentWidth: "normal",
      },
      sections: DEFAULT_SECTION_ORDER.map((type) => cloneSection(type, storeName)),
    },
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeSection(
  raw: unknown,
  defaults: BoutiqueBuilderSection,
): BoutiqueBuilderSection {
  if (!isObject(raw)) {
    return defaults;
  }

  return {
    ...defaults,
    id: typeof raw.id === "string" ? raw.id : defaults.id,
    label: typeof raw.label === "string" ? raw.label : defaults.label,
    enabled:
      typeof raw.enabled === "boolean" ? raw.enabled : defaults.enabled,
    eyebrow:
      typeof raw.eyebrow === "string" ? raw.eyebrow : defaults.eyebrow,
    title: typeof raw.title === "string" ? raw.title : defaults.title,
    subtitle:
      typeof raw.subtitle === "string" ? raw.subtitle : defaults.subtitle,
    ctaLabel:
      typeof raw.ctaLabel === "string" ? raw.ctaLabel : defaults.ctaLabel,
    ctaHref: typeof raw.ctaHref === "string" ? raw.ctaHref : defaults.ctaHref,
    secondaryCtaLabel:
      typeof raw.secondaryCtaLabel === "string"
        ? raw.secondaryCtaLabel
        : defaults.secondaryCtaLabel,
    secondaryCtaHref:
      typeof raw.secondaryCtaHref === "string"
        ? raw.secondaryCtaHref
        : defaults.secondaryCtaHref,
    maxItems:
      typeof raw.maxItems === "number" ? raw.maxItems : defaults.maxItems,
    style: {
      ...defaults.style,
      ...(isObject(raw.style) ? raw.style : {}),
    },
  };
}

export function resolveBoutiqueBuilderConfig(
  config: unknown,
  storeName: string,
  themeSlug?: BoutiqueThemeSlug,
): BoutiqueBuilderConfig {
  const defaults = createDefaultBoutiqueBuilderConfig(storeName, themeSlug);
  const builder = isObject(config) && isObject(config.builder) ? config.builder : null;

  if (!builder || !isObject(builder.homepage)) {
    return defaults;
  }

  const rawHomepage = builder.homepage as Record<string, unknown>;
  const rawSections = Array.isArray(rawHomepage.sections)
    ? rawHomepage.sections
    : [];

  const normalizedSections = DEFAULT_SECTION_ORDER.map((type) => {
    const defaultSection = cloneSection(type, storeName);
    const existing = rawSections.find(
      (section) => isObject(section) && section.type === type,
    );
    return normalizeSection(existing, defaultSection);
  });

  return {
    version: 1,
    homepage: {
      global: {
        fontScale:
          rawHomepage.global &&
          isObject(rawHomepage.global) &&
          (rawHomepage.global.fontScale === "sm" ||
            rawHomepage.global.fontScale === "lg" ||
            rawHomepage.global.fontScale === "md")
            ? rawHomepage.global.fontScale
            : defaults.homepage.global.fontScale,
        density:
          rawHomepage.global &&
          isObject(rawHomepage.global) &&
          (rawHomepage.global.density === "compact" ||
            rawHomepage.global.density === "relaxed" ||
            rawHomepage.global.density === "normal")
            ? rawHomepage.global.density
            : defaults.homepage.global.density,
        contentWidth:
          rawHomepage.global &&
          isObject(rawHomepage.global) &&
          (rawHomepage.global.contentWidth === "wide" ||
            rawHomepage.global.contentWidth === "normal")
            ? rawHomepage.global.contentWidth
            : defaults.homepage.global.contentWidth,
      },
      sections: normalizedSections,
    },
  };
}

export function updateBuilderSectionOrder(
  config: BoutiqueBuilderConfig,
  sourceId: string,
  targetId: string,
) {
  const sections = [...config.homepage.sections];
  const sourceIndex = sections.findIndex((section) => section.id === sourceId);
  const targetIndex = sections.findIndex((section) => section.id === targetId);

  if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
    return config;
  }

  const [moved] = sections.splice(sourceIndex, 1);
  sections.splice(targetIndex, 0, moved);

  return {
    ...config,
    homepage: {
      ...config.homepage,
      sections,
    },
  };
}

export function resolveBoutiqueBuilderHref(
  basePath: string,
  href?: string | null,
) {
  if (!href) {
    return basePath;
  }

  if (href.startsWith("http://") || href.startsWith("https://")) {
    return href;
  }

  if (href.startsWith("/boutique/")) {
    return href;
  }

  if (href === "/") {
    return basePath;
  }

  if (href.startsWith("/")) {
    return `${basePath}${href}`;
  }

  return `${basePath}/${href}`;
}
