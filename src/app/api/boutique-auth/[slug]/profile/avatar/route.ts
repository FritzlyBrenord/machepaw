import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/serverSupabase";
import { getBoutiqueClientSession } from "@/lib/boutiqueClientAuth";

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const session = await getBoutiqueClientSession(slug);

  if (!session) {
    return NextResponse.json({ error: "Non autorise." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Fichier manquant." }, { status: 400 });
  }

  const extension = file.name.split(".").pop() || "jpg";
  const filePath = `boutique-clients/${session.customer.id}/avatar-${Date.now()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const supabase = createServerSupabaseClient();

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, buffer, {
      contentType: file.type || "image/jpeg",
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const avatarUrl = supabase.storage.from("avatars").getPublicUrl(filePath).data.publicUrl;

  const { error: userError } = await supabase
    .from("users")
    .update({ avatar: avatarUrl, updated_at: new Date().toISOString() })
    .eq("id", session.customer.userId);

  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }

  return NextResponse.json({ avatarUrl });
}
