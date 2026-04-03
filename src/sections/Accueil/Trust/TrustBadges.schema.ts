import type { SectionSchema } from "@/lib/section-registry";

export const trustBadgesSchema: SectionSchema = {
  name: "Trust Badges",
  type: "trustBadges",
  category: "content",
  description: "Badges de confiance et reassurance",
  icon: "Layout",
  settings: [
    {
      id: "config.variant",
      type: "select",
      label: "Variant",
      options: [
        { value: "row-divided", label: "Row divided" },
        { value: "row-compact", label: "Row compact" },
        { value: "grid-3", label: "Grid 3" },
        { value: "grid-4", label: "Grid 4" },
        { value: "cards", label: "Cards" },
        { value: "minimal", label: "Minimal" },
      ],
      default: "row-divided",
    },
    {
      id: "config.divider",
      type: "checkbox",
      label: "Afficher les separateurs",
      default: true,
    },
    { id: "config.columns", type: "number", label: "Colonnes", min: 2, max: 4, default: 4 },
  ],
  blocks: [
    {
      type: "badge",
      name: "Badges",
      itemsPath: "content.badges",
      settings: [
        { id: "icon", type: "text", label: "Icone", default: "Truck" },
        { id: "title", type: "text", label: "Titre", default: "Livraison rapide" },
        { id: "description", type: "textarea", label: "Description", default: "" },
      ],
    },
  ],
  maxBlocks: 12,
  defaults: {
    content: {
      badges: [
        {
          icon: "Truck",
          title: "Livraison rapide",
          description: "Expedition soignee et suivie.",
        },
        {
          icon: "Shield",
          title: "Paiement securise",
          description: "Transactions protegees.",
        },
        {
          icon: "RotateCcw",
          title: "Retours faciles",
          description: "Retour simplifie sous 30 jours.",
        },
        {
          icon: "Headphones",
          title: "Support premium",
          description: "Une equipe a votre ecoute.",
        },
      ],
    },
    config: {
      variant: "row-divided",
      divider: true,
      columns: 4,
      animation: {
        entrance: "fade-in",
        stagger: true,
      },
    },
    style: {
      colors: {
        background: "secondary",
        text: "primary",
        accent: "accent",
      },
      spacing: {
        paddingY: "12",
        container: "contained",
        gap: "6",
      },
      effects: {
        overlay: true,
      },
    },
    classes: {},
  },
};

export default trustBadgesSchema;
