"use client";
import dynamic from "next/dynamic";

const ValuationReport = dynamic(
  () => import("@/features/inventory/components/ValuationReport").then((m) => m.ValuationReport),
  { ssr: false },
);

export default function ValuationReportPage() {
  return <ValuationReport />;
}
