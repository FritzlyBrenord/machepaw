// ============================================
// SAMPLE PRODUCTS DATA
// ============================================

import type { Product, Category } from '@/types/ecommerce-types';

export const categories: Category[] = [
  {
    id: 'cat-1',
    name: 'Vêtements',
    slug: 'vetements',
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=400&fit=crop',
    description: 'Découvrez notre collection de vêtements tendance',
    productCount: 48,
  },
  {
    id: 'cat-2',
    name: 'Chaussures',
    slug: 'chaussures',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    description: 'Des chaussures pour toutes les occasions',
    productCount: 32,
  },
  {
    id: 'cat-3',
    name: 'Accessoires',
    slug: 'accessoires',
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&h=400&fit=crop',
    description: 'Complétez votre look avec nos accessoires',
    productCount: 24,
  },
  {
    id: 'cat-4',
    name: 'Électronique',
    slug: 'electronique',
    image: 'https://images.unsplash.com/photo-1498049860654-af1a5c5668ba?w=400&h=400&fit=crop',
    description: 'Les dernières nouveautés tech',
    productCount: 56,
  },
  {
    id: 'cat-5',
    name: 'Maison',
    slug: 'maison',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&h=400&fit=crop',
    description: 'Décorez votre intérieur avec style',
    productCount: 38,
  },
  {
    id: 'cat-6',
    name: 'Sport',
    slug: 'sport',
    image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=400&fit=crop',
    description: 'Équipement sportif de qualité',
    productCount: 42,
  },
];

