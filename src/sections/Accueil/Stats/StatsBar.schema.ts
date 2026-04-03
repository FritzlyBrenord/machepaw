import type { SectionSchema } from "@/lib/section-registry";

export const statsBarSchema: SectionSchema = {
  name: "Stats Bar",
  type: "statsBar",
  category: "content",
  description: "Barre de chiffres cles et indicateurs",
  icon: "Layout",
  settings: [
    { id: "content.animated", type: "checkbox", label: "Compteurs animes", default: true },
    {
      id: "config.variant",
      type: "select",
      label: "Variant",
      options: [
        { value: "horizontal", label: "Horizontal" },
        { value: "grid-3", label: "Grid 3" },
        { value: "grid-4", label: "Grid 4" },
        { value: "cards", label: "Cards" },
        { value: "minimal", label: "Minimal" },
      ],
      default: "horizontal",
    },
    {
      id: "config.divider",
      type: "checkbox",
      label: "Afficher les separateurs",
      default: true,
    },
    { id: "config.columns", type: "number", label: "Colonnes", min: 2, max: 6, default: 4 },
  ],
  blocks: [
    {
      type: "stat",
      name: "Stats",
      itemsPath: "content.items",
      settings: [
        { id: "value", type: "text", label: "Valeur", default: "1987" },
        { id: "label", type: "text", label: "Label", default: "Fondation" },
        { id: "prefix", type: "text", label: "Prefixe", default: "" },
        { id: "suffix", type: "text", label: "Suffixe", default: "" },
        { id: "icon", type: "text", label: "Icone", default: "" },
      ],
    },
  ],
  maxBlocks: 12,
  defaults: {
    content: {
      animated: true,
      items: [
        { value: "1987", label: "Fondation" },
        { value: "38", suffix: "+", label: "Pays livres" },
        { value: "100", suffix: "%", label: "Matieres premium" },
        { value: "4200", suffix: "+", label: "Pieces creees" },
      ],
    },
    config: {
      variant: "horizontal",
      divider: true,
      columns: 4,
      animation: {
        entrance: "slide-up",
        stagger: true,
      },
    },
    style: {
      colors: {
        background: "secondary",
        text: "primary",
        accent: "accent",
      },
      typography: {
        valueSize: "3xl",
        labelSize: "xs",
        textTransform: "uppercase",
        textAlign: "center",
      },
      spacing: {
        paddingY: "12",
        container: "contained",
        gap: "8",
      },
    },
    classes: {},
  },
};

export default statsBarSchema;
