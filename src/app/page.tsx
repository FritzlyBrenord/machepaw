"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ElementType } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  LayoutGrid,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  HERO_SUPPORT_POINTS,
  MARKETING_STATS,
  PLATFORM_FEATURES,
  PRICING_PLANS,
  SELLER_STEPS,
  SITE_MODELS,
} from "@/data/marketing";

const actionButton =
  "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-all duration-200";

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl">
      <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-white/60">
        <Sparkles className="h-3.5 w-3.5" />
        {eyebrow}
      </span>
      <h2
        className="mt-5 text-3xl font-light text-white sm:text-4xl"
        style={{ fontFamily: "var(--font-playfair)" }}
      >
        {title}
      </h2>
      <p className="mt-4 text-sm leading-7 text-white/68 sm:text-base">
        {description}
      </p>
    </div>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
  detail,
}: {
  icon: ElementType;
  value: string;
  label: string;
  detail: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white">
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-[11px] uppercase tracking-[0.22em] text-white/40">
          Donnee
        </span>
      </div>
      <div className="mt-8">
        <div className="text-3xl font-semibold text-white">{value}</div>
        <p className="mt-1 text-sm font-medium text-white/90">{label}</p>
        <p className="mt-3 text-sm leading-6 text-white/58">{detail}</p>
      </div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-xl shadow-black/20 backdrop-blur">
      <div className="rounded-2xl bg-white/8 p-3 text-white w-fit">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-white/64">{description}</p>
    </div>
  );
}

