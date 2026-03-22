"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { SITE_MODELS } from "@/data/marketing";

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

export default function ModelsPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <main className="relative overflow-hidden px-4 py-28 sm:px-6 lg:px-8 xl:px-12">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.16),_transparent_42%)]" />
          <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <SectionTitle
            eyebrow="Modeles"
            title="Choisissez le style de votre boutique avant de passer en production."
            description="Chaque modele a un objectif clair: vendre plus vite, raconter mieux votre marque ou mettre en avant l'espace vendeur et la conversion."
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
                    <h2 className="text-2xl font-semibold">{model.name}</h2>
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
                  className={`mt-7 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
                    model.accent.includes("white")
                      ? "bg-neutral-950 text-white hover:bg-neutral-800"
                      : "border border-white/12 bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  Explorer ce modele
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-semibold text-white">
              Un modele, puis un flux vendeur propre.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/68">
              Le design n&apos;est pas seulement decoratif. Il aide le client a
              comprendre plus vite la boutique, les modeles de paiement, le
              retrait en magasin et la maniere de suivre ses commandes.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
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
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
