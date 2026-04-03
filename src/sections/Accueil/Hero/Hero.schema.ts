import type { SectionSchema } from "@/lib/section-registry";

export const heroSchema: SectionSchema = {
  name: "Hero Classique",
  type: "hero",
  category: "content",
  description: "Section hero traditionnelle avec slider complet",
  icon: "Image",
  settings: [
    // ============================================
    // VISIBILITÉ
    // ============================================
    {
      id: "content.showPretitle",
      type: "checkbox",
      label: "Afficher le pre-titre",
      default: true,
    },
    {
      id: "content.showTitle",
      type: "checkbox",
      label: "Afficher le titre",
      default: true,
    },
    {
      id: "content.showSubtitle",
      type: "checkbox",
      label: "Afficher le sous-titre",
      default: true,
    },
    {
      id: "content.showBody",
      type: "checkbox",
      label: "Afficher le texte body",
      default: false,
    },
    {
      id: "content.showMedia",
      type: "checkbox",
      label: "Afficher l'image/video",
      default: true,
    },
    {
      id: "content.showCTA",
      type: "checkbox",
      label: "Afficher les boutons CTA",
      default: true,
    },
    {
      id: "content.showMetrics",
      type: "checkbox",
      label: "Afficher les metriques",
      default: false,
    },

    // ============================================
    // CONTENU
    // ============================================
    {
      id: "content.pretitle.text",
      type: "text",
      label: "Pre-titre",
      default: "Collection Exclusive",
    },
    {
      id: "content.pretitle.style",
      type: "select",
      label: "Style pre-titre",
      options: [
        { value: "none", label: "Aucun" },
        { value: "line", label: "Ligne decorative" },
        { value: "pill", label: "Pill/Arrondi" },
        { value: "badge", label: "Badge" },
        { value: "uppercase", label: "MAJUSCULES" },
      ],
      default: "line",
    },
    {
      id: "content.title",
      type: "text",
      label: "Titre",
      default: "L'Art du Style Moderne",
    },
    {
      id: "content.subtitle",
      type: "textarea",
      label: "Sous-titre",
      default: "Une collection exclusive pensee pour ceux qui n'acceptent que l'excellence.",
    },
    {
      id: "content.body",
      type: "textarea",
      label: "Texte body",
      default: "",
    },
    {
      id: "content.showScrollIndicator",
      type: "checkbox",
      label: "Afficher l'indicateur de scroll",
      default: true,
    },

    // ============================================
    // MEDIA
    // ============================================
    {
      id: "content.media.type",
      type: "select",
      label: "Type de media",
      options: [
        { value: "image", label: "Image" },
        { value: "video", label: "Video" },
        { value: "carousel", label: "Carousel" },
      ],
      default: "image",
    },
    {
      id: "content.media.src",
      type: "image",
      label: "Image principale",
      default: "",
    },
    {
      id: "content.media.videoSrc",
      type: "url",
      label: "Video principale",
      default: "",
    },
    {
      id: "content.media.poster",
      type: "image",
      label: "Poster video",
      default: "",
    },
    {
      id: "content.media.parallax",
      type: "checkbox",
      label: "Parallax",
      default: true,
    },
    {
      id: "content.media.zoomOnHover",
      type: "checkbox",
      label: "Zoom au survol",
      default: false,
    },

    // ============================================
    // CTA
    // ============================================
    {
      id: "content.cta.primary.text",
      type: "text",
      label: "CTA principal — texte",
      default: "Explorer la collection",
    },
    {
      id: "content.cta.primary.href",
      type: "url",
      label: "CTA principal — lien",
      default: "/produits",
    },
    {
      id: "content.cta.primary.style",
      type: "select",
      label: "CTA principal — style",
      options: [
        { value: "solid", label: "Plein" },
        { value: "outline", label: "Contour" },
        { value: "text", label: "Texte" },
      ],
      default: "solid",
    },
    {
      id: "content.cta.secondary.text",
      type: "text",
      label: "CTA secondaire — texte",
      default: "Notre histoire",
    },
    {
      id: "content.cta.secondary.href",
      type: "url",
      label: "CTA secondaire — lien",
      default: "/a-propos",
    },
    {
      id: "content.cta.secondary.style",
      type: "select",
      label: "CTA secondaire — style",
      options: [
        { value: "solid", label: "Plein" },
        { value: "outline", label: "Contour" },
        { value: "text", label: "Texte" },
      ],
      default: "text",
    },

    // ============================================
    // CONFIG GÉNÉRALE
    // ============================================
    {
      id: "config.variant",
      type: "select",
      label: "Variant",
      options: [
        { value: "fullscreen-center", label: "Fullscreen centre" },
        { value: "fullscreen-left", label: "Fullscreen gauche" },
        { value: "fullscreen-right", label: "Fullscreen droite" },
        { value: "split", label: "Split" },
        { value: "minimal", label: "Minimal" },
        { value: "carousel", label: "Carousel" },
        { value: "video-bg", label: "Video background" },
        { value: "editorial", label: "Editorial" },
      ],
      default: "fullscreen-center",
    },
    {
      id: "config.verticalAlign",
      type: "select",
      label: "Alignement vertical",
      options: [
        { value: "top", label: "Haut" },
        { value: "center", label: "Centre" },
        { value: "bottom", label: "Bas" },
      ],
      default: "center",
    },
    {
      id: "config.titleAnimation",
      type: "select",
      label: "Animation du titre",
      options: [
        { value: "none", label: "Aucune" },
        { value: "split-text", label: "Split text" },
        { value: "fade-in", label: "Fade in" },
      ],
      default: "split-text",
    },

    // ============================================
    // OVERLAY
    // ============================================
    {
      id: "config.overlay.enabled",
      type: "checkbox",
      label: "Activer l'overlay",
      default: true,
    },
    {
      id: "config.overlay.type",
      type: "select",
      label: "Type d'overlay",
      options: [
        { value: "gradient", label: "Gradient" },
        { value: "solid", label: "Solide" },
        { value: "blur", label: "Blur" },
        { value: "vignette", label: "Vignette" },
      ],
      default: "gradient",
    },
    {
      id: "config.overlay.opacity",
      type: "range",
      label: "Opacite overlay",
      min: 0,
      max: 1,
      step: 0.05,
      default: 0.45,
    },
    {
      id: "config.overlay.color",
      type: "color",
      label: "Couleur overlay",
      default: "#000000",
    },

    // ============================================
    // SLIDESHOW
    // ============================================
    {
      id: "config.slideshow.enabled",
      type: "checkbox",
      label: "Activer le slideshow",
      default: false,
    },
    {
      id: "config.slideshow.autoplay",
      type: "checkbox",
      label: "Lecture automatique",
      default: true,
    },
    {
      id: "config.slideshow.interval",
      type: "number",
      label: "Intervalle autoplay (ms)",
      min: 1000,
      max: 15000,
      default: 5000,
    },
    {
      id: "config.slideshow.transition",
      type: "select",
      label: "Transition slideshow",
      options: [
        { value: "fade", label: "Fade" },
        { value: "slide", label: "Slide" },
        { value: "zoom", label: "Zoom" },
      ],
      default: "fade",
    },
    {
      id: "config.slideshow.duration",
      type: "range",
      label: "Duree transition",
      min: 0.2,
      max: 2,
      step: 0.1,
      default: 0.8,
    },
    {
      id: "config.slideshow.showArrows",
      type: "checkbox",
      label: "Afficher les fleches",
      default: true,
    },
    {
      id: "config.slideshow.showDots",
      type: "checkbox",
      label: "Afficher les points",
      default: true,
    },
    {
      id: "config.slideshow.pauseOnHover",
      type: "checkbox",
      label: "Pause au survol",
      default: true,
    },
    {
      id: "config.slideshow.loop",
      type: "checkbox",
      label: "Boucle slideshow",
      default: true,
    },

    // ============================================
    // LAYOUT CONFIG  ← FIX: layoutConfig (pas layout)
    // ============================================
    {
      id: "config.layoutConfig.type",
      type: "select",
      label: "Type de layout",
      options: [
        { value: "content-over-media", label: "Texte sur l'image (fullscreen)" },
        { value: "split-left", label: "Image gauche / Texte droite" },
        { value: "split-right", label: "Texte gauche / Image droite" },
        { value: "stacked-top", label: "Image en haut / Texte en bas" },
        { value: "stacked-bottom", label: "Texte en haut / Image en bas" },
        { value: "side-by-side", label: "Côte à côte (50/50)" },
      ],
      default: "content-over-media",
    },
    {
      id: "config.layoutConfig.mediaPosition",
      type: "select",
      label: "Position du media (split)",
      options: [
        { value: "left", label: "Gauche" },
        { value: "right", label: "Droite" },
        { value: "background", label: "Arrière-plan" },
      ],
      default: "background",
    },
    {
      id: "config.layoutConfig.contentPosition",
      type: "select",
      label: "Position du contenu",
      options: [
        { value: "left", label: "Gauche" },
        { value: "center", label: "Centre" },
        { value: "right", label: "Droite" },
      ],
      default: "center",
    },
    {
      id: "config.layoutConfig.contentWidth",
      type: "select",
      label: "Largeur du contenu",
      options: [
        { value: "narrow", label: "Étroit (max-w-lg)" },
        { value: "medium", label: "Moyen (max-w-2xl)" },
        { value: "wide", label: "Large (max-w-4xl)" },
        { value: "full", label: "Plein (100%)" },
      ],
      default: "wide",
    },
    {
      id: "config.layoutConfig.gap",
      type: "select",
      label: "Espacement entre elements",
      options: [
        { value: "2", label: "Très petit (8px)" },
        { value: "4", label: "Petit (16px)" },
        { value: "6", label: "Moyen (24px)" },
        { value: "8", label: "Grand (32px)" },
        { value: "12", label: "Très grand (48px)" },
        { value: "16", label: "Enorme (64px)" },
      ],
      default: "6",
    },
    {
      id: "config.layoutConfig.mediaWidth",
      type: "select",
      label: "Largeur media (split layout)",
      options: [
        { value: "40", label: "40%" },
        { value: "50", label: "50%" },
        { value: "60", label: "60%" },
      ],
      default: "50",
    },

    // ============================================
    // TYPOGRAPHIE — TITRE
    // ============================================
    {
      id: "config.typography.title.fontFamily",
      type: "select",
      label: "Police du titre",
      options: [
        { value: "inherit", label: "Héritée" },
        { value: "serif", label: "Serif (élégant)" },
        { value: "sans", label: "Sans-serif (moderne)" },
        { value: "display", label: "Display" },
        { value: "inter", label: "Inter" },
        { value: "roboto", label: "Roboto" },
        { value: "poppins", label: "Poppins" },
        { value: "montserrat", label: "Montserrat" },
        { value: "playfair", label: "Playfair Display" },
        { value: "merriweather", label: "Merriweather" },
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
    {
      id: "config.typography.title.fontSize",
      type: "select",
      label: "Taille du titre",
      options: [
        { value: "2xl", label: "Très petit (2xl)" },
        { value: "3xl", label: "Petit (3xl)" },
        { value: "4xl", label: "Moyen (4xl)" },
        { value: "5xl", label: "Grand (5xl)" },
        { value: "6xl", label: "Très grand (6xl)" },
        { value: "7xl", label: "Enorme (7xl)" },
        { value: "8xl", label: "Gigantesque (8xl)" },
      ],
      default: "5xl",
    },
    {
      id: "config.typography.title.fontWeight",
      type: "select",
      label: "Épaisseur du titre",
      options: [
        { value: "light", label: "Léger (300)" },
        { value: "normal", label: "Normal (400)" },
        { value: "medium", label: "Medium (500)" },
        { value: "semibold", label: "Semi-bold (600)" },
        { value: "bold", label: "Bold (700)" },
        { value: "extrabold", label: "Extra-bold (800)" },
      ],
      default: "light",
    },
    {
      id: "config.typography.title.fontStyle",
      type: "select",
      label: "Style du titre",
      options: [
        { value: "normal", label: "Normal" },
        { value: "italic", label: "Italique" },
      ],
      default: "normal",
    },
    {
      id: "config.typography.title.textTransform",
      type: "select",
      label: "Transformation du titre",
      options: [
        { value: "none", label: "Aucune" },
        { value: "uppercase", label: "MAJUSCULES" },
        { value: "lowercase", label: "minuscules" },
        { value: "capitalize", label: "Capitalize" },
      ],
      default: "none",
    },
    {
      id: "config.typography.title.lineHeight",
      type: "select",
      label: "Hauteur de ligne titre",
      options: [
        { value: "none", label: "Aucune (1)" },
        { value: "tight", label: "Serrée (1.1)" },
        { value: "snug", label: "Compacte (1.3)" },
        { value: "normal", label: "Normale (1.5)" },
        { value: "relaxed", label: "Détendue (1.7)" },
        { value: "loose", label: "Large (2)" },
      ],
      default: "tight",
    },
    {
      id: "config.typography.title.letterSpacing",
      type: "select",
      label: "Espacement lettres titre",
      options: [
        { value: "tighter", label: "Très serré" },
        { value: "tight", label: "Serré" },
        { value: "normal", label: "Normal" },
        { value: "wide", label: "Large" },
        { value: "wider", label: "Très large" },
        { value: "widest", label: "Énorme" },
      ],
      default: "tight",
    },
    {
      id: "config.typography.title.textAlign",
      type: "select",
      label: "Alignement du titre",
      options: [
        { value: "left", label: "Gauche" },
        { value: "center", label: "Centre" },
        { value: "right", label: "Droite" },
        { value: "justify", label: "Justifié" },
      ],
      default: "center",
    },

    // ============================================
    // TYPOGRAPHIE — SOUS-TITRE
    // ============================================
    {
      id: "config.typography.subtitle.fontFamily",
      type: "select",
      label: "Police du sous-titre",
      options: [
        { value: "inherit", label: "Héritée" },
        { value: "serif", label: "Serif" },
        { value: "sans", label: "Sans-serif" },
        { value: "inter", label: "Inter" },
        { value: "roboto", label: "Roboto" },
        { value: "poppins", label: "Poppins" },
        { value: "montserrat", label: "Montserrat" },
        { value: "playfair", label: "Playfair Display" },
      ],
      default: "inherit",
    },
    {
      id: "config.typography.subtitle.fontSize",
      type: "select",
      label: "Taille du sous-titre",
      options: [
        { value: "sm", label: "Petit (sm)" },
        { value: "base", label: "Normal (base)" },
        { value: "lg", label: "Moyen (lg)" },
        { value: "xl", label: "Grand (xl)" },
        { value: "2xl", label: "Très grand (2xl)" },
        { value: "3xl", label: "Enorme (3xl)" },
      ],
      default: "xl",
    },
    {
      id: "config.typography.subtitle.fontWeight",
      type: "select",
      label: "Épaisseur sous-titre",
      options: [
        { value: "light", label: "Léger" },
        { value: "normal", label: "Normal" },
        { value: "medium", label: "Medium" },
        { value: "semibold", label: "Semi-bold" },
        { value: "bold", label: "Bold" },
      ],
      default: "light",
    },
    {
      id: "config.typography.subtitle.fontStyle",
      type: "select",
      label: "Style sous-titre",
      options: [
        { value: "normal", label: "Normal" },
        { value: "italic", label: "Italique" },
      ],
      default: "normal",
    },
    {
      id: "config.typography.subtitle.textAlign",
      type: "select",
      label: "Alignement sous-titre",
      options: [
        { value: "left", label: "Gauche" },
        { value: "center", label: "Centre" },
        { value: "right", label: "Droite" },
      ],
      default: "center",
    },

    // ============================================
    // TYPOGRAPHIE — PRE-TITRE
    // ============================================
    {
      id: "config.typography.pretitle.fontFamily",
      type: "select",
      label: "Police du pre-titre",
      options: [
        { value: "inherit", label: "Héritée" },
        { value: "serif", label: "Serif" },
        { value: "sans", label: "Sans-serif" },
        { value: "inter", label: "Inter" },
        { value: "roboto", label: "Roboto" },
        { value: "poppins", label: "Poppins" },
        { value: "montserrat", label: "Montserrat" },
        { value: "bebasneue", label: "Bebas Neue" },
      ],
      default: "inherit",
    },
    {
      id: "config.typography.pretitle.fontSize",
      type: "select",
      label: "Taille du pre-titre",
      options: [
        { value: "xs", label: "Très petit" },
        { value: "sm", label: "Petit" },
        { value: "base", label: "Normal" },
        { value: "lg", label: "Moyen" },
      ],
      default: "sm",
    },
    {
      id: "config.typography.pretitle.fontWeight",
      type: "select",
      label: "Épaisseur pre-titre",
      options: [
        { value: "normal", label: "Normal" },
        { value: "medium", label: "Medium" },
        { value: "semibold", label: "Semi-bold" },
        { value: "bold", label: "Bold" },
      ],
      default: "medium",
    },
    {
      id: "config.typography.pretitle.letterSpacing",
      type: "select",
      label: "Espacement lettres pre-titre",
      options: [
        { value: "normal", label: "Normal" },
        { value: "wide", label: "Large" },
        { value: "wider", label: "Très large" },
        { value: "widest", label: "Énorme" },
      ],
      default: "widest",
    },

    // ============================================
    // TYPOGRAPHIE — BODY
    // ============================================
    {
      id: "config.typography.body.fontFamily",
      type: "select",
      label: "Police du body",
      options: [
        { value: "inherit", label: "Héritée" },
        { value: "serif", label: "Serif" },
        { value: "sans", label: "Sans-serif" },
        { value: "inter", label: "Inter" },
        { value: "roboto", label: "Roboto" },
      ],
      default: "inherit",
    },
    {
      id: "config.typography.body.fontSize",
      type: "select",
      label: "Taille du body",
      options: [
        { value: "xs", label: "Très petit" },
        { value: "sm", label: "Petit" },
        { value: "base", label: "Normal" },
        { value: "lg", label: "Moyen" },
      ],
      default: "base",
    },
    {
      id: "config.typography.body.fontWeight",
      type: "select",
      label: "Épaisseur body",
      options: [
        { value: "light", label: "Léger" },
        { value: "normal", label: "Normal" },
        { value: "medium", label: "Medium" },
      ],
      default: "normal",
    },
    {
      id: "config.typography.body.lineHeight",
      type: "select",
      label: "Hauteur de ligne body",
      options: [
        { value: "tight", label: "Serrée" },
        { value: "normal", label: "Normale" },
        { value: "relaxed", label: "Détendue" },
        { value: "loose", label: "Large" },
      ],
      default: "relaxed",
    },

    // ============================================
    // ANIMATIONS  ← FIX: heroAnimation (pas animation)
    // ============================================
    {
      id: "config.heroAnimation.entrance",
      type: "select",
      label: "Animation d'entrée",
      options: [
        { value: "none", label: "Aucune" },
        { value: "fade-in", label: "Fade in" },
        { value: "fade-up", label: "Fade up" },
        { value: "fade-down", label: "Fade down" },
        { value: "fade-left", label: "Fade left" },
        { value: "fade-right", label: "Fade right" },
        { value: "scale-in", label: "Scale in" },
        { value: "slide-up", label: "Slide up" },
        { value: "slide-down", label: "Slide down" },
        { value: "slide-left", label: "Slide left" },
        { value: "slide-right", label: "Slide right" },
        { value: "reveal-up", label: "Reveal up" },
        { value: "blur-in", label: "Blur in" },
        { value: "bounce", label: "Bounce" },
        { value: "flip", label: "Flip" },
        { value: "rotate", label: "Rotate" },
      ],
      default: "fade-up",
    },
    {
      id: "config.heroAnimation.duration",
      type: "select",
      label: "Durée animation",
      options: [
        { value: "fast", label: "Rapide (0.3s)" },
        { value: "normal", label: "Normale (0.6s)" },
        { value: "slow", label: "Lente (1s)" },
        { value: "very-slow", label: "Très lente (1.5s)" },
      ],
      default: "normal",
    },
    {
      id: "config.heroAnimation.stagger",
      type: "checkbox",
      label: "Animation échelonnée (stagger)",
      default: true,
    },
    {
      id: "config.heroAnimation.staggerDelay",
      type: "range",
      label: "Délai entre éléments (s)",
      min: 0.05,
      max: 0.5,
      step: 0.05,
      default: 0.1,
    },
    {
      id: "config.heroAnimation.easing",
      type: "select",
      label: "Easing (courbe d'animation)",
      options: [
        { value: "ease", label: "Ease" },
        { value: "ease-in", label: "Ease in" },
        { value: "ease-out", label: "Ease out" },
        { value: "ease-in-out", label: "Ease in-out" },
        { value: "linear", label: "Linear" },
        { value: "spring", label: "Spring (ressort)" },
        { value: "bounce", label: "Bounce" },
        { value: "smooth", label: "Smooth (0.16, 1, 0.3, 1)" },
      ],
      default: "smooth",
    },
    {
      id: "config.heroAnimation.parallax",
      type: "checkbox",
      label: "Activer le parallax",
      default: false,
    },
    {
      id: "config.heroAnimation.parallaxSpeed",
      type: "range",
      label: "Vitesse parallax",
      min: 0.1,
      max: 1,
      step: 0.1,
      default: 0.5,
    },
    {
      id: "config.heroAnimation.hover",
      type: "select",
      label: "Animation au survol",
      options: [
        { value: "none", label: "Aucune" },
        { value: "scale", label: "Zoom" },
        { value: "lift", label: "Légère élévation" },
        { value: "glow", label: "Lueur" },
        { value: "shake", label: "Tremblement" },
        { value: "pulse", label: "Pulsation" },
      ],
      default: "none",
    },
  ],

  // ============================================
  // BLOCKS
  // ============================================
  blocks: [
    {
      type: "slide",
      name: "Slides",
      itemsPath: "content.slides",
      settings: [
        {
          id: "pretitle.text",
          type: "text",
          label: "Pre-titre",
          default: "Nouvelle Collection",
        },
        {
          id: "title",
          type: "text",
          label: "Titre",
          default: "Nouvelle Collection",
        },
        {
          id: "subtitle",
          type: "textarea",
          label: "Sous-titre",
          default: "Decouvrez notre selection exclusive.",
        },
        {
          id: "body",
          type: "textarea",
          label: "Texte",
          default: "",
        },
        {
          id: "media.type",
          type: "select",
          label: "Type de media",
          options: [
            { value: "image", label: "Image" },
            { value: "video", label: "Video" },
          ],
          default: "image",
        },
        {
          id: "media.src",
          type: "image",
          label: "Image",
          default: "",
        },
        {
          id: "media.videoSrc",
          type: "url",
          label: "Video",
          default: "",
        },
        {
          id: "cta.primary.text",
          type: "text",
          label: "CTA principal — texte",
          default: "Decouvrir",
        },
        {
          id: "cta.primary.href",
          type: "url",
          label: "CTA principal — lien",
          default: "/produits",
        },
        {
          id: "cta.secondary.text",
          type: "text",
          label: "CTA secondaire — texte",
          default: "En savoir plus",
        },
        {
          id: "cta.secondary.href",
          type: "url",
          label: "CTA secondaire — lien",
          default: "/a-propos",
        },
        {
          id: "textColor",
          type: "color",
          label: "Couleur du texte",
          default: "#ffffff",
        },
        {
          id: "accentColor",
          type: "color",
          label: "Couleur d'accent",
          default: "#c9a96e",
        },
        {
          id: "overlay.enabled",
          type: "checkbox",
          label: "Overlay actif",
          default: true,
        },
        {
          id: "overlay.type",
          type: "select",
          label: "Type d'overlay",
          options: [
            { value: "gradient", label: "Gradient" },
            { value: "solid", label: "Solide" },
            { value: "blur", label: "Blur" },
          ],
          default: "gradient",
        },
        {
          id: "overlay.opacity",
          type: "range",
          label: "Opacite overlay",
          min: 0,
          max: 1,
          step: 0.05,
          default: 0.45,
        },
        {
          id: "overlay.color",
          type: "color",
          label: "Couleur overlay",
          default: "#000000",
        },
      ],
    },
    {
      type: "metric",
      name: "Metriques",
      itemsPath: "content.metrics",
      settings: [
        { id: "value", type: "text", label: "Valeur", default: "24" },
        { id: "label", type: "text", label: "Label", default: "Support" },
        { id: "prefix", type: "text", label: "Prefixe", default: "" },
        { id: "suffix", type: "text", label: "Suffixe", default: "h" },
      ],
    },
  ],
  maxBlocks: 10,

  // ============================================
  // DEFAULTS — tous les chemins sont corrects
  // ============================================
  defaults: {
    content: {
      pretitle: { text: "Collection Exclusive", style: "line" },
      title: "L'Art du Style Moderne",
      subtitle: "Une collection exclusive pensee pour ceux qui n'acceptent que l'excellence.",
      body: "",
      showScrollIndicator: true,
      showPretitle: true,
      showTitle: true,
      showSubtitle: true,
      showBody: false,
      showMedia: true,
      showCTA: true,
      showMetrics: false,
      cta: {
        primary: { text: "Explorer la collection", href: "/produits", style: "solid" },
        secondary: { text: "Notre histoire", href: "/a-propos", style: "text" },
      },
      media: {
        type: "image",
        src: "",
        videoSrc: "",
        poster: "",
        parallax: true,
        zoomOnHover: false,
      },
      slides: [
        {
          pretitle: { text: "Nouvelle Collection" },
          title: "Nouvelle Collection",
          subtitle: "Decouvrez notre selection exclusive.",
          body: "",
          media: { type: "image", src: "", videoSrc: "" },
          cta: {
            primary: { text: "Decouvrir", href: "/produits" },
            secondary: { text: "En savoir plus", href: "/a-propos" },
          },
          textColor: "#ffffff",
          accentColor: "#c9a96e",
          overlay: {
            enabled: true,
            type: "gradient",
            opacity: 0.45,
            color: "#000000",
          },
        },
      ],
      metrics: [
        { value: "24", suffix: "h", label: "Support" },
        { value: "48", suffix: "h", label: "Expedition" },
        { value: "100", suffix: "%", label: "Premium" },
      ],
    },
    config: {
      variant: "fullscreen-center",   // ← FIX: était "animation"
      ratio: "50:50",
      verticalAlign: "center",
      titleAnimation: "split-text",

      // FIX: layoutConfig présent
      layoutConfig: {
        type: "content-over-media",
        mediaPosition: "background",
        contentPosition: "center",
        contentWidth: "wide",
        gap: "6",
        mediaWidth: "50",
      },

      // FIX: typography présent
      typography: {
        title: {
          fontFamily: "inherit",
          fontSize: "5xl",
          fontWeight: "light",
          fontStyle: "normal",
          textTransform: "none",
          lineHeight: "tight",
          letterSpacing: "tight",
          textAlign: "center",
        },
        subtitle: {
          fontFamily: "inherit",
          fontSize: "xl",
          fontWeight: "light",
          fontStyle: "normal",
          textAlign: "center",
        },
        pretitle: {
          fontFamily: "inherit",
          fontSize: "sm",
          fontWeight: "medium",
          letterSpacing: "widest",
        },
        body: {
          fontFamily: "inherit",
          fontSize: "base",
          fontWeight: "normal",
          lineHeight: "relaxed",
        },
      },

      // FIX: heroAnimation (pas animation)
      heroAnimation: {
        entrance: "fade-up",
        duration: "normal",
        stagger: true,
        staggerDelay: 0.1,
        easing: "smooth",
        parallax: false,
        parallaxSpeed: 0.5,
        hover: "none",
      },

      // Garde config.animation pour SectionWrapper
      animation: {
        entrance: "fade-up",
        duration: "normal",
      },

      overlay: {
        enabled: true,
        type: "gradient",
        opacity: 0.45,
        color: "#000000",
      },
      slideshow: {
        enabled: false,
        autoplay: true,
        interval: 5000,
        transition: "fade",
        duration: 0.8,
        showArrows: true,
        showDots: true,
        pauseOnHover: true,
        loop: true,
      },
    },
    style: {
      colors: {
        background: "transparent",
        text: "#ffffff",
        accent: "#c9a96e",
      },
      typography: {
        textAlign: "center",
        titleWeight: "light",
        titleLineHeight: "tight",
        titleLetterSpacing: "tighter",
        fontFamily: "'Playfair Display', Georgia, serif",
      },
      spacing: {
        container: "contained",
        minHeight: "100vh",
        paddingY: "0",
        gap: "6",
      },
    },
    classes: {},
  },
};

export default heroSchema;