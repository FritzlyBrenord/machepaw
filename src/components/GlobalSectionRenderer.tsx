// ============================================
// GLOBAL SECTION RENDERER - Renders shared header/footer
// ============================================

import { useEditorStore } from "@/store/editor-store";
import {
  applyStorefrontDataToSection,
  type StorefrontSectionStoreData,
} from "@/lib/storefront-section-data";
import { getSectionComponent } from "@/lib/section-library";

interface GlobalSectionRendererProps {
  type: "header" | "footer" | "announcementBar";
  isPreview?: boolean;
  storefrontStore?: StorefrontSectionStoreData | null;
}

export function GlobalSectionRenderer({
  type,
  isPreview = false,
  storefrontStore,
}: GlobalSectionRendererProps) {
  const { project, selectedSectionId, selectSection } = useEditorStore();
  const section = project.globalSections?.[type];

  if (!section) {
    return null;
  }

  const resolvedSection = applyStorefrontDataToSection(section, storefrontStore);
  const Component = getSectionComponent(resolvedSection.type);

  if (!Component) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded text-center text-sm">
        <p className="text-red-600">
          Global section type "{resolvedSection.type}" not found
        </p>
      </div>
    );
  }

  const isSelected = selectedSectionId === section.id;
  const isVisible = resolvedSection.visible !== false;
  const isHeader = type === "header";
  const isFooter = type === "footer";
  const shouldStickHeader =
    resolvedSection.type === "headerModern"
      ? resolvedSection.props?.config?.behavior?.sticky !== false
      : resolvedSection.type === "headerMinimal"
        ? resolvedSection.props?.config?.sticky !== false
        : false;

  if (isPreview) {
    if (!isVisible) {
      return null;
    }

    return (
      <div
        className={`${isHeader ? (shouldStickHeader ? "sticky top-0 z-50" : "relative z-50") : ""} ${isFooter ? "mt-auto" : ""}`}
      >
        <Component
          id={section.id}
          {...resolvedSection.props}
          storefrontStore={storefrontStore}
          isPreview={true}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative group ${isHeader ? (shouldStickHeader ? "sticky top-0 z-40" : "z-40") : ""} ${isFooter ? "mt-auto" : ""}`}
      onClick={(event) => {
        event.stopPropagation();
        selectSection(section.id);
      }}
    >
      <div
        className={`absolute inset-0 pointer-events-none transition-all z-30 ${
          isSelected
            ? "ring-2 ring-purple-500 ring-offset-2"
            : "group-hover:ring-1 group-hover:ring-purple-300 group-hover:ring-offset-1"
        }`}
      />

      <div
        className={`absolute left-4 top-2 px-3 py-1 rounded-full text-xs font-medium z-40 transition-opacity ${
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        style={{
          backgroundColor: "rgba(147, 51, 234, 0.9)",
          color: "#ffffff",
        }}
      >
        {type.toUpperCase()} GLOBAL
        {!isVisible && " (masque)"}
      </div>

      <div
        className={`${isSelected ? "relative z-10" : ""} ${!isVisible ? "grayscale" : ""}`}
      >
        <Component
          id={section.id}
          {...resolvedSection.props}
          storefrontStore={storefrontStore}
          isPreview={false}
        />
      </div>
    </div>
  );
}
