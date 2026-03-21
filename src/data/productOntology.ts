import { CategoryAttribute } from "./types";

export interface Subcategory {
  id: string;
  name: string;
  attributes: Omit<CategoryAttribute, "id" | "categoryId">[];
}

export interface OntologyCategory {
  id: string;
  name: string;
  subcategories: Subcategory[];
}

// Couleurs standards réutilisables
const COLORS = [
  "Noir", "Blanc", "Gris", "Rouge", "Bleu", "Vert", "Jaune", "Orange", 
  "Rose", "Violet", "Marron", "Beige", "Or", "Argent", "Multicolore"
];

// Tailles standards réutilisables
const CLOTHING_SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL"];
const SHOE_SIZES = ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48"];

export const PRODUCT_ONTOLOGY: OntologyCategory[] = [
  {
    id: "electronics",
    name: "Électronique & High-Tech",
    subcategories: [
      {
        id: "smartphones",
        name: "Téléphones & Smartphones",
        attributes: [
          { name: "brand", label: "Marque", type: "select", required: true, sortOrder: 1, options: ["Apple", "Samsung", "Google", "Xiaomi", "Oppo", "Huawei", "OnePlus", "Autre"] },
          { name: "condition", label: "État", type: "select", required: true, sortOrder: 2, options: ["Neuf", "Reconditionné (Parfait état)", "Reconditionné (Très bon état)", "Occasion", "Pour pièces"] },
          { name: "storage", label: "Capacité de Stockage", type: "multiselect", required: true, sortOrder: 3, options: ["32 Go", "64 Go", "128 Go", "256 Go", "512 Go", "1 To"] },
          { name: "ram", label: "Mémoire vive (RAM)", type: "multiselect", required: true, sortOrder: 4, options: ["2 Go", "3 Go", "4 Go", "6 Go", "8 Go", "12 Go", "16 Go"] },
          { name: "color", label: "Couleur", type: "color", required: true, sortOrder: 5, options: COLORS },
          { name: "os", label: "Système d'exploitation", type: "select", required: false, sortOrder: 6, options: ["iOS", "Android", "HarmonyOS", "Autre"] },
        ]
      },
      {
        id: "laptops",
        name: "Ordinateurs & Laptops",
        attributes: [
          { name: "brand", label: "Marque", type: "select", required: true, sortOrder: 1, options: ["Apple", "Dell", "HP", "Lenovo", "Asus", "Acer", "MSI", "Autre"] },
          { name: "condition", label: "État", type: "select", required: true, sortOrder: 2, options: ["Neuf", "Reconditionné", "Occasion", "Pour pièces"] },
          { name: "processor", label: "Processeur", type: "select", required: true, sortOrder: 3, options: ["Intel Core i3", "Intel Core i5", "Intel Core i7", "Intel Core i9", "AMD Ryzen 3", "AMD Ryzen 5", "AMD Ryzen 7", "AMD Ryzen 9", "Apple M1/M2/M3", "Autre"] },
          { name: "ram", label: "Mémoire vive (RAM)", type: "multiselect", required: true, sortOrder: 4, options: ["4 Go", "8 Go", "16 Go", "32 Go", "64 Go", "128 Go"] },
          { name: "storage", label: "Stockage (SSD/HDD)", type: "multiselect", required: true, sortOrder: 5, options: ["128 Go", "256 Go", "512 Go", "1 To", "2 To", "4 To"] },
          { name: "screen_size", label: "Taille d'écran", type: "select", required: true, sortOrder: 6, options: ["11\"", "12\"", "13\"", "14\"", "15\"", "16\"", "17\"", "Autre"] },
          { name: "color", label: "Couleur", type: "color", required: true, sortOrder: 7, options: COLORS },
        ]
      },
      {
        id: "audio",
        name: "Audio & Casques",
        attributes: [
          { name: "brand", label: "Marque", type: "select", required: true, sortOrder: 1, options: ["Sony", "Bose", "Apple", "JBL", "Sennheiser", "Beats", "Marshall", "Autre"] },
          { name: "type", label: "Type", type: "select", required: true, sortOrder: 2, options: ["Casque supra-auriculaire", "Casque circum-auriculaire", "Écouteurs sans fil", "Écouteurs filaires", "Enceinte Bluetooth", "Barre de son"] },
          { name: "condition", label: "État", type: "select", required: true, sortOrder: 3, options: ["Neuf", "Reconditionné", "Occasion"] },
          { name: "features", label: "Fonctionnalités", type: "multiselect", required: false, sortOrder: 4, options: ["Réduction de bruit active", "Micro intégré", "Résistant à l'eau", "Son Spatial"] },
          { name: "color", label: "Couleur", type: "color", required: true, sortOrder: 5, options: COLORS },
        ]
      }
    ]
  },
  {
    id: "clothing",
    name: "Mode & Vêtements",
    subcategories: [
      {
        id: "tops",
        name: "Hauts (T-shirts, Chemises, Pulls)",
        attributes: [
          { name: "gender", label: "Genre", type: "multiselect", required: true, sortOrder: 1, options: ["Homme", "Femme", "Enfant", "Bébé", "Unisexe"] },
          { name: "size", label: "Taille", type: "multiselect", required: true, sortOrder: 2, options: CLOTHING_SIZES },
          { name: "brand", label: "Marque", type: "select", required: false, sortOrder: 3, options: ["Nike", "Adidas", "Zara", "H&M", "Levi's", "Ralph Lauren", "Gucci", "Uniqlo", "Sans Marque", "Autre"] },
          { name: "condition", label: "État", type: "select", required: true, sortOrder: 4, options: ["Neuf avec étiquette", "Neuf sans étiquette", "Très bon état", "Bon état", "Satisfaisant"] },
          { name: "material", label: "Matière", type: "select", required: true, sortOrder: 5, options: ["Coton", "Polyester", "Laine", "Soie", "Lin", "Nylon", "Synthétique", "Mélange"] },
          { name: "color", label: "Couleur Principale", type: "color", required: true, sortOrder: 6, options: COLORS },
        ]
      },
      {
        id: "bottoms",
        name: "Bas (Pantalons, Jeans, Shorts, Jupes)",
        attributes: [
          { name: "gender", label: "Genre", type: "multiselect", required: true, sortOrder: 1, options: ["Homme", "Femme", "Enfant", "Bébé", "Unisexe"] },
          { name: "size", label: "Taille", type: "multiselect", required: true, sortOrder: 2, options: ["28", "30", "32", "34", "36", "38", "40", "42", "44", "46", "48", "50", "XS", "S", "M", "L", "XL", "XXL"] },
          { name: "brand", label: "Marque", type: "select", required: false, sortOrder: 3, options: ["Levi's", "Diesel", "Zara", "Nike", "Adidas", "Sans Marque", "Autre"] },
          { name: "condition", label: "État", type: "select", required: true, sortOrder: 4, options: ["Neuf", "Très bon état", "Bon état", "Satisfaisant"] },
          { name: "fit", label: "Coupe", type: "select", required: false, sortOrder: 5, options: ["Slim", "Skinny", "Regular / Droit", "Relaxed / Large", "Bootcut"] },
          { name: "color", label: "Couleur", type: "color", required: true, sortOrder: 6, options: COLORS },
        ]
      },
      {
        id: "shoes",
        name: "Chaussures",
        attributes: [
          { name: "gender", label: "Genre", type: "multiselect", required: true, sortOrder: 1, options: ["Homme", "Femme", "Enfant", "Bébé", "Unisexe"] },
          { name: "size", label: "Pointure (EU)", type: "multiselect", required: true, sortOrder: 2, options: SHOE_SIZES },
          { name: "shoe_type", label: "Type de chaussures", type: "select", required: true, sortOrder: 3, options: ["Baskets / Sneakers", "Chaussures de ville", "Bottes / Bottines", "Sandales", "Talons", "Chaussons", "Chaussures de sport"] },
          { name: "brand", label: "Marque", type: "select", required: true, sortOrder: 4, options: ["Nike", "Adidas", "Jordan", "Puma", "New Balance", "Vans", "Converse", "Timberland", "Gucci", "Balenciaga", "Autre"] },
          { name: "condition", label: "État", type: "select", required: true, sortOrder: 5, options: ["Neuf avec boîte", "Neuf sans boîte", "Très bon état", "Bon état"] },
          { name: "color", label: "Couleur", type: "color", required: true, sortOrder: 6, options: COLORS },
        ]
      }
    ]
  },
  {
    id: "jewelry",
    name: "Bijoux & Montres",
    subcategories: [
      {
        id: "watches",
        name: "Montres",
        attributes: [
          { name: "brand", label: "Marque", type: "select", required: true, sortOrder: 1, options: ["Rolex", "Seiko", "Casio", "Omega", "Cartier", "Tissot", "Tag Heuer", "Apple", "Garmin", "Autre"] },
          { name: "gender", label: "Genre", type: "multiselect", required: true, sortOrder: 2, options: ["Homme", "Femme", "Unisexe", "Enfant"] },
          { name: "movement", label: "Mouvement", type: "select", required: true, sortOrder: 3, options: ["Automatique", "Quartz", "Mécanique (Manuel)", "Solaire", "Connectée / Smartwatch"] },
          { name: "case_material", label: "Matériau du boîtier", type: "select", required: true, sortOrder: 4, options: ["Acier", "Or jaune", "Or blanc", "Or rose", "Titane", "Céramique", "Plastique / Résine", "Carbone"] },
          { name: "strap_material", label: "Matériau du bracelet", type: "select", required: true, sortOrder: 5, options: ["Acier", "Cuir", "Caoutchouc / Silicone", "Nylon / Tissu", "Or", "Titane", "Céramique"] },
          { name: "condition", label: "État", type: "select", required: true, sortOrder: 6, options: ["Neuf", "Très bon état", "Bon état", "A restaurer"] },
          { name: "color", label: "Couleur du cadran", type: "color", required: false, sortOrder: 7, options: COLORS },
        ]
      },
      {
        id: "jewelry_pieces",
        name: "Bijoux (Bagues, Colliers, Bracelets)",
        attributes: [
          { name: "jewel_type", label: "Type de bijou", type: "select", required: true, sortOrder: 1, options: ["Bague", "Collier", "Bracelet", "Boucles d'oreilles", "Pendentif", "Broche", "Parure"] },
          { name: "gender", label: "Genre", type: "multiselect", required: true, sortOrder: 2, options: ["Homme", "Femme", "Unisexe", "Enfant"] },
          { name: "main_material", label: "Matériau principal", type: "select", required: true, sortOrder: 3, options: ["Or jaune", "Or blanc", "Or rose", "Argent", "Platine", "Acier inoxydable", "Plaqué or", "Fantaisie", "Cuir"] },
          { name: "stone", label: "Pierre précieuse", type: "select", required: false, sortOrder: 4, options: ["Diamant", "Saphir", "Rubis", "Émeraude", "Perle", "Zirconium", "Améthyste", "Quartz", "Aucune"] },
          { name: "condition", label: "État", type: "select", required: true, sortOrder: 5, options: ["Neuf", "Occasion - Excellent", "Occasion - Bon état"] },
          { name: "color", label: "Couleur", type: "color", required: false, sortOrder: 6, options: COLORS },
        ]
      }
    ]
  },
  {
    id: "beauty",
    name: "Beauté & Santé",
    subcategories: [
      {
        id: "perfume",
        name: "Parfums",
        attributes: [
          { name: "gender", label: "Genre", type: "multiselect", required: true, sortOrder: 1, options: ["Femme", "Homme", "Unisexe", "Enfant"] },
          { name: "brand", label: "Marque", type: "select", required: true, sortOrder: 2, options: ["Chanel", "Dior", "Yves Saint Laurent", "Lancôme", "Guerlain", "Paco Rabanne", "Hugo Boss", "Hermès", "Autre"] },
          { name: "type", label: "Concentration", type: "select", required: true, sortOrder: 3, options: ["Eau de Parfum", "Eau de Toilette", "Eau de Cologne", "Extrait de Parfum"] },
          { name: "capacity", label: "Contenance", type: "select", required: true, sortOrder: 4, options: ["30 ml", "50 ml", "75 ml", "100 ml", "150 ml", "200 ml", "Autre"] },
          { name: "condition", label: "État", type: "select", required: true, sortOrder: 5, options: ["Neuf sous blister", "Neuf sans blister", "Entamé / Occasion"] },
          { name: "color", label: "Couleur", type: "color", required: false, sortOrder: 6, options: COLORS },
        ]
      },
      {
        id: "makeup",
        name: "Maquillage & Soins",
        attributes: [
          { name: "category", label: "Type de produit", type: "multiselect", required: true, sortOrder: 1, options: ["Teint (Fond de teint, Correcteur)", "Yeux (Mascara, Fard)", "Lèvres (Rouge à lèvres, Gloss)", "Ongles", "Soin du visage", "Soin du corps", "Cheveux"] },
          { name: "brand", label: "Marque", type: "select", required: false, sortOrder: 2, options: ["L'Oréal", "Mac", "Sephora", "Nars", "Fenty Beauty", "Clinique", "Autre"] },
          { name: "condition", label: "État", type: "select", required: true, sortOrder: 3, options: ["Neuf avec emballage", "Neuf (Jamais utilisé)", "Peu utilisé (Swatched)"] },
          { name: "color", label: "Couleur", type: "color", required: false, sortOrder: 4, options: COLORS },
        ]
      }
    ]
  },
  {
    id: "home",
    name: "Maison & Ameublement",
    subcategories: [
      {
        id: "furniture",
        name: "Meubles",
        attributes: [
          { name: "furniture_type", label: "Type de meuble", type: "select", required: true, sortOrder: 1, options: ["Canapé / Fauteuil", "Table", "Chaise", "Lit", "Armoire / Dressing", "Commode / Buffet", "Bureau", "Meuble TV"] },
          { name: "material", label: "Matière principale", type: "select", required: true, sortOrder: 2, options: ["Bois massif", "MDF / Contreplaqué", "Métal", "Verre", "Cuir", "Tissu", "Plastique"] },
          { name: "condition", label: "État", type: "select", required: true, sortOrder: 3, options: ["Neuf", "Très bon état", "Bon état", "Nécessite restauration"] },
          { name: "color", label: "Couleur", type: "color", required: true, sortOrder: 4, options: COLORS },
        ]
      },
      {
        id: "appliances",
        name: "Électroménager",
        attributes: [
          { name: "appliance_type", label: "Type d'appareil", type: "select", required: true, sortOrder: 1, options: ["Réfrigérateur", "Machine à laver", "Lave-vaisselle", "Four", "Micro-ondes", "Aspirateur", "Cafetière", "Autre petit électroménager"] },
          { name: "brand", label: "Marque", type: "select", required: true, sortOrder: 2, options: ["Samsung", "Bosch", "LG", "Whirlpool", "Dyson", "Moulinex", "Philips", "Autre"] },
          { name: "condition", label: "État", type: "select", required: true, sortOrder: 3, options: ["Neuf", "Reconditionné", "Occasion", "Pour pièces"] },
          { name: "color", label: "Couleur", type: "color", required: false, sortOrder: 4, options: COLORS },
        ]
      }
    ]
  },
  {
    id: "auto",
    name: "Automobile & Moto",
    subcategories: [
      {
        id: "parts",
        name: "Pièces Détachées & Accessoires",
        attributes: [
          { name: "vehicle_type", label: "Type de véhicule", type: "multiselect", required: true, sortOrder: 1, options: ["Voiture", "Moto", "Scooter", "Camion / Utilitaire", "Vélo / VAE"] },
          { name: "part_category", label: "Type de pièce", type: "select", required: true, sortOrder: 2, options: ["Moteur", "Carrosserie", "Éclairage", "Freinage", "Pneus & Jantes", "Intérieur", "Électronique embarquée", "Accessoire (Casque, Coffre...)"] },
          { name: "brand", label: "Marque compatible", type: "multiselect", required: true, sortOrder: 3, options: ["Renault", "Peugeot", "Citroën", "Volkswagen", "BMW", "Audi", "Mercedes", "Toyota", "Honda", "Yamaha", "Universel", "Autre"] },
          { name: "condition", label: "État", type: "select", required: true, sortOrder: 4, options: ["Neuf", "Occasion (Très bon état)", "Occasion (Bon état)", "À réparer"] },
          { name: "color", label: "Couleur", type: "color", required: false, sortOrder: 5, options: COLORS },
        ]
      }
    ]
  }
];

export const getSubcategories = (categoryId: string): Subcategory[] => {
  const category = PRODUCT_ONTOLOGY.find(cat => cat.id === categoryId);
  return category ? category.subcategories : [];
};

export const getAttributesForSubcategory = (categoryId: string, subcategoryId: string): Omit<CategoryAttribute, "id" | "categoryId">[] => {
  const subcategories = getSubcategories(categoryId);
  const subcategory = subcategories.find(sub => sub.id === subcategoryId);
  return subcategory ? subcategory.attributes : [];
};
