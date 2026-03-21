import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/serverSupabase";
import {
  createBoutiqueClientSessionRecord,
  getRequestClientMetadata,
  getLegacyBoutiqueSessionCookieName,
  getLegacyBoutiqueSessionCookieOptions,
  getBoutiqueSessionCookieOptions,
  normalizeBoutiqueClientEmail,
  resolveBoutiqueStore,
  verifyBoutiqueClientPassword,
} from "@/lib/boutiqueClientAuth";

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const store = await resolveBoutiqueStore(slug);

  if (!store) {
    return NextResponse.json({ error: "Boutique introuvable." }, { status: 404 });
  }

  const body = await request.json();
  const email = normalizeBoutiqueClientEmail(String(body.email || ""));
  const password = String(body.password || "");

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email et mot de passe sont requis." },
      { status: 400 },
    );
  }

  const supabase = createServerSupabaseClient();
  const { data: customer, error } = await supabase
    .from("boutique_customers")
    .select("id,seller_id,user_id,status,email,password_hash")
    .eq("seller_id", store.id)
    .eq("email", email)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!customer || !customer.password_hash) {
    if (customer && !customer.password_hash) {
      return NextResponse.json(
        {
          error:
            "Ce compte client boutique existe deja, mais il n'est pas encore active. Inscrivez-vous pour definir un mot de passe.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Compte client boutique introuvable." },
      { status: 404 },
    );
  }

  if (customer.status === "blocked") {
    return NextResponse.json(
      { error: "Votre compte client pour cette boutique est bloque." },
      { status: 403 },
    );
  }

  if (!verifyBoutiqueClientPassword(password, customer.password_hash)) {
    return NextResponse.json(
      { error: "Mot de passe incorrect." },
      { status: 401 },
    );
  }

  await supabase
    .from("boutique_customers")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", customer.id);

  const metadata = await getRequestClientMetadata();
  const sessionRecord = await createBoutiqueClientSessionRecord({
    slug,
    sellerId: store.id,
    boutiqueCustomerId: customer.id,
    ipAddress: metadata.ipAddress,
    userAgent: metadata.userAgent,
  });

  const response = NextResponse.json({ success: true });
  response.cookies.set(
    sessionRecord.cookieName,
    sessionRecord.token,
    getBoutiqueSessionCookieOptions(slug, sessionRecord.expiresAt),
  );
  response.cookies.set(
    getLegacyBoutiqueSessionCookieName(slug),
    "",
    getLegacyBoutiqueSessionCookieOptions(slug, new Date(0)),
  );

  return response;
}
