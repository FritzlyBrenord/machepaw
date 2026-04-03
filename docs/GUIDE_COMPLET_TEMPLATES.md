# GUIDE COMPLET - TEMPLATES ET SECTIONS

> Document pour créer des templates automatiquement avec une IA

---

## 📋 STRUCTURE D'UN TEMPLATE

```typescript
{
  id: "nom-unique",
  name: "Nom affiché",
  description: "Description du template",
  category: "home|product|cart|checkout|content",
  preview: "/images/preview.jpg",
  isDefault: boolean,
  sections: [
    {
      type: "nom-section",
      props: { /* voir chaque section ci-dessous */ }
    }
  ],
  settings: {
    primaryColor: "#d4af37",
    secondaryColor: "#1a1a1a",
    backgroundColor: "#ffffff",
    fontFamily: "serif|sans|mono",
    spacing: "compact|normal|relaxed"
  }
}
```

---

## 🏠 PAGE ACCUEIL - Sections Disponibles

### 1. HEADER MODERNE (`headerModern`)

**Catégorie:** Header

#### Paramètres disponibles:

```typescript
{
  content: {
    logo: {
      text: string,           // "VOTRE MARQUE"
      image: string (url)     // "" ou URL image
    },
    navigation: Array<{      // Liens navigation
      label: string,         // "Accueil"
      href: string,          // "/"
      enabled: boolean      // true
    }>,
    ctaButton: {
      text: string,          // "Acheter"
      href: string           // "/produit"
    }
  },
  config: {
    variant: "default|split|centered|transparent|floating",
    behavior: {
      sticky: boolean,       // true
      transparentAtTop: boolean,  // false - Rendre transparent en haut de page
      blurOnScroll: boolean,      // false - Effet flou au scroll
      elevatedOnScroll: boolean   // false - Ombre au scroll
    }
  }
}
```

#### 🎨 Header Transparent (au-dessus du Hero):

```typescript
{
  type: "headerModern",
  props: {
    content: {
      logo: { text: "MA MARQUE" },
      navigation: [
        { label: "Accueil", href: "/", enabled: true },
        { label: "Produits", href: "/produits", enabled: true }
      ],
      ctaButton: { text: "Shop", href: "/produits" }
    },
    config: {
      variant: "transparent",           // Variant transparent
      behavior: {
        sticky: true,
        transparentAtTop: true,         // ← Transparent en haut
        blurOnScroll: true,               // ← Flou au scroll (optionnel)
        elevatedOnScroll: true            // ← Ombre au scroll (optionnel)
      }
    },
    styles: {
      backgroundColor: "#ffffff",        // Couleur après scroll
      textColor: "#1a1a1a",             // Couleur texte par défaut
      accentColor: "#d4af37"            // Couleur accent
    }
  }
}
```

#### Exemple simple:

```typescript
{
  type: "headerModern",
  props: {
    content: {
      logo: { text: "MA MARQUE" },
      navigation: [
        { label: "Accueil", href: "/", enabled: true },
        { label: "Produits", href: "/produits", enabled: true }
      ],
      ctaButton: { text: "Shop", href: "/produits" }
    },
    config: {
      variant: "transparent",
      behavior: { sticky: true, transparentAtTop: true }
    }
  }
}
```

---

### 2. HEADER MINIMAL (`headerMinimal`)

**Catégorie:** Header

#### Paramètres:

```typescript
{
  logo: {
    text: string,
    image: string (url)
  },
  styles: {
    backgroundColor: string,  // "#ffffff"
    textColor: string,        // "#1a1a1a"
    paddingY: number          // 16
  }
}
```

#### Exemple:

```typescript
{
  type: "headerMinimal",
  props: {
    logo: { text: "LUXE" },
    styles: { backgroundColor: "#000", textColor: "#fff", paddingY: 20 }
  }
}
```

---

### 3. ANNOUNCEMENT BAR (`announcementBar`)

**Catégorie:** Header

#### Paramètres:

```typescript
{
  content: {
    messages: string,         // Messages séparés par \n
    autoRotate: boolean,     // true
    interval: number,        // 5000 (ms)
    dismissible: boolean     // false
  },
  config: {
    variant: "default|minimal|rotating|marquee",
    layout: "center|slider|split",
    icon: "sparkles|truck|tag|gift|clock|star",
    showNavigation: boolean, // true
    showDots: boolean,       // false
    showCloseButton: boolean // false
  },
  styles: {
    backgroundColor: string,  // "#1a1a1a"
    textColor: string,        // "#ffffff"
    accentColor: string,      // "#d4af37"
    paddingY: number          // 12
  }
}
```

#### Exemple avec rotation:

```typescript
{
  type: "announcementBar",
  props: {
    content: {
      messages: "Livraison gratuite dès 100€\nRetours gratuits sous 30 jours\nNouvelle collection disponible",
      autoRotate: true,
      interval: 4000
    },
    config: {
      variant: "rotating",
      icon: "truck",
      showNavigation: true
    },
    styles: {
      backgroundColor: "#d4af37",
      textColor: "#1a1a1a"
    }
  }
}
```

---

### 4. HERO (`hero`) ⭐ SECTION PRINCIPALE

**Catégorie:** Content

#### Paramètres - VERSION SIMPLE (une image):

```typescript
{
  content: {
    title: string,            // "L'Art du Style Moderne"
    subtitle: string,          // "Une collection exclusive..."
    media: {
      type: "image",         // "image|video|carousel"
      src: string (url),     // URL image
      videoSrc: string       // URL vidéo (si type="video")
    },
    pretitle: {
      text: string           // "Nouvelle Collection"
    },
    body: string,            // Texte additionnel
    cta: {
      primary: {
        text: string,        // "Explorer"
        href: string         // "/produits"
      },
      secondary: {
        text: string,        // "Notre Histoire"
        href: string         // "/a-propos"
      }
    }
  },
  config: {
    variant: "fullscreen-center|fullscreen-left|fullscreen-right|split|minimal|carousel|video-bg|editorial",
    verticalAlign: "top|center|bottom",
    titleAnimation: "none|split-text|letter-by-letter|word-by-word|fade-up",
    showScrollIndicator: boolean,  // true
    overlay: {
      enabled: boolean,      // true
      type: "gradient|solid|blur|vignette",
      opacity: number,       // 0.4
      color: string         // "#000000"
    }
  },
  style: {
    colors: {
      background: string,    // "transparent"
      text: string,          // "#ffffff"
      accent: string         // "#c9a96e"
    },
    spacing: {
      paddingY: number       // 16
    },
    typography: {
      textAlign: "left|center|right",
      titleWeight: "light|normal|medium|bold",
      titleLineHeight: "tight|normal|relaxed",
      titleLetterSpacing: "tighter|wide|widest"
    }
  }
}
```

#### Exemple HERO SIMPLE:

