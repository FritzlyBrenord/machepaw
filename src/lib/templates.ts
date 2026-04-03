// ============================================
// TEMPLATES - Pre-built store templates
// Inspired by Shopify theme templates
// ============================================

import type { Template } from '@/types/builder-types';
import { v4 as uuidv4 } from 'uuid';

// --- Template 1: Fashion Boutique Premium ---

// ============================================================
//  fashionBoutiqueTemplate — Édition Prestige
//  Palette : Noir profond · Ivoire chaud · Or ancien · Gris pierre
//  Typographie : Playfair Display (titres) + Jost (corps)
//  Philosophie : Couture parisienne — chaque détail compte
// ============================================================


export const fashionBoutiqueTemplate: Template = {
  id: 'fashion-boutique',
  name: 'Maison Élégance',
  description:
    'Un template couture premium au design classique et intemporel. L\'essence du luxe français : précision, harmonie et élégance sans ostentation.',
  thumbnail:
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=400&fit=crop',
  category: 'fashion',

  // ── Palette classique luxe ─────────────────────────────────
  colorScheme: {
    primary:    '#0c0c0c',   // Noir de jais profond
    secondary:  '#f7f5f0',   // Ivoire antique
    accent:     '#c5a572',   // Or vieilli classique
    background: '#ffffff',   // Blanc pur
    text:       '#1a1a1a',   // Noir doux pour lecture
  },

  project: {
    id: `template-fashion-prestige`,
    name: 'Maison Élégance',
    description: 'Boutique de haute couture — L\'art de l\'exception',

    // ── Sections globales ────────────────────────────────────────
    globalSections: {

      // Barre d'annonce — discrète, aristocratique
      announcementBar: {
        id: 'global-announcement',
        type: 'announcementBar',
        order: 0,
        props: {
          messages: [
            'Livraison mondiale offerte sans minimum',
            'Atelier Paris — Sur mesure disponible',
            'Collection Privée sur invitation',
          ],
          autoRotate: true,
          interval: 6000,
          showIcons: false,
          styles: {
            backgroundColor: '#0c0c0c',
            textColor:       '#e8e4d9',   // Ivoire patiné
            accentColor:     '#c5a572',
            fontSize:        11,
            letterSpacing:   '0.2em',
            fontFamily:      "'Cormorant Garamond', 'Times New Roman', serif",
            fontWeight:      400,
            paddingY:        10,
          },
        },
      },

      // Header — Aristocratique, centré, gravité
      header: {
        id: 'global-header',
        type: 'headerModern',
        order: 0,
        props: {
          logo: {
            text:        'MAISON ÉLÉGANCE',
            letterSpacing: '0.35em',
            fontFamily:  "'Cormorant Garamond', serif",
            fontWeight:  300,
            fontSize:    14,
          },
          blocks: [
            { id: 'nav-1', label: 'Haute Couture',  link: '/produits', enabled: true },
            { id: 'nav-2', label: 'Prêt-à-Porter',  link: '/produits', enabled: true },
            { id: 'nav-3', label: 'Mariage',        link: '/produits', enabled: true },
            { id: 'nav-4', label: 'Accessoires',    link: '/produits', enabled: true },
            { id: 'nav-5', label: 'L\'Atelier',      link: '/produits', enabled: true },
          ],
          ctaButton: {
            text:    'Rendez-vous',
            link:    '/produits',
            variant: 'ghost',
            show:    false,
          },
          showSearch:  true,
          showCart:    true,
          showAccount: true,
          sticky:      true,
          borderBottom: true,
          styles: {
            backgroundColor: '#ffffff',
            textColor:       '#0c0c0c',
            accentColor:     '#c5a572',
            hoverColor:      '#c5a572',
            borderColor:     '#e8e4d9',
            fontFamily:      "'Cormorant Garamond', serif",
            fontSize:        13,
            letterSpacing:   '0.15em',
            fontWeight:      400,
            paddingY:        28,
          },
        },
      },

      // Footer — Colonnade classique, majestueux
      footer: {
        id: 'global-footer',
        type: 'footerModern',
        order: 0,
        props: {
          logo: {
            text:          'MAISON ÉLÉGANCE',
            letterSpacing: '0.35em',
            fontFamily:    "'Cormorant Garamond', serif",
            fontWeight:    300,
            fontSize:      13,
          },
          copyright: '© 2026 Maison Élégance. Tous droits réservés.',
          newsletter:    true,
          newsletterLabel: 'Lettre d\'information',
          newsletterSub:   'Actualités, collections privées et invitations.',
          columns: [
            {
              title: 'Collections',
              links: [
                { label: 'Haute Couture',   url: '/produits' },
                { label: 'Prêt-à-Porter',   url: '/produits' },
                { label: 'Mariage',         url: '/produits' },
                { label: 'Accessoires',     url: '/produits' },
              ],
            },
            {
              title: 'Maison',
              links: [
                { label: 'L\'Atelier',      url: '/produits' },
                { label: 'Savoir-faire',    url: '/produits' },
                { label: 'Sur mesure',      url: '/produits' },
                { label: 'Nous contacter',  url: '/produits' },
              ],
            },
            {
              title: 'Légal',
              links: [
                { label: 'Livraison & Retours', url: '/produits' },
                { label: 'Conditions générales', url: '/produits' },
                { label: 'Confidentialité',      url: '/produits' },
              ],
            },
          ],
          styles: {
            backgroundColor: '#0c0c0c',
            textColor:       '#a8a095',   // Taupe élégant
            accentColor:     '#c5a572',
            dividerColor:    '#2a2a2a',
            fontFamily:      "'Cormorant Garamond', serif",
            fontSize:        13,
            letterSpacing:   '0.06em',
            paddingY:        80,
          },
        },
      },
    },

    // ── Pages ────────────────────────────────────────────────────
    pages: [

      // ── PAGE : Accueil ────────────────────────────────────────
      {
        id: 'page-home',
        name: 'Accueil',
        slug: '/',
        isHome: true,
        meta: {
          title:       'Maison Élégance — Haute Couture Paris',
          description: 'Maison de couture fondée en 1987. Créations sur mesure et prêt-à-porter d\'exception.',
        },
        sections: [

          // Hero — Monumental, classique, gravité absolue
          {
            id: 'sect-hero',
            type: 'hero',
            order: 0,
            props: {
              content: {
                pretitle: {
                  text: 'Collection Exclusive',
                  style: 'line',
                },
                title: "L'Élégance n'a pas de mode",
                subtitle: 'Haute Couture · Paris depuis 1987',
                cta: {
                  primary: {
                    text: 'Découvrir la collection',
                    href: '/produits',
                    style: 'solid',
                    icon: true,
                  },
                  secondary: {
                    text: 'Notre histoire',
                    href: '/a-propos',
                    style: 'outline',
                  },
                },
                media: {
                  type: 'image',
                  src: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920&h=1080&fit=crop',
                  parallax: true,
                  zoomOnHover: false,
                },
                showScrollIndicator: true,
                // Slides vides par défaut - peut être configuré pour activer le slideshow
                slides: [],
              },
              config: {
                variant: 'fullscreen-center',
                ratio: '50:50',
                verticalAlign: 'center',
                titleAnimation: 'split-text',
                animation: {
                  entrance: 'fade-in',
                  duration: 'normal',
                  stagger: true,
                },
                overlay: {
                  enabled: true,
                  type: 'gradient',
                  opacity: 0.45,
                  color: '#000000',
                },
                slideshow: {
                  enabled: false,
                  autoplay: true,
                  interval: 5000,
                  transition: 'fade',
                  duration: 0.8,
                  showArrows: true,
                  showDots: true,
                  pauseOnHover: true,
                  loop: true,
                },
              },
              style: {
                colors: {
                  background: 'transparent',
                  text: '#ffffff',
                  accent: '#c9a96e',
                },
                typography: {
                  textAlign: 'center',
                  titleWeight: 'light',
                  titleLineHeight: 'tight',
                  titleLetterSpacing: 'tighter',
                },
                spacing: {
                  container: 'contained',
                  minHeight: '100vh',
                  paddingY: '0',
                },
              },
              classes: {
                root: '',
                container: '',
                content: '',
                pretitle: '',
                title: '',
                subtitle: '',
                body: '',
                ctaGroup: '',
                ctaPrimary: '',
                ctaSecondary: '',
                scrollIndicator: '',
              },
            },
          },

          // Bande signature — Chiffres avec majesté
          {
            id: 'sect-stats',
            type: 'statsBar',
            order: 1,
            props: {
              items: [
                { value: '1987',  label: 'Fondation' },
                { value: '38',    label: 'Années d\'excellence' },
                { value: '12',    label: 'Artisans' },
                { value: '1',     label: 'Atelier parisien' },
              ],
              divider: true,
              styles: {
                backgroundColor: '#f7f5f0',
                textColor:       '#0c0c0c',
                accentColor:     '#c5a572',
                fontFamily:      "'Cormorant Garamond', serif",
                valueFontSize:   48,
                labelFontSize:   12,
                labelLetterSpacing: '0.15em',
                paddingY:        60,
              },
            },
          },

          // Grille catégories — Classique, équilibré, majestueux
          {
            id: 'sect-atelier-note',
            type: 'atelierNote',
            order: 1.5,
            props: {
              content: {
                badge: 'Atelier prive',
                title: 'Une ligne pensee pour durer',
                description:
                  'Un bloc editorial compact integre au premier template pour valider la lecture automatique.',
                ctaText: 'Decouvrir',
                ctaLink: '/produits',
                note: 'Edition limitee',
              },
              config: {
                layout: 'left',
                showAccentLine: true,
              },
              style: {
                colors: {
                  background: '#f7f5f0',
                  text: '#0c0c0c',
                  accent: '#c5a572',
                },
                spacing: {
                  paddingY: '16',
                  container: 'contained',
                },
              },
              classes: {},
            },
          },

          // Grille categories - Classique, equilibre, majestueux
          {
            id: 'sect-categories',
            type: 'categoryGrid',
            order: 2,
            props: {
              title:          'Collections',
              titleStyle:     'editorial',
              titleFontSize:  12,
              titleLetterSpacing: '0.3em',
              columns:        2,
              aspectRatio:    '3/4',
              showProductCount: false,
              hoverEffect:    'zoom-subtle',
              categories: [
                {
                  name:   'Haute Couture',
                  image:  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=1000&fit=crop',
                  link:   '/produits',
                  caption: 'L\'art de la silhouette parfaite',
                },
                {
                  name:   'Prêt-à-Porter',
                  image:  'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=1000&fit=crop',
                  link:   '/produits',
                  caption: 'L\'élégance au quotidien',
                },
                {
                  name:   'Mariage',
                  image:  'https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=800&h=1000&fit=crop',
                  link:   '/produits',
                  caption: 'Un jour, une robe, une histoire',
                },
                {
                  name:   'Accessoires',
                  image:  'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&h=1000&fit=crop',
                  link:   '/produits',
                  caption: 'Les signatures d\'une élégance assumée',
                },
              ],
              styles: {
                backgroundColor: '#ffffff',
                textColor:       '#ffffff',
                accentColor:     '#c5a572',
                overlayOpacity:  0.35,
                labelFontFamily: "'Cormorant Garamond', serif",
                labelFontSize:   28,
                captionFontFamily: "'Cormorant Garamond', serif",
                captionLetterSpacing: '0.12em',
                gap:             4,
                paddingY:        0,
              },
            },
          },

          // Sélection produits — 4 colonnes, aristocratique
          {
            id: 'sect-products',
            type: 'productGrid',
            order: 3,
            props: {
              title:          'Créations',
              titleFontFamily: "'Cormorant Garamond', serif",
              titleFontSize:  46,
              subtitle:       'Pièces sélectionnées pour leur caractère intemporel',
              subtitleLetterSpacing: '0.15em',
              subtitleUppercase: true,
              columns:        4,
              showFilters:    false,
              cardStyle:      'minimal',
              showRating:     false,
              showBadge:      true,
              hoverEffect:    'reveal-actions',
              config: {
                dynamicSource: 'recommended',
                productsPerPage: 4,
              },
              products: [
                {
                  id:    '1',
                  name:  'Robe Opéra',
                  price: 2850,
                  image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=500&h=650&fit=crop',
                  badge: 'Nouvelle',
                  material: 'Soie sauvage, broderie main',
                },
                {
                  id:    '2',
                  name:  'Tailleur Majorelle',
                  price: 1650,
                  image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&h=650&fit=crop',
                  badge: 'Iconique',
                  material: 'Laine vierge, doublure soie',
                },
                {
                  id:    '3',
                  name:  'Robe Divine',
                  price: 3200,
                  oldPrice: 3800,
                  image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&h=650&fit=crop',
                  badge: '-15%',
                  material: 'Crêpe de Chine, perles brodées',
                },
                {
                  id:    '4',
                  name:  'Manteau Impérial',
                  price: 2400,
                  image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500&h=650&fit=crop',
                  material: 'Cachemire double face',
                },
              ],
              styles: {
                backgroundColor:     '#f7f5f0',
                textColor:           '#0c0c0c',
                accentColor:         '#c5a572',
                secondaryTextColor:  '#6b6560',
                priceFontFamily:     "'Cormorant Garamond', serif",
                nameFontFamily:      "'Cormorant Garamond', serif",
                nameFontSize:        17,
                paddingY:            120,
                columnGap:           40,
              },
            },
          },

          // Section éditoriale — Classique, harmonieux
          {
            id: 'sect-editorial',
            type: 'editorial',
            order: 4,
            props: {
              layout:    'image-right',
              image:     'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&h=1100&fit=crop',
              eyebrow:   'L\'Atelier',
              title:     'Une maison où\ntemps et\ntalent se rencontrent',
              body:      'Dans notre atelier du Faubourg Saint-Antoine, douze artisans perpétuent un savoir-faire transmis de génération en génération. Chaque pièce naît d\'un dialogue entre la main et la matière, entre l\'héritage et la modernité. Nous ne créons pas de mode. Nous créons des vêtements pour une vie.',
              ctaText:   'Notre histoire',
              ctaLink:   '/produits',
              ctaStyle:  'underline',
              imageAspectRatio: '3/4',
              styles: {
                backgroundColor:   '#f7f5f0',
                textColor:         '#0c0c0c',
                accentColor:       '#c5a572',
                eyebrowColor:      '#c5a572',
                eyebrowLetterSpacing: '0.25em',
                titleFontFamily:   "'Cormorant Garamond', serif",
                titleFontSize:     52,
                bodyFontFamily:    "'Cormorant Garamond', serif",
                bodyColor:         '#4a4540',
                paddingY:          140,
              },
            },
          },

          // Trust — Bandeau de confiance classique
          {
            id: 'sect-trust',
            type: 'trustBadges',
            order: 5,
            props: {
              layout:  'row',
              divider: true,
              badges: [
                {
                  icon:        'Crown',
                  title:       'Artisanat d\'excellence',
                  description: 'Façonné à la main dans notre atelier parisien',
                },
                {
                  icon:        'Gem',
                  title:       'Matières nobles',
                  description: 'Soie, cachemire, laine vierge d\'origine certifiée',
                },
                {
                  icon:        'Clock',
                  title:       'Sur mesure',
                  description: 'Rendez-vous privé et ajustements personnalisés',
                },
              ],
              styles: {
                backgroundColor: '#0c0c0c',
                textColor:       '#ffffff',
                accentColor:     '#c5a572',
                iconColor:       '#c5a572',
                dividerColor:    '#2a2a2a',
                titleFontFamily: "'Cormorant Garamond', serif",
                titleLetterSpacing: '0.1em',
                iconSize:        24,
                paddingY:        70,
              },
            },
          },

          // Testimonials — Citations classiques, majestueuses
          {
            id: 'sect-testimonials',
            type: 'testimonials',
            order: 6,
            visible: true,
            props: {
              layout:   'single-quote',
              title:    null,
              testimonials: [
                {
                  name:    'Comtesse de R.',
                  role:    'Cliente depuis 2003',
                  content: 'On ne trouve nulle part ailleurs cette compréhension de la silhouette féminine. Chaque robe est une architecture qui vous porte.',
                  rating:  5,
                },
                {
                  name:    'Mme L. Dubois',
                  role:    'Avocate — Paris',
                  content: 'J\'ai fait appel à la Maison pour ma robe de mariage. Un moment d\'exception, une création qui restera dans ma famille.',
                  rating:  5,
                },
                {
                  name:    'Baronne S.',
                  role:    'Mécène d\'art',
                  content: 'Le luxe véritable, c\'est celui qu\'on ne montre pas. C\'est exactement ce que propose cette Maison avec une discrétion parfaite.',
                  rating:  5,
                },
              ],
              autoPlay:  true,
              interval:  8000,
              styles: {
                backgroundColor:    '#ffffff',
                textColor:          '#0c0c0c',
                accentColor:        '#c5a572',
                quoteFontFamily:    "'Cormorant Garamond', serif",
                quoteFontSize:      32,
                quoteStyle:         'italic',
                metaFontFamily:     "'Cormorant Garamond', serif",
                metaLetterSpacing:  '0.15em',
                paddingY:           120,
              },
            },
          },

          // Newsletter — Ligne fine, classique
          {
            id: 'sect-newsletter',
            type: 'newsletter',
            order: 7,
            props: {
              eyebrow:            'Correspondance',
              title:              'L\'art de rester informé',
              subtitle:           'Collections privées, invitations et actualités de la Maison.',
              buttonText:         'S\'inscrire',
              placeholder:        'Votre adresse e-mail',
              buttonStyle:        'filled-dark',
              showPrivacyCheckbox: true,
              privacyText:        'J\'accepte de recevoir la correspondance de la Maison.',
              layout:             'centered-minimal',
              styles: {
                backgroundColor:    '#f7f5f0',
                textColor:          '#0c0c0c',
                accentColor:        '#c5a572',
                eyebrowColor:       '#c5a572',
                eyebrowLetterSpacing: '0.25em',
                titleFontFamily:    "'Cormorant Garamond', serif",
                titleFontSize:      40,
                inputBorder:        '#d4cdc6',
                inputBackground:    '#ffffff',
                paddingY:           120,
              },
            },
          },
        ],
      },

      // ── PAGE : Produit ────────────────────────────────────────
      {
        id: 'page-product',
        name: 'Produit',
        slug: '/produit',
        isHome: false,
        meta: {
          title:       'Robe Opéra — Maison Élégance',
          description: 'Robe en soie sauvage avec broderie main. Création sur mesure disponible.',
        },
        sections: [
          {
            id: 'sect-breadcrumb',
            type: 'breadcrumb',
            order: 0,
            props: {
              showHome:  true,
              separator: 'slash',
              items: [
                { label: 'Accueil', link: '/' },
                { label: 'Haute Couture',   link: '/produits' },
                { label: 'Robes de soirée',   link: '/produits' },
              ],
              styles: {
                backgroundColor:  '#ffffff',
                textColor:        '#8a8279',
                activeColor:      '#0c0c0c',
                fontFamily:       "'Cormorant Garamond', serif",
                fontSize:         12,
                letterSpacing:    '0.1em',
                paddingY:         24,
                borderBottom:     '#e8e4d9',
              },
            },
          },
          {
            id: 'sect-product-detail',
            type: 'productDetailContent',
            order: 1,
            props: {
              product: {
                id:           '1',
                name:         'Robe Opéra',
                collection:   'Haute Couture 2026',
                price:        2850,
                rating:       4.8,
                reviewCount:  42,
                description:  'Robe longue en soie sauvage grège, coupe empire avec taille cintrée. Broderie de perles et cristaux réalisée entièrement à la main dans notre atelier. Fermeture invisible au dos, traîne légère. Chaque robe est unique et numérotée.',
                care:         'Nettoyage à sec uniquement · Conservation à l\'abri de la lumière',
                image:        'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=700&h=900&fit=crop',
                gallery: [
                  'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=700&h=900&fit=crop',
                  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=700&h=900&fit=crop',
                  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=700&h=900&fit=crop',
                ],
                badge:        'Pièce unique — 12/20',
                sku:          'ROB-OP-26-012',
                inStock:      true,
                sizes:        ['34', '36', '38', '40', '42', 'Sur mesure'],
                colors: [
                  { name: 'Grège perlé',    hex: '#c9b99a' },
                  { name: 'Noir jais',      hex: '#0c0c0c' },
                  { name: 'Ivoire',         hex: '#f0e8d8' },
                ],
              },
              showReviews:         true,
              showRelatedProducts: true,
              showSizeGuide:       true,
              showShippingInfo:    true,
              styles: {
                backgroundColor:   '#ffffff',
                textColor:         '#0c0c0c',
                accentColor:       '#c5a572',
                secondaryText:     '#6b6560',
                titleFontFamily:   "'Cormorant Garamond', serif",
                titleFontSize:     38,
                bodyFontFamily:    "'Cormorant Garamond', serif",
                priceFontSize:     28,
                paddingY:          100,
              },
            },
          },
          {
            id: 'sect-product-reviews',
            type: 'productReviews',
            order: 2,
            props: {
              content: {
                productId: '',
                title: 'Avis clients',
                subtitle: 'Découvrez les retours vérifiés des clients ayant déjà essayé cette pièce.',
                formTitle: 'Publier un avis',
                formSubtitle: 'Votre expérience aide la prochaine cliente à choisir en toute confiance.',
                loginTitle: 'Connectez-vous pour publier un avis',
                loginSubtitle: 'Une session active est requise pour partager votre retour.',
                loginButtonLabel: 'Se connecter',
                emptyTitle: 'Aucun avis pour le moment',
                emptySubtitle: 'Soyez la première personne à laisser un retour sur cette création.',
                ratingLabel: 'Votre note',
                commentLabel: 'Votre avis',
                commentPlaceholder: 'Racontez votre expérience, la coupe, le tombé, la qualité...',
                submitLabel: "Publier l'avis",
              },
              config: {
                showSummary: true,
                showForm: true,
                showVerifiedBadge: true,
                showAvatars: true,
                layout: 'split',
                maxReviews: 6,
              },
              styles: {
                backgroundColor: '#f7f5f0',
                textColor: '#0c0c0c',
                accentColor: '#c5a572',
                cardBg: '#ffffff',
                borderColor: '#e8e4d9',
                paddingY: 96,
              },
            },
          },
        ],
      },

      // ── PAGE : Produits ───────────────────────────────────────
      {
        id: 'page-products',
        name: 'Produits',
        slug: '/produits',
        isHome: false,
        meta: {
          title:       'Collections — Maison Élégance',
          description: 'Haute couture et prêt-à-porter. Créations intemporelles façonnées à la main.',
        },
        sections: [
          {
            id: 'sect-collection-hero',
            type: 'collectionHero',
            order: 0,
            props: {
              title:    'Haute Couture',
              subtitle: 'Collection Printemps — Été 2026',
              image:    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920&h=500&fit=crop',
              overlayOpacity: 0.4,
              styles: {
                backgroundColor: '#0c0c0c',
                textColor:       '#ffffff',
                titleFontFamily: "'Cormorant Garamond', serif",
                titleFontSize:   72,
                subtitleLetterSpacing: '0.2em',
                paddingY:        100,
                minHeight:       400,
              },
            },
          },
          {
            id: 'sect-product-grid',
            type: 'productsContent',
            order: 1,
            props: {
              title:       null,
              columns:     3,
              showFilters: true,
              filterStyle: 'minimal-tabs',
              cardStyle:   'minimal',
              showRating:  false,
              products: [
                { id: '1', name: 'Robe Opéra',        price: 2850,            image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=500&h=650&fit=crop', badge: 'Nouvelle',          material: 'Soie sauvage, broderie main' },
                { id: '2', name: 'Tailleur Majorelle', price: 1650,            image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&h=650&fit=crop', badge: 'Iconique',          material: 'Laine vierge, doublure soie' },
                { id: '3', name: 'Robe Divine',       price: 3200, oldPrice: 3800, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&h=650&fit=crop', badge: '-15%', material: 'Crêpe de Chine, perles' },
                { id: '4', name: 'Manteau Impérial',  price: 2400,            image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500&h=650&fit=crop',                               material: 'Cachemire double face' },
                { id: '5', name: 'Ensemble Versailles', price: 2100,          image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&h=650&fit=crop', badge: 'Exclusif',          material: 'Satin duchesse' },
                { id: '6', name: 'Robe de mariée Céleste', price: 4500,      image: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=500&h=650&fit=crop',                            material: 'Organza de soie, cristaux' },
                { id: '7', name: 'Veste Montaigne',   price: 1450,            image: 'https://images.unsplash.com/photo-1550614000-4b9519e02a48?w=500&h=650&fit=crop',                            material: 'Velours de soie' },
                { id: '8', name: 'Robe de cocktail',  price: 1800,            image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&h=650&fit=crop', badge: 'Nouvelle',          material: 'Mousseline de soie' },
              ],
              styles: {
                backgroundColor:    '#ffffff',
                textColor:          '#0c0c0c',
                accentColor:        '#c5a572',
                secondaryTextColor: '#6b6560',
                nameFontFamily:     "'Cormorant Garamond', serif",
                priceFontFamily:    "'Cormorant Garamond', serif",
                paddingY:           100,
                columnGap:          32,
              },
            },
          },
        ],
      },

      // ── PAGE : Panier ─────────────────────────────────────────
      {
        id: 'page-cart',
        name: 'Panier',
        slug: '/panier',
        isHome: false,
        meta: {
          title: 'Panier — Maison Élégance',
          description: 'Votre sélection',
        },
        sections: [
          {
            id: 'sect-cart',
            type: 'cart',
            order: 0,
            props: {
              title:          'Votre sélection',
              emptyMessage:   'Votre panier est vide.',
              emptyCtaText:   'Continuer les achats',
              emptyCtaLink:   '/produits',
              showCouponField: true,
              cartItems: [
                { id: '1', name: 'Robe Opéra',   price: 2850, quantity: 1, image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=200&h=260&fit=crop', size: '38', color: 'Grège perlé' },
                { id: '3', name: 'Robe Divine',  price: 3200, quantity: 1, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&h=260&fit=crop', size: '36', color: 'Noir jais' },
              ],
              styles: {
                backgroundColor:   '#ffffff',
                textColor:         '#0c0c0c',
                accentColor:       '#c5a572',
                secondaryText:     '#6b6560',
                borderColor:       '#e8e4d9',
                titleFontFamily:   "'Cormorant Garamond', serif",
                titleFontSize:     36,
                paddingY:          100,
              },
            },
          },
        ],
      },

      // ── PAGE : Favoris ────────────────────────────────────────
      {
        id: 'page-wishlist',
        name: 'Favoris',
        slug: '/favoris',
        isHome: false,
        meta: {
          title: 'Mes Favoris — Maison Élégance',
          description: 'Vos pièces préférées',
        },
        sections: [
          {
            id: 'sect-wishlist',
            type: 'wishlistContent',
            order: 0,
            props: {
              title:        'Mes favoris',
              emptyMessage: 'Aucune pièce sauvegardée.',
              emptyCtaText: 'Découvrir les collections',
              emptyCtaLink: '/produits',
              styles: {
                backgroundColor:  '#ffffff',
                textColor:        '#0c0c0c',
                accentColor:      '#c5a572',
                titleFontFamily:  "'Cormorant Garamond', serif",
                titleFontSize:    36,
                paddingY:         100,
              },
            },
          },
        ],
      },

      // ── PAGE : Mon Compte ─────────────────────────────────────
      {
        id: 'page-account',
        name: 'Mon Compte',
        slug: '/compte',
        isHome: false,
        meta: {
          title: 'Mon Compte — Maison Élégance',
          description: 'Gérez vos commandes et informations personnelles',
        },
        sections: [
          {
            id: 'sect-account',
            type: 'accountContent',
            order: 0,
            props: {
              title:    'Mon espace',
              subtitle: null,
              user: {
                firstName:   'Marie',
                lastName:    'de Montaigne',
                email:       'm.montaigne@example.com',
                phone:       '+33 6 12 34 56 78',
                memberSince: '2019',
                tier:        'Cliente Privilège',
              },
              styles: {
                backgroundColor:  '#f7f5f0',
                textColor:        '#0c0c0c',
                accentColor:      '#c5a572',
                cardBackground:   '#ffffff',
                borderColor:      '#e8e4d9',
                titleFontFamily:  "'Cormorant Garamond', serif",
                titleFontSize:    36,
                paddingY:         100,
              },
            },
          },
        ],
      },

      // ── PAGE : Checkout ───────────────────────────────────────
      {
        id: 'page-checkout',
        name: 'Checkout',
        slug: '/checkout',
        isHome: false,
        meta: {
          title: 'Finaliser — Maison Élégance',
          description: 'Finalisez votre commande en toute sécurité',
        },
        sections: [
          {
            id: 'sect-checkout',
            type: 'checkoutContent',
            order: 0,
            props: {
              title:     'Finaliser votre commande',
              showSteps: true,
              steps:     'Livraison\nPaiement\nConfirmation',
              styles: {
                backgroundColor:  '#ffffff',
                textColor:        '#0c0c0c',
                accentColor:      '#c5a572',
                stepActiveColor:  '#0c0c0c',
                stepDoneColor:    '#c5a572',
                borderColor:      '#e8e4d9',
                titleFontFamily:  "'Cormorant Garamond', serif",
                titleFontSize:    32,
                paddingY:         100,
              },
            },
          },
        ],
      },

      // ── PAGE : Confirmation ───────────────────────────────────
      {
        id: 'page-confirmation',
        name: 'Confirmation',
        slug: '/confirmation',
        isHome: false,
        meta: {
          title: 'Commande confirmée — Maison Élégance',
          description: 'Votre commande a été validée avec succès',
        },
        sections: [
          {
            id: 'sect-confirmation',
            type: 'orderConfirmationContent',
            order: 0,
            props: {
              title:             'Commande confirmée',
              subtitle:          'Un e-mail de confirmation vous a été envoyé.',
              showOrderDetails:  true,
              showTracking:      true,
              icon:              'check-thin',
              styles: {
                backgroundColor:  '#ffffff',
                textColor:        '#0c0c0c',
                accentColor:      '#c5a572',
                paddingY:         100,
              },
            },
          },
        ],
      },

      // ── PAGE : Détails de commande ─────────────────────────
      {
        id: 'page-order-detail',
        name: 'Détails de commande',
        slug: '/commande',
        isHome: false,
        meta: {
          title: 'Détails de commande — Maison Élégance',
          description: 'Consultez les détails de votre commande',
        },
        sections: [
          {
            id: 'sect-order-detail',
            type: 'orderDetail',
            order: 0,
            props: {
              styles: {
                paddingY: 100,
              },
            },
          },
        ],
      },

      // ── PAGE : Connexion ────────────────────────────────────
      {
        id: 'page-login',
        name: 'Connexion',
        slug: '/connexion',
        isHome: false,
        meta: {
          title: 'Connexion — Maison Élégance',
          description: 'Accédez à votre espace client',
        },
        sections: [
          {
            id: 'sect-login',
            type: 'login',
            order: 0,
            props: {
              title:               'Bonjour',
              subtitle:            'Connectez-vous à votre espace personnel',
              showEmail:           true,
              showPassword:        true,
              showRememberMe:      true,
              showForgotPassword:  true,
              showSocialLogin:     false,
              registerLink:        '/inscription',
              layout:              'split-image',
              splitImage:          'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&h=1200&fit=crop',
              styles: {
                backgroundColor:  '#ffffff',
                textColor:        '#0c0c0c',
                accentColor:      '#c5a572',
                inputBorder:      '#d4cdc6',
                inputBackground:  '#f7f5f0',
                titleFontFamily:  "'Cormorant Garamond', serif",
                titleFontSize:    42,
                paddingY:         0,
              },
            },
          },
        ],
      },

      // ── PAGE : Inscription ────────────────────────────────────
      {
        id: 'page-register',
        name: 'Inscription',
        slug: '/inscription',
        isHome: false,
        meta: {
          title: 'Créer un compte — Maison Élégance',
          description: 'Rejoignez la Maison Élégance',
        },
        sections: [
          {
            id: 'sect-register',
            type: 'register',
            order: 0,
            props: {
              title:                'Rejoindre la Maison',
              subtitle:             'Créez votre compte pour accéder à nos collections privées.',
              showFirstName:        true,
              showLastName:         true,
              showEmail:            true,
              showPhone:            false,
              showPassword:         true,
              showPasswordConfirm:  true,
              showTerms:            true,
              showNewsletter:       true,
              showSocialLogin:      false,
              loginLink:            '/connexion',
              layout:               'split-image',
              splitImage:           'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&h=1200&fit=crop',
              styles: {
                backgroundColor:  '#ffffff',
                textColor:        '#0c0c0c',
                accentColor:      '#c5a572',
                inputBorder:      '#d4cdc6',
                inputBackground:  '#f7f5f0',
                titleFontFamily:  "'Cormorant Garamond', serif",
                titleFontSize:    38,
                paddingY:         0,
              },
            },
          },
        ],
      },
    ],

    // ── Settings globaux ─────────────────────────────────────────
    settings: {
      // Palette classique luxe
      primaryColor:   '#0c0c0c',   // Noir de jais
      secondaryColor: '#f7f5f0',   // Ivoire antique
      accentColor:    '#c5a572',   // Or vieilli
      backgroundColor: '#ffffff',  // Blanc pur
      textColor:      '#1a1a1a',   // Noir doux

      // Typographie classique — Cormorant Garamond (serif élégant)
      fontFamily:        "'Cormorant Garamond', 'Times New Roman', Georgia, serif",
      bodyFontFamily:    "'Cormorant Garamond', serif",
      fontSize:          16,
      headingScale:      1.25,
      letterSpacingBase: '0.02em',

      // Forme — Légèrement arrondi pour douceur classique
      borderRadius:     2,
      containerWidth:   '1320px',

      // Animations — Lentes et majestueuses
      transitionDuration: '500ms',
      transitionEasing:   'cubic-bezier(0.25, 0.1, 0.25, 1)',

      // Ombres — Discrètes, nobles
      shadowSm:  '0 1px 3px rgba(12,12,12,0.04)',
      shadowMd:  '0 4px 12px rgba(12,12,12,0.06)',
      shadowLg:  '0 16px 40px rgba(12,12,12,0.08)',
    },

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};
// --- Template 2: Tech Store Pro ---

export const techStoreTemplate: Template = {
  id: 'tech-store',
  name: 'Tech Store Pro',
  description: 'Un template moderne et dynamique pour les boutiques d\'électronique et high-tech. Design futuriste avec effets néon.',
  thumbnail: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&h=400&fit=crop',
  category: 'electronics',
  colorScheme: {
    primary: '#0f172a',
    secondary: '#1e293b',
    accent: '#06b6d4',
    background: '#020617',
    text: '#f8fafc',
  },
  project: {
    id: `template-${uuidv4()}`,
    name: 'Tech Store Pro',
    description: 'Boutique d\'électronique et high-tech',
    globalSections: {
      header: {
        id: `global-header-${uuidv4()}`,
        type: 'headerModern',
        order: 0,
        props: {
          logo: { text: 'TECH STORE' },
          blocks: [
            { id: `nav-${uuidv4()}`, label: 'Smartphones', link: '/produit', enabled: true },
            { id: `nav-${uuidv4()}`, label: 'Ordinateurs', link: '/produit', enabled: true },
            { id: `nav-${uuidv4()}`, label: 'Gaming', link: '/produit', enabled: true },
            { id: `nav-${uuidv4()}`, label: 'Audio', link: '/produit', enabled: true },
            { id: `nav-${uuidv4()}`, label: 'Accessoires', link: '/produit', enabled: true },
          ],
          ctaButton: { text: 'Promos', link: '/produit', variant: 'primary', show: true },
          showSearch: true,
          showCart: true,
          showAccount: true,
          styles: {
            backgroundColor: '#0f172a',
            textColor: '#f8fafc',
            accentColor: '#06b6d4',
            paddingY: 16,
          },
        },
      },
      footer: {
        id: `global-footer-${uuidv4()}`,
        type: 'footerModern',
        order: 0,
        props: {
          logo: { text: 'TECH STORE' },
          copyright: ' 2024 Tech Store. Tous droits réservés.',
          newsletter: false,
          columns: [
            {
              title: 'Produits',
              links: [
                { label: 'Smartphones', url: '/produit' },
                { label: 'Ordinateurs', url: '/produit' },
                { label: 'Gaming', url: '/produit' },
                { label: 'Audio', url: '/produit' },
                { label: 'Promos', url: '/produit' },
              ],
            },
            {
              title: 'Service Client',
              links: [
                { label: 'Contact', url: '/produit' },
                { label: 'FAQ', url: '/produit' },
                { label: 'Livraison', url: '/produit' },
                { label: 'Retours', url: '/produit' },
                { label: 'Garantie', url: '/produit' },
              ],
            },
            {
              title: 'À propos',
              links: [
                { label: 'Notre histoire', url: '/produit' },
                { label: 'Carrières', url: '/produit' },
                { label: 'Presse', url: '/produit' },
                { label: 'Magasins', url: '/produit' },
              ],
            },
          ],
          styles: {
            backgroundColor: '#020617',
            textColor: '#f8fafc',
            accentColor: '#06b6d4',
            paddingY: 60,
          },
        },
      },
    },
    pages: [
      {
        id: `page-${uuidv4()}`,
        name: 'Accueil',
        slug: '/',
        isHome: true,
        meta: {
          title: 'Tech Store Pro - Votre Destination High-Tech',
          description: 'Les dernières innovations technologiques aux meilleurs prix.',
        },
        sections: [
          {
            id: `sect-${uuidv4()}`,
            type: 'hero',
            order: 0,
            props: {
              title: 'Le Futur est Arrivé',
              subtitle: 'Découvrez notre nouvelle gamme de produits high-tech. Performance, innovation, excellence.',
              backgroundImage: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1920&h=1080&fit=crop',
              ctaText: 'Explorer',
              ctaLink: '/produit',
              secondaryCtaText: 'Meilleures Ventes',
              secondaryCtaLink: '/produit',
              overlayOpacity: 0.5,
              alignment: 'left',
              styles: {
                backgroundColor: '#020617',
                textColor: '#f8fafc',
                accentColor: '#06b6d4',
                paddingY: 140,
              },
            },
          },
          {
            id: `sect-${uuidv4()}`,
            type: 'countdown',
            order: 2,
            props: {
              title: 'Flash Tech - Jusqu\'à -50%',
              subtitle: 'Offres limitées sur une sélection de produits high-tech',
              buttonText: 'Profiter des offres',
              buttonLink: '/produit',
              endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
              showLabels: true,
              styles: {
                backgroundColor: '#1e293b',
                textColor: '#f8fafc',
                accentColor: '#06b6d4',
                paddingY: 60,
              },
            },
          },
          {
            id: `sect-${uuidv4()}`,
            type: 'categoryGrid',
            order: 3,
            props: {
              title: 'Nos Univers',
              subtitle: 'Trouvez exactement ce que vous cherchez',
              columns: 5,
              showProductCount: true,
              categories: [
                { name: 'Smartphones', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop', productCount: 48, link: '/produit' },
                { name: 'Ordinateurs', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop', productCount: 32, link: '/produit' },
                { name: 'Gaming', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=400&fit=crop', productCount: 56, link: '/produit' },
                { name: 'Audio', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', productCount: 43, link: '/produit' },
                { name: 'Maison Connectée', image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400&h=400&fit=crop', productCount: 29, link: '/produit' },
              ],
              styles: {
                backgroundColor: '#020617',
                textColor: '#f8fafc',
                accentColor: '#06b6d4',
                paddingY: 80,
              },
            },
          },
          {
            id: `sect-${uuidv4()}`,
            type: 'productGrid',
            order: 4,
            props: {
              title: 'Nouveautés Tech',
              subtitle: 'Les derniers produits arrivés en magasin',
              columns: 4,
              showFilters: true,
              config: {
                dynamicSource: 'newest',
                productsPerPage: 4,
              },
              products: [
                { id: '1', name: 'iPhone 15 Pro', price: 1199, image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=400&h=500&fit=crop', badge: 'Nouveau', rating: 4.9 },
                { id: '2', name: 'MacBook Pro M3', price: 1999, oldPrice: 2199, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=500&fit=crop', badge: '-10%', rating: 4.8 },
                { id: '3', name: 'Sony WH-1000XM5', price: 349, image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&h=500&fit=crop', badge: 'Top vente', rating: 4.7 },
                { id: '4', name: 'Samsung Galaxy S24', price: 899, image: 'https://images.unsplash.com/photo-1610945265078-3858a0828671?w=400&h=500&fit=crop', rating: 4.6 },
              ],
              styles: {
                backgroundColor: '#0f172a',
                textColor: '#f8fafc',
                accentColor: '#06b6d4',
                paddingY: 80,
              },
            },
          },
          {
            id: `sect-${uuidv4()}`,
            type: 'features',
            order: 5,
            props: {
              title: 'Pourquoi choisir Tech Store ?',
              subtitle: 'Les avantages de commander chez nous',
              layout: 'grid',
              features: [
                { icon: 'Truck', title: 'Livraison Express', description: 'Recevez votre commande en 24h' },
                { icon: 'Shield', title: 'Garantie 2 Ans', description: 'Tous nos produits sont garantis' },
                { icon: 'RotateCcw', title: 'Retours 30 Jours', description: 'Satisfait ou remboursé' },
                { icon: 'Headphones', title: 'Support Tech', description: 'Assistance technique gratuite' },
              ],
              styles: {
                backgroundColor: '#1e293b',
                textColor: '#f8fafc',
                accentColor: '#06b6d4',
                paddingY: 80,
              },
            },
          },
          {
            id: `sect-${uuidv4()}`,
            type: 'banner',
            order: 6,
            props: {
              title: 'Gaming Setup Pro',
              subtitle: 'Créez votre configuration gaming ultime avec nos PC et accessoires haut de gamme',
              image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&h=600&fit=crop',
              ctaText: 'Voir la collection',
              ctaLink: '/produit',
              position: 'right',
              styles: {
                backgroundColor: '#020617',
                textColor: '#f8fafc',
                accentColor: '#06b6d4',
                paddingY: 80,
              },
            },
          },
          {
            id: `sect-${uuidv4()}`,
            type: 'newsletter',
            order: 7,
            props: {
              title: 'Ne manquez aucune offre',
              subtitle: 'Inscrivez-vous pour recevoir en exclusivité nos promotions et découvrir les nouveautés.',
              buttonText: "S'inscrire",
              placeholder: 'votre@email.com',
              showPrivacyCheckbox: true,
              privacyText: "J'accepte de recevoir les offres commerciales",
              styles: {
                backgroundColor: '#1e293b',
                textColor: '#f8fafc',
                accentColor: '#06b6d4',
                paddingY: 80,
              },
            },
          },
        ],
      },
      {
        id: `page-${uuidv4()}`,
        name: 'Produit',
        slug: '/produit',
        isHome: false,
        meta: {
          title: 'Produit - Tech Store Pro',
          description: 'Détails du produit',
        },
        sections: [
          {
            id: `sect-${uuidv4()}`,
            type: 'breadcrumb',
            order: 0,
            props: {
              showHome: true,
              separator: 'chevron',
              items: [
                { label: 'Smartphones', link: '/produit' },
                { label: 'iPhone', link: '/produit' },
              ],
              styles: {
                backgroundColor: '#1e293b',
                textColor: '#f8fafc',
                paddingY: 16,
              },
            },
          },
          {
            id: `sect-${uuidv4()}`,
            type: 'productDetailContent',
            order: 2,
            props: {
              product: {
                id: '1',
                name: 'iPhone 15 Pro',
                price: 1199,
                oldPrice: 1299,
                description: 'Le smartphone le plus puissant jamais créé. Puce A17 Pro, titane de qualité aérospatiale, système photo pro.',
                image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=600&h=800&fit=crop',
                badge: '-8%',
                rating: 4.9,
                reviewCount: 2847,
                sku: 'IP15PRO-256',
                inStock: true,
                storage: ['128GB', '256GB', '512GB', '1TB'],
                colors: [
                  { name: 'Titane Naturel', hex: '#c4c4c4' },
                  { name: 'Titane Bleu', hex: '#4a5568' },
                  { name: 'Titane Noir', hex: '#1a202c' },
                ],
              },
              showReviews: true,
              showRelatedProducts: true,
              showRecentlyViewed: true,
              showSizeGuide: false,
              showShippingInfo: true,
              styles: {
                backgroundColor: '#0f172a',
                textColor: '#f8fafc',
                accentColor: '#06b6d4',
                paddingY: 60,
              },
            },
          },
        ],
      },
      // ── PAGE : Favoris ────────────────────────────────────────
      {
        id: `page-${uuidv4()}`,
        name: 'Favoris',
        slug: '/favoris',
        isHome: false,
        meta: {
          title: 'Mes Favoris - Tech Store Pro',
          description: 'Vos produits sauvegardés',
        },
        sections: [
          {
            id: `sect-${uuidv4()}`,
            type: 'wishlistContent',
            order: 0,
            props: {
              title: 'Mes Favoris',
              styles: {
                backgroundColor: '#0f172a',
                textColor: '#f8fafc',
                accentColor: '#06b6d4',
                paddingY: 60,
              },
            },
          },
        ],
      },
      // ── PAGE : Mon Compte ─────────────────────────────────────
      {
        id: `page-${uuidv4()}`,
        name: 'Mon Compte',
        slug: '/compte',
        isHome: false,
        meta: {
          title: 'Mon Compte - Tech Store Pro',
          description: 'Gérez vos commandes et informations',
        },
        sections: [
          {
            id: `sect-${uuidv4()}`,
            type: 'accountContent',
            order: 0,
            props: {
              title: 'Mon Compte',
              styles: {
                backgroundColor: '#0f172a',
                textColor: '#f8fafc',
                accentColor: '#06b6d4',
                paddingY: 60,
              },
            },
          },
        ],
      },
      // ── PAGE : Panier ─────────────────────────────────────────
      {
        id: `page-${uuidv4()}`,
        name: 'Panier',
        slug: '/panier',
        isHome: false,
        meta: {
          title: 'Panier - Tech Store Pro',
          description: 'Votre panier d\'achat',
        },
        sections: [
          {
            id: `sect-${uuidv4()}`,
            type: 'cart',
            order: 0,
            props: {
              title: 'Votre Panier',
              styles: {
                backgroundColor: '#0f172a',
                textColor: '#f8fafc',
                accentColor: '#06b6d4',
                paddingY: 60,
              },
            },
          },
        ],
      },
      // ── PAGE : Checkout ───────────────────────────────────────
      {
        id: `page-${uuidv4()}`,
        name: 'Checkout',
        slug: '/checkout',
        isHome: false,
        meta: {
          title: 'Finaliser - Tech Store Pro',
          description: 'Paiement sécurisé',
        },
        sections: [
          {
            id: `sect-${uuidv4()}`,
            type: 'checkoutContent',
            order: 0,
            props: {
              title: 'Finaliser la commande',
              styles: {
                backgroundColor: '#0f172a',
                textColor: '#f8fafc',
                accentColor: '#06b6d4',
                paddingY: 60,
              },
            },
          },
        ],
      },
      // ── PAGE : Confirmation ───────────────────────────────────
      {
        id: `page-${uuidv4()}`,
        name: 'Confirmation',
        slug: '/confirmation',
        isHome: false,
        meta: {
          title: 'Commande confirmée - Tech Store Pro',
          description: 'Merci pour votre commande',
        },
        sections: [
          {
            id: `sect-${uuidv4()}`,
            type: 'orderConfirmationContent',
            order: 0,
            props: {
              title: 'Commande confirmée !',
              styles: {
                backgroundColor: '#0f172a',
                textColor: '#f8fafc',
                accentColor: '#06b6d4',
                paddingY: 60,
              },
            },
          },
        ],
      },
      // ── PAGE : Détails Commande ───────────────────────────────
      {
        id: `page-${uuidv4()}`,
        name: 'Détails Commande',
        slug: '/commande',
        isHome: false,
        meta: {
          title: 'Détails de commande - Tech Store Pro',
          description: 'Consultez les détails de votre commande',
        },
        sections: [
          {
            id: `sect-${uuidv4()}`,
            type: 'orderDetail',
            order: 0,
            props: {
              styles: {
                backgroundColor: '#0f172a',
                textColor: '#f8fafc',
                accentColor: '#06b6d4',
                paddingY: 60,
              },
            },
          },
        ],
      },
    ],
    settings: {
      primaryColor: '#06b6d4',
      secondaryColor: '#0f172a',
      accentColor: '#1e293b',
      backgroundColor: '#020617',
      textColor: '#f8fafc',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: 16,
      borderRadius: 8,
      containerWidth: '1280px',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

// --- Template 3: Minimal Home & Living ---

export const homeLivingTemplate: Template = {
  id: 'home-living',
  name: 'Home & Living',
  description: 'Un template chaleureux et épuré pour les boutiques de décoration et d\'ameublement.',
  thumbnail: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&h=400&fit=crop',
  category: 'home',
  colorScheme: {
    primary: '#8b7355',
    secondary: '#f5f0e8',
    accent: '#d4a574',
    background: '#faf8f5',
    text: '#3d3d3d',
  },
  project: {
    id: `template-${uuidv4()}`,
    name: 'Home & Living',
    description: 'Boutique de décoration et ameublement',
    globalSections: {
      header: {
        id: `global-header-${uuidv4()}`,
        type: 'headerModern',
        order: 0,
        props: {
          logo: { text: 'HOME & LIVING' },
          blocks: [
            { id: `nav-${uuidv4()}`, label: 'Nouveautés', link: '/produit', enabled: true },
            { id: `nav-${uuidv4()}`, label: 'Mobilier', link: '/produit', enabled: true },
            { id: `nav-${uuidv4()}`, label: 'Décoration', link: '/produit', enabled: true },
            { id: `nav-${uuidv4()}`, label: 'Luminaires', link: '/produit', enabled: true },
            { id: `nav-${uuidv4()}`, label: 'Textile', link: '/produit', enabled: true },
          ],
          ctaButton: { text: 'Collection', link: '/produit', variant: 'primary', show: true },
          showSearch: true,
          showCart: true,
          showAccount: true,
          styles: {
            backgroundColor: '#faf8f5',
            textColor: '#3d3d3d',
            accentColor: '#d4a574',
            paddingY: 16,
          },
        },
      },
      footer: {
        id: `global-footer-${uuidv4()}`,
        type: 'footerModern',
        order: 0,
        props: {
          logo: { text: 'HOME & LIVING' },
          copyright: '© 2024 Home & Living. Tous droits réservés.',
          newsletter: true,
          columns: [
            {
              title: 'Boutique',
              links: [
                { label: 'Nouveautés', url: '/produit' },
                { label: 'Mobilier', url: '/produit' },
                { label: 'Décoration', url: '/produit' },
                { label: 'Luminaires', url: '/produit' },
              ],
            },
            {
              title: 'Aide',
              links: [
                { label: 'FAQ', url: '/produit' },
                { label: 'Livraison', url: '/produit' },
                { label: 'Retours', url: '/produit' },
                { label: 'Guide des tailles', url: '/produit' },
              ],
            },
            {
              title: 'Inspiration',
              links: [
                { label: 'Lookbook', url: '/produit' },
                { label: 'Blog', url: '/produit' },
                { label: 'Conseils déco', url: '/produit' },
              ],
            },
          ],
          styles: {
            backgroundColor: '#3d3d3d',
            textColor: '#ffffff',
            accentColor: '#d4a574',
            paddingY: 60,
          },
        },
      },
    },
    pages: [
      {
        id: `page-${uuidv4()}`,
        name: 'Accueil',
        slug: '/',
        isHome: true,
        meta: {
          title: 'Home & Living - Décoration Intérieure',
          description: 'Découvrez notre collection de décoration et d\'ameublement.',
        },
        sections: [
          {
            id: `sect-${uuidv4()}`,
            type: 'hero',
            order: 0,
            props: {
              title: 'Créez Votre Cocon',
              subtitle: 'Des pièces uniques pour une maison qui vous ressemble. Découvrez notre nouvelle collection de décoration.',
              backgroundImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&h=1080&fit=crop',
              ctaText: 'Découvrir',
              ctaLink: '/produit',
              secondaryCtaText: 'Nos Best-sellers',
              secondaryCtaLink: '/produit',
              overlayOpacity: 0.3,
              alignment: 'center',
              styles: {
                backgroundColor: '#8b7355',
                textColor: '#ffffff',
                accentColor: '#d4a574',
                paddingY: 140,
              },
            },
          },
          {
            id: `sect-${uuidv4()}`,
            type: 'categoryGrid',
            order: 2,
            props: {
              title: 'Nos Univers',
              subtitle: 'Trouvez l\'inspiration pour chaque pièce',
              columns: 4,
              showProductCount: true,
              categories: [
                { name: 'Salon', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop', productCount: 86, link: '/produit' },
                { name: 'Chambre', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=400&fit=crop', productCount: 64, link: '/produit' },
                { name: 'Cuisine', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&h=400&fit=crop', productCount: 52, link: '/produit' },
                { name: 'Bureau', image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=400&fit=crop', productCount: 38, link: '/produit' },
              ],
              styles: {
                backgroundColor: '#f5f0e8',
                textColor: '#3d3d3d',
                accentColor: '#d4a574',
                paddingY: 80,
              },
            },
          },
          {
            id: `sect-${uuidv4()}`,
            type: 'productGrid',
            order: 3,
            props: {
              title: 'Nouveautés',
              subtitle: 'Les dernières pièces ajoutées à notre collection',
              columns: 4,
              showFilters: true,
              config: {
                dynamicSource: 'newest',
                productsPerPage: 4,
              },
              products: [
                { id: '1', name: 'Fauteuil Velours', price: 599, image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&h=500&fit=crop', badge: 'Nouveau', rating: 4.8 },
                { id: '2', name: 'Lampe Suspension', price: 189, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=500&fit=crop', badge: 'Best-seller', rating: 4.9 },
                { id: '3', name: 'Table Basse Bois', price: 449, oldPrice: 529, image: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=400&h=500&fit=crop', badge: '-15%', rating: 4.7 },
                { id: '4', name: 'Coussin Lin', price: 49, image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400&h=500&fit=crop', rating: 4.6 },
              ],
              styles: {
                backgroundColor: '#faf8f5',
                textColor: '#3d3d3d',
                accentColor: '#d4a574',
                paddingY: 80,
              },
            },
          },
          {
            id: `sect-${uuidv4()}`,
            type: 'testimonials',
            order: 4,
            visible: false,
            props: {
              title: 'Ce que nos clients disent',
              subtitle: 'Des milliers de clients satisfaits',
              testimonials: [
                { name: 'Emma B.', role: 'Décoratrice', content: 'Des produits de qualité exceptionnelle et un service client impeccable. Mon appartement est transformé!', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop', rating: 5 },
                { name: 'Lucas M.', role: 'Architecte', content: 'Je recommande Home & Living à tous mes clients. Leur sélection est toujours au goût du jour.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', rating: 5 },
                { name: 'Sarah K.', role: 'Cliente fidèle', content: 'Livraison rapide et soignée. Les produits correspondent parfaitement à la description.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', rating: 5 },
              ],
              styles: {
                backgroundColor: '#ffffff',
                textColor: '#3d3d3d',
                accentColor: '#d4a574',
                paddingY: 80,
              },
            },
          },
          {
            id: `sect-${uuidv4()}`,
            type: 'newsletter',
            order: 5,
            props: {
              title: 'Rejoignez la Communauté',
              subtitle: 'Inscrivez-vous pour recevoir nos inspirations déco et nos offres exclusives.',
              buttonText: "S'inscrire",
              placeholder: 'Votre adresse email',
              showPrivacyCheckbox: true,
              privacyText: "J'accepte de recevoir la newsletter",
              styles: {
                backgroundColor: '#8b7355',
                textColor: '#ffffff',
                accentColor: '#d4a574',
                paddingY: 80,
              },
            },
          },
        ],
      },
      // ── PAGE : Produits ───────────────────────────────────────
      {
        id: `page-${uuidv4()}`,
        name: 'Produits',
        slug: '/produits',
        isHome: false,
        meta: {
          title: 'Collections - Home & Living',
          description: 'Découvrez nos pièces uniques',
        },
        sections: [
          {
            id: `sect-${uuidv4()}`,
            type: 'productsContent',
            order: 0,
            props: {
              title: 'Nos Collections',
              styles: {
                backgroundColor: '#faf8f5',
                textColor: '#3d3d3d',
                accentColor: '#d4a574',
                paddingY: 60,
              },
            },
          },
        ],
      },
      // ── PAGE : Produit (Détail) ───────────────────────────────
      {
        id: `page-${uuidv4()}`,
        name: 'Détail Produit',
        slug: '/produit',
        isHome: false,
        meta: {
          title: 'Détail Produit - Home & Living',
          description: 'Informations sur le produit',
        },
        sections: [
          {
            id: `sect-${uuidv4()}`,
            type: 'productDetailContent',
            order: 0,
            props: {
              styles: {
                backgroundColor: '#faf8f5',
                textColor: '#3d3d3d',
                accentColor: '#d4a574',
                paddingY: 60,
              },
            },
          },
        ],
      },
      // ── PAGE : Panier ─────────────────────────────────────────
      {
        id: `page-${uuidv4()}`,
        name: 'Panier',
        slug: '/panier',
        isHome: false,
        meta: {
          title: 'Panier - Home & Living',
          description: 'Votre sélection déco',
        },
        sections: [
          {
            id: `sect-${uuidv4()}`,
            type: 'cart',
            order: 0,
            props: {
              title: 'Votre Sélection',
              styles: {
                backgroundColor: '#faf8f5',
                textColor: '#3d3d3d',
                accentColor: '#d4a574',
                paddingY: 60,
              },
            },
          },
        ],
      },
      // ── PAGE : Checkout ───────────────────────────────────────
      {
        id: `page-${uuidv4()}`,
        name: 'Checkout',
        slug: '/checkout',
        isHome: false,
        meta: {
          title: 'Finaliser - Home & Living',
          description: 'Paiement sécurisé',
        },
        sections: [
          {
            id: `sect-${uuidv4()}`,
            type: 'checkoutContent',
            order: 0,
            props: {
              title: 'Finaliser la commande',
              styles: {
                backgroundColor: '#faf8f5',
                textColor: '#3d3d3d',
                accentColor: '#d4a574',
                paddingY: 60,
              },
            },
          },
        ],
      },
      // ── PAGE : Favoris ────────────────────────────────────────
      {
        id: `page-${uuidv4()}`,
        name: 'Favoris',
        slug: '/favoris',
        isHome: false,
        meta: {
          title: 'Mes Favoris - Home & Living',
          description: 'Vos produits sauvegardés',
        },
        sections: [
          {
            id: `sect-${uuidv4()}`,
            type: 'wishlistContent',
            order: 0,
            props: {
              title: 'Mes Favoris',
              styles: {
                backgroundColor: '#faf8f5',
                textColor: '#3d3d3d',
                accentColor: '#d4a574',
                paddingY: 60,
              },
            },
          },
        ],
      },
      // ── PAGE : Mon Compte ─────────────────────────────────────
      {
        id: `page-${uuidv4()}`,
        name: 'Mon Compte',
        slug: '/compte',
        isHome: false,
        meta: {
          title: 'Mon Compte - Home & Living',
          description: 'Gérez vos commandes et informations',
        },
        sections: [
          {
            id: `sect-${uuidv4()}`,
            type: 'accountContent',
            order: 0,
            props: {
              title: 'Mon Compte',
              styles: {
                backgroundColor: '#faf8f5',
                textColor: '#3d3d3d',
                accentColor: '#d4a574',
                paddingY: 60,
              },
            },
          },
        ],
      },
      // ── PAGE : Confirmation ───────────────────────────────────
      {
        id: `page-${uuidv4()}`,
        name: 'Confirmation',
        slug: '/confirmation',
        isHome: false,
        meta: {
          title: 'Commande confirmée - Home & Living',
          description: 'Merci pour votre commande',
        },
        sections: [
          {
            id: `sect-${uuidv4()}`,
            type: 'orderConfirmationContent',
            order: 0,
            props: {
              title: 'Commande confirmée !',
              styles: {
                backgroundColor: '#faf8f5',
                textColor: '#3d3d3d',
                accentColor: '#d4a574',
                paddingY: 60,
              },
            },
          },
        ],
      },
      // ── PAGE : Détails Commande ───────────────────────────────
      {
        id: `page-${uuidv4()}`,
        name: 'Détails Commande',
        slug: '/commande',
        isHome: false,
        meta: {
          title: 'Détails de commande - Home & Living',
          description: 'Consultez les détails de votre commande',
        },
        sections: [
          {
            id: `sect-${uuidv4()}`,
            type: 'orderDetail',
            order: 0,
            props: {
              styles: {
                backgroundColor: '#faf8f5',
                textColor: '#3d3d3d',
                accentColor: '#d4a574',
                paddingY: 60,
              },
            },
          },
        ],
      },
    ],
    settings: {
      primaryColor: '#d4a574',
      secondaryColor: '#8b7355',
      accentColor: '#f5f0e8',
      backgroundColor: '#faf8f5',
      textColor: '#3d3d3d',
      fontFamily: "'Playfair Display', Georgia, serif",
      fontSize: 16,
      borderRadius: 4,
      containerWidth: '1280px',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};


export const maisonOrTemplate: Template = {
  id: 'maison-prestige',
  name: 'Maison Prestige',
  description:
    'Maison de luxe contemporaine au design professionnel et chaleureux. Palette champagne et or subtil, élégance discrète sans excès de noir.',
  thumbnail:
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=400&fit=crop',
  category: 'luxury',

  // ── Palette Champagne & Gold Professionnelle ─────────────────────────────────
  colorScheme: {
    primary:    '#1a1a1a',   // Noir doux
    secondary:  '#f5f0e8',   // Champagne crème
    accent:     '#c9a962',   // Or subtil champagne
    background: '#faf8f5',   // Blanc cassé chaud
    text:       '#2d2d2d',   // Gris charbon doux
  },

  project: {
    id: `template-maison-prestige`,
    name: 'Maison Prestige',
    description: 'Haute Joaillerie & Horlogerie d\'Exception — L\'art du raffinement',

    // ── Sections globales ────────────────────────────────────────
    globalSections: {

      // Barre d'annonce — Champagne discrète
      announcementBar: {
        id: 'global-announcement',
        type: 'announcementBar',
        order: 0,
        props: {
          messages: [
            'Livraison express offerte dès 200€',
            'Retours gratuits sous 30 jours',
            'Nouvelle Collection disponible',
          ],
          autoRotate: true,
          interval: 5000,
          showIcons: true,
          icon: 'sparkles',
          styles: {
            backgroundColor: '#f5f0e8',
            textColor:       '#1a1a1a',
            accentColor:     '#c9a962',
            fontSize:        12,
            letterSpacing:   '0.12em',
            fontFamily:      "'Cormorant Garamond', 'Playfair Display', serif",
            fontWeight:      400,
            paddingY:        12,
          },
        },
      },

      // Header — Blanc cassé élégant
      header: {
        id: 'global-header',
        type: 'headerModern',
        order: 0,
        props: {
          logo: {
            text:        'MAISON PRESTIGE',
            letterSpacing: '0.35em',
            fontFamily:  "'Cormorant Garamond', serif",
            fontWeight:  400,
            fontSize:    15,
          },
          blocks: [
            { id: 'nav-1', label: 'Accueil',        link: '/',          enabled: true },
            { id: 'nav-2', label: 'Collections',    link: '/collections', enabled: true },
            { id: 'nav-3', label: 'Nouveautés',     link: '/nouveautes',  enabled: true },
            { id: 'nav-4', label: 'Boutique',       link: '/boutique',    enabled: true },
            { id: 'nav-5', label: "L'Artisanat",    link: '/artisanat',   enabled: true },
          ],
          ctaButton: {
            text:    'Contact',
            link:    '/contact',
            variant: 'outline',
            show:    true,
          },
          showSearch:  true,
          showCart:    true,
          showAccount: true,
          sticky:      true,
          transparentAtTop: false,
          blurOnScroll: false,
          elevatedOnScroll: true,
          borderBottom: true,
          styles: {
            backgroundColor: '#faf8f5',
            textColor:       '#1a1a1a',
            accentColor:     '#c9a962',
            hoverColor:      '#c9a962',
            borderColor:     '#e8e0d5',
            fontFamily:      "'Cormorant Garamond', serif",
            fontSize:        13,
            letterSpacing:   '0.1em',
            fontWeight:      400,
            paddingY:        22,
          },
        },
      },

      // Footer — Champagne chaleureux
      footer: {
        id: 'global-footer',
        type: 'footerModern',
        order: 0,
        props: {
          logo: {
            text:          'MAISON PRESTIGE',
            letterSpacing: '0.35em',
            fontFamily:    "'Cormorant Garamond', serif",
            fontWeight:    400,
            fontSize:      14,
          },
          copyright: '© 2026 Maison Prestige. Tous droits réservés.',
          description: 'Maison de luxe spécialisée en haute joaillerie et horlogerie d\'exception. Créations sur-mesure depuis 1987.',
          contactInfo: {
            title: 'Contact',
            address: '15 Avenue Montaigne, 75008 Paris, France',
            phone: '+33 1 42 25 00 00',
            email: 'contact@maisonprestige.com',
          },
          newsletter:    true,
          newsletterLabel: 'Newsletter',
          newsletterSub:   'Recevez nos actualités et invitations exclusives.',
          social: {
            instagram: 'https://instagram.com/maisonprestige',
            facebook:  'https://facebook.com/maisonprestige',
            youtube:   'https://youtube.com/maisonprestige',
          },
          columns: [
            {
              title: 'Collections',
              links: [
                { label: 'Haute Joaillerie', link: '/joaillerie' },
                { label: 'Horlogerie',       link: '/horlogerie' },
                { label: 'Mariage',          link: '/mariage' },
                { label: 'Accessoires',      link: '/accessoires' },
              ],
            },
            {
              title: 'Services',
              links: [
                { label: 'Conseil Privé',      link: '/conseil' },
                { label: 'Sur-mesure',         link: '/sur-mesure' },
                { label: 'Entretien',          link: '/entretien' },
                { label: 'Livraison',          link: '/livraison' },
              ],
            },
            {
              title: 'La Maison',
              links: [
                { label: 'Notre Histoire',     link: '/heritage' },
                { label: 'Nos Artisans',       link: '/artisans' },
                { label: 'Actualités',         link: '/actualites' },
                { label: 'Carrières',          link: '/carrieres' },
              ],
            },
            {
              title: 'Légal',
              links: [
                { label: 'Conditions Générales',   link: '/cgv' },
                { label: 'Confidentialité',        link: '/privacy' },
                { label: 'Mentions Légales',       link: '/mentions-legales' },
              ],
            },
          ],
          styles: {
            backgroundColor: '#f5f0e8',
            textColor:       '#4a4a4a',
            accentColor:     '#c9a962',
            dividerColor:    '#e8e0d5',
            fontFamily:      "'Cormorant Garamond', serif",
            fontSize:        13,
            letterSpacing:   '0.05em',
            paddingY:        70,
          },
        },
      },
    },

    // ── Pages ────────────────────────────────────────────────────
    pages: [

      // ── PAGE : Accueil ────────────────────────────────────────
      {
        id: 'page-home',
        name: 'Accueil',
        slug: '/',
        isHome: true,
        meta: {
          title:       'Maison Prestige — Haute Joaillerie & Horlogerie',
          description: 'Maison de luxe fondée en 1987. Joaillerie, horlogerie et créations sur-mesure d\'exception.',
        },
        sections: [

          // Hero — Slideshow avec overlay clair
          {
            id: 'sect-hero',
            type: 'hero',
            order: 0,
            props: {
              content: {
                pretitle: {
                  text: 'Collection 2026',
                  style: 'line',
                },
                title: "L'Excellence du Temps",
                subtitle: 'Des créations intemporelles façonnées par les plus grands artisans d\'Europe.',
                cta: {
                  primary: {
                    text: 'Découvrir',
                    href: '/collections',
                    style: 'solid',
                    icon: true,
                  },
                  secondary: {
                    text: 'Notre Histoire',
                    href: '/heritage',
                    style: 'outline',
                  },
                },
                media: {
                  type: 'image',
                  src: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&h=1080&fit=crop',
                  parallax: true,
                  zoomOnHover: false,
                },
                showScrollIndicator: true,
                slides: [
                  {
                    pretitle: { text: 'Collection 2026', style: 'line' },
                    title: "L'Excellence du Temps",
                    subtitle: 'Des créations intemporelles façonnées par les plus grands artisans d\'Europe.',
                    media: { type: 'image', src: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&h=1080&fit=crop' },
                    cta: {
                      primary: { text: 'Découvrir', href: '/collections', style: 'solid' },
                      secondary: { text: 'En savoir plus', href: '/heritage', style: 'outline' },
                    },
                    textColor: '#1a1a1a',
                    accentColor: '#c9a962',
                    overlay: { enabled: true, type: 'gradient', opacity: 0.25, color: '#faf8f5' },
                  },
                  {
                    pretitle: { text: 'Haute Joaillerie', style: 'line' },
                    title: "L'Art de la Brillance",
                    subtitle: 'Bijoux d\'exception sertis des plus beaux diamants et pierres précieuses.',
                    media: { type: 'image', src: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1920&h=1080&fit=crop' },
                    cta: {
                      primary: { text: 'Explorer', href: '/joaillerie', style: 'solid' },
                      secondary: { text: 'Prendre RDV', href: '/rdv', style: 'outline' },
                    },
                    textColor: '#1a1a1a',
                    accentColor: '#c9a962',
                    overlay: { enabled: true, type: 'gradient', opacity: 0.3, color: '#faf8f5' },
                  },
                  {
                    pretitle: { text: 'Horlogerie', style: 'line' },
                    title: 'Précision & Élégance',
                    subtitle: 'Montres d\'exception alliant savoir-faire traditionnel et innovation.',
                    media: { type: 'image', src: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=1920&h=1080&fit=crop' },
                    cta: {
                      primary: { text: 'Collection', href: '/horlogerie', style: 'solid' },
                      secondary: { text: 'Services', href: '/services', style: 'outline' },
                    },
                    textColor: '#1a1a1a',
                    accentColor: '#c9a962',
                    overlay: { enabled: true, type: 'gradient', opacity: 0.28, color: '#faf8f5' },
                  },
                ],
              },
              config: {
                variant: 'fullscreen-center',
                ratio: '50:50',
                verticalAlign: 'center',
                titleAnimation: 'fade-up',
                animation: {
                  entrance: 'fade-in',
                  duration: 'normal',
                  stagger: true,
                },
                overlay: {
                  enabled: true,
                  type: 'gradient',
                  opacity: 0.25,
                  color: '#faf8f5',
                },
                slideshow: {
                  enabled: true,
                  autoplay: true,
                  interval: 6000,
                  transition: 'fade',
                  duration: 1,
                  showArrows: true,
                  showDots: true,
                  pauseOnHover: true,
                  loop: true,
                },
              },
              style: {
                colors: {
                  background: 'transparent',
                  text: '#1a1a1a',
                  accent: '#c9a962',
                },
                typography: {
                  textAlign: 'center',
                  titleWeight: 'normal',
                  titleLineHeight: 'tight',
                  titleLetterSpacing: 'wide',
                },
                spacing: {
                  container: 'full',
                  minHeight: '100vh',
                  paddingY: '0',
                },
              },
              classes: {
                root: '',
                container: '',
                content: '',
                pretitle: '',
                title: '',
                subtitle: '',
                body: '',
                ctaGroup: '',
                ctaPrimary: '',
                ctaSecondary: '',
                scrollIndicator: '',
              },
            },
          },

          // Trust Badges — Fond blanc cassé
          {
            id: 'sect-trust',
            type: 'trustBadges',
            order: 1,
            props: {
              layout:  'row',
              divider: false,
              badges: [
                {
                  icon:        'Truck',
                  title:       'Livraison Express',
                  description: '24-48h en France',
                },
                {
                  icon:        'Shield',
                  title:       'Certifié Authentique',
                  description: 'Expertise garantie',
                },
                {
                  icon:        'RotateCcw',
                  title:       'Retours Faciles',
                  description: '30 jours satisfait',
                },
                {
                  icon:        'Headphones',
                  title:       'Service Client',
                  description: 'À votre écoute 7j/7',
                },
              ],
              styles: {
                backgroundColor: '#faf8f5',
                textColor:       '#2d2d2d',
                accentColor:     '#c9a962',
                iconColor:       '#c9a962',
                dividerColor:    '#e8e0d5',
                titleFontFamily: "'Cormorant Garamond', serif",
                titleLetterSpacing: '0.08em',
                iconSize:        26,
                paddingY:        50,
              },
            },
          },

          // Grille catégories — Design équilibré
          {
            id: 'sect-categories',
            type: 'categoryGrid',
            order: 2,
            props: {
              eyebrowText: 'Nos Collections',
              title:          'Univers d\'Exception',
              subtitle:       'Découvrez nos univers dédiés à l\'art et à la précision',
              titleStyle:     'editorial',
              titleFontSize:  11,
              titleLetterSpacing: '0.25em',
              columns:        4,
              aspectRatio:    '3/4',
              showProductCount: true,
              hoverEffect:    'zoom-subtle',
              categories: [
                {
                  name:   'Haute Joaillerie',
                  description: 'Pièces uniques',
                  image:  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=1000&fit=crop',
                  hoverImage: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=1000&fit=crop',
                  link:   '/joaillerie',
                  badge:  'Exclusif',
                  productCount: 42,
                },
                {
                  name:   'Horlogerie',
                  description: 'Montres d\'exception',
                  image:  'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&h=1000&fit=crop',
                  hoverImage: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&h=1000&fit=crop',
                  link:   '/horlogerie',
                  productCount: 28,
                },
                {
                  name:   'Mariage',
                  description: 'Moments précieux',
                  image:  'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=1000&fit=crop',
                  hoverImage: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=800&h=1000&fit=crop',
                  link:   '/mariage',
                  badge:  'Nouveau',
                  productCount: 56,
                },
                {
                  name:   'Accessoires',
                  description: 'Maroquinerie',
                  image:  'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=1000&fit=crop',
                  hoverImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&h=1000&fit=crop',
                  link:   '/accessoires',
                  productCount: 124,
                },
              ],
              viewAllButton: {
                text: 'Voir toutes les collections',
                href: '/collections',
              },
              styles: {
                backgroundColor: '#faf8f5',
                textColor:       '#1a1a1a',
                accentColor:     '#c9a962',
                overlayOpacity:  0.3,
                labelFontFamily: "'Cormorant Garamond', serif",
                labelFontSize:   22,
                captionFontFamily: "'Cormorant Garamond', serif",
                captionLetterSpacing: '0.1em',
                gap:             24,
                paddingY:        90,
              },
            },
          },

          // Section éditoriale — Fond champagne
          {
            id: 'sect-editorial',
            type: 'editorial',
            order: 3,
            props: {
              layout:    'image-right',
              image:     'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=900&h=1100&fit=crop',
              eyebrow:   'Notre Histoire',
              title:     "Un Héritage d'Excellence depuis 1987",
              body:      'Depuis près de quatre décennies, Maison Prestige cultive les relations avec les plus grands artisans d\'Europe. Chaque pièce est sélectionnée avec une exigence absolue, dans notre atelier parisien où tradition et modernité se rencontrent.',
              quote: {
                text: 'La véritable élégance réside dans la simplicité des lignes et la qualité des matériaux.',
                author: 'Pierre Laurent',
                role: 'Fondateur, 1987',
              },
              ctaText:   'Découvrir notre histoire',
              ctaLink:   '/heritage',
              ctaStyle:  'underline',
              imageAspectRatio: '3/4',
              styles: {
                backgroundColor:   '#f5f0e8',
                textColor:         '#2d2d2d',
                accentColor:       '#c9a962',
                eyebrowColor:      '#c9a962',
                eyebrowLetterSpacing: '0.2em',
                titleFontFamily:   "'Cormorant Garamond', serif",
                titleFontSize:     42,
                bodyFontFamily:    "'Cormorant Garamond', serif",
                bodyColor:         '#5a5a5a',
                quoteColor:        '#8b7355',
                paddingY:          120,
              },
            },
          },

          // Sélection produits — Fond blanc cassé
          {
            id: 'sect-products',
            type: 'productGrid',
            order: 4,
            props: {
              eyebrowText: 'Sélection',
              title:          'Créations Remarquables',
              subtitle:       'Une curation attentive des pièces les plus désirables',
              titleFontFamily: "'Cormorant Garamond', serif",
              titleFontSize:  38,
              subtitleLetterSpacing: '0.12em',
              subtitleUppercase: false,
              columns:        4,
              showFilters:    false,
              cardStyle:      'elegant',
              showRating:     true,
              showBadge:      true,
              hoverEffect:    'reveal-actions',
              config: {
                dynamicSource: 'recommended',
                productsPerPage: 4,
              },
              products: [
                {
                  id:    '1',
                  name:  'Collier Aurora',
                  price: 12500,
                  oldPrice: 15800,
                  image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&h=650&fit=crop',
                  hoverImage: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&h=650&fit=crop',
                  badge: '-20%',
                  rating: 5,
                  reviewCount: 12,
                  material: 'Or 18K, diamants',
                },
                {
                  id:    '2',
                  name:  'Montre Chronographe',
                  price: 8900,
                  image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500&h=650&fit=crop',
                  hoverImage: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=500&h=650&fit=crop',
                  badge: 'Édition Limitée',
                  rating: 4.9,
                  reviewCount: 8,
                  material: 'Acier, mouvement suisse',
                },
                {
                  id:    '3',
                  name:  'Bague Émeraude',
                  price: 18700,
                  image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&h=650&fit=crop',
                  hoverImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=650&fit=crop',
                  badge: 'Nouveau',
                  rating: 5,
                  reviewCount: 3,
                  material: 'Platine, émeraude 2.5ct',
                },
                {
                  id:    '4',
                  name:  'Sac Mademoiselle',
                  price: 4200,
                  image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&h=650&fit=crop',
                  hoverImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&h=650&fit=crop',
                  rating: 5,
                  reviewCount: 24,
                  material: 'Cuir, doublure soie',
                },
              ],
              viewAllButton: {
                text: 'Voir toute la sélection',
                href: '/boutique',
              },
              styles: {
                backgroundColor:     '#faf8f5',
                textColor:           '#1a1a1a',
                accentColor:         '#c9a962',
                secondaryTextColor:  '#6b6b6b',
                priceFontFamily:     "'Cormorant Garamond', serif",
                nameFontFamily:      "'Cormorant Garamond', serif",
                nameFontSize:        15,
                paddingY:            100,
                columnGap:           28,
              },
            },
          },

          // Stats Bar — Fond blanc avec chiffres or
          {
            id: 'sect-stats',
            type: 'statsBar',
            order: 5,
            props: {
              items: [
                { value: '1987',  label: 'Fondation' },
                { value: '38',    label: 'Années d\'excellence' },
                { value: '15K+',  label: 'Clients satisfaits' },
                { value: '380+',  label: 'Artisans partenaires' },
              ],
              divider: true,
              styles: {
                backgroundColor: '#faf8f5',
                textColor:       '#1a1a1a',
                accentColor:     '#c9a962',
                valueColor:      '#c9a962',
                fontFamily:      "'Cormorant Garamond', serif",
                valueFontSize:   48,
                labelFontSize:   11,
                labelLetterSpacing: '0.15em',
                paddingY:        60,
              },
            },
          },

          // Testimonials — Fond champagne subtil
          {
            id: 'sect-testimonials',
            type: 'testimonials',
            order: 6,
            visible: true,
            props: {
              layout:   'slider',
              title:      'Témoignages',
              subtitle:   'Ce que nos clients partagent',
              testimonials: [
                {
                  name:    'Marie L.',
                  role:    'Cliente fidèle',
                  content: 'Une expérience remarquable du début à la fin. L\'équipe a su me guider vers une pièce qui correspond parfaitement à mes attentes.',
                  avatar:  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
                  rating:  5,
                },
                {
                  name:    'Jean D.',
                  role:    'Collectionneur',
                  content: 'Troisième acquisition chez Maison Prestige. La qualité du service et l\'expertise sont constants. Un vrai partenariat.',
                  avatar:  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
                  rating:  5,
                },
                {
                  name:    'Sophie M.',
                  role:    'Cliente',
                  content: 'Pour mon mariage, j\'ai fait appel à leur service sur-mesure. Un moment précieux et une création exceptionnelle.',
                  avatar:  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
                  rating:  5,
                },
              ],
              autoPlay:  true,
              interval:  8000,
              showRating: true,
              showAvatar: true,
              showNavigation: true,
              styles: {
                backgroundColor:    '#f5f0e8',
                textColor:          '#2d2d2d',
                accentColor:        '#c9a962',
                quoteFontFamily:    "'Cormorant Garamond', serif",
                quoteFontSize:      26,
                quoteStyle:         'italic',
                metaFontFamily:     "'Cormorant Garamond', serif",
                metaLetterSpacing:  '0.12em',
                paddingY:           100,
              },
            },
          },

          // Newsletter — Design sobre
          {
            id: 'sect-newsletter',
            type: 'newsletter',
            order: 7,
            props: {
              eyebrow:            'Restez informé',
              title:              'Newsletter',
              subtitle:           'Recevez nos actualités et invitations exclusives.',
              buttonText:         'S\'inscrire',
              placeholder:        'Votre adresse email',
              buttonStyle:        'filled-gold',
              showPrivacyCheckbox: true,
              privacyText:        'J\'accepte de recevoir la newsletter de Maison Prestige',
              layout:             'centered-minimal',
              styles: {
                backgroundColor:    '#faf8f5',
                textColor:          '#1a1a1a',
                accentColor:        '#c9a962',
                eyebrowColor:       '#c9a962',
                eyebrowLetterSpacing: '0.2em',
                titleFontFamily:    "'Cormorant Garamond', serif",
                titleFontSize:      36,
                inputBorder:        '#d4ccc0',
                inputBackground:    '#ffffff',
                paddingY:           100,
              },
            },
          },
        ],
      },

      // ── PAGE : Produit ────────────────────────────────────────
      {
        id: 'page-product',
        name: 'Produit',
        slug: '/produit',
        isHome: false,
        meta: {
          title:       'Collier Aurora — Maison Prestige',
          description: 'Collier en or 18K avec diamants. Création sur mesure disponible.',
        },
        sections: [
          {
            id: 'sect-breadcrumb',
            type: 'breadcrumb',
            order: 0,
            props: {
              showHome:  true,
              separator: 'chevron',
              items: [
                { label: 'Accueil', link: '/' },
                { label: 'Haute Joaillerie', link: '/joaillerie' },
                { label: 'Colliers', link: '/joaillerie/colliers' },
              ],
              styles: {
                backgroundColor:  '#faf8f5',
                textColor:        '#8a8a8a',
                activeColor:      '#1a1a1a',
                fontFamily:       "'Cormorant Garamond', serif",
                fontSize:         12,
                letterSpacing:    '0.08em',
                paddingY:         20,
                borderBottom:     '#e8e0d5',
              },
            },
          },
          {
            id: 'sect-product-detail',
            type: 'productDetailContent',
            order: 1,
            props: {
              product: {
                id:           '1',
                name:         'Collier Aurora',
                collection:   'Haute Joaillerie 2026',
                price:        12500,
                oldPrice:     15800,
                description:  'Collier somptueux en or 18K jaune, serti de 47 diamants taille brillant. Chaîne en maille forçat de 42cm. Chaque création est numérotée et accompagnée d\'un certificat d\'authenticité.',
                care:         'Conserver dans l\'écrin · Nettoyage professionnel · Éviter les parfums',
                image:        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=700&h=900&fit=crop',
                gallery: [
                  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=700&h=900&fit=crop',
                  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=700&h=900&fit=crop',
                  'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=700&h=900&fit=crop',
                ],
                badge:        'Pièce 08/20',
                sku:          'JOR-AUR-26-008',
                inStock:      true,
                sizes:        ['42cm', '45cm', 'Sur mesure'],
                colors: [
                  { name: 'Or Jaune',    hex: '#c9a962' },
                  { name: 'Or Blanc',    hex: '#e8e8e8' },
                  { name: 'Or Rose',     hex: '#d4b5a8' },
                ],
                rating:       5,
                reviewCount:  12,
              },
              showReviews:         true,
              showRelatedProducts: true,
              showSizeGuide:       true,
              showShippingInfo:    true,
              styles: {
                backgroundColor:   '#faf8f5',
                textColor:         '#1a1a1a',
                accentColor:       '#c9a962',
                secondaryText:     '#6b6b6b',
                titleFontFamily:   "'Cormorant Garamond', serif",
                titleFontSize:     34,
                bodyFontFamily:    "'Cormorant Garamond', serif",
                priceFontSize:     30,
                priceColor:        '#c9a962',
                paddingY:          80,
              },
            },
          },
        ],
      },

      // ── PAGE : Produits ───────────────────────────────────────
      {
        id: 'page-products',
        name: 'Produits',
        slug: '/produits',
        isHome: false,
        meta: {
          title:       'Collections — Maison Prestige',
          description: 'Haute joaillerie et horlogerie d\'exception.',
        },
        sections: [
          {
            id: 'sect-collection-hero',
            type: 'collectionHero',
            order: 0,
            props: {
              title:    'Haute Joaillerie',
              subtitle: 'Collection 2026',
              image:    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&h=500&fit=crop',
              overlayOpacity: 0.35,
              styles: {
                backgroundColor: '#f5f0e8',
                textColor:       '#1a1a1a',
                titleFontFamily: "'Cormorant Garamond', serif",
                titleFontSize:   56,
                subtitleLetterSpacing: '0.15em',
                paddingY:        70,
                minHeight:       350,
              },
            },
          },
          {
            id: 'sect-product-grid',
            type: 'productsContent',
            order: 1,
            props: {
              title:       null,
              columns:     4,
              showFilters: true,
              filterStyle: 'minimal',
              cardStyle:   'elegant',
              showRating:  true,
              products: [
                { id: '1', name: 'Collier Aurora',        price: 12500, oldPrice: 15800, image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&h=650&fit=crop', badge: '-20%', material: 'Or 18K, diamants' },
                { id: '2', name: 'Montre Chronographe',   price: 8900,  image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500&h=650&fit=crop', badge: 'Limitée', material: 'Acier, mouvement suisse' },
                { id: '3', name: 'Bague Émeraude',       price: 18700, image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&h=650&fit=crop', badge: 'Nouveau', material: 'Platine, émeraude' },
                { id: '4', name: 'Sac Mademoiselle',      price: 4200,  image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&h=650&fit=crop', material: 'Cuir, soie' },
                { id: '5', name: 'Bracelet Éternité',    price: 5600,  image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220b?w=500&h=650&fit=crop', material: 'Or blanc, diamants' },
                { id: '6', name: 'Boucles d\'oreilles',  price: 3200,  image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&h=650&fit=crop', material: 'Or jaune, perles' },
                { id: '7', name: 'Montre Classique',    price: 6500,  image: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=500&h=650&fit=crop', material: 'Or rose, cuir' },
                { id: '8', name: 'Collier Cascade',      price: 9800,  image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=650&fit=crop', badge: 'Exclusif', material: 'Or blanc, saphirs' },
              ],
              styles: {
                backgroundColor:    '#faf8f5',
                textColor:          '#1a1a1a',
                accentColor:        '#c9a962',
                secondaryTextColor: '#7a7a7a',
                nameFontFamily:     "'Cormorant Garamond', serif",
                priceFontFamily:    "'Cormorant Garamond', serif",
                paddingY:           80,
                columnGap:          28,
              },
            },
          },
        ],
      },

      // ── PAGE : Panier ─────────────────────────────────────────
      {
        id: 'page-cart',
        name: 'Panier',
        slug: '/panier',
        isHome: false,
        meta: {
          title: 'Panier — Maison Prestige',
          description: 'Votre sélection',
        },
        sections: [
          {
            id: 'sect-cart',
            type: 'cart',
            order: 0,
            props: {
              title:          'Votre Sélection',
              emptyMessage:   'Votre panier est vide.',
              emptyCtaText:   'Continuer',
              emptyCtaLink:   '/boutique',
              showCouponField: true,
              cartItems: [
                { id: '1', name: 'Collier Aurora',   price: 12500, quantity: 1, image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&h=260&fit=crop', size: '42cm', color: 'Or Jaune' },
                { id: '2', name: 'Montre', price: 8900, quantity: 1, image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=200&h=260&fit=crop', color: 'Cadran Noir' },
              ],
              styles: {
                backgroundColor:   '#faf8f5',
                textColor:         '#1a1a1a',
                accentColor:       '#c9a962',
                secondaryText:     '#6b6b6b',
                borderColor:       '#e8e0d5',
                titleFontFamily:   "'Cormorant Garamond', serif",
                titleFontSize:     34,
                paddingY:          80,
              },
            },
          },
        ],
      },

      // ── PAGE : Favoris ────────────────────────────────────────
      {
        id: 'page-wishlist',
        name: 'Favoris',
        slug: '/favoris',
        isHome: false,
        meta: {
          title: 'Mes Favoris — Maison Prestige',
          description: 'Vos pièces préférées',
        },
        sections: [
          {
            id: 'sect-wishlist',
            type: 'wishlistContent',
            order: 0,
            props: {
              title:        'Mes Favoris',
              emptyMessage: 'Aucune pièce sauvegardée.',
              emptyCtaText: 'Découvrir',
              emptyCtaLink: '/boutique',
              styles: {
                backgroundColor:  '#faf8f5',
                textColor:        '#1a1a1a',
                accentColor:      '#c9a962',
                titleFontFamily:  "'Cormorant Garamond', serif",
                titleFontSize:    34,
                paddingY:         80,
              },
            },
          },
        ],
      },

      // ── PAGE : Mon Compte ─────────────────────────────────────
      {
        id: 'page-account',
        name: 'Mon Compte',
        slug: '/compte',
        isHome: false,
        meta: {
          title: 'Mon Compte — Maison Prestige',
          description: 'Gérez vos informations',
        },
        sections: [
          {
            id: 'sect-account',
            type: 'accountContent',
            order: 0,
            props: {
              title:    'Mon Espace',
              subtitle: null,
              user: {
                firstName:   'Marie',
                lastName:    'Laurent',
                email:       'm.laurent@email.com',
                phone:       '+33 6 12 34 56 78',
                memberSince: '2019',
                tier:        'Cliente Privilège',
              },
              styles: {
                backgroundColor:  '#faf8f5',
                textColor:        '#1a1a1a',
                accentColor:      '#c9a962',
                cardBackground:   '#ffffff',
                borderColor:      '#e8e0d5',
                titleFontFamily:  "'Cormorant Garamond', serif",
                titleFontSize:    34,
                paddingY:         80,
              },
            },
          },
        ],
      },

      // ── PAGE : Checkout ───────────────────────────────────────
      {
        id: 'page-checkout',
        name: 'Checkout',
        slug: '/checkout',
        isHome: false,
        meta: {
          title: 'Finaliser — Maison Prestige',
          description: 'Finalisez votre commande',
        },
        sections: [
          {
            id: 'sect-checkout',
            type: 'checkoutContent',
            order: 0,
            props: {
              title:     'Finaliser',
              showSteps: true,
              steps:     'Livraison\nPaiement\nConfirmation',
              styles: {
                backgroundColor:  '#faf8f5',
                textColor:        '#1a1a1a',
                accentColor:      '#c9a962',
                stepActiveColor:  '#c9a962',
                stepDoneColor:    '#c9a962',
                borderColor:      '#e8e0d5',
                titleFontFamily:  "'Cormorant Garamond', serif",
                titleFontSize:    30,
                paddingY:         80,
              },
            },
          },
        ],
      },

      // ── PAGE : Confirmation ───────────────────────────────────
      {
        id: 'page-confirmation',
        name: 'Confirmation',
        slug: '/confirmation',
        isHome: false,
        meta: {
          title: 'Commande confirmée — Maison Prestige',
          description: 'Votre commande a été validée',
        },
        sections: [
          {
            id: 'sect-confirmation',
            type: 'orderConfirmationContent',
            order: 0,
            props: {
              title:             'Commande Confirmée',
              subtitle:          'Un e-mail de confirmation vous a été envoyé.',
              showOrderDetails:  true,
              showTracking:      true,
              icon:              'check-gold',
              styles: {
                backgroundColor:  '#faf8f5',
                textColor:        '#1a1a1a',
                accentColor:      '#c9a962',
                paddingY:         80,
              },
            },
          },
        ],
      },

      // ── PAGE : Détails de commande ─────────────────────────
      {
        id: 'page-order-detail',
        name: 'Détails de commande',
        slug: '/commande',
        isHome: false,
        meta: {
          title: 'Détails — Maison Prestige',
          description: 'Consultez votre commande',
        },
        sections: [
          {
            id: 'sect-order-detail',
            type: 'orderDetail',
            order: 0,
            props: {
              styles: {
                backgroundColor: '#faf8f5',
                textColor:       '#1a1a1a',
                accentColor:     '#c9a962',
                paddingY:        80,
              },
            },
          },
        ],
      },

      // ── PAGE : Connexion ────────────────────────────────────
      {
        id: 'page-login',
        name: 'Connexion',
        slug: '/connexion',
        isHome: false,
        meta: {
          title: 'Connexion — Maison Prestige',
          description: 'Accédez à votre espace',
        },
        sections: [
          {
            id: 'sect-login',
            type: 'login',
            order: 0,
            props: {
              title:               'Bonjour',
              subtitle:            'Connectez-vous',
              showEmail:           true,
              showPassword:        true,
              showRememberMe:      true,
              showForgotPassword:  true,
              showSocialLogin:     false,
              registerLink:        '/inscription',
              layout:              'split-image',
              splitImage:          'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=900&h=1200&fit=crop',
              styles: {
                backgroundColor:  '#faf8f5',
                textColor:        '#1a1a1a',
                accentColor:      '#c9a962',
                inputBorder:      '#d4ccc0',
                inputBackground:  '#ffffff',
                inputTextColor:   '#1a1a1a',
                titleFontFamily:  "'Cormorant Garamond', serif",
                titleFontSize:    40,
                paddingY:         0,
              },
            },
          },
        ],
      },

      // ── PAGE : Inscription ────────────────────────────────────
      {
        id: 'page-register',
        name: 'Inscription',
        slug: '/inscription',
        isHome: false,
        meta: {
          title: 'Créer un compte — Maison Prestige',
          description: 'Rejoignez-nous',
        },
        sections: [
          {
            id: 'sect-register',
            type: 'register',
            order: 0,
            props: {
              title:                'Créer un compte',
              subtitle:             'Rejoignez Maison Prestige.',
              showFirstName:        true,
              showLastName:         true,
              showEmail:            true,
              showPhone:            true,
              showPassword:         true,
              showPasswordConfirm:  true,
              showTerms:            true,
              showNewsletter:       true,
              showSocialLogin:      false,
              loginLink:            '/connexion',
              layout:               'split-image',
              splitImage:           'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=900&h=1200&fit=crop',
              styles: {
                backgroundColor:  '#faf8f5',
                textColor:        '#1a1a1a',
                accentColor:      '#c9a962',
                inputBorder:      '#d4ccc0',
                inputBackground:  '#ffffff',
                inputTextColor:   '#1a1a1a',
                titleFontFamily:  "'Cormorant Garamond', serif",
                titleFontSize:    36,
                paddingY:         0,
              },
            },
          },
        ],
      },
    ],

    // ── Settings globaux ─────────────────────────────────────────
    settings: {
      // Palette Champagne & Gold
      primaryColor:   '#1a1a1a',
      secondaryColor: '#f5f0e8',
      accentColor:    '#c9a962',
      backgroundColor: '#faf8f5',
      textColor:      '#2d2d2d',

      // Typographie élégante
      fontFamily:        "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
      bodyFontFamily:    "'Cormorant Garamond', serif",
      fontSize:          16,
      headingScale:      1.2,
      letterSpacingBase: '0.02em',

      // Forme — Subtile
      borderRadius:     3,
      containerWidth:   '1320px',

      // Animations — Douces
      transitionDuration: '400ms',
      transitionEasing:   'cubic-bezier(0.25, 0.1, 0.25, 1)',

      // Ombres — Discrètes
      shadowSm:  '0 1px 3px rgba(0,0,0,0.06)',
      shadowMd:  '0 4px 12px rgba(0,0,0,0.08)',
      shadowLg:  '0 16px 40px rgba(0,0,0,0.1)',
    },

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

export const noirLumiereTemplate: Template = {
  id: 'noir-lumiere',
  name: 'NOIR & LUMIÈRE',
  description:
    'Un temple du luxe contemporain inspiré de Net-a-Porter, SSENSE et Bottega Veneta. ' +
    'Fond sombre, typographie monumentale, photographie magistrale. ' +
    'Pour joailleries, horlogers, parfumeurs et maisons de prestige.',
  thumbnail:
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=400&fit=crop',
  category: 'luxury',

  colorScheme: {
    primary:    '#f5f0e8',
    secondary:  '#111111',
    accent:     '#d4a853',
    background: '#0a0a0a',
    text:       '#f5f0e8',
  },

  project: {
    id: 'template-noir-lumiere',
    name: 'NOIR & LUMIÈRE',
    description: "Joaillerie de haute création — L'art du temps et de la matière",

    globalSections: {

      announcementBar: {
        id: 'global-announcement',
        type: 'announcementBar',
        order: 0,
        props: {
          messages: [
            'Livraison assurée & offerte — Mondial',
            'Gravure personnalisée sur toutes les pièces',
            'Consultation privée — Genève · Paris · Dubaï',
          ],
          autoRotate: true,
          interval: 6500,
          showIcons: false,
          styles: {
            backgroundColor: '#d4a853',
            textColor:       '#0a0a0a',
            accentColor:     '#0a0a0a',
            fontSize:        11,
            letterSpacing:   '0.22em',
            fontFamily:      "'Didot', 'Bodoni MT', 'Times New Roman', serif",
            fontWeight:      500,
            paddingY:        9,
          },
        },
      },

      header: {
        id: 'global-header',
        type: 'headerModern',
        order: 0,
        props: {
          logo: {
            text:          'N&L',
            letterSpacing: '0.45em',
            fontFamily:    "'Didot', 'Bodoni MT', serif",
            fontWeight:    300,
            fontSize:      22,
          },
          blocks: [
            { id: 'nav-1', label: 'Joaillerie',        link: '/produits', enabled: true },
            { id: 'nav-2', label: 'Horlogerie',         link: '/produits', enabled: true },
            { id: 'nav-3', label: 'Parures',            link: '/produits', enabled: true },
            { id: 'nav-4', label: 'Éditions Limitées',  link: '/produits', enabled: true },
            { id: 'nav-5', label: "L'Atelier",          link: '/produits', enabled: true },
          ],
          ctaButton: { text: 'Rendez-vous', link: '/produits', variant: 'ghost', show: false },
          showSearch:   true,
          showCart:     true,
          showAccount:  true,
          sticky:       true,
          borderBottom: true,
          styles: {
            backgroundColor: 'rgba(10,10,10,0.97)',
            textColor:       '#f5f0e8',
            accentColor:     '#d4a853',
            hoverColor:      '#d4a853',
            borderColor:     '#2a2a2a',
            fontFamily:      "'Didot', 'Bodoni MT', serif",
            fontSize:        12,
            letterSpacing:   '0.18em',
            fontWeight:      400,
            paddingY:        24,
          },
        },
      },

      footer: {
        id: 'global-footer',
        type: 'footerModern',
        order: 0,
        props: {
          logo: {
            text:          'NOIR & LUMIÈRE',
            letterSpacing: '0.4em',
            fontFamily:    "'Didot', 'Bodoni MT', serif",
            fontWeight:    300,
            fontSize:      13,
          },
          copyright: '© 2026 Noir & Lumière. Genève. Tous droits réservés.',
          newsletter:      true,
          newsletterLabel: 'Correspondance privée',
          newsletterSub:   'Nouvelles créations, éditions limitées et invitations.',
          columns: [
            {
              title: 'Créations',
              links: [
                { label: 'Joaillerie',        url: '/produits' },
                { label: 'Haute Horlogerie',  url: '/produits' },
                { label: 'Parures',           url: '/produits' },
                { label: 'Éditions Limitées', url: '/produits' },
              ],
            },
            {
              title: 'La Maison',
              links: [
                { label: 'Notre Histoire',   url: '/produits' },
                { label: "L'Atelier",        url: '/produits' },
                { label: 'Savoir-faire',     url: '/produits' },
                { label: 'Gravure & Mesure', url: '/produits' },
              ],
            },
            {
              title: 'Service',
              links: [
                { label: 'Livraison & Retours',     url: '/produits' },
                { label: 'Certificats & Garanties', url: '/produits' },
                { label: 'Conditions générales',    url: '/produits' },
                { label: 'Confidentialité',         url: '/produits' },
              ],
            },
          ],
          styles: {
            backgroundColor: '#080808',
            textColor:       '#7a7570',
            accentColor:     '#d4a853',
            dividerColor:    '#1e1e1e',
            fontFamily:      "'Didot', 'Bodoni MT', serif",
            fontSize:        12,
            letterSpacing:   '0.07em',
            paddingY:        90,
          },
        },
      },
    },

    pages: [

      // ════════════════════════════════════════════════════════════
      // PAGE ACCUEIL — Très riche en produits & catégories
      // ════════════════════════════════════════════════════════════
      {
        id: 'page-home',
        name: 'Accueil',
        slug: '/',
        isHome: true,
        meta: {
          title:       'NOIR & LUMIÈRE — Joaillerie & Haute Horlogerie',
          description: "Joaillerie et horlogerie d'exception. Pièces uniques, éditions limitées, gravure sur mesure.",
        },
        sections: [

          // ── 0. HERO fullscreen, alignement gauche, typographie monumentale
          {
            id: 'sect-hero',
            type: 'hero',
            order: 0,
            props: {
              content: {
                pretitle: { text: 'Nouvelle Création · 2026', style: 'line' },
                title:    "Là où l'or\nrencontre\nl'éternité",
                subtitle: 'Joaillerie & Haute Horlogerie · Genève',
                cta: {
                  primary:   { text: 'Explorer les créations', href: '/produits', style: 'outline', icon: false },
                  secondary: { text: 'Prendre rendez-vous',    href: '/produits', style: 'text' },
                },
                media: {
                  type:        'image',
                  src:         'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&h=1080&fit=crop',
                  parallax:    true,
                  zoomOnHover: false,
                },
                showScrollIndicator: true,
                slides: [],
              },
              config: {
                variant:        'fullscreen-left',
                verticalAlign:  'center',
                titleAnimation: 'split-text',
                animation:      { entrance: 'fade-in', duration: 'slow', stagger: true },
                overlay:        { enabled: true, type: 'gradient', opacity: 0.65, color: '#000000' },
                slideshow: {
                  enabled: false, autoplay: true, interval: 6000,
                  transition: 'fade', duration: 1.2,
                  showArrows: false, showDots: true, pauseOnHover: true, loop: true,
                },
              },
              style: {
                colors:     { background: 'transparent', text: '#f5f0e8', accent: '#d4a853' },
                typography: { textAlign: 'left', titleWeight: 'light', titleLineHeight: 'tight', titleLetterSpacing: 'tight' },
                spacing:    { container: 'contained', minHeight: '100vh', paddingY: '0' },
              },
              classes: {},
            },
          },

          // ── 1. STATS BAR
          {
            id: 'sect-stats',
            type: 'statsBar',
            order: 1,
            props: {
              items: [
                { value: '1921', label: 'Fondation' },
                { value: '104',  label: "Années d'excellence" },
                { value: '6',    label: 'Ateliers mondiaux' },
                { value: '48',   label: 'Maîtres artisans' },
              ],
              divider: true,
              styles: {
                backgroundColor:    '#0a0a0a',
                textColor:          '#f5f0e8',
                accentColor:        '#d4a853',
                fontFamily:         "'Didot', 'Bodoni MT', serif",
                valueFontSize:      52,
                labelFontSize:      11,
                labelLetterSpacing: '0.2em',
                paddingY:           70,
              },
            },
          },

          // ── 2. CATEGORY GRID — Horizontal 4 colonnes, format 4/5, compact
          //    Variant: horizontal | cardStyle: minimal | titlePosition: overlay
          //    Petits labels (22px), overlay 38%, gap 2px — très compact et élégant
          {
            id: 'sect-categories-main',
            type: 'categoryGrid',
            order: 2,
            props: {
              content: {
                title:    'Univers',
                subtitle: '',
                showTitle:    true,
                showSubtitle: false,
                categories: [
                  {
                    name:         'Joaillerie',
                    image:        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=480&h=600&fit=crop',
                    link:         '/produits',
                    caption:      'Diamants & pierres rares',
                    productCount: 48,
                    href:         '/produits',
                  },
                  {
                    name:         'Horlogerie',
                    image:        'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=480&h=600&fit=crop',
                    link:         '/produits',
                    caption:      'Complications & mouvements',
                    productCount: 24,
                    href:         '/produits',
                  },
                  {
                    name:         'Parures',
                    image:        'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=480&h=600&fit=crop',
                    link:         '/produits',
                    caption:      'Ensembles assortis',
                    productCount: 16,
                    href:         '/produits',
                  },
                  {
                    name:         'Éditions Limitées',
                    image:        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=480&h=600&fit=crop',
                    link:         '/produits',
                    caption:      'Pièces numérotées',
                    productCount: 12,
                    href:         '/produits',
                  },
                ],
              },
              config: {
                variant:          'horizontal',
                columns:          4,
                aspectRatio:      '4/5',
                gap:              2,
                hoverEffect:      'zoom-slow',
                showProductCount: false,
                animation: { entrance: 'stagger', stagger: true },
                cardStyle: {
                  variant:       'minimal',
                  borderRadius:  'none',
                  borderWidth:   '0',
                  shadow:        'none',
                  titlePosition: 'overlay',
                },
                header: {
                  title: {
                    textAlign:     'left',
                    fontFamily:    'inherit',
                    fontSize:      '3xl',
                    fontWeight:    'light',
                    fontStyle:     'normal',
                    textTransform: 'none',
                  },
                  subtitle: {
                    textAlign:  'left',
                    fontFamily: 'inherit',
                    fontSize:   'sm',
                    fontStyle:  'normal',
                  },
                },
              },
              style: {
                colors:  { background: '#0a0a0a', text: 'primary', accent: 'accent' },
                spacing: { paddingY: '0', container: 'contained', gap: '2' },
                typography: { titleSize: '3xl', textAlign: 'left' },
              },
              classes: {},
            },
          },

          // ── 3. PRODUCT GRID — NOUVEAUTÉS · source: newest · 4 col · cardVariant: minimal
          {
            id: 'sect-products-new',
            type: 'productGrid',
            order: 3,
            props: {
              content: {
                eyebrowText:     "Vient d'arriver",
                title:           'Nouveautés',
                subtitle:        "Dernières créations sorties de l'atelier",
                showEyebrowText: true,
                showTitle:       true,
                showSubtitle:    true,
                filters:         { enabled: true },
                viewAllButton:   { text: 'Voir toutes les nouveautés', href: '/produits' },
                products: [
                  { id: 'n1', name: 'Bague Constellation',  price: 18500, image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&h=650&fit=crop', badge: 'Nouveau', rating: 5.0, href: '/produit' },
                  { id: 'n2', name: 'Pendentif Étoile',     price: 5400,  image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=500&h=650&fit=crop', badge: 'Nouveau', rating: 4.9, href: '/produit' },
                  { id: 'n3', name: 'Boucles Aurore',       price: 4200,  image: 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=500&h=650&fit=crop', badge: 'Nouveau', rating: 4.8, href: '/produit' },
                  { id: 'n4', name: 'Bracelet Céleste',     price: 8900,  image: 'https://images.unsplash.com/photo-1573408301185-9519f94815b2?w=500&h=650&fit=crop', badge: 'Nouveau', rating: 4.9, href: '/produit' },
                ],
              },
              config: {
                cardVariant:           'minimal',
                variant:               'grid-4',
                columns:               '4',
                dynamicSource:         'newest',
                showViewAllButton:     true,
                viewAllButtonPosition: 'header-right',
                viewAllButtonStyle:    'underline',
                showQuickView:         true,
                showWishlist:          true,
                loadMore:              'none',
                productsPerPage:       4,
                titleAlignment:        'left',
                header: {
                  eyebrow:  { fontFamily: 'inherit', fontSize: 'xs',  fontWeight: 'medium',  textTransform: 'uppercase' },
                  title:    { textAlign: 'left', fontFamily: 'inherit', fontSize: '4xl', fontWeight: 'light', fontStyle: 'normal', textTransform: 'none' },
                  subtitle: { textAlign: 'left', fontFamily: 'inherit', fontSize: 'sm',  fontStyle: 'normal' },
                },
              },
              cardConfig: {
                image:     { aspectRatio: '3/4', hoverEffect: 'zoom', hoverScale: 1.06, objectFit: 'cover' },
                info:      { alignment: 'left', showRating: false, showPrice: true, showBadge: true },
                badge:     { position: 'top-left', style: 'rectangle' },
                quickView: true,
                wishlist:  true,
                addToCart: { show: true, style: 'outline', position: 'overlay', size: 'sm', text: 'Ajouter' },
                style:     { variant: 'minimal', borderRadius: 'none', shadow: 'none' },
              },
              style: {
                colors:  { background: '#0d0d0d', text: '#f5f0e8', accent: '#d4a853' },
                spacing: { paddingY: '20', container: 'contained', gap: '6' },
              },
            },
          },

          // ── 4. EDITORIAL — Savoir-faire, image gauche
          {
            id: 'sect-editorial-1',
            type: 'editorial',
            order: 4,
            props: {
              layout:  'image-left',
              image:   'https://images.unsplash.com/photo-1573408301185-9519f94815b2?w=900&h=1100&fit=crop',
              eyebrow: 'Le Savoir-faire',
              title:   "Chaque pierre\nchoisie à la\nsource",
              body:    "Nos gemmologues parcourent le monde — mines de Birmanie, vallées colombiennes, filons sud-africains — pour ne sélectionner que les pierres qui méritent d'être portées toute une vie. Quarante-deux étapes de contrôle avant chaque livraison.",
              ctaText: "Découvrir l'atelier",
              ctaLink: '/produits',
              ctaStyle: 'underline',
              imageAspectRatio: '3/4',
              styles: {
                backgroundColor:      '#111111',
                textColor:            '#f5f0e8',
                accentColor:          '#d4a853',
                eyebrowColor:         '#d4a853',
                eyebrowLetterSpacing: '0.28em',
                titleFontFamily:      "'Didot', 'Bodoni MT', serif",
                titleFontSize:        54,
                bodyFontFamily:       "'Didot', 'Bodoni MT', serif",
                bodyColor:            '#9a948e',
                paddingY:             150,
              },
            },
          },

          // ── 5. PRODUCT GRID — MEILLEURES VENTES · source: best_selling · 4 col · cardVariant: elegant
          {
            id: 'sect-products-bestseller',
            type: 'productGrid',
            order: 5,
            props: {
              content: {
                eyebrowText:     'Les plus convoitées',
                title:           'Meilleures ventes',
                subtitle:        'Pièces plébiscitées par notre clientèle mondiale',
                showEyebrowText: true,
                showTitle:       true,
                showSubtitle:    true,
                filters:         { enabled: true },
                viewAllButton:   { text: 'Voir la collection complète', href: '/produits' },
                products: [
                  { id: 'b1', name: 'Bague Constellation',  price: 18500,            image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&h=650&fit=crop', badge: 'Best-seller', rating: 5.0, href: '/produit' },
                  { id: 'b2', name: 'Montre Perpétuelle I', price: 42000,            image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500&h=650&fit=crop', badge: 'Iconique',    rating: 4.9, href: '/produit' },
                  { id: 'b3', name: 'Collier Lumière',      price: 9800, oldPrice: 12000, image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&h=650&fit=crop', badge: '-18%',  rating: 4.8, href: '/produit' },
                  { id: 'b4', name: 'Bracelet Oréa',        price: 7200,            image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=650&fit=crop', badge: null,         rating: 4.9, href: '/produit' },
                ],
              },
              config: {
                cardVariant:           'elegant',
                variant:               'grid-4',
                columns:               '4',
                dynamicSource:         'best_selling',
                showViewAllButton:     true,
                viewAllButtonPosition: 'footer',
                viewAllButtonStyle:    'outline',
                showQuickView:         true,
                showWishlist:          true,
                loadMore:              'none',
                productsPerPage:       4,
                titleAlignment:        'left',
                header: {
                  eyebrow:  { fontFamily: 'inherit', fontSize: 'xs',  fontWeight: 'medium',  textTransform: 'uppercase' },
                  title:    { textAlign: 'left', fontFamily: 'inherit', fontSize: '4xl', fontWeight: 'light', fontStyle: 'normal', textTransform: 'none' },
                  subtitle: { textAlign: 'left', fontFamily: 'inherit', fontSize: 'sm',  fontStyle: 'normal' },
                },
              },
              cardConfig: {
                image:     { aspectRatio: '3/4', hoverEffect: 'reveal-actions', hoverScale: 1.05, objectFit: 'cover' },
                info:      { alignment: 'left', showRating: false, showPrice: true, showBadge: true },
                badge:     { position: 'top-right', style: 'pill' },
                quickView: true,
                wishlist:  true,
                addToCart: { show: true, style: 'solid', position: 'bottom', size: 'md', text: 'Acquérir' },
                style:     { variant: 'elegant', borderRadius: 'none', shadow: 'md' },
              },
              style: {
                colors:  { background: '#0a0a0a', text: '#f5f0e8', accent: '#d4a853' },
                spacing: { paddingY: '20', container: 'contained', gap: '8' },
              },
            },
          },

          // ── 6. CATEGORY GRID — BENTO 3 colonnes, landscape, sous-catégories horlogerie
          //    Variant: bento | ratio landscape | cardStyle: elegant avec bordure fine 1px
          //    Petits labels italiques (20px), overlay 42%
          {
            id: 'sect-categories-watch',
            type: 'categoryGrid',
            order: 6,
            props: {
              content: {
                title:    'Horlogerie',
                subtitle: 'Complications & Prestige',
                showTitle:    true,
                showSubtitle: true,
                categories: [
                  {
                    name:         'Complications',
                    image:        'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=680&h=440&fit=crop',
                    link:         '/produits',
                    caption:      'Tourbillons, perpétuelles',
                    productCount: 8,
                    href:         '/produits',
                  },
                  {
                    name:         'Sport & Prestige',
                    image:        'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=680&h=440&fit=crop',
                    link:         '/produits',
                    caption:      'Étanchéité & robustesse noble',
                    productCount: 12,
                    href:         '/produits',
                  },
                  {
                    name:         'Dame',
                    image:        'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=680&h=440&fit=crop',
                    link:         '/produits',
                    caption:      'Finesse & pierres précieuses',
                    productCount: 10,
                    href:         '/produits',
                  },
                ],
              },
              config: {
                variant:          'bento',
                columns:          3,
                aspectRatio:      'landscape',
                gap:              3,
                hoverEffect:      'darken',
                showProductCount: false,
                animation: { entrance: 'stagger', stagger: true },
                cardStyle: {
                  variant:       'elegant',
                  borderRadius:  'none',
                  borderWidth:   '1',
                  shadow:        'none',
                  titlePosition: 'overlay',
                },
                header: {
                  title: {
                    textAlign:     'left',
                    fontFamily:    'inherit',
                    fontSize:      '2xl',
                    fontWeight:    'light',
                    fontStyle:     'italic',
                    textTransform: 'none',
                  },
                  subtitle: {
                    textAlign:  'left',
                    fontFamily: 'inherit',
                    fontSize:   'xs',
                    fontStyle:  'normal',
                  },
                },
              },
              style: {
                colors:  { background: '#111111', text: 'primary', accent: 'accent' },
                spacing: { paddingY: '16', container: 'contained', gap: '3' },
                typography: { titleSize: '2xl', textAlign: 'left' },
              },
              classes: {},
            },
          },

          // ── 7. PRODUCT GRID — HORLOGERIE · source: featured · 3 col · cardVariant: dark
          {
            id: 'sect-products-watches',
            type: 'productGrid',
            order: 7,
            props: {
              content: {
                eyebrowText:     'Haute Horlogerie',
                title:           "Mouvements d'exception",
                subtitle:        "Chaque pièce renferme des années de maîtrise",
                showEyebrowText: true,
                showTitle:       true,
                showSubtitle:    true,
                filters:         { enabled: true },
                viewAllButton:   { text: "Toute l'horlogerie", href: '/produits' },
                products: [
                  { id: 'w1', name: 'Montre Perpétuelle I',   price: 42000, image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500&h=650&fit=crop', badge: 'Éd. limitée',  rating: 4.9, href: '/produit' },
                  { id: 'w2', name: 'Montre Solaire II',      price: 28000, image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&h=650&fit=crop', badge: 'Signature',   rating: 4.8, href: '/produit' },
                  { id: 'w3', name: 'Chronographe Nocturne',  price: 19500, image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=500&h=650&fit=crop', badge: null,           rating: 4.7, href: '/produit' },
                ],
              },
              config: {
                cardVariant:           'dark',
                variant:               'grid-3',
                columns:               '3',
                dynamicSource:         'featured',
                showViewAllButton:     true,
                viewAllButtonPosition: 'header-right',
                viewAllButtonStyle:    'text',
                showQuickView:         true,
                showWishlist:          true,
                loadMore:              'none',
                productsPerPage:       3,
                titleAlignment:        'left',
                header: {
                  eyebrow:  { fontFamily: 'inherit', fontSize: 'xs',  fontWeight: 'medium',  textTransform: 'uppercase' },
                  title:    { textAlign: 'left', fontFamily: 'inherit', fontSize: '4xl', fontWeight: 'light', fontStyle: 'normal', textTransform: 'none' },
                  subtitle: { textAlign: 'left', fontFamily: 'inherit', fontSize: 'sm',  fontStyle: 'normal' },
                },
              },
              cardConfig: {
                image:     { aspectRatio: '3/4', hoverEffect: 'zoom', hoverScale: 1.06, objectFit: 'cover' },
                info:      { alignment: 'left', showRating: false, showPrice: true, showBadge: true },
                badge:     { position: 'top-left', style: 'rectangle' },
                quickView: true,
                wishlist:  true,
                addToCart: { show: true, style: 'ghost', position: 'overlay', size: 'md', text: 'Réserver' },
                style:     { variant: 'dark', borderRadius: 'none', shadow: 'none' },
              },
              style: {
                colors:  { background: '#111111', text: '#f5f0e8', accent: '#d4a853' },
                spacing: { paddingY: '20', container: 'contained', gap: '10' },
              },
            },
          },

          // ── 8. BANNER — Pièce signature sur fond doré
          {
            id: 'sect-banner',
            type: 'banner',
            order: 8,
            props: {
              content: {
                title:    'La Montre\nPerpétuelle II',
                subtitle: 'Nouvelle complication annuelle · Seulement 12 exemplaires',
                image:    'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=900&h=700&fit=crop',
                ctaText:  'Réserver la pièce',
                ctaLink:  '/produits',
                showTitle:    true,
                showSubtitle: true,
                showImage:    true,
                showCta:      true,
              },
              config: {
                variant:       'luxury',
                imagePosition: 'right',
                contentWidth:  'medium',
                header: {
                  title: {
                    fontFamily:    'playfair',
                    fontSize:      '5xl',
                    fontWeight:    'light',
                    fontStyle:     'normal',
                    textAlign:     'left',
                    textTransform: 'none',
                  },
                  subtitle: { fontFamily: '', fontSize: 'lg', fontStyle: 'italic' },
                },
                cardStyle: { variant: 'standard', borderRadius: 'none', shadow: 'none' },
                cta:  { style: 'solid', size: 'lg', icon: 'arrow-right', showIcon: true, position: 'inline' },
                image: { aspectRatio: '4/3', hoverEffect: 'zoom', hoverScale: 1.04, objectFit: 'cover', borderRadius: 'none' },
                animation: { entrance: 'fade-in', duration: 'normal' },
              },
              style: {
                colors:  { background: '#d4a853', text: '#0a0a0a', accent: '#0a0a0a' },
                spacing: { paddingY: '20', container: 'contained' },
              },
              classes: {},
            },
          },

          // ── 9. PRODUCT GRID — RECOMMANDÉS · source: recommended · 4 col · cardVariant: luxury
          {
            id: 'sect-products-recommended',
            type: 'productGrid',
            order: 9,
            props: {
              content: {
                eyebrowText:     'Sélection de la Maison',
                title:           'Nos recommandations',
                subtitle:        'Pièces choisies par nos maîtres artisans',
                showEyebrowText: true,
                showTitle:       true,
                showSubtitle:    true,
                filters:         { enabled: true },
                viewAllButton:   { text: 'Toutes les créations', href: '/produits' },
                products: [
                  { id: 'r1', name: 'Parure Impériale',    price: 32000, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=650&fit=crop', badge: 'Exclusif', rating: 5.0, href: '/produit' },
                  { id: 'r2', name: 'Bague Soleil Noir',   price: 14500, image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=500&h=650&fit=crop', badge: null,      rating: 4.8, href: '/produit' },
                  { id: 'r3', name: 'Collier Aurore',      price: 11200, image: 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=500&h=650&fit=crop', badge: null,      rating: 4.7, href: '/produit' },
                  { id: 'r4', name: 'Bracelet Oréa Gold',  price: 9600,  image: 'https://images.unsplash.com/photo-1573408301185-9519f94815b2?w=500&h=650&fit=crop', badge: null,      rating: 4.9, href: '/produit' },
                ],
              },
              config: {
                cardVariant:           'luxury',
                variant:               'grid-4',
                columns:               '4',
                dynamicSource:         'recommended',
                showViewAllButton:     true,
                viewAllButtonPosition: 'footer',
                viewAllButtonStyle:    'solid',
                showQuickView:         true,
                showWishlist:          true,
                loadMore:              'button',
                productsPerPage:       4,
                titleAlignment:        'left',
                header: {
                  eyebrow:  { fontFamily: 'inherit', fontSize: 'xs',  fontWeight: 'medium',  textTransform: 'uppercase' },
                  title:    { textAlign: 'left', fontFamily: 'inherit', fontSize: '4xl', fontWeight: 'light', fontStyle: 'normal', textTransform: 'none' },
                  subtitle: { textAlign: 'left', fontFamily: 'inherit', fontSize: 'sm',  fontStyle: 'normal' },
                },
              },
              cardConfig: {
                image:     { aspectRatio: '3/4', hoverEffect: 'swap', hoverScale: 1.05, objectFit: 'cover' },
                info:      { alignment: 'left', showRating: false, showPrice: true, showBadge: true },
                badge:     { position: 'top-left', style: 'pill' },
                quickView: true,
                wishlist:  true,
                addToCart: { show: true, style: 'solid', position: 'bottom', size: 'md', text: 'Acquérir' },
                style:     { variant: 'luxury', borderRadius: 'none', shadow: 'lg' },
              },
              style: {
                colors:  { background: '#0a0a0a', text: '#f5f0e8', accent: '#d4a853' },
                spacing: { paddingY: '20', container: 'contained', gap: '6' },
              },
            },
          },

          // ── 10. EDITORIAL — Gravure & personnalisation
          {
            id: 'sect-editorial-2',
            type: 'editorial',
            order: 10,
            props: {
              layout:  'image-right',
              image:   'https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=900&h=1100&fit=crop',
              eyebrow: 'Gravure & Personnalisation',
              title:   "Une pièce\ncréée pour\nvous seul",
              body:    "Chaque création peut être gravée, modifiée, adaptée. Nos artisans travaillent avec vous de l'esquisse à la livraison pour concevoir la pièce qui vous ressemble — un héritage que vous transmettrez.",
              ctaText: 'Lancer ma création',
              ctaLink: '/produits',
              ctaStyle: 'underline',
              imageAspectRatio: '3/4',
              styles: {
                backgroundColor:      '#0a0a0a',
                textColor:            '#f5f0e8',
                accentColor:          '#d4a853',
                eyebrowColor:         '#d4a853',
                eyebrowLetterSpacing: '0.28em',
                titleFontFamily:      "'Didot', 'Bodoni MT', serif",
                titleFontSize:        54,
                bodyFontFamily:       "'Didot', 'Bodoni MT', serif",
                bodyColor:            '#9a948e',
                paddingY:             150,
              },
            },
          },

          // ── 11. PRODUCT GRID — LES PLUS VUS · source: most_viewed · carousel · cardVariant: glass
          {
            id: 'sect-products-viewed',
            type: 'productGrid',
            order: 11,
            props: {
              content: {
                eyebrowText:     'Tendances',
                title:           'Les plus regardées',
                subtitle:        'Pièces qui fascinent notre clientèle en ce moment',
                showEyebrowText: true,
                showTitle:       true,
                showSubtitle:    true,
                filters:         { enabled: false },
                viewAllButton:   { text: 'Explorer', href: '/produits' },
                products: [
                  { id: 'v1', name: 'Bague Constellation',   price: 18500,            image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&h=650&fit=crop', badge: 'Tendance', rating: 5.0, href: '/produit' },
                  { id: 'v2', name: 'Montre Perpétuelle I',  price: 42000,            image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500&h=650&fit=crop', badge: 'Tendance', rating: 4.9, href: '/produit' },
                  { id: 'v3', name: 'Collier Lumière',       price: 9800, oldPrice: 12000, image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&h=650&fit=crop', badge: '-18%',  rating: 4.8, href: '/produit' },
                  { id: 'v4', name: 'Parure Impériale',      price: 32000,            image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=650&fit=crop', badge: null,       rating: 5.0, href: '/produit' },
                  { id: 'v5', name: 'Pendentif Étoile',      price: 5400,             image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=500&h=650&fit=crop', badge: null,       rating: 4.7, href: '/produit' },
                ],
              },
              config: {
                cardVariant:           'glass',
                variant:               'carousel',
                columns:               '4',
                dynamicSource:         'most_viewed',
                showViewAllButton:     true,
                viewAllButtonPosition: 'header-right',
                viewAllButtonStyle:    'text',
                showQuickView:         true,
                showWishlist:          true,
                loadMore:              'none',
                productsPerPage:       5,
                titleAlignment:        'left',
                header: {
                  eyebrow:  { fontFamily: 'inherit', fontSize: 'xs',  fontWeight: 'medium',  textTransform: 'uppercase' },
                  title:    { textAlign: 'left', fontFamily: 'inherit', fontSize: '4xl', fontWeight: 'light', fontStyle: 'normal', textTransform: 'none' },
                  subtitle: { textAlign: 'left', fontFamily: 'inherit', fontSize: 'sm',  fontStyle: 'normal' },
                },
              },
              cardConfig: {
                image:     { aspectRatio: '3/4', hoverEffect: 'zoom', hoverScale: 1.06, objectFit: 'cover' },
                info:      { alignment: 'left', showRating: false, showPrice: true, showBadge: true },
                badge:     { position: 'top-right', style: 'pill' },
                quickView: true,
                wishlist:  true,
                addToCart: { show: false, style: 'ghost', position: 'overlay', size: 'sm', text: 'Voir' },
                style:     { variant: 'glass', borderRadius: 'none', shadow: 'none' },
              },
              style: {
                colors:  { background: '#111111', text: '#f5f0e8', accent: '#d4a853' },
                spacing: { paddingY: '20', container: 'contained', gap: '6' },
              },
            },
          },

          // ── 12. TRUST BADGES
          {
            id: 'sect-trust',
            type: 'trustBadges',
            order: 12,
            props: {
              layout:  'row',
              divider: true,
              badges: [
                { icon: 'Shield',    title: "Certificat d'authenticité", description: 'Chaque pièce livrée avec son certificat gemmologique' },
                { icon: 'Gem',       title: 'Pierres certifiées GIA',    description: 'Origine tracée, conflict-free, éthiquement sourcées' },
                { icon: 'Package',   title: 'Livraison sécurisée',       description: 'Transport assuré, signature obligatoire, écrin inclus' },
                { icon: 'RefreshCw', title: 'Garantie à vie',            description: 'Entretien, polissage et rhodiage offerts pour toujours' },
              ],
              styles: {
                backgroundColor:    '#111111',
                textColor:          '#f5f0e8',
                accentColor:        '#d4a853',
                iconColor:          '#d4a853',
                dividerColor:       '#2a2a2a',
                titleFontFamily:    "'Didot', 'Bodoni MT', serif",
                titleLetterSpacing: '0.1em',
                iconSize:           22,
                paddingY:           80,
              },
            },
          },

          // ── 13. TESTIMONIALS
          {
            id: 'sect-testimonials',
            type: 'testimonials',
            order: 13,
            visible: true,
            props: {
              layout: 'single-quote',
              title:  null,
              testimonials: [
                { name: 'S.A.R. la Princesse D.', role: 'Cliente depuis 2008',         content: "Il n'existe pas d'autre maison qui comprenne aussi finement ce que signifie porter un bijou. C'est une relation, pas une transaction.", rating: 5 },
                { name: 'Mme C. Hoffmann',         role: 'Collectionneuse — Genève',    content: "La montre qu'ils m'ont créée est devenue le centre de ma collection. Une pièce qui parle autant à l'œil qu'à l'intellect.", rating: 5 },
                { name: 'M. A. Al-Rashid',         role: 'Investisseur — Dubaï',        content: "Chaque pièce Noir & Lumière que j'ai acquise a pris de la valeur. Ce n'est pas un achat — c'est un placement dans la beauté.", rating: 5 },
              ],
              autoPlay: true,
              interval: 9000,
              styles: {
                backgroundColor:   '#080808',
                textColor:         '#f5f0e8',
                accentColor:       '#d4a853',
                quoteFontFamily:   "'Didot', 'Bodoni MT', serif",
                quoteFontSize:     30,
                quoteStyle:        'italic',
                metaFontFamily:    "'Didot', 'Bodoni MT', serif",
                metaLetterSpacing: '0.18em',
                paddingY:          140,
              },
            },
          },

          // ── 14. NEWSLETTER
          {
            id: 'sect-newsletter',
            type: 'newsletter',
            order: 14,
            props: {
              eyebrow:             'Correspondance Privée',
              title:               "Entrez dans l'atelier",
              subtitle:            'Nouvelles créations, éditions limitées et invitations exclusives.',
              buttonText:          "S'inscrire",
              placeholder:         'Votre adresse e-mail',
              buttonStyle:         'filled-accent',
              showPrivacyCheckbox: true,
              privacyText:         "J'accepte de recevoir les communications privées de la Maison.",
              layout:              'centered-minimal',
              styles: {
                backgroundColor:      '#0d0d0d',
                textColor:            '#f5f0e8',
                accentColor:          '#d4a853',
                eyebrowColor:         '#d4a853',
                eyebrowLetterSpacing: '0.3em',
                titleFontFamily:      "'Didot', 'Bodoni MT', serif",
                titleFontSize:        44,
                inputBorder:          '#2a2a2a',
                inputBackground:      '#161616',
                paddingY:             130,
              },
            },
          },
        ],
      },

      // ════════════════════════════════════════════════════════════
      // PAGE PRODUIT
      // ════════════════════════════════════════════════════════════
      {
        id: 'page-product',
        name: 'Produit',
        slug: '/produit',
        isHome: false,
        meta: { title: 'Bague Constellation — NOIR & LUMIÈRE', description: "Or 18K, diamants D-IF. Pièce exclusive numérotée." },
        sections: [
          {
            id: 'sect-breadcrumb',
            type: 'breadcrumb',
            order: 0,
            props: {
              showHome: true, separator: 'slash',
              items: [{ label: 'Accueil', link: '/' }, { label: 'Joaillerie', link: '/produits' }, { label: 'Bagues', link: '/produits' }],
              styles: { backgroundColor: '#0a0a0a', textColor: '#5a5550', activeColor: '#f5f0e8', fontFamily: "'Didot', 'Bodoni MT', serif", fontSize: 11, letterSpacing: '0.12em', paddingY: 22, borderBottom: '#1e1e1e' },
            },
          },
          {
            id: 'sect-product-detail',
            type: 'productDetailContent',
            order: 1,
            props: {
              product: {
                id: '1', name: 'Bague Constellation', collection: 'Joaillerie · Haute Création 2026',
                price: 18500, rating: 5.0, reviewCount: 8,
                description: "Bague solitaire en or blanc 18 carats sertie de cinquante-deux diamants taille brillant, qualité D-IF. Diamant central de 2,1 carats, certifié GIA. Chaque exemplaire est numéroté et livré avec son certificat d'authenticité et son coffret en bois précieux.",
                care: 'Éviter le contact avec les produits chimiques · Nettoyage ultrasonique conseillé',
                image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=700&h=900&fit=crop',
                gallery: [
                  'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=700&h=900&fit=crop',
                  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=700&h=900&fit=crop',
                  'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=700&h=900&fit=crop',
                ],
                badge: 'Exclusive — Pièce 03/12', sku: 'NL-JOA-CON-26-003', inStock: true,
                sizes: ['47', '48', '49', '50', '51', '52', 'Sur mesure'],
                colors: [{ name: 'Or blanc', hex: '#e8e4d9' }, { name: 'Or jaune', hex: '#d4a853' }, { name: 'Or rose', hex: '#c9836b' }],
              },
              showReviews: true, showRelatedProducts: true, showSizeGuide: true, showShippingInfo: true,
              styles: { backgroundColor: '#0a0a0a', textColor: '#f5f0e8', accentColor: '#d4a853', secondaryText: '#7a7570', titleFontFamily: "'Didot', 'Bodoni MT', serif", titleFontSize: 42, bodyFontFamily: "'Didot', 'Bodoni MT', serif", priceFontSize: 30, paddingY: 110 },
            },
          },
          {
            id: 'sect-product-reviews',
            type: 'productReviews',
            order: 2,
            props: {
              content: { productId: '', title: 'Avis clients', subtitle: 'Retours vérifiés de notre clientèle.', formTitle: 'Partager votre expérience', formSubtitle: 'Votre retour aide les prochains acquéreurs.', loginTitle: 'Connexion requise', loginSubtitle: 'Identifiez-vous pour laisser un avis.', loginButtonLabel: 'Se connecter', emptyTitle: 'Soyez le premier à partager', emptySubtitle: 'Aucun avis pour le moment sur cette création.', ratingLabel: 'Votre appréciation', commentLabel: 'Votre avis', commentPlaceholder: 'Décrivez la pièce, sa finition, son rendu porté...', submitLabel: 'Publier' },
              config: { showSummary: true, showForm: true, showVerifiedBadge: true, showAvatars: false, layout: 'split', maxReviews: 6 },
              styles: { backgroundColor: '#111111', textColor: '#f5f0e8', accentColor: '#d4a853', cardBg: '#1a1a1a', borderColor: '#2a2a2a', paddingY: 100 },
            },
          },
          // Produits liés — source: recently_ordered
          {
            id: 'sect-related-products',
            type: 'productGrid',
            order: 3,
            props: {
              content: {
                eyebrowText: 'Vous pourriez aimer', title: 'Pièces similaires', subtitle: null,
                showEyebrowText: true, showTitle: true, showSubtitle: false,
                filters: { enabled: false },
                viewAllButton: { text: 'Voir plus', href: '/produits' },
                products: [
                  { id: 'rl1', name: 'Bague Lumière',    price: 12400, image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=500&h=650&fit=crop', badge: null, rating: 4.8, href: '/produit' },
                  { id: 'rl2', name: 'Parure Impériale', price: 32000, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=650&fit=crop', badge: null, rating: 5.0, href: '/produit' },
                  { id: 'rl3', name: 'Bracelet Oréa',   price: 7200,  image: 'https://images.unsplash.com/photo-1573408301185-9519f94815b2?w=500&h=650&fit=crop', badge: null, rating: 4.9, href: '/produit' },
                  { id: 'rl4', name: 'Pendentif Étoile', price: 5400, image: 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=500&h=650&fit=crop', badge: null, rating: 4.7, href: '/produit' },
                ],
              },
              config: {
                cardVariant: 'minimal', variant: 'grid-4', columns: '4', dynamicSource: 'recently_ordered',
                showViewAllButton: false, showQuickView: true, showWishlist: true, loadMore: 'none', productsPerPage: 4, titleAlignment: 'left',
                header: { eyebrow: { fontFamily: 'inherit', fontSize: 'xs', fontWeight: 'medium', textTransform: 'uppercase' }, title: { textAlign: 'left', fontFamily: 'inherit', fontSize: '3xl', fontWeight: 'light', fontStyle: 'normal', textTransform: 'none' }, subtitle: { textAlign: 'left', fontFamily: 'inherit', fontSize: 'sm', fontStyle: 'normal' } },
              },
              cardConfig: {
                image: { aspectRatio: '3/4', hoverEffect: 'zoom', hoverScale: 1.05, objectFit: 'cover' },
                info: { alignment: 'left', showRating: false, showPrice: true, showBadge: false },
                badge: { position: 'top-left', style: 'pill' }, quickView: true, wishlist: true,
                addToCart: { show: false, style: 'ghost', position: 'overlay', size: 'sm', text: 'Voir' },
                style: { variant: 'minimal', borderRadius: 'none', shadow: 'none' },
              },
              style: { colors: { background: '#0a0a0a', text: '#f5f0e8', accent: '#d4a853' }, spacing: { paddingY: '16', container: 'contained', gap: '6' } },
            },
          },
        ],
      },

      // ════════════════════════════════════════════════════════════
      // PAGE PRODUITS (listing)
      // ════════════════════════════════════════════════════════════
      {
        id: 'page-products',
        name: 'Produits',
        slug: '/produits',
        isHome: false,
        meta: { title: 'Collections — NOIR & LUMIÈRE', description: "Joaillerie et haute horlogerie d'exception." },
        sections: [
          {
            id: 'sect-collection-hero', type: 'collectionHero', order: 0,
            props: {
              title: 'Joaillerie', subtitle: 'Haute Création · 2026',
              image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&h=600&fit=crop',
              overlayOpacity: 0.55,
              styles: { backgroundColor: '#0a0a0a', textColor: '#f5f0e8', titleFontFamily: "'Didot', 'Bodoni MT', serif", titleFontSize: 80, subtitleLetterSpacing: '0.25em', paddingY: 120, minHeight: 440 },
            },
          },
          {
            id: 'sect-product-grid', type: 'productsContent', order: 1,
            props: {
              title: null, columns: 3, showFilters: true, filterStyle: 'minimal-tabs', cardStyle: 'minimal', showRating: false,
              products: [
                { id: '1', name: 'Bague Constellation',   price: 18500,            image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&h=650&fit=crop', badge: 'Exclusive',    material: 'Or 18K, diamants D-IF' },
                { id: '2', name: 'Montre Perpétuelle I',  price: 42000,            image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500&h=650&fit=crop', badge: 'Éd. limitée', material: 'Titane, saphirs bleus' },
                { id: '3', name: 'Collier Lumière',       price: 9800, oldPrice: 12000, image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&h=650&fit=crop', badge: '-18%',   material: 'Or blanc 18K, rubis' },
                { id: '4', name: 'Bracelet Oréa',         price: 7200,            image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=650&fit=crop',                         material: 'Or jaune, émeraudes' },
                { id: '5', name: 'Pendentif Étoile',      price: 5400,            image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=500&h=650&fit=crop', badge: 'Nouveau',      material: 'Or rose, diamants' },
                { id: '6', name: 'Parure Impériale',      price: 32000,           image: 'https://images.unsplash.com/photo-1573408301185-9519f94815b2?w=500&h=650&fit=crop',                         material: 'Or 18K, saphirs & diamants' },
                { id: '7', name: 'Boucles Aurore',        price: 4200,            image: 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=500&h=650&fit=crop',                         material: 'Or blanc, perles Akoya' },
                { id: '8', name: 'Montre Solaire II',     price: 28000,           image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&h=650&fit=crop', badge: 'Signature',    material: 'Or rose, cadran onyx' },
                { id: '9', name: 'Chronographe Nocturne', price: 19500,           image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=500&h=650&fit=crop',                         material: 'Acier & titane' },
              ],
              styles: { backgroundColor: '#0a0a0a', textColor: '#f5f0e8', accentColor: '#d4a853', secondaryTextColor: '#7a7570', nameFontFamily: "'Didot', 'Bodoni MT', serif", priceFontFamily: "'Didot', 'Bodoni MT', serif", paddingY: 110, columnGap: 36 },
            },
          },
        ],
      },

      // ════════════════════════════════════════════════════════════
      // PAGE PANIER
      // ════════════════════════════════════════════════════════════
      {
        id: 'page-cart',
        name: 'Panier',
        slug: '/panier',
        isHome: false,
        meta: { title: 'Votre sélection — NOIR & LUMIÈRE', description: 'Finalisez votre acquisition' },
        sections: [
          {
            id: 'sect-cart', type: 'cart', order: 0,
            props: {
              title: 'Votre sélection', emptyMessage: 'Votre panier est vide.', emptyCtaText: 'Explorer les créations', emptyCtaLink: '/produits', showCouponField: false,
              cartItems: [
                { id: '1', name: 'Bague Constellation', price: 18500, quantity: 1, image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200&h=260&fit=crop', size: '50', color: 'Or blanc' },
                { id: '2', name: 'Bracelet Oréa',       price: 7200,  quantity: 1, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200&h=260&fit=crop', color: 'Or jaune' },
              ],
              styles: { backgroundColor: '#0a0a0a', textColor: '#f5f0e8', accentColor: '#d4a853', secondaryText: '#7a7570', borderColor: '#2a2a2a', titleFontFamily: "'Didot', 'Bodoni MT', serif", titleFontSize: 38, paddingY: 110 },
            },
          },
          // Suggestions panier — source: for_you
          {
            id: 'sect-cart-suggestions', type: 'productGrid', order: 1,
            props: {
              content: {
                eyebrowText: 'Pour compléter votre sélection', title: 'Vous aimerez aussi', subtitle: null,
                showEyebrowText: true, showTitle: true, showSubtitle: false,
                filters: { enabled: false }, viewAllButton: { text: 'Explorer', href: '/produits' },
                products: [
                  { id: 'cs1', name: 'Pendentif Étoile', price: 5400, image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=500&h=650&fit=crop', badge: null, rating: 4.7, href: '/produit' },
                  { id: 'cs2', name: 'Boucles Aurore',   price: 4200, image: 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=500&h=650&fit=crop', badge: null, rating: 4.8, href: '/produit' },
                  { id: 'cs3', name: 'Collier Lumière',  price: 9800, image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&h=650&fit=crop', badge: null, rating: 4.8, href: '/produit' },
                  { id: 'cs4', name: 'Bracelet Céleste', price: 8900, image: 'https://images.unsplash.com/photo-1573408301185-9519f94815b2?w=500&h=650&fit=crop', badge: null, rating: 4.9, href: '/produit' },
                ],
              },
              config: {
                cardVariant: 'minimal', variant: 'grid-4', columns: '4', dynamicSource: 'for_you',
                showViewAllButton: false, showQuickView: false, showWishlist: true, loadMore: 'none', productsPerPage: 4, titleAlignment: 'left',
                header: { eyebrow: { fontFamily: 'inherit', fontSize: 'xs', fontWeight: 'medium', textTransform: 'uppercase' }, title: { textAlign: 'left', fontFamily: 'inherit', fontSize: '3xl', fontWeight: 'light', fontStyle: 'normal', textTransform: 'none' }, subtitle: { textAlign: 'left', fontFamily: 'inherit', fontSize: 'sm', fontStyle: 'normal' } },
              },
              cardConfig: {
                image: { aspectRatio: '3/4', hoverEffect: 'zoom', hoverScale: 1.05, objectFit: 'cover' },
                info: { alignment: 'left', showRating: false, showPrice: true, showBadge: false },
                badge: { position: 'top-left', style: 'pill' }, quickView: false, wishlist: true,
                addToCart: { show: true, style: 'outline', position: 'bottom', size: 'sm', text: 'Ajouter' },
                style: { variant: 'minimal', borderRadius: 'none', shadow: 'none' },
              },
              style: { colors: { background: '#111111', text: '#f5f0e8', accent: '#d4a853' }, spacing: { paddingY: '16', container: 'contained', gap: '6' } },
            },
          },
        ],
      },

      // ════════════════════════════════════════════════════════════
      // PAGE FAVORIS
      // ════════════════════════════════════════════════════════════
      {
        id: 'page-wishlist',
        name: 'Favoris',
        slug: '/favoris',
        isHome: false,
        meta: { title: 'Mes favoris — NOIR & LUMIÈRE', description: 'Vos pièces sauvegardées' },
        sections: [
          {
            id: 'sect-wishlist', type: 'wishlistContent', order: 0,
            props: {
              title: 'Mes favoris', emptyMessage: 'Aucune pièce sauvegardée.', emptyCtaText: 'Explorer les collections', emptyCtaLink: '/produits',
              styles: { backgroundColor: '#0a0a0a', textColor: '#f5f0e8', accentColor: '#d4a853', titleFontFamily: "'Didot', 'Bodoni MT', serif", titleFontSize: 38, paddingY: 110 },
            },
          },
          // Suggestions favoris — source: random
          {
            id: 'sect-wishlist-suggestions', type: 'productGrid', order: 1,
            props: {
              content: {
                eyebrowText: 'Découvertes', title: 'Pièces à explorer', subtitle: null,
                showEyebrowText: true, showTitle: true, showSubtitle: false,
                filters: { enabled: false }, viewAllButton: { text: 'Tout voir', href: '/produits' },
                products: [
                  { id: 'ws1', name: 'Montre Perpétuelle I', price: 42000, image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500&h=650&fit=crop', badge: null, rating: 4.9, href: '/produit' },
                  { id: 'ws2', name: 'Bague Constellation',  price: 18500, image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&h=650&fit=crop', badge: null, rating: 5.0, href: '/produit' },
                  { id: 'ws3', name: 'Parure Impériale',     price: 32000, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=650&fit=crop', badge: null, rating: 5.0, href: '/produit' },
                  { id: 'ws4', name: 'Collier Lumière',      price: 9800,  image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&h=650&fit=crop', badge: null, rating: 4.8, href: '/produit' },
                ],
              },
              config: {
                cardVariant: 'minimal', variant: 'grid-4', columns: '4', dynamicSource: 'random',
                showViewAllButton: true, viewAllButtonPosition: 'footer', viewAllButtonStyle: 'text',
                showQuickView: true, showWishlist: true, loadMore: 'none', productsPerPage: 4, titleAlignment: 'left',
                header: { eyebrow: { fontFamily: 'inherit', fontSize: 'xs', fontWeight: 'medium', textTransform: 'uppercase' }, title: { textAlign: 'left', fontFamily: 'inherit', fontSize: '3xl', fontWeight: 'light', fontStyle: 'normal', textTransform: 'none' }, subtitle: { textAlign: 'left', fontFamily: 'inherit', fontSize: 'sm', fontStyle: 'normal' } },
              },
              cardConfig: {
                image: { aspectRatio: '3/4', hoverEffect: 'zoom', hoverScale: 1.05, objectFit: 'cover' },
                info: { alignment: 'left', showRating: false, showPrice: true, showBadge: false },
                badge: { position: 'top-left', style: 'pill' }, quickView: true, wishlist: true,
                addToCart: { show: true, style: 'outline', position: 'bottom', size: 'sm', text: 'Ajouter' },
                style: { variant: 'minimal', borderRadius: 'none', shadow: 'none' },
              },
              style: { colors: { background: '#0a0a0a', text: '#f5f0e8', accent: '#d4a853' }, spacing: { paddingY: '16', container: 'contained', gap: '6' } },
            },
          },
        ],
      },

      // ════════════════════════════════════════════════════════════
      // PAGE MON COMPTE
      // ════════════════════════════════════════════════════════════
      {
        id: 'page-account',
        name: 'Mon Compte',
        slug: '/compte',
        isHome: false,
        meta: { title: 'Mon espace — NOIR & LUMIÈRE', description: 'Gérez vos commandes et informations' },
        sections: [
          {
            id: 'sect-account', type: 'accountContent', order: 0,
            props: {
              title: 'Mon espace', subtitle: null,
              user: { firstName: 'Alexandre', lastName: 'von Richter', email: 'a.vonrichter@example.com', phone: '+41 78 123 45 67', memberSince: '2017', tier: 'Client Maison' },
              styles: { backgroundColor: '#0a0a0a', textColor: '#f5f0e8', accentColor: '#d4a853', cardBackground: '#111111', borderColor: '#2a2a2a', titleFontFamily: "'Didot', 'Bodoni MT', serif", titleFontSize: 38, paddingY: 110 },
            },
          },
          // Sélection personnalisée compte — source: most_demanded
          {
            id: 'sect-account-picks', type: 'productGrid', order: 1,
            props: {
              content: {
                eyebrowText: 'Spécialement pour vous', title: 'Sélection personnalisée', subtitle: null,
                showEyebrowText: true, showTitle: true, showSubtitle: false,
                filters: { enabled: false }, viewAllButton: { text: 'Explorer', href: '/produits' },
                products: [
                  { id: 'ap1', name: 'Bague Constellation', price: 18500, image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&h=650&fit=crop', badge: null, rating: 5.0, href: '/produit' },
                  { id: 'ap2', name: 'Montre Solaire II',   price: 28000, image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&h=650&fit=crop', badge: null, rating: 4.8, href: '/produit' },
                  { id: 'ap3', name: 'Collier Lumière',     price: 9800,  image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&h=650&fit=crop', badge: null, rating: 4.8, href: '/produit' },
                  { id: 'ap4', name: 'Bracelet Oréa',       price: 7200,  image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=650&fit=crop', badge: null, rating: 4.9, href: '/produit' },
                ],
              },
              config: {
                cardVariant: 'minimal', variant: 'grid-4', columns: '4', dynamicSource: 'most_demanded',
                showViewAllButton: true, viewAllButtonPosition: 'header-right', viewAllButtonStyle: 'text',
                showQuickView: true, showWishlist: true, loadMore: 'none', productsPerPage: 4, titleAlignment: 'left',
                header: { eyebrow: { fontFamily: 'inherit', fontSize: 'xs', fontWeight: 'medium', textTransform: 'uppercase' }, title: { textAlign: 'left', fontFamily: 'inherit', fontSize: '3xl', fontWeight: 'light', fontStyle: 'normal', textTransform: 'none' }, subtitle: { textAlign: 'left', fontFamily: 'inherit', fontSize: 'sm', fontStyle: 'normal' } },
              },
              cardConfig: {
                image: { aspectRatio: '3/4', hoverEffect: 'zoom', hoverScale: 1.05, objectFit: 'cover' },
                info: { alignment: 'left', showRating: false, showPrice: true, showBadge: false },
                badge: { position: 'top-left', style: 'pill' }, quickView: true, wishlist: true,
                addToCart: { show: true, style: 'outline', position: 'bottom', size: 'sm', text: 'Acquérir' },
                style: { variant: 'minimal', borderRadius: 'none', shadow: 'none' },
              },
              style: { colors: { background: '#111111', text: '#f5f0e8', accent: '#d4a853' }, spacing: { paddingY: '16', container: 'contained', gap: '6' } },
            },
          },
        ],
      },

      // ════════════════════════════════════════════════════════════
      // PAGES CHECKOUT / CONFIRMATION / COMMANDE / CONNEXION / INSCRIPTION
      // ════════════════════════════════════════════════════════════
      {
        id: 'page-checkout', name: 'Checkout', slug: '/checkout', isHome: false,
        meta: { title: 'Acquisition — NOIR & LUMIÈRE', description: 'Finalisez votre acquisition' },
        sections: [{
          id: 'sect-checkout', type: 'checkoutContent', order: 0,
          props: {
            title: "Finaliser l'acquisition", showSteps: true, steps: 'Livraison\nPaiement\nConfirmation',
            styles: { backgroundColor: '#0a0a0a', textColor: '#f5f0e8', accentColor: '#d4a853', stepActiveColor: '#d4a853', stepDoneColor: '#d4a853', borderColor: '#2a2a2a', titleFontFamily: "'Didot', 'Bodoni MT', serif", titleFontSize: 34, paddingY: 110 },
          },
        }],
      },
      {
        id: 'page-confirmation', name: 'Confirmation', slug: '/confirmation', isHome: false,
        meta: { title: 'Acquisition confirmée — NOIR & LUMIÈRE', description: 'Votre acquisition a été validée' },
        sections: [{
          id: 'sect-confirmation', type: 'orderConfirmationContent', order: 0,
          props: {
            title: 'Acquisition confirmée', subtitle: "Un e-mail de confirmation vous a été envoyé. Votre pièce sera préparée sous 5 jours ouvrés.",
            showOrderDetails: true, showTracking: true, icon: 'check-thin',
            styles: { backgroundColor: '#0a0a0a', textColor: '#f5f0e8', accentColor: '#d4a853', paddingY: 110 },
          },
        }],
      },
      {
        id: 'page-order-detail', name: 'Détails de commande', slug: '/commande', isHome: false,
        meta: { title: 'Détails — NOIR & LUMIÈRE', description: 'Détails de votre commande' },
        sections: [{ id: 'sect-order-detail', type: 'orderDetail', order: 0, props: { styles: { paddingY: 110 } } }],
      },
      {
        id: 'page-login', name: 'Connexion', slug: '/connexion', isHome: false,
        meta: { title: 'Accès — NOIR & LUMIÈRE', description: 'Accédez à votre espace privé' },
        sections: [{
          id: 'sect-login', type: 'login', order: 0,
          props: {
            title: 'Votre espace', subtitle: 'Identifiez-vous pour accéder à vos acquisitions et privilèges',
            showEmail: true, showPassword: true, showRememberMe: true, showForgotPassword: true, showSocialLogin: false,
            registerLink: '/inscription', layout: 'split-image',
            splitImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=900&h=1200&fit=crop',
            styles: { backgroundColor: '#0a0a0a', textColor: '#f5f0e8', accentColor: '#d4a853', inputBorder: '#2a2a2a', inputBackground: '#111111', titleFontFamily: "'Didot', 'Bodoni MT', serif", titleFontSize: 44, paddingY: 0 },
          },
        }],
      },
      {
        id: 'page-register', name: 'Inscription', slug: '/inscription', isHome: false,
        meta: { title: 'Rejoindre la Maison — NOIR & LUMIÈRE', description: 'Créez votre espace privé' },
        sections: [{
          id: 'sect-register', type: 'register', order: 0,
          props: {
            title: 'Rejoindre la Maison', subtitle: 'Accédez aux collections privées, éditions limitées et invitations.',
            showFirstName: true, showLastName: true, showEmail: true, showPhone: false,
            showPassword: true, showPasswordConfirm: true, showTerms: true, showNewsletter: true, showSocialLogin: false,
            loginLink: '/connexion', layout: 'split-image',
            splitImage: 'https://images.unsplash.com/photo-1573408301185-9519f94815b2?w=900&h=1200&fit=crop',
            styles: { backgroundColor: '#0a0a0a', textColor: '#f5f0e8', accentColor: '#d4a853', inputBorder: '#2a2a2a', inputBackground: '#111111', titleFontFamily: "'Didot', 'Bodoni MT', serif", titleFontSize: 40, paddingY: 0 },
          },
        }],
      },
    ],

    // ── Settings globaux ──────────────────────────────────────────
    settings: {
      primaryColor:    '#f5f0e8',
      secondaryColor:  '#111111',
      accentColor:     '#d4a853',
      backgroundColor: '#0a0a0a',
      textColor:       '#f5f0e8',

      fontFamily:        "'Didot', 'Bodoni MT', 'Playfair Display', Georgia, serif",
      bodyFontFamily:    "'Didot', 'Bodoni MT', serif",
      fontSize:          16,
      headingScale:      1.3,
      letterSpacingBase: '0.03em',

      borderRadius:   0,
      containerWidth: '1360px',

      transitionDuration: '600ms',
      transitionEasing:   'cubic-bezier(0.16, 1, 0.3, 1)',

      shadowSm: '0 2px 8px rgba(0,0,0,0.4)',
      shadowMd: '0 8px 24px rgba(0,0,0,0.5)',
      shadowLg: '0 24px 60px rgba(0,0,0,0.6)',
    },

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};
// --- Auto-Discovery of All Templates ---
// Automatically collects all exported Template constants
// Just export your new template and it will be included automatically

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const templateExports: Record<string, any> = {
  fashionBoutiqueTemplate,
  techStoreTemplate,
  homeLivingTemplate,
  maisonOrTemplate,
  noirLumiereTemplate,
};

// Auto-generate templates array from all Template-typed exports
export const templates: Template[] = Object.values(templateExports)
  .filter((exp): exp is Template => 
    exp && typeof exp === 'object' && 'id' in exp && 'name' in exp && 'category' in exp
  );

export const getTemplateById = (id: string): Template | undefined => {
  return templates.find((t) => t.id === id);
};

export const getTemplatesByCategory = (category: Template['category']): Template[] => {
  return templates.filter((t) => t.category === category);
};

export const templateCategories = [
  { id: 'fashion', label: 'Mode & Accessoires' },
  { id: 'electronics', label: 'High-Tech' },
  { id: 'home', label: 'Maison & Déco' },
  { id: 'beauty', label: 'Beauté & Bien-être' },
  { id: 'food', label: 'Alimentation' },
  { id: 'general', label: 'Général' },
  { id: 'luxury', label: 'Luxe' },
] as const;
