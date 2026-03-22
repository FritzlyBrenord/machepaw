"use client";

import { useEffect, useMemo, useState } from "react";
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
import {
  resolveBoutiqueBuilderConfig,
  resolveBoutiqueBuilderHref,
  type BoutiqueBuilderSection,
} from "@/data/boutiqueBuilder";
import { PRODUCT_ONTOLOGY } from "@/data/productOntology";
import { BoutiqueProductCard } from "@/components/boutique/BoutiqueProductCard";
import { Button } from "@/components/ui/Button";
import {
  useBoutiqueStore,
  useBoutiqueTheme,
} from "@/components/boutique/BoutiqueStoreProvider";
import { type BoutiqueThemeDefinition, applyThemeTemplate } from "@/data/boutiqueThemes";
import {
  useBoutiqueAnnouncementsQuery,
  useBoutiqueFlashSalesQuery,
  useBoutiqueProductsQuery,
} from "@/hooks/useBoutiqueStorefront";
import { getBoutiqueBasePath, resolveBoutiqueHref } from "@/lib/boutique";
import {
  getBoutiqueHeadingClass,
  getBoutiqueOutlineButtonStyle,
  getBoutiquePageStyle,
  getBoutiquePrimaryButtonStyle,
  getBoutiqueRadiusClass,
  getBoutiqueSurfaceStyle,
} from "@/lib/boutiqueTheme";
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

type HeroSlide = {
  id: string;
  title: string;
  description: string;
  image: string;
  href: string;
  label: string;
};

