"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Save,
  ShieldCheck,
  Store,
  Truck,
  Upload,
  UserCircle2,
} from "lucide-react";
import { SellerWorkspaceShell } from "@/components/SellerWorkspaceShell";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import {
  SELLER_PAYMENT_METHODS,
  type SellerPaymentMethodCode,
} from "@/data/paymentMethods";
import { SellerSetupRequiredModal } from "@/components/seller/SellerSetupRequiredModal";
import haitiData from "@/data/haitiData.json";
import { getSellerSetupStatus } from "@/data/sellerSetup";
import type { SellerPaymentMethod } from "@/data/types";
import { uploadImage } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import {
  useCurrentAccountQuery,
  useUpdateAccountProfileMutation,
  useUpdateSellerProfileMutation,
} from "@/hooks/useAccount";
import {
  useSellerApplicationQuery,
  useUploadSellerKycDocumentMutation,
} from "@/hooks/useSellerWorkspace";
import {
  useSellerPaymentMethodsQuery,
  useUpsertSellerPaymentMethodsMutation,
} from "@/hooks/useSellerPaymentMethods";
import type {
  Address,
  SellerKycDocumentType,
  SellerNotificationSettings,
  SellerPayoutDetails,
  SellerShippingSettings,
} from "@/data/types";

type SellerTab = "profile" | "shipping" | "payments" | "kyc";

type HaitiLocation = {
  name: string;
  type?: string;
  commune?: string;
  lat?: number;
  lng?: number;
  [key: string]: unknown;
};

type ProfileFormState = {
  firstName: string;
  lastName: string;
  phone: string;
  avatar: string;
  logo: string;
  businessName: string;
  storeSlug: string;
  description: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  notificationSettings: SellerNotificationSettings;
  payoutDetails: SellerPayoutDetails;
};

type ShippingFormState = {
  locationName: string;
  locationType: string;
  locationDept: string;
  latitude?: number;
  longitude?: number;
  basePrice: string;
  pricePerKm: string;
  allowDelivery: boolean;
  allowPickup: boolean;
  pickupAddress: string;
  pickupCity: string;
  pickupCountry: string;
  pickupPhone: string;
};

type PaymentMethodFormItem = {
  isActive: boolean;
  merchantFirstName: string;
  merchantLastName: string;
  merchantAgentCode: string;
};

type PaymentFormState = {
  confirmCorrect: boolean;
  methods: Record<SellerPaymentMethodCode, PaymentMethodFormItem>;
};

const defaultNotificationSettings: SellerNotificationSettings = {
  newOrders: true,
  newMessages: true,
  productReviews: true,
  promotions: false,
  newsletter: true,
};

function buildDefaultPaymentFormState(
  rows: SellerPaymentMethod[] = [],
): PaymentFormState {
  return {
    confirmCorrect: false,
    methods: Object.fromEntries(
      SELLER_PAYMENT_METHODS.map((definition) => {
        const current = rows.find((row) => row.methodCode === definition.code);

        return [
          definition.code,
          {
            isActive: Boolean(current?.isActive),
            merchantFirstName: current?.merchantFirstName || "",
            merchantLastName: current?.merchantLastName || "",
            merchantAgentCode: current?.merchantAgentCode || "",
          },
        ];
      }),
    ) as Record<SellerPaymentMethodCode, PaymentMethodFormItem>,
  };
}

const requiredDocuments: Array<{
  type: SellerKycDocumentType;
  label: string;
  description: string;
}> = [
  {
    type: "national_id",
    label: "Piece d'identite",
    description: "Recto ou scan lisible de votre carte nationale.",
  },
  {
    type: "selfie_verification",
    label: "Photo reelle",
    description: "Photo claire de vous avec le visage visible.",
  },
  {
    type: "proof_of_address",
    label: "Preuve d'adresse",
    description: "Facture, recu ou attestation recente.",
  },
  {
    type: "bank_statement",
    label: "Justificatif bancaire",
    description: "Releve ou document utile pour les paiements vendeur.",
  },
];

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (error && typeof error === "object") {
    const candidate = error as {
      message?: unknown;
      details?: unknown;
      hint?: unknown;
      code?: unknown;
    };

    const parts = [
      typeof candidate.message === "string" ? candidate.message : null,
      typeof candidate.details === "string"
        ? `Details: ${candidate.details}`
        : null,
      typeof candidate.hint === "string" ? `Hint: ${candidate.hint}` : null,
      typeof candidate.code === "string" ? `Code: ${candidate.code}` : null,
    ].filter(Boolean);

    if (parts.length > 0) {
      return parts.join(" | ");
    }
  }

  return fallback;
}

