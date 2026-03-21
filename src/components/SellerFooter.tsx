"use client";

import Link from "next/link";
import { HelpCircle, MessageCircle, FileText, Shield } from "lucide-react";

const footerLinks = [
  { name: "Aide vendeur", href: "/aide-vendeurs", icon: HelpCircle },
  { name: "Support", href: "/support", icon: MessageCircle },
  { name: "Conditions", href: "/cgv", icon: FileText },
  { name: "Sécurité", href: "/securite", icon: Shield },
];

export function SellerFooter() {
  return (
    <footer className="bg-white border-t border-neutral-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <span>© 2025 LUXE</span>
            <span className="text-neutral-300">|</span>
            <span>Espace Vendeur</span>
          </div>

          <div className="flex items-center gap-6">
            {footerLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                <link.icon className="w-4 h-4" />
                {link.name}
              </Link>
            ))}
          </div>

          <Link
            href="/"
            className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            Retour au site principal →
          </Link>
        </div>
      </div>
    </footer>
  );
}
