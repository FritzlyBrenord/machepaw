import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BadgeCheck,
  Clock3,
  CreditCard,
  Layers3,
  LayoutGrid,
  Rocket,
  ShieldCheck,
  Smartphone,
  Store,
  Sparkles,
  Truck,
  Users,
  Workflow,
} from "lucide-react";

export type MarketingLink = {
  href: string;
  label: string;
};

export type MarketingStat = {
  icon: LucideIcon;
  value: string;
  label: string;
  detail: string;
};

export type MarketingCard = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export type MarketingStep = {
  step: string;
  title: string;
  description: string;
};

export type PricingPlan = {
  name: string;
  price: string;
  tag: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  featured?: boolean;
};

export type SiteModel = {
  name: string;
  accent: string;
  description: string;
  features: string[];
  href: string;
};

export const MARKETING_NAV_LINKS: MarketingLink[] = [
  { href: "/collection", label: "Catalogue" },
  { href: "/prix", label: "Prix" },
  { href: "/modeles", label: "Modeles" },
  { href: "/a-propos", label: "A propos" },
];

export const MARKETING_STATS: MarketingStat[] = [
  {
    icon: ShieldCheck,
    value: "100%",
    label: "isolation boutique",
    detail: "Chaque seller reste dans son espace, ses commandes et ses clients.",
  },
  {
    icon: CreditCard,
    value: "3",
    label: "paiements actifs",
    detail: "MonCash manuel, NatCash manuel et paiement au magasin.",
  },
  {
    icon: Clock3,
    value: "24h",
    label: "mise en route",
    detail: "Compte, email confirme et dossier vendeur proprement enchaînes.",
  },
  {
    icon: LayoutGrid,
    value: "1",
    label: "dashboard clair",
    detail: "Produits, commandes, clients, paiements et statuts au meme endroit.",
  },
];

export const PLATFORM_FEATURES: MarketingCard[] = [
  {
    icon: Store,
    title: "Boutique premium",
    description:
      "Une vitrine sobre, elegante et mobile-first pour presenter vos produits de facon professionnelle.",
  },
  {
    icon: Workflow,
    title: "Flux vendeur clair",
    description:
      "Le vendeur confirme, prepare, expedie ou remet la commande sans confondre les etapes.",
  },
  {
    icon: BadgeCheck,
    title: "Verification vendeur",
    description:
      "Un compte vendeur approuve donne acces a l'espace vendeur, sinon le parcours de candidature prend le relais.",
  },
  {
    icon: BarChart3,
    title: "Suivi en temps reel",
    description:
      "Commandes, clients et performances restent visibles pour piloter votre boutique sans perdre le fil.",
  },
];

export const SELLER_STEPS: MarketingStep[] = [
  {
    step: "01",
    title: "Creer un compte",
    description:
      "L'utilisateur ouvre d'abord son compte avec son email et son mot de passe.",
  },
  {
    step: "02",
    title: "Confirmer l'email",
    description:
      "La confirmation email protege l'acces et prepare la boutique pour les prochains etapes.",
  },
  {
    step: "03",
    title: "Se connecter",
    description:
      "Une fois connecte, le parcours vendeur est personnalise selon le statut du compte.",
  },
  {
    step: "04",
    title: "Verifier le statut seller",
    description:
      "Si le compte vendeur est approuve, l'acces est ouvert automatiquement vers /vendeur.",
  },
  {
    step: "05",
    title: "Sinon devenir vendeur",
    description:
      "Si le vendeur n'est pas encore approuve, il est redirige vers la candidature vendeur.",
  },
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    name: "Lancement",
    price: "Sur devis",
    tag: "Pour demarrer proprement",
    description:
      "Un socle simple pour ouvrir une boutique, publier vos produits et recevoir vos premieres commandes.",
    features: [
      "Page boutique premium",
      "Catalogue produit",
      "Commandes et suivi client",
      "Validation vendeur",
    ],
    cta: "Creer ma boutique",
    href: "/auth/signup?redirect=/vendeur",
  },
  {
    name: "Boutique Pro",
    price: "Sur devis",
    tag: "Le plus choisi",
    description:
      "Pour les vendeurs qui veulent un tunnel de commande propre, des paiements locaux et un pilotage plus fin.",
    features: [
      "Paiements manuels actifs",
      "Retrait en magasin",
      "Statuts vendeur clairs",
      "Fiches de retrait telechargeables",
    ],
    cta: "Voir les modeles",
    href: "/modeles",
    featured: true,
  },
  {
    name: "Scale",
    price: "Sur devis",
    tag: "Pour le volume",
    description:
      "Pour les boutiques qui veulent structurer leur offre, suivre les performances et garder une image premium.",
    features: [
      "Dashboard avance",
      "Controle des commandes",
      "Reporting et suivi",
      "Support prioritaire",
    ],
    cta: "Parler a l'equipe",
    href: "/auth/signup?redirect=/vendeur",
  },
];

export const SITE_MODELS: SiteModel[] = [
  {
    name: "Dark Boutique",
    accent: "bg-neutral-950 text-white",
    description:
      "Hero sombre, typo premium et blocs editoriaux pour mettre en valeur une marque plus forte.",
    features: [
      "Hero cinematic",
      "Sections texte + chiffres",
      "CTA vendeur visible",
      "Compatible mobile",
    ],
    href: "/auth/signup?redirect=/vendeur",
  },
  {
    name: "Catalogue Chic",
    accent: "bg-white text-neutral-900",
    description:
      "Une vitrine plus commerciale, ideale pour montrer beaucoup de produits avec une lecture rapide.",
    features: [
      "Grilles produits",
      "Filtres rapides",
      "Sections collections",
      "Navigation simple",
    ],
    href: "/collection",
  },
  {
    name: "Studio Vendeur",
    accent: "bg-slate-900 text-white",
    description:
      "Un modele centre sur le vendeur, ses performances, ses paiements et la confiance client.",
    features: [
      "Narration de marque",
      "Etapes d'onboarding",
      "Focus conversion",
      "Appel a l'action direct",
    ],
    href: "/auth/signup?redirect=/vendeur",
  },
];

export const HERO_SUPPORT_POINTS = [
  "Boutiques separees et securisees",
  "Paiements locaux visibles au checkout",
  "Candidature vendeur avant acces complet",
  "Tracking client et vendeur synchronise",
] as const;

export const PLATFORM_PILLARS: MarketingCard[] = [
  {
    icon: Rocket,
    title: "Lancement rapide",
    description:
      "Le vendeur suit un parcours clair: inscription, verification, puis acces a l'espace vendeur.",
  },
  {
    icon: Truck,
    title: "Livraison et retrait",
    description:
      "La boutique peut gerer la livraison ou le retrait en magasin avec des regles compatibles.",
  },
  {
    icon: Smartphone,
    title: "Experience mobile",
    description:
      "Les clients peuvent acheter, suivre leurs commandes et telecharger leurs recus sur mobile.",
  },
  {
    icon: Layers3,
    title: "Isolation stricte",
    description:
      "Chaque boutique reste isolee des autres pour garder les produits, clients et commandes bien separés.",
  },
];
