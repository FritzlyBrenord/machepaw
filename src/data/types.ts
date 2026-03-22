import type { SellerPaymentMethodCode } from "./paymentMethods";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currencyCode?: CurrencyCode;
  originalPrice?: number;
  images: string[];
  categoryId?: string;
  category: string;
  categorySlug?: string;
  subcategory?: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  sku: string;
  features: string[];
  specifications: Record<string, string>;
  isNew?: boolean;
  isBestseller?: boolean;
  isFeatured?: boolean;
  discount?: number;
  ownerType?: "admin" | "seller";
  ownerId?: string;
  sellerId?: string;
  ownerName?: string;
  storeSlug?: string;
  views?: number;
  sales?: number;
  attributes?: ProductAttributeValue[];
  hasVariants?: boolean;
  variants?: ProductVariant[];
  minProcessingDays?: number;
  maxProcessingDays?: number;
  createdAt?: string;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  avatar?: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  images?: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount: number;
  description?: string;
}

export interface Order {
  id: string;
  orderNumber?: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  fulfillmentMethod?: "delivery" | "pickup";
  subtotal?: number;
  discount?: number;
  total: number;
  shipping: number;
  tax: number;
  currency?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  createdAt: string;
  updatedAt: string;
  shippingAddress: Address;
  paymentId?: string;
  paymentProofUrl?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  notes?: string;
}

export interface OrderItem {
  id?: string;
  product: Product;
  quantity: number;
  price: number;
  total?: number;
  sku?: string;
  image?: string;
  status?: OrderStatus;
  sellerId?: string;
  ownerId?: string;
  ownerName?: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "ready_for_pickup"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type AttributeType = "color" | "size" | "select" | "text" | "number" | "boolean" | "multiselect";

export interface CategoryAttribute {
  id: string;
  categoryId?: string;
  name: string;
  label: string;
  type: AttributeType;
  options?: string[]; // For select/multiselect
  required: boolean;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  price?: number; // Override base price
  stock: number;
  attributes: Record<string, string>; // { color: "Rouge", size: "XL" }
  images: string[];
  isActive: boolean;
}

export interface ProductAttributeValue {
  attributeId: string;
  name: string;
  value: string | string[];
}

export interface ProductAttributeSelection {
  attributeId: string;
  name: string;
  value: string;
}

// Enhanced Category with dynamic attributes
export interface CategoryWithAttributes extends Category {
  attributes: CategoryAttribute[];
  parentId?: string | null;
  isActive: boolean;
  sortOrder: number;
}

// Supabase Product type (matches database schema)
export interface SupabaseProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency_code?: CurrencyCode;
  original_price?: number;
  images: string[];
  category_id: string;
  subcategory?: string;
  tags: string[];
  rating: number;
  review_count: number;
  stock: number;
  sku: string;
  features: string[];
  specifications: Record<string, string>;
  is_new: boolean;
  is_bestseller: boolean;
  discount: number;
  is_featured: boolean;
  priority: number;
  owner_type: "admin" | "seller";
  owner_id: string;
  seller_id?: string;
  owner_name: string;
  seller_store_slug?: string;
  status: "active" | "inactive" | "pending" | "rejected" | "out_of_stock";
  admin_notes?: string;
  views: number;
  sales: number;
  created_at: string;
  updated_at: string;
  // Dynamic attributes
  attributes?: ProductAttributeValue[];
  has_variants: boolean;
  variants?: ProductVariant[];
  min_processing_days?: number;
  max_processing_days?: number;
}

export interface Address {
  id?: string;
  label?: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  department?: string;
  arrondissement?: string;
  commune?: string;
  communalSection?: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
  latitude?: number;
  longitude?: number;
}

export interface BoutiqueCustomer {
  id: string;
  sellerId: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  status: "active" | "blocked";
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  addresses: Address[];
  wishlist: string[];
  orders: string[];
  createdAt: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  selectedAttributes: ProductAttributeSelection[];
}

// Seller Types
export type SellerStatus = "pending" | "approved" | "rejected" | "suspended";
export type SellerKycStatus =
  | "not_submitted"
  | "pending"
  | "approved"
  | "rejected"
  | "needs_more_info";

export type SellerKycDocumentType =
  | "national_id"
  | "tax_document"
  | "proof_of_address"
  | "business_registration"
  | "bank_statement"
  | "selfie_verification"
  | "other";

export interface SellerNotificationSettings {
  newOrders: boolean;
  newMessages: boolean;
  productReviews: boolean;
  promotions: boolean;
  newsletter: boolean;
}

export interface SellerShippingSettings {
  freeShipping: boolean;
  freeShippingThreshold?: number;
  standardRate?: number;
  expressRate?: number;
  // Distance-based shipping
  basePrice?: number;
  pricePerKm?: number;
  locationName?: string;
  locationType?: string;
  locationDept?: string;
  latitude?: number;
  longitude?: number;
  allowDelivery?: boolean;
  allowPickup?: boolean;
}

export interface SellerPayoutDetails {
  accountHolder?: string;
  bankName?: string;
  accountNumber?: string;
  payoutNote?: string;
}

