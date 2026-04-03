import type { SectionSchema } from "@/lib/section-registry";

export const promoBarSchema: SectionSchema = {
  name: "Promo Bar",
  type: "promoBar",
  category: "content",
  description: "Barre promotionnelle compacte",
  icon: "Megaphone",
  settings: [
    {
      id: "content.text",
      type: "text",
      label: "Texte",
      default: "Offre speciale : -20% sur votre premiere commande !",
    },
    { id: "content.buttonText", type: "text", label: "Texte bouton", default: "" },
    { id: "content.buttonLink", type: "url", label: "Lien bouton", default: "" },
    {
      id: "config.showCloseButton",
      type: "checkbox",
      label: "Afficher le bouton fermer",
      default: true,
    },
    { id: "config.closable", type: "checkbox", label: "Barre fermable", default: true },
    {
      id: "config.align",
      type: "select",
      label: "Alignement",
      options: [
        { value: "left", label: "Gauche" },
        { value: "center", label: "Centre" },
        { value: "right", label: "Droite" },
      ],
      default: "center",
    },
  ],
  blocks: [],
  defaults: {
    content: {
      text: "Offre speciale : -20% sur votre premiere commande !",
      buttonText: "",
      buttonLink: "",
    },
    config: {
      showCloseButton: true,
      closable: true,
      align: "center",
    },
    style: {
      colors: {
        background: "accent",
        text: "black",
        accent: "primary",
      },
      spacing: {
        paddingY: "4",
        container: "contained",
      },
    },
    classes: {},
  },
};

export default promoBarSchema;
