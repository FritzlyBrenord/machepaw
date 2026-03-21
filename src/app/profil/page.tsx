"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  ShoppingBag,
  Heart,
  MapPin,
  Settings,
  LogOut,
  Package,
  Truck,
  CheckCircle,
  Clock,
  ChevronRight,
  Camera,
  X,
} from "lucide-react";
import { useUser } from "@/store";
import { useAuth } from "@/hooks/useAuth";
import { useUserOrdersQuery } from "@/hooks/useOrders";
import { useStorefront } from "@/components/StorefrontProvider";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "orders", label: "Mes Commandes", icon: ShoppingBag },
  { id: "wishlist", label: "Liste de Souhaits", icon: Heart },
  { id: "addresses", label: "Adresses", icon: MapPin },
  { id: "profile", label: "Profil", icon: User },
  { id: "settings", label: "Paramètres", icon: Settings },
];

const orderStatusIcons = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: LogOut,
  refunded: LogOut,
};

const orderStatusLabels = {
  pending: "En attente",
  confirmed: "Confirmée",
  processing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
  refunded: "Remboursée",
};

const orderStatusColors = {
  pending: "text-amber-500 bg-amber-50",
  confirmed: "text-blue-500 bg-blue-50",
  processing: "text-purple-500 bg-purple-50",
  shipped: "text-indigo-500 bg-indigo-50",
  delivered: "text-green-500 bg-green-50",
  cancelled: "text-red-500 bg-red-50",
  refunded: "text-gray-500 bg-gray-50",
};

