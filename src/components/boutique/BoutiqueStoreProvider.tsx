"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { BoutiqueStoreRecord } from "@/lib/boutiqueStorefront";

const BoutiqueStoreContext = createContext<BoutiqueStoreRecord | undefined>(undefined);

export function BoutiqueStoreProvider({
  store,
  children,
}: {
  store: BoutiqueStoreRecord;
  children: ReactNode;
}) {
  return (
    <BoutiqueStoreContext.Provider value={store}>
      {children}
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