```typescript
{
  type: "hero",
  props: {
    content: {
      title: "L'Élégance Moderne",
      subtitle: "Découvrez notre collection exclusive de pièces uniques",
      media: {
        type: "image",
        src: "/images/hero-bg.jpg"
      },
      pretitle: { text: "Nouvelle Collection 2024" },
      cta: {
        primary: { text: "Découvrir", href: "/produits" },
        secondary: { text: "Notre Histoire", href: "/a-propos" }
      }
    },
    config: {
      variant: "fullscreen-center",
      verticalAlign: "center",
      overlay: { enabled: true, type: "gradient", opacity: 0.4 }
    },
    style: {
      colors: { text: "#ffffff", accent: "#d4af37" },
      typography: { textAlign: "center", titleWeight: "light" }
    }
  }
}
```

#### Paramètres - VERSION SLIDESHOW (plusieurs slides):

```typescript
{
  content: {
    slides: [  // ARRAY DE SLIDES
      {
        title: string,
        subtitle: string,
        pretitle: { text: string },
        media: {
          type: "image|video",
          src: string,
          videoSrc: string
        },
        cta: {
          primary: { text: string, href: string },
          secondary: { text: string, href: string }
        },
        textColor: string,      // Override couleur
        accentColor: string,    // Override accent
        overlay: {
          enabled: boolean,
          type: string,
          color: string,
          opacity: number
        }
      }
    ]
  },
  config: {
    slideshow: {
      enabled: true,
      autoplay: boolean,       // true
      interval: number,      // 5000 (ms)
      transition: "fade|slide|zoom",
      duration: number,      // 0.8 (s)
      showArrows: boolean,   // true
      showDots: boolean,     // true
      pauseOnHover: boolean, // true
      loop: boolean          // true
    }
  }
}
```

#### Exemple HERO SLIDESHOW (3 slides):

```typescript
{
  type: "hero",
  props: {
    content: {
      slides: [
        {
          title: "Collection Été",
          subtitle: "Légèreté et élégance",
          pretitle: { text: "Nouveau" },
          media: { type: "image", src: "/images/slide1.jpg" },
          cta: {
            primary: { text: "Découvrir", href: "/ete" }
          }
        },
        {
          title: "Collection Hiver",
          subtitle: "Chaleur et raffinement",
          pretitle: { text: "Exclusif" },
          media: { type: "image", src: "/images/slide2.jpg" },
          textColor: "#fff",
          accentColor: "#e74c3c"
        },
        {
          title: "Accessoires",
          subtitle: "La touche finale parfaite",
          media: { type: "video", src: "/images/slide3.jpg", videoSrc: "/video/accessoires.mp4" },
          cta: {
            primary: { text: "Voir tout", href: "/accessoires" },
            secondary: { text: "En savoir plus", href: "/about" }
          }
        }
      ]
    },
    config: {
      variant: "fullscreen-center",
      slideshow: {
        enabled: true,
        autoplay: true,
        interval: 6000,
        transition: "fade",
        showArrows: true,
        showDots: true,
        pauseOnHover: true,
        loop: true
      }
    }
  }
}
```

---

### 5. CATEGORY GRID (`categoryGrid`)

**Catégorie:** Collection

#### Paramètres:

```typescript
{
  content: {
    eyebrowText: string,      // "Explorer"
    title: string,           // "Nos catégories"
    subtitle: string,        // "Explorez notre sélection"
    categories: Array<{     // BLOCKS - max 12
      name: string,
      description: string,
      image: string (url),
      hoverImage: string (url),
      productCount: number,
      href: string,
      badge: string
    }>,
    viewAllButton: {
      text: string,          // "Voir tout"
      href: string           // "/categories"
    }
  },
  config: {
    titleAlignment: "left|center|right",
    titlePosition: "top|left|between",
    showViewAllButton: boolean,    // false
    viewAllButtonPosition: "header-right|header-bottom|footer",
    viewAllButtonStyle: "text|underline|outline|solid",
    variant: "mosaic-2x2|mosaic-3|bento|horizontal|carousel|grid",
    columns: "2|3|4|5",      // "4"
    aspectRatio: "square|3/4|4/5|landscape",
    hoverEffect: "zoom|zoom-slow|darken|swap|lift|glow|none",
    showProductCount: boolean,     // true
    slides: {
      enabled: boolean,      // false
      autoplay: boolean,
      interval: number,
      showArrows: boolean,
      showDots: boolean,
      infinite: boolean,
      slidesToShow: number,  // 4
      slidesToScroll: number // 1
    }
  },
  style: {
    typography: {
      titleFontFamily: "inherit|serif|sans|display",
      titleFontSize: "sm|base|lg|xl|2xl|3xl",      // "2xl"
      titleFontWeight: "light|normal|medium|semibold|bold|extrabold",
      titleTextTransform: "none|uppercase|lowercase|capitalize",
      titleLetterSpacing: number,  // 0
      titleLineHeight: number,     // 1.2
      subtitleFontSize: "xs|sm|base|lg",
      subtitleFontStyle: "normal|italic"
    }
  }
}
```

#### Exemple simple (grille 4 colonnes):

```typescript
{
  type: "categoryGrid",
  props: {
    content: {
      eyebrowText: "Explorer",
      title: "Nos Catégories",
      subtitle: "Trouvez votre style",
      categories: [
        { name: "Femme", image: "/cat/femme.jpg", href: "/femme", productCount: 120 },
        { name: "Homme", image: "/cat/homme.jpg", href: "/homme", productCount: 85 },
        { name: "Accessoires", image: "/cat/acc.jpg", href: "/accessoires", productCount: 45 },
        { name: "Nouveautés", image: "/cat/new.jpg", href: "/nouveautes", badge: "NEW" }
      ]
    },
    config: {
      variant: "grid",
      columns: "4",
      aspectRatio: "3/4",
      hoverEffect: "zoom",
      titleAlignment: "center"
    },
    style: {
      typography: {
        titleFontSize: "3xl",
        titleFontWeight: "bold",
        titleTextTransform: "uppercase"
      }
    }
  }
}
```

#### Exemple avec carousel:

```typescript
{
  type: "categoryGrid",
  props: {
    content: {
      title: "Collections",
      categories: [ /* 6+ catégories */ ]
    },
    config: {
      variant: "carousel",
      slides: {
        enabled: true,
        autoplay: true,
        interval: 5000,
        slidesToShow: 4,
        infinite: true
      }
    }
  }
}
```

---

### 6. PRODUCT GRID (`productGrid`)

**Catégorie:** Product

#### Paramètres:

