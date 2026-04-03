'use client';

// ============================================
// BREADCRUMB — 100% Configurable Architecture
// ============================================

import { Home, ChevronRight, Slash, ChevronLeft } from 'lucide-react';
import { breadcrumbSchema } from "./Breadcrumb.schema";
import { motion } from 'framer-motion';
import { useNavigate } from '@/lib/router';
import {
  SectionWrapper,
  SectionContainer,
} from '@/components/SectionWrapper';
import { cn, useSectionStyles } from '@/hooks/useSectionStyles';

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────
export interface BreadcrumbItem {
  label: string;
  link?: string;
  icon?: string;
}

export interface BreadcrumbContent {
  homeLabel?: string;
  separator?: 'chevron' | 'slash' | 'arrow';
  backLabel?: string;
  showHomeIcon?: boolean;
}

export interface BreadcrumbConfig {
  variant?: 'default' | 'minimal' | 'with-back';
  showHome?: boolean;
  clickable?: boolean;
  maxItems?: number;
}

export interface BreadcrumbStyle {
  colors?: {
    background?: string;
    text?: string;
    accent?: string;
    separator?: string;
  };
  spacing?: {
    paddingY?: string;
    container?: 'full' | 'contained' | 'narrow';
  };
}

export interface BreadcrumbClasses {
  root?: string;
  list?: string;
  item?: string;
  link?: string;
  separator?: string;
  current?: string;
}

