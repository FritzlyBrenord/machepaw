import { generatedSectionComponents, generatedSectionManifest } from "@/generated/section-manifest";
import { sectionRegistry, type SectionSchema } from "@/lib/section-registry";

export interface SectionLibraryEntry extends SectionSchema {
  pageGroup: string;
  family: string;
  sourcePath: string;
}

export interface SectionLibraryGroup {
  key: string;
  label: string;
  sections: SectionLibraryEntry[];
}

export interface SectionLibraryTab {
  key: string;
  label: string;
  groups: SectionLibraryGroup[];
}

const preferredTabOrder = [
  "Global",
  "Accueil",
  "Catalogue",
  "Panier",
  "Commande",
  "Compte",
  "Auth",
];

function sortTabLabels(left: string, right: string) {
  const leftIndex = preferredTabOrder.indexOf(left);
  const rightIndex = preferredTabOrder.indexOf(right);
  const hasLeftPriority = leftIndex !== -1;
  const hasRightPriority = rightIndex !== -1;

  if (hasLeftPriority && hasRightPriority) {
    return leftIndex - rightIndex;
  }

  if (hasLeftPriority) {
    return -1;
  }

  if (hasRightPriority) {
    return 1;
  }

  return left.localeCompare(right, "fr");
}

function sortEntries(left: SectionLibraryEntry, right: SectionLibraryEntry) {
  return (
    left.pageGroup.localeCompare(right.pageGroup, "fr") ||
    left.family.localeCompare(right.family, "fr") ||
    left.name.localeCompare(right.name, "fr")
  );
}

export function getSectionComponent(type: string) {
  return generatedSectionComponents[type];
}

export function getSectionLibraryEntries(): SectionLibraryEntry[] {
  return generatedSectionManifest
    .map((entry) => {
      const schema = sectionRegistry.get(entry.type);

      if (!schema) {
        return null;
      }

      return {
        ...schema,
        pageGroup: entry.pageGroup,
        family: entry.family,
        sourcePath: entry.sourcePath,
      };
    })
    .filter((entry): entry is SectionLibraryEntry => Boolean(entry))
    .sort(sortEntries);
}

export function getSectionLibraryTabs(entries = getSectionLibraryEntries()): SectionLibraryTab[] {
  const tabMap = new Map<string, Map<string, SectionLibraryEntry[]>>();

  for (const entry of entries) {
    if (!tabMap.has(entry.pageGroup)) {
      tabMap.set(entry.pageGroup, new Map());
    }

    const groupMap = tabMap.get(entry.pageGroup);
    if (!groupMap) {
      continue;
    }

    if (!groupMap.has(entry.family)) {
      groupMap.set(entry.family, []);
    }

    groupMap.get(entry.family)?.push(entry);
  }

  return Array.from(tabMap.entries())
    .map(([tabKey, groupMap]) => ({
      key: tabKey,
      label: tabKey,
      groups: Array.from(groupMap.entries())
        .map(([groupKey, sections]) => ({
          key: `${tabKey}/${groupKey}`,
          label: groupKey,
          sections: sections.sort(sortEntries),
        }))
        .sort((left, right) => left.label.localeCompare(right.label, "fr")),
    }))
    .sort((left, right) => sortTabLabels(left.label, right.label));
}
