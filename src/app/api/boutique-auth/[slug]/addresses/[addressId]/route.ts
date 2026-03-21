import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/serverSupabase";
import { mapBoutiqueAddressRow } from "@/lib/boutiqueClientData";
import { getBoutiqueClientSession } from "@/lib/boutiqueClientAuth";

async function clearDefaultAddresses(
  customerId: string,
  sellerId: string,
  keepId?: string,
) {
  const supabase = createServerSupabaseClient();
  let query = supabase
    .from("boutique_customer_addresses")
    .update({ is_default: false })
    .eq("boutique_customer_id", customerId)
    .eq("seller_id", sellerId)
    .eq("is_default", true);

  if (keepId) {
    query = query.neq("id", keepId);
  }

  await query;
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ slug: string; addressId: string }> },
) {
  const { slug, addressId } = await context.params;
  const session = await getBoutiqueClientSession(slug);

  if (!session) {
    return NextResponse.json({ error: "Non autorise." }, { status: 401 });
  }

  const body = await request.json();
  const payload = {
    label: body.label || "Domicile",
    first_name: body.firstName || "",
    last_name: body.lastName || "",
    address: body.address || "",
    apartment: body.apartment || null,
    department: body.department || null,
    arrondissement: body.arrondissement || null,
    commune: body.commune || null,
    communal_section: body.communalSection || null,
    city: body.country === "Haiti" ? body.commune || body.city || "" : body.city || "",
    postal_code: body.postalCode || "",
    country: body.country || "Haiti",
    phone: body.phone || "",
    latitude: body.latitude || null,
    longitude: body.longitude || null,
    is_default: Boolean(body.isDefault),
  };

  if (payload.is_default) {
    await clearDefaultAddresses(session.customer.id, session.store.id, addressId);
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("boutique_customer_addresses")
    .update(payload)
    .eq("id", addressId)
    .eq("boutique_customer_id", session.customer.id)
    .eq("seller_id", session.store.id)
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message || "Mise a jour impossible." },
      { status: 500 },
    );
  }

  return NextResponse.json({ address: mapBoutiqueAddressRow(data as never) });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ slug: string; addressId: string }> },
) {
  const { slug, addressId } = await context.params;
  const session = await getBoutiqueClientSession(slug);

  if (!session) {
    return NextResponse.json({ error: "Non autorise." }, { status: 401 });
  }

  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("boutique_customer_addresses")
    .delete()
    .eq("id", addressId)
    .eq("boutique_customer_id", session.customer.id)
    .eq("seller_id", session.store.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
