import type { SectionSchema } from "@/lib/section-registry";

export const paymentMethodsSchema: SectionSchema = {
  name: "Moyens de paiement",
  type: "paymentMethods",
  category: "checkout",
  description: "Méthodes de paiement configurables",
  icon: "CreditCard",
  settings: [
    { id: "content.title", type: "text", label: "Titre", default: "Moyens de paiement" },
    { id: "content.securityLabel", type: "text", label: "Label sécurité", default: "Paiement sécurisé SSL" },
    { id: "config.showSecurityBadges", type: "checkbox", label: "Afficher le badge sécurité", default: true },
    { id: "config.layout", type: "select", label: "Disposition", options: [{ value: "list", label: "Liste" }, { value: "grid", label: "Grille" }], default: "list" },
    { id: "style.colors.background", type: "color", label: "Fond", default: "#ffffff" },
    { id: "style.colors.text", type: "color", label: "Texte", default: "#1a1a1a" },
    { id: "style.colors.accent", type: "color", label: "Accent", default: "#c9a96e" },
    { id: "style.colors.cardBg", type: "color", label: "Fond carte", default: "#ffffff" },
    { id: "style.colors.border", type: "color", label: "Bordure", default: "#e5e7eb" },
    { id: "style.spacing.paddingY", type: "number", label: "Padding vertical", default: 10, min: 0, max: 40 },
    {
      id: "style.spacing.container",
      type: "select",
      label: "Largeur",
      options: [
        { value: "full", label: "Pleine largeur" },
        { value: "contained", label: "Contenue" },
        { value: "narrow", label: "Étroit" },
      ],
      default: "narrow",
    },
  ],
  blocks: [
    {
      type: "method",
      name: "Méthode de paiement",
      itemsPath: "content.methods",
      settings: [
        { id: "id", type: "text", label: "ID", default: "card" },
        { id: "name", type: "text", label: "Nom", default: "Carte bancaire" },
        {
          id: "icon",
          type: "select",
          label: "Icône",
          options: [
            { value: "CreditCard", label: "CreditCard" },
            { value: "Wallet", label: "Wallet" },
            { value: "Smartphone", label: "Smartphone" },
            { value: "Calendar", label: "Calendar" },
          ],
          default: "CreditCard",
        },
        { id: "description", type: "textarea", label: "Description", default: "Visa, Mastercard, Amex" },
      ],
    },
  ],
  maxBlocks: 8,
  defaults: {
    content: {
      title: "Moyens de paiement",
      securityLabel: "Paiement sécurisé SSL",
      methods: [
        { id: "card", name: "Carte bancaire", icon: "CreditCard", description: "Visa, Mastercard, Amex" },
        { id: "paypal", name: "PayPal", icon: "Wallet", description: "Paiement sécurisé" },
        { id: "apple", name: "Apple Pay", icon: "Smartphone", description: "Paiement rapide" },
      ],
    },
    config: {
      showSecurityBadges: true,
      layout: "list",
    },
    style: {
      colors: {
        background: "#ffffff",
        text: "#1a1a1a",
        accent: "#c9a96e",
        cardBg: "#ffffff",
        border: "#e5e7eb",
      },
      spacing: {
        paddingY: "10",
        container: "narrow",
      },
    },
    classes: {},
  },
};

export default paymentMethodsSchema;
