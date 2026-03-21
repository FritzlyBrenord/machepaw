import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useCallback, useMemo } from "react";
import {
  AdminProduct,
  AdminSeller,
  AdminUser,
  AdminOrder,
  AdminSettings,
  AdminConversation,
  AdminStats,
  CurrencySetting,
  CurrencyCode,
  ShippingRate,
  Review,
} from "@/data/types";

// Admin State Interface
interface AdminState {
  // Admin Auth
  isAdmin: boolean;
  adminUser: AdminUser | null;
  loginAdmin: (email: string, password: string) => boolean;
  logoutAdmin: () => void;

  // Admin Data
  adminProducts: AdminProduct[];
  adminSellers: AdminSeller[];
  adminUsers: AdminUser[];
  adminOrders: AdminOrder[];
  adminConversations: AdminConversation[];
  adminSettings: AdminSettings;
  adminStats: AdminStats;
  displayCurrency: CurrencyCode;

  // Product Management
  addAdminProduct: (product: Omit<AdminProduct, "id" | "createdAt" | "updatedAt">) => void;
  updateAdminProduct: (productId: string, data: Partial<AdminProduct>) => void;
  removeAdminProduct: (productId: string) => void;
  approveProduct: (productId: string) => void;
  rejectProduct: (productId: string, reason: string) => void;
  featureProduct: (productId: string, featured: boolean) => void;
  addProductReview: (productId: string, review: Review) => void;

  // Seller Management
  approveSeller: (sellerId: string) => void;
  rejectSeller: (sellerId: string, reason: string) => void;
  blockSeller: (sellerId: string, reason: string, duration?: number) => void;
  unblockSeller: (sellerId: string) => void;
  verifySeller: (sellerId: string) => void;
  updateSellerCommission: (sellerId: string, rate: number) => void;

  // User Management
  blockUser: (userId: string, reason: string) => void;
  unblockUser: (userId: string) => void;
  updateUserRole: (userId: string, role: "admin" | "customer" | "seller") => void;

  // Order Management
  updateOrderStatus: (orderId: string, status: AdminOrder["status"]) => void;
  cancelOrder: (orderId: string, reason: string) => void;
  refundOrder: (orderId: string, amount: number) => void;

  // Settings Management
  updateSettings: (settings: Partial<AdminSettings>) => void;
  addCurrency: (currency: CurrencySetting) => void;
  updateCurrency: (code: string, data: Partial<CurrencySetting>) => void;
  removeCurrency: (code: string) => void;
  addShippingRate: (rate: ShippingRate) => void;
  updateShippingRate: (id: string, data: Partial<ShippingRate>) => void;
  removeShippingRate: (id: string) => void;

  // Conversation Management
  createConversation: (conversation: Omit<AdminConversation, "id" | "createdAt" | "messages">) => void;
  addMessage: (conversationId: string, message: Omit<AdminConversation["messages"][0], "id" | "createdAt">) => void;
  closeConversation: (conversationId: string) => void;
  setConversationPriority: (conversationId: string, priority: AdminConversation["priority"]) => void;

  // Stats
  refreshStats: () => void;

  // Currency Actions
  setDisplayCurrency: (currency: CurrencyCode) => void;
}

// Default Settings
const defaultSettings: AdminSettings = {
  siteName: "LUXE",
  siteDescription: "Votre boutique de luxe en ligne",
  contactEmail: "contact@luxe.com",
  supportPhone: "+509 1234-5678",
  maintenanceMode: false,
  allowNewRegistrations: true,
  requireEmailVerification: true,
  sellerCommissionRate: 10,
  autoApproveSellers: false,
  defaultShippingBaseRate: 750,
  currencies: [
    { code: "HTG", name: "Gourde Haïtienne", symbol: "G", exchangeRate: 0.0076, isActive: true, isDefault: true, decimals: 2 },
    { code: "USD", name: "Dollar US", symbol: "$", exchangeRate: 1, isActive: true, isDefault: false, decimals: 2 },
    { code: "EUR", name: "Euro", symbol: "€", exchangeRate: 1.08, isActive: true, isDefault: false, decimals: 2 },
    { code: "DOP", name: "Peso Dominicain", symbol: "RD$", exchangeRate: 0.017, isActive: true, isDefault: false, decimals: 2 },
  ],
  shippingRates: [],
};

