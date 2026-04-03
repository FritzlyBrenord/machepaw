"use client";

import { useMemo } from "react";
import { useEditorStore } from "@/store/editor-store";
import { PublicSectionRenderer } from "@/components/PublicSectionRenderer";

type ProjectPageContentProps = {
  path: string;
};

const aliasMap: Record<string, string[]> = {
  "/": ["/"],
  "/products": ["/products", "/produits"],
  "/product": ["/product", "/produit"],
  "/cart": ["/cart", "/panier"],
  "/wishlist": ["/wishlist", "/favoris"],
  "/account": ["/account", "/compte"],
  "/connexion": ["/connexion", "/login"],
  "/inscription": ["/inscription", "/register"],
  "/checkout": ["/checkout"],
  "/commande": ["/commande", "/commandes"],
  "/order-confirmation": ["/order-confirmation", "/confirmation"],
};

export function ProjectPageContent({ path }: ProjectPageContentProps) {
  const project = useEditorStore((state) => state.project);

  const currentPage = useMemo(() => {
    const normalizedPath = path === "" ? "/" : path;
    const candidatePaths = aliasMap[normalizedPath] || [normalizedPath];

    return (
      project.pages.find((page) => candidatePaths.includes(page.slug)) ||
      project.pages.find((page) => page.isHome) ||
      project.pages[0]
    );
  }, [path, project.pages]);

  const contentSections = (currentPage?.sections || []).filter(
    (section) =>
      section.type !== "headerModern" &&
      section.type !== "headerMinimal" &&
      section.type !== "footerModern" &&
      section.type !== "footerMinimal" &&
      section.type !== "announcementBar",
  );

  return (
    <>
      {contentSections.map((section) => (
        <PublicSectionRenderer key={section.id} section={section} />
      ))}
    </>
  );
}