export const products: Product[] = [
  // Vêtements
  {
    id: 'prod-1',
    name: 'T-Shirt Premium Coton',
    price: 29.99,
    oldPrice: 39.99,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=750&fit=crop',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=750&fit=crop',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=750&fit=crop',
    ],
    badge: '-25%',
    rating: 4.5,
    reviewCount: 128,
    sku: 'TSH-001',
    inStock: true,
    quantity: 50,
    category: 'vetements',
    subcategory: 't-shirts',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Noir', hex: '#000000' },
      { name: 'Blanc', hex: '#FFFFFF' },
      { name: 'Gris', hex: '#808080' },
      { name: 'Bleu Marine', hex: '#1a237e' },
    ],
    description: 'T-shirt premium en coton bio 100%. Coupe moderne et confortable, parfait pour un usage quotidien. Fabriqué avec des matériaux durables et respectueux de l\'environnement.',
    features: [
      '100% coton bio',
      'Coupe moderne',
      'Lavable en machine',
      'Fabriqué en France',
    ],
    specifications: {
      'Matière': 'Coton bio',
      'Poids': '180g/m²',
      'Entretien': 'Lavage 30°C',
    },
  },
  {
    id: 'prod-2',
    name: 'Jean Slim Fit',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=400&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=600&h=750&fit=crop',
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&h=750&fit=crop',
    ],
    rating: 4.7,
    reviewCount: 89,
    sku: 'JEA-001',
    inStock: true,
    quantity: 35,
    category: 'vetements',
    subcategory: 'jeans',
    sizes: ['28', '30', '32', '34', '36', '38'],
    colors: [
      { name: 'Bleu Foncé', hex: '#1a237e' },
      { name: 'Bleu Clair', hex: '#42a5f5' },
      { name: 'Noir', hex: '#000000' },
    ],
    description: 'Jean slim fit en denim stretch de haute qualité. Confort optimal et style intemporel.',
    features: [
      'Denim stretch',
      'Fermeture éclair',
      '5 poches',
      'Coupe slim',
    ],
  },
  {
    id: 'prod-3',
    name: 'Robe d\'Été Florale',
    price: 59.99,
    oldPrice: 79.99,
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=750&fit=crop',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&h=750&fit=crop',
    ],
    badge: 'Nouveau',
    rating: 4.8,
    reviewCount: 156,
    sku: 'ROB-001',
    inStock: true,
    quantity: 25,
    category: 'vetements',
    subcategory: 'robes',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Rouge', hex: '#e53935' },
      { name: 'Bleu', hex: '#1e88e5' },
      { name: 'Vert', hex: '#43a047' },
    ],
    description: 'Robe légère et fluide avec imprimé floral. Parfaite pour les journées ensoleillées.',
    features: [
      'Tissu léger',
      'Imprimé floral',
      'Col en V',
      'Taille élastique',
    ],
  },
  {
    id: 'prod-4',
    name: 'Veste en Cuir',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=750&fit=crop',
      'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=600&h=750&fit=crop',
    ],
    rating: 4.9,
    reviewCount: 67,
    sku: 'VES-001',
    inStock: true,
    quantity: 15,
    category: 'vetements',
    subcategory: 'vestes',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Noir', hex: '#000000' },
      { name: 'Marron', hex: '#795548' },
    ],
    description: 'Veste en cuir véritable de première qualité. Style intemporel et durabilité exceptionnelle.',
    features: [
      'Cuir véritable',
      'Doublure polyester',
      'Fermeture éclair YKK',
      'Poches intérieures',
    ],
  },
  
  // Chaussures
  {
    id: 'prod-5',
    name: 'Baskets Running Pro',
    price: 129.99,
    oldPrice: 159.99,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=750&fit=crop',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=750&fit=crop',
    ],
    badge: 'Populaire',
    rating: 4.6,
    reviewCount: 234,
    sku: 'BAT-001',
    inStock: true,
    quantity: 40,
    category: 'chaussures',
    subcategory: 'baskets',
    sizes: ['38', '39', '40', '41', '42', '43', '44', '45'],
    colors: [
      { name: 'Rouge', hex: '#e53935' },
      { name: 'Noir', hex: '#000000' },
      { name: 'Blanc', hex: '#FFFFFF' },
    ],
    description: 'Baskets de running avec technologie d\'amorti avancée. Confort maximal pour vos entraînements.',
    features: [
      'Amorti React',
      'Tige respirante',
      'Semelle antidérapante',
      'Légèreté',
    ],
  },
  {
    id: 'prod-6',
    name: 'Chaussures Élégantes',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=750&fit=crop',
      'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&h=750&fit=crop',
    ],
    rating: 4.4,
    reviewCount: 78,
    sku: 'CHAU-001',
    inStock: true,
    quantity: 30,
    category: 'chaussures',
    subcategory: 'elegantes',
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    colors: [
      { name: 'Noir', hex: '#000000' },
      { name: 'Marron', hex: '#795548' },
    ],
    description: 'Chaussures élégantes en cuir pour les occasions formelles. Confort et style raffiné.',
    features: [
      'Cuir véritable',
      'Semelle cuir',
      'Finition main',
    ],
  },
  
  // Accessoires
  {
    id: 'prod-7',
    name: 'Montre Classique',
    price: 149.99,
    oldPrice: 199.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=750&fit=crop',
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=750&fit=crop',
    ],
    badge: '-25%',
    rating: 4.7,
    reviewCount: 112,
    sku: 'MON-001',
    inStock: true,
    quantity: 20,
    category: 'accessoires',
    subcategory: 'montres',
    colors: [
      { name: 'Argent', hex: '#C0C0C0' },
      { name: 'Or', hex: '#FFD700' },
      { name: 'Noir', hex: '#000000' },
    ],
    description: 'Montre classique avec mouvement à quartz suisse. Élégance intemporelle.',
    features: [
      'Mouvement quartz',
      'Verre saphir',
      'Étanche 50m',
      'Garantie 2 ans',
    ],
  },
  {
    id: 'prod-8',
    name: 'Sac à Main Cuir',
    price: 179.99,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=750&fit=crop',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=750&fit=crop',
    ],
    rating: 4.8,
    reviewCount: 95,
    sku: 'SAC-001',
    inStock: true,
    quantity: 18,
    category: 'accessoires',
    subcategory: 'sacs',
    colors: [
      { name: 'Noir', hex: '#000000' },
      { name: 'Marron', hex: '#795548' },
      { name: 'Beige', hex: '#F5F5DC' },
    ],
    description: 'Sac à main en cuir italien de qualité supérieure. Design élégant et fonctionnel.',
    features: [
      'Cuir italien',
      'Doublure coton',
      'Poche zippée',
      'Bandoulière amovible',
    ],
  },
  
  // Électronique
  {
    id: 'prod-9',
    name: 'Casque Sans Fil Pro',
    price: 249.99,
    oldPrice: 299.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=750&fit=crop',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=750&fit=crop',
    ],
    badge: 'Best-seller',
    rating: 4.9,
    reviewCount: 567,
    sku: 'CAS-001',
    inStock: true,
    quantity: 45,
    category: 'electronique',
    subcategory: 'audio',
    colors: [
      { name: 'Noir', hex: '#000000' },
      { name: 'Blanc', hex: '#FFFFFF' },
      { name: 'Bleu', hex: '#1e88e5' },
    ],
    description: 'Casque sans fil avec réduction de bruit active. Son haute fidélité et confort prolongé.',
    features: [
      'Réduction de bruit active',
      'Autonomie 30h',
      'Bluetooth 5.0',
      'Commandes tactiles',
    ],
    specifications: {
      'Autonomie': '30 heures',
      'Bluetooth': '5.0',
      'Poids': '250g',
    },
  },
  {
    id: 'prod-10',
    name: 'Montre Connectée',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=750&fit=crop',
      'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&h=750&fit=crop',
    ],
    rating: 4.5,
    reviewCount: 234,
    sku: 'SMW-001',
    inStock: true,
    quantity: 38,
    category: 'electronique',
    subcategory: 'montres-connectees',
    colors: [
      { name: 'Noir', hex: '#000000' },
      { name: 'Gris', hex: '#808080' },
      { name: 'Rose', hex: '#e91e63' },
    ],
    description: 'Montre connectée avec suivi de la santé et des activités. Design moderne et fonctionnalités avancées.',
    features: [
      'Cardiofréquencemètre',
      'GPS intégré',
      'Étanche 50m',
      'Autonomie 7 jours',
    ],
    specifications: {
      'Écran': '1.4" AMOLED',
      'Autonomie': '7 jours',
      'Étanchéité': '5 ATM',
    },
  },
  {
    id: 'prod-11',
    name: 'Enceinte Bluetooth',
    price: 79.99,
    oldPrice: 99.99,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=750&fit=crop',
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&h=750&fit=crop',
    ],
    badge: 'Promo',
    rating: 4.3,
    reviewCount: 189,
    sku: 'ENC-001',
    inStock: true,
    quantity: 55,
    category: 'electronique',
    subcategory: 'audio',
    colors: [
      { name: 'Noir', hex: '#000000' },
      { name: 'Bleu', hex: '#1e88e5' },
      { name: 'Rouge', hex: '#e53935' },
    ],
    description: 'Enceinte portable Bluetooth avec son puissant. Parfaite pour vos sorties.',
    features: [
      'Son 360°',
      'Étanche IPX7',
      'Autonomie 12h',
      'Portée 20m',
    ],
  },
  
  // Maison
  {
    id: 'prod-12',
    name: 'Lampe Design',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&h=750&fit=crop',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&h=750&fit=crop',
    ],
    rating: 4.6,
    reviewCount: 87,
    sku: 'LAM-001',
    inStock: true,
    quantity: 22,
    category: 'maison',
    subcategory: 'luminaires',
    colors: [
      { name: 'Noir', hex: '#000000' },
      { name: 'Blanc', hex: '#FFFFFF' },
      { name: 'Laiton', hex: '#B5A642' },
    ],
    description: 'Lampe de table design avec lumière LED réglable. Ajoute une touche moderne à votre intérieur.',
    features: [
      'LED réglable',
      'Design scandinave',
      'Économie d\'énergie',
    ],
  },
  {
    id: 'prod-13',
    name: 'Coussin Décoratif',
    price: 34.99,
    oldPrice: 44.99,
    image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?w=400&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?w=600&h=750&fit=crop',
      'https://images.unsplash.com/photo-1629949009765-40fc74c9ec21?w=600&h=750&fit=crop',
    ],
    badge: '-22%',
    rating: 4.4,
    reviewCount: 156,
    sku: 'COU-001',
    inStock: true,
    quantity: 60,
    category: 'maison',
    subcategory: 'textile',
    colors: [
      { name: 'Beige', hex: '#F5F5DC' },
      { name: 'Gris', hex: '#808080' },
      { name: 'Bleu', hex: '#1e88e5' },
    ],
    description: 'Coussin décoratif en velours doux. Parfait pour votre canapé ou votre lit.',
    features: [
      'Velours doux',
      'Housse amovible',
      'Lavable',
    ],
  },
  
  // Sport
  {
    id: 'prod-14',
    name: 'Tapis de Yoga',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=750&fit=crop',
      'https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=600&h=750&fit=crop',
    ],
    rating: 4.7,
    reviewCount: 312,
    sku: 'TAP-001',
    inStock: true,
    quantity: 40,
    category: 'sport',
    subcategory: 'yoga',
    colors: [
      { name: 'Violet', hex: '#9c27b0' },
      { name: 'Vert', hex: '#43a047' },
      { name: 'Rose', hex: '#e91e63' },
    ],
    description: 'Tapis de yoga antidérapant en caoutchouc naturel. Confort et stabilité pour vos séances.',
    features: [
      'Caoutchouc naturel',
      'Antidérapant',
      'Épaisseur 5mm',
      'Écologique',
    ],
    specifications: {
      'Dimensions': '183 x 61 cm',
      'Épaisseur': '5mm',
      'Poids': '2.5kg',
    },
  },
  {
    id: 'prod-15',
    name: 'Haltères Réglables',
    price: 119.99,
    oldPrice: 149.99,
    image: 'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=400&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=600&h=750&fit=crop',
      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&h=750&fit=crop',
    ],
    badge: 'Promo',
    rating: 4.8,
    reviewCount: 178,
    sku: 'HAL-001',
    inStock: true,
    quantity: 25,
    category: 'sport',
    subcategory: 'musculation',
    description: 'Haltères réglables de 2 à 24 kg. Parfait pour la musculation à domicile.',
    features: [
      'Poids ajustable',
      'Système rapide',
      'Poignée ergonomique',
      'Support inclus',
    ],
    specifications: {
      'Poids min': '2 kg',
      'Poids max': '24 kg',
      'Incréments': '16 niveaux',
    },
  },
  {
    id: 'prod-16',
    name: 'Gourde Sport',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=750&fit=crop',
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&h=750&fit=crop',
    ],
    rating: 4.5,
    reviewCount: 423,
    sku: 'GOU-001',
    inStock: true,
    quantity: 80,
    category: 'sport',
    subcategory: 'accessoires',
    colors: [
      { name: 'Noir', hex: '#000000' },
      { name: 'Bleu', hex: '#1e88e5' },
      { name: 'Rose', hex: '#e91e63' },
    ],
    description: 'Gourde sport en acier inoxydable isolée. Garde vos boissons froides 24h ou chaudes 12h.',
    features: [
      'Inox isolé',
      'Double paroi',
      'Sans BPA',
      '750ml',
    ],
  },
];

// Helper functions
export const getProductById = (id: string): Product | undefined => {
  return products.find((p) => p.id === id);
};

export const getProductsByCategory = (categorySlug: string): Product[] => {
  return products.filter((p) => p.category === categorySlug);
};

export const getRelatedProducts = (productId: string, limit: number = 4): Product[] => {
  const product = getProductById(productId);
  if (!product) return [];
  
  return products
    .filter((p) => p.id !== productId && p.category === product.category)
    .slice(0, limit);
};

export const searchProducts = (query: string): Product[] => {
  const lowercaseQuery = query.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(lowercaseQuery) ||
      p.description?.toLowerCase().includes(lowercaseQuery) ||
      p.category.toLowerCase().includes(lowercaseQuery)
  );
};

export const getFeaturedProducts = (limit: number = 8): Product[] => {
  return products
    .filter((p) => p.rating && p.rating >= 4.5)
    .slice(0, limit);
};

export const getNewArrivals = (limit: number = 8): Product[] => {
  return products
    .filter((p) => p.badge === 'Nouveau')
    .slice(0, limit);
};

export const getOnSaleProducts = (limit: number = 8): Product[] => {
  return products
    .filter((p) => p.oldPrice && p.oldPrice > p.price)
    .slice(0, limit);
};