// Default Stats
const defaultStats: AdminStats = {
  totalUsers: 0,
  totalSellers: 0,
  totalProducts: 0,
  totalOrders: 0,
  totalRevenue: 0,
  pendingOrders: 0,
  pendingSellers: 0,
  pendingProducts: 0,
  todayRevenue: 0,
  todayOrders: 0,
  newUsersToday: 0,
  newSellersToday: 0,
  weeklyRevenue: [],
  topProducts: [],
  topSellers: [],
};

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      // Admin Auth
      isAdmin: false,
      adminUser: null,
      loginAdmin: (email, password) => {
        // Simple mock authentication
        if (email === "admin@luxe.com" && password === "admin123") {
          set({
            isAdmin: true,
            adminUser: {
              id: "admin-1",
              email: "admin@luxe.com",
              firstName: "Admin",
              lastName: "LUXE",
              phone: "+509 1234-5678",
              avatar: "",
              addresses: [],
              wishlist: [],
              role: "admin",
              isBlocked: false,
              ordersCount: 0,
              totalSpent: 0,
              orders: [],
              createdAt: new Date().toISOString(),
            },
          });
          return true;
        }
        return false;
      },
      logoutAdmin: () => {
        set({ isAdmin: false, adminUser: null });
      },

      // Admin Data
      adminProducts: [],
      adminSellers: [],
      adminUsers: [],
      adminOrders: [],
      adminConversations: [],
      adminSettings: defaultSettings,
      adminStats: defaultStats,
      displayCurrency: "HTG",

      // Product Management
      addAdminProduct: (product) => {
        const newProduct: AdminProduct = {
          ...product,
          id: `prod-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          reviews: [],
        } as AdminProduct;
        set((state) => ({
          adminProducts: [newProduct, ...state.adminProducts],
        }));
        get().refreshStats();
      },
      updateAdminProduct: (productId, data) => {
        set((state) => ({
          adminProducts: state.adminProducts.map((p) =>
            p.id === productId ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
          ),
        }));
      },
      removeAdminProduct: (productId) => {
        set((state) => ({
          adminProducts: state.adminProducts.filter((p) => p.id !== productId),
        }));
        get().refreshStats();
      },
      approveProduct: (productId) => {
        set((state) => ({
          adminProducts: state.adminProducts.map((p) =>
            p.id === productId ? { ...p, status: "active", updatedAt: new Date().toISOString() } : p
          ),
        }));
        get().refreshStats();
      },
      rejectProduct: (productId, reason) => {
        set((state) => ({
          adminProducts: state.adminProducts.map((p) =>
            p.id === productId ? { ...p, status: "rejected", adminNotes: reason, updatedAt: new Date().toISOString() } : p
          ),
        }));
      },
      featureProduct: (productId, featured) => {
        set((state) => ({
          adminProducts: state.adminProducts.map((p) =>
            p.id === productId ? { ...p, isFeatured: featured, updatedAt: new Date().toISOString() } : p
          ),
        }));
      },
      addProductReview: (productId, review) => {
        set((state) => ({
          adminProducts: state.adminProducts.map((p) =>
            p.id === productId
              ? { ...p, reviews: [...p.reviews, review], updatedAt: new Date().toISOString() }
              : p
          ),
        }));
      },

      // Seller Management
      approveSeller: (sellerId) => {
        set((state) => ({
          adminSellers: state.adminSellers.map((s) =>
            s.id === sellerId ? { ...s, status: "approved", updatedAt: new Date().toISOString() } : s
          ),
        }));
        get().refreshStats();
      },
      rejectSeller: (sellerId, reason) => {
        set((state) => ({
          adminSellers: state.adminSellers.map((s) =>
            s.id === sellerId
              ? { ...s, status: "rejected", rejectionReason: reason, updatedAt: new Date().toISOString() }
              : s
          ),
        }));
      },
      blockSeller: (sellerId, reason, duration) => {
        const blockedUntil = duration
          ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString()
          : undefined;
        set((state) => ({
          adminSellers: state.adminSellers.map((s) =>
            s.id === sellerId
              ? { ...s, status: "suspended", blockReason: reason, blockedUntil, updatedAt: new Date().toISOString() }
              : s
          ),
        }));
      },
      unblockSeller: (sellerId) => {
        set((state) => ({
          adminSellers: state.adminSellers.map((s) =>
            s.id === sellerId
              ? { ...s, status: "approved", blockReason: undefined, blockedUntil: undefined, updatedAt: new Date().toISOString() }
              : s
          ),
        }));
      },
      verifySeller: (sellerId) => {
        set((state) => ({
          adminSellers: state.adminSellers.map((s) =>
            s.id === sellerId ? { ...s, isVerified: true, updatedAt: new Date().toISOString() } : s
          ),
        }));
      },
      updateSellerCommission: (sellerId, rate) => {
        set((state) => ({
          adminSellers: state.adminSellers.map((s) =>
            s.id === sellerId ? { ...s, commissionRate: rate, updatedAt: new Date().toISOString() } : s
          ),
        }));
      },

      // User Management
      blockUser: (userId, reason) => {
        set((state) => ({
          adminUsers: state.adminUsers.map((u) =>
            u.id === userId ? { ...u, isBlocked: true } : u
          ),
        }));
      },
      unblockUser: (userId) => {
        set((state) => ({
          adminUsers: state.adminUsers.map((u) =>
            u.id === userId ? { ...u, isBlocked: false } : u
          ),
        }));
      },
      updateUserRole: (userId, role) => {
        set((state) => ({
          adminUsers: state.adminUsers.map((u) =>
            u.id === userId ? { ...u, role } : u
          ),
        }));
      },

      // Order Management
      updateOrderStatus: (orderId, status) => {
        set((state) => ({
          adminOrders: state.adminOrders.map((o) =>
            o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o
          ),
        }));
        get().refreshStats();
      },
      cancelOrder: (orderId, reason) => {
        set((state) => ({
          adminOrders: state.adminOrders.map((o) =>
            o.id === orderId ? { ...o, status: "cancelled", updatedAt: new Date().toISOString() } : o
          ),
        }));
        get().refreshStats();
      },
      refundOrder: (orderId, amount) => {
        set((state) => ({
          adminOrders: state.adminOrders.map((o) =>
            o.id === orderId ? { ...o, status: "refunded", updatedAt: new Date().toISOString() } : o
          ),
        }));
        get().refreshStats();
      },

      // Settings Management
      updateSettings: (settings) => {
        set((state) => ({
          adminSettings: { ...state.adminSettings, ...settings },
        }));
      },
      addCurrency: (currency) => {
        set((state) => ({
          adminSettings: {
            ...state.adminSettings,
            currencies: [...state.adminSettings.currencies, currency],
          },
        }));
      },
      updateCurrency: (code, data) => {
        set((state) => ({
          adminSettings: {
            ...state.adminSettings,
            currencies: state.adminSettings.currencies.map((c) =>
              c.code === code ? { ...c, ...data } : c
            ),
          },
        }));
      },
      removeCurrency: (code) => {
        set((state) => ({
          adminSettings: {
            ...state.adminSettings,
            currencies: state.adminSettings.currencies.filter((c) => c.code !== code),
          },
        }));
      },
      addShippingRate: (rate) => {
        set((state) => ({
          adminSettings: {
            ...state.adminSettings,
            shippingRates: [...state.adminSettings.shippingRates, rate],
          },
        }));
      },
      updateShippingRate: (id, data) => {
        set((state) => ({
          adminSettings: {
            ...state.adminSettings,
            shippingRates: state.adminSettings.shippingRates.map((r) =>
              r.id === id ? { ...r, ...data } : r
            ),
          },
        }));
      },
      removeShippingRate: (id) => {
        set((state) => ({
          adminSettings: {
            ...state.adminSettings,
            shippingRates: state.adminSettings.shippingRates.filter((r) => r.id !== id),
          },
        }));
      },

      // Conversation Management
      createConversation: (conversation) => {
        const newConversation: AdminConversation = {
          ...conversation,
          id: `conv-${Date.now()}`,
          createdAt: new Date().toISOString(),
          messages: [],
        };
        set((state) => ({
          adminConversations: [newConversation, ...state.adminConversations],
        }));
      },
      addMessage: (conversationId, message) => {
        const newMessage = {
          ...message,
          id: `msg-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          adminConversations: state.adminConversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: [...c.messages, newMessage],
                  lastMessage: message.content,
                  lastMessageAt: new Date().toISOString(),
                }
              : c
          ),
        }));
      },
      closeConversation: (conversationId) => {
        set((state) => ({
          adminConversations: state.adminConversations.map((c) =>
            c.id === conversationId ? { ...c, status: "closed" } : c
          ),
        }));
      },
      setConversationPriority: (conversationId, priority) => {
        set((state) => ({
          adminConversations: state.adminConversations.map((c) =>
            c.id === conversationId ? { ...c, priority } : c
          ),
        }));
      },

      // Stats
      refreshStats: () => {
        const state = get();
        const stats: AdminStats = {
          totalUsers: state.adminUsers.length,
          totalSellers: state.adminSellers.length,
          totalProducts: state.adminProducts.length,
          totalOrders: state.adminOrders.length,
          totalRevenue: state.adminOrders.reduce((sum, o) => sum + o.total, 0),
          pendingOrders: state.adminOrders.filter((o) => o.status === "pending").length,
          pendingSellers: state.adminSellers.filter((s) => s.status === "pending").length,
          pendingProducts: state.adminProducts.filter((p) => p.status === "pending").length,
          todayRevenue: state.adminOrders
            .filter((o) => new Date(o.createdAt).toDateString() === new Date().toDateString())
            .reduce((sum, o) => sum + o.total, 0),
          todayOrders: state.adminOrders.filter(
            (o) => new Date(o.createdAt).toDateString() === new Date().toDateString()
          ).length,
          newUsersToday: 0, // Would need tracking
          newSellersToday: 0, // Would need tracking
          weeklyRevenue: [], // Would need calculation
          topProducts: [], // Would need calculation
          topSellers: [], // Would need calculation
        };
        set({ adminStats: stats });
      },

      // Currency Actions
      setDisplayCurrency: (currency) => set({ displayCurrency: currency }),
    }),
    {
      name: "luxe-admin",
      partialize: (state) => ({
        isAdmin: state.isAdmin,
        adminUser: state.adminUser,
        adminSettings: state.adminSettings,
        displayCurrency: state.displayCurrency,
      }),
    }
  )
);

