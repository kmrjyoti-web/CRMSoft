"use client";
import dynamic from "next/dynamic";
const PaymentForm = dynamic(
  () => import("@/features/accounts/components/PaymentForm").then((m) => m.PaymentForm),
  { ssr: false },
);
export default function NewPaymentPage() {
  return <PaymentForm />;
}
