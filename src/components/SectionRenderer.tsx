// ============================================
// SECTION RENDERER - Renders sections based on type
// ============================================

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Settings,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
} from "lucide-react";
import { useEditorStore } from "@/store/editor-store";
import type { Section } from "@/types/builder-types";
import {
  applyStorefrontDataToSection,
  type StorefrontSectionStoreData,
} from "@/lib/storefront-section-data";
import { getSectionComponent } from "@/lib/section-library";
import { ConnectedCheckoutContent } from "@/sections/Commande/Checkout/ConnectedCheckoutContent";

interface SectionRendererProps {
  section: Section;
  isPreview?: boolean;
  storefrontStore?: StorefrontSectionStoreData | null;
}

export function SectionRenderer({
  section,
  isPreview = false,
  storefrontStore,
}: SectionRendererProps) {
  const {
    selectedSectionId,
    selectSection,
    deleteSection,
    duplicateSection,
    moveSection,
    toggleSectionVisibility,
    project,
    currentPageId,
  } = useEditorStore();

  const resolvedSection = applyStorefrontDataToSection(section, storefrontStore);
  const isSelected = selectedSectionId === section.id;
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
  const isVisible = resolvedSection.visible !== false;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: section.id,
    disabled: isPreview,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : !isVisible ? 0.5 : 1,
  };

  const Component = getSectionComponent(resolvedSection.type);

  if (!Component) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-lg text-center">
        <p className="text-red-600">
          Section type "{resolvedSection.type}" not found
        </p>
      </div>
    );
  }

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
        orderId={(project as any).metadata?.sampleOrderId}
        isPreview
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
        isPreview={isPreview}
      />
    );

  if (isPreview) {
    if (!isVisible) {
      return null;
    }

    return (
      <div
        className={`${isHeader ? (shouldStickHeader ? "sticky top-0 z-50" : "relative z-50") : ""} ${isFooter ? "mt-auto" : ""}`}
      >
        {renderedSection}
      </div>
    );
  }

  const currentPage = project.pages.find((page) => page.id === currentPageId);
  const allSections = currentPage?.sections || [];
  const currentIndex = allSections.findIndex((item: Section) => item.id === section.id);
  const canMoveUp = currentIndex > 0;
  const canMoveDown = currentIndex < allSections.length - 1;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isHeader ? (shouldStickHeader ? "sticky top-0 z-40" : "z-40") : ""} ${isFooter ? "mt-auto" : ""}`}
      onClick={(event) => {
        event.stopPropagation();
        selectSection(section.id);
      }}
    >
      <div
        className={`absolute inset-0 pointer-events-none transition-all z-30 ${
          isSelected
            ? "ring-2 ring-blue-500 ring-offset-2"
            : "group-hover:ring-1 group-hover:ring-blue-300 group-hover:ring-offset-1"
        }`}
      />

      <div
        className={`absolute right-4 top-4 flex items-center gap-1 z-40 bg-white rounded-lg shadow-lg border p-1 transition-opacity ${
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <button
          onClick={(event) => {
            event.stopPropagation();
            toggleSectionVisibility(section.id);
          }}
          className={`p-2 hover:bg-gray-100 rounded ${!isVisible ? "bg-yellow-100" : ""}`}
          title={isVisible ? "Masquer" : "Afficher"}
        >
          {isVisible ? (
            <Eye className="w-4 h-4 text-gray-600" />
          ) : (
            <EyeOff className="w-4 h-4 text-yellow-600" />
          )}
        </button>

        <button
          {...attributes}
          {...listeners}
          className="p-2 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing"
          title="Deplacer"
        >
          <GripVertical className="w-4 h-4 text-gray-600" />
        </button>

        <button
          onClick={(event) => {
            event.stopPropagation();
            if (canMoveUp) {
              moveSection(currentIndex, currentIndex - 1);
            }
          }}
          disabled={!canMoveUp}
          className="p-2 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
          title="Monter"
        >
          <ChevronUp className="w-4 h-4 text-gray-600" />
        </button>

        <button
          onClick={(event) => {
            event.stopPropagation();
            if (canMoveDown) {
              moveSection(currentIndex, currentIndex + 1);
            }
          }}
          disabled={!canMoveDown}
          className="p-2 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
          title="Descendre"
        >
          <ChevronDown className="w-4 h-4 text-gray-600" />
        </button>

        <button
          onClick={(event) => {
            event.stopPropagation();
            selectSection(section.id);
          }}
          className={`p-2 rounded ${isSelected ? "bg-blue-100" : "hover:bg-gray-100"}`}
          title="Parametres"
        >
          <Settings className="w-4 h-4 text-gray-600" />
        </button>

        <button
          onClick={(event) => {
            event.stopPropagation();
            duplicateSection(section.id);
          }}
          className="p-2 hover:bg-gray-100 rounded"
          title="Dupliquer"
        >
          <Copy className="w-4 h-4 text-gray-600" />
        </button>

        <button
          onClick={(event) => {
            event.stopPropagation();
            deleteSection(section.id);
          }}
          className="p-2 hover:bg-red-100 rounded"
          title="Supprimer"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      </div>

      <div
        className={`absolute left-4 top-4 px-3 py-1 rounded-full text-xs font-medium z-40 transition-opacity ${
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        style={{
          backgroundColor: isVisible
            ? "rgba(0, 0, 0, 0.7)"
            : "rgba(234, 179, 8, 0.8)",
          color: "#ffffff",
        }}
      >
        {resolvedSection.type}
        {!isVisible && " (masque)"}
      </div>

      <div
        className={`${isSelected ? "relative z-10" : ""} ${!isVisible ? "grayscale" : ""}`}
      >
        {renderedSection}
      </div>
    </div>
  );
}
