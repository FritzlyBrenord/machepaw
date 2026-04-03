import type { SectionSchema } from "@/lib/section-registry";

export const productGridSchema: SectionSchema = {
  name: "Grille de produits",
  type: "productGrid",
  category: "product",
  description: "Grille de produits editable avec cartes et produits dynamiques",
  icon: "ShoppingBag",
  settings: [
    // ============================================
    // CARD VARIANT — primary visual frame picker
    // ============================================
    {
      id: "config.cardVariant",
      type: "select",
      label: "Style de cadre (variant)",
      // The editor also renders a CardVariantPicker widget above this dropdown
      // (see editor sidebar integration). Both controls write to the same field.
      options: [
        { value: "standard", label: "Standard — classique et propre" },
        { value: "minimal",  label: "Minimal — sans cadre, image pure" },
        { value: "luxury",   label: "Luxury — ombre profonde, raffiné" },
        { value: "elegant",  label: "Élégant — bordure fine, sobre" },
        { value: "glass",    label: "Glass — effet verre dépoli" },
        { value: "gradient", label: "Gradient — fond dégradé accent" },
        { value: "outlined", label: "Outlined — contour coloré accent" },
        { value: "dark",     label: "Dark — fond sombre, texte clair" },
      ],
      default: "standard",
    },

    // ============================================
    // HEADER VISIBILITY
    // ============================================
    { id: "content.showEyebrowText", type: "checkbox", label: "Afficher le sur-titre", default: true },
    { id: "content.showTitle",       type: "checkbox", label: "Afficher le titre",     default: true },
    { id: "content.showSubtitle",    type: "checkbox", label: "Afficher le sous-titre",default: true },

    { id: "content.eyebrowText", type: "text",     label: "Sur-titre",   default: "Notre Selection" },
    { id: "content.title",       type: "text",     label: "Titre",       default: "Nouveautes" },
    { id: "content.subtitle",    type: "textarea", label: "Sous-titre",  default: "Decouvrez nos meilleures ventes" },

    // ============================================
    // HEADER TYPOGRAPHY — EYEBROW
    // ============================================
    {
      id: "config.header.eyebrow.fontFamily", type: "select", label: "Police sur-titre",
      options: [{ value: "inherit", label: "Héritée" }, { value: "inter", label: "Inter" }, { value: "roboto", label: "Roboto" }, { value: "poppins", label: "Poppins" }, { value: "montserrat", label: "Montserrat" }, { value: "playfair", label: "Playfair Display" }, { value: "bebasneue", label: "Bebas Neue" }, { value: "urbanist", label: "Urbanist" }],
      default: "inherit",
    },
    {
      id: "config.header.eyebrow.fontSize", type: "select", label: "Taille sur-titre",
      options: [{ value: "xs", label: "XS (12px)" }, { value: "sm", label: "SM (14px)" }, { value: "base", label: "Base (16px)" }],
      default: "sm",
    },
    {
      id: "config.header.eyebrow.fontWeight", type: "select", label: "Épaisseur sur-titre",
      options: [{ value: "normal", label: "Normal (400)" }, { value: "medium", label: "Medium (500)" }, { value: "semibold", label: "Semibold (600)" }, { value: "bold", label: "Bold (700)" }],
      default: "semibold",
    },
    {
      id: "config.header.eyebrow.textTransform", type: "select", label: "Transformation sur-titre",
      options: [{ value: "none", label: "Aucune" }, { value: "uppercase", label: "Majuscules" }, { value: "lowercase", label: "Minuscules" }, { value: "capitalize", label: "Première lettre" }],
      default: "uppercase",
    },

    // ============================================
    // HEADER TYPOGRAPHY — TITLE
    // ============================================
    {
      id: "config.header.title.textAlign", type: "select", label: "Alignement du titre",
      options: [{ value: "left", label: "Gauche" }, { value: "center", label: "Centre" }, { value: "right", label: "Droite" }],
      default: "left",
    },
    {
      id: "config.header.title.fontFamily", type: "select", label: "Police du titre",
      options: [{ value: "inherit", label: "Héritée" }, { value: "inter", label: "Inter" }, { value: "roboto", label: "Roboto" }, { value: "poppins", label: "Poppins" }, { value: "montserrat", label: "Montserrat" }, { value: "playfair", label: "Playfair Display" }, { value: "merriweather", label: "Merriweather" }, { value: "bebasneue", label: "Bebas Neue" }, { value: "oswald", label: "Oswald" }, { value: "urbanist", label: "Urbanist" }],
      default: "inherit",
    },
    {
      id: "config.header.title.fontSize", type: "select", label: "Taille du titre",
      options: [{ value: "2xl", label: "2XL (24px)" }, { value: "3xl", label: "3XL (30px)" }, { value: "4xl", label: "4XL (36px)" }, { value: "5xl", label: "5XL (48px)" }, { value: "6xl", label: "6XL (60px)" }],
      default: "4xl",
    },
    {
      id: "config.header.title.fontWeight", type: "select", label: "Épaisseur du titre",
      options: [{ value: "light", label: "Light (300)" }, { value: "normal", label: "Normal (400)" }, { value: "medium", label: "Medium (500)" }, { value: "semibold", label: "Semibold (600)" }, { value: "bold", label: "Bold (700)" }],
      default: "semibold",
    },
    {
      id: "config.header.title.fontStyle", type: "select", label: "Style du titre",
      options: [{ value: "normal", label: "Normal" }, { value: "italic", label: "Italique" }],
      default: "normal",
    },
    {
      id: "config.header.title.textTransform", type: "select", label: "Transformation du titre",
      options: [{ value: "none", label: "Aucune" }, { value: "uppercase", label: "Majuscules" }, { value: "lowercase", label: "Minuscules" }, { value: "capitalize", label: "Première lettre" }],
      default: "none",
    },

    // ============================================
    // HEADER TYPOGRAPHY — SUBTITLE
    // ============================================
    {
      id: "config.header.subtitle.textAlign", type: "select", label: "Alignement du sous-titre",
      options: [{ value: "left", label: "Gauche" }, { value: "center", label: "Centre" }, { value: "right", label: "Droite" }],
      default: "left",
    },
    {
      id: "config.header.subtitle.fontFamily", type: "select", label: "Police du sous-titre",
      options: [{ value: "inherit", label: "Héritée" }, { value: "inter", label: "Inter" }, { value: "roboto", label: "Roboto" }, { value: "poppins", label: "Poppins" }, { value: "playfair", label: "Playfair Display" }],
      default: "inherit",
    },
    {
      id: "config.header.subtitle.fontSize", type: "select", label: "Taille du sous-titre",
      options: [{ value: "sm", label: "Small (14px)" }, { value: "base", label: "Base (16px)" }, { value: "lg", label: "Large (18px)" }, { value: "xl", label: "XL (20px)" }],
      default: "base",
    },
    {
      id: "config.header.subtitle.fontStyle", type: "select", label: "Style du sous-titre",
      options: [{ value: "normal", label: "Normal" }, { value: "italic", label: "Italique" }],
      default: "normal",
    },

    // ============================================
    // ADD TO CART BUTTON
    // ============================================
    { id: "cardConfig.addToCart.show", type: "checkbox", label: "Afficher bouton Ajouter au panier", default: true },
    {
      id: "cardConfig.addToCart.style", type: "select", label: "Style du bouton",
      options: [{ value: "solid", label: "Solide" }, { value: "outline", label: "Contour" }, { value: "ghost", label: "Ghost (transparent)" }, { value: "icon-only", label: "Icône seule" }],
      default: "solid",
    },
    {
      id: "cardConfig.addToCart.position", type: "select", label: "Position du bouton",
      options: [{ value: "bottom", label: "Bas de la carte" }, { value: "overlay", label: "Overlay sur image" }],
      default: "bottom",
    },
    {
      id: "cardConfig.addToCart.size", type: "select", label: "Taille du bouton",
      options: [{ value: "sm", label: "Petit" }, { value: "md", label: "Moyen" }, { value: "lg", label: "Grand" }],
      default: "md",
    },
    { id: "cardConfig.addToCart.text", type: "text", label: "Texte du bouton", default: "Ajouter au panier" },

    // ============================================
    // GRID LAYOUT
    // ============================================
    { id: "content.filters.enabled", type: "checkbox", label: "Activer les filtres", default: true },
    {
      id: "config.variant", type: "select", label: "Variant de grille",
      options: [{ value: "grid-2", label: "Grid 2" }, { value: "grid-3", label: "Grid 3" }, { value: "grid-4", label: "Grid 4" }, { value: "grid-5", label: "Grid 5" }, { value: "carousel", label: "Carousel" }, { value: "horizontal", label: "Horizontal" }, { value: "compact", label: "Compact" }, { value: "masonry", label: "Masonry" }],
      default: "grid-4",
    },
    {
      id: "config.columns", type: "select", label: "Colonnes desktop",
      options: [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }, { value: "5", label: "5" }],
      default: "4",
    },
    {
      id: "config.dynamicSource", type: "select", label: "Source dynamique",
      options: [{ value: "newest", label: "Newest" }, { value: "featured", label: "Featured" }, { value: "recommended", label: "Recommended" }, { value: "best_selling", label: "Best selling" }, { value: "most_demanded", label: "Most demanded" }, { value: "recently_ordered", label: "Recently ordered" }, { value: "most_viewed", label: "Most viewed" }, { value: "for_you", label: "For you" }, { value: "random", label: "Random" }, { value: "manual", label: "Manual" }],
      default: "newest",
    },

    // ============================================
    // VIEW ALL BUTTON
    // ============================================
    { id: "content.viewAllButton.text", type: "text", label: "Texte Voir tout", default: "Voir tout" },
    { id: "content.viewAllButton.href", type: "url",  label: "Lien Voir tout",  default: "/produits" },
    { id: "config.showViewAllButton",   type: "checkbox", label: "Afficher Voir tout", default: true },
    {
      id: "config.viewAllButtonPosition", type: "select", label: "Position Voir tout",
      options: [{ value: "header-right", label: "Header right" }, { value: "header-bottom", label: "Header bottom" }, { value: "footer", label: "Footer" }],
      default: "header-right",
    },
    {
      id: "config.viewAllButtonStyle", type: "select", label: "Style Voir tout",
      options: [{ value: "text", label: "Texte" }, { value: "underline", label: "Underline" }, { value: "outline", label: "Outline" }, { value: "solid", label: "Solid" }],
      default: "text",
    },

    // ============================================
    // CARD OPTIONS
    // ============================================
    { id: "config.showQuickView", type: "checkbox", label: "Activer Quick View", default: true },
    { id: "config.showWishlist",  type: "checkbox", label: "Activer Favoris",    default: true },
    { id: "cardConfig.info.showRating", type: "checkbox", label: "Afficher les notes",  default: true },
    { id: "cardConfig.info.showBadge",  type: "checkbox", label: "Afficher les badges", default: true },
    {
      id: "cardConfig.image.hoverEffect", type: "select", label: "Effet au survol",
      options: [{ value: "zoom", label: "Zoom" }, { value: "swap", label: "Swap image" }, { value: "reveal-actions", label: "Reveal actions" }],
      default: "zoom",
    },
    {
      id: "cardConfig.badge.position", type: "select", label: "Position du badge",
      options: [{ value: "top-left", label: "Haut gauche" }, { value: "top-right", label: "Haut droite" }, { value: "bottom-left", label: "Bas gauche" }, { value: "bottom-right", label: "Bas droite" }],
      default: "top-left",
    },
    {
      id: "cardConfig.badge.style", type: "select", label: "Style du badge",
      options: [{ value: "pill", label: "Pill (arrondi)" }, { value: "rectangle", label: "Rectangle" }, { value: "none", label: "Aucun" }],
      default: "pill",
    },
    {
      id: "cardConfig.image.aspectRatio", type: "select", label: "Format de l'image",
      options: [{ value: "1/1", label: "Carré 1:1" }, { value: "3/4", label: "Portrait 3:4" }, { value: "4/3", label: "Paysage 4:3" }, { value: "4/5", label: "Portrait 4:5" }, { value: "16/9", label: "Cinéma 16:9" }],
      default: "3/4",
    },
    {
      id: "cardConfig.info.alignment", type: "select", label: "Alignement du texte",
      options: [{ value: "left", label: "Gauche" }, { value: "center", label: "Centre" }, { value: "right", label: "Droite" }],
      default: "left",
    },

    // ============================================
    // PAGINATION
    // ============================================
    {
      id: "config.loadMore", type: "select", label: "Chargement supplementaire",
      options: [{ value: "button", label: "Bouton" }, { value: "infinite", label: "Infini" }, { value: "none", label: "Aucun" }],
      default: "button",
    },
    { id: "config.productsPerPage", type: "number", label: "Produits par page", min: 1, max: 48, default: 8 },

    // ============================================
    // ALIGNMENT (legacy — also overridden by header.title.textAlign)
    // ============================================
    {
      id: "config.titleAlignment", type: "select", label: "Alignement global",
      options: [{ value: "left", label: "Gauche" }, { value: "center", label: "Centre" }, { value: "right", label: "Droite" }],
      default: "left",
    },
  ],

  blocks: [
    {
      type: "product",
      name: "Produits",
      itemsPath: "content.products",
      settings: [
        { id: "id",          type: "text",   label: "Identifiant", default: "1" },
        { id: "name",        type: "text",   label: "Nom",         default: "Produit" },
        { id: "price",       type: "number", label: "Prix",        default: 99 },
        { id: "oldPrice",    type: "number", label: "Ancien prix", default: 0 },
        { id: "image",       type: "image",  label: "Image",       default: "" },
        { id: "hoverImage",  type: "image",  label: "Image hover", default: "" },
        { id: "badge",       type: "text",   label: "Badge",       default: "" },
        { id: "rating",      type: "range",  label: "Note",        min: 0, max: 5, step: 0.1, default: 4.5 },
        { id: "reviewCount", type: "number", label: "Nombre d'avis", default: 0 },
        { id: "href",        type: "url",    label: "Lien",        default: "/product" },
      ],
    },
  ],

  maxBlocks: 24,

  defaults: {
    content: {
      eyebrowText: "Notre Selection",
      title: "Nouveautes",
      subtitle: "Decouvrez nos meilleures ventes",
      filters: { enabled: true },
      viewAllButton: { text: "Voir tout", href: "/produits" },
      products: [
        { id: "1", name: "Produit 1", price: 99,  image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=500&fit=crop", rating: 4.5, href: "/product" },
        { id: "2", name: "Produit 2", price: 149, oldPrice: 199, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=500&fit=crop", badge: "-25%", rating: 4.8, href: "/product" },
        { id: "3", name: "Produit 3", price: 79,  image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=500&fit=crop", badge: "Nouveau", rating: 4.2, href: "/product" },
        { id: "4", name: "Produit 4", price: 199, image: "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=500&fit=crop", rating: 4.7, href: "/product" },
      ],
    },
    config: {
      // NEW default variant
      cardVariant: "standard",
      variant: "grid-4",
      columns: 4,
      dynamicSource: "newest",
      showViewAllButton: true,
      viewAllButtonPosition: "header-right",
      viewAllButtonStyle: "text",
      showQuickView: true,
      showWishlist: true,
      loadMore: "button",
      productsPerPage: 8,
      titleAlignment: "left",
    },
    cardConfig: {
      image: { aspectRatio: "3/4", hoverEffect: "zoom", hoverScale: 1.08, objectFit: "cover" },
      info:  { alignment: "left", showRating: true, showPrice: true, showBadge: true },
      badge: { position: "top-left", style: "pill" },
      quickView: true,
      wishlist: true,
      addToCart: { show: true, style: "solid", position: "bottom", size: "md", text: "Ajouter au panier" },
      style: { variant: "standard", borderRadius: "md", shadow: "none" },
    },
    style: {
      colors: { background: "white", text: "#1a1a1a", accent: "#d4af37" },
      spacing: { paddingY: "16", container: "contained", gap: "6" },
      typography: { textAlign: "left", titleFontSize: "4xl", titleFontWeight: "semibold", subtitleFontSize: "base" },
    },
    classes: {},
  },
};

export default productGridSchema;