function formatDocumentDate(value?: string) {
  if (!value) {
    return "Jamais";
  }

  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getLocationDepartment(item: HaitiLocation) {
  const match = Object.entries(item).find(([key]) =>
    key.toLowerCase().includes("part"),
  );

  return typeof match?.[1] === "string" ? match[1] : "";
}

function normalizeStoreSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export default function SellerSettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setupQuery = searchParams.get("setup");
  const focusQuery = searchParams.get("focus");
  const redirectQuery = searchParams.get("redirect");
  const { data: account, isLoading } = useCurrentAccountQuery();
  const { data: application } = useSellerApplicationQuery();
  const {
    data: sellerPaymentMethods = [],
    isLoading: sellerPaymentMethodsLoading,
  } = useSellerPaymentMethodsQuery(account?.seller?.id);
  const updateAccountMutation = useUpdateAccountProfileMutation();
  const updateSellerMutation = useUpdateSellerProfileMutation();
  const upsertPaymentMethodsMutation = useUpsertSellerPaymentMethodsMutation();
  const uploadKycMutation = useUploadSellerKycDocumentMutation();

  const [activeTab, setActiveTab] = useState<SellerTab>("profile");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState<ProfileFormState | null>(null);
  const [shippingForm, setShippingForm] = useState<ShippingFormState | null>(
    null,
  );
  const [paymentForm, setPaymentForm] = useState<PaymentFormState | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);

  const locationOptions = useMemo(() => {
    const raw = ((haitiData as unknown as { default?: HaitiLocation[] })
      .default || (haitiData as HaitiLocation[])) as HaitiLocation[];

    const seen = new Set<string>();

    return raw
      .filter((item) => {
        const department = getLocationDepartment(item);
        const key = `${item.name}|${item.type || ""}|${department}|${item.lat || ""}|${item.lng || ""}`;
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      })
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
      .map((item) => {
        const department = getLocationDepartment(item);

        return {
          value: `${item.name}|${item.type || ""}|${department}|${item.lat ?? ""}|${item.lng ?? ""}`,
          label: item.name,
          sublabel: `${department}${item.type ? ` - ${item.type}` : ""}${item.commune ? ` (${item.commune})` : ""}`,
        };
      });
  }, []);

  useEffect(() => {
    if (!account) {
      return;
    }

    setProfileForm({
      firstName: account.firstName || "",
      lastName: account.lastName || "",
      phone: account.phone || "",
      avatar: account.avatar || "",
      logo: account.seller?.logo || "",
      businessName: account.seller?.businessName || "",
      storeSlug:
        account.seller?.storeSlug ||
        normalizeStoreSlug(account.seller?.businessName || ""),
      description: account.seller?.description || "",
      contactPerson: account.seller?.contactPerson || "",
      contactPhone: account.seller?.contactPhone || "",
      contactEmail: account.seller?.contactEmail || account.email || "",
      notificationSettings:
        account.seller?.notificationSettings || defaultNotificationSettings,
      payoutDetails: account.seller?.payoutDetails || {},
    });

    setShippingForm({
      locationName: account.seller?.shippingSettings?.locationName || "",
      locationType: account.seller?.shippingSettings?.locationType || "",
      locationDept: account.seller?.shippingSettings?.locationDept || "",
      latitude: account.seller?.shippingSettings?.latitude,
      longitude: account.seller?.shippingSettings?.longitude,
      basePrice: String(account.seller?.shippingSettings?.basePrice ?? 0),
      pricePerKm: String(account.seller?.shippingSettings?.pricePerKm ?? 0),
      allowDelivery: Boolean(account.seller?.shippingSettings?.allowDelivery),
      allowPickup: Boolean(account.seller?.shippingSettings?.allowPickup),
      pickupAddress: account.seller?.pickupAddress?.address || "",
      pickupCity: account.seller?.pickupAddress?.city || "",
      pickupCountry: account.seller?.pickupAddress?.country || "Haiti",
      pickupPhone:
        account.seller?.pickupAddress?.phone ||
        account.seller?.contactPhone ||
        "",
    });
  }, [account]);

  useEffect(() => {
    if (!account?.seller || sellerPaymentMethodsLoading || paymentForm) {
      return;
    }

    setPaymentForm(buildDefaultPaymentFormState(sellerPaymentMethods));
  }, [
    account?.seller,
    sellerPaymentMethods,
    sellerPaymentMethodsLoading,
    paymentForm,
  ]);

  const setupStatus = useMemo(
    () => getSellerSetupStatus(account?.seller, sellerPaymentMethods),
    [account?.seller, sellerPaymentMethods],
  );

  useEffect(() => {
    if (
      focusQuery === "shipping" ||
      focusQuery === "payments" ||
      focusQuery === "profile" ||
      focusQuery === "kyc"
    ) {
      setActiveTab(focusQuery as SellerTab);
    }
  }, [focusQuery]);

  useEffect(() => {
    if (setupStatus.isComplete) {
      setShowSetupModal(false);
      return;
    }

    if (setupQuery === "required") {
      setShowSetupModal(true);
      setActiveTab(setupStatus.shippingReady ? "payments" : "shipping");
    }
  }, [
    setupQuery,
    setupStatus.isComplete,
    setupStatus.paymentsReady,
    setupStatus.shippingReady,
  ]);

  useEffect(() => {
    if (setupStatus.isComplete && redirectQuery) {
      router.replace(redirectQuery);
    }
  }, [redirectQuery, router, setupStatus.isComplete]);

  if (isLoading || !profileForm || !shippingForm || !paymentForm) {
    return (
      <SellerWorkspaceShell
        title="Parametres vendeur"
        description="Chargement de votre espace profil et livraison."
      >
        <div className="rounded-3xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">
          Chargement des parametres vendeur...
        </div>
      </SellerWorkspaceShell>
    );
  }

  if (!account?.seller) {
    return (
      <SellerWorkspaceShell
        title="Parametres vendeur"
        description="Votre espace vendeur n'est pas encore disponible."
      >
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          Ce compte n&apos;a pas encore de profil vendeur actif. Finalisez votre
          dossier vendeur pour gerer le profil, la livraison et vos documents
          KYC.
        </div>
      </SellerWorkspaceShell>
    );
  }

  const currentAccount = account;
  const seller = currentAccount.seller!;
  const currentProfile = profileForm!;
  const currentShipping = shippingForm!;
  const selectedLocationValue = currentShipping.locationName
    ? `${currentShipping.locationName}|${currentShipping.locationType || ""}|${currentShipping.locationDept || ""}|${currentShipping.latitude ?? ""}|${currentShipping.longitude ?? ""}`
    : "";

  const sellerStatusTone =
    seller.status === "approved"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : seller.status === "pending"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-rose-50 text-rose-700 border-rose-200";

  const kycStatusTone =
    seller.kycStatus === "approved"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : seller.kycStatus === "pending"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-neutral-100 text-neutral-700 border-neutral-200";

  async function handleAvatarUpload(file?: File | null) {
    if (!file) {
      return;
    }

    setError(null);
    setFeedback(null);
    setUploadingAvatar(true);

    try {
      const extension = file.name.split(".").pop() || "jpg";
      const avatarUrl = await uploadImage(
        "avatars",
        `${currentAccount.authId || currentAccount.userId}/seller-profile-${Date.now()}.${extension}`,
        file,
      );

      if (!avatarUrl) {
        throw new Error("Le televersement de la photo de profil a echoue.");
      }

      await updateAccountMutation.mutateAsync({ avatar: avatarUrl });
      setProfileForm((current) =>
        current
          ? {
              ...current,
              avatar: avatarUrl,
            }
          : current,
      );
      setFeedback("Photo de profil mise a jour.");
    } catch (uploadError) {
      setError(
        getErrorMessage(
          uploadError,
          "Impossible d'envoyer la photo de profil.",
        ),
      );
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleBoutiqueLogoUpload(file?: File | null) {
    if (!file || !account?.seller?.id) {
      return;
    }

    setError(null);
    setFeedback(null);
    setUploadingLogo(true);

    try {
      const extension = file.name.split(".").pop() || "jpg";
      const logoUrl = await uploadImage(
        "avatars",
        `seller-logos/${account.seller.id}/boutique-logo-${Date.now()}.${extension}`,
        file,
      );

      if (!logoUrl) {
        throw new Error("Le televersement du logo boutique a echoue.");
      }

      await updateSellerMutation.mutateAsync({ logo: logoUrl });
      setProfileForm((current) =>
        current
          ? {
              ...current,
              logo: logoUrl,
            }
          : current,
      );
      setFeedback("Logo de la boutique mis a jour.");
    } catch (uploadError) {
      setError(
        getErrorMessage(uploadError, "Impossible d'envoyer le logo boutique."),
      );
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleProfileSave() {
    setError(null);
    setFeedback(null);

    try {
      await updateAccountMutation.mutateAsync({
        firstName: currentProfile.firstName.trim(),
        lastName: currentProfile.lastName.trim(),
        phone: currentProfile.phone.trim(),
      });

      await updateSellerMutation.mutateAsync({
        businessName: currentProfile.businessName.trim(),
        storeSlug: normalizeStoreSlug(currentProfile.storeSlug.trim()),
        logo: currentProfile.logo.trim() || null,
        description: currentProfile.description.trim(),
        contactPerson: currentProfile.contactPerson.trim(),
        contactPhone: currentProfile.contactPhone.trim(),
        contactEmail: currentProfile.contactEmail.trim(),
        notificationSettings: currentProfile.notificationSettings,
        payoutDetails: currentProfile.payoutDetails,
      });

      setFeedback("Profil vendeur enregistre rapidement avec succes.");
    } catch (saveError) {
      setError(
        getErrorMessage(
          saveError,
          "Impossible d'enregistrer le profil vendeur.",
        ),
      );
    }
  }

  async function handleShippingSave() {
    setError(null);
    setFeedback(null);

    if (!currentShipping.allowDelivery && !currentShipping.allowPickup) {
      setError("Activez au moins la livraison ou le retrait en magasin.");
      setActiveTab("shipping");
      return;
    }

    const basePrice = Number(currentShipping.basePrice);
    const pricePerKm = Number(currentShipping.pricePerKm);

    if (currentShipping.allowDelivery) {
      if (!currentShipping.locationName.trim()) {
        setError(
          "Choisissez votre localisation pivot pour la livraison dynamique.",
        );
        setActiveTab("shipping");
        return;
      }

      if (!Number.isFinite(basePrice) || !Number.isFinite(pricePerKm)) {
        setError(
          "Les frais de base et le prix par kilometre doivent etre valides.",
        );
        setActiveTab("shipping");
        return;
      }

      if (
        currentShipping.latitude === undefined ||
        currentShipping.longitude === undefined
      ) {
        setError(
          "La livraison exige une localisation complete avec latitude et longitude.",
        );
        setActiveTab("shipping");
        return;
      }
    }

    if (currentShipping.allowPickup && !currentShipping.pickupAddress.trim()) {
      setError(
        "Ajoutez l'adresse de retrait si le retrait en magasin est active.",
      );
      setActiveTab("shipping");
      return;
    }

    const shippingSettings: SellerShippingSettings = {
      freeShipping: false,
      allowDelivery: currentShipping.allowDelivery,
      allowPickup: currentShipping.allowPickup,
      basePrice: currentShipping.allowDelivery ? basePrice : 0,
      pricePerKm: currentShipping.allowDelivery ? pricePerKm : 0,
      locationName: currentShipping.allowDelivery
        ? currentShipping.locationName.trim()
        : undefined,
      locationType: currentShipping.allowDelivery
        ? currentShipping.locationType.trim() || undefined
        : undefined,
      locationDept: currentShipping.allowDelivery
        ? currentShipping.locationDept.trim() || undefined
        : undefined,
      latitude: currentShipping.allowDelivery
        ? currentShipping.latitude
        : undefined,
      longitude: currentShipping.allowDelivery
        ? currentShipping.longitude
        : undefined,
    };

    const pickupAddress: Address | null = currentShipping.allowPickup
      ? {
          firstName: currentProfile.firstName || "Retrait",
          lastName: currentProfile.lastName || "Boutique",
          address: currentShipping.pickupAddress.trim(),
          city:
            currentShipping.pickupCity.trim() ||
            currentShipping.locationName.trim(),
          postalCode: "",
          country: currentShipping.pickupCountry.trim() || "Haiti",
          phone:
            currentShipping.pickupPhone.trim() ||
            currentProfile.contactPhone.trim(),
        }
      : null;

    try {
      await updateSellerMutation.mutateAsync({
        shippingSettings,
        pickupAddress,
      });
      setFeedback("Configuration livraison vendeur enregistree.");
    } catch (saveError) {
      setError(
        getErrorMessage(saveError, "Impossible d'enregistrer la livraison."),
      );
    }
  }

  async function handlePaymentSave() {
    setError(null);
    setFeedback(null);

    if (!paymentForm?.confirmCorrect) {
      setError(
        "Confirmez que toutes les informations sont correctes avant de creer.",
      );
      setActiveTab("payments");
      return;
    }

    if (!account?.seller) {
      setError("Compte vendeur introuvable.");
      return;
    }

    if (!Object.values(paymentForm.methods).some((method) => method.isActive)) {
      setError("Activez au moins un mode de paiement pour votre boutique.");
      setActiveTab("payments");
      return;
    }

    try {
      const allowPickup = Boolean(
        currentAccount.seller?.shippingSettings?.allowPickup &&
        currentAccount.seller?.pickupAddress,
      );

      const payload = SELLER_PAYMENT_METHODS.map((definition) => {
        const draft = paymentForm.methods[definition.code];
        const isActive = Boolean(draft.isActive);

        if (isActive && !definition.operational) {
          throw new Error(`${definition.label} n'est pas encore operationnel.`);
        }

        if (isActive && definition.code === "store_pickup" && !allowPickup) {
          throw new Error(
            "Activez d'abord le retrait en magasin dans la section Livraison avant d'activer ce mode.",
          );
        }

        if (isActive && definition.requiresManualEntry) {
          if (
            !draft.merchantFirstName.trim() ||
            !draft.merchantLastName.trim()
          ) {
            throw new Error(
              `Le prenom et le nom sont obligatoires pour ${definition.label}.`,
            );
          }

          if (!/^[0-9]{6}$/.test(draft.merchantAgentCode.trim())) {
            throw new Error(
              "Le code agent doit contenir exactement 6 chiffres.",
            );
          }
        }

        return {
          methodCode: definition.code,
          isActive,
          merchantFirstName: draft.merchantFirstName.trim(),
          merchantLastName: draft.merchantLastName.trim(),
          merchantAgentCode: draft.merchantAgentCode.trim(),
        };
      });

      await upsertPaymentMethodsMutation.mutateAsync(payload);
      setPaymentForm((current) =>
        current
          ? {
              ...current,
              confirmCorrect: false,
            }
          : current,
      );
      setFeedback("Modes de paiement enregistres pour votre boutique.");
    } catch (saveError) {
      setError(
        getErrorMessage(
          saveError,
          "Impossible d'enregistrer les modes de paiement.",
        ),
      );
      setActiveTab("payments");
    }
  }

  function updatePaymentMethodDraft(
    methodCode: SellerPaymentMethodCode,
    nextDraft: Partial<PaymentMethodFormItem>,
  ) {
    setPaymentForm((current) =>
      current
        ? {
            ...current,
            confirmCorrect: false,
            methods: {
              ...current.methods,
              [methodCode]: {
                ...current.methods[methodCode],
                ...nextDraft,
              },
            },
          }
        : current,
    );
  }

  async function handleKycUpload(
    type: SellerKycDocumentType,
    file?: File | null,
  ) {
    if (!file) {
      return;
    }

    setError(null);
    setFeedback(null);

    try {
      await uploadKycMutation.mutateAsync({
        documentType: type,
        sellerApplicationId: application?.id,
        file,
      });
      setFeedback("Document KYC envoye avec succes.");
    } catch (uploadError) {
      setError(
        getErrorMessage(uploadError, "Impossible d'envoyer le document KYC."),
      );
      setActiveTab("kyc");
    }
  }

  return (
    <SellerWorkspaceShell
      title="Parametres vendeur"
      description="Separez votre profil, votre livraison, vos paiements et vos documents KYC pour mettre a jour votre boutique plus vite."
      actions={
        activeTab === "profile" ? (
          <Button
            onClick={handleProfileSave}
            disabled={
              updateAccountMutation.isPending || updateSellerMutation.isPending
            }
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            Enregistrer le profil
          </Button>
        ) : activeTab === "shipping" ? (
          <Button
            onClick={handleShippingSave}
            disabled={updateSellerMutation.isPending}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            Enregistrer la livraison
          </Button>
        ) : activeTab === "payments" ? (
          <Button
            onClick={handlePaymentSave}
            disabled={
              upsertPaymentMethodsMutation.isPending || !paymentForm.confirmCorrect
            }
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            Creer les modes de paiement
          </Button>
        ) : null
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatusCard
          icon={<Store className="h-5 w-5" />}
          label="Statut vendeur"
          value={account.seller.status}
          tone={sellerStatusTone}
        />
        <StatusCard
          icon={<ShieldCheck className="h-5 w-5" />}
          label="KYC"
          value={account.seller.kycStatus || "not_submitted"}
          tone={kycStatusTone}
        />
        <StatusCard
          icon={<Truck className="h-5 w-5" />}
          label="Reception"
          value={
            setupStatus.availableModes.length > 0
              ? setupStatus.availableModes
                  .map((mode) =>
                    mode === "delivery" ? "Livraison" : "Retrait",
                  )
                  .join(" + ")
              : "A configurer"
          }
          tone="bg-sky-50 text-sky-700 border-sky-200"
        />
      </div>

      {!setupStatus.isComplete ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          <div className="flex items-center gap-2 font-semibold">
            <AlertCircle className="h-4 w-4" />
            Configuration boutique obligatoire
          </div>
          <p className="mt-2 leading-6 text-amber-800">
            Avant de vendre, vous devez configurer au moins un mode de reception
            et un mode de paiement actif. Utilisez les onglets Livraison et
            Paiements ci-dessous pour terminer votre boutique.
          </p>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {feedback ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {feedback}
        </div>
      ) : null}

      <SellerSetupRequiredModal
        open={showSetupModal && !setupStatus.isComplete}
        status={setupStatus}
        onClose={() => setShowSetupModal(false)}
        onFocusShipping={() => setActiveTab("shipping")}
        onFocusPayments={() => setActiveTab("payments")}
      />

      <div className="flex flex-wrap gap-2 rounded-3xl border border-neutral-200 bg-white p-2">
        {[
          { id: "profile", label: "Profil", icon: UserCircle2 },
          { id: "shipping", label: "Livraison", icon: Truck },
          { id: "payments", label: "Paiements", icon: CreditCard },
          { id: "kyc", label: "KYC", icon: ShieldCheck },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as SellerTab)}
            className={cn(
              "flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-neutral-900 text-white"
                : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "profile" ? (
        <div className="grid gap-6 xl:grid-cols-[1.05fr_1.45fr]">
          <section className="space-y-6 rounded-3xl border border-neutral-200 bg-white p-6">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">
                Profil rapide
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Modifiez votre photo profil et vos coordonnees principales sans
                passer par l&apos;admin.
              </p>
            </div>

            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-neutral-200 bg-neutral-100">
                {profileForm.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profileForm.avatar}
                    alt="Profil vendeur"
                    className="block h-full w-full rounded-full object-cover object-center"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <UserCircle2 className="h-14 w-14 text-neutral-400" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                  <Upload className="h-4 w-4" />
                  {uploadingAvatar ? "Envoi..." : "Changer la photo profil"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) =>
                      handleAvatarUpload(event.target.files?.[0])
                    }
                    disabled={uploadingAvatar}
                  />
                </label>
                <p className="text-xs text-neutral-500">
                  Cette photo utilise votre profil utilisateur et reste visible
                  dans votre espace vendeur.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Prenom">
                <input
                  value={profileForm.firstName}
                  onChange={(event) =>
                    setProfileForm({
                      ...profileForm,
                      firstName: event.target.value,
                    })
                  }
                  className={inputClassName}
                />
              </Field>
              <Field label="Nom">
                <input
                  value={profileForm.lastName}
                  onChange={(event) =>
                    setProfileForm({
                      ...profileForm,
                      lastName: event.target.value,
                    })
                  }
                  className={inputClassName}
                />
              </Field>
              <Field label="Telephone">
                <input
                  value={profileForm.phone}
                  onChange={(event) =>
                    setProfileForm({
                      ...profileForm,
                      phone: event.target.value,
                    })
                  }
                  className={inputClassName}
                />
              </Field>
              <Field label="Email du compte">
                <input
                  value={account.email}
                  disabled
                  className={`${inputClassName} bg-neutral-50`}
                />
              </Field>
            </div>
          </section>

          <section className="space-y-6 rounded-3xl border border-neutral-200 bg-white p-6">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">
                Boutique et paiements
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Gardez vos informations vendeur, votre lien boutique, vos
                notifications et votre paiement a jour.
              </p>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white">
                    {profileForm.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profileForm.logo}
                        alt="Logo de la boutique"
                        className="block h-full w-full object-cover object-center"
                      />
                    ) : (
                      <Store className="h-8 w-8 text-neutral-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-900">
                      Logo de la boutique
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-neutral-500">
                      Ce logo sera affiche uniquement sur votre boutique
                      publique et dans sa navigation.
                    </p>
                  </div>
                </div>

                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100">
                  <Upload className="h-4 w-4" />
                  {uploadingLogo ? "Envoi..." : "Changer le logo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingLogo}
                    onChange={(event) =>
                      void handleBoutiqueLogoUpload(event.target.files?.[0])
                    }
                  />
                </label>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nom de la boutique">
                <input
                  value={profileForm.businessName}
                  onChange={(event) =>
                    setProfileForm({
                      ...profileForm,
                      businessName: event.target.value,
                    })
                  }
                  className={inputClassName}
                />
              </Field>
              <Field label="Lien boutique">
                <input
                  value={profileForm.storeSlug}
                  onChange={(event) =>
                    setProfileForm({
                      ...profileForm,
                      storeSlug: normalizeStoreSlug(event.target.value),
                    })
                  }
                  className={inputClassName}
                  placeholder="code-interne-boutique"
                />
              </Field>
              <Field label="Contact principal">
                <input
                  value={profileForm.contactPerson}
                  onChange={(event) =>
                    setProfileForm({
                      ...profileForm,
                      contactPerson: event.target.value,
                    })
                  }
                  className={inputClassName}
                />
              </Field>
              <Field label="Telephone boutique">
                <input
                  value={profileForm.contactPhone}
                  onChange={(event) =>
                    setProfileForm({
                      ...profileForm,
                      contactPhone: event.target.value,
                    })
                  }
                  className={inputClassName}
                />
              </Field>
              <Field label="Email boutique">
                <input
                  type="email"
                  value={profileForm.contactEmail}
                  onChange={(event) =>
                    setProfileForm({
                      ...profileForm,
                      contactEmail: event.target.value,
                    })
                  }
                  className={inputClassName}
                />
              </Field>
              <Field label="Titulaire paiement">
                <input
                  value={profileForm.payoutDetails.accountHolder || ""}
                  onChange={(event) =>
                    setProfileForm({
                      ...profileForm,
                      payoutDetails: {
                        ...profileForm.payoutDetails,
                        accountHolder: event.target.value,
                      },
                    })
                  }
                  className={inputClassName}
                />
              </Field>
              <Field label="Banque">
                <input
                  value={profileForm.payoutDetails.bankName || ""}
                  onChange={(event) =>
                    setProfileForm({
                      ...profileForm,
                      payoutDetails: {
                        ...profileForm.payoutDetails,
                        bankName: event.target.value,
                      },
                    })
                  }
                  className={inputClassName}
                />
              </Field>
              <Field label="Numero compte">
                <input
                  value={profileForm.payoutDetails.accountNumber || ""}
                  onChange={(event) =>
                    setProfileForm({
                      ...profileForm,
                      payoutDetails: {
                        ...profileForm.payoutDetails,
                        accountNumber: event.target.value,
                      },
                    })
                  }
                  className={inputClassName}
                />
              </Field>
            </div>

            <Field label="Description boutique">
              <textarea
                rows={4}
                value={profileForm.description}
                onChange={(event) =>
                  setProfileForm({
                    ...profileForm,
                    description: event.target.value,
                  })
                }
                className={textareaClassName}
              />
            </Field>

            <Field label="Note de paiement">
              <textarea
                rows={3}
                value={profileForm.payoutDetails.payoutNote || ""}
                onChange={(event) =>
                  setProfileForm({
                    ...profileForm,
                    payoutDetails: {
                      ...profileForm.payoutDetails,
                      payoutNote: event.target.value,
                    },
                  })
                }
                className={textareaClassName}
              />
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <ToggleCard
                label="Nouvelles commandes"
                checked={profileForm.notificationSettings.newOrders}
                onChange={(checked) =>
                  setProfileForm({
                    ...profileForm,
                    notificationSettings: {
                      ...profileForm.notificationSettings,
                      newOrders: checked,
                    },
                  })
                }
              />
              <ToggleCard
                label="Promotions"
                checked={profileForm.notificationSettings.promotions}
                onChange={(checked) =>
                  setProfileForm({
                    ...profileForm,
                    notificationSettings: {
                      ...profileForm.notificationSettings,
                      promotions: checked,
                    },
                  })
                }
              />
            </div>
          </section>
        </div>
      ) : null}

      {activeTab === "shipping" ? (
        <div className="space-y-6 rounded-3xl border border-neutral-200 bg-white p-6">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">
              Modes de reception de la boutique
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Choisissez si votre boutique accepte la livraison, le retrait en
              magasin, ou les deux. Au moins un mode est obligatoire.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <button
              type="button"
              onClick={() =>
                setShippingForm({
                  ...shippingForm,
                  allowDelivery: !shippingForm.allowDelivery,
                })
              }
              className={cn(
                "rounded-3xl border p-5 text-left transition-colors",
                shippingForm.allowDelivery
                  ? "border-sky-200 bg-sky-50"
                  : "border-neutral-200 bg-white hover:bg-neutral-50",
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-sky-700" />
                    <h3 className="font-semibold text-neutral-900">
                      Livraison
                    </h3>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    Le client choisit la livraison et les frais sont calcules
                    depuis votre point de depart.
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
                    shippingForm.allowDelivery
                      ? "bg-sky-100 text-sky-700"
                      : "bg-neutral-100 text-neutral-500",
                  )}
                >
                  {shippingForm.allowDelivery ? "Activee" : "Desactivee"}
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                setShippingForm({
                  ...shippingForm,
                  allowPickup: !shippingForm.allowPickup,
                })
              }
              className={cn(
                "rounded-3xl border p-5 text-left transition-colors",
                shippingForm.allowPickup
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-neutral-200 bg-white hover:bg-neutral-50",
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Store className="h-5 w-5 text-emerald-700" />
                    <h3 className="font-semibold text-neutral-900">
                      Retrait en magasin
                    </h3>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    Le client recupere sa commande sur place a l&apos;adresse de
                    retrait que vous renseignez.
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
                    shippingForm.allowPickup
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-neutral-100 text-neutral-500",
                  )}
                >
                  {shippingForm.allowPickup ? "Active" : "Desactive"}
                </span>
              </div>
            </button>
          </div>

          {shippingForm.allowDelivery ? (
            <div className="space-y-5 rounded-3xl border border-neutral-200 p-5">
              <div>
                <h3 className="font-medium text-neutral-900">
                  Configuration de la livraison dynamique
                </h3>
                <p className="mt-1 text-sm text-neutral-500">
                  Choisissez votre localisation pivot et vos tarifs. Cette base
                  servira au calcul de la livraison cote client.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  label="Votre localisation pivot (Point de depart)"
                  className="md:col-span-2"
                >
                  <SearchableSelect
                    options={locationOptions}
                    value={selectedLocationValue}
                    onChange={(value) => {
                      const [name, type, dept, lat, lng] = value.split("|");
                      setShippingForm({
                        ...shippingForm,
                        locationName: name || "",
                        locationType: type || "",
                        locationDept: dept || "",
                        latitude: lat ? Number(lat) : undefined,
                        longitude: lng ? Number(lng) : undefined,
                      });
                    }}
                    placeholder="Rechercher une commune..."
                  />
                </Field>

                <Field label="Frais de base de deplacement (HTG)">
                  <input
                    type="number"
                    value={shippingForm.basePrice}
                    onChange={(event) =>
                      setShippingForm({
                        ...shippingForm,
                        basePrice: event.target.value,
                      })
                    }
                    className={inputClassName}
                  />
                </Field>
                <Field label="Prix par kilometre supplementaire (HTG)">
                  <input
                    type="number"
                    value={shippingForm.pricePerKm}
                    onChange={(event) =>
                      setShippingForm({
                        ...shippingForm,
                        pricePerKm: event.target.value,
                      })
                    }
                    className={inputClassName}
                  />
                </Field>
              </div>

              <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-4 text-sm text-neutral-600">
                Assurez-vous que votre point de depart soit exact. Il sera
                utilise pour calculer automatiquement la distance et les frais
                client.
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-neutral-300 bg-neutral-50 p-5 text-sm text-neutral-600">
              La livraison est desactivee. Les clients ne verront pas
              l&apos;option livraison tant que vous ne l&apos;activez pas ici.
            </div>
          )}

          <div className="space-y-4 rounded-3xl border border-neutral-200 p-5">
            <div>
              <h3 className="font-medium text-neutral-900">
                Adresse de retrait
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                Completez cette section si vous voulez autoriser le retrait en
                magasin.
              </p>
            </div>

            {shippingForm.allowPickup ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Adresse de retrait" className="md:col-span-2">
                  <textarea
                    rows={3}
                    value={shippingForm.pickupAddress}
                    onChange={(event) =>
                      setShippingForm({
                        ...shippingForm,
                        pickupAddress: event.target.value,
                      })
                    }
                    className={textareaClassName}
                  />
                </Field>
                <Field label="Ville">
                  <input
                    value={shippingForm.pickupCity}
                    onChange={(event) =>
                      setShippingForm({
                        ...shippingForm,
                        pickupCity: event.target.value,
                      })
                    }
                    className={inputClassName}
                  />
                </Field>
                <Field label="Pays">
                  <input
                    value={shippingForm.pickupCountry}
                    onChange={(event) =>
                      setShippingForm({
                        ...shippingForm,
                        pickupCountry: event.target.value,
                      })
                    }
                    className={inputClassName}
                  />
                </Field>
                <Field label="Telephone retrait">
                  <input
                    value={shippingForm.pickupPhone}
                    onChange={(event) =>
                      setShippingForm({
                        ...shippingForm,
                        pickupPhone: event.target.value,
                      })
                    }
                    className={inputClassName}
                  />
                </Field>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-4 text-sm text-neutral-600">
                Le retrait en magasin est desactive. Activez-le ci-dessus pour
                renseigner le point de retrait.
              </div>
            )}
          </div>
        </div>
      ) : null}

      {activeTab === "payments" ? (
        <div className="space-y-6 rounded-3xl border border-neutral-200 bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">
                Modes de paiement de la boutique
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Configurez les moyens de paiement propres à cette boutique.
                Seuls MonCash manuel, NatCash manuel et Paiement au magasin sont
                activables aujourd&apos;hui.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("shipping")}
              className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              Aller a Livraison
            </button>
          </div>

          <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-800">
            Le paiement au magasin est reserve au retrait en boutique. Si vous
            activez ce mode, assurez-vous que le retrait soit deja disponible
            dans l&apos;onglet Livraison.
          </div>
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <input
              type="checkbox"
              checked={paymentForm.confirmCorrect}
              onChange={(event) =>
                setPaymentForm((current) =>
                  current
                    ? {
                        ...current,
                        confirmCorrect: event.target.checked,
                      }
                    : current,
                )
              }
              className="mt-1 h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
            />
            <span className="text-sm text-neutral-700">
              Oui, je confirme que toutes ces informations sont correctes.
            </span>
          </label>
          <div className="grid gap-4">
            {SELLER_PAYMENT_METHODS.map((definition) => {
              const draft = paymentForm.methods[definition.code];
              const isPickupMethod = definition.code === "store_pickup";
              const canUsePickupMode = Boolean(
                currentAccount.seller?.shippingSettings?.allowPickup &&
                currentAccount.seller?.pickupAddress,
              );
              const isRestricted = isPickupMethod && !canUsePickupMode;

              return (
                <article
                  key={definition.code}
                  className={cn(
                    "rounded-3xl border p-5 transition",
                    draft.isActive
                      ? "border-neutral-900 bg-neutral-50"
                      : "border-neutral-200 bg-white",
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-neutral-900">
                          {definition.label}
                        </h3>
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                            definition.operational
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700",
                          )}
                        >
                          {definition.operational ? "Operationnel" : "Bientot"}
                        </span>
                        <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-600">
                          {definition.fulfillmentMode === "pickup"
                            ? "Retrait"
                            : definition.fulfillmentMode === "delivery"
                              ? "Livraison"
                              : "Tous"}
                        </span>
                      </div>
                      <p className="mt-2 max-w-3xl text-sm text-neutral-500">
                        {definition.description}
                      </p>
                      {isRestricted ? (
                        <p className="mt-3 text-sm font-medium text-amber-700">
                          Le retrait en boutique doit etre active dans
                          l&apos;onglet Livraison avant d&apos;activer ce mode.
                        </p>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (!definition.operational) {
                          setError(
                            `${definition.label} n'est pas encore operationnel.`,
                          );
                          return;
                        }

                        if (isRestricted) {
                          setError(
                            "Activez d'abord le retrait en magasin dans la section Livraison avant d'activer ce mode.",
                          );
                          setActiveTab("shipping");
                          return;
                        }

                        updatePaymentMethodDraft(definition.code, {
                          isActive: !draft.isActive,
                        });
                      }}
                      className={cn(
                        "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                        draft.isActive
                          ? "bg-neutral-900 text-white"
                          : definition.operational
                            ? "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                            : "cursor-not-allowed bg-amber-50 text-amber-700",
                      )}
                    >
                      {draft.isActive
                        ? "Actif"
                        : definition.operational
                          ? "Activer"
                          : "Non operationnel"}
                    </button>
                  </div>

                  {definition.requiresManualEntry ? (
                    <div className="mt-5 grid gap-4 md:grid-cols-3">
                      <Field label="Prenom du titulaire">
                        <input
                          value={draft.merchantFirstName}
                          onChange={(event) =>
                            updatePaymentMethodDraft(definition.code, {
                              merchantFirstName: event.target.value,
                            })
                          }
                          className={inputClassName}
                          placeholder="Jean"
                        />
                      </Field>
                      <Field label="Nom du titulaire">
                        <input
                          value={draft.merchantLastName}
                          onChange={(event) =>
                            updatePaymentMethodDraft(definition.code, {
                              merchantLastName: event.target.value,
                            })
                          }
                          className={inputClassName}
                          placeholder="Pierre"
                        />
                      </Field>
                      <Field label="Code agent (6 chiffres)">
                        <input
                          value={draft.merchantAgentCode}
                          onChange={(event) =>
                            updatePaymentMethodDraft(definition.code, {
                              merchantAgentCode: event.target.value
                                .replace(/\D/g, "")
                                .slice(0, 6),
                            })
                          }
                          inputMode="numeric"
                          maxLength={6}
                          className={inputClassName}
                          placeholder="123456"
                        />
                      </Field>
                    </div>
                  ) : null}

                  {definition.requiresManualEntry ? (
                    <div className="mt-4 rounded-2xl border border-dashed border-neutral-300 bg-white p-4 text-sm text-neutral-600">
                      <p className="font-medium text-neutral-900">
                        Ces informations seront affichees au client lors du
                        checkout.
                      </p>
                      <p className="mt-1">
                        Le client verra les instructions exactes de paiement, le
                        nom du titulaire et le code agent avant de cliquer sur
                        Commander.
                      </p>
                    </div>
                  ) : null}

                  {isPickupMethod ? (
                    <div className="mt-4 rounded-2xl border border-dashed border-neutral-300 bg-white p-4 text-sm text-neutral-600">
                      <p className="font-medium text-neutral-900">
                        Paiement au magasin
                      </p>
                      <p className="mt-1">
                        Aucun numero de transaction n&apos;est requis. Ce mode
                        est autorise uniquement quand le client choisit le
                        retrait en boutique.
                      </p>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>
      ) : null}

      {activeTab === "kyc" ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_1.15fr]">
          <section className="space-y-5 rounded-3xl border border-neutral-200 bg-white p-6">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">
                Etat du dossier KYC
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Suivez vos documents et ajoutez rapidement les pieces
                manquantes.
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <div className="text-sm text-neutral-500">
                Derniere soumission
              </div>
              <div className="mt-1 font-medium text-neutral-900">
                {formatDocumentDate(
                  application?.submittedAt || account.seller.kycSubmittedAt,
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <div className="text-sm text-neutral-500">Note admin</div>
              <div className="mt-1 text-sm text-neutral-700">
                {account.seller.kycReviewNotes || "Aucune note pour le moment."}
              </div>
            </div>

            <div className="space-y-3">
              {(application?.kycDocuments || []).length > 0 ? (
                application?.kycDocuments?.map((document) => (
                  <div
                    key={document.id}
                    className="flex items-center justify-between rounded-2xl border border-neutral-200 p-4"
                  >
                    <div>
                      <div className="font-medium text-neutral-900">
                        {document.fileName || document.documentType}
                      </div>
                      <div className="mt-1 text-xs text-neutral-500">
                        {document.documentType} ·{" "}
                        {formatDocumentDate(document.createdAt)}
                      </div>
                    </div>
                    <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
                      {document.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-neutral-300 p-4 text-sm text-neutral-500">
                  Aucun document KYC envoye pour le moment.
                </div>
              )}
            </div>
          </section>

          <section className="space-y-4 rounded-3xl border border-neutral-200 bg-white p-6">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">
                Ajouter des documents
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Chaque envoi sera rattache a votre dossier vendeur actuel.
              </p>
            </div>

            {requiredDocuments.map((document) => (
              <label
                key={document.type}
                className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-neutral-200 p-4 hover:border-neutral-300 hover:bg-neutral-50"
              >
                <div>
                  <div className="font-medium text-neutral-900">
                    {document.label}
                  </div>
                  <div className="mt-1 text-sm text-neutral-500">
                    {document.description}
                  </div>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-3 py-2 text-xs font-medium text-white">
                  <Upload className="h-3.5 w-3.5" />
                  Envoyer
                </span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(event) =>
                    handleKycUpload(document.type, event.target.files?.[0])
                  }
                />
              </label>
            ))}
          </section>
        </div>
      ) : null}
    </SellerWorkspaceShell>
  );
}

const inputClassName =
  "w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200";

const textareaClassName =
  "w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200";

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-medium text-neutral-700">
        {label}
      </label>
      {children}
    </div>
  );
}

function StatusCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className={cn("rounded-3xl border p-5", tone)}>
      <div className="flex items-center gap-2 text-sm font-medium">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-lg font-semibold capitalize">{value}</div>
    </div>
  );
}

function ToggleCard({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors",
        checked
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
      )}
    >
      <span className="text-sm font-medium">{label}</span>
      {checked ? (
        <CheckCircle2 className="h-4 w-4" />
      ) : (
        <AlertCircle className="h-4 w-4" />
      )}
    </button>
  );
}
