// ============================================
// USE SECTION STYLES HOOK
// ============================================
// Hook qui merge les tokens globaux avec les overrides de section
// et génère les classes Tailwind correspondantes
// ============================================

import { useMemo } from 'react';
import type { BaseSectionStyle, BaseSectionConfig, ColorToken, SpacingToken } from '@/types/section-config-types';

// ─────────────────────────────────────────
// TOKEN MAPPINGS
// ─────────────────────────────────────────

const spacingMap: Record<SpacingToken, string> = {
  '0': '0',
  '1': '0.25rem',
  '2': '0.5rem',
  '3': '0.75rem',
  '4': '1rem',
  '5': '1.25rem',
  '6': '1.5rem',
  '8': '2rem',
  '10': '2.5rem',
  '12': '3rem',
  '16': '4rem',
  '20': '5rem',
  '24': '6rem',
  '32': '8rem',
  '40': '10rem',
  '48': '12rem',
  '64': '16rem',
};

const tailwindSpacing: Record<SpacingToken, string> = {
  '0': 'p-0',
  '1': 'p-1',
  '2': 'p-2',
  '3': 'p-3',
  '4': 'p-4',
  '5': 'p-5',
  '6': 'p-6',
  '8': 'p-8',
  '10': 'p-10',
  '12': 'p-12',
  '16': 'p-16',
  '20': 'p-20',
  '24': 'p-24',
  '32': 'p-32',
  '40': 'p-40',
  '48': 'p-48',
  '64': 'p-64',
};

const tailwindGap: Record<SpacingToken, string> = {
  '0': 'gap-0',
  '1': 'gap-1',
  '2': 'gap-2',
  '3': 'gap-3',
  '4': 'gap-4',
  '5': 'gap-5',
  '6': 'gap-6',
  '8': 'gap-8',
  '10': 'gap-10',
  '12': 'gap-12',
  '16': 'gap-16',
  '20': 'gap-20',
  '24': 'gap-24',
  '32': 'gap-32',
  '40': 'gap-40',
  '48': 'gap-48',
  '64': 'gap-64',
};

const tailwindPaddingX: Record<SpacingToken, string> = {
  '0': 'px-0',
  '1': 'px-1',
  '2': 'px-2',
  '3': 'px-3',
  '4': 'px-4',
  '5': 'px-5',
  '6': 'px-6',
  '8': 'px-8',
  '10': 'px-10',
  '12': 'px-12',
  '16': 'px-16',
  '20': 'px-20',
  '24': 'px-24',
  '32': 'px-32',
  '40': 'px-40',
  '48': 'px-48',
  '64': 'px-64',
};

const tailwindPaddingY: Record<SpacingToken, string> = {
  '0': 'py-0',
  '1': 'py-1',
  '2': 'py-2',
  '3': 'py-3',
  '4': 'py-4',
  '5': 'py-5',
  '6': 'py-6',
  '8': 'py-8',
  '10': 'py-10',
  '12': 'py-12',
  '16': 'py-16',
  '20': 'py-20',
  '24': 'py-24',
  '32': 'py-32',
  '40': 'py-40',
  '48': 'py-48',
  '64': 'py-64',
};

const tailwindMaxWidth: Record<string, string> = {
  'sm': 'max-w-sm',
  'md': 'max-w-md',
  'lg': 'max-w-lg',
  'xl': 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  'full': 'max-w-full',
};

const tailwindTextSize: Record<string, string> = {
  'xs': 'text-xs',
  'sm': 'text-sm',
  'base': 'text-base',
  'lg': 'text-lg',
  'xl': 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
  '5xl': 'text-5xl',
  '6xl': 'text-6xl',
  '7xl': 'text-7xl',
  '8xl': 'text-8xl',
  '9xl': 'text-9xl',
};

const tailwindTextAlign: Record<string, string> = {
  'left': 'text-left',
  'center': 'text-center',
  'right': 'text-right',
  'justify': 'text-justify',
};

const tailwindFontWeight: Record<string, string> = {
  'light': 'font-light',
  'normal': 'font-normal',
  'medium': 'font-medium',
  'semibold': 'font-semibold',
  'bold': 'font-bold',
};

const tailwindBorderRadius: Record<string, string> = {
  'none': 'rounded-none',
  'sm': 'rounded-sm',
  'md': 'rounded-md',
  'lg': 'rounded-lg',
  'xl': 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  'full': 'rounded-full',
};

const tailwindShadow: Record<string, string> = {
  'none': 'shadow-none',
  'sm': 'shadow-sm',
  'md': 'shadow-md',
  'lg': 'shadow-lg',
  'xl': 'shadow-xl',
  '2xl': 'shadow-2xl',
  'inner': 'shadow-inner',
};

