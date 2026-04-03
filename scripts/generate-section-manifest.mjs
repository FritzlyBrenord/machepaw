import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(process.cwd());
const sectionsRoot = path.join(projectRoot, "src", "sections");
const generatedRoot = path.join(projectRoot, "src", "generated");
const manifestOutputPath = path.join(generatedRoot, "section-manifest.ts");

const ignoredFileNames = new Set(["index.ts", "index.tsx"]);
const ignoredPrefixes = ["Connected"];
const ignoredDirectoryPrefix = "_";
const ignoredBaseNamePatterns = [/\.schema$/i, /-fix$/i];
const ignoredDirectoryNames = new Set(["variants"]);

function toPosixPath(value) {
  return value.split(path.sep).join("/");
}

function toSectionType(baseName) {
  return baseName.charAt(0).toLowerCase() + baseName.slice(1);
}

function splitWords(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim();
}

function inferCategory(pageGroup, family, type) {
  const normalizedPageGroup = pageGroup.toLowerCase();
  const normalizedFamily = family.toLowerCase();
  const normalizedType = type.toLowerCase();

  if (
    normalizedPageGroup === "global" &&
    (normalizedFamily.includes("header") || normalizedType.includes("header"))
  ) {
    return "header";
  }

  if (
    normalizedPageGroup === "global" &&
    (normalizedFamily.includes("footer") || normalizedType.includes("footer"))
  ) {
    return "footer";
  }

  if (
    normalizedPageGroup === "commande" ||
    normalizedFamily.includes("checkout") ||
    normalizedFamily.includes("payment") ||
    normalizedFamily.includes("order") ||
    normalizedType.includes("checkout") ||
    normalizedType.includes("payment") ||
    normalizedType.includes("order")
  ) {
    return "checkout";
  }

  if (
    normalizedPageGroup === "panier" ||
    normalizedFamily.includes("cart") ||
    normalizedType.includes("cart")
  ) {
    return "cart";
  }

  if (
    normalizedPageGroup === "catalogue" ||
    normalizedFamily.includes("product") ||
    normalizedType.includes("product")
  ) {
    return "product";
  }

  if (
    normalizedFamily.includes("category") ||
    normalizedFamily.includes("collection") ||
    normalizedType.includes("category") ||
    normalizedType.includes("collection")
  ) {
    return "collection";
  }

  return "content";
}

function inferIcon(pageGroup, family, type) {
  const haystack = `${pageGroup} ${family} ${type}`.toLowerCase();

  if (haystack.includes("header")) {
    return "PanelTop";
  }

  if (haystack.includes("footer")) {
    return "LayoutTemplate";
  }

  if (haystack.includes("announcement") || haystack.includes("promo")) {
    return "Megaphone";
  }

  if (haystack.includes("hero") || haystack.includes("banner")) {
    return "Image";
  }

  if (
    haystack.includes("product") ||
    haystack.includes("catalogue") ||
    haystack.includes("collection")
  ) {
    return "ShoppingBag";
  }

  if (haystack.includes("category") || haystack.includes("grid")) {
    return "Grid3X3";
  }

  if (haystack.includes("cart") || haystack.includes("wishlist")) {
    return "ShoppingCart";
  }

  if (
    haystack.includes("checkout") ||
    haystack.includes("payment") ||
    haystack.includes("order") ||
    haystack.includes("commande")
  ) {
    return "CreditCard";
  }

  if (
    haystack.includes("account") ||
    haystack.includes("profile") ||
    haystack.includes("login") ||
    haystack.includes("register") ||
    haystack.includes("auth") ||
    haystack.includes("compte")
  ) {
    return "Shield";
  }

  if (haystack.includes("search")) {
    return "Search";
  }

  if (haystack.includes("countdown")) {
    return "Timer";
  }

  return "Layout";
}

function shouldIgnoreRelativePath(relativePath) {
  const normalizedPath = toPosixPath(relativePath);
  const segments = normalizedPath.split("/");
  const fileName = segments[segments.length - 1];
  const baseName = fileName.replace(/\.(tsx?|jsx?)$/, "");

  if (ignoredFileNames.has(fileName)) {
    return true;
  }

  if (ignoredBaseNamePatterns.some((pattern) => pattern.test(baseName))) {
    return true;
  }

  if (ignoredPrefixes.some((prefix) => baseName.startsWith(prefix))) {
    return true;
  }

  if (segments.some((segment) => ignoredDirectoryNames.has(segment.toLowerCase()))) {
    return true;
  }

  return segments.some((segment, index) => index < segments.length - 1 && segment.startsWith(ignoredDirectoryPrefix));
}

