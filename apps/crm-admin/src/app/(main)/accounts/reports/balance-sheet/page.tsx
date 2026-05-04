"use client";
import dynamic from "next/dynamic";
const BalanceSheetReport = dynamic(
  () => import("@/features/accounts/components/BalanceSheetReport").then((m) => m.BalanceSheetReport),
  { ssr: false },
);
export default function BalanceSheetPage() {
  return <BalanceSheetReport />;
}
