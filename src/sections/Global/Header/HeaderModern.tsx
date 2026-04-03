"use client";

import { headerModernSchema } from "./HeaderModern.schema";

// ============================================
// HEADER MODERN — 100% Configurable Architecture
// ============================================

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type FormEvent,
} from "react";
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  Heart,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "@/lib/router";
import { getBoutiqueCartItems } from "@/lib/boutique";
import { useEcommerceStore } from "@/store/ecommerce-store";
import { useCart } from "@/store";
import { useBoutiqueClientSessionQuery } from "@/hooks/useBoutiqueClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/hooks/useSectionStyles";
import type {
  HeaderModernProps,
  HeaderModernConfig,
  HeaderNavigationItem,
  HeaderLogo,
} from "@/types/section-config-types";

// ─────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────
function normalizeValue(value?: string) {
  return String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getStoreInitial(value?: string) {
  const trimmedValue = String(value || "").trim();
  return trimmedValue ? trimmedValue.charAt(0).toUpperCase() : "B";
}

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

type ScrollContainer = Window | HTMLElement;

function getScrollContainer(node: HTMLElement | null): ScrollContainer {
  let current = node?.parentElement ?? null;

  while (current) {
    const { overflowY, overflow } = window.getComputedStyle(current);
    const isScrollable =
      /(auto|scroll|overlay)/.test(`${overflowY} ${overflow}`) &&
      current.scrollHeight > current.clientHeight;

    if (isScrollable) {
      return current;
    }

    current = current.parentElement;
  }

  return window;
}

function getScrollTop(container: ScrollContainer): number {
  return container === window
    ? window.scrollY
    : (container as HTMLElement).scrollTop;
}

// ─────────────────────────────────────────
// LOGO COMPONENT
// ─────────────────────────────────────────
function Logo({
  logo,
  textColor,
  accentColor,
  onClick,
  classes,
}: {
  logo: HeaderLogo;
  textColor: string;
  accentColor: string;
  onClick: () => void;
  classes?: { logo?: string; logoText?: string; logoImage?: string };
}) {
  const {
    show = true,
    showText = true,
    showIcon = true,
    type = "text",
    text = "Boutique",
    image,
    letterSpacing = "0.02em",
    fontSize = "xl",
    fontWeight = "bold",
    fontStyle = "normal",
    textTransform = "uppercase",
    fontFamily = "inherit",
  } = logo;

  if (!show) return null;

  // Font size mapping
  const fontSizeClasses: Record<string, string> = {
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl md:text-2xl",
    "2xl": "text-2xl md:text-3xl",
  };

  // Font weight mapping
  const fontWeightClasses: Record<string, string> = {
    light: "font-light",
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
    extrabold: "font-extrabold",
  };

  // Font family mapping
  const fontFamilyStyles: Record<string, string> = {
    inherit: "inherit",
    serif: "Georgia, 'Times New Roman', serif",
    sans: "system-ui, -apple-system, sans-serif",
    display: "'Playfair Display', Georgia, serif",
    mono: "ui-monospace, SFMono-Regular, monospace",
    inter: "'Inter', system-ui, sans-serif",
    roboto: "'Roboto', system-ui, sans-serif",
    poppins: "'Poppins', system-ui, sans-serif",
    montserrat: "'Montserrat', system-ui, sans-serif",
    lato: "'Lato', system-ui, sans-serif",
    opensans: "'Open Sans', system-ui, sans-serif",
    raleway: "'Raleway', system-ui, sans-serif",
    nunito: "'Nunito', system-ui, sans-serif",
    playfair: "'Playfair Display', Georgia, serif",
    merriweather: "'Merriweather', Georgia, serif",
    crimsontext: "'Crimson Text', Georgia, serif",
    librebaskerville: "'Libre Baskerville', Georgia, serif",
    cormorant: "'Cormorant Garamond', Georgia, serif",
    bebasneue: "'Bebas Neue', sans-serif",
    oswald: "'Oswald', sans-serif",
    urbanist: "'Urbanist', system-ui, sans-serif",
    spacegrotesk: "'Space Grotesk', system-ui, sans-serif",
    sora: "'Sora', system-ui, sans-serif",
    jakarta: "'Plus Jakarta Sans', system-ui, sans-serif",
    manrope: "'Manrope', system-ui, sans-serif",
    outfit: "'Outfit', system-ui, sans-serif",
  };

  const textStyle: CSSProperties = {
    color: textColor,
    letterSpacing,
    fontFamily: fontFamilyStyles[fontFamily] || fontFamilyStyles.inherit,
    fontStyle,
    textTransform,
  };

  const renderIcon = () => {
    if (!showIcon) return null;

    if (type === "image" && image) {
      return (
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm sm:h-14 sm:w-14",
            classes?.logoImage,
          )}
        >
          <img src={image} alt={text} className="h-full w-full object-cover" />
        </div>
      );
    }

    if (type === "svg") {
      return <div className="h-10 w-10 sm:h-12 sm:w-12">{logo.svg}</div>;
    }

    // Default: initial/icon
    return (
      <div
        className="flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-sm sm:h-14 sm:w-14"
        style={{ backgroundColor: accentColor }}
      >
        {getStoreInitial(text)}
      </div>
    );
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex min-w-0 items-center gap-3 text-left transition-opacity hover:opacity-80",
        classes?.logo,
      )}
    >
      {renderIcon()}
      {showText && type !== "initial" && (
        <span
          className={cn(
            "hidden min-w-0 truncate tracking-tight sm:block",
            fontSizeClasses[fontSize] || fontSizeClasses.xl,
            fontWeightClasses[fontWeight] || fontWeightClasses.bold,
            classes?.logoText,
          )}
          style={textStyle}
        >
          {text}
        </span>
      )}
    </button>
  );
}

