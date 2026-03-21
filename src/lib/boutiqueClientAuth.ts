import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies, headers } from "next/headers";
import type { BoutiqueStoreRecord } from "@/lib/boutiqueStorefront";
import { getApprovedSellerBySlug } from "@/lib/boutiqueStorefront";
import { createServerSupabaseClient } from "@/lib/serverSupabase";

const BOUTIQUE_SESSION_DAYS = 30;
const COOKIE_PREFIX = "boutique_session_v2_";
const LEGACY_COOKIE_PREFIX = "boutique_session_";

type BoutiqueCustomerRow = {
  id: string;
  seller_id: string;
  user_id: string;
  status: "active" | "blocked";
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  created_at: string;
  updated_at: string;
  last_login_at?: string | null;
};

type UserRow = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  avatar?: string | null;
  is_blocked?: boolean | null;
};

export type BoutiqueClientSession = {
  store: BoutiqueStoreRecord;
  customer: {
    id: string;
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    avatar?: string;
    status: "active" | "blocked";
    createdAt: string;
    updatedAt: string;
    lastLoginAt?: string;
  };
};

function sanitizeSlug(slug: string) {
  return slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "_");
}

export function normalizeBoutiqueClientEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getBoutiqueSessionCookieName(slug: string) {
  return `${COOKIE_PREFIX}${sanitizeSlug(slug)}`.slice(0, 120);
}

export function getLegacyBoutiqueSessionCookieName(slug: string) {
  return `${LEGACY_COOKIE_PREFIX}${sanitizeSlug(slug)}`.slice(0, 120);
}

export function hashBoutiqueClientPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${derivedKey}`;
}

export function verifyBoutiqueClientPassword(password: string, storedHash: string) {
  const [algorithm, salt, savedKey] = storedHash.split(":");

  if (algorithm !== "scrypt" || !salt || !savedKey) {
    return false;
  }

  const derivedKey = scryptSync(password, salt, 64);
  const savedBuffer = Buffer.from(savedKey, "hex");

  if (savedBuffer.length !== derivedKey.length) {
    return false;
  }

  return timingSafeEqual(savedBuffer, derivedKey);
}

export function hashBoutiqueSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function generateBoutiqueSessionToken() {
  return randomBytes(48).toString("hex");
}

export function getBoutiqueSessionExpiryDate() {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + BOUTIQUE_SESSION_DAYS);
  return expiry;
}

export function getBoutiqueSessionCookieOptions(slug: string, expiresAt: Date) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    // The session must be readable by both boutique pages and boutique auth APIs.
    path: "/",
    expires: expiresAt,
  };
}

export function getLegacyBoutiqueSessionCookieOptions(slug: string, expiresAt: Date) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: `/boutique/${slug}`,
    expires: expiresAt,
  };
}

export async function resolveBoutiqueStore(slug: string) {
  return getApprovedSellerBySlug(slug);
}

export async function getRequestClientMetadata() {
  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() || null;
  const userAgent = headerStore.get("user-agent");

  return { ipAddress: ip, userAgent };
}

function mapBoutiqueSession(store: BoutiqueStoreRecord, customer: BoutiqueCustomerRow, user: UserRow) {
  return {
    store,
    customer: {
      id: customer.id,
      userId: customer.user_id,
      email: customer.email,
      firstName: user.first_name || customer.first_name,
      lastName: user.last_name || customer.last_name,
      phone: user.phone || customer.phone || undefined,
      avatar: user.avatar || undefined,
      status: customer.status,
      createdAt: customer.created_at,
      updatedAt: customer.updated_at,
      lastLoginAt: customer.last_login_at || undefined,
    },
  };
}

export async function getBoutiqueClientSession(slug: string): Promise<BoutiqueClientSession | null> {
  const store = await resolveBoutiqueStore(slug);

  if (!store) {
    return null;
  }

  const cookieStore = await cookies();
  const rawToken = cookieStore.get(getBoutiqueSessionCookieName(slug))?.value;

  if (!rawToken) {
    return null;
  }

  const tokenHash = hashBoutiqueSessionToken(rawToken);
  const supabase = createServerSupabaseClient();

  const { data: sessionRow, error: sessionError } = await supabase
    .from("boutique_customer_sessions")
    .select("id,boutique_customer_id,seller_id,expires_at,revoked_at")
    .eq("session_token_hash", tokenHash)
    .eq("seller_id", store.id)
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (sessionError || !sessionRow) {
    return null;
  }

  const { data: customer, error: customerError } = await supabase
    .from("boutique_customers")
    .select("id,seller_id,user_id,status,email,first_name,last_name,phone,created_at,updated_at,last_login_at")
    .eq("id", sessionRow.boutique_customer_id)
    .eq("seller_id", store.id)
    .maybeSingle();

  if (customerError || !customer) {
    return null;
  }

  const { data: user } = await supabase
    .from("users")
    .select("id,email,first_name,last_name,phone,avatar,is_blocked")
    .eq("id", customer.user_id)
    .maybeSingle();

  const resolvedUser: UserRow = user || {
    id: customer.user_id,
    email: customer.email,
    first_name: customer.first_name,
    last_name: customer.last_name,
    phone: customer.phone,
    avatar: null,
    is_blocked: null,
  };

  await supabase
    .from("boutique_customer_sessions")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", sessionRow.id);

  return mapBoutiqueSession(
    store,
    customer as BoutiqueCustomerRow,
    resolvedUser,
  );
}

export async function createBoutiqueClientSessionRecord(input: {
  slug: string;
  sellerId: string;
  boutiqueCustomerId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const supabase = createServerSupabaseClient();
  const rawToken = generateBoutiqueSessionToken();
  const expiresAt = getBoutiqueSessionExpiryDate();

  const { error } = await supabase
    .from("boutique_customer_sessions")
    .insert({
      boutique_customer_id: input.boutiqueCustomerId,
      seller_id: input.sellerId,
      session_token_hash: hashBoutiqueSessionToken(rawToken),
      ip_address: input.ipAddress || null,
      user_agent: input.userAgent || null,
      expires_at: expiresAt.toISOString(),
    });

  if (error) {
    throw error;
  }

  return {
    token: rawToken,
    expiresAt,
    cookieName: getBoutiqueSessionCookieName(input.slug),
    cookieOptions: getBoutiqueSessionCookieOptions(input.slug, expiresAt),
  };
}

export async function revokeBoutiqueClientSession(slug: string, rawToken?: string | null) {
  if (!rawToken) {
    return;
  }

  const store = await resolveBoutiqueStore(slug);

  if (!store) {
    return;
  }

  const supabase = createServerSupabaseClient();

  await supabase
    .from("boutique_customer_sessions")
    .update({ revoked_at: new Date().toISOString() })
    .eq("seller_id", store.id)
    .eq("session_token_hash", hashBoutiqueSessionToken(rawToken))
    .is("revoked_at", null);
}
