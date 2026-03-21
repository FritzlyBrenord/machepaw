import { Product, Category, Review, User, Order } from "./types";

export const categories: Category[] = [
  {
    id: "cat-1",
    name: "Montres",
    slug: "montres",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
    productCount: 48,
    description: "Collection de montres de luxe suisses et internationales"
  },
  {
    id: "cat-2",
    name: "Bijoux",
    slug: "bijoux",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600",
    productCount: 124,
    description: "Bagues, colliers, bracelets et boucles d'oreilles d'exception"
  },
  {
    id: "cat-3",
    name: "Maroquinerie",
    slug: "maroquinerie",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600",
    productCount: 86,
    description: "Sacs à main, portefeuilles et accessoires en cuir premium"
  },
  {
    id: "cat-4",
    name: "Mode",
    slug: "mode",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600",
    productCount: 256,
    description: "Prêt-à-porter haute couture et collections exclusives"
  },
  {
    id: "cat-5",
    name: "Chaussures",
    slug: "chaussures",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600",
    productCount: 72,
    description: "Chaussures de luxe pour hommes et femmes"
  },
  {
    id: "cat-6",
    name: "Accessoires",
    slug: "accessoires",
    image: "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600",
    productCount: 156,
    description: "Lunettes, ceintures, foulards et accessoires de mode"
  }
];

