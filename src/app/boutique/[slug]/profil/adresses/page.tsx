import { redirect } from "next/navigation";

export default async function BoutiqueProfileAddressesRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/boutique/${slug}/profil`);
}
