"use client";

import { PRODUCT_ONTOLOGY } from "@/data/productOntology";
import { COUNTRIES } from "@/data/haitiCities";
import type {
  CartItem,
  CurrencySetting,
  Product,
  ProductAttributeSelection,
  ProductAttributeValue,
  ShippingDestination,
  ShippingRate,
  ShippingZoneScope,
  SupabaseProduct,
} from "@/data/types";

const FALLBACK_IMAGE = "/images/placeholder.jpg";

const normalizeValue = (value?: string | null) =>
  (value || "").trim().toLowerCase();

const normalizeCountryCode = (value?: string | null) => {
  const normalized = normalizeValue(value);

  if (!normalized) {
    return normalized;
  }

  const match = COUNTRIES.find(
    (country) =>
      normalizeValue(country.code) === normalized ||
      normalizeValue(country.name) === normalized,
  );

  return match ? normalizeValue(match.code) : normalized;
};

const SHIPPING_SCOPE_WEIGHTS: Record<string, number> = {
  global: 0,
  country: 10,
  department: 20,
  arrondissement: 30,
  commune: 40,
  section_communale: 50,
  city: 40, // Same as commune
  custom: 25,
};

const normalizeZoneList = (values?: string[]) =>
  (values || []).map((value) => normalizeValue(value)).filter(Boolean);

const getEffectiveZoneScope = (rate: ShippingRate): ShippingZoneScope => {
  if (rate.zoneScope) {
    return rate.zoneScope;
  }

  if (rate.city || (rate.zoneValues?.length && rate.regions?.length === 0)) {
    return "commune";
  }

  if (rate.country) {
    return "country";
  }

  return "global";
};

const getEffectiveZoneValues = (rate: ShippingRate) => {
  if (rate.zoneValues?.length) {
    return rate.zoneValues;
  }

  if (rate.city) {
    return [rate.city];
  }

  if (rate.country) {
    return [rate.country];
  }

  return rate.regions || [];
};

const getScopeDestinationValue = (
  scope: ShippingRate["zoneScope"],
  destination?: ShippingDestination,
) => {
  switch (scope) {
    case "country":
      return normalizeCountryCode(destination?.country);
    case "department":
      return normalizeValue(destination?.department);
    case "arrondissement":
      return normalizeValue(destination?.arrondissement);
    case "commune":
      return normalizeValue(destination?.commune);
    case "section_communale":
      return normalizeValue(destination?.communalSection);
    case "city":
      return normalizeValue(destination?.city);
    case "custom":
      return normalizeValue(destination?.city);
    default:
      return "";
  }
};

function buildFallbackShippingRate(defaultBaseRate = 0): ShippingRate {
  return {
    id: "shipping-fallback",
    name: "Tarif de base",
    baseRate: defaultBaseRate,
    perKgRate: 0,
    isActive: true,
    isFallback: true,
    zoneScope: "global",
    zoneValues: [],
  };
}

export function getCategoryMeta(categoryId?: string) {
  return PRODUCT_ONTOLOGY.find((category) => category.id === categoryId);
}

export function getSubcategoryMeta(categoryId?: string, subcategoryId?: string) {
  return getCategoryMeta(categoryId)?.subcategories.find(
    (subcategory) => subcategory.id === subcategoryId,
  );
}

export function mapSupabaseProductToProduct(product: SupabaseProduct): Product {
  const category = getCategoryMeta(product.category_id);
  const subcategory = getSubcategoryMeta(product.category_id, product.subcategory);

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: Number(product.price || 0),
    originalPrice: product.original_price
      ? Number(product.original_price)
      : undefined,
    images: product.images?.length ? product.images : [FALLBACK_IMAGE],
    categoryId: product.category_id,
    category: category?.name || product.category_id || "Produit",
    categorySlug: category?.id,
    subcategory: subcategory?.name || product.subcategory,
    tags: product.tags || [],
    rating: Number(product.rating || 0),
    reviewCount: product.review_count || 0,
    stock: product.stock || 0,
    sku: product.sku || "",
    features: product.features || [],
    specifications: product.specifications || {},
    isNew: product.is_new,
    isBestseller: product.is_bestseller,
    isFeatured: product.is_featured,
    discount: product.discount || 0,
    ownerType: product.owner_type,
    ownerId: product.owner_id,
    ownerName: product.owner_name,
    views: product.views || 0,
    sales: product.sales || 0,
    attributes: product.attributes || [],
    hasVariants: product.has_variants,
    variants: product.variants || [],
    minProcessingDays: product.min_processing_days ?? undefined,
    maxProcessingDays: product.max_processing_days ?? undefined,
    createdAt: product.created_at,
  };
}

export function getDiscountedPrice(product: Pick<Product, "price" | "discount">) {
  if (!product.discount || product.discount <= 0) {
    return product.price;
  }

  return product.price * (1 - product.discount / 100);
}

export function getAttributeOptions(attribute: ProductAttributeValue) {
  if (Array.isArray(attribute.value)) {
    return attribute.value.filter(Boolean);
  }

  return attribute.value ? [attribute.value] : [];
}

export function getSelectableAttributes(attributes: ProductAttributeValue[] = []) {
  return attributes.filter((attribute) => getAttributeOptions(attribute).length > 1);
}

export function getStaticAttributes(attributes: ProductAttributeValue[] = []) {
  return attributes.filter((attribute) => getAttributeOptions(attribute).length <= 1);
}

export function buildDefaultAttributeSelections(
  attributes: ProductAttributeValue[] = [],
): ProductAttributeSelection[] {
  return attributes.flatMap((attribute) => {
    const options = getAttributeOptions(attribute);

    if (options.length === 1) {
      return [
        {
          attributeId: attribute.attributeId,
          name: attribute.name,
          value: options[0],
        },
      ];
    }

    return [];
  });
}

