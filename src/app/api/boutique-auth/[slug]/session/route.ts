import { NextResponse } from "next/server";
import { getBoutiqueClientSession } from "@/lib/boutiqueClientAuth";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const session = await getBoutiqueClientSession(slug);

  return NextResponse.json({ session });
}
