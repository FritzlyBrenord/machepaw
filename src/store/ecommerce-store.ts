// ============================================
// E-COMMERCE STORE - Cart, Wishlist, Orders, Account
// With localStorage persistence
// ============================================

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Product, CartItem, Order, Address } from '@/types/ecommerce-types';

// --- Types ---

export interface EcommerceState {
  // Cart
  cartItems: CartItem[];
  
  // Wishlist
  wishlistItems: Product[];
  
  // Orders
  orders: Order[];
  
  // User Account
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatar?: string;
  } | null;
  addresses: Address[];
  
  // Current Order Tracking
  currentOrderId: string | null;
}

export interface EcommerceActions {
  // Cart Actions
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemsCount: () => number;
  isInCart: (productId: string) => boolean;
  
  // Wishlist Actions
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  moveWishlistToCart: (productId: string) => void;
  
  // Order Actions
  placeOrder: (orderData: Omit<Order, 'id' | 'date' | 'status'>) => Order;
  cancelOrder: (orderId: string) => void;
  getOrderById: (orderId: string) => Order | undefined;
  trackOrder: (orderId: string) => { status: string; estimatedDelivery?: string; trackingNumber?: string } | null;
  
  // Address Actions
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (addressId: string, updates: Partial<Address>) => void;
  deleteAddress: (addressId: string) => void;
  setDefaultAddress: (addressId: string) => void;
  getDefaultAddress: () => Address | undefined;
  
  // User Actions
  updateUser: (userData: Partial<EcommerceState['user']>) => void;
  logout: () => void;
}

export type EcommerceStore = EcommerceState & EcommerceActions;

// --- Initial State ---

const createInitialState = (): EcommerceState => ({
  cartItems: [],
  wishlistItems: [],
  orders: [],
  user: null,
  addresses: [],
  currentOrderId: null,
});

// --- Store Implementation ---

