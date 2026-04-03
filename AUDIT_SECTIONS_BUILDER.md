# AUDIT COMPLET - FLUX DES SECTIONS ET BUILDER

> Document d'audit technique sur le fonctionnement des sections, du builder, et des templates
> Date: Mars 2026
> Projet: E-commerce Builder (Next.js 16 + TypeScript)

---

## 📊 SOMMAIRE

1. [Architecture Globale](#1-architecture-globale)
2. [Flux vers le Builder](#2-flux-vers-le-builder)
3. [Flux vers les Templates](#3-flux-vers-les-templates)
4. [Méthodes pour Pages Publiques](#4-méthodes-pour-pages-publiques)
5. [Chemins Automatiques vs Manuels](#5-chemins-automatiques-vs-manuels)
6. [Formulaire Builder: Auto vs Manuel](#6-formulaire-builder-auto-vs-manuel)
7. [Récapitulatif des Flux](#7-récapitulatif-des-flux)

---

## 1. ARCHITECTURE GLOBALE

### 1.1 Structure des Sections

```
src/sections/
├── Accueil/           (18 items) - Hero, Banner, ProductGrid, etc.
├── Auth/              (2 items)  - Login, Register
├── Catalogue/         (3 items)  - ProductDetail, ProductsContent
├── Commande/          (8 items)  - Checkout, OrderConfirmation, OrderDetail
├── Compte/            (6 items)  - AccountDashboard, OrderHistory, Wishlist
├── Global/            (8 items)  - Header, Footer, Announcement, Navigation
└── Panier/            (1 item)   - Cart
```

**Total: 46 sections organisées par groupe de pages**

### 1.2 Fichiers Clés du Système

| Fichier | Rôle |
|---------|------|
| `src/lib/section-registry.ts` | Définition MANUELLE des schémas de sections |
| `src/generated/section-manifest.ts` | Génération AUTOMATIQUE des imports (47 sections) |
| `src/lib/section-library.ts` | Organisation des sections par onglets/groupes |
| `src/lib/section-defaults.ts` | Props par défaut pour chaque section |
| `src/lib/templates.ts` | Templates pré-construits (fashion, electronics, etc.) |
| `src/store/editor-store.ts` | Zustand store - gestion état du builder |
| `src/components/SectionRenderer.tsx` | Rendu des sections en mode édition |
| `src/components/SectionEditor.tsx` | Formulaire dynamique de configuration |

---

## 2. FLUX VERS LE BUILDER

### 2.1 Comment Arriver au Builder

**Route:** `/builder` → `src/app/(Site_Public)/builder/page.tsx`

**Flux complet:**

```
1. Utilisateur navigue vers /builder
   ↓
2. HomePage component (builder/page.tsx:75)
   - Charge le projet initial depuis fashionBoutiqueTemplate
   - Hydrate depuis Supabase si seller existe
   ↓
3. useEditorStore (Zustand) gère l'état global
   - project: Project (pages, sections, settings)
   - currentPageId: string
   - selectedSectionId: string | null
   - isPreview: boolean
   ↓
4. Rendu de l'interface:
   - SectionRenderer: Pour chaque section de la page courante
   - SectionEditor: Panneau latéral de configuration
   - AddSectionModal: Modal d'ajout de sections
```

### 2.2 Initialisation du Projet

```typescript
// src/store/editor-store.ts:24-38
const createInitialProject = (): Project => {
  const template = fashionBoutiqueTemplate;  // Template par défaut
  return ensureProjectHasSystemPages({
    ...template.project,
    id: `project-${uuidv4()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    globalSections: template.project.globalSections || {
      header: undefined,
      footer: undefined,
      announcementBar: undefined,
    },
  });
};
```

**Points clés:**
- Le builder démarre TOUJOURS avec le template `fashionBoutiqueTemplate`
- Si l'utilisateur est un seller, le projet est hydraté depuis Supabase
- Sinon, on utilise le template par défaut en mémoire

---

## 3. FLUX VERS LES TEMPLATES

### 3.1 Comment Arriver aux Templates

**Déclencheur:** Bouton "Choisir un template" dans le builder

**Flux:**

```
1. Clic sur bouton Template
   ↓
2. setShowTemplateSelector(true)
   ↓
3. TemplateSelector modal s'ouvre
   ↓
4. Affichage des templates depuis src/lib/templates.ts
   ↓
5. Sélection → loadTemplate(template) → editor-store.ts:84-103
   ↓
6. Reconstruction complète du projet avec le nouveau template
```

### 3.2 Structure d'un Template

```typescript
// src/lib/templates.ts:19-37
export const fashionBoutiqueTemplate: Template = {
  id: 'fashion-boutique',
  name: 'Maison Élégance',
  description: 'Template couture premium...',
  thumbnail: 'https://images.unsplash.com/...',
  category: 'fashion',
  colorScheme: {
    primary: '#0c0c0c',
    secondary: '#f7f5f0',
    accent: '#c5a572',
    background: '#ffffff',
    text: '#1a1a1a',
  },
  project: {
    id: `template-fashion-prestige`,
    name: 'Maison Élégance',
    globalSections: { header, footer, announcementBar },
    pages: [
      { id: 'page-home', name: 'Accueil', slug: '/', isHome: true, sections: [...] },
      { id: 'page-product', name: 'Produit', slug: '/produit', sections: [...] },
      { id: 'page-products', name: 'Produits', slug: '/produits', sections: [...] },
      { id: 'page-cart', name: 'Panier', slug: '/panier', sections: [...] },
      { id: 'page-wishlist', name: 'Favoris', slug: '/favoris', sections: [...] },
    ],
    settings: { ... }
  }
};
```

### 3.3 Templates Disponibles

Les templates sont définis manuellement dans `src/lib/templates.ts`:
- `fashionBoutiqueTemplate` (ligne 19)
- `electronicsTemplate` (ligne 809)
- `homeGoodsTemplate` (ligne 1609)
- `beautyTemplate` (ligne 2409)
- etc.

**Export:**
```typescript
// src/lib/templates.ts:3215-3224
export const templates = [
  fashionBoutiqueTemplate,
  electronicsTemplate,
  homeGoodsTemplate,
  beautyTemplate,
  foodTemplate,
  minimalTemplate,
  luxuryTemplate,
  startupTemplate,
];
```

---

## 4. MÉTHODES POUR PAGES PUBLIQUES

### 4.1 Routes Publiques Définies

**Fichier:** `src/app/(Site_Public)/`

| Route | Fichier | Component utilisé |
|-------|---------|-------------------|
| `/` | `page.tsx` | CurrentSellerProjectPage path="/" |
| `/produits` | `produits/page.tsx` | CurrentSellerProjectPage path="/produits" |
| `/produit` | `produits/page.tsx` | CurrentSellerProjectPage path="/produit" |
| `/panier` | `panier/page.tsx` | CurrentSellerProjectPage path="/panier" |
| `/checkout` | `checkout/page.tsx` | CurrentSellerProjectPage path="/checkout" |
| `/compte` | `compte/page.tsx` | CurrentSellerProjectPage path="/compte" |
| `/favoris` | `favoris/page.tsx` | CurrentSellerProjectPage path="/favoris" |
| `/connexion` | `connexion/page.tsx` | CurrentSellerProjectPage path="/connexion" |
| `/inscription` | `inscription/page.tsx` | CurrentSellerProjectPage path="/inscription" |
| `/confirmation` | `confirmation/page.tsx` | CurrentSellerProjectPage path="/order-confirmation" |

### 4.2 Méthode de Rendu Public

**Architecture:**

```
Page Publique (ex: /produits/page.tsx)
    ↓
CurrentSellerProjectPage (path="/produits")
    ↓
PublicStorefront (project, path, storefrontStore)
    ↓
PublicSectionRenderer (pour chaque section)
```

**Fichier:** `src/components/CurrentSellerProjectPage.tsx`

```typescript
export function CurrentSellerProjectPage({ path, orderId }: CurrentSellerProjectPageProps) {
  const project = useEditorStore((state) => state.project);
  
  // Construit les données du storefront (produits, catégories, etc.)
  const storefrontStore = useMemo<StorefrontSectionStoreData | null>(() => {
    // ... récupération depuis account.seller
  }, [...]);

  return (
    <PublicStorefront
      project={project}
      path={path}
      orderId={orderId}
      storefrontStore={storefrontStore}
    />
  );
}
```

### 4.3 Mapping des Alias de Routes

**Fichier:** `src/components/PublicStorefront.tsx:20-32`

```typescript
const STOREFRONT_ALIAS_MAP: Record<string, string[]> = {
  "/": ["/"],
  "/products": ["/products", "/produits"],
  "/product": ["/product", "/produit"],
  "/cart": ["/cart", "/panier"],
  "/wishlist": ["/wishlist", "/favoris"],
  "/account": ["/account", "/compte"],
  "/connexion": ["/connexion", "/login"],
  "/inscription": ["/inscription", "/register"],
  "/checkout": ["/checkout"],
  "/order-confirmation": ["/order-confirmation", "/confirmation"],
  "/commande": ["/commande", "/commandes"],
};
```

---

## 5. CHEMINS AUTOMATIQUES VS MANUELS

### 5.1 Tableau Comparatif

| Aspect | Automatique | Manuel |
|--------|-------------|--------|
| **Manifest des sections** | ✅ Généré par script (`npm run generate:sections`) | ❌ |
| **Imports des composants** | ✅ Auto-généré dans `section-manifest.ts` | ❌ |
| **Schéma des sections (formulaire)** | ❌ | ✅ Défini dans `section-registry.ts` |
| **Props par défaut** | ❌ | ✅ Défini dans `section-defaults.ts` |
| **Templates** | ❌ | ✅ Codés manuellement |
| **Découverte des sections** | ✅ Scan du dossier `src/sections/` | ❌ |
| **Organisation onglets** | ❌ | ✅ Définie dans `section-library.ts` |

### 5.2 Génération Automatique

**Script:** `scripts/generate-section-manifest.mjs`

**Processus:**
```
1. Scan récursif de src/sections/
2. Détection des fichiers .tsx
3. Extraction du type depuis le nom de dossier/fichier
4. Génération du manifest avec:
   - type: string
   - exportName: string
   - displayName: string
   - pageGroup: string (dossier parent)
   - family: string (sous-dossier)
   - sourcePath: string
   - category: enum
   - icon: string
```

**Résultat:** `src/generated/section-manifest.ts` (519 lignes)

### 5.3 Configuration Manuelle

**Schéma de Section (pour formulaire):**

```typescript
// src/lib/section-registry.ts:126-172
sectionRegistry.register({
  name: 'Header Moderne',
  type: 'headerModern',
  category: 'header',
  description: 'En-tête complet avec navigation...',
  icon: 'Layout',
  settings: [
    { id: 'content.logo.text', type: 'text', label: 'Texte du logo', default: 'VOTRE MARQUE' },
    { id: 'content.logo.image', type: 'image', label: 'Image du logo', default: '' },
    { id: 'config.variant', type: 'select', label: 'Style', options: [...], default: 'default' },
    { id: 'config.behavior.sticky', type: 'checkbox', label: 'Header collant', default: true },
    // ... etc
  ],
  blocks: [
    {
      type: 'navLink',
      name: 'Lien de navigation',
      itemsPath: 'content.navigation',
      settings: [
        { id: 'label', type: 'text', label: 'Texte', default: 'Lien' },
        { id: 'href', type: 'url', label: 'URL', default: '/produit' },
        { id: 'enabled', type: 'checkbox', label: 'Actif', default: true },
      ],
    },
  ],
  maxBlocks: 8,
  presets: { navigation: [...] },
});
```

**Props par défaut:**

```typescript
// src/lib/section-defaults.ts:29+
switch (type) {
  case 'headerModern':
    return {
      content: {
        logo: { type: 'text', text: 'VOTRE MARQUE' },
        navigation: [...],
        actions: ['search', 'account', 'cart'],
        ctaButton: { text: 'Acheter', href: '/produit', variant: 'primary' },
      },
      config: { variant: 'default', behavior: { sticky: true } },
      style: { colors: {...}, spacing: {...} },
    };
  // ... autres sections
}
```

---

## 6. FORMULAIRE BUILDER: AUTO VS MANUEL

### 6.1 Réponse: C'est un HYBRIDE

**Génération du formulaire:**
- ✅ **Automatique** - Le formulaire est généré dynamiquement par `SectionEditor.tsx`
- ✅ **Basé sur schéma** - Utilise le schéma défini dans `sectionRegistry`

**Configuration du schéma:**
- ❌ **Manuelle** - Chaque section doit être enregistrée manuellement dans `section-registry.ts`

### 6.2 Comment Fonctionne le Formulaire Dynamique

**Fichier:** `src/components/SectionEditor.tsx`

```typescript
// 1. Récupération du schéma
const schema = sectionRegistry.get(section.type);

// 2. Rendu des champs selon le type
type SettingType = 
  | 'text'      → Input text
  | 'textarea'  → Textarea
  | 'number'    → Input number
  | 'color'     → Color picker
  | 'select'    → Select dropdown
  | 'checkbox'  → Checkbox
  | 'image'     → Image upload
  | 'url'       → Input URL
  | 'richtext'  → Rich text editor
  | 'range'     → Slider
  | 'font'      → Font selector

// 3. Gestion des valeurs imbriquées (dot notation)
// id: 'content.logo.text' → props.content.logo.text
```

### 6.3 Exemple: Enregistrement Manuel vs Rendu Auto

**Étape 1 - Enregistrement MANUEL dans registry:**
```typescript
// src/lib/section-registry.ts
sectionRegistry.register({
  name: 'Grille de catégories',
  type: 'categoryGrid',
  category: 'collection',
  settings: [
    { id: 'content.title', type: 'text', label: 'Titre', default: 'Nos catégories' },
    { id: 'config.columns', type: 'select', label: 'Colonnes', options: [...], default: '4' },
    { id: 'config.aspectRatio', type: 'select', label: 'Ratio image', options: [...], default: '3/4' },
    { id: 'styles.backgroundColor', type: 'color', label: 'Couleur de fond', default: '#ffffff' },
  ],
  blocks: [{
    type: 'category',
    name: 'Catégorie',
    itemsPath: 'content.categories',
    settings: [
      { id: 'name', type: 'text', label: 'Nom', default: 'Catégorie' },
      { id: 'image', type: 'image', label: 'Image', default: '' },
    ],
  }],
  maxBlocks: 12,
});
```

**Étape 2 - Rendu AUTOMATIQUE par SectionEditor:**
```typescript
// src/components/SectionEditor.tsx
function SettingInput({ setting, value, onChange }) {
  switch (setting.type) {
    case 'text':
      return <Input value={value} onChange={(e) => onChange(e.target.value)} />;
    case 'select':
      return (
        <Select value={value} onValueChange={onChange}>
          <SelectContent>
            {setting.options.map(opt => <SelectItem value={opt.value}>{opt.label}</SelectItem>)}
          </SelectContent>
        </Select>
      );
    case 'color':
      return <ColorPicker value={value} onChange={onChange} />;
    // ... etc
  }
}
```

### 6.4 Conséquence

| Action | Méthode | Conséquence |
|--------|---------|-------------|
| Ajouter une nouvelle section TSX | Automatique | Apparaît dans le manifest après `npm run generate:sections` |
| Pouvoir configurer la section dans builder | Manuel | DOIT ajouter `sectionRegistry.register()` dans `section-registry.ts` |
| Avoir des valeurs par défaut | Manuel | DOIT ajouter le case dans `section-defaults.ts` |

---

## 7. RÉCAPITULATIF DES FLUX

### 7.1 Diagramme de Flux Complet

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             DEVELOPPEMENT                                   │
└─────────────────────────────────────────────────────────────────────────────┘

Créer une section TSX dans src/sections/
           ↓
┌──────────┴──────────────────────────────────────────────────────────────────┐
│  AUTOMATIQUE (npm run generate:sections)                                    │
│  ├── Scan src/sections/                                                     │
│  ├── Génère section-manifest.ts                                           │
│  └── Section disponible dans AddSectionModal                              │
└──────────┬──────────────────────────────────────────────────────────────────┘
           ↓
┌──────────┴──────────────────────────────────────────────────────────────────┐
│  MANUEL (si besoin de configuration)                                      │
│  ├── Ajouter sectionRegistry.register() dans section-registry.ts            │
│  └── Ajouter getDefaultSectionProps() dans section-defaults.ts              │
└──────────┬──────────────────────────────────────────────────────────────────┘
           ↓
           Section disponible dans le builder avec formulaire de configuration

┌─────────────────────────────────────────────────────────────────────────────┐
│                              UTILISATEUR                                    │
└─────────────────────────────────────────────────────────────────────────────┘

Builder (/builder)
       ↓
┌──────┴──────────────────────────────────────────────────────────────────────┐
│  CHOIX 1: Template existant                                                 │
│  ├── TemplateSelector affiche les templates codés manuellement              │
│  ├── loadTemplate() crée un nouveau projet                                 │
│  └── Le projet contient toutes les pages et sections pré-configurées       │
└──────┬──────────────────────────────────────────────────────────────────────┘
       ↓
┌──────┴──────────────────────────────────────────────────────────────────────┐
│  CHOIX 2: Partir de zéro                                                   │
│  └── Template par défaut (fashionBoutiqueTemplate) chargé automatiquement  │
└──────┬──────────────────────────────────────────────────────────────────────┘
       ↓
Configuration du Builder
       ↓
┌──────┴──────────────────────────────────────────────────────────────────────┐
│  AJOUTER SECTION (AddSectionModal)                                         │
│  ├── Affiche sections depuis section-manifest.ts                            │
│  ├── Utilisateur choisit une section                                        │
│  ├── addSection(type) crée section avec props par défaut                    │
│  └── SectionRenderer affiche la section                                    │
└──────┬──────────────────────────────────────────────────────────────────────┘
       ↓
┌──────┴──────────────────────────────────────────────────────────────────────┐
│  CONFIGURER SECTION (SectionEditor)                                        │
│  ├── Récupère schéma depuis sectionRegistry.get(type)                       │
│  ├── Génère formulaire dynamiquement selon les settings                     │
│  ├── Utilisateur modifie les valeurs                                      │
│  └── updateSectionProps() met à jour le store                              │
└──────┬──────────────────────────────────────────────────────────────────────┘
       ↓
┌──────┴──────────────────────────────────────────────────────────────────────┐
│  SAUVEGARDER                                                                │
│  └── saveCurrentSellerStorefrontProject() → Supabase                        │
└─────────────────────────────────────────────────────────────────────────────┘
       ↓

Page Publique (/produits, /panier, etc.)
       ↓
┌──────┴──────────────────────────────────────────────────────────────────────┐
│  RENDU PUBLIC                                                                │
│  ├── CurrentSellerProjectPage reçoit le path                               │
│  ├── Récupère le projet depuis useEditorStore                               │
│  ├── Construit storefrontStore (produits, catégories, etc.)               │
│  ├── PublicStorefront trouve la page correspondante                         │
│  └── PublicSectionRenderer rend chaque section                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Compteur de Chemins par Cas

| Cas | Nombre de Chemins | Type |
|-----|-------------------|------|
| Développeur crée une section | 1 chemin | Automatique (scan) |
| Développeur configure une section | 2 chemins | Manuel (registry + defaults) |
| Utilisateur accède au builder | 1 chemin | Automatique (template par défaut) |
| Utilisateur choisit un template | 1 chemin | Manuel (template codé) |
| Utilisateur ajoute une section | 1 chemin | Automatique (via modal) |
| Utilisateur configure une section | 1 chemin | Automatique (formulaire dynamique) |
| Rendu page publique | 1 chemin | Automatique (CurrentSellerProjectPage) |

---

## 8. CONCLUSIONS

### 8.1 Points Forts

1. **Système hybride intelligent** - Génération automatique pour la découverte, manuelle pour la configuration
2. **Formulaires dynamiques** - Un seul composant `SectionEditor` gère toutes les sections
3. **Architecture modulaire** - Sections organisées par groupe de pages
4. **Support multilingue** - Alias de routes FR/EN
5. **Templates riches** - 8 templates pré-construits avec 5+ pages chacun

### 8.2 Points d'Attention

1. **Développeur DOIT** enregistrer manuellement le schéma dans `section-registry.ts` pour activer la configuration
2. **Développeur DOIT** ajouter les props par défaut dans `section-defaults.ts`
3. **Pas de génération automatique** du schéma de formulaire (impossible de déduire les champs depuis le TSX)

### 8.3 Statistiques

| Métrique | Valeur |
|----------|--------|
| Nombre total de sections | 47 |
| Sections avec schéma manuel | ~15 (enregistrées dans registry) |
| Sections générées automatiquement | 47 (dans manifest) |
| Templates disponibles | 8 |
| Pages par template | 5-8 |
| Types de champs formulaire | 11 (text, textarea, number, color, select, checkbox, image, url, richtext, range, font) |

---

**Fin du document d'audit**
