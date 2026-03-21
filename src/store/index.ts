import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useMemo } from "react";
import {
  Product,
  CartItem,
  Address,
  Order,
  Seller,
  SellerApplication,
  SellerStats,
  SellerProduct,
  SellerOrder,
  ProductAttributeSelection,
  User, // Local User type
} from "@/data/types";
import { products, currentUser, orders } from "@/data";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import {
  getDiscountedPrice,
  serializeAttributeSelections,
} from "@/lib/storefront";

interface CartState {
  items: CartItem[];
  addToCart: (
    product: Product,
    quantity?: number,
    options?: {
      selectedAttributes?: ProductAttributeSelection[];
      unitPrice?: number;
    },
  ) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  clearCartItems: (cartItemIds: string[]) => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

interface WishlistState {
  wishlist: string[];
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => void;
}

interface SearchState {
  searchQuery: string;
  searchResults: Product[];
  isSearching: boolean;
  setSearchQuery: (query: string) => void;
  performSearch: (query: string) => void;
  clearSearch: () => void;
}

interface FilterState {
  selectedCategory: string | null;
  selectedPriceRange: [number, number] | null;
  selectedTags: string[];
  sortBy: "price-asc" | "price-desc" | "newest" | "rating" | "bestseller";
  setCategory: (category: string | null) => void;
  setPriceRange: (range: [number, number] | null) => void;
  toggleTag: (tag: string) => void;
  setSortBy: (sort: FilterState["sortBy"]) => void;
  resetFilters: () => void;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  addresses: Address[];
  userOrders: Order[];
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuth: boolean) => void;
  addAddress: (address: Address) => void;
  removeAddress: (addressId: string) => void;
  updateAddress: (addressId: string, address: Address) => void;
  setAddresses: (addresses: Address[]) => void;
}

interface UIState {
  isCartOpen: boolean;
  isSearchOpen: boolean;
  isMobileMenuOpen: boolean;
  isChatOpen: boolean;
  toggleCart: () => void;
  toggleSearch: () => void;
  toggleMobileMenu: () => void;
  toggleChat: () => void;
  closeAll: () => void;
}

interface SellerState {
  seller: Seller | null;
  sellerApplication: SellerApplication | null;
  sellerProducts: SellerProduct[];
  sellerOrders: SellerOrder[];
  sellerStats: SellerStats | null;
  isSeller: boolean;
  setSeller: (seller: Seller | null) => void;
  updateSellerApplication: (data: Partial<SellerApplication>) => void;
  submitSellerApplication: () => void;
  addSellerProduct: (product: SellerProduct) => void;
  updateSellerProduct: (productId: string, data: Partial<SellerProduct>) => void;
  removeSellerProduct: (productId: string) => void;
}