function collectSectionFiles(currentDirectory) {
  const directoryEntries = fs.readdirSync(currentDirectory, { withFileTypes: true });
  const results = [];

  for (const entry of directoryEntries) {
    const absolutePath = path.join(currentDirectory, entry.name);
    const relativePath = path.relative(sectionsRoot, absolutePath);

    if (entry.isDirectory()) {
      if (
        entry.name.startsWith(ignoredDirectoryPrefix) ||
        ignoredDirectoryNames.has(entry.name.toLowerCase())
      ) {
        continue;
      }

      results.push(...collectSectionFiles(absolutePath));
      continue;
    }

    if (!/\.(ts|tsx)$/.test(entry.name)) {
      continue;
    }

    if (shouldIgnoreRelativePath(relativePath)) {
      continue;
    }

    results.push(absolutePath);
  }

  return results;
}

function buildManifestEntry(absolutePath) {
  const relativePath = path.relative(sectionsRoot, absolutePath);
  const relativePathWithoutExtension = relativePath.replace(/\.(ts|tsx)$/, "");
  const normalizedRelativePath = toPosixPath(relativePathWithoutExtension);
  const pathSegments = normalizedRelativePath.split("/");
  const fileName = pathSegments[pathSegments.length - 1];
  const directorySegments = pathSegments.slice(0, -1);
  const pageGroup = directorySegments[0] || "General";
  const family = directorySegments[1] || splitWords(fileName);
  const type = toSectionType(fileName);
  const displayName = splitWords(fileName);

  return {
    type,
    exportName: fileName,
    displayName,
    pageGroup,
    family,
    sourcePath: normalizedRelativePath,
    category: inferCategory(pageGroup, family, type),
    icon: inferIcon(pageGroup, family, type),
  };
}

function generateManifestFile(entries) {
  const importLines = entries.map(
    (entry, index) => `import * as SectionModule${index} from "@/sections/${entry.sourcePath}";`,
  );

  const componentLines = entries.map((entry, index) => {
    const expression = `("default" in SectionModule${index} && SectionModule${index}.default ? SectionModule${index}.default : SectionModule${index}.${entry.exportName}) as ComponentType<any>`;
    return `  ${JSON.stringify(entry.type)}: ${expression},`;
  });

  const manifestLines = entries.map((entry) => {
    return `  {
    type: ${JSON.stringify(entry.type)},
    exportName: ${JSON.stringify(entry.exportName)},
    displayName: ${JSON.stringify(entry.displayName)},
    pageGroup: ${JSON.stringify(entry.pageGroup)},
    family: ${JSON.stringify(entry.family)},
    sourcePath: ${JSON.stringify(entry.sourcePath)},
    category: ${JSON.stringify(entry.category)},
    icon: ${JSON.stringify(entry.icon)},
  },`;
  });

  return `/* eslint-disable */
// AUTO-GENERATED FILE. DO NOT EDIT.
// Run: npm run generate:sections

import type { ComponentType } from "react";
${importLines.join("\n")}

export interface GeneratedSectionManifestEntry {
  type: string;
  exportName: string;
  displayName: string;
  pageGroup: string;
  family: string;
  sourcePath: string;
  category: "header" | "content" | "footer" | "product" | "collection" | "cart" | "checkout";
  icon: string;
}

export const generatedSectionManifest: GeneratedSectionManifestEntry[] = [
${manifestLines.join("\n")}
];

export const generatedSectionComponents: Record<string, ComponentType<any>> = {
${componentLines.join("\n")}
};

export function getGeneratedSectionDefinition(type: string) {
  return generatedSectionManifest.find((entry) => entry.type === type);
}
`;
}

function ensureDirectory(directoryPath) {
  fs.mkdirSync(directoryPath, { recursive: true });
}

function main() {
  ensureDirectory(generatedRoot);

  const files = collectSectionFiles(sectionsRoot)
    .map(buildManifestEntry)
    .sort((left, right) => {
      return (
        left.pageGroup.localeCompare(right.pageGroup, "fr") ||
        left.family.localeCompare(right.family, "fr") ||
        left.displayName.localeCompare(right.displayName, "fr")
      );
    });

  const manifestSource = generateManifestFile(files);
  fs.writeFileSync(manifestOutputPath, manifestSource, "utf8");

  console.log(`Generated ${files.length} section entries in ${path.relative(projectRoot, manifestOutputPath)}`);
}

main();
