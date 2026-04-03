import type { SectionSchema } from "@/lib/section-registry";

export const wishlistSchema: SectionSchema = {
  name: "Liste de souhaits",
  type: "wishlist",
  category: "account",
  description: "Grille des produits favoris",
  icon: "Heart",
  settings: [
    { id: "content.title", type: "text", label: "Titre", default: "Ma Liste de Souhaits" },
    { id: "content.emptyMessage", type: "textarea", label: "Message vide", default: "Votre liste de souhaits est vide" },
    { id: "content.addToCartText", type: "text", label: "Bouton panier", default: "Ajouter au panier" },
    { id: "content.removeText", type: "text", label: "Bouton retirer", default: "Retirer" },
    { id: "config.columns", type: "select", label: "Colonnes", options: [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }], default: "4" },
    { id: "config.showAddToCart", type: "checkbox", label: "Afficher le bouton panier", default: true },
    { id: "config.showRemove", type: "checkbox", label: "Afficher le bouton retirer", default: true },
    { id: "config.showStockStatus", type: "checkbox", label: "Afficher le stock", default: true },
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
  blocks: [
    {
      type: "product",
      name: "Produit favori",
      itemsPath: "content.products",
      settings: [
        { id: "id", type: "text", label: "ID", default: "10" },
        { id: "name", type: "text", label: "Nom", default: "Produit Favori" },
        { id: "price", type: "number", label: "Prix", default: 129 },
        { id: "oldPrice", type: "number", label: "Ancien prix", default: 149 },
        { id: "image", type: "image", label: "Image", default: "" },
        { id: "inStock", type: "checkbox", label: "En stock", default: true },
      ],
    },
  ],
  maxBlocks: 12,
  defaults: {
    content: {
      title: "Ma Liste de Souhaits",
      emptyMessage: "Votre liste de souhaits est vide",
      addToCartText: "Ajouter au panier",
      removeText: "Retirer",
      products: [
        { id: "10", name: "Produit Favori 1", price: 129, image: "", inStock: true },
      ],
    },
    config: {
      columns: 4,
      showAddToCart: true,
      showRemove: true,
      showStockStatus: true,
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

export default wishlistSchema;
