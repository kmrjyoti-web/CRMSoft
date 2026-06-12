"use client";
import dynamic from "next/dynamic";
const DeliveryChallanList = dynamic(
  () => import("@/features/sales/components/DeliveryChallanList").then((m) => m.DeliveryChallanList),
  { ssr: false },
);
export default function DeliveryChallansPage() {
  return <DeliveryChallanList />;
}