```typescript
{
  content: {
    eyebrowText: string,     // "Notre Sélection"
    title: string,          // "Nouveautés"
    subtitle: string,       // "Découvrez nos meilleures ventes"
    products: Array<{       // BLOCKS - max 24
      id: string,
      name: string,
      price: number,
      oldPrice: number,
      image: string (url),
      hoverImage: string (url),
      badge: string,
      rating: number,       // 0-5
      reviewCount: number,
      href: string
    }>,
    viewAllButton: {
      text: string,
      href: string
    }
  },
  config: {
    titleAlignment: "left|center|right",
    titlePosition: "top|left|between",
    showViewAllButton: boolean,    // true
    viewAllButtonPosition: "header-right|header-bottom|footer",
    viewAllButtonStyle: "text|underline|outline|solid",
    variant: "grid-2|grid-3|grid-4|grid-5|horizontal|carousel|compact|masonry",
    columns: "2|3|4|5",
    cardStyle: "standard|minimal|luxury|card",
    showQuickView: boolean,  // true
    showWishlist: boolean,   // true
    loadMore: "button|none",
    productsPerPage: number, // 8
    slides: {
      enabled: boolean,
      autoplay: boolean,
      interval: number,
      showArrows: boolean,
      showDots: boolean,
      infinite: boolean,
      slidesToShow: number,
      slidesToScroll: number
    }
  },
  cardConfig: {
    image: {
      aspectRatio: "1/1|3/4|4/5",
      hoverEffect: "zoom|swap|none"
    },
    info: {
      alignment: "left|center|right",
      showRating: boolean,
      showPrice: boolean,
      showBadge: boolean
    },
    badge: {
      position: "top-left|top-right|bottom-left|bottom-right",
      style: "pill|rectangle|none"
    }
  },
  style: {
    typography: {
      titleFontFamily: "inherit|serif|sans|display",
      titleFontSize: "sm|base|lg|xl|2xl|3xl",
      titleFontWeight: "light|normal|medium|semibold|bold|extrabold",
      titleTextTransform: "none|uppercase|lowercase|capitalize",
      titleLetterSpacing: number,
      titleLineHeight: number,
      subtitleFontSize: "xs|sm|base|lg",
      subtitleFontStyle: "normal|italic"
    }
  }
}
```

#### Exemple grille produits:

```typescript
{
  type: "productGrid",
  props: {
    content: {
      eyebrowText: "Nouveautés",
      title: "Nos Meilleures Ventes",
      subtitle: "Les favoris de nos clients",
      products: [
        {
          id: "prod-1",
          name: "Robe Élégante",
          price: 149,
          oldPrice: 199,
          image: "/products/robe1.jpg",
          hoverImage: "/products/robe1-hover.jpg",
          badge: "-25%",
          rating: 4.8,
          reviewCount: 124,
          href: "/produit/robe-elegante"
        },
        { /* ... autres produits */ }
      ],
      viewAllButton: { text: "Voir tout", href: "/produits" }
    },
    config: {
      variant: "grid-4",
      columns: "4",
      cardStyle: "luxury",
      showViewAllButton: true,
      viewAllButtonPosition: "header-right",
      productsPerPage: 8
    },
    cardConfig: {
      image: { aspectRatio: "3/4", hoverEffect: "zoom" },
      info: { showRating: true, showPrice: true, showBadge: true },
      badge: { position: "top-left", style: "pill" }
    },
    style: {
      typography: {
        titleFontSize: "2xl",
        titleFontWeight: "bold"
      }
    }
  }
}
```

---

### 7. PROMO BAR (`promoBar`)

**Catégorie:** Content

#### Paramètres:

```typescript
{
  content: {
    text: string,           // "Profitez de -20% sur votre première commande!"
    buttonText: string,     // "En profiter"
    buttonLink: string,     // "/produit"
    showCloseButton: boolean // true
  },
  styles: {
    backgroundColor: string,  // "#d4af37"
    textColor: string,        // "#1a1a1a"
    paddingY: number          // 16
  }
}
```

#### Exemple:

```typescript
{
  type: "promoBar",
  props: {
    text: "Livraison gratuite dès 100€ d'achat !",
    buttonText: "Profiter",
    buttonLink: "/produits",
    showCloseButton: false,
    styles: {
      backgroundColor: "#1a1a1a",
      textColor: "#ffffff"
    }
  }
}
```

---

### 8. TRUST BADGES (`trustBadges`)

**Catégorie:** Content

#### Paramètres:

```typescript
{
  config: {
    layout: "row|grid"
  },
  content: {
    badges: Array<{        // BLOCKS - max 6
      icon: "Truck|Shield|RotateCcw|Headphones|Star|Lock",
      title: string,
      description: string
    }>
  },
  styles: {
    backgroundColor: string,
    textColor: string,
    accentColor: string,
    paddingY: number
  }
}
```

#### Exemple:

```typescript
{
  type: "trustBadges",
  props: {
    config: { layout: "row" },
    content: {
      badges: [
        { icon: "Truck", title: "Livraison Rapide", description: "2-3 jours ouvrés" },
        { icon: "Shield", title: "Paiement Sécurisé", description: "100% sécurisé" },
        { icon: "RotateCcw", title: "Retours Gratuits", description: "30 jours" }
      ]
    },
    styles: { backgroundColor: "#f5f5f5", paddingY: 40 }
  }
}
```

---

### 9. TESTIMONIALS (`testimonials`)

**Catégorie:** Content

#### Paramètres:

```typescript
{
  content: {
    title: string,
    subtitle: string,
    testimonials: Array<{  // BLOCKS - max 6
      author: string,
      role: string,
      quote: string,
      avatar: string (url),
      rating: number        // 1-5
    }>
  },
  config: {
    variant: "slider|single|grid-2|grid-3",
    showRating: boolean,
    showAvatar: boolean,
    showNavigation: boolean
  }
}
```

#### Exemple:

```typescript
{
  type: "testimonials",
  props: {
    content: {
      title: "Ce que nos clients disent",
      subtitle: "Des milliers de clients satisfaits",
      testimonials: [
        {
          author: "Marie L.",
          role: "Cliente fidèle",
          quote: "Excellent service et produits de qualité!",
          avatar: "/avatars/marie.jpg",
          rating: 5
        }
      ]
    },
    config: {
      variant: "slider",
      showRating: true,
      showAvatar: true
    }
  }
}
```

---

### 10. NEWSLETTER (`newsletter`)

**Catégorie:** Content

#### Paramètres:

```typescript
{
  content: {
    title: string,
    description: string,
    buttonText: string,
    placeholder: string,
    privacyText: string
  },
  config: {
    variant: "centered|inline|split|minimal",
    showPrivacy: boolean,
    requirePrivacy: boolean
  }
}
```

#### Exemple:

```typescript
{
  type: "newsletter",
  props: {
    content: {
      title: "Rejoignez notre newsletter",
      description: "Recevez nos offres exclusives",
      buttonText: "S'inscrire",
      placeholder: "Votre adresse email",
      privacyText: "J'accepte de recevoir la newsletter"
    },
    config: {
      variant: "centered",
      showPrivacy: true
    }
  }
}
```

---

### 11. BANNER (`banner`)

**Catégorie:** Content

#### Paramètres:

```typescript
{
  content: {
    title: string,
    subtitle: string,
    image: string (url),
    ctaText: string,
    ctaLink: string
  },
  config: {
    position: "left|right"
  },
  styles: {
    backgroundColor: string,
    textColor: string,
    accentColor: string,
    paddingY: number
  }
}
```

---

### 12. COUNTDOWN (`countdown`)

**Catégorie:** Content

#### Paramètres:

```typescript
{
  content: {
    title: string,
    subtitle: string,
    buttonText: string,
    buttonLink: string,
    endDate: string (ISO),   // "2024-12-31T23:59:59Z"
    showLabels: boolean
  },
  styles: {
    backgroundColor: string,
    textColor: string,
    paddingY: number
  }
}
```

---

### 13. FEATURES (`features`)

**Catégorie:** Content

#### Paramètres:

