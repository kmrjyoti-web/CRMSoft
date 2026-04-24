"use client";

import { use } from "react";
import { TemplateForm } from "@/features/communication/components/TemplateForm";

export default function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <TemplateForm templateId={id} />;
}
