import type { SectionSchema } from "@/lib/section-registry";

export const atelierNoteSchema: SectionSchema = {
  name: "Atelier Note",
  type: "atelierNote",
  category: "content",
  description: "Bloc editorial compact pour valider la decouverte automatique.",
  icon: "Sparkles",
  settings: [
    {
      id: "content.badge",
      type: "text",
      label: "Badge",
      default: "Atelier prive",
    },
    {
      id: "content.title",
      type: "text",
      label: "Titre",
      default: "Une ligne pensee pour durer",
    },
    {
      id: "content.description",
      type: "textarea",
      label: "Description",
      default:
        "Un bloc editorial simple pour verifier le rendu automatique dans le premier template.",
    },
    {
      id: "content.ctaText",
      type: "text",
      label: "Texte CTA",
      default: "Decouvrir",
    },
    {
      id: "content.ctaLink",
      type: "url",
      label: "Lien CTA",
      default: "/produits",
    },
    {
      id: "content.note",
      type: "text",
      label: "Note",
      default: "Edition limitee",
    },
    {
      id: "config.layout",
      type: "select",
      label: "Disposition",
      options: [
        { value: "left", label: "Gauche" },
        { value: "center", label: "Centre" },
      ],
      default: "left",
    },
    {
      id: "config.showAccentLine",
      type: "checkbox",
      label: "Afficher la ligne d'accent",
      default: true,
    },
    {
      id: "style.colors.background",
      type: "color",
      label: "Fond",
      default: "#f7f5f0",
    },
    {
      id: "style.colors.text",
      type: "color",
      label: "Texte",
      default: "#0c0c0c",
    },
    {
      id: "style.colors.accent",
      type: "color",
      label: "Accent",
      default: "#c5a572",
    },
    {
      id: "style.spacing.paddingY",
      type: "select",
      label: "Padding vertical",
      options: [
        { value: "12", label: "Confort" },
        { value: "16", label: "Large" },
        { value: "20", label: "XL" },
      ],
      default: "16",
    },
    {
      id: "style.spacing.container",
      type: "select",
      label: "Largeur",
      options: [
        { value: "full", label: "Pleine largeur" },
        { value: "contained", label: "Contenue" },
        { value: "narrow", label: "Etroite" },
      ],
      default: "contained",
    },
  ],
  blocks: [],
  defaults: {
    content: {
      badge: "Atelier prive",
      title: "Une ligne pensee pour durer",
      description:
        "Un bloc editorial simple pour verifier le rendu automatique dans le premier template.",
      ctaText: "Decouvrir",
      ctaLink: "/produits",
      note: "Edition limitee",
    },
    config: {
      layout: "left",
      showAccentLine: true,
    },
    style: {
      colors: {
        background: "#f7f5f0",
        text: "#0c0c0c",
        accent: "#c5a572",
      },
      spacing: {
        paddingY: "16",
        container: "contained",
      },
    },
    classes: {},
  },
};

export default atelierNoteSchema;