```typescript
{
  content: {
    title: string,
    subtitle: string,
    features: Array<{        // BLOCKS - max 8
      icon: "Truck|Shield|RotateCcw|Headphones|Star|Zap|Heart|Award",
      title: string,
      description: string
    }>
  },
  config: {
    layout: "grid|row"
  },
  styles: {
    backgroundColor: string,
    textColor: string,
    accentColor: string,
    paddingY: number
  }
}
```

---

### 14. EDITORIAL (`editorial`)

**Catégorie:** Content

#### Paramètres:

```typescript
{
  content: {
    eyebrow: { text: string },
    title: string,
    body: string,
    media: {
      src: string (url),
      aspectRatio: "1/1|4/5|3/4|16/9"
    },
    quote: {
      text: string,
      author: string,
      role: string
    },
    cta: Array<{           // BLOCKS - max 3
      text: string,
      href: string,
      style: "solid|outline|underline"
    }>
  },
  config: {
    variant: "image-text|text-image|text-over|full-bleed"
  }
}
```

#### Exemple:

```typescript
{
  type: "editorial",
  props: {
    content: {
      eyebrow: { text: "Notre histoire" },
      title: "Artisanat d'excellence",
      body: "Chaque pièce est confectionnée avec soin...",
      media: { src: "/images/atelier.jpg", aspectRatio: "3/4" },
      cta: [
        { text: "Découvrir", href: "/a-propos", style: "underline" }
      ]
    },
    config: { variant: "text-image" }
  }
}
```

---

### 15. COLLECTION HERO (`collectionHero`)

**Catégorie:** Content

#### Paramètres:

```typescript
{
  content: {
    title: string,
    subtitle: string,
    image: string (url)
  },
  config: {
    overlayOpacity: number   // 0-1
  },
  styles: {
    backgroundColor: string,
    textColor: string,
    accentColor: string,
    paddingY: number
  }
}
```

---

### 16. STATS BAR (`statsBar`)

**Catégorie:** Content

#### Paramètres:

```typescript
{
  content: {
    stats: Array<{          // BLOCKS - max 6
      value: string,       // "1987" ou "38+"
      label: string        // "Fondation"
    }>
  },
  config: {
    divider: boolean       // true
  },
  styles: {
    backgroundColor: string,
    textColor: string,
    accentColor: string,
    paddingY: number
  }
}
```

---

## 🛍️ PAGE PRODUITS - Sections Disponibles

### 17. PRODUCTS CONTENT (`productsContent`)

**Catégorie:** Product

#### Paramètres:

```typescript
{
  content: {
    title: string,
    subtitle: string
  },
  config: {
    showFilters: boolean,   // true
    columns: "2|3|4"       // "4"
  },
  styles: {
    backgroundColor: string,  // "#f9fafb"
    textColor: string,        // "#1a1a1a"
    accentColor: string,      // "#d4af37"
    paddingY: number          // 60
  }
}
```

#### Exemple:

```typescript
{
  type: "productsContent",
  props: {
    content: {
      title: "Nos Produits",
      subtitle: "Explorez la collection complète"
    },
    config: {
      showFilters: true,
      columns: "4"
    },
    styles: {
      backgroundColor: "#f9fafb",
      paddingY: 60
    }
  }
}
```

---

### 18. PRODUCT DETAIL (`productDetail`)

**Catégorie:** Product

#### Paramètres:

```typescript
{
  content: {
    product: {
      name: string,
      price: number,
      oldPrice: number,
      description: string,
      image: string (url),
      badge: string,
      rating: number,
      sku: string
    }
  },
  config: {
    showReviews: boolean,
    showSizeGuide: boolean,
    showShippingInfo: boolean
  },
  styles: {
    backgroundColor: string,
    textColor: string,
    accentColor: string,
    paddingY: number
  }
}
```

---

### 19. PRODUCT DETAIL CONTENT (`productDetailContent`)

**Catégorie:** Product

#### Paramètres:

```typescript
{
  config: {
    showReviews: boolean,        // true
    showSizeGuide: boolean,      // true
    showShippingInfo: boolean,   // true
    showRelatedProducts: boolean // true
  },
  styles: {
    backgroundColor: string,
    textColor: string,
    accentColor: string,
    paddingY: number
  }
}
```

---

## 🛒 PAGE PANIER - Sections Disponibles

### 20. CART (`cart`)

**Catégorie:** Cart

#### Paramètres:

```typescript
{
  content: {
    title: string,
    emptyMessage: string,
    showCouponField: boolean
  },
  styles: {
    backgroundColor: string,
    textColor: string,
    accentColor: string,
    paddingY: number
  }
}
```

---

## 💳 PAGE COMMANDE - Sections Disponibles

### 21. CHECKOUT FORM (`checkoutForm`)

**Catégorie:** Checkout

#### Paramètres:

```typescript
{
  content: {
    title: string
  },
  styles: {
    backgroundColor: string,
    textColor: string,
    accentColor: string,
    paddingY: number
  }
}
```

---

### 22. CHECKOUT CONTENT (`checkoutContent`)

**Catégorie:** Checkout

#### Paramètres:

```typescript
{
  content: {
    title: string,
    steps: string           // "Étape 1\nÉtape 2\nÉtape 3"
  },
  config: {
    showSteps: boolean     // true
  },
  styles: {
    backgroundColor: string,
    textColor: string,
    accentColor: string,
    paddingY: number
  }
}
```

---

### 23. ORDER CONFIRMATION CONTENT (`orderConfirmationContent`)

**Catégorie:** Checkout

#### Paramètres:

```typescript
{
  content: {
    title: string,
    subtitle: string
  },
  config: {
    showOrderDetails: boolean,  // true
    showTracking: boolean       // true
  },
  styles: {
    backgroundColor: string,
    textColor: string,
    accentColor: string,
    paddingY: number
  }
}
```

---

### 24. ORDER DETAIL (`orderDetail`)

**Catégorie:** Checkout

#### Paramètres:

```typescript
{
  styles: {
    backgroundColor: string,
    textColor: string,
    accentColor: string,
    paddingY: number
  }
}
```

---

## 🔐 PAGE AUTHENTIFICATION - Sections Disponibles

### 25. LOGIN (`login`)

**Catégorie:** Content

#### Paramètres:

```typescript
{
  content: {
    title: string,
    subtitle: string,
    registerLink: string      // "/inscription"
  },
  config: {
    showEmail: boolean,       // true
    showPassword: boolean,    // true
    showRememberMe: boolean, // true
    showForgotPassword: boolean, // true
    showSocialLogin: boolean  // true
  },
  styles: {
    backgroundColor: string,
    textColor: string,
    accentColor: string,
    paddingY: number
  }
}
```

---

### 26. REGISTER (`register`)

**Catégorie:** Content

#### Paramètres:

```typescript
{
  content: {
    title: string,
    subtitle: string,
    loginLink: string         // "/connexion"
  },
  config: {
    showFirstName: boolean,   // true
    showLastName: boolean,    // true
    showEmail: boolean,       // true
    showPhone: boolean,       // true
    showPassword: boolean,    // true
    showPasswordConfirm: boolean, // true
    showTerms: boolean,       // true
    showNewsletter: boolean,  // true
    showSocialLogin: boolean  // true
  },
  styles: {
    backgroundColor: string,
    textColor: string,
    accentColor: string,
    paddingY: number
  }
}
```

