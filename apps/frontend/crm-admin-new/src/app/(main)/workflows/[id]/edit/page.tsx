"use client";

import { WorkflowForm } from "@/features/workflows/components/WorkflowForm";

export default function EditWorkflowPage({
  params,
}: {
  params: { id: string };
}) {
  return <WorkflowForm workflowId={params.id} />;
}
