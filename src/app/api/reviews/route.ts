import { NextResponse } from "next/server";
import { getBoutiqueClientSession } from "@/lib/boutiqueClientAuth";
import { createServerSupabaseClient } from "@/lib/serverSupabase";
import { isUuidLike } from "@/lib/uuid";

type ProductRow = {
  id: string;
  seller_id?: string | null;
  rating?: number | null;
  review_count?: number | null;
};

type SellerRow = {
  id: string;
  store_slug?: string | null;
  status?: string | null;
};

type UserRow = {
  id: string;
  first_name: string;
  last_name: string;
  avatar?: string | null;
  is_blocked?: boolean | null;
};

type ReviewRow = {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  avatar?: string | null;
  rating: number;
  comment: string;
  images?: string[] | null;
  is_verified?: boolean | null;
  is_approved?: boolean | null;
  helpful_count?: number | null;
  created_at: string;
};

type ReviewResponse = {
  reviews: Array<{
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
  }>;
  summary: {
    averageRating: number;
    reviewCount: number;
  };
};

function mapReviewRow(row: ReviewRow) {
  return {
    id: row.id,
    author: row.user_name,
    avatar: row.avatar || undefined,
    rating: Number(row.rating || 0),
    comment: row.comment,
    images: Array.isArray(row.images)
      ? row.images.filter((value) => typeof value === "string")
      : [],
    verified: Boolean(row.is_verified),
    helpfulCount: Number(row.helpful_count || 0),
    createdAt: row.created_at,
    userId: row.user_id,
  };
}

function resolveProductId(searchParams: URLSearchParams) {
  return String(searchParams.get("productId") || searchParams.get("product_id") || "").trim();
}

function resolveStoreSlug(searchParams: URLSearchParams) {
  return String(searchParams.get("storeSlug") || searchParams.get("store_slug") || "").trim();
}