---

## 👤 PAGE COMPTE - Sections Disponibles

### 27. ACCOUNT CONTENT (`accountContent`)

**Catégorie:** Content

#### Paramètres:

```typescript
{
  content: {
    title: string
  },
  config: {
    showOrders: boolean,      // true
    showAddresses: boolean,   // true
    showProfile: boolean      // true
  },
  styles: {
    backgroundColor: string,
    textColor: string,
    accentColor: string,
    paddingY: number
  }
}
```

---

### 28. ACCOUNT DASHBOARD (`accountDashboard`)

**Catégorie:** Content

#### Paramètres:

```typescript
{
  content: {
    title: string,
    subtitle: string,
    user: {
      firstName: string,
      lastName: string,
      email: string,
      phone: string,
      memberSince: string    // "2024"
    }
  },
  styles: {
    backgroundColor: string,  // "#f8fafc"
    textColor: string,        // "#1e293b"
    accentColor: string,      // "#d4af37"
    paddingY: number          // 60
  }
}
```

---

### 29. WISHLIST CONTENT (`wishlistContent`)

**Catégorie:** Content

#### Paramètres:

```typescript
{
  content: {
    title: string,
    emptyMessage: string
  },
  styles: {
    backgroundColor: string,
    textColor: string,
    accentColor: string,
    paddingY: number
  }
}
```

---

## 🔍 AUTRES SECTIONS - Disponibles

### 30. BREADCRUMB (`breadcrumb`)

**Catégorie:** Content

#### Paramètres:

```typescript
{
  config: {
    showHome: boolean,       // true
    separator: "chevron|slash"
  },
  styles: {
    backgroundColor: string,
    textColor: string,
    paddingY: number
  }
}
```

---

### 31. SEARCH BAR (`searchBar`)

**Catégorie:** Content

#### Paramètres:

```typescript
{
  content: {
    placeholder: string,
    popularSearches: string   // "Recherche 1\nRecherche 2"
  },
  config: {
    showFilters: boolean,         // true
    showPopularSearches: boolean  // true
  },
  styles: {
    backgroundColor: string,
    textColor: string,
    accentColor: string,
    paddingY: number
  }
}
```

---

## 🦶 FOOTER - Sections Disponibles

### 32. FOOTER MODERN (`footerModern`)

**Catégorie:** Footer

#### Paramètres:

```typescript
{
  content: {
    logo: {
      text: string,
      image: string (url)
    },
    copyright: string,
    description: string,
    contactInfo: {
      title: string,
      address: string,
      phone: string,
      email: string
    },
    social: {
      whatsapp: string,
      instagram: string,
      facebook: string,
      tiktok: string,
      youtube: string
    },
    newsletter: {
      enabled: boolean,
      title: string,
      description: string
    },
    columns: Array<{        // BLOCKS - max 4
      title: string,
      links: string         // "Label|URL\nLabel2|URL2"
    }>
  },
  config: {
    showSocial: boolean      // true
  }
}
```

#### Exemple:

```typescript
{
  type: "footerModern",
  props: {
    content: {
      logo: { text: "MA MARQUE" },
      copyright: "© 2024 Ma Marque. Tous droits réservés.",
      description: "Boutique en ligne de produits premium",
      contactInfo: {
        title: "Contact",
        address: "123 Rue de Paris, 75001 Paris",
        phone: "+33 1 23 45 67 89",
        email: "contact@mamarque.com"
      },
      social: {
        instagram: "https://instagram.com/mamarque",
        facebook: "https://facebook.com/mamarque"
      },
      newsletter: {
        enabled: true,
        title: "Newsletter",
        description: "Recevez nos offres"
      },
      columns: [
        {
          title: "Boutique",
          links: "Nouveautés|/nouveautés\nBest-sellers|/best-sellers"
        },
        {
          title: "Aide",
          links: "FAQ|/faq\nContact|/contact"
        }
      ]
    }
  }
}
```

---

### 33. FOOTER MINIMAL (`footerMinimal`)

**Catégorie:** Footer

#### Paramètres:

```typescript
{
  content: {
    logo: { text: string },
    copyright: string
  },
  styles: {
    backgroundColor: string,  // "#1a1a1a"
    textColor: string,        // "#ffffff"
    paddingY: number          // 40
  }
}
```

---

## 📄 EXEMPLES COMPLETS DE PAGES

### Exemple 1: Page Accueil Complète

