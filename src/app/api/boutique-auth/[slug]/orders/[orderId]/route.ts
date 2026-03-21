import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/serverSupabase";
import { getBoutiqueClientSession } from "@/lib/boutiqueClientAuth";
import { mapBoutiqueOrderRow } from "@/lib/boutiqueClientData";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string; orderId: string }> },
) {
  const { slug, orderId } = await context.params;
  const session = await getBoutiqueClientSession(slug);

  if (!session) {
    return NextResponse.json({ error: "Non autorise." }, { status: 401 });
  }

  const supabase = createServerSupabaseClient();
  const byNumber = await supabase
    .from("order_details")
    .select("*")
    .eq("user_id", session.customer.userId)
    .eq("order_number", orderId)
    .maybeSingle();

  if (byNumber.error) {
    return NextResponse.json({ error: byNumber.error.message }, { status: 500 });
  }

  let data = byNumber.data;

  if (!data) {
    const byId = await supabase
      .from("order_details")
      .select("*")
      .eq("user_id", session.customer.userId)
      .eq("id", orderId)
      .maybeSingle();

    if (byId.error) {
      return NextResponse.json({ error: byId.error.message }, { status: 500 });
    }

    data = byId.data;
  }

  if (!data) {
    return NextResponse.json({ order: null }, { status: 404 });
  }

  const order = mapBoutiqueOrderRow(data);
  const belongsToStore = order.items.some(
    (item) =>
      item.sellerId === session.store.id ||
      item.product?.sellerId === session.store.id,
  );

  if (!belongsToStore) {
    return NextResponse.json({ order: null }, { status: 404 });
  }

  return NextResponse.json({ order });
}
