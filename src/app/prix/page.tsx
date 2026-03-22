"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, CreditCard, ShieldCheck, Sparkles } from "lucide-react";
import { MARKETING_STATS, PRICING_PLANS } from "@/data/marketing";

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

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <main className="relative overflow-hidden px-4 py-28 sm:px-6 lg:px-8 xl:px-12">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.16),_transparent_42%)]" />
          <div className="absolute left-1/2 top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-amber-400/12 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <SectionTitle
            eyebrow="Prix"
            title="Des offres claires pour lancer et structurer votre boutique."
            description="La plateforme privilegie la lisibilite: vous voyez ce qui est inclus, ce qui est operationnel aujourd'hui et ce qui reste reserve pour plus tard."
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
                    Indicateur
                  </span>
                </div>
                <div className="mt-6 text-3xl font-semibold text-white">{stat.value}</div>
                <p className="mt-1 text-sm font-medium text-white/90">{stat.label}</p>
                <p className="mt-3 text-sm leading-6 text-white/58">{stat.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {PRICING_PLANS.map((plan) => (
              <motion.div
                key={plan.name}
                whileHover={{ y: -6 }}
                className={`rounded-[1.75rem] border p-6 ${
                  plan.featured
                    ? "border-amber-300/50 bg-amber-300/10 shadow-2xl shadow-amber-300/10"
                    : "border-white/10 bg-white/[0.04]"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-white">{plan.name}</h2>
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
                  className="mt-7 inline-flex w-full items-center justify-center rounded-full border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  {plan.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <div className="flex items-center gap-3 text-sm font-medium text-white">
                <CreditCard className="h-4 w-4 text-amber-200" />
                Paiements operationnels aujourd'hui
              </div>
              <p className="mt-4 text-sm leading-7 text-white/68">
                MonCash manuel, NatCash manuel et paiement au magasin sont les
                seuls moyens activables en production. Les autres modes restent
                visibles comme options futures mais sont clairement marques
                comme non operationnels.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <div className="flex items-center gap-3 text-sm font-medium text-white">
                <ShieldCheck className="h-4 w-4 text-emerald-200" />
                Paiement au magasin
              </div>
              <p className="mt-4 text-sm leading-7 text-white/68">
                Ce mode reste reserve au retrait en boutique. Le vendeur valide
                d'abord la commande, puis confirme le paiement avant de remettre
                le colis au client.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