// ─────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────

function isColorToken(value: string): value is ColorToken {
  const tokens = ['primary', 'secondary', 'accent', 'muted', 'white', 'black', 'transparent'];
  return tokens.includes(value);
}

function resolveColor(color: ColorToken | string | undefined, defaultColor: string = 'inherit'): string {
  if (!color) return defaultColor;
  if (isColorToken(color)) {
    // Return CSS variable reference
    if (color === 'primary') return 'var(--color-primary, #1a1a1a)';
    if (color === 'secondary') return 'var(--color-secondary, #f5f5f5)';
    if (color === 'accent') return 'var(--color-accent, #c9a96e)';
    if (color === 'muted') return 'var(--color-muted, #6b7280)';
    if (color === 'white') return '#ffffff';
    if (color === 'black') return '#000000';
    if (color === 'transparent') return 'transparent';
  }
  return color;
}

function getSpacingValue(token: SpacingToken | string | undefined): string | undefined {
  if (!token) return undefined;
  if (token in spacingMap) return spacingMap[token as SpacingToken];
  return token;
}

// ─────────────────────────────────────────
// MAIN HOOK
// ─────────────────────────────────────────

export interface UseSectionStylesResult {
  css: {
    backgroundColor?: string;
    color?: string;
    accentColor?: string;
    borderColor?: string;
    padding?: string;
    paddingTop?: string;
    paddingBottom?: string;
    paddingLeft?: string;
    paddingRight?: string;
    gap?: string;
    borderRadius?: string;
    opacity?: number;
    maxWidth?: string;
    minHeight?: string;
    [key: string]: string | number | undefined;
  };
  classes: string;
}

export function useSectionStyles(
  style: BaseSectionStyle | Record<string, any> | undefined,
  globalTheme?: { colors?: Record<string, string>; spacing?: Record<string, string> }
): UseSectionStylesResult {
  return useMemo(() => {
    const css: UseSectionStylesResult['css'] = {};
    const classes: string[] = [];

    if (!style) return { css, classes: '' };

    // ── SPACING ──
    if (style.spacing) {
      const { padding, paddingX, paddingY, margin, gap, maxWidth, minHeight, container } = style.spacing;

      if (padding && padding in tailwindSpacing) {
        classes.push(tailwindSpacing[padding as SpacingToken]);
      } else if (padding) {
        css.padding = getSpacingValue(padding);
      }

      if (paddingX && paddingX in tailwindPaddingX) {
        classes.push(tailwindPaddingX[paddingX as SpacingToken]);
      } else if (paddingX) {
        css.paddingLeft = getSpacingValue(paddingX);
        css.paddingRight = getSpacingValue(paddingX);
      }

      if (paddingY && paddingY in tailwindPaddingY) {
        classes.push(tailwindPaddingY[paddingY as SpacingToken]);
      } else if (paddingY) {
        css.paddingTop = getSpacingValue(paddingY);
        css.paddingBottom = getSpacingValue(paddingY);
      }

      if (gap && gap in tailwindGap) {
        classes.push(tailwindGap[gap as SpacingToken]);
      } else if (gap) {
        css.gap = getSpacingValue(gap);
      }

      if (maxWidth && maxWidth in tailwindMaxWidth) {
        classes.push(tailwindMaxWidth[maxWidth]);
      } else if (maxWidth) {
        css.maxWidth = maxWidth;
      }

      if (minHeight) {
        css.minHeight = minHeight;
      }

      // Container classes
      if (container === 'contained') {
        classes.push('mx-auto max-w-7xl px-4 sm:px-6 lg:px-8');
      } else if (container === 'narrow') {
        classes.push('mx-auto max-w-4xl px-4 sm:px-6 lg:px-8');
      } else if (container === 'narrower') {
        classes.push('mx-auto max-w-3xl px-4 sm:px-6 lg:px-8');
      } else if (container === 'full') {
        classes.push('w-full');
      }
    }

    // ── COLORS ──
    if (style.colors) {
      const { background, text, textMuted, accent, border, overlay } = style.colors;

      if (background) {
        css.backgroundColor = resolveColor(background);
        if (isColorToken(background)) {
          classes.push(`bg-${background}`);
        }
      }

      if (text) {
        css.color = resolveColor(text);
        if (isColorToken(text)) {
          classes.push(`text-${text}`);
        }
      }

      if (accent) {
        css.accentColor = resolveColor(accent);
      }

      if (border) {
        css.borderColor = resolveColor(border);
      }

      if (overlay) {
        // Overlay is handled separately in component
      }
    }

    // ── TYPOGRAPHY ──
    if (style.typography) {
      const { fontFamily, fontSize, titleSize, titleWeight, textAlign, textTransform } = style.typography;

      if (fontFamily === 'sans') {
        classes.push('font-sans');
      } else if (fontFamily === 'serif') {
        classes.push('font-serif');
      } else if (fontFamily === 'mono') {
        classes.push('font-mono');
      }

      if (titleSize && titleSize in tailwindTextSize) {
        classes.push(tailwindTextSize[titleSize]);
      }

      if (titleWeight && titleWeight in tailwindFontWeight) {
        classes.push(tailwindFontWeight[titleWeight]);
      }

      if (textAlign && textAlign in tailwindTextAlign) {
        classes.push(tailwindTextAlign[textAlign]);
      }

      if (textTransform === 'uppercase') {
        classes.push('uppercase');
      } else if (textTransform === 'lowercase') {
        classes.push('lowercase');
      } else if (textTransform === 'capitalize') {
        classes.push('capitalize');
      }
    }

    // ── BORDER ──
    if (style.border) {
      const { width, style: borderStyle, radius } = style.border;

      if (width === '0') classes.push('border-0');
      else if (width === '1') classes.push('border');
      else if (width === '2') classes.push('border-2');
      else if (width === '4') classes.push('border-4');
      else if (width === '8') classes.push('border-8');

      if (radius && radius in tailwindBorderRadius) {
        classes.push(tailwindBorderRadius[radius]);
      }

      if (borderStyle === 'solid') classes.push('border-solid');
      else if (borderStyle === 'dashed') classes.push('border-dashed');
      else if (borderStyle === 'dotted') classes.push('border-dotted');
    }

    // ── SHADOW ──
    if (style.shadow && style.shadow in tailwindShadow) {
      classes.push(tailwindShadow[style.shadow]);
    }

    // ── EFFECTS ──
    if (style.effects) {
      const { opacity, backdropBlur } = style.effects;

      if (opacity !== undefined) {
        css.opacity = opacity;
      }

      if (backdropBlur === 'sm') classes.push('backdrop-blur-sm');
      else if (backdropBlur === 'md') classes.push('backdrop-blur-md');
      else if (backdropBlur === 'lg') classes.push('backdrop-blur-lg');
      else if (backdropBlur === 'xl') classes.push('backdrop-blur-xl');
    }

    return {
      css,
      classes: classes.filter(Boolean).join(' '),
    };
  }, [style, globalTheme]);
}

