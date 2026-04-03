import type { SectionSchema } from "@/lib/section-registry";

export const searchBarSchema: SectionSchema = {
  name: "Search Bar",
  type: "searchBar",
  category: "content",
  description: "Barre de recherche avec suggestions populaires",
  icon: "Search",
  settings: [
    { id: "content.placeholder", type: "text", label: "Placeholder", default: "Rechercher..." },
    {
      id: "content.popularSearchesLabel",
      type: "text",
      label: "Label recherches",
      default: "Recherches populaires:",
    },
    {
      id: "content.popularSearches",
      type: "textarea",
      label: "Recherches populaires",
      default: "Robe\nSac\nMontre",
      info: "Une recherche par ligne.",
    },
    { id: "config.showFilters", type: "checkbox", label: "Afficher filtres", default: true },
    {
      id: "config.showPopularSearches",
      type: "checkbox",
      label: "Afficher recherches populaires",
      default: true,
    },
    {
      id: "config.size",
      type: "select",
      label: "Taille",
      options: [
        { value: "sm", label: "Small" },
        { value: "md", label: "Medium" },
        { value: "lg", label: "Large" },
      ],
      default: "md",
    },
    { id: "style.colors.background", type: "text", label: "Fond", default: "white" },
    { id: "style.colors.text", type: "text", label: "Texte", default: "primary" },
    { id: "style.colors.accent", type: "text", label: "Accent", default: "accent" },
    { id: "style.colors.border", type: "text", label: "Bordure", default: "#e5e5e5" },
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
  defaults: {
    content: {
      placeholder: "Rechercher...",
      popularSearchesLabel: "Recherches populaires:",
      popularSearches: "Robe\nSac\nMontre",
    },
    config: {
      showFilters: true,
      showPopularSearches: true,
      size: "md",
    },
    style: {
      colors: {
        background: "white",
        text: "primary",
        accent: "accent",
        border: "#e5e5e5",
      },
      spacing: {
        paddingY: "10",
        container: "contained",
      },
    },
  },
};

export default searchBarSchema;
