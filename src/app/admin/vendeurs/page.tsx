"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Ban,
  CheckCircle2,
  ExternalLink,
  Eye,
  Search,
  Shield,
  Unlock,
  X,
  XCircle,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/useCategories";
import {
  useAdminSellerDossierQuery,
  useAdminSellersOverviewQuery,
  useApproveSellerMutation,
  useBlockSellerMutation,
  useRejectSellerMutation,
  useUnblockSellerMutation,
  useVerifySellerMutation,
} from "@/hooks/useAdminDirectory";
import type {
  Address,
  AdminSeller,
  SellerKycDocument,
  SellerKycDocumentType,
} from "@/data/types";
import { cn, formatDate, formatPrice } from "@/lib/utils";

const sellerStatusClasses: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800",
  suspended: "bg-neutral-200 text-neutral-800",
};

const documentTypeLabels: Record<SellerKycDocumentType, string> = {
  national_id: "Piece d'identite",
  tax_document: "Document fiscal",
  proof_of_address: "Justificatif d'adresse",
  business_registration: "Enregistrement entreprise",
  bank_statement: "Releve bancaire",
  selfie_verification: "Photo reelle du vendeur",
  other: "Autre document",
};

function formatAddress(address?: Address) {
  return address
    ? [address.address, address.city, address.postalCode, address.country]
        .filter(Boolean)
        .join(", ")
    : "Aucune adresse enregistree";
}

