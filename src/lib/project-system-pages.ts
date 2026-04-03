import { v4 as uuidv4 } from "uuid";
import { getDefaultSectionProps } from "@/lib/section-defaults";
import type { Page, Project, SectionType } from "@/types/builder-types";

type RequiredPageDefinition = {
  name: string;
  slug: string;
  aliases: string[];
  title: string;
  description: string;
  sectionType: SectionType;
};

const REQUIRED_PAGE_DEFINITIONS: RequiredPageDefinition[] = [
  {
    name: "Produits",
    slug: "/produits",
    aliases: ["/produits", "/products"],
    title: "Produits",
    description: "Explorez la collection complete.",
    sectionType: "productsContent",
  },
  {
    name: "Detail Produit",
    slug: "/produit",
    aliases: ["/produit", "/product"],
    title: "Detail Produit",
    description: "Consultez les informations du produit.",
    sectionType: "productDetailContent",
  },
  {
    name: "Panier",
    slug: "/panier",
    aliases: ["/panier", "/cart"],
    title: "Panier",
    description: "Verifiez votre panier.",
    sectionType: "cart",
  },
  {
    name: "Favoris",
    slug: "/favoris",
    aliases: ["/favoris", "/wishlist"],
    title: "Favoris",
    description: "Retrouvez vos produits sauvegardes.",
    sectionType: "wishlistContent",
  },
  {
    name: "Mon Compte",
    slug: "/compte",
    aliases: ["/compte", "/account"],
    title: "Mon Compte",
    description: "Gerez votre profil et vos commandes.",
    sectionType: "accountContent",
  },
  {
    name: "Connexion",
    slug: "/connexion",
    aliases: ["/connexion", "/login"],
    title: "Connexion",
    description: "Accedez a votre espace client.",
    sectionType: "login",
  },
  {
    name: "Inscription",
    slug: "/inscription",
    aliases: ["/inscription", "/register"],
    title: "Inscription",
    description: "Creez votre compte client.",
    sectionType: "register",
  },
  {
    name: "Checkout",
    slug: "/checkout",
    aliases: ["/checkout"],
    title: "Finaliser la commande",
    description: "Validez votre commande.",
    sectionType: "checkoutContent",
  },
  {
    name: "Confirmation",
    slug: "/confirmation",
    aliases: ["/confirmation", "/order-confirmation"],
    title: "Confirmation",
    description: "Commande confirmee.",
    sectionType: "orderConfirmationContent",
  },
  {
    name: "Details Commande",
    slug: "/commande",
    aliases: ["/commande", "/commandes"],
    title: "Details Commande",
    description: "Consultez le detail de votre commande.",
    sectionType: "orderDetail",
  },
];

function cloneProject(project: Project): Project {
  return JSON.parse(JSON.stringify(project)) as Project;
}

function createSystemPage(definition: RequiredPageDefinition): Page {
  return {
    id: `page-${uuidv4()}`,
    name: definition.name,
    slug: definition.slug,
    isHome: false,
    meta: {
      title: definition.title,
      description: definition.description,
    },
    sections: [
      {
        id: `sect-${uuidv4()}`,
        type: definition.sectionType,
        order: 0,
        props: getDefaultSectionProps(definition.sectionType),
        visible: true,
      },
    ],
  };
}

export function ensureProjectHasSystemPages(project: Project): Project {
  const normalizedProject = cloneProject(project);

  const pages = Array.isArray(normalizedProject.pages) ? normalizedProject.pages : [];
  normalizedProject.pages = pages;

  REQUIRED_PAGE_DEFINITIONS.forEach((definition) => {
    const hasPage = pages.some((page) => definition.aliases.includes(page.slug));

    if (!hasPage) {
      pages.push(createSystemPage(definition));
    }
  });

  return normalizedProject;
}
