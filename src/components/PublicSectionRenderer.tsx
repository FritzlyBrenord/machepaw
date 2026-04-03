"use client";

import type { Section } from "@/types/builder-types";
import {
  applyStorefrontDataToSection,
  type StorefrontSectionStoreData,
} from "@/lib/storefront-section-data";
import { getSectionComponent } from "@/lib/section-library";
import { ConnectedCheckoutContent } from "@/sections/Commande/Checkout/ConnectedCheckoutContent";

interface PublicSectionRendererProps {
  section: Section;
  storefrontStore?: StorefrontSectionStoreData | null;
  currentPath?: string;
  storefrontCatalog?: any;
  orderId?: string;
}
export function PublicSectionRenderer({
  section,
  storefrontStore,
  currentPath,
  storefrontCatalog,
  orderId,
}: PublicSectionRendererProps) {
  const resolvedSection = applyStorefrontDataToSection(section, storefrontStore);
  const Component = getSectionComponent(resolvedSection.type);

  if (!Component || resolvedSection.visible === false) {
    return null;
  }

  const isHeader =
    resolvedSection.type === "headerModern" ||
    resolvedSection.type === "headerMinimal";
  const isFooter =
    resolvedSection.type === "footerModern" ||
    resolvedSection.type === "footerMinimal";
  const shouldStickHeader =
    resolvedSection.type === "headerModern"
      ? resolvedSection.props?.config?.behavior?.sticky !== false
      : resolvedSection.type === "headerMinimal"
        ? resolvedSection.props?.config?.sticky !== false
        : false;

  const renderedSection =
    resolvedSection.type === "cart" ? (
      <Component
        id={section.id}
        {...resolvedSection.props}
        storefrontStore={storefrontStore}
        enableRuntime
      />
    ) : resolvedSection.type === "checkoutContent" ? (
      <ConnectedCheckoutContent
        id={section.id}
        {...resolvedSection.props}
        storefrontStore={storefrontStore}
      />
    ) : resolvedSection.type === "orderConfirmationContent" ? (
      <Component
        id={section.id}
        {...resolvedSection.props}
        storefrontStore={storefrontStore}
      />
    ) : resolvedSection.type === "orderDetail" ? (
      <Component
        id={section.id}
        {...resolvedSection.props}
        storefrontStore={storefrontStore}
        orderId={orderId}
      />
    ) : resolvedSection.type === "productsContent" ? (
      <Component
        id={section.id}
        {...resolvedSection.props}
        storefrontStore={storefrontStore}
      />
    ) : resolvedSection.type === "productDetailContent" ? (
      <Component
        id={section.id}
        {...resolvedSection.props}
        storefrontStore={storefrontStore}
      />
    ) : (
      <Component
        id={section.id}
        {...resolvedSection.props}
        storefrontStore={storefrontStore}
        isPreview={true}
      />
    );

  return (
    <div
      className={`${isHeader ? (shouldStickHeader ? "sticky top-0 z-50" : "relative z-50") : ""} ${isFooter ? "mt-auto" : ""}`}
    >
      {renderedSection}
    </div>
  );
}