```typescript
{
  id: "homepage-luxe",
  name: "Accueil Luxe",
  description: "Page d'accueil premium avec hero slideshow",
  category: "home",
  sections: [
    {
      type: "announcementBar",
      props: {
        content: {
          messages: "Livraison gratuite dès 100€\nRetours gratuits sous 30 jours",
          autoRotate: true,
          interval: 5000
        },
        styles: { backgroundColor: "#1a1a1a", textColor: "#fff" }
      }
    },
    {
      type: "headerModern",
      props: {
        content: {
          logo: { text: "LUXE" },
          navigation: [
            { label: "Accueil", href: "/", enabled: true },
            { label: "Produits", href: "/produits", enabled: true },
            { label: "Collections", href: "/collections", enabled: true },
            { label: "À propos", href: "/a-propos", enabled: true }
          ],
          ctaButton: { text: "Shop Now", href: "/produits" }
        },
        config: {
          variant: "transparent",
          behavior: { sticky: true, transparentAtTop: true }
        }
      }
    },
    {
      type: "hero",
      props: {
        content: {
          title: "L'Élégance Moderne",
          subtitle: "Découvrez notre collection exclusive",
          media: { type: "image", src: "/images/hero-1.jpg" },
          cta: {
            primary: { text: "Découvrir", href: "/produits" },
            secondary: { text: "En savoir plus", href: "/a-propos" }
          }
        },
        config: {
          variant: "fullscreen-center",
          overlay: { enabled: true, type: "gradient", opacity: 0.4 }
        },
        style: {
          colors: { text: "#ffffff", accent: "#d4af37" },
          typography: { textAlign: "center", titleWeight: "light" }
        }
      }
    },
    {
      type: "trustBadges",
      props: {
        config: { layout: "row" },
        content: {
          badges: [
            { icon: "Truck", title: "Livraison Rapide", description: "2-3 jours" },
            { icon: "Shield", title: "Paiement Sécurisé", description: "100% safe" },
            { icon: "RotateCcw", title: "Retours Gratuits", description: "30 jours" },
            { icon: "Headphones", title: "Support 24/7", description: "À votre écoute" }
          ]
        },
        styles: { backgroundColor: "#f8f5f0", paddingY: 32 }
      }
    },
    {
      type: "categoryGrid",
      props: {
        content: {
          eyebrowText: "Explorer",
          title: "Nos Collections",
          subtitle: "Trouvez votre style parmi nos catégories",
          categories: [
            { name: "Femme", image: "/cat/femme.jpg", href: "/femme", productCount: 150 },
            { name: "Homme", image: "/cat/homme.jpg", href: "/homme", productCount: 120 },
            { name: "Accessoires", image: "/cat/accessoires.jpg", href: "/accessoires", productCount: 80 },
            { name: "Nouveautés", image: "/cat/nouveautes.jpg", href: "/nouveautes", badge: "NEW" }
          ]
        },
        config: {
          variant: "grid",
          columns: "4",
          aspectRatio: "3/4",
          hoverEffect: "zoom",
          titleAlignment: "center"
        },
        style: {
          typography: { titleFontSize: "3xl", titleFontWeight: "bold" }
        }
      }
    },
    {
      type: "productGrid",
      props: {
        content: {
          eyebrowText: "Sélection",
          title: "Nos Best-Sellers",
          subtitle: "Les coups de cœur de nos clients",
          products: [
            {
              id: "p1",
              name: "Robe Élégante",
              price: 149,
              oldPrice: 199,
              image: "/products/robe1.jpg",
              badge: "-25%",
              rating: 4.8,
              href: "/produit/robe"
            },
            {
              id: "p2",
              name: "Veste Premium",
              price: 199,
              image: "/products/veste1.jpg",
              rating: 4.9,
              href: "/produit/veste"
            },
            {
              id: "p3",
              name: "Sac Luxe",
              price: 299,
              image: "/products/sac1.jpg",
              badge: "NEW",
              rating: 5,
              href: "/produit/sac"
            },
            {
              id: "p4",
              name: "Chaussures",
              price: 129,
              oldPrice: 159,
              image: "/products/chaussures1.jpg",
              rating: 4.7,
              href: "/produit/chaussures"
            }
          ],
          viewAllButton: { text: "Voir tout", href: "/produits" }
        },
        config: {
          variant: "grid-4",
          columns: "4",
          cardStyle: "luxury",
          showViewAllButton: true,
          productsPerPage: 8
        },
        cardConfig: {
          image: { aspectRatio: "3/4", hoverEffect: "zoom" }
        }
      }
    },
    {
      type: "editorial",
      props: {
        content: {
          eyebrow: { text: "Notre Histoire" },
          title: "Artisanat d'Excellence",
          body: "Depuis 1987, nous créons des pièces uniques qui allient tradition et modernité. Chaque article est confectionné avec soin dans nos ateliers.",
          media: { src: "/images/atelier.jpg", aspectRatio: "3/4" },
          cta: [
            { text: "Découvrir notre histoire", href: "/a-propos", style: "underline" }
          ]
        },
        config: { variant: "text-image" }
      }
    },
    {
      type: "testimonials",
      props: {
        content: {
          title: "Ce que nos clients disent",
          subtitle: "Des milliers de clients satisfaits",
          testimonials: [
            {
              author: "Marie L.",
              role: "Cliente fidèle",
              quote: "Une qualité exceptionnelle et un service impeccable. Je recommande vivement !",
              avatar: "/avatars/marie.jpg",
              rating: 5
            },
            {
              author: "Jean D.",
              role: "Client vérifié",
              quote: "Livraison rapide et produit conforme à la description. Parfait !",
              avatar: "/avatars/jean.jpg",
              rating: 5
            }
          ]
        },
        config: { variant: "slider", showRating: true, showAvatar: true }
      }
    },
    {
      type: "newsletter",
      props: {
        content: {
          title: "Rejoignez notre univers",
          description: "Recevez en avant-première nos nouvelles collections et offres exclusives.",
          buttonText: "S'inscrire",
          placeholder: "Votre adresse email",
          privacyText: "J'accepte de recevoir la newsletter"
        },
        config: { variant: "centered", showPrivacy: true }
      }
    },
    {
      type: "footerModern",
      props: {
        content: {
          logo: { text: "LUXE" },
          copyright: "© 2024 Luxe. Tous droits réservés.",
          description: "Boutique en ligne de mode premium",
          contactInfo: {
            title: "Contact",
            address: "123 Avenue des Champs-Élysées, 75008 Paris",
            phone: "+33 1 23 45 67 89",
            email: "contact@luxe.com"
          },
          social: {
            instagram: "https://instagram.com/luxe",
            facebook: "https://facebook.com/luxe"
          },
          newsletter: {
            enabled: true,
            title: "Newsletter",
            description: "Restez informé"
          },
          columns: [
            {
              title: "Boutique",
              links: "Nouveautés|/nouveautés\nFemme|/femme\nHomme|/homme"
            },
            {
              title: "Aide",
              links: "FAQ|/faq\nLivraison|/livraison\nRetours|/retours"
            },
            {
              title: "Légal",
              links: "CGV|/cgv\nPolitique de confidentialité|/privacy"
            }
          ]
        }
      }
    }
  ],
  settings: {
    primaryColor: "#d4af37",
    secondaryColor: "#1a1a1a",
    backgroundColor: "#ffffff",
    fontFamily: "sans",
    spacing: "normal"
  }
}
```

---

### Exemple 2: Page Produits

```typescript
{
  id: "page-produits",
  name: "Catalogue Produits",
  description: "Page liste de tous les produits",
  category: "product",
  sections: [
    {
      type: "headerModern",
      props: {
        content: {
          logo: { text: "LUXE" },
          navigation: [
            { label: "Accueil", href: "/", enabled: true },
            { label: "Produits", href: "/produits", enabled: true },
            { label: "Collections", href: "/collections", enabled: true }
          ]
        },
        config: { variant: "default", behavior: { sticky: true } }
      }
    },
    {
      type: "breadcrumb",
      props: {
        config: { showHome: true, separator: "chevron" },
        styles: { backgroundColor: "#f5f5f5", paddingY: 16 }
      }
    },
    {
      type: "productsContent",
      props: {
        content: {
          title: "Nos Produits",
          subtitle: "Découvrez notre collection complète"
        },
        config: {
          showFilters: true,
          columns: "4"
        },
        styles: {
          backgroundColor: "#f9fafb",
          paddingY: 60
        }
      }
    },
    {
      type: "footerModern",
      props: { /* ... */ }
    }
  ]
}
```

---

### Exemple 3: Page Produit Détail

```typescript
{
  id: "page-produit-detail",
  name: "Fiche Produit",
  description: "Page détail d'un produit",
  category: "product",
  sections: [
    {
      type: "headerModern",
      props: { /* ... */ }
    },
    {
      type: "breadcrumb",
      props: { /* ... */ }
    },
    {
      type: "productDetailContent",
      props: {
        config: {
          showReviews: true,
          showSizeGuide: true,
          showShippingInfo: true,
          showRelatedProducts: true
        },
        styles: {
          backgroundColor: "#f9fafb",
          paddingY: 60
        }
      }
    },
    {
      type: "productGrid",
      props: {
        content: {
          title: "Produits Similaires",
          products: [ /* 4 produits */ ]
        },
        config: {
          variant: "grid-4",
          columns: "4"
        }
      }
    },
    {
      type: "footerModern",
      props: { /* ... */ }
    }
  ]
}
```

---

### Exemple 4: Page Connexion