// Admin Store Selectors
export const useIsAdmin = () => useAdminStore((state) => state.isAdmin);
export const useAdminUser = () => useAdminStore((state) => state.adminUser);
export const useLoginAdmin = () => useAdminStore((state) => state.loginAdmin);
export const useLogoutAdmin = () => useAdminStore((state) => state.logoutAdmin);

export const useAdminProducts = () => useAdminStore((state) => state.adminProducts);
export const useAdminSellers = () => useAdminStore((state) => state.adminSellers);
export const useAdminUsers = () => useAdminStore((state) => state.adminUsers);
export const useAdminOrders = () => useAdminStore((state) => state.adminOrders);
export const useAdminConversations = () => useAdminStore((state) => state.adminConversations);
export const useAdminSettings = () => useAdminStore((state) => state.adminSettings);
export const useAdminStats = () => useAdminStore((state) => state.adminStats);

// Admin Actions
export const useAddAdminProduct = () => useAdminStore((state) => state.addAdminProduct);
export const useUpdateAdminProduct = () => useAdminStore((state) => state.updateAdminProduct);
export const useRemoveAdminProduct = () => useAdminStore((state) => state.removeAdminProduct);
export const useApproveProduct = () => useAdminStore((state) => state.approveProduct);
export const useRejectProduct = () => useAdminStore((state) => state.rejectProduct);

