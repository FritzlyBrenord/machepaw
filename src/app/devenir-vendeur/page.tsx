"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  FileBadge2,
  Mail,
  Phone,
  ShieldCheck,
  Store,
  Upload,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/useCategories";
import { useCurrentAccountQuery } from "@/hooks/useAccount";
import { useAuth } from "@/hooks/useAuth";
import {
  useSellerApplicationQuery,
  useSubmitSellerApplicationMutation,
  useUploadSellerKycDocumentMutation,
} from "@/hooks/useSellerWorkspace";
import { cn } from "@/lib/utils";

type SellerApplicationFormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  businessName: string;
  businessType: "individual" | "company";
  hasPhysicalStore: boolean;
  taxId: string;
  storeAddress: string;
  storeCity: string;
  storePostalCode: string;
  storeCountry: string;
  categories: string[];
  productTypes: string;
  description: string;
  estimatedProducts: string;
  legalName: string;
  identityDocumentNumber: string;
};

const initialFormState: SellerApplicationFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  businessName: "",
  businessType: "individual",
  hasPhysicalStore: false,
  taxId: "",
  storeAddress: "",
  storeCity: "",
  storePostalCode: "",
  storeCountry: "Haiti",
  categories: [],
  productTypes: "",
  description: "",
  estimatedProducts: "10",
  legalName: "",
  identityDocumentNumber: "",
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (error && typeof error === "object") {
    const supabaseError = error as {
      message?: unknown;
      details?: unknown;
      hint?: unknown;
      code?: unknown;
    };

    const parts = [
      typeof supabaseError.message === "string" ? supabaseError.message : null,
      typeof supabaseError.details === "string"
        ? `Details: ${supabaseError.details}`
        : null,
      typeof supabaseError.hint === "string"
        ? `Hint: ${supabaseError.hint}`
        : null,
      typeof supabaseError.code === "string"
        ? `Code: ${supabaseError.code}`
        : null,
    ].filter(Boolean);

    if (parts.length > 0) {
      return parts.join(" | ");
    }
  }

  return "Impossible de soumettre la candidature vendeur.";
}