```typescript
{
  id: "page-connexion",
  name: "Connexion",
  description: "Page de connexion client",
  category: "content",
  sections: [
    {
      type: "headerMinimal",
      props: {
        logo: { text: "LUXE" },
        styles: { backgroundColor: "#fff", paddingY: 20 }
      }
    },
    {
      type: "login",
      props: {
        content: {
          title: "Connexion",
          subtitle: "Accédez à votre compte",
          registerLink: "/inscription"
        },
        config: {
          showEmail: true,
          showPassword: true,
          showRememberMe: true,
          showForgotPassword: true,
          showSocialLogin: true
        },
        styles: {
          backgroundColor: "#ffffff",
          accentColor: "#d4af37",
          paddingY: 80
        }
      }
    },
    {
      type: "footerMinimal",
      props: {
        content: {
          logo: { text: "LUXE" },
          copyright: "© 2024 Luxe"
        },
        styles: { backgroundColor: "#1a1a1a", textColor: "#fff" }
      }
    }
  ]
}
```

---

## 📊 TABLE RÉCAPITULATIVE DES TYPES DE CHAMPS

| Type       | Description             | Exemple               |
| ---------- | ----------------------- | --------------------- |
| `text`     | Texte court             | `"Mon titre"`         |
| `textarea` | Texte long (multiligne) | `"Ligne 1\nLigne 2"`  |
| `number`   | Nombre                  | `42`                  |
| `range`    | Nombre avec min/max     | `50` (entre 0-100)    |
| `color`    | Couleur hex             | `"#d4af37"`           |
| `select`   | Liste déroulante        | `"option1"`           |
| `checkbox` | Booléen                 | `true/false`          |
| `image`    | URL image               | `"/images/photo.jpg"` |
| `url`      | URL lien                | `"/produits"`         |
| `font`     | Police                  | `"serif"`             |
| `richtext` | HTML/texte enrichi      | `"<p>Texte</p>"`      |

---

## 🎯 VALEURS COMMUNES (RÉFÉRENCE RAPIDE)

### Alignements

- `left`, `center`, `right`

### Tailles de police

- `xs`, `sm`, `base`, `lg`, `xl`, `2xl`, `3xl`

### Épaisseurs

- `light`, `normal`, `medium`, `semibold`, `bold`, `extrabold`

### Transformations

- `none`, `uppercase`, `lowercase`, `capitalize`

### Variantes Hero

- `fullscreen-center`, `fullscreen-left`, `fullscreen-right`, `split`, `minimal`, `carousel`, `video-bg`, `editorial`

### Variantes Product Grid

- `grid-2`, `grid-3`, `grid-4`, `grid-5`, `horizontal`, `carousel`, `compact`, `masonry`

### Variantes Category Grid

- `mosaic-2x2`, `mosaic-3`, `bento`, `horizontal`, `carousel`, `grid`

### Styles de carte

- `standard`, `minimal`, `luxury`, `card`, `compact`

### Effets hover

- `zoom`, `zoom-slow`, `darken`, `swap`, `lift`, `glow`, `none`

### Ratios d'image

- `square`, `3/4`, `4/5`, `landscape`, `video` (16/9), `1/1`

---

## ⚠️ POINTS IMPORTANTS À RESPECTER

1. **Toujours utiliser les IDs imbriqués** comme `content.title` et non pas `title` seul
2. **Les blocks sont des arrays** avec une structure spécifique (voir exemples)
3. **Les couleurs sont en hex** : `#ffffff` et non `white`
4. **Les URLs** : commencer par `/` pour les internes, `https://` pour les externes
5. **Les images** : utiliser des URLs accessibles ou chemins `/images/...`
6. **Les booléens** : `true` ou `false` (sans guillemets)
7. **Les nombres** : sans guillemets
8. **Les chaînes** : entre guillemets `"..."`

---

## 🚀 CHECKLIST AVANT CRÉATION

- [ ] Chaque section a un `type` valide
- [ ] Les `props` suivent la structure attendue
- [ ] Les IDs des propriétés utilisent la notation pointée (`content.title`)
- [ ] Les blocks ont la structure `{ type, settings }` ou `{ type, itemsPath, settings }`
- [ ] Les couleurs sont en format hex
- [ ] Les URLs sont valides
- [ ] Les tableaux (arrays) sont bien fermés avec `]`
- [ ] Les objets sont bien fermés avec `}`
- [ ] Pas de virgule après le dernier élément

---

## 📝 NOTES POUR L'IA

Ce document contient **TOUTES** les sections disponibles dans le système avec leurs paramètres complets. Pour générer un template :

1. Choisir les sections pertinentes pour la page
2. Remplir les `props` selon la structure documentée
3. Respecter les types de données
4. Inclure les valeurs par défaut quand pertinent
5. Adapter les contenus (textes, images) au contexte du template

Les exemples complets montrent la structure exacte attendue pour chaque type de page (accueil, produits, connexion, etc.).

---

## 🎨 STYLES PERSONNALISÉS (CSS CUSTOM)

### Où ajouter ses propres styles ?

Il y a **3 niveaux** pour personnaliser les styles :

#### 1. **Niveau Section** (recommandé pour les styles spécifiques)

Chaque section accepte un objet `styles` ou `style` avec ces propriétés :

```typescript
{
  type: "hero",
  props: {
    // ... contenu ...
    style: {
      colors: {
        background: "#000000",    // Fond de la section
        text: "#ffffff",          // Couleur texte
        accent: "#d4af37"         // Couleur accent (boutons, liens)
      },
      spacing: {
        paddingY: 80              // Espacement haut/bas (en px)
      },
      typography: {
        textAlign: "center",      // left|center|right
        titleWeight: "bold",      // light|normal|medium|bold
        titleFontSize: "3xl",    // xs|sm|base|lg|xl|2xl|3xl
        titleFontFamily: "serif" // inherit|serif|sans|display
      }
    }
  }
}
```

#### 2. **Niveau Template** (styles globaux)

Dans le `settings` du template :

```typescript
{
  id: "mon-template",
  sections: [ /* ... */ ],
  settings: {
    primaryColor: "#d4af37",      // Couleur principale (boutons, liens)
    secondaryColor: "#1a1a1a",    // Couleur secondaire
    backgroundColor: "#ffffff",   // Fond général
    fontFamily: "sans",           // Police globale
    spacing: "normal"             // compact|normal|relaxed
  }
}
```

#### 3. **CSS Global** (pour les styles avancés)

Si besoin de CSS personnalisé avancé, créer un fichier :

**Emplacement :** `src/styles/custom.css`

```css
/* Exemple de CSS personnalisé global */

/* Personnaliser tous les boutons primaires */
.btn-primary {
  background: linear-gradient(135deg, #d4af37 0%, #c9a96e 100%);
  border-radius: 8px;
  text-transform: uppercase;
  letter-spacing: 2px;
}

/* Personnaliser une section spécifique par ID */
[data-section-id="hero-home"] {
  background-attachment: fixed;
}

/* Personnaliser les titres */
h1,
h2,
h3 {
  font-family: "Playfair Display", serif;
}

/* Animation personnalisée */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out;
}
```

Puis importer dans `src/App.tsx` ou `src/main.tsx` :

```typescript
import "./styles/custom.css";
```

---

### 📋 Propriétés de style disponibles par section

