import type { SectionSchema } from "@/lib/section-registry";

export const headerModernSchema: SectionSchema = {
  name: "Header Moderne",
  type: "headerModern",
  category: "header",
  description: "Header moderne avec navigation, actions et CTA",
  icon: "Layout",
  settings: [
    // ============================================
    // LOGO SETTINGS - Visibilité
    // ============================================
    {
      id: "content.logo.show",
      type: "checkbox",
      label: "Afficher le logo",
      default: true,
    },
    {
      id: "content.logo.showText",
      type: "checkbox",
      label: "Afficher le texte du logo",
      default: true,
    },
    {
      id: "content.logo.showIcon",
      type: "checkbox",
      label: "Afficher l'icône du logo",
      default: true,
    },
    {
      id: "content.logo.type",
      type: "select",
      label: "Type de logo",
      options: [
        { value: "text", label: "Texte" },
        { value: "image", label: "Image" },
        { value: "svg", label: "SVG" },
        { value: "initial", label: "Initiale seule" },
      ],
      default: "text",
    },
    { id: "content.logo.text", type: "text", label: "Texte du logo", default: "VOTRE MARQUE" },
    { id: "content.logo.image", type: "image", label: "Image du logo", default: "" },
    {
      id: "content.logo.letterSpacing",
      type: "text",
      label: "Espacement du logo",
      default: "0.02em",
    },
    // Logo Text Style
    {
      id: "content.logo.fontWeight",
      type: "select",
      label: "Épaisseur police logo",
      options: [
        { value: "light", label: "Léger (300)" },
        { value: "normal", label: "Normal (400)" },
        { value: "medium", label: "Medium (500)" },
        { value: "semibold", label: "Semi-bold (600)" },
        { value: "bold", label: "Bold (700)" },
        { value: "extrabold", label: "Extra-bold (800)" },
      ],
      default: "bold",
    },
    {
      id: "content.logo.fontStyle",
      type: "select",
      label: "Style police logo",
      options: [
        { value: "normal", label: "Normal" },
        { value: "italic", label: "Italique" },
      ],
      default: "normal",
    },
    {
      id: "content.logo.textTransform",
      type: "select",
      label: "Transformation texte logo",
      options: [
        { value: "none", label: "Aucune" },
        { value: "uppercase", label: "MAJUSCULES" },
        { value: "lowercase", label: "minuscules" },
        { value: "capitalize", label: "Capitalize" },
      ],
      default: "uppercase",
    },
    {
      id: "content.logo.fontSize",
      type: "select",
      label: "Taille police logo",
      options: [
        { value: "sm", label: "Petit" },
        { value: "base", label: "Normal" },
        { value: "lg", label: "Grand" },
        { value: "xl", label: "Très grand" },
        { value: "2xl", label: "Extra grand" },
      ],
      default: "xl",
    },
    // Logo Font Family
    {
      id: "content.logo.fontFamily",
      type: "select",
      label: "Police du logo",
      options: [
        { value: "inherit", label: "Héritée" },
        { value: "serif", label: "Serif (élégant)" },
        { value: "sans", label: "Sans-serif (moderne)" },
        { value: "display", label: "Display (Playfair)" },
        { value: "mono", label: "Monospace" },
        { value: "inter", label: "Inter" },
        { value: "roboto", label: "Roboto" },
        { value: "poppins", label: "Poppins" },
        { value: "montserrat", label: "Montserrat" },
        { value: "lato", label: "Lato" },
        { value: "opensans", label: "Open Sans" },
        { value: "raleway", label: "Raleway" },
        { value: "nunito", label: "Nunito" },
        { value: "playfair", label: "Playfair Display" },
        { value: "merriweather", label: "Merriweather" },
        { value: "crimsontext", label: "Crimson Text" },
        { value: "librebaskerville", label: "Libre Baskerville" },
        { value: "cormorant", label: "Cormorant Garamond" },
        { value: "bebasneue", label: "Bebas Neue" },
        { value: "oswald", label: "Oswald" },
        { value: "urbanist", label: "Urbanist" },
        { value: "spacegrotesk", label: "Space Grotesk" },
        { value: "sora", label: "Sora" },
        { value: "jakarta", label: "Plus Jakarta" },
        { value: "manrope", label: "Manrope" },
        { value: "outfit", label: "Outfit" },
      ],
      default: "inherit",
    },
    { id: "content.ctaButton.text", type: "text", label: "Texte CTA", default: "Acheter" },
    { id: "content.ctaButton.href", type: "url", label: "Lien CTA", default: "/produit" },
    {
      id: "content.ctaButton.show",
      type: "checkbox",
      label: "Afficher le CTA",
      default: true,
    },
    {
      id: "content.ctaButton.variant",
      type: "select",
      label: "Variant CTA",
      options: [
        { value: "primary", label: "Primary" },
        { value: "secondary", label: "Secondary" },
        { value: "outline", label: "Outline" },
        { value: "ghost", label: "Ghost" },
      ],
      default: "primary",
    },
    {
      id: "content.cartBadge.style",
      type: "select",
      label: "Style badge panier",
      options: [
        { value: "number", label: "Nombre" },
        { value: "dot", label: "Point" },
        { value: "pulse", label: "Pulsation" },
        { value: "hidden", label: "Caché" },
      ],
      default: "number",
    },

    // ============================================
    // NAVIGATION TYPOGRAPHY & HOVER EFFECTS
    // ============================================
    {
      id: "config.navigation.fontFamily",
      type: "select",
      label: "Police navigation",
      options: [
        { value: "inherit", label: "Héritée" },
        { value: "serif", label: "Serif" },
        { value: "sans", label: "Sans-serif" },
        { value: "inter", label: "Inter" },
        { value: "roboto", label: "Roboto" },
        { value: "poppins", label: "Poppins" },
        { value: "montserrat", label: "Montserrat" },
        { value: "lato", label: "Lato" },
        { value: "opensans", label: "Open Sans" },
        { value: "raleway", label: "Raleway" },
        { value: "nunito", label: "Nunito" },
        { value: "playfair", label: "Playfair Display" },
        { value: "merriweather", label: "Merriweather" },
        { value: "bebasneue", label: "Bebas Neue" },
        { value: "urbanist", label: "Urbanist" },
        { value: "spacegrotesk", label: "Space Grotesk" },
      ],
      default: "inherit",
    },
    {
      id: "config.navigation.fontWeight",
      type: "select",
      label: "Épaisseur navigation",
      options: [
        { value: "light", label: "Léger (300)" },
        { value: "normal", label: "Normal (400)" },
        { value: "medium", label: "Medium (500)" },
        { value: "semibold", label: "Semi-bold (600)" },
        { value: "bold", label: "Bold (700)" },
      ],
      default: "medium",
    },
    {
      id: "config.navigation.fontStyle",
      type: "select",
      label: "Style navigation",
      options: [
        { value: "normal", label: "Normal" },
        { value: "italic", label: "Italique" },
      ],
      default: "normal",
    },
    {
      id: "config.navigation.textTransform",
      type: "select",
      label: "Transformation texte navigation",
      options: [
        { value: "none", label: "Aucune" },
        { value: "uppercase", label: "MAJUSCULES" },
        { value: "lowercase", label: "minuscules" },
        { value: "capitalize", label: "Capitalize" },
      ],
      default: "none",
    },
    {
      id: "config.navigation.fontSize",
      type: "select",
      label: "Taille texte navigation",
      options: [
        { value: "xs", label: "Extra petit" },
        { value: "sm", label: "Petit" },
        { value: "base", label: "Normal" },
        { value: "lg", label: "Grand" },
      ],
      default: "sm",
    },
    {
      id: "config.navigation.letterSpacing",
      type: "text",
      label: "Espacement lettres navigation",
      default: "0.01em",
    },
    // Navigation Hover Effects
    {
      id: "config.navigation.hoverEffect",
      type: "select",
      label: "Effet au survol navigation",
      options: [
        { value: "opacity", label: "Opacité réduite (défaut)" },
        { value: "underline", label: "Souligné" },
        { value: "underline-slide", label: "Souligné avec animation" },
        { value: "highlight", label: "Surbrillance" },
        { value: "box", label: "Encadré (rectangle)" },
        { value: "box-rounded", label: "Encadré (arrondi)" },
        { value: "pill", label: "Pill/Capsule" },
        { value: "glow", label: "Lueur/Glow" },
        { value: "scale", label: "Zoom léger" },
        { value: "color", label: "Changement de couleur" },
        { value: "none", label: "Aucun effet" },
      ],
      default: "opacity",
    },
    {
      id: "config.navigation.hoverColor",
      type: "color",
      label: "Couleur au survol",
      default: "",
    },
    {
      id: "config.navigation.hoverBgColor",
      type: "color",
      label: "Couleur fond au survol",
      default: "",
    },
    {
      id: "config.navigation.hoverUnderlineHeight",
      type: "range",
      label: "Épaisseur soulignement (px)",
      min: 1,
      max: 5,
      step: 1,
      default: 2,
    },
    {
      id: "config.navigation.hoverUnderlineOffset",
      type: "range",
      label: "Décalage soulignement (px)",
      min: 0,
      max: 10,
      step: 1,
      default: 4,
    },

    // ============================================
    // SEARCH SETTINGS
    // ============================================
    {
      id: "config.search.style",
      type: "select",
      label: "Style de la recherche",
      options: [
        { value: "icon", label: "Icône seule (overlay)" },
        { value: "inline", label: "Champ de recherche inline" },
        { value: "expandable", label: "Icône + expansion" },
        { value: "drawer", label: "Drawer latéral" },
      ],
      default: "icon",
    },
    {
      id: "config.search.inlineWidth",
      type: "select",
      label: "Largeur champ recherche inline",
      options: [
        { value: "sm", label: "Petite (200px)" },
        { value: "md", label: "Moyenne (280px)" },
        { value: "lg", label: "Grande (360px)" },
        { value: "xl", label: "Extra (440px)" },
      ],
      default: "md",
    },
    {
      id: "config.search.inlinePlaceholder",
      type: "text",
      label: "Placeholder champ recherche",
      default: "Rechercher...",
    },
    {
      id: "config.search.inlineRounded",
      type: "select",
      label: "Arrondi champ recherche",
      options: [
        { value: "none", label: "Carré" },
        { value: "sm", label: "Légèrement arrondi" },
        { value: "md", label: "Arrondi" },
        { value: "lg", label: "Très arrondi" },
        { value: "full", label: "Pill" },
      ],
      default: "md",
    },

    // ============================================
    // ICON STYLE
    // ============================================
    {
      id: "config.iconSize",
      type: "select",
      label: "Taille des icônes",
      options: [
        { value: "sm", label: "Petit (16px)" },
        { value: "md", label: "Moyen (20px)" },
        { value: "lg", label: "Grand (24px)" },
        { value: "xl", label: "Extra (28px)" },
      ],
      default: "md",
    },

    // ============================================
    // HEADER LAYOUT
    // ============================================
    {
      id: "config.variant",
      type: "select",
      label: "Variant header",
      options: [
        { value: "default", label: "Default" },
        { value: "centered", label: "Centered" },
        { value: "split", label: "Split" },
      ],
      default: "default",
    },
    {
      id: "config.behavior.sticky",
      type: "checkbox",
      label: "Header sticky",
      default: true,
    },
    {
      id: "config.behavior.transparentAtTop",
      type: "checkbox",
      label: "Transparent en haut",
      default: false,
    },
    {
      id: "config.behavior.blurOnScroll",
      type: "checkbox",
      label: "Flou au scroll",
      default: false,
    },
    {
      id: "config.behavior.elevatedOnScroll",
      type: "checkbox",
      label: "Ombre au scroll",
      default: false,
    },
  ],
  blocks: [
    {
      type: "navigationItem",
      name: "Liens de navigation",
      itemsPath: "content.navigation",
      settings: [
        { id: "label", type: "text", label: "Label", default: "Accueil" },
        { id: "href", type: "url", label: "Lien", default: "/" },
        { id: "enabled", type: "checkbox", label: "Actif", default: true },
      ],
    },
  ],
  maxBlocks: 8,
  defaults: {
    content: {
      logo: {
        show: true,
        showText: true,
        showIcon: true,
        type: "text",
        text: "VOTRE MARQUE",
        fontWeight: "bold",
        fontStyle: "normal",
        textTransform: "uppercase",
        fontSize: "xl",
        fontFamily: "inherit",
        letterSpacing: "0.02em",
      },
      navigation: [
        { label: "Accueil", href: "/", enabled: true },
        { label: "Produits", href: "/produit", enabled: true },
        { label: "A propos", href: "/a-propos", enabled: true },
        { label: "Contact", href: "/contact", enabled: true },
      ],
      actions: ["search", "account", "cart"],
      ctaButton: {
        text: "Acheter",
        href: "/produit",
        show: true,
        variant: "primary",
        rounded: "md",
        fontWeight: "medium",
        textTransform: "none",
      },
      cartBadge: {
        style: "number",
      },
    },
    config: {
      variant: "default",
      search: {
        style: "icon",
        inlineWidth: "md",
        inlinePlaceholder: "Rechercher...",
        inlineRounded: "md",
      },
      navigation: {
        fontFamily: "inherit",
        fontWeight: "medium",
        fontStyle: "normal",
        textTransform: "none",
        fontSize: "sm",
        letterSpacing: "0.01em",
        hoverEffect: "opacity",
        hoverColor: "",
        hoverBgColor: "",
        hoverUnderlineHeight: 2,
        hoverUnderlineOffset: 4,
      },
      iconSize: "md",
      behavior: {
        sticky: true,
        transparentAtTop: false,
        blurOnScroll: false,
        elevatedOnScroll: false,
      },
    },
    style: {
      colors: {
        background: "white",
        text: "primary",
        accent: "accent",
      },
      spacing: {
        paddingY: "4",
        container: "contained",
      },
    },
    classes: {},
  },
};

export default headerModernSchema;
