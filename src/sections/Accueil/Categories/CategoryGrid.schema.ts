import type { SectionSchema } from "@/lib/section-registry";

export const categoryGridSchema: SectionSchema = {
  name: "Category Grid",
  type: "categoryGrid",
  category: "collection",
  description: "Grille de categories configurable",
  icon: "Grid3X3",
  settings: [
    // ============================================
    // HEADER VISIBILITY
    // ============================================
    {
      id: "content.showTitle",
      type: "checkbox",
      label: "Afficher le titre",
      default: true,
    },
    {
      id: "content.showSubtitle",
      type: "checkbox",
      label: "Afficher le sous-titre",
      default: true,
    },
    { id: "content.title", type: "text", label: "Titre", default: "Nos categories" },
    {
      id: "content.subtitle",
      type: "textarea",
      label: "Sous-titre",
      default: "Explorez notre selection",
    },
    // ============================================
    // HEADER TYPOGRAPHY - TITLE
    // ============================================
    {
      id: "config.header.title.textAlign",
      type: "select",
      label: "Alignement du titre",
      options: [
        { value: "left", label: "Gauche" },
        { value: "center", label: "Centre" },
        { value: "right", label: "Droite" },
      ],
      default: "center",
    },
    {
      id: "config.header.title.fontFamily",
      type: "select",
      label: "Police du titre",
      options: [
        { value: "inherit", label: "Héritée" },
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
      default: "inherit",
    },
    {
      id: "config.header.title.fontSize",
      type: "select",
      label: "Taille du titre",
      options: [
        { value: "2xl", label: "2XL (24px)" },
        { value: "3xl", label: "3XL (30px)" },
        { value: "4xl", label: "4XL (36px)" },
        { value: "5xl", label: "5XL (48px)" },
        { value: "6xl", label: "6XL (60px)" },
      ],
      default: "4xl",
    },
    {
      id: "config.header.title.fontWeight",
      type: "select",
      label: "Épaisseur du titre",
      options: [
        { value: "light", label: "Light (300)" },
        { value: "normal", label: "Normal (400)" },
        { value: "medium", label: "Medium (500)" },
        { value: "semibold", label: "Semibold (600)" },
        { value: "bold", label: "Bold (700)" },
      ],
      default: "semibold",
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
      id: "config.header.title.textTransform",
      type: "select",
      label: "Transformation du titre",
      options: [
        { value: "none", label: "Aucune" },
        { value: "uppercase", label: "Majuscules" },
        { value: "lowercase", label: "Minuscules" },
        { value: "capitalize", label: "Première lettre" },
      ],
      default: "none",
    },
    // ============================================
    // HEADER TYPOGRAPHY - SUBTITLE
    // ============================================
    {
      id: "config.header.subtitle.textAlign",
      type: "select",
      label: "Alignement du sous-titre",
      options: [
        { value: "left", label: "Gauche" },
        { value: "center", label: "Centre" },
        { value: "right", label: "Droite" },
      ],
      default: "center",
    },
    {
      id: "config.header.subtitle.fontFamily",
      type: "select",
      label: "Police du sous-titre",
      options: [
        { value: "inherit", label: "Héritée" },
        { value: "inter", label: "Inter" },
        { value: "roboto", label: "Roboto" },
        { value: "poppins", label: "Poppins" },
        { value: "montserrat", label: "Montserrat" },
        { value: "playfair", label: "Playfair Display" },
      ],
      default: "inherit",
    },
    {
      id: "config.header.subtitle.fontSize",
      type: "select",
      label: "Taille du sous-titre",
      options: [
        { value: "sm", label: "Small (14px)" },
        { value: "base", label: "Base (16px)" },
        { value: "lg", label: "Large (18px)" },
        { value: "xl", label: "XL (20px)" },
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
    // ============================================
    // CARD STYLES
    // ============================================
    {
      id: "config.cardStyle.variant",
      type: "select",
      label: "Variant de carte",
      options: [
        { value: "default", label: "Défaut (Image + texte en overlay)" },
        { value: "card", label: "Card (Image + texte en dessous)" },
        { value: "minimal", label: "Minimal (Sans cadre)" },
        { value: "luxury", label: "Luxury (Bordures dorées)" },
        { value: "elegant", label: "Élégant (Coins arrondis, ombre)" },
        { value: "modern", label: "Moderne (Image pleine avec texte)" },
        { value: "frame", label: "Frame (Cadre autour)" },
      ],
      default: "default",
    },
    {
      id: "config.cardStyle.borderRadius",
      type: "select",
      label: "Coins arrondis des cartes",
      options: [
        { value: "none", label: "Aucun" },
        { value: "sm", label: "Petit (4px)" },
        { value: "md", label: "Moyen (8px)" },
        { value: "lg", label: "Grand (16px)" },
        { value: "xl", label: "Extra (24px)" },
        { value: "full", label: "Plein (9999px)" },
      ],
      default: "md",
    },
    {
      id: "config.cardStyle.borderWidth",
      type: "select",
      label: "Épaisseur bordure",
      options: [
        { value: "0", label: "Aucune" },
        { value: "1", label: "Fine (1px)" },
        { value: "2", label: "Moyenne (2px)" },
        { value: "4", label: "Épaisse (4px)" },
      ],
      default: "0",
    },
    {
      id: "config.cardStyle.shadow",
      type: "select",
      label: "Ombre des cartes",
      options: [
        { value: "none", label: "Aucune" },
        { value: "sm", label: "Petite" },
        { value: "md", label: "Moyenne" },
        { value: "lg", label: "Grande" },
        { value: "xl", label: "Extra" },
      ],
      default: "none",
    },
    {
      id: "config.cardStyle.titlePosition",
      type: "select",
      label: "Position du titre catégorie",
      options: [
        { value: "overlay", label: "Sur l'image (overlay)" },
        { value: "below", label: "En dessous de l'image" },
        { value: "above", label: "Au-dessus de l'image" },
      ],
      default: "overlay",
    },
    // ============================================
    // GRID CONFIGURATION
    // ============================================
    {
      id: "config.variant",
      type: "select",
      label: "Variant",
      options: [
        { value: "mosaic-2x2", label: "Mosaic 2x2" },
        { value: "mosaic-3", label: "Mosaic 3" },
        { value: "bento", label: "Bento" },
        { value: "horizontal", label: "Horizontal" },
        { value: "carousel", label: "Carousel" },
      ],
      default: "mosaic-2x2",
    },
    { id: "config.columns", type: "number", label: "Colonnes", min: 2, max: 6, default: 4 },
    {
      id: "config.aspectRatio",
      type: "select",
      label: "Ratio image",
      options: [
        { value: "square", label: "Square" },
        { value: "portrait", label: "Portrait" },
        { value: "landscape", label: "Landscape" },
        { value: "4/5", label: "4/5" },
        { value: "3/4", label: "3/4" },
      ],
      default: "3/4",
    },
    { id: "config.gap", type: "number", label: "Espacement", min: 0, max: 16, default: 6 },
    {
      id: "config.hoverEffect",
      type: "select",
      label: "Effet au survol",
      options: [
        { value: "zoom", label: "Zoom" },
        { value: "zoom-slow", label: "Zoom slow" },
        { value: "darken", label: "Darken" },
        { value: "reveal", label: "Reveal" },
        { value: "swap", label: "Swap" },
        { value: "play", label: "Play" },
        { value: "lift", label: "Lift" },
        { value: "glow", label: "Glow" },
        { value: "none", label: "Aucun" },
      ],
      default: "zoom",
    },
    {
      id: "config.showProductCount",
      type: "checkbox",
      label: "Afficher le nombre de produits",
      default: true,
    },
  ],
  blocks: [
    {
      type: "category",
      name: "Categories",
      itemsPath: "content.categories",
      settings: [
        { id: "name", type: "text", label: "Nom", default: "Categorie" },
        { id: "description", type: "textarea", label: "Description", default: "" },
        { id: "image", type: "image", label: "Image", default: "" },
        { id: "hoverImage", type: "image", label: "Image hover", default: "" },
        { id: "productCount", type: "number", label: "Nombre de produits", default: 24 },
        { id: "badge", type: "text", label: "Badge", default: "" },
        { id: "href", type: "url", label: "Lien", default: "/produits" },
      ],
    },
  ],
  maxBlocks: 24,
  defaults: {
    content: {
      title: "Nos categories",
      subtitle: "Explorez notre selection",
      categories: [
        {
          name: "Categorie 1",
          description: "Collection essentielle",
          image:
            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop",
          productCount: 24,
          href: "/produits",
        },
        {
          name: "Categorie 2",
          description: "Pieces iconiques",
          image:
            "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=400&fit=crop",
          productCount: 18,
          href: "/produits",
        },
        {
          name: "Categorie 3",
          description: "Nouveautes du moment",
          image:
            "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=400&fit=crop",
          productCount: 32,
          href: "/produits",
        },
        {
          name: "Categorie 4",
          description: "Editions selectionnees",
          image:
            "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400&h=400&fit=crop",
          productCount: 15,
          href: "/produits",
        },
      ],
    },
    config: {
      variant: "mosaic-2x2",
      columns: 4,
      aspectRatio: "3/4",
      gap: "6",
      hoverEffect: "zoom",
      showProductCount: true,
      animation: {
        entrance: "stagger",
        stagger: true,
      },
    },
    style: {
      colors: {
        background: "secondary",
        text: "primary",
        accent: "accent",
      },
      spacing: {
        paddingY: "16",
        container: "contained",
        gap: "6",
      },
      typography: {
        titleSize: "4xl",
        textAlign: "center",
      },
    },
    classes: {},
  },
};

export default categoryGridSchema;
