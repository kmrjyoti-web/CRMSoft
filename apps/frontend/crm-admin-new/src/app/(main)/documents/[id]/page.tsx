import { DocumentDetail } from '@/features/documents/components/DocumentDetail';

export default function DocumentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <DocumentDetail documentId={params.id} />;
}
