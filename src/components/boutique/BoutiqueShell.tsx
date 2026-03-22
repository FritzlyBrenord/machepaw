"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { BoutiqueNavbar } from "@/components/boutique/BoutiqueNavbar";
import { BoutiqueFooter } from "@/components/boutique/BoutiqueFooter";
import {
  useBoutiqueStore,
  useBoutiqueTheme,
} from "@/components/boutique/BoutiqueStoreProvider";
import { useBoutiqueAnnouncementsQuery } from "@/hooks/useBoutiqueStorefront";
import { resolveBoutiqueHref } from "@/lib/boutique";

export function BoutiqueShell({ children }: { children: ReactNode }) {
  const store = useBoutiqueStore();
  const theme = useBoutiqueTheme();
  const { data: topBarAnnouncements = [] } = useBoutiqueAnnouncementsQuery("top_bar");
  const { data: popupAnnouncements = [] } = useBoutiqueAnnouncementsQuery("popup");
  const [dismissedBarIds, setDismissedBarIds] = useState<string[]>([]);
  const [selectedPopupId, setSelectedPopupId] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const visibleBars = useMemo(
    () => topBarAnnouncements.filter((item) => !dismissedBarIds.includes(item.id)),
    [dismissedBarIds, topBarAnnouncements],
  );
  const bar = visibleBars[0] || null;
  const popup = popupAnnouncements.find((item) => item.id === selectedPopupId) || null;

  useEffect(() => {
    if (popupAnnouncements.length === 0) {
      return;
    }

    const eligibleAnnouncements = popupAnnouncements.filter((announcement) => {
      const storageKey = `boutique_popup_seen_${announcement.id}`;
      return (
        announcement.show_on_every_visit ||
        !window.sessionStorage.getItem(storageKey)
      );
    });

    if (eligibleAnnouncements.length === 0) {
      return;
    }

    const announcement =
      eligibleAnnouncements[Math.floor(Math.random() * eligibleAnnouncements.length)];

    setSelectedPopupId(announcement.id);
    setShowPopup(false);

    const timer = window.setTimeout(() => {
      setShowPopup(true);
    }, (announcement.display_delay_seconds || 0) * 1000);

    return () => window.clearTimeout(timer);
  }, [popupAnnouncements]);

  const handleClosePopup = () => {
    if (popup) {
      window.sessionStorage.setItem(`boutique_popup_seen_${popup.id}`, "1");
    }
    setShowPopup(false);
  };

  return (
    <>
      {bar ? (
        <div
          className="relative px-10 py-2 text-center text-sm font-medium"
          style={{
            backgroundColor: bar.background_color || theme.palette.topBarBackground,
            color: bar.text_color || theme.palette.topBarText,
          }}
        >
          <span>{bar.title}</span>
          {bar.link_url ? (
            <Link
              href={resolveBoutiqueHref(bar.link_url, store)}
              className="ml-3 underline underline-offset-4"
            >
              {bar.link_text || "Voir"}
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => setDismissedBarIds((current) => [...current, bar.id])}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <BoutiqueNavbar />
      <main>{children}</main>
      <BoutiqueFooter />

      {popup && showPopup ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"
          onClick={handleClosePopup}
        >
          <div
            className="relative w-full max-w-md overflow-hidden rounded-[2rem] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
            style={{
              backgroundColor: popup.background_color || theme.palette.heroBase,
              color: popup.text_color || theme.palette.topBarText,
            }}
          >
            <button
              type="button"
              onClick={handleClosePopup}
              className="absolute right-4 top-4 z-10 rounded-full bg-black/30 p-2"
            >
              <X className="h-4 w-4" />
            </button>
            {popup.image_url ? (
              <div className="relative h-56">
                <Image
                  src={popup.image_url}
                  alt={popup.title}
                  fill
                  className="object-cover"
                />
              </div>
            ) : null}
            <div className="space-y-4 p-6">
              <h2 className="text-2xl font-semibold">{popup.title}</h2>
              {popup.content ? <p className="text-sm opacity-90">{popup.content}</p> : null}
              {popup.link_url ? (
                <Link
                  href={resolveBoutiqueHref(popup.link_url, store)}
                  onClick={handleClosePopup}
                  className="inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-medium"
                >
                  {popup.link_text || "Voir"}
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
