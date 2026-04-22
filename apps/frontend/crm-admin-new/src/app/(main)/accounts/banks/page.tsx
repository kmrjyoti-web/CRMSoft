"use client";
import dynamic from "next/dynamic";
const BankAccountList = dynamic(
  () => import("@/features/accounts/components/BankAccountList").then((m) => m.BankAccountList),
  { ssr: false },
);
export default function BankAccountsPage() {
  return <BankAccountList />;
}
