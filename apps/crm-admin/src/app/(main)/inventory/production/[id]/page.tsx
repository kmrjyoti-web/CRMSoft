"use client";
import dynamic from "next/dynamic";

const ProductionDetail = dynamic(
  () => import("@/features/inventory/components/ProductionDetail").then((m) => m.ProductionDetail),
  { ssr: false },
);

export default function ProductionDetailPage({ params }: { params: { id: string } }) {
  return <ProductionDetail id={params.id} />;
}
