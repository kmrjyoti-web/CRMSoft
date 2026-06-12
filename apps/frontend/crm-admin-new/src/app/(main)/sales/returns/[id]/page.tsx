"use client";
import dynamic from "next/dynamic";
const SaleReturnDetail = dynamic(
  () => import("@/features/sales/components/SaleReturnDetail").then((m) => m.SaleReturnDetail),
  { ssr: false },
);
export default function SaleReturnDetailPage({ params }: { params: { id: string } }) {
  return <SaleReturnDetail id={params.id} />;
}
