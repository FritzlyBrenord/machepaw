"use client";

import { supabase } from "@/lib/supabase";
import { fetchCurrentAccount } from "@/hooks/useAccount";
import type { Project } from "@/types/builder-types";
import {
  createFallbackProject,
  parseStorefrontProject,
  serializeStorefrontProject,
} from "@/lib/storefront-projects";

type SellerStorefrontRow = {
  id: string;
  business_name?: string | null;
  store_slug?: string | null;
  storefront_theme_slug?: string | null;
  storefront_theme_config?: unknown;
};

export type CurrentSellerStorefrontProject = {
  sellerId: string;
  storeSlug: string;
  project: Project;
};

export async function loadCurrentSellerStorefrontProject(): Promise<CurrentSellerStorefrontProject | null> {
  const account = await fetchCurrentAccount();
  const seller = account?.seller;

  if (!seller) {
    return null;
  }

  const { data, error } = await supabase
    .from("sellers")
    .select("id,business_name,store_slug,storefront_theme_slug,storefront_theme_config")
    .eq("id", seller.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const row = (data as SellerStorefrontRow | null) ?? null;
  const storeSlug = row?.store_slug?.trim().toLowerCase() || seller.storeSlug || "dynamique";
  const project = parseStorefrontProject(row?.storefront_theme_config, {
    fallbackThemeSlug: row?.storefront_theme_slug || null,
    fallbackProjectName: row?.business_name || seller.businessName,
  });

  return {
    sellerId: seller.id,
    storeSlug,
    project:
      project ||
      createFallbackProject(
        row?.storefront_theme_slug || null,
        row?.business_name || seller.businessName,
      ),
  };
}

export async function saveCurrentSellerStorefrontProject(project: Project) {
  const account = await fetchCurrentAccount();
  const seller = account?.seller;

  if (!seller) {
    throw new Error("Compte vendeur requis pour sauvegarder la boutique.");
  }

  const payload = serializeStorefrontProject(project);

  const { data, error } = await supabase
    .from("sellers")
    .update({
      storefront_theme_config: payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", seller.id)
    .select("id,store_slug")
    .maybeSingle();

  if (error) {
    throw error;
  }

  const row = (data as { id: string; store_slug?: string | null } | null) ?? null;

  return {
    sellerId: seller.id,
    storeSlug: row?.store_slug?.trim().toLowerCase() || seller.storeSlug || "dynamique",
  };
}
