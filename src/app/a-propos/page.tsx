"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, ShieldCheck, Sparkles, Store } from "lucide-react";
import { MARKETING_STATS, PLATFORM_PILLARS, SELLER_STEPS } from "@/data/marketing";

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
      <h1
        className="mt-5 text-4xl font-light text-white sm:text-5xl"
        style={{ fontFamily: "var(--font-playfair)" }}
      >
        {title}
      </h1>
      <p className="mt-4 text-sm leading-7 text-white/68 sm:text-base">
        {description}
      </p>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <main className="relative overflow-hidden px-4 py-28 sm:px-6 lg:px-8 xl:px-12">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.16),_transparent_42%)]" />
          <div className="absolute left-1/2 top-24 h-80 w-80 -translate-x-1/2 rounded-full bg-amber-400/12 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <SectionTitle
            eyebrow="A propos"
            title="Nous construisons une plateforme boutique claire, premium et isolee."
            description="Notre objectif est simple: aider chaque vendeur a creer une boutique propre, suivre ses commandes et offrir au client une experience fluide du premier clic jusqu'au suivi final."
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {MARKETING_STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur"
              >
                <div className="flex items-center justify-between">
                  <stat.icon className="h-5 w-5 text-amber-200" />
                  <span className="text-[11px] uppercase tracking-[0.22em] text-white/35">
                    Donnee
                  </span>
                </div>
                <div className="mt-6 text-3xl font-semibold text-white">{stat.value}</div>
                <p className="mt-1 text-sm font-medium text-white/90">{stat.label}</p>
                <p className="mt-3 text-sm leading-6 text-white/58">{stat.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
              <div className="flex items-center gap-3 text-sm font-medium text-white">
                <Store className="h-4 w-4 text-emerald-200" />
                Notre mission
              </div>
              <p className="mt-4 text-sm leading-7 text-white/68">
                Donner aux vendeurs un espace premium, structurer le checkout,
                gerer les paiements locaux, puis presenter les commandes dans un
                flux lisible pour le client et pour le seller.
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
              <div className="flex items-center gap-3 text-sm font-medium text-white">
                <BarChart3 className="h-4 w-4 text-cyan-200" />
                Notre approche
              </div>
              <p className="mt-4 text-sm leading-7 text-white/68">
                Nous mettons la clarté avant tout: isolation par boutique,
                verification vendeur, commandes suivies et pages marketing
                simples a comprendre avant l&apos;inscription.
              </p>
            </div>
          </div>

          <div className="mt-12">
            <SectionTitle
              eyebrow="Valeurs"
              title="Trois principes simples: securite, clarte, conversion."
              description="Chaque decision produit part de ces trois axes pour garder un site facile a utiliser et rassurant pour le vendeur comme pour l'acheteur."
            />
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {PLATFORM_PILLARS.map((pillar) => (
                <div
                  key={pillar.title}
                  className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
                >
                  <pillar.icon className="h-5 w-5 text-amber-200" />
                  <h2 className="mt-5 text-lg font-semibold text-white">
                    {pillar.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-white/64">
                    {pillar.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12">
            <SectionTitle
              eyebrow="Parcours"
              title="Le vendeur voit quoi se passe avant d'entrer dans son dashboard."
              description="Nous preferons un onboarding lisible: inscription, confirmation d'email, connexion, verification seller puis acces au tableau de bord si le compte est approuve."
            />
            <div className="mt-8 grid gap-4 lg:grid-cols-5">
              {SELLER_STEPS.map((step) => (
                <div
                  key={step.step}
                  className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
                >
                  <div className="text-xs uppercase tracking-[0.25em] text-amber-200/80">
                    {step.step}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-white/64">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 rounded-[2rem] border border-white/10 bg-gradient-to-r from-white/10 via-white/5 to-white/10 p-8">
            <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr] lg:items-end">
              <div>
                <div className="flex items-center gap-3 text-sm font-medium text-white">
                  <ShieldCheck className="h-4 w-4 text-emerald-200" />
                  Securite et verification
                </div>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68">
                  Les comptes vendeurs ne sont pas ouverts a tout le monde. Si
                  le seller est approuve, l&apos;utilisateur peut entrer dans
                  /vendeur. Sinon, il est renvoye vers /devenir-vendeur pour
                  terminer sa candidature.
                </p>
              </div>

              <div className="flex gap-3 lg:justify-end">
                <Link
                  href="/auth/signup?redirect=/vendeur"
                  className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-amber-300"
                >
                  Creer ma boutique
                </Link>
                <Link
                  href="/prix"
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Voir les prix
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
