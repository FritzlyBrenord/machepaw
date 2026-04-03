// ============================================
// E-COMMERCE TYPES
// ============================================

export interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  images?: string[];
  badge?: string;
  rating?: number;
  reviewCount?: number;
  sku?: string;
  inStock?: boolean;
  quantity?: number;
  category: string;
  sellerId?: string;
  storeSlug?: string;
  subcategory?: string;
  sizes?: string[];
  colors?: { name: string; hex: string }[];
  storage?: string[];
  description?: string;
  features?: string[];
  specifications?: Record<string, string>;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description?: string;
  productCount?: number;
  parentId?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  storeSlug?: string;
  size?: string;
  color?: string;
  storage?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  color?: string;
  storage?: string;
}

export interface Order {
  id: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  subtotal: number;
  shipping: number;
  discount: number;
  items: OrderItem[];
  trackingNumber?: string;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
  notes?: string;
}

export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
  type?: 'shipping' | 'billing' | 'both';
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'cod';
  name: string;
  last4?: string;
  expiryMonth?: string;
  expiryYear?: string;
  isDefault?: boolean;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  date: string;
  content: string;
  verified?: boolean;
  avatar?: string;
  photos?: string[];
  helpful?: number;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  newsletterSubscribed?: boolean;
}

export interface Coupon {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  minOrder?: number;
  expiryDate?: string;
  usageLimit?: number;
  usageCount: number;
}

export interface ShippingOption {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
  description?: string;
}
