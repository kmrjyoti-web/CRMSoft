"use client";
import dynamic from "next/dynamic";
const SaleReturnList = dynamic(
  () => import("@/features/sales/components/SaleReturnList").then((m) => m.SaleReturnList),
  { ssr: false },
);
export default function SaleReturnsPage() {
  return <SaleReturnList />;
}
