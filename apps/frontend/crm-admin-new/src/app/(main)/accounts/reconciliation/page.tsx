"use client";
import dynamic from "next/dynamic";
const BankReconciliation = dynamic(
  () => import("@/features/accounts/components/BankReconciliation").then((m) => m.BankReconciliation),
  { ssr: false },
);
export default function ReconciliationPage() {
  return <BankReconciliation />;
}
