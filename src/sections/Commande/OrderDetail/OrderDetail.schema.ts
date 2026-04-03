import type { SectionSchema } from "@/lib/section-registry";

export const orderDetailSchema: SectionSchema = {
  name: "Détail de commande",
  type: "orderDetail",
  category: "checkout",
  description: "Détail complet d'une commande",
  icon: "Receipt",
  settings: [
    { id: "styles.backgroundColor", type: "color", label: "Fond", default: "#ffffff" },
    { id: "styles.textColor", type: "color", label: "Texte", default: "#1a1a1a" },
    { id: "styles.accentColor", type: "color", label: "Accent", default: "#c9a96e" },
    { id: "styles.paddingY", type: "number", label: "Padding vertical", default: 60, min: 0, max: 200 },
  ],
  blocks: [],
  defaults: {
    styles: {
      backgroundColor: "#ffffff",
      textColor: "#1a1a1a",
      accentColor: "#c9a96e",
      paddingY: 60,
    },
  },
};

export default orderDetailSchema;
