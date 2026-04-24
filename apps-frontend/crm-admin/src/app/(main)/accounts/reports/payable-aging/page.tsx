"use client";
import dynamic from "next/dynamic";
const PayableAgingReport = dynamic(
  () => import("@/features/accounts/components/AgingReport").then((m) => m.PayableAgingReport),
  { ssr: false },
);
export default function PayableAgingPage() {
  return <PayableAgingReport />;
}
