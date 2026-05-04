"use client";
import dynamic from "next/dynamic";

const ProductionList = dynamic(
  () => import("@/features/inventory/components/ProductionList").then((m) => m.ProductionList),
  { ssr: false },
);

export default function ProductionPage() {
  return <ProductionList />;
}
