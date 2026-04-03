'use client';

// ============================================
// MAIN APP - Complete E-Commerce Builder
// Inspired by Shopify Theme Editor
// Converted for Next.js 16 App Router
// ============================================

import { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  Undo2,
  Redo2,
  Eye,
  EyeOff,
  Save,
  Monitor,
  Smartphone,
  Tablet,
  Settings,
  Download,
  Upload,
  LayoutTemplate,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { useCurrentAccountQuery } from '@/hooks/useAccount';
import {
  useSellerOrderItemsQuery,
  useSellerProductsQuery,
} from '@/hooks/useSellerWorkspace';
import { useEditorStore } from '@/store/editor-store';
import { SectionRenderer } from '@/components/SectionRenderer';
import { GlobalSectionRenderer } from '@/components/GlobalSectionRenderer';
import { PreviewFrame } from '@/components/PreviewFrame';
import { SectionEditor } from '@/components/SectionEditor';
import { PageSelector } from '@/components/PageSelector';
import { AddSectionModal } from '@/components/AddSectionModal';
import { TemplateSelector } from '@/components/TemplateSelector';
import { PublicStorefront } from '@/components/PublicStorefront';
import { useRouter } from '@/lib/router';
import {
  loadCurrentSellerStorefrontProject,
  saveCurrentSellerStorefrontProject,
} from '@/lib/storefront-project-client';
import {
  buildDynamicCategoryGrid,
  buildStorefrontProductOrderMetrics,
  resolveStorefrontNavigationLinks,
  type StorefrontSectionStoreData,
} from '@/lib/storefront-section-data';

export default function HomePage() {
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isStorefrontHydrating, setIsStorefrontHydrating] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { route, params, navigate } = useRouter();
  const { data: account, isLoading: accountLoading } = useCurrentAccountQuery();
  const { data: sellerProducts = [] } = useSellerProductsQuery();
  const { data: sellerOrderItems = [] } = useSellerOrderItemsQuery();

  const {
    project,
    currentPageId,
    isPreview,
    devicePreview,
    togglePreview,
    undo,
    redo,
    canUndo,
    canRedo,
    moveSection,
    selectSection,
    setDevicePreview,
    exportProject,
    importProject,
  } = useEditorStore();

  useEffect(() => {
    if (!isInitialized) {
      const state = useEditorStore.getState();
      if (!state.currentPageId && state.project.pages.length > 0) {
        state.setCurrentPage(state.project.pages[0].id);
      }
      setIsInitialized(true);
    }
  }, [isInitialized]);

  useEffect(() => {
    if (accountLoading) {
      return;
    }

    let isMounted = true;

    const hydrateStorefrontProject = async () => {
      if (!account?.seller) {
        if (isMounted) {
          setIsStorefrontHydrating(false);
        }
        return;
      }

      try {
        const storefront = await loadCurrentSellerStorefrontProject();

        if (!isMounted || !storefront?.project) {
          return;
        }

        useEditorStore.getState().setProject(storefront.project);
      } catch (error) {
        console.error('Unable to load storefront project from Supabase.', error);
        if (isMounted) {
          toast.error('Impossible de charger la boutique sauvegardee.');
        }
      } finally {
        if (isMounted) {
          setIsStorefrontHydrating(false);
        }
      }
    };

    void hydrateStorefrontProject();

    return () => {
      isMounted = false;
    };
  }, [account?.seller?.id, accountLoading]);

  const sections = (() => {
    const page = project.pages.find((p) => p.id === currentPageId);
    return page?.sections || [];
  })();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((section) => section.id === active.id);
      const newIndex = sections.findIndex((section) => section.id === over.id);
      moveSection(oldIndex, newIndex);
    }
  };

  const headerSections = sections.filter(
    (section) =>
      section.type === 'headerModern' || section.type === 'headerMinimal',
  );
  const footerSections = sections.filter(
    (section) =>
      section.type === 'footerModern' || section.type === 'footerMinimal',
  );
  const contentSections = sections.filter(
    (section) =>
      section.type !== 'headerModern' &&
      section.type !== 'headerMinimal' &&
      section.type !== 'footerModern' &&
      section.type !== 'footerMinimal' &&
      section.type !== 'announcementBar',
  );

  const hasGlobalHeader = !!project.globalSections?.header;
  const hasGlobalFooter = !!project.globalSections?.footer;
  const hasGlobalAnnouncement = !!project.globalSections?.announcementBar;
  const isFunctionalPreviewPage = isPreview && route !== 'home';

  const cssVariables = useMemo(
    () => ({
      '--primary-color': project.settings.primaryColor,
      '--secondary-color': project.settings.secondaryColor,
      '--accent-color': project.settings.accentColor,
      '--background-color': project.settings.backgroundColor,
      '--text-color': project.settings.textColor,
      '--font-family': project.settings.fontFamily,
      '--font-size': `${project.settings.fontSize}px`,
      '--border-radius': `${project.settings.borderRadius}px`,
      '--container-width': project.settings.containerWidth,
    }),
    [project.settings],
  );

  const devicePreviewConfig = {
    desktop: { label: 'Desktop', width: '100%', height: '100%' },
    tablet: { label: 'Tablet', width: '820px', height: '100%' },
    mobile: { label: 'Mobile', width: '430px', height: '100%' },
  }[devicePreview];

  const previewStorefrontStore = useMemo<StorefrontSectionStoreData | null>(() => {
    if (!account?.seller) {
      return null;
    }

    const orderMetricsByProduct = buildStorefrontProductOrderMetrics(
      sellerOrderItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        createdAt: item.createdAt,
      })),
    );
    const headerSource =
      project.globalSections?.header ||
      sections.find(
        (section) =>
          section.type === 'headerModern' || section.type === 'headerMinimal',
      );

    const storefrontStore: StorefrontSectionStoreData = {
      sellerId: account.seller.id,
      businessName: account.seller.businessName,
      storeSlug: account.seller.storeSlug,
      logo: account.seller.logo,
      banner: account.seller.banner,
      contactPhone: account.seller.contactPhone,
      contactEmail: account.seller.contactEmail,
      locationName: account.seller.shippingSettings?.locationName,
      locationDept: account.seller.shippingSettings?.locationDept,
      shippingSettings: {
        freeShippingThreshold: account.seller.shippingSettings?.freeShippingThreshold,
        allowDelivery: account.seller.shippingSettings?.allowDelivery,
        allowPickup: account.seller.shippingSettings?.allowPickup,
        pickupAddress: account.seller.pickupAddress
          ? [account.seller.pickupAddress.address, account.seller.pickupAddress.city, account.seller.pickupAddress.country]
              .filter(Boolean)
              .join(", ")
          : undefined,
        basePrice: account.seller.shippingSettings?.basePrice,
        pricePerKm: account.seller.shippingSettings?.pricePerKm,
        locationName: account.seller.shippingSettings?.locationName,
        locationDept: account.seller.shippingSettings?.locationDept,
        latitude: account.seller.shippingSettings?.latitude,
        longitude: account.seller.shippingSettings?.longitude,
      },
      pickupAddress: account.seller.pickupAddress,
      categories: account.seller.categories,
      products: sellerProducts.map((product) => {
        const orderMetric = orderMetricsByProduct[product.id];

        return {
          id: product.id,
          name: product.name,
          price: product.price,
          oldPrice: product.original_price || undefined,
          categoryId: product.category_id,
          category: product.subcategory || product.category_id,
          subcategory: product.subcategory || undefined,
          image: Array.isArray(product.images) ? product.images[0] : undefined,
          images: product.images,
          rating: product.rating,
          reviewCount: product.review_count,
          isNew: product.is_new,
          isBestseller: product.is_bestseller,
          isFeatured: product.is_featured,
          views: product.views,
          sales: product.sales,
          lastOrderedAt: orderMetric?.lastOrderedAt,
          totalOrderedQuantity: orderMetric?.orderedQuantity || product.sales || 0,
          createdAt: product.created_at,
          status: product.status,
          stock: product.stock,
        };
      }),
    };

    return {
      ...storefrontStore,
      navigationLinks: resolveStorefrontNavigationLinks(
        headerSource?.props,
        storefrontStore,
      ),
      categoryCollections: buildDynamicCategoryGrid(storefrontStore),
    };
  }, [account?.seller, project.globalSections?.header, sections, sellerOrderItems, sellerProducts]);

  const previewRoutePath = (() => {
    switch (route) {
      case 'products':
        return '/products';
      case 'product':
        return '/product';
      case 'cart':
        return '/cart';
      case 'wishlist':
        return '/wishlist';
      case 'account':
        return '/account';
      case 'login':
        return '/connexion';
      case 'register':
        return '/inscription';
      case 'checkout':
        return '/checkout';
      case 'order-detail':
        return '/commande';
      case 'order-confirmation':
        return '/order-confirmation';
      case 'home':
      default:
        return '/';
    }
  })();

  const handleExport = () => {
    const json = exportProject();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${project.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const json = loadEvent.target?.result as string;
      if (importProject(json)) {
        alert('Projet importe avec succes!');
      } else {
        alert("Erreur lors de l'importation du projet.");
      }
    };
    reader.readAsText(file);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const savedStorefront = await saveCurrentSellerStorefrontProject(project);
      const publicUrl = `${window.location.origin}/boutique/${savedStorefront.storeSlug}`;
      toast.success(`Boutique sauvegardee sur ${publicUrl}`);
    } catch (error) {
      console.error('Unable to save storefront project to Supabase.', error);
      toast.error('Impossible de sauvegarder la boutique dans le backend.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderPreviewPageContent = () => {
    if (route === 'home') {
      return null;
    }

    return (
      <PublicStorefront
        project={project}
        path={previewRoutePath}
        orderId={route === 'order-detail' || route === 'order-confirmation' ? params.id : undefined}
        storefrontStore={previewStorefrontStore}
      />
    );
  };

  return (
    <div
      className="h-screen flex flex-col bg-gray-100"
      style={cssVariables as React.CSSProperties}
    >
      <Toaster position="top-right" />

      {!isPreview && (
        <header className="bg-white border-b px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: project.settings.primaryColor }}
              >
                <span className="text-white font-bold text-sm">EB</span>
              </div>
              <span className="font-semibold hidden sm:block">E-Commerce Builder</span>
            </div>

            <Separator orientation="vertical" className="h-6" />
            <PageSelector />
          </div>

          <div className="hidden md:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setDevicePreview('desktop')}
              className={`p-2 rounded transition-colors ${
                devicePreview === 'desktop' ? 'bg-white shadow-sm' : 'hover:bg-white/50'
              }`}
              title="Desktop"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevicePreview('tablet')}
              className={`p-2 rounded transition-colors ${
                devicePreview === 'tablet' ? 'bg-white shadow-sm' : 'hover:bg-white/50'
              }`}
              title="Tablet"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevicePreview('mobile')}
              className={`p-2 rounded transition-colors ${
                devicePreview === 'mobile' ? 'bg-white shadow-sm' : 'hover:bg-white/50'
              }`}
              title="Mobile"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplateSelector(true)}
              className="hidden sm:flex items-center gap-2"
            >
              <LayoutTemplate className="w-4 h-4" />
              Templates
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Exporter le projet
                </DropdownMenuItem>
                <label className="cursor-pointer">
                  <DropdownMenuItem onSelect={(dropdownEvent) => dropdownEvent.preventDefault()}>
                    <Upload className="w-4 h-4 mr-2" />
                    Importer un projet
                  </DropdownMenuItem>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowTemplateSelector(true)}>
                  <LayoutTemplate className="w-4 h-4 mr-2" />
                  Changer de template
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={undo}
                disabled={!canUndo()}
                title="Annuler (Ctrl+Z)"
              >
                <Undo2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={redo}
                disabled={!canRedo()}
                title="Retablir (Ctrl+Y)"
              >
                <Redo2 className="w-4 h-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            <Button
              variant={isPreview ? 'default' : 'outline'}
              size="sm"
              onClick={togglePreview}
              className="flex items-center gap-2"
              style={isPreview ? { backgroundColor: project.settings.primaryColor } : {}}
            >
              {isPreview ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  <span className="hidden sm:inline">Editer</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span className="hidden sm:inline">Previsualiser</span>
                </>
              )}
            </Button>

            <Button
              size="sm"
              onClick={() => void handleSave()}
              disabled={isSaving || accountLoading || isStorefrontHydrating}
              className="flex items-center gap-2"
              style={{ backgroundColor: project.settings.primaryColor }}
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
              </span>
            </Button>
          </div>
        </header>
      )}

      {isPreview && (
        <header className="bg-white border-b px-4 py-2 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-medium">Mode Previsualisation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setDevicePreview('desktop')}
                className={`p-2 rounded transition-colors ${
                  devicePreview === 'desktop' ? 'bg-white shadow-sm' : 'hover:bg-white/50'
                }`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDevicePreview('tablet')}
                className={`p-2 rounded transition-colors ${
                  devicePreview === 'tablet' ? 'bg-white shadow-sm' : 'hover:bg-white/50'
                }`}
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDevicePreview('mobile')}
                className={`p-2 rounded transition-colors ${
                  devicePreview === 'mobile' ? 'bg-white shadow-sm' : 'hover:bg-white/50'
                }`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                togglePreview();
                if (route !== 'home') {
                  navigate('home');
                }
              }}
              style={{ backgroundColor: project.settings.primaryColor }}
            >
              <EyeOff className="w-4 h-4 mr-2" />
              Quitter la previsualisation
            </Button>
          </div>
        </header>
      )}

      <div className="flex-1 flex overflow-hidden">
        <main
          className={`flex-1 overflow-y-auto bg-gray-100 ${
            isPreview ? 'p-4 overflow-hidden' : 'p-4'
          }`}
          onClick={() => selectSection(null)}
        >
          {isStorefrontHydrating ? (
            <div className="mx-auto flex min-h-full max-w-6xl items-center justify-center rounded-3xl bg-white p-10 shadow-lg">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Chargement de la boutique
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  Nous recuperons la derniere version sauvegardee depuis le backend.
                </p>
              </div>
            </div>
          ) : (
            <div
              className={`mx-auto bg-white shadow-lg transition-all duration-300 ${
                isPreview ? 'h-full max-w-full bg-transparent shadow-none' : 'min-h-full max-w-6xl'
              }`}
            >
              {isPreview ? (
                <PreviewFrame
                  frameKey={devicePreview}
                  deviceLabel={devicePreviewConfig.label}
                  frameWidth={devicePreviewConfig.width}
                  frameHeight={devicePreviewConfig.height}
                >
                  {isFunctionalPreviewPage ? (
                    renderPreviewPageContent()
                  ) : (
                    <div className="flex min-h-screen flex-col bg-white" data-header-overlay-root="true">
                      {hasGlobalAnnouncement && (
                        <GlobalSectionRenderer
                          type="announcementBar"
                          isPreview={true}
                          storefrontStore={previewStorefrontStore}
                        />
                      )}
                      {hasGlobalHeader ? (
                        <GlobalSectionRenderer
                          type="header"
                          isPreview={true}
                          storefrontStore={previewStorefrontStore}
                        />
                      ) : (
                        headerSections
                          .filter((section) => section.visible !== false)
                          .map((section) => (
                            <SectionRenderer
                              key={section.id}
                              section={section}
                              isPreview={true}
                              storefrontStore={previewStorefrontStore}
                            />
                          ))
                      )}
                      <div
                        className="flex-1"
                        style={{ marginTop: "calc(0px - var(--header-overlay-offset, 0px))" }}
                      >
                        {contentSections
                          .filter((section) => section.visible !== false)
                          .map((section) => (
                            <SectionRenderer
                              key={section.id}
                              section={section}
                              isPreview={true}
                              storefrontStore={previewStorefrontStore}
                            />
                          ))}
                      </div>
                      {hasGlobalFooter ? (
                        <GlobalSectionRenderer
                          type="footer"
                          isPreview={true}
                          storefrontStore={previewStorefrontStore}
                        />
                      ) : (
                        footerSections
                          .filter((section) => section.visible !== false)
                          .map((section) => (
                            <SectionRenderer
                              key={section.id}
                              section={section}
                              isPreview={true}
                              storefrontStore={previewStorefrontStore}
                            />
                          ))
                      )}
                    </div>
                  )}
                </PreviewFrame>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <div className="flex flex-col min-h-screen pb-20" data-header-overlay-root="true">
                    {hasGlobalAnnouncement && (
                      <GlobalSectionRenderer
                        type="announcementBar"
                        storefrontStore={previewStorefrontStore}
                      />
                    )}

                    {hasGlobalHeader ? (
                      <GlobalSectionRenderer
                        type="header"
                        storefrontStore={previewStorefrontStore}
                      />
                    ) : (
                      headerSections.length > 0 && (
                        <div className="space-y-1">
                          <SortableContext
                            items={sections.map((section) => section.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            {headerSections.map((section) => (
                              <SectionRenderer
                                key={section.id}
                                section={section}
                                storefrontStore={previewStorefrontStore}
                              />
                            ))}
                          </SortableContext>
                        </div>
                      )
                    )}

                    {!hasGlobalHeader && headerSections.length === 0 && (
                      <div className="p-4">
                        <AddSectionModal insertIndex={0} />
                      </div>
                    )}

                    <div
                      className="flex-1 space-y-1"
                      style={{ marginTop: "calc(0px - var(--header-overlay-offset, 0px))" }}
                    >
                      <SortableContext
                        items={sections.map((section) => section.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {contentSections.map((section) => (
                          <SectionRenderer
                            key={section.id}
                            section={section}
                            storefrontStore={previewStorefrontStore}
                          />
                        ))}
                      </SortableContext>

                      <div className="p-4">
                        <AddSectionModal
                          insertIndex={headerSections.length + contentSections.length}
                        />
                      </div>
                    </div>

                    {hasGlobalFooter ? (
                      <GlobalSectionRenderer
                        type="footer"
                        storefrontStore={previewStorefrontStore}
                      />
                    ) : (
                      footerSections.length > 0 && (
                        <div className="space-y-1 mt-auto">
                          <SortableContext
                            items={sections.map((section) => section.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            {footerSections.map((section) => (
                              <SectionRenderer
                                key={section.id}
                                section={section}
                                storefrontStore={previewStorefrontStore}
                              />
                            ))}
                          </SortableContext>
                        </div>
                      )
                    )}

                    {!hasGlobalFooter && footerSections.length === 0 && (
                      <div className="p-4">
                        <AddSectionModal insertIndex={sections.length} />
                      </div>
                    )}
                  </div>
                </DndContext>
              )}
            </div>
          )}
        </main>

        {!isPreview && <SectionEditor />}
      </div>

      <TemplateSelector
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
      />
    </div>
  );
}
