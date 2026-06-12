"use client";
import dynamic from "next/dynamic";
const DeliveryChallanDetail = dynamic(
  () => import("@/features/sales/components/DeliveryChallanDetail").then((m) => m.DeliveryChallanDetail),
  { ssr: false },
);
export default function DeliveryChallanDetailPage({ params }: { params: { id: string } }) {
  return <DeliveryChallanDetail id={params.id} />;
}
