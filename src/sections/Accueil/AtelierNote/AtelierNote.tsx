"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { SectionContainer, SectionWrapper } from "@/components/SectionWrapper";
import { cn } from "@/hooks/useSectionStyles";
import type {
  BaseSectionClasses,
  BaseSectionConfig,
  BaseSectionStyle,
} from "@/types/section-config-types";
import atelierNoteSchema from "./AtelierNote.schema";

export interface AtelierNoteContent {
  badge?: string;
  title?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  note?: string;
}

export interface AtelierNoteConfig extends BaseSectionConfig {
  layout?: "left" | "center";
  showAccentLine?: boolean;
}

export interface AtelierNoteProps {
  id?: string;
  testId?: string;
  content?: AtelierNoteContent;
  config?: AtelierNoteConfig;
  style?: BaseSectionStyle;
  classes?: BaseSectionClasses;
}

function resolveColor(color: string | undefined, fallback: string): string {
  if (!color) return fallback;

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

function getContainerSize(
  value: string | undefined,
): "full" | "contained" | "narrow" | "narrower" {
  if (value === "full" || value === "narrow" || value === "narrower") {
    return value;
  }

  return "contained";
}

function getPaddingYClass(value: string | undefined): string {
  switch (value) {
    case "12":
      return "py-12";
    case "20":
      return "py-20";
    case "0":
      return "py-0";
    default:
      return "py-16";
  }
}

export function AtelierNote({
  id,
  testId,
  content = {},
  config = {},
  style = {},
  classes = {},
}: AtelierNoteProps) {
  const {
    badge = "Atelier prive",
    title = "Une ligne pensee pour durer",
    description =
      "Un bloc editorial simple pour verifier le rendu automatique dans le premier template.",
    ctaText = "Decouvrir",
    ctaLink = "/produits",
    note = "Edition limitee",
  } = content;

  const { layout = "left", showAccentLine = true } = config;

  const backgroundColor = resolveColor(style?.colors?.background, "#f7f5f0");
  const textColor = resolveColor(style?.colors?.text, "#0c0c0c");
  const accentColor = resolveColor(style?.colors?.accent, "#c5a572");
  const containerSize = getContainerSize(style?.spacing?.container);
  const paddingYClass = getPaddingYClass(style?.spacing?.paddingY);

  return (
    <SectionWrapper
      id={id}
      testId={testId}
      className={cn(
        "relative overflow-hidden",
        paddingYClass,
        classes.root,
      )}
      style={{
        backgroundColor,
        color: textColor,
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />
      <div
        className="absolute -top-20 right-0 h-64 w-64 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: accentColor, opacity: 0.13 }}
      />
      <div
        className="absolute -bottom-24 left-0 h-72 w-72 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: accentColor, opacity: 0.09 }}
      />

      <SectionContainer
        size={containerSize}
        className={cn("relative z-10", classes.container)}
      >
        <div
          className={cn(
            "max-w-3xl space-y-5",
            layout === "center" && "mx-auto text-center",
            classes.content,
          )}
        >
          <div
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.3em]"
            style={{
              borderColor: accentColor,
              color: accentColor,
            }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{badge}</span>
          </div>

          <h2
            className={cn(
              "text-3xl sm:text-4xl md:text-5xl font-light leading-[1.05] tracking-[-0.02em]",
              classes.title,
            )}
          >
            {title}
          </h2>

          <p
            className={cn(
              "max-w-2xl text-base sm:text-lg leading-relaxed opacity-80",
              classes.description,
              layout === "center" && "mx-auto",
            )}
          >
            {description}
          </p>

          <div
            className={cn(
              "flex flex-wrap items-center gap-4",
              layout === "center" && "justify-center",
              classes.cta,
            )}
          >
            {ctaText && ctaLink && (
              <a
                href={ctaLink}
                className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition-transform hover:-translate-y-0.5"
                style={{
                  backgroundColor: accentColor,
                  color: "#fff",
                }}
              >
                <span>{ctaText}</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            )}

            <span className="text-xs uppercase tracking-[0.3em] opacity-70">
              {note}
            </span>
          </div>

          {showAccentLine && (
            <div
              className={cn(
                "h-px w-24",
                layout === "center" && "mx-auto",
              )}
              style={{ backgroundColor: accentColor, opacity: 0.5 }}
            />
          )}
        </div>
      </SectionContainer>
    </SectionWrapper>
  );
}

Object.assign(AtelierNote, { schema: atelierNoteSchema });

export const schema = atelierNoteSchema;

export default AtelierNote;
