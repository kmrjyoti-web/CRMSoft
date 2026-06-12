"use client";
import dynamic from "next/dynamic";
const LedgerMappingList = dynamic(
  () => import("@/features/accounts/components/LedgerMappingList").then((m) => m.LedgerMappingList),
  { ssr: false }
);
export default function LedgerMappingsPage() {
  return <LedgerMappingList />;
}
