"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
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
import { useBoutiqueStore } from "@/components/boutique/BoutiqueStoreProvider";
import { useBoutiqueProductsQuery } from "@/hooks/useBoutiqueStorefront";
import {
  useBoutiqueClientLogoutMutation,
  useBoutiqueClientSessionQuery,
} from "@/hooks/useBoutiqueClient";
import { useCart } from "@/store";
import { getBoutiqueBasePath, getBoutiqueCartItems } from "@/lib/boutique";
import { cn } from "@/lib/utils";

const NAV_CATEGORIES = PRODUCT_ONTOLOGY.slice(0, 5);

export function BoutiqueNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const store = useBoutiqueStore();
  const { data: products = [] } = useBoutiqueProductsQuery();
  const { currencies, currency, setCurrency, formatPrice } = useStorefront();
  const { items } = useCart();
  const { data: session, isLoading: sessionLoading } = useBoutiqueClientSessionQuery(store.storeSlug);
  const logoutMutation = useBoutiqueClientLogoutMutation(store.storeSlug);

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const boutiqueItems = useMemo(
    () => getBoutiqueCartItems(items, { sellerId: store.id, storeSlug: store.storeSlug }),
    [items, store.id, store.storeSlug],
  );
  const cartCount = boutiqueItems.reduce((count, item) => count + item.quantity, 0);
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

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="border-b border-neutral-100 bg-[#f7f1e7]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-xs text-neutral-600 sm:px-6 lg:px-8 xl:px-12">
          <p className="truncate">
            Boutique dediee a {store.businessName}
          </p>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">
              {store.locationName || "Haiti"}
            </span>
            <select
              value={currency?.code}
              onChange={(event) => setCurrency(event.target.value)}
              className="bg-transparent text-xs outline-none"
            >
              {currencies.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.code}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex h-20 items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setIsMobileOpen((current) => !current)}
            className="rounded-xl p-2 text-neutral-700 lg:hidden"
          >
            {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

              <Link href={basePath} className="flex items-center gap-3">
            <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-neutral-900 text-white">
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
              <p className="text-xs uppercase tracking-[0.28em] text-neutral-400">
                Boutique
              </p>
              <p className="text-lg font-semibold text-neutral-900">
                {store.businessName}
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            <Link
              href={basePath}
              className={cn(
                "text-sm font-medium transition-colors",
                pathname === basePath
                  ? "text-neutral-900"
                  : "text-neutral-600 hover:text-neutral-900",
              )}
            >
              Accueil
            </Link>
            <Link
              href={`${basePath}/collection`}
              className={cn(
                "text-sm font-medium transition-colors",
                pathname.includes("/collection")
                  ? "text-neutral-900"
                  : "text-neutral-600 hover:text-neutral-900",
              )}
            >
              Collection
            </Link>
            <Link
              href={`${basePath}/a-propos`}
              className={cn(
                "text-sm font-medium transition-colors",
                pathname.includes("/a-propos")
                  ? "text-neutral-900"
                  : "text-neutral-600 hover:text-neutral-900",
              )}
            >
              A propos
            </Link>
            {NAV_CATEGORIES.map((category) => (
              <Link
                key={category.id}
                href={`${basePath}/collection/${category.id}`}
                className="text-sm text-neutral-600 transition-colors hover:text-neutral-900"
              >
                {category.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 lg:gap-4">
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
                    onFocus={() => setShowSearchDropdown(Boolean(searchValue.trim()))}
                    className="w-72 rounded-2xl border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-4 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                  />
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                </div>
              </form>

              {showSearchDropdown ? (
                <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl">
                  {searchResults.length > 0 ? (
                    <>
                      {searchResults.map((product) => (
                        <Link
                          key={product.id}
                          href={getSearchHref(searchValue || product.name)}
                          onClick={() => setShowSearchDropdown(false)}
                          className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-neutral-50"
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
                            <p className="truncate text-sm font-medium text-neutral-900">
                              {product.name}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {formatPrice(product.price)}
                            </p>
                          </div>
                        </Link>
                      ))}
                      <button
                        type="button"
                        onClick={() => router.push(getSearchHref(searchValue))}
                        className="block w-full border-t border-neutral-100 px-4 py-3 text-center text-sm font-medium text-neutral-900"
                      >
                        Voir tous les resultats
                      </button>
                    </>
                  ) : (
                    <div className="px-4 py-6 text-center text-sm text-neutral-500">
                      Aucun resultat dans cette boutique.
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <Link
              href={`${basePath}/collection`}
              className="rounded-xl p-2 text-neutral-700 transition-colors hover:bg-neutral-100 md:hidden"
            >
              <Search className="h-5 w-5" />
            </Link>

            <Link
              href="/wishlist"
              className="hidden rounded-xl p-2 text-neutral-700 transition-colors hover:bg-neutral-100 sm:inline-flex"
            >
              <Heart className="h-5 w-5" />
            </Link>

            {sessionLoading ? (
              <div className="hidden h-10 w-28 rounded-full bg-neutral-100 sm:inline-flex" />
            ) : session ? (
              <Link
                href={`${basePath}/profil`}
                className="hidden rounded-xl p-2 text-neutral-700 transition-colors hover:bg-neutral-100 sm:inline-flex"
              >
                <User className="h-5 w-5" />
              </Link>
            ) : (
              <div className="hidden items-center gap-3 sm:flex">
                <Link
                  href={`${basePath}/client`}
                  className="text-sm font-medium text-neutral-700 transition-colors hover:text-neutral-900"
                >
                  Connexion
                </Link>
                <Link
                  href={`${basePath}/client`}
                  className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                  Inscription
                </Link>
              </div>
            )}

            <Link
              href={`${basePath}/panier`}
              className="relative inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-900 transition hover:border-neutral-300 hover:bg-neutral-50"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden lg:inline">{formatPrice(cartTotal)}</span>
              {cartCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              ) : null}
            </Link>
          </div>
        </div>
      </div>

      {isMobileOpen ? (
        <div className="border-t border-neutral-100 bg-white lg:hidden">
          <div className="space-y-5 px-4 py-5">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder={`Rechercher dans ${store.businessName}`}
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 py-3 pl-10 pr-4 text-sm text-neutral-900 outline-none"
              />
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
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
              <div className="grid gap-3 border-t border-neutral-100 pt-4">
                <Link href={`${basePath}/profil`} onClick={() => setIsMobileOpen(false)}>
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
              <div className="grid gap-3 border-t border-neutral-100 pt-4">
                <Link href={`${basePath}/client`} onClick={() => setIsMobileOpen(false)}>
                  Connexion
                </Link>
                <Link href={`${basePath}/client`} onClick={() => setIsMobileOpen(false)}>
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