| Propriété         | Type     | Description                    | Exemple     |
| ----------------- | -------- | ------------------------------ | ----------- |
| `backgroundColor` | `string` | Couleur de fond                | `"#f9fafb"` |
| `textColor`       | `string` | Couleur du texte               | `"#1a1a1a"` |
| `accentColor`     | `string` | Couleur d'accent (boutons)     | `"#d4af37"` |
| `paddingY`        | `number` | Padding haut/bas (px)          | `60`        |
| `paddingX`        | `number` | Padding gauche/droite (px)     | `20`        |
| `borderRadius`    | `number` | Arrondi des coins (px)         | `8`         |
| `gap`             | `number` | Espacement entre éléments (px) | `24`        |

---

### 🎯 Exemples de personnalisation avancée

#### Exemple 1: Hero avec dégradé personnalisé

```typescript
{
  type: "hero",
  props: {
    content: { /* ... */ },
    config: {
      variant: "fullscreen-center",
      overlay: {
        enabled: true,
        type: "gradient",        // gradient|solid|blur|vignette
        opacity: 0.6,             // 0 à 1
        color: "#1a1a1a"        // couleur du dégradé
      }
    },
    style: {
      colors: {
        background: "transparent",
        text: "#ffffff",
        accent: "#ff6b6b"        // accent rouge personnalisé
      },
      spacing: {
        paddingY: 120            // plus d'espace
      },
      typography: {
        textAlign: "center",
        titleWeight: "bold",
        titleFontSize: "3xl",
        titleLetterSpacing: "widest"  // espacement large
      }
    }
  }
}
```

#### Exemple 2: Product Grid avec cartes arrondies

```typescript
{
  type: "productGrid",
  props: {
    content: { /* ... */ },
    config: {
      variant: "grid-4",
      cardStyle: "luxury"
    },
    cardConfig: {
      image: {
        aspectRatio: "3/4",
        hoverEffect: "zoom"
      },
      badge: {
        position: "top-right",    // position badge
        style: "pill"             // pill|rectangle|none
      },
      info: {
        alignment: "center",      // alignement infos
        showRating: true,
        showPrice: true,
        showBadge: true
      }
    },
    style: {
      colors: {
        background: "#fafafa",
        accent: "#e74c3c"        // prix en rouge
      },
      spacing: {
        paddingY: 80
      }
    }
  }
}
```

#### Exemple 3: Header transparent qui change au scroll

```typescript
{
  type: "headerModern",
  props: {
    content: { /* ... */ },
    config: {
      variant: "transparent",      // transparent au départ
      behavior: {
        sticky: true,
        transparentAtTop: true,   // transparent en haut
        blurOnScroll: true,       // flou au scroll
        elevatedOnScroll: true    // ombre au scroll
      }
    },
    styles: {
      backgroundColor: "#ffffff",  // couleur après scroll
      textColor: "#1a1a1a",
      paddingY: 16
    }
  }
}
```

---

### 🔧 Tableau des espacements (paddingY)

| Valeur   | Nom     | Usage                      |
| -------- | ------- | -------------------------- |
| `0-20`   | Compact | Header, barres             |
| `40-60`  | Normal  | Sections standard          |
| `80-120` | Grand   | Hero, sections importantes |
| `160+`   | Extra   | Sections pleine page       |

---

### 🎨 Palette de couleurs suggérées

```typescript
// Élégant / Luxe
{
  primaryColor: "#d4af37",      // Or
  secondaryColor: "#1a1a1a",     // Noir
  backgroundColor: "#ffffff",    // Blanc
  accentColor: "#c9a96e"         // Or foncé
}

// Moderne / Tech
{
  primaryColor: "#6366f1",      // Indigo
  secondaryColor: "#0f172a",    // Slate foncé
  backgroundColor: "#f8fafc",   // Gris très clair
  accentColor: "#8b5cf6"          // Violet
}

// Nature / Bio
{
  primaryColor: "#22c55e",      // Vert
  secondaryColor: "#14532d",     // Vert foncé
  backgroundColor: "#f0fdf4",   // Vert très clair
  accentColor: "#16a34a"          // Vert moyen
}

// Minimaliste
{
  primaryColor: "#1a1a1a",      // Noir
  secondaryColor: "#737373",     // Gris
  backgroundColor: "#fafafa",   // Blanc cassé
  accentColor: "#000000"          // Noir
}
```

---

### ⚡ Bonnes pratiques

1. **Utiliser les variables de couleurs** du template pour la cohérence
2. **Tester le contraste** texte/fond pour l'accessibilité
3. **Privilégier `paddingY`** plutôt que des hauteurs fixes
4. **Utiliser les effets hover** pour l'interactivité (zoom, lift)
5. **Limiter à 3-4 couleurs** maximum pour un design propre
6. **Tester sur mobile** les espacements (`paddingY` plus petits)

---

## 📚 RÉFÉRENCE RAPIDE - TOUS LES TYPES DE SECTIONS

### Par catégorie :

**Header (En-tête)**

- `announcementBar` - Barre d'annonce
- `headerModern` - Header complet
- `headerMinimal` - Header simple

**Content (Contenu)**

- `hero` - Section héro (image/vidéo/slideshow)
- `categoryGrid` - Grille de catégories
- `productGrid` - Grille de produits
- `editorial` - Section éditoriale (texte + image)
- `promoBar` - Barre promotion
- `trustBadges` - Badges confiance
- `testimonials` - Témoignages clients
- `newsletter` - Inscription newsletter
- `banner` - Bannière image
- `countdown` - Compte à rebours
- `features` - Fonctionnalités
- `statsBar` - Barre de statistiques
- `collectionHero` - Hero collection
- `breadcrumb` - Fil d'Ariane
- `searchBar` - Barre de recherche

**Product (Produits)**

- `productDetail` - Détail produit
- `productsContent` - Page produits (catalogue)
- `productDetailContent` - Contenu fiche produit

**Cart (Panier)**

- `cart` - Panier complet

**Checkout (Commande)**

- `checkoutForm` - Formulaire commande
- `checkoutContent` - Contenu checkout
- `orderConfirmationContent` - Confirmation commande
- `orderDetail` - Détail commande

**Authentification**

- `login` - Connexion
- `register` - Inscription

**Compte**

- `accountContent` - Contenu compte
- `accountDashboard` - Tableau de bord
- `wishlistContent` - Liste de souhaits

**Footer (Pied de page)**

- `footerModern` - Footer complet
- `footerMinimal` - Footer simple

---

## 🎯 STRUCTURE FINALE D'UN TEMPLATE COMPLET

```typescript
{
  // === IDENTIFICATION ===
  id: "template-unique-id",
  name: "Nom du Template",
  description: "Description du template",
  category: "home|product|cart|checkout|content",
  preview: "/images/preview.jpg",
  isDefault: false,

  // === SECTIONS ===
  sections: [
    {
      type: "sectionType",
      props: {
        content: { /* contenu */ },
        config: { /* configuration */ },
        styles: { /* styles spécifiques */ }
      }
    }
    // ... autres sections
  ],

  // === PARAMÈTRES GLOBAUX ===
  settings: {
    primaryColor: "#d4af37",
    secondaryColor: "#1a1a1a",
    backgroundColor: "#ffffff",
    fontFamily: "sans",
    spacing: "normal"
  },

  // === MÉTADONNÉES ===
  metadata: {
    author: "Nom",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
    version: "1.0"
  }
}
```

---

**Document prêt pour génération automatique de templates !** ✅
