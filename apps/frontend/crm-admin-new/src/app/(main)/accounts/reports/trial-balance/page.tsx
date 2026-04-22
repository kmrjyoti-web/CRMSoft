"use client";
import dynamic from "next/dynamic";
const TrialBalanceReport = dynamic(
  () => import("@/features/accounts/components/TrialBalanceReport").then((m) => m.TrialBalanceReport),
  { ssr: false },
);
export default function TrialBalancePage() {
  return <TrialBalanceReport />;
}
