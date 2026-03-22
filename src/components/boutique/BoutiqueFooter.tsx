"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin, Store, Truck } from "lucide-react";
import { PRODUCT_ONTOLOGY } from "@/data/productOntology";
import {
  useBoutiqueStore,
  useBoutiqueTheme,
} from "@/components/boutique/BoutiqueStoreProvider";
import { getBoutiqueBasePath } from "@/lib/boutique";
import { getBoutiqueHeadingClass } from "@/lib/boutiqueTheme";

export function BoutiqueFooter() {
  const store = useBoutiqueStore();
  const theme = useBoutiqueTheme();
  const headingClass = getBoutiqueHeadingClass(theme);
  const basePath = getBoutiqueBasePath(store.storeSlug);
  const pickupAddress = [
    store.pickupAddress?.address,
    store.pickupAddress?.city,
    store.pickupAddress?.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <footer
      className="border-t"
      style={{
        borderColor: theme.palette.border,
        backgroundColor: theme.palette.footerBackground,
        color: theme.palette.footerText,
      }}
    >
      <div
        className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 xl:px-12"
      >
        <div
          className={`grid gap-8 ${
            theme.layout.footerStyle === "split"
              ? "lg:grid-cols-[1.5fr,1fr]"
              : "lg:grid-cols-[1.3fr,1fr,1fr]"
          }`}
        >
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div
                className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-[1.5rem]"
                style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
              >
                {store.logo ? (
                  <Image
                    src={store.logo}
                    alt={store.businessName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <Store className="h-6 w-6" />
                )}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/45">
                  {theme.hero.eyebrow}
                </p>
                <h2 className={headingClass + " text-2xl"}>{store.businessName}</h2>
              </div>
            </div>

            <p className="max-w-2xl text-sm leading-7 text-white/72">
              {store.description ||
                "Une boutique independante avec son propre catalogue, son propre checkout et une presentation premium par theme."}
            </p>

            <div className="grid gap-3 text-sm text-white/70 sm:grid-cols-2">
              {store.locationName ? (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 h-4 w-4" />
                  <span>
                    {store.locationName}
                    {store.locationDept ? `, ${store.locationDept}` : ""}
                  </span>
                </div>
              ) : null}
              <div className="flex items-start gap-3">
                <Truck className="mt-1 h-4 w-4" />
                <span>
                  {pickupAddress ||
                    "Livraison et retrait selon la configuration de la boutique"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:col-span-2">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-white/45">
                Navigation
              </p>
              <div className="mt-5 grid gap-3 text-sm text-white/78">
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
                  Mon compte client
                </Link>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-white/45">
                Categories
              </p>
              <div className="mt-5 grid gap-3 text-sm text-white/78">
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
        </div>
      </div>
    </footer>
  );
}
