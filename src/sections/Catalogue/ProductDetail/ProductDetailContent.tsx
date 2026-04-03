"use client";

// ============================================
// PRODUCT DETAIL CONTENT — 100% Configurable Architecture
// ============================================

import { useMemo, useState } from "react";
import { useNavigate, useParams } from "@/lib/router";
import { motion } from "framer-motion";
import {
  Heart,
  ShoppingCart,
  Share2,
  Truck,
  Shield,
  ShieldCheck,
  RotateCcw,
  Star,
  ChevronLeft,
  ChevronRight,
  Check,
  Minus,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  categories as sampleCategories,
  getProductById,
  getRelatedProducts,
} from "@/lib/products-data";
import {
  buildCatalogFromStorefrontStore,
  type StorefrontCatalogCategory,
  type StorefrontCatalogProduct,
} from "@/lib/storefront-catalog";
import type { StorefrontSectionStoreData } from "@/lib/storefront-section-data";
import { useEcommerceStore } from "@/store/ecommerce-store";
import { useCart } from "@/store";
import { buildCartProduct } from "@/lib/cart-product";
import { cn, formatPrice } from "@/lib/utils";
import { SectionWrapper, SectionContainer } from "@/components/SectionWrapper";
import { useSectionStyles } from "@/hooks/useSectionStyles";
import productDetailContentSchema from "./ProductDetailContent.schema";

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────
export interface ProductDetailContentProps {
  id?: string;
  testId?: string;
  content?: {
    product?: Partial<StorefrontCatalogProduct> & Record<string, any>;
    addToCartLabel?: string;
    buyNowLabel?: string;
    outOfStockLabel?: string;
    inStockLabel?: string;
    quantityLabel?: string;
    descriptionLabel?: string;
    specificationsLabel?: string;
    reviewsLabel?: string;
    shippingLabel?: string;
    returnsLabel?: string;
    shareLabel?: string;
    wishlistLabel?: string;
    relatedProductsTitle?: string;
    freeShippingMessage?: string;
    // Trust badges
    securePaymentLabel?: string;
    returns30DaysLabel?: string;
    breadcrumbLabel?: string;
    shippingTabContent?: string;
    noDescriptionLabel?: string;
    specsLabels?: {
      sku?: string;
      category?: string;
      notAvailable?: string;
    };
  };
  config?: {
    showReviews?: boolean;
    showSizeGuide?: boolean;
    showShippingInfo?: boolean;
    showRelatedProducts?: boolean;
    enableWishlist?: boolean;
    enableShare?: boolean;
    showQuantitySelector?: boolean;
    showBadges?: boolean;
    showTrustBadges?: boolean;
    showSpecsTab?: boolean;
    showBreadcrumb?: boolean;
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
      container?: "full" | "contained" | "narrow";
    };
  };
  classes?: {
    root?: string;
    imageGallery?: string;
    productInfo?: string;
    price?: string;
    addToCartButton?: string;
    relatedSection?: string;
  };
  storefrontStore?: StorefrontSectionStoreData | null;
}

// ─────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────
function resolveColor(color: string | undefined, defaultColor: string): string {
  if (!color) return defaultColor;
  const colorMap: Record<string, string> = {
    primary: "var(--color-primary, #1a1a1a)",
    secondary: "var(--color-secondary, #f5f5f5)",
    accent: "var(--color-accent, #c9a96e)",
    muted: "var(--color-muted, #6b7280)",
    white: "#ffffff",
    black: "#000000",
    transparent: "transparent",
  };
  return colorMap[color] || color;
}

