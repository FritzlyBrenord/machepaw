import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isUuidLike } from "@/lib/uuid";

export type ProductReviewItem = {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  comment: string;
  images: string[];
  verified: boolean;
  helpfulCount: number;
  createdAt: string;
  userId: string;
};

export type ProductReviewSummary = {
  averageRating: number;
  reviewCount: number;
};

export type ProductReviewsResponse = {
  reviews: ProductReviewItem[];
  summary: ProductReviewSummary;
};

export type CreateProductReviewInput = {
  rating: number;
  comment: string;
  images?: string[];
};

async function readApiError(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as { error?: string };
    return payload.error || fallback;
  } catch {
    return fallback;
  }
}

export function useProductReviews(productId?: string | null, limit = 6) {
  const queryClient = useQueryClient();
  const normalizedProductId = String(productId || "").trim();
  const canQuery = Boolean(normalizedProductId) && isUuidLike(normalizedProductId);

  const query = useQuery({
    queryKey: ["product-reviews", normalizedProductId, limit],
    enabled: canQuery,
    staleTime: 30_000,
    retry: false,
    queryFn: async (): Promise<ProductReviewsResponse> => {
      const params = new URLSearchParams({
        productId: normalizedProductId,
        limit: String(limit),
      });

      const response = await fetch(`/api/reviews?${params.toString()}`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(await readApiError(response, "Impossible de charger les avis."));
      }

      return (await response.json()) as ProductReviewsResponse;
    },
  });

  const mutation = useMutation({
    mutationFn: async (input: CreateProductReviewInput) => {
      if (!canQuery) {
        throw new Error("productId invalide.");
      }

      const response = await fetch("/api/reviews", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: normalizedProductId,
          rating: input.rating,
          comment: input.comment,
          images: input.images || [],
        }),
      });

      if (!response.ok) {
        throw new Error(await readApiError(response, "Impossible de publier votre avis."));
      }

      return (await response.json()) as { review: ProductReviewItem };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["product-reviews", normalizedProductId],
      });
    },
  });

  return {
    ...query,
    reviews: query.data?.reviews || [],
    summary: query.data?.summary || { averageRating: 0, reviewCount: 0 },
    submitReview: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
  };
}