export const useEcommerceStore = create<EcommerceStore>()(
  persist(
    immer((set, get) => ({
      // --- State ---
      ...createInitialState(),

      // --- Cart Actions ---
      addToCart: (item) => {
        set((state) => {
          const existingItem = state.cartItems.find(
            (i) => i.productId === item.productId && 
                   i.size === item.size && 
                   i.color === item.color &&
                   i.storage === item.storage
          );
          
          if (existingItem) {
            existingItem.quantity += item.quantity;
          } else {
            state.cartItems.push({
              ...item,
              id: `cart-${uuidv4()}`,
            });
          }
        });
      },

      removeFromCart: (itemId) => {
        set((state) => {
          const index = state.cartItems.findIndex((i) => i.id === itemId);
          if (index > -1) {
            state.cartItems.splice(index, 1);
          }
        });
      },

      updateCartItemQuantity: (itemId, quantity) => {
        set((state) => {
          const item = state.cartItems.find((i) => i.id === itemId);
          if (item) {
            if (quantity <= 0) {
              const index = state.cartItems.findIndex((i) => i.id === itemId);
              state.cartItems.splice(index, 1);
            } else {
              item.quantity = quantity;
            }
          }
        });
      },

      clearCart: () => {
        set((state) => {
          state.cartItems = [];
        });
      },

      getCartTotal: () => {
        return get().cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getCartItemsCount: () => {
        return get().cartItems.reduce((count, item) => count + item.quantity, 0);
      },

      isInCart: (productId) => {
        return get().cartItems.some((item) => item.productId === productId);
      },

      // --- Wishlist Actions ---
      addToWishlist: (product) => {
        set((state) => {
          const exists = state.wishlistItems.some((p) => p.id === product.id);
          if (!exists) {
            state.wishlistItems.push(product);
          }
        });
      },

      removeFromWishlist: (productId) => {
        set((state) => {
          const index = state.wishlistItems.findIndex((p) => p.id === productId);
          if (index > -1) {
            state.wishlistItems.splice(index, 1);
          }
        });
      },

      toggleWishlist: (product) => {
        const { isInWishlist, addToWishlist, removeFromWishlist } = get();
        if (isInWishlist(product.id)) {
          removeFromWishlist(product.id);
        } else {
          addToWishlist(product);
        }
      },

      isInWishlist: (productId) => {
        return get().wishlistItems.some((p) => p.id === productId);
      },

      clearWishlist: () => {
        set((state) => {
          state.wishlistItems = [];
        });
      },

      moveWishlistToCart: (productId) => {
        const { wishlistItems, addToCart, removeFromWishlist } = get();
        const product = wishlistItems.find((p) => p.id === productId);
        if (product) {
          addToCart({
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.image,
          });
          removeFromWishlist(productId);
        }
      },

      // --- Order Actions ---
      placeOrder: (orderData) => {
        const newOrder: Order = {
          ...orderData,
          id: `order-${uuidv4()}`,
          date: new Date().toISOString(),
          status: 'pending',
          trackingNumber: `TRK${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        };
        
        set((state) => {
          state.orders.unshift(newOrder);
          state.currentOrderId = newOrder.id;
          state.cartItems = []; // Clear cart after order
        });
        
        return newOrder;
      },

      cancelOrder: (orderId) => {
        set((state) => {
          const order = state.orders.find((o) => o.id === orderId);
          if (order && order.status === 'pending') {
            order.status = 'cancelled';
          }
        });
      },

      getOrderById: (orderId) => {
        return get().orders.find((o) => o.id === orderId);
      },

      trackOrder: (orderId) => {
        const order = get().orders.find((o) => o.id === orderId);
        if (!order) return null;
        
        const statusMap: Record<string, { label: string; step: number }> = {
          pending: { label: 'Commande reçue', step: 1 },
          processing: { label: 'En préparation', step: 2 },
          shipped: { label: 'Expédiée', step: 3 },
          delivered: { label: 'Livrée', step: 4 },
          cancelled: { label: 'Annulée', step: 0 },
        };
        
        const estimatedDelivery = new Date(order.date);
        estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);
        
        return {
          status: statusMap[order.status]?.label || order.status,
          estimatedDelivery: estimatedDelivery.toLocaleDateString('fr-FR'),
          trackingNumber: order.trackingNumber,
        };
      },

      // --- Address Actions ---
      addAddress: (address) => {
        set((state) => {
          const newAddress = {
            ...address,
            id: `addr-${uuidv4()}`,
          };
          
          // If this is the first address or marked as default, update others
          if (newAddress.isDefault || state.addresses.length === 0) {
            state.addresses.forEach((a) => { a.isDefault = false; });
            newAddress.isDefault = true;
          }
          
          state.addresses.push(newAddress);
        });
      },

      updateAddress: (addressId, updates) => {
        set((state) => {
          const address = state.addresses.find((a) => a.id === addressId);
          if (address) {
            Object.assign(address, updates);
          }
        });
      },

      deleteAddress: (addressId) => {
        set((state) => {
          const index = state.addresses.findIndex((a) => a.id === addressId);
          if (index > -1) {
            const wasDefault = state.addresses[index].isDefault;
            state.addresses.splice(index, 1);
            
            // If we deleted the default and have other addresses, make first one default
            if (wasDefault && state.addresses.length > 0) {
              state.addresses[0].isDefault = true;
            }
          }
        });
      },

      setDefaultAddress: (addressId) => {
        set((state) => {
          state.addresses.forEach((a) => { a.isDefault = a.id === addressId; });
        });
      },

      getDefaultAddress: () => {
        return get().addresses.find((a) => a.isDefault) || get().addresses[0];
      },

      // --- User Actions ---
      updateUser: (userData) => {
        set((state) => {
          if (!state.user) {
            state.user = {
              firstName: '',
              lastName: '',
              email: '',
              phone: '',
              ...userData,
            };
          } else {
            Object.assign(state.user, userData);
          }
        });
      },

      logout: () => {
        set((state) => {
          state.user = null;
          state.addresses = [];
          state.orders = [];
        });
      },
    })),
    {
      name: 'ecommerce-storage',
      partialize: (state) => ({
        cartItems: state.cartItems,
        wishlistItems: state.wishlistItems,
        orders: state.orders,
        user: state.user,
        addresses: state.addresses,
      }),
    }
  )
);

// --- Selectors ---

export const selectCartItems = (state: ReturnType<typeof useEcommerceStore.getState>) => state.cartItems;
export const selectWishlistItems = (state: ReturnType<typeof useEcommerceStore.getState>) => state.wishlistItems;
export const selectOrders = (state: ReturnType<typeof useEcommerceStore.getState>) => state.orders;
export const selectUser = (state: ReturnType<typeof useEcommerceStore.getState>) => state.user;
export const selectAddresses = (state: ReturnType<typeof useEcommerceStore.getState>) => state.addresses;
