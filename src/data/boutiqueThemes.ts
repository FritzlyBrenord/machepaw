import themeCatalog from "@/data/boutiqueThemes.json";

export type BoutiqueThemeSlug = "atelier" | "noir" | "maison";
export type BoutiqueHeroStyle = "split" | "slider" | "editorial";
export type BoutiqueNavStyle = "classic" | "centered" | "floating";
export type BoutiqueCardStyle = "soft" | "glass" | "framed";
export type BoutiqueFooterStyle = "editorial" | "dark-grid" | "split";

export interface BoutiqueThemePalette {
  pageBackground: string;
  pageAltBackground: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
  accentSoft: string;
  accentContrast: string;
  heroBase: string;
  heroOverlay: string;
  topBarBackground: string;
  topBarText: string;
  footerBackground: string;
  footerText: string;
  buttonPrimary: string;
  buttonPrimaryText: string;
  buttonSecondary: string;
  buttonSecondaryText: string;
}

export interface BoutiqueThemeLayout {
  heroStyle: BoutiqueHeroStyle;
  navStyle: BoutiqueNavStyle;
  cardStyle: BoutiqueCardStyle;
  footerStyle: BoutiqueFooterStyle;
}

export interface BoutiqueThemeHeroContent {
  eyebrow: string;
  badge: string;
  titleTemplate: string;
  descriptionTemplate: string;
  highlights: string[];
}

export interface BoutiqueThemeDefinition {
  slug: BoutiqueThemeSlug;
  name: string;
  shortDescription: string;
  description: string;
  previewLabel: string;
  palette: BoutiqueThemePalette;
  layout: BoutiqueThemeLayout;
  hero: BoutiqueThemeHeroContent;
}

export interface StorefrontThemeConfigInput extends Record<string, unknown> {}

const RAW_THEMES = themeCatalog as BoutiqueThemeDefinition[];

export const DEFAULT_BOUTIQUE_THEME_SLUG: BoutiqueThemeSlug = "atelier";
export const BOUTIQUE_THEMES = RAW_THEMES;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isThemeSlug(value: unknown): value is BoutiqueThemeSlug {
  return value === "atelier" || value === "noir" || value === "maison";
}

export function getBoutiqueThemeBySlug(slug?: string | null) {
  return (
    BOUTIQUE_THEMES.find((theme) => theme.slug === slug) ||
    BOUTIQUE_THEMES[0]
  );
}

function mergePalette(
  base: BoutiqueThemePalette,
  overrides: unknown,
): BoutiqueThemePalette {
  if (!isObject(overrides)) {
    return base;
  }

  return {
    ...base,
    ...Object.fromEntries(
      Object.entries(overrides).filter(([, value]) => typeof value === "string"),
    ),
  };
}

function mergeLayout(
  base: BoutiqueThemeLayout,
  overrides: unknown,
): BoutiqueThemeLayout {
  if (!isObject(overrides)) {
    return base;
  }

  return {
    heroStyle:
      overrides.heroStyle === "slider" ||
      overrides.heroStyle === "editorial" ||
      overrides.heroStyle === "split"
        ? overrides.heroStyle
        : base.heroStyle,
    navStyle:
      overrides.navStyle === "centered" ||
      overrides.navStyle === "floating" ||
      overrides.navStyle === "classic"
        ? overrides.navStyle
        : base.navStyle,
    cardStyle:
      overrides.cardStyle === "glass" ||
      overrides.cardStyle === "framed" ||
      overrides.cardStyle === "soft"
        ? overrides.cardStyle
        : base.cardStyle,
    footerStyle:
      overrides.footerStyle === "dark-grid" ||
      overrides.footerStyle === "split" ||
      overrides.footerStyle === "editorial"
        ? overrides.footerStyle
        : base.footerStyle,
  };
}

function mergeHero(
  base: BoutiqueThemeHeroContent,
  overrides: unknown,
): BoutiqueThemeHeroContent {
  if (!isObject(overrides)) {
    return base;
  }

  return {
    eyebrow:
      typeof overrides.eyebrow === "string" ? overrides.eyebrow : base.eyebrow,
    badge: typeof overrides.badge === "string" ? overrides.badge : base.badge,
    titleTemplate:
      typeof overrides.titleTemplate === "string"
        ? overrides.titleTemplate
        : base.titleTemplate,
    descriptionTemplate:
      typeof overrides.descriptionTemplate === "string"
        ? overrides.descriptionTemplate
        : base.descriptionTemplate,
    highlights: Array.isArray(overrides.highlights)
      ? overrides.highlights.filter((item): item is string => typeof item === "string")
      : base.highlights,
  };
}

export function resolveBoutiqueTheme(
  slug?: string | null,
  config?: unknown,
): BoutiqueThemeDefinition {
  const configObject = isObject(config) ? config : null;
  const baseTheme = getBoutiqueThemeBySlug(
    isThemeSlug(configObject?.slug) ? configObject.slug : slug,
  );

  if (!configObject) {
    return baseTheme;
  }

  return {
    ...baseTheme,
    slug: isThemeSlug(configObject.slug) ? configObject.slug : baseTheme.slug,
    name:
      typeof configObject.name === "string" ? configObject.name : baseTheme.name,
    shortDescription:
      typeof configObject.shortDescription === "string"
        ? configObject.shortDescription
        : baseTheme.shortDescription,
    description:
      typeof configObject.description === "string"
        ? configObject.description
        : baseTheme.description,
    previewLabel:
      typeof configObject.previewLabel === "string"
        ? configObject.previewLabel
        : baseTheme.previewLabel,
    palette: mergePalette(baseTheme.palette, configObject.palette),
    layout: mergeLayout(baseTheme.layout, configObject.layout),
    hero: mergeHero(baseTheme.hero, configObject.hero),
  };
}

export function getBoutiqueThemeSnapshot(slug?: string | null) {
  return JSON.parse(
    JSON.stringify(getBoutiqueThemeBySlug(slug || DEFAULT_BOUTIQUE_THEME_SLUG)),
  ) as BoutiqueThemeDefinition;
}

export function buildStorefrontThemeConfig(
  slug?: string | null,
  existingConfig?: Record<string, unknown> | null,
  extraConfig?: Record<string, unknown> | null,
) {
  const snapshot = getBoutiqueThemeSnapshot(slug);
  const preserved = isObject(existingConfig) ? { ...existingConfig } : {};
  const extra = isObject(extraConfig) ? extraConfig : {};

  return {
    ...preserved,
    ...snapshot,
    ...extra,
  } as Record<string, unknown>;
}

export function applyThemeTemplate(template: string, storeName: string) {
  return template.replaceAll("{storeName}", storeName);
}
