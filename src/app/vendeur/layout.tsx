"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SellerHeader } from "@/components/SellerHeader";
import { SellerFooter } from "@/components/SellerFooter";
import { WorkspaceStatusCard } from "@/components/WorkspaceStatusCard";
import { Button } from "@/components/ui/Button";
import { useCurrentAccountQuery } from "@/hooks/useAccount";

type SellerLayoutProps = {
  children: React.ReactNode;
};

export default function SellerLayout({ children }: SellerLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: account, isLoading } = useCurrentAccountQuery();

  useEffect(() => {
    if (!isLoading && !account) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [account, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <WorkspaceStatusCard
        title="Chargement de l'espace vendeur"
        description="Nous verifions votre compte, vos droits vendeur et votre statut KYC."
      />
    );
  }

  if (!account) {
    return null;
  }

  if (account.isBlocked) {
    return (
      <WorkspaceStatusCard
        title="Compte temporairement bloque"
        description="Votre acces vendeur est suspendu. Contactez l'administration pour examiner la situation."
        actions={
          <Link href="/">
            <Button variant="outline">Retour au site</Button>
          </Link>
        }
      />
    );
  }

  if (account.role !== "seller" || account.seller?.status !== "approved") {
    return (
      <WorkspaceStatusCard
        title="Acces vendeur restreint"
        description="Cette zone est reservee aux vendeurs approuves. Finalisez ou suivez votre candidature pour retrouver l'acces complet."
        actions={
          <>
            <Link href="/devenir-vendeur">
              <Button>Gerer ma candidature</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Retour au site</Button>
            </Link>
          </>
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <SellerHeader />
      <div className="flex-1">{children}</div>
      <SellerFooter />
    </div>
  );
}
