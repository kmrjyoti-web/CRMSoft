"use client";

import { WorkflowDetail } from "@/features/workflows/components/WorkflowDetail";

export default function WorkflowDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <WorkflowDetail workflowId={params.id} />;
}
