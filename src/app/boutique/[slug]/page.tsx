"use client";

import { useMemo } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CreditCard,
  Flame,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  Zap,
} from "lucide-react";
import { PRODUCT_ONTOLOGY } from "@/data/productOntology";
import { BoutiqueProductCard } from "@/components/boutique/BoutiqueProductCard";
import { Button } from "@/components/ui/Button";
import { useBoutiqueStore } from "@/components/boutique/BoutiqueStoreProvider";
import {
  useBoutiqueAnnouncementsQuery,
  useBoutiqueFlashSalesQuery,
  useBoutiqueProductsQuery,
} from "@/hooks/useBoutiqueStorefront";
import { getBoutiqueBasePath, resolveBoutiqueHref } from "@/lib/boutique";
import { formatPrice } from "@/lib/utils";
import { getDiscountedPrice } from "@/lib/storefront";

const benefits = [
  {
    icon: Truck,
    title: "Livraison boutique",
    description: "Les produits, frais et retrait restent relies a cette boutique.",
    color: "from-sky-500/15 to-sky-600/5",
    iconColor: "text-sky-600",
  },
  {
    icon: ShieldCheck,
    title: "Commande securisee",
    description: "Navigation, panier et checkout isoles dans l'univers du seller.",
    color: "from-emerald-500/15 to-emerald-600/5",
    iconColor: "text-emerald-600",
  },
  {
    icon: CreditCard,
    title: "Paiement flexible",
    description: "Mon Cash, NatCash ou paiement a la livraison selon la boutique.",
    color: "from-amber-500/15 to-amber-600/5",
    iconColor: "text-amber-600",
  },
  {
    icon: Sparkles,
    title: "Offres dediees",
    description: "Promotions, annonces et mises en avant propres a cette boutique.",
    color: "from-rose-500/15 to-rose-600/5",
    iconColor: "text-rose-600",
  },
] as const;

