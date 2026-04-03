'use client';

// ============================================
// ORDER CONFIRMATION CONTENT — 100% Configurable Architecture
// ============================================

import { useNavigate, useParams } from '@/lib/router';
import { motion } from 'framer-motion';
import { useEcommerceStore } from '@/store/ecommerce-store';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  Package,
  Truck,
  Home,
  ShoppingBag,
  Calendar,
  Receipt,
  CreditCard,
} from 'lucide-react';
import { useBoutiqueClientOrderQuery } from '@/hooks/useBoutiqueClient';
import type { Order } from '@/data/types';
import type { Order as LegacyOrder } from '@/types/ecommerce-types';
import {
  SectionWrapper,
  SectionContainer,
} from '@/components/SectionWrapper';
import { cn, useSectionStyles } from '@/hooks/useSectionStyles';
import { orderConfirmationContentSchema } from "./OrderConfirmationContent.schema";

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────
export interface OrderConfirmationContent {
  title?: string;
  subtitle?: string;
  orderNumberLabel?: string;
  dateLabel?: string;
  totalLabel?: string;
  itemsLabel?: string;
  trackingTitle?: string;
  receivedStatus?: string;
  processingStatus?: string;
  shippedStatus?: string;
  deliveredStatus?: string;
  homeButtonLabel?: string;
  continueShoppingLabel?: string;
  loadingMessage?: string;
  notFoundMessage?: string;
}

export interface OrderConfirmationConfig {
  variant?: 'default' | 'minimal' | 'detailed';
  showOrderDetails?: boolean;
  showTracking?: boolean;
  showItemsList?: boolean;
  enableAnimations?: boolean;
}

export interface OrderConfirmationStyle {
  colors?: {
    background?: string;
    text?: string;
    accent?: string;
    cardBg?: string;
    border?: string;
    success?: string;
  };
  spacing?: {
    paddingY?: string;
    container?: 'full' | 'contained' | 'narrow';
  };
}

export interface OrderConfirmationClasses {
  root?: string;
  successIcon?: string;
  title?: string;
  card?: string;
  tracking?: string;
  actions?: string;
}

export interface OrderConfirmationContentProps {
  id?: string;
  testId?: string;
  content?: OrderConfirmationContent;
  config?: OrderConfirmationConfig;
  style?: OrderConfirmationStyle;
  classes?: OrderConfirmationClasses;
  orderData?: Order | null;
  isLoading?: boolean;
  storefrontStore?: { storeSlug?: string };
}

interface NormalizedOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    amount: number;
  }>;
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
    success: '#22c55e',
  };
  return colorMap[color] || color;
}

function normalizeOrderForDisplay(
  orderData?: Order | null,
  fallbackOrder?: LegacyOrder | null
): NormalizedOrder | null {
  if (orderData) {
    return {
      id: orderData.id,
      orderNumber: orderData.orderNumber || `#${orderData.id.slice(-8).toUpperCase()}`,
      createdAt: orderData.createdAt,
      total: orderData.total,
      items: orderData.items.map((item) => ({
        name: item.product?.name || 'Produit',
        quantity: item.quantity || 0,
        amount: typeof item.total === 'number' ? item.total : (item.price || 0) * (item.quantity || 0),
      })),
    };
  }

  if (fallbackOrder) {
    return {
      id: fallbackOrder.id,
      orderNumber: `#${fallbackOrder.id.slice(-8).toUpperCase()}`,
      createdAt: fallbackOrder.date,
      total: fallbackOrder.total,
      items: fallbackOrder.items.map((item) => ({
        name: item.name || 'Produit',
        quantity: item.quantity || 0,
        amount: (item.price || 0) * (item.quantity || 0),
      })),
    };
  }

  return null;
}

