import sellerPlanCatalog from "@/data/sellerPlanCatalog.json";
import type {
  Seller,
  SellerPlan,
  SellerPlanFeature,
  SellerPlanLimits,
  SellerPlanSlug,
} from "@/data/types";

type SellerPlanCatalogEntry = Omit<
  SellerPlan,
  "id" | "createdAt" | "updatedAt" | "subscribersCount" | "activeSubscribersCount" | "pendingRequestsCount"
>;

export const DEFAULT_SELLER_PLANS = sellerPlanCatalog as SellerPlanCatalogEntry[];

export function getDefaultSellerPlanBySlug(slug: string) {
  return DEFAULT_SELLER_PLANS.find((plan) => plan.slug === slug);
}

export function getSellerActivePlan(seller?: Seller | null) {
  return seller?.currentPlan || null;
}

export function getSellerRequestedPlan(seller?: Seller | null) {
  return seller?.requestedPlan || null;
}

export function getPlanFeature(plan: SellerPlan | SellerPlanCatalogEntry | null | undefined, key: string) {
  return plan?.features.find((feature) => feature.key === key);
}

export function isPlanFeatureEnabled(
  plan: SellerPlan | SellerPlanCatalogEntry | null | undefined,
  key: string,
) {
  const feature = getPlanFeature(plan, key);

  if (feature) {
    return feature.enabled;
  }

  const limitValue = plan?.limits?.[key];

  if (typeof limitValue === "boolean") {
    return limitValue;
  }

  if (typeof limitValue === "number") {
    return limitValue > 0;
  }

  return false;
}

export function getPlanLimit(
  plan: SellerPlan | SellerPlanCatalogEntry | null | undefined,
  key: string,
) {
  return plan?.limits?.[key];
}

export function getPlanNumericLimit(
  plan: SellerPlan | SellerPlanCatalogEntry | null | undefined,
  key: string,
) {
  const value = getPlanLimit(plan, key);
  return typeof value === "number" ? value : 0;
}

export function isPaidSellerPlan(plan?: SellerPlan | null) {
  return Boolean(plan && Number(plan.promoPrice ?? plan.price ?? 0) > 0);
}

export function getSellerPlanEffectivePrice(plan?: SellerPlan | null) {
  if (!plan) {
    return 0;
  }

  const promoPrice = Number(plan.promoPrice ?? 0);
  return promoPrice > 0 ? promoPrice : Number(plan.price ?? 0);
}

export function sellerNeedsPlanSelection(seller?: Seller | null) {
  return Boolean(seller && seller.status === "approved" && !seller.planSelectionCompleted);
}

export function canSellerAccessRoute(seller: Seller | null | undefined, pathname: string) {
  const plan = getSellerActivePlan(seller);

  if (!seller || !plan) {
    return {
      allowed: pathname === "/vendeur/plan",
      reason: "choose_plan",
    };
  }

  if (pathname === "/vendeur/promotions" || pathname.startsWith("/vendeur/promotions/")) {
    if (getPlanNumericLimit(plan, "promotions") < 1 && !isPlanFeatureEnabled(plan, "promotions")) {
      return { allowed: false, reason: "promotions_locked" };
    }
  }

  if (pathname === "/vendeur/annonces" || pathname.startsWith("/vendeur/annonces/")) {
    if (getPlanNumericLimit(plan, "announcements") < 1 && !isPlanFeatureEnabled(plan, "announcements")) {
      return { allowed: false, reason: "announcements_locked" };
    }
  }

  if (pathname === "/vendeur/statistiques" || pathname.startsWith("/vendeur/statistiques/")) {
    if (!isPlanFeatureEnabled(plan, "analytics")) {
      return { allowed: false, reason: "analytics_locked" };
    }
  }

  return { allowed: true as const, reason: null };
}

export function normalizePlanFeatures(value: unknown): SellerPlanFeature[] {
  return Array.isArray(value)
    ? value
        .filter((entry) => entry && typeof entry === "object")
        .map((entry) => {
          const record = entry as Record<string, unknown>;
          return {
            key: String(record.key || ""),
            label: String(record.label || ""),
            enabled: Boolean(record.enabled),
            description:
              typeof record.description === "string" ? record.description : undefined,
          };
        })
        .filter((feature) => feature.key && feature.label)
    : [];
}

export function normalizePlanLimits(value: unknown): SellerPlanLimits {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as SellerPlanLimits;
}

export const SELLER_PLAN_SLUGS: SellerPlanSlug[] = ["free", "pro", "premium"];
