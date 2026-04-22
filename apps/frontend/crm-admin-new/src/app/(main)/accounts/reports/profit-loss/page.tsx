"use client";
import dynamic from "next/dynamic";
const ProfitLossReport = dynamic(
  () => import("@/features/accounts/components/ProfitLossReport").then((m) => m.ProfitLossReport),
  { ssr: false },
);
export default function ProfitLossPage() {
  return <ProfitLossReport />;
}
