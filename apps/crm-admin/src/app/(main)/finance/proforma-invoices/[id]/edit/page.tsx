"use client";

import { use } from "react";
import { ProformaForm } from "@/features/finance/components/ProformaForm";

export default function EditProformaInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <ProformaForm proformaId={id} />;
}
