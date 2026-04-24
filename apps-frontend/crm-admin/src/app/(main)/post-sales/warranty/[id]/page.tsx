"use client";

import { WarrantyDetail } from "@/features/amc-warranty/components/WarrantyDetail";

export default function WarrantyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <WarrantyDetail warrantyId={params.id} />;
}