type StoreState = CartState & WishlistState & SearchState & FilterState & UserState & UIState & SellerState;

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Cart State
      items: [],
      addToCart: (product, quantity = 1, options) => {
        set((state) => {
          const selectedAttributes = options?.selectedAttributes || [];
          const itemKey = `${product.id}:${serializeAttributeSelections(selectedAttributes)}`;
          const unitPrice = options?.unitPrice ?? getDiscountedPrice(product);
          const existingItem = state.items.find(
            (item) =>
              (item.id || item.product.id) === itemKey,
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                (item.id || item.product.id) === itemKey
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                id: itemKey,
                product,
                quantity,
                unitPrice,
                selectedAttributes,
              },
            ],
          };
        });
      },
      removeFromCart: (cartItemId) => {
        set((state) => ({
          items: state.items.filter(
            (item) => (item.id || item.product.id) !== cartItemId,
          ),
        }));
      },
      updateQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(cartItemId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            (item.id || item.product.id) === cartItemId
              ? { ...item, quantity }
              : item
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      clearCartItems: (cartItemIds) =>
        set((state) => ({
          items: state.items.filter(
            (item) => !cartItemIds.includes(item.id || item.product.id),
          ),
        })),
      getCartTotal: () => {
        return get().items.reduce(
          (total, item) => total + (item.unitPrice || getDiscountedPrice(item.product)) * item.quantity,
          0,
        );
      },
      getCartCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      // Wishlist State
      wishlist: [],
      addToWishlist: (productId) => {
        set((state) => ({
          wishlist: [...state.wishlist, productId],
        }));
      },
      removeFromWishlist: (productId) => {
        set((state) => ({
          wishlist: state.wishlist.filter((id) => id !== productId),
        }));
      },
      isInWishlist: (productId) => {
        return get().wishlist.includes(productId);
      },
      toggleWishlist: (productId) => {
        if (get().isInWishlist(productId)) {
          get().removeFromWishlist(productId);
        } else {
          get().addToWishlist(productId);
        }
      },

      // Search State
      searchQuery: "",
      searchResults: [],
      isSearching: false,
      setSearchQuery: (query) => set({ searchQuery: query }),
      performSearch: (query) => {
        if (!query.trim()) {
          set({ searchResults: [], isSearching: false });
          return;
        }
        const lowercaseQuery = query.toLowerCase();
        const results = products.filter(
          (product) =>
            product.name.toLowerCase().includes(lowercaseQuery) ||
            product.description.toLowerCase().includes(lowercaseQuery) ||
            product.category.toLowerCase().includes(lowercaseQuery) ||
            product.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)) ||
            product.sku.toLowerCase().includes(lowercaseQuery)
        );
        set({ searchResults: results, isSearching: true, searchQuery: query });
      },
      clearSearch: () => set({ searchQuery: "", searchResults: [], isSearching: false }),

      // Filter State
      selectedCategory: null,
      selectedPriceRange: null,
      selectedTags: [],
      sortBy: "newest",
      setCategory: (category) => set({ selectedCategory: category }),
      setPriceRange: (range) => set({ selectedPriceRange: range }),
      toggleTag: (tag) => {
        set((state) => {
          const exists = state.selectedTags.includes(tag);
          if (exists) {
            return { selectedTags: state.selectedTags.filter((t) => t !== tag) };
          }
          return { selectedTags: [...state.selectedTags, tag] };
        });
      },
      setSortBy: (sort) => set({ sortBy: sort }),
      resetFilters: () =>
        set({
          selectedCategory: null,
          selectedPriceRange: null,
          selectedTags: [],
          sortBy: "newest",
        }),

      // User State
      user: null,
      isAuthenticated: false,
      addresses: [],
      userOrders: [],
      setUser: (user) => set({ user }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      addAddress: (address: Address) => {
        set((state) => ({
          addresses: [...state.addresses, { ...address, id: `addr-${Date.now()}` }],
        }));
      },
      removeAddress: (addressId: string) => {
        set((state) => ({
          addresses: state.addresses.filter((addr) => addr.id !== addressId),
        }));
      },
      updateAddress: (addressId: string, address: Address) => {
        set((state) => ({
          addresses: state.addresses.map((addr) =>
            addr.id === addressId ? { ...address, id: addressId } : addr
          ),
        }));
      },
      setAddresses: (addresses: Address[]) => set({ addresses }),

      // UI State
      isCartOpen: false,
      isSearchOpen: false,
      isMobileMenuOpen: false,
      isChatOpen: false,
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
      toggleMobileMenu: () =>
        set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
      toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
      closeAll: () =>
        set({
          isCartOpen: false,
          isSearchOpen: false,
          isMobileMenuOpen: false,
          isChatOpen: false,
        }),

      // Seller State
      seller: null,
      sellerApplication: null,
      sellerProducts: [],
      sellerOrders: [],
      sellerStats: null,
      isSeller: false,
      setSeller: (seller) => set({ seller, isSeller: !!seller }),
      updateSellerApplication: (data) => {
        set((state) => ({
          sellerApplication: state.sellerApplication
            ? { ...state.sellerApplication, ...data }
            : ({ id: `app-${Date.now()}`, userId: state.user?.id, status: "pending", step: 1, ...data } as SellerApplication),
        }));
      },
      submitSellerApplication: () => {
        set((state) => ({
          sellerApplication: state.sellerApplication
            ? { ...state.sellerApplication, status: "pending", submittedAt: new Date().toISOString() }
            : null,
        }));
      },
      addSellerProduct: (product) => {
        set((state) => ({
          sellerProducts: [...state.sellerProducts, product],
        }));
      },
      updateSellerProduct: (productId, data) => {
        set((state) => ({
          sellerProducts: state.sellerProducts.map((p) =>
            p.id === productId ? { ...p, ...data } : p
          ),
        }));
      },
      removeSellerProduct: (productId) => {
        set((state) => ({
          sellerProducts: state.sellerProducts.filter((p) => p.id !== productId),
        }));
      },
    }),
    {
      name: "luxe-store",
      partialize: (state) => ({
        items: state.items,
        wishlist: state.wishlist,
        addresses: state.addresses,
      }),
    }
  )
);

