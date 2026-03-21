"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  User,
  ShoppingBag,
  Heart,
  MapPin,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  Home,
} from "lucide-react";
import { useUser } from "@/store";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Address } from "@/data/types";
import { AddressForm } from "@/components/checkout/AddressForm";
import {
  HAITI_DEPARTMENTS,
  getArrondissementsByDepartment,
  getCommunesByArrondissement,
  getSectionsByCommune,
} from "@/data/haitiCities";

const menuItems = [
  { href: "/profil", label: "Mes Commandes", icon: ShoppingBag },
  { href: "/wishlist", label: "Liste de Souhaits", icon: Heart },
  { href: "/profil/adresses", label: "Adresses", icon: MapPin, active: true },
  { href: "/profil", label: "Profil", icon: User },
  { href: "/profil/parametres", label: "Paramètres", icon: Settings },
];

export default function AddressesPage() {
  const {
    user,
    addresses,
    addAddress,
    removeAddress,
    updateAddress,
    setAddresses,
  } = useUser();
  const {
    fetchAddresses,
    addAddressInDb,
    updateAddressInDb,
    deleteAddressFromDb,
    signOut,
    loading: authLoading,
  } = useAuth();
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch addresses on load
  useEffect(() => {
    const loadAddresses = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const data = await fetchAddresses();
          setAddresses(data);
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadAddresses();
  }, [user, fetchAddresses]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push("/auth/login?redirect=/profil/adresses");
    }
  }, [user, router]);

  if (!user) return null;

  const handleSubmit = async (data: Address) => {
    try {
      console.log("Submitting address:", data);

      if (editingId) {
        console.log("Updating address with ID:", editingId);
        await updateAddressInDb(editingId, data);
        updateAddress(editingId, data);
        console.log("Address updated successfully");
      } else {
        console.log("Adding new address");
        const result = await addAddressInDb(data);
        addAddress({ ...data, id: result.id });
        console.log("Address added successfully with ID:", result.id);
      }

      setIsAdding(false);
      setEditingId(null);

      // Rafraîchir la liste des adresses
      const updatedAddresses = await fetchAddresses();
      setAddresses(updatedAddresses);
    } catch (err) {
      console.error("Failed to save address:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";

      // Afficher un message d'erreur plus détaillé
      if (errorMessage.includes("Not authenticated")) {
        alert("Erreur: Vous n'êtes pas connecté. Veuillez vous reconnecter.");
      } else if (errorMessage.includes("duplicate key")) {
        alert("Erreur: Cette adresse existe déjà.");
      } else if (errorMessage.includes("null value")) {
        alert("Erreur: Certains champs obligatoires sont manquants.");
      } else if (errorMessage.includes("base de données")) {
        alert(`Erreur de base de données: ${errorMessage}`);
      } else {
        alert(`Erreur lors de l'enregistrement de l'adresse: ${errorMessage}`);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette adresse ?")) return;
    try {
      await deleteAddressFromDb(id);
      removeAddress(id);
    } catch (err) {
      console.error("Failed to delete address:", err);
      alert("Erreur lors de la suppression");
    }
  };

  const startEdit = (address: Address) => {
    setEditingId(address.id || null);
    setIsAdding(true);
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center">
                  <User className="w-8 h-8 text-neutral-400" />
                </div>
                <div>
                  <h2 className="font-medium text-neutral-900">
                    {user.firstName} {user.lastName}
                  </h2>
                  <p className="text-sm text-neutral-500">{user.email}</p>
                </div>
              </div>

              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.href + item.label}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 text-sm transition-colors",
                      item.active
                        ? "bg-neutral-900 text-white"
                        : "text-neutral-600 hover:bg-neutral-50",
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={() => signOut()}
                  disabled={authLoading}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 w-full transition-colors mt-4 disabled:opacity-50"
                >
                  <LogOut className="w-5 h-5" />
                  {authLoading ? "Déconnexion..." : "Déconnexion"}
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-light text-neutral-900">
                Mes Adresses
              </h1>
              <Button onClick={() => setIsAdding(!isAdding)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                {isAdding ? "Annuler" : "Ajouter une adresse"}
              </Button>
            </div>

            {/* Add/Edit Form */}
            {isAdding && (
              <AddressForm
                initialData={
                  editingId ? addresses.find((a) => a.id === editingId) : {}
                }
                onSubmit={handleSubmit}
                onCancel={() => {
                  setIsAdding(false);
                  setEditingId(null);
                }}
                isSubmitting={authLoading}
                title={editingId ? "Modifier l'adresse" : "Nouvelle adresse"}
              />
            )}

            {/* Addresses List */}
            <div className="space-y-4">
              {addresses.length === 0 ? (
                <div className="text-center py-12 bg-neutral-50">
                  <Home className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                  <p className="text-neutral-500">Aucune adresse enregistrée</p>
                </div>
              ) : (
                addresses.map((address) => (
                  <motion.div
                    key={address.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white p-6 border border-neutral-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-neutral-400 mt-1" />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-neutral-900">
                              {address.label}
                            </span>
                            {address.isDefault && (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs">
                                Par défaut
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-neutral-600">
                            {address.firstName} {address.lastName}
                          </p>
                          <p className="text-sm text-neutral-600">
                            {address.address}
                          </p>
                          <p className="text-sm text-neutral-600">
                            {address.postalCode} {address.city}
                          </p>
                          {(address.department ||
                            address.commune ||
                            address.arrondissement ||
                            address.communalSection) && (
                            <p className="text-sm text-neutral-600">
                              {[
                                address.communalSection,
                                address.commune,
                                address.arrondissement,
                                address.department,
                              ]
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                          )}
                          <p className="text-sm text-neutral-600">
                            {address.country}
                          </p>
                          {address.phone && (
                            <p className="text-sm text-neutral-500 mt-1">
                              {address.phone}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(address)}
                          className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => address.id && handleDelete(address.id)}
                          disabled={!address.id}
                          className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
