"use client";

import { useMemo } from "react";
import { PublicStorefront } from "@/components/PublicStorefront";
import { useCurrentAccountQuery } from "@/hooks/useAccount";
import {
  useSellerOrderItemsQuery,
  useSellerProductsQuery,
} from "@/hooks/useSellerWorkspace";
import {
  buildDynamicCategoryGrid,
  buildStorefrontProductOrderMetrics,
  resolveStorefrontNavigationLinks,
  type StorefrontSectionStoreData,
} from "@/lib/storefront-section-data";
import { useEditorStore } from "@/store/editor-store";

interface CurrentSellerProjectPageProps {
  path: string;
  orderId?: string;
}

export function CurrentSellerProjectPage({
  path,
  orderId,
}: CurrentSellerProjectPageProps) {
  const project = useEditorStore((state) => state.project);
  const { data: account } = useCurrentAccountQuery();
  const { data: sellerProducts = [] } = useSellerProductsQuery();
  const { data: sellerOrderItems = [] } = useSellerOrderItemsQuery();

  const storefrontStore = useMemo<StorefrontSectionStoreData | null>(() => {
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
    const headerSource = project.globalSections?.header;
    const nextStore: StorefrontSectionStoreData = {
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
          ? [
              account.seller.pickupAddress.address,
              account.seller.pickupAddress.city,
              account.seller.pickupAddress.country,
            ]
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
      ...nextStore,
      navigationLinks: resolveStorefrontNavigationLinks(headerSource?.props, nextStore),
      categoryCollections: buildDynamicCategoryGrid(nextStore),
    };
  }, [account?.seller, project.globalSections?.header, sellerOrderItems, sellerProducts]);

  return (
    <PublicStorefront
      project={project}
      path={path}
      orderId={orderId}
      storefrontStore={storefrontStore}
    />
  );
}