// Individual selectors to avoid object creation issues with React 19
export const useCartItems = () => useStore((state) => state.items);
export const useCartAddItem = () => useStore((state) => state.addToCart);
export const useCartRemoveItem = () => useStore((state) => state.removeFromCart);
export const useCartUpdateQuantity = () => useStore((state) => state.updateQuantity);
export const useCartClear = () => useStore((state) => state.clearCart);
export const useCartClearItems = () => useStore((state) => state.clearCartItems);
export const useCartGetTotal = () => useStore((state) => state.getCartTotal);
export const useCartGetCount = () => useStore((state) => state.getCartCount);

export const useWishlistItems = () => useStore((state) => state.wishlist);
export const useWishlistAdd = () => useStore((state) => state.addToWishlist);
export const useWishlistRemove = () => useStore((state) => state.removeFromWishlist);
export const useWishlistIsIn = () => useStore((state) => state.isInWishlist);
export const useWishlistToggle = () => useStore((state) => state.toggleWishlist);

export const useSearchQuery = () => useStore((state) => state.searchQuery);
export const useSearchResults = () => useStore((state) => state.searchResults);
export const useSearchIsSearching = () => useStore((state) => state.isSearching);
export const useSearchSetQuery = () => useStore((state) => state.setSearchQuery);
export const useSearchPerform = () => useStore((state) => state.performSearch);
export const useSearchClear = () => useStore((state) => state.clearSearch);

export const useFilterCategory = () => useStore((state) => state.selectedCategory);
export const useFilterPriceRange = () => useStore((state) => state.selectedPriceRange);
export const useFilterTags = () => useStore((state) => state.selectedTags);
export const useFilterSortBy = () => useStore((state) => state.sortBy);
export const useFilterSetCategory = () => useStore((state) => state.setCategory);
export const useFilterSetPriceRange = () => useStore((state) => state.setPriceRange);
export const useFilterToggleTag = () => useStore((state) => state.toggleTag);
export const useFilterSetSortBy = () => useStore((state) => state.setSortBy);
export const useFilterReset = () => useStore((state) => state.resetFilters);

export const useUserData = () => useStore((state) => state.user);
export const useUserIsAuth = () => useStore((state) => state.isAuthenticated);
export const useUserSetUser = () => useStore((state) => state.setUser);
export const useUserSetAuth = () => useStore((state) => state.setAuthenticated);
export const useUserAddresses = () => useStore((state) => state.addresses);
export const useUserOrders = () => useStore((state) => state.userOrders);
export const useUserAddAddress = () => useStore((state) => state.addAddress);
export const useUserRemoveAddress = () => useStore((state) => state.removeAddress);
export const useUserUpdateAddress = () => useStore((state) => state.updateAddress);
export const useUserSetAddresses = () => useStore((state) => state.setAddresses);

// Seller State
export const useSellerData = () => useStore((state) => state.seller);
export const useSellerApplication = () => useStore((state) => state.sellerApplication);
export const useSellerProducts = () => useStore((state) => state.sellerProducts);
export const useSellerOrders = () => useStore((state) => state.sellerOrders);
export const useSellerStats = () => useStore((state) => state.sellerStats);
export const useIsSeller = () => useStore((state) => state.isSeller);
export const useSetSeller = () => useStore((state) => state.setSeller);
export const useUpdateSellerApplication = () => useStore((state) => state.updateSellerApplication);
export const useSubmitSellerApplication = () => useStore((state) => state.submitSellerApplication);
export const useAddSellerProduct = () => useStore((state) => state.addSellerProduct);
export const useUpdateSellerProduct = () => useStore((state) => state.updateSellerProduct);
export const useRemoveSellerProduct = () => useStore((state) => state.removeSellerProduct);

export const useUICartOpen = () => useStore((state) => state.isCartOpen);
export const useUISearchOpen = () => useStore((state) => state.isSearchOpen);
export const useUIMobileMenuOpen = () => useStore((state) => state.isMobileMenuOpen);
export const useUIChatOpen = () => useStore((state) => state.isChatOpen);
export const useUIToggleCart = () => useStore((state) => state.toggleCart);
export const useUIToggleSearch = () => useStore((state) => state.toggleSearch);
export const useUIToggleMobileMenu = () => useStore((state) => state.toggleMobileMenu);
export const useUIToggleChat = () => useStore((state) => state.toggleChat);
export const useUICloseAll = () => useStore((state) => state.closeAll);

