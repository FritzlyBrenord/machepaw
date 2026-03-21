"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";

export default function ProductIdPage() {
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      router.replace(`/admin/produits/${id}/edit`);
    }
  }, [id, router]);

  return (
    <AdminLayout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    </AdminLayout>
  );
}
