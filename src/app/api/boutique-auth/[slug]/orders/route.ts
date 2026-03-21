import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/serverSupabase";
import { getBoutiqueClientSession } from "@/lib/boutiqueClientAuth";
import { mapBoutiqueOrderRow } from "@/lib/boutiqueClientData";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const session = await getBoutiqueClientSession(slug);

  if (!session) {
    return NextResponse.json({ error: "Non autorise." }, { status: 401 });
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("order_details")
    .select("*")
    .eq("user_id", session.customer.userId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    orders: (data || [])
      .map((row) => mapBoutiqueOrderRow(row))
      .filter((order) =>
        order.items.some(
          (item) =>
            item.sellerId === session.store.id ||
            item.product?.sellerId === session.store.id,
        ),
      ),
  });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const session = await getBoutiqueClientSession(slug);

  if (!session) {
    return NextResponse.json({ error: "Non autorise." }, { status: 401 });
  }

  if (session.customer.status !== "active") {
    return NextResponse.json(
      { error: "Votre compte client boutique n'est pas actif." },
      { status: 403 },
    );
  }

  const body = await request.json();
  const items = Array.isArray(body.items) ? body.items : [];
  const shippingAddress = body.shippingAddress;

  if (!shippingAddress || items.length === 0) {
    return NextResponse.json(
      { error: "Commande boutique incomplete." },
      { status: 400 },
    );
  }

  const rpcItems = items.map((item: { productId?: string; quantity?: number }) => ({
    product_id: item.productId,
    quantity: item.quantity,
  }));
  const fulfillmentMethod = body.fulfillmentMethod || body.deliveryMode || null;
  const paymentMethod =
    body.paymentMethod || (fulfillmentMethod === "pickup" ? "store_pickup" : null);

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.rpc("create_boutique_order", {
    p_user_id: session.customer.userId,
    p_seller_id: session.store.id,
    p_boutique_customer_id: session.customer.id,
    p_shipping_address: shippingAddress,
    p_items: rpcItems,
    p_shipping_amount: body.shippingAmount || 0,
    p_fulfillment_method: fulfillmentMethod,
    p_tax_amount: body.taxAmount || 0,
    p_payment_method: paymentMethod,
    p_payment_id: body.paymentId || null,
    p_payment_proof_path: body.paymentProofUrl || null,
    p_notes: body.notes || null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const result = Array.isArray(data) ? data[0] : data;
  return NextResponse.json({ order: result || null });
}
