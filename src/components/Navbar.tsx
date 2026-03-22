"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, Heart, User, Menu, X } from "lucide-react";
import { PRODUCT_ONTOLOGY } from "@/data/productOntology";
import { MARKETING_NAV_LINKS } from "@/data/marketing";
import { useStorefront } from "@/components/StorefrontProvider";
import { useStorefrontProductsQuery } from "@/hooks/useStorefront";
import { useCart, useUI, useUser } from "@/store";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const NAV_CATEGORIES = PRODUCT_ONTOLOGY.slice(0, 5);
const MARKETING_PAGES = ["/", "/prix", "/modeles", "/a-propos", "/devenir-vendeur"];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === "/";
  const { data: products = [] } = useStorefrontProductsQuery();
  const { currencies, currency, setCurrency, formatPrice } = useStorefront();
  const { getCartCount, getCartTotal } = useCart();
  const { toggleCart, toggleMobileMenu, isMobileMenuOpen } = useUI();
  const { isAuthenticated } = useUser();
  const { signOut } = useAuth();

  const [isScrolled, setIsScrolled] = useState(!isHomePage);
  const [searchValue, setSearchValue] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [mounted, setMounted] = useState(false);

  const searchResults = useMemo(() => {
    if (!searchValue.trim()) {
      return [];
    }

    const query = searchValue.toLowerCase();
    return products
      .filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          product.category.toLowerCase().includes(query),
      )
      .slice(0, 5);
  }, [products, searchValue]);

  const cartCount = getCartCount();
  const cartTotal = getCartTotal();
  const isMarketingPage = MARKETING_PAGES.includes(pathname);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isHomePage) {
      setIsScrolled(true);
      return;
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const query = searchValue.trim();

    if (!query) {
      return;
    }

    setShowSearchDropdown(false);
    router.push(`/collection?search=${encodeURIComponent(query)}`);
  };

  if (isMarketingPage) {
    return (
      <>
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className={cn(
            "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
            isScrolled
              ? "bg-neutral-950/92 backdrop-blur-md border-b border-white/10 shadow-xl shadow-black/20"
              : "bg-transparent",
          )}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
            <div className="flex items-center justify-between h-16 lg:h-20 gap-4">
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 -ml-2 text-white"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>

              <Link href="/" className="flex-shrink-0">
                <h1
                  className="text-2xl lg:text-3xl font-light tracking-[0.22em] text-white"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  LUXE
                </h1>
              </Link>

              <nav className="hidden lg:flex items-center gap-8">
                {MARKETING_NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm uppercase tracking-wider text-white/82 transition-opacity hover:opacity-70"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center gap-3">
                {isAuthenticated ? (
                  <Link
                    href="/profil"
                    className="hidden sm:flex p-2 text-white/88 transition-opacity hover:opacity-70"
                  >
                    <User className="w-5 h-5" />
                  </Link>
                ) : (
                  <Link
                    href="/auth/login?redirect=/vendeur"
                    className="hidden sm:inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs uppercase tracking-widest font-medium text-white transition hover:bg-white/10"
                  >
                    Connexion
                  </Link>
                )}

                <Link
                  href="/auth/signup?redirect=/vendeur"
                  className="hidden sm:inline-flex items-center rounded-full bg-white px-4 py-2 text-xs uppercase tracking-widest font-semibold text-neutral-950 transition hover:bg-amber-300"
                >
                  Creer ma boutique
                </Link>
              </div>
            </div>
          </div>
        </motion.header>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-16 inset-x-0 z-40 lg:hidden bg-neutral-950/98 border-b border-white/10 shadow-xl"
            >
              <div className="px-4 py-5 space-y-4">
                <div className="grid gap-3">
                  {MARKETING_NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={toggleMobileMenu}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/78"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                <div className="grid gap-3 border-t border-white/10 pt-4">
                  <Link
                    href="/auth/signup?redirect=/vendeur"
                    onClick={toggleMobileMenu}
                    className="rounded-2xl bg-white px-4 py-3 text-center text-sm font-semibold text-neutral-950"
                  >
                    Creer ma boutique
                  </Link>
                  <Link
                    href="/auth/login?redirect=/vendeur"
                    onClick={toggleMobileMenu}
                    className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-center text-sm font-medium text-white"
                  >
                    Connexion
                  </Link>
                  {isAuthenticated ? (
                    <Link
                      href="/profil"
                      onClick={toggleMobileMenu}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-medium text-white/80"
                    >
                      Mon profil
                    </Link>
                  ) : null}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm"
            : "bg-transparent",
        )}
      >
        <div
          className={cn(
            "hidden lg:block border-b transition-colors",
            isScrolled ? "border-neutral-200" : "border-white/20",
          )}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
            <div className="flex items-center justify-between py-2 text-xs">
              <p className={isScrolled ? "text-neutral-600" : "text-white/80"}>
                Livraison calculée selon vos règles en base
              </p>
              <div className="flex items-center gap-4">
                <select
                  value={currency?.code}
                  onChange={(event) => setCurrency(event.target.value)}
                  className={cn(
                    "bg-transparent text-xs outline-none",
                    isScrolled ? "text-neutral-700" : "text-white",
                  )}
                >
                  {currencies.map((item) => (
                    <option
                      key={item.code}
                      value={item.code}
                      className="text-neutral-900"
                    >
                      {item.code}
                    </option>
                  ))}
                </select>
                <Link
                  href="/contact"
                  className={cn(
                    "hover:opacity-70 transition-opacity",
                    isScrolled ? "text-neutral-600" : "text-white/80",
                  )}
                >
                  Service Client
                </Link>
                <Link
                  href="/vendeur"
                  className={cn(
                    "hover:opacity-70 transition-opacity",
                    isScrolled ? "text-neutral-600" : "text-white/80",
                  )}
                >
                  devenir vendeur
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex items-center justify-between h-16 lg:h-20 gap-4">
            <button
              onClick={toggleMobileMenu}
              className={cn(
                "lg:hidden p-2 -ml-2",
                isScrolled ? "text-neutral-900" : "text-white",
              )}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            <Link href="/" className="flex-shrink-0">
              <h1
                className={cn(
                  "text-2xl lg:text-3xl font-light tracking-[0.2em] transition-colors",
                  isScrolled ? "text-neutral-900" : "text-white",
                )}
              >
                LUXE
              </h1>
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              {NAV_CATEGORIES.map((category) => (
                <Link
                  key={category.id}
                  href={`/collection/${category.id}`}
                  className={cn(
                    "text-sm uppercase tracking-wider hover:opacity-70 transition-opacity",
                    isScrolled ? "text-neutral-900" : "text-white",
                  )}
                >
                  {category.name.split("&")[0]}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2 lg:gap-4">
              <div className="relative hidden md:block">
                <form onSubmit={handleSearchSubmit}>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      value={searchValue}
                      onChange={(event) => {
                        setSearchValue(event.target.value);
                        setShowSearchDropdown(
                          Boolean(event.target.value.trim()),
                        );
                      }}
                      onFocus={() =>
                        setShowSearchDropdown(Boolean(searchValue.trim()))
                      }
                      className={cn(
                        "w-48 lg:w-72 pl-10 pr-4 py-2 text-sm transition-all rounded-none border",
                        isScrolled
                          ? "bg-neutral-100 border-neutral-200 text-neutral-900 placeholder:text-neutral-500"
                          : "bg-white/10 border-white/30 text-white placeholder:text-white/70",
                      )}
                    />
                    <Search
                      className={cn(
                        "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4",
                        isScrolled ? "text-neutral-500" : "text-white/70",
                      )}
                    />
                  </div>
                </form>

                <AnimatePresence>
                  {showSearchDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white shadow-xl border border-neutral-200 max-h-96 overflow-y-auto"
                    >
                      {searchResults.length > 0 ? (
                        <div className="py-2">
                          <p className="px-4 py-2 text-xs text-neutral-500 uppercase tracking-wider">
                            {searchResults.length} résultat(s)
                          </p>
                          {searchResults.map((product) => (
                            <Link
                              key={product.id}
                              href={`/collection?search=${encodeURIComponent(product.name)}`}
                              onClick={() => setShowSearchDropdown(false)}
                              className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors"
                            >
                              <div className="relative w-12 h-12 bg-neutral-100">
                                <Image
                                  src={product.images[0]}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-neutral-900 truncate">
                                  {product.name}
                                </p>
                                <p className="text-sm text-neutral-500">
                                  {formatPrice(product.price)}
                                </p>
                              </div>
                            </Link>
                          ))}
                          <button
                            onClick={() =>
                              router.push(
                                `/collection?search=${encodeURIComponent(searchValue)}`,
                              )
                            }
                            className="block w-full px-4 py-3 text-center text-sm text-neutral-900 hover:bg-neutral-50 border-t border-neutral-100"
                          >
                            Voir tous les résultats
                          </button>
                        </div>
                      ) : (
                        <div className="px-4 py-8 text-center">
                          <p className="text-sm text-neutral-500">
                            Aucun résultat pour &quot;{searchValue}&quot;
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button
                onClick={() => setShowMobileSearch(true)}
                className={cn(
                  "lg:hidden p-2",
                  isScrolled ? "text-neutral-900" : "text-white",
                )}
              >
                <Search className="w-6 h-6" />
              </button>
              <Link
                href="/wishlist"
                className={cn(
                  "hidden sm:flex p-2 hover:opacity-70 transition-opacity",
                  isScrolled ? "text-neutral-900" : "text-white",
                )}
              >
                <Heart className="w-5 h-5" />
              </Link>

              {!isAuthenticated ? (
                <div className="hidden sm:flex items-center gap-6 ml-2">
                  <Link
                    href="/auth/login"
                    className={cn(
                      "text-xs uppercase tracking-widest font-medium hover:opacity-70 transition-opacity",
                      isScrolled ? "text-neutral-900" : "text-white",
                    )}
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/auth/signup"
                    className={cn(
                      "text-xs uppercase tracking-widest font-medium border px-4 py-2 hover:bg-neutral-900 hover:text-white transition-all",
                      isScrolled
                        ? "text-neutral-900 border-neutral-900"
                        : "text-white border-white/30 bg-white/10 backdrop-blur-sm",
                    )}
                  >
                    Inscription
                  </Link>
                </div>
              ) : (
                <Link
                  href="/profil"
                  className={cn(
                    "hidden sm:flex p-2 hover:opacity-70 transition-opacity",
                    isScrolled ? "text-neutral-900" : "text-white",
                  )}
                >
                  <User className="w-5 h-5" />
                </Link>
              )}

              <button
                onClick={toggleCart}
                className={cn(
                  "relative flex items-center gap-2 p-2 hover:opacity-70 transition-opacity",
                  isScrolled ? "text-neutral-900" : "text-white",
                )}
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="hidden lg:block text-sm">
                  {mounted ? formatPrice(cartTotal) : formatPrice(0)}
                </span>
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        <AnimatePresence>
          {showMobileSearch && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden absolute inset-x-0 top-0 bg-white shadow-xl z-[60] p-4"
            >
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-neutral-400" />
                <form
                  onSubmit={(e) => {
                    handleSearchSubmit(e);
                    setShowMobileSearch(false);
                  }}
                  className="flex-1"
                >
                  <input
                    type="text"
                    autoFocus
                    placeholder="Rechercher un produit..."
                    value={searchValue}
                    onChange={(event) => {
                      setSearchValue(event.target.value);
                      setShowSearchDropdown(Boolean(event.target.value.trim()));
                    }}
                    className="w-full bg-transparent outline-none text-base py-2"
                  />
                </form>
                <button
                  onClick={() => {
                    setShowMobileSearch(false);
                    setShowSearchDropdown(false);
                  }}
                  className="p-2 text-neutral-900"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile Search Dropdown in Overlay */}
              <AnimatePresence>
                {showSearchDropdown && (
                  <div className="mt-4 border-t border-neutral-100 max-h-[60vh] overflow-y-auto">
                    {searchResults.length > 0 ? (
                      <div className="py-2">
                        {searchResults.map((product) => (
                          <Link
                            key={product.id}
                            href={`/collection?search=${encodeURIComponent(product.name)}`}
                            onClick={() => {
                              setShowSearchDropdown(false);
                              setShowMobileSearch(false);
                            }}
                            className="flex items-center gap-3 py-3 hover:bg-neutral-50 transition-colors"
                          >
                            <div className="relative w-12 h-12 bg-neutral-100 flex-shrink-0">
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-neutral-900 truncate">
                                {product.name}
                              </p>
                              <p className="text-xs text-neutral-500">
                                {formatPrice(product.price)}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <p className="text-sm text-neutral-500">
                          Aucun résultat pour &quot;{searchValue}&quot;
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 inset-x-0 z-40 lg:hidden bg-white border-b border-neutral-200 shadow-lg"
          >
            <div className="px-4 py-4 space-y-4">
              <div className="grid gap-3">
                {PRODUCT_ONTOLOGY.map((category) => (
                  <Link
                    key={category.id}
                    href={`/collection/${category.id}`}
                    onClick={toggleMobileMenu}
                    className="text-sm text-neutral-700"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>

              <div className="flex border-t border-neutral-100 pt-4 gap-4">
                {!isAuthenticated ? (
                  <>
                    <Link
                      href="/auth/login"
                      onClick={toggleMobileMenu}
                      className="flex-1 text-center py-3 text-sm font-medium border border-neutral-200"
                    >
                      Connexion
                    </Link>
                    <Link
                      href="/auth/signup"
                      onClick={toggleMobileMenu}
                      className="flex-1 text-center py-3 text-sm font-medium bg-neutral-900 text-white"
                    >
                      Inscription
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/profil"
                      onClick={toggleMobileMenu}
                      className="flex-1 text-center py-3 text-sm font-medium border border-neutral-200"
                    >
                      Mon Profil
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        toggleMobileMenu();
                      }}
                      className="flex-1 text-center py-3 text-sm font-medium border border-neutral-200 text-red-600"
                    >
                      Déconnexion
                    </button>
                  </>
                )}
              </div>
              <Link
                href="/vendeur"
                className={cn(
                  "hover:opacity-70 transition-opacity",
                  isScrolled ? "text-neutral-600" : "text-white/80",
                )}
              >
                devenir vendeur
              </Link>
              <div className="flex items-center justify-between border-t border-neutral-100 pt-4 pb-2">
                <span className="text-sm text-neutral-500">Devise</span>
                <select
                  value={currency?.code}
                  onChange={(event) => setCurrency(event.target.value)}
                  className="text-sm border border-neutral-200 px-3 py-2 bg-transparent"
                >
                  {currencies.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.code}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
