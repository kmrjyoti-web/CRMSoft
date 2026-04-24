'use client';

import { ReportViewerEnhanced } from '@/features/reports/components/ReportViewerEnhanced';

export default function ReportViewerPage({
  params,
}: {
  params: { code: string };
}) {
  return <ReportViewerEnhanced reportCode={params.code} />;
}
