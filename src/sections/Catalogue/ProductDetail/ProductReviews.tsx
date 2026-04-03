"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  LogIn,
  MessageSquare,
  RefreshCw,
  Send,
  ShieldCheck,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SectionContainer, SectionWrapper } from "@/components/SectionWrapper";
import { cn, useSectionStyles } from "@/hooks/useSectionStyles";
import { useParams } from "@/lib/router";
import { isUuidLike } from "@/lib/uuid";
import { useBoutiqueClientSessionQuery } from "@/hooks/useBoutiqueClient";
import type { StorefrontSectionStoreData } from "@/lib/storefront-section-data";
import { useProductReviews } from "@/hooks/useProductReviews";
import productReviewsSchema from "./ProductReviews.schema";

export interface ProductReviewsProps {
  id?: string;
  testId?: string;
  content?: {
    productId?: string;
    title?: string;
    subtitle?: string;
    formTitle?: string;
    formSubtitle?: string;
    loginTitle?: string;
    loginSubtitle?: string;
    loginButtonLabel?: string;
    emptyTitle?: string;
    emptySubtitle?: string;
    ratingLabel?: string;
    commentLabel?: string;
    commentPlaceholder?: string;
    submitLabel?: string;
  };
  config?: {
    showSummary?: boolean;
    showForm?: boolean;
    showVerifiedBadge?: boolean;
    showAvatars?: boolean;
    layout?: "split" | "stacked";
    maxReviews?: number;
  };
  style?: {
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
  };
  classes?: {
    root?: string;
    header?: string;
    summaryCard?: string;
    grid?: string;
    reviewsList?: string;
    reviewCard?: string;
    formCard?: string;
    loginCard?: string;
    avatar?: string;
    author?: string;
    meta?: string;
    title?: string;
    subtitle?: string;
    comment?: string;
    emptyState?: string;
    button?: string;
  };
  storefrontStore?: StorefrontSectionStoreData | null;
}

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

function formatDate(value: string) {
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

function RatingStars({
  rating,
  accentColor,
  className,
}: {
  rating: number;
  accentColor: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={cn(
            "h-4 w-4",
            index < Math.round(rating) && "fill-current",
          )}
          style={{ color: accentColor }}
        />
      ))}
    </div>
  );
}

function AvatarFallback({
  name,
  accentColor,
  className,
}: {
  name: string;
  accentColor: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold uppercase",
        className,
      )}
      style={{
        backgroundColor: `${accentColor}20`,
        color: accentColor,
      }}
    >
      {name.trim().charAt(0) || "?"}
    </div>
  );
}

