import type { NavigationLink } from "@/types/builder-types";

export type HeaderMenuSetting = {
  text: string;
  link: string;
  enabled: boolean;
};

export type HeaderNavigationSettings = {
  menu1: HeaderMenuSetting;
  menu2: HeaderMenuSetting;
  menu3: HeaderMenuSetting;
  menu4: HeaderMenuSetting;
  menu5: HeaderMenuSetting;
  menu6: HeaderMenuSetting;
  showCategories: boolean;
  maxCategories: number;
};

const DEFAULT_HEADER_NAVIGATION_SETTINGS: HeaderNavigationSettings = {
  menu1: { text: "Accueil", link: "/", enabled: true },
  menu2: { text: "Collection", link: "/produits", enabled: false },
  menu3: { text: "Promotions", link: "/produits?promo=true", enabled: false },
  menu4: { text: "A propos", link: "/a-propos", enabled: false },
  menu5: { text: "Contact", link: "/contact", enabled: false },
  menu6: { text: "Blog", link: "/blog", enabled: false },
  showCategories: true,
  maxCategories: 4,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeMenuSetting(
  source: unknown,
  fallback: HeaderMenuSetting,
  legacyItem?: NavigationLink | { label?: string; link?: string; href?: string; enabled?: boolean },
): HeaderMenuSetting {
  const record = isRecord(source) ? source : {};
  const legacyLabel =
    legacyItem && typeof legacyItem.label === "string" ? legacyItem.label : "";
  const legacyLink =
    legacyItem && typeof legacyItem.link === "string"
      ? legacyItem.link
      : legacyItem &&
          "href" in legacyItem &&
          typeof legacyItem.href === "string"
        ? legacyItem.href
        : "";

  return {
    text:
      typeof record.text === "string" && record.text.trim()
        ? record.text
        : legacyLabel.trim() || fallback.text,
    link:
      typeof record.link === "string" && record.link.trim()
        ? record.link
        : legacyLink.trim() || fallback.link,
    enabled:
      typeof record.enabled === "boolean"
        ? record.enabled
        : legacyItem &&
            "enabled" in legacyItem &&
            typeof legacyItem.enabled === "boolean"
          ? legacyItem.enabled
          : legacyItem
            ? true
            : fallback.enabled,
  };
}

export function getDefaultHeaderNavigationSettings(): HeaderNavigationSettings {
  return JSON.parse(
    JSON.stringify(DEFAULT_HEADER_NAVIGATION_SETTINGS),
  ) as HeaderNavigationSettings;
}

export function normalizeHeaderNavigationSettings(
  value: unknown,
): HeaderNavigationSettings {
  const defaults = getDefaultHeaderNavigationSettings();
  const record = isRecord(value) ? value : {};
  const legacyItems = Array.isArray(value) ? value : [];

  return {
    menu1: normalizeMenuSetting(record.menu1, defaults.menu1, legacyItems[0]),
    menu2: normalizeMenuSetting(record.menu2, defaults.menu2, legacyItems[1]),
    menu3: normalizeMenuSetting(record.menu3, defaults.menu3, legacyItems[2]),
    menu4: normalizeMenuSetting(record.menu4, defaults.menu4, legacyItems[3]),
    menu5: normalizeMenuSetting(record.menu5, defaults.menu5, legacyItems[4]),
    menu6: normalizeMenuSetting(record.menu6, defaults.menu6, legacyItems[5]),
    showCategories:
      typeof record.showCategories === "boolean"
        ? record.showCategories
        : defaults.showCategories,
    maxCategories:
      typeof record.maxCategories === "number"
        ? Math.max(0, Math.min(6, Math.round(record.maxCategories)))
        : defaults.maxCategories,
  };
}
