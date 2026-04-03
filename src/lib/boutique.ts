import { PRODUCT_ONTOLOGY } from "@/data/productOntology";
import type { CartItem, Product } from "@/data/types";

type BoutiqueMatcher = {
  sellerId?: string;
  storeSlug: string;
};

function normalizeCategoryLabel(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function normalizeBoutiqueCategoryLabel(value: string) {
  return normalizeCategoryLabel(value);
}

function splitCategoryLabel(value: string) {
  return value
    .split("&")
    .map((part) => part.trim())
    .filter(Boolean);
}

const CATEGORY_LOOKUP = PRODUCT_ONTOLOGY.flatMap((category) => {
  const keywords = new Set([category.id, category.name, ...splitCategoryLabel(category.name)]);
  return Array.from(keywords).map((keyword) => ({
    keyword: normalizeCategoryLabel(keyword),
    categoryId: category.id,
  }));
});

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

export function getBoutiqueCategoryLabels(value: string) {
  return splitCategoryLabel(value);
}

export function resolveBoutiqueCollectionCategoryId(label: string) {
  const normalized = normalizeCategoryLabel(label);

  if (!normalized) {
    return "";
  }

  const exactMatch = CATEGORY_LOOKUP.find((entry) => entry.keyword === normalized);

  if (exactMatch) {
    return exactMatch.categoryId;
  }

  const partialMatch = CATEGORY_LOOKUP.find(
    (entry) =>
      normalized.includes(entry.keyword) || entry.keyword.includes(normalized),
  );

  return partialMatch?.categoryId || normalized.replace(/\s+/g, "-");
}

export function buildBoutiqueCategoryMenuItems(
  basePath: string,
  labels: string[],
): Array<{ label: string; href: string }> {
  const seen = new Set<string>();

  return labels
    .flatMap((label) => getBoutiqueCategoryLabels(label))
    .filter((label) => {
      const normalized = normalizeCategoryLabel(label);
      if (!normalized || seen.has(normalized)) {
        return false;
      }
      seen.add(normalized);
      return true;
    })
    .map((label) => ({
      label,
      href: `${basePath}/collection?category=${encodeURIComponent(
        resolveBoutiqueCollectionCategoryId(label),
      )}`,
    }));
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

  if (href.startsWith("/store/")) {
    return href.replace(/^\/store\//, "/boutique/");
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
