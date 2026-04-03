'use client';

// ============================================
// WISHLIST CONTENT — 100% Configurable Architecture
// ============================================

import { useNavigate } from '@/lib/router';
import { motion } from 'framer-motion';
import { useEcommerceStore } from '@/store/ecommerce-store';
import { useCart } from '@/store';
import { buildCartProduct } from '@/lib/cart-product';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  SectionWrapper,
  SectionContainer,
} from '@/components/SectionWrapper';
import { cn, useSectionStyles } from '@/hooks/useSectionStyles';
import { wishlistContentSchema } from "./WishlistContent.schema";

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────
export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  sellerId?: string;
  storeSlug?: string;
}

export interface WishlistContent {
  title?: string;
  emptyMessage?: string;
  emptyButtonLabel?: string;
  addToCartLabel?: string;
  removeLabel?: string;
  priceLabel?: string;
}

export interface WishlistConfig {
  variant?: 'grid' | 'list' | 'compact';
  columns?: 2 | 3 | 4;
  showEmptyState?: boolean;
  showRemoveButton?: boolean;
  showAddToCart?: boolean;
  enableAnimations?: boolean;
}

export interface WishlistStyle {
  colors?: {
    background?: string;
    text?: string;
    accent?: string;
    cardBg?: string;
    border?: string;
  };
  spacing?: {
    paddingY?: string;
    container?: 'full' | 'contained' | 'narrow';
    gap?: string;
  };
}

export interface WishlistClasses {
  root?: string;
  grid?: string;
  card?: string;
  image?: string;
  title?: string;
  price?: string;
  actions?: string;
  emptyState?: string;
}

export interface WishlistContentProps {
  id?: string;
  testId?: string;
  content?: WishlistContent;
  config?: WishlistConfig;
  style?: WishlistStyle;
  classes?: WishlistClasses;
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
// MAIN WISHLIST CONTENT COMPONENT
// ─────────────────────────────────────────
export function WishlistContent({
  id,
  testId,
  content = {},
  config = {},
  style = {},
  classes = {},
}: WishlistContentProps) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { wishlistItems, removeFromWishlist } = useEcommerceStore();

  // ── EXTRACT CONFIG ──
  const {
    variant = 'grid',
    columns = 4,
    showEmptyState = true,
    showRemoveButton = true,
    showAddToCart = true,
    enableAnimations = true,
  } = config;

  // ── EXTRACT CONTENT ──
  const {
    title = 'Mes Favoris',
    emptyMessage = 'Votre liste de favoris est vide. Ajoutez des produits pour les retrouver ici.',
    emptyButtonLabel = 'Découvrir les produits',
    addToCartLabel = 'Ajouter au panier',
    removeLabel = 'Retirer',
  } = content;

  // ── EXTRACT STYLE ──
  const {
    colors: styleColors = {},
    spacing: styleSpacing = {},
  } = style;

  const {
    background: backgroundColor = 'white',
    text: textColor = 'primary',
    accent: accentColor = 'accent',
    cardBg: cardBgColor = 'white',
    border: borderColor,
  } = styleColors;

  const {
    container = 'contained',
    paddingY = '16',
    gap = '6',
  } = styleSpacing;

  // ── HOOKS ──
  const { css } = useSectionStyles(style);

  // ── HELPERS ──
  const resolvedBgColor = resolveColor(backgroundColor, '#ffffff');
  const resolvedTextColor = resolveColor(textColor, '#1a1a1a');
  const resolvedAccentColor = resolveColor(accentColor, '#c9a96e');
  const resolvedCardBgColor = resolveColor(cardBgColor, '#ffffff');
  const resolvedBorderColor = borderColor ? resolveColor(borderColor, '#e5e5e5') : '#e5e5e5';

  const resolvedGap = `${parseInt(gap) * 0.25}rem`;

  // ── HANDLERS ──
  const handleAddToCart = (product: WishlistItem) => {
    addToCart(
      buildCartProduct({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category || '',
        images: [product.image],
        sellerId: product.sellerId,
        storeSlug: product.storeSlug,
      }),
      1
    );
    toast.success(`${product.name} ajouté au panier`);
  };

