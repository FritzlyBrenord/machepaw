import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { AuthAccountLike } from "@/lib/authRedirect";
import {
  resolvePostAuthRedirect,
  sanitizeAuthRedirect,
} from "@/lib/authRedirect";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const requestedRedirect = sanitizeAuthRedirect(
    requestUrl.searchParams.get("redirect"),
    "/",
  );

  if (!code) {
    return NextResponse.redirect(
      new URL(`/auth/login?redirect=${encodeURIComponent(requestedRedirect)}`, requestUrl.origin),
    );
  }

  const cookieStore = (await cookies()) as any;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.redirect(
      new URL(`/auth/login?redirect=${encodeURIComponent(requestedRedirect)}`, requestUrl.origin),
    );
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value;
      },
      set(name, value, options) {
        cookieStore.set(name, value, options);
      },
      remove(name, options) {
        cookieStore.set(name, "", { ...options, maxAge: 0 });
      },
    },
  });
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(
      new URL(
        `/auth/login?redirect=${encodeURIComponent(requestedRedirect)}&error=oauth`,
        requestUrl.origin,
      ),
    );
  }

  const { data: authData } = await supabase.auth.getUser();
  const authUser = authData.user;

  if (!authUser) {
    return NextResponse.redirect(
      new URL(`/auth/login?redirect=${encodeURIComponent(requestedRedirect)}`, requestUrl.origin),
    );
  }

  const isAdmin =
    authUser.user_metadata?.role === "admin" ||
    authUser.app_metadata?.role === "admin";

  if (isAdmin) {
    return NextResponse.redirect(new URL("/admin", requestUrl.origin));
  }

  try {
    const { data: userRow } = await supabase
      .from("users")
      .select("id, auth_id, role, is_blocked")
      .or(`id.eq.${authUser.id},auth_id.eq.${authUser.id}`)
      .maybeSingle();

    const userId = (userRow?.id as string | undefined) || authUser.id;

    const { data: sellerRow } = await supabase
      .from("sellers")
      .select("status")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const account: AuthAccountLike = {
      role:
        userRow?.role === "admin"
          ? "admin"
          : sellerRow
            ? "seller"
            : userRow?.role === "seller"
              ? "seller"
              : "customer",
      isBlocked: Boolean(userRow?.is_blocked),
      seller: sellerRow ? { status: sellerRow.status } : null,
    };

    const target = resolvePostAuthRedirect(account, requestedRedirect);
    return NextResponse.redirect(new URL(target, requestUrl.origin));
  } catch {
    return NextResponse.redirect(new URL(requestedRedirect, requestUrl.origin));
  }
}
