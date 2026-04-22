"use client";
import dynamic from "next/dynamic";
const SaleReturnForm = dynamic(
  () => import("@/features/sales/components/SaleReturnDetail").then((m) => m.SaleReturnDetail),
  { ssr: false },
);
export default function NewSaleReturnPage() {
  return <div className="p-6"><h1 className="text-2xl font-bold">Create Sale Return</h1><p className="text-gray-500 mt-2">Use the Sale Returns list to create a new return.</p></div>;
}
