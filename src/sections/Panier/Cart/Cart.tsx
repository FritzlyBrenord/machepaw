'use client';

// ============================================
// CART — 100% Configurable Architecture
// ============================================

import { useMemo, useState } from 'react';
import { cartSchema } from "./Cart.schema";
import {
  ArrowRight,
  MapPin,
  Minus,
  Plus,
  Settings,
  Shield,
  Tag,
  Trash2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdminSettingsQuery } from '@/hooks/useAdminSettings';
import {
  useBoutiqueClientAddressesQuery,
  useBoutiqueClientSessionQuery,
} from '@/hooks/useBoutiqueClient';
import { useCartPickupInfo } from '@/hooks/useCartPickupInfo';
import { useDynamicShippingFee } from '@/hooks/useDynamicShipping';
import { getBoutiqueCartItemId, getBoutiqueCartItems } from '@/lib/boutique';
import { useNavigate } from '@/lib/router';
import { cn, getEstimatedDeliveryRange } from '@/lib/utils';
import { useCart } from '@/store';
import {
  SectionWrapper,
  SectionContainer,
} from '@/components/SectionWrapper';
import { useSectionStyles } from '@/hooks/useSectionStyles';

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────
export interface CartContent {
  title?: string;
  emptyMessage?: string;
  subtotalLabel?: string;
  shippingLabel?: string;
  totalLabel?: string;
  checkoutLabel?: string;
  continueShoppingLabel?: string;
  clearCartLabel?: string;
  couponPlaceholder?: string;
  securePaymentText?: string;
  freeShippingMessage?: string;
  deliveryModeLabel?: string;
  pickupModeLabel?: string;
  addAddressLabel?: string;
  loginRequiredMessage?: string;
}

export interface CartConfig {
  variant?: 'default' | 'minimal' | 'split';
  showCouponField?: boolean;
  showShippingCalculator?: boolean;
  showSecurePayment?: boolean;
  enableClearCart?: boolean;
  showDeliveryModeSelector?: boolean;
}

export interface CartStyle {
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
  };
}

export interface CartClasses {
  root?: string;
  itemCard?: string;
  summaryCard?: string;
  quantityControl?: string;
  checkoutButton?: string;
}

export interface CartProps {
  id?: string;
  testId?: string;
  content?: CartContent;
  config?: CartConfig;
  style?: CartStyle;
  classes?: CartClasses;
  storefrontStore?: {
    storeSlug?: string;
    sellerId?: string;
    businessName?: string;
    shippingSettings?: {
      allowDelivery?: boolean;
      allowPickup?: boolean;
      pickupAddress?: string;
      freeShippingThreshold?: number;
    };
    pickupAddress?: {
      address?: string;
      city?: string;
      country?: string;
    };
  };
  enableRuntime?: boolean;
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

const currencyFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
});

function formatMoney(value: number) {
  return currencyFormatter.format(value);
}

