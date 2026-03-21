import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/serverSupabase";
import { resolveBoutiqueStore } from "@/lib/boutiqueClientAuth";
import {
  SELLER_PAYMENT_METHODS,
  findSellerPaymentMethodDefinition,
  type SellerPaymentMethodView,
} from "@/data/paymentMethods";

type SellerPaymentMethodRow = {
  method_code: string;
  is_active: boolean;
  merchant_first_name?: string | null;
  merchant_last_name?: string | null;
  merchant_agent_code?: string | null;
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const store = await resolveBoutiqueStore(slug);

  if (!store) {
    return NextResponse.json({ error: "Boutique introuvable." }, { status: 404 });
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("seller_payment_methods")
    .select(
      "method_code,is_active,merchant_first_name,merchant_last_name,merchant_agent_code",
    )
    .eq("seller_id", store.id)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rowsByCode = new Map(
    ((data || []) as SellerPaymentMethodRow[]).map((row) => [row.method_code, row]),
  );

  const methods = SELLER_PAYMENT_METHODS.map((definition) => {
    const row = rowsByCode.get(definition.code);

    if (!row) {
      return null;
    }

    const resolvedDefinition = findSellerPaymentMethodDefinition(definition.code);

    if (!resolvedDefinition) {
      return null;
    }

    const view: SellerPaymentMethodView = {
      ...resolvedDefinition,
      isActive: Boolean(row.is_active),
      merchantFirstName: row.merchant_first_name || undefined,
      merchantLastName: row.merchant_last_name || undefined,
      merchantAgentCode: row.merchant_agent_code || undefined,
    };

    return view;
  }).filter((method): method is SellerPaymentMethodView => Boolean(method));

  return NextResponse.json({ methods });
}
