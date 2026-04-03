import type { SectionSchema } from "@/lib/section-registry";

export const editorialSchema: SectionSchema = {
  name: "Editorial",
  type: "editorial",
  category: "content",
  description: "Section editoriale texte image avec citations et CTA",
  icon: "Layout",
  settings: [
    { id: "content.eyebrow.text", type: "text", label: "Eyebrow", default: "Notre histoire" },
    {
      id: "content.eyebrow.style",
      type: "select",
      label: "Style eyebrow",
      options: [
        { value: "none", label: "Aucun" },
        { value: "line", label: "Line" },
        { value: "pill", label: "Pill" },
        { value: "badge", label: "Badge" },
      ],
      default: "line",
    },
    { id: "content.title", type: "text", label: "Titre", default: "Une section editoriale" },
    {
      id: "content.body",
      type: "richtext",
      label: "Texte",
      default: "Racontez votre marque, votre savoir-faire et vos engagements.",
    },
    { id: "content.quote.text", type: "textarea", label: "Citation", default: "" },
    { id: "content.quote.author", type: "text", label: "Auteur citation", default: "" },
    { id: "content.quote.role", type: "text", label: "Role citation", default: "" },
    {
      id: "content.media.type",
      type: "select",
      label: "Type media",
      options: [{ value: "image", label: "Image" }],
      default: "image",
    },
    { id: "content.media.src", type: "image", label: "Image", default: "" },
    { id: "content.media.alt", type: "text", label: "Alt image", default: "" },
    {
      id: "content.media.aspectRatio",
      type: "select",
      label: "Ratio image",
      options: [
        { value: "1/1", label: "1/1" },
        { value: "16/9", label: "16/9" },
        { value: "4/5", label: "4/5" },
        { value: "3/4", label: "3/4" },
      ],
      default: "3/4",
    },
    {
      id: "content.media.frame.enabled",
      type: "checkbox",
      label: "Cadre decoratif",
      default: false,
    },
    { id: "content.media.frame.border", type: "text", label: "Epaisseur cadre", default: "2" },
    { id: "content.media.frame.color", type: "color", label: "Couleur cadre", default: "#c9a96e" },
    { id: "content.media.frame.offset", type: "text", label: "Offset cadre", default: "4" },
    {
      id: "config.variant",
      type: "select",
      label: "Variant",
      options: [
        { value: "text-image", label: "Text image" },
        { value: "image-text", label: "Image text" },
        { value: "text-over", label: "Text over" },
        { value: "full-bleed", label: "Full bleed" },
        { value: "sticky-image", label: "Sticky image" },
        { value: "collage", label: "Collage" },
      ],
      default: "text-image",
    },
    {
      id: "config.ratio",
      type: "select",
      label: "Ratio texte image",
      options: [
        { value: "50:50", label: "50:50" },
        { value: "40:60", label: "40:60" },
        { value: "60:40", label: "60:40" },
      ],
      default: "50:50",
    },
    {
      id: "config.verticalAlign",
      type: "select",
      label: "Alignement vertical",
      options: [
        { value: "top", label: "Haut" },
        { value: "center", label: "Centre" },
        { value: "bottom", label: "Bas" },
      ],
      default: "center",
    },
  ],
  blocks: [
    {
      type: "cta",
      name: "CTA",
      itemsPath: "content.cta",
      settings: [
        { id: "text", type: "text", label: "Texte", default: "Decouvrir" },
        { id: "href", type: "url", label: "Lien", default: "/produits" },
        {
          id: "style",
          type: "select",
          label: "Style",
          options: [
            { value: "solid", label: "Solid" },
            { value: "outline", label: "Outline" },
            { value: "underline", label: "Underline" },
            { value: "text", label: "Text" },
          ],
          default: "underline",
        },
        { id: "icon", type: "checkbox", label: "Afficher icone", default: true },
      ],
    },
  ],
  maxBlocks: 6,
  defaults: {
    content: {
      eyebrow: { text: "Notre histoire", style: "line" },
      title: "Une section editoriale",
      body: "Racontez votre marque, votre savoir-faire et vos engagements.",
      quote: {
        text: "",
        author: "",
        role: "",
      },
      cta: [{ text: "Decouvrir", href: "/produits", style: "underline", icon: true }],
      media: {
        type: "image",
        src: "",
        alt: "",
        aspectRatio: "3/4",
        frame: {
          enabled: false,
          border: "2",
          color: "#c9a96e",
          offset: "4",
        },
      },
    },
    config: {
      variant: "text-image",
      ratio: "50:50",
      verticalAlign: "center",
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
        titleSize: "4xl",
        titleWeight: "semibold",
        titleLineHeight: "tight",
        textAlign: "left",
      },
      spacing: {
        paddingY: "16",
        container: "contained",
        gap: "10",
      },
    },
    classes: {},
  },
};

export default editorialSchema;
