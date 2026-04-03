import type { SectionSchema } from "@/lib/section-registry";

export const productDetailSchema: SectionSchema = {
  name: "Product Detail",
  type: "productDetail",
  category: "product",
  description: "Fiche produit detaillee configurable",
  icon: "ShoppingBag",
  settings: [
    { id: "content.product.name", type: "text", label: "Nom produit", default: "Produit Exemple" },
    { id: "content.product.price", type: "number", label: "Prix", default: 149 },
    { id: "content.product.oldPrice", type: "number", label: "Ancien prix", default: 199 },
    { id: "content.product.image", type: "image", label: "Image principale", default: "" },
    { id: "content.product.description", type: "textarea", label: "Description", default: "Description detaillee de votre produit." },
    { id: "content.product.rating", type: "range", label: "Note", min: 0, max: 5, step: 0.1, default: 4.8 },
    { id: "content.product.reviewCount", type: "number", label: "Nombre d'avis", default: 42 },
    { id: "content.product.badge", type: "text", label: "Badge", default: "Nouveau" },
    { id: "content.product.sku", type: "text", label: "SKU", default: "PROD-001" },
    { id: "content.addToCartLabel", type: "text", label: "Texte ajouter au panier", default: "Ajouter au panier" },
    { id: "content.sizeGuideLabel", type: "text", label: "Texte guide des tailles", default: "Guide des tailles" },
    { id: "content.shippingLabels.freeShipping", type: "text", label: "Livraison", default: "Livraison gratuite des 100 EUR d'achat" },
    { id: "content.shippingLabels.freeReturns", type: "text", label: "Retours", default: "Retours gratuits sous 30 jours" },
    { id: "content.shippingLabels.securePayment", type: "text", label: "Paiement", default: "Paiement 100% securise" },
    { id: "config.showReviews", type: "checkbox", label: "Afficher les avis", default: true },
    { id: "config.showSizeGuide", type: "checkbox", label: "Afficher guide des tailles", default: true },
    { id: "config.showShippingInfo", type: "checkbox", label: "Afficher infos livraison", default: true },
    { id: "content.attributeLabels.size", type: "text", label: "Label attribut taille", default: "Taille" },
    { id: "content.attributeLabels.color", type: "text", label: "Label attribut couleur", default: "Couleur" },
    { id: "content.addedToCartMessage", type: "text", label: "Message ajoute au panier (utiliser {name})", default: "{name} a ete ajoute au panier" },
  ],
  blocks: [
    {
      type: "color",
      name: "Couleurs",
      itemsPath: "content.product.colors",
      settings: [
        { id: "name", type: "text", label: "Nom", default: "Noir" },
        { id: "hex", type: "color", label: "Couleur", default: "#1a1a1a" },
      ],
    },
  ],
  maxBlocks: 12,
  defaults: {
    content: {
      product: {
        id: "1",
        name: "Produit Exemple",
        price: 149,
        oldPrice: 199,
        image:
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=800&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=800&fit=crop",
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=800&fit=crop",
        ],
        description: "Description detaillee de votre produit avec toutes ses caracteristiques.",
        badge: "Nouveau",
        rating: 4.8,
        reviewCount: 42,
        sku: "PROD-001",
        sizes: ["S", "M", "L", "XL"],
        colors: [
          { name: "Noir", hex: "#1a1a1a" },
          { name: "Blanc", hex: "#ffffff" },
          { name: "Gris", hex: "#808080" },
        ],
      },
      addToCartLabel: "Ajouter au panier",
      sizeGuideLabel: "Guide des tailles",
      shippingLabels: {
        freeShipping: "Livraison gratuite des 100 EUR d'achat",
        freeReturns: "Retours gratuits sous 30 jours",
        securePayment: "Paiement 100% securise",
      },
      attributeLabels: {
        size: "Taille",
        color: "Couleur",
      },
      addedToCartMessage: "{name} a ete ajoute au panier",
    },
    config: {
      showReviews: true,
      showSizeGuide: true,
      showShippingInfo: true,
      showWishlist: true,
      animation: {
        entrance: "fade-in",
      },
    },
    style: {
      colors: {
        background: "white",
        text: "primary",
        accent: "accent",
        border: "#e5e5e5",
      },
      spacing: {
        paddingY: "16",
        container: "contained",
      },
    },
    classes: {},
  },
};

export default productDetailSchema;
