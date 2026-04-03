"use client";

// ============================================
// PRODUCT DETAIL — 100% Configurable Architecture
// ============================================

import { useState } from "react";
import {
  Star,
  Heart,
  Truck,
  RotateCcw,
  Shield,
  Minus,
  Plus,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/store";
import { buildCartProduct } from "@/lib/cart-product";
import { toast } from "sonner";
import { SectionWrapper, SectionContainer } from "@/components/SectionWrapper";
import { cn, useSectionStyles } from "@/hooks/useSectionStyles";
import productDetailSchema from "./ProductDetail.schema";

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────
export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  images?: string[];
  description?: string;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  colors?: ProductColor[];
  sizes?: string[];
  sku?: string;
  category?: string;
}

export interface ProductDetailContent {
  product?: Partial<Product> & Record<string, any>;
  addToCartLabel?: string;
  sizeGuideLabel?: string;
  shippingLabels?: {
    freeShipping?: string;
    freeReturns?: string;
    securePayment?: string;
  };
  attributeLabels?: {
    size?: string;
    color?: string;
  };
  addedToCartMessage?: string;
}

export interface ProductDetailConfig {
  showReviews?: boolean;
  showSizeGuide?: boolean;
  showShippingInfo?: boolean;
  showWishlist?: boolean;
  animation?: {
    entrance?: "fade-in" | "slide-up" | "scale-in" | "none";
  };
}

export interface ProductDetailStyle {
  colors?: {
    background?: string;
    text?: string;
    accent?: string;
    border?: string;
  };
  spacing?: {
    paddingY?: string;
    container?: "full" | "contained" | "narrow";
  };
}

export interface ProductDetailClasses {
  root?: string;
  imageContainer?: string;
  thumbnailGallery?: string;
  infoContainer?: string;
  title?: string;
  price?: string;
  oldPrice?: string;
  description?: string;
  colorSelector?: string;
  sizeSelector?: string;
  addToCartButton?: string;
  wishlistButton?: string;
  shippingInfo?: string;
}

