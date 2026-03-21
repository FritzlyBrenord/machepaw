"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Award, Users, Globe, Clock, Heart, Sparkles } from "lucide-react";

const stats = [
  { icon: Clock, value: "170+", label: "Années d'excellence" },
  { icon: Users, value: "500+", label: "Artisans qualifiés" },
  { icon: Globe, value: "45", label: "Pays présents" },
  { icon: Heart, value: "2M+", label: "Clients satisfaits" },
];

const values = [
  {
    icon: Award,
    title: "Excellence",
    description: "Chaque pièce est créée selon les plus hauts standards de qualité, avec une attention méticuleuse aux détails."
  },
  {
    icon: Sparkles,
    title: "Innovation",
    description: "Nous combinons tradition et modernité pour créer des designs uniques et intemporels."
  },
  {
    icon: Heart,
    title: "Passion",
    description: "Notre amour pour l'artisanat se reflète dans chaque création que nous concevons."
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[60vh] flex items-center">
        <Image
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920"
          alt="L'atelier LUXE"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl text-white"
          >
            <span className="text-amber-400 text-sm uppercase tracking-[0.3em] mb-4 block">
              Notre Histoire
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light mb-6">
              L&apos;Excellence depuis 1850
            </h1>
            <p className="text-lg text-white/80">
              Une saga familiale de passion, d&apos;artisanat et de perfection.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-light text-neutral-900 mb-6">
                Une Tradition d&apos;Exception
              </h2>
              <div className="space-y-4 text-neutral-600 leading-relaxed">
                <p>
                  Fondée en 1850 à Paris par le maître joaillier Antoine Dubois, 
                  LUXE est née d&apos;une vision : créer des pièces d&apos;exception 
                  qui transcendent le temps. Ce qui a commencé comme un petit 
                  atelier familial est devenu une référence mondiale du luxe.
                </p>
                <p>
                  Pendant plus de 170 ans, nous avons préservé les techniques 
                  artisanales traditionnelles tout en embrassant l&apos;innovation. 
                  Chaque création LUXE raconte une histoire de passion, de 
                  précision et d&apos;excellence.
                </p>
                <p>
                  Aujourd&apos;hui, nos ateliers à Paris, Genève et Milan continuent 
                  de perpétuer cet héritage, formant une nouvelle génération 
                  d&apos;artisans qui portent notre savoir-faire vers de nouveaux sommets.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative aspect-square"
            >
              <Image
                src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800"
                alt="Savoir-faire LUXE"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <stat.icon className="w-8 h-8 mx-auto mb-4 text-amber-400" />
                <p className="text-4xl font-light mb-2">{stat.value}</p>
                <p className="text-white/60">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-amber-600 text-sm uppercase tracking-[0.2em] mb-4 block">
              Nos Valeurs
            </span>
            <h2 className="text-3xl md:text-4xl font-light text-neutral-900">
              Ce qui nous définit
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-8 bg-neutral-50"
              >
                <div className="w-16 h-16 bg-neutral-900 text-white flex items-center justify-center mx-auto mb-6">
                  <value.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-medium text-neutral-900 mb-4">
                  {value.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Craftsmanship */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1 relative aspect-[4/3]"
            >
              <Image
                src="https://images.unsplash.com/photo-1611591437281-460bfbe1220e?w=800"
                alt="Artisanat LUXE"
                fill
                className="object-cover"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <span className="text-amber-600 text-sm uppercase tracking-[0.2em] mb-4 block">
                Savoir-Faire
              </span>
              <h2 className="text-3xl md:text-4xl font-light text-neutral-900 mb-6">
                L&apos;Art de la Perfection
              </h2>
              <div className="space-y-4 text-neutral-600 leading-relaxed">
                <p>
                  Chaque pièce LUXE est le fruit de centaines d&apos;heures de travail 
                  minutieux. Nos maîtres artisans, formés pendant des années, 
                  maîtrisent des techniques ancestrales transmises de génération 
                  en génération.
                </p>
                <p>
                  Du dessin initial à la finition finale, chaque étape est réalisée 
                  avec une précision extrême. Nous utilisons uniquement les matériaux 
                  les plus nobles : or 18 carats, diamants certifiés, cuir italien 
                  premium, et soie naturelle.
                </p>
                <p>
                  Cette quête incessante de la perfection fait de chaque création 
                  LUXE un trésor intemporel, destiné à être transmis de père en fils.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sustainability */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="text-amber-600 text-sm uppercase tracking-[0.2em] mb-4 block">
              Engagement
            </span>
            <h2 className="text-3xl md:text-4xl font-light text-neutral-900 mb-6">
              Luxe Responsable
            </h2>
            <p className="text-neutral-600 leading-relaxed mb-8">
              Chez LUXE, nous croyons que le véritable luxe est durable. Nous nous 
              engageons à utiliser des matériaux éthiques, à réduire notre empreinte 
              carbone et à soutenir les communautés locales où nous opérons. 
              Chaque création est conçue pour durer une vie, voire plus.
            </p>
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-neutral-200">
              <div>
                <p className="text-2xl font-medium text-neutral-900 mb-2">100%</p>
                <p className="text-sm text-neutral-500">Matériaux éthiques</p>
              </div>
              <div>
                <p className="text-2xl font-medium text-neutral-900 mb-2">Zero</p>
                <p className="text-sm text-neutral-500">Déchet plastique</p>
              </div>
              <div>
                <p className="text-2xl font-medium text-neutral-900 mb-2">Carbon</p>
                <p className="text-sm text-neutral-500">Neutre depuis 2020</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