export interface SellerPaymentMethod {
  id: string;
  sellerId: string;
  methodCode: SellerPaymentMethodCode;
  isActive: boolean;
  merchantFirstName?: string;
  merchantLastName?: string;
  merchantAgentCode?: string;
  createdAt: string;
  updatedAt: string;
}

export type SellerPlanSlug = "free" | "pro" | "premium";
export type SellerPlanBillingInterval = "monthly" | "yearly" | "one_time";
export type SellerPlanRequestStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected"
  | "cancelled";
export type SellerCurrentPlanStatus = "none" | "active";

export interface SellerPlanFeature {
  key: string;
  label: string;
  enabled: boolean;
  description?: string;
}

export type SellerPlanLimits = Record<string, string | number | boolean | null | undefined>;

export interface SellerPlan {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  promoPrice?: number;
  currencyCode: CurrencyCode;
  billingInterval: SellerPlanBillingInterval;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  features: SellerPlanFeature[];
  limits: SellerPlanLimits;
  createdAt: string;
  updatedAt: string;
  subscribersCount?: number;
  activeSubscribersCount?: number;
  pendingRequestsCount?: number;
}

export interface SellerPlanRequest {
  id: string;
  sellerId: string;
  planId: string;
  status: SellerPlanRequestStatus;
  paymentMethod?: SellerPaymentMethodCode;
  paymentFirstName?: string;
  paymentLastName?: string;
  paymentReference?: string;
  paymentProofUrl?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  plan?: SellerPlan;
  sellerBusinessName?: string;
  sellerUserId?: string;
  sellerContactEmail?: string;
}

export interface SellerKycDocument {
  id: string;
  userId: string;
  sellerId?: string;
  sellerApplicationId?: string;
  documentType: SellerKycDocumentType;
  storageBucket: string;
  storagePath: string;
  fileName?: string;
  mimeType?: string;
  status: Exclude<SellerKycStatus, "not_submitted">;
  notes?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  previewUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Seller {
  id: string;
  userId: string;
  status: SellerStatus;
  businessName: string;
  storeSlug?: string;
  businessType: "individual" | "company";
  hasPhysicalStore: boolean;
  physicalStoreAddress?: Address;
  taxId?: string;
  description: string;
  categories: string[];
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  logo?: string;
  banner?: string;
  storefrontThemeSlug?: string;
  storefrontThemeConfig?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  products: string[];
  totalSales: number;
  totalRevenue: number;
  rating: number;
  reviewCount: number;
  isVerified?: boolean;
  commissionRate?: number;
  kycStatus?: SellerKycStatus;
  kycSubmittedAt?: string;
  kycReviewedAt?: string;
  kycReviewNotes?: string;
  notificationSettings?: SellerNotificationSettings;
  shippingSettings?: SellerShippingSettings;
  payoutDetails?: SellerPayoutDetails;
  pickupAddress?: Address;
  currentPlanId?: string;
  currentPlanStatus?: SellerCurrentPlanStatus;
  currentPlanRequestId?: string;
  requestedPlanId?: string;
  planSelectionCompleted?: boolean;
  planStartedAt?: string;
  planExpiresAt?: string;
  planPaymentMethod?: SellerPaymentMethodCode;
  planPaymentFirstName?: string;
  planPaymentLastName?: string;
  planPaymentReference?: string;
  planPaymentProofUrl?: string;
  planReviewedAt?: string;
  planUpdatedAt?: string;
  currentPlan?: SellerPlan;
  requestedPlan?: SellerPlan;
}

export interface SellerApplication {
  id: string;
  userId: string;
  status: SellerStatus;
  step: 1 | 2 | 3;

  // Step 1: Personal Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Step 2: Business Info
  businessName: string;
  businessType: "individual" | "company";
  hasPhysicalStore: boolean;
  physicalStoreAddress?: Address;
  taxId?: string;

  // Step 3: Product Info
  categories: string[];
  productTypes: string;
  description: string;
  estimatedProducts: number;

  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  reviewedNotes?: string;
  legalName?: string;
  identityDocumentNumber?: string;
  kycStatus?: SellerKycStatus;
  kycDocuments?: SellerKycDocument[];
}

export interface SellerOrder {
  id: string;
  orderId: string;
  sellerId: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  status: OrderStatus;
  customerName: string;
  customerAddress: Address;
  createdAt: string;
  updatedAt: string;
}

export interface SellerWorkspaceOrderItem {
  id: string;
  orderId: string;
  orderNumber: string;
  productId: string;
  productName: string;
  sku?: string;
  image?: string;
  quantity: number;
  price: number;
  total: number;
  itemStatus: OrderStatus;
  orderStatus: OrderStatus;
  paymentStatus?: string;
  paymentMethod?: string;
  paymentId?: string;
  paymentProofPath?: string;
  trackingNumber?: string;
  fulfillmentMethod?: "delivery" | "pickup";
  shippingAddress: Address;
  customerId: string;
  customerName: string;
  customerEmail: string;
  createdAt: string;
  updatedAt: string;
}

export interface SellerStats {
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
  totalSales: number;
  pendingOrders: number;

