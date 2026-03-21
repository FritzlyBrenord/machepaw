import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getLegacyBoutiqueSessionCookieName,
  getLegacyBoutiqueSessionCookieOptions,
  getBoutiqueSessionCookieName,
  getBoutiqueSessionCookieOptions,
  revokeBoutiqueClientSession,
} from "@/lib/boutiqueClientAuth";

export async function POST(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const cookieStore = await cookies();
  const cookieName = getBoutiqueSessionCookieName(slug);
  const rawToken = cookieStore.get(cookieName)?.value;

  await revokeBoutiqueClientSession(slug, rawToken);

  const response = NextResponse.json({ success: true });
  response.cookies.set(cookieName, "", getBoutiqueSessionCookieOptions(slug, new Date(0)));
  response.cookies.set(
    getLegacyBoutiqueSessionCookieName(slug),
    "",
    getLegacyBoutiqueSessionCookieOptions(slug, new Date(0)),
  );
  return response;
}
