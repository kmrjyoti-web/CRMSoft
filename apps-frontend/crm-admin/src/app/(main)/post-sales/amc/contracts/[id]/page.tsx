"use client";

import { AMCContractDetail } from "@/features/amc-warranty/components/AMCContractDetail";

export default function AMCContractDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <AMCContractDetail contractId={params.id} />;
}
