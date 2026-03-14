"use client";
import dynamic from "next/dynamic";
const PaymentDetail = dynamic(
  () => import("@/features/accounts/components/PaymentDetail").then((m) => m.PaymentDetail),
  { ssr: false },
);
export default function PaymentDetailPage({ params }: { params: { id: string } }) {
  return <PaymentDetail id={params.id} />;
}
