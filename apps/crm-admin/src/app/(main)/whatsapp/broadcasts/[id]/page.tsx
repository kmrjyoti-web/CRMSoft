import { WaBroadcastDetail } from '@/features/whatsapp/components/WaBroadcastDetail';

export default function WaBroadcastDetailPage({ params }: { params: { id: string } }) {
  return <WaBroadcastDetail broadcastId={params.id} />;
}
