"use client";

import Link from "next/link";
import {
  Activity,
  DollarSign,
  Package,
  ShoppingCart,
  Store,
  Users,
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { useAdminOverviewQuery } from "@/hooks/useAdminDirectory";
import { useCurrencyConverter } from "@/store/adminStore";

const statCards = [
  {
    key: "totalRevenue",
    label: "Revenu total",
    icon: DollarSign,
    accent: "bg-emerald-100 text-emerald-700",
  },
  {
    key: "totalOrders",
    label: "Commandes",
    icon: ShoppingCart,
    accent: "bg-blue-100 text-blue-700",
  },
  {
    key: "totalProducts",
    label: "Produits",
    icon: Package,
    accent: "bg-neutral-900 text-white",
  },
  {
    key: "totalSellers",
    label: "Vendeurs",
    icon: Store,
    accent: "bg-amber-100 text-amber-700",
  },
  {
    key: "totalUsers",
    label: "Utilisateurs",
    icon: Users,
    accent: "bg-violet-100 text-violet-700",
  },
  {
    key: "pendingOrders",
    label: "Commandes en attente",
    icon: Activity,
    accent: "bg-rose-100 text-rose-700",
  },
] as const;

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useAdminOverviewQuery();
  const { formatPrice } = useCurrencyConverter();

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Tableau de bord admin</h1>
            <p className="mt-2 text-sm text-neutral-500">
              Vision globale du marketplace, des vendeurs et des flux de commande.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/plans"
              className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:text-neutral-900"
            >
              Gerer les plans
            </Link>
            <Link
              href="/admin/plans/demandes"
              className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:text-neutral-900"
            >
              Approver les demandes
            </Link>
            <Link
              href="/admin/vendeurs"
              className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:text-neutral-900"
            >
              Revue vendeurs
            </Link>
            <Link
              href="/admin/utilisateurs"
              className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:text-neutral-900"
            >
              Annuaire utilisateurs
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {statCards.map((card) => {
            const Icon = card.icon;
            const value =
              card.key === "totalRevenue"
                ? formatPrice(stats?.[card.key] || 0, "HTG")
                : String(stats?.[card.key] || 0);

            return (
              <div key={card.key} className="rounded-2xl border border-neutral-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <div className={`rounded-xl p-3 ${card.accent}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                    temps reel
                  </span>
                </div>
                <p className="mt-4 text-sm text-neutral-500">{card.label}</p>
                <p className="mt-1 text-2xl font-semibold text-neutral-900">
                  {isLoading ? "..." : value}
                </p>
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr,0.8fr]">
          <section className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="font-semibold text-neutral-900">Priorites operationnelles</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-amber-50 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-amber-700">A traiter</p>
                <p className="mt-2 text-3xl font-semibold text-amber-900">
                  {stats?.pendingOrders || 0}
                </p>
                <p className="mt-2 text-sm text-amber-800">Commandes encore en attente.</p>
              </div>
              <div className="rounded-2xl bg-blue-50 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-blue-700">A verifier</p>
                <p className="mt-2 text-3xl font-semibold text-blue-900">
                  {stats?.pendingSellers || 0}
                </p>
                <p className="mt-2 text-sm text-blue-800">Vendeurs ou KYC en revue.</p>
              </div>
              <div className="rounded-2xl bg-violet-50 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-violet-700">Catalogue</p>
                <p className="mt-2 text-3xl font-semibold text-violet-900">
                  {stats?.pendingProducts || 0}
                </p>
                <p className="mt-2 text-sm text-violet-800">Produits en attente de validation.</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="font-semibold text-neutral-900">Aujourd&apos;hui</h2>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-neutral-50 p-4">
                <p className="text-sm text-neutral-500">Revenu du jour</p>
                <p className="mt-2 text-2xl font-semibold text-neutral-900">
                  {formatPrice(stats?.todayRevenue || 0, "HTG")}
                </p>
              </div>
              <div className="rounded-2xl bg-neutral-50 p-4">
                <p className="text-sm text-neutral-500">Commandes du jour</p>
                <p className="mt-2 text-2xl font-semibold text-neutral-900">
                  {stats?.todayOrders || 0}
                </p>
              </div>
              <div className="rounded-2xl bg-neutral-50 p-4">
                <p className="text-sm text-neutral-500">Nouveaux utilisateurs</p>
                <p className="mt-2 text-2xl font-semibold text-neutral-900">
                  {stats?.newUsersToday || 0}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}
