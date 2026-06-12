"use client";
import dynamic from "next/dynamic";
const AccountsDashboard = dynamic(
  () => import("@/features/accounts/components/AccountsDashboard").then((m) => m.AccountsDashboard),
  { ssr: false },
);
export default function TransactionDashboardPage() {
  return <AccountsDashboard />;
}
