"use client";

import { WarrantyForm } from "@/features/amc-warranty/components/WarrantyForm";

export default function EditWarrantyPage({
  params,
}: {
  params: { id: string };
}) {
  return <WarrantyForm warrantyId={params.id} />;
}
