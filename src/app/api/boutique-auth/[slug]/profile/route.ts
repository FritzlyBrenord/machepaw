import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/serverSupabase";
import { getBoutiqueClientSession } from "@/lib/boutiqueClientAuth";

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
  const phone = String(body.phone || "").trim();
  const avatar = typeof body.avatar === "string" ? body.avatar : undefined;

  if (!firstName || !lastName) {
    return NextResponse.json(
      { error: "Prenom et nom sont requis." },
      { status: 400 },
    );
  }

  const supabase = createServerSupabaseClient();

  const { error: userError } = await supabase
    .from("users")
    .update({
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
