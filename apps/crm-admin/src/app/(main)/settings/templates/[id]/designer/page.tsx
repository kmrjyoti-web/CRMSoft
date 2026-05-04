'use client';

import dynamic from 'next/dynamic';

const ReportDesigner = dynamic(
  () => import('@/features/report-designer/components/ReportDesigner').then(m => ({ default: m.ReportDesigner })),
  { ssr: false, loading: () => <div className="p-8 text-center text-gray-400">Loading designer...</div> }
);

export default function DesignerPage({ params }: { params: { id: string } }) {
  return <ReportDesigner templateId={params.id} />;
}