export const products: Product[] = [
  {
    id: "prod-1",
    name: "Royal Oak Chronograph",
    description: "Montre chronographe automatique en acier inoxydable avec cadran bleu «Grande Tapisserie». Boîtier de 41mm, mouvement manufacture à remontage automatique. Édition limitée.",
    price: 28500,
    originalPrice: 32000,
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
      "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800",
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800",
      "https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=800"
    ],
    category: "Montres",
    subcategory: "Chronographes",
    tags: ["Montre", "Chronographe", "Acier", "Automatique", "Edition Limitée"],
    rating: 4.9,
    reviewCount: 127,
    stock: 5,
    sku: "ROC-2024-001",
    features: [
      "Mouvement automatique manufacture",
      "Réserve de marche 50 heures",
      "Étanche 50m",
      "Cadran Grande Tapisserie",
      "Verre saphir anti-reflet"
    ],
    specifications: {
      "Boîtier": "Acier inoxydable 41mm",
      "Mouvement": "Automatique Calibre 4401",
      "Bracelet": "Acier avec boucle déployante",
      "Cadran": "Bleu Grande Tapisserie",
      "Fonctions": "Chronographe, date"
    },
    isNew: false,
    isBestseller: true,
    discount: 10
  },
  {
    id: "prod-2",
    name: "Collier Diamant Éternité",
    description: "Collier en or blanc 18k serti de diamants taille brillant. Design intemporel qui capture la lumière à chaque mouvement. Chaîne ajustable 40-45cm.",
    price: 12500,
    images: [
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800",
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800",
      "https://images.unsplash.com/photo-1602751584552-8ba4f0f0a0e2?w=800"
    ],
    category: "Bijoux",
    subcategory: "Colliers",
    tags: ["Collier", "Diamant", "Or Blanc", "Haute Joaillerie"],
    rating: 5.0,
    reviewCount: 89,
    stock: 3,
    sku: "CDE-2024-002",
    features: [
      "Or blanc 18 carats",
      "Diamants VS1/F-G taille brillant",
      "Poids total des diamants: 2.5 carats",
      "Fermoir sécurisé",
      "Certificat dauthenticité"
    ],
    specifications: {
      "Métal": "Or blanc 18k (750/1000)",
      "Diamants": "22 diamants taille brillant",
      "Poids total": "2.5 carats",
      "Longueur": "40-45 cm ajustable",
      "Fermoir": "Mousqueton sécurisé"
    },
    isNew: true,
    isBestseller: true
  },
  {
    id: "prod-3",
    name: "Sac à Main Riviera",
    description: "Sac à main en cuir de veau italien grainé. Finitions impeccables, doublure en daim. Bandoulière chaîne amovible. Le compagnon élégant pour toutes vos sorties.",
    price: 4200,
    originalPrice: 4800,
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800",
      "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800"
    ],
    category: "Maroquinerie",
    subcategory: "Sacs à Main",
    tags: ["Sac", "Cuir", "Italien", "Bandoulière"],
    rating: 4.8,
    reviewCount: 234,
    stock: 12,
    sku: "SAR-2024-003",
    features: [
      "Cuir de veau grainé italien",
      "Doublure daim premium",
      "Bandoulière chaîne amovible",
      "Fermoir magnétique doré",
      "Poche intérieure zippée"
    ],
    specifications: {
      "Matière": "Cuir de veau grainé",
      "Doublure": "Daim premium",
      "Dimensions": "28 x 20 x 12 cm",
      "Bandoulière": "Chaîne dorée amovible",
      "Fermoir": "Magnétique laiton doré"
    },
    isNew: false,
    isBestseller: true,
    discount: 12
  },
  {
    id: "prod-4",
    name: "Trench-Coat Iconique Beige",
    description: "Trench-coat en gabardine de coton imperméable. Coupe classique double boutonnage, ceinture à boucle en cuir. Fabriqué en France. Le trench intemporel.",
    price: 1890,
    images: [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800",
      "https://images.unsplash.com/photo-1544923246-77307dd628b9?w=800",
      "https://images.unsplash.com/photo-1591533385368-13359e19a877?w=800"
    ],
    category: "Mode",
    subcategory: "Manteaux",
    tags: ["Trench", "Beige", "Classique", "Imperméable"],
    rating: 4.7,
    reviewCount: 156,
    stock: 25,
    sku: "TCB-2024-004",
    features: [
      "Gabardine de coton imperméable",
      "Double boutonnage",
      "Ceinture cuir véritable",
      "Doublure viscose",
      "Fabriqué en France"
    ],
    specifications: {
      "Matière": "100% Coton gabardine",
      "Doublure": "100% Viscose",
      "Fermeture": "Double boutonnage + ceinture",
      "Entretien": "Nettoyage à sec recommandé",
      "Origine": "Fabriqué en France"
    },
    isNew: true,
    isBestseller: false
  },
  {
    id: "prod-5",
    name: "Escarpins Audrey Noir",
    description: "Escarpins en cuir verni noir. Talon aiguille 8cm, bout pointu. L'élégance intemporelle pour sublimer chaque tenue. Semelle cuir avec patin antidérapant.",
    price: 850,
    images: [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800",
      "https://images.unsplash.com/photo-1596703263926-5b492fce705f?w=800",
      "https://images.unsplash.com/photo-1515347619252-60a6bf4fffce?w=800"
    ],
    category: "Chaussures",
    subcategory: "Escarpins",
    tags: ["Escarpins", "Cuir", "Noir", "Talon"],
    rating: 4.6,
    reviewCount: 312,
    stock: 38,
    sku: "ESA-2024-005",
    features: [
      "Cuir verni italien",
      "Talon aiguille 8cm",
      "Bout pointu élégant",
      "Semelle cuir premium",
      "Confort optimal"
    ],
    specifications: {
      "Matière": "Cuir verni italien",
      "Talon": "8 cm aiguille",
      "Doublure": "Cuir respirant",
      "Semelle": "Cuir avec patin caoutchouc",
      "Origine": "Fabriqué en Italie"
    },
    isNew: false,
    isBestseller: true
  },
  {
    id: "prod-6",
    name: "Lunettes de Soleil Aviator Gold",
    description: "Lunettes de soleil aviateur en métal doré. Verres dégradés gris polarisés. Design iconique revisité avec des finitions luxueuses. Étui cuir inclus.",
    price: 450,
    originalPrice: 550,
    images: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800",
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800",
      "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800"
    ],
    category: "Accessoires",
    subcategory: "Lunettes",
    tags: ["Lunettes", "Soleil", "Aviateur", "Or", "Polarisé"],
    rating: 4.8,
    reviewCount: 189,
    stock: 45,
    sku: "LSA-2024-006",
    features: [
      "Monture métal doré 18k",
      "Verres dégradés polarisés",
      "Protection UV400",
      "Branches avec embouts acétate",
      "Étui cuir premium inclus"
    ],
    specifications: {
      "Monture": "Métal doré 18k",
      "Verres": "Nylon polarisé dégradé gris",
      "Protection": "UV400 100%",
      "Dimensions": "58-14-140mm",
      "Accessoires": "Étui cuir, chiffon microfibre"
    },
    isNew: true,
    isBestseller: false,
    discount: 18
  },
  {
    id: "prod-7",
    name: "Portefeuille Elegance Cuir",
    description: "Portefeuille continental en cuir de veau lisse. 12 emplacements cartes, poche zippée monnaie, compartiment billets. L'essentiel au quotidien avec style.",
    price: 320,
    images: [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800",
      "https://images.unsplash.com/photo-1606503825008-909a6184ad57?w=800"
    ],
    category: "Maroquinerie",
    subcategory: "Portefeuilles",
    tags: ["Portefeuille", "Cuir", "Continental", "Classique"],
    rating: 4.9,
    reviewCount: 423,
    stock: 67,
    sku: "PEC-2024-007",
    features: [
      "Cuir de veau lisse premium",
      "12 emplacements cartes",
      "Poche zippée monnaie",
      "Compartiment billets",
      "Finition artisanale"
    ],
    specifications: {
      "Matière": "Cuir de veau lisse",
      "Fermeture": "Bouton pression",
      "Dimensions": "19 x 10 cm ouvert",
      "Pochettes": "12 cartes, 1 monnaie, 2 billets",
      "Origine": "Fabriqué en Espagne"
    },
    isNew: false,
    isBestseller: true
  },
  {
    id: "prod-8",
    name: "Robe Midnight Blue Soie",
    description: "Robe longue en soie naturelle bleu nuit. Coupe fluide, dos nu avec drapé élégant. La robe parfaite pour vos soirées glamour. Doublure en satin.",
    price: 2400,
    originalPrice: 2800,
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800",
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800",
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800"
    ],
    category: "Mode",
    subcategory: "Robes",
    tags: ["Robe", "Soie", "Bleu", "Soirée", "Longue"],
    rating: 4.7,
    reviewCount: 78,
    stock: 15,
    sku: "RMS-2024-008",
    features: [
      "Soie naturelle 100%",
      "Coupe fluide flatteuse",
      "Dos nu drapé",
      "Doublure satin premium",
      "Fermeture invisible"
    ],
    specifications: {
      "Matière": "100% Soie naturelle",
      "Doublure": "Satin de polyester",
      "Longueur": "Longueur maxi (140cm)",
      "Fermeture": "Invisible côté",
      "Entretien": "Nettoyage à sec"
    },
    isNew: true,
    isBestseller: false,
    discount: 14
  },
  {
    id: "prod-9",
    name: "Bague Solitaire Eternité",
    description: "Bague solitaire en or jaune 18k, diamant taille brillant 1 carat. Sertissage griffe classique qui sublime la pierre. Alliance assortie disponible.",
    price: 18500,
    images: [
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800",
      "https://images.unsplash.com/photo-1599643477874-530a7be1064c?w=800"
    ],
    category: "Bijoux",
    subcategory: "Bagues",
    tags: ["Bague", "Solitaire", "Diamant", "Or Jaune", "Fiançailles"],
    rating: 5.0,
    reviewCount: 156,
    stock: 4,
    sku: "BSE-2024-009",
    features: [
      "Or jaune 18 carats",
      "Diamant 1 carat VS1/F",
      "Sertissage 6 griffes",
      "Certificat GIA",
      "Écrin de luxe inclus"
    ],
    specifications: {
      "Métal": "Or jaune 18k (750/1000)",
      "Diamant": "1 carat taille brillant",
      "Qualité": "VS1/F (GIA certifié)",
      "Sertissage": "6 griffes classique",
      "Tailles": "48-62 (ajustement gratuit)"
    },
    isNew: false,
    isBestseller: true
  },
  {
    id: "prod-10",
    name: "Mocassins Heritage Noir",
    description: "Mocassins en cuir verni noir, patte penny. Semelle cuir avec talon caoutchouc. Le chic décontracté pour l'homme moderne. Cousu Goodyear.",
    price: 680,
    images: [
      "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800"
    ],
    category: "Chaussures",
    subcategory: "Mocassins",
    tags: ["Mocassins", "Cuir", "Noir", "Penny", "Classique"],
    rating: 4.8,
    reviewCount: 267,
    stock: 29,
    sku: "MHN-2024-010",
    features: [
      "Cuir verni premium",
      "Patte penny classique",
      "Cousu Goodyear",
      "Semelle cuir + caoutchouc",
      "Conçu en Italie"
    ],
    specifications: {
      "Matière": "Cuir de veau verni",
      "Construction": "Cousu Goodyear",
      "Semelle": "Cuir avec insert caoutchouc",
      "Doublure": "Cuir vachette",
      "Origine": "Fabriqué en Italie"
    },
    isNew: false,
    isBestseller: true
  },
  {
    id: "prod-11",
    name: "Foulard Carré Art Deco Soie",
    description: "Foulard carré en soie twill imprimé motif Art Deco. Bords roulottés main. Le foulard iconique pour accessoiriser avec élégance. Dimensions 90x90cm.",
    price: 395,
    images: [
      "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800",
      "https://images.unsplash.com/photo-1584030373081-f37b7bb4fa33?w=800"
    ],
    category: "Accessoires",
    subcategory: "Foulards",
    tags: ["Foulard", "Soie", "Art Deco", "Imprimé", "Carré"],
    rating: 4.9,
    reviewCount: 198,
    stock: 52,
    sku: "FAS-2024-011",
    features: [
      "Soie twill 100%",
      "Impression digitale haute définition",
      "Ourlet roulotté main",
      "Motif exclusif Art Deco",
      "Boîte cadeau incluse"
    ],
    specifications: {
      "Matière": "Soie twill 18 mommes",
      "Dimensions": "90 x 90 cm",
      "Finition": "Ourlet roulotté main",
      "Impression": "Digitale pigmentaire",
      "Entretien": "Nettoyage à sec"
    },
    isNew: true,
    isBestseller: false
  },
  {
    id: "prod-12",
    name: "Montre Nautilus Or Rose",
    description: "Montre de plongée en or rose 18k. Cadran bleu soleillé, lunette unidirectionnelle. Étanche 120m. Bracelet caoutchouc avec boucle déployante or.",
    price: 56800,
    images: [
      "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800",
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800",
      "https://images.unsplash.com/photo-1509941943102-10c232535736?w=800"
    ],
    category: "Montres",
    subcategory: "Plongée",
    tags: ["Montre", "Plongée", "Or Rose", "Haut de Gamme", "Étanche"],
    rating: 4.9,
    reviewCount: 67,
    stock: 2,
    sku: "MNO-2024-012",
    features: [
      "Boîtier or rose 18k 40mm",
      "Mouvement automatique manufacture",
      "Étanchéité 120m",
      "Lunette céramique bleue",
      "Verre saphir bombé"
    ],
    specifications: {
      "Boîtier": "Or rose 18k (750/1000) 40mm",
      "Mouvement": "Calibre manufacture automatique",
      "Cadran": "Bleu soleillé avec index or",
      "Bracelet": "Caoutchouc avec boucle or rose",
      "Étanchéité": "120 mètres (12 ATM)"
    },
    isNew: true,
    isBestseller: false
  }
];

