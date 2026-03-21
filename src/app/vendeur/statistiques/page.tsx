"use client";

import { useState } from "react";
import { Download, TrendingDown, TrendingUp } from "lucide-react";
import { SellerWorkspaceShell } from "@/components/SellerWorkspaceShell";
import { Button } from "@/components/ui/Button";
import { useSellerOrderItemsQuery, useSellerProductsQuery } from "@/hooks/useSellerWorkspace";
import { formatPrice } from "@/lib/utils";

type TimeRange = "7d" | "30d" | "90d";

export default function SellerStatisticsPage() {
  const [range, setRange] = useState<TimeRange>("30d");
  const [referenceNow] = useState(() => Date.now());
  const { data: orderItems = [], isLoading: ordersLoading } = useSellerOrderItemsQuery();
  const { data: products = [], isLoading: productsLoading } = useSellerProductsQuery();

  const rangeInDays = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const startDate = referenceNow - rangeInDays * 24 * 60 * 60 * 1000;

  const filteredItems = orderItems.filter(
    (item) => new Date(item.createdAt).getTime() >= startDate,
  );

  const revenue = filteredItems
    .filter((item) => item.itemStatus !== "cancelled")
    .reduce((sum, item) => sum + item.total, 0);
  const deliveredRevenue = filteredItems
    .filter((item) => item.itemStatus === "delivered")
    .reduce((sum, item) => sum + item.total, 0);
  const orderCount = filteredItems.length;
  const averageOrderValue = orderCount > 0 ? revenue / orderCount : 0;
  const activeProducts = products.filter((product) => product.status === "active").length;

  const dailySeries = Array.from({ length: Math.min(rangeInDays, 14) }, (_, index) => {
    const day = new Date(referenceNow);
    day.setDate(day.getDate() - (Math.min(rangeInDays, 14) - index - 1));
    const key = day.toISOString().slice(0, 10);
    const matchingItems = filteredItems.filter(
      (item) => item.createdAt.slice(0, 10) === key && item.itemStatus !== "cancelled",
    );

    return {
      key,
      label: day.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
      revenue: matchingItems.reduce((sum, item) => sum + item.total, 0),
    };
  });

  const maxSeriesValue = Math.max(...dailySeries.map((item) => item.revenue), 1);

  const revenueByProduct = new Map<
    string,
    { name: string; sales: number; revenue: number }
  >();

  filteredItems.forEach((item) => {
    const current = revenueByProduct.get(item.productId) || {
      name: item.productName,
      sales: 0,
      revenue: 0,
    };

    current.sales += item.quantity;
    current.revenue += item.total;
    revenueByProduct.set(item.productId, current);
  });

  const topProducts = Array.from(revenueByProduct.entries())
    .map(([productId, value]) => ({
      productId,
      ...value,
    }))
    .sort((left, right) => right.revenue - left.revenue)
    .slice(0, 8);

  return (
    <SellerWorkspaceShell
      title="Statistiques vendeur"
      description="Les chiffres ici proviennent des lignes commande reelles rattachees a votre `seller_id`."
      actions={
        <Button variant="outline" disabled>
          <Download className="w-4 h-4 mr-2" />
          Export bientot
        </Button>
      }
    >
      <div className="flex flex-wrap gap-2">
        {(["7d", "30d", "90d"] as const).map((option) => (
          <button
            key={option}
            onClick={() => setRange(option)}
            className={`rounded-full px-4 py-2 text-sm transition-colors ${
              range === option
                ? "bg-neutral-900 text-white"
                : "bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300"
            }`}
          >
            {option === "7d" ? "7 jours" : option === "30d" ? "30 jours" : "90 jours"}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <p className="text-sm text-neutral-500">Revenu periode</p>
          <p className="mt-2 text-2xl font-semibold text-neutral-900">
            {formatPrice(revenue, "HTG")}
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs text-emerald-700">
            <TrendingUp className="w-4 h-4" />
            {formatPrice(deliveredRevenue, "HTG")} deja livres
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <p className="text-sm text-neutral-500">Commandes visibles</p>
          <p className="mt-2 text-2xl font-semibold text-neutral-900">{orderCount}</p>
          <div className="mt-2 flex items-center gap-2 text-xs text-neutral-500">
            {filteredItems.filter((item) => item.itemStatus === "cancelled").length} annulee(s)
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <p className="text-sm text-neutral-500">Panier moyen vendeur</p>
          <p className="mt-2 text-2xl font-semibold text-neutral-900">
            {formatPrice(averageOrderValue, "HTG")}
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs text-neutral-500">
            Base sur les lignes commande de la periode
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <p className="text-sm text-neutral-500">Produits actifs</p>
          <p className="mt-2 text-2xl font-semibold text-neutral-900">{activeProducts}</p>
          <div className="mt-2 flex items-center gap-2 text-xs text-amber-700">
            <TrendingDown className="w-4 h-4" />
            {products.filter((product) => product.status === "pending").length} en revue
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-neutral-900">Evolution du chiffre d&apos;affaires</h2>
            <p className="mt-1 text-sm text-neutral-500">Serie recentre sur les ventes de votre boutique.</p>
          </div>
        </div>

        <div className="mt-8 flex h-72 items-end gap-3">
          {ordersLoading ? (
            <p className="text-sm text-neutral-500">Chargement des donnees...</p>
          ) : (
            dailySeries.map((item) => (
              <div key={item.key} className="flex flex-1 flex-col items-center gap-3">
                <div className="group relative flex h-60 w-full items-end">
                  <div
                    className="w-full rounded-t-2xl bg-neutral-900 transition-colors group-hover:bg-neutral-700"
                    style={{ height: `${Math.max((item.revenue / maxSeriesValue) * 100, item.revenue > 0 ? 8 : 2)}%` }}
                  />
                  <div className="absolute -top-10 left-1/2 hidden -translate-x-1/2 rounded-full bg-neutral-900 px-3 py-1 text-xs text-white group-hover:block">
                    {formatPrice(item.revenue, "HTG")}
                  </div>
                </div>
                <span className="text-xs text-neutral-500">{item.label}</span>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <div className="border-b border-neutral-200 px-6 py-4">
          <h2 className="font-semibold text-neutral-900">Top produits par revenu</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Calculs bases sur les ventes reelles de la periode selectionnee.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="bg-neutral-50 text-left text-xs uppercase tracking-[0.18em] text-neutral-400">
              <tr>
                <th className="px-6 py-4">Produit</th>
                <th className="px-6 py-4">Ventes</th>
                <th className="px-6 py-4">Revenu</th>
                <th className="px-6 py-4">Statut catalogue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {productsLoading || ordersLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-sm text-neutral-500">
                    Chargement des performances produits...
                  </td>
                </tr>
              ) : topProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-sm text-neutral-500">
                    Pas encore assez de ventes pour afficher un classement.
                  </td>
                </tr>
              ) : (
                topProducts.map((product) => {
                  const catalogEntry = products.find((item) => item.id === product.productId);

                  return (
                    <tr key={product.productId} className="hover:bg-neutral-50/80">
                      <td className="px-6 py-5 font-medium text-neutral-900">{product.name}</td>
                      <td className="px-6 py-5 text-sm text-neutral-600">{product.sales}</td>
                      <td className="px-6 py-5 font-medium text-neutral-900">
                        {formatPrice(product.revenue, "HTG")}
                      </td>
                      <td className="px-6 py-5 text-sm text-neutral-600">
                        {catalogEntry?.status || "Inconnu"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </SellerWorkspaceShell>
  );
}
