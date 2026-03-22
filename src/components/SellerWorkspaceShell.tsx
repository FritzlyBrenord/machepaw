"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  LayoutDashboard,
  Megaphone,
  Package,
  Settings,
  ShoppingCart,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import {
  getPlanNumericLimit,
  getSellerActivePlan,
  isPlanFeatureEnabled,
  sellerNeedsPlanSelection,
} from "@/data/sellerPlans";
import { getSellerSetupStatus } from "@/data/sellerSetup";
import { useCurrentAccountQuery } from "@/hooks/useAccount";
import { useSellerPaymentMethodsQuery } from "@/hooks/useSellerPaymentMethods";
import { cn } from "@/lib/utils";

const sellerNavigation = [
  { href: "/vendeur", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/vendeur/plan", label: "Mon plan", icon: ShieldCheck },
  { href: "/vendeur/produits", label: "Produits", icon: Package },
  { href: "/vendeur/clients", label: "Clients", icon: Users },
  { href: "/vendeur/promotions", label: "Ventes flash", icon: Zap },
  { href: "/vendeur/annonces", label: "Annonces", icon: Megaphone },
  { href: "/vendeur/commandes", label: "Commandes", icon: ShoppingCart },
  { href: "/vendeur/statistiques", label: "Statistiques", icon: BarChart3 },
  { href: "/vendeur/parametres", label: "Parametres", icon: Settings },
];

type SellerWorkspaceShellProps = {
  title: string;
  description: string;
  actions?: ReactNode;
  sidebarFooter?: ReactNode;
  children: ReactNode;
};

export function SellerWorkspaceShell({
  title,
  description,
  actions,
  sidebarFooter,
  children,
}: SellerWorkspaceShellProps) {
  const pathname = usePathname();
  const { data: account } = useCurrentAccountQuery();
  const {
    data: sellerPaymentMethods = [],
    isLoading: sellerPaymentMethodsLoading,
  } = useSellerPaymentMethodsQuery(account?.seller?.id);
  const activePlan = getSellerActivePlan(account?.seller);
  const mustChoosePlan = sellerNeedsPlanSelection(account?.seller);
  const mustCompleteSetup =
    Boolean(account?.seller?.planSelectionCompleted) &&
    !sellerPaymentMethodsLoading &&
    !getSellerSetupStatus(account?.seller, sellerPaymentMethods).isComplete;
  const navigationItems = sellerNavigation.filter((item) => {
    if (mustChoosePlan) {
      return item.href === "/vendeur" || item.href === "/vendeur/plan";
    }

    if (mustCompleteSetup) {
      return item.href === "/vendeur/plan" || item.href === "/vendeur/parametres";
    }

    if (item.href === "/vendeur/promotions") {
      return Boolean(
        activePlan &&
          (getPlanNumericLimit(activePlan, "promotions") > 0 ||
            isPlanFeatureEnabled(activePlan, "promotions")),
      );
    }

    if (item.href === "/vendeur/annonces") {
      return Boolean(
        activePlan &&
          (getPlanNumericLimit(activePlan, "announcements") > 0 ||
            isPlanFeatureEnabled(activePlan, "announcements")),
      );
    }

    if (item.href === "/vendeur/statistiques") {
      return Boolean(activePlan && isPlanFeatureEnabled(activePlan, "analytics"));
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="grid lg:grid-cols-5 gap-8">
        <aside className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <nav className="hidden space-y-1 rounded-2xl border border-neutral-200 bg-white p-3 lg:block">
              {navigationItems.map((item) => {
                const isActive =
                  item.href === "/vendeur"
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-neutral-900 text-white"
                        : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <div className="flex items-center gap-2 font-medium">
                <ShieldCheck className="w-4 h-4" />
                Conformite vendeur
              </div>
              <p className="mt-2 leading-6 text-amber-800">
                Gardez vos informations KYC, vos coordonnees et vos regles de livraison a jour pour rester visible.
              </p>
            </div>

            {sidebarFooter}
          </div>
        </aside>

        <main className="lg:col-span-4 space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900">{title}</h1>
              <p className="mt-2 text-sm text-neutral-500">{description}</p>
            </div>
            {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
