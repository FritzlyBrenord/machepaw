"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, Heart, User, Menu, X } from "lucide-react";
import { PRODUCT_ONTOLOGY } from "@/data/productOntology";
import { MARKETING_NAV_LINKS } from "@/data/marketing";
import { useCommerce } from "@/components/CommerceProvider";
import { useCatalogProductsQuery } from "@/hooks/useCatalogProducts";
import { useCart, useUI, useUser } from "@/store";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const NAV_CATEGORIES = PRODUCT_ONTOLOGY.slice(0, 5);
const MARKETING_PAGES = [
  "/",
  "/prix",
  "/modeles",
  "/a-propos",
  "/devenir-vendeur",
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === "/";
  const { data: products = [] } = useCatalogProductsQuery();
  const { currencies, currency, setCurrency, formatPrice } = useCommerce();
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
}
