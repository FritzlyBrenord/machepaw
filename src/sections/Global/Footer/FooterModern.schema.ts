import type { SectionSchema } from "@/lib/section-registry";

const socialPlatformOptions = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "twitter", label: "Twitter" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "pinterest", label: "Pinterest" },
];

export const footerModernSchema: SectionSchema = {
  name: "Footer Modern",
  type: "footerModern",
  category: "footer",
  description: "Footer moderne avec colonnes, newsletter et contact",
  icon: "LayoutTemplate",
  settings: [
    { id: "content.logo.type", type: "select", label: "Type logo", options: [{ value: "text", label: "Texte" }, { value: "image", label: "Image" }, { value: "svg", label: "SVG" }], default: "text" },
    { id: "content.logo.text", type: "text", label: "Texte logo", default: "Votre Boutique" },
    { id: "content.logo.image", type: "image", label: "Image logo", default: "" },
    { id: "content.logo.letterSpacing", type: "text", label: "Espacement logo", default: "0.02em" },
    { id: "content.description", type: "textarea", label: "Description", default: "Votre boutique, partout." },
    {
      id: "content.newsletter.enabled",
      type: "checkbox",
      label: "Newsletter active",
      default: true,
    },
    { id: "content.newsletter.title", type: "text", label: "Titre newsletter", default: "Newsletter" },
    {
      id: "content.newsletter.description",
      type: "textarea",
      label: "Description newsletter",
      default: "Recevez nos nouveautés et offres exclusives.",
    },
    { id: "content.newsletter.placeholder", type: "text", label: "Placeholder email", default: "Votre email" },
    { id: "content.newsletter.buttonText", type: "text", label: "Texte bouton", default: "S'inscrire" },
    { id: "content.copyright", type: "text", label: "Copyright", default: `© ${new Date().getFullYear()} Votre Boutique` },
    { id: "content.contactInfo.title", type: "text", label: "Titre contact", default: "Restons en contact" },
    { id: "content.contactInfo.address", type: "text", label: "Adresse", default: "" },
    { id: "content.contactInfo.phone", type: "text", label: "Téléphone", default: "" },
    { id: "content.contactInfo.email", type: "text", label: "Email", default: "" },
    {
      id: "config.variant",
      type: "select",
      label: "Variant",
      options: [
        { value: "asymmetric", label: "Asymmetric" },
        { value: "grid-4", label: "Grid 4" },
        { value: "minimal", label: "Minimal" },
        { value: "centered", label: "Centered" },
        { value: "newsletter-top", label: "Newsletter top" },
      ],
      default: "asymmetric",
    },
    { id: "config.columnsRatio", type: "text", label: "Ratio colonnes", default: "2:1:1" },
    { id: "config.showNewsletter", type: "checkbox", label: "Afficher newsletter", default: true },
    { id: "config.showSocial", type: "checkbox", label: "Afficher social", default: true },
    { id: "config.showPayment", type: "checkbox", label: "Afficher paiement", default: false },
    { id: "style.colors.background", type: "text", label: "Fond", default: "primary" },
    { id: "style.colors.text", type: "text", label: "Texte", default: "white" },
    { id: "style.colors.accent", type: "text", label: "Accent", default: "accent" },
    { id: "style.colors.border", type: "text", label: "Bordure", default: "" },
    { id: "style.spacing.paddingY", type: "text", label: "Padding Y", default: "16" },
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
      type: "footerColumn",
      name: "Colonne",
      itemsPath: "content.columns",
      settings: [
        { id: "title", type: "text", label: "Titre", default: "Navigation" },
        {
          id: "links",
          type: "textarea",
          label: "Liens",
          default: "Accueil|/\nProduits|/produits",
          info: "Format: Label|/lien, une ligne par lien.",
        },
      ],
    },
    {
      type: "footerSocialLink",
      name: "Réseau social",
      itemsPath: "content.social",
      settings: [
        {
          id: "platform",
          type: "select",
          label: "Plateforme",
          options: socialPlatformOptions,
          default: "instagram",
        },
        { id: "url", type: "url", label: "URL", default: "" },
      ],
    },
    {
      type: "footerLegalLink",
      name: "Lien légal",
      itemsPath: "content.legalLinks",
      settings: [
        { id: "label", type: "text", label: "Label", default: "Mentions légales" },
        { id: "href", type: "url", label: "Lien", default: "/mentions-legales" },
      ],
    },
  ],
  maxBlocks: 12,
  defaults: {
    content: {
      logo: {
        type: "text",
        text: "Votre Boutique",
        letterSpacing: "0.02em",
      },
      description: "Votre boutique, partout.",
      columns: [
        {
          title: "Boutique",
          links: "Accueil|/\nProduits|/produits",
        },
      ],
      newsletter: {
        enabled: true,
        title: "Newsletter",
        description: "Recevez nos nouveautés et offres exclusives.",
        placeholder: "Votre email",
        buttonText: "S'inscrire",
      },
      social: [
        { platform: "instagram", url: "https://instagram.com/" },
        { platform: "facebook", url: "https://facebook.com/" },
      ],
      copyright: `© ${new Date().getFullYear()} Votre Boutique`,
      legalLinks: [
        { label: "Mentions légales", href: "/mentions-legales" },
        { label: "Confidentialité", href: "/confidentialite" },
      ],
      contactInfo: {
        title: "Restons en contact",
        address: "",
        phone: "",
        email: "",
      },
    },
    config: {
      variant: "asymmetric",
      columnsRatio: "2:1:1",
      showNewsletter: true,
      showSocial: true,
      showPayment: false,
    },
    style: {
      colors: {
        background: "primary",
        text: "white",
        accent: "accent",
        border: "",
      },
      spacing: {
        paddingY: "16",
        container: "contained",
      },
    },
  },
};

export default footerModernSchema;
