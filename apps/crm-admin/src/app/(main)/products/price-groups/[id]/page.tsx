"use client";

import { PriceGroupMembers } from "@/features/price-groups/components/PriceGroupMembers";

export default function PriceGroupDetailPage({ params }: { params: { id: string } }) {
  return <PriceGroupMembers groupId={params.id} />;
}