  // Time-based stats
  daily: { date: string; orders: number; revenue: number }[];
  weekly: { week: string; orders: number; revenue: number }[];
  monthly: { month: string; orders: number; revenue: number }[];

  // Product performance
  topProducts: { productId: string; name: string; sales: number; revenue: number }[];
}

export interface SellerProduct extends Product {
  sellerId: string;
  sellerName: string;
  status: "active" | "inactive" | "out_of_stock" | "pending";
  views: number;
  sales: number;
  createdAt: string;
  updatedAt: string;
}

// Admin Types
export type UserRole = "admin" | "customer" | "seller";
export type AdminProductStatus = "active" | "inactive" | "pending" | "rejected";
export type CurrencyCode = "HTG" | "USD" | "EUR" | "DOP";

export interface AdminUser extends User {
  role: UserRole;
  isBlocked: boolean;
  lastLogin?: string;
  sellerId?: string;
  ordersCount: number;
  totalSpent: number;
}

export interface AdminSeller extends Seller {
  reviewId?: string;
  applicationId?: string;
  applicationStatus?: string;
  currentStep?: number;
  legalName?: string;
  identityDocumentNumber?: string;
  productTypes?: string;
  estimatedProducts?: number;
  applicationFirstName?: string;
  applicationLastName?: string;
  applicationEmail?: string;
  applicationPhone?: string;
  applicationDate: string;
  isVerified: boolean;
  commissionRate: number;
  productsCount: number;
  rejectionReason?: string;
  blockedUntil?: string;
  blockReason?: string;
}

export interface AdminSellerDossier {
  seller: AdminSeller;
  application?: SellerApplication;
  documents: SellerKycDocument[];
}

export interface AdminProduct extends Product {
  ownerType: "admin" | "seller";
  ownerId: string;
  ownerName: string;
  status: AdminProductStatus;
  adminNotes?: string;
  isFeatured: boolean;
  priority: number;
  views: number;
  sales: number;
  createdAt: string;
  updatedAt: string;
  reviews: Review[];
}

export interface AdminOrder extends Order {
  sellerId?: string;
  sellerName?: string;
  products: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    sellerId?: string;
    sellerName?: string;
  }[];
}

export type ShippingZoneScope =
  | "global"
  | "country"
  | "department"
  | "arrondissement"
  | "commune"
  | "section_communale"
  | "city"
  | "custom";

export interface ShippingDestination {
  country?: string;
  department?: string;
  arrondissement?: string;
  commune?: string;
  communalSection?: string;
  city?: string;
}

export interface ShippingRate {
  id: string;
  name: string;
  baseRate: number;
  perKgRate: number;
  isFreeEnabled?: boolean;
  freeShippingThreshold?: number;
  isActive: boolean;
  zoneScope?: ShippingZoneScope;
  zoneValues?: string[];
  countryCode?: string;
  priority?: number;
  isFallback?: boolean;
  // Advanced Rules
  minQuantity?: number;
  maxQuantity?: number;
  categoryId?: string;
  // Legacy fields kept optional for backward compatibility while migrating
  regions?: string[];
  country?: string;
  city?: string;
  communalSection?: string;

  // Distance-based shipping
  basePrice?: number;
  pricePerKm?: number;
  locationName?: string;
  locationType?: string;
  locationDept?: string;
  latitude?: number;
  longitude?: number;
}


export interface CurrencySetting {
  code: CurrencyCode;
  name: string;
  symbol: string;
  exchangeRate: number; // vs USD
  isActive: boolean;
  isDefault: boolean;
  decimals: number;
}

export interface AdminSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  supportPhone: string;
  maintenanceMode: boolean;
  allowNewRegistrations: boolean;
  requireEmailVerification: boolean;
  sellerCommissionRate: number;
  autoApproveSellers: boolean;
  defaultShippingBaseRate: number;
  freeShippingThreshold?: number;
  taxRate?: number;
  currencies: CurrencySetting[];
  shippingRates: ShippingRate[];

  // Distance-based shipping (Admin)
  basePrice?: number;
  pricePerKm?: number;
  locationName?: string;
  locationType?: string;
  locationDept?: string;
  latitude?: number;
  longitude?: number;
  allowPickup?: boolean;
  pickupAddress?: string;
}

export interface AdminConversation {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  subject: string;
  status: "open" | "closed" | "pending";
  priority: "low" | "medium" | "high";
  isAutomated: boolean;
  lastMessage: string;
  lastMessageAt: string;
  createdAt: string;
  messages: AdminMessage[];
}

export interface AdminMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderType: "user" | "admin" | "system";
  content: string;
  isAutomated: boolean;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalSellers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  pendingSellers: number;
  pendingProducts: number;
  todayRevenue: number;
  todayOrders: number;
  newUsersToday: number;
  newSellersToday: number;
  weeklyRevenue: { day: string; revenue: number; orders: number }[];
  topProducts: { id: string; name: string; sales: number; revenue: number }[];
  topSellers: { id: string; name: string; sales: number; revenue: number }[];
}
