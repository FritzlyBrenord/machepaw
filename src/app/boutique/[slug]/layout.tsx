import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { BoutiqueStoreProvider } from "@/components/boutique/BoutiqueStoreProvider";
import { BoutiqueShell } from "@/components/boutique/BoutiqueShell";
import { getApprovedSellerBySlug } from "@/lib/boutiqueStorefront";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const store = await getApprovedSellerBySlug(slug);

  if (!store) {
    return {
      title: "Boutique introuvable",
    };
  }

  return {
    title: `${store.businessName} | Boutique`,
    description:
      store.description ||
      `Explorez la boutique ${store.businessName}, ses produits, ses annonces et ses offres.`,
  };
}

export default async function BoutiqueLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await getApprovedSellerBySlug(slug);

  if (!store) {
    notFound();
  }

  return (
    <BoutiqueStoreProvider store={store}>
      <BoutiqueShell>{children}</BoutiqueShell>
    </BoutiqueStoreProvider>
  );
}
