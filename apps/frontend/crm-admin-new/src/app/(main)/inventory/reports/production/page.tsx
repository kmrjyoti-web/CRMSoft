"use client";
import dynamic from "next/dynamic";

const ProductionReportPage = dynamic(
  () => import("@/features/inventory/components/ProductionReportPage").then((m) => m.ProductionReportPage),
  { ssr: false },
);

export default function ProductionReportsPage() {
  return <ProductionReportPage />;
}
