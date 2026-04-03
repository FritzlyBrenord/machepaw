import { PRODUCT_ONTOLOGY } from "@/data/productOntology";
import type { CategoryWithAttributes } from "@/data/types";

function normalizeCategoryValue(value?: string | null) {
  return (value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function isUuidLike(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value.trim(),
  );
}

function resolveCategoryLabel(
  value: string,
  categories: CategoryWithAttributes[] = [],
) {
  const normalizedValue = normalizeCategoryValue(value);

  if (!normalizedValue) {
    return "";
  }

  const categoryMatch = categories.find((category) => {
    const candidates = [
      category.id,
      category.slug,
      category.name,
      category.parentId || "",
    ];

    return candidates.some(
      (candidate) => normalizeCategoryValue(candidate) === normalizedValue,
    );
  });

  if (categoryMatch?.name?.trim()) {
    return categoryMatch.name.trim();
  }

  const ontologyMatch = PRODUCT_ONTOLOGY.find((category) => {
    const candidates = [category.id, category.name];
    return candidates.some(
      (candidate) => normalizeCategoryValue(candidate) === normalizedValue,
    );
  });

  if (ontologyMatch?.name?.trim()) {
    return ontologyMatch.name.trim();
  }

  if (isUuidLike(value)) {
    return "";
  }

  return value.trim();
}

export function resolveCategoryLabels(
  values: string[] = [],
  categories: CategoryWithAttributes[] = [],
) {
  const seen = new Set<string>();

  return values
    .map((value) => resolveCategoryLabel(value, categories))
    .filter((value) => value.length > 0)
    .filter((value) => {
      const normalizedValue = normalizeCategoryValue(value);
      if (!normalizedValue || seen.has(normalizedValue)) {
        return false;
      }
      seen.add(normalizedValue);
      return true;
    });
}
