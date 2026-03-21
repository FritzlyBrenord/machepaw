"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function SellerProductIdPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  useEffect(() => {
    if (productId) {
      router.replace(`/vendeur/produits/${productId}/edit`);
    }
  }, [productId, router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
    </div>
  );
}
