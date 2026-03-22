import type { CSSProperties } from "react";
import type { BoutiqueThemeDefinition } from "@/data/boutiqueThemes";

export function getBoutiqueHeadingClass(theme: BoutiqueThemeDefinition) {
  return theme.slug === "maison"
    ? "font-sans tracking-[-0.04em]"
    : "font-serif tracking-[-0.035em]";
}

export function getBoutiqueRadiusClass(theme: BoutiqueThemeDefinition) {
  switch (theme.layout.cardStyle) {
    case "glass":
      return "rounded-[2rem]";
    case "framed":
      return "rounded-[1.6rem]";
    case "soft":
    default:
      return "rounded-[1.9rem]";
  }
}

export function getBoutiqueSurfaceStyle(
  theme: BoutiqueThemeDefinition,
): CSSProperties {
  return {
    backgroundColor: theme.palette.surface,
    borderColor: theme.palette.border,
    color: theme.palette.text,
  };
}

export function getBoutiqueSurfaceAltStyle(
  theme: BoutiqueThemeDefinition,
): CSSProperties {
  return {
    backgroundColor: theme.palette.surfaceAlt,
    borderColor: theme.palette.border,
    color: theme.palette.text,
  };
}

export function getBoutiqueOutlineButtonStyle(
  theme: BoutiqueThemeDefinition,
): CSSProperties {
  return {
    borderColor: theme.palette.border,
    color: theme.palette.text,
    backgroundColor:
      theme.slug === "noir" ? "rgba(255,255,255,0.02)" : theme.palette.surface,
  };
}

export function getBoutiquePrimaryButtonStyle(
  theme: BoutiqueThemeDefinition,
): CSSProperties {
  return {
    backgroundColor: theme.palette.buttonPrimary,
    color: theme.palette.buttonPrimaryText,
    borderColor: theme.palette.buttonPrimary,
  };
}

export function getBoutiqueSecondaryButtonStyle(
  theme: BoutiqueThemeDefinition,
): CSSProperties {
  return {
    backgroundColor: theme.palette.buttonSecondary,
    color: theme.palette.buttonSecondaryText,
    borderColor: theme.palette.border,
  };
}

export function getBoutiquePageStyle(theme: BoutiqueThemeDefinition): CSSProperties {
  return {
    backgroundColor: theme.palette.pageBackground,
    color: theme.palette.text,
  };
}
