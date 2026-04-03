import type { SectionSchema } from "@/lib/section-registry";

export const orderHistorySchema: SectionSchema = {
  name: "Historique commandes",
  type: "orderHistory",
  category: "account",
  description: "Liste des commandes passées",
  icon: "Package",
  settings: [
    { id: "content.title", type: "text", label: "Titre", default: "Historique des commandes" },
    { id: "content.statusLabels.pending", type: "text", label: "Statut en attente", default: "En attente" },
    { id: "content.statusLabels.processing", type: "text", label: "Statut préparation", default: "En préparation" },
    { id: "content.statusLabels.shipped", type: "text", label: "Statut expédiée", default: "Expédiée" },
    { id: "content.statusLabels.delivered", type: "text", label: "Statut livrée", default: "Livrée" },
    { id: "content.statusLabels.cancelled", type: "text", label: "Statut annulée", default: "Annulée" },
    { id: "config.showOrderDetails", type: "checkbox", label: "Afficher le détail", default: true },
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
    { id: "config.animation.stagger", type: "checkbox", label: "Stagger", default: true },
    { id: "style.colors.background", type: "color", label: "Fond", default: "#f5f5f5" },
    { id: "style.colors.text", type: "color", label: "Texte", default: "#1a1a1a" },
    { id: "style.colors.accent", type: "color", label: "Accent", default: "#c9a96e" },
    { id: "style.colors.cardBg", type: "color", label: "Fond carte", default: "#ffffff" },
    { id: "style.colors.border", type: "color", label: "Bordure", default: "#e5e7eb" },
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
  blocks: [
    {
      type: "order",
      name: "Commande",
      itemsPath: "content.orders",
      settings: [
        { id: "id", type: "text", label: "ID", default: "CMD-001" },
        { id: "orderNumber", type: "text", label: "Numéro", default: "CMD-001" },
        { id: "date", type: "text", label: "Date", default: "2024-01-15" },
        { id: "total", type: "number", label: "Total", default: 248 },
        {
          id: "status",
          type: "select",
          label: "Statut",
          options: [
            { value: "pending", label: "En attente" },
            { value: "processing", label: "En préparation" },
            { value: "shipped", label: "Expédiée" },
            { value: "delivered", label: "Livrée" },
            { value: "cancelled", label: "Annulée" },
          ],
          default: "delivered",
        },
        { id: "items", type: "number", label: "Articles", default: 2 },
      ],
    },
  ],
  maxBlocks: 12,
  defaults: {
    content: {
      title: "Historique des commandes",
      orders: [
        { id: "CMD-001", orderNumber: "CMD-001", date: "2024-01-15", status: "delivered", total: 248, items: 2 },
        { id: "CMD-002", orderNumber: "CMD-002", date: "2024-01-05", status: "shipped", total: 149, items: 1 },
        { id: "CMD-003", orderNumber: "CMD-003", date: "2023-12-20", status: "delivered", total: 325, items: 3 },
      ],
      statusLabels: {
        pending: "En attente",
        processing: "En préparation",
        shipped: "Expédiée",
        delivered: "Livrée",
        cancelled: "Annulée",
      },
    },
    config: {
      showOrderDetails: true,
      animation: {
        entrance: "fade-in",
        stagger: true,
      },
    },
    style: {
      colors: {
        background: "#f5f5f5",
        text: "#1a1a1a",
        accent: "#c9a96e",
        cardBg: "#ffffff",
        border: "#e5e7eb",
      },
      spacing: {
        paddingY: "16",
        container: "contained",
      },
    },
    classes: {},
  },
};

export default orderHistorySchema;
