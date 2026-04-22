import { WaTemplateForm } from '@/features/whatsapp/components/WaTemplateForm';

export default function WaTemplateEditPage({ params }: { params: { id: string } }) {
  return <WaTemplateForm templateId={params.id} />;
}
