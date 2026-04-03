// ============================================
// SECTION DEFAULTS - Default props for each section type
// ============================================

import type { SectionType, StyleProps } from '@/types/builder-types';
import { getDefaultHeaderNavigationSettings } from '@/lib/header-navigation';

const defaultStyles: StyleProps = {
  backgroundColor: '#ffffff',
  textColor: '#1a1a1a',
  accentColor: '#d4af37',
  paddingY: 60,
  paddingX: 24,
  marginY: 0,
  marginX: 0,
  borderWidth: 0,
  borderColor: '#e5e5e5',
  borderRadius: 8,
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: 16,
  fontWeight: '400',
  lineHeight: 1.5,
  letterSpacing: 0,
  textAlign: 'left',
  maxWidth: '100%',
  containerWidth: 'container',
};

export const getDefaultSectionProps = (type: SectionType): Record<string, any> & { styles?: StyleProps } => {
  if (type === 'announcementBar') {
    return {
      content: {
        messages: ['Livraison gratuite des 100 EUR', 'Retours gratuits sous 30 jours'],
        autoRotate: true,
        interval: 5000,
        dismissible: false,
        icon: 'sparkles',
      },
      config: {
        variant: 'default',
        layout: 'center',
        showNavigation: true,
        showDots: false,
        showCloseButton: false,
      },
      style: {
        colors: {
          background: 'primary',
          text: 'white',
          accent: 'accent',
        },
        spacing: {
          paddingY: '3',
          container: 'full',
        },
        typography: {
          fontSize: 'sm',
          textTransform: 'uppercase',
        },
      },
    };
  }

  if (type === 'categoryGrid') {
    return {
      content: {
        title: 'Nos categories',
        subtitle: 'Explorez notre selection',
        categories: [
          {
            name: 'Categorie 1',
            description: 'Collection essentielle',
            image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop',
            productCount: 24,
            href: '/produits',
          },
          {
            name: 'Categorie 2',
            description: 'Pieces iconiques',
            image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=400&fit=crop',
            productCount: 18,
            href: '/produits',
          },
          {
            name: 'Categorie 3',
            description: 'Nouveautes du moment',
            image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=400&fit=crop',
            productCount: 32,
            href: '/produits',
          },
          {
            name: 'Categorie 4',
            description: 'Editions selectionnees',
            image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400&h=400&fit=crop',
            productCount: 15,
            href: '/produits',
          },
        ],
      },
      config: {
        variant: 'mosaic-2x2',
        columns: 4,
        aspectRatio: '3/4',
        hoverEffect: 'zoom',
        showProductCount: true,
      },
      style: {
        colors: {
          background: 'secondary',
          text: 'primary',
          accent: 'accent',
        },
        spacing: {
          paddingY: '16',
          container: 'contained',
          gap: '6',
        },
        typography: {
          titleSize: '4xl',
          textAlign: 'center',
        },
      },
    };
  }

  if (type === 'productGrid') {
    return {
      content: {
        eyebrowText: 'Notre Selection',
        title: 'Nouveautes',
        subtitle: 'Decouvrez nos meilleures ventes',
        viewAllButton: {
          text: 'Voir tout',
          href: '/produits',
        },
        filters: {
          enabled: true,
        },
        products: [
          { id: '1', name: 'Produit 1', price: 99, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=500&fit=crop', rating: 4.5, href: '/product' },
          { id: '2', name: 'Produit 2', price: 149, oldPrice: 199, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=500&fit=crop', badge: '-25%', rating: 4.8, href: '/product' },
          { id: '3', name: 'Produit 3', price: 79, image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=500&fit=crop', badge: 'Nouveau', rating: 4.2, href: '/product' },
          { id: '4', name: 'Produit 4', price: 199, image: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=500&fit=crop', rating: 4.7, href: '/product' },
        ],
      },
      config: {
        variant: 'grid-4',
        columns: 4,
        cardStyle: 'standard',
        dynamicSource: 'newest',
        priceThreshold: 100,
        categoryFilter: '',
        showViewAllButton: true,
        viewAllButtonPosition: 'header-right',
        viewAllButtonStyle: 'text',
        showQuickView: true,
        showWishlist: true,
        loadMore: 'button',
        productsPerPage: 8,
      },
      cardConfig: {
        image: {
          aspectRatio: '3/4',
          hoverEffect: 'zoom',
          hoverScale: 1.08,
        },
        info: {
          alignment: 'left',
          showRating: true,
          showPrice: true,
          showBadge: true,
        },
        badge: {
          position: 'top-left',
          style: 'pill',
        },
        quickView: true,
        wishlist: true,
      },
      style: {
        colors: {
          background: 'white',
          text: '#1a1a1a',
          accent: '#d4af37',
        },
        spacing: {
          paddingY: '16',
          container: 'contained',
          gap: '6',
        },
      },
    };
  }

  switch (type) {
    case 'headerModern':
      return {
        content: {
          logo: { type: 'text', text: 'VOTRE MARQUE' },
          navigation: [
            { label: 'Accueil', href: '/', enabled: true },
            { label: 'Produits', href: '/produit', enabled: true },
            { label: 'À propos', href: '/a-propos', enabled: true },
            { label: 'Contact', href: '/contact', enabled: true },
          ],
          actions: ['search', 'account', 'cart'],
          ctaButton: { text: 'Acheter', href: '/produit', variant: 'primary' },
        },
        config: {
          variant: 'default',
          behavior: {
            sticky: true,
          },
        },
        style: {
          colors: {
            background: 'white',
            text: 'primary',
            accent: 'accent',
          },
          spacing: {
            paddingY: '4',
            container: 'contained',
          },
        },
      };

    case 'headerMinimal':
      return {
        logo: { text: 'VOTRE MARQUE' },
        navigation: [],
        navigationSettings: getDefaultHeaderNavigationSettings(),
        showSearch: false,
        showCart: false,
        showAccount: false,
        styles: {
          ...defaultStyles,
          backgroundColor: '#ffffff',
          paddingY: 16,
        },
      };

    case 'hero':
      return {
        title: 'L\'Art du Style Moderne',
        subtitle: 'Une collection exclusive pensée pour ceux qui n\'acceptent que l\'excellence. Découvrez nos pièces uniques.',
        backgroundImage: '',
        ctaText: 'Explorer la Collection',
        ctaLink: '/produits',
        secondaryCtaText: 'Notre Histoire',
        secondaryCtaLink: '/a-propos',
        overlayOpacity: 0.5,
        overlayColor: '#000000',
        alignment: 'center',
        size: 'full',
        layout: 'centered',
        animation: 'slideUp',
        buttonStyle: 'solid',
        buttonRadius: 'pill',
        styles: {
          ...defaultStyles,
          backgroundColor: '#0a0a0a',
          textColor: '#ffffff',
          accentColor: '#c9a96e',
          paddingY: 140,
          fontFamily: "'Inter', system-ui, sans-serif",
        },
      };

    case 'announcementBar':
      return {
        messages: ['Livraison gratuite dès 100€', 'Retours gratuits sous 30 jours'],
        autoRotate: true,
        interval: 5000,
        showIcons: true,
        styles: {
          ...defaultStyles,
          backgroundColor: '#1a1a1a',
          textColor: '#ffffff',
          accentColor: '#d4af37',
          paddingY: 12,
        },
      };

    case 'statsBar':
      return {
        items: [
          { value: '1987', label: 'Fondation' },
          { value: '38+', label: 'Pays livres' },
          { value: '100%', label: 'Matieres premium' },
          { value: '4200+', label: 'Pieces creees' },
        ],
        divider: true,
        styles: {
          ...defaultStyles,
          backgroundColor: '#f5f5f5',
          paddingY: 32,
        },
      };

    case 'categoryGrid':
      return {
        content: {
          title: 'Nos catégories',
          subtitle: 'Explorez notre sélection',
          categories: [
            {
              name: 'Catégorie 1',
              description: 'Collection essentielle',
              image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop',
              productCount: 24,
              href: '/produits',
            },
            {
              name: 'Catégorie 2',
              description: 'Pièces iconiques',
              image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=400&fit=crop',
              productCount: 18,
              href: '/produits',
            },
            {
              name: 'Catégorie 3',
              description: 'Nouveautés du moment',
              image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=400&fit=crop',
              productCount: 32,
              href: '/produits',
            },
            {
              name: 'Catégorie 4',
              description: 'Éditions sélectionnées',
              image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400&h=400&fit=crop',
              productCount: 15,
              href: '/produits',
            },
          ],
        },
        config: {
          variant: 'mosaic-2x2',
          columns: 4,
          aspectRatio: '3/4',
          hoverEffect: 'zoom',
          showProductCount: true,
        },
        style: {
          colors: {
            background: 'secondary',
            text: 'primary',
            accent: 'accent',
          },
          spacing: {
            paddingY: '16',
            container: 'contained',
          },
          typography: {
            titleSize: '4xl',
            textAlign: 'center',
          },
        },
      };

    case 'productGrid':
      return {
        content: {
          eyebrowText: 'Notre Sélection',
          title: 'Nouveautés',
          subtitle: 'Découvrez nos meilleures ventes',
          filters: {
            enabled: true,
          },
          products: [
            { id: '1', name: 'Produit 1', price: 99, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=500&fit=crop', rating: 4.5, href: '/product' },
            { id: '2', name: 'Produit 2', price: 149, oldPrice: 199, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=500&fit=crop', badge: '-25%', rating: 4.8, href: '/product' },
            { id: '3', name: 'Produit 3', price: 79, image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=500&fit=crop', badge: 'Nouveau', rating: 4.2, href: '/product' },
            { id: '4', name: 'Produit 4', price: 199, image: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=500&fit=crop', rating: 4.7, href: '/product' },
          ],
        },
        config: {
          variant: 'grid-4',
          columns: 4,
          cardStyle: 'standard',
          dynamicSource: 'newest',
          priceThreshold: 100,
          categoryFilter: '',
          showQuickView: true,
          showWishlist: true,
          productsPerPage: 8,
        },
        cardConfig: {
          image: {
            aspectRatio: '3/4',
            hoverEffect: 'zoom',
            hoverScale: 1.08,
          },
          info: {
            alignment: 'left',
            showRating: true,
            showPrice: true,
          },
          badge: {
            position: 'top-left',
            style: 'pill',
          },
          quickView: true,
          wishlist: true,
        },
        style: {
          colors: {
            background: 'white',
            text: '#1a1a1a',
            accent: '#d4af37',
          },
          spacing: {
            paddingY: '16',
            container: 'contained',
            gap: '6',
          },
        },
      };

    case 'productDetail':
      return {
        product: {
          id: '1',
          name: 'Produit Exemple',
          price: 149,
          oldPrice: 199,
          description: 'Description détaillée de votre produit avec toutes ses caractéristiques.',
          images: [
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=800&fit=crop',
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=800&fit=crop',
          ],
          badge: 'Nouveau',
          rating: 4.8,
          reviewCount: 42,
          sku: 'PROD-001',
          inStock: true,
          sizes: ['S', 'M', 'L', 'XL'],
          colors: [
            { name: 'Noir', hex: '#1a1a1a' },
            { name: 'Blanc', hex: '#ffffff' },
            { name: 'Gris', hex: '#808080' },
          ],
        },
        showReviews: true,
        showRelatedProducts: true,
        showRecentlyViewed: true,
        showSizeGuide: true,
        showShippingInfo: true,
        styles: {
          ...defaultStyles,
          backgroundColor: '#ffffff',
          paddingY: 60,
        },
      };

    case 'productsContent':
      return {
        title: 'Nos produits',
        subtitle: 'Explorez la collection complete',
        showFilters: true,
        columns: 4,
        styles: {
          ...defaultStyles,
          backgroundColor: '#f9fafb',
          paddingY: 60,
        },
      };

    case 'productDetailContent':
      return {
        showReviews: true,
        showSizeGuide: true,
        showShippingInfo: true,
        showRelatedProducts: true,
        styles: {
          ...defaultStyles,
          backgroundColor: '#f9fafb',
          paddingY: 60,
        },
      };

    case 'collectionHero':
      return {
        title: 'Collections',
        subtitle: 'Explorez la selection',
        image: '',
        overlayOpacity: 0.45,
        styles: {
          ...defaultStyles,
          backgroundColor: '#111111',
          textColor: '#ffffff',
          paddingY: 80,
        },
      };

    case 'editorial':
      return {
        content: {
          eyebrow: { text: 'Notre histoire', style: 'line' },
          title: 'Une section editoriale',
          body: 'Racontez votre marque, votre savoir-faire et vos engagements.',
          cta: [
            { text: 'Decouvrir', href: '/produits', style: 'underline' },
          ],
          media: {
            type: 'image',
            src: '',
            aspectRatio: '3/4',
          },
        },
        config: {
          variant: 'text-image',
          ratio: '50:50',
          verticalAlign: 'center',
        },
        style: {
          colors: {
            background: 'secondary',
            text: 'primary',
            accent: 'accent',
          },
          spacing: {
            paddingY: '16',
            container: 'contained',
            gap: '10',
          },
        },
      };

    case 'promoBar':
      return {
        text: 'Profitez de -20% sur votre première commande avec le code BIENVENUE',
        buttonText: 'En profiter',
        buttonLink: '/produit',
        showCloseButton: true,
        position: 'top',
        styles: {
          ...defaultStyles,
          backgroundColor: '#d4af37',
          textColor: '#1a1a1a',
          paddingY: 16,
        },
      };

    case 'trustBadges':
      return {
        layout: 'row',
        badges: [
          { icon: 'Truck', title: 'Livraison Rapide', description: '2-3 jours ouvrés' },
          { icon: 'Shield', title: 'Paiement Sécurisé', description: '100% sécurisé' },
          { icon: 'RotateCcw', title: 'Retours Faciles', description: '30 jours' },
          { icon: 'Headphones', title: 'Support Client', description: '24/7' },
        ],
        styles: {
          ...defaultStyles,
          backgroundColor: '#f5f5f5',
          paddingY: 40,
        },
      };

    case 'testimonials':
      return {
        content: {
          title: 'Ce que nos clients disent',
          subtitle: 'Des milliers de clients satisfaits',
          testimonials: [
            { author: 'Marie L.', role: 'Cliente fidèle', quote: 'Excellent service et produits de qualité !', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', rating: 5 },
            { author: 'Jean D.', role: 'Client', quote: 'Livraison rapide, je recommande vivement.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', rating: 5 },
            { author: 'Sophie M.', role: 'Cliente', quote: 'Très satisfaite de mon achat, merci !', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', rating: 4 },
          ],
        },
        config: {
          variant: 'slider',
          showRating: true,
          showAvatar: true,
          showNavigation: true,
        },
        style: {
          colors: {
            background: 'white',
            text: 'primary',
            accent: 'accent',
          },
          spacing: {
            paddingY: '16',
            container: 'contained',
          },
        },
      };

    case 'reviews':
      return {
        title: 'Avis Clients',
        showRating: true,
        showPhotos: true,
        showVerifiedBadge: true,
        layout: 'list',
        reviews: [
          { id: '1', author: 'Marie L.', rating: 5, date: '2024-01-15', content: 'Excellent produit, je recommande !', verified: true, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
          { id: '2', author: 'Jean D.', rating: 5, date: '2024-01-10', content: 'Très satisfait de mon achat.', verified: true, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
        ],
        styles: {
          ...defaultStyles,
          backgroundColor: '#f5f5f5',
          paddingY: 60,
        },
      };

    case 'relatedProducts':
      return {
        title: 'Vous aimerez aussi',
        columns: 4,
        showAddToCart: true,
        products: [
          { id: '5', name: 'Produit 5', price: 89, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop', rating: 4.5 },
          { id: '6', name: 'Produit 6', price: 129, image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=500&fit=crop', rating: 4.7 },
          { id: '7', name: 'Produit 7', price: 69, image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=500&fit=crop', rating: 4.3 },
          { id: '8', name: 'Produit 8', price: 159, image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=500&fit=crop', rating: 4.8 },
        ],
        styles: {
          ...defaultStyles,
          backgroundColor: '#ffffff',
          paddingY: 60,
        },
      };

    case 'newsletter':
      return {
        content: {
          title: 'Rejoignez notre newsletter',
          description: 'Inscrivez-vous pour recevoir nos offres exclusives et nos dernières nouveautés.',
          buttonText: 'S\'inscrire',
          placeholder: 'Votre adresse email',
          privacyText: 'J\'accepte de recevoir la newsletter',
        },
        config: {
          variant: 'centered',
          showPrivacy: true,
          requirePrivacy: true,
        },
        style: {
          colors: {
            background: 'primary',
            text: 'white',
            accent: 'accent',
          },
          spacing: {
            paddingY: '16',
            container: 'contained',
          },
        },
      };

    case 'footerModern':
      return {
        content: {
          logo: { type: 'text', text: 'VOTRE MARQUE' },
          description: 'Retrouvez les nouveautés, les produits phares et tous les liens utiles de la boutique.',
          copyright: '© 2024 Votre Marque. Tous droits réservés.',
          newsletter: {
            enabled: false,
            title: 'Correspondance privée',
            description: 'Recevez nos nouvelles et nos offres exclusives.',
            placeholder: 'Votre email',
            buttonText: 'S\'inscrire',
          },
          contactInfo: {
            title: 'Restons en contact',
            address: '',
            phone: '',
            email: '',
          },
          columns: [
            {
              title: 'Boutique',
              links: [
                { label: 'Nouveautés', href: '/produit' },
                { label: 'Produits', href: '/produit' },
                { label: 'Promotions', href: '/produit' },
              ],
            },
            {
              title: 'Aide',
              links: [
                { label: 'FAQ', href: '/faq' },
                { label: 'Livraison', href: '/livraison' },
                { label: 'Retours', href: '/retours' },
              ],
            },
            {
              title: 'Entreprise',
              links: [
                { label: 'À propos', href: '/a-propos' },
                { label: 'Contact', href: '/contact' },
                { label: 'Carrières', href: '/carrieres' },
              ],
            },
          ],
          social: {
            whatsapp: '',
            instagram: '',
            facebook: '',
            tiktok: '',
            youtube: '',
          },
        },
        config: {
          variant: 'asymmetric',
          showSocial: true,
          showNewsletter: true,
        },
        style: {
          colors: {
            background: 'primary',
            text: 'white',
            accent: 'accent',
          },
          spacing: {
            paddingY: '16',
            container: 'contained',
          },
        },
      };

    case 'footerMinimal':
      return {
        logo: { text: 'VOTRE MARQUE' },
        copyright: '© 2024 Votre Marque. Tous droits réservés.',
        newsletter: false,
        styles: {
          ...defaultStyles,
          backgroundColor: '#1a1a1a',
          textColor: '#ffffff',
          paddingY: 40,
        },
      };

    case 'breadcrumb':
      return {
        items: [
          { label: 'Accueil', link: '/' },
          { label: 'Produits', link: '/produit' },
          { label: 'Catégorie', link: '/produit' },
        ],
        showHome: true,
        separator: 'chevron',
        styles: {
          ...defaultStyles,
          backgroundColor: '#f5f5f5',
          paddingY: 16,
        },
      };

    case 'cart':
      return {
        title: 'Mon Panier',
        emptyMessage: 'Votre panier est vide. Découvrez nos produits !',
        showCouponField: true,
        showShippingCalculator: true,
        cartItems: [],
        styles: {
          ...defaultStyles,
          backgroundColor: '#ffffff',
          paddingY: 60,
        },
      };

    case 'checkoutForm':
      return {
        title: 'Finaliser la commande',
        steps: ['Informations', 'Livraison', 'Paiement'],
        currentStep: 1,
        styles: {
          ...defaultStyles,
          backgroundColor: '#f5f5f5',
          paddingY: 60,
        },
      };

    case 'checkoutSummary':
      return {
        title: 'Résumé de la commande',
        showItemImages: true,
        editable: true,
        items: [],
        subtotal: 0,
        shipping: 0,
        discount: 0,
        total: 0,
        styles: {
          ...defaultStyles,
          backgroundColor: '#ffffff',
          paddingY: 40,
        },
      };

    case 'paymentMethods':
      return {
        title: 'Moyens de paiement',
        showSecurityBadges: true,
        layout: 'list',
        methods: [
          { id: 'card', name: 'Carte bancaire', icon: 'CreditCard', description: 'Visa, Mastercard, Amex' },
          { id: 'paypal', name: 'PayPal', icon: 'Wallet', description: 'Paiement sécurisé' },
          { id: 'apple', name: 'Apple Pay', icon: 'Smartphone', description: 'Paiement rapide' },
        ],
        styles: {
          ...defaultStyles,
          backgroundColor: '#ffffff',
          paddingY: 40,
        },
      };

    case 'accountProfile':
      return {
        title: 'Mon Profil',
        showAvatar: true,
        user: {
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'jean.dupont@email.com',
          phone: '+33 6 12 34 56 78',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        },
        styles: {
          ...defaultStyles,
          backgroundColor: '#ffffff',
          paddingY: 40,
        },
      };

    case 'orderHistory':
      return {
        title: 'Mes Commandes',
        showFilters: true,
        itemsPerPage: 10,
        orders: [
          { id: 'CMD-001', date: '2024-01-15', status: 'delivered', total: 248, items: 2 },
          { id: 'CMD-002', date: '2024-01-05', status: 'shipped', total: 149, items: 1 },
          { id: 'CMD-003', date: '2023-12-20', status: 'delivered', total: 325, items: 3 },
        ],
        styles: {
          ...defaultStyles,
          backgroundColor: '#f5f5f5',
          paddingY: 60,
        },
      };

    case 'wishlist':
      return {
        title: 'Mes Favoris',
        emptyMessage: 'Votre liste de favoris est vide',
        addToCartText: 'Ajouter au panier',
        products: [
          { id: '10', name: 'Produit Favori 1', price: 129, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop' },
          { id: '11', name: 'Produit Favori 2', price: 89, image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=500&fit=crop' },
        ],
        styles: {
          ...defaultStyles,
          backgroundColor: '#ffffff',
          paddingY: 60,
        },
      };

    case 'searchBar':
      return {
        placeholder: 'Rechercher un produit...',
        showCategories: true,
        showFilters: true,
        showPopularSearches: true,
        popularSearches: ['Produit 1', 'Produit 2', 'Nouveau', 'Promo'],
        styles: {
          ...defaultStyles,
          backgroundColor: '#ffffff',
          paddingY: 40,
        },
      };

    case 'features':
      return {
        title: 'Nos Avantages',
        subtitle: 'Pourquoi nous choisir',
        layout: 'grid',
        features: [
          { icon: 'Truck', title: 'Livraison Rapide', description: '2-3 jours ouvrés' },
          { icon: 'Shield', title: 'Qualité Garantie', description: 'Produits vérifiés' },
          { icon: 'RotateCcw', title: 'Retours Faciles', description: '30 jours' },
          { icon: 'Headphones', title: 'Support 24/7', description: 'Toujours là pour vous' },
        ],
        styles: {
          ...defaultStyles,
          backgroundColor: '#f5f5f5',
          paddingY: 80,
        },
      };

    case 'banner':
      return {
        title: 'Collection Spéciale',
        subtitle: 'Découvrez notre nouvelle collection avec des offres exclusives',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop',
        ctaText: 'Découvrir',
        ctaLink: '/produit',
        position: 'right',
        styles: {
          ...defaultStyles,
          backgroundColor: '#1a1a1a',
          textColor: '#ffffff',
          paddingY: 80,
        },
      };

    case 'countdown':
      return {
        title: 'Offre Limitée',
        subtitle: 'Profitez de nos réductions exceptionnelles',
        buttonText: 'En profiter',
        buttonLink: '/produit',
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        showLabels: true,
        styles: {
          ...defaultStyles,
          backgroundColor: '#d4af37',
          textColor: '#1a1a1a',
          paddingY: 60,
        },
      };

    case 'wishlistContent':
      return {
        title: 'Mes Favoris',
        emptyMessage: 'Votre liste de favoris est vide. Ajoutez des produits pour les retrouver ici.',
        showEmptyState: true,
        showProducts: true,
        styles: {
          ...defaultStyles,
          backgroundColor: '#ffffff',
          paddingY: 60,
        },
      };

    case 'accountContent':
      return {
        title: 'Mon Compte',
        subtitle: 'Gerez vos informations et vos commandes',
        showOrders: true,
        showAddresses: true,
        showProfile: true,
        styles: {
          ...defaultStyles,
          backgroundColor: '#ffffff',
          paddingY: 60,
        },
      };

    case 'checkoutContent':
      return {
        title: 'Finaliser la commande',
        showSteps: true,
        steps: 'Livraison\nPaiement\nConfirmation',
        styles: {
          ...defaultStyles,
          backgroundColor: '#ffffff',
          paddingY: 60,
        },
      };

    case 'orderConfirmationContent':
      return {
        title: 'Commande confirmee !',
        subtitle: 'Merci pour votre achat.',
        showOrderDetails: true,
        showTracking: true,
        styles: {
          ...defaultStyles,
          backgroundColor: '#ffffff',
          paddingY: 60,
        },
      };

    case 'orderDetail':
      return {
        styles: {
          ...defaultStyles,
          backgroundColor: '#ffffff',
          paddingY: 60,
        },
      };

    case 'login':
      return {
        title: 'Connexion',
        subtitle: 'Accedez a votre compte',
        showEmail: true,
        showPassword: true,
        showRememberMe: true,
        showForgotPassword: true,
        showSocialLogin: true,
        registerLink: '/inscription',
        styles: {
          ...defaultStyles,
          backgroundColor: '#ffffff',
          paddingY: 80,
        },
      };

    case 'register':
      return {
        title: 'Creer un compte',
        subtitle: 'Rejoignez notre communaute',
        showFirstName: true,
        showLastName: true,
        showEmail: true,
        showPhone: true,
        showPassword: true,
        showPasswordConfirm: true,
        showTerms: true,
        showNewsletter: true,
        showSocialLogin: true,
        loginLink: '/connexion',
        styles: {
          ...defaultStyles,
          backgroundColor: '#ffffff',
          paddingY: 80,
        },
      };

    case 'accountDashboard':
      return {
        title: 'Mon Compte',
        subtitle: 'Gerez vos informations et vos commandes',
        styles: {
          ...defaultStyles,
          backgroundColor: '#f8fafc',
          paddingY: 60,
        },
      };

    default:
      return {
        styles: defaultStyles,
      };
  }
};

export const sectionTypeLabels: Partial<Record<SectionType, string>> = {
  headerModern: 'Header Moderne',
  headerMinimal: 'Header Minimal',
  hero: 'Hero',
  announcementBar: 'Barre d\'annonce',
  categoryGrid: 'Grille de catégories',
  productGrid: 'Grille de produits',
  productDetail: 'Détail produit',
  promoBar: 'Barre promo',
  trustBadges: 'Badges de confiance',
  testimonials: 'Témoignages',
  reviews: 'Avis clients',
  relatedProducts: 'Produits similaires',
  newsletter: 'Newsletter',
  footerModern: 'Footer Moderne',
  footerMinimal: 'Footer Minimal',
  breadcrumb: 'Fil d\'Ariane',
  cart: 'Panier',
  checkoutForm: 'Formulaire de commande',
  checkoutSummary: 'Résumé de commande',
  paymentMethods: 'Méthodes de paiement',
  accountProfile: 'Profil utilisateur',
  orderHistory: 'Historique des commandes',
  wishlist: 'Liste de souhaits',
  searchBar: 'Barre de recherche',
  features: 'Fonctionnalités',
  banner: 'Bannière',
  countdown: 'Compte à rebours',
};

export const sectionCategories = {
  header: ['headerModern', 'headerMinimal'] as SectionType[],
  content: [
    'hero',
    'announcementBar',
    'categoryGrid',
    'productGrid',
    'productDetail',
    'promoBar',
    'trustBadges',
    'testimonials',
    'reviews',
    'relatedProducts',
    'newsletter',
    'breadcrumb',
    'cart',
    'checkoutForm',
    'checkoutSummary',
    'paymentMethods',
    'accountProfile',
    'orderHistory',
    'wishlist',
    'searchBar',
    'features',
    'banner',
    'countdown',
  ] as SectionType[],
  footer: ['footerModern', 'footerMinimal'] as SectionType[],
};
