"use client";
import dynamic from "next/dynamic";

const ExpiryReport = dynamic(
  () => import("@/features/inventory/components/ExpiryReport").then((m) => m.ExpiryReport),
  { ssr: false },
);

export default function ExpiryReportPage() {
  return <ExpiryReport />;
}
