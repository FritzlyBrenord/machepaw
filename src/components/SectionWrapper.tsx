// ============================================
// SECTION WRAPPER COMPONENT
// ============================================
// Wrapper commun à toutes les sections pour :
// - Animation d'entrée (Intersection Observer)
// - ID pour ancres
// - Classes root personnalisées
// - Background et spacing globaux
// ============================================

'use client';

import { forwardRef, type ReactNode, type CSSProperties, type Ref } from 'react';
import { motion } from 'framer-motion';
import { cn, useSectionAnimation } from '@/hooks/useSectionStyles';
import type { BaseSectionConfig } from '@/types/section-config-types';

// ─────────────────────────────────────────
// PROPS INTERFACE
// ─────────────────────────────────────────

export interface SectionWrapperProps {
  /** ID unique pour ancres/scroll */
  id?: string;
  /** Contenu de la section */
  children: ReactNode;
  /** Configuration d'animation */
  animation?: BaseSectionConfig['animation'];
  /** Classes CSS personnalisées */
  className?: string;
  /** Styles CSS inline */
  style?: CSSProperties;
  /** Élément HTML à renderer (défaut: 'section') */
  as?: 'section' | 'div' | 'header' | 'footer' | 'article' | 'aside' | 'nav';
  /** Référence pour mesure/animation */
  innerRef?: Ref<HTMLElement>;
  /** Test ID pour e2e tests */
  testId?: string;
  /** Aria label pour accessibilité */
  ariaLabel?: string;
}

// ─────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────

export const SectionWrapper = forwardRef<HTMLElement, SectionWrapperProps>(
  function SectionWrapper(
    {
      id,
      children,
      animation,
      className,
      style,
      as: Component = 'section',
      innerRef,
      testId,
      ariaLabel,
    },
    ref
  ) {
    const { initial, animate, transition } = useSectionAnimation({ animation });
    const resolvedRef = (ref || innerRef) as Ref<HTMLElement>;

    const hasAnimation = animation && animation.entrance && animation.entrance !== 'none';

    // Common wrapper classes
    const wrapperClasses = cn(
      'relative w-full',
      // Responsive overflow handling
      'overflow-x-hidden',
      className
    );

    // If animation is enabled, use motion component
    if (hasAnimation) {
      const MotionComponent = motion[Component as keyof typeof motion] as typeof motion.div;

      return (
        <MotionComponent
          ref={resolvedRef as any}
          id={id}
          data-testid={testId}
          aria-label={ariaLabel}
          className={wrapperClasses}
          style={style}
          initial={initial}
          whileInView={animate}
          viewport={{ once: true, margin: '-100px' }}
          transition={transition as any}
        >
          {children}
        </MotionComponent>
      );
    }

    // Without animation, use regular component
    return (
      <Component
        ref={resolvedRef as any}
        id={id}
        data-testid={testId}
        aria-label={ariaLabel}
        className={wrapperClasses}
        style={style}
      >
        {children}
      </Component>
    );
  }
);

// ─────────────────────────────────────────
// SECTION CONTAINER COMPONENT
// ─────────────────────────────────────────
// Container interne avec largeur max et padding

export interface SectionContainerProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  size?: 'full' | 'contained' | 'narrow' | 'narrower';
  centered?: boolean;
}

