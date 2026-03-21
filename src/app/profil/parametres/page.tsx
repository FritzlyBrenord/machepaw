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
  Bell,
  Shield,
  Moon,
  Globe,
  Check,
} from "lucide-react";
import { useUser } from "@/store";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/profil", label: "Mes Commandes", icon: ShoppingBag },
  { href: "/wishlist", label: "Liste de Souhaits", icon: Heart },
  { href: "/profil/adresses", label: "Adresses", icon: MapPin },
  { href: "/profil", label: "Profil", icon: User },
  { href: "/profil/parametres", label: "Paramètres", icon: Settings, active: true },
];

const languages = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
];

export default function SettingsPage() {
  const { user } = useUser();
  const [settings, setSettings] = useState({
    language: "fr",
    currency: "EUR",
    darkMode: false,
    newsletter: true,
    orderNotifications: true,
    promotionNotifications: true,
    twoFactorAuth: false,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!user) {
    return null;
  }

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
                        : "text-neutral-600 hover:bg-neutral-50"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                ))}
                <button className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 w-full transition-colors mt-4">
                  <LogOut className="w-5 h-5" />
                  Déconnexion
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <h1 className="text-2xl font-light text-neutral-900 mb-6">Paramètres</h1>

            <div className="space-y-6">
              {/* General Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 border border-neutral-200"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Globe className="w-5 h-5 text-neutral-400" />
                  <h2 className="font-medium text-neutral-900">Général</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Langue
                    </label>
                    <select
                      value={settings.language}
                      onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none"
                    >
                      {languages.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Devise
                    </label>
                    <select
                      value={settings.currency}
                      onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none"
                    >
                      <option value="EUR">EUR (€)</option>
                      <option value="USD">USD ($)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="CHF">CHF (Fr)</option>
                    </select>
                  </div>
                </div>
              </motion.div>

              {/* Notifications */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white p-6 border border-neutral-200"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Bell className="w-5 h-5 text-neutral-400" />
                  <h2 className="font-medium text-neutral-900">Notifications</h2>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="text-sm font-medium text-neutral-900">Newsletter</p>
                      <p className="text-xs text-neutral-500">Recevoir nos offres exclusives</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.newsletter}
                      onChange={(e) => setSettings({ ...settings, newsletter: e.target.checked })}
                      className="w-5 h-5 border-neutral-300 rounded"
                    />
                  </label>
                  <div className="border-t border-neutral-100" />
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="text-sm font-medium text-neutral-900">Commandes</p>
                      <p className="text-xs text-neutral-500">Mises à jour sur vos commandes</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.orderNotifications}
                      onChange={(e) => setSettings({ ...settings, orderNotifications: e.target.checked })}
                      className="w-5 h-5 border-neutral-300 rounded"
                    />
                  </label>
                  <div className="border-t border-neutral-100" />
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="text-sm font-medium text-neutral-900">Promotions</p>
                      <p className="text-xs text-neutral-500">Nouvelles collections et soldes</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.promotionNotifications}
                      onChange={(e) => setSettings({ ...settings, promotionNotifications: e.target.checked })}
                      className="w-5 h-5 border-neutral-300 rounded"
                    />
                  </label>
                </div>
              </motion.div>

              {/* Security */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white p-6 border border-neutral-200"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-5 h-5 text-neutral-400" />
                  <h2 className="font-medium text-neutral-900">Sécurité</h2>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="text-sm font-medium text-neutral-900">Authentification à deux facteurs</p>
                      <p className="text-xs text-neutral-500">Sécurisez votre compte avec 2FA</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.twoFactorAuth}
                      onChange={(e) => setSettings({ ...settings, twoFactorAuth: e.target.checked })}
                      className="w-5 h-5 border-neutral-300 rounded"
                    />
                  </label>
                  <div className="border-t border-neutral-100 pt-4">
                    <Button variant="outline" size="sm">
                      Changer le mot de passe
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button onClick={handleSave} size="lg" className="w-full md:w-auto">
                  {saved ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Enregistré
                    </>
                  ) : (
                    "Enregistrer les modifications"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
