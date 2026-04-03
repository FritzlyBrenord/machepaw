# CMS Complet Boutique - Plan Directeur

## Objectif

Transformer la boutique actuelle en un vrai SaaS e-commerce professionnel avec:

- un storefront public pilote par un JSON unique;
- un builder visuel qui edite exactement le meme JSON;
- des themes/templates premium multi-pages;
- une publication `draft` vers `published`;
- aucune regression sur le backend metier existant.

Le backend `auth / produits / commandes / clients / paiements / seller / plan` reste la source metier. Le chantier vise uniquement la couche `storefront + cms + builder + themes`.

## Principes de base

1. Une seule source de verite: le storefront public et le builder lisent la meme structure.
2. Le builder n'est pas une maquette: il edite la vraie boutique.
3. Le rendu est `renderer-first`: la boutique est rendue par des `pages -> sections -> props`.
4. Toutes les modifications passent par un mode brouillon avant publication.
5. Les sections restent dynamiques: elles peuvent consommer produits, ventes flash, annonces, categories ou contenu libre.
6. Les templates sont de vrais projets storefront, pas seulement des palettes de couleurs.

## Perimetre du chantier

### Ce qu'on garde

- les tables `sellers`, `products`, `orders`, `seller_plans`, `seller_payment_methods`;
- les hooks de storefront actuels pour les donnees dynamiques;
- les routes boutique existantes;
- les pages vendeur, admin et auth qui ne concernent pas le CMS.

### Ce qu'on remplace progressivement

- la logique de composition fixe dans `src/app/boutique/[slug]/page.tsx`;
- la config `builder.homepage` limitee a une seule page;
- les themes reduits a une simple personnalisation visuelle;
- le builder de personnalisation actuel.

## Phases

### Phase 0 - Cadrage et compatibilite

Objectif: introduire la couche CMS sans casser la boutique existante.

Livrables:

- un schema `storefront_project`;
- un adaptateur entre l'ancien `builder.homepage` et le nouveau projet CMS;
- une documentation d'architecture minimale.

Definition of done:

- le projet storefront peut etre resolu meme si seule l'ancienne config existe;
- la boutique actuelle continue de s'afficher;
- le builder peut encore sauvegarder.

### Phase 1 - Modele de donnees storefront_project

Objectif: definir la structure officielle du storefront.

Structure cible:

- `version`
- `schema`
- `mode`
- `themeSlug`
- `settings`
- `pages[]`

Chaque page doit contenir:

- `id`
- `kind`
- `label`
- `slug`
- `sections[]`

Chaque section doit contenir:

- `id`
- `type`
- `label`
- `enabled`
- `content props`
- `style props`

Definition of done:

- la config peut decrire toute la page Accueil;
- la structure est extensible aux pages Collection et Produit;
- la migration depuis l'ancien format est automatique.

### Phase 2 - Stockage et publication

Objectif: separer brouillon et publication.

Livrables:

- table projet storefront ou equivalent de persistence;
- revision `draft`;
- revision `published`;
- date de publication et auteur;
- rollback simple.

Definition of done:

- un vendeur peut sauvegarder sans publier;
- la boutique publique lit `published`;
- le builder lit `draft`.

### Phase 3 - Renderer storefront public

Objectif: la boutique publique ne depend plus d'une page fixe.

Livrables:

- registre de sections storefront;
- resolvers de page par slug;
- moteur commun de rendu;
- fallback en cas de section inconnue;
- styles de section uniformes.

Definition of done:

- `/boutique/[slug]` rend sa page via le projet storefront;
- les sections peuvent etre ajoutees ou retirees sans rewriter la page.

### Phase 4 - Migration Accueil

Objectif: migrer d'abord l'accueil, sans toucher au backend metier.

Sections minimales:

- header
- announcement
- hero
- benefits
- categories
- flash sales
- featured products
- promotions
- testimonials
- newsletter
- footer

Definition of done:

- la page Accueil live ne contient plus de composition codée en dur;
- les produits, promos et annonces continuent a venir du backend actuel.

### Phase 5 - Builder V2

Objectif: un vrai editeur type Shopify.

Livrables:

- iframe du vrai site;
- selection directe d'une section dans la preview;
- liste des pages;
- panneau de proprietes;
- ajout entre sections;
- duplication;
- suppression;
- masquage;
- drag and drop;
- undo / redo;
- preview desktop / tablette / mobile.

Definition of done:

- la modification d'une section est visible immediatement dans la preview live;
- l'etat brouillon peut etre sauvegarde.

### Phase 6 - Pages supplementaires

Objectif: sortir du mode "homepage only".

Pages prioritaires:

- Collection
- Produit
- A propos
- Contact

Definition of done:

- le vendeur peut choisir la page a editer;
- chaque page est rendue par le meme moteur CMS.

### Phase 7 - Templates premium

Objectif: proposer des boutiques vraiment professionnelles des le premier chargement.

Templates prevus:

- Luxe editorial
- Modern conversion
- Maison lifestyle

Chaque template doit inclure:

- accueil
- collection
- produit
- a propos
- footer / navigation coherents

Definition of done:

- choisir un template applique une vraie structure complete;
- le resultat parait exploitable sans customisation immediate.

### Phase 8 - Publication et garde-fous

Objectif: fiabiliser l'usage reel du CMS.

Livrables:

- validation schema avant sauvegarde;
- fallback de rendu si config partielle;
- confirmation avant reinitialisation;
- publication manuelle;
- apercu prive.

Definition of done:

- aucune edition ne casse la boutique publique;
- le vendeur comprend toujours s'il edite un brouillon ou une version publiee.

### Phase 9 - Plans SaaS et limites

Objectif: brancher le CMS au systeme de plans.

Exemples de limites:

- nombre de pages;
- themes premium;
- sections premium;
- domain custom;
- blocs personnalises;
- niveau de personnalisation.

Definition of done:

- le builder filtre ou bloque les fonctions selon le plan actif.

### Phase 10 - QA et documentation

Objectif: rendre le systeme exploitable a long terme.

Livrables:

- tests de rendu;
- tests de migration JSON;
- tests de sauvegarde / publication;
- verification responsive;
- documentation technique et produit.

Definition of done:

- un autre developpeur ou une autre IA peut reprendre le chantier sans ambiguite.

## Ordre d'execution conseille

1. Phase 0
2. Phase 1
3. Phase 3
4. Phase 4
5. Phase 5
6. Phase 2
7. Phase 6
8. Phase 7
9. Phase 8
10. Phase 9
11. Phase 10

## Risques a surveiller

- garder deux sources de verite en parallele trop longtemps;
- melanger la logique metier et la logique CMS;
- multiplier les themes sans moteur de rendu propre;
- ajouter du style sans modele de donnees stable;
- casser l'edition locale de la boutique pendant la migration.

## Etape courante

Etape en cours: `Phase 0 -> Phase 1`

Travail immediat:

- introduire `storefront_project`;
- rendre la page Accueil compatible avec lui;
- faire ecrire le builder dans ce nouveau format tout en preservant l'ancien.
