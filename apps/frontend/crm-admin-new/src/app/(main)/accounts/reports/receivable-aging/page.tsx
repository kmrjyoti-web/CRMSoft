"use client";
import dynamic from "next/dynamic";
const ReceivableAgingReport = dynamic(
  () => import("@/features/accounts/components/AgingReport").then((m) => m.ReceivableAgingReport),
  { ssr: false },
);
export default function ReceivableAgingPage() {
  return <ReceivableAgingReport />;
}