export function SectionContainer({
  children,
  className,
  style,
  size = 'contained',
  centered = true,
}: SectionContainerProps) {
  const sizeClasses = {
    full: 'w-full px-4 sm:px-6 lg:px-8',
    contained: 'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12',
    narrow: 'w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8',
    narrower: 'w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8',
  };

  return (
    <div
      className={cn(
        sizeClasses[size],
        centered && 'mx-auto',
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────
// SECTION OVERLAY COMPONENT
// ─────────────────────────────────────────
// Overlay configurable pour backgrounds

export interface SectionOverlayProps {
  type?: 'solid' | 'gradient' | 'blur' | 'noise' | 'vignette';
  opacity?: number;
  color?: string;
  gradientDirection?: 'to-t' | 'to-b' | 'to-l' | 'to-r' | 'to-tl' | 'to-tr' | 'to-bl' | 'to-br';
  className?: string;
  zIndex?: number;
}

export function SectionOverlay({
  type = 'solid',
  opacity = 0.5,
  color = '#000000',
  gradientDirection = 'to-b',
  className,
  zIndex = 1,
}: SectionOverlayProps) {
  const directionMap = {
    'to-t': 'to top',
    'to-b': 'to bottom',
    'to-l': 'to left',
    'to-r': 'to right',
    'to-tl': 'to top left',
    'to-tr': 'to top right',
    'to-bl': 'to bottom left',
    'to-br': 'to bottom right',
  };

  let background: string;

  switch (type) {
    case 'gradient':
      background = `linear-gradient(${directionMap[gradientDirection]}, ${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}, transparent)`;
      break;
    case 'vignette':
      background = `radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, ${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')} 100%)`;
      break;
    case 'noise':
      background = 'none'; // Handled by separate noise component
      break;
    case 'blur':
      background = 'transparent';
      break;
    default:
      background = `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
  }

  return (
    <div
      className={cn(
        'absolute inset-0 pointer-events-none',
        type === 'blur' && 'backdrop-blur-md',
        className
      )}
      style={{
        background,
        zIndex,
      }}
    />
  );
}

// ─────────────────────────────────────────
// NOISE TEXTURE COMPONENT
// ─────────────────────────────────────────
// Texture de bruit pour backgrounds luxe

export function NoiseTexture({ opacity = 0.03 }: { opacity?: number }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-[1]"
      style={{
        opacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
        backgroundSize: '200px 200px',
      }}
    />
  );
}

// ─────────────────────────────────────────
// CORNER ACCENTS COMPONENT
// ─────────────────────────────────────────
// Lignes décoratives dans les coins

export function CornerAccents({
  color = '#c9a96e',
  size = 40,
  opacity = 0.3,
  className,
}: {
  color?: string;
  size?: number;
  opacity?: number;
  className?: string;
}) {
  return (
    <div className={cn('absolute inset-0 pointer-events-none z-10 hidden md:block', className)}>
      {/* Top Left */}
      <div
        className="absolute top-6 left-6"
        style={{
          width: size,
          height: size,
          borderLeft: `1px solid ${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
          borderTop: `1px solid ${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
        }}
      />
      {/* Top Right */}
      <div
        className="absolute top-6 right-6"
        style={{
          width: size,
          height: size,
          borderRight: `1px solid ${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
          borderTop: `1px solid ${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
        }}
      />
      {/* Bottom Left */}
      <div
        className="absolute bottom-16 left-6"
        style={{
          width: size,
          height: size,
          borderLeft: `1px solid ${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
          borderBottom: `1px solid ${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
        }}
      />
      {/* Bottom Right */}
      <div
        className="absolute bottom-16 right-6"
        style={{
          width: size,
          height: size,
          borderRight: `1px solid ${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
          borderBottom: `1px solid ${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────
// SCROLL INDICATOR COMPONENT
// ─────────────────────────────────────────

export function ScrollIndicator({
  text = 'Défiler',
  color = '#ffffff',
  className,
}: {
  text?: string;
  color?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20',
        className
      )}
    >
      <span
        className="text-[10px] tracking-[0.3em] uppercase font-light"
        style={{ color: `${color}60` }}
      >
        {text}
      </span>
      <div
        className="w-px h-10 relative overflow-hidden"
        style={{ backgroundColor: `${color}20` }}
      >
        <div
          className="absolute top-0 left-0 w-full animate-scroll-indicator"
          style={{ backgroundColor: color, height: '50%' }}
        />
      </div>
    </div>
  );
}

export default SectionWrapper;
