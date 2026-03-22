"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Search, ShieldCheck, XCircle } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  useAdminSellerPlanRequestsQuery,
  useReviewSellerPlanRequestMutation,
} from "@/hooks/useSellerPlans";
import { cn, formatDate } from "@/lib/utils";
import type { SellerPlanRequest, SellerPlanRequestStatus } from "@/data/types";

const pageSizeOptions = [20, 50, 100];
const statusLabels: Record<string, string> = {
  all: "Toutes",
  pending_review: "En attente",
  approved: "Approuvees",
  rejected: "Refusees",
  cancelled: "Annulees",
  draft: "Brouillons",
};

function getStatusBadgeClass(status: SellerPlanRequestStatus) {
  if (status === "pending_review") {
    return "bg-amber-100 text-amber-800";
  }
  if (status === "approved") {
    return "bg-emerald-100 text-emerald-700";
  }
  if (status === "rejected") {
    return "bg-rose-100 text-rose-700";
  }
  if (status === "cancelled") {
    return "bg-neutral-200 text-neutral-700";
  }
  return "bg-sky-100 text-sky-700";
}

function matchesSearch(request: SellerPlanRequest, search: string) {
  const haystack = [
    request.sellerBusinessName,
    request.sellerContactEmail,
    request.paymentReference,
    request.paymentFirstName,
    request.paymentLastName,
    request.plan?.name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(search.toLowerCase());
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export default function AdminPlanRequestsPage() {
  const { data: requests = [], isLoading } = useAdminSellerPlanRequestsQuery();
  const reviewMutation = useReviewSellerPlanRequestMutation();

  const [statusFilter, setStatusFilter] = useState("pending_review");
  const [planFilter, setPlanFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );

  const planOptions = useMemo(
    () =>
      Array.from(
        new Map(
          requests
            .filter((request) => request.plan)
            .map((request) => [request.plan!.id, { id: request.plan!.id, name: request.plan!.name }]),
        ).values(),
      ),
    [requests],
  );

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesStatus = statusFilter === "all" || request.status === statusFilter;
      const matchesPlan = planFilter === "all" || request.planId === planFilter;
      const matchesText = !search.trim() || matchesSearch(request, search.trim());
      return matchesStatus && matchesPlan && matchesText;
    });
  }, [planFilter, requests, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedRequests = filteredRequests.slice((safePage - 1) * pageSize, safePage * pageSize);

  const summary = {
    total: requests.length,
    pending: requests.filter((request) => request.status === "pending_review").length,
    approved: requests.filter((request) => request.status === "approved").length,
    rejected: requests.filter((request) => request.status === "rejected").length,
  };

  const reviewRequest = async (
    requestId: string,
    status: "approved" | "rejected",
    reason?: string,
  ) => {
    setFeedback(null);
    try {
      await reviewMutation.mutateAsync({
        requestId,
        status,
        rejectionReason: status === "rejected" ? reason || "Paiement non valide." : undefined,
      });
      setFeedback({
        type: "success",
        message:
          status === "approved"
            ? "La demande a ete approuvee."
            : "La demande a ete refusee.",
      });
      setRejectingId(null);
      setRejectionReason("");
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error, "Impossible de traiter cette demande."),
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <section className="rounded-[2rem] border border-neutral-200 bg-white p-6 lg:p-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <Badge variant="outline">Validation des paiements</Badge>
              <h1 className="mt-4 text-3xl font-semibold text-neutral-900">
                File d&apos;approbation des plans
              </h1>
              <p className="mt-3 text-sm leading-7 text-neutral-500">
                Cette vue est separee de l&apos;edition des plans. Elle est pensee pour trier, filtrer et
                traiter un grand volume de demandes sans melanger la configuration du catalogue.
              </p>
            </div>

            <Link
              href="/admin/plans"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-5 py-3 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:text-neutral-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux plans
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-3xl bg-neutral-950 p-5 text-white">
              <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">Total</p>
              <p className="mt-3 text-3xl font-semibold">{summary.total}</p>
            </div>
            <div className="rounded-3xl bg-amber-50 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-amber-700">En attente</p>
              <p className="mt-3 text-3xl font-semibold text-amber-950">{summary.pending}</p>
            </div>
            <div className="rounded-3xl bg-emerald-50 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-emerald-700">Approuvees</p>
              <p className="mt-3 text-3xl font-semibold text-emerald-950">{summary.approved}</p>
            </div>
            <div className="rounded-3xl bg-rose-50 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-rose-700">Refusees</p>
              <p className="mt-3 text-3xl font-semibold text-rose-950">{summary.rejected}</p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-neutral-200 bg-white p-6">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr),180px,220px,120px]">
            <label className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 py-3 pl-11 pr-4 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                placeholder="Rechercher par boutique, email, reference ou plan"
              />
            </label>

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
            >
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            <select
              value={planFilter}
              onChange={(event) => {
                setPlanFilter(event.target.value);
                setPage(1);
              }}
              className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
            >
              <option value="all">Tous les plans</option>
              {planOptions.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>

            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
              className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option} / page
                </option>
              ))}
            </select>
          </div>

          {feedback ? (
            <div
              className={cn(
                "mt-5 rounded-3xl border px-5 py-4 text-sm",
                feedback.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : "border-rose-200 bg-rose-50 text-rose-900",
              )}
            >
              {feedback.message}
            </div>
          ) : null}

          <div className="mt-6 space-y-4">
            {isLoading ? (
              <div className="rounded-3xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center text-sm text-neutral-500">
                Chargement de la file d&apos;approbation...
              </div>
            ) : null}

            {!isLoading && paginatedRequests.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center text-sm text-neutral-500">
                Aucune demande ne correspond a ces filtres.
              </div>
            ) : null}

            {paginatedRequests.map((request) => (
              <div key={request.id} className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">Boutique</p>
                      <p className="mt-1 font-semibold text-neutral-900">
                        {request.sellerBusinessName || "Boutique inconnue"}
                      </p>
                      <p className="mt-1 text-sm text-neutral-500">
                        {request.sellerContactEmail || "Email indisponible"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">Plan demande</p>
                      <p className="mt-1 font-semibold text-neutral-900">
                        {request.plan?.name || "Plan inconnu"}
                      </p>
                      <p className="mt-1 text-sm text-neutral-500">
                        Soumis le {formatDate(request.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">Paiement</p>
                      <p className="mt-1 font-semibold text-neutral-900">
                        {request.paymentMethod || "Aucune methode"}
                      </p>
                      <p className="mt-1 text-sm text-neutral-500">
                        Ref: {request.paymentReference || "Non fournie"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">Statut</p>
                      <div className="mt-1 flex items-center gap-3">
                        <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-medium", getStatusBadgeClass(request.status))}>
                          {statusLabels[request.status]}
                        </span>
                        {request.paymentProofUrl ? (
                          <a
                            href={request.paymentProofUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-sm font-medium text-neutral-700 hover:text-neutral-900"
                          >
                            Preuve
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 xl:justify-end">
                    <Button
                      size="sm"
                      onClick={() => void reviewRequest(request.id, "approved")}
                      disabled={request.status !== "pending_review" || reviewMutation.isPending}
                    >
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Approuver
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setRejectingId((current) => (current === request.id ? null : request.id))
                      }
                      disabled={request.status !== "pending_review" || reviewMutation.isPending}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Refuser
                    </Button>
                  </div>
                </div>

                {rejectingId === request.id ? (
                  <div className="mt-4 rounded-3xl border border-rose-200 bg-white p-4">
                    <label className="block space-y-2 text-sm text-neutral-700">
                      <span className="font-medium">Motif du refus</span>
                      <textarea
                        value={rejectionReason}
                        onChange={(event) => setRejectionReason(event.target.value)}
                        rows={3}
                        className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                        placeholder="Ex: reference introuvable, capture illisible, montant incorrect"
                      />
                    </label>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          void reviewRequest(
                            request.id,
                            "rejected",
                            rejectionReason.trim() || "Paiement non valide.",
                          )
                        }
                        isLoading={reviewMutation.isPending}
                      >
                        Confirmer le refus
                      </Button>
                      <button
                        type="button"
                        onClick={() => {
                          setRejectingId(null);
                          setRejectionReason("");
                        }}
                        className="rounded-full px-4 py-2 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : null}

                {request.rejectionReason ? (
                  <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-800">
                    Motif du refus: {request.rejectionReason}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-4 border-t border-neutral-200 pt-6 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-neutral-500">
              {filteredRequests.length} demandes trouvees, page {safePage} sur {totalPages}.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={safePage <= 1}
              >
                Precedent
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={safePage >= totalPages}
              >
                Suivant
              </Button>
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
