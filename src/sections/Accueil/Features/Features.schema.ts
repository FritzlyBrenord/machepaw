import type { SectionSchema } from "@/lib/section-registry";

export const featuresSchema: SectionSchema = {
  name: "Features",
  type: "features",
  category: "content",
  description: "Bloc de benefices ou engagements",
  icon: "Layout",
  settings: [
    { id: "content.eyebrow", type: "text", label: "Eyebrow", default: "Nos Engagements" },
    { id: "content.title", type: "text", label: "Titre", default: "Pourquoi nous choisir" },
    {
      id: "content.subtitle",
      type: "textarea",
      label: "Sous-titre",
      default: "Nous nous engageons a vous offrir la meilleure experience d'achat",
    },
    {
      id: "config.layout",
      type: "select",
      label: "Layout",
      options: [
        { value: "grid", label: "Grid" },
        { value: "row", label: "Row" },
        { value: "list", label: "List" },
      ],
      default: "grid",
    },
    { id: "config.columns", type: "number", label: "Colonnes", min: 2, max: 4, default: 4 },
    {
      id: "config.showEyebrow",
      type: "checkbox",
      label: "Afficher l'eyebrow",
      default: true,
    },
    {
      id: "config.animation.hover",
      type: "select",
      label: "Effet au survol",
      options: [
        { value: "lift", label: "Lift" },
        { value: "scale", label: "Scale" },
        { value: "glow", label: "Glow" },
        { value: "none", label: "Aucun" },
      ],
      default: "lift",
    },
  ],
  blocks: [
    {
      type: "feature",
      name: "Features",
      itemsPath: "content.features",
      settings: [
        { id: "icon", type: "text", label: "Icone", default: "Truck" },
        { id: "title", type: "text", label: "Titre", default: "Livraison rapide" },
        {
          id: "description",
          type: "textarea",
          label: "Description",
          default: "Expedition soignee partout en France et a l'international.",
        },
      ],
    },
  ],
  maxBlocks: 12,
  defaults: {
    content: {
      title: "Pourquoi nous choisir",
      subtitle: "Nous nous engageons a vous offrir la meilleure experience d'achat",
      eyebrow: "Nos Engagements",
      features: [
        {
          icon: "Truck",
          title: "Livraison rapide",
          description: "Expedition soignee partout en France et a l'international.",
        },
        {
          icon: "Shield",
          title: "Paiement securise",
          description: "Transactions protegees et moyens de paiement fiables.",
        },
        {
          icon: "Headphones",
          title: "Support premium",
          description: "Une equipe disponible pour vous accompagner a chaque etape.",
        },
        {
          icon: "RotateCcw",
          title: "Retours simplifies",
          description: "Retour facile sous 30 jours sur une large selection.",
        },
      ],
    },
    config: {
      layout: "grid",
      columns: 4,
      showEyebrow: true,
      animation: {
        entrance: "fade-in",
        stagger: true,
        hover: "lift",
      },
    },
    style: {
      colors: {
        background: "secondary",
        text: "primary",
        accent: "accent",
      },
      spacing: {
        paddingY: "16",
        container: "contained",
        gap: "6",
      },
    },
    classes: {},
  },
};

export default featuresSchema;
