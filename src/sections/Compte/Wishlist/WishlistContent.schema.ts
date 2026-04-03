import type { SectionSchema } from "@/lib/section-registry";

export const wishlistContentSchema: SectionSchema = {
  name: "Wishlist contenu",
  type: "wishlistContent",
  category: "account",
  description: "Bloc de favoris alimenté par le store",
  icon: "Heart",
  settings: [
    { id: "content.title", type: "text", label: "Titre", default: "Mes Favoris" },
    {
      id: "content.emptyMessage",
      type: "textarea",
      label: "Message vide",
      default: "Votre liste de favoris est vide. Ajoutez des produits pour les retrouver ici.",
    },
    { id: "content.emptyButtonLabel", type: "text", label: "Bouton vide", default: "Découvrir les produits" },
    { id: "content.addToCartLabel", type: "text", label: "Bouton panier", default: "Ajouter au panier" },
    { id: "content.removeLabel", type: "text", label: "Bouton retirer", default: "Retirer" },
    { id: "config.variant", type: "select", label: "Mise en page", options: [{ value: "grid", label: "Grid" }, { value: "list", label: "List" }, { value: "compact", label: "Compact" }], default: "grid" },
    { id: "config.columns", type: "select", label: "Colonnes", options: [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }], default: "4" },
    { id: "config.showEmptyState", type: "checkbox", label: "Afficher l'état vide", default: true },
    { id: "config.showRemoveButton", type: "checkbox", label: "Afficher retirer", default: true },
    { id: "config.showAddToCart", type: "checkbox", label: "Afficher ajouter au panier", default: true },
    { id: "config.enableAnimations", type: "checkbox", label: "Animations", default: true },
    { id: "style.colors.background", type: "color", label: "Fond", default: "#ffffff" },
    { id: "style.colors.text", type: "color", label: "Texte", default: "#1a1a1a" },
    { id: "style.colors.accent", type: "color", label: "Accent", default: "#c9a96e" },
    { id: "style.colors.cardBg", type: "color", label: "Fond carte", default: "#ffffff" },
    { id: "style.colors.border", type: "color", label: "Bordure", default: "#e5e7eb" },
    { id: "style.spacing.paddingY", type: "number", label: "Padding vertical", default: 16, min: 0, max: 40 },
    { id: "style.spacing.gap", type: "number", label: "Espacement grille", default: 6, min: 0, max: 20 },
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
      title: "Mes Favoris",
      emptyMessage: "Votre liste de favoris est vide. Ajoutez des produits pour les retrouver ici.",
      emptyButtonLabel: "Découvrir les produits",
      addToCartLabel: "Ajouter au panier",
      removeLabel: "Retirer",
    },
    config: {
      variant: "grid",
      columns: 4,
      showEmptyState: true,
      showRemoveButton: true,
      showAddToCart: true,
      enableAnimations: true,
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
        paddingY: "16",
        container: "contained",
        gap: "6",
      },
    },
    classes: {},
  },
};

export default wishlistContentSchema;
