import type { SectionSchema } from "@/lib/section-registry";

export const relatedProductsSchema: SectionSchema = {
  name: "Related Products",
  type: "relatedProducts",
  category: "product",
  description: "Bloc de produits similaires avec ajout panier",
  icon: "ShoppingBag",
  settings: [
    { id: "content.title", type: "text", label: "Titre", default: "Produits similaires" },
    { id: "config.columns", type: "number", label: "Colonnes", min: 2, max: 5, default: 4 },
    {
      id: "config.showAddToCart",
      type: "checkbox",
      label: "Afficher ajout panier",
      default: true,
    },
    { id: "config.showRating", type: "checkbox", label: "Afficher la note", default: true },
  ],
  blocks: [
    {
      type: "product",
      name: "Produits",
      itemsPath: "content.products",
      settings: [
        { id: "id", type: "text", label: "Identifiant", default: "1" },
        { id: "name", type: "text", label: "Nom", default: "Produit" },
        { id: "price", type: "number", label: "Prix", default: 99 },
        { id: "image", type: "image", label: "Image", default: "" },
        { id: "rating", type: "range", label: "Note", min: 0, max: 5, step: 0.1, default: 4.5 },
        { id: "category", type: "text", label: "Categorie", default: "" },
      ],
    },
  ],
  maxBlocks: 20,
  defaults: {
    content: {
      title: "Produits similaires",
      products: [
        {
          id: "1",
          name: "Produit 1",
          price: 99,
          image:
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
          rating: 4.5,
          category: "Montres",
        },
        {
          id: "2",
          name: "Produit 2",
          price: 149,
          image:
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
          rating: 4.8,
          category: "Audio",
        },
        {
          id: "3",
          name: "Produit 3",
          price: 79,
          image:
            "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop",
          rating: 4.2,
          category: "Lunettes",
        },
        {
          id: "4",
          name: "Produit 4",
          price: 199,
          image:
            "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=400&fit=crop",
          rating: 4.7,
          category: "Accessoires",
        },
      ],
    },
    config: {
      columns: 4,
      showAddToCart: true,
      showRating: true,
      animation: {
        entrance: "fade-in",
        stagger: true,
      },
    },
    style: {
      colors: {
        background: "white",
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

export default relatedProductsSchema;
