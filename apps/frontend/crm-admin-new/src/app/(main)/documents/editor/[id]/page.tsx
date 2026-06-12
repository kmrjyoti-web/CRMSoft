import { DocumentEditor } from '@/features/documents/components/DocumentEditor';

export default function DocumentEditorPage({
  params,
}: {
  params: { id: string };
}) {
  return <DocumentEditor documentId={params.id} />;
}
