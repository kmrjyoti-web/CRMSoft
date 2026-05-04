'use client';

import { DatasetDetailPage } from '@/features/self-hosted-ai/components/DatasetDetailPage';

export default function Page({ params }: { params: { id: string } }) {
  return <DatasetDetailPage datasetId={params.id} />;
}