export function ProductReviews({
  id,
  testId,
  content = {},
  config = {},
  style = {},
  classes = {},
  storefrontStore,
}: ProductReviewsProps) {
  const params = useParams();
  const storeSlug = String(storefrontStore?.storeSlug || "").trim();
  const { data: boutiqueSession, isLoading: isSessionLoading } =
    useBoutiqueClientSessionQuery(storeSlug);
  const customer = boutiqueSession?.customer ?? null;

  const resolvedProductId = useMemo(() => {
    const routeProductId = String(params.id || "").trim();
    const fallbackProductId = String(content.productId || "").trim();
    return routeProductId || fallbackProductId;
  }, [content.productId, params.id]);
  const hasLinkedProduct =
    Boolean(resolvedProductId) && isUuidLike(resolvedProductId);

  const {
    title = "Avis clients",
    subtitle = "Consultez les retours clients et publiez votre propre avis.",
    formTitle = "Publier un avis",
    formSubtitle = "Votre retour aide les autres clients a acheter sereinement.",
    loginTitle = "Connectez-vous pour publier un avis",
    loginSubtitle = "Une session active est requise pour envoyer un commentaire.",
    loginButtonLabel = "Se connecter",
    emptyTitle = "Aucun avis pour le moment",
    emptySubtitle = "Soyez le premier a partager votre experience sur ce produit.",
    ratingLabel = "Votre note",
    commentLabel = "Votre avis",
    commentPlaceholder = "Racontez votre experience...",
    submitLabel = "Publier l'avis",
    formDisabledMessage = "La publication d'avis est desactivee pour cette section.",
    linkProductTitle = "Lier a un produit",
    linkProductSubtitle = "Renseignez un identifiant produit UUID reel pour charger les avis et autoriser la publication.",
    sessionCheckingLabel = "Verification de votre session client...",
    accountBlockedTitle = "Votre compte client boutique est bloque",
    accountBlockedSubtitle = "Vous ne pouvez pas publier d'avis pour le moment.",
    ratingOutOfLabel = "{rating}/5",
  } = content;

  const {
    showSummary = true,
    showForm = true,
    showVerifiedBadge = true,
    showAvatars = true,
    layout = "split",
    maxReviews = 6,
  } = config;

  const { colors: styleColors = {}, spacing: styleSpacing = {} } = style;

  const {
    background: backgroundColor = "white",
    text: textColor = "primary",
    accent: accentColor = "accent",
    cardBg: cardBgColor = "white",
    border: borderColor = "#e5e5e5",
  } = styleColors;

  const { container = "contained", paddingY = "16", gap = "6" } = styleSpacing;

  const { css } = useSectionStyles(style);
  const {
    reviews,
    summary,
    isLoading,
    isError,
    error,
    refetch,
    submitReview,
    isSubmitting,
  } = useProductReviews(
    hasLinkedProduct ? resolvedProductId : undefined,
    maxReviews,
  );

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [loginHref, setLoginHref] = useState("/connexion");

  const resolvedBgColor = resolveColor(backgroundColor, "#ffffff");
  const resolvedTextColor = resolveColor(textColor, "#1a1a1a");
  const resolvedAccentColor = resolveColor(accentColor, "#c9a96e");
  const resolvedCardBgColor = resolveColor(cardBgColor, "#ffffff");
  const resolvedBorderColor = resolveColor(borderColor, "#e5e5e5");
  const isStacked = layout === "stacked";
  const paddingYValue = Number.parseInt(String(paddingY || "16"), 10);
  const gapValue = Number.parseInt(String(gap || "6"), 10);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setLoginHref(
      `/connexion?redirect=${encodeURIComponent(
        `${window.location.pathname}${window.location.search}`,
      )}`,
    );
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!hasLinkedProduct) {
      toast.error("Associez cette section a un produit UUID reel.");
      return;
    }

    if (!customer) {
      toast.error("Connectez-vous avec votre compte client boutique.");
      return;
    }

    if (customer.status === "blocked") {
      toast.error("Votre compte client boutique est bloque.");
      return;
    }

    const trimmedComment = comment.trim();
    if (trimmedComment.length < 3) {
      setFormError("Le commentaire est trop court.");
      return;
    }

    try {
      setFormError(null);
      await submitReview({
        rating,
        comment: trimmedComment,
      });
      setRating(5);
      setComment("");
      toast.success("Votre avis a ete publie.");
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : "Impossible de publier votre avis.";
      setFormError(message);
      toast.error(message);
    }
  };

  const formCard = !showForm ? (
    <div
      className="rounded-2xl border p-6"
      style={{
        backgroundColor: resolvedCardBgColor,
        borderColor: resolvedBorderColor,
      }}
    >
      <p className="text-sm font-medium" style={{ color: resolvedTextColor }}>
        {formDisabledMessage}
      </p>
    </div>
  ) : !hasLinkedProduct ? (
    <div
      className="rounded-2xl border p-6"
      style={{
        backgroundColor: resolvedCardBgColor,
        borderColor: resolvedBorderColor,
      }}
    >
      <div className="space-y-1">
        <h3
          className="text-lg font-semibold"
          style={{ color: resolvedTextColor }}
        >
          {linkProductTitle}
        </h3>
        <p
          className="text-sm leading-relaxed"
          style={{ color: `${resolvedTextColor}80` }}
        >
          {linkProductSubtitle}
        </p>
      </div>
    </div>
  ) : isSessionLoading ? (
    <div
      className="rounded-2xl border p-6"
      style={{
        backgroundColor: resolvedCardBgColor,
        borderColor: resolvedBorderColor,
      }}
    >
      <div
        className="flex items-center gap-3 text-sm"
        style={{ color: `${resolvedTextColor}99` }}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        {sessionCheckingLabel}
      </div>
    </div>
  ) : !customer ? (
    <div
      className="rounded-2xl border p-6"
      style={{
        backgroundColor: resolvedCardBgColor,
        borderColor: resolvedBorderColor,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-full"
          style={{
            backgroundColor: `${resolvedAccentColor}15`,
            color: resolvedAccentColor,
          }}
        >
          <LogIn className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h3
            className="text-lg font-semibold"
            style={{ color: resolvedTextColor }}
          >
            {loginTitle}
          </h3>
          <p
            className="text-sm leading-relaxed"
            style={{ color: `${resolvedTextColor}80` }}
          >
            {loginSubtitle}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <Button asChild className={cn("w-full", classes.button)}>
          <a href={loginHref}>{loginButtonLabel}</a>
        </Button>
      </div>
    </div>
  ) : customer.status === "blocked" ? (
    <div
      className="rounded-2xl border p-6"
      style={{
        backgroundColor: resolvedCardBgColor,
        borderColor: resolvedBorderColor,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-full"
          style={{
            backgroundColor: `${resolvedAccentColor}15`,
            color: resolvedAccentColor,
          }}
        >
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h3
            className="text-lg font-semibold"
            style={{ color: resolvedTextColor }}
          >
            {accountBlockedTitle}
          </h3>
          <p
            className="text-sm leading-relaxed"
            style={{ color: `${resolvedTextColor}80` }}
          >
            {accountBlockedSubtitle}
          </p>
        </div>
      </div>
    </div>
  ) : (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border p-6 space-y-5"
      style={{
        backgroundColor: resolvedCardBgColor,
        borderColor: resolvedBorderColor,
      }}
    >
      <div className="space-y-1">
        <h3
          className="text-lg font-semibold"
          style={{ color: resolvedTextColor }}
        >
          {formTitle}
        </h3>
        <p
          className="text-sm leading-relaxed"
          style={{ color: `${resolvedTextColor}80` }}
        >
          {formSubtitle}
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <label
            className="text-sm font-medium"
            style={{ color: resolvedTextColor }}
          >
            {ratingLabel}
          </label>
          <span
            className="text-sm font-semibold"
            style={{ color: resolvedAccentColor }}
          >
            {ratingOutOfLabel.replace("{rating}", String(rating))}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }, (_, index) => {
            const starValue = index + 1;
            const isActive = starValue <= rating;

            return (
              <button
                key={starValue}
                type="button"
                onClick={() => setRating(starValue)}
                className="rounded-full border p-2 transition-transform hover:scale-105"
                style={{
                  backgroundColor: isActive
                    ? `${resolvedAccentColor}15`
                    : "transparent",
                  borderColor: isActive
                    ? resolvedAccentColor
                    : resolvedBorderColor,
                }}
                aria-label={`${starValue} étoiles`}
              >
                <Star
                  className="h-5 w-5"
                  fill={isActive ? resolvedAccentColor : "none"}
                  style={{ color: resolvedAccentColor }}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <label
          className="text-sm font-medium"
          style={{ color: resolvedTextColor }}
        >
          {commentLabel}
        </label>
        <Textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder={commentPlaceholder}
          maxLength={2000}
          rows={5}
          className="resize-none"
        />
      </div>

      {formError && (
        <p className="text-sm font-medium text-red-500" role="alert">
          {formError}
        </p>
      )}

      <Button
        type="submit"
        className={cn("w-full", classes.button)}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Publication...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            {submitLabel}
          </>
        )}
      </Button>
    </form>
  );

  return (
    <SectionWrapper
      id={id}
      testId={testId}
      as="section"
      className={cn("w-full", classes.root)}
      style={{
        backgroundColor: resolvedBgColor,
        color: resolvedTextColor,
        paddingTop: `${paddingYValue * 0.25}rem`,
        paddingBottom: `${paddingYValue * 0.25}rem`,
        ...css,
      }}
    >
      <SectionContainer size={container}>
        <div className="space-y-8">
          <div className={cn("space-y-3", classes.header)}>
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em]"
              style={{ color: resolvedAccentColor }}
            >
              <MessageSquare className="h-4 w-4" />
              Avis clients
            </div>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl space-y-2">
                <h2
                  className={cn(
                    "text-2xl sm:text-3xl font-semibold",
                    classes.title,
                  )}
                  style={{ color: resolvedTextColor }}
                >
                  {title}
                </h2>
                <p
                  className={cn(
                    "text-sm sm:text-base leading-relaxed",
                    classes.subtitle,
                  )}
                  style={{ color: `${resolvedTextColor}80` }}
                >
                  {subtitle}
                </p>
              </div>

              {showSummary && (
                <div
                  className={cn(
                    "rounded-2xl border p-5 shadow-sm",
                    classes.summaryCard,
                  )}
                  style={{
                    backgroundColor: resolvedCardBgColor,
                    borderColor: resolvedBorderColor,
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <div
                        className="text-4xl font-semibold leading-none"
                        style={{ color: resolvedAccentColor }}
                      >
                        {Number.isFinite(summary.averageRating)
                          ? summary.averageRating.toFixed(1)
                          : "0.0"}
                      </div>
                      <RatingStars
                        rating={summary.averageRating}
                        accentColor={resolvedAccentColor}
                        className="mt-2"
                      />
                    </div>
                    <div className="space-y-1">
                      <p
                        className="text-sm font-medium"
                        style={{ color: resolvedTextColor }}
                      >
                        {summary.reviewCount} avis
                      </p>
                      <p
                        className="text-xs leading-relaxed"
                        style={{ color: `${resolvedTextColor}70` }}
                      >
                        Basé sur les avis approuvés des clients.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div
            className={cn(
              "grid gap-8",
              isStacked
                ? "grid-cols-1"
                : "grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]",
              classes.grid,
            )}
            style={{ gap: `${gapValue * 0.25}rem` }}
          >
            <div className={cn("space-y-4", classes.reviewsList)}>
              <div className="flex items-center justify-between gap-3">
                <h3
                  className="text-lg font-semibold"
                  style={{ color: resolvedTextColor }}
                >
                  Les avis récents
                </h3>
                {!isLoading && reviews.length > 0 && (
                  <button
                    type="button"
                    onClick={() => refetch()}
                    className="inline-flex items-center gap-2 text-sm font-medium"
                    style={{ color: resolvedAccentColor }}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Actualiser
                  </button>
                )}
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }, (_, index) => (
                    <div
                      key={index}
                      className="animate-pulse rounded-2xl border p-5"
                      style={{
                        backgroundColor: resolvedCardBgColor,
                        borderColor: resolvedBorderColor,
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="h-11 w-11 rounded-full"
                          style={{
                            backgroundColor: `${resolvedAccentColor}20`,
                          }}
                        />
                        <div className="flex-1 space-y-3">
                          <div className="h-4 w-1/3 rounded bg-gray-200" />
                          <div className="h-3 w-1/2 rounded bg-gray-200" />
                          <div className="h-3 w-full rounded bg-gray-200" />
                          <div className="h-3 w-5/6 rounded bg-gray-200" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : isError ? (
                <div
                  className="rounded-2xl border p-5"
                  style={{
                    backgroundColor: resolvedCardBgColor,
                    borderColor: resolvedBorderColor,
                  }}
                >
                  <p className="text-sm font-medium text-red-500">
                    {error instanceof Error
                      ? error.message
                      : "Impossible de charger les avis."}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4"
                    onClick={() => refetch()}
                  >
                    Réessayer
                  </Button>
                </div>
              ) : reviews.length === 0 ? (
                <div
                  className={cn(
                    "rounded-2xl border p-8 text-center",
                    classes.emptyState,
                  )}
                  style={{
                    backgroundColor: resolvedCardBgColor,
                    borderColor: resolvedBorderColor,
                  }}
                >
                  <div
                    className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: `${resolvedAccentColor}15`,
                      color: resolvedAccentColor,
                    }}
                  >
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <h4
                    className="mt-4 text-lg font-semibold"
                    style={{ color: resolvedTextColor }}
                  >
                    {emptyTitle}
                  </h4>
                  <p
                    className="mt-2 text-sm leading-relaxed"
                    style={{ color: `${resolvedTextColor}80` }}
                  >
                    {emptySubtitle}
                  </p>
                </div>
              ) : (
                reviews.map((review) => (
                  <motion.article
                    key={review.id}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.45 }}
                    className={cn(
                      "rounded-2xl border p-5 shadow-sm",
                      classes.reviewCard,
                    )}
                    style={{
                      backgroundColor: resolvedCardBgColor,
                      borderColor: resolvedBorderColor,
                    }}
                  >
                    <div className="flex items-start gap-4">
                      {showAvatars ? (
                        review.avatar ? (
                          <img
                            src={review.avatar}
                            alt={review.author}
                            className={cn(
                              "h-11 w-11 rounded-full object-cover",
                              classes.avatar,
                            )}
                          />
                        ) : (
                          <AvatarFallback
                            name={review.author}
                            accentColor={resolvedAccentColor}
                            className={classes.avatar}
                          />
                        )
                      ) : null}

                      <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4
                                className={cn("font-semibold", classes.author)}
                                style={{ color: resolvedTextColor }}
                              >
                                {review.author}
                              </h4>
                              {showVerifiedBadge && review.verified && (
                                <span
                                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                                  style={{
                                    backgroundColor: `${resolvedAccentColor}15`,
                                    color: resolvedAccentColor,
                                  }}
                                >
                                  <ShieldCheck className="h-3 w-3" />
                                  Vérifié
                                </span>
                              )}
                            </div>
                            <p
                              className={cn("text-xs", classes.meta)}
                              style={{ color: `${resolvedTextColor}70` }}
                            >
                              {formatDate(review.createdAt)}
                            </p>
                          </div>

                          <RatingStars
                            rating={review.rating}
                            accentColor={resolvedAccentColor}
                          />
                        </div>

                        <p
                          className={cn(
                            "text-sm leading-relaxed",
                            classes.comment,
                          )}
                          style={{ color: `${resolvedTextColor}90` }}
                        >
                          {review.comment}
                        </p>

                        {review.images.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {review.images.map((image) => (
                              <img
                                key={image}
                                src={image}
                                alt={review.author}
                                className="h-16 w-16 rounded-lg object-cover"
                              />
                            ))}
                          </div>
                        )}

                        {review.helpfulCount > 0 && (
                          <p
                            className="text-xs font-medium"
                            style={{ color: `${resolvedTextColor}70` }}
                          >
                            {review.helpfulCount}{" "}
                            {review.helpfulCount === 1
                              ? "personne a trouvé cet avis utile"
                              : "personnes ont trouvé cet avis utile"}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.article>
                ))
              )}
            </div>

            <div className={cn("space-y-4", classes.formCard)}>{formCard}</div>
          </div>
        </div>
      </SectionContainer>
    </SectionWrapper>
  );
}

Object.assign(ProductReviews, { schema: productReviewsSchema });

export const schema = productReviewsSchema;

export default ProductReviews;