// ─────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────
export function ProductDetailContent({
  id,
  testId,
  content = {},
  config = {},
  style = {},
  classes = {},
  storefrontStore,
}: ProductDetailContentProps) {
  const params = useParams();
  const navigate = useNavigate();
  const productId = params.id;

  // ── EXTRACT CONFIG ──
  const {
    showReviews = true,
    showSizeGuide = true,
    showShippingInfo = true,
    showRelatedProducts = true,
    enableWishlist = true,
    enableShare = true,
    showQuantitySelector = true,
    showBadges = true,
    showTrustBadges = true,
    showSpecsTab = true,
    showBreadcrumb = true,
  } = config;

  // ── EXTRACT CONTENT ──
  const {
    addToCartLabel = "Ajouter au panier",
    buyNowLabel = "Acheter maintenant",
    outOfStockLabel = "Rupture de stock",
    inStockLabel = "En stock",
    quantityLabel = "Quantite",
    descriptionLabel = "Description",
    specificationsLabel = "Specifications",
    reviewsLabel = "Avis clients",
    shippingLabel = "Livraison",
    returnsLabel = "Retours",
    shareLabel = "Partager",
    wishlistLabel = "Favoris",
    relatedProductsTitle = "Produits similaires",
    freeShippingMessage = "Livraison gratuite disponible",
    securePaymentLabel = "Paiement securise",
    returns30DaysLabel = "Retours sous 30 jours",
    breadcrumbLabel = "Produits",
    shippingTabContent = "Informations de livraison a completer selon les politiques de la boutique.",
    noDescriptionLabel = "Aucune description disponible.",
    specsLabels = {},
  } = content;

  const {
    sku: skuLabel = "SKU",
    category: categorySpecLabel = "Categorie",
    notAvailable: notAvailableLabel = "N/A",
  } = specsLabels;

  // ── EXTRACT STYLE ──
  const { colors: styleColors = {}, spacing: styleSpacing = {} } = style;

  const {
    background: backgroundColor = "white",
    text: textColor = "primary",
    accent: accentColor = "accent",
    cardBg: cardBgColor = "white",
    border: borderColor,
  } = styleColors;

  const { container = "contained", paddingY = "12" } = styleSpacing;

  // ── HOOKS ──
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useEcommerceStore();
  const { css } = useSectionStyles(style);

  // ── HELPERS ──
  const resolvedBgColor = resolveColor(backgroundColor, "#ffffff");
  const resolvedTextColor = resolveColor(textColor, "#1a1a1a");
  const resolvedAccentColor = resolveColor(accentColor, "#c9a96e");
  const resolvedCardBgColor = resolveColor(cardBgColor, "#ffffff");
  const resolvedBorderColor = borderColor
    ? resolveColor(borderColor, "#e5e5e5")
    : "#e5e5e5";

  // ── DATA ──
  const storefrontCatalog = useMemo(
    () => buildCatalogFromStorefrontStore(storefrontStore),
    [storefrontStore],
  );

  const productCatalog = storefrontCatalog.products;
  const categoryCatalog: StorefrontCatalogCategory[] =
    storefrontCatalog.categories.length > 0
      ? storefrontCatalog.categories
      : sampleCategories;
  const fallbackContentProduct = content.product;

  const product = useMemo(() => {
    if (productCatalog.length > 0) {
      const matchedProduct = productCatalog.find(
        (item) => item.id === productId,
      );
      if (matchedProduct) {
        return matchedProduct;
      }
    }
    if (fallbackContentProduct && typeof fallbackContentProduct === "object") {
      return fallbackContentProduct as StorefrontCatalogProduct;
    }
    return getProductById(productId || "");
  }, [fallbackContentProduct, productCatalog, productId]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    if (productCatalog.length > 0) {
      return productCatalog
        .filter(
          (item) =>
            item.id !== product.id && item.category === product.category,
        )
        .slice(0, 4);
    }
    return getRelatedProducts(product.id, 4);
  }, [product, productCatalog]);

  const category = useMemo(() => {
    if (!product) return undefined;
    return categoryCatalog.find(
      (item) =>
        item.slug === product.category ||
        item.id === ("categoryId" in product ? product.categoryId : undefined),
    );
  }, [categoryCatalog, product]);

  // ── STATE ──
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  // ── HANDLERS ──
  const handleAddToCart = () => {
    if (!product) return;

    const cartProduct = buildCartProduct({
      ...product,
      sellerId: storefrontStore?.sellerId || product.sellerId,
      storeSlug: storefrontStore?.storeSlug || product.storeSlug,
    });

    addToCart(cartProduct, quantity);
    toast.success(`${product.name} ajouté au panier`);
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    toggleWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      image: productImages[0] || "",
      category: product.category,
      sellerId: storefrontStore?.sellerId || product.sellerId,
      storeSlug: storefrontStore?.storeSlug || product.storeSlug,
    });
    toast.success(
      isInWishlist(product.id) ? "Retiré des favoris" : "Ajouté aux favoris",
    );
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name || "",
          url: window.location.href,
        });
      } catch {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Lien copié dans le presse-papiers");
    }
  };

  // ── RENDER ──
  if (!product) {
    return (
      <SectionWrapper
        id={id}
        testId={testId}
        as="section"
        className={classes?.root}
        style={{ backgroundColor: resolvedBgColor, ...css }}
      >
        <SectionContainer size={container} className="py-20 text-center">
          <p style={{ color: resolvedTextColor }}>Produit non trouvé</p>
        </SectionContainer>
      </SectionWrapper>
    );
  }

  const productImages =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : [product.image || "/images/placeholder.jpg"];

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;

  return (
    <SectionWrapper
      id={id}
      testId={testId}
      as="section"
      className={classes?.root}
      style={{
        backgroundColor: resolvedBgColor,
        paddingTop: `${parseInt(paddingY) * 0.25}rem`,
        paddingBottom: `${parseInt(paddingY) * 0.25}rem`,
        ...css,
      }}
    >
      <SectionContainer size={container}>
        {/* Breadcrumb */}
        {showBreadcrumb ? (
          <nav className="mb-6 text-sm">
            <button
              type="button"
              onClick={() => navigate("products")}
              className="hover:underline"
            >
              {breadcrumbLabel}
            </button>
            <ChevronRight className="mx-2 inline h-4 w-4" />
            <span className="text-gray-500">{product.name}</span>
          </nav>
        ) : null}

        {/* Main Product Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Image Gallery */}
          <div className={cn("space-y-4", classes?.imageGallery)}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative aspect-square overflow-hidden rounded-2xl"
              style={{ backgroundColor: resolvedCardBgColor }}
            >
              <img
                src={productImages[selectedImage] || "/images/placeholder.jpg"}
                alt={product.name}
                className="h-full w-full object-cover"
              />

              {/* Badges */}
              {showBadges && (
                <div className="absolute left-4 top-4 flex flex-col gap-2">
                  {product.badge && (
                    <Badge style={{ backgroundColor: resolvedAccentColor }}>
                      {product.badge}
                    </Badge>
                  )}
                  {discount && (
                    <Badge variant="destructive">-{discount}%</Badge>
                  )}
                </div>
              )}

              {/* Image Navigation */}
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelectedImage((prev) =>
                        prev === 0 ? productImages.length - 1 : prev - 1,
                      )
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg transition-all hover:bg-white"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() =>
                      setSelectedImage((prev) =>
                        prev === productImages.length - 1 ? 0 : prev + 1,
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg transition-all hover:bg-white"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </motion.div>

            {/* Thumbnails */}
            {productImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "relative aspect-square w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                      selectedImage === index ? "ring-2" : "",
                    )}
                    style={{
                      borderColor:
                        selectedImage === index
                          ? resolvedAccentColor
                          : resolvedBorderColor,
                    }}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className={cn("space-y-6", classes?.productInfo)}>
            <div>
              {category && (
                <p
                  className="mb-2 text-sm font-medium uppercase tracking-wide"
                  style={{ color: resolvedAccentColor }}
                >
                  {category.name}
                </p>
              )}
              <h1
                className="text-3xl font-bold"
                style={{ color: resolvedTextColor }}
              >
                {product.name}
              </h1>

              {/* Rating */}
              {showReviews && product.rating && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="h-4 w-4"
                        fill={
                          star <= Math.round(product.rating!)
                            ? resolvedAccentColor
                            : "none"
                        }
                        style={{ color: resolvedAccentColor }}
                      />
                    ))}
                  </div>
                  <span
                    className="text-sm"
                    style={{ color: `${resolvedTextColor}60` }}
                  >
                    ({product.reviewCount || 0} avis)
                  </span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className={cn("flex items-baseline gap-3", classes?.price)}>
              <span
                className="text-3xl font-bold"
                style={{ color: resolvedAccentColor }}
              >
                {formatPrice(product.price)}
              </span>
              {product.oldPrice && (
                <span
                  className="text-xl line-through"
                  style={{ color: `${resolvedTextColor}40` }}
                >
                  {formatPrice(product.oldPrice)}
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p style={{ color: `${resolvedTextColor}80` }}>
                {product.description}
              </p>
            )}

            {/* Quantity Selector */}
            {showQuantitySelector && (
              <div className="flex items-center gap-4">
                <span
                  className="font-medium"
                  style={{ color: resolvedTextColor }}
                >
                  {quantityLabel}
                </span>
                <div
                  className="flex items-center rounded-lg border"
                  style={{ borderColor: resolvedBorderColor }}
                >
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-3 transition hover:bg-gray-100"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-3 transition hover:bg-gray-100"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  product.inStock !== false ? "bg-green-500" : "bg-red-500",
                )}
              />
              <span
                className="text-sm font-medium"
                style={{
                  color: product.inStock !== false ? "#22c55e" : "#ef4444",
                }}
              >
                {product.inStock !== false ? inStockLabel : outOfStockLabel}
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={product.inStock === false}
                className={cn("flex-1", classes?.addToCartButton)}
                size="lg"
                style={{ backgroundColor: resolvedAccentColor }}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {addToCartLabel}
              </Button>

              <Button
                onClick={() => {
                  handleAddToCart();
                  navigate("cart");
                }}
                disabled={product.inStock === false}
                variant="outline"
                size="lg"
                style={{ borderColor: resolvedBorderColor }}
              >
                {buyNowLabel}
              </Button>

              {enableWishlist && (
                <Button
                  onClick={handleToggleWishlist}
                  variant="outline"
                  size="lg"
                  className={cn(isInWishlist(product.id) && "bg-red-50")}
                  style={{ borderColor: resolvedBorderColor }}
                >
                  <Heart
                    className="h-5 w-5"
                    fill={isInWishlist(product.id) ? "#ef4444" : "none"}
                    style={{
                      color: isInWishlist(product.id) ? "#ef4444" : undefined,
                    }}
                  />
                </Button>
              )}

              {enableShare && (
                <Button
                  onClick={handleShare}
                  variant="outline"
                  size="lg"
                  style={{ borderColor: resolvedBorderColor }}
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              )}
            </div>

            {/* Trust Badges */}
            {showTrustBadges ? (
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4" />
                  {securePaymentLabel}
                </span>
                <span className="flex items-center gap-1">
                  <RotateCcw className="h-4 w-4" />
                  {returns30DaysLabel}
                </span>
              </div>
            ) : null}

            {/* Tabs */}
            <Tabs defaultValue="description" className="mt-8">
              <TabsList style={{ backgroundColor: `${resolvedTextColor}05` }}>
                <TabsTrigger value="description">
                  {descriptionLabel}
                </TabsTrigger>
                {showSpecsTab ? (
                  <TabsTrigger value="specs">{specificationsLabel}</TabsTrigger>
                ) : null}
                {showShippingInfo ? (
                  <TabsTrigger value="shipping">{shippingLabel}</TabsTrigger>
                ) : null}
              </TabsList>

              <TabsContent value="description" className="mt-4">
                <p style={{ color: `${resolvedTextColor}80` }}>
                  {product.description || contentNoDescriptionLabel}
                </p>
              </TabsContent>

              {showSpecsTab ? (
                <TabsContent value="specs" className="mt-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div
                      className="rounded-lg p-4"
                      style={{ backgroundColor: resolvedCardBgColor }}
                    >
                      <p className="text-sm text-gray-500">{skuLabel}</p>
                      <p className="font-medium">
                        {product.sku || notAvailableLabel}
                      </p>
                    </div>
                    <div
                      className="rounded-lg p-4"
                      style={{ backgroundColor: resolvedCardBgColor }}
                    >
                      <p className="text-sm text-gray-500">
                        {categorySpecLabel}
                      </p>
                      <p className="font-medium">
                        {product.category || notAvailableLabel}
                      </p>
                    </div>
                  </div>
                </TabsContent>
              ) : null}

              {showShippingInfo ? (
                <TabsContent value="shipping" className="mt-4">
                  <p className="text-gray-600">{shippingTabContent}</p>
                </TabsContent>
              ) : null}
            </Tabs>
          </div>
        </div>

        {/* Related Products */}
        {showRelatedProducts && relatedProducts.length > 0 && (
          <div className={cn("mt-16", classes?.relatedSection)}>
            <h2
              className="mb-6 text-2xl font-bold"
              style={{ color: resolvedTextColor }}
            >
              {relatedProductsTitle}
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <motion.div
                  key={relatedProduct.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group cursor-pointer rounded-xl border p-4 transition-all hover:shadow-lg"
                  style={{
                    borderColor: resolvedBorderColor,
                    backgroundColor: resolvedCardBgColor,
                  }}
                  onClick={() => navigate("product", { id: relatedProduct.id })}
                >
                  <div className="relative aspect-square overflow-hidden rounded-lg">
                    <img
                      src={
                        relatedProduct.images?.[0] ||
                        relatedProduct.image ||
                        "/images/placeholder.jpg"
                      }
                      alt={relatedProduct.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <h3
                    className="mt-3 font-medium line-clamp-2"
                    style={{ color: resolvedTextColor }}
                  >
                    {relatedProduct.name}
                  </h3>
                  <p
                    className="font-bold"
                    style={{ color: resolvedAccentColor }}
                  >
                    {formatPrice(relatedProduct.price)}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </SectionContainer>
    </SectionWrapper>
  );
}

Object.assign(ProductDetailContent, { schema: productDetailContentSchema });

export const schema = productDetailContentSchema;

export default ProductDetailContent;
