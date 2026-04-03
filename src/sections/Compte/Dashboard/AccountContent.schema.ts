import type { SectionSchema } from "@/lib/section-registry";

export const accountContentSchema: SectionSchema = {
  name: "Compte client compact",
  type: "accountContent",
  category: "account",
  description: "Wrapper compact du compte client avec sections configurables",
  icon: "LayoutPanelTop",
  settings: [
    { id: "content.title", type: "text", label: "Titre", default: "Mon Compte" },
    {
      id: "content.subtitle",
      type: "textarea",
      label: "Sous-titre",
      default: "Gerez vos informations et vos commandes",
    },
    { id: "config.showStats", type: "checkbox", label: "Afficher les statistiques", default: true },
    { id: "config.showOrders", type: "checkbox", label: "Afficher les commandes", default: true },
    { id: "config.showAddresses", type: "checkbox", label: "Afficher les adresses", default: true },
    { id: "config.showProfile", type: "checkbox", label: "Afficher le profil", default: true },
    { id: "config.showLogout", type: "checkbox", label: "Afficher la déconnexion", default: true },
    { id: "config.enableAccountDelete", type: "checkbox", label: "Autoriser la suppression", default: true },
    { id: "style.colors.background", type: "color", label: "Fond", default: "#ffffff" },
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
      default: "contained",
    },
  ],
  blocks: [],
  defaults: {
    content: {
      title: "Mon Compte",
      subtitle: "Gerez vos informations et vos commandes",
    },
    config: {
      showStats: true,
      showOrders: true,
      showAddresses: true,
      showProfile: true,
      showLogout: true,
      enableAccountDelete: true,
    },
    style: {
      colors: {
        background: "#ffffff",
        text: "#1a1a1a",
        accent: "#c9a96e",
      },
      spacing: {
        paddingY: "16",
        container: "contained",
      },
    },
    classes: {},
  },
};

export default accountContentSchema;
