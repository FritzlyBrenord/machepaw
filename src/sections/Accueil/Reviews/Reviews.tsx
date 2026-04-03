"use client";

// ============================================
// REVIEWS — 100% Configurable Architecture
// ============================================

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Star, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { SectionWrapper, SectionContainer } from "@/components/SectionWrapper";
import { cn, useSectionStyles } from "@/hooks/useSectionStyles";
import reviewsSchema from "./Reviews.schema";

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────
export interface Review {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  date: string;
  content: string;
  verified?: boolean;
  photos?: string[];
}

export interface ReviewsContent {
  title?: string;
  reviews?: Review[];
}

export interface ReviewsConfig {
  showRating?: boolean;
  showPhotos?: boolean;
  showVerifiedBadge?: boolean;
  showDate?: boolean;
  layout?: "list" | "grid";
  columns?: 1 | 2;
  animation?: {
    entrance?: "fade-in" | "slide-up" | "scale-in" | "none";
    stagger?: boolean;
  };
}

export interface ReviewsStyle {
  colors?: {
    background?: string;
    text?: string;
    accent?: string;
    cardBg?: string;
    border?: string;
  };
  spacing?: {
    paddingY?: string;
    container?: "full" | "contained" | "narrow";
    gap?: string;
  };
}

export interface ReviewsClasses {
  root?: string;
  title?: string;
  grid?: string;
  card?: string;
  avatar?: string;
  author?: string;
  verifiedBadge?: string;
  rating?: string;
  date?: string;
  content?: string;
  photos?: string;
}

export interface ReviewsProps {
  id?: string;
  testId?: string;
  content?: ReviewsContent;
  config?: ReviewsConfig;
  style?: ReviewsStyle;
  classes?: ReviewsClasses;
  storefrontStore?: {
    storeSlug?: string;
  } | null;
}

// ─────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────
function resolveColor(color: string | undefined, defaultColor: string): string {
  if (!color) return defaultColor;
  const colorMap: Record<string, string> = {
    primary: "var(--color-primary, #1a1a1a)",
    secondary: "var(--color-secondary, #f5f5f5)",
    accent: "var(--color-accent, #c9a96e)",
    muted: "var(--color-muted, #6b7280)",
    white: "#ffffff",
    black: "#000000",
    transparent: "transparent",
  };
  return colorMap[color] || color;
}

function formatDisplayDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

