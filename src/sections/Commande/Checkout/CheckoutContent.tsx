'use client';

// ============================================
// CHECKOUT CONTENT — 100% Configurable Architecture
// ============================================

import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  CreditCard,
  ImageIcon,
  Lock,
  LogIn,
  MapPin,
  Store,
  Truck,
  Upload,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AddressForm } from '@/components/checkout/AddressForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type {
  SellerPaymentMethodCode,
  SellerPaymentMethodView,
} from '@/data/paymentMethods';
import type { Address } from '@/data/types';
import { formatPrice, cn } from '@/lib/utils';
import {
  SectionWrapper,
  SectionContainer,
} from '@/components/SectionWrapper';
import { useSectionStyles } from '@/hooks/useSectionStyles';
import { checkoutContentSchema } from "./CheckoutContent.schema";

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────
type CheckoutStep = 'shipping' | 'payment' | 'review';

type CheckoutDisplayCartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  color?: string;
  storage?: string;
};

export interface CheckoutContentProps {
  id?: string;
  testId?: string;
  title?: string;
  subtitle?: string;
  stepLabels?: string[] | string;
  steps?: string[] | string;
  content?: {
    backToCartLabel?: string;
    deliveryStepTitle?: string;
    paymentStepTitle?: string;
    reviewStepTitle?: string;
    placeOrderLabel?: string;
    processingLabel?: string;
    orderSummaryLabel?: string;
    subtotalLabel?: string;
    shippingLabel?: string;
    totalLabel?: string;
    notesPlaceholder?: string;
    securePaymentText?: string;
  };
  config?: {
    variant?: 'default' | 'minimal' | 'split';
    showSteps?: boolean;
    showOrderSummary?: boolean;
    showSecurePayment?: boolean;
    enableNotes?: boolean;
  };
  style?: {
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
  };
  classes?: {
    root?: string;
    stepIndicator?: string;
    card?: string;
    summaryCard?: string;
    button?: string;
  };
  runtime?: {
    cartItems: CheckoutDisplayCartItem[];
    subtotal: number;
    shippingAmount: number;
    taxAmount?: number;
    taxRate?: number;
    totalAmount: number;
    shippingLoading?: boolean;
    deliveryEstimateText?: string;
    freeShippingMessage?: string;
    availableFulfillmentModes: Array<'delivery' | 'pickup'>;
    deliveryMode: 'delivery' | 'pickup';
    onDeliveryModeChange: (mode: 'delivery' | 'pickup') => void;
    customerConnected: boolean;
    customerActive: boolean;
    customerStatusMessage?: string;
    customerActionLabel?: string;
    onCustomerAction?: () => void;
    addresses: Address[];
    selectedAddressId?: string;
    onSelectAddress: (id: string) => void;
    isAddingAddress: boolean;
    onStartAddAddress: () => void;
    onCancelAddAddress: () => void;
    onSaveAddress: (address: Address) => Promise<void> | void;
    isSavingAddress?: boolean;
    pickupAddressText?: string;
    pickupSourceLabel?: string;
    unavailableMessage?: string;
    paymentMethods: SellerPaymentMethodView[];
    paymentMethodsLoading?: boolean;
    paymentMethodsError?: string;
    selectedPaymentMethod?: SellerPaymentMethodView | null;
    onSelectPaymentMethod: (code: SellerPaymentMethodCode) => void;
    manualPaymentInstructions: string[];
    requiresManualPaymentAcknowledgement: boolean;
    paymentId: string;
    onPaymentIdChange: (value: string) => void;
    paymentProofLabel?: string;
    paymentProofReady?: boolean;
    onPaymentFileChange: (file: File | null) => void;
    paymentAcknowledged: boolean;
    onPaymentAcknowledgedChange: (value: boolean) => void;
    notes: string;
    onNotesChange: (value: string) => void;
    onPlaceOrder: () => Promise<void> | void;
    isProcessing?: boolean;
    onBackToCart?: () => void;
    onContinueShopping?: () => void;
  };
}

