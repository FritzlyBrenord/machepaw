import type { SectionSchema } from "@/lib/section-registry";

export const reviewsSchema: SectionSchema = {
  name: "Reviews",
  type: "reviews",
  category: "content",
  description: "Liste ou grille d'avis clients",
  icon: "Layout",
  settings: [
    { id: "content.title", type: "text", label: "Titre", default: "Avis clients" },
    { id: "config.showRating", type: "checkbox", label: "Afficher la note", default: true },
    { id: "config.showPhotos", type: "checkbox", label: "Afficher les photos", default: true },
    {
      id: "config.showVerifiedBadge",
      type: "checkbox",
      label: "Afficher le badge verifie",
      default: true,
    },
    { id: "config.showDate", type: "checkbox", label: "Afficher la date", default: true },
    {
      id: "config.layout",
      type: "select",
      label: "Layout",
      options: [
        { value: "list", label: "List" },
        { value: "grid", label: "Grid" },
      ],
      default: "list",
    },
    { id: "config.columns", type: "number", label: "Colonnes", min: 1, max: 2, default: 1 },
  ],
  blocks: [
    {
      type: "review",
      name: "Avis",
      itemsPath: "content.reviews",
      settings: [
        { id: "id", type: "text", label: "Identifiant", default: "1" },
        { id: "author", type: "text", label: "Auteur", default: "Client" },
        { id: "avatar", type: "image", label: "Avatar", default: "" },
        { id: "rating", type: "range", label: "Note", min: 1, max: 5, step: 1, default: 5 },
        { id: "date", type: "text", label: "Date", default: "Mars 2026" },
        { id: "content", type: "textarea", label: "Avis", default: "Une experience parfaite." },
        { id: "verified", type: "checkbox", label: "Verifie", default: true },
      ],
    },
  ],
  maxBlocks: 24,
  defaults: {
    content: {
      title: "Avis clients",
      reviews: [
        {
          id: "1",
          author: "Camille",
          avatar: "",
          rating: 5,
          date: "Mars 2026",
          content: "Une experience parfaite, livraison rapide et qualite au rendez-vous.",
          verified: true,
        },
        {
          id: "2",
          author: "Lucas",
          avatar: "",
          rating: 4,
          date: "Fevrier 2026",
          content: "Tres beau produit, conforme aux photos et bien emballe.",
          verified: true,
        },
      ],
    },
    config: {
      showRating: true,
      showPhotos: true,
      showVerifiedBadge: true,
      showDate: true,
      layout: "list",
      columns: 1,
      animation: {
        entrance: "fade-in",
        stagger: true,
      },
    },
    style: {
      colors: {
        background: "secondary",
        text: "primary",
        accent: "accent",
        cardBg: "white",
      },
      spacing: {
        paddingY: "16",
        container: "contained",
        gap: "6",
      },
    },
    classes: {},
  },
};

export default reviewsSchema;
