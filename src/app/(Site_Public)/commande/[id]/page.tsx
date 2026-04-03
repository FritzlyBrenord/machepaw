import { CurrentSellerProjectPage } from "@/components/CurrentSellerProjectPage";

interface CommandeDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CommandeDetailPage({ params }: CommandeDetailPageProps) {
  const resolvedParams = await params;

  return <CurrentSellerProjectPage path="/commande" orderId={resolvedParams.id} />;
}
