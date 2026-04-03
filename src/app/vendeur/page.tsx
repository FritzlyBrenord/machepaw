"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Clock3,
  DollarSign,
  Megaphone,
  Package,
  ShieldCheck,
  ShoppingCart,
  Zap,
} from "lucide-react";
import { SellerWorkspaceShell } from "@/components/SellerWorkspaceShell";
import { getPlanNumericLimit, getSellerActivePlan, isPlanFeatureEnabled } from "@/data/sellerPlans";
import { useCurrentAccountQuery } from "@/hooks/useAccount";
import {
  useSellerApplicationQuery,
  useSellerOrderItemsQuery,
  useSellerProductsQuery,
} from "@/hooks/useSellerWorkspace";
import { cn, formatDate, formatPrice } from "@/lib/utils";

const statusLabels: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmee",
  processing: "Preparation",
  shipped: "Expediee",
  delivered: "Livree",
  cancelled: "Annulee",
  refunded: "Remboursee",
};

const statusClasses: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-sky-100 text-sky-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-violet-100 text-violet-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-rose-100 text-rose-800",
  refunded: "bg-neutral-200 text-neutral-800",
};

export default function SellerDashboardPage() {
  const { data: account } = useCurrentAccountQuery();
  const { data: application } = useSellerApplicationQuery();
  const { data: products = [], isLoading: productsLoading } = useSellerProductsQuery();
  const { data: orderItems = [], isLoading: ordersLoading } = useSellerOrderItemsQuery();

  const totalRevenue = orderItems
    .filter((item) => item.itemStatus !== "cancelled")
    .reduce((sum, item) => sum + item.total, 0);
  const deliveredRevenue = orderItems
    .filter((item) => item.itemStatus === "delivered")
    .reduce((sum, item) => sum + item.total, 0);
  const pendingOrders = orderItems.filter((item) =>
    ["pending", "confirmed", "processing"].includes(item.itemStatus),
  ).length;
  const activeProducts = products.filter((product) => product.status === "active").length;
  const productsNeedingReview = products.filter((product) =>
    ["pending", "rejected", "out_of_stock"].includes(product.status),
  ).length;
  const topProducts = [...products]
    .sort((left, right) => (right.sales || 0) - (left.sales || 0))
    .slice(0, 5);
  const recentOrders = orderItems.slice(0, 5);
  const seller = account?.seller;
  const activePlan = getSellerActivePlan(seller);
  const canUseAnnouncements = Boolean(
    activePlan &&
      (getPlanNumericLimit(activePlan, "announcements") > 0 ||
        isPlanFeatureEnabled(activePlan, "announcements")),
  );
  const canUsePromotions = Boolean(
    activePlan &&
      (getPlanNumericLimit(activePlan, "promotions") > 0 ||
        isPlanFeatureEnabled(activePlan, "promotions")),
  );
  const canUseAnalytics = Boolean(activePlan && isPlanFeatureEnabled(activePlan, "analytics"));

  return (
    <SellerWorkspaceShell
      title="Tableau de bord vendeur"
      description="Suivez vos ventes, vos produits publies et les elements qui demandent une action."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-xs uppercase tracking-[0.2em] text-neutral-400">Total</span>
          </div>
          <p className="mt-4 text-sm text-neutral-500">Revenu vendeur</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-900">
            {formatPrice(totalRevenue, "HTG")}
          </p>
          <p className="mt-2 text-xs text-neutral-500">
            Dont {formatPrice(deliveredRevenue, "HTG")} deja livres.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <span className="text-xs uppercase tracking-[0.2em] text-neutral-400">Flux</span>
          </div>
          <p className="mt-4 text-sm text-neutral-500">Commandes a traiter</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-900">{pendingOrders}</p>
          <p className="mt-2 text-xs text-neutral-500">{orderItems.length} lignes commande visibles.</p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-neutral-900 p-3 text-white">
              <Package className="w-5 h-5" />
            </div>
            <span className="text-xs uppercase tracking-[0.2em] text-neutral-400">Catalogue</span>
          </div>
          <p className="mt-4 text-sm text-neutral-500">Produits actifs</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-900">{activeProducts}</p>
          <p className="mt-2 text-xs text-neutral-500">
            {productsNeedingReview} produit(s) demandent une action ou une revue.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-amber-100 p-3 text-amber-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-xs uppercase tracking-[0.2em] text-neutral-400">Confiance</span>
          </div>
          <p className="mt-4 text-sm text-neutral-500">Statut KYC</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-900">
            {seller?.kycStatus === "approved" ? "Valide" : "A verifier"}
          </p>
          <p className="mt-2 text-xs text-neutral-500">
            {application?.kycDocuments?.length || 0} document(s) soumis.
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr,1fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-neutral-200 bg-white">
            <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
              <div>
                <h2 className="font-semibold text-neutral-900">Commandes recentes</h2>
                <p className="text-sm text-neutral-500">
                  Vous ne voyez que les lignes commande de vos produits.
                </p>
              </div>
              <Link href="/vendeur/commandes" className="text-sm font-medium text-neutral-700 hover:text-neutral-900">
                Tout voir
              </Link>
            </div>

            <div className="divide-y divide-neutral-200">
              {ordersLoading ? (
                <p className="px-6 py-8 text-sm text-neutral-500">Chargement des commandes...</p>
              ) : recentOrders.length === 0 ? (
                <p className="px-6 py-8 text-sm text-neutral-500">
                  Aucune commande sur vos produits pour le moment.
                </p>
              ) : (
                recentOrders.map((item) => (
                  <div key={item.id} className="flex flex-col gap-3 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="font-medium text-neutral-900">{item.orderNumber}</p>
                      <p className="mt-1 text-sm text-neutral-500">{item.productName}</p>
                      <p className="mt-1 text-xs text-neutral-400">
                        {item.customerName} • {formatDate(item.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-3 py-1 text-xs font-medium",
                          statusClasses[item.itemStatus] || "bg-neutral-100 text-neutral-700",
                        )}
                      >
                        {statusLabels[item.itemStatus] || item.itemStatus}
                      </span>
                      <span className="font-semibold text-neutral-900">
                        {formatPrice(item.total, "HTG")}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white">
            <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
              <div>
                <h2 className="font-semibold text-neutral-900">Produits les plus performants</h2>
                <p className="text-sm text-neutral-500">Base sur les ventes reelles enregistrees.</p>
              </div>
              <Link href="/vendeur/statistiques" className="text-sm font-medium text-neutral-700 hover:text-neutral-900">
                Statistiques
              </Link>
            </div>

            <div className="divide-y divide-neutral-200">
              {productsLoading ? (
                <p className="px-6 py-8 text-sm text-neutral-500">Chargement du catalogue...</p>
              ) : topProducts.length === 0 ? (
                <p className="px-6 py-8 text-sm text-neutral-500">
                  Ajoutez votre premier produit pour commencer a mesurer vos performances.
                </p>
              ) : (
                topProducts.map((product) => (
                  <div key={product.id} className="flex flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium text-neutral-900">{product.name}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-neutral-400">
                        {product.status}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-6 text-sm">
                      <div>
                        <p className="text-neutral-500">Ventes</p>
                        <p className="font-semibold text-neutral-900">{product.sales || 0}</p>
                      </div>
                      <div>
                        <p className="text-neutral-500">Vues</p>
                        <p className="font-semibold text-neutral-900">{product.views || 0}</p>
                      </div>
                      <div>
                        <p className="text-neutral-500">Prix</p>
                        <p className="font-semibold text-neutral-900">
                          {formatPrice(Number(product.price || 0), "HTG")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="font-semibold text-neutral-900">Sante du compte vendeur</h2>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-neutral-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">Boutique</p>
                <p className="mt-2 font-semibold text-neutral-900">{seller?.businessName}</p>
                <p className="mt-1 text-sm text-neutral-500">
                  {seller?.isVerified ? "Vendeur verifie par l'administration." : "Verification admin en attente."}
                </p>
                <p className="mt-3 text-sm text-neutral-500">
                  Votre boutique publique reste accessible et vous pouvez ouvrir le builder depuis le menu vendeur pour modifier votre site.
                </p>
              </div>

              <div className="rounded-2xl bg-neutral-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">Plan actif</p>
                <p className="mt-2 font-semibold text-neutral-900">
                  {activePlan?.name || "Aucun plan"}
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  {seller?.requestedPlan
                    ? `Upgrade demande vers ${seller.requestedPlan.name}.`
                    : "Le plan actuel pilote vos limites et fonctionnalites."}
                </p>
                <Link
                  href="/vendeur/plan"
                  className="mt-3 inline-flex text-sm font-medium text-neutral-900 underline underline-offset-4"
                >
                  Gerer mon plan
                </Link>
              </div>

              <div className="rounded-2xl bg-neutral-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">KYC</p>
                <p className="mt-2 font-semibold text-neutral-900">{seller?.kycStatus}</p>
                <p className="mt-1 text-sm text-neutral-500">
                  Derniere revue: {seller?.kycReviewedAt ? formatDate(seller.kycReviewedAt) : "pas encore"}
                </p>
              </div>

              <div className="rounded-2xl bg-neutral-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">Commission</p>
                <p className="mt-2 font-semibold text-neutral-900">
                  {seller?.commissionRate || 0}%
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Taux applique sur les ventes de votre boutique.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="font-semibold text-neutral-900">Actions prioritaires</h2>
            <div className="mt-5 space-y-3">
              <Link
                href="/vendeur/produits"
                className="flex items-center justify-between rounded-2xl border border-neutral-200 px-4 py-3 transition-colors hover:border-neutral-300 hover:bg-neutral-50"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <div>
                    <p className="font-medium text-neutral-900">Reviser le catalogue</p>
                    <p className="text-sm text-neutral-500">
                      {productsNeedingReview} produit(s) a traiter.
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400" />
              </Link>

              <Link
                href="/vendeur/commandes"
                className="flex items-center justify-between rounded-2xl border border-neutral-200 px-4 py-3 transition-colors hover:border-neutral-300 hover:bg-neutral-50"
              >
                <div className="flex items-center gap-3">
                  <Clock3 className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="font-medium text-neutral-900">Traiter les commandes</p>
                    <p className="text-sm text-neutral-500">{pendingOrders} commande(s) actives.</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400" />
              </Link>

              {canUseAnnouncements ? (
                <Link
                  href="/vendeur/annonces"
                  className="flex items-center justify-between rounded-2xl border border-neutral-200 px-4 py-3 transition-colors hover:border-neutral-300 hover:bg-neutral-50"
                >
                  <div className="flex items-center gap-3">
                    <Megaphone className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="font-medium text-neutral-900">Publier une annonce</p>
                      <p className="text-sm text-neutral-500">
                        Creez vos messages top bar, popup ou hero avec quota controle.
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-400" />
                </Link>
              ) : null}

              {canUsePromotions ? (
                <Link
                  href="/vendeur/promotions"
                  className="flex items-center justify-between rounded-2xl border border-neutral-200 px-4 py-3 transition-colors hover:border-neutral-300 hover:bg-neutral-50"
                >
                  <div className="flex items-center gap-3">
                    <Zap className="w-4 h-4 text-amber-600" />
                    <div>
                      <p className="font-medium text-neutral-900">Lancer une vente flash</p>
                      <p className="text-sm text-neutral-500">
                        Mettez en avant vos produits actifs avec un compte a rebours.
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-400" />
                </Link>
              ) : null}

              {canUseAnalytics ? (
                <Link
                  href="/vendeur/statistiques"
                  className="flex items-center justify-between rounded-2xl border border-neutral-200 px-4 py-3 transition-colors hover:border-neutral-300 hover:bg-neutral-50"
                >
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-4 h-4 text-neutral-900" />
                    <div>
                      <p className="font-medium text-neutral-900">Analyser les performances</p>
                      <p className="text-sm text-neutral-500">Suivez ventes, vues et produits forts.</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-400" />
                </Link>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </SellerWorkspaceShell>
  );
}
