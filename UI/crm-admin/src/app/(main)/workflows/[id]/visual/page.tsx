"use client";

import { WorkflowCanvas } from "@/features/workflows/components/canvas/WorkflowCanvas";

export default function VisualWorkflowPage({
  params,
}: {
  params: { id: string };
}) {
  return <WorkflowCanvas workflowId={params.id} />;
}