function normalizeAttributeName(value?: string) {
  return String(value || '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function formatAddressLine(
  firstName?: string,
  lastName?: string,
  address?: string,
  city?: string,
  country?: string
) {
  return {
    name: [firstName, lastName].filter(Boolean).join(' '),
    line: [address, city, country].filter(Boolean).join(', '),
  };
}

// ─────────────────────────────────────────
// CART ITEM COMPONENT
// ─────────────────────────────────────────
function CartItemCard({
  item,
  onUpdateQuantity,
  onRemove,
  textColor,
  accentColor,
  borderColor,
  classes,
}: {
  item: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    size?: string;
    color?: string;
    storage?: string;
  };
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  textColor: string;
  accentColor: string;
  borderColor: string;
  classes?: { itemCard?: string };
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex gap-4 rounded-lg border p-4', classes?.itemCard)}
      style={{ borderColor }}
    >
      <img src={item.image} alt={item.name} className="h-24 w-24 rounded object-cover" />
      <div className="flex-1">
        <h3 className="font-semibold" style={{ color: textColor }}>
          {item.name}
        </h3>
        {(item.size || item.color || item.storage) && (
          <p className="text-sm" style={{ color: `${textColor}99` }}>
            {item.size ? `Taille: ${item.size}` : ''}
            {item.size && (item.color || item.storage) ? ' / ' : ''}
            {item.color ? `Couleur: ${item.color}` : ''}
            {item.color && item.storage ? ' / ' : ''}
            {item.storage ? `Stockage: ${item.storage}` : ''}
          </p>
        )}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center rounded border" style={{ borderColor }}>
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              className="p-2 transition hover:bg-gray-100"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="px-4">{item.quantity}</span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="p-2 transition hover:bg-gray-100"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-bold" style={{ color: textColor }}>
              {formatMoney(item.price * item.quantity)}
            </span>
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="rounded p-2 transition hover:bg-gray-100"
            >
              <Trash2 className="h-5 w-5 text-red-500" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────
// CART LAYOUT COMPONENT
// ─────────────────────────────────────────
function CartLayout({
  content = {},
  config = {},
  style = {},
  classes = {},
  cartItems,
  shippingAmount,
  totalAmount,
  subtotal,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  onContinueShopping,
  deliveryMode,
  onDeliveryModeChange,
  availableFulfillmentModes,
  shippingLoading,
  deliveryEstimateText,
  customerConnected,
  customerActive,
  customerStatusMessage,
  onCustomerAction,
  addressName,
  addressLine,
  onAddressAction,
  pickupAddressText,
  unavailableMessage,
  taxRate,
  taxAmount,
  freeShippingMessage,
  checkoutDisabled,
  isBoutiqueMode,
}: {
  content: CartContent;
  config: CartConfig;
  style: CartStyle;
  classes?: CartClasses;
  cartItems: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    size?: string;
    color?: string;
    storage?: string;
  }>;
  shippingAmount?: number;
  totalAmount?: number;
  subtotal: number;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart?: () => void;
  onCheckout: () => void;
  onContinueShopping?: () => void;
  deliveryMode: 'delivery' | 'pickup';
  onDeliveryModeChange?: (mode: 'delivery' | 'pickup') => void;
  availableFulfillmentModes: Array<'delivery' | 'pickup'>;
  shippingLoading?: boolean;
  deliveryEstimateText?: string;
  customerConnected?: boolean;
  customerActive?: boolean;
  customerStatusMessage?: string;
  onCustomerAction?: () => void;
  addressName?: string;
  addressLine?: string;
  onAddressAction?: () => void;
  pickupAddressText?: string;
  unavailableMessage?: string;
  taxRate?: number;
  taxAmount?: number;
  freeShippingMessage?: string;
  checkoutDisabled?: boolean;
  isBoutiqueMode?: boolean;
}) {
  const [couponCode, setCouponCode] = useState('');

  const {
    colors: styleColors = {},
    spacing: styleSpacing = {},
  } = style;

  const {
    text: textColor = 'primary',
    accent: accentColor = 'accent',
    cardBg: cardBgColor = 'white',
    border: borderColor,
  } = styleColors;

  const resolvedTextColor = resolveColor(textColor, '#1a1a1a');
  const resolvedAccentColor = resolveColor(accentColor, '#c9a96e');
  const resolvedCardBgColor = resolveColor(cardBgColor, '#ffffff');
  const resolvedBorderColor = borderColor ? resolveColor(borderColor, '#e5e5e5') : '#e5e5e5';

  const {
    showCouponField = true,
    showShippingCalculator = true,
    showSecurePayment = true,
    enableClearCart = true,
    showDeliveryModeSelector = true,
  } = config;

  const {
    title = 'Mon Panier',
    emptyMessage = 'Votre panier est vide.',
    subtotalLabel = 'Sous-total',
    shippingLabel = 'Livraison',
    totalLabel = 'Total',
    checkoutLabel = 'Passer la commande',
    continueShoppingLabel = 'Continuer les achats',
    clearCartLabel = 'Vider le panier',
    couponPlaceholder = 'Code promo',
    securePaymentText = 'Paiement sécurisé',
    deliveryModeLabel = 'Livraison',
    pickupModeLabel = 'Retrait',
    addAddressLabel = 'Ajouter une adresse',
  } = content;

  const hasFulfillmentSelector = availableFulfillmentModes.length > 1 && showDeliveryModeSelector;
  const hasSingleFulfillmentMode = availableFulfillmentModes.length === 1;
  const canShowDeliveryInfo = deliveryMode === 'delivery' && availableFulfillmentModes.includes('delivery');
  const canShowPickupInfo = deliveryMode === 'pickup' && availableFulfillmentModes.includes('pickup');

  return (
    <div className="w-full">
      <h2 className="py-20 text-3xl font-bold sm:text-4xl" style={{ color: resolvedTextColor }}>
        {title}
      </h2>

      {cartItems.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-lg" style={{ color: `${resolvedTextColor}99` }}>
            {emptyMessage}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {cartItems.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                onUpdateQuantity={onUpdateQuantity}
                onRemove={onRemoveItem}
                textColor={resolvedTextColor}
                accentColor={resolvedAccentColor}
                borderColor={resolvedBorderColor}
                classes={classes}
              />
            ))}

            {onContinueShopping && (
              <button
                type="button"
                onClick={onContinueShopping}
                className="inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4"
                style={{ color: resolvedTextColor }}
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
                {continueShoppingLabel}
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div
              className={cn('rounded-lg border p-6', classes?.summaryCard)}
              style={{ borderColor: resolvedBorderColor, backgroundColor: resolvedCardBgColor }}
            >
              <h3 className="mb-4 text-lg font-semibold" style={{ color: resolvedTextColor }}>
                Résumé
              </h3>

              {hasFulfillmentSelector && (
                <div className="mb-4 flex rounded-full bg-neutral-100 p-1">
                  <button
                    type="button"
                    onClick={() => onDeliveryModeChange?.('delivery')}
                    className={cn(
                      'flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                      deliveryMode === 'delivery' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500'
                    )}
                  >
                    {deliveryModeLabel}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeliveryModeChange?.('pickup')}
                    className={cn(
                      'flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                      deliveryMode === 'pickup' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500'
                    )}
                  >
                    {pickupModeLabel}
                  </button>
                </div>
              )}

              {hasSingleFulfillmentMode && (
                <div className="mb-4 rounded-full bg-neutral-100 px-4 py-2 text-center text-sm font-medium text-neutral-700">
                  Mode: {availableFulfillmentModes[0] === 'delivery' ? deliveryModeLabel : pickupModeLabel}
                </div>
              )}

              {(canShowDeliveryInfo || canShowPickupInfo || unavailableMessage) && (
                <div className="mb-4 rounded-2xl bg-neutral-50 p-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-1 h-5 w-5 text-neutral-500" />
                    <div className="space-y-2 text-sm">
                      {canShowDeliveryInfo && deliveryEstimateText && (
                        <>
                          <p className="font-medium text-neutral-900">Estimation de livraison</p>
                          <p className="text-neutral-500">{deliveryEstimateText}</p>
                        </>
                      )}

                      {!customerConnected && customerStatusMessage && (
                        <p className="text-amber-700">{customerStatusMessage}</p>
                      )}

                      {customerConnected && !customerActive && customerStatusMessage && (
                        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-3 text-blue-800">
                          <p>{customerStatusMessage}</p>
                          {onCustomerAction && (
                            <button
                              type="button"
                              onClick={onCustomerAction}
                              className="mt-3 inline-flex text-sm font-medium underline underline-offset-4"
                            >
                              Voir mon espace client
                            </button>
                          )}
                        </div>
                      )}

                      {customerConnected && customerActive && addressLine && (
                        <div className="rounded-2xl border border-neutral-200 bg-white p-3">
                          {addressName && <p className="font-medium text-neutral-900">{addressName}</p>}
                          <p className="mt-1 text-neutral-500">{addressLine}</p>
                          {onAddressAction && (
                            <button
                              type="button"
                              onClick={onAddressAction}
                              className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-neutral-700 underline underline-offset-4"
                            >
                              <Settings className="h-3.5 w-3.5" />
                              {addAddressLabel}
                            </button>
                          )}
                        </div>
                      )}

                      {customerConnected && customerActive && !addressLine && customerStatusMessage && (
                        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-3 text-blue-800">
                          <p>{customerStatusMessage}</p>
                          {onAddressAction && (
                            <button
                              type="button"
                              onClick={onAddressAction}
                              className="mt-3 inline-flex text-sm font-medium underline underline-offset-4"
                            >
                              {addAddressLabel}
                            </button>
                          )}
                        </div>
                      )}

                      {canShowPickupInfo && (
                        <>
                          <p className="font-medium text-neutral-900">Point de retrait</p>
                          <p className="rounded-2xl border border-neutral-200 bg-white p-3 text-neutral-500">
                            {pickupAddressText || 'Adresse non renseignée.'}
                          </p>
                        </>
                      )}

                      {!canShowDeliveryInfo && !canShowPickupInfo && unavailableMessage && (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-amber-800">
                          {unavailableMessage}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {showCouponField && (
                <div className="mb-4 flex gap-2">
                  <Input
                    type="text"
                    placeholder={couponPlaceholder}
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <Button variant="outline" type="button">
                    <Tag className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <div className="mb-4 space-y-2">
                <div className="flex justify-between">
                  <span style={{ color: `${resolvedTextColor}99` }}>{subtotalLabel}</span>
                  <span style={{ color: resolvedTextColor }}>{formatMoney(subtotal)}</span>
                </div>
                {showShippingCalculator && (
                  <div className="flex justify-between">
                    <span style={{ color: `${resolvedTextColor}99` }}>
                      {deliveryMode === 'pickup' ? pickupModeLabel : shippingLabel}
                    </span>
                    <span style={{ color: resolvedTextColor }}>
                      {shippingLoading
                        ? 'Calcul...'
                        : shippingAmount === 0
                          ? 'Gratuite'
                          : formatMoney(shippingAmount || 0)}
                    </span>
                  </div>
                )}
                {typeof taxAmount === 'number' && taxRate && (
                  <div className="flex justify-between">
                    <span style={{ color: `${resolvedTextColor}99` }}>Taxes ({taxRate}%)</span>
                    <span style={{ color: resolvedTextColor }}>{formatMoney(taxAmount)}</span>
                  </div>
                )}
                {freeShippingMessage && (
                  <div className="text-xs text-neutral-500">{freeShippingMessage}</div>
                )}
                <div className="flex justify-between border-t pt-2 font-bold" style={{ borderColor: resolvedBorderColor }}>
                  <span style={{ color: resolvedTextColor }}>{totalLabel}</span>
                  <span style={{ color: resolvedAccentColor }}>{formatMoney(totalAmount || subtotal)}</span>
                </div>
              </div>

              <Button
                className={cn('w-full', classes?.checkoutButton)}
                size="lg"
                style={{ backgroundColor: resolvedAccentColor, color: '#ffffff' }}
                onClick={onCheckout}
                type="button"
                disabled={checkoutDisabled}
              >
                {checkoutLabel}
              </Button>

              {showSecurePayment && (
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-neutral-500">
                  <Shield className="h-4 w-4" />
                  {securePaymentText}
                </div>
              )}

              {enableClearCart && onClearCart && (
                <button
                  type="button"
                  onClick={onClearCart}
                  className="mt-3 w-full text-sm font-medium text-neutral-500 transition hover:text-neutral-900"
                >
                  {clearCartLabel}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// CONNECTED CART (WITH REAL DATA)
// ─────────────────────────────────────────
function ConnectedCart({
  id,
  testId,
  content = {},
  config = {},
  style = {},
  classes = {},
  storefrontStore,
}: CartProps) {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, clearCart, clearCartItems } = useCart();
  const { data: adminSettings } = useAdminSettingsQuery();
  const storeSlug = storefrontStore?.storeSlug || '';
  const sellerId = storefrontStore?.sellerId || '';
  const isBoutiqueMode = Boolean(storeSlug || sellerId);

  const { data: session } = useBoutiqueClientSessionQuery(storeSlug);
  const hasActiveBoutiqueCustomer = session?.customer?.status === 'active';
  const { data: boutiqueAddresses = [] } = useBoutiqueClientAddressesQuery(
    storeSlug,
    hasActiveBoutiqueCustomer
  );

  const boutiqueItems = useMemo(
    () =>
      isBoutiqueMode
        ? getBoutiqueCartItems(items, { sellerId, storeSlug })
        : items,
    [isBoutiqueMode, items, sellerId, storeSlug]
  );

  const [deliveryMode, setDeliveryMode] = useState<'delivery' | 'pickup'>('delivery');

  const defaultSelectedAddressId =
    boutiqueAddresses.find((address) => address.isDefault)?.id || boutiqueAddresses[0]?.id || '';

  const selectedAddress =
    boutiqueAddresses.find((address) => address.id === defaultSelectedAddressId) ||
    boutiqueAddresses.find((address) => address.isDefault) ||
    boutiqueAddresses[0];

  const shippingSettings = storefrontStore?.shippingSettings || {};
  const pickupAddressText =
    shippingSettings.pickupAddress ||
    [
      storefrontStore?.pickupAddress?.address,
      storefrontStore?.pickupAddress?.city,
      storefrontStore?.pickupAddress?.country,
    ]
      .filter((value) => typeof value === 'string' && value.trim().length > 0)
      .join(', ');

  const { data: pickupInfo } = useCartPickupInfo(boutiqueItems, {
    allowDelivery: shippingSettings.allowDelivery ?? true,
    allowPickup: Boolean(shippingSettings.allowPickup && pickupAddressText),
    pickupAddress: pickupAddressText,
  });

  const availableFulfillmentModes = useMemo(() => {
    const modes: Array<'delivery' | 'pickup'> = [];
    if (pickupInfo?.allowDelivery ?? true) modes.push('delivery');
    if (pickupInfo?.allowPickup) modes.push('pickup');
    return modes;
  }, [pickupInfo?.allowDelivery, pickupInfo?.allowPickup]);

  const activeDeliveryMode = availableFulfillmentModes.includes(deliveryMode)
    ? deliveryMode
    : availableFulfillmentModes[0] || 'delivery';

  const maxMinDays =
    boutiqueItems.length > 0
      ? Math.max(...boutiqueItems.map((item) => item.product.minProcessingDays ?? 1))
      : 1;
  const maxMaxDays =
    boutiqueItems.length > 0
      ? Math.max(...boutiqueItems.map((item) => item.product.maxProcessingDays ?? 3))
      : 3;

  const deliveryEstimateText =
    isBoutiqueMode && activeDeliveryMode === 'delivery'
      ? `Prévue du ${getEstimatedDeliveryRange(maxMinDays, maxMaxDays)}`
      : undefined;

  const { data: dynamicShippingFee = 0, isLoading: isShippingLoading } = useDynamicShippingFee(
    boutiqueItems,
    selectedAddress?.id,
    selectedAddress?.latitude,
    selectedAddress?.longitude
  );

  const freeShippingThreshold =
    Number(adminSettings?.freeShippingThreshold || shippingSettings.freeShippingThreshold || 0) || 0;
  const taxRate = Number(adminSettings?.taxRate || 0) || 0;

  const boutiqueSubtotal = boutiqueItems.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0
  );
  const isActuallyFree = freeShippingThreshold > 0 && boutiqueSubtotal >= freeShippingThreshold;

  const shippingAmount = isBoutiqueMode
    ? activeDeliveryMode === 'pickup' || !availableFulfillmentModes.includes('delivery')
      ? 0
      : isActuallyFree
        ? 0
        : dynamicShippingFee
    : undefined;

  const taxAmount = taxRate > 0 ? (boutiqueSubtotal * taxRate) / 100 : undefined;
  const totalAmount =
    typeof shippingAmount === 'number'
      ? boutiqueSubtotal + shippingAmount + (taxAmount || 0)
      : boutiqueSubtotal;

  const freeShippingMessage =
    isBoutiqueMode && freeShippingThreshold > 0
      ? isActuallyFree
        ? `Livraison gratuite appliquée`
        : `Plus que ${(freeShippingThreshold - boutiqueSubtotal).toFixed(2)} EUR pour la livraison gratuite`
      : undefined;

  const cartItems = useMemo(
    () =>
      boutiqueItems.map((item) => {
        const attributes = new Map(
          (item.selectedAttributes || []).map((attribute) => [
            normalizeAttributeName(attribute.name),
            attribute.value,
          ])
        );

        return {
          id: getBoutiqueCartItemId(item),
          name: item.product.name,
          price: item.unitPrice,
          quantity: item.quantity,
          image: item.product.images[0] || '/images/placeholder.jpg',
          size:
            attributes.get('taille') || attributes.get('size') || attributes.get('dimension') || undefined,
          color: attributes.get('couleur') || attributes.get('color') || undefined,
          storage: attributes.get('stockage') || attributes.get('storage') || undefined,
        };
      }),
    [boutiqueItems]
  );

  const boutiqueCartItemIds = useMemo(
    () => boutiqueItems.map((item) => getBoutiqueCartItemId(item)),
    [boutiqueItems]
  );

  const addressInfo = selectedAddress
    ? formatAddressLine(
        selectedAddress.firstName,
        selectedAddress.lastName,
        selectedAddress.address,
        selectedAddress.city,
        selectedAddress.country
      )
    : { name: '', line: '' };

  const customerStatusMessage = !isBoutiqueMode
    ? undefined
    : !session
      ? 'Connectez-vous pour utiliser vos adresses de livraison.'
      : !hasActiveBoutiqueCustomer
        ? session.customer?.status === 'blocked'
          ? 'Votre compte est bloqué.'
          : 'Connectez-vous à votre compte client.'
        : !selectedAddress && activeDeliveryMode === 'delivery'
          ? 'Aucune adresse enregistrée.'
          : undefined;

  const handleCheckout = () => {
    if (!isBoutiqueMode) {
      navigate('checkout');
      return;
    }

    if (availableFulfillmentModes.length === 0) return;

    if (!session || !hasActiveBoutiqueCustomer) {
      navigate('account');
      return;
    }

    if (activeDeliveryMode === 'delivery' && !selectedAddress) {
      navigate('account');
      return;
    }

    navigate('checkout', { mode: activeDeliveryMode });
  };

  const resolvedBgColor = resolveColor(style.colors?.background, '#fbf8f3');
  const { css } = useSectionStyles(style);

  return (
    <SectionWrapper
      id={id}
      testId={testId}
      as="section"
      className={cn('min-h-screen', classes?.root)}
      style={{ backgroundColor: resolvedBgColor, ...css }}
    >
      <SectionContainer size={style.spacing?.container || 'contained'} className="py-10">
        <CartLayout
          content={content}
          config={config}
          style={style}
          classes={classes}
          cartItems={cartItems}
          shippingAmount={shippingAmount}
          totalAmount={totalAmount}
          subtotal={boutiqueSubtotal}
          onUpdateQuantity={(itemId, quantity) => updateQuantity(itemId, quantity)}
          onRemoveItem={(itemId) => removeFromCart(itemId)}
          onClearCart={() => {
            if (isBoutiqueMode) {
              clearCartItems(boutiqueCartItemIds);
            } else {
              clearCart();
            }
          }}
          onCheckout={handleCheckout}
          onContinueShopping={() => navigate('products')}
          deliveryMode={activeDeliveryMode}
          onDeliveryModeChange={setDeliveryMode}
          availableFulfillmentModes={isBoutiqueMode ? availableFulfillmentModes : []}
          shippingLoading={isShippingLoading}
          deliveryEstimateText={deliveryEstimateText}
          customerConnected={Boolean(session)}
          customerActive={hasActiveBoutiqueCustomer}
          customerStatusMessage={customerStatusMessage}
          onCustomerAction={() => navigate('account')}
          addressName={addressInfo.name}
          addressLine={addressInfo.line}
          onAddressAction={() => navigate('account')}
          pickupAddressText={pickupAddressText || pickupInfo?.pickupAddressText}
          unavailableMessage={pickupInfo?.message}
          taxRate={taxRate || undefined}
          taxAmount={taxAmount}
          freeShippingMessage={freeShippingMessage}
          checkoutDisabled={isBoutiqueMode ? availableFulfillmentModes.length === 0 : false}
          isBoutiqueMode={isBoutiqueMode}
        />
      </SectionContainer>
    </SectionWrapper>
  );
}

// ─────────────────────────────────────────
// STATIC CART (FOR PREVIEW)
// ─────────────────────────────────────────
function StaticCart(props: CartProps) {
  const resolvedBgColor = resolveColor(props.style?.colors?.background, '#ffffff');
  const { css } = useSectionStyles(props.style || {});

  return (
    <SectionWrapper
      id={props.id}
      testId={props.testId}
      as="section"
      className={cn('min-h-screen', props.classes?.root)}
      style={{ backgroundColor: resolvedBgColor, ...css }}
    >
      <SectionContainer size={props.style?.spacing?.container || 'contained'} className="py-10">
        <CartLayout
          content={props.content || {}}
          config={props.config || {}}
          style={props.style || {}}
          classes={props.classes}
          cartItems={[]}
          subtotal={0}
          onUpdateQuantity={() => {}}
          onRemoveItem={() => {}}
          onCheckout={() => {}}
          deliveryMode="delivery"
          availableFulfillmentModes={[]}
        />
      </SectionContainer>
    </SectionWrapper>
  );
}

// ─────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────
export function Cart(props: CartProps) {
  if (props.enableRuntime) {
    return <ConnectedCart {...props} />;
  }
  return <StaticCart {...props} />;
}

Object.assign(Cart, { schema: cartSchema });

export const schema = cartSchema;

export default Cart;
