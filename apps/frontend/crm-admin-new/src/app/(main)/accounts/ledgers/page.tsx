"use client";
import dynamic from "next/dynamic";
const ChartOfAccounts = dynamic(
  () => import("@/features/accounts/components/ChartOfAccounts").then((m) => m.ChartOfAccounts),
  { ssr: false },
);
export default function ChartOfAccountsPage() {
  return <ChartOfAccounts />;
}