// ─────────────────────────────────────────
// ANIMATION HOOK
// ─────────────────────────────────────────

export function useSectionAnimation(config?: BaseSectionConfig) {
  return useMemo(() => {
    if (!config?.animation || config.animation.entrance === 'none') {
      return {
        initial: {},
        animate: {},
        transition: {},
      };
    }

    const { entrance, duration = 'normal', stagger = false } = config.animation;

    const durationMap = {
      fast: 0.3,
      normal: 0.6,
      slow: 1.0,
    };

    const d = durationMap[duration] || 0.6;

    let initial = {};
    let animate = {};

    switch (entrance) {
      case 'fade-in':
        initial = { opacity: 0 };
        animate = { opacity: 1 };
        break;
      case 'slide-up':
        initial = { opacity: 0, y: 40 };
        animate = { opacity: 1, y: 0 };
        break;
      case 'slide-down':
        initial = { opacity: 0, y: -40 };
        animate = { opacity: 1, y: 0 };
        break;
      case 'slide-left':
        initial = { opacity: 0, x: 40 };
        animate = { opacity: 1, x: 0 };
        break;
      case 'slide-right':
        initial = { opacity: 0, x: -40 };
        animate = { opacity: 1, x: 0 };
        break;
      case 'scale-in':
        initial = { opacity: 0, scale: 0.9 };
        animate = { opacity: 1, scale: 1 };
        break;
      default:
        initial = {};
        animate = {};
    }

    return {
      initial,
      animate,
      transition: {
        duration: d,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: stagger ? 0.1 : 0,
      } as any,
    };
  }, [config?.animation]);
}

// ─────────────────────────────────────────
// CLASS MERGER UTILITY
// ─────────────────────────────────────────

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─────────────────────────────────────────
// BUILD CONTAINER CLASS
// ─────────────────────────────────────────

export function buildContainerClass(
  container?: 'full' | 'contained' | 'narrow' | 'narrower',
  customClasses?: string
): string {
  const baseClasses = ['w-full'];

  if (container === 'contained') {
    baseClasses.push('mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-12');
  } else if (container === 'narrow') {
    baseClasses.push('mx-auto max-w-4xl px-4 sm:px-6 lg:px-8');
  } else if (container === 'narrower') {
    baseClasses.push('mx-auto max-w-3xl px-4 sm:px-6 lg:px-8');
  }

  return cn(baseClasses, customClasses);
}
