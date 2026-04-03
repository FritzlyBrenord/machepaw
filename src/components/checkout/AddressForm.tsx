"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { Address } from "@/data/types";
import { toast } from "sonner";
import {
  HAITI_DEPARTMENTS,
  HAITI_HIERARCHY,
  getArrondissementsByDepartment,
  getCommunesByArrondissement,
  getSectionsByCommune,
} from "@/data/haitiCities";

interface AddressFormProps {
  initialData?: Partial<Address>;
  onSubmit: (data: Address) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  title?: string;
  submitLabel?: string;
}

export function AddressForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  title,
  submitLabel,
}: AddressFormProps) {
  const [formData, setFormData] = useState<Partial<Address>>({
    label: "",
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    department: "",
    arrondissement: "",
    commune: "",
    communalSection: "",
    city: "",
    postalCode: "",
    country: "Haiti",
    phone: "",
    isDefault: false,
    ...initialData,
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const requiredFields = ["firstName", "lastName", "address", "phone"] as const;
    const missingFields = requiredFields.filter((field) => !formData[field]?.trim?.());

    if (missingFields.length > 0) {
      toast.error(`Veuillez remplir les champs obligatoires: ${missingFields.join(", ")}`);
      return;
    }

    if (formData.country === "Haiti") {
      const haitiRequiredFields = ["department", "arrondissement", "commune"] as const;
      const missingHaitiFields = haitiRequiredFields.filter((field) => !formData[field]?.trim?.());

      if (missingHaitiFields.length > 0) {
        toast.error(
          `Veuillez remplir les champs obligatoires pour Haiti: ${missingHaitiFields.join(", ")}`,
        );
        return;
      }
    } else {
      const otherRequiredFields = ["city", "postalCode"] as const;
      const missingOtherFields = otherRequiredFields.filter((field) => !formData[field]?.trim?.());

      if (missingOtherFields.length > 0) {
        toast.error(`Veuillez remplir les champs obligatoires: ${missingOtherFields.join(", ")}`);
        return;
      }
    }

    let latitude = formData.latitude;
    let longitude = formData.longitude;

    if (
      formData.country === "Haiti" &&
      formData.department &&
      formData.arrondissement &&
      formData.commune
    ) {
      const communeData =
        HAITI_HIERARCHY[formData.department]?.arrondissements[formData.arrondissement]?.communes[
          formData.commune
        ];

      if (communeData?.latitude && communeData?.longitude) {
        latitude = communeData.latitude;
        longitude = communeData.longitude;
      }
    }

    onSubmit({
      ...formData,
      label: formData.label?.trim() || "Domicile",
      firstName: formData.firstName?.trim() || "",
      lastName: formData.lastName?.trim() || "",
      address: formData.address?.trim() || "",
      apartment: formData.apartment?.trim() || "",
      department: formData.department?.trim() || "",
      arrondissement: formData.arrondissement?.trim() || "",
      commune: formData.commune?.trim() || "",
      communalSection: formData.communalSection?.trim() || "",
      city:
        formData.country === "Haiti"
          ? formData.commune?.trim() || ""
          : formData.city?.trim() || "",
      postalCode:
        formData.country === "Haiti" ? "" : formData.postalCode?.trim() || "",
      country: formData.country?.trim() || "Haiti",
      phone: formData.phone?.trim() || "",
      isDefault: Boolean(formData.isDefault),
      latitude,
      longitude,
    } as Address);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
    >
      {title ? <h4 className="mb-4 text-lg font-semibold">{title}</h4> : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Libelle</label>
          <input
            type="text"
            value={formData.label || ""}
            onChange={(event) =>
              setFormData((current) => ({ ...current, label: event.target.value }))
            }
            placeholder="Domicile, Bureau..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Telephone *</label>
          <input
            type="tel"
            value={formData.phone || ""}
            onChange={(event) =>
              setFormData((current) => ({ ...current, phone: event.target.value }))
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Prenom *</label>
          <input
            type="text"
            value={formData.firstName || ""}
            onChange={(event) =>
              setFormData((current) => ({ ...current, firstName: event.target.value }))
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Nom *</label>
          <input
            type="text"
            value={formData.lastName || ""}
            onChange={(event) =>
              setFormData((current) => ({ ...current, lastName: event.target.value }))
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">Adresse *</label>
          <input
            type="text"
            value={formData.address || ""}
            onChange={(event) =>
              setFormData((current) => ({ ...current, address: event.target.value }))
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">Complement</label>
          <input
            type="text"
            value={formData.apartment || ""}
            onChange={(event) =>
              setFormData((current) => ({ ...current, apartment: event.target.value }))
            }
            placeholder="Appartement, repere, etc."
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">Pays *</label>
          <select
            value={formData.country || "Haiti"}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                country: event.target.value,
                department: "",
                arrondissement: "",
                commune: "",
                communalSection: "",
                city: "",
                postalCode: "",
                latitude: undefined,
                longitude: undefined,
              }))
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
          >
            <option value="Haiti">Haiti</option>
            <option value="Autre">Autre</option>
          </select>
        </div>

        {formData.country === "Haiti" ? (
          <>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Departement *</label>
              <select
                value={formData.department || ""}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    department: event.target.value,
                    arrondissement: "",
                    commune: "",
                    communalSection: "",
                    city: "",
                    latitude: undefined,
                    longitude: undefined,
                  }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
              >
                <option value="">Selectionner</option>
                {HAITI_DEPARTMENTS.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Arrondissement *</label>
              <select
                disabled={!formData.department}
                value={formData.arrondissement || ""}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    arrondissement: event.target.value,
                    commune: "",
                    communalSection: "",
                    city: "",
                    latitude: undefined,
                    longitude: undefined,
                  }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 disabled:opacity-50"
              >
                <option value="">Selectionner</option>
                {formData.department
                  ? getArrondissementsByDepartment(formData.department).map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))
                  : null}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Commune *</label>
              <select
                disabled={!formData.arrondissement || !formData.department}
                value={formData.commune || ""}
                onChange={(event) => {
                  const commune = event.target.value;
                  const communeData =
                    formData.department && formData.arrondissement
                      ? HAITI_HIERARCHY[formData.department]?.arrondissements[
                          formData.arrondissement
                        ]?.communes[commune]
                      : undefined;

                  setFormData((current) => ({
                    ...current,
                    commune,
                    communalSection: "",
                    city: commune,
                    latitude: communeData?.latitude,
                    longitude: communeData?.longitude,
                  }));
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 disabled:opacity-50"
              >
                <option value="">Selectionner</option>
                {formData.department && formData.arrondissement
                  ? getCommunesByArrondissement(
                      formData.department,
                      formData.arrondissement,
                    ).map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))
                  : null}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Section communale
              </label>
              <select
                disabled={!formData.commune || !formData.arrondissement || !formData.department}
                value={formData.communalSection || ""}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    communalSection: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 disabled:opacity-50"
              >
                <option value="">Selectionner</option>
                {formData.department && formData.arrondissement && formData.commune
                  ? getSectionsByCommune(
                      formData.department,
                      formData.arrondissement,
                      formData.commune,
                    ).map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))
                  : null}
              </select>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Ville *</label>
              <input
                type="text"
                value={formData.city || ""}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, city: event.target.value }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Code postal *</label>
              <input
                type="text"
                value={formData.postalCode || ""}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, postalCode: event.target.value }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
              />
            </div>
          </>
        )}

        <div className="md:col-span-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={Boolean(formData.isDefault)}
              onChange={(event) =>
                setFormData((current) => ({ ...current, isDefault: event.target.checked }))
              }
            />
            Definir comme adresse par defaut
          </label>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement..." : submitLabel || (initialData?.id ? "Enregistrer" : "Ajouter")}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Annuler
        </Button>
      </div>
    </motion.form>
  );
}
