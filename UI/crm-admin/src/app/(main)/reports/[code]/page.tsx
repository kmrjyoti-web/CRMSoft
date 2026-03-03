"use client";

import { use } from "react";
import { ReportViewer } from "@/features/dashboard/components/ReportViewer";

export default function ReportViewerPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  return <ReportViewer reportCode={code} />;
}
