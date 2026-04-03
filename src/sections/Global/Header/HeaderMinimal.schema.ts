import type { SectionSchema } from "@/lib/section-registry";

export const headerMinimalSchema: SectionSchema = {
  name: "Header Minimal",
  type: "headerMinimal",
  category: "header",
  description: "Header minimal avec navigation et actions",
  icon: "PanelTop",
  settings: [
    { id: "content.brand", type: "text", label: "Nom de marque", default: "Votre Boutique" },
    { id: "content.logo", type: "image", label: "Logo", default: "" },
    {
      id: "config.showSearch",
      type: "checkbox",
      label: "Afficher recherche",
      default: true,
    },
    { id: "config.showCart", type: "checkbox", label: "Afficher panier", default: true },
    { id: "config.showAccount", type: "checkbox", label: "Afficher compte", default: true },
    { id: "config.transparent", type: "checkbox", label: "Transparent", default: false },
    { id: "config.sticky", type: "checkbox", label: "Sticky", default: true },
    {
      id: "config.animation.entrance",
      type: "select",
      label: "Animation",
      options: [
        { value: "fade-in", label: "Fade in" },
        { value: "slide-down", label: "Slide down" },
        { value: "none", label: "None" },
      ],
      default: "fade-in",
    },
    { id: "style.colors.background", type: "text", label: "Fond", default: "white" },
    { id: "style.colors.text", type: "text", label: "Texte", default: "primary" },
    { id: "style.colors.accent", type: "text", label: "Accent", default: "accent" },
    { id: "style.colors.border", type: "text", label: "Bordure", default: "#e5e5e5" },
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
      type: "navItem",
      name: "Lien de navigation",
      itemsPath: "content.navItems",
      settings: [
        { id: "label", type: "text", label: "Label", default: "Accueil" },
        { id: "href", type: "url", label: "Lien", default: "/" },
      ],
    },
  ],
  maxBlocks: 8,
  defaults: {
    content: {
      brand: "Votre Boutique",
      logo: "",
      navItems: [
        { label: "Accueil", href: "/" },
        { label: "Produits", href: "/produits" },
        { label: "A propos", href: "/a-propos" },
        { label: "Contact", href: "/contact" },
      ],
    },
    config: {
      showSearch: true,
      showCart: true,
      showAccount: true,
      transparent: false,
      sticky: true,
      animation: {
        entrance: "fade-in",
      },
    },
    style: {
      colors: {
        background: "white",
        text: "primary",
        accent: "accent",
        border: "#e5e5e5",
      },
      spacing: {
        paddingY: "4",
        container: "contained",
      },
    },
  },
};

export default headerMinimalSchema;