export default function BoutiqueHomePage() {
  const store = useBoutiqueStore();
  const theme = useBoutiqueTheme();
  const headingClass = getBoutiqueHeadingClass(theme);
  const radiusClass = getBoutiqueRadiusClass(theme);
  const { data: products = [], isLoading } = useBoutiqueProductsQuery();
  const { data: flashSales = [] } = useBoutiqueFlashSalesQuery();
  const { data: heroAnnouncements = [] } = useBoutiqueAnnouncementsQuery("hero");
  const basePath = getBoutiqueBasePath(store.storeSlug);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

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
  const heroSlides = useMemo<HeroSlide[]>(() => {
    const baseSlides: HeroSlide[] = [];

    if (heroAnnouncement) {
      baseSlides.push({
        id: heroAnnouncement.id,
        title:
          heroAnnouncement.title ||
          applyThemeTemplate(theme.hero.titleTemplate, store.businessName),
        description:
          heroAnnouncement.content ||
          applyThemeTemplate(theme.hero.descriptionTemplate, store.businessName),
        image:
          heroAnnouncement.image_url ||
          store.banner ||
          featuredHero?.images[0] ||
          "/images/placeholder.jpg",
        href: heroAnnouncement.link_url
          ? resolveBoutiqueHref(heroAnnouncement.link_url, store)
          : `${basePath}/collection`,
        label: heroAnnouncement.link_text || theme.hero.badge,
      });
    }

    featuredProducts.slice(0, 3).forEach((product) => {
      baseSlides.push({
        id: product.id,
        title: product.name,
        description: product.description,
        image: product.images[0] || store.banner || "/images/placeholder.jpg",
        href: `${basePath}/produit/${product.id}`,
        label: product.category,
      });
    });

    if (baseSlides.length === 0) {
      baseSlides.push({
        id: store.id,
        title: applyThemeTemplate(theme.hero.titleTemplate, store.businessName),
        description: applyThemeTemplate(
          theme.hero.descriptionTemplate,
          store.businessName,
        ),
        image: store.banner || "/images/placeholder.jpg",
        href: `${basePath}/collection`,
        label: theme.hero.badge,
      });
    }

    return baseSlides.slice(0, 4);
  }, [
    basePath,
    featuredHero?.images,
    featuredProducts,
    heroAnnouncement,
    store,
    theme.hero.badge,
    theme.hero.descriptionTemplate,
    theme.hero.titleTemplate,
  ]);

  const builderConfig = useMemo(
    () =>
      resolveBoutiqueBuilderConfig(
        store.storefrontThemeConfig,
        store.businessName,
        theme.slug,
      ),
    [store.businessName, store.storefrontThemeConfig, theme.slug],
  );
  const homepageSections = builderConfig.homepage.sections;
  const heroSection =
    homepageSections.find((section) => section.type === "hero") || null;
  const benefitsSection =
    homepageSections.find((section) => section.type === "benefits") || null;
  const categoriesSection =
    homepageSections.find((section) => section.type === "categories") || null;
  const flashSalesSection =
    homepageSections.find((section) => section.type === "flash_sales") || null;
  const featuredSection =
    homepageSections.find((section) => section.type === "featured_products") ||
    null;
  const promotionsSection =
    homepageSections.find((section) => section.type === "promotions") || null;
  const newArrivalsSection =
    homepageSections.find((section) => section.type === "new_arrivals") || null;
  const categoryRowsSection =
    homepageSections.find((section) => section.type === "category_rows") || null;
  const maxWidthClass =
    builderConfig.homepage.global.contentWidth === "wide"
      ? "max-w-[90rem]"
      : "max-w-7xl";
  const sectionGapClass =
    builderConfig.homepage.global.density === "compact"
      ? "py-10"
      : builderConfig.homepage.global.density === "relaxed"
        ? "py-18"
        : "py-14";
  const fontScaleClass =
    builderConfig.homepage.global.fontScale === "sm"
      ? "text-[0.96rem]"
      : builderConfig.homepage.global.fontScale === "lg"
        ? "text-[1.04rem]"
        : "";

  useEffect(() => {
    if (theme.layout.heroStyle !== "slider" || heroSlides.length < 2) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveHeroIndex((current) => (current + 1) % heroSlides.length);
    }, 5200);

    return () => window.clearInterval(interval);
  }, [heroSlides.length, theme.layout.heroStyle]);

  const sectionNodes: Partial<Record<BoutiqueBuilderSection["type"], ReactNode>> = {
    hero: heroSection?.enabled ? (
      <BoutiqueHeroSection
        theme={theme}
        section={heroSection}
        headingClass={headingClass}
        basePath={basePath}
        slides={heroSlides}
        activeIndex={heroSlides.length > 0 ? activeHeroIndex % heroSlides.length : 0}
        onSelectSlide={setActiveHeroIndex}
        flashSalesCount={flashSales.length}
        newestCount={newestProducts.length}
        maxWidthClass={maxWidthClass}
      />
    ) : null,
    benefits:
      benefitsSection?.enabled ? (
        <section
          className="border-b py-6"
          style={{
            borderColor: theme.palette.border,
            backgroundColor:
              benefitsSection.style.backgroundColor || theme.palette.surface,
          }}
        >
          <div className={cn("mx-auto px-4 sm:px-6 lg:px-8 xl:px-12", maxWidthClass)}>
            {benefitsSection.title || benefitsSection.subtitle ? (
              <div className="mb-6">
                <SectionHeading
                  eyebrow={benefitsSection.eyebrow || "Confiance"}
                  title={benefitsSection.title || "Pourquoi commander ici"}
                  href={resolveBoutiqueBuilderHref(basePath, benefitsSection.ctaHref || "/a-propos")}
                />
                {benefitsSection.subtitle ? (
                  <p className="-mt-4 max-w-2xl text-sm" style={{ color: theme.palette.muted }}>
                    {benefitsSection.subtitle}
                  </p>
                ) : null}
              </div>
            ) : null}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {benefits
                .slice(0, benefitsSection.maxItems || benefits.length)
                .map((benefit) => (
                  <div
                    key={benefit.title}
                    className={`${radiusClass} border p-4`}
                    style={{
                      ...getBoutiqueSurfaceStyle(theme),
                      backgroundColor:
                        benefitsSection.style.panelColor || theme.palette.surface,
                      color: benefitsSection.style.textColor || theme.palette.text,
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm"
                        style={{
                          backgroundColor:
                            benefitsSection.style.accentColor || theme.palette.accentSoft,
                          color: theme.palette.accentContrast,
                        }}
                      >
                        <benefit.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">
                          {benefit.title}
                        </p>
                        <p className="text-xs leading-6" style={{ color: theme.palette.muted }}>
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>
      ) : null,
    categories:
      categoriesSection?.enabled ? (
        <section className={cn("mx-auto px-4 sm:px-6 lg:px-8 xl:px-12", maxWidthClass, sectionGapClass)}>
          <SectionHeading
            eyebrow={categoriesSection.eyebrow || "Collections"}
            title={categoriesSection.title || "Explorer par categorie"}
            href={resolveBoutiqueBuilderHref(
              basePath,
              categoriesSection.ctaHref || "/collection",
            )}
          />
          {categoriesSection.subtitle ? (
            <p className="-mt-4 mb-8 max-w-2xl text-sm" style={{ color: theme.palette.muted }}>
              {categoriesSection.subtitle}
            </p>
          ) : null}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            {categoryCards
              .slice(0, categoriesSection.maxItems || categoryCards.length)
              .map((category, index) => (
                <Link
                  key={category.id}
                  href={`${basePath}/collection/${category.id}`}
                  className={`group border p-5 transition hover:-translate-y-1 hover:shadow-sm ${radiusClass}`}
                  style={{
                    ...getBoutiqueSurfaceStyle(theme),
                    backgroundColor:
                      categoriesSection.style.backgroundColor || theme.palette.surface,
                    color: categoriesSection.style.textColor || theme.palette.text,
                  }}
                >
                  <p
                    className="text-[11px] uppercase tracking-[0.28em]"
                    style={{ color: theme.palette.muted }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className={`mt-6 text-lg ${headingClass}`}>{category.name}</h3>
                  <p className="mt-2 text-sm" style={{ color: theme.palette.muted }}>
                    {category.count} produit{category.count > 1 ? "s" : ""}
                  </p>
                </Link>
              ))}
          </div>
        </section>
      ) : null,
    flash_sales:
      flashSalesSection?.enabled && flashSales.length > 0 ? (
        <section
          className={cn(sectionGapClass, "text-white")}
          style={{
            backgroundColor:
              flashSalesSection.style.backgroundColor || theme.palette.heroBase,
          }}
        >
          <div className={cn("mx-auto px-4 sm:px-6 lg:px-8 xl:px-12", maxWidthClass)}>
            <SectionHeading
              eyebrow={flashSalesSection.eyebrow || "Promotions"}
              title={flashSalesSection.title || "Ventes flash de la boutique"}
              href={resolveBoutiqueBuilderHref(
                basePath,
                flashSalesSection.ctaHref || "/collection?promo=true",
              )}
              dark
            />
            {flashSalesSection.subtitle ? (
              <p className="-mt-4 mb-8 max-w-2xl text-sm text-white/72">
                {flashSalesSection.subtitle}
              </p>
            ) : null}
            <div className="grid gap-5 lg:grid-cols-3">
              {flashSales
                .slice(0, flashSalesSection.maxItems || flashSales.length)
                .map((sale) => {
                  const saleProduct = Array.isArray(sale.products)
                    ? sale.products[0]
                    : sale.products;

                  if (!saleProduct) {
                    return null;
                  }

                  return (
                    <article
                      key={sale.id}
                      className={`overflow-hidden border backdrop-blur ${radiusClass}`}
                      style={{
                        borderColor: "rgba(255,255,255,0.12)",
                        backgroundColor:
                          flashSalesSection.style.panelColor || "rgba(255,255,255,0.05)",
                      }}
                    >
                      <div className="relative h-64 overflow-hidden">
                        <Image
                          src={saleProduct.images?.[0] || "/images/placeholder.jpg"}
                          alt={saleProduct.name || sale.title || "Promotion boutique"}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                        <div
                          className="absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold"
                          style={{
                            backgroundColor:
                              flashSalesSection.style.accentColor || theme.palette.accent,
                            color: theme.palette.accentContrast,
                          }}
                        >
                          Vente flash
                        </div>
                      </div>
                      <div className="space-y-4 p-5">
                        <h3 className={`text-xl ${headingClass}`}>
                          {sale.title || saleProduct.name}
                        </h3>
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
      ) : null,
    featured_products:
      featuredSection?.enabled && featuredHero ? (
        <section
          className={sectionGapClass}
          style={{
            backgroundColor:
              featuredSection.style.backgroundColor || theme.palette.pageAltBackground,
          }}
        >
          <div className={cn("mx-auto px-4 sm:px-6 lg:px-8 xl:px-12", maxWidthClass)}>
            <SectionHeading
              eyebrow={featuredSection.eyebrow || "Selection"}
              title={featuredSection.title || "Produits en vedette"}
              href={resolveBoutiqueBuilderHref(
                basePath,
                featuredSection.ctaHref || "/collection",
              )}
            />
            {featuredSection.subtitle ? (
              <p className="-mt-4 mb-8 max-w-2xl text-sm" style={{ color: theme.palette.muted }}>
                {featuredSection.subtitle}
              </p>
            ) : null}

            <div className="grid gap-5 lg:grid-cols-12">
              <Link
                href={`${basePath}/produit/${featuredHero.id}`}
                className={`group relative overflow-hidden border lg:col-span-5 ${radiusClass}`}
                style={getBoutiqueSurfaceStyle(theme)}
              >
                <div className="relative min-h-[26rem]">
                  <Image
                    src={featuredHero.images[0]}
                    alt={featuredHero.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div
                    className="absolute left-5 top-5 rounded-full px-3 py-1 text-xs font-semibold"
                    style={{
                      backgroundColor:
                        featuredSection.style.accentColor || theme.palette.accentContrast,
                      color: theme.palette.text,
                    }}
                  >
                    Vedette
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <p className="text-xs uppercase tracking-[0.28em] text-white/65">
                      {featuredHero.category}
                    </p>
                    <h3 className={`mt-3 text-3xl ${headingClass}`}>
                      {featuredHero.name}
                    </h3>
                    <div className="mt-4 flex items-center gap-3">
                      <span className="text-2xl font-semibold">
                        {formatPrice(featuredHeroPrice, featuredHero.currencyCode || "HTG")}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              <div className="grid gap-5 sm:grid-cols-2 lg:col-span-7">
                {featuredGrid
                  .slice(
                    0,
                    Math.max(0, (featuredSection.maxItems || 5) - 1),
                  )
                  .map((product) => (
                    <BoutiqueProductCard key={product.id} product={product} />
                  ))}
              </div>
            </div>
          </div>
        </section>
      ) : null,
    promotions:
      promotionsSection?.enabled && promotionProducts.length > 0 ? (
        <section
          className={sectionGapClass}
          style={{
            backgroundColor:
              promotionsSection.style.backgroundColor || theme.palette.pageBackground,
          }}
        >
          <div className={cn("mx-auto px-4 sm:px-6 lg:px-8 xl:px-12", maxWidthClass)}>
            <SectionHeading
              eyebrow={promotionsSection.eyebrow || "Offres"}
              title={promotionsSection.title || "Promotions a ne pas manquer"}
              href={resolveBoutiqueBuilderHref(
                basePath,
                promotionsSection.ctaHref || "/collection?promo=true",
              )}
            />
            {promotionsSection.subtitle ? (
              <p className="-mt-4 mb-8 max-w-2xl text-sm" style={{ color: theme.palette.muted }}>
                {promotionsSection.subtitle}
              </p>
            ) : null}
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {promotionProducts
                .slice(0, promotionsSection.maxItems || promotionProducts.length)
                .map((product) => (
                  <BoutiqueProductCard key={product.id} product={product} />
                ))}
            </div>
          </div>
        </section>
      ) : null,
    new_arrivals:
      newArrivalsSection?.enabled ? (
        <ProductSection
          eyebrow={newArrivalsSection.eyebrow || "Nouveautes"}
          title={newArrivalsSection.title || "Derniers arrivages"}
          subtitle={
            newArrivalsSection.subtitle ||
            "Les references les plus recentes publiees dans cette boutique."
          }
          products={newestProducts.slice(
            0,
            newArrivalsSection.maxItems || newestProducts.length,
          )}
          emptyText="Aucun produit actif pour le moment."
          isLoading={isLoading}
        />
      ) : null,
    category_rows:
      categoryRowsSection?.enabled ? (
        <>
          {categoryRows
            .slice(0, categoryRowsSection.maxItems || categoryRows.length)
            .map((category, index) => (
              <section
                key={category.id}
                className={sectionGapClass}
                style={{
                  backgroundColor:
                    categoryRowsSection.style.backgroundColor ||
                    (index % 2 === 1
                      ? theme.palette.pageAltBackground
                      : theme.palette.pageBackground),
                }}
              >
                <div className={cn("mx-auto px-4 sm:px-6 lg:px-8 xl:px-12", maxWidthClass)}>
                  <SectionHeading
                    eyebrow={categoryRowsSection.eyebrow || "Categorie"}
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
        </>
      ) : null,
  };

  return (
    <div className="min-h-screen" style={getBoutiquePageStyle(theme)}>
      <BoutiqueHeroSection
        theme={theme}
        headingClass={headingClass}
        basePath={basePath}
        slides={heroSlides}
        activeIndex={heroSlides.length > 0 ? activeHeroIndex % heroSlides.length : 0}
        onSelectSlide={setActiveHeroIndex}
        flashSalesCount={flashSales.length}
        newestCount={newestProducts.length}
      />

      <section
        className="border-b py-6"
        style={{
          borderColor: theme.palette.border,
          backgroundColor: theme.palette.surface,
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className={`${radiusClass} border p-4`}
                style={getBoutiqueSurfaceStyle(theme)}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm"
                    style={{
                      backgroundColor: theme.palette.accentSoft,
                      color: theme.palette.accent,
                    }}
                  >
                    <benefit.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: theme.palette.text }}
                    >
                      {benefit.title}
                    </p>
                    <p
                      className="text-xs leading-6"
                      style={{ color: theme.palette.muted }}
                    >
                      {benefit.description}
                    </p>
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
            className={`group border p-5 transition hover:-translate-y-1 hover:shadow-sm ${radiusClass}`}
            style={getBoutiqueSurfaceStyle(theme)}
          >
              <p
                className="text-[11px] uppercase tracking-[0.28em]"
                style={{ color: theme.palette.muted }}
              >
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3
                className={`mt-6 text-lg ${headingClass}`}
                style={{ color: theme.palette.text }}
              >
                {category.name}
              </h3>
              <p className="mt-2 text-sm" style={{ color: theme.palette.muted }}>
                {category.count} produit{category.count > 1 ? "s" : ""}
              </p>
              <p className="mt-1 text-xs" style={{ color: theme.palette.muted }}>
                {category.subcategoryCount} sous-categorie{category.subcategoryCount > 1 ? "s" : ""}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {flashSales.length > 0 ? (
        <section
          className="py-14 text-white"
          style={{ backgroundColor: theme.palette.heroBase }}
        >
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
                    className={`overflow-hidden border backdrop-blur ${radiusClass}`}
                    style={{
                      borderColor: "rgba(255,255,255,0.12)",
                      backgroundColor: "rgba(255,255,255,0.05)",
                    }}
                  >
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={saleProduct.images?.[0] || "/images/placeholder.jpg"}
                        alt={saleProduct.name || sale.title || "Promotion boutique"}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                      <div
                        className="absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold"
                        style={{
                          backgroundColor: theme.palette.accent,
                          color: theme.palette.accentContrast,
                        }}
                      >
                        Vente flash
                      </div>
                    </div>
                    <div className="space-y-4 p-5">
                      <h3 className={`text-xl ${headingClass}`}>
                        {sale.title || saleProduct.name}
                      </h3>
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
        <section
          className="py-14"
          style={{ backgroundColor: theme.palette.pageAltBackground }}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-12">
            <SectionHeading
              eyebrow="Selection"
              title="Produits en vedette"
              href={`${basePath}/collection`}
            />

            <div className="grid gap-5 lg:grid-cols-12">
              <Link
                href={`${basePath}/produit/${featuredHero.id}`}
                className={`group relative overflow-hidden border lg:col-span-5 ${radiusClass}`}
                style={getBoutiqueSurfaceStyle(theme)}
              >
                <div className="relative min-h-[26rem]">
                  <Image
                    src={featuredHero.images[0]}
                    alt={featuredHero.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div
                    className="absolute left-5 top-5 rounded-full px-3 py-1 text-xs font-semibold"
                    style={{
                      backgroundColor: theme.palette.accentContrast,
                      color: theme.palette.text,
                    }}
                  >
                    Vedette
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <p className="text-xs uppercase tracking-[0.28em] text-white/65">
                      {featuredHero.category}
                    </p>
                    <h3 className={`mt-3 text-3xl ${headingClass}`}>
                      {featuredHero.name}
                    </h3>
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
        <section
          className="py-14"
          style={{ backgroundColor: theme.palette.pageBackground }}
        >
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

      {categoryRows.map((category, index) => (
        <section
          key={category.id}
          className="py-14"
          style={{
            backgroundColor:
              index % 2 === 1
                ? theme.palette.pageAltBackground
                : theme.palette.pageBackground,
          }}
        >
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
  const theme = useBoutiqueTheme();
  const headingClass = getBoutiqueHeadingClass(theme);

  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <p
          className="text-xs uppercase tracking-[0.28em]"
          style={{ color: dark ? "rgba(255,255,255,0.5)" : theme.palette.muted }}
        >
          {eyebrow}
        </p>
        <h2
          className={`mt-2 text-3xl ${headingClass}`}
          style={{ color: dark ? "#ffffff" : theme.palette.text }}
        >
          {title}
        </h2>
      </div>
      <Link
        href={href}
        className="text-sm font-medium underline underline-offset-4"
        style={{ color: dark ? "#ffffff" : theme.palette.text }}
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
  const theme = useBoutiqueTheme();
  const headingClass = getBoutiqueHeadingClass(theme);

  return (
    <article
      className={`${getBoutiqueRadiusClass(theme)} border p-5 backdrop-blur`}
      style={{
        borderColor: "rgba(255,255,255,0.12)",
        backgroundColor: "rgba(255,255,255,0.06)",
      }}
    >
      <div className="inline-flex rounded-full bg-white/10 p-3">{icon}</div>
      <h2 className={`mt-4 text-xl ${headingClass}`}>{title}</h2>
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
  const theme = useBoutiqueTheme();
  const headingClass = getBoutiqueHeadingClass(theme);
  const radiusClass = getBoutiqueRadiusClass(theme);

  return (
    <section className="py-14" style={getBoutiquePageStyle(theme)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p
              className="text-xs uppercase tracking-[0.28em]"
              style={{ color: theme.palette.muted }}
            >
              {eyebrow}
            </p>
            <h2
              className={`mt-2 text-3xl ${headingClass}`}
              style={{ color: theme.palette.text }}
            >
              {title}
            </h2>
            <p className="mt-2 text-sm" style={{ color: theme.palette.muted }}>
              {subtitle}
            </p>
          </div>
          <Link
            href={`${getBoutiqueBasePath(store.storeSlug)}/collection`}
            className="text-sm font-medium underline underline-offset-4"
            style={{ color: theme.palette.text }}
          >
            Voir toute la boutique
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className={`h-96 animate-pulse ${radiusClass}`}
                style={{ backgroundColor: theme.palette.surfaceAlt }}
              />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => (
              <BoutiqueProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div
            className={`${radiusClass} border border-dashed p-10 text-center text-sm`}
            style={getBoutiqueSurfaceStyle(theme)}
          >
            {emptyText}
          </div>
        )}
      </div>
    </section>
  );
}

function BoutiqueHeroSection({
  theme,
  headingClass,
  basePath,
  slides,
  activeIndex,
  onSelectSlide,
  flashSalesCount,
  newestCount,
}: {
  theme: BoutiqueThemeDefinition;
  headingClass: string;
  basePath: string;
  slides: HeroSlide[];
  activeIndex: number;
  onSelectSlide: (index: number) => void;
  flashSalesCount: number;
  newestCount: number;
}) {
  const store = useBoutiqueStore();
  const activeSlide = slides[activeIndex] || slides[0] || null;

  if (!activeSlide) {
    return null;
  }

  const baseTitle = applyThemeTemplate(theme.hero.titleTemplate, store.businessName);
  const baseDescription = applyThemeTemplate(
    theme.hero.descriptionTemplate,
    store.businessName,
  );

  if (theme.layout.heroStyle === "slider") {
    return (
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: theme.palette.heroBase, color: "#fff" }}
      >
        <div className="absolute inset-0">
          <Image
            src={activeSlide.image}
            alt={activeSlide.title}
            fill
            priority
            className="object-cover"
          />
          <div
            className="absolute inset-0"
            style={{ background: theme.palette.heroOverlay }}
          />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 xl:px-12 xl:py-24">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/75">
              <Flame className="h-3.5 w-3.5" />
              {theme.hero.badge}
            </div>
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-white/55">
                {activeSlide.label}
              </p>
              <h1 className={`text-4xl md:text-6xl ${headingClass}`}>
                {activeSlide.title}
              </h1>
              <p className="max-w-2xl text-base leading-8 text-white/75 md:text-lg">
                {activeSlide.description || baseDescription}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={activeSlide.href}>
                <Button
                  className="rounded-full"
                  style={getBoutiquePrimaryButtonStyle(theme)}
                >
                  Ouvrir cette mise en avant
                </Button>
              </Link>
              <Link href={`${basePath}/collection`}>
                <Button
                  variant="outline"
                  className="rounded-full border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  Voir toute la collection
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap gap-3">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => onSelectSlide(index)}
                className="rounded-full border border-white/12 px-4 py-2 text-sm backdrop-blur"
              >
                {slide.label}
              </button>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (theme.layout.heroStyle === "editorial") {
    return (
      <section
        className="overflow-hidden border-b"
        style={{
          backgroundColor: theme.palette.pageAltBackground,
          borderColor: theme.palette.border,
        }}
      >
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr,0.95fr] lg:px-8 xl:px-12 xl:py-16">
          <div className="space-y-6">
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs uppercase tracking-[0.3em]"
              style={{
                backgroundColor: theme.palette.accentSoft,
                color: theme.palette.accent,
              }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {theme.hero.badge}
            </div>
            <div className="space-y-4">
              <p
                className="text-xs uppercase tracking-[0.3em]"
                style={{ color: theme.palette.muted }}
              >
                {theme.hero.eyebrow}
              </p>
              <h1
                className={`max-w-3xl text-4xl md:text-6xl ${headingClass}`}
                style={{ color: theme.palette.text }}
              >
                {baseTitle}
              </h1>
              <p
                className="max-w-2xl text-base leading-8 md:text-lg"
                style={{ color: theme.palette.muted }}
              >
                {baseDescription}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={`${basePath}/collection`}>
                <Button
                  className="rounded-full"
                  style={getBoutiquePrimaryButtonStyle(theme)}
                >
                  Explorer la collection
                </Button>
              </Link>
              <Link href={`${basePath}/a-propos`}>
                <Button
                  variant="outline"
                  className="rounded-full"
                  style={getBoutiqueOutlineButtonStyle(theme)}
                >
                  Comprendre la boutique
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1.1fr,0.9fr]">
            <Link
              href={activeSlide.href}
              className="group relative min-h-[24rem] overflow-hidden rounded-[2rem]"
            >
              <Image
                src={activeSlide.image}
                alt={activeSlide.title}
                fill
                priority
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div
                className="absolute inset-0"
                style={{ background: theme.palette.heroOverlay }}
              />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="text-xs uppercase tracking-[0.28em] text-white/60">
                  {activeSlide.label}
                </p>
                <h2 className={`mt-3 text-3xl ${headingClass}`}>
                  {activeSlide.title}
                </h2>
              </div>
            </Link>

            <div className="grid gap-4">
              {[`${flashSalesCount} offres flash`, `${newestCount} nouveautes`].map(
                (item) => (
                  <div
                    key={item}
                    className="border p-5"
                    style={getBoutiqueSurfaceStyle(theme)}
                  >
                    <p
                      className="text-xs uppercase tracking-[0.28em]"
                      style={{ color: theme.palette.muted }}
                    >
                      Focus boutique
                    </p>
                    <p
                      className={`mt-3 text-2xl ${headingClass}`}
                      style={{ color: theme.palette.text }}
                    >
                      {item}
                    </p>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: theme.palette.heroBase, color: "#fff" }}
    >
      <div className="absolute inset-0">
        <Image
          src={activeSlide.image}
          alt={activeSlide.title}
          fill
          priority
          className="object-cover opacity-35"
        />
        <div
          className="absolute inset-0"
          style={{ background: theme.palette.heroOverlay }}
        />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr,0.85fr] lg:px-8 xl:px-12 xl:py-24">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/75">
            <ShoppingBag className="h-3.5 w-3.5" />
            {theme.hero.badge}
          </div>
          <div className="space-y-4">
            <h1 className={`text-4xl md:text-6xl ${headingClass}`}>
              {baseTitle}
            </h1>
            <p className="max-w-2xl text-base leading-8 text-white/75 md:text-lg">
              {baseDescription}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={`${basePath}/collection`}>
              <Button
                className="rounded-full"
                style={getBoutiquePrimaryButtonStyle(theme)}
              >
                Explorer la collection
              </Button>
            </Link>
            <Link href={`${basePath}/collection?promo=true`}>
              <Button
                variant="outline"
                className="rounded-full border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                Voir les promotions
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <CommerceSpotlight
            icon={<Flame className="h-5 w-5" />}
            title="Offres flash"
            description={
              flashSalesCount > 0
                ? `${flashSalesCount} promotion${flashSalesCount > 1 ? "s" : ""} active${flashSalesCount > 1 ? "s" : ""} dans la boutique.`
                : "De nouvelles remises boutique peuvent apparaitre a tout moment."
            }
            href={`${basePath}/collection?promo=true`}
            label="Voir les offres"
          />
          <CommerceSpotlight
            icon={<Sparkles className="h-5 w-5" />}
            title={activeSlide.title}
            description={activeSlide.description || baseDescription}
            href={activeSlide.href}
            label="Voir la selection"
          />
          <CommerceSpotlight
            icon={<Zap className="h-5 w-5" />}
            title="Theme premium"
            description={theme.shortDescription}
            href={`${basePath}/a-propos`}
            label="A propos"
          />
        </div>
      </div>
    </section>
  );
}
