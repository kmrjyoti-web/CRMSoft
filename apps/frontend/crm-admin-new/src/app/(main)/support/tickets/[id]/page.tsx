'use client';

import { TicketDetail } from '@/features/support/components/TicketDetail';

export default function TicketDetailPage({ params }: { params: { id: string } }) {
  return <TicketDetail ticketId={params.id} />;
}
