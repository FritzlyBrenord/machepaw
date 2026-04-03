"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save,
  Globe,
  Truck,
  Percent,
  Mail,
  ToggleLeft,
  ToggleRight,
  Plus,
  Trash2,
  Edit2,
  X,
  MapPin,
  Layers,
  ShoppingBag,
  Info,
  AlertCircle,
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";

import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { useAdminSettings } from "@/store/adminStore";
import {
  useAdminSettingsQuery,
  useUpdateAdminSettingsMutation,
  useUpsertShippingRateMutation,
  useDeleteShippingRateMutation,
  useUpsertCurrencyMutation,
} from "@/hooks/useAdminSettings";
import { cn } from "@/lib/utils";
import type {
  CurrencySetting,
  ShippingRate,
  AdminSettings,
} from "@/data/types";
import { COUNTRIES } from "@/data/haitiCities";
import { PRODUCT_ONTOLOGY } from "@/data/productOntology";
import haitiData from "@/data/haitiData.json";

export default function AdminSettingsPage() {
  const {
    data: dbSettings,
    isLoading,
    isError,
    error,
  } = useAdminSettingsQuery();
  const updateSettingsMutation = useUpdateAdminSettingsMutation();
  const upsertShippingMutation = useUpsertShippingRateMutation();
  const deleteShippingMutation = useDeleteShippingRateMutation();
  const upsertCurrencyMutation = useUpsertCurrencyMutation();

  const settingsFromStore = useAdminSettings();

  const [activeTab, setActiveTab] = useState<
    "general" | "currencies" | "shipping"
  >("general");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<AdminSettings | null>(
    settingsFromStore,
  );
  const sortedHaitiData = useMemo(() => {
    const raw = (haitiData as any)?.default || haitiData;
    if (!Array.isArray(raw)) return [];

    // Déduplication par clé unique étendue (Nom|Type|Dept|Lat|Lng)
    const seen = new Set();
    const unique = raw.filter((item: any) => {
      const key = `${item.name}|${item.type || ""}|${item.département || ""}|${item.lat}|${item.lng}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return [...unique].sort((a, b) =>
      (a.name || "").localeCompare(b.name || ""),
    );
  }, []);

  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [editingCurrency, setEditingCurrency] =
    useState<CurrencySetting | null>(null);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [editingShipping, setEditingShipping] = useState<ShippingRate | null>(
    null,
  );

  const displayedShippingRates = isEditing
    ? formData?.shippingRates || []
    : dbSettings?.shippingRates || formData?.shippingRates || [];
  const displayedDefaultShippingBaseRate = isEditing
    ? formData?.defaultShippingBaseRate || 0
    : (dbSettings?.defaultShippingBaseRate ??
      formData?.defaultShippingBaseRate ??
      0);

  // Error UI
  if (isError) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px] p-6">
          <div className="flex flex-col items-center gap-4 text-center p-8 bg-red-50 rounded-2xl border border-red-100 max-w-lg shadow-sm">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-red-900">
              Base de données non configurée
            </h2>
            <p className="text-red-700 leading-relaxed">
              Les tables nécessaires n&apos;ont pas été trouvées ou la connexion
              a échoué. Veuillez exécuter le script SQL{" "}
              <code className="bg-red-100 px-1.5 py-0.5 rounded font-mono text-sm border border-red-200">
                update-shipping-rates-db.sql
              </code>
              dans votre console Supabase pour initialiser les nouvelles
              fonctionnalités.
            </p>
            <div className="flex gap-4 mt-2">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="border-red-200 text-red-700 hover:bg-red-100"
              >
                Réessayer
              </Button>
              <Button
                onClick={() => setIsEditing(false)}
                className="bg-red-600 hover:bg-red-700 text-white border-none"
              >
                Utiliser le mode local
              </Button>
            </div>
            {error && (
              <div className="mt-4 p-3 bg-white/50 rounded-lg text-xs font-mono text-red-400 text-left w-full overflow-hidden border border-red-100">
                {JSON.stringify(error)}
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    );
  }
  // Prevent crash if loading or formData is not yet loaded
  // Uniquement bloqué si on a ni les données DB, ni les données locales initiales
  if (isLoading && !dbSettings && !formData) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
            <p className="text-sm text-neutral-500">
              Chargement des paramètres...
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Fallback pour s'assurer que formData est exploitable
  const currentData = formData || dbSettings || settingsFromStore;
  if (!currentData) {
    return (
      <AdminLayout>
        <div className="p-8 text-center bg-white rounded-xl border border-neutral-200">
          <p className="text-neutral-500 mb-4">
            Initialisation des paramètres...
          </p>
          <Button onClick={() => window.location.reload()}>Réessayer</Button>
        </div>
      </AdminLayout>
    );
  }
  const formState = formData ?? currentData;

  const handleSaveGeneral = async () => {
    if (!formData) return;
    try {
      await updateSettingsMutation.mutateAsync(formData);
      alert("Paramètres généraux enregistrés avec succès !");
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error saving general settings:", error);
      const detail =
        error?.message || error?.error_description || JSON.stringify(error);
      alert(
        `Erreur lors de l'enregistrement des paramètres généraux : ${detail}`,
      );
    }
  };

  const handleSaveShipping = async () => {
    if (!formData || !dbSettings) return;

    // Validation: ensure required fields are not empty
    if (
      !formData.locationName ||
      formData.basePrice === undefined ||
      formData.pricePerKm === undefined
    ) {
      alert(
        "Veuillez remplir tous les champs de livraison (Localisation pivot, Frais de base et Prix par km).",
      );
      return;
    }

    try {
      // Upsert the first shipping rate with the distance fields
      const existingRate = dbSettings.shippingRates?.[0];
      const rateToUpsert: Partial<ShippingRate> = {
        id: existingRate?.id,
        name: existingRate?.name || "Configuration Livraison Par Défaut",
        baseRate: existingRate?.baseRate || 0,
        perKgRate: existingRate?.perKgRate || 0,
        isActive: true,
        basePrice: formData.basePrice,
        pricePerKm: formData.pricePerKm,
        locationName: formData.locationName,
        locationType: formData.locationType,
        locationDept: formData.locationDept,
        latitude: formData.latitude,
        longitude: formData.longitude,
      };

      await upsertShippingMutation.mutateAsync(rateToUpsert as any);

      // Save pickup settings in the global config
      await updateSettingsMutation.mutateAsync({
        allowPickup: formData.allowPickup,
        pickupAddress: formData.pickupAddress,
      } as any);

      alert("Paramètres de livraison enregistrés avec succès !");
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error saving shipping settings:", error);
      alert("Erreur lors de l'enregistrement des paramètres de livraison.");
    }
  };

  const toggleMaintenanceMode = () => {
    const base = formData || dbSettings || settingsFromStore;
    if (!base) return;
    const newSettings = {
      ...base,
      maintenanceMode: !base.maintenanceMode,
    };
    setFormData(newSettings as AdminSettings);
    updateSettingsMutation.mutate(newSettings as AdminSettings);
  };

  const toggleRegistrations = () => {
    const base = formData || dbSettings || settingsFromStore;
    if (!base) return;
    const newSettings = {
      ...base,
      allowNewRegistrations: !base.allowNewRegistrations,
    };
    setFormData(newSettings as AdminSettings);
    updateSettingsMutation.mutate(newSettings as AdminSettings);
  };

  const toggleEmailVerification = () => {
    const base = formData || dbSettings || settingsFromStore;
    if (!base) return;
    const newSettings = {
      ...base,
      requireEmailVerification: !base.requireEmailVerification,
    };
    setFormData(newSettings as AdminSettings);
    updateSettingsMutation.mutate(newSettings as AdminSettings);
  };

  const saveDefaultShippingBaseRate = async () => {
    try {
      await updateSettingsMutation.mutateAsync({
        defaultShippingBaseRate: formData?.defaultShippingBaseRate,
      } as any);
    } catch (error) {
      console.error("Error saving default shipping base rate:", error);
      alert("Erreur lors de l'enregistrement du tarif de base.");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 bg-neutral-50/80 backdrop-blur-md py-4 border-b border-neutral-200 -mx-4 px-4 sm:-mx-8 sm:px-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">
                Paramètres
              </h1>
              <p className="text-sm text-neutral-500">
                Gérez la configuration globale de votre boutique
              </p>
            </div>
            {isEditing &&
            (activeTab === "general" || activeTab === "shipping") ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="bg-white"
                >
                  Annuler
                </Button>
                <Button
                  onClick={
                    activeTab === "general"
                      ? handleSaveGeneral
                      : handleSaveShipping
                  }
                  className="flex items-center gap-2 bg-neutral-900 text-white hover:bg-neutral-800"
                >
                  <Save className="w-4 h-4" />
                  {activeTab === "general"
                    ? "Enregistrer - Général"
                    : "Enregistrer - Livraison"}
                </Button>
              </div>
            ) : !isEditing &&
              (activeTab === "general" || activeTab === "shipping") ? (
              <Button
                onClick={() => {
                  setFormData(dbSettings || formData);
                  setIsEditing(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white border-none shadow-lg shadow-blue-200 flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Démarrer la modification
              </Button>
            ) : null}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-neutral-200">
          {[
            { id: "general", label: "Général", icon: Globe },
            { id: "currencies", label: "Devises", icon: DollarSignIcon },
            { id: "shipping", label: "Livraison", icon: Truck },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-neutral-900 text-neutral-900"
                  : "border-transparent text-neutral-500 hover:text-neutral-700",
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* General Settings */}
        {activeTab === "general" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {!isEditing && (
              <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-center gap-3 text-blue-700 text-sm">
                <Info className="w-4 h-4" />
                <span>
                  Cliquez sur <strong>"Démarrer la modification"</strong> en
                  haut de la page pour changer ces paramètres.
                </span>
              </div>
            )}
            <div className="bg-white p-6 rounded-lg border border-neutral-200">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                Informations du site
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Nom du site
                  </label>
                  <input
                    type="text"
                    value={formData?.siteName ?? dbSettings?.siteName ?? ""}
                    onChange={(e) => {
                      if (formData)
                        setFormData({
                          ...formData,
                          siteName: e.target.value,
                        } as AdminSettings);
                    }}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900 disabled:bg-neutral-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Email de contact
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="email"
                      value={
                        formData?.contactEmail ?? dbSettings?.contactEmail ?? ""
                      }
                      onChange={(e) => {
                        if (formData)
                          setFormData({
                            ...formData,
                            contactEmail: e.target.value,
                          } as AdminSettings);
                      }}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900 disabled:bg-neutral-50"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={
                      formData?.siteDescription ??
                      dbSettings?.siteDescription ??
                      ""
                    }
                    onChange={(e) => {
                      if (formData)
                        setFormData({
                          ...formData,
                          siteDescription: e.target.value,
                        } as AdminSettings);
                    }}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900 disabled:bg-neutral-50"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-neutral-200">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                Options
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                  <div>
                    <p className="font-medium text-neutral-900">
                      Mode maintenance
                    </p>
                    <p className="text-sm text-neutral-500">
                      Mettre le site en maintenance
                    </p>
                  </div>
                  <button
                    onClick={toggleMaintenanceMode}
                    className={cn(
                      "transition-colors",
                      formState.maintenanceMode
                        ? "text-amber-500"
                        : "text-neutral-400",
                    )}
                  >
                    {formState.maintenanceMode ? (
                      <ToggleRight className="w-10 h-6" />
                    ) : (
                      <ToggleLeft className="w-10 h-6" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                  <div>
                    <p className="font-medium text-neutral-900">
                      Nouvelles inscriptions
                    </p>
                    <p className="text-sm text-neutral-500">
                      Autoriser les nouvelles inscriptions
                    </p>
                  </div>
                  <button
                    onClick={toggleRegistrations}
                    className={cn(
                      "transition-colors",
                      formState.allowNewRegistrations
                        ? "text-green-500"
                        : "text-neutral-400",
                    )}
                  >
                    {formState.allowNewRegistrations ? (
                      <ToggleRight className="w-10 h-6" />
                    ) : (
                      <ToggleLeft className="w-10 h-6" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-neutral-900">
                      Vérification email
                    </p>
                    <p className="text-sm text-neutral-500">
                      Exiger la vérification de l&apos;email
                    </p>
                  </div>
                  <button
                    onClick={toggleEmailVerification}
                    className={cn(
                      "transition-colors",
                      formState.requireEmailVerification
                        ? "text-green-500"
                        : "text-neutral-400",
                    )}
                  >
                    {formState.requireEmailVerification ? (
                      <ToggleRight className="w-10 h-6" />
                    ) : (
                      <ToggleLeft className="w-10 h-6" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-neutral-200">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                Taxes & Commissions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Commission par défaut (%)
                  </label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="number"
                      value={
                        Number.isNaN(formState.sellerCommissionRate)
                          ? ""
                          : (formState.sellerCommissionRate ?? "")
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formState,
                          sellerCommissionRate: e.target.value
                            ? parseFloat(e.target.value)
                            : 0,
                        })
                      }
                      disabled={!isEditing}
                      className="w-full pl-10 pr-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900 disabled:bg-neutral-50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Taxe globale (TVA) %
                  </label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="number"
                      value={
                        Number.isNaN(formState.taxRate)
                          ? ""
                          : (formState.taxRate ?? "")
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formState,
                          taxRate: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        })
                      }
                      disabled={!isEditing}
                      className="w-full pl-10 pr-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900 disabled:bg-neutral-50"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Currencies Settings */}
        {activeTab === "currencies" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white p-6 rounded-lg border border-neutral-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-neutral-900">
                  Devises supportées
                </h2>
                <Button size="sm" onClick={() => setShowCurrencyModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">
                        Code
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">
                        Nom
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">
                        Symbole
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">
                        Taux
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">
                        Statut
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-neutral-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {(
                      formData?.currencies ||
                      dbSettings?.currencies ||
                      []
                    )?.map((currency) => (
                      <tr key={currency.code}>
                        <td className="px-4 py-3 font-medium">
                          {currency.code}
                        </td>
                        <td className="px-4 py-3">{currency.name}</td>
                        <td className="px-4 py-3">{currency.symbol}</td>
                        <td className="px-4 py-3">{currency.exchangeRate}</td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "px-2 py-1 text-xs rounded-full",
                              currency.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700",
                            )}
                          >
                            {currency.isActive ? "Actif" : "Inactif"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              setEditingCurrency(currency);
                              setShowCurrencyModal(true);
                            }}
                            className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Shipping Settings */}
        {activeTab === "shipping" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {!isEditing && (
              <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-center gap-3 text-blue-700 text-sm">
                <Info className="w-4 h-4" />
                <span>
                  Cliquez sur <strong>"Démarrer la modification"</strong> en
                  haut de la page pour configurer la livraison dynamique.
                </span>
              </div>
            )}
            <div className="bg-white p-6 rounded-lg border border-neutral-200">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                Livraison dynamique par distance (Vos propres produits)
              </h2>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Votre localisation pivot (Point de départ)
                  </label>
                  <SearchableSelect
                    options={sortedHaitiData.map((loc) => ({
                      // Unicité absolue par Nom + Type + Dept + Coordonnées
                      value: `${loc.name}|${loc.type || ""}|${loc.département || ""}|${loc.lat}|${loc.lng}`,
                      label: loc.name,
                      sublabel: `${loc.département || ""}${loc.type ? ` - ${loc.type}` : ""}${loc.commune ? ` (${loc.commune})` : ""}`,
                    }))}
                    // Retrouver la clé sélectionnée de manière unique
                    value={
                      formData?.locationName
                        ? `${formData.locationName}|${formData.locationType || ""}|${formData.locationDept || ""}|${formData.latitude ?? ""}|${formData.longitude ?? ""}`
                        : dbSettings?.locationName
                          ? `${dbSettings.locationName}|${dbSettings.locationType || ""}|${dbSettings.locationDept || ""}|${dbSettings.latitude ?? ""}|${dbSettings.longitude ?? ""}`
                          : ""
                    }
                    onChange={(compositeVal) => {
                      const [name, type, dept, lat, lng] =
                        compositeVal.split("|");
                      const base = formData || dbSettings || settingsFromStore;
                      if (base) {
                        setFormData({
                          ...base,
                          locationName: name,
                          locationType: type,
                          locationDept: dept,
                          latitude: lat ? parseFloat(lat) : undefined,
                          longitude: lng ? parseFloat(lng) : undefined,
                        } as AdminSettings);
                      }
                    }}
                    disabled={!isEditing}
                    placeholder={
                      sortedHaitiData.length > 0
                        ? "Rechercher une commune..."
                        : "Chargement des villes..."
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Frais de base de déplacement (HTG)
                  </label>
                  <input
                    type="number"
                    value={formData?.basePrice ?? dbSettings?.basePrice ?? ""}
                    onChange={(e) => {
                      const val = e.target.value
                        ? parseFloat(e.target.value)
                        : undefined;
                      const base = formData || dbSettings || settingsFromStore;
                      if (base) {
                        setFormData({
                          ...base,
                          basePrice: val,
                        } as AdminSettings);
                      }
                    }}
                    disabled={!isEditing}
                    placeholder="Ex: 34"
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900 disabled:bg-neutral-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Prix par kilomètre supplémentaire (HTG)
                  </label>
                  <input
                    type="number"
                    value={formData?.pricePerKm ?? dbSettings?.pricePerKm ?? ""}
                    onChange={(e) => {
                      const val = e.target.value
                        ? parseFloat(e.target.value)
                        : undefined;
                      const base = formData || dbSettings || settingsFromStore;
                      if (base) {
                        setFormData({
                          ...base,
                          pricePerKm: val,
                        } as AdminSettings);
                      }
                    }}
                    disabled={!isEditing}
                    placeholder="Ex: 34"
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900 disabled:bg-neutral-50"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-neutral-200 mt-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                Retrait en magasin
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                  <div>
                    <p className="font-medium text-neutral-900">
                      Autoriser le retrait
                    </p>
                    <p className="text-sm text-neutral-500">
                      Permettre aux clients de récupérer leur commande sur place
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (!isEditing) return;
                      const base = formData || dbSettings || settingsFromStore;
                      if (base) {
                        setFormData({
                          ...base,
                          allowPickup: !base.allowPickup,
                        } as AdminSettings);
                      }
                    }}
                    disabled={!isEditing}
                    className={cn(
                      "transition-colors",
                      formData?.allowPickup
                        ? "text-green-500"
                        : "text-neutral-400",
                      !isEditing && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    {formData?.allowPickup ? (
                      <ToggleRight className="w-10 h-6" />
                    ) : (
                      <ToggleLeft className="w-10 h-6" />
                    )}
                  </button>
                </div>

                {formData?.allowPickup && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="pt-2"
                  >
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Adresse complète de retrait
                    </label>
                    <textarea
                      value={formData?.pickupAddress || ""}
                      onChange={(e) => {
                        const base =
                          formData || dbSettings || settingsFromStore;
                        if (base) {
                          setFormData({
                            ...base,
                            pickupAddress: e.target.value,
                          } as AdminSettings);
                        }
                      }}
                      disabled={!isEditing}
                      rows={3}
                      placeholder="Ex: 12 Rue de la Paix, Port-au-Prince..."
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900 disabled:bg-neutral-50 resize-none"
                    />
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
}

// Helper icon component
function DollarSignIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "HTG",
  }).format(price);
}
