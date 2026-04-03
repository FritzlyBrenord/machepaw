import type { SectionSchema } from "@/lib/section-registry";

export const productsContentSchema: SectionSchema = {
  name: "Products Content",
  type: "productsContent",
  category: "product",
  description: "Catalogue de produits avec filtres et liste editable - 100% configurable",
  icon: "ShoppingBag",
  settings: [
    // Titres
    { id: "content.title", type: "text", label: "Titre", default: "Nos produits" },
    { id: "content.subtitle", type: "textarea", label: "Sous-titre", default: "Explorez la collection complete" },
    // Recherche
    { id: "content.searchPlaceholder", type: "text", label: "Placeholder recherche", default: "Rechercher un produit..." },
    // Filtres
    { id: "content.categoriesLabel", type: "text", label: "Label categories", default: "Categories" },
    { id: "content.allCategoriesLabel", type: "text", label: "Label toutes categories", default: "Toutes les categories" },
    { id: "content.priceLabel", type: "text", label: "Label prix", default: "Prix" },
    { id: "content.minPricePlaceholder", type: "text", label: "Placeholder prix min", default: "Min" },
    { id: "content.maxPricePlaceholder", type: "text", label: "Placeholder prix max", default: "Max" },
    { id: "content.filtersButtonLabel", type: "text", label: "Label bouton filtres", default: "Filtres" },
    { id: "content.resetFiltersLabel", type: "text", label: "Label reinitialiser filtres", default: "Reinitialiser" },
    // Tri
    { id: "content.sortLabel", type: "text", label: "Label tri (accessibilite)", default: "Trier par" },
    { id: "content.sortNameLabel", type: "text", label: "Label tri nom", default: "Nom" },
    { id: "content.sortPriceAscLabel", type: "text", label: "Label tri prix croissant", default: "Prix croissant" },
    { id: "content.sortPriceDescLabel", type: "text", label: "Label tri prix decroissant", default: "Prix decroissant" },
    { id: "content.sortRatingLabel", type: "text", label: "Label tri note", default: "Mieux notes" },
    // Résultats
    { id: "content.resultsFoundLabel", type: "text", label: "Label resultats trouves (utiliser {count})", default: "{count} produit(s) trouve(s)" },
    { id: "content.categoryBadgeLabel", type: "text", label: "Label badge categorie", default: "Categorie:" },
    { id: "content.searchBadgeLabel", type: "text", label: "Label badge recherche", default: "Recherche:" },
    // Etat vide
    { id: "content.emptyStateTitle", type: "text", label: "Titre etat vide", default: "Aucun produit trouve" },
    { id: "content.emptyStateDescription", type: "textarea", label: "Description etat vide", default: "Essayez de modifier vos filtres ou votre recherche" },
    // Produit
    { id: "content.addToCartLabel", type: "text", label: "Label ajouter au panier", default: "Ajouter au panier" },
    { id: "content.currencyLabel", type: "text", label: "Label devise", default: "EUR" },
    // Toast
    { id: "content.addedToCartMessage", type: "text", label: "Message ajoute au panier (utiliser {name})", default: "{name} ajoute au panier" },
    { id: "content.addedToWishlistMessage", type: "text", label: "Message ajoute aux favoris", default: "Ajoute aux favoris" },
    { id: "content.removedFromWishlistMessage", type: "text", label: "Message retire des favoris", default: "Retire des favoris" },
    // Config
    { id: "config.showFilters", type: "checkbox", label: "Afficher les filtres", default: true },
    { id: "config.showSearch", type: "checkbox", label: "Afficher la recherche", default: true },
    { id: "config.showSort", type: "checkbox", label: "Afficher le tri", default: true },
    { id: "config.showViewModeToggle", type: "checkbox", label: "Afficher bascule grille/liste", default: true },
    { id: "config.columns", type: "number", label: "Colonnes", min: 2, max: 4, default: 4 },
    { id: "config.showRating", type: "checkbox", label: "Afficher la note", default: true },
    { id: "config.showBadges", type: "checkbox", label: "Afficher les badges produit", default: true },
    { id: "config.showWishlistButton", type: "checkbox", label: "Afficher bouton favoris", default: true },
    { id: "config.enablePriceFilter", type: "checkbox", label: "Activer filtre prix", default: true },
    { id: "config.enableCategoryFilter", type: "checkbox", label: "Activer filtre categories", default: true },
  ],
  blocks: [
    {
      type: "product",
      name: "Produits",
      itemsPath: "content.products",
      settings: [
        { id: "id", type: "text", label: "Identifiant", default: "1" },
        { id: "name", type: "text", label: "Nom", default: "Produit" },
        { id: "price", type: "number", label: "Prix", default: 99 },
        { id: "oldPrice", type: "number", label: "Ancien prix", default: 0 },
        { id: "image", type: "image", label: "Image", default: "" },
        { id: "badge", type: "text", label: "Badge", default: "" },
        { id: "rating", type: "range", label: "Note", min: 0, max: 5, step: 0.1, default: 4.5 },
        { id: "reviewCount", type: "number", label: "Nombre d'avis", default: 0 },
        { id: "category", type: "text", label: "Categorie", default: "produits" },
        { id: "description", type: "textarea", label: "Description", default: "" },
      ],
    },
  ],
  maxBlocks: 40,
  defaults: {
    content: {
      title: "Nos produits",
      subtitle: "Explorez la collection complete",
      // Recherche
      searchPlaceholder: "Rechercher un produit...",
      // Filtres
      categoriesLabel: "Categories",
      allCategoriesLabel: "Toutes les categories",
      priceLabel: "Prix",
      minPricePlaceholder: "Min",
      maxPricePlaceholder: "Max",
      filtersButtonLabel: "Filtres",
      resetFiltersLabel: "Reinitialiser",
      // Tri
      sortLabel: "Trier par",
      sortNameLabel: "Nom",
      sortPriceAscLabel: "Prix croissant",
      sortPriceDescLabel: "Prix decroissant",
      sortRatingLabel: "Mieux notes",
      // Résultats
      resultsFoundLabel: "{count} produit(s) trouve(s)",
      categoryBadgeLabel: "Categorie:",
      searchBadgeLabel: "Recherche:",
      // Etat vide
      emptyStateTitle: "Aucun produit trouve",
      emptyStateDescription: "Essayez de modifier vos filtres ou votre recherche",
      // Produit
      addToCartLabel: "Ajouter au panier",
      currencyLabel: "EUR",
      // Toast
      addedToCartMessage: "{name} ajoute au panier",
      addedToWishlistMessage: "Ajoute aux favoris",
      removedFromWishlistMessage: "Retire des favoris",
      products: [
        {
          id: "1",
          name: "Produit 1",
          price: 99,
          image:
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=650&fit=crop",
          badge: "Nouveau",
          rating: 4.5,
          reviewCount: 12,
          category: "produits",
          description: "Description courte du produit.",
        },
        {
          id: "2",
          name: "Produit 2",
          price: 149,
          oldPrice: 199,
          image:
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=650&fit=crop",
          badge: "-25%",
          rating: 4.8,
          reviewCount: 18,
          category: "produits",
          description: "Description courte du produit.",
        },
      ],
    },
    config: {
      showFilters: true,
      showSearch: true,
      showSort: true,
      showViewModeToggle: true,
      columns: 4,
      showRating: true,
      showBadges: true,
      showWishlistButton: true,
      enablePriceFilter: true,
      enableCategoryFilter: true,
      filterStyle: "default",
      cardStyle: "default",
    },
    style: {
      colors: {
        background: "white",
        text: "primary",
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

export default productsContentSchema;
