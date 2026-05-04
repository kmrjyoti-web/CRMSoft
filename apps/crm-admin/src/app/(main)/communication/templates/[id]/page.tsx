"use client";

import { use } from "react";
import { TemplateDetail } from "@/features/communication/components/TemplateDetail";

export default function TemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <TemplateDetail templateId={id} />;
}
