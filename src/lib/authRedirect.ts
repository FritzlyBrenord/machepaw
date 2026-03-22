import type { UserRole } from "@/data/types";

export type AuthAccountLike = {
  role?: UserRole | string | null;
  isBlocked?: boolean | null;
  seller?: {
    status?: string | null;
  } | null;
};

function getRedirectPath(value: string) {
  return value.split(/[?#]/)[0] || "/";
}

export function sanitizeAuthRedirect(
  value: string | null | undefined,
  fallback = "/",
) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return fallback;
  }

  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }

  return trimmed;
}

export function isSellerFlowRedirect(value: string) {
  const pathname = getRedirectPath(value);
  return pathname === "/vendeur" || pathname.startsWith("/vendeur/");
}

export function resolvePostAuthRedirect(
  account: AuthAccountLike | null | undefined,
  requestedRedirect: string,
) {
  const redirect = sanitizeAuthRedirect(requestedRedirect, "/");
  const path = getRedirectPath(redirect);
  const isBlocked = Boolean(account?.isBlocked);
  const role = account?.role;
  const sellerStatus = account?.seller?.status ?? null;

  if (role === "admin") {
    return path.startsWith("/admin") ? redirect : "/admin";
  }

  if (path === "/") {
    return "/vendeur";
  }

  if (isSellerFlowRedirect(redirect)) {
    if (isBlocked) {
      return redirect;
    }

    if (role === "seller" && sellerStatus === "approved") {
      return redirect;
    }

    return `/devenir-vendeur?redirect=${encodeURIComponent(redirect)}`;
  }

  return redirect;
}