// ─────────────────────────────────────────
// TRACKING STEPS COMPONENT
// ─────────────────────────────────────────
function TrackingSteps({
  accentColor,
  textColor,
  content,
}: {
  accentColor: string;
  textColor: string;
  content: OrderConfirmationContent;
}) {
  const {
    receivedStatus = 'Commande reçue',
    processingStatus = 'En préparation',
    shippedStatus = 'Expédiée',
    deliveredStatus = 'Livrée',
  } = content;

  const steps = [
    { icon: CheckCircle, label: receivedStatus, active: true },
    { icon: Package, label: processingStatus, active: false },
    { icon: Truck, label: shippedStatus, active: false },
    { icon: Home, label: deliveredStatus, active: false },
  ];

  return (
    <div className="flex items-center justify-center gap-4 sm:gap-8">
      {steps.map((step, index) => (
        <div key={step.label} className="text-center">
          <div
            className={cn(
              'mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full sm:h-12 sm:w-12',
              step.active ? '' : 'bg-gray-200'
            )}
            style={{
              backgroundColor: step.active ? accentColor : undefined,
            }}
          >
            <step.icon
              className={cn('h-5 w-5 sm:h-6 sm:w-6', step.active ? 'text-white' : '')}
              style={{ color: step.active ? undefined : `${textColor}60` }}
            />
          </div>
          <p
            className="text-xs font-medium sm:text-sm"
            style={{ color: step.active ? textColor : `${textColor}60` }}
          >
            {step.label}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────
// MAIN ORDER CONFIRMATION CONTENT COMPONENT
// ─────────────────────────────────────────
export function OrderConfirmationContent({
  id,
  testId,
  content = {},
  config = {},
  style = {},
  classes = {},
  orderData,
  isLoading = false,
  storefrontStore,
}: OrderConfirmationContentProps) {
  const navigate = useNavigate();
  const params = useParams();
  const { getOrderById } = useEcommerceStore();

  // ── EXTRACT CONTENT ──
  const {
    title = 'Commande confirmée !',
    subtitle = 'Merci pour votre achat. Un email de confirmation a été envoyé.',
    orderNumberLabel = 'Numéro de commande',
    dateLabel = 'Date',
    totalLabel = 'Total',
    itemsLabel = 'Articles commandés',
    trackingTitle = 'Suivi de commande',
    homeButtonLabel = "Retour à l'accueil",
    continueShoppingLabel = 'Continuer les achats',
    loadingMessage = 'Chargement de la commande...',
    notFoundMessage = 'Commande introuvable',
  } = content;

  // ── EXTRACT CONFIG ──
  const {
    variant = 'default',
    showOrderDetails = true,
    showTracking = true,
    showItemsList = true,
    enableAnimations = true,
  } = config;

  // ── EXTRACT STYLE ──
  const {
    colors: styleColors = {},
    spacing: styleSpacing = {},
  } = style;

  const {
    background: backgroundColor = 'white',
    text: textColor = 'primary',
    accent: accentColor = 'accent',
    cardBg: cardBgColor = 'secondary',
    border: borderColor,
    success: successColor = 'success',
  } = styleColors;

  const {
    container = 'narrow',
    paddingY = '16',
  } = styleSpacing;

  // ── HOOKS ──
  const { css } = useSectionStyles(style);

  // ── HELPERS ──
  const resolvedBgColor = resolveColor(backgroundColor, '#ffffff');
  const resolvedTextColor = resolveColor(textColor, '#1a1a1a');
  const resolvedAccentColor = resolveColor(accentColor, '#c9a96e');
  const resolvedCardBgColor = resolveColor(cardBgColor, '#f9fafb');
  const resolvedBorderColor = borderColor ? resolveColor(borderColor, '#e5e5e5') : '#e5e5e5';
  const resolvedSuccessColor = resolveColor(successColor, '#22c55e');

  // ── DATA FETCHING ──
  const boutiqueOrderQuery = useBoutiqueClientOrderQuery(
    storefrontStore?.storeSlug || '',
    params.id || '',
    Boolean(storefrontStore?.storeSlug && params.id && !orderData)
  );
  const fallbackOrder = params.id ? getOrderById(params.id) : null;
  const order = normalizeOrderForDisplay(
    orderData || boutiqueOrderQuery.data || null,
    fallbackOrder
  );

  // ── LOADING STATE ──
  if (isLoading || boutiqueOrderQuery.isLoading) {
    return (
      <SectionWrapper
        id={id}
        testId={testId}
        as="section"
        className={cn('min-h-[60vh]', classes?.root)}
        style={{
          backgroundColor: resolvedBgColor,
          paddingTop: `${parseInt(paddingY) * 0.25}rem`,
          paddingBottom: `${parseInt(paddingY) * 0.25}rem`,
          ...css,
        }}
      >
        <SectionContainer size={container}>
          <div className="py-20 text-center">
            <motion.div
              initial={enableAnimations ? { opacity: 0 } : undefined}
              animate={enableAnimations ? { opacity: 1 } : undefined}
            >
              <div
                className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4"
                style={{ borderColor: resolvedBorderColor, borderTopColor: resolvedAccentColor }}
              />
              <h1 className="text-xl font-bold" style={{ color: resolvedTextColor }}>
                {loadingMessage}
              </h1>
            </motion.div>
          </div>
        </SectionContainer>
      </SectionWrapper>
    );
  }

  // ── NOT FOUND STATE ──
  if (!order && params.id) {
    return (
      <SectionWrapper
        id={id}
        testId={testId}
        as="section"
        className={cn('min-h-[60vh]', classes?.root)}
        style={{
          backgroundColor: resolvedBgColor,
          paddingTop: `${parseInt(paddingY) * 0.25}rem`,
          paddingBottom: `${parseInt(paddingY) * 0.25}rem`,
          ...css,
        }}
      >
        <SectionContainer size={container}>
          <div className="py-20 text-center">
            <motion.div
              initial={enableAnimations ? { opacity: 0 } : undefined}
              animate={enableAnimations ? { opacity: 1 } : undefined}
            >
              <h1 className="mb-4 text-2xl font-bold" style={{ color: resolvedTextColor }}>
                {notFoundMessage}
              </h1>
              <Button
                onClick={() => navigate('home')}
                style={{ backgroundColor: resolvedAccentColor }}
              >
                {homeButtonLabel}
              </Button>
            </motion.div>
          </div>
        </SectionContainer>
      </SectionWrapper>
    );
  }

  // ── MAIN CONTENT ──
  return (
    <SectionWrapper
      id={id}
      testId={testId}
      as="section"
      className={cn('min-h-[60vh]', classes?.root)}
      style={{
        backgroundColor: resolvedBgColor,
        paddingTop: `${parseInt(paddingY) * 0.25}rem`,
        paddingBottom: `${parseInt(paddingY) * 0.25}rem`,
        ...css,
      }}
    >
      <SectionContainer size={container}>
        <motion.div
          initial={enableAnimations ? { opacity: 0, y: 20 } : undefined}
          animate={enableAnimations ? { opacity: 1, y: 0 } : undefined}
          className="py-10 text-center"
        >
          {/* Success Icon */}
          <div
            className={cn(
              'mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full sm:h-24 sm:w-24',
              classes?.successIcon
            )}
            style={{ backgroundColor: `${resolvedSuccessColor}20` }}
          >
            <CheckCircle
              className="h-10 w-10 sm:h-12 sm:w-12"
              style={{ color: resolvedSuccessColor }}
            />
          </div>

          {/* Title & Subtitle */}
          <h1
            className={cn('mb-2 text-2xl font-bold sm:text-3xl', classes?.title)}
            style={{ color: resolvedTextColor }}
          >
            {title}
          </h1>
          <p className="mb-8" style={{ color: `${resolvedTextColor}80` }}>
            {subtitle}
          </p>

          {/* Order Details Card */}
          {showOrderDetails && order && (
            <motion.div
              initial={enableAnimations ? { opacity: 0, y: 10 } : undefined}
              animate={enableAnimations ? { opacity: 1, y: 0 } : undefined}
              transition={{ delay: 0.1 }}
              className={cn(
                'mb-6 rounded-xl border p-6 text-left',
                classes?.card
              )}
              style={{
                backgroundColor: resolvedCardBgColor,
                borderColor: resolvedBorderColor,
              }}
            >
              {/* Order Info Grid */}
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <div className="mb-1 flex items-center gap-2 text-sm" style={{ color: `${resolvedTextColor}60` }}>
                    <Receipt className="h-4 w-4" />
                    {orderNumberLabel}
                  </div>
                  <p className="text-lg font-bold" style={{ color: resolvedTextColor }}>
                    {order.orderNumber}
                  </p>
                </div>
                <div>
                  <div className="mb-1 flex items-center gap-2 text-sm" style={{ color: `${resolvedTextColor}60` }}>
                    <Calendar className="h-4 w-4" />
                    {dateLabel}
                  </div>
                  <p className="font-medium" style={{ color: resolvedTextColor }}>
                    {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <div className="mb-1 flex items-center gap-2 text-sm" style={{ color: `${resolvedTextColor}60` }}>
                    <CreditCard className="h-4 w-4" />
                    {totalLabel}
                  </div>
                  <p className="text-lg font-bold" style={{ color: resolvedAccentColor }}>
                    {order.total.toFixed(2)} EUR
                  </p>
                </div>
              </div>

              {/* Items List */}
              {showItemsList && (
                <>
                  <div
                    className="mb-4 border-t pt-4"
                    style={{ borderColor: resolvedBorderColor }}
                  >
                    <p className="mb-3 font-semibold" style={{ color: resolvedTextColor }}>
                      {itemsLabel}
                    </p>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between py-2"
                        >
                          <span style={{ color: resolvedTextColor }}>
                            {item.name}{' '}
                            <span style={{ color: `${resolvedTextColor}60` }}>
                              x{item.quantity}
                            </span>
                          </span>
                          <span className="font-semibold" style={{ color: resolvedTextColor }}>
                            {item.amount.toFixed(2)} EUR
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Tracking Timeline */}
          {showTracking && (
            <motion.div
              initial={enableAnimations ? { opacity: 0, y: 10 } : undefined}
              animate={enableAnimations ? { opacity: 1, y: 0 } : undefined}
              transition={{ delay: 0.2 }}
              className={cn(
                'mb-6 rounded-xl border p-6',
                classes?.tracking
              )}
              style={{
                backgroundColor: resolvedCardBgColor,
                borderColor: resolvedBorderColor,
              }}
            >
              <p className="mb-4 font-semibold" style={{ color: resolvedTextColor }}>
                {trackingTitle}
              </p>
              <TrackingSteps
                accentColor={resolvedAccentColor}
                textColor={resolvedTextColor}
                content={content}
              />
            </motion.div>
          )}

          {/* Actions */}
          <motion.div
            initial={enableAnimations ? { opacity: 0, y: 10 } : undefined}
            animate={enableAnimations ? { opacity: 1, y: 0 } : undefined}
            transition={{ delay: 0.3 }}
            className={cn('flex flex-wrap justify-center gap-4', classes?.actions)}
          >
            <Button
              variant="outline"
              onClick={() => navigate('home')}
              style={{ borderColor: resolvedBorderColor }}
            >
              {homeButtonLabel}
            </Button>
            <Button
              onClick={() => navigate('products')}
              style={{ backgroundColor: resolvedAccentColor }}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              {continueShoppingLabel}
            </Button>
          </motion.div>
        </motion.div>
      </SectionContainer>
    </SectionWrapper>
  );
}

export default OrderConfirmationContent;

Object.assign(OrderConfirmationContent, { schema: orderConfirmationContentSchema });

export const schema = orderConfirmationContentSchema;
