'use client';

import { ReportDesigner } from '@/features/report-designer/components/ReportDesigner';

export default function DesignerPage({ params }: { params: { id: string } }) {
  return <ReportDesigner templateId={params.id} />;
}
