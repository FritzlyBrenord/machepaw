import type { SectionSchema } from "@/lib/section-registry";

export const countdownSchema: SectionSchema = {
  name: "Countdown",
  type: "countdown",
  category: "content",
  description: "Compte a rebours promotionnel avec CTA",
  icon: "Timer",
  settings: [
    { id: "content.title", type: "text", label: "Titre", default: "Offre Limitee" },
    {
      id: "content.subtitle",
      type: "textarea",
      label: "Sous-titre",
      default: "Profitez de notre promotion avant qu'il ne soit trop tard !",
    },
    { id: "content.buttonText", type: "text", label: "Texte bouton", default: "" },
    { id: "content.buttonLink", type: "url", label: "Lien bouton", default: "" },
    { id: "content.endDate", type: "text", label: "Date de fin ISO", default: "" },
    { id: "content.labels.days", type: "text", label: "Label jours", default: "Jours" },
    { id: "content.labels.hours", type: "text", label: "Label heures", default: "Heures" },
    { id: "content.labels.minutes", type: "text", label: "Label minutes", default: "Minutes" },
    { id: "content.labels.seconds", type: "text", label: "Label secondes", default: "Secondes" },
    { id: "config.showLabels", type: "checkbox", label: "Afficher les labels", default: true },
    { id: "config.showButton", type: "checkbox", label: "Afficher le bouton", default: true },
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
  ],
  blocks: [],
  defaults: {
    content: {
      title: "Offre Limitee",
      subtitle: "Profitez de notre promotion avant qu'il ne soit trop tard !",
      buttonText: "",
      buttonLink: "",
      endDate: "",
      labels: {
        days: "Jours",
        hours: "Heures",
        minutes: "Minutes",
        seconds: "Secondes",
      },
    },
    config: {
      showLabels: true,
      showButton: true,
      size: "md",
    },
    style: {
      colors: {
        background: "accent",
        text: "black",
        accent: "primary",
      },
      spacing: {
        paddingY: "16",
        container: "narrow",
      },
    },
    classes: {},
  },
};

export default countdownSchema;
