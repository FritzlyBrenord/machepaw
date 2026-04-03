import type { SectionSchema } from "@/lib/section-registry";

const socialPlatformOptions = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "twitter", label: "Twitter" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "pinterest", label: "Pinterest" },
];

export const footerMinimalSchema: SectionSchema = {
  name: "Footer Minimal",
  type: "footerMinimal",
  category: "footer",
  description: "Footer simple avec liens, social et copyright",
  icon: "LayoutTemplate",
  settings: [
    { id: "content.brand", type: "text", label: "Marque", default: "Votre Boutique" },
    { id: "content.tagline", type: "textarea", label: "Tagline", default: "Votre succès, notre mission" },
    {
      id: "content.copyright",
      type: "text",
      label: "Copyright",
      default: `© ${new Date().getFullYear()} Tous droits réservés.`,
    },
    { id: "config.showSocialLinks", type: "checkbox", label: "Afficher social", default: true },
    { id: "config.showLinks", type: "checkbox", label: "Afficher liens", default: true },
    {
      id: "config.showCopyright",
      type: "checkbox",
      label: "Afficher copyright",
      default: true,
    },
    {
      id: "config.animation.entrance",
      type: "select",
      label: "Animation",
      options: [
        { value: "fade-in", label: "Fade in" },
        { value: "slide-up", label: "Slide up" },
        { value: "scale-in", label: "Scale in" },
        { value: "none", label: "None" },
      ],
      default: "fade-in",
    },
    { id: "style.colors.background", type: "text", label: "Fond", default: "primary" },
    { id: "style.colors.text", type: "text", label: "Texte", default: "white" },
    { id: "style.colors.accent", type: "text", label: "Accent", default: "accent" },
    { id: "style.colors.border", type: "text", label: "Bordure", default: "#333333" },
    { id: "style.spacing.paddingY", type: "text", label: "Padding Y", default: "10" },
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
      type: "footerLink",
      name: "Lien",
      itemsPath: "content.links",
      settings: [
        { id: "label", type: "text", label: "Label", default: "Accueil" },
        { id: "href", type: "url", label: "Lien", default: "/" },
      ],
    },
    {
      type: "footerSocialLink",
      name: "Lien social",
      itemsPath: "content.socialLinks",
      settings: [
        {
          id: "platform",
          type: "select",
          label: "Plateforme",
          options: socialPlatformOptions,
          default: "instagram",
        },
        { id: "href", type: "url", label: "URL", default: "" },
      ],
    },
  ],
  maxBlocks: 8,
  defaults: {
    content: {
      brand: "Votre Boutique",
      tagline: "Votre succès, notre mission",
      copyright: `© ${new Date().getFullYear()} Tous droits réservés.`,
      links: [
        { label: "Accueil", href: "/" },
        { label: "Produits", href: "/produits" },
      ],
      socialLinks: [
        { platform: "instagram", href: "https://instagram.com/" },
      ],
    },
    config: {
      showSocialLinks: true,
      showLinks: true,
      showCopyright: true,
      animation: {
        entrance: "fade-in",
      },
    },
    style: {
      colors: {
        background: "primary",
        text: "white",
        accent: "accent",
        border: "#333333",
      },
      spacing: {
        paddingY: "10",
        container: "contained",
      },
    },
  },
};

export default footerMinimalSchema;
