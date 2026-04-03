'use client';

// ============================================
// HEADER MINIMAL — 100% Configurable Architecture
// ============================================

import { headerMinimalSchema } from "./HeaderMinimal.schema";
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingBag, Search, User } from 'lucide-react';
import { useNavigate } from '@/lib/router';
import {
  SectionWrapper,
  SectionContainer,
} from '@/components/SectionWrapper';
import { cn, useSectionStyles } from '@/hooks/useSectionStyles';
import type { HeaderLogo } from '@/types/section-config-types';

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────
export interface NavItem {
  label: string;
  href: string;
}

export interface HeaderMinimalContent {
  brand?: string;
  logo?: string | HeaderLogo;
  navItems?: NavItem[];
}

export interface HeaderMinimalConfig {
  showSearch?: boolean;
  showCart?: boolean;
  showAccount?: boolean;
  transparent?: boolean;
  sticky?: boolean;
  animation?: {
    entrance?: 'fade-in' | 'slide-down' | 'none';
  };
}

export interface HeaderMinimalStyle {
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

export interface HeaderMinimalClasses {
  root?: string;
  brand?: string;
  logo?: string;
  nav?: string;
  navItem?: string;
  actions?: string;
  mobileMenu?: string;
}

export interface HeaderMinimalProps {
  id?: string;
  testId?: string;
  content?: HeaderMinimalContent;
  config?: HeaderMinimalConfig;
  style?: HeaderMinimalStyle;
  classes?: HeaderMinimalClasses;
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

type ScrollContainer = Window | HTMLElement;

function getScrollContainer(node: HTMLElement | null): ScrollContainer {
  let current = node?.parentElement ?? null;

  while (current) {
    const { overflowY, overflow } = window.getComputedStyle(current);
    const isScrollable =
      /(auto|scroll|overlay)/.test(`${overflowY} ${overflow}`) &&
      current.scrollHeight > current.clientHeight;

    if (isScrollable) {
      return current;
    }

    current = current.parentElement;
  }

  return window;
}

function getScrollTop(container: ScrollContainer): number {
  return container === window ? window.scrollY : (container as HTMLElement).scrollTop;
}

// ─────────────────────────────────────────
// MAIN HEADER MINIMAL COMPONENT
// ─────────────────────────────────────────
export function HeaderMinimal({
  id,
  testId,
  content = {},
  config = {},
  style = {},
  classes = {},
}: HeaderMinimalProps) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const scrollThreshold = 24;
  const headerRef = useRef<HTMLElement | null>(null);
  const overlayOnHero = true;

  // ── EXTRACT CONTENT ──
  const {
    brand = 'Votre Boutique',
    logo,
    navItems = [
      { label: 'Accueil', href: '/' },
      { label: 'Produits', href: 'products' },
      { label: 'À propos', href: 'about' },
      { label: 'Contact', href: 'contact' },
    ],
  } = content;

  // ── EXTRACT CONFIG ──
  const {
    showSearch = true,
    showCart = true,
    showAccount = true,
    transparent = false,
    sticky = true,
    animation = { entrance: 'fade-in' },
  } = config;

  // ── EXTRACT STYLE ──
  const {
    colors: styleColors = {},
    spacing: styleSpacing = {},
  } = style;

  const {
    background: backgroundColor = 'white',
    text: textColor = 'primary',
    border: borderColor,
  } = styleColors;

  const {
    container = 'contained',
    paddingY = '4',
  } = styleSpacing;

  // ── HOOKS ──
  const { css } = useSectionStyles(style);

  useEffect(() => {
    const scrollContainer = getScrollContainer(headerRef.current);
    const initialScrollTop = getScrollTop(scrollContainer);
    const handleScroll = () => {
      setScrolled(getScrollTop(scrollContainer) - initialScrollTop > scrollThreshold);
    };

    handleScroll();
    scrollContainer.addEventListener('scroll', handleScroll, {
      passive: true,
    });
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [scrollThreshold]);

  useEffect(() => {
    const headerElement = headerRef.current;
    const overlayHost =
      (headerElement?.closest('[data-header-overlay-root="true"]') as HTMLElement | null) ??
      headerElement?.parentElement?.parentElement ??
      headerElement?.parentElement;

    if (!overlayHost) {
      return;
    }

    if (!headerElement) {
      overlayHost.style.setProperty('--header-overlay-offset', '0px');
      return;
    }

    const updateHeaderHeight = () => {
      overlayHost.style.setProperty(
        '--header-overlay-offset',
        `${headerElement.offsetHeight}px`
      );
    };

    updateHeaderHeight();

    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      updateHeaderHeight();
    });

    resizeObserver.observe(headerElement);

    return () => {
      resizeObserver.disconnect();
      overlayHost.style.setProperty('--header-overlay-offset', '0px');
    };
  }, []);

