import { PublicStorefront } from "@/components/PublicStorefront";
import { getApprovedSellerBySlug, getApprovedSellerProducts } from "@/lib/boutiqueStorefront";
import { getPublishedStorefrontProjectBySlug } from "@/lib/storefront-projects";
import { buildDynamicCategoryGrid } from "@/lib/storefront-section-data";

interface BoutiqueOrderDetailRouteProps {
  params: Promise<{
    slug: string;
    id: string;
  }>;
}

export default async function BoutiqueOrderDetailRoute({ params }: BoutiqueOrderDetailRouteProps) {
  const resolvedParams = await params;
  const [project, storefrontStoreBase] = await Promise.all([
    getPublishedStorefrontProjectBySlug(resolvedParams.slug),
    getApprovedSellerBySlug(resolvedParams.slug),
  ]);

  const storefrontProducts = storefrontStoreBase
    ? await getApprovedSellerProducts(storefrontStoreBase)
    : [];

  const storefrontStore = storefrontStoreBase
    ? {
        ...storefrontStoreBase,
        sellerId: storefrontStoreBase.id,
        shippingSettings: {
          freeShippingThreshold:
            (storefrontStoreBase as {
              shippingSettings?: { freeShippingThreshold?: number };
            }).shippingSettings?.freeShippingThreshold,
          allowDelivery:
            (storefrontStoreBase as {
              shippingSettings?: { allowDelivery?: boolean };
            }).shippingSettings?.allowDelivery,
          allowPickup:
            (storefrontStoreBase as {
              shippingSettings?: { allowPickup?: boolean };
            }).shippingSettings?.allowPickup,
          pickupAddress: storefrontStoreBase.pickupAddress
            ? [
                storefrontStoreBase.pickupAddress.address,
                storefrontStoreBase.pickupAddress.city,
                storefrontStoreBase.pickupAddress.country,
              ]
                .filter(Boolean)
                .join(", ")
            : undefined,
          basePrice:
            (storefrontStoreBase as {
              shippingSettings?: { basePrice?: number };
            }).shippingSettings?.basePrice,
          pricePerKm:
            (storefrontStoreBase as {
              shippingSettings?: { pricePerKm?: number };
            }).shippingSettings?.pricePerKm,
          locationName:
            (storefrontStoreBase as {
              shippingSettings?: { locationName?: string };
            }).shippingSettings?.locationName,
          locationDept:
            (storefrontStoreBase as {
              shippingSettings?: { locationDept?: string };
            }).shippingSettings?.locationDept,
          latitude:
            (storefrontStoreBase as {
              shippingSettings?: { latitude?: number };
            }).shippingSettings?.latitude,
          longitude:
            (storefrontStoreBase as {
              shippingSettings?: { longitude?: number };
            }).shippingSettings?.longitude,
        },
        products: storefrontProducts.map((product) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          oldPrice: product.originalPrice,
          categoryId: product.categoryId,
          category: product.subcategory || product.category,
          subcategory: product.subcategory,
          image: Array.isArray(product.images) ? product.images[0] : undefined,
          images: product.images,
          rating: product.rating,
          reviewCount: product.reviewCount,
          badge: product.isNew ? "Nouveau" : undefined,
          isNew: product.isNew,
          isFeatured: product.isFeatured,
          createdAt: product.createdAt,
          status: "active",
          stock: product.stock,
        })),
      }
    : null;

  const resolvedStorefrontStore = storefrontStore
    ? {
        ...storefrontStore,
        categoryCollections: buildDynamicCategoryGrid(storefrontStore),
      }
    : null;

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Boutique introuvable</h1>
          <p className="mt-2 text-gray-600">
            Cette boutique n&apos;a pas encore ete publiee.
          </p>
        </div>
      </div>
    );
  }

  return (
    <PublicStorefront
      project={project}
      path="/commande"
      orderId={resolvedParams.id}
      storefrontStore={resolvedStorefrontStore}
    />
  );
}
