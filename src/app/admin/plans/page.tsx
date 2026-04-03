"use client";

import { type SetStateAction, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CopyPlus,
  Layers3,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useAdminSellerPlansQuery,
  useUpdateSellerPlanMutation,
} from "@/hooks/useSellerPlans";
import { cn, formatPrice } from "@/lib/utils";
import type {
  SellerPlan,
  SellerPlanBillingInterval,
  SellerPlanFeature,
  SellerPlanLimits,
} from "@/data/types";

type EditableFeature = {
  id: string;
  key: string;
  label: string;
  description: string;
  enabled: boolean;
};
type EditableLimitType = "number" | "boolean" | "text";
type EditableLimit = {
  id: string;
  key: string;
  label: string;
  type: EditableLimitType;
  numberValue: string;
  booleanValue: boolean;
  textValue: string;
};
type PlanEditorState = {
  name: string;
  description: string;
  price: string;
  promoPrice: string;
  currencyCode: SellerPlan["currencyCode"];
  billingInterval: SellerPlanBillingInterval;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: string;
  features: EditableFeature[];
  limits: EditableLimit[];
};

const inputClassName =
  "w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900";

function createLocalId(prefix: string, index: number) {
  return `${prefix}-${index}-${Math.random().toString(36).slice(2, 8)}`;
}

function slugifyKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function formatKeyLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function buildPlanEditorState(plan: SellerPlan): PlanEditorState {
  return {
    name: plan.name,
    description: plan.description,
    price: String(plan.price ?? 0),
    promoPrice:
      plan.promoPrice === undefined || plan.promoPrice === null
        ? ""
        : String(plan.promoPrice),
    currencyCode: plan.currencyCode,
    billingInterval: plan.billingInterval,
    isActive: plan.isActive,
    isFeatured: plan.isFeatured,
    sortOrder: String(plan.sortOrder ?? 0),
    features: plan.features.map((feature, index) => ({
      id: createLocalId("feature", index),
      key: feature.key,
      label: feature.label,
      description: feature.description || "",
      enabled: feature.enabled,
    })),
    limits: Object.entries(plan.limits).map(([key, value], index) => ({
      id: createLocalId("limit", index),
      key,
      label: formatKeyLabel(key),
      type:
        typeof value === "boolean"
          ? "boolean"
          : typeof value === "number"
            ? "number"
            : "text",
      numberValue: typeof value === "number" ? String(value) : "",
      booleanValue: typeof value === "boolean" ? value : false,
      textValue:
        typeof value === "string"
          ? value
          : value === null || value === undefined
            ? ""
            : String(value),
    })),
  };
}

function serializeFeatures(features: EditableFeature[]) {
  return features
    .map((feature) => {
      const label = feature.label.trim();
      const key = slugifyKey(feature.key || label);
      if (!label || !key) {
        return null;
      }
      return {
        key,
        label,
        description: feature.description.trim() || undefined,
        enabled: feature.enabled,
      };
    })
    .filter(Boolean) as SellerPlanFeature[];
}

