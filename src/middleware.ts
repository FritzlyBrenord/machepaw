import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function isRootPath(pathname: string) {
  return pathname === "/";
}

function isAuthPath(pathname: string) {
  return pathname === "/auth/login" || pathname === "/auth/signup";
}

function isSellerPath(pathname: string) {
  return pathname === "/vendeur" || pathname.startsWith("/vendeur/");
}

function isBecomeSellerPath(pathname: string) {
  return pathname === "/devenir-vendeur";
}

function hasSupabaseAuthCookies(request: NextRequest) {
  return request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith("sb-"));
}

async function getSellerStatus(
  supabase: ReturnType<typeof createServerClient>,
  authUserId: string,
) {
  const { data: userRow } = await supabase
    .from("users")
    .select("id, auth_id, role")
    .or(`id.eq.${authUserId},auth_id.eq.${authUserId}`)
    .maybeSingle();

  const resolvedUserId = userRow?.id || authUserId;

  const { data: sellerRow } = await supabase
    .from("sellers")
    .select("status")
    .eq("user_id", resolvedUserId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return sellerRow?.status ?? null;
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return response;
  }

  const path = request.nextUrl.pathname;

  if (!hasSupabaseAuthCookies(request)) {
    if (isSellerPath(path) || isBecomeSellerPath(path)) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", path);
      return NextResponse.redirect(loginUrl);
    }

    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name) {
        return request.cookies.get(name)?.value;
      },
      set(name, value, options) {
        request.cookies.set({
          name,
          value,
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value,
          ...options,
        });
      },
      remove(name, options) {
        request.cookies.set({
          name,
          value: "",
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value: "",
          ...options,
        });
      },
    },
  });

  try {
    const { data: claimsData, error } = await supabase.auth.getClaims();
    const authUserId = claimsData?.claims?.sub ?? null;
    const isAuthenticated = Boolean(authUserId && !error);

    if (!isAuthenticated) {
      if (isSellerPath(path) || isBecomeSellerPath(path)) {
        const loginUrl = new URL("/auth/login", request.url);
        loginUrl.searchParams.set("redirect", path);
        return NextResponse.redirect(loginUrl);
      }

      return response;
    }

    if (!authUserId) {
      return response;
    }

    const { data: userRow } = await supabase
      .from("users")
      .select("id, auth_id, role, is_blocked")
      .or(`id.eq.${authUserId},auth_id.eq.${authUserId}`)
      .maybeSingle();

    if (!userRow || userRow.is_blocked) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    const isAdmin = userRow.role === "admin";

    if (isAdmin) {
      if (
        isRootPath(path) ||
        isAuthPath(path) ||
        isSellerPath(path) ||
        isBecomeSellerPath(path)
      ) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }

      return response;
    }

    if (isRootPath(path) || isAuthPath(path)) {
      return NextResponse.redirect(new URL("/vendeur", request.url));
    }

    if (isSellerPath(path)) {
      const sellerStatus = await getSellerStatus(supabase, authUserId);

      if (sellerStatus !== "approved") {
        const becomeSellerUrl = new URL("/devenir-vendeur", request.url);
        becomeSellerUrl.searchParams.set("redirect", path);
        return NextResponse.redirect(becomeSellerUrl);
      }
    }

    if (isBecomeSellerPath(path)) {
      const sellerStatus = await getSellerStatus(supabase, authUserId);

      if (sellerStatus === "approved") {
        return NextResponse.redirect(new URL("/vendeur", request.url));
      }
    }

    return response;
  } catch (error) {
    console.error("[middleware] Supabase auth check failed, allowing request:", error);
    return response;
  }
}

export const config = {
  matcher: ["/", "/auth/login", "/auth/signup", "/vendeur", "/vendeur/:path*", "/devenir-vendeur"],
};