  // ── HELPERS ──
  const resolvedBgColor = resolveColor(backgroundColor, '#ffffff');
  const resolvedTextColor = resolveColor(textColor, '#1a1a1a');
  const resolvedBorderColor = borderColor ? resolveColor(borderColor, '#e5e5e5') : '#e5e5e5';
  const isOverlayMode = overlayOnHero && !scrolled;
  const normalizedLogo =
    typeof logo === 'string'
      ? { type: 'image' as const, image: logo }
      : logo;
  const logoText =
    (normalizedLogo && 'text' in normalizedLogo && normalizedLogo.text) || brand;

  const handleNavClick = (href: string) => {
    navigate(href.replace(/^\//, ''));
    setMobileMenuOpen(false);
  };

  // ── RENDER ──
  return (
    <SectionWrapper
      id={id}
      testId={testId}
      as="header"
      innerRef={headerRef}
      animation={animation}
      className={cn(
        'relative w-full z-50 transition-all duration-300',
        classes?.root
      )}
      style={{
        backgroundColor: isOverlayMode ? 'transparent' : resolvedBgColor,
        color: resolvedTextColor,
        borderBottom:
          scrolled
            ? `1px solid ${resolvedBorderColor}`
            : undefined,
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
        <div className="flex items-center justify-between">
          {/* Brand / Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <button
              onClick={() => handleNavClick('/')}
              className={cn('flex items-center gap-2', classes?.brand)}
            >
              {normalizedLogo?.type === 'image' && normalizedLogo.image ? (
                <img
                  src={normalizedLogo.image}
                  alt={logoText}
                  className={cn('h-8', classes?.logo)}
                />
              ) : normalizedLogo?.type === 'svg' && normalizedLogo.svg ? (
                <span className={cn('h-8 w-auto', classes?.logo)}>
                  {normalizedLogo.svg}
                </span>
              ) : normalizedLogo?.type === 'text' && normalizedLogo.text ? (
                <span className="text-xl font-bold" style={{ color: resolvedTextColor }}>
                  {normalizedLogo.text}
                </span>
              ) : (
                <span className="text-xl font-bold" style={{ color: resolvedTextColor }}>
                  {brand}
                </span>
              )}
            </button>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={cn('hidden md:flex items-center gap-8', classes?.nav)}
          >
            {navItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleNavClick(item.href)}
                className={cn(
                  'text-sm font-medium hover:opacity-70 transition-opacity',
                  classes?.navItem
                )}
                style={{ color: resolvedTextColor }}
              >
                {item.label}
              </button>
            ))}
          </motion.nav>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={cn('flex items-center gap-4', classes?.actions)}
          >
            {showSearch && (
              <button
                className="p-2 hover:opacity-70 transition-opacity"
                style={{ color: resolvedTextColor }}
              >
                <Search className="w-5 h-5" />
              </button>
            )}
            {showAccount && (
              <button
                onClick={() => handleNavClick('compte')}
                className="p-2 hover:opacity-70 transition-opacity"
                style={{ color: resolvedTextColor }}
              >
                <User className="w-5 h-5" />
              </button>
            )}
            {showCart && (
              <button
                onClick={() => handleNavClick('panier')}
                className="p-2 hover:opacity-70 transition-opacity relative"
                style={{ color: resolvedTextColor }}
              >
                <ShoppingBag className="w-5 h-5" />
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:opacity-70 transition-opacity"
              style={{ color: resolvedTextColor }}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </motion.div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className={cn('md:hidden mt-4 pb-4 border-t', classes?.mobileMenu)}
              style={{ borderColor: resolvedBorderColor }}
            >
              <nav className="flex flex-col gap-4 pt-4">
                {navItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleNavClick(item.href)}
                    className="text-left text-sm font-medium py-2 hover:opacity-70 transition-opacity"
                    style={{ color: resolvedTextColor }}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </SectionContainer>
    </SectionWrapper>
  );
}

Object.assign(HeaderMinimal, { schema: headerMinimalSchema });

export const schema = headerMinimalSchema;

export default HeaderMinimal;