// Helper hooks that combine multiple selectors safely using useMemo
export function useCart() {
  const items = useCartItems();
  const addToCart = useCartAddItem();
  const removeFromCart = useCartRemoveItem();
  const updateQuantity = useCartUpdateQuantity();
  const clearCart = useCartClear();
  const clearCartItems = useCartClearItems();
  const getCartTotal = useCartGetTotal();
  const getCartCount = useCartGetCount();
  
  return useMemo(() => ({
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    clearCartItems,
    getCartTotal,
    getCartCount,
  }), [items, addToCart, removeFromCart, updateQuantity, clearCart, clearCartItems, getCartTotal, getCartCount]);
}

export function useWishlist() {
  const wishlist = useWishlistItems();
  const addToWishlist = useWishlistAdd();
  const removeFromWishlist = useWishlistRemove();
  const isInWishlist = useWishlistIsIn();
  const toggleWishlist = useWishlistToggle();
  
  return useMemo(() => ({
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
  }), [wishlist, addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist]);
}

export function useSearch() {
  const searchQuery = useSearchQuery();
  const searchResults = useSearchResults();
  const isSearching = useSearchIsSearching();
  const setSearchQuery = useSearchSetQuery();
  const performSearch = useSearchPerform();
  const clearSearch = useSearchClear();
  
  return useMemo(() => ({
    searchQuery,
    searchResults,
    isSearching,
    setSearchQuery,
    performSearch,
    clearSearch,
  }), [searchQuery, searchResults, isSearching, setSearchQuery, performSearch, clearSearch]);
}

export function useFilters() {
  const selectedCategory = useFilterCategory();
  const selectedPriceRange = useFilterPriceRange();
  const selectedTags = useFilterTags();
  const sortBy = useFilterSortBy();
  const setCategory = useFilterSetCategory();
  const setPriceRange = useFilterSetPriceRange();
  const toggleTag = useFilterToggleTag();
  const setSortBy = useFilterSetSortBy();
  const resetFilters = useFilterReset();
  
  return useMemo(() => ({
    selectedCategory,
    selectedPriceRange,
    selectedTags,
    sortBy,
    setCategory,
    setPriceRange,
    toggleTag,
    setSortBy,
    resetFilters,
  }), [selectedCategory, selectedPriceRange, selectedTags, sortBy, setCategory, setPriceRange, toggleTag, setSortBy, resetFilters]);
}

export function useUser() {
  const user = useUserData();
  const isAuthenticated = useUserIsAuth();
  const setUser = useUserSetUser();
  const setAuthenticated = useUserSetAuth();
  const addresses = useUserAddresses();
  const userOrders = useUserOrders();
  const addAddress = useUserAddAddress();
  const removeAddress = useUserRemoveAddress();
  const updateAddress = useUserUpdateAddress();
  const setAddresses = useUserSetAddresses();
  
  return useMemo(() => ({
    user,
    isAuthenticated,
    setUser,
    setAuthenticated,
    addresses,
    userOrders,
    addAddress,
    removeAddress,
    updateAddress,
    setAddresses,
  }), [user, isAuthenticated, setUser, setAuthenticated, addresses, userOrders, addAddress, removeAddress, updateAddress, setAddresses]);
}

export function useUI() {
  const isCartOpen = useUICartOpen();
  const isSearchOpen = useUISearchOpen();
  const isMobileMenuOpen = useUIMobileMenuOpen();
  const isChatOpen = useUIChatOpen();
  const toggleCart = useUIToggleCart();
  const toggleSearch = useUIToggleSearch();
  const toggleMobileMenu = useUIToggleMobileMenu();
  const toggleChat = useUIToggleChat();
  const closeAll = useUICloseAll();
  
  return useMemo(() => ({
    isCartOpen,
    isSearchOpen,
    isMobileMenuOpen,
    isChatOpen,
    toggleCart,
    toggleSearch,
    toggleMobileMenu,
    toggleChat,
    closeAll,
  }), [isCartOpen, isSearchOpen, isMobileMenuOpen, isChatOpen, toggleCart, toggleSearch, toggleMobileMenu, toggleChat, closeAll]);
}