export default function BoutiqueHomePage() {
  const store = useBoutiqueStore();
  const { data: products = [], isLoading } = useBoutiqueProductsQuery();
  const { data: flashSales = [] } = useBoutiqueFlashSalesQuery();
  const { data: heroAnnouncements = [] } = useBoutiqueAnnouncementsQuery("hero");
  const basePath = getBoutiqueBasePath(store.storeSlug);

  const featuredProducts = useMemo(
    () => products.filter((product) => product.isFeatured).slice(0, 5),
    [products],
  );
  const newestProducts = useMemo(() => products.slice(0, 8), [products]);
  const promotionProducts = useMemo(
    () => products.filter((product) => (product.discount || 0) > 0).slice(0, 4),
    [products],
  );
  const featuredHero = featuredProducts[0] || newestProducts[0] || null;
  const featuredGrid = (featuredProducts.length > 1
    ? featuredProducts.slice(1, 5)
    : newestProducts.slice(1, 5));
  const featuredHeroPrice = featuredHero ? getDiscountedPrice(featuredHero) : 0;

  const categoryCards = useMemo(() => {
    const counts = new Map<string, number>();

    products.forEach((product) => {
      if (product.categoryId) {
        counts.set(product.categoryId, (counts.get(product.categoryId) || 0) + 1);
      }
    });

    return PRODUCT_ONTOLOGY.filter((category) => counts.has(category.id))
      .map((category) => ({
        id: category.id,
        name: category.name,
        count: counts.get(category.id) || 0,
        subcategoryCount: category.subcategories.length,
      }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 6);
  }, [products]);

  const categoryRows = useMemo(
    () =>
      categoryCards
        .slice(0, 3)
        .map((category) => ({
          ...category,
          products: products
            .filter((product) => product.categoryId === category.id || product.categorySlug === category.id)
            .slice(0, 4),
        }))
        .filter((category) => category.products.length > 0),
    [categoryCards, products],
  );

  const heroAnnouncement = heroAnnouncements[0] || null;

  return (
    <div className="min-h-screen bg-[#fbf8f3]">
      <section className="relative overflow-hidden bg-[#171411] text-white">
        <div className="absolute inset-0">
          <Image
            src={heroAnnouncement?.image_url || store.banner || "/images/placeholder.jpg"}
            alt={heroAnnouncement?.title || store.businessName}
            fill
            priority
            className="object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,195,110,0.25),_transparent_30%),linear-gradient(115deg,_rgba(23,20,17,0.96),_rgba(23,20,17,0.82)_45%,_rgba(23,20,17,0.94))]" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr,0.85fr] lg:px-8 xl:px-12 xl:py-24">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/75">
              <ShoppingBag className="h-3.5 w-3.5" />
              Boutique officielle
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
                {heroAnnouncement?.title || `Le meilleur de ${store.businessName}`}
              </h1>
              <p className="max-w-2xl text-base leading-8 text-white/75 md:text-lg">
                {heroAnnouncement?.content ||
                  `Decouvrez les nouveautes, promotions et produits phares disponibles uniquement dans la boutique ${store.businessName}.`}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={`${basePath}/collection`}>
                <Button className="bg-white text-neutral-900 hover:bg-neutral-100">
                  Explorer la collection
                </Button>
              </Link>
              <Link href={`${basePath}/collection?promo=true`}>
                <Button
                  variant="outline"
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  Voir les promotions
                </Button>
              </Link>
              <Link href={`${basePath}/a-propos`}>
                <Button
                  variant="outline"
                  className="border-white/15 bg-transparent text-white hover:bg-white/10"
                >
                  A propos
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <CommerceSpotlight
              icon={<Flame className="h-5 w-5" />}
              title="Offres flash"
              description={
                flashSales.length > 0
                  ? `${flashSales.length} promotion${flashSales.length > 1 ? "s" : ""} active${flashSales.length > 1 ? "s" : ""} dans la boutique.`
                  : "De nouvelles remises boutique peuvent apparaitre a tout moment."
              }
              href={`${basePath}/collection?promo=true`}
              label="Voir les offres"
            />
            <CommerceSpotlight
              icon={<Sparkles className="h-5 w-5" />}
              title="Nouveautes"
              description={
                newestProducts.length > 0
                  ? `${newestProducts.length} produit${newestProducts.length > 1 ? "s" : ""} recemment publie${newestProducts.length > 1 ? "s" : ""}.`
                  : "Le catalogue sera bientot alimente avec de nouvelles references."
              }
              href={`${basePath}/collection?sort=newest`}
              label="Voir les nouveautes"
            />
            {heroAnnouncement?.link_url ? (
              <CommerceSpotlight
                icon={<Zap className="h-5 w-5" />}
                title={heroAnnouncement.link_text || "Annonce du moment"}
                description={heroAnnouncement.content || "Mise en avant speciale de la boutique."}
                href={resolveBoutiqueHref(heroAnnouncement.link_url, store)}
                label={heroAnnouncement.link_text || "Ouvrir"}
              />
            ) : null}
          </div>
        </div>
      </section>

      <section className="border-b border-neutral-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className={`rounded-[1.5rem] bg-gradient-to-br ${benefit.color} p-4`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <benefit.icon className={`h-5 w-5 ${benefit.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">{benefit.title}</p>
                    <p className="text-xs leading-6 text-neutral-500">{benefit.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 xl:px-12">
        <SectionHeading
          eyebrow="Collections"
          title="Explorer par categorie"
          href={`${basePath}/collection`}
        />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          {categoryCards.map((category, index) => (
            <Link
              key={category.id}
              href={`${basePath}/collection/${category.id}`}
              className="group rounded-[1.6rem] border border-neutral-200 bg-white p-5 transition hover:-translate-y-1 hover:border-neutral-300 hover:shadow-sm"
            >
              <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-400">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-6 text-lg font-semibold text-neutral-900 group-hover:text-neutral-700">
                {category.name}
              </h3>
              <p className="mt-2 text-sm text-neutral-500">
                {category.count} produit{category.count > 1 ? "s" : ""}
              </p>
              <p className="mt-1 text-xs text-neutral-400">
                {category.subcategoryCount} sous-categorie{category.subcategoryCount > 1 ? "s" : ""}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {flashSales.length > 0 ? (
        <section className="bg-[#171411] py-14 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-12">
            <SectionHeading
              eyebrow="Promotions"
              title="Ventes flash de la boutique"
              href={`${basePath}/collection?promo=true`}
              dark
            />

            <div className="grid gap-5 lg:grid-cols-3">
              {flashSales.slice(0, 3).map((sale) => {
                const saleProduct = Array.isArray(sale.products) ? sale.products[0] : sale.products;

                if (!saleProduct) {
                  return null;
                }

                return (
                  <article
                    key={sale.id}
                    className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/5 backdrop-blur"
                  >
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={saleProduct.images?.[0] || "/images/placeholder.jpg"}
                        alt={saleProduct.name || sale.title || "Promotion boutique"}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                      <div className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
                        Vente flash
                      </div>
                    </div>
                    <div className="space-y-4 p-5">
                      <h3 className="text-xl font-semibold">{sale.title || saleProduct.name}</h3>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-semibold">
                          {formatPrice(Number(sale.sale_price || 0), "HTG")}
                        </span>
                        <span className="text-sm text-white/50 line-through">
                          {formatPrice(Number(sale.original_price || 0), "HTG")}
                        </span>
                      </div>
                      <Link
                        href={`${basePath}/produit/${saleProduct.id}`}
                        className="inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4"
                      >
                        Voir le produit
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {featuredHero ? (
        <section className="bg-neutral-50 py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-12">
            <SectionHeading
              eyebrow="Selection"
              title="Produits en vedette"
              href={`${basePath}/collection`}
            />

            <div className="grid gap-5 lg:grid-cols-12">
              <Link
                href={`${basePath}/produit/${featuredHero.id}`}
                className="group relative overflow-hidden rounded-[2rem] border border-neutral-200 bg-white lg:col-span-5"
              >
                <div className="relative min-h-[26rem]">
                  <Image
                    src={featuredHero.images[0]}
                    alt={featuredHero.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-neutral-900">
                    Vedette
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <p className="text-xs uppercase tracking-[0.28em] text-white/65">
                      {featuredHero.category}
                    </p>
                    <h3 className="mt-3 text-3xl font-semibold">{featuredHero.name}</h3>
                    <div className="mt-4 flex items-center gap-3">
                      <span className="text-2xl font-semibold">
                        {formatPrice(featuredHeroPrice, featuredHero.currencyCode || "HTG")}
                      </span>
                      {(featuredHero.discount || 0) > 0 ? (
                        <span className="text-sm text-white/55 line-through">
                          {formatPrice(featuredHero.price, featuredHero.currencyCode || "HTG")}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </Link>

              <div className="grid gap-5 sm:grid-cols-2 lg:col-span-7">
                {featuredGrid.map((product) => (
                  <BoutiqueProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {promotionProducts.length > 0 ? (
        <section className="bg-white py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-12">
            <SectionHeading
              eyebrow="Offres"
              title="Promotions a ne pas manquer"
              href={`${basePath}/collection?promo=true`}
            />
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {promotionProducts.map((product) => (
                <BoutiqueProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <ProductSection
        eyebrow="Nouveautes"
        title="Derniers arrivages"
        subtitle="Les references les plus recentes publiees dans cette boutique."
        products={newestProducts}
        emptyText="Aucun produit actif pour le moment."
        isLoading={isLoading}
      />

      {categoryRows.map((category) => (
        <section key={category.id} className="bg-white py-14 even:bg-neutral-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-12">
            <SectionHeading
              eyebrow="Categorie"
              title={category.name}
              href={`${basePath}/collection/${category.id}`}
            />
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {category.products.map((product) => (
                <BoutiqueProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  href,
  dark = false,
}: {
  eyebrow: string;
  title: string;
  href: string;
  dark?: boolean;
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <p
          className={`text-xs uppercase tracking-[0.28em] ${
            dark ? "text-white/50" : "text-neutral-400"
          }`}
        >
          {eyebrow}
        </p>
        <h2 className={`mt-2 text-3xl font-semibold ${dark ? "text-white" : "text-neutral-900"}`}>
          {title}
        </h2>
      </div>
      <Link
        href={href}
        className={`text-sm font-medium underline underline-offset-4 ${
          dark ? "text-white" : "text-neutral-700"
        }`}
      >
        Voir tout
      </Link>
    </div>
  );
}

function CommerceSpotlight({
  icon,
  title,
  description,
  href,
  label,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  href: string;
  label: string;
}) {
  return (
    <article className="rounded-[1.75rem] border border-white/12 bg-white/6 p-5 backdrop-blur">
      <div className="inline-flex rounded-full bg-white/10 p-3">{icon}</div>
      <h2 className="mt-4 text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-7 text-white/72">{description}</p>
      <Link
        href={href}
        className="mt-5 inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4"
      >
        {label}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}

function ProductSection({
  eyebrow,
  title,
  subtitle,
  products,
  emptyText,
  isLoading,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  products: ReturnType<typeof useBoutiqueProductsQuery>["data"];
  emptyText: string;
  isLoading: boolean;
}) {
  const store = useBoutiqueStore();

  return (
    <section className="bg-[#fbf8f3] py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-neutral-400">{eyebrow}</p>
            <h2 className="mt-2 text-3xl font-semibold text-neutral-900">{title}</h2>
            <p className="mt-2 text-sm text-neutral-500">{subtitle}</p>
          </div>
          <Link
            href={`${getBoutiqueBasePath(store.storeSlug)}/collection`}
            className="text-sm font-medium text-neutral-700 underline underline-offset-4"
          >
            Voir toute la boutique
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-96 animate-pulse rounded-[1.85rem] bg-neutral-200" />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => (
              <BoutiqueProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-[1.75rem] border border-dashed border-neutral-300 bg-white p-10 text-center text-sm text-neutral-500">
            {emptyText}
          </div>
        )}
      </div>
    </section>
  );
}
