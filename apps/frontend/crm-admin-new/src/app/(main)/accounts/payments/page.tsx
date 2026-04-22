"use client";
import dynamic from "next/dynamic";
const PaymentList = dynamic(
  () => import("@/features/accounts/components/PaymentList").then((m) => m.PaymentList),
  { ssr: false },
);
export default function PaymentsPage() {
  return <PaymentList />;
}
