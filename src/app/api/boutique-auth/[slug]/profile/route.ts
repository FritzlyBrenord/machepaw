import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/serverSupabase";
import {
  getBoutiqueClientSession,
  getBoutiqueSessionCookieName,
  getLegacyBoutiqueSessionCookieName,
  normalizeBoutiqueClientEmail,
} from "@/lib/boutiqueClientAuth";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const session = await getBoutiqueClientSession(slug);

  if (!session) {
    return NextResponse.json({ error: "Non autorise." }, { status: 401 });
  }

  return NextResponse.json({ profile: session.customer });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const session = await getBoutiqueClientSession(slug);

  if (!session) {
    return NextResponse.json({ error: "Non autorise." }, { status: 401 });
  }

  const body = await request.json();
  const firstName = String(body.firstName || "").trim();
  const lastName = String(body.lastName || "").trim();
  const email = normalizeBoutiqueClientEmail(String(body.email || ""));
  const phone = String(body.phone || "").trim();
  const avatar = typeof body.avatar === "string" ? body.avatar : undefined;

  if (!firstName || !lastName || !email) {
    return NextResponse.json(
      { error: "Prenom, nom et email sont requis." },
      { status: 400 },
    );
  }

  const supabase = createServerSupabaseClient();

  const { data: existingUser, error: existingUserError } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .neq("id", session.customer.userId)
    .maybeSingle();

  if (existingUserError) {
    return NextResponse.json({ error: existingUserError.message }, { status: 500 });
  }

  if (existingUser) {
    return NextResponse.json(
      { error: "Cet email est deja utilise par un autre compte." },
      { status: 409 },
    );
  }

  const { error: userError } = await supabase
    .from("users")
    .update({
      email,
      first_name: firstName,
      last_name: lastName,
      phone: phone || null,
      ...(avatar !== undefined ? { avatar: avatar || null } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", session.customer.userId);

  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }

  const { error: customerError } = await supabase
    .from("boutique_customers")
    .update({
      email,
      first_name: firstName,
      last_name: lastName,
      phone: phone || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", session.customer.id);

  if (customerError) {
    return NextResponse.json({ error: customerError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const session = await getBoutiqueClientSession(slug);

  if (!session) {
    return NextResponse.json({ error: "Non autorise." }, { status: 401 });
  }

  const supabase = createServerSupabaseClient();

  const { error: customerError } = await supabase
    .from("boutique_customers")
    .delete()
    .eq("id", session.customer.id);

  if (customerError) {
    return NextResponse.json({ error: customerError.message }, { status: 500 });
  }

  await supabase
    .from("boutique_customer_sessions")
    .update({ revoked_at: new Date().toISOString() })
    .eq("boutique_customer_id", session.customer.id)
    .is("revoked_at", null);

  const response = NextResponse.json({ success: true });
  response.cookies.delete(getBoutiqueSessionCookieName(slug));
  response.cookies.delete(getLegacyBoutiqueSessionCookieName(slug));
  return response;
}