// ─────────────────────────────────────────
// NAVIGATION ITEM COMPONENT
// ─────────────────────────────────────────
function NavItem({
  item,
  textColor,
  accentColor,
  onClick,
  hasMegaMenu,
  classes,
  navConfig,
}: {
  item: HeaderNavigationItem;
  textColor: string;
  accentColor: string;
  onClick: () => void;
  hasMegaMenu?: boolean;
  classes?: { navLink?: string };
  navConfig?: HeaderModernConfig["navigation"];
}) {
  const [isHovered, setIsHovered] = useState(false);

  const {
    fontFamily = "inherit",
    fontWeight = "medium",
    fontStyle = "normal",
    textTransform = "none",
    fontSize = "sm",
    letterSpacing = "0.01em",
    hoverEffect = "opacity",
    hoverColor,
    hoverBgColor,
    hoverUnderlineHeight = 2,
    hoverUnderlineOffset = 4,
  } = navConfig || {};

  // Font size mapping
  const fontSizeClasses: Record<string, string> = {
    xs: "text-xs",
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
  };

  // Font weight mapping
  const fontWeightClasses: Record<string, string> = {
    light: "font-light",
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
  };

  // Font family mapping
  const fontFamilyStyles: Record<string, string> = {
    inherit: "inherit",
    serif: "Georgia, 'Times New Roman', serif",
    sans: "system-ui, -apple-system, sans-serif",
    inter: "'Inter', system-ui, sans-serif",
    roboto: "'Roboto', system-ui, sans-serif",
    poppins: "'Poppins', system-ui, sans-serif",
    montserrat: "'Montserrat', system-ui, sans-serif",
    lato: "'Lato', system-ui, sans-serif",
    opensans: "'Open Sans', system-ui, sans-serif",
    raleway: "'Raleway', system-ui, sans-serif",
    nunito: "'Nunito', system-ui, sans-serif",
    playfair: "'Playfair Display', Georgia, serif",
    merriweather: "'Merriweather', Georgia, serif",
    bebasneue: "'Bebas Neue', sans-serif",
    urbanist: "'Urbanist', system-ui, sans-serif",
    spacegrotesk: "'Space Grotesk', system-ui, sans-serif",
  };

  const baseStyles: CSSProperties = {
    color: textColor,
    fontFamily: fontFamilyStyles[fontFamily] || fontFamilyStyles.inherit,
    fontStyle,
    textTransform,
    letterSpacing,
  };

  // Hover effect classes
  const getHoverClasses = () => {
    switch (hoverEffect) {
      case "underline":
        return "relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-px hover:after:bg-current";
      case "underline-slide":
        return "relative after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-px after:bg-current after:transition-all after:duration-300";
      case "box":
        return "px-3 py-1.5 transition-colors";
      case "box-rounded":
        return "px-3 py-1.5 rounded-lg transition-colors";
      case "pill":
        return "px-4 py-1.5 rounded-full transition-colors";
      case "scale":
        return "transition-transform hover:scale-105";
      case "glow":
        return "transition-all hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]";
      case "highlight":
        return "px-2 py-1 transition-colors";
      case "none":
        return "";
      case "opacity":
      default:
        return "transition-opacity hover:opacity-70";
    }
  };

  const getHoverStyles = (): CSSProperties => {
    if (!isHovered) return {};

    switch (hoverEffect) {
      case "box":
      case "box-rounded":
      case "pill":
        return {
          backgroundColor: hoverBgColor || `${accentColor}20`,
          color: hoverColor || accentColor,
        };
      case "highlight":
        return {
          backgroundColor: hoverBgColor || `${accentColor}15`,
          color: hoverColor || textColor,
        };
      case "color":
        return { color: hoverColor || accentColor };
      default:
        return {};
    }
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={onClick}
        className={cn(
          "flex items-center gap-1",
          fontSizeClasses[fontSize] || fontSizeClasses.sm,
          fontWeightClasses[fontWeight] || fontWeightClasses.medium,
          getHoverClasses(),
          classes?.navLink,
        )}
        style={{ ...baseStyles, ...getHoverStyles() }}
      >
        {item.label}
        {hasMegaMenu && (
          <ChevronDown
            className={cn(
              "w-4 h-4 transition-transform duration-200",
              isHovered && "rotate-180",
            )}
          />
        )}
      </button>

      {/* Mega Menu Dropdown */}
      <AnimatePresence>
        {hasMegaMenu && isHovered && item.children && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-[600px] bg-white shadow-xl rounded-xl overflow-hidden z-50"
          >
            <div className="p-6 grid grid-cols-3 gap-6">
              {/* Navigation Columns */}
              {item.children.map((child, idx) => (
                <div key={idx}>
                  <h4 className="text-sm font-semibold mb-3 text-gray-900">
                    {child.label}
                  </h4>
                  {child.children && (
                    <ul className="space-y-2">
                      {child.children.map((subChild, subIdx) => (
                        <li key={subIdx}>
                          <button
                            onClick={() => onClick()}
                            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                          >
                            {subChild.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

              {/* Featured Section */}
              {item.featured && (
                <div className="col-span-1 border-l pl-6">
                  {item.featured.image && (
                    <img
                      src={item.featured.image}
                      alt={item.featured.title || ""}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  {item.featured.title && (
                    <h4 className="text-sm font-semibold text-gray-900">
                      {item.featured.title}
                    </h4>
                  )}
                  {item.featured.description && (
                    <p className="text-xs text-gray-500 mt-1">
                      {item.featured.description}
                    </p>
                  )}
                  {item.featured.cta && (
                    <button
                      onClick={() => onClick()}
                      className="text-xs font-medium mt-3 text-accent hover:underline"
                    >
                      {item.featured.cta.text}
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────
// INLINE SEARCH COMPONENT
// ─────────────────────────────────────────
function InlineSearch({
  textColor,
  accentColor,
  backgroundColor,
  config,
  isPreview,
  storefrontStore,
  onSubmit,
}: {
  textColor: string;
  accentColor: string;
  backgroundColor: string;
  config: {
    inlineWidth?: "sm" | "md" | "lg" | "xl";
    inlinePlaceholder?: string;
    inlineRounded?: "none" | "sm" | "md" | "lg" | "full";
  };
  isPreview: boolean;
  storefrontStore?: { products?: unknown[] };
  onSubmit: (query: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const widthClasses: Record<string, string> = {
    sm: "w-[200px]",
    md: "w-[280px]",
    lg: "w-[360px]",
    xl: "w-[440px]",
  };

  const roundedClasses: Record<string, string> = {
    none: "rounded-none",
    sm: "rounded",
    md: "rounded-lg",
    lg: "rounded-xl",
    full: "rounded-full",
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSubmit(query.trim());
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "relative flex items-center",
        widthClasses[config.inlineWidth || "md"],
      )}
    >
      <Search
        className="absolute left-3 h-4 w-4 pointer-events-none"
        style={{ color: `${textColor}60` }}
      />
      <Input
        type="text"
        placeholder={config.inlinePlaceholder || "Rechercher..."}
        className={cn(
          "h-9 pl-9 pr-4 text-sm w-full border",
          roundedClasses[config.inlineRounded || "md"],
        )}
        style={{
          borderColor: `${textColor}20`,
          backgroundColor: `${textColor}08`,
          color: textColor,
        }}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery("")}
          className="absolute right-2 p-1 rounded-full hover:bg-black/5"
        >
          <X className="h-3 w-3" style={{ color: `${textColor}60` }} />
        </button>
      )}
    </form>
  );
}

// ─────────────────────────────────────────
// ACTION BUTTON COMPONENT
// ─────────────────────────────────────────
function ActionButton({
  icon: Icon,
  onClick,
  textColor,
  badge,
  label,
  classes,
  iconSize = "md",
}: {
  icon: ComponentType<{
    className?: string;
    style?: CSSProperties;
  }>;
  onClick: () => void;
  textColor: string;
  badge?: number | null;
  label?: string;
  classes?: { actionButton?: string };
  iconSize?: "sm" | "md" | "lg" | "xl";
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sizeClasses: Record<string, string> = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
    xl: "h-7 w-7",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative rounded-xl p-2 transition-opacity hover:opacity-70",
        classes?.actionButton,
      )}
      aria-label={label}
    >
      <Icon className={sizeClasses[iconSize]} style={{ color: textColor }} />
      {isMounted && badge && badge > 0 ? (
        <span
          className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium"
          style={{ backgroundColor: "var(--color-accent, #c9a96e)" }}
        >
          {badge > 9 ? "9+" : badge}
        </span>
      ) : null}
    </button>
  );
}

// ─────────────────────────────────────────
// SEARCH OVERLAY COMPONENT
// ─────────────────────────────────────────
function SearchOverlay({
  isOpen,
  onClose,
  textColor,
  accentColor,
  backgroundColor,
  isPreview,
  storefrontStore,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  textColor: string;
  accentColor: string;
  backgroundColor: string;
  isPreview: boolean;
  storefrontStore?: {
    products?: unknown[];
  };
  onSubmit: (query: string) => void;
}) {
  const [query, setQuery] = useState("");

  const normalizedSearch = normalizeValue(query);
  const suggestions = useMemo(() => {
    if (!normalizedSearch) return [];

    const products = (storefrontStore?.products || []) as Array<
      Record<string, any>
    >;

    return products
      .filter((product) => product.name)
      .map((product) => ({
        id: String(product.id || ""),
        name: String(product.name || ""),
        image:
          (Array.isArray(product.images) ? product.images[0] : undefined) ||
          product.image ||
          "",
        category: String(product.subcategory || product.category || ""),
      }))
      .filter(
        (product) =>
          normalizeValue(product.name).includes(normalizedSearch) ||
          normalizeValue(product.category).includes(normalizedSearch),
      )
      .slice(0, 5);
  }, [normalizedSearch, storefrontStore?.products]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSubmit(query.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="absolute left-1/2 top-full z-[60] mt-3 w-[min(calc(100vw-1.5rem),28rem)] -translate-x-1/2 rounded-[1.75rem] border border-black/10 shadow-2xl md:left-auto md:right-0 md:w-[26rem] md:translate-x-0"
      style={{ backgroundColor }}
    >
      <form onSubmit={handleSubmit} className="flex items-center gap-3 p-4">
        <Input
          type="text"
          placeholder="Rechercher un produit..."
          className="h-12 flex-1 rounded-2xl text-base"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="button"
          onClick={onClose}
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl hover:bg-gray-100"
        >
          <X className="h-6 w-6" style={{ color: textColor }} />
        </button>
      </form>

      {suggestions.length > 0 ? (
        <div className="px-4 pb-4 space-y-2">
          {suggestions.map((product) => (
            <button
              key={product.id || product.name}
              type="button"
              onClick={() => onSubmit(product.name)}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left hover:bg-gray-50 transition-colors"
            >
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-14 w-14 rounded-xl object-cover"
                />
              ) : (
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-xl text-base font-semibold text-white"
                  style={{ backgroundColor: accentColor }}
                >
                  {getStoreInitial(product.name)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-medium text-gray-900">
                  {product.name}
                </p>
                {product.category ? (
                  <p className="truncate text-sm text-gray-500">
                    {product.category}
                  </p>
                ) : null}
              </div>
            </button>
          ))}
        </div>
      ) : normalizedSearch ? (
        <div className="px-4 pb-4">
          <button
            type="button"
            onClick={() => onSubmit(query)}
            className="block w-full rounded-2xl border border-dashed border-black/10 px-4 py-4 text-left text-base text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Rechercher &quot;{query.trim()}&quot; dans la boutique
          </button>
        </div>
      ) : null}
    </div>
  );
}

// ─────────────────────────────────────────
// MOBILE MENU COMPONENT
// ─────────────────────────────────────────
function MobileMenu({
  isOpen,
  navigation,
  textColor,
  accentColor,
  backgroundColor,
  isPreview,
  hasCustomer,
  wishlistCount,
  onNavigate,
  onClose,
  actions,
  ctaButton,
  classes,
}: {
  isOpen: boolean;
  navigation: HeaderNavigationItem[];
  textColor: string;
  accentColor: string;
  backgroundColor: string;
  isPreview: boolean;
  hasCustomer: boolean;
  wishlistCount: number;
  onNavigate: (href: string) => void;
  onClose: () => void;
  actions: string[];
  ctaButton?: { text: string; href: string; variant?: string };
  classes?: {
    mobileMenu?: string;
    navItem?: string;
  };
}) {
  if (!isOpen) return null;

  const activeNavItems = navigation.filter(
    (item) => item.enabled !== false && (item.href || item.link),
  );

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className={cn("mt-4 border-t pb-4 lg:hidden", classes?.mobileMenu)}
      style={{ borderColor: `${textColor}20` }}
    >
      <nav className="mt-4 flex flex-col space-y-4">
        {activeNavItems.map((item, index) => (
          <button
            key={item.id || index}
            onClick={() => {
              onNavigate(item.href || item.link || "/");
              onClose();
            }}
            className={cn(
              "py-2 text-left text-sm font-medium",
              classes?.navItem,
            )}
            style={{ color: textColor }}
          >
            {item.label}
          </button>
        ))}

        <div className="flex items-center gap-4 border-t pt-4">
          {actions.includes("wishlist") && (
            <button
              onClick={() => {
                onNavigate("/wishlist");
                onClose();
              }}
              className="flex items-center gap-2 text-sm font-medium"
              style={{ color: textColor }}
            >
              <Heart className="h-5 w-5" />
              Favoris ({wishlistCount})
            </button>
          )}
          {actions.includes("account") && (
            <button
              onClick={() => {
                onNavigate(hasCustomer ? "/compte" : "/connexion");
                onClose();
              }}
              className="flex items-center gap-2 text-sm font-medium"
              style={{ color: textColor }}
            >
              <User className="h-5 w-5" />
              {hasCustomer ? "Mon compte" : "Connexion"}
            </button>
          )}
        </div>

        {!hasCustomer && actions.includes("account") && (
          <Button
            type="button"
            onClick={() => {
              onNavigate("/inscription");
              onClose();
            }}
            className="w-full"
            style={{ backgroundColor: accentColor, color: "#ffffff" }}
          >
            Inscription
          </Button>
        )}

        {ctaButton && (
          <Button
            onClick={() => {
              onNavigate(ctaButton.href);
            }}
            className="w-full"
            style={{ backgroundColor: accentColor, color: "#ffffff" }}
          >
            {ctaButton.text}
          </Button>
        )}
      </nav>
    </motion.div>
  );
}

// ─────────────────────────────────────────
// MAIN HEADER MODERN COMPONENT
// ─────────────────────────────────────────
export function HeaderModern({
  id,
  testId,
  content = {},
  config = {},
  style = {},
  classes = {},
  isPreview = true,
  storefrontStore,
}: HeaderModernProps & {
  isPreview?: boolean;
  storefrontStore?: {
    storeSlug?: string;
    sellerId?: string;
    businessName?: string;
    products?: unknown[];
  };
}) {
  const navigate = useNavigate();
  const { wishlistItems } = useEcommerceStore();
  const { items: liveCartItems } = useCart();

  // ── EXTRACT CONTENT ──
  const {
    logo = { type: "text", text: "Boutique" },
    navigation = [],
    actions = ["search", "account", "cart"],
    ctaButton,
    cartBadge = { style: "number" },
  } = content;

  const normalizedNavigation = useMemo(
    () =>
      navigation.map((item, index) => {
        const href = item.href || item.link || "#";

        return {
          ...item,
          id: item.id || `nav-${index}`,
          label: item.label || "",
          href,
          link: href,
          enabled: item.enabled !== false,
        };
      }),
    [navigation],
  );

  const normalizedCtaButton = ctaButton
    ? ({
        ...ctaButton,
        href: ctaButton.href || ctaButton.link || "#",
      } as typeof ctaButton & { href: string; show?: boolean })
    : undefined;
  const shouldShowCtaButton = normalizedCtaButton?.show !== false;

  // ── EXTRACT CONFIG ──
  const {
    variant = "default",
    behavior = {},
    navigation: navConfig = {},
    search: searchConfig = { style: "icon" },
    iconSize = "md",
    animation = {},
  } = config;

  const {
    sticky = true,
    transparentAtTop = false,
    blurOnScroll = false,
    elevatedOnScroll = false,
    hideOnScroll = false,
  } = behavior;

  // ── EXTRACT STYLE ──
  const { colors: styleColors = {}, spacing: styleSpacing = {} } = style;

  const {
    background: backgroundColor = "white",
    backgroundScrolled,
    text: textColor = "primary",
    textScrolled,
    accent: accentColor = "accent",
    border: borderColor,
  } = styleColors;

  const { paddingY = "4", container = "contained" } = styleSpacing;

  // ── STATE ──
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const scrollThreshold = 24;
  const headerRef = useRef<HTMLElement | null>(null);
  // overlayOnHero vient de la config transparentAtTop du builder
  const overlayOnHero = transparentAtTop;

  // ── DATA HOOKS ──
  // Note: These would come from props in a real implementation
  const storeSlug = storefrontStore?.storeSlug || "";
  const sellerId = storefrontStore?.sellerId || "";
  const boutiqueSessionQuery = useBoutiqueClientSessionQuery(storeSlug);
  const boutiqueCustomer = boutiqueSessionQuery.data?.customer;

  // ── COMPUTED VALUES ──
  const cartCount = useMemo(() => {
    const scopedItems =
      storeSlug || sellerId
        ? getBoutiqueCartItems(liveCartItems, { storeSlug, sellerId })
        : liveCartItems;
    return scopedItems.reduce((count, item) => count + item.quantity, 0);
  }, [liveCartItems, sellerId, storeSlug]);

  const wishlistCount = wishlistItems.length;
  const activeNavItems = normalizedNavigation.filter(
    (item) => item.enabled !== false,
  );

  // ── SCROLL HANDLER ──
  useEffect(() => {
    const scrollContainer = getScrollContainer(headerRef.current);
    const initialScrollTop = getScrollTop(scrollContainer);
    const handleScroll = () => {
      setScrolled(
        getScrollTop(scrollContainer) - initialScrollTop > scrollThreshold,
      );
    };

    handleScroll();
    scrollContainer.addEventListener("scroll", handleScroll, {
      passive: true,
    });
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, [scrollThreshold]);

  useEffect(() => {
    const headerElement = headerRef.current;
    const overlayHost =
      (headerElement?.closest(
        '[data-header-overlay-root="true"]',
      ) as HTMLElement | null) ??
      headerElement?.parentElement?.parentElement ??
      headerElement?.parentElement;

    if (!overlayHost) {
      return;
    }

    if (!headerElement) {
      overlayHost.style.setProperty("--header-overlay-offset", "0px");
      return;
    }

    const updateHeaderHeight = () => {
      overlayHost.style.setProperty(
        "--header-overlay-offset",
        `${headerElement.offsetHeight}px`,
      );
    };

    updateHeaderHeight();

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      updateHeaderHeight();
    });

    resizeObserver.observe(headerElement);

    return () => {
      resizeObserver.disconnect();
      overlayHost.style.setProperty("--header-overlay-offset", "0px");
    };
  }, []);

  // ── HELPERS ──
  const handleNavigation = (href: string) => {
    if (!isPreview) return;

    if (href.startsWith("/")) {
      navigate(href);
    } else {
      window.location.href = href;
    }
    setMobileMenuOpen(false);
    setSearchOpen(false);
  };

  const handleSearch = (query: string) => {
    if (!isPreview) return;
    navigate("products", { search: query });
    setSearchOpen(false);
    setMobileMenuOpen(false);
  };

  // ── DYNAMIC STYLES ──
  const resolvedBgColor =
    scrolled && backgroundScrolled
      ? resolveColor(
          backgroundScrolled,
          resolveColor(backgroundColor, "#ffffff"),
        )
      : resolveColor(backgroundColor, "#ffffff");

  const resolvedTextColor =
    scrolled && textScrolled
      ? resolveColor(textScrolled, resolveColor(textColor, "#1a1a1a"))
      : resolveColor(textColor, "#1a1a1a");

  const resolvedAccentColor = resolveColor(accentColor, "#c9a96e");
  const isOverlayMode = overlayOnHero && !scrolled;

  // ── RENDER ──
  return (
    <header
      ref={headerRef}
      id={id}
      data-testid={testId}
      className={cn(
        "relative w-full z-50 transition-all duration-300",
        // Effects on scroll
        blurOnScroll && scrolled && "backdrop-blur-md bg-white/80",
        elevatedOnScroll && scrolled && "shadow-md",
        classes.root,
      )}
      style={{
        backgroundColor: isOverlayMode ? "transparent" : resolvedBgColor,
        color: resolvedTextColor,
        borderBottom: scrolled
          ? `1px solid ${resolveColor(borderColor, "rgba(0,0,0,0.05)")}`
          : undefined,
        paddingTop: `${parseInt(paddingY) * 0.25}rem`,
        paddingBottom: `${parseInt(paddingY) * 0.25}rem`,
      }}
    >
      <div
        className={cn(
          "mx-auto px-4 sm:px-6 lg:px-8",
          container === "contained" && "max-w-7xl",
          container === "full" && "max-w-none",
          classes.inner,
        )}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Logo */}
          <Logo
            logo={logo}
            textColor={resolvedTextColor}
            accentColor={resolvedAccentColor}
            onClick={() => handleNavigation("/")}
            classes={classes}
          />

          {/* Desktop Navigation */}
          <nav
            className={cn("hidden items-center space-x-8 lg:flex", classes.nav)}
          >
            {activeNavItems.map((item) => (
              <NavItem
                key={item.href}
                item={item}
                textColor={resolvedTextColor}
                accentColor={resolvedAccentColor}
                onClick={() => handleNavigation(item.href)}
                hasMegaMenu={item.megaMenu}
                classes={classes}
                navConfig={navConfig}
              />
            ))}
          </nav>

          {/* Actions */}
          <div
            className={cn("flex items-center gap-1 sm:gap-2", classes.actions)}
          >
            {/* Search - Inline */}
            {actions.includes("search") && searchConfig.style === "inline" && (
              <InlineSearch
                textColor={resolvedTextColor}
                accentColor={resolvedAccentColor}
                backgroundColor={resolveColor(backgroundColor, "#ffffff")}
                config={searchConfig}
                isPreview={isPreview}
                storefrontStore={storefrontStore}
                onSubmit={handleSearch}
              />
            )}

            {/* Search - Icon/Overlay */}
            {actions.includes("search") && searchConfig.style !== "inline" && (
              <div className="relative flex items-center">
                <SearchOverlay
                  isOpen={searchOpen}
                  onClose={() => setSearchOpen(false)}
                  textColor={resolvedTextColor}
                  accentColor={resolvedAccentColor}
                  backgroundColor={resolveColor(backgroundColor, "#ffffff")}
                  isPreview={isPreview}
                  storefrontStore={storefrontStore}
                  onSubmit={handleSearch}
                />
                <button
                  onClick={() => setSearchOpen((v) => !v)}
                  className="rounded-xl p-2 transition-opacity hover:opacity-70"
                  aria-label="Rechercher"
                >
                  <Search
                    className={cn(
                      "transition-all",
                      iconSize === "sm" && "h-4 w-4",
                      iconSize === "md" && "h-5 w-5",
                      iconSize === "lg" && "h-6 w-6",
                      iconSize === "xl" && "h-7 w-7",
                    )}
                    style={{ color: resolvedTextColor }}
                  />
                </button>
              </div>
            )}

            {/* Wishlist */}
            {actions.includes("wishlist") && (
              <div className="hidden sm:block">
                <ActionButton
                  icon={Heart}
                  onClick={() => handleNavigation("/wishlist")}
                  textColor={resolvedTextColor}
                  badge={wishlistCount}
                  label="Favoris"
                  classes={classes}
                  iconSize={iconSize}
                />
              </div>
            )}

            {/* Account */}
            {actions.includes("account") && (
              <div className="hidden sm:block">
                {boutiqueCustomer ? (
                  <ActionButton
                    icon={User}
                    onClick={() => handleNavigation("/compte")}
                    textColor={resolvedTextColor}
                    label="Mon compte"
                    classes={classes}
                    iconSize={iconSize}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleNavigation("/connexion")}
                      className="text-sm font-medium transition-opacity hover:opacity-70"
                      style={{ color: resolvedTextColor }}
                    >
                      Connexion
                    </button>
                    <Button
                      onClick={() => handleNavigation("/inscription")}
                      className="h-9 rounded-xl px-4"
                      style={{
                        backgroundColor: resolvedAccentColor,
                        color: "#ffffff",
                      }}
                    >
                      Inscription
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Cart */}
            {actions.includes("cart") && (
              <ActionButton
                icon={ShoppingBag}
                onClick={() => handleNavigation("/cart")}
                textColor={resolvedTextColor}
                badge={cartCount}
                label="Panier"
                classes={classes}
                iconSize={iconSize}
              />
            )}

            {/* CTA Button */}
            {shouldShowCtaButton && normalizedCtaButton && (
              <Button
                onClick={() => handleNavigation(normalizedCtaButton.href)}
                className="hidden lg:block"
                style={{
                  backgroundColor: resolvedAccentColor,
                  color: "#ffffff",
                }}
              >
                {normalizedCtaButton.text}
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl p-2 lg:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" style={{ color: resolvedTextColor }} />
              ) : (
                <Menu
                  className="h-6 w-6"
                  style={{ color: resolvedTextColor }}
                />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <MobileMenu
          isOpen={mobileMenuOpen}
          navigation={normalizedNavigation}
          textColor={resolvedTextColor}
          accentColor={resolvedAccentColor}
          backgroundColor={resolveColor(backgroundColor, "#ffffff")}
          isPreview={isPreview}
          hasCustomer={!!boutiqueCustomer}
          wishlistCount={wishlistCount}
          onNavigate={handleNavigation}
          onClose={() => setMobileMenuOpen(false)}
          actions={actions}
          ctaButton={shouldShowCtaButton ? normalizedCtaButton : undefined}
          classes={classes}
        />
      </div>
    </header>
  );
}

Object.assign(HeaderModern, { schema: headerModernSchema });

export const schema = headerModernSchema;

export default HeaderModern;
