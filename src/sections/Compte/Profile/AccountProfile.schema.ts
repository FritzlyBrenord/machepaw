import type { SectionSchema } from "@/lib/section-registry";

export const accountProfileSchema: SectionSchema = {
  name: "Profil client",
  type: "accountProfile",
  category: "account",
  description: "Formulaire de profil client",
  icon: "UserRound",
  settings: [
    { id: "content.title", type: "text", label: "Titre", default: "Profil" },
    { id: "content.user.firstName", type: "text", label: "Prénom", default: "Jean" },
    { id: "content.user.lastName", type: "text", label: "Nom", default: "Dupont" },
    { id: "content.user.email", type: "text", label: "Email", default: "jean.dupont@email.com" },
    { id: "content.user.phone", type: "text", label: "Téléphone", default: "+33 6 12 34 56 78" },
    { id: "content.user.avatar", type: "image", label: "Avatar", default: "" },
    { id: "content.labels.firstName", type: "text", label: "Label prénom", default: "Prénom" },
    { id: "content.labels.lastName", type: "text", label: "Label nom", default: "Nom" },
    { id: "content.labels.email", type: "text", label: "Label email", default: "Email" },
    { id: "content.labels.phone", type: "text", label: "Label téléphone", default: "Téléphone" },
    { id: "content.labels.saveButton", type: "text", label: "Bouton enregistrer", default: "Enregistrer" },
    { id: "config.showAvatar", type: "checkbox", label: "Afficher l'avatar", default: true },
    { id: "config.editable", type: "checkbox", label: "Éditable", default: true },
    {
      id: "config.animation.entrance",
      type: "select",
      label: "Animation",
      options: [
        { value: "fade-in", label: "Fade in" },
        { value: "slide-up", label: "Slide up" },
        { value: "scale-in", label: "Scale in" },
        { value: "none", label: "Aucune" },
      ],
      default: "fade-in",
    },
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
  blocks: [],
  defaults: {
    content: {
      title: "Profil",
      user: {
        firstName: "Jean",
        lastName: "Dupont",
        email: "jean.dupont@email.com",
        phone: "+33 6 12 34 56 78",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      },
      labels: {
        firstName: "Prénom",
        lastName: "Nom",
        email: "Email",
        phone: "Téléphone",
        saveButton: "Enregistrer",
      },
    },
    config: {
      showAvatar: true,
      editable: true,
      animation: { entrance: "fade-in" },
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

export default accountProfileSchema;
