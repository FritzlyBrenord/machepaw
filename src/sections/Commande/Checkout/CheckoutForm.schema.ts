import type { SectionSchema } from "@/lib/section-registry";

export const checkoutFormSchema: SectionSchema = {
  name: "Formulaire de commande",
  type: "checkoutForm",
  category: "checkout",
  description: "Formulaire de commande avec progression",
  icon: "CreditCard",
  settings: [
    { id: "content.title", type: "text", label: "Titre", default: "Paiement" },
    {
      id: "content.steps",
      type: "textarea",
      label: "Étapes",
      default: "Livraison\nPaiement\nConfirmation",
      info: "Une ligne par étape.",
    },
    { id: "config.currentStep", type: "number", label: "Étape active", default: 1, min: 1, max: 10 },
    { id: "config.showSteps", type: "checkbox", label: "Afficher les étapes", default: true },
    { id: "style.colors.background", type: "color", label: "Fond", default: "#f5f5f5" },
    { id: "style.colors.text", type: "color", label: "Texte", default: "#1a1a1a" },
    { id: "style.colors.accent", type: "color", label: "Accent", default: "#c9a96e" },
    { id: "style.spacing.paddingY", type: "number", label: "Padding vertical", default: 16, min: 0, max: 40 },
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
  blocks: [],
  defaults: {
    content: {
      title: "Paiement",
      steps: "Livraison\nPaiement\nConfirmation",
    },
    config: {
      currentStep: 1,
      showSteps: true,
    },
    style: {
      colors: {
        background: "#f5f5f5",
        text: "#1a1a1a",
        accent: "#c9a96e",
      },
      spacing: {
        paddingY: "16",
        container: "narrow",
      },
    },
    classes: {},
  },
};

export default checkoutFormSchema;