export function serializeAttributeSelections(
  selections: ProductAttributeSelection[] = [],
) {
  return [...selections]
    .sort((left, right) => left.attributeId.localeCompare(right.attributeId))
    .map((selection) => `${selection.attributeId}:${selection.value}`)
    .join("|");
}

export function areRequiredSelectionsComplete(
  attributes: ProductAttributeValue[] = [],
  selections: ProductAttributeSelection[] = [],
) {
  const requiredSelectionIds = getSelectableAttributes(attributes).map(
    (attribute) => attribute.attributeId,
  );

  return requiredSelectionIds.every((attributeId) =>
    selections.some((selection) => selection.attributeId === attributeId),
  );
}

export function getDisplayAttributes(
  attributes: ProductAttributeValue[] = [],
  selections: ProductAttributeSelection[] = [],
) {
  return attributes.map((attribute) => {
    const selectedValue = selections.find(
      (selection) => selection.attributeId === attribute.attributeId,
    )?.value;
    const options = getAttributeOptions(attribute);

    return {
      ...attribute,
      options,
      selectedValue:
        selectedValue || (options.length === 1 ? options[0] : undefined),
      requiresChoice: options.length > 1,
    };
  });
}

export function productRequiresConfiguration(product: Product) {
  return getSelectableAttributes(product.attributes).length > 0;
}

export function convertAmount(
  amount: number,
  sourceCurrency?: CurrencySetting | null,
  targetCurrency?: CurrencySetting | null,
) {
  if (!sourceCurrency || !targetCurrency || !Number.isFinite(amount)) {
    return amount;
  }

  if (sourceCurrency.code === targetCurrency.code) {
    return amount;
  }

  return (amount * sourceCurrency.exchangeRate) / targetCurrency.exchangeRate;
}

export function formatConvertedAmount(
  amount: number,
  sourceCurrency?: CurrencySetting | null,
  targetCurrency?: CurrencySetting | null,
) {
  const currency = targetCurrency || sourceCurrency;
  const convertedAmount = convertAmount(amount, sourceCurrency, targetCurrency);

  if (!currency) {
    return amount.toFixed(2);
  }

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency.code,
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals,
  }).format(convertedAmount);
}

export function getCartSubtotal(items: CartItem[]) {
  return items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
}

function getMatchingShippingRates(
  shippingRates: ShippingRate[],
  items: CartItem[],
  destination?: ShippingDestination,
) {
  const totalQuantity = items.reduce((total, item) => total + item.quantity, 0);
  const destinationCountry = normalizeCountryCode(destination?.country);

  return shippingRates.filter((rate) => {
    if (!rate.isActive) {
      return false;
    }

    const effectiveCountryCode = normalizeCountryCode(
      rate.countryCode || rate.country,
    );

    if (effectiveCountryCode && effectiveCountryCode !== destinationCountry) {
      return false;
    }

    const effectiveScope = getEffectiveZoneScope(rate);
    const effectiveZoneValues = normalizeZoneList(getEffectiveZoneValues(rate));

    if (effectiveScope !== "global") {
      const destinationValue = getScopeDestinationValue(effectiveScope, destination);

      if (!destinationValue || !effectiveZoneValues.includes(destinationValue)) {
        return false;
      }
    }

    if (rate.minQuantity && totalQuantity < rate.minQuantity) {
      return false;
    }

    if (rate.maxQuantity && totalQuantity > rate.maxQuantity) {
      return false;
    }

    if (rate.categoryId) {
      const matchesCategory = items.some(
        (item) => item.product.categoryId === rate.categoryId,
      );

      if (!matchesCategory) {
        return false;
      }
    }

    return true;
  });
}

function getShippingRateScore(rate: ShippingRate) {
  let score = 0;

  score += SHIPPING_SCOPE_WEIGHTS[getEffectiveZoneScope(rate)] || 0;

  const zoneValuesCount = getEffectiveZoneValues(rate).length;
  if (zoneValuesCount > 0) {
    score += Math.max(0, 5 - zoneValuesCount);
  }

  if (rate.categoryId) {
    score += 3;
  }

  if (rate.minQuantity || rate.maxQuantity) {
    score += 2;
  }

  score += Math.max(0, (rate.priority || 0) / 10);

  return score;
}

export function resolveShippingRate(
  shippingRates: ShippingRate[],
  items: CartItem[],
  destination?: ShippingDestination,
) {
  const matches = getMatchingShippingRates(shippingRates, items, destination);

  if (!matches.length) {
    return undefined;
  }

  return [...matches].sort((left, right) => {
    const scoreDiff = getShippingRateScore(right) - getShippingRateScore(left);
    if (scoreDiff !== 0) {
      return scoreDiff;
    }

    return left.baseRate - right.baseRate;
  })[0];
}

export function calculateShippingAmount(
  shippingRates: ShippingRate[],
  items: CartItem[],
  destination?: ShippingDestination,
  defaultBaseRate = 0,
) {
  const subtotal = getCartSubtotal(items);
  const rate =
    resolveShippingRate(shippingRates, items, destination) ||
    buildFallbackShippingRate(defaultBaseRate);

  const isFreeThresholdMet = 
    rate.isFreeEnabled && 
    rate.freeShippingThreshold !== undefined && 
    subtotal >= rate.freeShippingThreshold;

  if (isFreeThresholdMet) {
    return {
      amount: 0,
      rate,
      isFree: true,
    };
  }

  return {
    amount: rate.baseRate,
    rate,
    isFree: rate.baseRate === 0,
  };
}