export default function BecomeSellerPage() {
  const router = useRouter();
  const { data: account, isLoading: accountLoading } = useCurrentAccountQuery();
  const { data: application } = useSellerApplicationQuery();
  const { signOut } = useAuth();
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();
  const submitApplicationMutation = useSubmitSellerApplicationMutation();
  const uploadKycMutation = useUploadSellerKycDocumentMutation();

  const [form, setForm] =
    useState<SellerApplicationFormState>(initialFormState);
  const [identityFile, setIdentityFile] = useState<File | null>(null);
  const [selfieVerificationFile, setSelfieVerificationFile] =
    useState<File | null>(null);
  const [proofOfAddressFile, setProofOfAddressFile] = useState<File | null>(
    null,
  );
  const [businessRegistrationFile, setBusinessRegistrationFile] =
    useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (
      !accountLoading &&
      account?.role === "seller" &&
      account.seller?.status === "approved"
    ) {
      router.replace("/vendeur");
    }
  }, [account, accountLoading, router]);

  useEffect(() => {
    if (!account && !application) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm({
      firstName: application?.firstName || account?.firstName || "",
      lastName: application?.lastName || account?.lastName || "",
      email: application?.email || account?.email || "",
      phone: application?.phone || account?.phone || "",
      businessName:
        application?.businessName || account?.seller?.businessName || "",
      businessType:
        application?.businessType ||
        account?.seller?.businessType ||
        "individual",
      hasPhysicalStore: application?.hasPhysicalStore || false,
      taxId: application?.taxId || account?.seller?.taxId || "",
      storeAddress: application?.physicalStoreAddress?.address || "",
      storeCity: application?.physicalStoreAddress?.city || "",
      storePostalCode: application?.physicalStoreAddress?.postalCode || "",
      storeCountry: application?.physicalStoreAddress?.country || "Haiti",
      categories: application?.categories || account?.seller?.categories || [],
      productTypes: application?.productTypes || "",
      description:
        application?.description || account?.seller?.description || "",
      estimatedProducts: String(application?.estimatedProducts || 10),
      legalName: application?.legalName || "",
      identityDocumentNumber: application?.identityDocumentNumber || "",
    });
  }, [account, application]);

  const handleSignOut = () => {
    void signOut();
  };

  const existingDocumentTypes = useMemo(
    () =>
      new Set(
        (application?.kycDocuments || []).map(
          (document) => document.documentType,
        ),
      ),
    [application?.kycDocuments],
  );

  const toggleCategory = (categoryId: string) => {
    setForm((current) => ({
      ...current,
      categories: current.categories.includes(categoryId)
        ? current.categories.filter((id) => id !== categoryId)
        : [...current.categories, categoryId],
    }));
  };

  const submitApplication = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!account) {
      setError("Connectez-vous avant de soumettre une candidature vendeur.");
      return;
    }

    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.email.trim() ||
      !form.phone.trim()
    ) {
      setError("Les informations personnelles sont obligatoires.");
      return;
    }

    if (!form.identityDocumentNumber.trim()) {
      setError("Le numero du document d'identite est obligatoire.");
      return;
    }

    if (
      !form.businessName.trim() ||
      !form.description.trim() ||
      form.categories.length === 0
    ) {
      setError(
        "Les informations business et au moins une categorie sont obligatoires.",
      );
      return;
    }

    if (!identityFile && !existingDocumentTypes.has("national_id")) {
      setError("Ajoutez une piece d'identite pour le KYC vendeur.");
      return;
    }

    if (
      !selfieVerificationFile &&
      !existingDocumentTypes.has("selfie_verification")
    ) {
      setError("Ajoutez une photo reelle du vendeur pour la verification.");
      return;
    }

    if (!proofOfAddressFile && !existingDocumentTypes.has("proof_of_address")) {
      setError("Ajoutez un justificatif d'adresse pour le KYC vendeur.");
      return;
    }

    try {
      const applicationRow = await submitApplicationMutation.mutateAsync({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        businessName: form.businessName.trim(),
        businessType: form.businessType,
        hasPhysicalStore: form.hasPhysicalStore,
        physicalStoreAddress: form.hasPhysicalStore
          ? {
              firstName: form.firstName.trim(),
              lastName: form.lastName.trim(),
              address: form.storeAddress.trim(),
              city: form.storeCity.trim(),
              postalCode: form.storePostalCode.trim(),
              country: form.storeCountry.trim() || "Haiti",
              phone: form.phone.trim(),
            }
          : undefined,
        taxId: form.taxId.trim() || undefined,
        categories: form.categories,
        productTypes: form.productTypes.trim(),
        description: form.description.trim(),
        estimatedProducts: Number(form.estimatedProducts || 0),
        legalName: form.legalName.trim() || undefined,
        identityDocumentNumber: form.identityDocumentNumber.trim() || undefined,
      });

      if (!applicationRow?.id) {
        throw new Error(
          "Supabase n'a retourne aucune ligne apres l'enregistrement de la candidature.",
        );
      }

      const uploads: Promise<unknown>[] = [];

      if (identityFile) {
        uploads.push(
          uploadKycMutation.mutateAsync({
            sellerApplicationId: applicationRow.id,
            documentType: "national_id",
            file: identityFile,
          }),
        );
      }

      if (selfieVerificationFile) {
        uploads.push(
          uploadKycMutation.mutateAsync({
            sellerApplicationId: applicationRow.id,
            documentType: "selfie_verification",
            file: selfieVerificationFile,
          }),
        );
      }

      if (proofOfAddressFile) {
        uploads.push(
          uploadKycMutation.mutateAsync({
            sellerApplicationId: applicationRow.id,
            documentType: "proof_of_address",
            file: proofOfAddressFile,
          }),
        );
      }

      if (form.businessType === "company" && businessRegistrationFile) {
        uploads.push(
          uploadKycMutation.mutateAsync({
            sellerApplicationId: applicationRow.id,
            documentType: "business_registration",
            file: businessRegistrationFile,
          }),
        );
      }

      await Promise.all(uploads);
      setSuccess(true);
    } catch (submissionError: unknown) {
      console.error("Seller application submission failed:", submissionError);
      setError(getErrorMessage(submissionError));
    }
  };

  if (accountLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-neutral-900">
            Chargement
          </h1>
          <p className="mt-3 text-sm text-neutral-500">
            Verification du compte et de la candidature vendeur en cours.
          </p>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-lg rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-neutral-900">
            Connexion requise
          </h1>
          <p className="mt-3 text-sm leading-6 text-neutral-600">
            Connectez-vous pour deposer une candidature vendeur et suivre votre
            verification KYC.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/auth/login?redirect=/vendeur">
              <Button>Se connecter</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Abandonner</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (account.role === "seller" && account.seller?.status === "approved") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-xl rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold text-neutral-900">
            Compte vendeur actif
          </h1>
          <p className="mt-3 text-sm leading-6 text-neutral-600">
            Votre boutique est deja approuvee. Vous pouvez gerer vos produits,
            vos commandes et votre KYC depuis l&apos;espace vendeur.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/vendeur">
              <Button>Aller au dashboard vendeur</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Abandonner</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-xl rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold text-neutral-900">
            Candidature envoyee
          </h1>
          <p className="mt-3 text-sm leading-6 text-neutral-600">
            Vos informations business et vos documents KYC ont ete transmis.
            L&apos;administration peut maintenant examiner votre dossier.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/vendeur">
              <Button variant="outline">Voir l&apos;espace vendeur</Button>
            </Link>
            <Link href="/vendeur/parametres">
              <Button>Suivre mon KYC</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-light text-neutral-900">
            Devenir vendeur
          </h1>
          <p className="mt-4 text-sm leading-7 text-neutral-600">
            Ouvrez une boutique professionnelle avec verification KYC, produits
            lies a votre `seller_id` et gestion reelle des commandes par
            vendeur.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {account ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center rounded-full border border-neutral-900 px-5 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors"
            >
              Deconnexion
            </button>
          ) : (
            <Link href="/auth/login?redirect=/vendeur">
              <Button>Se connecter</Button>
            </Link>
          )}
          <Link href="/">
            <Button variant="outline">Abandonner</Button>
          </Link>
        </div>

        {application ? (
          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            Statut actuel: <strong>{application.status}</strong> • KYC:{" "}
            <strong>{application.kycStatus}</strong>
          </div>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <form
          onSubmit={submitApplication}
          className="mt-10 grid gap-6 xl:grid-cols-[1.2fr,0.8fr]"
        >
          <div className="space-y-6">
            <section className="rounded-3xl border border-neutral-200 bg-white p-6">
              <div className="flex items-center gap-2 text-neutral-900">
                <User className="w-5 h-5" />
                <h2 className="font-semibold">Identite du demandeur</h2>
              </div>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    Prenom
                  </label>
                  <input
                    value={form.firstName}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        firstName: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none transition-colors focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    Nom
                  </label>
                  <input
                    value={form.lastName}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        lastName: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none transition-colors focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-neutral-400" />
                    <input
                      value={form.email}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-neutral-200 py-3 pl-10 pr-4 outline-none transition-colors focus:border-neutral-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    Telephone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-neutral-400" />
                    <input
                      value={form.phone}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          phone: event.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-neutral-200 py-3 pl-10 pr-4 outline-none transition-colors focus:border-neutral-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    Nom legal
                  </label>
                  <input
                    value={form.legalName}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        legalName: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none transition-colors focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    Numero document identite
                  </label>
                  <input
                    value={form.identityDocumentNumber}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        identityDocumentNumber: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none transition-colors focus:border-neutral-900"
                    placeholder="Obligatoire pour le dossier KYC"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-neutral-200 bg-white p-6">
              <div className="flex items-center gap-2 text-neutral-900">
                <Building2 className="w-5 h-5" />
                <h2 className="font-semibold">Boutique et activite</h2>
              </div>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    Nom boutique
                  </label>
                  <input
                    value={form.businessName}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        businessName: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none transition-colors focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    Type
                  </label>
                  <select
                    value={form.businessType}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        businessType: event.target.value as
                          | "individual"
                          | "company",
                      }))
                    }
                    className="w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none transition-colors focus:border-neutral-900"
                  >
                    <option value="individual">Individuel</option>
                    <option value="company">Societe</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    Numero fiscal (optionnel)
                  </label>
                  <input
                    value={form.taxId}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        taxId: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none transition-colors focus:border-neutral-900"
                    placeholder="Laissez vide si vous n'en avez pas"
                  />
                </div>
                <label className="flex items-center gap-3 rounded-2xl border border-neutral-200 px-4 py-3 text-sm text-neutral-700">
                  <input
                    type="checkbox"
                    checked={form.hasPhysicalStore}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        hasPhysicalStore: event.target.checked,
                      }))
                    }
                  />
                  J&apos;ai une boutique physique
                </label>
                {form.hasPhysicalStore ? (
                  <>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-neutral-700">
                        Adresse boutique
                      </label>
                      <input
                        value={form.storeAddress}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            storeAddress: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none transition-colors focus:border-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-neutral-700">
                        Ville
                      </label>
                      <input
                        value={form.storeCity}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            storeCity: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none transition-colors focus:border-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-neutral-700">
                        Code postal
                      </label>
                      <input
                        value={form.storePostalCode}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            storePostalCode: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none transition-colors focus:border-neutral-900"
                      />
                    </div>
                  </>
                ) : null}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    Description activite
                  </label>
                  <textarea
                    rows={5}
                    value={form.description}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none transition-colors focus:border-neutral-900"
                    placeholder="Decrivez votre specialite, vos produits et votre mode de fonctionnement."
                  />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-neutral-200 bg-white p-6">
              <div className="flex items-center gap-2 text-neutral-900">
                <Store className="w-5 h-5" />
                <h2 className="font-semibold">Catalogue et categories</h2>
              </div>
              <div className="mt-5 grid gap-5">
                <div>
                  <label className="mb-3 block text-sm font-medium text-neutral-700">
                    Categories souhaitees
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {categoriesLoading ? (
                      <p className="text-sm text-neutral-500">
                        Chargement des categories...
                      </p>
                    ) : (
                      categories.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => toggleCategory(category.id)}
                          className={cn(
                            "rounded-full border px-4 py-2 text-sm transition-colors",
                            form.categories.includes(category.id)
                              ? "border-neutral-900 bg-neutral-900 text-white"
                              : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:text-neutral-900",
                          )}
                        >
                          {category.name}
                        </button>
                      ))
                    )}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    Types de produits
                  </label>
                  <input
                    value={form.productTypes}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        productTypes: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none transition-colors focus:border-neutral-900"
                    placeholder="Ex: maroquinerie premium, bijoux, accessoires..."
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    Volume estime
                  </label>
                  <input
                    type="number"
                    value={form.estimatedProducts}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        estimatedProducts: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none transition-colors focus:border-neutral-900"
                  />
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-3xl border border-neutral-200 bg-white p-6">
              <div className="flex items-center gap-2 text-neutral-900">
                <ShieldCheck className="w-5 h-5" />
                <h2 className="font-semibold">Documents KYC</h2>
              </div>
              <div className="mt-5 space-y-4">
                <label className="block rounded-2xl border border-dashed border-neutral-300 px-4 py-4 text-sm text-neutral-600 transition-colors hover:border-neutral-500 hover:bg-neutral-50">
                  <span className="flex items-center justify-between gap-3">
                    <span>
                      Piece d&apos;identite{" "}
                      {identityFile ? `• ${identityFile.name}` : ""}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-3 py-2 text-xs text-white">
                      <Upload className="w-3.5 h-3.5" />
                      Choisir
                    </span>
                  </span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(event) =>
                      setIdentityFile(event.target.files?.[0] || null)
                    }
                  />
                </label>

                <label className="block rounded-2xl border border-dashed border-neutral-300 px-4 py-4 text-sm text-neutral-600 transition-colors hover:border-neutral-500 hover:bg-neutral-50">
                  <span className="flex items-center justify-between gap-3">
                    <span>
                      Photo reelle du vendeur (selfie){" "}
                      {selfieVerificationFile
                        ? `â€¢ ${selfieVerificationFile.name}`
                        : ""}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-3 py-2 text-xs text-white">
                      <Upload className="w-3.5 h-3.5" />
                      Choisir
                    </span>
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) =>
                      setSelfieVerificationFile(event.target.files?.[0] || null)
                    }
                  />
                </label>

                <label className="block rounded-2xl border border-dashed border-neutral-300 px-4 py-4 text-sm text-neutral-600 transition-colors hover:border-neutral-500 hover:bg-neutral-50">
                  <span className="flex items-center justify-between gap-3">
                    <span>
                      Justificatif d&apos;adresse{" "}
                      {proofOfAddressFile ? `• ${proofOfAddressFile.name}` : ""}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-3 py-2 text-xs text-white">
                      <Upload className="w-3.5 h-3.5" />
                      Choisir
                    </span>
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(event) =>
                      setProofOfAddressFile(event.target.files?.[0] || null)
                    }
                  />
                </label>

                {form.businessType === "company" ? (
                  <label className="block rounded-2xl border border-dashed border-neutral-300 px-4 py-4 text-sm text-neutral-600 transition-colors hover:border-neutral-500 hover:bg-neutral-50">
                    <span className="flex items-center justify-between gap-3">
                      <span>
                        Enregistrement entreprise{" "}
                        {businessRegistrationFile
                          ? `• ${businessRegistrationFile.name}`
                          : ""}
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-3 py-2 text-xs text-white">
                        <Upload className="w-3.5 h-3.5" />
                        Choisir
                      </span>
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(event) =>
                        setBusinessRegistrationFile(
                          event.target.files?.[0] || null,
                        )
                      }
                    />
                  </label>
                ) : null}
              </div>
            </section>

            <section className="rounded-3xl border border-neutral-200 bg-white p-6">
              <div className="flex items-center gap-2 text-neutral-900">
                <FileBadge2 className="w-5 h-5" />
                <h2 className="font-semibold">Ce que vous obtenez</h2>
              </div>
              <ul className="mt-5 space-y-3 text-sm text-neutral-600">
                <li className="rounded-2xl bg-neutral-50 px-4 py-3">
                  Produits relies a votre `seller_id` et visibles uniquement
                  dans votre espace.
                </li>
                <li className="rounded-2xl bg-neutral-50 px-4 py-3">
                  Commandes filtrées par produit vendeur, avec mise a jour de
                  statut securisee.
                </li>
                <li className="rounded-2xl bg-neutral-50 px-4 py-3">
                  Dossier KYC prive, revue admin et suivi direct depuis vos
                  parametres.
                </li>
              </ul>
            </section>

            <div className="flex flex-wrap gap-3">
              <Button
                type="submit"
                disabled={
                  submitApplicationMutation.isPending ||
                  uploadKycMutation.isPending
                }
              >
                {submitApplicationMutation.isPending ||
                uploadKycMutation.isPending
                  ? "Envoi..."
                  : "Soumettre ma candidature"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Link href="/">
                <Button type="button" variant="outline">
                  Retour au site
                </Button>
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
