"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  CalendarDays,
  MapPin,
  ShieldCheck,
  Store,
  Truck,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useBoutiqueStore } from "@/components/boutique/BoutiqueStoreProvider";
import { getBoutiqueBasePath } from "@/lib/boutique";
import { formatDate } from "@/lib/utils";

export default function BoutiqueAboutPage() {
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
    <div className="min-h-screen bg-[#fbf8f3] py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white">
          <div className="border-b border-neutral-200 bg-[#171411] px-6 py-12 text-white sm:px-10">
            <p className="text-xs uppercase tracking-[0.32em] text-white/55">A propos</p>
            <h1 className="mt-4 text-4xl font-semibold">{store.businessName}</h1>
            <p className="mt-4 max-w-3xl text-sm leading-8 text-white/72">
              {store.description ||
                "Cette page regroupe les informations generales de la boutique, separees de l'accueil commercial et du catalogue."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={basePath}>
                <Button className="bg-white text-neutral-900 hover:bg-neutral-100">
                  Retour a l'accueil
                </Button>
              </Link>
              <Link href={`${basePath}/collection`}>
                <Button
                  variant="outline"
                  className="border-white/15 bg-transparent text-white hover:bg-white/10"
                >
                  Voir la collection
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-6 px-6 py-8 sm:px-10 lg:grid-cols-2">
            <InfoCard
              icon={<Store className="h-5 w-5" />}
              title="Profil boutique"
              content={[
                `Slug boutique: ${store.storeSlug}`,
                `Produits actifs: ${store.productsCount}`,
                `Ventes cumulees: ${store.totalSales}`,
              ]}
            />
            <InfoCard
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Verification"
              content={[
                store.isVerified
                  ? "Boutique verifiee par l'administration."
                  : "Boutique publique active.",
                `Note actuelle: ${store.rating.toFixed(1)} / 5`,
                `Avis comptabilises: ${store.reviewCount}`,
              ]}
            />
            <InfoCard
              icon={<MapPin className="h-5 w-5" />}
              title="Localisation"
              content={[
                store.locationName || "Localisation non precisee.",
                store.locationDept ? `Departement: ${store.locationDept}` : "Departement non precise.",
              ]}
            />
            <InfoCard
              icon={<Truck className="h-5 w-5" />}
              title="Livraison et retrait"
              content={[
                pickupAddress || "Point de retrait non renseigne.",
                "Les frais de livraison sont calcules selon la configuration de cette boutique.",
              ]}
            />
            <InfoCard
              icon={<CalendarDays className="h-5 w-5" />}
              title="Presence sur la plateforme"
              content={[`Boutique publiee depuis ${formatDate(store.createdAt)}.`]}
            />
            <InfoCard
              icon={<UserRound className="h-5 w-5" />}
              title="Experience client"
              content={[
                "Le client navigue, ajoute au panier et commande dans un univers dedie a cette boutique.",
                "Les produits, annonces et promotions affiches ici sont limites a ce seller.",
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  content,
}: {
  icon: ReactNode;
  title: string;
  content: string[];
}) {
  return (
    <article className="rounded-[1.6rem] border border-neutral-200 bg-neutral-50 p-5">
      <div className="inline-flex rounded-full bg-white p-3 text-neutral-900 shadow-sm">
        {icon}
      </div>
      <h2 className="mt-4 text-lg font-semibold text-neutral-900">{title}</h2>
      <div className="mt-3 space-y-2 text-sm leading-7 text-neutral-600">
        {content.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </article>
  );
}
