"use client";

import { use } from "react";
import { WorkflowForm } from "@/features/workflows/components/WorkflowForm";

export default function EditWorkflowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <WorkflowForm workflowId={id} />;
}