export interface ProductDetailProps {
  id?: string;
  testId?: string;
  content?: ProductDetailContent;
  config?: ProductDetailConfig;
  style?: ProductDetailStyle;
  classes?: ProductDetailClasses;
  storefrontStore?: {
    sellerId?: string;
    storeSlug?: string;
  };
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
// MAIN PRODUCT DETAIL COMPONENT
// ─────────────────────────────────────────
export function ProductDetail({
  id,
  testId,
  content = {},
  config = {},
  style = {},
  classes = {},
  storefrontStore,
}: ProductDetailProps) {
  // ── EXTRACT CONTENT ──
  const {
    product,
    addToCartLabel = "Ajouter au panier",
    sizeGuideLabel = "Guide des tailles",
    shippingLabels = {
      freeShipping: "Livraison gratuite des 100 EUR d'achat",
      freeReturns: "Retours gratuits sous 30 jours",
      securePayment: "Paiement 100% securise",
    },
    attributeLabels = {
      size: "Taille",
      color: "Couleur",
    },
    addedToCartMessage = "{name} a ete ajoute au panier",
  } = content;

  // ── EXTRACT CONFIG ──
  const {
    showReviews = true,
    showSizeGuide = true,
    showShippingInfo = true,
    showWishlist = true,
    animation = { entrance: "fade-in" },
  } = config;

  // ── EXTRACT STYLE ──
  const { colors: styleColors = {}, spacing: styleSpacing = {} } = style;

  const {
    background: backgroundColor = "white",
    text: textColor = "primary",
    accent: accentColor = "accent",
    border: borderColor,
  } = styleColors;

  const { container = "contained", paddingY = "16" } = styleSpacing;

  // ── STATE ──
  const productImages = product?.images || [product?.image || ""];
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(
    product?.sizes?.[0] || null,
  );
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(
    product?.colors?.[0] || null,
  );
  const [quantity, setQuantity] = useState(1);

  // ── HOOKS ──
  const { addToCart } = useCart();
  const { css } = useSectionStyles(style);

  // ── HELPERS ──
  const resolvedBgColor = resolveColor(backgroundColor, "#ffffff");
  const resolvedTextColor = resolveColor(textColor, "#1a1a1a");
  const resolvedAccentColor = resolveColor(accentColor, "#c9a96e");
  const resolvedBorderColor = borderColor
    ? resolveColor(borderColor, "#e5e5e5")
    : "#e5e5e5";

  const handleAddToCart = () => {
    if (!product) return;

    const selectedAttributes = [];
    if (selectedSize) {
      selectedAttributes.push({
        attributeId: "size",
        name: attributeLabels.size,
        value: selectedSize,
        label: attributeLabels.size,
      });
    }
    if (selectedColor) {
      selectedAttributes.push({
        attributeId: "color",
        name: attributeLabels.color,
        value: selectedColor.name,
        label: attributeLabels.color,
      });
    }

    addToCart(
      buildCartProduct({
        ...product,
        sellerId: storefrontStore?.sellerId,
        storeSlug: storefrontStore?.storeSlug,
      }),
      quantity,
      { selectedAttributes },
    );
    toast.success(addedToCartMessage.replace("{name}", product.name));
  };

  if (!product) return null;

  // ── RENDER ──
  return (
    <SectionWrapper
      id={id}
      testId={testId}
      as="section"
      animation={animation}
      className={cn("w-full", classes?.root)}
      style={{
        backgroundColor: resolvedBgColor,
        color: resolvedTextColor,
        ...css,
      }}
    >
      <SectionContainer
        size={container}
        style={{
          paddingTop: `${parseInt(paddingY) * 0.25}rem`,
          paddingBottom: `${parseInt(paddingY) * 0.25}rem`,
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className={cn("space-y-4", classes?.imageContainer)}
          >
            {/* Main Image */}
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img
                src={productImages[selectedImage] || product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Gallery */}
            {productImages.length > 1 && (
              <div className={cn("flex gap-3", classes?.thumbnailGallery)}>
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className="w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors"
                    style={{
                      borderColor:
                        selectedImage === index
                          ? resolvedAccentColor
                          : "transparent",
                    }}
                  >
                    <img
                      src={image}
                      alt={`${product.name} - ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={cn("space-y-6", classes?.infoContainer)}
          >
            {/* Badge & Title */}
            <div>
              {product.badge && (
                <Badge
                  className="mb-3"
                  style={{
                    backgroundColor: resolvedAccentColor,
                    color: "#ffffff",
                  }}
                >
                  {product.badge}
                </Badge>
              )}
              <h1
                className={cn("text-3xl sm:text-4xl font-bold", classes?.title)}
                style={{ color: resolvedTextColor }}
              >
                {product.name}
              </h1>
            </div>

            {/* Rating */}
            {showReviews && product.rating && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating!) ? "fill-current" : ""
                      }`}
                      style={{ color: resolvedAccentColor }}
                    />
                  ))}
                </div>
                <span style={{ color: `${resolvedTextColor}99` }}>
                  {product.rating} ({product.reviewCount || 0} avis)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-4">
              <span
                className={cn("text-3xl font-bold", classes?.price)}
                style={{ color: resolvedTextColor }}
              >
                {product.price}€
              </span>
              {product.oldPrice && (
                <span
                  className={cn("text-xl line-through", classes?.oldPrice)}
                  style={{ color: `${resolvedTextColor}66` }}
                >
                  {product.oldPrice}€
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p
                className={cn(classes?.description)}
                style={{ color: `${resolvedTextColor}99` }}
              >
                {product.description}
              </p>
            )}

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className={cn(classes?.colorSelector)}>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: resolvedTextColor }}
                >
                  Couleur: {selectedColor?.name}
                </label>
                <div className="flex gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      className="w-10 h-10 rounded-full border-2 transition-all"
                      style={{
                        backgroundColor: color.hex,
                        borderColor:
                          selectedColor?.name === color.name
                            ? resolvedAccentColor
                            : "#e5e5e5",
                      }}
                      title={color.name}
                    >
                      {selectedColor?.name === color.name && (
                        <Check
                          className="w-5 h-5 mx-auto"
                          style={{
                            color: color.hex === "#ffffff" ? "#000" : "#fff",
                          }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className={cn(classes?.sizeSelector)}>
                <div className="flex items-center justify-between mb-2">
                  <label
                    className="text-sm font-medium"
                    style={{ color: resolvedTextColor }}
                  >
                    Taille: {selectedSize}
                  </label>
                  {showSizeGuide && (
                    <button
                      className="text-sm underline"
                      style={{ color: resolvedAccentColor }}
                    >
                      {sizeGuideLabel}
                    </button>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className="px-4 py-2 border rounded-md transition-colors"
                      style={{
                        backgroundColor:
                          selectedSize === size
                            ? resolvedAccentColor
                            : "transparent",
                        borderColor:
                          selectedSize === size
                            ? resolvedAccentColor
                            : "#e5e5e5",
                        color:
                          selectedSize === size ? "#ffffff" : resolvedTextColor,
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="flex gap-4">
              <div
                className="flex items-center border rounded-md"
                style={{ borderColor: resolvedBorderColor }}
              >
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-gray-100 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-gray-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <Button
                size="lg"
                className={cn("flex-1", classes?.addToCartButton)}
                onClick={handleAddToCart}
                style={{
                  backgroundColor: resolvedAccentColor,
                  color: "#ffffff",
                }}
              >
                {addToCartLabel}
              </Button>
              {showWishlist && (
                <Button
                  size="lg"
                  variant="outline"
                  className={cn("px-4", classes?.wishlistButton)}
                  style={{ borderColor: resolvedBorderColor }}
                >
                  <Heart className="w-5 h-5" />
                </Button>
              )}
            </div>

            {/* Shipping Info */}
            {showShippingInfo && (
              <div
                className={cn("space-y-3 pt-4 border-t", classes?.shippingInfo)}
                style={{ borderColor: resolvedBorderColor }}
              >
                <div className="flex items-center gap-3">
                  <Truck
                    className="w-5 h-5"
                    style={{ color: resolvedAccentColor }}
                  />
                  <span
                    className="text-sm"
                    style={{ color: `${resolvedTextColor}99` }}
                  >
                    {shippingLabels.freeShipping}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <RotateCcw
                    className="w-5 h-5"
                    style={{ color: resolvedAccentColor }}
                  />
                  <span
                    className="text-sm"
                    style={{ color: `${resolvedTextColor}99` }}
                  >
                    {shippingLabels.freeReturns}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield
                    className="w-5 h-5"
                    style={{ color: resolvedAccentColor }}
                  />
                  <span
                    className="text-sm"
                    style={{ color: `${resolvedTextColor}99` }}
                  >
                    {shippingLabels.securePayment}
                  </span>
                </div>
              </div>
            )}

            {/* SKU */}
            {product.sku && (
              <p
                className="text-sm"
                style={{ color: `${resolvedTextColor}66` }}
              >
                Réf: {product.sku}
              </p>
            )}
          </motion.div>
        </div>
      </SectionContainer>
    </SectionWrapper>
  );
}

Object.assign(ProductDetail, { schema: productDetailSchema });

export const schema = productDetailSchema;

export default ProductDetail;