export type CheckoutContentRuntimeProps = NonNullable<CheckoutContentProps['runtime']>;

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
// STEP INDICATOR COMPONENT
// ─────────────────────────────────────────
function StepIndicator({
  steps,
  currentStep,
  accentColor,
  textColor,
}: {
  steps: string[];
  currentStep: CheckoutStep;
  accentColor: string;
  textColor: string;
}) {
  const stepOrder: CheckoutStep[] = ['shipping', 'payment', 'review'];
  const currentIndex = stepOrder.indexOf(currentStep);
  const stepIndex = currentIndex >= 0 ? Math.min(currentIndex, steps.length - 1) : 0;

  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const isActive = index <= stepIndex;
        const isCurrent = index === stepIndex;

        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-all',
                  isActive ? 'text-white' : 'text-gray-400'
                )}
                style={{
                  backgroundColor: isActive ? accentColor : '#e5e5e5',
                  boxShadow: isCurrent ? `0 0 0 4px ${accentColor}30` : undefined,
                }}
              >
                {index + 1}
              </div>
              <span
                className={cn(
                  'mt-2 text-sm font-medium',
                  isActive ? '' : 'text-gray-400'
                )}
                style={{ color: isActive ? textColor : undefined }}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className="mx-4 h-px w-16"
                style={{ backgroundColor: index < stepIndex ? accentColor : '#e5e5e5' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────
// MAIN CHECKOUT CONTENT COMPONENT
// ─────────────────────────────────────────
export function CheckoutContent({
  id,
  testId,
  title: legacyTitle,
  subtitle: legacySubtitle,
  stepLabels: legacyStepLabels,
  steps: legacySteps,
  content = {},
  config = {},
  style = {},
  classes = {},
  runtime,
}: CheckoutContentProps) {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');

  // ── EXTRACT CONFIG ──
  const {
    variant = 'default',
    showSteps = true,
    showOrderSummary = true,
    showSecurePayment = true,
    enableNotes = true,
  } = config;

  // ── EXTRACT CONTENT ──
  const {
    backToCartLabel = 'Retour au panier',
    deliveryStepTitle = 'Livraison',
    paymentStepTitle = 'Paiement',
    reviewStepTitle = 'Confirmation',
    placeOrderLabel = 'Confirmer la commande',
    processingLabel = 'Traitement...',
    orderSummaryLabel = 'Résumé de la commande',
    subtotalLabel = 'Sous-total',
    shippingLabel = 'Livraison',
    totalLabel = 'Total',
    notesPlaceholder = 'Notes supplémentaires...',
    securePaymentText = 'Paiement sécurisé',
  } = content;
  const resolvedTitle =
    legacyTitle || (content as { title?: string }).title || 'Commande';
  const resolvedSubtitle =
    legacySubtitle || (content as { subtitle?: string }).subtitle;

  // ── EXTRACT STYLE ──
  const {
    colors: styleColors = {},
    spacing: styleSpacing = {},
  } = style;

  const {
    background: backgroundColor = 'secondary',
    text: textColor = 'primary',
    accent: accentColor = 'accent',
    cardBg: cardBgColor = 'white',
    border: borderColor,
  } = styleColors;

  const {
    container = 'contained',
    paddingY = '12',
  } = styleSpacing;

  // ── HOOKS ──
  const { css } = useSectionStyles(style);

  // ── HELPERS ──
  const resolvedBgColor = resolveColor(backgroundColor, '#f8fafc');
  const resolvedTextColor = resolveColor(textColor, '#1a1a1a');
  const resolvedAccentColor = resolveColor(accentColor, '#c9a96e');
  const resolvedCardBgColor = resolveColor(cardBgColor, '#ffffff');
  const resolvedBorderColor = borderColor ? resolveColor(borderColor, '#e5e5e5') : '#e5e5e5';

  const normalizeStepLabels = (value: string[] | string | undefined): string[] => {
    if (Array.isArray(value)) {
      return value
        .map((step) => String(step).trim())
        .filter((step) => step.length > 0);
    }

    if (typeof value === 'string') {
      return value
        .split(/\r?\n/)
        .map((step) => step.trim())
        .filter((step) => step.length > 0);
    }

    return [];
  };

  const resolvedStepLabels = (() => {
    const nextLabels = normalizeStepLabels(
      legacyStepLabels ||
        legacySteps ||
        (content as { stepLabels?: string[] | string }).stepLabels ||
        (content as { steps?: string[] | string }).steps,
    );

    return nextLabels.length > 0
      ? nextLabels
      : [deliveryStepTitle, paymentStepTitle, reviewStepTitle];
  })();

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
        <div className="mb-8">
          <button
            type="button"
            onClick={runtime?.onBackToCart}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: resolvedTextColor }}
          >
            <ArrowLeft className="h-4 w-4" />
            {backToCartLabel}
          </button>
          <h1 className="text-3xl font-bold" style={{ color: resolvedTextColor }}>
            {resolvedTitle}
          </h1>
          {resolvedSubtitle && (
            <p className="mt-2" style={{ color: `${resolvedTextColor}80` }}>
              {resolvedSubtitle}
            </p>
          )}
        </div>

        {/* Steps */}
        {showSteps && (
          <div className={cn('mb-8', classes?.stepIndicator)}>
            <StepIndicator
              steps={resolvedStepLabels}
              currentStep={currentStep}
              accentColor={resolvedAccentColor}
              textColor={resolvedTextColor}
            />
          </div>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Shipping Step */}
            {currentStep === 'shipping' && runtime && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn('rounded-xl border p-6', classes?.card)}
                style={{ borderColor: resolvedBorderColor, backgroundColor: resolvedCardBgColor }}
              >
                <h2 className="mb-4 text-xl font-semibold" style={{ color: resolvedTextColor }}>
                  {deliveryStepTitle}
                </h2>

                {/* Delivery Mode Selector */}
                {runtime.availableFulfillmentModes.length > 1 && (
                  <div className="mb-6 flex gap-4">
                    {runtime.availableFulfillmentModes.includes('delivery') && (
                      <button
                        type="button"
                        onClick={() => runtime.onDeliveryModeChange('delivery')}
                        className={cn(
                          'flex flex-1 items-center gap-3 rounded-lg border p-4 transition-all',
                          runtime.deliveryMode === 'delivery' ? 'ring-2' : ''
                        )}
                        style={{
                          borderColor: resolvedBorderColor,
                          backgroundColor: resolvedCardBgColor,
                          boxShadow:
                            runtime.deliveryMode === 'delivery'
                              ? `0 0 0 2px ${resolvedAccentColor}40`
                              : undefined,
                        }}
                      >
                        <Truck className="h-5 w-5" style={{ color: resolvedAccentColor }} />
                        <div className="text-left">
                          <p className="font-medium" style={{ color: resolvedTextColor }}>
                            Livraison
                          </p>
                          <p className="text-sm" style={{ color: `${resolvedTextColor}60` }}>
                            À domicile
                          </p>
                        </div>
                      </button>
                    )}
                    {runtime.availableFulfillmentModes.includes('pickup') && (
                      <button
                        type="button"
                        onClick={() => runtime.onDeliveryModeChange('pickup')}
                        className={cn(
                          'flex flex-1 items-center gap-3 rounded-lg border p-4 transition-all',
                          runtime.deliveryMode === 'pickup' ? 'ring-2' : ''
                        )}
                        style={{
                          borderColor: resolvedBorderColor,
                          backgroundColor: resolvedCardBgColor,
                          boxShadow:
                            runtime.deliveryMode === 'pickup'
                              ? `0 0 0 2px ${resolvedAccentColor}40`
                              : undefined,
                        }}
                      >
                        <Store className="h-5 w-5" style={{ color: resolvedAccentColor }} />
                        <div className="text-left">
                          <p className="font-medium" style={{ color: resolvedTextColor }}>
                            Retrait
                          </p>
                          <p className="text-sm" style={{ color: `${resolvedTextColor}60` }}>
                            En magasin
                          </p>
                        </div>
                      </button>
                    )}
                  </div>
                )}

                {/* Address Selection */}
                {runtime.deliveryMode === 'delivery' && (
                  <div className="space-y-4">
                    {!runtime.customerConnected && (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                        <p className="text-amber-800">{runtime.customerStatusMessage}</p>
                        {runtime.onCustomerAction && (
                          <button
                            type="button"
                            onClick={runtime.onCustomerAction}
                            className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-amber-700 underline"
                          >
                            <LogIn className="h-4 w-4" />
                            Connexion
                          </button>
                        )}
                      </div>
                    )}

                    {runtime.customerConnected && !runtime.customerActive && (
                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <p className="text-blue-800">{runtime.customerStatusMessage}</p>
                      </div>
                    )}

                    {runtime.customerConnected && runtime.customerActive && (
                      <>
                        {runtime.addresses.length === 0 ? (
                          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                            <p className="text-blue-800">Aucune adresse enregistrée.</p>
                            <button
                              type="button"
                              onClick={runtime.onStartAddAddress}
                              className="mt-2 text-sm font-medium text-blue-700 underline"
                            >
                              Ajouter une adresse
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {runtime.addresses.map((address) => (
                              <label
                                key={address.id}
                                className={cn(
                                  'flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all',
                                  runtime.selectedAddressId === address.id ? 'ring-2' : ''
                                )}
                                style={{
                                  borderColor: resolvedBorderColor,
                                  backgroundColor: resolvedCardBgColor,
                                  boxShadow:
                                    runtime.selectedAddressId === address.id
                                      ? `0 0 0 2px ${resolvedAccentColor}40`
                                      : undefined,
                                }}
                              >
                                <input
                                  type="radio"
                                  name="address"
                                  checked={runtime.selectedAddressId === address.id}
                                  onChange={() => runtime.onSelectAddress(address.id || '')}
                                  className="mt-1"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" style={{ color: resolvedAccentColor }} />
                                    <span className="font-medium" style={{ color: resolvedTextColor }}>
                                      {address.label || 'Adresse'}
                                    </span>
                                    {address.isDefault && (
                                      <span
                                        className="rounded px-2 py-0.5 text-xs"
                                        style={{ backgroundColor: `${resolvedAccentColor}20`, color: resolvedAccentColor }}
                                      >
                                        Par défaut
                                      </span>
                                    )}
                                  </div>
                                  <p className="mt-1 text-sm" style={{ color: `${resolvedTextColor}60` }}>
                                    {address.firstName} {address.lastName}
                                  </p>
                                  <p className="text-sm" style={{ color: `${resolvedTextColor}60` }}>
                                    {address.address}, {address.city}
                                  </p>
                                </div>
                              </label>
                            ))}
                            <button
                              type="button"
                              onClick={runtime.onStartAddAddress}
                              className="w-full rounded-lg border border-dashed p-4 text-sm font-medium transition-all hover:bg-gray-50"
                              style={{ borderColor: resolvedBorderColor, color: resolvedTextColor }}
                            >
                              + Ajouter une nouvelle adresse
                            </button>
                          </div>
                        )}

                        {runtime.isAddingAddress && (
                          <div className="mt-4 rounded-lg border p-4" style={{ borderColor: resolvedBorderColor }}>
                            <AddressForm
                              title="Nouvelle adresse"
                              submitLabel="Enregistrer"
                              onCancel={runtime.onCancelAddAddress}
                              onSubmit={runtime.onSaveAddress}
                              isSubmitting={runtime.isSavingAddress}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Pickup Info */}
                {runtime.deliveryMode === 'pickup' && runtime.pickupAddressText && (
                  <div className="rounded-lg border p-4" style={{ borderColor: resolvedBorderColor }}>
                    <div className="flex items-start gap-3">
                      <Store className="h-5 w-5" style={{ color: resolvedAccentColor }} />
                      <div>
                        <p className="font-medium" style={{ color: resolvedTextColor }}>
                          Point de retrait
                        </p>
                        <p className="mt-1 text-sm" style={{ color: `${resolvedTextColor}60` }}>
                          {runtime.pickupAddressText}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={() => setCurrentStep('payment')}
                    disabled={
                      (runtime.deliveryMode === 'delivery' && !runtime.selectedAddressId) ||
                      runtime.availableFulfillmentModes.length === 0
                    }
                    className={classes?.button}
                    style={{ backgroundColor: resolvedAccentColor }}
                  >
                    Continuer
                    <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Payment Step */}
            {currentStep === 'payment' && runtime && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn('rounded-xl border p-6', classes?.card)}
                style={{ borderColor: resolvedBorderColor, backgroundColor: resolvedCardBgColor }}
              >
                <h2 className="mb-4 text-xl font-semibold" style={{ color: resolvedTextColor }}>
                  {paymentStepTitle}
                </h2>

                {/* Payment Methods */}
                <div className="space-y-3">
                  {runtime.paymentMethodsLoading ? (
                    <div className="text-center py-8">
                      <p style={{ color: `${resolvedTextColor}60` }}>Chargement des méthodes de paiement...</p>
                    </div>
                  ) : runtime.paymentMethodsError ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                      <p className="text-red-800">{runtime.paymentMethodsError}</p>
                    </div>
                  ) : runtime.paymentMethods.length === 0 ? (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                      <p className="text-amber-800">Aucune méthode de paiement disponible.</p>
                    </div>
                  ) : (
                    runtime.paymentMethods.map((method) => (
                      <label
                        key={method.code}
                        className={cn(
                          'flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-all',
                          runtime.selectedPaymentMethod?.code === method.code ? 'ring-2' : ''
                        )}
                        style={{
                          borderColor: resolvedBorderColor,
                          backgroundColor: resolvedCardBgColor,
                          boxShadow:
                            runtime.selectedPaymentMethod?.code === method.code
                              ? `0 0 0 2px ${resolvedAccentColor}40`
                              : undefined,
                        }}
                      >
                        <input
                          type="radio"
                          name="payment"
                          checked={runtime.selectedPaymentMethod?.code === method.code}
                          onChange={() => runtime.onSelectPaymentMethod(method.code)}
                          className="h-4 w-4"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" style={{ color: resolvedAccentColor }} />
                            <span className="font-medium" style={{ color: resolvedTextColor }}>
                              {method.label}
                            </span>
                          </div>
                          {method.description && (
                            <p className="mt-1 text-sm" style={{ color: `${resolvedTextColor}60` }}>
                              {method.description}
                            </p>
                          )}
                        </div>
                      </label>
                    ))
                  )}
                </div>

                {/* Manual Payment Instructions */}
                {runtime.selectedPaymentMethod?.requiresManualEntry && runtime.manualPaymentInstructions.length > 0 && (
                  <div className="mt-4 rounded-lg border p-4" style={{ borderColor: resolvedBorderColor }}>
                    <h3 className="mb-2 font-medium" style={{ color: resolvedTextColor }}>
                      Instructions de paiement
                    </h3>
                    <ul className="list-disc space-y-1 pl-5 text-sm" style={{ color: `${resolvedTextColor}60` }}>
                      {runtime.manualPaymentInstructions.map((instruction, index) => (
                        <li key={index}>{instruction}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Payment Proof Upload */}
                {runtime.selectedPaymentMethod?.requiresManualEntry && (
                  <div className="mt-4 space-y-4">
                    <div className="rounded-lg border p-4" style={{ borderColor: resolvedBorderColor }}>
                      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 transition-all hover:bg-gray-50"
                        style={{ borderColor: resolvedBorderColor }}
                      >
                        <Upload className="h-8 w-8" style={{ color: `${resolvedTextColor}40` }} />
                        <span className="text-sm font-medium" style={{ color: resolvedTextColor }}>
                          {runtime.paymentProofLabel || 'Télécharger la preuve de paiement'}
                        </span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => runtime.onPaymentFileChange(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                      </label>
                      {runtime.paymentProofReady && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                          <Check className="h-4 w-4" />
                          Fichier sélectionné
                        </div>
                      )}
                    </div>

                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={runtime.paymentAcknowledged}
                        onChange={(e) => runtime.onPaymentAcknowledgedChange(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded"
                      />
                      <span className="text-sm" style={{ color: `${resolvedTextColor}80` }}>
                        J'ai effectué le paiement selon les instructions
                      </span>
                    </label>
                  </div>
                )}

                {/* Payment ID Input */}
                {runtime.selectedPaymentMethod?.requiresManualEntry && (
                  <div className="mt-4">
                    <label className="mb-2 block text-sm font-medium" style={{ color: resolvedTextColor }}>
                      Numéro de transaction / Référence
                    </label>
                    <Input
                      type="text"
                      value={runtime.paymentId}
                      onChange={(e) => runtime.onPaymentIdChange(e.target.value)}
                      placeholder="Ex: TRX123456"
                    />
                  </div>
                )}

                {/* Navigation */}
                <div className="mt-6 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep('shipping')}
                    style={{ borderColor: resolvedBorderColor }}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour
                  </Button>
                  <Button
                    onClick={() => setCurrentStep('review')}
                    disabled={
                      !runtime.selectedPaymentMethod ||
                      (runtime.selectedPaymentMethod.requiresManualEntry &&
                        !runtime.paymentAcknowledged)
                    }
                    className={classes?.button}
                    style={{ backgroundColor: resolvedAccentColor }}
                  >
                    Continuer
                    <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Review Step */}
            {currentStep === 'review' && runtime && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn('rounded-xl border p-6', classes?.card)}
                style={{ borderColor: resolvedBorderColor, backgroundColor: resolvedCardBgColor }}
              >
                <h2 className="mb-4 text-xl font-semibold" style={{ color: resolvedTextColor }}>
                  {reviewStepTitle}
                </h2>

                {/* Order Summary */}
                <div className="space-y-4">
                  {runtime.cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <img
                        src={item.image || '/images/placeholder.jpg'}
                        alt={item.name}
                        className="h-16 w-16 rounded object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium" style={{ color: resolvedTextColor }}>
                          {item.name}
                        </p>
                        <p className="text-sm" style={{ color: `${resolvedTextColor}60` }}>
                          Qté: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium" style={{ color: resolvedTextColor }}>
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Delivery Info */}
                <div className="mt-6 border-t pt-4" style={{ borderColor: resolvedBorderColor }}>
                  <div className="flex items-start gap-3">
                    <Truck className="h-5 w-5" style={{ color: resolvedAccentColor }} />
                    <div>
                      <p className="font-medium" style={{ color: resolvedTextColor }}>
                        {runtime.deliveryMode === 'pickup' ? 'Retrait en magasin' : 'Livraison à domicile'}
                      </p>
                      {runtime.deliveryEstimateText && (
                        <p className="text-sm" style={{ color: `${resolvedTextColor}60` }}>
                          {runtime.deliveryEstimateText}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="mt-4 border-t pt-4" style={{ borderColor: resolvedBorderColor }}>
                  <div className="flex items-start gap-3">
                    <CreditCard className="h-5 w-5" style={{ color: resolvedAccentColor }} />
                    <div>
                      <p className="font-medium" style={{ color: resolvedTextColor }}>
                        {runtime.selectedPaymentMethod?.label}
                      </p>
                      {runtime.paymentId && (
                        <p className="text-sm" style={{ color: `${resolvedTextColor}60` }}>
                          Réf: {runtime.paymentId}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {enableNotes && (
                  <div className="mt-6">
                    <label className="mb-2 block text-sm font-medium" style={{ color: resolvedTextColor }}>
                      Notes (optionnel)
                    </label>
                    <textarea
                      value={runtime.notes}
                      onChange={(e) => runtime.onNotesChange(e.target.value)}
                      placeholder={notesPlaceholder}
                      className="min-h-[80px] w-full rounded-lg border p-3 text-sm"
                      style={{ borderColor: resolvedBorderColor, color: resolvedTextColor }}
                    />
                  </div>
                )}

                {/* Secure Payment Badge */}
                {showSecurePayment && (
                  <div className="mt-4 flex items-center gap-2 text-sm" style={{ color: `${resolvedTextColor}60` }}>
                    <Lock className="h-4 w-4" />
                    {securePaymentText}
                  </div>
                )}

                {/* Navigation */}
                <div className="mt-6 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep('payment')}
                    style={{ borderColor: resolvedBorderColor }}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour
                  </Button>
                  <Button
                    onClick={runtime.onPlaceOrder}
                    disabled={runtime.isProcessing}
                    className={cn('min-w-[200px]', classes?.button)}
                    style={{ backgroundColor: resolvedAccentColor }}
                  >
                    {runtime.isProcessing ? processingLabel : placeOrderLabel}
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          {showOrderSummary && runtime && (
            <div>
              <div
                className={cn('sticky top-24 rounded-xl border p-6', classes?.summaryCard)}
                style={{ borderColor: resolvedBorderColor, backgroundColor: resolvedCardBgColor }}
              >
                <h3 className="mb-4 text-lg font-semibold" style={{ color: resolvedTextColor }}>
                  {orderSummaryLabel}
                </h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: `${resolvedTextColor}60` }}>{subtotalLabel}</span>
                    <span style={{ color: resolvedTextColor }}>{formatPrice(runtime.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: `${resolvedTextColor}60` }}>{shippingLabel}</span>
                    <span style={{ color: resolvedTextColor }}>
                      {runtime.shippingLoading
                        ? 'Calcul...'
                        : runtime.shippingAmount === 0
                          ? 'Gratuite'
                          : formatPrice(runtime.shippingAmount)}
                    </span>
                  </div>
                  {typeof runtime.taxAmount === 'number' && runtime.taxRate && (
                    <div className="flex justify-between">
                      <span style={{ color: `${resolvedTextColor}60` }}>Taxes ({runtime.taxRate}%)</span>
                      <span style={{ color: resolvedTextColor }}>{formatPrice(runtime.taxAmount)}</span>
                    </div>
                  )}
                  {runtime.freeShippingMessage && (
                    <p className="text-xs" style={{ color: `${resolvedTextColor}60` }}>
                      {runtime.freeShippingMessage}
                    </p>
                  )}
                  <div className="border-t pt-2" style={{ borderColor: resolvedBorderColor }}>
                    <div className="flex justify-between text-lg font-bold">
                      <span style={{ color: resolvedTextColor }}>{totalLabel}</span>
                      <span style={{ color: resolvedAccentColor }}>{formatPrice(runtime.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs" style={{ color: `${resolvedTextColor}60` }}>
                  <Lock className="h-4 w-4" />
                  Paiement sécurisé
                </div>
              </div>
            </div>
          )}
        </div>
      </SectionContainer>
    </SectionWrapper>
  );
}

export default CheckoutContent;

Object.assign(CheckoutContent, { schema: checkoutContentSchema });

export const schema = checkoutContentSchema;