export interface BreadcrumbProps {
  id?: string;
  testId?: string;
  items: BreadcrumbItem[];
  content?: BreadcrumbContent;
  config?: BreadcrumbConfig;
  style?: BreadcrumbStyle;
  classes?: BreadcrumbClasses;
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

// ─────────────────────────────────────────
// SEPARATOR COMPONENT
// ─────────────────────────────────────────
function Separator({ type, color }: { type: string; color: string }) {
  switch (type) {
    case 'slash':
      return <Slash className="h-4 w-4" style={{ color }} />;
    case 'arrow':
      return <ChevronRight className="h-4 w-4 rotate-180" style={{ color }} />;
    case 'chevron':
    default:
      return <ChevronRight className="h-4 w-4" style={{ color }} />;
  }
}

// ─────────────────────────────────────────
// MAIN BREADCRUMB COMPONENT
// ─────────────────────────────────────────
export function Breadcrumb({
  id,
  testId,
  items,
  content = {},
  config = {},
  style = {},
  classes = {},
}: BreadcrumbProps) {
  const navigate = useNavigate();

  // ── EXTRACT CONFIG ──
  const {
    variant = 'default',
    showHome = true,
    clickable = true,
    maxItems = 5,
  } = config;

  // ── EXTRACT CONTENT ──
  const {
    homeLabel = 'Accueil',
    separator: separatorType = 'chevron',
    backLabel = 'Retour',
    showHomeIcon = true,
  } = content;

  // ── EXTRACT STYLE ──
  const {
    colors: styleColors = {},
    spacing: styleSpacing = {},
  } = style;

  const {
    background: backgroundColor = 'transparent',
    text: textColor = 'muted',
    accent: accentColor = 'accent',
    separator: separatorColor,
  } = styleColors;

  const {
    container = 'contained',
    paddingY = '4',
  } = styleSpacing;

  // ── HOOKS ──
  const { css } = useSectionStyles(style);

  // ── HELPERS ──
  const resolvedBgColor = resolveColor(backgroundColor, 'transparent');
  const resolvedTextColor = resolveColor(textColor, '#6b7280');
  const resolvedAccentColor = resolveColor(accentColor, '#c9a96e');
  const resolvedSeparatorColor = separatorColor ? resolveColor(separatorColor, `${resolvedTextColor}40`) : `${resolvedTextColor}40`;

  // Build items list
  const allItems = showHome
    ? [{ label: homeLabel, link: '/', icon: 'home' }, ...items]
    : items;

  // Limit items if needed
  const displayItems = maxItems && allItems.length > maxItems
    ? [
        allItems[0],
        { label: '...', link: undefined },
        ...allItems.slice(allItems.length - maxItems + 2),
      ]
    : allItems;

  // Handle navigation
  const handleClick = (link?: string) => {
    if (!clickable || !link) return;
    if (link.startsWith('http')) {
      window.open(link, '_self');
    } else {
      navigate(link.replace(/^\//, ''));
    }
  };

  // Handle back navigation
  const handleBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  // ── RENDER ──
  return (
    <SectionWrapper
      id={id}
      testId={testId}
      as="nav"
      aria-label="Breadcrumb"
      className={cn('w-full', classes?.root)}
      style={{
        backgroundColor: resolvedBgColor,
        paddingTop: `${parseInt(paddingY) * 0.25}rem`,
        paddingBottom: `${parseInt(paddingY) * 0.25}rem`,
        ...css,
      }}
    >
      <SectionContainer size={container}>
        {/* With Back Button Variant */}
        {variant === 'with-back' && (
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100"
              style={{ color: resolvedTextColor }}
            >
              <ChevronLeft className="h-4 w-4" />
              {backLabel}
            </button>
            <div
              className="h-6 w-px"
              style={{ backgroundColor: resolvedSeparatorColor }}
            />
            <BreadcrumbList
              items={displayItems}
              separatorType={separatorType}
              textColor={resolvedTextColor}
              accentColor={resolvedAccentColor}
              separatorColor={resolvedSeparatorColor}
              showHomeIcon={showHomeIcon}
              clickable={clickable}
              onItemClick={handleClick}
              classes={classes}
            />
          </div>
        )}

        {/* Default/Minimal Variants */}
        {variant !== 'with-back' && (
          <BreadcrumbList
            items={displayItems}
            separatorType={separatorType}
            textColor={resolvedTextColor}
            accentColor={resolvedAccentColor}
            separatorColor={resolvedSeparatorColor}
            showHomeIcon={showHomeIcon}
            clickable={clickable}
            onItemClick={handleClick}
            classes={classes}
          />
        )}
      </SectionContainer>
    </SectionWrapper>
  );
}

// ─────────────────────────────────────────
// BREADCRUMB LIST COMPONENT
// ─────────────────────────────────────────
function BreadcrumbList({
  items,
  separatorType,
  textColor,
  accentColor,
  separatorColor,
  showHomeIcon,
  clickable,
  onItemClick,
  classes,
}: {
  items: BreadcrumbItem[];
  separatorType: string;
  textColor: string;
  accentColor: string;
  separatorColor: string;
  showHomeIcon: boolean;
  clickable: boolean;
  onItemClick: (link?: string) => void;
  classes?: BreadcrumbClasses;
}) {
  return (
    <motion.ol
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex items-center flex-wrap gap-1',
        classes?.list
      )}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const hasLink = clickable && item.link && !isLast && item.label !== '...';

        return (
          <li key={index} className={cn('flex items-center', classes?.item)}>
            {/* Separator (not for first item) */}
            {index > 0 && (
              <span className={cn('mx-2', classes?.separator)}>
                <Separator type={separatorType} color={separatorColor} />
              </span>
            )}

            {/* Item Content */}
            {hasLink ? (
              <button
                type="button"
                onClick={() => onItemClick(item.link)}
                className={cn(
                  'text-sm transition-colors hover:opacity-70 flex items-center gap-1',
                  classes?.link
                )}
                style={{ color: `${textColor}99` }}
              >
                {index === 0 && showHomeIcon && item.icon === 'home' && (
                  <Home className="h-4 w-4" />
                )}
                {item.label}
              </button>
            ) : (
              <span
                className={cn(
                  'text-sm flex items-center gap-1',
                  isLast ? ['font-medium', classes?.current] : '',
                  index === 0 && showHomeIcon && item.icon === 'home' ? classes?.link : ''
                )}
                style={{
                  color: isLast ? accentColor : textColor,
                }}
                aria-current={isLast ? 'page' : undefined}
              >
                {index === 0 && showHomeIcon && item.icon === 'home' && (
                  <Home className="h-4 w-4" />
                )}
                {item.label}
              </span>
            )}
          </li>
        );
      })}
    </motion.ol>
  );
}

Object.assign(Breadcrumb, { schema: breadcrumbSchema });

export const schema = breadcrumbSchema;

export default Breadcrumb;
