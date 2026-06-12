"use client";

import { use } from "react";
import { PaymentDetail } from "@/features/finance/components/PaymentDetail";

export default function PaymentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <PaymentDetail paymentId={id} />;
}
