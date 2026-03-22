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

  const isApprovedSeller =
    account?.role === "seller" && account.seller?.status === "approved";
  const shouldRedirectToBecomeSeller = Boolean(
    account && !isApprovedSeller && !account.isBlocked,
  );

  useEffect(() => {
    if (!isLoading && shouldRedirectToBecomeSeller) {
      router.replace(`/devenir-vendeur?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [account, isLoading, pathname, router, shouldRedirectToBecomeSeller]);

  if (isLoading) {
    return (
      <WorkspaceStatusCard
        title="Chargement de l'espace vendeur"
        description="Nous verifions votre compte, vos droits vendeur et votre statut KYC."
      />
    );
  }

  if (!account) {
    return (
      <WorkspaceStatusCard
        title="Connexion requise"
        description="Connectez-vous pour acceder a votre espace vendeur. Si vous n'avez pas encore de compte vendeur, vous pourrez poursuivre vers le parcours de candidature apres connexion."
        actions={
          <>
            <Link href={`/auth/login?redirect=${encodeURIComponent(pathname)}`}>
              <Button>Se connecter</Button>
            </Link>
            <Link href="/auth/signup?redirect=/vendeur">
              <Button variant="outline">Creer un compte</Button>
            </Link>
          </>
        }
      />
    );
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

  if (!isApprovedSeller) {
    return (
      <WorkspaceStatusCard
        title="Redirection vers Devenir vendeur"
        description="Votre compte n'est pas encore approuve pour l'espace vendeur. Vous allez etre redirige vers le parcours de candidature."
        actions={
          <Link href="/devenir-vendeur">
            <Button>Continuer</Button>
          </Link>
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