function getCategoryNames(
  ids: string[],
  categories: { id: string; name: string }[],
) {
  return ids.map(
    (id) => categories.find((category) => category.id === id)?.name || id,
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Impossible de charger le dossier vendeur.";
}

function isImageDocument(document?: SellerKycDocument) {
  if (!document?.previewUrl) return false;
  if (document.mimeType?.startsWith("image/")) return true;
  return /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(
    document.fileName || document.storagePath,
  );
}

function DocumentPreview({
  document,
  title,
}: {
  document?: SellerKycDocument;
  title: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      {document ? (
        <>
          {isImageDocument(document) ? (
            <img
              src={document.previewUrl}
              alt={title}
              className="h-64 w-full bg-neutral-100 object-cover"
            />
          ) : (
            <div className="flex h-64 items-center justify-center bg-neutral-100 px-6 text-center text-sm text-neutral-500">
              Apercu indisponible pour ce format.
            </div>
          )}
          <div className="space-y-2 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium text-neutral-900">{title}</p>
              <span className="inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
                {document.status}
              </span>
            </div>
            <p className="text-sm text-neutral-500">
              {document.fileName || document.storagePath}
            </p>
            <p className="text-xs text-neutral-400">
              Soumis le {formatDate(document.createdAt)}
            </p>
            {document.previewUrl ? (
              <a
                href={document.previewUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-neutral-700 hover:text-neutral-900"
              >
                Ouvrir
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        </>
      ) : (
        <div className="p-5">
          <p className="font-medium text-neutral-900">{title}</p>
          <p className="mt-2 text-sm text-neutral-500">
            Aucun document soumis.
          </p>
        </div>
      )}
    </div>
  );
}

export default function AdminSellersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedSeller, setSelectedSeller] = useState<AdminSeller | null>(
    null,
  );
  const { data: sellers = [], isLoading } = useAdminSellersOverviewQuery();
  const { data: categories = [] } = useCategories();
  const {
    data: dossier,
    isLoading: dossierLoading,
    error: dossierError,
  } = useAdminSellerDossierQuery(selectedSeller);
  const approveSellerMutation = useApproveSellerMutation();
  const rejectSellerMutation = useRejectSellerMutation();
  const blockSellerMutation = useBlockSellerMutation();
  const unblockSellerMutation = useUnblockSellerMutation();
  const verifySellerMutation = useVerifySellerMutation();
  const requestedSellerId = searchParams.get("sellerId");

  const filteredSellers = useMemo(
    () =>
      sellers.filter((seller) => {
        const matchesSearch =
          seller.businessName.toLowerCase().includes(search.toLowerCase()) ||
          seller.contactEmail.toLowerCase().includes(search.toLowerCase()) ||
          seller.contactPerson.toLowerCase().includes(search.toLowerCase());
        return (
          matchesSearch && (!statusFilter || seller.status === statusFilter)
        );
      }),
    [search, sellers, statusFilter],
  );

  useEffect(() => {
    if (!requestedSellerId || sellers.length === 0) {
      return;
    }

    const matchedSeller = sellers.find(
      (seller) =>
        seller.id === requestedSellerId ||
        seller.reviewId === requestedSellerId ||
        seller.userId === requestedSellerId,
    );

    if (matchedSeller && selectedSeller?.id !== matchedSeller.id) {
      setSelectedSeller(matchedSeller);
    }
  }, [requestedSellerId, sellers, selectedSeller?.id]);

  const syncSellerQueryParam = (sellerId?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (sellerId) {
      params.set("sellerId", sellerId);
    } else {
      params.delete("sellerId");
    }

    const query = params.toString();
    router.replace(query ? `/admin/vendeurs?${query}` : "/admin/vendeurs", {
      scroll: false,
    });
  };

  const openSellerDossier = (seller: AdminSeller) => {
    setSelectedSeller(seller);
    syncSellerQueryParam(seller.id);
  };

  const closeSellerDossier = () => {
    setSelectedSeller(null);
    if (requestedSellerId) {
      syncSellerQueryParam();
    }
  };

  const approveSeller = async (seller: AdminSeller) => {
    await approveSellerMutation.mutateAsync({
      sellerId:
        seller.reviewId === seller.applicationId ? undefined : seller.id,
      applicationId: seller.applicationId,
      userId: seller.userId,
    });
  };

  const rejectSeller = async (seller: AdminSeller) => {
    const reason = window.prompt("Raison du rejet vendeur ?");
    if (!reason) return;
    await rejectSellerMutation.mutateAsync({
      sellerId:
        seller.reviewId === seller.applicationId ? undefined : seller.id,
      applicationId: seller.applicationId,
      reason,
    });
  };

  const suspendSeller = async (seller: AdminSeller) => {
    const reason = window.prompt("Raison de la suspension ?");
    if (!reason) return;
    await blockSellerMutation.mutateAsync({ sellerId: seller.id, reason });
  };

  const dossierSeller = dossier?.seller || selectedSeller;
  const application = dossier?.application;
  const documents = dossier?.documents || [];
  const identityDocument = documents.find(
    (document) => document.documentType === "national_id",
  );
  const selfieDocument = documents.find(
    (document) => document.documentType === "selfie_verification",
  );
  const categoryNames = getCategoryNames(
    application?.categories || dossierSeller?.categories || [],
    categories,
  );
  const applicantName = application
    ? `${application.firstName} ${application.lastName}`.trim()
    : [dossierSeller?.applicationFirstName, dossierSeller?.applicationLastName]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      dossierSeller?.contactPerson ||
      "Nom indisponible";

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">
            Pilotage vendeurs
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Vue consolidee des vendeurs, candidatures et statuts KYC.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <p className="text-sm text-neutral-500">Total</p>
            <p className="mt-2 text-2xl font-semibold text-neutral-900">
              {sellers.length}
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <p className="text-sm text-neutral-500">Approuves</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-700">
              {sellers.filter((seller) => seller.status === "approved").length}
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <p className="text-sm text-neutral-500">En revue</p>
            <p className="mt-2 text-2xl font-semibold text-amber-700">
              {sellers.filter((seller) => seller.status === "pending").length}
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <p className="text-sm text-neutral-500">Suspendus</p>
            <p className="mt-2 text-2xl font-semibold text-neutral-900">
              {sellers.filter((seller) => seller.status === "suspended").length}
            </p>
          </div>
        </div>
        <section className="rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher un vendeur"
                className="w-full rounded-xl border border-neutral-200 px-10 py-3 text-sm outline-none transition-colors focus:border-neutral-900"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none transition-colors focus:border-neutral-900"
            >
              <option value="">Tous les statuts</option>
              <option value="pending">En revue</option>
              <option value="approved">Approuves</option>
              <option value="rejected">Refuses</option>
              <option value="suspended">Suspendus</option>
            </select>
          </div>
        </section>
        <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="bg-neutral-50 text-left text-xs uppercase tracking-[0.18em] text-neutral-400">
                <tr>
                  <th className="px-6 py-4">Vendeur</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Produits</th>
                  <th className="px-6 py-4">Revenu</th>
                  <th className="px-6 py-4">KYC</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-sm text-neutral-500"
                    >
                      Chargement des vendeurs...
                    </td>
                  </tr>
                ) : filteredSellers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-sm text-neutral-500"
                    >
                      Aucun vendeur pour ces filtres.
                    </td>
                  </tr>
                ) : (
                  filteredSellers.map((seller) => (
                    <tr
                      key={seller.reviewId || seller.id}
                      className="hover:bg-neutral-50/80"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-sm font-medium text-neutral-700">
                            {seller.businessName?.[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-neutral-900">
                                {seller.businessName}
                              </p>
                              {seller.isVerified ? (
                                <Shield className="h-4 w-4 text-blue-600" />
                              ) : null}
                            </div>
                            <p className="mt-1 text-xs text-neutral-500">
                              {seller.businessType}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm text-neutral-600">
                        <p>{seller.contactPerson}</p>
                        <p className="mt-1 text-xs text-neutral-500">
                          {seller.contactEmail}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-sm text-neutral-900">
                        {seller.productsCount}
                      </td>
                      <td className="px-6 py-5 font-medium text-neutral-900">
                        {formatPrice(seller.totalRevenue, "HTG")}
                      </td>
                      <td className="px-6 py-5 text-sm text-neutral-600">
                        {seller.kycStatus || "not_submitted"}
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-3 py-1 text-xs font-medium",
                            sellerStatusClasses[seller.status] ||
                              "bg-neutral-100 text-neutral-700",
                          )}
                        >
                          {seller.status}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          {seller.status === "pending" ? (
                            <>
                              <button
                                onClick={() => void approveSeller(seller)}
                                className="rounded-xl border border-emerald-200 p-2 text-emerald-700 transition-colors hover:bg-emerald-50"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => void rejectSeller(seller)}
                                className="rounded-xl border border-rose-200 p-2 text-rose-700 transition-colors hover:bg-rose-50"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          ) : seller.status === "approved" ? (
                            <>
                              <button
                                onClick={() =>
                                  void verifySellerMutation.mutateAsync(
                                    seller.id,
                                  )
                                }
                                className="rounded-xl border border-blue-200 p-2 text-blue-700 transition-colors hover:bg-blue-50"
                                disabled={seller.isVerified}
                              >
                                <Shield className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => void suspendSeller(seller)}
                                className="rounded-xl border border-rose-200 p-2 text-rose-700 transition-colors hover:bg-rose-50"
                              >
                                <Ban className="h-4 w-4" />
                              </button>
                            </>
                          ) : seller.status === "suspended" ? (
                            <button
                              onClick={() =>
                                void unblockSellerMutation.mutateAsync(
                                  seller.id,
                                )
                              }
                              className="rounded-xl border border-emerald-200 p-2 text-emerald-700 transition-colors hover:bg-emerald-50"
                            >
                              <Unlock className="h-4 w-4" />
                            </button>
                          ) : null}
                          <button
                            onClick={() => openSellerDossier(seller)}
                            className="rounded-xl border border-neutral-200 p-2 text-neutral-600 transition-colors hover:border-neutral-300 hover:text-neutral-900"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {selectedSeller ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900">
                  {dossierSeller?.businessName}
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Dossier complet du vendeur
                </p>
              </div>
              <button
                onClick={closeSellerDossier}
                className="rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {dossierLoading ? (
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-10 text-center text-sm text-neutral-500">
                  Chargement du dossier vendeur...
                </div>
              ) : dossierError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
                  {getErrorMessage(dossierError)}
                </div>
              ) : dossierSeller ? (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-2xl bg-neutral-50 p-5">
                      <p className="text-sm text-neutral-500">Statut</p>
                      <p className="mt-2 text-2xl font-semibold text-neutral-900">
                        {dossierSeller.status}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-neutral-50 p-5">
                      <p className="text-sm text-neutral-500">KYC</p>
                      <p className="mt-2 text-2xl font-semibold text-neutral-900">
                        {dossierSeller.kycStatus || "not_submitted"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-neutral-50 p-5">
                      <p className="text-sm text-neutral-500">
                        Produits estimes
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-neutral-900">
                        {application?.estimatedProducts ??
                          dossierSeller.estimatedProducts ??
                          0}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-neutral-50 p-5">
                      <p className="text-sm text-neutral-500">Pieces KYC</p>
                      <p className="mt-2 text-2xl font-semibold text-neutral-900">
                        {documents.length}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
                    <section className="rounded-2xl border border-neutral-200 p-5">
                      <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                        Identite du vendeur
                      </p>
                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-xs text-neutral-400">
                            Nom complet
                          </p>
                          <p className="mt-1 font-medium text-neutral-900">
                            {applicantName}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-400">Nom legal</p>
                          <p className="mt-1 font-medium text-neutral-900">
                            {application?.legalName ||
                              dossierSeller.legalName ||
                              "Non fourni"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-400">
                            Email soumis
                          </p>
                          <p className="mt-1 font-medium text-neutral-900">
                            {application?.email ||
                              dossierSeller.applicationEmail ||
                              dossierSeller.contactEmail ||
                              "Non fourni"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-400">
                            Telephone soumis
                          </p>
                          <p className="mt-1 font-medium text-neutral-900">
                            {application?.phone ||
                              dossierSeller.applicationPhone ||
                              dossierSeller.contactPhone ||
                              "Non fourni"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-400">
                            Numero identite
                          </p>
                          <p className="mt-1 font-medium text-neutral-900">
                            {application?.identityDocumentNumber ||
                              dossierSeller.identityDocumentNumber ||
                              "Non fourni"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-400">Soumis le</p>
                          <p className="mt-1 font-medium text-neutral-900">
                            {formatDate(dossierSeller.applicationDate)}
                          </p>
                        </div>
                      </div>
                    </section>
                    <section className="rounded-2xl border border-neutral-200 p-5">
                      <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                        Boutique et activite
                      </p>
                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-xs text-neutral-400">
                            Nom boutique
                          </p>
                          <p className="mt-1 font-medium text-neutral-900">
                            {dossierSeller.businessName}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-400">Type</p>
                          <p className="mt-1 font-medium text-neutral-900">
                            {dossierSeller.businessType}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-400">
                            Numero fiscal
                          </p>
                          <p className="mt-1 font-medium text-neutral-900">
                            {dossierSeller.taxId || "Non fourni"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-400">
                            Boutique physique
                          </p>
                          <p className="mt-1 font-medium text-neutral-900">
                            {application?.hasPhysicalStore ||
                            dossierSeller.hasPhysicalStore
                              ? "Oui"
                              : "Non"}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-xs text-neutral-400">
                            Adresse boutique
                          </p>
                          <p className="mt-1 font-medium text-neutral-900">
                            {formatAddress(
                              application?.physicalStoreAddress ||
                                dossierSeller.physicalStoreAddress,
                            )}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-xs text-neutral-400">Categories</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {categoryNames.length > 0 ? (
                              categoryNames.map((name) => (
                                <span
                                  key={name}
                                  className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700"
                                >
                                  {name}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-neutral-500">
                                Aucune categorie
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-xs text-neutral-400">
                            Types de produits
                          </p>
                          <p className="mt-1 font-medium text-neutral-900">
                            {application?.productTypes ||
                              dossierSeller.productTypes ||
                              "Non fourni"}
                          </p>
                        </div>
                      </div>
                    </section>
                  </div>
                  <section className="rounded-2xl border border-neutral-200 p-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                      Description soumise
                    </p>
                    <p className="mt-3 text-sm leading-6 text-neutral-600">
                      {application?.description ||
                        dossierSeller.description ||
                        "Aucune description"}
                    </p>
                  </section>
                  <section className="rounded-2xl border border-neutral-200 p-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                      Piece d'identite et photo reelle
                    </p>
                    <div className="mt-5 grid gap-6 xl:grid-cols-2">
                      <DocumentPreview
                        document={identityDocument}
                        title="Piece d'identite"
                      />
                      <DocumentPreview
                        document={selfieDocument}
                        title="Photo reelle du vendeur"
                      />
                    </div>
                  </section>
                  <section className="rounded-2xl border border-neutral-200 p-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                      Toutes les pieces KYC
                    </p>
                    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {documents.length === 0 ? (
                        <p className="text-sm text-neutral-500">
                          Aucun document KYC soumis.
                        </p>
                      ) : (
                        documents.map((document) => (
                          <div
                            key={document.id}
                            className="rounded-2xl border border-neutral-200 bg-white p-4"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-medium text-neutral-900">
                                {documentTypeLabels[document.documentType] ||
                                  document.documentType}
                              </p>
                              <span className="inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
                                {document.status}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-neutral-500">
                              {document.fileName || document.storagePath}
                            </p>
                            <p className="mt-2 text-xs text-neutral-400">
                              Soumis le {formatDate(document.createdAt)}
                            </p>
                            {document.previewUrl ? (
                              <a
                                href={document.previewUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-neutral-700 hover:text-neutral-900"
                              >
                                Ouvrir
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            ) : null}
                          </div>
                        ))
                      )}
                    </div>
                  </section>
                  {dossierSeller.rejectionReason ? (
                    <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
                      <p className="text-xs uppercase tracking-[0.18em] text-rose-500">
                        Motif de rejet
                      </p>
                      <p className="mt-2 text-sm text-rose-700">
                        {dossierSeller.rejectionReason}
                      </p>
                    </section>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div className="flex flex-wrap justify-end gap-3 border-t border-neutral-200 px-6 py-5">
              <Button variant="outline" onClick={closeSellerDossier}>
                Fermer
              </Button>
              {dossierSeller?.status === "pending" ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => void rejectSeller(dossierSeller)}
                    disabled={rejectSellerMutation.isPending}
                  >
                    Rejeter
                  </Button>
                  <Button
                    onClick={() => void approveSeller(dossierSeller)}
                    disabled={approveSellerMutation.isPending}
                  >
                    Approuver
                  </Button>
                </>
              ) : dossierSeller?.status === "approved" ? (
                <Button
                  onClick={() => void suspendSeller(dossierSeller)}
                  className="bg-rose-600 hover:bg-rose-700"
                  disabled={blockSellerMutation.isPending}
                >
                  Suspendre
                </Button>
              ) : dossierSeller?.status === "suspended" ? (
                <Button
                  onClick={() =>
                    void unblockSellerMutation.mutateAsync(dossierSeller.id)
                  }
                  disabled={unblockSellerMutation.isPending}
                >
                  Reactiver
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  );
}
