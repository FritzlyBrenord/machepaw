import type { SectionSchema } from "@/lib/section-registry";

export const collectionHeroSchema: SectionSchema = {
  name: "Collection Hero",
  type: "collectionHero",
  category: "collection",
  description: "Hero de collection avec image de fond",
  icon: "Image",
  settings: [
    { id: "content.eyebrow", type: "text", label: "Eyebrow", default: "Catalogue" },
    { id: "content.title", type: "text", label: "Titre", default: "Nouvelle Collection" },
    { id: "content.subtitle", type: "textarea", label: "Sous-titre", default: "" },
    { id: "content.image", type: "image", label: "Image de fond", default: "" },
    {
      id: "config.overlayOpacity",
      type: "range",
      label: "Opacite overlay",
      min: 0,
      max: 1,
      step: 0.05,
      default: 0.45,
    },
    { id: "config.minHeight", type: "text", label: "Hauteur minimum", default: "400px" },
    { id: "config.showEyebrow", type: "checkbox", label: "Afficher l'eyebrow", default: true },
  ],
  blocks: [],
  defaults: {
    content: {
      title: "Nouvelle Collection",
      subtitle: "",
      eyebrow: "Catalogue",
      image: "",
    },
    config: {
      overlayOpacity: 0.45,
      minHeight: "400px",
      showEyebrow: true,
      animation: {
        entrance: "fade-in",
      },
    },
    style: {
      colors: {
        background: "primary",
        text: "white",
        accent: "accent",
      },
      spacing: {
        paddingY: "16",
        container: "contained",
      },
    },
    classes: {},
  },
};

export default collectionHeroSchema;