  const handleRemove = (productId: string) => {
    removeFromWishlist(productId);
    toast.success('Article retiré des favoris');
  };

  const getGridCols = () => {
    const colMap: Record<number, string> = {
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    };
    return colMap[columns] || colMap[4];
  };

  // ── RENDER ──
  return (
    <SectionWrapper
      id={id}
      testId={testId}
      as="section"
      className={cn('min-h-screen', classes?.root)}
      style={{
        backgroundColor: resolvedBgColor,
        paddingTop: `${parseInt(paddingY) * 0.25}rem`,
        paddingBottom: `${parseInt(paddingY) * 0.25}rem`,
        ...css,
      }}
    >
      <SectionContainer size={container}>
        {/* Header */}
        <motion.h1
          initial={enableAnimations ? { opacity: 0, y: -10 } : undefined}
          animate={enableAnimations ? { opacity: 1, y: 0 } : undefined}
          className="mb-8 text-3xl font-bold"
          style={{ color: resolvedTextColor }}
        >
          {title}
        </motion.h1>

        {/* Empty State */}
        {wishlistItems.length === 0 ? (
          <motion.div
            initial={enableAnimations ? { opacity: 0 } : undefined}
            animate={enableAnimations ? { opacity: 1 } : undefined}
            className={cn('py-12 text-center', classes?.emptyState)}
          >
            <div
              className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full"
              style={{ backgroundColor: `${resolvedTextColor}10` }}
            >
              <Heart className="h-12 w-12" style={{ color: `${resolvedTextColor}40` }} />
            </div>
            <p className="mb-6" style={{ color: `${resolvedTextColor}80` }}>
              {emptyMessage}
            </p>
            {showEmptyState && (
              <Button
                onClick={() => navigate('products')}
                style={{ backgroundColor: resolvedAccentColor }}
                className="transition-all hover:opacity-90"
              >
                {emptyButtonLabel}
              </Button>
            )}
          </motion.div>
        ) : (
          /* Product Grid */
          <div
            className={cn('grid', getGridCols(), classes?.grid)}
            style={{ gap: resolvedGap }}
          >
            {wishlistItems.map((product, index) => (
              <motion.div
                key={product.id}
                initial={enableAnimations ? { opacity: 0, y: 20 } : undefined}
                animate={enableAnimations ? { opacity: 1, y: 0 } : undefined}
                transition={enableAnimations ? { delay: index * 0.05 } : undefined}
                className={cn(
                  'group overflow-hidden rounded-lg shadow-sm transition-all hover:shadow-md',
                  classes?.card
                )}
                style={{ backgroundColor: resolvedCardBgColor }}
              >
                {/* Image */}
                <div className={cn('relative overflow-hidden', classes?.image)}>
                  <div className="aspect-[4/5]">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full cursor-pointer object-cover transition-transform duration-300 group-hover:scale-105"
                      onClick={() => navigate('product', { id: product.id })}
                    />
                  </div>

                  {/* Remove Button */}
                  {showRemoveButton && (
                    <button
                      onClick={() => handleRemove(product.id)}
                      className="absolute right-2 top-2 rounded-full bg-white p-2 shadow-md transition-all hover:bg-red-50"
                      title={removeLabel}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3
                    className={cn('mb-1 text-lg font-semibold', classes?.title)}
                    style={{ color: resolvedTextColor }}
                  >
                    {product.name}
                  </h3>
                  <p
                    className={cn('font-bold', classes?.price)}
                    style={{ color: resolvedAccentColor }}
                  >
                    {product.price.toFixed(2)} EUR
                  </p>

                  {/* Actions */}
                  {showAddToCart && (
                    <Button
                      className={cn('mt-3 w-full', classes?.actions)}
                      variant="outline"
                      onClick={() => handleAddToCart(product)}
                      style={{ borderColor: resolvedBorderColor }}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {addToCartLabel}
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </SectionContainer>
    </SectionWrapper>
  );
}

export default WishlistContent;

Object.assign(WishlistContent, { schema: wishlistContentSchema });

export const schema = wishlistContentSchema;
