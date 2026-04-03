"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Clock3,
  CreditCard,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SellerWorkspaceShell } from "@/components/SellerWorkspaceShell";
import { getSellerPaymentMethodLabel } from "@/data/paymentMethods";
import {
  getSellerPlanEffectivePrice,
  isPaidSellerPlan,
} from "@/data/sellerPlans";
import { useCurrentAccountQuery } from "@/hooks/useAccount";
import {
  useCreateSellerPlanRequestMutation,
  useSellerPlanRequestsQuery,
  useSellerPlansQuery,
} from "@/hooks/useSellerPlans";
import { cn, formatDate, formatPrice } from "@/lib/utils";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function buildPlanPaymentSteps(methodLabel: string) {
  return [
    `Ouvrez ${methodLabel} sur votre telephone.`,
    "Effectuez le paiement du montant affiche pour le plan choisi.",
    "Recuperez l'ID ou la reference de la transaction.",
    "Ajoutez ici le prenom, le nom du payeur et la reference.",
    "Envoyez une capture claire du paiement pour verification.",
  ];
}

export default function SellerPlanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: account } = useCurrentAccountQuery();
  const { data: plans = [], isLoading } = useSellerPlansQuery();
  const { data: requests = [] } = useSellerPlanRequestsQuery();
  const createPlanRequestMutation = useCreateSellerPlanRequestMutation();

  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<
    "moncash_manual" | "natcash_manual"
  >("moncash_manual");
  const [paymentFirstName, setPaymentFirstName] = useState("");
  const [paymentLastName, setPaymentLastName] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const seller = account?.seller;
  const latestRequest = requests[0];
  const currentPlan = seller?.currentPlan;
  const requestedPlan = seller?.requestedPlan;
  const redirectReason = searchParams.get("reason");
  const resolvedSelectedPlanId =
    selectedPlanId ||
    requestedPlan?.id ||
    currentPlan?.id ||
    plans.find((plan) => plan.slug === "free")?.id ||
    plans[0]?.id ||
    "";

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === resolvedSelectedPlanId) || null,
    [plans, resolvedSelectedPlanId],
  );
  const selectedPlanPrice = getSellerPlanEffectivePrice(selectedPlan);
  const hasPendingReview = latestRequest?.status === "pending_review";
  const planIsPaid = isPaidSellerPlan(selectedPlan);

  const submitPlan = async () => {
    if (!selectedPlan) {
      setError("Selectionnez un plan avant de continuer.");
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      await createPlanRequestMutation.mutateAsync({
        planId: selectedPlan.id,
        paymentMethod: planIsPaid ? paymentMethod : undefined,
        paymentFirstName: planIsPaid ? paymentFirstName.trim() : undefined,
        paymentLastName: planIsPaid ? paymentLastName.trim() : undefined,
        paymentReference: planIsPaid ? paymentReference.trim() : undefined,
        paymentProofFile: planIsPaid ? paymentProofFile : null,
      });

      if (planIsPaid) {
        setSuccess(
          "Votre demande d'upgrade a ete envoyee. Votre plan gratuit reste actif jusqu'a verification du paiement.",
        );
      } else {
        setSuccess(
          "Le plan gratuit est maintenant confirme pour votre boutique.",
        );
      }

      router.push(
        `/vendeur/parametres?setup=required&fromPlan=1&focus=${planIsPaid ? "payments" : "shipping"}`,
      );
    } catch (submissionError) {
      setError(
        getErrorMessage(
          submissionError,
          "Impossible de valider votre choix de plan.",
        ),
      );
    }
  };

  return (
    <SellerWorkspaceShell
      title="Choisir un plan vendeur"
      description="Chaque boutique doit confirmer son plan avant d'utiliser l'espace vendeur. Les upgrades payants restent en attente de verification pendant que votre plan gratuit continue de fonctionner."
      actions={
        currentPlan ? (
          <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-600">
            Plan actif:{" "}
            <span className="font-semibold text-neutral-900">
              {currentPlan.name}
            </span>
          </div>
        ) : null
      }
    >
      <div className="space-y-6">
        {redirectReason ? (
          <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="h-4 w-4" />
              Acces ajuste selon votre plan
            </div>
            <p className="mt-2 leading-6 text-amber-800">
              Cette zone n&apos;est pas encore disponible sur votre plan actuel.
              Choisissez un autre plan si vous voulez activer plus de
              fonctionnalites.
            </p>
          </section>
        ) : null}

        {hasPendingReview && requestedPlan ? (
          <section className="rounded-3xl border border-sky-200 bg-sky-50 p-5 text-sm text-sky-900">
            <div className="flex items-center gap-2 font-semibold">
              <Clock3 className="h-4 w-4" />
              Verification en attente
            </div>
            <p className="mt-2 leading-6 text-sky-800">
              Votre demande pour le plan <strong>{requestedPlan.name}</strong>{" "}
              est en attente de verification. Votre plan actuel reste{" "}
              <strong>{currentPlan?.name || "Gratuit"}</strong>.
            </p>
          </section>
        ) : null}

        {error ? (
          <section className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-900">
            {error}
          </section>
        ) : null}

        {success ? (
          <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
            {success}
          </section>
        ) : null}

        <section className="grid gap-5 xl:grid-cols-3">
          {plans.map((plan) => {
            const effectivePrice = getSellerPlanEffectivePrice(plan);
            const isSelected = resolvedSelectedPlanId === plan.id;
            const isCurrent = currentPlan?.id === plan.id;
            const isRequested =
              requestedPlan?.id === plan.id && hasPendingReview;

            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlanId(plan.id)}
                className={cn(
                  "rounded-3xl border p-6 text-left transition-all",
                  isSelected
                    ? "border-neutral-900 bg-neutral-900 text-white shadow-2xl"
                    : "border-neutral-200 bg-white text-neutral-900 hover:border-neutral-400",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold">{plan.name}</h2>
                      {plan.isFeatured ? (
                        <Badge variant="primary">Recommande</Badge>
                      ) : null}
                    </div>
                    <p
                      className={cn(
                        "mt-2 text-sm leading-6",
                        isSelected ? "text-neutral-200" : "text-neutral-500",
                      )}
                    >
                      {plan.description}
                    </p>
                  </div>
                  {isCurrent ? (
                    <Badge
                      className={isSelected ? "bg-white text-neutral-900" : ""}
                    >
                      Actuel
                    </Badge>
                  ) : null}
                </div>

                <div className="mt-6">
                  <div className="text-3xl font-semibold">
                    {formatPrice(effectivePrice, plan.currencyCode)}
                  </div>
                  <p
                    className={cn(
                      "mt-1 text-sm",
                      isSelected ? "text-neutral-300" : "text-neutral-500",
                    )}
                  >
                    {plan.billingInterval === "monthly"
                      ? "par mois"
                      : plan.billingInterval}
                  </p>
                  {Number(plan.promoPrice ?? 0) > 0 &&
                  Number(plan.price) > Number(plan.promoPrice) ? (
                    <p
                      className={cn(
                        "mt-1 text-sm line-through",
                        isSelected ? "text-neutral-400" : "text-neutral-400",
                      )}
                    >
                      {formatPrice(Number(plan.price), plan.currencyCode)}
                    </p>
                  ) : null}
                </div>

                <div className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature.key} className="flex items-start gap-3">
                      <CheckCircle2
                        className={cn(
                          "mt-0.5 h-4 w-4 shrink-0",
                          feature.enabled
                            ? isSelected
                              ? "text-emerald-300"
                              : "text-emerald-600"
                            : isSelected
                              ? "text-neutral-500"
                              : "text-neutral-300",
                        )}
                      />
                      <div>
                        <p className="text-sm font-medium">{feature.label}</p>
                        <p
                          className={cn(
                            "text-xs leading-5",
                            isSelected
                              ? "text-neutral-300"
                              : "text-neutral-500",
                          )}
                        >
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                  {Object.entries(plan.limits)
                    .slice(0, 6)
                    .map(([key, value]) => (
                      <div
                        key={key}
                        className={cn(
                          "rounded-2xl px-3 py-2",
                          isSelected ? "bg-white/10" : "bg-neutral-50",
                        )}
                      >
                        <p
                          className={cn(
                            "text-xs uppercase tracking-[0.18em]",
                            isSelected
                              ? "text-neutral-300"
                              : "text-neutral-400",
                          )}
                        >
                          {key.replace(/_/g, " ")}
                        </p>
                        <p className="mt-1 font-semibold">{String(value)}</p>
                      </div>
                    ))}
                </div>

                {isRequested ? (
                  <div className="mt-5 rounded-2xl border border-sky-300 bg-sky-100/20 px-3 py-2 text-xs font-medium text-sky-100">
                    Verification en attente
                  </div>
                ) : null}
              </button>
            );
          })}
        </section>

        {selectedPlan ? (
          <section className="rounded-3xl border border-neutral-200 bg-white p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900">
                  Finaliser le plan {selectedPlan.name}
                </h2>
                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  {planIsPaid
                    ? "Les plans payants passent par une verification manuelle. Remplissez les informations du paiement puis envoyez la preuve."
                    : "Le plan gratuit est active immediatement apres validation."}
                </p>
              </div>
              <Badge variant={planIsPaid ? "outline" : "primary"}>
                {planIsPaid ? "Paiement requis" : "Activation immediate"}
              </Badge>
            </div>

            <div className="mt-6 rounded-3xl bg-neutral-50 p-5">
              <p className="text-sm text-neutral-500">Montant du plan</p>
              <p className="mt-2 text-3xl font-semibold text-neutral-900">
                {formatPrice(selectedPlanPrice, selectedPlan.currencyCode)}
              </p>
            </div>

            {planIsPaid ? (
              <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
                <div className="space-y-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(["moncash_manual", "natcash_manual"] as const).map(
                      (method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={cn(
                            "rounded-2xl border px-4 py-4 text-left transition-colors",
                            paymentMethod === method
                              ? "border-neutral-900 bg-neutral-900 text-white"
                              : "border-neutral-200 bg-white text-neutral-900",
                          )}
                        >
                          <div className="flex items-center gap-2 font-medium">
                            <CreditCard className="h-4 w-4" />
                            {getSellerPaymentMethodLabel(method)}
                          </div>
                          <p
                            className={cn(
                              "mt-2 text-sm",
                              paymentMethod === method
                                ? "text-neutral-300"
                                : "text-neutral-500",
                            )}
                          >
                            Paiement manuel avec reference et capture
                            d&apos;ecran.
                          </p>
                        </button>
                      ),
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2 text-sm text-neutral-700">
                      <span className="font-medium">Prenom du payeur</span>
                      <input
                        value={paymentFirstName}
                        onChange={(event) =>
                          setPaymentFirstName(event.target.value)
                        }
                        className="w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none transition focus:border-neutral-900"
                        placeholder="Prenom"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-neutral-700">
                      <span className="font-medium">Nom du payeur</span>
                      <input
                        value={paymentLastName}
                        onChange={(event) =>
                          setPaymentLastName(event.target.value)
                        }
                        className="w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none transition focus:border-neutral-900"
                        placeholder="Nom"
                      />
                    </label>
                  </div>

                  <label className="block space-y-2 text-sm text-neutral-700">
                    <span className="font-medium">
                      Reference ou ID transaction
                    </span>
                    <input
                      value={paymentReference}
                      onChange={(event) =>
                        setPaymentReference(event.target.value)
                      }
                      className="w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none transition focus:border-neutral-900"
                      placeholder="Ex: MC-458899 ou NC-220194"
                    />
                  </label>

                  <label className="block rounded-3xl border border-dashed border-neutral-300 bg-neutral-50 p-5 text-sm text-neutral-600">
                    <div className="flex items-center gap-3 font-medium text-neutral-900">
                      <Upload className="h-4 w-4" />
                      Capture ou screenshot du paiement
                    </div>
                    <p className="mt-2 leading-6">
                      Envoyez une preuve lisible contenant le montant, la
                      reference et le nom du compte payeur.
                    </p>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(event) =>
                        setPaymentProofFile(event.target.files?.[0] || null)
                      }
                      className="mt-4 block w-full text-sm"
                    />
                    {paymentProofFile ? (
                      <p className="mt-3 text-xs text-neutral-500">
                        {paymentProofFile.name}
                      </p>
                    ) : null}
                  </label>
                </div>

                <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
                  <h3 className="font-semibold text-neutral-900">
                    Etapes conseillees
                  </h3>
                  <div className="mt-4 space-y-3 text-sm text-neutral-600">
                    {buildPlanPaymentSteps(
                      getSellerPaymentMethodLabel(paymentMethod),
                    ).map((instruction) => (
                      <p key={instruction}>{instruction}</p>
                    ))}
                    <p>
                      Finalement, revenez ici, ajoutez votre reference et la
                      capture du paiement, puis envoyez la demande.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {latestRequest ? (
              <div className="mt-6 rounded-3xl border border-neutral-200 bg-neutral-50 p-5 text-sm text-neutral-600">
                <p className="font-medium text-neutral-900">Derniere demande</p>
                <p className="mt-2">
                  Plan:{" "}
                  <strong>{latestRequest.plan?.name || "Plan inconnu"}</strong>
                </p>
                <p className="mt-1">
                  Statut: <strong>{latestRequest.status}</strong>
                </p>
                <p className="mt-1">
                  Cree le:{" "}
                  <strong>{formatDate(latestRequest.createdAt)}</strong>
                </p>
                {latestRequest.rejectionReason ? (
                  <p className="mt-2 text-rose-700">
                    Motif du refus: {latestRequest.rejectionReason}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                onClick={() => void submitPlan()}
                isLoading={createPlanRequestMutation.isPending}
                disabled={hasPendingReview}
              >
                {planIsPaid
                  ? "Envoyer la demande de plan"
                  : "Activer le plan gratuit"}
              </Button>
              {hasPendingReview ? (
                <Button variant="outline" disabled>
                  Verification en cours
                </Button>
              ) : null}
            </div>
          </section>
        ) : null}

        {isLoading ? (
          <section className="rounded-3xl border border-neutral-200 bg-white p-6 text-sm text-neutral-500">
            Chargement des plans vendeur...
          </section>
        ) : null}
      </div>
    </SellerWorkspaceShell>
  );
}
