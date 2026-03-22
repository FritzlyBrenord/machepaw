"use client";

import { useMemo, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  Store,
  User,
  X,
} from "lucide-react";
import { PRODUCT_ONTOLOGY } from "@/data/productOntology";
import { useStorefront } from "@/components/StorefrontProvider";
import {
  useBoutiqueStore,
  useBoutiqueTheme,
} from "@/components/boutique/BoutiqueStoreProvider";
import { useBoutiqueProductsQuery } from "@/hooks/useBoutiqueStorefront";
import {
  useBoutiqueClientLogoutMutation,
  useBoutiqueClientSessionQuery,
} from "@/hooks/useBoutiqueClient";
import { useCart } from "@/store";
import { getBoutiqueCartItems, getBoutiqueBasePath } from "@/lib/boutique";
import {
  getBoutiqueHeadingClass,
  getBoutiqueOutlineButtonStyle,
  getBoutiquePrimaryButtonStyle,
} from "@/lib/boutiqueTheme";
import { cn } from "@/lib/utils";

const NAV_CATEGORIES = PRODUCT_ONTOLOGY.slice(0, 5);

export function BoutiqueNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const store = useBoutiqueStore();
  const theme = useBoutiqueTheme();
  const headingClass = getBoutiqueHeadingClass(theme);
  const { data: products = [] } = useBoutiqueProductsQuery();
  const { currencies, currency, setCurrency, formatPrice } = useStorefront();
  const { items } = useCart();
  const { data: session, isLoading: sessionLoading } =
    useBoutiqueClientSessionQuery(store.storeSlug);
  const logoutMutation = useBoutiqueClientLogoutMutation(store.storeSlug);

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const boutiqueItems = useMemo(
    () =>
      getBoutiqueCartItems(items, {
        sellerId: store.id,
        storeSlug: store.storeSlug,
      }),
    [items, store.id, store.storeSlug],
  );
  const cartCount = boutiqueItems.reduce(
    (count, item) => count + item.quantity,
    0,
  );
  const cartTotal = boutiqueItems.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0,
  );

  const searchResults = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    if (!query) {
      return [];
    }

    return products
      .filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          product.category.toLowerCase().includes(query),
      )
      .slice(0, 6);
  }, [products, searchValue]);

  const basePath = getBoutiqueBasePath(store.storeSlug);
  const getSearchHref = (query: string) =>
    `${basePath}/collection?search=${encodeURIComponent(query.trim())}`;

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchValue.trim();

    if (!query) {
      return;
    }

    setShowSearchDropdown(false);
    router.push(getSearchHref(query));
  };

  const isCentered = theme.layout.navStyle === "centered";
  const isFloating = theme.layout.navStyle === "floating";
  const logoFrameClass = isFloating
    ? "rounded-[1.35rem]"
    : isCentered
      ? "rounded-full"
      : "rounded-2xl";

  const headerStyle: CSSProperties = {
    backgroundColor:
      theme.slug === "noir"
        ? "rgba(10, 12, 15, 0.88)"
        : "rgba(255,255,255,0.74)",
    borderBottomColor: isFloating ? "transparent" : theme.palette.border,
  };

  const shellStyle: CSSProperties = isFloating
    ? {
        backgroundColor: `${theme.palette.surface}F1`,
        borderColor: theme.palette.border,
        boxShadow: "0 18px 48px rgba(15, 15, 15, 0.08)",
      }
    : {
        backgroundColor:
          theme.slug === "noir" ? `${theme.palette.surface}F5` : "transparent",
        borderColor: theme.palette.border,
      };

  const searchStyle: CSSProperties = {
    backgroundColor: theme.palette.surfaceAlt,
    borderColor: theme.palette.border,
    color: theme.palette.text,
  };

  const navLinkClass = (isActive: boolean) =>
    cn(
      "text-sm transition-colors",
      isActive ? "font-semibold" : "font-medium",
    );

  return (
    <header
      className={cn(
        "sticky top-0 z-50 backdrop-blur-xl",
        isFloating ? "border-b-0" : "border-b",
      )}
      style={headerStyle}
    >
      <div className={cn("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-12")}>
        <div
          className={cn(
            "transition-all",
            isFloating ? "my-3 rounded-[2rem] border px-4" : "px-0",
          )}
          style={shellStyle}
        >
          <div
            className={cn(
              "flex items-center gap-4",
              isCentered
                ? "min-h-[5.5rem] lg:grid lg:grid-cols-[auto,1fr,auto]"
                : "h-20 justify-between",
            )}
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileOpen((current) => !current)}
                className="rounded-xl p-2 lg:hidden"
                style={{ color: theme.palette.text }}
              >
                {isMobileOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>

              <Link href={basePath} className="flex items-center gap-3">
                <div
                  className={cn(
                    "relative flex h-12 w-12 items-center justify-center overflow-hidden text-white",
                    logoFrameClass,
                  )}
                  style={{ backgroundColor: theme.palette.buttonPrimary }}
                >
                  {store.logo ? (
                    <Image
                      src={store.logo}
                      alt={store.businessName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <Store className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <p
                    className="text-[11px] uppercase tracking-[0.28em]"
                    style={{ color: theme.palette.muted }}
                  >
                    {theme.hero.badge}
                  </p>
                  <p
                    className={cn("text-lg", headingClass)}
                    style={{ color: theme.palette.text }}
                  >
                    {store.businessName}
                  </p>
                </div>
              </Link>
            </div>

            <div className="hidden lg:block">
              <nav
                className={cn(
                  "flex items-center",
                  isCentered
                    ? "justify-center gap-8"
                    : isFloating
                      ? "justify-center gap-6"
                      : "gap-6",
                )}
              >
                <Link
                  href={basePath}
                  className={navLinkClass(pathname === basePath)}
                  style={{ color: pathname === basePath ? theme.palette.text : theme.palette.muted }}
                >
                  Accueil
                </Link>
                <Link
                  href={`${basePath}/collection`}
                  className={navLinkClass(pathname.includes("/collection"))}
                  style={{
                    color: pathname.includes("/collection")
                      ? theme.palette.text
                      : theme.palette.muted,
                  }}
                >
                  Collection
                </Link>
                <Link
                  href={`${basePath}/a-propos`}
                  className={navLinkClass(pathname.includes("/a-propos"))}
                  style={{
                    color: pathname.includes("/a-propos")
                      ? theme.palette.text
                      : theme.palette.muted,
                  }}
                >
                  A propos
                </Link>
                {NAV_CATEGORIES.slice(0, isCentered ? 3 : 4).map((category) => (
                  <Link
                    key={category.id}
                    href={`${basePath}/collection/${category.id}`}
                    className="text-sm font-medium transition-colors"
                    style={{ color: theme.palette.muted }}
                  >
                    {category.name}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="ml-auto flex items-center gap-2 lg:gap-3">
              <div className="relative hidden md:block">
                <form onSubmit={handleSearchSubmit}>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={`Rechercher dans ${store.businessName}`}
                      value={searchValue}
                      onChange={(event) => {
                        setSearchValue(event.target.value);
                        setShowSearchDropdown(Boolean(event.target.value.trim()));
                      }}
                      onFocus={() =>
                        setShowSearchDropdown(Boolean(searchValue.trim()))
                      }
                      className={cn(
                        "rounded-full border py-2.5 pl-10 pr-4 text-sm outline-none transition",
                        isCentered ? "w-64 xl:w-72" : "w-72",
                      )}
                      style={searchStyle}
                    />
                    <Search
                      className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                      style={{ color: theme.palette.muted }}
                    />
                  </div>
                </form>

                {showSearchDropdown ? (
                  <div
                    className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-[1.5rem] border shadow-xl"
                    style={getBoutiqueOutlineButtonStyle(theme)}
                  >
                    {searchResults.length > 0 ? (
                      <>
                        {searchResults.map((product) => (
                          <Link
                            key={product.id}
                            href={getSearchHref(searchValue || product.name)}
                            onClick={() => setShowSearchDropdown(false)}
                            className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-black/5"
                          >
                            <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-neutral-100">
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p
                                className="truncate text-sm font-medium"
                                style={{ color: theme.palette.text }}
                              >
                                {product.name}
                              </p>
                              <p
                                className="text-xs"
                                style={{ color: theme.palette.muted }}
                              >
                                {formatPrice(product.price)}
                              </p>
                            </div>
                          </Link>
                        ))}
                        <button
                          type="button"
                          onClick={() => router.push(getSearchHref(searchValue))}
                          className="block w-full border-t px-4 py-3 text-center text-sm font-medium"
                          style={{
                            borderColor: theme.palette.border,
                            color: theme.palette.text,
                          }}
                        >
                          Voir tous les resultats
                        </button>
                      </>
                    ) : (
                      <div
                        className="px-4 py-6 text-center text-sm"
                        style={{ color: theme.palette.muted }}
                      >
                        Aucun resultat dans cette boutique.
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              <Link
                href={`${basePath}/collection`}
                className="rounded-full p-2 transition-colors hover:bg-black/5 md:hidden"
                style={{ color: theme.palette.text }}
              >
                <Search className="h-5 w-5" />
              </Link>

              <Link
                href="/wishlist"
                className="hidden rounded-full p-2 transition-colors hover:bg-black/5 sm:inline-flex"
                style={{ color: theme.palette.text }}
              >
                <Heart className="h-5 w-5" />
              </Link>

              <select
                value={currency?.code}
                onChange={(event) => setCurrency(event.target.value)}
                className="hidden bg-transparent text-xs outline-none sm:block"
                style={{ color: theme.palette.muted }}
              >
                {currencies.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.code}
                  </option>
                ))}
              </select>

              {sessionLoading ? (
                <div
                  className="hidden h-10 w-28 rounded-full sm:inline-flex"
                  style={{ backgroundColor: theme.palette.surfaceAlt }}
                />
              ) : session ? (
                <Link
                  href={`${basePath}/profil`}
                  className="hidden rounded-full p-2 transition-colors hover:bg-black/5 sm:inline-flex"
                  style={{ color: theme.palette.text }}
                >
                  <User className="h-5 w-5" />
                </Link>
              ) : (
                <div className="hidden items-center gap-3 sm:flex">
                  <Link
                    href={`${basePath}/client`}
                    className="text-sm font-medium transition-colors"
                    style={{ color: theme.palette.text }}
                  >
                    Connexion
                  </Link>
                  <Link
                    href={`${basePath}/client`}
                    className="rounded-full border px-4 py-2 text-sm font-medium transition"
                    style={getBoutiquePrimaryButtonStyle(theme)}
                  >
                    Inscription
                  </Link>
                </div>
              )}

              <Link
                href={`${basePath}/panier`}
                className="relative inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition hover:opacity-90"
                style={getBoutiqueOutlineButtonStyle(theme)}
              >
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden lg:inline">{formatPrice(cartTotal)}</span>
                {cartCount > 0 ? (
                  <span
                    className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-medium"
                    style={{
                      backgroundColor: theme.palette.accent,
                      color: theme.palette.accentContrast,
                    }}
                  >
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                ) : null}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {isMobileOpen ? (
        <div
          className="border-t lg:hidden"
          style={{
            borderColor: theme.palette.border,
            backgroundColor: theme.palette.surface,
          }}
        >
          <div className="space-y-5 px-4 py-5">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder={`Rechercher dans ${store.businessName}`}
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                className="w-full rounded-2xl border py-3 pl-10 pr-4 text-sm outline-none"
                style={searchStyle}
              />
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                style={{ color: theme.palette.muted }}
              />
            </form>

            <div className="grid gap-3">
              <Link href={basePath} onClick={() => setIsMobileOpen(false)}>
                Accueil
              </Link>
              <Link
                href={`${basePath}/collection`}
                onClick={() => setIsMobileOpen(false)}
              >
                Collection
              </Link>
              <Link
                href={`${basePath}/a-propos`}
                onClick={() => setIsMobileOpen(false)}
              >
                A propos
              </Link>
              {NAV_CATEGORIES.map((category) => (
                <Link
                  key={category.id}
                  href={`${basePath}/collection/${category.id}`}
                  onClick={() => setIsMobileOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
            </div>

            {session ? (
              <div
                className="grid gap-3 border-t pt-4"
                style={{ borderColor: theme.palette.border }}
              >
                <Link
                  href={`${basePath}/profil`}
                  onClick={() => setIsMobileOpen(false)}
                >
                  Mon espace client
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    void logoutMutation.mutateAsync().then(() => {
                      setIsMobileOpen(false);
                      router.replace(`${basePath}/client`);
                    });
                  }}
                  className="text-left text-red-600"
                >
                  Deconnexion
                </button>
              </div>
            ) : (
              <div
                className="grid gap-3 border-t pt-4"
                style={{ borderColor: theme.palette.border }}
              >
                <Link
                  href={`${basePath}/client`}
                  onClick={() => setIsMobileOpen(false)}
                >
                  Connexion
                </Link>
                <Link
                  href={`${basePath}/client`}
                  onClick={() => setIsMobileOpen(false)}
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
