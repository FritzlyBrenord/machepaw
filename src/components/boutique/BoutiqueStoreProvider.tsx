"use client";

import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import type { BoutiqueStoreRecord } from "@/lib/boutiqueStorefront";
import {
  resolveBoutiqueTheme,
  type BoutiqueThemeDefinition,
} from "@/data/boutiqueThemes";

const BoutiqueStoreContext = createContext<BoutiqueStoreRecord | undefined>(undefined);
const BoutiqueThemeContext = createContext<BoutiqueThemeDefinition | undefined>(
  undefined,
);

export function BoutiqueStoreProvider({
  store,
  children,
}: {
  store: BoutiqueStoreRecord;
  children: ReactNode;
}) {
  const theme = useMemo(
    () =>
      resolveBoutiqueTheme(
        store.storefrontThemeSlug,
        store.storefrontThemeConfig,
      ),
    [store.storefrontThemeConfig, store.storefrontThemeSlug],
  );

  return (
    <BoutiqueStoreContext.Provider value={store}>
      <BoutiqueThemeContext.Provider value={theme}>
        {children}
      </BoutiqueThemeContext.Provider>
    </BoutiqueStoreContext.Provider>
  );
}

export function useBoutiqueStore() {
  const context = useContext(BoutiqueStoreContext);

  if (!context) {
    throw new Error("useBoutiqueStore must be used within BoutiqueStoreProvider");
  }

  return context;
}

export function useBoutiqueTheme() {
  const context = useContext(BoutiqueThemeContext);

  if (!context) {
    throw new Error("useBoutiqueTheme must be used within BoutiqueStoreProvider");
  }

  return context;
}
