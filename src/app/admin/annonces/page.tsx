"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Megaphone,
  Plus,
  Layout,
  Bell,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  Clock,
  MousePointerClick,
  Loader2,
  Star,
  LayoutDashboard,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/Button";
import {
  useAnnouncements,
  useDeleteAnnouncement,
  useToggleAnnouncement,
  type Announcement,
} from "@/hooks/useAnnouncements";
import { cn } from "@/lib/utils";

const PLACEMENT_CONFIG = {
  hero: {
    label: "Hero / Slider",
    icon: Layout,
    color: "bg-purple-100 text-purple-700",
    description: "Bannière principale en haut de la page d'accueil",
  },
  top_bar: {
    label: "Barre de notification",
    icon: Bell,
    color: "bg-blue-100 text-blue-700",
    description: "Bande de texte en haut du site",
  },
  popup: {
    label: "Popup",
    icon: ImageIcon,
    color: "bg-amber-100 text-amber-700",
    description: "Fenêtre qui s'ouvre automatiquement",
  },
  sidebar: {
    label: "Sidebar / Autre",
    icon: LayoutDashboard,
    color: "bg-neutral-100 text-neutral-600",
    description: "Zone latérale ou autre emplacement",
  },
};

function AnnouncementCard({
  announcement,
  onToggle,
  onDelete,
  isDeleting,
}: {
  announcement: Announcement;
  onToggle: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const config = PLACEMENT_CONFIG[announcement.placement];
  const PlacmentIcon = config.icon;
  const isExpired = announcement.ends_at && new Date(announcement.ends_at) < new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "bg-white rounded-xl border p-5 transition-colors",
        announcement.is_active && !isExpired
          ? "border-neutral-200"
          : "border-neutral-100 opacity-60"
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Color Preview */}
        <div
          className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center border border-neutral-200"
          style={{ backgroundColor: announcement.background_color || "#000" }}
        >
          <PlacmentIcon
            className="w-6 h-6"
            style={{ color: announcement.text_color || "#FFF" }}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-neutral-900 truncate">{announcement.title}</p>
              {announcement.content && (
                <p className="text-sm text-neutral-500 line-clamp-1">{announcement.content}</p>
              )}
            </div>
            <div className="flex items-center gap-1">
              {isExpired && (
                <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">
                  Expirée
                </span>
              )}
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", config.color)}>
                {config.label}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500">
            {/* Display settings */}
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {announcement.show_on_every_visit
                ? "Chaque visite"
                : `Après ${announcement.display_delay_seconds}s`}
            </span>
            {/* Stats */}
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {announcement.view_count} vues
            </span>
            <span className="flex items-center gap-1">
              <MousePointerClick className="w-3.5 h-3.5" />
              {announcement.click_count} clics
            </span>
            {/* Priority */}
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5" />
              Priorité: {announcement.priority}
            </span>
            {/* Validity */}
            {announcement.ends_at && (
              <span className="flex items-center gap-1 text-amber-600">
                <Clock className="w-3.5 h-3.5" />
                Expire: {new Date(announcement.ends_at).toLocaleDateString("fr-FR")}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Toggle active */}
          <button
            onClick={onToggle}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors hover:bg-neutral-50"
            title={announcement.is_active ? "Désactiver" : "Activer"}
          >
            {announcement.is_active ? (
              <>
                <ToggleRight className="w-4 h-4 text-green-600" />
                <span className="text-green-600 font-medium">Active</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-4 h-4 text-neutral-400" />
                <span className="text-neutral-500">Inactive</span>
              </>
            )}
          </button>
          <Link href={`/admin/annonces/${announcement.id}/edit`}>
            <button className="p-2 rounded-lg border hover:bg-neutral-50 transition-colors" title="Modifier">
              <Edit className="w-4 h-4 text-blue-600" />
            </button>
          </Link>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="p-2 rounded-lg border hover:bg-red-50 transition-colors"
            title="Supprimer"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
            ) : (
              <Trash2 className="w-4 h-4 text-red-600" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// --- Main Page ---
export default function AdminAnnouncesPage() {
  const { data: announcements = [], isLoading } = useAnnouncements();
  const deleteAnnouncement = useDeleteAnnouncement();
  const toggleAnnouncement = useToggleAnnouncement();

  const [activeTab, setActiveTab] = useState<"all" | Announcement["placement"]>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered =
    activeTab === "all"
      ? announcements
      : announcements.filter((a) => a.placement === activeTab);

  const stats = {
    total: announcements.length,
    active: announcements.filter((a) => a.is_active).length,
    hero: announcements.filter((a) => a.placement === "hero").length,
    popup: announcements.filter((a) => a.placement === "popup").length,
    top_bar: announcements.filter((a) => a.placement === "top_bar").length,
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await deleteAnnouncement.mutateAsync(id);
    setDeletingId(null);
  };

  const handleToggle = async (announcement: Announcement) => {
    await toggleAnnouncement.mutateAsync({
      id: announcement.id,
      is_active: !announcement.is_active,
    });
  };

  const tabs = [
    { key: "all", label: "Toutes", count: stats.total },
    { key: "hero", label: "Hero / Slider", count: stats.hero },
    { key: "top_bar", label: "Barre Top", count: stats.top_bar },
    { key: "popup", label: "Popups", count: stats.popup },
  ] as const;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900 flex items-center gap-2">
              <Megaphone className="w-6 h-6 text-blue-500" />
              Annonces & Bannières
            </h1>
            <p className="text-neutral-500 mt-1">
              Gérez les bannières hero, popups et barres de notification
            </p>
          </div>
          <Link href="/admin/annonces/nouveau">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nouvelle annonce
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total", value: stats.total, color: "bg-neutral-100 text-neutral-700" },
            { label: "Actives", value: stats.active, color: "bg-green-100 text-green-700" },
            { label: "Hero Slides", value: stats.hero, color: "bg-purple-100 text-purple-700" },
            { label: "Popups", value: stats.popup, color: "bg-amber-100 text-amber-700" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-neutral-200 p-4">
              <p className="text-sm text-neutral-500">{s.label}</p>
              <p className={cn("text-2xl font-bold mt-1", s.color.split(" ")[1])}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-neutral-100 p-1 rounded-lg overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-2",
                activeTab === tab.key
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              {tab.label}
              <span className={cn(
                "px-1.5 py-0.5 text-xs rounded-full",
                activeTab === tab.key ? "bg-neutral-100 text-neutral-700" : "bg-neutral-200 text-neutral-500"
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Announcements List */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
            <Megaphone className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500">Aucune annonce</p>
            <Link href="/admin/annonces/nouveau">
              <Button className="mt-4">Créer une annonce</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map((announcement) => (
                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                  onToggle={() => handleToggle(announcement)}
                  onDelete={() => handleDelete(announcement.id)}
                  isDeleting={deletingId === announcement.id}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
