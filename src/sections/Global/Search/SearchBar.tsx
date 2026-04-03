"use client";

// ============================================
// SEARCH BAR — 100% Configurable Architecture
// ============================================

import { searchBarSchema } from "./SearchBar.schema";
import { Search, SlidersHorizontal, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { SectionWrapper, SectionContainer } from "@/components/SectionWrapper";
import { cn, useSectionStyles } from "@/hooks/useSectionStyles";

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────
export interface SearchBarContent {
  placeholder?: string;
  popularSearchesLabel?: string;
  popularSearches?: string[] | string;
}

export interface SearchBarConfig {
  showFilters?: boolean;
  showPopularSearches?: boolean;
  size?: "sm" | "md" | "lg";
  onSearch?: (value: string) => void;
}

export interface SearchBarStyle {
  colors?: {
    background?: string;
    text?: string;
    accent?: string;
    border?: string;
  };
  spacing?: {
    paddingY?: string;
    container?: "full" | "contained" | "narrow";
  };
}

export interface SearchBarClasses {
  root?: string;
  input?: string;
  filterButton?: string;
  popularSearches?: string;
}

export interface SearchBarProps {
  id?: string;
  testId?: string;
  content?: SearchBarContent;
  config?: SearchBarConfig;
  style?: SearchBarStyle;
  classes?: SearchBarClasses;
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

function normalizePopularSearches(value: SearchBarContent["popularSearches"]) {
  if (Array.isArray(value)) {
    return value
      .map((term) =>
        typeof term === "string"
          ? term
          : String(
              (term as { text?: string; label?: string; value?: string })?.text ||
                (term as { text?: string; label?: string; value?: string })?.label ||
                (term as { text?: string; label?: string; value?: string })?.value ||
                "",
            ),
      )
      .map((term) => term.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split("\n")
      .map((term) => term.trim())
      .filter(Boolean);
  }

  return [];
}

// ─────────────────────────────────────────
// MAIN SEARCH BAR COMPONENT
// ─────────────────────────────────────────
export function SearchBar({
  id,
  testId,
  content = {},
  config = {},
  style = {},
  classes = {},
}: SearchBarProps) {
  // ── EXTRACT CONTENT ──
  const {
    placeholder = "Rechercher...",
    popularSearchesLabel = "Recherches populaires:",
    popularSearches = [],
  } = content;
  const normalizedPopularSearches = normalizePopularSearches(popularSearches);

  // ── EXTRACT CONFIG ──
  const {
    showFilters = true,
    showPopularSearches = true,
    size = "md",
    onSearch,
  } = config;

  // ── EXTRACT STYLE ──
  const { colors: styleColors = {}, spacing: styleSpacing = {} } = style;

  const {
    background: backgroundColor = "white",
    text: textColor = "primary",
    accent: accentColor = "accent",
    border: borderColor,
  } = styleColors;

  const { container = "contained", paddingY = "10" } = styleSpacing;

  // ── STATE ──
  const [searchValue, setSearchValue] = useState("");

  // ── HOOKS ──
  const { css } = useSectionStyles(style);

  // ── HELPERS ──
  const resolvedBgColor = resolveColor(backgroundColor, "#ffffff");
  const resolvedTextColor = resolveColor(textColor, "#1a1a1a");
  const resolvedAccentColor = resolveColor(accentColor, "#c9a96e");
  const resolvedBorderColor = borderColor
    ? resolveColor(borderColor, "#e5e5e5")
    : "#e5e5e5";

  const sizeClasses = {
    sm: "h-10 text-sm",
    md: "h-14 text-lg",
    lg: "h-16 text-xl",
  }[size];

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  // ── RENDER ──
  return (
    <SectionWrapper
      id={id}
      testId={testId}
      as="section"
      className={cn("w-full", classes?.root)}
      style={{
        backgroundColor: resolvedBgColor,
        color: resolvedTextColor,
        ...css,
      }}
    >
      <SectionContainer
        size={container}
        style={{
          paddingTop: `${parseInt(paddingY) * 0.25}rem`,
          paddingBottom: `${parseInt(paddingY) * 0.25}rem`,
        }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: `${resolvedTextColor}66` }}
            />
            <Input
              type="text"
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={placeholder}
              className={cn("pl-12 pr-12", sizeClasses, classes?.input)}
            />
            {showFilters && (
              <button
                className={cn(
                  "absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded transition-colors",
                  classes?.filterButton,
                )}
              >
                <SlidersHorizontal
                  className="w-5 h-5"
                  style={{ color: resolvedTextColor }}
                />
              </button>
            )}
          </div>

          {showPopularSearches && normalizedPopularSearches.length > 0 && (
            <div
              className={cn(
                "mt-4 flex items-center gap-2 flex-wrap",
                classes?.popularSearches,
              )}
            >
              <span
                className="text-sm"
                style={{ color: `${resolvedTextColor}99` }}
              >
                <TrendingUp className="w-4 h-4 inline mr-1" />
                {popularSearchesLabel}
              </span>
              {normalizedPopularSearches.map((term, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(term)}
                  className="text-sm px-3 py-1 rounded-full border hover:border-gray-400 transition-colors"
                  style={{
                    borderColor: resolvedBorderColor,
                    color: resolvedTextColor,
                  }}
                >
                  {term}
                </button>
              ))}
            </div>
          )}
        </div>
      </SectionContainer>
    </SectionWrapper>
  );
}

Object.assign(SearchBar, { schema: searchBarSchema });

export const schema = searchBarSchema;

export default SearchBar;
