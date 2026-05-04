import { ChatbotFlowEditor } from '@/features/whatsapp/components/ChatbotFlowEditor';

export default function WaChatbotEditPage({ params }: { params: { id: string } }) {
  return <ChatbotFlowEditor flowId={params.id} />;
}
