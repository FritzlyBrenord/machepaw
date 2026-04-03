"use client";

import { EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { GlobalSectionRenderer } from "@/components/GlobalSectionRenderer";
import { useNavigate } from "@/lib/router";
import type { StorefrontSectionStoreData } from "@/lib/storefront-section-data";
import { useEditorStore } from "@/store/editor-store";

interface StorefrontLayoutProps {
  children: React.ReactNode;
  storefrontStore?: StorefrontSectionStoreData | null;
}

export function StorefrontLayout({
  children,
  storefrontStore,
}: StorefrontLayoutProps) {
  const navigate = useNavigate();
  const { project, isPreview, setPreview } = useEditorStore();

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

  const hasGlobalHeader = !!project.globalSections?.header;
  const hasGlobalFooter = !!project.globalSections?.footer;
  const hasGlobalAnnouncement = !!project.globalSections?.announcementBar;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={cssVariables}
      data-header-overlay-root="true"
    >
      <Toaster position="top-right" />

      {isPreview && (
        <header className="sticky top-0 z-[100] bg-white border-b px-4 py-2 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-medium">Mode Prévisualisation</span>
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              setPreview(false);
              navigate("home");
            }}
            style={{ backgroundColor: project.settings.primaryColor }}
          >
            <EyeOff className="w-4 h-4 mr-2" />
            Retour à l’édition
          </Button>
        </header>
      )}

      {hasGlobalAnnouncement && (
        <GlobalSectionRenderer
          type="announcementBar"
          isPreview={true}
          storefrontStore={storefrontStore}
        />
      )}

      {hasGlobalHeader && (
        <GlobalSectionRenderer
          type="header"
          isPreview={true}
          storefrontStore={storefrontStore}
        />
      )}

      <div
        className="flex-1"
        style={{ marginTop: "calc(0px - var(--header-overlay-offset, 0px))" }}
      >
        {children}
      </div>

      {hasGlobalFooter && (
        <GlobalSectionRenderer
          type="footer"
          isPreview={true}
          storefrontStore={storefrontStore}
        />
      )}
    </div>
  );
}
