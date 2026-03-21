"use client";

import { useMemo, useState, type ElementType } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Clock,
  Image as ImageIcon,
  Layout,
  LayoutDashboard,
  Loader2,
  Megaphone,
  MousePointerClick,
  Plus,
  Star,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from "lucide-react";
import { SellerWorkspaceShell } from "@/components/SellerWorkspaceShell";
import { Button } from "@/components/ui/Button";
import {
  ACTIVE_ANNOUNCEMENT_LIMITS,
  SELLER_WEEKLY_ANNOUNCEMENT_LIMIT,
  useDeleteSellerAnnouncement,
  useSellerAnnouncements,
  useToggleSellerAnnouncement,
  type Announcement,
} from "@/hooks/useAnnouncements";
import { cn } from "@/lib/utils";

const PLACEMENT_CONFIG = {
  hero: {
    label: "Hero / Slider",
    icon: Layout,
    color: "bg-purple-100 text-purple-700",
  },
  top_bar: {
    label: "Barre de notification",
    icon: Bell,
    color: "bg-blue-100 text-blue-700",
  },
  popup: {
    label: "Popup",
    icon: ImageIcon,
    color: "bg-amber-100 text-amber-700",
  },
  sidebar: {
    label: "Banniere / Autre",
    icon: LayoutDashboard,
    color: "bg-neutral-100 text-neutral-700",
  },
} satisfies Record<Announcement["placement"], { label: string; icon: ElementType; color: string }>;

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
  const PlacementIcon = config.icon;
  const isExpired = announcement.ends_at && new Date(announcement.ends_at) < new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "rounded-xl border bg-white p-5 transition-colors",
        announcement.is_active && !isExpired
          ? "border-neutral-200"
          : "border-neutral-100 opacity-70",
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div
          className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border border-neutral-200"
          style={{ backgroundColor: announcement.background_color || "#111111" }}
        >
          <PlacementIcon
            className="h-6 w-6"
            style={{ color: announcement.text_color || "#FFFFFF" }}
          />
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="truncate font-semibold text-neutral-900">
                {announcement.title}
              </p>
              {announcement.content ? (
                <p className="line-clamp-2 text-sm text-neutral-500">
                  {announcement.content}
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              {isExpired ? (
                <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                  Expiree
                </span>
              ) : null}
              <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", config.color)}>
                {config.label}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {announcement.show_on_every_visit
                ? "Chaque visite"
                : `Apres ${announcement.display_delay_seconds}s`}
            </span>
            <span className="flex items-center gap-1">
              <MousePointerClick className="h-3.5 w-3.5" />
              {announcement.click_count} clics
            </span>
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5" />
              Priorite: {announcement.priority}
            </span>
            {announcement.ends_at ? (
              <span className="flex items-center gap-1 text-amber-600">
                <Clock className="h-3.5 w-3.5" />
                Fin: {new Date(announcement.ends_at).toLocaleDateString("fr-FR")}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          <button
            onClick={onToggle}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors hover:bg-neutral-50"
            title={announcement.is_active ? "Desactiver" : "Activer"}
          >
            {announcement.is_active ? (
              <>
                <ToggleRight className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-600">Active</span>
              </>
            ) : (
              <>
                <ToggleLeft className="h-4 w-4 text-neutral-400" />
                <span className="text-neutral-500">Inactive</span>
              </>
            )}
          </button>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="rounded-lg border p-2 transition-colors hover:bg-red-50"
            title="Supprimer"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
            ) : (
              <Trash2 className="h-4 w-4 text-red-600" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function SellerAnnouncementsPage() {
  const { data: announcements = [], isLoading } = useSellerAnnouncements();
  const deleteAnnouncement = useDeleteSellerAnnouncement();
  const toggleAnnouncement = useToggleSellerAnnouncement();

  const [activeTab, setActiveTab] = useState<"all" | Announcement["placement"]>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered =
    activeTab === "all"
      ? announcements
      : announcements.filter((announcement) => announcement.placement === activeTab);

  const now = Date.now();
  const stats = useMemo(() => {
    const createdThisWeek = announcements.filter((announcement) => {
      const createdAt = new Date(announcement.created_at).getTime();
      return now - createdAt <= 7 * 24 * 60 * 60 * 1000;
    }).length;

    return {
      total: announcements.length,
      active: announcements.filter((announcement) => announcement.is_active).length,
      createdThisWeek,
      remainingThisWeek: Math.max(
        0,
        SELLER_WEEKLY_ANNOUNCEMENT_LIMIT - createdThisWeek,
      ),
    };
  }, [announcements, now]);

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

  return (
    <SellerWorkspaceShell
      title="Annonces"
      description="Creez vos annonces vendeur avec quota hebdomadaire et limites d'affichage pour proteger l'accueil du site."
      actions={
        <Link href="/vendeur/annonces/nouveau">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle annonce
          </Button>
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-sm text-neutral-500">Annonces actives</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900">{stats.active}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-sm text-neutral-500">Creees cette semaine</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900">{stats.createdThisWeek}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-sm text-neutral-500">Quota restant</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900">{stats.remainingThisWeek}</p>
          <p className="mt-1 text-xs text-neutral-400">
            Limite vendeur: {SELLER_WEEKLY_ANNOUNCEMENT_LIMIT} annonces / 7 jours
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <p className="font-medium">Protection d'affichage</p>
        <p className="mt-1 text-blue-800">
          Le site charge un nombre controle d'annonces par emplacement:
          {" "}Hero {ACTIVE_ANNOUNCEMENT_LIMITS.hero},
          {" "}Top bar {ACTIVE_ANNOUNCEMENT_LIMITS.top_bar},
          {" "}Popup {ACTIVE_ANNOUNCEMENT_LIMITS.popup},
          {" "}Sidebar {ACTIVE_ANNOUNCEMENT_LIMITS.sidebar}.
          {" "}Un seul popup est ensuite ouvert par visite.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto rounded-lg bg-neutral-100 p-1">
        {([
          { key: "all", label: "Toutes" },
          { key: "hero", label: "Hero" },
          { key: "top_bar", label: "Top bar" },
          { key: "popup", label: "Popups" },
          { key: "sidebar", label: "Autres" },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500 hover:text-neutral-700",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center">
          <Megaphone className="mx-auto mb-3 h-10 w-10 text-neutral-300" />
          <p className="text-neutral-500">Aucune annonce pour le moment</p>
          <Link href="/vendeur/annonces/nouveau">
            <Button className="mt-4">Creer une annonce</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                onToggle={() => void handleToggle(announcement)}
                onDelete={() => void handleDelete(announcement.id)}
                isDeleting={deletingId === announcement.id}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </SellerWorkspaceShell>
  );
}