// ─────────────────────────────────────────
// MAIN REVIEWS COMPONENT
// ─────────────────────────────────────────
export function Reviews({
  id,
  testId,
  content = {},
  config = {},
  style = {},
  classes = {},
  storefrontStore,
}: ReviewsProps) {
  // ── EXTRACT CONTENT ──
  const { title = "Avis clients", reviews = [] } = content;
  const storeSlug = String(storefrontStore?.storeSlug || "").trim();
  const useBackendReviews = Boolean(storeSlug);

  // ── EXTRACT CONFIG ──
  const {
    showRating = true,
    showPhotos = true,
    showVerifiedBadge = true,
    showDate = true,
    layout = "list",
    columns = 1,
    animation = { entrance: "fade-in", stagger: true },
  } = config;

  // ── EXTRACT STYLE ──
  const { colors: styleColors = {}, spacing: styleSpacing = {} } = style;

  const {
    background: backgroundColor = "secondary",
    text: textColor = "primary",
    accent: accentColor = "accent",
    cardBg: cardBgColor = "white",
    border: borderColor,
  } = styleColors;

  const { container = "contained", paddingY = "16", gap = "6" } = styleSpacing;

  // ── HOOKS ──
  const { css } = useSectionStyles(style);
  const backendReviewsQuery = useQuery({
    queryKey: ["reviews-section", storeSlug],
    enabled: useBackendReviews,
    staleTime: 30_000,
    retry: false,
    queryFn: async () => {
      const params = new URLSearchParams({
        storeSlug,
        limit: String(Math.max(reviews.length || 0, 6)),
      });

      const response = await fetch(`/api/reviews?${params.toString()}`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Impossible de charger les avis.");
      }

      return (await response.json()) as {
        reviews?: Array<{
          id: string;
          author: string;
          avatar?: string;
          rating: number;
          comment: string;
          images?: string[];
          verified?: boolean;
          createdAt: string;
        }>;
      };
    },
  });

  // ── HELPERS ──
  const resolvedBgColor = resolveColor(backgroundColor, "#f5f5f5");
  const resolvedTextColor = resolveColor(textColor, "#1a1a1a");
  const resolvedAccentColor = resolveColor(accentColor, "#c9a96e");
  const resolvedCardBgColor = resolveColor(cardBgColor, "#ffffff");
  const resolvedBorderColor = borderColor
    ? resolveColor(borderColor, "#e5e5e5")
    : "#e5e5e5";
  const backendReviews = useMemo<Review[]>(
    () =>
      (backendReviewsQuery.data?.reviews || []).map((review) => ({
        id: review.id,
        author: review.author,
        avatar: review.avatar,
        rating: review.rating,
        date: formatDisplayDate(review.createdAt),
        content: review.comment,
        verified: Boolean(review.verified),
        photos: review.images || [],
      })),
    [backendReviewsQuery.data?.reviews],
  );
  const displayReviews = useBackendReviews ? backendReviews : reviews;

  const gridCols = columns === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1";

  // ── RENDER ──
  return (
    <SectionWrapper
      id={id}
      testId={testId}
      as="section"
      animation={animation}
      className={cn("w-full", classes?.root)}
      style={{
        backgroundColor: resolvedBgColor,
        color: resolvedTextColor,
        ...css,
      }}
    >
      <SectionContainer
        size={container}
        style={{
          paddingTop: `${parseInt(paddingY) * 0.25}rem`,
          paddingBottom: `${parseInt(paddingY) * 0.25}rem`,
        }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={cn("text-2xl sm:text-3xl font-bold mb-8", classes?.title)}
          style={{ color: resolvedTextColor }}
        >
          {title}
        </motion.h2>

        <div
          className={cn(
            "grid",
            layout === "grid" ? gridCols : "grid-cols-1",
            classes?.grid,
          )}
          style={{ gap: `${parseInt(gap) * 0.25}rem` }}
        >
          {displayReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={cn("p-6 rounded-lg border", classes?.card)}
              style={{
                borderColor: resolvedBorderColor,
                backgroundColor: resolvedCardBgColor,
              }}
            >
              <div className="flex items-start gap-4">
                {review.avatar && (
                  <img
                    src={review.avatar}
                    alt={review.author}
                    className={cn(
                      "w-12 h-12 rounded-full object-cover",
                      classes?.avatar,
                    )}
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={cn("font-semibold", classes?.author)}
                      style={{ color: resolvedTextColor }}
                    >
                      {review.author}
                    </span>
                    {showVerifiedBadge && review.verified && (
                      <span
                        className={cn(
                          "flex items-center gap-1 text-xs",
                          classes?.verifiedBadge,
                        )}
                        style={{ color: resolvedAccentColor }}
                      >
                        <CheckCircle className="w-3 h-3" />
                        Vérifié
                      </span>
                    )}
                  </div>

                  {showRating && (
                    <div className={cn("flex gap-1 mb-2", classes?.rating)}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? "fill-current" : ""
                          }`}
                          style={{ color: resolvedAccentColor }}
                        />
                      ))}
                    </div>
                  )}

                  {showDate && (
                    <p
                      className={cn("text-sm mb-2", classes?.date)}
                      style={{ color: `${resolvedTextColor}99` }}
                    >
                      {review.date}
                    </p>
                  )}

                  <p
                    className={cn(classes?.content)}
                    style={{ color: resolvedTextColor }}
                  >
                    {review.content}
                  </p>

                  {showPhotos && review.photos && review.photos.length > 0 && (
                    <div className={cn("flex gap-2 mt-4", classes?.photos)}>
                      {review.photos.map((photo, photoIndex) => (
                        <img
                          key={photoIndex}
                          src={photo}
                          alt={`Photo ${photoIndex + 1}`}
                          className="w-16 h-16 rounded object-cover"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionContainer>
    </SectionWrapper>
  );
}

Object.assign(Reviews, { schema: reviewsSchema });

export const schema = reviewsSchema;

export default Reviews;
