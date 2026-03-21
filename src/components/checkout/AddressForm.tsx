"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import type { Address } from "@/data/types";
import {
  HAITI_DEPARTMENTS,
  getArrondissementsByDepartment,
  getCommunesByArrondissement,
  getSectionsByCommune,
  HAITI_HIERARCHY,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation des champs requis
    const requiredFields = ["firstName", "lastName", "address", "phone"];
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      alert(
        `Veuillez remplir les champs obligatoires: ${missingFields.join(", ")}`,
      );
      return;
    }

    // Validation spécifique pour Haïti
    if (formData.country === "Haiti") {
      const haitiRequiredFields = ["department", "arrondissement", "commune"];
      const missingHaitiFields = haitiRequiredFields.filter(
        (field) => !formData[field],
      );

      if (missingHaitiFields.length > 0) {
        alert(
          `Veuillez remplir les champs obligatoires pour Haïti: ${missingHaitiFields.join(
            ", ",
          )}`,
        );
        return;
      }
    } else {
      // Validation pour les autres pays
      const otherRequiredFields = ["city", "postalCode"];
      const missingOtherFields = otherRequiredFields.filter(
        (field) => !formData[field],
      );

      if (missingOtherFields.length > 0) {
        alert(
          `Veuillez remplir les champs obligatoires: ${missingOtherFields.join(
            ", ",
          )}`,
        );
        return;
      }
    }

    // Log des données pour debugging
    console.log("Address form data being submitted:", formData);

    // Auto-récupérer les coordonnées si manquantes et si Haïti
    let lat = formData.latitude;
    let lng = formData.longitude;
    
    if ((!lat || !lng) && formData.country === "Haiti" && formData.department && formData.arrondissement && formData.commune) {
      const communeData = HAITI_HIERARCHY[formData.department]?.arrondissements[formData.arrondissement]?.communes[formData.commune];
      if (communeData && communeData.latitude && communeData.longitude) {
         lat = communeData.latitude;
         lng = communeData.longitude;
         console.log("Auto-recovered coordinates from HAITI_HIERARCHY:", { lat, lng });
      }
    }

    console.log("Form data coordinates:", {
      latitude: lat,
      longitude: lng,
    });

    // S'assurer que tous les champs requis sont présents
    const addressData = {
      ...formData,
      firstName: formData.firstName?.trim() || "",
      lastName: formData.lastName?.trim() || "",
      address: formData.address?.trim() || "",
      phone: formData.phone?.trim() || "",
      city:
        formData.country === "Haiti"
          ? formData.commune || ""
          : formData.city?.trim() || "",
      postalCode:
        formData.country === "Haiti" ? "" : formData.postalCode?.trim() || "",
      country: formData.country?.trim() || "Haiti",
      department: formData.department?.trim() || "",
      arrondissement: formData.arrondissement?.trim() || "",
      commune: formData.commune?.trim() || "",
      communalSection: formData.communalSection?.trim() || "",
      apartment: formData.apartment?.trim() || "",
      label: formData.label?.trim() || "Domicile",
      isDefault: Boolean(formData.isDefault),
      // S'assurer que les coordonnées sont incluses
      latitude: lat,
      longitude: lng,
    } as Address;

    console.log("Final address data with coordinates:", addressData);
    onSubmit(addressData);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="bg-white p-6 border border-neutral-200"
    >
      {title && <h3 className="font-medium text-neutral-900 mb-4">{title}</h3>}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Libellé (ex: Domicile, Bureau)
          </label>
          <input
            type="text"
            placeholder="Domicile, Bureau..."
            value={formData.label}
            onChange={(e) =>
              setFormData({ ...formData, label: e.target.value })
            }
            className="w-full px-3 py-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Téléphone *
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className="w-full px-3 py-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Prénom *
          </label>
          <input
            type="text"
            required
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            className="w-full px-3 py-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Nom *
          </label>
          <input
            type="text"
            required
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            className="w-full px-3 py-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Adresse *
          </label>
          <input
            type="text"
            required
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            className="w-full px-3 py-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Pays *
          </label>
          <select
            required
            value={formData.country}
            onChange={(e) =>
              setFormData({
                ...formData,
                country: e.target.value,
                department: "",
                arrondissement: "",
                commune: "",
                communalSection: "",
              })
            }
            className="w-full px-3 py-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none"
          >
            <option value="Haiti">Haiti</option>
            <option value="Autre">Autre</option>
          </select>
        </div>

        {formData.country === "Haiti" && (
          <>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Département *
              </label>
              <select
                required
                value={formData.department}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({
                    ...formData,
                    department: e.target.value,
                    arrondissement: "",
                    commune: "",
                    communalSection: "",
                    // Réinitialiser les coordonnées
                    latitude: undefined,
                    longitude: undefined,
                  });
                }}
                className="w-full px-3 py-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none"
              >
                <option value="">Sélectionner</option>
                {HAITI_DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Arrondissement *
              </label>
              <select
                required
                disabled={!formData.department}
                value={formData.arrondissement}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    arrondissement: e.target.value,
                    commune: "",
                    communalSection: "",
                  })
                }
                className="w-full px-3 py-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none disabled:opacity-50"
              >
                <option value="">Sélectionner</option>
                {formData.department &&
                  getArrondissementsByDepartment(formData.department).map(
                    (a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ),
                  )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Commune *
              </label>
              <select
                required
                disabled={!formData.arrondissement}
                value={formData.commune}
                onChange={(e) => {
                  const val = e.target.value;
                  console.log("=== COMMUNE SELECTION DEBUG ===");
                  console.log("Selected commune:", val);
                  console.log("Department:", formData.department);
                  console.log("Arrondissement:", formData.arrondissement);

                  // Récupérer les coordonnées depuis HAITI_HIERARCHY
                  let coordinates = {};

                  if (formData.department && formData.arrondissement) {
                    const communeData =
                      HAITI_HIERARCHY[formData.department]?.arrondissements[
                        formData.arrondissement
                      ]?.communes[val];
                    console.log(
                      "Commune data from HAITI_HIERARCHY:",
                      communeData,
                    );

                    // Test direct pour vérifier
                    console.log(
                      "Direct test - Cap-Haïtien data:",
                      HAITI_HIERARCHY["Nord"]?.arrondissements["Cap-Haïtien"]
                        ?.communes["Cap-Haïtien"],
                    );

                    if (
                      communeData &&
                      communeData.latitude &&
                      communeData.longitude
                    ) {
                      coordinates = {
                        latitude: communeData.latitude,
                        longitude: communeData.longitude,
                      };
                      console.log("Found coordinates:", coordinates);
                    } else {
                      console.log("No coordinates found for this commune");
                    }
                  }

                  const newFormData = {
                    ...formData,
                    commune: val,
                    communalSection: "",
                    // Auto-remplir la ville avec la commune pour Haïti
                    city: val,
                    // Ajouter les coordonnées si trouvées
                    ...coordinates,
                  };

                  console.log("New form data:", newFormData);
                  console.log("===================================");

                  setFormData(newFormData);
                }}
                className="w-full px-3 py-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none disabled:opacity-50"
              >
                <option value="">Sélectionner</option>
                {formData.department &&
                  formData.arrondissement &&
                  getCommunesByArrondissement(
                    formData.department,
                    formData.arrondissement,
                  ).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Section Communale *
              </label>
              <select
                required
                disabled={!formData.commune}
                value={formData.communalSection}
                onChange={(e) =>
                  setFormData({ ...formData, communalSection: e.target.value })
                }
                className="w-full px-3 py-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none disabled:opacity-50"
              >
                <option value="">Sélectionner</option>
                {formData.department &&
                  formData.arrondissement &&
                  formData.commune &&
                  getSectionsByCommune(
                    formData.department,
                    formData.arrondissement,
                    formData.commune,
                  ).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
              </select>
            </div>
          </>
        )}

        {formData.country !== "Haiti" && (
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Ville *
            </label>
            <input
              type="text"
              required
              value={formData.city}
              onChange={(e) => {
                const val = e.target.value;
                // Pour les autres pays, pas de recherche automatique pour l'instant
                setFormData({
                  ...formData,
                  city: val,
                });
              }}
              className="w-full px-3 py-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none"
            />
          </div>
        )}

        {formData.country !== "Haiti" && (
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Code postal *
            </label>
            <input
              type="text"
              required
              value={formData.postalCode}
              onChange={(e) =>
                setFormData({ ...formData, postalCode: e.target.value })
              }
              className="w-full px-3 py-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none"
            />
          </div>
        )}

        <div className="md:col-span-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isDefault}
              onChange={(e) =>
                setFormData({ ...formData, isDefault: e.target.checked })
              }
              className="w-4 h-4 border-neutral-300 rounded text-neutral-900 focus:ring-neutral-900"
            />
            <span className="text-sm text-neutral-600">
              Définir comme adresse par défaut
            </span>
          </label>
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <Button type="submit" isLoading={isSubmitting}>
          {submitLabel || (initialData?.id ? "Enregistrer" : "Ajouter")}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </motion.form>
  );
}
