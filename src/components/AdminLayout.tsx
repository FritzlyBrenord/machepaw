"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Settings,
  ShoppingCart,
  Store,
  Users,
  X,
  Zap,
  Megaphone,
  Shield,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentAccountQuery } from "@/hooks/useAccount";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useDisplayCurrency, useSetDisplayCurrency } from "@/store/adminStore";

const sidebarItems = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/produits", label: "Produits", icon: Package },
  { href: "/admin/promotions", label: "Ventes Flash", icon: Zap },
  { href: "/admin/annonces", label: "Annonces", icon: Megaphone },
  { href: "/admin/vendeurs", label: "Vendeurs", icon: Store },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users },
  { href: "/admin/commandes", label: "Commandes", icon: ShoppingCart },
  { href: "/admin/conversations", label: "Conversations", icon: MessageSquare },
  { href: "/admin/parametres", label: "Parametres", icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { signOut } = useAuth();
  const { data: account, isLoading } = useCurrentAccountQuery();
  const displayCurrency = useDisplayCurrency();
  const setDisplayCurrency = useSetDisplayCurrency();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50">
        <div className="w-8 h-8 rounded-full border-4 border-neutral-200 border-t-neutral-900 animate-spin" />
      </div>
    );
  }

  console.log("Current account:", account);

  if (!account || account.role !== "admin" || account.isBlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 p-4 text-center">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-6">
          <Shield className="w-8 h-8" /> {account?.role}
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
          Accès restreint
        </h1>
        <p className="text-neutral-500 max-w-md mb-8">
          Cette interface est réservée aux administrateurs. Connectez-vous pour
          continuer.
        </p>
        <Link href={`/admin/login?redirect=${encodeURIComponent(pathname)}`}>
          <Button size="lg">Se connecter en tant qu'admin</Button>
        </Link>
      </div>
    );
  }

  const renderNavigation = (mobile = false) => (
    <nav className="space-y-1">
      {sidebarItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => {
              if (mobile) {
                setMobileOpen(false);
              }
            }}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
              isActive
                ? "bg-white text-neutral-900"
                : "text-neutral-400 hover:bg-neutral-800 hover:text-white",
            )}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {sidebarOpen || mobile ? item.label : null}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden bg-neutral-900 transition-all duration-300 lg:block",
          sidebarOpen ? "w-72" : "w-24",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-neutral-800 px-5">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-bold text-neutral-900">
              A
            </div>
            {sidebarOpen ? (
              <span className="font-medium text-white">Admin LUXE</span>
            ) : null}
          </Link>
          <button
            onClick={() => setSidebarOpen((current) => !current)}
            className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4">{renderNavigation()}</div>

        <div className="absolute inset-x-0 bottom-0 border-t border-neutral-800 p-4">
          <button
            onClick={() => void signOut()}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen ? "Deconnexion" : null}
          </button>
        </div>
      </aside>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        ) : null}
      </AnimatePresence>

      <motion.aside
        initial={{ x: "-100%" }}
        animate={{ x: mobileOpen ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 220, damping: 28 }}
        className="fixed inset-y-0 left-0 z-50 w-72 bg-neutral-900 lg:hidden"
      >
        <div className="flex h-16 items-center justify-between border-b border-neutral-800 px-5">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-bold text-neutral-900">
              A
            </div>
            <span className="font-medium text-white">Admin LUXE</span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4">{renderNavigation(true)}</div>
      </motion.aside>

      <div
        className={cn(
          "min-h-screen transition-all duration-300",
          sidebarOpen ? "lg:ml-72" : "lg:ml-24",
        )}
      >
        <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="rounded-full p-2 text-neutral-600 transition-colors hover:bg-neutral-100 lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <p className="text-sm font-medium text-neutral-900">
                  Administration
                </p>
                <p className="text-xs text-neutral-500">
                  Pilotage securise du marketplace
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Currency Selector */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-full border border-neutral-200">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Devise</span>
                <select 
                  value={displayCurrency}
                  onChange={(e) => setDisplayCurrency(e.target.value as any)}
                  className="bg-transparent text-sm font-bold text-neutral-900 border-none focus:outline-none focus:ring-0 p-0 cursor-pointer"
                >
                  <option value="HTG">HTG (G)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="DOP">DOP (RD$)</option>
                </select>
              </div>

              <button className="relative rounded-full p-2 text-neutral-600 transition-colors hover:bg-neutral-100">
                <Bell className="w-5 h-5" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
              </button>

              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-neutral-900">
                  {account.firstName} {account.lastName}
                </p>
                <p className="text-xs text-neutral-500">Administrateur</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-sm font-medium text-white">
                {account.firstName?.[0]}
                {account.lastName?.[0]}
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
