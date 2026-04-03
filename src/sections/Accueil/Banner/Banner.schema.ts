import type { SectionSchema } from "@/lib/section-registry";

export const bannerSchema: SectionSchema = {
  name: "Banner",
  type: "banner",
  category: "content",
  description: "Banniere promotionnelle personnalisable avec image et CTA",
  icon: "Image",
  settings: [
    { id: "content.title", type: "text", label: "Titre", default: "Nouvelle Collection" },
    {
      id: "content.subtitle",
      type: "textarea",
      label: "Sous-titre",
      default: "Decouvrez nos nouveaux produits exclusifs",
    },
    { id: "content.image", type: "image", label: "Image", default: "" },
    { id: "content.ctaText", type: "text", label: "Texte CTA", default: "Decouvrir" },
    { id: "content.ctaLink", type: "url", label: "Lien CTA", default: "/products" },
    
    // Visibility Settings
    { id: "content.showTitle", type: "checkbox", label: "Afficher le titre", default: true },
    { id: "content.showSubtitle", type: "checkbox", label: "Afficher le sous-titre", default: true },
    { id: "content.showImage", type: "checkbox", label: "Afficher l'image", default: true },
    { id: "content.showCta", type: "checkbox", label: "Afficher le CTA", default: true },
    
    // Header Typography Settings
    {
      id: "config.header.title.fontFamily",
      type: "select",
      label: "Police du titre",
      options: [
        { value: "", label: "Defaut" },
        { value: "inter", label: "Inter" },
        { value: "roboto", label: "Roboto" },
        { value: "poppins", label: "Poppins" },
        { value: "montserrat", label: "Montserrat" },
        { value: "playfair", label: "Playfair Display" },
        { value: "merriweather", label: "Merriweather" },
        { value: "bebasneue", label: "Bebas Neue" },
        { value: "oswald", label: "Oswald" },
        { value: "urbanist", label: "Urbanist" },
      ],
      default: "",
    },
    {
      id: "config.header.title.fontSize",
      type: "select",
      label: "Taille du titre",
      options: [
        { value: "2xl", label: "Petit (2xl)" },
        { value: "3xl", label: "Moyen (3xl)" },
        { value: "4xl", label: "Grand (4xl)" },
        { value: "5xl", label: "Tres grand (5xl)" },
        { value: "6xl", label: "Enorme (6xl)" },
      ],
      default: "4xl",
    },
    {
      id: "config.header.title.fontWeight",
      type: "select",
      label: "Graisse du titre",
      options: [
        { value: "light", label: "Leger" },
        { value: "normal", label: "Normal" },
        { value: "medium", label: "Moyen" },
        { value: "semibold", label: "Semi-gras" },
        { value: "bold", label: "Gras" },
        { value: "extrabold", label: "Extra-gras" },
      ],
      default: "bold",
    },
    {
      id: "config.header.title.fontStyle",
      type: "select",
      label: "Style du titre",
      options: [
        { value: "normal", label: "Normal" },
        { value: "italic", label: "Italique" },
      ],
      default: "normal",
    },
    {
      id: "config.header.title.textAlign",
      type: "select",
      label: "Alignement du titre",
      options: [
        { value: "left", label: "Gauche" },
        { value: "center", label: "Centre" },
        { value: "right", label: "Droite" },
      ],
      default: "left",
    },
    {
      id: "config.header.title.textTransform",
      type: "select",
      label: "Transformation du titre",
      options: [
        { value: "none", label: "Aucune" },
        { value: "uppercase", label: "Majuscules" },
        { value: "lowercase", label: "Minuscules" },
        { value: "capitalize", label: "Capitalize" },
      ],
      default: "none",
    },
    
    // Subtitle Typography Settings
    {
      id: "config.header.subtitle.fontFamily",
      type: "select",
      label: "Police du sous-titre",
      options: [
        { value: "", label: "Defaut" },
        { value: "inter", label: "Inter" },
        { value: "roboto", label: "Roboto" },
        { value: "poppins", label: "Poppins" },
        { value: "montserrat", label: "Montserrat" },
        { value: "playfair", label: "Playfair Display" },
        { value: "merriweather", label: "Merriweather" },
        { value: "bebasneue", label: "Bebas Neue" },
        { value: "oswald", label: "Oswald" },
        { value: "urbanist", label: "Urbanist" },
      ],
      default: "",
    },
    {
      id: "config.header.subtitle.fontSize",
      type: "select",
      label: "Taille du sous-titre",
      options: [
        { value: "sm", label: "Petit" },
        { value: "base", label: "Normal" },
        { value: "lg", label: "Grand" },
        { value: "xl", label: "Tres grand" },
      ],
      default: "lg",
    },
    {
      id: "config.header.subtitle.fontStyle",
      type: "select",
      label: "Style du sous-titre",
      options: [
        { value: "normal", label: "Normal" },
        { value: "italic", label: "Italique" },
      ],
      default: "normal",
    },
    
    // Layout Settings
    {
      id: "config.variant",
      type: "select",
      label: "Variant",
      options: [
        { value: "default", label: "Default" },
        { value: "reversed", label: "Reversed" },
        { value: "centered", label: "Centered" },
        { value: "card", label: "Card" },
        { value: "minimal", label: "Minimal" },
        { value: "luxury", label: "Luxury" },
      ],
      default: "default",
    },
    {
      id: "config.imagePosition",
      type: "select",
      label: "Position image",
      options: [
        { value: "right", label: "Droite" },
        { value: "left", label: "Gauche" },
      ],
      default: "right",
    },
    {
      id: "config.contentWidth",
      type: "select",
      label: "Largeur du contenu",
      options: [
        { value: "narrow", label: "Etroite" },
        { value: "medium", label: "Moyenne" },
        { value: "wide", label: "Large" },
        { value: "full", label: "Pleine largeur" },
      ],
      default: "medium",
    },
    
    // Card Style Settings
    {
      id: "config.cardStyle.variant",
      type: "select",
      label: "Style de carte",
      options: [
        { value: "standard", label: "Standard" },
        { value: "minimal", label: "Minimal" },
        { value: "card", label: "Carte" },
        { value: "luxury", label: "Luxury" },
        { value: "elegant", label: "Elegant" },
      ],
      default: "standard",
    },
    {
      id: "config.cardStyle.borderRadius",
      type: "select",
      label: "Rayon de bordure",
      options: [
        { value: "none", label: "Aucun" },
        { value: "sm", label: "Petit" },
        { value: "md", label: "Moyen" },
        { value: "lg", label: "Grand" },
        { value: "xl", label: "Tres grand" },
        { value: "2xl", label: "Enorme" },
      ],
      default: "lg",
    },
    {
      id: "config.cardStyle.shadow",
      type: "select",
      label: "Ombre",
      options: [
        { value: "none", label: "Aucune" },
        { value: "sm", label: "Petite" },
        { value: "md", label: "Moyenne" },
        { value: "lg", label: "Grande" },
      ],
      default: "none",
    },
    
    // CTA Button Settings
    {
      id: "config.cta.style",
      type: "select",
      label: "Style du bouton CTA",
      options: [
        { value: "solid", label: "Plein (Solid)" },
        { value: "outline", label: "Contour (Outline)" },
        { value: "ghost", label: "Fantome (Ghost)" },
        { value: "underline", label: "Souligne" },
      ],
      default: "solid",
    },
    {
      id: "config.cta.size",
      type: "select",
      label: "Taille du bouton CTA",
      options: [
        { value: "sm", label: "Petit" },
        { value: "md", label: "Moyen" },
        { value: "lg", label: "Grand" },
      ],
      default: "lg",
    },
    {
      id: "config.cta.icon",
      type: "select",
      label: "Icône du bouton CTA",
      options: [
        { value: "arrow-right", label: "Fleche droite" },
        { value: "arrow-up-right", label: "Fleche haut-droite" },
        { value: "chevron-right", label: "Chevron droite" },
        { value: "none", label: "Aucune" },
      ],
      default: "arrow-right",
    },
    {
      id: "config.cta.showIcon",
      type: "checkbox",
      label: "Afficher l'icône CTA", 
      default: true,
    },
    {
      id: "config.cta.position",
      type: "select",
      label: "Position du CTA",
      options: [
        { value: "inline", label: "En ligne" },
        { value: "below", label: "En dessous" },
      ],
      default: "inline",
    },
    
    // Image Settings
    {
      id: "config.image.aspectRatio",
      type: "select",
      label: "Ratio d'aspect de l'image",
      options: [
        { value: "4/3", label: "4:3" },
        { value: "16/9", label: "16:9" },
        { value: "3/4", label: "3:4" },
        { value: "1/1", label: "1:1 (Carre)" },
        { value: "21/9", label: "21:9 (Cinemascope)" },
      ],
      default: "4/3",
    },
    {
      id: "config.image.hoverEffect",
      type: "select",
      label: "Effet au survol de l'image",
      options: [
        { value: "none", label: "Aucun" },
        { value: "zoom", label: "Zoom" },
        { value: "scale", label: "Echelle" },
      ],
      default: "zoom",
    },
    {
      id: "config.image.hoverScale",
      type: "range",
      label: "Echelle au survol",
      min: 1.0,
      max: 1.2,
      step: 0.05,
      default: 1.08,
    },
    {
      id: "config.image.objectFit",
      type: "select",
      label: "Adaptation de l'image",
      options: [
        { value: "cover", label: "Couvrir" },
        { value: "contain", label: "Contenir" },
      ],
      default: "cover",
    },
    {
      id: "config.image.borderRadius",
      type: "select",
      label: "Rayon de bordure de l'image",
      options: [
        { value: "none", label: "Aucun" },
        { value: "sm", label: "Petit" },
        { value: "md", label: "Moyen" },
        { value: "lg", label: "Grand" },
        { value: "xl", label: "Tres grand" },
        { value: "2xl", label: "Enorme" },
        { value: "3xl", label: "3xl" },
      ],
      default: "lg",
    },
  ],
  blocks: [],
  defaults: {
    content: {
      title: "Nouvelle Collection",
      subtitle: "Decouvrez nos nouveaux produits exclusifs",
      image: "",
      ctaText: "Decouvrir",
      ctaLink: "/products",
      showTitle: true,
      showSubtitle: true,
      showImage: true,
      showCta: true,
    },
    config: {
      variant: "default",
      imagePosition: "right",
      contentWidth: "medium",
      showCta: true,
      header: {
        title: {
          fontFamily: "",
          fontSize: "4xl",
          fontWeight: "bold",
          fontStyle: "normal",
          textAlign: "left",
          textTransform: "none",
        },
        subtitle: {
          fontFamily: "",
          fontSize: "lg",
          fontStyle: "normal",
        },
      },
      cardStyle: {
        variant: "standard",
        borderRadius: "lg",
        shadow: "none",
      },
      cta: {
        style: "solid",
        size: "lg",
        icon: "arrow-right",
        showIcon: true,
        position: "inline",
      },
      image: {
        aspectRatio: "4/3",
        hoverEffect: "zoom",
        hoverScale: 1.08,
        objectFit: "cover",
        borderRadius: "lg",
      },
      animation: {
        entrance: "fade-in",
        duration: "normal",
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
      border: {
        imageRadius: "lg",
      },
    },
    classes: {},
  },
};

export default bannerSchema;
