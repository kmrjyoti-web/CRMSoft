"use client";
import dynamic from "next/dynamic";
const CashFlowReport = dynamic(
  () => import("@/features/accounts/components/CashFlowReport").then((m) => m.CashFlowReport),
  { ssr: false },
);
export default function CashFlowPage() {
  return <CashFlowReport />;
}
