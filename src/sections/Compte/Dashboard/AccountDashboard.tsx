'use client';

// ============================================
// ACCOUNT DASHBOARD — 100% Configurable Architecture
// ============================================

import { useMemo, useState } from 'react';
import {
  User,
  MapPin,
  ShoppingBag,
  Truck,
  Settings,
  ChevronRight,
  Package,
  Clock,
  CheckCircle,
  Star,
  Plus,
  Edit2,
  Trash2,
  LogOut,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from '@/lib/router';
import {
  useAddBoutiqueClientAddressMutation,
  useBoutiqueClientAddressesQuery,
  useDeleteBoutiqueClientAccountMutation,
  useBoutiqueClientLogoutMutation,
  useBoutiqueClientOrdersQuery,
  useBoutiqueClientProfileMutation,
  useBoutiqueClientSessionQuery,
  useDeleteBoutiqueClientAddressMutation,
  useUpdateBoutiqueClientAddressMutation,
} from '@/hooks/useBoutiqueClient';
import { AddressForm } from '@/components/checkout/AddressForm';
import type { Address } from '@/data/types';
import { toast } from 'sonner';
import {
  SectionWrapper,
  SectionContainer,
} from '@/components/SectionWrapper';
import { cn, useSectionStyles } from '@/hooks/useSectionStyles';
import { accountDashboardSchema } from './AccountDashboard.schema';

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────
type DashboardAddress = Address & {
  id: string;
  name: string;
  street: string;
};

type DashboardOrder = {
  id: string;
  date: string;
  status: 'pending' | 'confirmed' | 'processing' | 'ready_for_pickup' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  total: number;
  items: number;
  trackingNumber?: string;
};

type ProfileFormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export interface AccountDashboardContent {
  title?: string;
  subtitle?: string;
  welcomeMessage?: string;
  memberSinceLabel?: string;
  ordersLabel?: string;
  inProgressLabel?: string;
  addressesLabel?: string;
  loyaltyPointsLabel?: string;
  noOrdersMessage?: string;
  addAddressLabel?: string;
  defaultAddressLabel?: string;
  editLabel?: string;
  deleteLabel?: string;
  logoutLabel?: string;
  saveLabel?: string;
  cancelLabel?: string;
  loginTitle?: string;
  loginSubtitle?: string;
  loginButtonLabel?: string;
  registerButtonLabel?: string;
}

export interface AccountDashboardConfig {
  variant?: 'sidebar' | 'tabs' | 'minimal';
  showStats?: boolean;
  showOrders?: boolean;
  showAddresses?: boolean;
  showProfile?: boolean;
  showLogout?: boolean;
  enableAccountDelete?: boolean;
}

export interface AccountDashboardProps {
  id?: string;
  testId?: string;
  content?: AccountDashboardContent;
  config?: AccountDashboardConfig;
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
    sidebar?: string;
    content?: string;
    card?: string;
    title?: string;
    statCard?: string;
    orderItem?: string;
    addressCard?: string;
    menuItem?: string;
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

const orderStatusConfig = {
  pending: { label: 'En attente', color: '#f59e0b', icon: Clock, bgColor: '#fef3c7' },
  confirmed: { label: 'Confirmée', color: '#0ea5e9', icon: CheckCircle, bgColor: '#e0f2fe' },
  processing: { label: 'En préparation', color: '#3b82f6', icon: Package, bgColor: '#dbeafe' },
  ready_for_pickup: { label: 'Prête à retirer', color: '#f97316', icon: MapPin, bgColor: '#ffedd5' },
  shipped: { label: 'Expédiée', color: '#8b5cf6', icon: Truck, bgColor: '#ede9fe' },
  delivered: { label: 'Livrée', color: '#10b981', icon: CheckCircle, bgColor: '#d1fae5' },
  cancelled: { label: 'Annulée', color: '#ef4444', icon: Trash2, bgColor: '#fee2e2' },
  refunded: { label: 'Remboursée', color: '#6b7280', icon: Clock, bgColor: '#f3f4f6' },
} as const;

function normalizeOrderStatus(value: unknown): DashboardOrder['status'] {
  const normalizedValue = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (normalizedValue in orderStatusConfig) {
    return normalizedValue as DashboardOrder['status'];
  }
  return 'pending';
}

function getOrderStatusMeta(value: unknown) {
  return orderStatusConfig[normalizeOrderStatus(value)] || orderStatusConfig.pending;
}

function getInitials(firstName?: string, lastName?: string) {
  return `${String(firstName || '').charAt(0)}${String(lastName || '').charAt(0)}`.trim() || 'CL';
}

const menuItems = [
  { id: 'dashboard', label: 'Tableau de bord', icon: User },
  { id: 'orders', label: 'Mes commandes', icon: ShoppingBag },
  { id: 'tracking', label: 'Suivi des livraisons', icon: Truck },
  { id: 'addresses', label: 'Adresses', icon: MapPin },
  { id: 'profile', label: 'Mon profil', icon: Settings },
] as const;

// ─────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────
export function AccountDashboard({
  id,
  testId,
  content = {},
  config = {},
  style = {},
  classes = {},
  storefrontStore,
}: AccountDashboardProps) {
  const navigate = useNavigate();
  const storeSlug = storefrontStore?.storeSlug || '';

  // ── EXTRACT CONTENT ──
  const {
    title = 'Mon Compte',
    subtitle = 'Gérez vos informations et vos commandes',
    welcomeMessage = 'Bonjour',
    memberSinceLabel = 'Membre depuis',
    ordersLabel = 'Commandes',
    inProgressLabel = 'En cours',
    addressesLabel = 'Adresses',
    loyaltyPointsLabel = 'Points fidélité',
    noOrdersMessage = 'Aucune commande pour le moment.',
    addAddressLabel = 'Ajouter une adresse',
    defaultAddressLabel = 'Par défaut',
    editLabel = 'Modifier',
    deleteLabel = 'Supprimer',
    logoutLabel = 'Déconnexion',
    saveLabel = 'Enregistrer',
    cancelLabel = 'Annuler',
    loginTitle = 'Connectez-vous',
    loginSubtitle = 'Connectez-vous ou créez un compte pour accéder à votre espace client.',
    loginButtonLabel = 'Connexion',
    registerButtonLabel = 'Inscription',
  } = content;

  // ── EXTRACT CONFIG ──
  const {
    variant = 'sidebar',
    showStats = true,
    showOrders = true,
    showAddresses = true,
    showProfile = true,
    showLogout = true,
    enableAccountDelete = true,
  } = config;

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

  // ── STATE ──
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileFormState | null>(null);
  const [addressForm, setAddressForm] = useState<Partial<Address>>({
    label: '',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    department: '',
    arrondissement: '',
    commune: '',
    communalSection: '',
    city: '',
    country: 'Haiti',
    postalCode: '',
    phone: '',
    isDefault: false,
  });

  // ── HOOKS ──
  const sessionQuery = useBoutiqueClientSessionQuery(storeSlug);
  const addressesQuery = useBoutiqueClientAddressesQuery(storeSlug, Boolean(sessionQuery.data?.customer));
  const ordersQuery = useBoutiqueClientOrdersQuery(storeSlug, Boolean(sessionQuery.data?.customer));
  const profileMutation = useBoutiqueClientProfileMutation(storeSlug);
  const logoutMutation = useBoutiqueClientLogoutMutation(storeSlug);
  const deleteAccountMutation = useDeleteBoutiqueClientAccountMutation(storeSlug);
  const addAddressMutation = useAddBoutiqueClientAddressMutation(storeSlug);
  const updateAddressMutation = useUpdateBoutiqueClientAddressMutation(storeSlug);
  const deleteAddressMutation = useDeleteBoutiqueClientAddressMutation(storeSlug);
  const { css } = useSectionStyles(style);

  // ── HELPERS ──
  const resolvedBgColor = resolveColor(backgroundColor, '#f8fafc');
  const resolvedTextColor = resolveColor(textColor, '#1e293b');
  const resolvedAccentColor = resolveColor(accentColor, '#c9a96e');
  const resolvedCardBgColor = resolveColor(cardBgColor, '#ffffff');
  const resolvedBorderColor = borderColor ? resolveColor(borderColor, `${resolvedTextColor}10`) : `${resolvedTextColor}10`;

  const customer = sessionQuery.data?.customer || null;
  const defaultProfileForm = useMemo<ProfileFormState>(
    () => ({
      firstName: customer?.firstName || '',
      lastName: customer?.lastName || '',
      email: customer?.email || '',
      phone: customer?.phone || '',
    }),
    [customer?.email, customer?.firstName, customer?.lastName, customer?.phone]
  );
  const resolvedProfileForm = profileForm ?? defaultProfileForm;

  const resolvedAddresses = useMemo<DashboardAddress[]>(
    () =>
      (addressesQuery.data || []).map((address, index) => ({
        id: address.id || String(index),
        name: address.label || `Adresse ${index + 1}`,
        street: address.address,
        address: address.address,
        apartment: address.apartment,
        department: address.department,
        arrondissement: address.arrondissement,
        commune: address.commune,
        communalSection: address.communalSection,
        city: address.city,
        postalCode: address.postalCode || '',
        country: address.country,
        isDefault: Boolean(address.isDefault),
        phone: address.phone,
        firstName: address.firstName,
        lastName: address.lastName,
        label: address.label,
        latitude: address.latitude,
        longitude: address.longitude,
      })),
    [addressesQuery.data]
  );

  const resolvedOrders = useMemo<DashboardOrder[]>(
    () =>
      (ordersQuery.data || []).map((order) => ({
        id: order.orderNumber || order.id,
        date: order.createdAt,
        status: normalizeOrderStatus(order.status),
        total: order.total,
        items: order.items.length,
        trackingNumber: order.trackingNumber,
      })),
    [ordersQuery.data]
  );

  const resetAddressForm = () => {
    setEditingAddressId(null);
    setShowAddressForm(false);
    setAddressForm({
      label: '',
      firstName: customer?.firstName || '',
      lastName: customer?.lastName || '',
      address: '',
      apartment: '',
      department: '',
      arrondissement: '',
      commune: '',
      communalSection: '',
      city: '',
      country: 'Haiti',
      postalCode: '',
      phone: '',
      isDefault: false,
    });
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.success('Déconnexion réussie');
      navigate('home');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Déconnexion impossible.');
    }
  };

  const handleSaveProfile = async () => {
    try {
      await profileMutation.mutateAsync(resolvedProfileForm);
      toast.success('Profil mis à jour');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Mise à jour impossible.');
    }
  };

  const handleStartEditAddress = (addressId: string) => {
    const currentAddress = addressesQuery.data?.find((item) => item.id === addressId);
    if (!currentAddress) return;

    setEditingAddressId(addressId);
    setShowAddressForm(true);
    setAddressForm({
      label: currentAddress.label || '',
      firstName: currentAddress.firstName || customer?.firstName || '',
      lastName: currentAddress.lastName || customer?.lastName || '',
      address: currentAddress.address,
      apartment: currentAddress.apartment || '',
      department: currentAddress.department || '',
      arrondissement: currentAddress.arrondissement || '',
      commune: currentAddress.commune || '',
      communalSection: currentAddress.communalSection || '',
      city: currentAddress.city,
      country: currentAddress.country,
      postalCode: currentAddress.postalCode || '',
      phone: currentAddress.phone || '',
      isDefault: Boolean(currentAddress.isDefault),
      latitude: currentAddress.latitude,
      longitude: currentAddress.longitude,
    });
  };

  const handleSaveAddress = async (nextAddress: Address) => {
    try {
      const payload = {
        id: editingAddressId || undefined,
        ...nextAddress,
        firstName: nextAddress.firstName || customer?.firstName || '',
        lastName: nextAddress.lastName || customer?.lastName || '',
      };

      if (editingAddressId) {
        await updateAddressMutation.mutateAsync({ id: editingAddressId, address: payload });
        toast.success('Adresse mise à jour');
      } else {
        await addAddressMutation.mutateAsync(payload);
        toast.success('Adresse ajoutée');
      }
      resetAddressForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Adresse impossible à enregistrer.');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      await deleteAddressMutation.mutateAsync(addressId);
      toast.success('Adresse supprimée');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Suppression impossible.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!storeSlug || !customer) return;
    const confirmed = window.confirm('Voulez-vous vraiment supprimer votre compte client?');
    if (!confirmed) return;

    try {
      await deleteAccountMutation.mutateAsync();
      toast.success('Compte client supprimé');
      navigate('home');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Suppression impossible.');
    }
  };

  // ── LOADING STATE ──
  if (sessionQuery.isLoading) {
    return (
      <SectionWrapper
        id={id}
        testId={testId}
        as="section"
        className={cn('min-h-screen', classes.root)}
        style={{ backgroundColor: resolvedBgColor, ...css }}
      >
        <SectionContainer size={container} className="py-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-3xl border p-10 text-center shadow-sm"
            style={{ borderColor: resolvedBorderColor, backgroundColor: resolvedCardBgColor }}
          >
            <h2 className="text-2xl font-bold" style={{ color: resolvedTextColor }}>
              Chargement de votre compte...
            </h2>
          </motion.div>
        </SectionContainer>
      </SectionWrapper>
    );
  }

  // ── NOT LOGGED IN STATE ──
  if (!customer) {
    return (
      <SectionWrapper
        id={id}
        testId={testId}
        as="section"
        className={cn('min-h-screen', classes.root)}
        style={{ backgroundColor: resolvedBgColor, ...css }}
      >
        <SectionContainer size={container} className="py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border p-10 text-center shadow-sm max-w-3xl mx-auto"
            style={{ borderColor: resolvedBorderColor, backgroundColor: resolvedCardBgColor }}
          >
            <h2 className="text-3xl font-bold" style={{ color: resolvedTextColor }}>
              {loginTitle}
            </h2>
            <p className="mt-3" style={{ color: `${resolvedTextColor}80` }}>
              {loginSubtitle}
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate('login')}
                className="rounded-xl border px-6 py-3 text-sm font-medium hover:bg-gray-50 transition-all"
                style={{ borderColor: resolvedBorderColor, color: resolvedTextColor }}
              >
                {loginButtonLabel}
              </button>
              <button
                type="button"
                onClick={() => navigate('register')}
                className="rounded-xl px-6 py-3 text-sm font-medium text-white transition-all hover:opacity-90"
                style={{ backgroundColor: resolvedAccentColor }}
              >
                {registerButtonLabel}
              </button>
            </div>
          </motion.div>
        </SectionContainer>
      </SectionWrapper>
    );
  }

  // ── MAIN DASHBOARD ──
  return (
    <SectionWrapper
      id={id}
      testId={testId}
      as="section"
      className={cn('min-h-screen', classes.root)}
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
          <h2 className={cn('text-3xl font-bold', classes.title)} style={{ color: resolvedTextColor }}>
            {title}
          </h2>
          <p style={{ color: `${resolvedTextColor}80` }}>{subtitle}</p>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar */}
          <div className={cn('lg:w-64 shrink-0', classes.sidebar)}>
            <div
              className="sticky top-24 overflow-hidden rounded-xl border shadow-sm"
              style={{ borderColor: resolvedBorderColor, backgroundColor: resolvedCardBgColor }}
            >
              <div className="border-b p-4" style={{ borderColor: resolvedBorderColor }}>
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${resolvedAccentColor}, ${resolvedAccentColor}dd)` }}
                  >
                    {getInitials(customer.firstName, customer.lastName)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: resolvedTextColor }}>
                      {customer.firstName} {customer.lastName}
                    </p>
                    <p className="text-xs" style={{ color: `${resolvedTextColor}60` }}>
                      {customer.email}
                    </p>
                  </div>
                </div>
              </div>
              <nav className="p-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                        isActive ? 'text-white' : 'hover:bg-gray-50',
                        classes.menuItem
                      )}
                      style={{
                        backgroundColor: isActive ? resolvedAccentColor : undefined,
                        color: isActive ? '#fff' : `${resolvedTextColor}99`,
                      }}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                      {isActive ? <ChevronRight className="ml-auto h-4 w-4" /> : null}
                    </button>
                  );
                })}
              </nav>
              {showLogout && (
                <div className="border-t p-2" style={{ borderColor: resolvedBorderColor }}>
                  <button
                    onClick={() => void handleLogout()}
                    disabled={logoutMutation.isPending}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5" />
                    {logoutMutation.isPending ? 'Déconnexion...' : logoutLabel}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className={cn('flex-1 space-y-6', classes.content)}>
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && showStats && (
              <>
                {/* Welcome Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl p-6 text-white shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${resolvedAccentColor}, ${resolvedAccentColor}dd)` }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold">
                        {welcomeMessage}, {customer.firstName}!
                      </h3>
                      <p className="mt-1 opacity-80">
                        {memberSinceLabel} {new Date(customer.createdAt).getFullYear()}
                      </p>
                    </div>
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                      <User className="h-8 w-8" />
                    </div>
                  </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: ordersLabel, value: resolvedOrders.length, icon: ShoppingBag, color: '#3b82f6' },
                    {
                      label: inProgressLabel,
                      value: resolvedOrders.filter((order) =>
                        ['pending', 'confirmed', 'processing', 'ready_for_pickup', 'shipped'].includes(order.status)
                      ).length,
                      icon: Package,
                      color: '#f59e0b',
                    },
                    { label: addressesLabel, value: resolvedAddresses.length, icon: MapPin, color: '#10b981' },
                    { label: loyaltyPointsLabel, value: '1,250', icon: Star, color: '#8b5cf6' },
                  ].map((stat) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn('rounded-xl border p-4 shadow-sm', classes.statCard)}
                      style={{ borderColor: resolvedBorderColor, backgroundColor: resolvedCardBgColor }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm" style={{ color: `${resolvedTextColor}60` }}>
                            {stat.label}
                          </p>
                          <p className="text-2xl font-bold" style={{ color: stat.color }}>
                            {stat.value}
                          </p>
                        </div>
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-lg"
                          style={{ backgroundColor: `${stat.color}15` }}
                        >
                          <stat.icon className="h-6 w-6" style={{ color: stat.color }} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}

            {/* Orders Tab */}
            {(activeTab === 'orders' || activeTab === 'tracking') && showOrders && (
              <div
                className={cn('rounded-xl border shadow-sm', classes.card)}
                style={{ borderColor: resolvedBorderColor, backgroundColor: resolvedCardBgColor }}
              >
                <div className="border-b p-6" style={{ borderColor: resolvedBorderColor }}>
                  <h3 className="text-lg font-semibold" style={{ color: resolvedTextColor }}>
                    {activeTab === 'orders' ? 'Historique des commandes' : 'Suivi des livraisons'}
                  </h3>
                </div>
                <div className="divide-y" style={{ borderColor: resolvedBorderColor }}>
                  {resolvedOrders.length === 0 ? (
                    <div className="p-8 text-center" style={{ color: `${resolvedTextColor}60` }}>
                      {noOrdersMessage}
                    </div>
                  ) : (
                    resolvedOrders
                      .filter((order) => (activeTab === 'tracking' ? Boolean(order.trackingNumber) : true))
                      .map((order) => {
                        const status = getOrderStatusMeta(order.status);
                        return (
                          <motion.div
                            key={order.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={cn('p-6', classes.orderItem)}
                          >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex items-center gap-4">
                                <div
                                  className="flex h-14 w-14 items-center justify-center rounded-xl"
                                  style={{ backgroundColor: status.bgColor }}
                                >
                                  <status.icon className="h-7 w-7" style={{ color: status.color }} />
                                </div>
                                <div>
                                  <p className="text-lg font-semibold" style={{ color: resolvedTextColor }}>
                                    {order.id}
                                  </p>
                                  <div className="flex items-center gap-2 text-sm" style={{ color: `${resolvedTextColor}60` }}>
                                    <Clock className="h-4 w-4" />
                                    {new Date(order.date).toLocaleDateString('fr-FR')}
                                    <span className="mx-2">•</span>
                                    {order.items} article{order.items > 1 ? 's' : ''}
                                  </div>
                                  {order.trackingNumber && (
                                    <p className="mt-1 text-sm" style={{ color: `${resolvedTextColor}60` }}>
                                      Suivi: {order.trackingNumber}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-bold" style={{ color: resolvedTextColor }}>
                                  {order.total} HTG
                                </p>
                                <span
                                  className="rounded-full px-3 py-1 text-sm"
                                  style={{ backgroundColor: status.bgColor, color: status.color }}
                                >
                                  {status.label}
                                </span>
                                <div className="mt-3">
                                  <button
                                    type="button"
                                    onClick={() => navigate('order-detail', { id: order.id })}
                                    className="inline-flex rounded-lg border px-3 py-2 text-sm font-medium transition-all hover:bg-gray-50"
                                    style={{ borderColor: resolvedBorderColor, color: resolvedTextColor }}
                                  >
                                    Voir la commande
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                  )}
                </div>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && showAddresses && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold" style={{ color: resolvedTextColor }}>
                    Mes adresses
                  </h3>
                  <button
                    onClick={() => {
                      resetAddressForm();
                      setShowAddressForm(true);
                    }}
                    disabled={addAddressMutation.isPending || updateAddressMutation.isPending}
                    className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-all"
                    style={{ backgroundColor: resolvedAccentColor }}
                  >
                    <Plus className="h-4 w-4" />
                    {addAddressLabel}
                  </button>
                </div>

                {showAddressForm && (
                  <AddressForm
                    initialData={addressForm}
                    title={editingAddressId ? 'Modifier adresse' : 'Nouvelle adresse'}
                    submitLabel={editingAddressId ? saveLabel : 'Ajouter'}
                    isSubmitting={addAddressMutation.isPending || updateAddressMutation.isPending}
                    onCancel={resetAddressForm}
                    onSubmit={(nextAddress) => void handleSaveAddress(nextAddress)}
                  />
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {resolvedAddresses.length === 0 ? (
                    <div
                      className="rounded-xl border p-8 text-center shadow-sm"
                      style={{ borderColor: resolvedBorderColor, backgroundColor: resolvedCardBgColor }}
                    >
                      <p style={{ color: `${resolvedTextColor}60` }}>Aucune adresse enregistrée.</p>
                    </div>
                  ) : (
                    resolvedAddresses.map((address) => (
                      <motion.div
                        key={address.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn('relative rounded-xl border p-6 shadow-sm', classes.addressCard)}
                        style={{ borderColor: resolvedBorderColor, backgroundColor: resolvedCardBgColor }}
                      >
                        {address.isDefault && (
                          <span
                            className="absolute right-4 top-4 rounded-full px-2 py-1 text-xs font-medium"
                            style={{ backgroundColor: `${resolvedAccentColor}20`, color: resolvedAccentColor }}
                          >
                            {defaultAddressLabel}
                          </span>
                        )}
                        <div className="mb-4 flex items-start gap-3">
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-lg"
                            style={{ backgroundColor: `${resolvedAccentColor}15` }}
                          >
                            <MapPin className="h-5 w-5" style={{ color: resolvedAccentColor }} />
                          </div>
                          <div>
                            <h4 className="font-semibold" style={{ color: resolvedTextColor }}>
                              {address.name}
                            </h4>
                            <p className="text-sm" style={{ color: `${resolvedTextColor}60` }}>
                              {address.phone}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-1 text-sm" style={{ color: `${resolvedTextColor}80` }}>
                          <p>{address.street}</p>
                          <p>
                            {address.postalCode} {address.city}
                          </p>
                          <p>{address.country}</p>
                        </div>
                        <div
                          className="mt-4 flex items-center gap-2 border-t pt-4"
                          style={{ borderColor: resolvedBorderColor }}
                        >
                          <button
                            onClick={() => handleStartEditAddress(address.id)}
                            disabled={deleteAddressMutation.isPending}
                            className="flex items-center gap-1 text-sm transition-colors hover:opacity-80"
                            style={{ color: `${resolvedTextColor}80` }}
                          >
                            <Edit2 className="h-4 w-4" />
                            {editLabel}
                          </button>
                          <button
                            onClick={() => void handleDeleteAddress(address.id)}
                            disabled={deleteAddressMutation.isPending}
                            className="ml-auto flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                            {deleteLabel}
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && showProfile && (
              <div
                className={cn('rounded-xl border shadow-sm', classes.card)}
                style={{ borderColor: resolvedBorderColor, backgroundColor: resolvedCardBgColor }}
              >
                <div className="border-b p-6" style={{ borderColor: resolvedBorderColor }}>
                  <h3 className="text-lg font-semibold" style={{ color: resolvedTextColor }}>
                    Modifier mon profil
                  </h3>
                </div>
                <div className="p-6">
                  <div className="mb-6 flex items-center gap-4">
                    <div
                      className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white"
                      style={{ background: `linear-gradient(135deg, ${resolvedAccentColor}, ${resolvedAccentColor}dd)` }}
                    >
                      {getInitials(resolvedProfileForm.firstName, resolvedProfileForm.lastName)}
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: resolvedTextColor }}>
                        Profil client
                      </p>
                      <p className="text-sm" style={{ color: `${resolvedTextColor}60` }}>
                        {customer.email}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <input
                      value={resolvedProfileForm.firstName}
                      onChange={(e) =>
                        setProfileForm((current) => ({
                          ...(current ?? defaultProfileForm),
                          firstName: e.target.value,
                        }))
                      }
                      placeholder="Prénom"
                      className="rounded-lg border px-3 py-2.5 transition-all focus:ring-2"
                      style={{ borderColor: resolvedBorderColor, color: resolvedTextColor }}
                    />
                    <input
                      value={resolvedProfileForm.lastName}
                      onChange={(e) =>
                        setProfileForm((current) => ({
                          ...(current ?? defaultProfileForm),
                          lastName: e.target.value,
                        }))
                      }
                      placeholder="Nom"
                      className="rounded-lg border px-3 py-2.5 transition-all focus:ring-2"
                      style={{ borderColor: resolvedBorderColor, color: resolvedTextColor }}
                    />
                    <input
                      value={resolvedProfileForm.email}
                      onChange={(e) =>
                        setProfileForm((current) => ({
                          ...(current ?? defaultProfileForm),
                          email: e.target.value,
                        }))
                      }
                      placeholder="Email"
                      type="email"
                      className="rounded-lg border px-3 py-2.5 transition-all focus:ring-2 md:col-span-2"
                      style={{ borderColor: resolvedBorderColor, color: resolvedTextColor }}
                    />
                    <input
                      value={resolvedProfileForm.phone}
                      onChange={(e) =>
                        setProfileForm((current) => ({
                          ...(current ?? defaultProfileForm),
                          phone: e.target.value,
                        }))
                      }
                      placeholder="Téléphone"
                      className="rounded-lg border px-3 py-2.5 transition-all focus:ring-2 md:col-span-2"
                      style={{ borderColor: resolvedBorderColor, color: resolvedTextColor }}
                    />
                  </div>

                  <div
                    className="mt-6 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between"
                    style={{ borderColor: resolvedBorderColor }}
                  >
                    {enableAccountDelete && (
                      <button
                        onClick={() => void handleDeleteAccount()}
                        disabled={deleteAccountMutation.isPending}
                        className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
                      >
                        {deleteAccountMutation.isPending ? 'Suppression...' : 'Supprimer mon compte'}
                      </button>
                    )}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setProfileForm(null)}
                        disabled={profileMutation.isPending}
                        className="rounded-lg border px-4 py-2 text-sm font-medium transition-all hover:bg-gray-50"
                        style={{ borderColor: resolvedBorderColor, color: resolvedTextColor }}
                      >
                        {cancelLabel}
                      </button>
                      <button
                        onClick={() => void handleSaveProfile()}
                        disabled={profileMutation.isPending}
                        className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90"
                        style={{ backgroundColor: resolvedAccentColor }}
                      >
                        {profileMutation.isPending ? 'Enregistrement...' : saveLabel}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </SectionContainer>
    </SectionWrapper>
  );
}

export default AccountDashboard;

Object.assign(AccountDashboard, { schema: accountDashboardSchema });

export const schema = accountDashboardSchema;
