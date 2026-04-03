import type { SectionSchema } from "@/lib/section-registry";

const messageOptions = [
  { value: "truck", label: "Truck" },
  { value: "rotateCcw", label: "Rotate" },
  { value: "sparkles", label: "Sparkles" },
  { value: "tag", label: "Tag" },
  { value: "clock", label: "Clock" },
  { value: "gift", label: "Gift" },
  { value: "star", label: "Star" },
];

export const announcementBarSchema: SectionSchema = {
  name: "Announcement Bar",
  type: "announcementBar",
  category: "content",
  description: "Bandeau d'annonce avec rotation, marquee et dismiss",
  icon: "Megaphone",
  settings: [
    { id: "content.autoRotate", type: "checkbox", label: "Rotation auto", default: true },
    { id: "content.interval", type: "number", label: "Intervalle (ms)", default: 5000, min: 1000, max: 20000, step: 500 },
    { id: "content.dismissible", type: "checkbox", label: "Dismissible", default: false },
    {
      id: "content.icon",
      type: "select",
      label: "Icône",
      options: messageOptions,
      default: "sparkles",
    },
    {
      id: "config.variant",
      type: "select",
      label: "Variant",
      options: [
        { value: "default", label: "Default" },
        { value: "minimal", label: "Minimal" },
        { value: "rotating", label: "Rotating" },
        { value: "marquee", label: "Marquee" },
      ],
      default: "default",
    },
    {
      id: "config.layout",
      type: "select",
      label: "Disposition",
      options: [
        { value: "center", label: "Center" },
        { value: "slider", label: "Slider" },
        { value: "split", label: "Split" },
      ],
      default: "center",
    },
    { id: "config.showCloseButton", type: "checkbox", label: "Bouton fermer", default: false },
    { id: "config.showNavigation", type: "checkbox", label: "Navigation", default: true },
    { id: "config.showDots", type: "checkbox", label: "Points", default: false },
    { id: "style.colors.background", type: "text", label: "Fond", default: "primary" },
    { id: "style.colors.text", type: "text", label: "Texte", default: "white" },
    { id: "style.colors.accent", type: "text", label: "Accent", default: "accent" },
    {
      id: "style.typography.textTransform",
      type: "select",
      label: "Casse",
      options: [
        { value: "uppercase", label: "Uppercase" },
        { value: "lowercase", label: "Lowercase" },
        { value: "capitalize", label: "Capitalize" },
      ],
      default: "uppercase",
    },
    {
      id: "style.typography.fontSize",
      type: "select",
      label: "Taille",
      options: [
        { value: "xs", label: "XS" },
        { value: "sm", label: "SM" },
        { value: "base", label: "Base" },
      ],
      default: "sm",
    },
    { id: "style.spacing.paddingY", type: "text", label: "Padding Y", default: "3" },
    {
      id: "style.spacing.container",
      type: "select",
      label: "Container",
      options: [
        { value: "full", label: "Full" },
        { value: "contained", label: "Contained" },
        { value: "narrow", label: "Narrow" },
      ],
      default: "full",
    },
  ],
  blocks: [
    {
      type: "announcementMessage",
      name: "Message",
      itemsPath: "content.messages",
      settings: [
        { id: "text", type: "textarea", label: "Texte", default: "Livraison gratuite dès 100€" },
        { id: "link", type: "url", label: "Lien", default: "" },
        {
          id: "icon",
          type: "select",
          label: "Icône",
          options: messageOptions,
          default: "truck",
        },
      ],
    },
  ],
  maxBlocks: 8,
  defaults: {
    content: {
      messages: [{ text: "Livraison gratuite dès 100€", icon: "truck" }],
      autoRotate: true,
      interval: 5000,
      dismissible: false,
      icon: "sparkles",
    },
    config: {
      variant: "default",
      layout: "center",
      showCloseButton: false,
      showNavigation: true,
      showDots: false,
    },
    style: {
      colors: {
        background: "primary",
        text: "white",
        accent: "accent",
      },
      typography: {
        textTransform: "uppercase",
        fontSize: "sm",
      },
      spacing: {
        paddingY: "3",
        container: "full",
      },
    },
  },
};

export default announcementBarSchema;
