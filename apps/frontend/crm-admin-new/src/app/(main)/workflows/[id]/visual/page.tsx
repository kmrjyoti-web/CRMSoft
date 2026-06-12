"use client";

import dynamic from "next/dynamic";

const WorkflowCanvas = dynamic(
  () =>
    import("@/features/workflows/components/canvas/WorkflowCanvas").then(
      (m) => ({ default: m.WorkflowCanvas })
    ),
  {
    ssr: false,
    loading: () => (
      <div className="p-8 text-center text-gray-400">
        Loading workflow editor...
      </div>
    ),
  }
);

export default function VisualWorkflowPage({
  params,
}: {
  params: { id: string };
}) {
  return <WorkflowCanvas workflowId={params.id} />;
}
