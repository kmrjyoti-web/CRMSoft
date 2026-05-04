"use client";

import { use } from "react";
import { ProformaDetail } from "@/features/finance/components/ProformaDetail";

export default function ProformaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <ProformaDetail proformaId={id} />;
}
