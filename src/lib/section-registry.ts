// ============================================
// SECTION REGISTRY - Automatic schema discovery
// Reads section schemas directly from migrated section components.
// Non-migrated sections still exist via the generated manifest, but
// they expose an empty schema until they are migrated.
// ============================================

import type { SectionType } from "@/types/builder-types";
import {
  generatedSectionComponents,
  generatedSectionManifest,
  getGeneratedSectionDefinition,
} from "@/generated/section-manifest";

export type SettingType =
  | "text"
  | "textarea"
  | "number"
  | "color"
  | "select"
  | "checkbox"
  | "image"
  | "url"
  | "richtext"
  | "range"
  | "font";

export interface Setting {
  id: string;
  type: SettingType;
  label: string;
  default?: any;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  info?: string;
}

export interface BlockSchema {
  type: string;
  name: string;
  itemsPath?: string;
  settings: Setting[];
}

export interface SectionSchema {
  name: string;
  type: SectionType;
  category:
    | "header"
    | "content"
    | "footer"
    | "product"
    | "collection"
    | "cart"
    | "checkout"
    | "auth"
    | "account";
  description?: string;
  icon?: string;
  settings: Setting[];
  blocks?: BlockSchema[];
  maxBlocks?: number;
  presets?: Record<string, any>;
  defaults?: Record<string, any>;
}

type SchemaBearingComponent = {
  schema?: Partial<SectionSchema>;
};

function buildGeneratedFallbackSchema(type: SectionType): SectionSchema | undefined {
  const generatedEntry = getGeneratedSectionDefinition(type);

  if (!generatedEntry) {
    return undefined;
  }

  return {
    name: generatedEntry.displayName,
    type,
    category: generatedEntry.category as SectionSchema["category"],
    description: `${generatedEntry.pageGroup} / ${generatedEntry.family}`,
    icon: generatedEntry.icon,
    settings: [],
    blocks: [],
    defaults: undefined,
  };
}

function getAutomaticSchema(type: SectionType): SectionSchema | undefined {
  const fallbackSchema = buildGeneratedFallbackSchema(type);

  if (!fallbackSchema) {
    return undefined;
  }

  const component = generatedSectionComponents[type] as SchemaBearingComponent | undefined;
  const componentSchema = component?.schema;

  if (!componentSchema) {
    return fallbackSchema;
  }

  return {
    ...fallbackSchema,
    ...componentSchema,
    type: (componentSchema.type as SectionType | undefined) || fallbackSchema.type,
    category: componentSchema.category || fallbackSchema.category,
    settings: componentSchema.settings || fallbackSchema.settings,
    blocks: componentSchema.blocks || fallbackSchema.blocks,
    defaults: componentSchema.defaults || fallbackSchema.defaults,
  };
}

function hasAutomaticSchema(schema?: SectionSchema): boolean {
  if (!schema) {
    return false;
  }

  return (
    schema.settings.length > 0 ||
    (schema.blocks?.length || 0) > 0 ||
    (schema.defaults ? Object.keys(schema.defaults).length > 0 : false)
  );
}

class SectionRegistry {
  private sections: Map<SectionType, SectionSchema> = new Map();

  register(schema: SectionSchema) {
    this.sections.set(schema.type, schema);
  }

  get(type: SectionType): SectionSchema | undefined {
    const automaticSchema = getAutomaticSchema(type);

    if (hasAutomaticSchema(automaticSchema)) {
      return automaticSchema;
    }

    return this.sections.get(type) || automaticSchema;
  }

  getAll(): SectionSchema[] {
    const knownTypes = new Set<SectionType>([
      ...generatedSectionManifest.map((entry) => entry.type as SectionType),
      ...this.sections.keys(),
    ]);

    return Array.from(knownTypes)
      .map((type) => this.get(type))
      .filter((schema): schema is SectionSchema => Boolean(schema));
  }

  getByCategory(category: SectionSchema["category"]): SectionSchema[] {
    return this.getAll().filter((schema) => schema.category === category);
  }

  getCategories(): { id: SectionSchema["category"]; label: string }[] {
    return [
      { id: "header", label: "Headers" },
      { id: "content", label: "Contenu" },
      { id: "product", label: "Produits" },
      { id: "collection", label: "Collections" },
      { id: "cart", label: "Panier" },
      { id: "checkout", label: "Commande" },
      { id: "account", label: "Compte" },
      { id: "auth", label: "Auth" },
      { id: "footer", label: "Footers" },
    ];
  }
}

export const sectionRegistry = new SectionRegistry();

export default sectionRegistry;
