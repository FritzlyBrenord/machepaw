import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/serverSupabase";
import {
  createBoutiqueClientSessionRecord,
  getRequestClientMetadata,
  getLegacyBoutiqueSessionCookieName,
  getLegacyBoutiqueSessionCookieOptions,
  getBoutiqueSessionCookieName,
  getBoutiqueSessionCookieOptions,
  hashBoutiqueClientPassword,
  normalizeBoutiqueClientEmail,
  resolveBoutiqueStore,
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
  const firstName = String(body.firstName || "").trim();
  const lastName = String(body.lastName || "").trim();
  const email = normalizeBoutiqueClientEmail(String(body.email || ""));
  const phone = String(body.phone || "").trim();
  const password = String(body.password || "");

  if (!firstName || !lastName || !email || password.length < 6) {
    return NextResponse.json(
      { error: "Prenom, nom, email et mot de passe valide sont requis." },
      { status: 400 },
    );
  }

  const supabase = createServerSupabaseClient();

  const { data: existingUser, error: userLookupError } = await supabase
    .from("users")
    .select("id,email,is_blocked")
    .eq("email", email)
    .maybeSingle();

  if (userLookupError) {
    return NextResponse.json({ error: userLookupError.message }, { status: 500 });
  }

  if (existingUser?.is_blocked) {
    return NextResponse.json(
      { error: "Ce client est actuellement bloque." },
      { status: 403 },
    );
  }

  let userId = existingUser?.id;

  if (!userId) {
    const { data: insertedUser, error: insertUserError } = await supabase
      .from("users")
      .insert({
        email,
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
        role: "customer",
      })
      .select("id")
      .single();

    if (insertUserError || !insertedUser) {
      return NextResponse.json(
        { error: insertUserError?.message || "Creation du client impossible." },
        { status: 500 },
      );
    }

    userId = insertedUser.id;
  }

  const { data: existingCustomer, error: existingCustomerError } = await supabase
    .from("boutique_customers")
    .select("id,password_hash,status")
    .eq("seller_id", store.id)
    .eq("user_id", userId)
    .maybeSingle();

  if (existingCustomerError) {
    return NextResponse.json({ error: existingCustomerError.message }, { status: 500 });
  }

  if (existingCustomer) {
    if (existingCustomer.status === "blocked") {
      return NextResponse.json(
        { error: "Ce client est actuellement bloque." },
        { status: 403 },
      );
    }

    if (existingCustomer.password_hash) {
      return NextResponse.json(
        { error: "Ce client existe deja dans cette boutique. Connectez-vous." },
        { status: 409 },
      );
    }

    const { error: userUpdateError } = await supabase
      .from("users")
      .update({
        email,
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (userUpdateError) {
      return NextResponse.json(
        { error: userUpdateError.message },
        { status: 500 },
      );
    }

    const { data: activatedCustomer, error: activateCustomerError } = await supabase
      .from("boutique_customers")
      .update({
        email,
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
        password_hash: hashBoutiqueClientPassword(password),
        status: "active",
        last_login_at: new Date().toISOString(),
      })
      .eq("id", existingCustomer.id)
      .select("id")
      .single();

    if (activateCustomerError || !activatedCustomer) {
      return NextResponse.json(
        { error: activateCustomerError?.message || "Inscription boutique impossible." },
        { status: 500 },
      );
    }

    const metadata = await getRequestClientMetadata();
    const sessionRecord = await createBoutiqueClientSessionRecord({
      slug,
      sellerId: store.id,
      boutiqueCustomerId: activatedCustomer.id,
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

  const { data: customer, error: insertCustomerError } = await supabase
    .from("boutique_customers")
    .insert({
      seller_id: store.id,
      user_id: userId,
      status: "active",
      email,
      first_name: firstName,
      last_name: lastName,
      phone: phone || null,
      password_hash: hashBoutiqueClientPassword(password),
      last_login_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (insertCustomerError || !customer) {
    return NextResponse.json(
      { error: insertCustomerError?.message || "Inscription boutique impossible." },
      { status: 500 },
    );
  }

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