export const useApproveSeller = () => useAdminStore((state) => state.approveSeller);
export const useRejectSeller = () => useAdminStore((state) => state.rejectSeller);
export const useBlockSeller = () => useAdminStore((state) => state.blockSeller);
export const useUnblockSeller = () => useAdminStore((state) => state.unblockSeller);
export const useVerifySeller = () => useAdminStore((state) => state.verifySeller);

export const useBlockUser = () => useAdminStore((state) => state.blockUser);
export const useUnblockUser = () => useAdminStore((state) => state.unblockUser);
export const useUpdateUserRole = () => useAdminStore((state) => state.updateUserRole);

export const useUpdateOrderStatus = () => useAdminStore((state) => state.updateOrderStatus);
export const useCancelOrder = () => useAdminStore((state) => state.cancelOrder);

export const useUpdateAdminSettings = () => useAdminStore((state) => state.updateSettings);

export const useDisplayCurrency = () => useAdminStore((state) => state.displayCurrency);
export const useSetDisplayCurrency = () => useAdminStore((state) => state.setDisplayCurrency);

// Hook for converting and formatting prices
export const useCurrencyConverter = () => {
  const settings = useAdminStore((state) => state.adminSettings);
  const displayCurrency = useAdminStore((state) => state.displayCurrency);

  const convertPrice = useCallback((amount: number, from: CurrencyCode = "HTG") => {
    const currencies = settings.currencies || [];
    const sourceCurrency = currencies.find(c => c.code === from);
    const targetCurrency = currencies.find(c => c.code === displayCurrency);

    if (!sourceCurrency || !targetCurrency) return amount;

    // Convert from source to USD, then from USD to target
    // exchangeRate is vs USD (e.g. 1 USD = 135 HTG means exchangeRate = 135?)
    // Wait, the default data shows: 
    // HTG: exchangeRate: 0.0076 (1 HTG = 0.0076 USD)
    // USD: exchangeRate: 1
    // This is correct: rate is factor to get USD.
    
    const amountInUSD = amount * sourceCurrency.exchangeRate;
    const amountInTarget = amountInUSD / targetCurrency.exchangeRate;

    return amountInTarget;
  }, [settings.currencies, displayCurrency]);

  const formatPrice = useCallback((amount: number, from: CurrencyCode = "HTG") => {
    const converted = convertPrice(amount, from);
    const targetCurrency = (settings.currencies || []).find(c => c.code === displayCurrency);
    
    if (!targetCurrency) return `${amount} ${from}`;

    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: displayCurrency,
      minimumFractionDigits: targetCurrency.decimals
    }).format(converted);
  }, [convertPrice, settings.currencies, displayCurrency]);

  return { convertPrice, formatPrice, displayCurrency };
};

export const useRefreshAdminStats = () => useAdminStore((state) => state.refreshStats);

// Helper hook for all admin actions
export function useAdmin() {
  const isAdmin = useIsAdmin();
  const adminUser = useAdminUser();
  const loginAdmin = useLoginAdmin();
  const logoutAdmin = useLogoutAdmin();
  const adminProducts = useAdminProducts();
  const adminSellers = useAdminSellers();
  const adminUsers = useAdminUsers();
  const adminOrders = useAdminOrders();
  const adminConversations = useAdminConversations();
  const adminSettings = useAdminSettings();
  const adminStats = useAdminStats();

  return useMemo(
    () => ({
      isAdmin,
      adminUser,
      loginAdmin,
      logoutAdmin,
      adminProducts,
      adminSellers,
      adminUsers,
      adminOrders,
      adminConversations,
      adminSettings,
      adminStats,
    }),
    [
      isAdmin,
      adminUser,
      loginAdmin,
      logoutAdmin,
      adminProducts,
      adminSellers,
      adminUsers,
      adminOrders,
      adminConversations,
      adminSettings,
      adminStats,
    ]
  );
}
