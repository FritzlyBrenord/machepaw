import type { CartItem, Product } from "@/data/types";

type BoutiqueMatcher = {
  sellerId?: string;
  storeSlug: string;
};

export function getBoutiqueBasePath(storeSlug: string) {
  return `/boutique/${storeSlug}`;
}

export function isProductFromBoutique(
  product: Pick<Product, "sellerId" | "storeSlug">,
  boutique: BoutiqueMatcher,
) {
  return (
    product.storeSlug === boutique.storeSlug ||
    (Boolean(boutique.sellerId) && product.sellerId === boutique.sellerId)
  );
}

export function getBoutiqueCartItems(items: CartItem[], boutique: BoutiqueMatcher) {
  return items.filter((item) => isProductFromBoutique(item.product, boutique));
}

export function getBoutiqueCartItemId(item: CartItem) {
  return item.id || item.product.id;
}

export function resolveBoutiqueHref(
  href: string | null | undefined,
  boutique: BoutiqueMatcher,
) {
  if (!href) {
    return getBoutiqueBasePath(boutique.storeSlug);
  }

  if (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  ) {
    return href;
  }

  if (
    href.startsWith("javascript:") ||
    href.startsWith("data:")
  ) {
    return getBoutiqueBasePath(boutique.storeSlug);
  }

  if (href.startsWith("#")) {
    return href;
  }

  if (href.startsWith("/boutique/")) {
    return href;
  }

  const basePath = getBoutiqueBasePath(boutique.storeSlug);

  if (href === "/") {
    return basePath;
  }

  if (href.startsWith("/")) {
    return `${basePath}${href}`;
  }

  return `${basePath}/${href.replace(/^\/+/, "")}`;
}
