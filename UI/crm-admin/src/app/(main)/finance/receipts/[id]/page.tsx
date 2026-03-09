"use client";

import { useRouter } from "next/navigation";
import { ReceiptView } from "@/features/receipts/components/ReceiptView";

export default function ReceiptDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  return <ReceiptView receiptId={params.id} onClose={() => router.push("/finance/receipts")} />;
}
