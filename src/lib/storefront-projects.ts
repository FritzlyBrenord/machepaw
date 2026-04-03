import type { Project, Template } from "@/types/builder-types";
import {
  fashionBoutiqueTemplate,
  homeLivingTemplate,
  techStoreTemplate,
  maisonOrTemplate,
  templates,
} from "@/lib/templates";
import { ensureProjectHasSystemPages } from "@/lib/project-system-pages";
import { createServerSupabaseClient } from "@/lib/serverSupabase";

type StorefrontProjectDocument = {
  version: 1;
  schema: "builder-project";
  project: Project;
  updatedAt: string;
};

type SellerStorefrontRow = {
  id: string;
  business_name?: string | null;
  store_slug?: string | null;
  storefront_theme_slug?: string | null;
  storefront_theme_config?: unknown;
};

const GENERIC_STORE_ALIASES = new Set(["dynamique", "dynamic", "default", "demo"]);

function cloneProject(project: Project): Project {
  return JSON.parse(JSON.stringify(project)) as Project;
}

function isProjectLike(value: unknown): value is Project {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<Project>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    Array.isArray(candidate.pages) &&
    Boolean(candidate.settings && typeof candidate.settings === "object")
  );
}

function isStorefrontProjectDocument(
  value: unknown,
): value is StorefrontProjectDocument {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<StorefrontProjectDocument>;
  return candidate.schema === "builder-project" && isProjectLike(candidate.project);
}

export function slugifyProjectName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function resolveTemplateByStorefrontThemeSlug(themeSlug?: string | null): Template {
  switch ((themeSlug || "").trim().toLowerCase()) {
    case "noir":
      return techStoreTemplate;
    case "maison":
      return homeLivingTemplate;
    case "atelier":
    default:
      return fashionBoutiqueTemplate;
  }
}

export function createFallbackProject(
  themeSlug?: string | null,
  projectName?: string | null,
): Project {
  const template = resolveTemplateByStorefrontThemeSlug(themeSlug);
  const fallbackProject = ensureProjectHasSystemPages(cloneProject(template.project));

  if (projectName?.trim()) {
    fallbackProject.name = projectName.trim();
  }

  return fallbackProject;
}

export function serializeStorefrontProject(project: Project): StorefrontProjectDocument {
  return {
    version: 1,
    schema: "builder-project",
    project: cloneProject(project),
    updatedAt: new Date().toISOString(),
  };
}

export function parseStorefrontProject(
  value: unknown,
  options?: {
    fallbackThemeSlug?: string | null;
    fallbackProjectName?: string | null;
  },
): Project | null {
  if (isStorefrontProjectDocument(value)) {
    return ensureProjectHasSystemPages(cloneProject(value.project));
  }

  if (isProjectLike(value)) {
    return ensureProjectHasSystemPages(cloneProject(value));
  }

  if (options?.fallbackThemeSlug || options?.fallbackProjectName) {
    return createFallbackProject(
      options.fallbackThemeSlug,
      options.fallbackProjectName,
    );
  }

  return null;
}

async function getSellerStorefrontRowBySlug(
  slug: string,
  allowUnpublished = process.env.NODE_ENV !== "production",
): Promise<SellerStorefrontRow | null> {
  const normalizedSlug = slug.trim().toLowerCase();

  if (!normalizedSlug) {
    return null;
  }

  const supabase = createServerSupabaseClient();
  let query = supabase
    .from("sellers")
    .select(
      "id,business_name,store_slug,storefront_theme_slug,storefront_theme_config,status",
    )
    .eq("store_slug", normalizedSlug);

  if (!allowUnpublished) {
    query = query.eq("status", "approved");
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw error;
  }

  return (data as SellerStorefrontRow | null) ?? null;
}

export async function getPublishedStorefrontProjectBySlug(
  slug: string,
): Promise<Project | null> {
  const seller = await getSellerStorefrontRowBySlug(slug);

  if (seller) {
    return parseStorefrontProject(seller.storefront_theme_config, {
      fallbackThemeSlug: seller.storefront_theme_slug,
      fallbackProjectName: seller.business_name,
    });
  }

  if (GENERIC_STORE_ALIASES.has(slug.trim().toLowerCase())) {
    return createFallbackProject();
  }

  const fallbackTemplate = templates.find(
    (template) => slugifyProjectName(template.project.name) === slug,
  );

  if (fallbackTemplate) {
    return cloneProject(fallbackTemplate.project);
  }

  return null;
}

export function resolvePublicPagePath(pathSegments?: string[]) {
  if (!pathSegments || pathSegments.length === 0) {
    return "/";
  }

  // Handle specialized routes with IDs (like /commande/[id])
  if (pathSegments[0] === "commande" || pathSegments[0] === "order-tracking") {
    return "/commande";
  }

  const cleanPath = pathSegments.join("/");
  return `/${cleanPath}`;
}
