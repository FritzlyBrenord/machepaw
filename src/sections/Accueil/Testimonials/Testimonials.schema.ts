import type { SectionSchema } from "@/lib/section-registry";

export const testimonialsSchema: SectionSchema = {
  name: "Testimonials",
  type: "testimonials",
  category: "content",
  description: "Temoignages clients en grille ou slider",
  icon: "Layout",
  settings: [
    { id: "content.title", type: "text", label: "Titre", default: "Ils nous font confiance" },
    { id: "content.subtitle", type: "textarea", label: "Sous-titre", default: "" },
    {
      id: "config.variant",
      type: "select",
      label: "Variant",
      options: [
        { value: "slider", label: "Slider" },
        { value: "single", label: "Single" },
        { value: "grid-2", label: "Grid 2" },
        { value: "grid-3", label: "Grid 3" },
        { value: "grid-4", label: "Grid 4" },
        { value: "masonry", label: "Masonry" },
      ],
      default: "slider",
    },
    {
      id: "config.quoteStyle",
      type: "select",
      label: "Style citation",
      options: [
        { value: "normal", label: "Normal" },
        { value: "italic", label: "Italic" },
        { value: "serif", label: "Serif" },
        { value: "large", label: "Large" },
      ],
      default: "normal",
    },
    { id: "config.showQuotes", type: "checkbox", label: "Afficher les quotes", default: true },
    { id: "config.showAvatar", type: "checkbox", label: "Afficher l'avatar", default: true },
    { id: "config.showRating", type: "checkbox", label: "Afficher la note", default: true },
    { id: "config.autoplay", type: "checkbox", label: "Autoplay", default: true },
    { id: "config.interval", type: "number", label: "Intervalle", min: 1000, max: 20000, default: 7000 },
    {
      id: "config.showNavigation",
      type: "checkbox",
      label: "Afficher la navigation",
      default: true,
    },
    { id: "config.showDots", type: "checkbox", label: "Afficher les dots", default: false },
  ],
  blocks: [
    {
      type: "testimonial",
      name: "Temoignages",
      itemsPath: "content.testimonials",
      settings: [
        { id: "quote", type: "textarea", label: "Citation", default: "Une excellente experience." },
        { id: "author", type: "text", label: "Auteur", default: "Client" },
        { id: "role", type: "text", label: "Role", default: "" },
        { id: "avatar", type: "image", label: "Avatar", default: "" },
        { id: "rating", type: "range", label: "Note", min: 1, max: 5, step: 1, default: 5 },
      ],
    },
  ],
  maxBlocks: 20,
  defaults: {
    content: {
      title: "Ils nous font confiance",
      subtitle: "Des temoignages authentiques qui parlent de notre exigence.",
      testimonials: [
        {
          quote: "Une qualite remarquable et un service irreprochable du debut a la fin.",
          author: "Sarah",
          role: "Cliente fidele",
          avatar: "",
          rating: 5,
        },
        {
          quote: "Le packaging, la finition et l'experience globale sont vraiment premium.",
          author: "Thomas",
          role: "Acheteur",
          avatar: "",
          rating: 5,
        },
        {
          quote: "J'ai retrouve exactement l'univers de marque que je cherchais.",
          author: "Lea",
          role: "Collectionneuse",
          avatar: "",
          rating: 4,
        },
      ],
    },
    config: {
      variant: "slider",
      quoteStyle: "normal",
      showQuotes: true,
      showAvatar: true,
      showRating: true,
      autoplay: true,
      interval: 7000,
      showNavigation: true,
      showDots: false,
      loop: true,
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
      },
      typography: {
        titleSize: "4xl",
        textAlign: "center",
      },
      spacing: {
        paddingY: "16",
        container: "contained",
      },
    },
    classes: {},
  },
};

export default testimonialsSchema;
