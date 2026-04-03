import type { SectionSchema } from "@/lib/section-registry";

export const breadcrumbSchema: SectionSchema = {
  name: "Breadcrumb",
  type: "breadcrumb",
  category: "content",
  description: "Fil d'Ariane avec variantes et navigation retour",
  icon: "Layout",
  settings: [
    { id: "content.homeLabel", type: "text", label: "Label accueil", default: "Accueil" },
    {
      id: "content.separator",
      type: "select",
      label: "Séparateur",
      options: [
        { value: "chevron", label: "Chevron" },
        { value: "slash", label: "Slash" },
        { value: "arrow", label: "Arrow" },
      ],
      default: "chevron",
    },
    { id: "content.backLabel", type: "text", label: "Label retour", default: "Retour" },
    {
      id: "content.showHomeIcon",
      type: "checkbox",
      label: "Icône accueil",
      default: true,
    },
    {
      id: "config.variant",
      type: "select",
      label: "Variant",
      options: [
        { value: "default", label: "Default" },
        { value: "minimal", label: "Minimal" },
        { value: "with-back", label: "With back" },
      ],
      default: "default",
    },
    { id: "config.showHome", type: "checkbox", label: "Afficher accueil", default: true },
    { id: "config.clickable", type: "checkbox", label: "Cliquable", default: true },
    { id: "config.maxItems", type: "number", label: "Max items", default: 5, min: 2, max: 10, step: 1 },
    { id: "style.colors.background", type: "text", label: "Fond", default: "transparent" },
    { id: "style.colors.text", type: "text", label: "Texte", default: "muted" },
    { id: "style.colors.accent", type: "text", label: "Accent", default: "accent" },
    { id: "style.colors.separator", type: "text", label: "Séparateur", default: "" },
    { id: "style.spacing.paddingY", type: "text", label: "Padding Y", default: "4" },
    {
      id: "style.spacing.container",
      type: "select",
      label: "Container",
      options: [
        { value: "full", label: "Full" },
        { value: "contained", label: "Contained" },
        { value: "narrow", label: "Narrow" },
      ],
      default: "contained",
    },
  ],
  blocks: [
    {
      type: "breadcrumbItem",
      name: "Item",
      itemsPath: "items",
      settings: [
        { id: "label", type: "text", label: "Label", default: "Produit" },
        { id: "link", type: "url", label: "Lien", default: "/produit" },
      ],
    },
  ],
  maxBlocks: 8,
  defaults: {
    items: [
      { label: "Produit", link: "/produit" },
    ],
    content: {
      homeLabel: "Accueil",
      separator: "chevron",
      backLabel: "Retour",
      showHomeIcon: true,
    },
    config: {
      variant: "default",
      showHome: true,
      clickable: true,
      maxItems: 5,
    },
    style: {
      colors: {
        background: "transparent",
        text: "muted",
        accent: "accent",
        separator: "",
      },
      spacing: {
        paddingY: "4",
        container: "contained",
      },
    },
  },
};

export default breadcrumbSchema;
