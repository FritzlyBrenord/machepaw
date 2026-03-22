"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SellerHeader } from "@/components/SellerHeader";
import { SellerFooter } from "@/components/SellerFooter";
import { WorkspaceStatusCard } from "@/components/WorkspaceStatusCard";
import { Button } from "@/components/ui/Button";
import { canSellerAccessRoute, sellerNeedsPlanSelection } from "@/data/sellerPlans";
import { getSellerSetupStatus } from "@/data/sellerSetup";
import { useCurrentAccountQuery } from "@/hooks/useAccount";
import { useSellerPaymentMethodsQuery } from "@/hooks/useSellerPaymentMethods";

type SellerLayoutProps = {
  children: React.ReactNode;
};

export default function SellerLayout({ children }: SellerLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: account, isLoading } = useCurrentAccountQuery();
  const { data: sellerPaymentMethods = [], isLoading: sellerPaymentMethodsLoading } =
    useSellerPaymentMethodsQuery(account?.seller?.id);

  const isApprovedSeller =
    account?.role === "seller" && account.seller?.status === "approved";
  const isPlanPage = pathname === "/vendeur/plan";
  const isSettingsPage = pathname === "/vendeur/parametres";
  const shouldRedirectToBecomeSeller = Boolean(
    account && !isApprovedSeller && !account.isBlocked,
  );
  const shouldRedirectToPlan = Boolean(
    isApprovedSeller && sellerNeedsPlanSelection(account?.seller) && !isPlanPage,
  );
  const setupStatus = getSellerSetupStatus(account?.seller, sellerPaymentMethods);
  const shouldRedirectToSetup = Boolean(
    isApprovedSeller &&
      account?.seller?.planSelectionCompleted &&
      !isPlanPage &&
      !isSettingsPage &&
      !sellerPaymentMethodsLoading &&
      !setupStatus.isComplete,
  );
  const routeAccess = canSellerAccessRoute(account?.seller, pathname);
  const shouldRedirectForPlanCapability = Boolean(
    isApprovedSeller &&
      account?.seller?.planSelectionCompleted &&
      setupStatus.isComplete &&
      !isPlanPage &&
      !routeAccess.allowed,
  );

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (shouldRedirectToBecomeSeller) {
      router.replace(`/devenir-vendeur?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (shouldRedirectToPlan) {
      router.replace(`/vendeur/plan?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (shouldRedirectToSetup) {
      router.replace(
        `/vendeur/parametres?setup=required&redirect=${encodeURIComponent(pathname)}&focus=${encodeURIComponent(
          setupStatus.shippingReady ? "payments" : "shipping",
        )}`,
      );
      return;
    }

    if (shouldRedirectForPlanCapability) {
      router.replace(
        `/vendeur/plan?reason=${encodeURIComponent(routeAccess.reason || "upgrade_required")}&redirect=${encodeURIComponent(pathname)}`,
      );
    }
  }, [
    isLoading,
    pathname,
    routeAccess.reason,
    router,
    setupStatus.shippingReady,
    shouldRedirectForPlanCapability,
    shouldRedirectToBecomeSeller,
    shouldRedirectToSetup,
    shouldRedirectToPlan,
    sellerPaymentMethodsLoading,
  ]);

  if (isLoading || (isApprovedSeller && account?.seller?.planSelectionCompleted && sellerPaymentMethodsLoading)) {
    return (
      <WorkspaceStatusCard
        title="Chargement de l'espace vendeur"
        description="Nous verifions votre compte, vos droits vendeur et la configuration obligatoire de votre boutique."
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

  if (shouldRedirectToPlan) {
    return (
      <WorkspaceStatusCard
        title="Choisissez votre plan vendeur"
        description="Avant d'utiliser l'espace vendeur, selectionnez votre plan. Le plan gratuit est disponible immediatement, et les plans payants passent par une verification manuelle."
        actions={
          <Link href="/vendeur/plan">
            <Button>Choisir mon plan</Button>
          </Link>
        }
      />
    );
  }

  if (shouldRedirectToSetup) {
    return (
      <WorkspaceStatusCard
        title="Configuration de la boutique requise"
        description="Avant d'utiliser l'espace vendeur, vous devez configurer vos modes de reception et au moins un mode de paiement."
        actions={
          <Link href="/vendeur/parametres?setup=required">
            <Button>Configurer maintenant</Button>
          </Link>
        }
      />
    );
  }

  if (shouldRedirectForPlanCapability) {
    return (
      <WorkspaceStatusCard
        title="Fonction reservee a votre plan"
        description="Cette section n'est pas encore active sur votre plan actuel. Vous pouvez changer de plan ou finaliser votre demande d'upgrade."
        actions={
          <Link href="/vendeur/plan">
            <Button>Voir les plans</Button>
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
