'use client';

// ============================================
// LOGIN — 100% Configurable Architecture
// ============================================

import { useEffect, useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Chrome, Facebook, Apple } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from '@/lib/router';
import { useBoutiqueClientLoginMutation, useBoutiqueClientSessionQuery } from '@/hooks/useBoutiqueClient';
import { toast } from 'sonner';
import {
  SectionWrapper,
  SectionContainer,
} from '@/components/SectionWrapper';
import { cn, useSectionStyles } from '@/hooks/useSectionStyles';
import loginSchema from './Login.schema';

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────
export interface LoginContent {
  title?: string;
  subtitle?: string;
  emailLabel?: string;
  emailPlaceholder?: string;
  passwordLabel?: string;
  passwordPlaceholder?: string;
  rememberMeLabel?: string;
  forgotPasswordLabel?: string;
  submitButtonText?: string;
  loadingText?: string;
  socialLoginDivider?: string;
  noAccountText?: string;
  registerLinkText?: string;
}

export interface LoginConfig {
  variant?: 'centered' | 'split' | 'minimal';
  showEmail?: boolean;
  showPassword?: boolean;
  showRememberMe?: boolean;
  showForgotPassword?: boolean;
  showSocialLogin?: boolean;
  socialProviders?: ('google' | 'facebook' | 'apple')[];
  redirectAfterLogin?: string;
}

export interface LoginProps {
  id?: string;
  testId?: string;
  content?: LoginContent;
  config?: LoginConfig;
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
// MAIN LOGIN COMPONENT
// ─────────────────────────────────────────
export function Login({
  id,
  testId,
  content = {},
  config = {},
  style = {},
  classes = {},
  storefrontStore,
}: LoginProps) {
  const navigate = useNavigate();
  const storeSlug = storefrontStore?.storeSlug || '';

  // ── EXTRACT CONTENT ──
  const {
    title = 'Connexion',
    subtitle = 'Accédez à votre compte',
    emailLabel = 'Adresse email',
    emailPlaceholder = 'vous@exemple.com',
    passwordLabel = 'Mot de passe',
    passwordPlaceholder = '••••••••',
    rememberMeLabel = 'Se souvenir de moi',
    forgotPasswordLabel = 'Mot de passe oublié?',
    submitButtonText = 'Se connecter',
    loadingText = 'Connexion...',
    socialLoginDivider = 'Ou continuer avec',
    noAccountText = "Pas encore de compte?",
    registerLinkText = 'Créer un compte',
  } = content;

  // ── EXTRACT CONFIG ──
  const {
    variant = 'centered',
    showEmail = true,
    showPassword = true,
    showRememberMe = true,
    showForgotPassword = true,
    showSocialLogin = true,
    socialProviders = ['google', 'facebook', 'apple'],
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // ── HOOKS ──
  const sessionQuery = useBoutiqueClientSessionQuery(storeSlug);
  const loginMutation = useBoutiqueClientLoginMutation(storeSlug);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!storeSlug) {
      toast.error('Boutique indisponible pour la connexion.');
      return;
    }

    try {
      await loginMutation.mutateAsync({ email, password });
      toast.success('Connexion réussie');
      navigate('account');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Connexion impossible.');
    }
  };

  // ── RENDER ──
  return (
    <SectionWrapper
      id={id}
      testId={testId}
      as="section"
      className={cn(
        'min-h-screen flex items-center justify-center',
        classes.root
      )}
      style={{
        backgroundColor: resolvedBgColor,
        color: resolvedTextColor,
        paddingTop: `${parseInt(paddingY) * 0.25}rem`,
        paddingBottom: `${parseInt(paddingY) * 0.25}rem`,
        ...css,
      }}
    >
      <SectionContainer
        size={container}
        className={cn(
          'w-full',
          classes.container
        )}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={cn(
            'max-w-md w-full mx-auto space-y-8 rounded-2xl shadow-xl p-8 sm:p-12',
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

          {/* Form */}
          <form className={cn('mt-8 space-y-6', classes.form)} onSubmit={handleSubmit}>
            <div className="space-y-4">
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={cn(
                        'appearance-none block w-full pl-10 pr-3 py-3 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 transition-all sm:text-sm',
                        classes.input
                      )}
                      style={{
                        borderColor: resolvedBorderColor,
                        color: resolvedTextColor,
                      }}
                      placeholder={emailPlaceholder}
                    />
                  </div>
                </div>
              )}

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
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={cn(
                        'appearance-none block w-full pl-10 pr-10 py-3 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 transition-all sm:text-sm',
                        classes.input
                      )}
                      style={{
                        borderColor: resolvedBorderColor,
                        color: resolvedTextColor,
                      }}
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
            </div>

            <div className="flex items-center justify-between">
              {showRememberMe && (
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 focus:ring-2"
                    style={{ accentColor: resolvedAccentColor }}
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm" style={{ color: resolvedTextColor }}>
                    {rememberMeLabel}
                  </label>
                </div>
              )}
              {showForgotPassword && (
                <div className="text-sm">
                  <span className="font-medium cursor-pointer hover:opacity-80" style={{ color: resolvedAccentColor }}>
                    {forgotPasswordLabel}
                  </span>
                </div>
              )}
            </div>

            <div>
              <motion.button
                type="submit"
                disabled={loginMutation.isPending || sessionQuery.isLoading}
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
                {loginMutation.isPending ? loadingText : submitButtonText}
              </motion.button>
            </div>
          </form>

          {/* Social Login */}
          {showSocialLogin && socialProviders.length > 0 && (
            <div className="mt-6">
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

              <div className={`mt-6 grid gap-3 ${socialProviders.length === 1 ? 'grid-cols-1' : socialProviders.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
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
            </div>
          )}

          {/* Footer */}
          <div className={cn('text-center mt-4', classes.footer)}>
            <p className="text-sm" style={{ color: `${resolvedTextColor}80` }}>
              {noAccountText}{' '}
              <button
                type="button"
                onClick={() => navigate('register')}
                className="font-medium hover:opacity-80 transition-opacity"
                style={{ color: resolvedAccentColor }}
              >
                {registerLinkText}
              </button>
            </p>
          </div>
        </motion.div>
      </SectionContainer>
    </SectionWrapper>
  );
}

Object.assign(Login, { schema: loginSchema });

export const schema = loginSchema;

export default Login;
