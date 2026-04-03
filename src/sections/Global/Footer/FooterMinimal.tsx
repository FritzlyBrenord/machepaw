'use client';

// ============================================
// FOOTER MINIMAL — 100% Configurable Architecture
// ============================================

import { motion } from 'framer-motion';
import { footerMinimalSchema } from "./FooterMinimal.schema";
import { useNavigate } from '@/lib/router';
import {
  SectionWrapper,
  SectionContainer,
} from '@/components/SectionWrapper';
import { cn, useSectionStyles } from '@/hooks/useSectionStyles';

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────
export interface FooterMinimalContent {
  brand?: string;
  tagline?: string;
  copyright?: string;
  links?: Array<{
    label: string;
    href: string;
  }>;
  socialLinks?: Array<{
    platform: string;
    href: string;
  }>;
}

export interface FooterMinimalConfig {
  showSocialLinks?: boolean;
  showLinks?: boolean;
  showCopyright?: boolean;
  animation?: {
    entrance?: 'fade-in' | 'slide-up' | 'scale-in' | 'none';
  };
}

export interface FooterMinimalStyle {
  colors?: {
    background?: string;
    text?: string;
    accent?: string;
    border?: string;
  };
  spacing?: {
    paddingY?: string;
    container?: 'full' | 'contained' | 'narrow';
  };
}

export interface FooterMinimalClasses {
  root?: string;
  brand?: string;
  tagline?: string;
  links?: string;
  socialLinks?: string;
  copyright?: string;
}

export interface FooterMinimalProps {
  id?: string;
  testId?: string;
  content?: FooterMinimalContent;
  config?: FooterMinimalConfig;
  style?: FooterMinimalStyle;
  classes?: FooterMinimalClasses;
}

// ─────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────
function resolveColor(color: string | undefined, defaultColor: string): string {
  if (!color) return defaultColor;
  const colorMap: Record<string, string> = {
    primary: 'var(--color-primary, #1a1a1a)',
    secondary: 'var(--color-secondary, #f5f5f5)',
    accent: 'var(--color-accent, #c9a96e)',
    muted: 'var(--color-muted, #6b7280)',
    white: '#ffffff',
    black: '#000000',
    transparent: 'transparent',
  };
  return colorMap[color] || color;
}

const socialIcons: Record<string, string> = {
  facebook: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z',
  instagram: 'M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01M7.5 3h9a4.5 4.5 0 014.5 4.5v9a4.5 4.5 0 01-4.5 4.5h-9A4.5 4.5 0 013 16.5v-9A4.5 4.5 0 017.5 3z',
  twitter: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z',
  linkedin: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z',
  youtube: 'M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 001.94-2A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.5v-7l5.5 3.5-5.5 3.5z',
};

// ─────────────────────────────────────────
// MAIN FOOTER MINIMAL COMPONENT
// ─────────────────────────────────────────
export function FooterMinimal({
  id,
  testId,
  content = {},
  config = {},
  style = {},
  classes = {},
}: FooterMinimalProps) {
  const navigate = useNavigate();

  // ── EXTRACT CONTENT ──
  const {
    brand = 'Votre Boutique',
    tagline = 'Votre succès, notre mission',
    copyright = `© ${new Date().getFullYear()} Tous droits réservés.`,
    links = [],
    socialLinks = [],
  } = content;

  // ── EXTRACT CONFIG ──
  const {
    showSocialLinks = true,
    showLinks = true,
    showCopyright = true,
    animation = { entrance: 'fade-in' },
  } = config;

  // ── EXTRACT STYLE ──
  const {
    colors: styleColors = {},
    spacing: styleSpacing = {},
  } = style;

  const {
    background: backgroundColor = 'primary',
    text: textColor = 'white',
    accent: accentColor = 'accent',
    border: borderColor,
  } = styleColors;

  const {
    container = 'contained',
    paddingY = '10',
  } = styleSpacing;

  // ── HOOKS ──
  const { css } = useSectionStyles(style);

  // ── HELPERS ──
  const resolvedBgColor = resolveColor(backgroundColor, '#1a1a1a');
  const resolvedTextColor = resolveColor(textColor, '#ffffff');
  const resolvedAccentColor = resolveColor(accentColor, '#c9a96e');
  const resolvedBorderColor = borderColor ? resolveColor(borderColor, '#333333') : '#333333';

  const handleLinkClick = (href: string) => {
    navigate(href.replace(/^\//, ''));
  };

  // ── RENDER ──
  return (
    <SectionWrapper
      id={id}
      testId={testId}
      as="footer"
      animation={animation}
      className={cn('w-full', classes?.root)}
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center text-center"
        >
          {/* Brand */}
          <h3
            className={cn('text-xl font-bold mb-2', classes?.brand)}
            style={{ color: resolvedTextColor }}
          >
            {brand}
          </h3>
          
          {/* Tagline */}
          <p
            className={cn('text-sm mb-6', classes?.tagline)}
            style={{ color: `${resolvedTextColor}99` }}
          >
            {tagline}
          </p>

          {/* Links */}
          {showLinks && links.length > 0 && (
            <nav className={cn('flex flex-wrap justify-center gap-6 mb-6', classes?.links)}>
              {links.map((link, index) => (
                <button
                  key={index}
                  onClick={() => handleLinkClick(link.href)}
                  className="text-sm hover:opacity-70 transition-opacity"
                  style={{ color: `${resolvedTextColor}cc` }}
                >
                  {link.label}
                </button>
              ))}
            </nav>
          )}

          {/* Social Links */}
          {showSocialLinks && socialLinks.length > 0 && (
            <div className={cn('flex items-center gap-4 mb-6', classes?.socialLinks)}>
              {socialLinks.map((social, index) => {
                const iconPath = socialIcons[social.platform.toLowerCase()];
                return (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-70 transition-opacity"
                    style={{ backgroundColor: `${resolvedTextColor}20` }}
                  >
                    {iconPath ? (
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        style={{ color: resolvedTextColor }}
                      >
                        <path d={iconPath} />
                      </svg>
                    ) : (
                      <span className="text-xs" style={{ color: resolvedTextColor }}>
                        {social.platform.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </a>
                );
              })}
            </div>
          )}

          {/* Divider */}
          <div
            className="w-full h-px mb-6"
            style={{ backgroundColor: resolvedBorderColor }}
          />

          {/* Copyright */}
          {showCopyright && (
            <p
              className={cn('text-sm', classes?.copyright)}
              style={{ color: `${resolvedTextColor}66` }}
            >
              {copyright}
            </p>
          )}
        </motion.div>
      </SectionContainer>
    </SectionWrapper>
  );
}

Object.assign(FooterMinimal, { schema: footerMinimalSchema });

export const schema = footerMinimalSchema;

export default FooterMinimal;
