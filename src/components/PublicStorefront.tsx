"use client";

import { useMemo } from "react";
import type { Project } from "@/types/builder-types";
import { PublicSectionRenderer } from "@/components/PublicSectionRenderer";
import { Toaster } from "@/components/ui/sonner";
import {
  resolveStorefrontNavigationLinks,
  type StorefrontSectionStoreData,
} from "@/lib/storefront-section-data";
import { buildCatalogFromStorefrontStore } from "@/lib/storefront-catalog";

interface PublicStorefrontProps {
  project: Project;
  path: string;
  orderId?: string;
  storefrontStore?: StorefrontSectionStoreData | null;
}

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

export function PublicStorefront({
  project,
  path,
  orderId,
  storefrontStore,
}: PublicStorefrontProps) {
  const currentPage = useMemo(() => {
    const normalizedPath = path === "" ? "/" : path;
    const candidatePaths = STOREFRONT_ALIAS_MAP[normalizedPath] || [normalizedPath];

    return (
      project.pages.find((page) => candidatePaths.includes(page.slug)) ||
      project.pages.find((page) => page.isHome) ||
      project.pages[0]
    );
  }, [path, project.pages]);

  const sections = currentPage?.sections || [];
  const normalizedPath = path === "" ? "/" : path;
  const resolvedStorefrontStore = useMemo(() => {
    if (!storefrontStore) {
      return storefrontStore;
    }

    const headerSource =
      project.globalSections?.header ||
      sections.find(
        (section) =>
          section.type === "headerModern" || section.type === "headerMinimal",
      );

    return {
      ...storefrontStore,
      navigationLinks: resolveStorefrontNavigationLinks(
        headerSource?.props,
        storefrontStore,
      ),
    };
  }, [project.globalSections?.header, sections, storefrontStore]);
  const storefrontCatalog = useMemo(
    () => buildCatalogFromStorefrontStore(resolvedStorefrontStore),
    [resolvedStorefrontStore],
  );
  const headerSections = sections.filter(
    (section) =>
      section.type === "headerModern" || section.type === "headerMinimal"
  );
  const footerSections = sections.filter(
    (section) =>
      section.type === "footerModern" || section.type === "footerMinimal"
  );
  const contentSections = sections.filter(
    (section) =>
      section.type !== "headerModern" &&
      section.type !== "headerMinimal" &&
      section.type !== "footerModern" &&
      section.type !== "footerMinimal" &&
      section.type !== "announcementBar"
  );

  const cssVariables = {
    "--primary-color": project.settings.primaryColor,
    "--secondary-color": project.settings.secondaryColor,
    "--accent-color": project.settings.accentColor,
    "--background-color": project.settings.backgroundColor,
    "--text-color": project.settings.textColor,
    "--font-family": project.settings.fontFamily,
    "--font-size": `${project.settings.fontSize}px`,
    "--border-radius": `${project.settings.borderRadius}px`,
    "--container-width": project.settings.containerWidth,
  } as React.CSSProperties;

  return (
    <div className="min-h-screen bg-white" style={cssVariables}>
      <Toaster position="top-right" />
      <div className="flex min-h-screen flex-col" data-header-overlay-root="true">
        {project.globalSections?.announcementBar ? (
          <PublicSectionRenderer
            section={project.globalSections.announcementBar}
            storefrontStore={resolvedStorefrontStore}
            currentPath={normalizedPath}
            storefrontCatalog={storefrontCatalog}
          />
        ) : null}

        {project.globalSections?.header ? (
          <PublicSectionRenderer
            section={project.globalSections.header}
            storefrontStore={resolvedStorefrontStore}
            currentPath={normalizedPath}
            storefrontCatalog={storefrontCatalog}
          />
        ) : (
          headerSections.map((section) => (
            <PublicSectionRenderer
              key={section.id}
              section={section}
              storefrontStore={resolvedStorefrontStore}
              currentPath={normalizedPath}
              storefrontCatalog={storefrontCatalog}
            />
          ))
        )}

        <div
          className="flex-1"
          style={{ marginTop: "calc(0px - var(--header-overlay-offset, 0px))" }}
        >
          {contentSections.map((section) => (
            <PublicSectionRenderer
              key={section.id}
              section={section}
              storefrontStore={resolvedStorefrontStore}
              currentPath={normalizedPath}
              storefrontCatalog={storefrontCatalog}
              orderId={orderId}
            />
          ))}
        </div>

        {project.globalSections?.footer ? (
          <PublicSectionRenderer
            section={project.globalSections.footer}
            storefrontStore={resolvedStorefrontStore}
            currentPath={normalizedPath}
            storefrontCatalog={storefrontCatalog}
          />
        ) : (
          footerSections.map((section) => (
            <PublicSectionRenderer
              key={section.id}
              section={section}
              storefrontStore={resolvedStorefrontStore}
              currentPath={normalizedPath}
              storefrontCatalog={storefrontCatalog}
            />
          ))
        )}
      </div>
    </div>
  );
}
