"use client";
import dynamic from "next/dynamic";
const DeliveryChallanForm = dynamic(
  () => import("@/features/sales/components/DeliveryChallanForm").then((m) => m.DeliveryChallanForm),
  { ssr: false },
);
export default function NewDeliveryChallanPage() {
  return <DeliveryChallanForm />;
}