export const reviews: Review[] = [
  {
    id: "rev-1",
    productId: "prod-1",
    userName: "Alexandre D.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    rating: 5,
    comment: "Une montre exceptionnelle ! La finition est impeccable et le cadran bleu est magnifique. Service client parfait, livraison rapide et soignée.",
    date: "2024-12-15",
    verified: true,
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"
    ]
  },
  {
    id: "rev-2",
    productId: "prod-1",
    userName: "Sophie L.",
    rating: 5,
    comment: "J'ai offert cette montre à mon mari pour nos 10 ans de mariage. Il est ravi ! Le bracelet est confortable et le mouvement très précis.",
    date: "2024-11-28",
    verified: true
  },
  {
    id: "rev-3",
    productId: "prod-1",
    userName: "Marc B.",
    rating: 4,
    comment: "Très belle montre, design intemporel. Seul petit bémol : le prix, mais la qualité est au rendez-vous. Je recommande.",
    date: "2024-10-10",
    verified: true
  },
  {
    id: "rev-4",
    productId: "prod-2",
    userName: "Isabelle M.",
    rating: 5,
    comment: "Ce collier est absolument sublime ! Les diamants brillent intensément, et la qualité de lor est remarquable. Un achat que je ne regrette pas.",
    date: "2024-12-20",
    verified: true
  },
  {
    id: "rev-5",
    productId: "prod-2",
    userName: "Julie R.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    rating: 5,
    comment: "Service exceptionnel de la part de l'équipe. Le collier a dépassé mes attentes. L'écrin est magnifique aussi, parfait pour offrir.",
    date: "2024-12-01",
    verified: true
  },
  {
    id: "rev-6",
    productId: "prod-3",
    userName: "Caroline P.",
    rating: 5,
    comment: "Le cuir est d'une qualité incroyable, le sac sent bon le cuir italien authentique. Les finitions sont parfaites, je l'utilise tous les jours.",
    date: "2024-11-15",
    verified: true,
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400"
    ]
  },
  {
    id: "rev-7",
    productId: "prod-5",
    userName: "Emma T.",
    rating: 5,
    comment: "Mes escarpins préférés ! Confortables même après une journée entière. Le cuir est souple et le talon très stable. Je vais prendre une autre couleur !",
    date: "2024-12-10",
    verified: true
  },
  {
    id: "rev-8",
    productId: "prod-7",
    userName: "Thomas G.",
    rating: 5,
    comment: "Portefeuille de grande qualité. Le cuir est magnifique et vieillit bien. Les emplacements cartes sont parfaits. Livraison rapide.",
    date: "2024-09-22",
    verified: true
  }
];