export default function ProfilePage() {
  const { user, addresses } = useUser();
  const { updateProfile, uploadAvatar, signOut, loading: authLoading } = useAuth();
  const { formatPrice } = useStorefront();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("orders");
  const { data: userOrders = [], isLoading: ordersLoading } = useUserOrdersQuery(user?.id);
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: addresses[0]?.phone || "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || addresses[0]?.phone || "",
      });
      setAvatar(user.avatar || "");
    }
  }, [user, addresses]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push("/auth/login?redirect=/profil");
    }
  }, [user, router]);

  if (!user) return null;

  if (!user) return null;

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsSaving(true);
      setSaveError(null);
      try {
        const url = await uploadAvatar(file);
        if (url) {
          setAvatar(url);
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
        }
      } catch (err: any) {
        setSaveError(err.message || "Erreur lors de l'upload");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await updateProfile({
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || "Erreur de mise à jour");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setIsSaving(true);
    try {
      await updateProfile({ avatar_url: "" });
      setAvatar("");
    } catch (err: any) {
      setSaveError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen py-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              {/* User Info */}
              <div className="flex items-center gap-4 mb-8">
                <div className="relative">
                  <div
                    className="w-16 h-16 rounded-full overflow-hidden bg-neutral-100 cursor-pointer group"
                    onClick={handleAvatarClick}
                  >
                    {avatar ? (
                      <Image
                        src={avatar}
                        alt={user.firstName}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <User className="w-8 h-8 m-4 text-neutral-400" />
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  {avatar && (
                    <button
                      onClick={handleRemoveAvatar}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                <div>
                  <h2 className="font-medium text-neutral-900">
                    {user.firstName} {user.lastName}
                  </h2>
                  <p className="text-sm text-neutral-500">{user.email}</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Cliquez sur la photo pour la modifier
                  </p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  let label = tab.label;
                  if (tab.id === "orders") {
                    label = `Mes Commandes (${userOrders.length})`;
                  }
                  // Wishlist and Settings link to their own pages
                  if (tab.id === "wishlist") {
                    return (
                      <Link
                        key={tab.id}
                        href="/wishlist"
                        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors text-neutral-600 hover:bg-neutral-50"
                      >
                        <tab.icon className="w-5 h-5" />
                        <span>{label}</span>
                      </Link>
                    );
                  }
                  if (tab.id === "settings") {
                    return (
                      <Link
                        key={tab.id}
                        href="/profil/parametres"
                        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors text-neutral-600 hover:bg-neutral-50"
                      >
                        <tab.icon className="w-5 h-5" />
                        <span>{label}</span>
                      </Link>
                    );
                  }
                  // Addresses links to its own page
                  if (tab.id === "addresses") {
                    return (
                      <Link
                        key={tab.id}
                        href="/profil/adresses"
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                          activeTab === tab.id
                            ? "bg-neutral-100 text-neutral-900"
                            : "text-neutral-600 hover:bg-neutral-50",
                        )}
                      >
                        <tab.icon className="w-5 h-5" />
                        <span>{label}</span>
                      </Link>
                    );
                  }
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                        activeTab === tab.id
                          ? "bg-neutral-100 text-neutral-900"
                          : "text-neutral-600 hover:bg-neutral-50",
                      )}
                    >
                      <tab.icon className="w-5 h-5" />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Logout */}
              <button 
                onClick={() => signOut()}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors mt-8 disabled:opacity-50"
                disabled={authLoading}
              >
                <LogOut className="w-5 h-5" />
                <span>{authLoading ? "Déconnexion..." : "Déconnexion"}</span>
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {activeTab === "orders" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h1 className="text-2xl font-light text-neutral-900 mb-6">
                  Mes Commandes ({userOrders.length})
                </h1>

                {userOrders.length === 0 ? (
                  <div className="text-center py-12 bg-neutral-50">
                    <Package className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                    <p className="text-neutral-500 mb-4">
                      Aucune commande pour le moment
                    </p>
                    <Link href="/collection">
                      <Button>Commencer mes achats</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {userOrders.map((order) => {
                      const status = order.status as keyof typeof orderStatusIcons;
                      const StatusIcon = orderStatusIcons[status] || Package;
                      return (
                        <div
                          key={order.id}
                          className="border border-neutral-200 overflow-hidden"
                        >
                          {/* Order Header */}
                          <div className="flex items-center justify-between p-4 bg-neutral-50 border-b border-neutral-200">
                            <div className="flex items-center gap-4">
                              <span className="font-medium">{order.id}</span>
                              <span className="text-neutral-500">
                                {formatDate(order.createdAt)}
                              </span>
                            </div>
                            <div
                              className={cn(
                                "flex items-center gap-2 px-3 py-1",
                                orderStatusColors[status as keyof typeof orderStatusColors],
                              )}
                            >
                              <StatusIcon className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                {orderStatusLabels[status as keyof typeof orderStatusLabels]}
                              </span>
                            </div>
                          </div>

                          {/* Order Items */}
                          <div className="p-4">
                            {order.items.map((item: any) => (
                              <div
                                key={item.product.id}
                                className="flex items-center gap-4 py-3 border-b border-neutral-100 last:border-0"
                              >
                                <div className="relative w-16 h-16 bg-neutral-100 shrink-0">
                                  <Image
                                    src={item.product.images[0]}
                                    alt={item.product.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-neutral-900">
                                    {item.product.name}
                                  </p>
                                  <p className="text-sm text-neutral-500">
                                    Qté: {item.quantity}
                                  </p>
                                </div>
                                <p className="font-medium">
                                  {formatPrice(item.price * item.quantity)}
                                </p>
                              </div>
                            ))}
                          </div>

                          {/* Order Footer */}
                          <div className="flex items-center justify-between p-4 bg-neutral-50 border-t border-neutral-200">
                            <div>
                              <p className="text-sm text-neutral-500">
                                Total:{" "}
                                <span className="font-medium text-neutral-900">
                                  {formatPrice(order.total)}
                                </span>
                              </p>
                              {order.trackingNumber && (
                                <p className="text-sm text-neutral-500">
                                  Suivi: {order.trackingNumber}
                                </p>
                              )}
                            </div>
                            <Link
                              href={`/commande/${order.id}`}
                              className="flex items-center gap-1 text-sm text-neutral-900 hover:underline"
                            >
                              Détails
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "addresses" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-light text-neutral-900">
                    Mes Adresses
                  </h1>
                  <Button size="sm">Ajouter une adresse</Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {addresses.map((address: any) => (
                    <div
                      key={address.id}
                      className="border border-neutral-200 p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-neutral-400" />
                          <span className="font-medium">
                            Adresse par défaut
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button className="text-sm text-neutral-500 hover:text-neutral-900">
                            Modifier
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1 text-neutral-600">
                        <p className="font-medium text-neutral-900">
                          {address.firstName} {address.lastName}
                        </p>
                        <p>{address.address}</p>
                        {address.apartment && <p>{address.apartment}</p>}
                        <p>
                          {address.postalCode} {address.city}
                        </p>
                        <p>{address.country}</p>
                        <p className="pt-2">{address.phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

                {saveError && (
                  <div className="p-4 bg-red-50 text-red-600 text-sm border border-red-100 mb-4">
                    {saveError}
                  </div>
                )}
                
                {saveSuccess && (
                  <div className="p-4 bg-green-50 text-green-600 text-sm border border-green-100 mb-4">
                    Profil mis à jour avec succès.
                  </div>
                )}

                <h1 className="text-2xl font-light text-neutral-900 mb-6">
                  Informations personnelles
                </h1>

                <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Prénom
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full px-4 py-3 border border-neutral-200 focus:border-neutral-900 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Nom
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full px-4 py-3 border border-neutral-200 focus:border-neutral-900 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      className="w-full px-4 py-3 border border-neutral-200 bg-neutral-50 text-neutral-400 cursor-not-allowed outline-none"
                      disabled
                    />
                    <p className="text-xs text-neutral-400 mt-1">L'email ne peut pas être modifié.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-200 focus:border-neutral-900 focus:outline-none"
                    />
                  </div>
                  <Button type="submit" isLoading={isSaving}>
                    Sauvegarder les modifications
                  </Button>
                </form>
          </main>
        </div>
      </div>
    </div>
  );
}