function serializeLimits(limits: EditableLimit[]) {
  return limits.reduce<SellerPlanLimits>((accumulator, limit) => {
    const label = limit.label.trim();
    const key = slugifyKey(limit.key || label);
    if (!label || !key) {
      return accumulator;
    }
    if (limit.type === "boolean") {
      accumulator[key] = limit.booleanValue;
      return accumulator;
    }
    if (limit.type === "number") {
      accumulator[key] = Number(limit.numberValue || 0);
      return accumulator;
    }
    accumulator[key] = limit.textValue.trim();
    return accumulator;
  }, {});
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export default function AdminPlansPage() {
  const { data: plans = [], isLoading } = useAdminSellerPlansQuery();
  const updatePlanMutation = useUpdateSellerPlanMutation();
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [editorDraft, setEditorDraft] = useState<PlanEditorState | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId) || plans[0] || null,
    [plans, selectedPlanId],
  );

  const editorState = useMemo(() => {
    if (!selectedPlan) {
      return null;
    }

    return editorDraft && selectedPlanId === selectedPlan.id
      ? editorDraft
      : buildPlanEditorState(selectedPlan);
  }, [editorDraft, selectedPlan, selectedPlanId]);

  const setEditorState = (value: SetStateAction<PlanEditorState | null>) => {
    if (!selectedPlan) {
      return;
    }

    setEditorDraft((current) => {
      const baseState = current ?? buildPlanEditorState(selectedPlan);
      return typeof value === "function"
        ? (value as (state: PlanEditorState | null) => PlanEditorState | null)(
            baseState,
          )
        : value;
    });
  };

  const savePlan = async () => {
    if (!selectedPlan || !editorState) {
      return;
    }
    setFeedback(null);
    try {
      await updatePlanMutation.mutateAsync({
        planId: selectedPlan.id,
        name: editorState.name.trim(),
        description: editorState.description.trim(),
        price: Number(editorState.price || 0),
        promoPrice: editorState.promoPrice.trim()
          ? Number(editorState.promoPrice)
          : null,
        currencyCode: editorState.currencyCode,
        billingInterval: editorState.billingInterval,
        isActive: editorState.isActive,
        isFeatured: editorState.isFeatured,
        sortOrder: Number(editorState.sortOrder || 0),
        features: serializeFeatures(editorState.features),
        limits: serializeLimits(editorState.limits),
      });
      setFeedback({ type: "success", message: "Le plan a ete mis a jour." });
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error, "Impossible d'enregistrer ce plan."),
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <section className="rounded-[2rem] border border-neutral-200 bg-white p-6 lg:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <Badge variant="outline">Catalogue SaaS</Badge>
              <h1 className="mt-4 text-3xl font-semibold text-neutral-900">
                Plans vendeur
              </h1>
              <p className="mt-3 text-sm leading-7 text-neutral-500">
                Gere les plans sans JSON brut: prix, promo, activation,
                fonctionnalites et limites.
              </p>
            </div>
            <Link
              href="/admin/plans/demandes"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-900 bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
            >
              File d&apos;approbation
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[340px,minmax(0,1fr)]">
          <section className="rounded-[2rem] border border-neutral-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-neutral-900">
                  Plans disponibles
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Selectionne un plan pour l&apos;editer.
                </p>
              </div>
              <Badge variant="outline">{plans.length}</Badge>
            </div>
            <div className="mt-5 space-y-3">
              {plans.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => {
                      setSelectedPlanId(plan.id);
                      setEditorState(buildPlanEditorState(plan));
                      setFeedback(null);
                    }}
                    className={cn(
                      "w-full rounded-3xl border p-5 text-left transition-all",
                      isSelected
                        ? "border-neutral-900 bg-neutral-900 text-white shadow-xl"
                        : "border-neutral-200 bg-neutral-50 hover:border-neutral-300 hover:bg-white",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-semibold">{plan.name}</p>
                          {plan.isFeatured ? (
                            <Badge
                              className={
                                isSelected ? "bg-white text-neutral-900" : ""
                              }
                            >
                              Mis en avant
                            </Badge>
                          ) : null}
                        </div>
                        <p
                          className={cn(
                            "mt-2 text-sm",
                            isSelected
                              ? "text-neutral-300"
                              : "text-neutral-500",
                          )}
                        >
                          {plan.description}
                        </p>
                      </div>
                      <Badge
                        className={
                          isSelected
                            ? "border-white bg-white text-neutral-900"
                            : plan.isActive
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-neutral-200 text-neutral-700"
                        }
                      >
                        {plan.isActive ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                    <div className="mt-5 grid grid-cols-3 gap-3">
                      <div
                        className={cn(
                          "rounded-2xl p-3",
                          isSelected ? "bg-white/10" : "bg-white",
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
                          Prix
                        </p>
                        <p className="mt-1 text-sm font-semibold">
                          {formatPrice(
                            Number(plan.promoPrice ?? plan.price),
                            plan.currencyCode,
                          )}
                        </p>
                      </div>
                      <div
                        className={cn(
                          "rounded-2xl p-3",
                          isSelected ? "bg-white/10" : "bg-white",
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
                          Inscrits
                        </p>
                        <p className="mt-1 text-lg font-semibold">
                          {plan.subscribersCount || 0}
                        </p>
                      </div>
                      <div
                        className={cn(
                          "rounded-2xl p-3",
                          isSelected ? "bg-white/10" : "bg-white",
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
                          Attente
                        </p>
                        <p className="mt-1 text-lg font-semibold">
                          {plan.pendingRequestsCount || 0}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-[2rem] border border-neutral-200 bg-white p-6 lg:p-7">
            {!selectedPlan || !editorState ? (
              <div className="rounded-3xl border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center text-sm text-neutral-500">
                {isLoading
                  ? "Chargement des plans..."
                  : "Selectionne un plan pour commencer."}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-semibold text-neutral-900">
                        Edition du plan {selectedPlan.name}
                      </h2>
                      <Badge
                        variant={editorState.isActive ? "primary" : "outline"}
                      >
                        {editorState.isActive ? "Visible" : "Masque"}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-neutral-500">
                      Une interface admin plus simple pour gerer un vrai
                      catalogue SaaS.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-neutral-50 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                        Features actives
                      </p>
                      <p className="mt-1 text-xl font-semibold text-neutral-900">
                        {
                          editorState.features.filter(
                            (feature) => feature.enabled,
                          ).length
                        }
                      </p>
                    </div>
                    <div className="rounded-2xl bg-neutral-50 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                        Limites
                      </p>
                      <p className="mt-1 text-xl font-semibold text-neutral-900">
                        {editorState.limits.length}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-neutral-50 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                        Prix affiche
                      </p>
                      <p className="mt-1 text-xl font-semibold text-neutral-900">
                        {formatPrice(
                          Number(
                            editorState.promoPrice || editorState.price || 0,
                          ),
                          editorState.currencyCode,
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {feedback ? (
                  <div
                    className={cn(
                      "rounded-3xl border px-5 py-4 text-sm",
                      feedback.type === "success"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                        : "border-rose-200 bg-rose-50 text-rose-900",
                    )}
                  >
                    {feedback.message}
                  </div>
                ) : null}

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr),320px]">
                  <div className="space-y-6">
                    <section className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="h-5 w-5 text-neutral-900" />
                        <div>
                          <h3 className="font-semibold text-neutral-900">
                            Informations du plan
                          </h3>
                          <p className="text-sm text-neutral-500">
                            Nom, description et ordre d&apos;affichage.
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <label className="space-y-2 text-sm text-neutral-700">
                          <span className="font-medium">Nom du plan</span>
                          <input
                            value={editorState.name}
                            onChange={(event) =>
                              setEditorState((current) =>
                                current
                                  ? { ...current, name: event.target.value }
                                  : current,
                              )
                            }
                            className={inputClassName}
                            placeholder="Ex: Pro"
                          />
                        </label>

                        <label className="space-y-2 text-sm text-neutral-700">
                          <span className="font-medium">
                            Ordre d&apos;affichage
                          </span>
                          <input
                            type="number"
                            value={editorState.sortOrder}
                            onChange={(event) =>
                              setEditorState((current) =>
                                current
                                  ? {
                                      ...current,
                                      sortOrder: event.target.value,
                                    }
                                  : current,
                              )
                            }
                            className={inputClassName}
                          />
                        </label>
                      </div>

                      <label className="mt-4 block space-y-2 text-sm text-neutral-700">
                        <span className="font-medium">Description</span>
                        <textarea
                          value={editorState.description}
                          onChange={(event) =>
                            setEditorState((current) =>
                              current
                                ? {
                                    ...current,
                                    description: event.target.value,
                                  }
                                : current,
                            )
                          }
                          rows={4}
                          className={cn(inputClassName, "resize-none")}
                          placeholder="Explique clairement ce que ce plan apporte."
                        />
                      </label>
                    </section>

                    <section className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
                      <div className="flex items-center gap-3">
                        <Sparkles className="h-5 w-5 text-neutral-900" />
                        <div>
                          <h3 className="font-semibold text-neutral-900">
                            Tarification
                          </h3>
                          <p className="text-sm text-neutral-500">
                            Prix principal, promo, devise, facturation et
                            visibilite.
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <label className="space-y-2 text-sm text-neutral-700">
                          <span className="font-medium">Prix normal</span>
                          <input
                            type="number"
                            min="0"
                            value={editorState.price}
                            onChange={(event) =>
                              setEditorState((current) =>
                                current
                                  ? { ...current, price: event.target.value }
                                  : current,
                              )
                            }
                            className={inputClassName}
                          />
                        </label>

                        <label className="space-y-2 text-sm text-neutral-700">
                          <span className="font-medium">Prix promo</span>
                          <input
                            type="number"
                            min="0"
                            value={editorState.promoPrice}
                            onChange={(event) =>
                              setEditorState((current) =>
                                current
                                  ? {
                                      ...current,
                                      promoPrice: event.target.value,
                                    }
                                  : current,
                              )
                            }
                            className={inputClassName}
                            placeholder="Optionnel"
                          />
                        </label>

                        <label className="space-y-2 text-sm text-neutral-700">
                          <span className="font-medium">Devise</span>
                          <select
                            value={editorState.currencyCode}
                            onChange={(event) =>
                              setEditorState((current) =>
                                current
                                  ? {
                                      ...current,
                                      currencyCode: event.target
                                        .value as SellerPlan["currencyCode"],
                                    }
                                  : current,
                              )
                            }
                            className={inputClassName}
                          >
                            <option value="HTG">HTG</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="DOP">DOP</option>
                          </select>
                        </label>

                        <label className="space-y-2 text-sm text-neutral-700">
                          <span className="font-medium">Facturation</span>
                          <select
                            value={editorState.billingInterval}
                            onChange={(event) =>
                              setEditorState((current) =>
                                current
                                  ? {
                                      ...current,
                                      billingInterval: event.target
                                        .value as SellerPlanBillingInterval,
                                    }
                                  : current,
                              )
                            }
                            className={inputClassName}
                          >
                            <option value="monthly">Mensuel</option>
                            <option value="yearly">Annuel</option>
                            <option value="one_time">Unique</option>
                          </select>
                        </label>
                      </div>

                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <button
                          type="button"
                          onClick={() =>
                            setEditorState((current) =>
                              current
                                ? { ...current, isActive: !current.isActive }
                                : current,
                            )
                          }
                          className={cn(
                            "flex items-center justify-between rounded-2xl border px-4 py-4 text-left transition-colors",
                            editorState.isActive
                              ? "border-emerald-300 bg-emerald-50"
                              : "border-neutral-200 bg-white",
                          )}
                        >
                          <div>
                            <p className="font-medium text-neutral-900">
                              Plan disponible
                            </p>
                            <p className="mt-1 text-sm text-neutral-500">
                              Visible et selectable par les vendeurs.
                            </p>
                          </div>
                          <Badge
                            variant={
                              editorState.isActive ? "primary" : "outline"
                            }
                          >
                            {editorState.isActive ? "Actif" : "Inactif"}
                          </Badge>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setEditorState((current) =>
                              current
                                ? {
                                    ...current,
                                    isFeatured: !current.isFeatured,
                                  }
                                : current,
                            )
                          }
                          className={cn(
                            "flex items-center justify-between rounded-2xl border px-4 py-4 text-left transition-colors",
                            editorState.isFeatured
                              ? "border-amber-300 bg-amber-50"
                              : "border-neutral-200 bg-white",
                          )}
                        >
                          <div>
                            <p className="font-medium text-neutral-900">
                              Plan mis en avant
                            </p>
                            <p className="mt-1 text-sm text-neutral-500">
                              Badge recommande sur la page vendeur.
                            </p>
                          </div>
                          <Badge
                            variant={
                              editorState.isFeatured ? "primary" : "outline"
                            }
                          >
                            {editorState.isFeatured ? "Oui" : "Non"}
                          </Badge>
                        </button>
                      </div>
                    </section>

                    <section className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <ShieldCheck className="h-5 w-5 text-neutral-900" />
                          <div>
                            <h3 className="font-semibold text-neutral-900">
                              Fonctionnalites
                            </h3>
                            <p className="text-sm text-neutral-500">
                              Chaque ligne active ou desactive un avantage du
                              plan.
                            </p>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            setEditorState((current) =>
                              current
                                ? {
                                    ...current,
                                    features: [
                                      ...current.features,
                                      {
                                        id: createLocalId(
                                          "feature",
                                          current.features.length,
                                        ),
                                        key: "",
                                        label: "",
                                        description: "",
                                        enabled: true,
                                      },
                                    ],
                                  }
                                : current,
                            )
                          }
                        >
                          <CopyPlus className="mr-2 h-4 w-4" />
                          Ajouter
                        </Button>
                      </div>

                      <div className="mt-5 space-y-4">
                        {editorState.features.map((feature) => (
                          <div
                            key={feature.id}
                            className="rounded-3xl border border-neutral-200 bg-white p-4"
                          >
                            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr),180px]">
                              <div className="grid gap-4 md:grid-cols-2">
                                <label className="space-y-2 text-sm text-neutral-700">
                                  <span className="font-medium">
                                    Nom visible
                                  </span>
                                  <input
                                    value={feature.label}
                                    onChange={(event) =>
                                      setEditorState((current) =>
                                        current
                                          ? {
                                              ...current,
                                              features: current.features.map(
                                                (item) =>
                                                  item.id === feature.id
                                                    ? {
                                                        ...item,
                                                        label:
                                                          event.target.value,
                                                      }
                                                    : item,
                                              ),
                                            }
                                          : current,
                                      )
                                    }
                                    className={inputClassName}
                                    placeholder="Ex: Promotions"
                                  />
                                </label>

                                <label className="space-y-2 text-sm text-neutral-700">
                                  <span className="font-medium">
                                    Code interne
                                  </span>
                                  <input
                                    value={feature.key}
                                    onChange={(event) =>
                                      setEditorState((current) =>
                                        current
                                          ? {
                                              ...current,
                                              features: current.features.map(
                                                (item) =>
                                                  item.id === feature.id
                                                    ? {
                                                        ...item,
                                                        key: event.target.value,
                                                      }
                                                    : item,
                                              ),
                                            }
                                          : current,
                                      )
                                    }
                                    className={inputClassName}
                                    placeholder="Auto si vide"
                                  />
                                </label>
                              </div>

                              <div className="flex items-center gap-3 xl:justify-end">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditorState((current) =>
                                      current
                                        ? {
                                            ...current,
                                            features: current.features.map(
                                              (item) =>
                                                item.id === feature.id
                                                  ? {
                                                      ...item,
                                                      enabled: !item.enabled,
                                                    }
                                                  : item,
                                            ),
                                          }
                                        : current,
                                    )
                                  }
                                  className={cn(
                                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                                    feature.enabled
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-neutral-200 text-neutral-700",
                                  )}
                                >
                                  {feature.enabled ? "Active" : "Desactivee"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditorState((current) =>
                                      current
                                        ? {
                                            ...current,
                                            features: current.features.filter(
                                              (item) => item.id !== feature.id,
                                            ),
                                          }
                                        : current,
                                    )
                                  }
                                  className="rounded-full border border-rose-200 p-2 text-rose-600 transition-colors hover:bg-rose-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            <label className="mt-4 block space-y-2 text-sm text-neutral-700">
                              <span className="font-medium">Description</span>
                              <textarea
                                value={feature.description}
                                onChange={(event) =>
                                  setEditorState((current) =>
                                    current
                                      ? {
                                          ...current,
                                          features: current.features.map(
                                            (item) =>
                                              item.id === feature.id
                                                ? {
                                                    ...item,
                                                    description:
                                                      event.target.value,
                                                  }
                                                : item,
                                          ),
                                        }
                                      : current,
                                  )
                                }
                                rows={3}
                                className={cn(inputClassName, "resize-none")}
                                placeholder="Explique simplement l'avantage."
                              />
                            </label>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Layers3 className="h-5 w-5 text-neutral-900" />
                          <div>
                            <h3 className="font-semibold text-neutral-900">
                              Limites du plan
                            </h3>
                            <p className="text-sm text-neutral-500">
                              Gerer les quotas sans toucher a du JSON.
                            </p>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            setEditorState((current) =>
                              current
                                ? {
                                    ...current,
                                    limits: [
                                      ...current.limits,
                                      {
                                        id: createLocalId(
                                          "limit",
                                          current.limits.length,
                                        ),
                                        key: "",
                                        label: "",
                                        type: "number",
                                        numberValue: "0",
                                        booleanValue: false,
                                        textValue: "",
                                      },
                                    ],
                                  }
                                : current,
                            )
                          }
                        >
                          <CopyPlus className="mr-2 h-4 w-4" />
                          Ajouter
                        </Button>
                      </div>

                      <div className="mt-5 space-y-4">
                        {editorState.limits.map((limit) => (
                          <div
                            key={limit.id}
                            className="rounded-3xl border border-neutral-200 bg-white p-4"
                          >
                            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr),220px,180px]">
                              <label className="space-y-2 text-sm text-neutral-700">
                                <span className="font-medium">Nom visible</span>
                                <input
                                  value={limit.label}
                                  onChange={(event) =>
                                    setEditorState((current) =>
                                      current
                                        ? {
                                            ...current,
                                            limits: current.limits.map(
                                              (item) =>
                                                item.id === limit.id
                                                  ? {
                                                      ...item,
                                                      label: event.target.value,
                                                    }
                                                  : item,
                                            ),
                                          }
                                        : current,
                                    )
                                  }
                                  className={inputClassName}
                                  placeholder="Ex: Nombre de produits"
                                />
                              </label>

                              <label className="space-y-2 text-sm text-neutral-700">
                                <span className="font-medium">
                                  Code interne
                                </span>
                                <input
                                  value={limit.key}
                                  onChange={(event) =>
                                    setEditorState((current) =>
                                      current
                                        ? {
                                            ...current,
                                            limits: current.limits.map(
                                              (item) =>
                                                item.id === limit.id
                                                  ? {
                                                      ...item,
                                                      key: event.target.value,
                                                    }
                                                  : item,
                                            ),
                                          }
                                        : current,
                                    )
                                  }
                                  className={inputClassName}
                                  placeholder="Auto si vide"
                                />
                              </label>

                              <div className="flex items-end gap-3">
                                <label className="flex-1 space-y-2 text-sm text-neutral-700">
                                  <span className="font-medium">Type</span>
                                  <select
                                    value={limit.type}
                                    onChange={(event) =>
                                      setEditorState((current) =>
                                        current
                                          ? {
                                              ...current,
                                              limits: current.limits.map(
                                                (item) =>
                                                  item.id === limit.id
                                                    ? {
                                                        ...item,
                                                        type: event.target
                                                          .value as EditableLimitType,
                                                      }
                                                    : item,
                                              ),
                                            }
                                          : current,
                                      )
                                    }
                                    className={inputClassName}
                                  >
                                    <option value="number">Nombre</option>
                                    <option value="boolean">Oui / Non</option>
                                    <option value="text">Texte</option>
                                  </select>
                                </label>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditorState((current) =>
                                      current
                                        ? {
                                            ...current,
                                            limits: current.limits.filter(
                                              (item) => item.id !== limit.id,
                                            ),
                                          }
                                        : current,
                                    )
                                  }
                                  className="mb-0.5 rounded-full border border-rose-200 p-2 text-rose-600 transition-colors hover:bg-rose-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            <div className="mt-4">
                              {limit.type === "number" ? (
                                <input
                                  type="number"
                                  value={limit.numberValue}
                                  onChange={(event) =>
                                    setEditorState((current) =>
                                      current
                                        ? {
                                            ...current,
                                            limits: current.limits.map(
                                              (item) =>
                                                item.id === limit.id
                                                  ? {
                                                      ...item,
                                                      numberValue:
                                                        event.target.value,
                                                    }
                                                  : item,
                                            ),
                                          }
                                        : current,
                                    )
                                  }
                                  className={inputClassName}
                                />
                              ) : null}

                              {limit.type === "boolean" ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditorState((current) =>
                                      current
                                        ? {
                                            ...current,
                                            limits: current.limits.map(
                                              (item) =>
                                                item.id === limit.id
                                                  ? {
                                                      ...item,
                                                      booleanValue:
                                                        !item.booleanValue,
                                                    }
                                                  : item,
                                            ),
                                          }
                                        : current,
                                    )
                                  }
                                  className={cn(
                                    "rounded-2xl border px-4 py-3 text-sm font-medium transition-colors",
                                    limit.booleanValue
                                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                                      : "border-neutral-200 bg-neutral-50 text-neutral-700",
                                  )}
                                >
                                  {limit.booleanValue
                                    ? "Oui, autorise"
                                    : "Non, bloque"}
                                </button>
                              ) : null}

                              {limit.type === "text" ? (
                                <input
                                  value={limit.textValue}
                                  onChange={(event) =>
                                    setEditorState((current) =>
                                      current
                                        ? {
                                            ...current,
                                            limits: current.limits.map(
                                              (item) =>
                                                item.id === limit.id
                                                  ? {
                                                      ...item,
                                                      textValue:
                                                        event.target.value,
                                                    }
                                                  : item,
                                            ),
                                          }
                                        : current,
                                    )
                                  }
                                  className={inputClassName}
                                  placeholder="Valeur texte"
                                />
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>

                  <aside className="space-y-4">
                    <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
                      <p className="text-sm font-semibold text-neutral-900">
                        Apercu rapide
                      </p>
                      <div className="mt-4 space-y-3">
                        <div className="rounded-2xl bg-white p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                            Prix
                          </p>
                          <p className="mt-1 text-2xl font-semibold text-neutral-900">
                            {formatPrice(
                              Number(
                                editorState.promoPrice ||
                                  editorState.price ||
                                  0,
                              ),
                              editorState.currencyCode,
                            )}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-white p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                            Position
                          </p>
                          <p className="mt-1 text-lg font-semibold text-neutral-900">
                            {editorState.sortOrder || "0"}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-white p-4 text-sm leading-6 text-neutral-500">
                          Le code interne des options peut rester vide. Il sera
                          genere automatiquement a partir du nom visible.
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-neutral-200 bg-white p-5">
                      <p className="text-sm font-semibold text-neutral-900">
                        Organisation admin
                      </p>
                      <div className="mt-4 space-y-3 text-sm leading-6 text-neutral-500">
                        <p>
                          Les plans sont geres ici. Les preuves de paiement et
                          les validations sont traitees dans une file distincte.
                        </p>
                        <Link
                          href="/admin/plans/demandes"
                          className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2.5 font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:text-neutral-900"
                        >
                          Ouvrir les demandes
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </aside>
                </div>

                <div className="flex flex-wrap items-center gap-3 border-t border-neutral-200 pt-6">
                  <Button
                    onClick={() => void savePlan()}
                    isLoading={updatePlanMutation.isPending}
                  >
                    Enregistrer les changements
                  </Button>
                  <Link
                    href="/admin/plans/demandes"
                    className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-5 py-3 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:text-neutral-900"
                  >
                    Voir la file d&apos;approbation
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}