function emptyReviewResponse() {
  return NextResponse.json(
    {
      reviews: [],
      summary: {
        averageRating: 0,
        reviewCount: 0,
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

function clampLimit(value: string | null) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) {
    return 6;
  }

  return Math.min(Math.max(parsed, 1), 24);
}

function resolveRatingValue(value: unknown) {
  const rating = Number(value);
  if (!Number.isFinite(rating)) {
    return null;
  }

  return Math.min(5, Math.max(1, Math.round(rating)));
}

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const productId = resolveProductId(requestUrl.searchParams);
    const storeSlug = resolveStoreSlug(requestUrl.searchParams);
    const limit = clampLimit(requestUrl.searchParams.get("limit"));

    const supabase = createServerSupabaseClient();

    if (productId && isUuidLike(productId)) {
      const [{ data: reviewsData, error: reviewsError }, { data: productData, error: productError }] =
        await Promise.all([
          supabase
            .from("reviews")
            .select(
              "id, product_id, user_id, user_name, avatar, rating, comment, images, is_verified, is_approved, helpful_count, created_at",
            )
            .eq("product_id", productId)
            .eq("is_approved", true)
            .order("created_at", { ascending: false })
            .limit(limit),
          supabase
            .from("products")
            .select("id, rating, review_count")
            .eq("id", productId)
            .maybeSingle(),
        ]);

      if (reviewsError) {
        return NextResponse.json({ error: reviewsError.message }, { status: 500 });
      }

      if (productError) {
        return NextResponse.json({ error: productError.message }, { status: 500 });
      }

      const reviews = (reviewsData || []).map((row) => mapReviewRow(row as ReviewRow));
      const computedAverage =
        reviews.length > 0
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
          : 0;

      const product = productData as ProductRow | null;
      const averageRating = Number(product?.rating ?? computedAverage ?? 0);
      const reviewCount = Number(product?.review_count ?? reviews.length ?? 0);

      return NextResponse.json<ReviewResponse>(
        {
          reviews,
          summary: {
            averageRating: Number.isFinite(averageRating) ? averageRating : 0,
            reviewCount: Number.isFinite(reviewCount) ? reviewCount : reviews.length,
          },
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    if (!storeSlug) {
      return emptyReviewResponse();
    }

    const { data: sellerData, error: sellerError } = await supabase
      .from("sellers")
      .select("id, store_slug, status")
      .eq("store_slug", storeSlug)
      .maybeSingle();

    if (sellerError) {
      return NextResponse.json({ error: sellerError.message }, { status: 500 });
    }

    if (!sellerData || (sellerData.status && sellerData.status !== "approved")) {
      return emptyReviewResponse();
    }

    const { data: productsData, error: productsError } = await supabase
      .from("products")
      .select("id")
      .eq("seller_id", sellerData.id)
      .eq("status", "active");

    if (productsError) {
      return NextResponse.json({ error: productsError.message }, { status: 500 });
    }

    const productIds = (productsData || [])
      .map((row) => String(row.id || "").trim())
      .filter((value) => value.length > 0);

    if (productIds.length === 0) {
      return emptyReviewResponse();
    }

    const { data: reviewsData, error: reviewsError } = await supabase
      .from("reviews")
      .select(
        "id, product_id, user_id, user_name, avatar, rating, comment, images, is_verified, is_approved, helpful_count, created_at",
      )
      .in("product_id", productIds)
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (reviewsError) {
      return NextResponse.json({ error: reviewsError.message }, { status: 500 });
    }

    const reviews = (reviewsData || []).map((row) => mapReviewRow(row as ReviewRow));
    const computedAverage =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;

    return NextResponse.json<ReviewResponse>(
      {
        reviews,
        summary: {
          averageRating: Number.isFinite(computedAverage) ? computedAverage : 0,
          reviewCount: reviews.length,
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur serveur.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient();

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Payload invalide." }, { status: 400 });
    }

    const productId = String(body.productId || body.product_id || "").trim();
    const rating = resolveRatingValue(body.rating);
    const comment = String(body.comment || "").trim();
    const images = Array.isArray(body.images)
      ? body.images.filter(
          (value): value is string => typeof value === "string" && value.trim().length > 0,
        )
      : [];

    if (!productId || !isUuidLike(productId)) {
      return NextResponse.json({ error: "productId invalide." }, { status: 400 });
    }

    if (!rating) {
      return NextResponse.json({ error: "La note doit etre comprise entre 1 et 5." }, { status: 400 });
    }

    if (comment.length < 3) {
      return NextResponse.json({ error: "Le commentaire est trop court." }, { status: 400 });
    }

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, seller_id, rating, review_count")
      .eq("id", productId)
      .maybeSingle();

    if (productError) {
      return NextResponse.json({ error: productError.message }, { status: 500 });
    }

    if (!product) {
      return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });
    }

    if (!product.seller_id) {
      return NextResponse.json(
        { error: "Ce produit n'est pas lie a une boutique." },
        { status: 400 },
      );
    }

    const { data: seller, error: sellerError } = await supabase
      .from("sellers")
      .select("id, store_slug, status")
      .eq("id", product.seller_id)
      .maybeSingle();

    if (sellerError) {
      return NextResponse.json({ error: sellerError.message }, { status: 500 });
    }

    if (!seller || !seller.store_slug) {
      return NextResponse.json({ error: "Boutique introuvable." }, { status: 404 });
    }

    if (seller.status && seller.status !== "approved") {
      return NextResponse.json({ error: "Boutique indisponible." }, { status: 403 });
    }

    const session = await getBoutiqueClientSession(seller.store_slug);

    if (!session || session.store.id !== seller.id) {
      return NextResponse.json(
        { error: "Connexion client boutique requise." },
        { status: 401 },
      );
    }

    if (session.customer.status !== "active") {
      return NextResponse.json(
        { error: "Votre compte client boutique est bloque." },
        { status: 403 },
      );
    }

    const { data: userRow, error: userError } = await supabase
      .from("users")
      .select("id, first_name, last_name, avatar, is_blocked")
      .eq("id", session.customer.userId)
      .maybeSingle();

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    if (!userRow) {
      return NextResponse.json({ error: "Profil client introuvable." }, { status: 404 });
    }

    if (userRow.is_blocked) {
      return NextResponse.json({ error: "Votre compte est bloque." }, { status: 403 });
    }

    const displayName =
      [session.customer.firstName, session.customer.lastName].filter(Boolean).join(" ").trim() ||
      [userRow.first_name, userRow.last_name].filter(Boolean).join(" ").trim() ||
      session.customer.email?.split("@")[0]?.trim() ||
      "Client";
    const avatar = session.customer.avatar || userRow.avatar || null;

    const { data: createdReview, error: insertError } = await supabase
      .from("reviews")
      .insert({
        product_id: productId,
        user_id: session.customer.userId,
        user_name: displayName,
        avatar,
        rating,
        comment,
        images,
        is_verified: false,
        is_approved: true,
      })
      .select(
        "id, product_id, user_id, user_name, avatar, rating, comment, images, is_verified, is_approved, helpful_count, created_at",
      )
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        review: mapReviewRow(createdReview as ReviewRow),
        product: {
          id: product.id,
          rating: product.rating,
          reviewCount: product.review_count,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur serveur.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
