"use client";

import Link from "next/link";
import { useState } from "react";
import { Bell, LogOut, Menu, ShieldCheck, Store, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentAccountQuery } from "@/hooks/useAccount";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/vendeur", label: "Tableau de bord" },
  { href: "/vendeur/produits", label: "Produits" },
  { href: "/vendeur/clients", label: "Clients" },
  { href: "/vendeur/promotions", label: "Ventes flash" },
  { href: "/vendeur/annonces", label: "Annonces" },
  { href: "/vendeur/commandes", label: "Commandes" },
  { href: "/vendeur/statistiques", label: "Statistiques" },
  { href: "/vendeur/parametres", label: "Parametres" },
];

const kycLabels: Record<string, string> = {
  not_submitted: "KYC a completer",
  pending: "KYC en revue",
  approved: "KYC valide",
  rejected: "KYC refuse",
  needs_more_info: "KYC incomplet",
};

export function SellerHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { signOut } = useAuth();
  const { data: account } = useCurrentAccountQuery();

  const businessName = account?.seller?.businessName || "Espace vendeur";
  const kycStatus = account?.seller?.kycStatus || "not_submitted";

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-light tracking-[0.25em] text-neutral-900">
              LUXE
            </Link>
            <span className="hidden sm:block text-neutral-300">|</span>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-neutral-900">{businessName}</p>
              <div className="flex items-center gap-1 text-xs text-neutral-500">
                <ShieldCheck className="w-3.5 h-3.5" />
                {kycLabels[kycStatus] || "KYC en cours"}
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-neutral-600 transition-colors hover:text-neutral-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/vendeur/parametres"
              className="hidden sm:inline-flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-2 text-sm text-neutral-600 transition-colors hover:border-neutral-300 hover:text-neutral-900"
            >
              <Store className="w-4 h-4" />
              Profil
            </Link>

            <button className="relative rounded-full p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900">
              <Bell className="w-5 h-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-500" />
            </button>

            <button
              onClick={() => void signOut()}
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-neutral-900 px-3 py-2 text-sm text-white transition-colors hover:bg-neutral-800"
            >
              <LogOut className="w-4 h-4" />
              Deconnexion
            </button>

            <button
              onClick={() => setIsMobileMenuOpen((current) => !current)}
              className="rounded-full p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 md:hidden"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "border-t border-neutral-200 bg-white md:hidden",
          isMobileMenuOpen ? "block" : "hidden",
        )}
      >
        <div className="px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block rounded-xl px-3 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
            >
              {item.label}
            </Link>
          ))}
          <button
            onClick={() => void signOut()}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            Deconnexion
          </button>
        </div>
      </div>
    </header>
  );
}
