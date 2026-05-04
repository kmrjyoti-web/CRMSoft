"use client";
import dynamic from "next/dynamic";

const LedgerReport = dynamic(
  () => import("@/features/inventory/components/LedgerReport").then((m) => m.LedgerReport),
  { ssr: false },
);

export default function LedgerReportPage() {
  return <LedgerReport />;
}
