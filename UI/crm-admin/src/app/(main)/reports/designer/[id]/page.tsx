'use client';

import { ReportDesigner } from '@/features/reports/components/ReportDesigner';

export default function ReportDesignerEditPage({
  params,
}: {
  params: { id: string };
}) {
  return <ReportDesigner templateId={params.id} />;
}
