"use client";

import { useRouter } from "next/navigation";
import { TemplateForm } from "@/features/quotation-templates/components/TemplateForm";

export default function NewTemplatePage() {
  const router = useRouter();
  return <TemplateForm onClose={() => router.push("/quotations/templates")} />;
}
