"use client";

import Link from "next/link";
import {
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
  ArrowUp,
} from "lucide-react";
import { categories } from "@/data";

const footerLinks = {
  customerService: [
    { name: "Contact", href: "/contact" },
    { name: "FAQ", href: "/faq" },
    { name: "Livraison & Retours", href: "/livraison" },
    { name: "Suivi de commande", href: "/profil" },
    { name: "Guide", href: "/guide" },
  ],
  about: [
    { name: "Notre approche", href: "/a-propos" },
    { name: "Prix", href: "/prix" },
    { name: "Modeles", href: "/modeles" },
    { name: "Comment ca marche", href: "/devenir-vendeur" },
  ],
  sell: [
    { name: "Creer ma boutique", href: "/auth/signup?redirect=/vendeur" },
    { name: "Espace Vendeur", href: "/vendeur" },
    { name: "Aide vendeurs", href: "/aide-vendeurs" },
  ],
  legal: [
    { name: "Mentions Legales", href: "/mentions-legales" },
    { name: "CGV", href: "/cgv" },
    { name: "Politique de Confidentialite", href: "/confidentialite" },
    { name: "Politique de Cookies", href: "/cookies" },
  ],
};

const socialLinks = [
  { name: "Instagram", icon: Instagram, href: "#" },
  { name: "Facebook", icon: Facebook, href: "#" },
  { name: "Twitter", icon: Twitter, href: "#" },
  { name: "Youtube", icon: Youtube, href: "#" },
];

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-neutral-950 text-white">
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-light mb-2">
                Recevez nos conseils vendeur et nouveautes
              </h3>
              <p className="text-white/60">
                Des idees pour lancer une boutique plus propre, mieux equipee et
                plus facile a gerer au quotidien.
              </p>
            </div>
            <form className="flex gap-4">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-white/50"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-white text-neutral-900 font-medium hover:bg-neutral-100 transition-colors"
              >
                S&apos;inscrire
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="inline-block">
              <h2 className="text-3xl font-light tracking-[0.2em] mb-6">
                LUXE
              </h2>
            </Link>
            <p className="text-white/60 text-sm mb-6 max-w-xs">
              Une plateforme boutique premium pour creer, vendre et suivre des
              commandes dans un cadre propre, isole et professionnel.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm uppercase tracking-wider mb-6">Collections</h4>
            <ul className="space-y-3">
              {categories.slice(0, 5).map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/collection/${category.slug}`}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm uppercase tracking-wider mb-6">
              Service Client
            </h4>
            <ul className="space-y-3">
              {footerLinks.customerService.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm uppercase tracking-wider mb-6">A propos</h4>
            <ul className="space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm uppercase tracking-wider mb-6">Vendre</h4>
            <ul className="space-y-3">
              {footerLinks.sell.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm uppercase tracking-wider mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-white/40 shrink-0 mt-0.5" />
                <span className="text-sm text-white/60">
                  Support vendeur en ligne
                  <br />
                  Espace digital premium
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-white/40" />
                <a
                  href="tel:+0000000000"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  +00 00 00 00 00
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-white/40" />
                <a
                  href="mailto:support@luxe.com"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  support@luxe.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/40">
              © 2026 LUXE. Tous droits reserves.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm text-white/40 hover:text-white transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
            >
              Retour en haut
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
