'use client';

// ============================================
// REGISTER — 100% Configurable Architecture
// ============================================

import { useEffect, useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Phone, Chrome, Facebook, Apple, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from '@/lib/router';
import { useBoutiqueClientRegisterMutation, useBoutiqueClientSessionQuery } from '@/hooks/useBoutiqueClient';
import { toast } from 'sonner';
import {
  SectionWrapper,
  SectionContainer,
} from '@/components/SectionWrapper';
import { cn, useSectionStyles } from '@/hooks/useSectionStyles';
import registerSchema from './Register.schema';

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────
export interface RegisterContent {
  title?: string;
  subtitle?: string;
  firstNameLabel?: string;
  firstNamePlaceholder?: string;
  lastNameLabel?: string;
  lastNamePlaceholder?: string;
  emailLabel?: string;
  emailPlaceholder?: string;
  phoneLabel?: string;
  phonePlaceholder?: string;
  passwordLabel?: string;
  passwordPlaceholder?: string;
  passwordConfirmLabel?: string;
  passwordConfirmPlaceholder?: string;
  termsLabel?: string;
  newsletterLabel?: string;
  submitButtonText?: string;
  loadingText?: string;
  socialLoginDivider?: string;
  hasAccountText?: string;
  loginLinkText?: string;
}

export interface RegisterConfig {
  variant?: 'centered' | 'split' | 'minimal';
  showFirstName?: boolean;
  showLastName?: boolean;
  showEmail?: boolean;
  showPhone?: boolean;
  showPassword?: boolean;
  showPasswordConfirm?: boolean;
  showTerms?: boolean;
  showNewsletter?: boolean;
  showSocialLogin?: boolean;
  socialProviders?: ('google' | 'facebook' | 'apple')[];
  requireTerms?: boolean;
}

export interface RegisterProps {
  id?: string;
  testId?: string;
  content?: RegisterContent;
  config?: RegisterConfig;
  style?: {
    colors?: {
      background?: string;
      cardBackground?: string;
      text?: string;
      accent?: string;
      border?: string;
    };
    spacing?: {
      paddingY?: string;
      container?: 'full' | 'contained' | 'narrow';
    };
  };
  classes?: {
    root?: string;
    container?: string;
    card?: string;
    title?: string;
    subtitle?: string;
    form?: string;
    inputGroup?: string;
    input?: string;
    button?: string;
    socialButton?: string;
    footer?: string;
  };
  storefrontStore?: { storeSlug?: string };
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
// SOCIAL ICON COMPONENT
// ─────────────────────────────────────────
function SocialIcon({ provider }: { provider: string }) {
  switch (provider) {
    case 'google':
      return <Chrome className="w-5 h-5" />;
    case 'facebook':
      return <Facebook className="w-5 h-5" />;
    case 'apple':
      return <Apple className="w-5 h-5" />;
    default:
      return null;
  }
}

function SocialLabel({ provider }: { provider: string }) {
  switch (provider) {
    case 'google':
      return 'Google';
    case 'facebook':
      return 'Facebook';
    case 'apple':
      return 'Apple';
    default:
      return provider;
  }
}

// ─────────────────────────────────────────
// MAIN REGISTER COMPONENT
// ─────────────────────────────────────────
export function Register({
  id,
  testId,
  content = {},
  config = {},
  style = {},
  classes = {},
  storefrontStore,
}: RegisterProps) {
  const navigate = useNavigate();
  const storeSlug = storefrontStore?.storeSlug || '';

  // ── EXTRACT CONTENT ──
  const {
    title = 'Créer un compte',
    subtitle = 'Rejoignez notre communauté',
    firstNameLabel = 'Prénom',
    firstNamePlaceholder = 'Jean',
    lastNameLabel = 'Nom',
    lastNamePlaceholder = 'Dupont',
    emailLabel = 'Adresse email',
    emailPlaceholder = 'vous@exemple.com',
    phoneLabel = 'Téléphone',
    phonePlaceholder = '+509...',
    passwordLabel = 'Mot de passe',
    passwordPlaceholder = '••••••••',
    passwordConfirmLabel = 'Confirmer le mot de passe',
    passwordConfirmPlaceholder = '••••••••',
    termsLabel = "J'accepte les conditions d'utilisation",
    newsletterLabel = 'Je souhaite recevoir la newsletter',
    submitButtonText = 'Créer mon compte',
    loadingText = 'Création...',
    socialLoginDivider = 'Ou avec email',
    hasAccountText = 'Déjà un compte?',
    loginLinkText = 'Se connecter',
  } = content;

  // ── EXTRACT CONFIG ──
  const {
    variant = 'centered',
    showFirstName = true,
    showLastName = true,
    showEmail = true,
    showPhone = true,
    showPassword = true,
    showPasswordConfirm = true,
    showTerms = true,
    showNewsletter = true,
    showSocialLogin = true,
    socialProviders = ['google', 'facebook', 'apple'],
    requireTerms = true,
  } = config;

  // ── EXTRACT STYLE ──
  const {
    colors: styleColors = {},
    spacing: styleSpacing = {},
  } = style;

  const {
    background: backgroundColor = 'white',
    cardBackground: cardBgColor = 'white',
    text: textColor = 'primary',
    accent: accentColor = 'accent',
    border: borderColor,
  } = styleColors;

  const {
    container = 'contained',
    paddingY = '16',
  } = styleSpacing;

  // ── STATE ──
  const [showPasswordState, setShowPasswordState] = useState(false);
  const [showPasswordConfirmState, setShowPasswordConfirmState] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    passwordConfirm: '',
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [newsletter, setNewsletter] = useState(false);

  // ── HOOKS ──
  const sessionQuery = useBoutiqueClientSessionQuery(storeSlug);
  const registerMutation = useBoutiqueClientRegisterMutation(storeSlug);
  const { css } = useSectionStyles(style);

  // ── HELPERS ──
  const resolvedBgColor = resolveColor(backgroundColor, '#f5f5f5');
  const resolvedCardBgColor = resolveColor(cardBgColor, '#ffffff');
  const resolvedTextColor = resolveColor(textColor, '#1a1a1a');
  const resolvedAccentColor = resolveColor(accentColor, '#c9a96e');
  const resolvedBorderColor = borderColor ? resolveColor(borderColor, `${resolvedTextColor}10`) : `${resolvedTextColor}10`;

  useEffect(() => {
    if (sessionQuery.data?.customer) {
      navigate('account');
    }
  }, [navigate, sessionQuery.data?.customer]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!storeSlug) {
      toast.error('Boutique indisponible pour inscription.');
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      toast.error('Les mots de passe ne correspondent pas.');
      return;
    }

    if (requireTerms && showTerms && !acceptTerms) {
      toast.error('Veuillez accepter les conditions.');
      return;
    }

    try {
      await registerMutation.mutateAsync({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || undefined,
        password: formData.password,
      });
      toast.success(newsletter ? 'Inscription réussie. Bienvenue!' : 'Compte créé avec succès.');
      navigate('account');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Inscription impossible.');
    }
  };

  // ── RENDER ──
  return (
    <SectionWrapper
      id={id}
      testId={testId}
      as="section"
      className={cn('min-h-screen flex items-center justify-center', classes.root)}
      style={{
        backgroundColor: resolvedBgColor,
        color: resolvedTextColor,
        paddingTop: `${parseInt(paddingY) * 0.25}rem`,
        paddingBottom: `${parseInt(paddingY) * 0.25}rem`,
        ...css,
      }}
    >
      <SectionContainer size={container} className={cn('w-full', classes.container)}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={cn(
            'max-w-lg w-full mx-auto space-y-6 rounded-2xl shadow-xl p-8 sm:p-10',
            classes.card
          )}
          style={{ backgroundColor: resolvedCardBgColor }}
        >
          {/* Header */}
          <div className="text-center">
            <h2
              className={cn('text-3xl font-bold tracking-tight', classes.title)}
              style={{ color: resolvedTextColor }}
            >
              {title}
            </h2>
            <p className={cn('mt-2 text-sm', classes.subtitle)} style={{ color: `${resolvedTextColor}80` }}>
              {subtitle}
            </p>
          </div>

          {/* Social Login */}
          {showSocialLogin && socialProviders.length > 0 && (
            <div className="space-y-3">
              <div className={`grid gap-3 ${socialProviders.length === 1 ? 'grid-cols-1' : socialProviders.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {socialProviders.map((provider) => (
                  <motion.button
                    key={provider}
                    type="button"
                    className={cn(
                      'w-full inline-flex justify-center py-2.5 px-4 border rounded-lg shadow-sm bg-white text-sm font-medium transition-all',
                      classes.socialButton
                    )}
                    style={{ borderColor: resolvedBorderColor, color: resolvedTextColor }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <SocialIcon provider={provider} />
                    <span className="ml-2 hidden sm:inline">{SocialLabel({ provider })}</span>
                  </motion.button>
                ))}
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: resolvedBorderColor }} />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white" style={{ color: `${resolvedTextColor}60` }}>
                    {socialLoginDivider}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form className={cn('space-y-4', classes.form)} onSubmit={handleSubmit}>
            {/* Names */}
            {(showFirstName || showLastName) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {showFirstName && (
                  <div className={classes.inputGroup}>
                    <label htmlFor="firstName" className="block text-sm font-medium" style={{ color: resolvedTextColor }}>
                      {firstNameLabel}
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5" style={{ color: `${resolvedTextColor}60` }} />
                      </div>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                        className={cn(
                          'appearance-none block w-full pl-10 pr-3 py-2.5 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 transition-all sm:text-sm',
                          classes.input
                        )}
                        style={{ borderColor: resolvedBorderColor, color: resolvedTextColor }}
                        placeholder={firstNamePlaceholder}
                      />
                    </div>
                  </div>
                )}
                {showLastName && (
                  <div className={classes.inputGroup}>
                    <label htmlFor="lastName" className="block text-sm font-medium" style={{ color: resolvedTextColor }}>
                      {lastNameLabel}
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5" style={{ color: `${resolvedTextColor}60` }} />
                      </div>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                        className={cn(
                          'appearance-none block w-full pl-10 pr-3 py-2.5 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 transition-all sm:text-sm',
                          classes.input
                        )}
                        style={{ borderColor: resolvedBorderColor, color: resolvedTextColor }}
                        placeholder={lastNamePlaceholder}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Email */}
            {showEmail && (
              <div className={classes.inputGroup}>
                <label htmlFor="email" className="block text-sm font-medium" style={{ color: resolvedTextColor }}>
                  {emailLabel}
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5" style={{ color: `${resolvedTextColor}60` }} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={cn(
                      'appearance-none block w-full pl-10 pr-3 py-2.5 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 transition-all sm:text-sm',
                      classes.input
                    )}
                    style={{ borderColor: resolvedBorderColor, color: resolvedTextColor }}
                    placeholder={emailPlaceholder}
                  />
                </div>
              </div>
            )}

            {/* Phone */}
            {showPhone && (
              <div className={classes.inputGroup}>
                <label htmlFor="phone" className="block text-sm font-medium" style={{ color: resolvedTextColor }}>
                  {phoneLabel}
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5" style={{ color: `${resolvedTextColor}60` }} />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className={cn(
                      'appearance-none block w-full pl-10 pr-3 py-2.5 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 transition-all sm:text-sm',
                      classes.input
                    )}
                    style={{ borderColor: resolvedBorderColor, color: resolvedTextColor }}
                    placeholder={phonePlaceholder}
                  />
                </div>
              </div>
            )}

            {/* Password */}
            {showPassword && (
              <div className={classes.inputGroup}>
                <label htmlFor="password" className="block text-sm font-medium" style={{ color: resolvedTextColor }}>
                  {passwordLabel}
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5" style={{ color: `${resolvedTextColor}60` }} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPasswordState ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className={cn(
                      'appearance-none block w-full pl-10 pr-10 py-2.5 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 transition-all sm:text-sm',
                      classes.input
                    )}
                    style={{ borderColor: resolvedBorderColor, color: resolvedTextColor }}
                    placeholder={passwordPlaceholder}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordState(!showPasswordState)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPasswordState ? (
                      <EyeOff className="h-5 w-5" style={{ color: `${resolvedTextColor}60` }} />
                    ) : (
                      <Eye className="h-5 w-5" style={{ color: `${resolvedTextColor}60` }} />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Password Confirm */}
            {showPasswordConfirm && (
              <div className={classes.inputGroup}>
                <label htmlFor="passwordConfirm" className="block text-sm font-medium" style={{ color: resolvedTextColor }}>
                  {passwordConfirmLabel}
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5" style={{ color: `${resolvedTextColor}60` }} />
                  </div>
                  <input
                    id="passwordConfirm"
                    name="passwordConfirm"
                    type={showPasswordConfirmState ? 'text' : 'password'}
                    required
                    value={formData.passwordConfirm}
                    onChange={(e) => handleChange('passwordConfirm', e.target.value)}
                    className={cn(
                      'appearance-none block w-full pl-10 pr-10 py-2.5 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 transition-all sm:text-sm',
                      classes.input
                    )}
                    style={{ borderColor: resolvedBorderColor, color: resolvedTextColor }}
                    placeholder={passwordConfirmPlaceholder}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirmState(!showPasswordConfirmState)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPasswordConfirmState ? (
                      <EyeOff className="h-5 w-5" style={{ color: `${resolvedTextColor}60` }} />
                    ) : (
                      <Eye className="h-5 w-5" style={{ color: `${resolvedTextColor}60` }} />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Terms */}
            {showTerms && (
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required={requireTerms}
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 focus:ring-2"
                    style={{ accentColor: resolvedAccentColor }}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="font-medium" style={{ color: resolvedTextColor }}>
                    {termsLabel}
                  </label>
                </div>
              </div>
            )}

            {/* Newsletter */}
            {showNewsletter && (
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="newsletter"
                    name="newsletter"
                    type="checkbox"
                    checked={newsletter}
                    onChange={(e) => setNewsletter(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 focus:ring-2"
                    style={{ accentColor: resolvedAccentColor }}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="newsletter" className="font-medium" style={{ color: resolvedTextColor }}>
                    {newsletterLabel}
                  </label>
                </div>
              </div>
            )}

            {/* Submit */}
            <div>
              <motion.button
                type="submit"
                disabled={registerMutation.isPending || sessionQuery.isLoading}
                className={cn(
                  'group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-60',
                  classes.button
                )}
                style={{
                  backgroundColor: resolvedAccentColor,
                  boxShadow: `0 4px 14px 0 ${resolvedAccentColor}40`,
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Check className="w-5 h-5 mr-2" />
                {registerMutation.isPending ? loadingText : submitButtonText}
              </motion.button>
            </div>
          </form>

          {/* Footer */}
          <div className={cn('text-center', classes.footer)}>
            <p className="text-sm" style={{ color: `${resolvedTextColor}80` }}>
              {hasAccountText}{' '}
              <button
                type="button"
                onClick={() => navigate('login')}
                className="font-medium hover:opacity-80 transition-opacity"
                style={{ color: resolvedAccentColor }}
              >
                {loginLinkText}
              </button>
            </p>
          </div>
        </motion.div>
      </SectionContainer>
    </SectionWrapper>
  );
}

Object.assign(Register, { schema: registerSchema });

export const schema = registerSchema;

export default Register;