function MarketingHomePage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-[42rem] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_42%)]" />
          <div className="absolute inset-x-0 top-0 h-full bg-[linear-gradient(to_bottom,rgba(5,5,5,0.1),rgba(5,5,5,0.78)_35%,rgba(5,5,5,1)_70%)]" />
          <div className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-amber-400/15 blur-3xl" />
          <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
        </div>

        <section className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 pb-20 pt-32 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid items-center gap-14 lg:grid-cols-[1.1fr,0.9fr]">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="max-w-3xl"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.25em] text-white/60">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                Plateforme boutique premium
              </div>

              <h1
                className="mt-6 max-w-4xl text-5xl font-light leading-[1.02] text-white sm:text-6xl lg:text-7xl"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Creez une boutique elegante, securisee et prete a vendre.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70 sm:text-xl">
                Nous aidons les vendeurs a ouvrir une boutique premium avec
                verification, isolation par boutique, paiements locaux et
                suivi commande clair pour le client comme pour le seller.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/auth/signup?redirect=/vendeur"
                  className={`${actionButton} bg-white text-neutral-950 hover:bg-amber-300`}
                >
                  Creer ma boutique
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/prix"
                  className={`${actionButton} border border-white/15 bg-white/5 text-white hover:bg-white/10`}
                >
                  Voir les prix
                </Link>
                <Link
                  href="/modeles"
                  className={`${actionButton} border border-white/15 bg-transparent text-white/85 hover:bg-white/6`}
                >
                  Decouvrir les modeles
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/60">
                {HERO_SUPPORT_POINTS.map((point) => (
                  <span
                    key={point}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2"
                  >
                    {point}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="relative"
            >
              <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-white/10 via-white/5 to-white/0 blur-2xl" />
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-black/35 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-white/45">
                      Apercu de la plateforme
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">
                      Votre boutique, votre espace
                    </h2>
                  </div>
                  <div className="rounded-2xl bg-emerald-400/15 px-3 py-2 text-sm font-medium text-emerald-200">
                    Live
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {MARKETING_STATS.map((stat) => (
                    <StatCard key={stat.label} {...stat} />
                  ))}
                </div>

                <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-5">
                  <div className="flex items-center gap-3 text-sm font-medium text-white">
                    <LayoutGrid className="h-4 w-4 text-amber-300" />
                    Parcours vendeur
                  </div>
                  <div className="mt-4 grid gap-3 text-sm text-white/68">
                    <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                      1. Creer un compte
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                      2. Confirmer l&apos;email et se connecter
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                      3. Seller approuve vers /vendeur
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                      4. Sinon redirection vers devenir-vendeur
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="relative mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8 xl:px-12">
          <SectionTitle
            eyebrow="Ce que nous faisons"
            title="Une boutique, une logique, un seller."
            description="La plateforme organise la boutique, les paiements, les commandes et le suivi dans un cadre professionnel. Chaque boutique reste isolee et chaque client suit ses propres commandes."
          />

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {PLATFORM_FEATURES.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <FeatureCard {...feature} />
              </motion.div>
            ))}
          </div>
        </section>

        <section className="relative mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8 xl:px-12">
          <SectionTitle
            eyebrow="Comment ca marche"
            title="Un onboarding simple, puis une boutique plus propre."
            description="Le client ou futur vendeur passe d'abord par l'inscription, la confirmation d'email et la connexion. Ensuite, la plateforme decide automatiquement s'il peut entrer dans /vendeur ou s'il doit terminer sa candidature."
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-5">
            {SELLER_STEPS.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
              >
                <div className="text-xs uppercase tracking-[0.25em] text-amber-200/80">
                  {step.step}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/64">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="relative mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8 xl:px-12">
          <SectionTitle
            eyebrow="Prix"
            title="Des offres lisibles pour demarrer sans confusion."
            description="Les forfaits ci-dessous sont pensés pour clarifier le parcours: commencer, monter en puissance, puis structurer le volume sans perdre la qualité du suivi."
          />

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {PRICING_PLANS.map((plan) => (
              <motion.div
                key={plan.name}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 280, damping: 24 }}
                className={`rounded-[1.75rem] border p-6 ${
                  plan.featured
                    ? "border-amber-300/50 bg-amber-300/10 shadow-2xl shadow-amber-300/10"
                    : "border-white/10 bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-semibold text-white">{plan.name}</h3>
                    <p className="mt-1 text-sm text-white/55">{plan.tag}</p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white">
                    {plan.price}
                  </div>
                </div>
                <p className="mt-5 text-sm leading-6 text-white/68">{plan.description}</p>
                <ul className="mt-6 space-y-3 text-sm text-white/72">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <BadgeCheck className="h-4 w-4 text-emerald-300" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`${actionButton} mt-7 w-full border border-white/12 bg-white/5 text-white hover:bg-white/10`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="relative mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8 xl:px-12">
          <SectionTitle
            eyebrow="Modeles"
            title="Choisissez une direction visuelle avant de lancer votre boutique."
            description="Chaque modele a une personnalite differente: un dark premium, un catalogue chic ou un studio plus oriente conversion."
          />

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {SITE_MODELS.map((model) => (
              <motion.div
                key={model.name}
                whileHover={{ y: -6 }}
                className={`rounded-[1.75rem] border p-6 shadow-xl shadow-black/20 ${model.accent} ${
                  model.accent.includes("white") ? "border-neutral-200" : "border-white/10"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-semibold">{model.name}</h3>
                    <p
                      className={`mt-1 text-sm ${
                        model.accent.includes("white") ? "text-neutral-600" : "text-white/60"
                      }`}
                    >
                      {model.description}
                    </p>
                  </div>
                  <Sparkles className={`h-5 w-5 ${model.accent.includes("white") ? "text-amber-500" : "text-amber-300"}`} />
                </div>

                <div className="mt-6 space-y-3">
                  {model.features.map((feature) => (
                    <div
                      key={feature}
                      className={`rounded-2xl border px-4 py-3 text-sm ${
                        model.accent.includes("white")
                          ? "border-neutral-200 bg-neutral-50 text-neutral-700"
                          : "border-white/10 bg-white/5 text-white/72"
                      }`}
                    >
                      {feature}
                    </div>
                  ))}
                </div>

                <Link
                  href={model.href}
                  className={`${actionButton} mt-7 w-full ${
                    model.accent.includes("white")
                      ? "bg-neutral-950 text-white hover:bg-neutral-800"
                      : "border border-white/12 bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  Explorer ce style
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="relative mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8 xl:px-12">
          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-r from-white/10 via-white/5 to-white/10 p-8 shadow-2xl shadow-black/30 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr] lg:items-end">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-white/60">
                  <CreditCard className="h-3.5 w-3.5" />
                  Paiements et confiance
                </span>
                <h2
                  className="mt-5 text-3xl font-light text-white sm:text-4xl"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  MonCash manuel, NatCash manuel et paiement au magasin.
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">
                  Les autres moyens peuvent etre prepares plus tard, mais
                  aujourd&apos;hui la plateforme reste transparente sur les options
                  vraiment actives pour garder un checkout clair et securise.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                <Link
                  href="/auth/signup?redirect=/vendeur"
                  className={`${actionButton} bg-white text-neutral-950 hover:bg-amber-300`}
                >
                  Demander ma boutique
                </Link>
                <Link
                  href="/collection"
                  className={`${actionButton} border border-white/15 bg-white/5 text-white hover:bg-white/10`}
                >
                  Explorer le catalogue
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default MarketingHomePage;
