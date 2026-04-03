import type { SectionSchema } from "@/lib/section-registry";

export const checkoutSummarySchema: SectionSchema = {
  name: "Résumé de commande",
  type: "checkoutSummary",
  category: "checkout",
  description: "Résumé des articles et des totaux",
  icon: "Receipt",
  settings: [
    { id: "content.title", type: "text", label: "Titre", default: "Résumé de la commande" },
    { id: "content.editLabel", type: "text", label: "Label modifier", default: "Modifier" },
    { id: "content.subtotalLabel", type: "text", label: "Sous-total", default: "Sous-total" },
    { id: "content.shippingLabel", type: "text", label: "Livraison", default: "Livraison" },
    { id: "content.discountLabel", type: "text", label: "Réduction", default: "Réduction" },
    { id: "content.totalLabel", type: "text", label: "Total", default: "Total" },
    { id: "content.subtotal", type: "number", label: "Sous-total valeur", default: 0 },
    { id: "content.shipping", type: "number", label: "Livraison valeur", default: 0 },
    { id: "content.discount", type: "number", label: "Réduction valeur", default: 0 },
    { id: "content.total", type: "number", label: "Total valeur", default: 0 },
    { id: "config.showItemImages", type: "checkbox", label: "Afficher les images", default: true },
    { id: "config.editable", type: "checkbox", label: "Modifiable", default: true },
    { id: "config.showDiscount", type: "checkbox", label: "Afficher la réduction", default: true },
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
      type: "item",
      name: "Article",
      itemsPath: "content.items",
      settings: [
        { id: "id", type: "text", label: "ID", default: "item-1" },
        { id: "name", type: "text", label: "Nom", default: "Produit" },
        { id: "image", type: "image", label: "Image", default: "" },
        { id: "quantity", type: "number", label: "Quantité", default: 1 },
        { id: "price", type: "number", label: "Prix", default: 0 },
      ],
    },
  ],
  maxBlocks: 12,
  defaults: {
    content: {
      title: "Résumé de la commande",
      editLabel: "Modifier",
      subtotalLabel: "Sous-total",
      shippingLabel: "Livraison",
      discountLabel: "Réduction",
      totalLabel: "Total",
      items: [
        { id: "item-1", name: "Produit", image: "", quantity: 1, price: 0 },
      ],
      subtotal: 0,
      shipping: 0,
      discount: 0,
      total: 0,
    },
    config: {
      showItemImages: true,
      editable: true,
      showDiscount: true,
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

export default checkoutSummarySchema;
