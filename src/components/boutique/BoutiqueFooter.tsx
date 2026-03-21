"use client";

import Link from "next/link";
import { ArrowUpRight, MapPin, Store, Truck } from "lucide-react";
import { PRODUCT_ONTOLOGY } from "@/data/productOntology";
import { useBoutiqueStore } from "@/components/boutique/BoutiqueStoreProvider";
import { getBoutiqueBasePath } from "@/lib/boutique";

export function BoutiqueFooter() {
  const store = useBoutiqueStore();
  const basePath = getBoutiqueBasePath(store.storeSlug);
  const pickupAddress = [
    store.pickupAddress?.address,
    store.pickupAddress?.city,
    store.pickupAddress?.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <footer className="border-t border-neutral-200 bg-[#171411] text-[#f8f1e9]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.4fr,1fr,1fr] lg:px-8 xl:px-12">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-white/50">Boutique</p>
              <h2 className="text-2xl font-semibold">{store.businessName}</h2>
            </div>
          </div>
          <p className="max-w-xl text-sm leading-7 text-white/70">
            {store.description ||
              "Mini-site vendeur dedie avec ses propres produits, ses propres offres et ses propres annonces."}
          </p>
          <div className="space-y-2 text-sm text-white/70">
            {store.locationName ? (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {store.locationName}
                {store.locationDept ? `, ${store.locationDept}` : ""}
              </div>
            ) : null}
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              {pickupAddress || "Livraison et retrait selon la configuration de la boutique"}
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-white/50">Navigation</p>
          <div className="mt-5 grid gap-3 text-sm">
            <Link href={basePath} className="hover:text-white">
              Accueil de la boutique
            </Link>
            <Link href={`${basePath}/collection`} className="hover:text-white">
              Toute la collection
            </Link>
            <Link href={`${basePath}/a-propos`} className="hover:text-white">
              A propos de la boutique
            </Link>
            <Link href={`${basePath}/profil`} className="hover:text-white">
              Mon compte client boutique
            </Link>
            <Link href={`${basePath}/panier`} className="hover:text-white">
              Panier boutique
            </Link>
            <Link href={`${basePath}/commande`} className="hover:text-white">
              Commander dans cette boutique
            </Link>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-white/50">Categories</p>
          <div className="mt-5 grid gap-3 text-sm">
            {PRODUCT_ONTOLOGY.slice(0, 6).map((category) => (
              <Link
                key={category.id}
                href={`${basePath}/collection/${category.id}`}
                className="inline-flex items-center justify-between gap-3 hover:text-white"
              >
                {category.name}
                <ArrowUpRight className="h-4 w-4 text-white/40" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
