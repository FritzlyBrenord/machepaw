"use client";

import type { ReactNode } from "react";
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Store,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SellerSetupStatus } from "@/data/sellerSetup";
import { cn } from "@/lib/utils";

type SellerSetupRequiredModalProps = {
  open: boolean;
  status: SellerSetupStatus;
  onClose: () => void;
  onFocusShipping: () => void;
  onFocusPayments: () => void;
};

function ChecklistCard({
  title,
  description,
  complete,
  issues,
  icon,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  complete: boolean;
  issues: string[];
  icon: ReactNode;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border p-5",
        complete
          ? "border-emerald-200 bg-emerald-50"
          : "border-neutral-200 bg-white",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
              complete
                ? "bg-emerald-100 text-emerald-700"
                : "bg-neutral-100 text-neutral-700",
            )}
          >
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-neutral-900">{title}</h3>
              {complete ? (
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Pret
                </span>
              ) : (
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                  A configurer
                </span>
              )}
            </div>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              {description}
            </p>
          </div>
        </div>
      </div>

      {issues.length > 0 ? (
        <div className="mt-4 space-y-2 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
          {issues.map((issue) => (
            <div key={issue} className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <span>{issue}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-emerald-200 bg-white p-4 text-sm text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Cette partie est complete et deja exploitable.</span>
        </div>
      )}

      {!complete ? (
        <div className="mt-4">
          <Button variant="outline" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export function SellerSetupRequiredModal({
  open,
  status,
  onClose,
  onFocusShipping,
  onFocusPayments,
}: SellerSetupRequiredModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-neutral-950/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-[2rem] border border-neutral-200 bg-[#fcfbf8] p-6 shadow-2xl sm:p-8">
        <div className="flex flex-col gap-4 border-b border-neutral-200 pb-6">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white">
            <Store className="h-3.5 w-3.5" />
            Configuration requise
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-neutral-900">
              Finalisez votre boutique avant de continuer
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
              Votre plan est bien en place. Il reste maintenant a configurer au
              moins un mode de reception et un mode de paiement actif pour
              ouvrir completement l&apos;espace vendeur.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <ChecklistCard
            title="Livraison et retrait"
            description="Activez la livraison, le retrait en magasin, ou les deux. Au moins un mode doit etre completement configure."
            complete={status.shippingReady}
            issues={status.shippingIssues}
            icon={<Truck className="h-5 w-5" />}
            actionLabel="Configurer la livraison"
            onAction={() => {
              onFocusShipping();
              onClose();
            }}
          />
          <ChecklistCard
            title="Paiements de la boutique"
            description="Ajoutez les moyens de paiement qui seront proposes a vos clients selon vos modes de reception."
            complete={status.paymentsReady}
            issues={status.paymentIssues}
            icon={<CreditCard className="h-5 w-5" />}
            actionLabel="Configurer les paiements"
            onAction={() => {
              onFocusPayments();
              onClose();
            }}
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-neutral-200 bg-white px-5 py-4">
          <p className="text-sm text-neutral-600">
            Une fois ces deux etapes valides, votre boutique pourra accepter les
            commandes.
          </p>
          <div className="flex flex-wrap gap-3">
            {!status.shippingReady ? (
              <Button
                variant="outline"
                onClick={() => {
                  onFocusShipping();
                  onClose();
                }}
              >
                Aller a Livraison
              </Button>
            ) : null}
            {!status.paymentsReady ? (
              <Button
                onClick={() => {
                  onFocusPayments();
                  onClose();
                }}
              >
                Aller a Paiements
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
