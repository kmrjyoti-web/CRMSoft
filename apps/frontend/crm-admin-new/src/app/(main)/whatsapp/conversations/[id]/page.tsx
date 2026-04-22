import { ConversationLayout } from '@/features/whatsapp/components/ConversationLayout';

export default function WaConversationDetailPage({ params }: { params: { id: string } }) {
  return <ConversationLayout conversationId={params.id} />;
}