export const currentUser: User = {
  id: "user-1",
  email: "client@luxe.com",
  firstName: "Marie",
  lastName: "Dubois",
  avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
  addresses: [],
  wishlist: ["prod-2", "prod-4", "prod-9"],
  orders: ["order-1", "order-2"],
  createdAt: "2024-01-15"
};

export const orders: Order[] = [
  {
    id: "order-1",
    userId: "user-1",
    items: [
      {
        product: products[0],
        quantity: 1,
        price: 28500
      },
      {
        product: products[6],
        quantity: 2,
        price: 640
      }
    ],
    status: "delivered",
    total: 29140,
    shipping: 0,
    tax: 5828,
    createdAt: "2024-11-15T10:30:00Z",
    updatedAt: "2024-11-18T14:20:00Z",
    shippingAddress: currentUser.addresses[0],
    trackingNumber: "LX123456789FR",
    estimatedDelivery: "2024-11-18"
  },
  {
    id: "order-2",
    userId: "user-1",
    items: [
      {
        product: products[2],
        quantity: 1,
        price: 4200
      }
    ],
    status: "shipped",
    total: 4200,
    shipping: 15,
    tax: 840,
    createdAt: "2024-12-10T16:45:00Z",
    updatedAt: "2024-12-12T09:15:00Z",
    shippingAddress: currentUser.addresses[0],
    trackingNumber: "LX987654321FR",
    estimatedDelivery: "2024-12-16"
  }
];

export const heroSlides = [
  {
    id: 1,
    title: "Collection Montres 2025",
    subtitle: "L'Excellence Horlogère",
    description: "Découvrez notre nouvelle collection de montres de luxe, alliant tradition et innovation.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1920",
    cta: "Découvrir",
    link: "/collection/montres"
  },
  {
    id: 2,
    title: "Haute Joaillerie",
    subtitle: "Éclat Éternel",
    description: "Des pièces uniques serties des plus beaux diamants, créées par nos maîtres joailliers.",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920",
    cta: "Explorer",
    link: "/collection/bijoux"
  },
  {
    id: 3,
    title: "Maroquinerie Italienne",
    subtitle: "Artisanat d'Exception",
    description: "Sacs et accessoires en cuir premium, fabriqués à la main par des artisans italiens.",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1920",
    cta: "Voir la Collection",
    link: "/collection/maroquinerie"
  },
  {
    id: 4,
    title: "Nouvelle Collection Mode",
    subtitle: "Élégance Parisienne",
    description: "Les créations les plus désirables de la saison, directement des podiums parisiens.",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920",
    cta: "Shop Now",
    link: "/collection/mode"
  }
];
