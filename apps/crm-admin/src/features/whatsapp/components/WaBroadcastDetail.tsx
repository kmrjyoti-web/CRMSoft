'use client';

import { useRouter } from 'next/navigation';

import { Button, Badge } from '@/components/ui';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { KpiCard } from '@/features/dashboard/components/KpiCard';
import { useWaBroadcastDetail, useStartBroadcast, usePauseBroadcast, useCancelBroadcast } from '../hooks/useWaBroadcasts';
import { BROADCAST_STATUS_BADGE } from '../utils/wa-status-badges';
import { WaBroadcastRecipientTable } from './WaBroadcastRecipientTable';

interface WaBroadcastDetailProps {
  broadcastId: string;
}

export function WaBroadcastDetail({ broadcastId }: WaBroadcastDetailProps) {
  const router = useRouter();
  const { data, isLoading } = useWaBroadcastDetail(broadcastId);
  const startMut = useStartBroadcast();
  const pauseMut = usePauseBroadcast();
  const cancelMut = useCancelBroadcast();

  const broadcast = data?.data;

  if (isLoading) return <LoadingSpinner fullPage />;
  if (!broadcast) return <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>Broadcast not found</div>;

  const total = broadcast.totalRecipients ?? 0;
  const sent = broadcast.sentCount ?? 0;
  const delivered = broadcast.deliveredCount ?? 0;
  const failed = broadcast.failedCount ?? 0;
  const progress = total > 0 ? Math.round((sent / total) * 100) : 0;

  return (
    <div>
      <PageHeader
        title={broadcast.name ?? 'Broadcast Detail'}
        actions={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Badge variant={BROADCAST_STATUS_BADGE[broadcast.status] ?? 'default'}>
              {broadcast.status}
            </Badge>
            {broadcast.status === 'DRAFT' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => startMut.mutate(broadcastId)}
                disabled={startMut.isPending}
              >
                Start
              </Button>
            )}
            {broadcast.status === 'SENDING' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => pauseMut.mutate(broadcastId)}
                disabled={pauseMut.isPending}
              >
                Pause
              </Button>
            )}
            {broadcast.status === 'PAUSED' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => startMut.mutate(broadcastId)}
                disabled={startMut.isPending}
              >
                Resume
              </Button>
            )}
            {(broadcast.status === 'SENDING' || broadcast.status === 'PAUSED' || broadcast.status === 'DRAFT') && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => cancelMut.mutate(broadcastId)}
                disabled={cancelMut.isPending}
              >
                Cancel
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => router.push('/whatsapp/broadcasts')}>
              Back
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard title="Total Recipients" value={total} icon="users" color="#3b82f6" />
        <KpiCard title="Sent" value={sent} icon="send" color="#10b981" />
        <KpiCard title="Delivered" value={delivered} icon="check-circle" color="#8b5cf6" />
        <KpiCard title="Failed" value={failed} icon="alert-circle" color="#ef4444" />
      </div>

      {/* Progress Bar */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 mb-6">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>Progress</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#2563eb' }}>{progress}%</span>
        </div>
        <div style={{ height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: '#2563eb',
              borderRadius: 4,
              transition: 'width 0.3s',
            }}
          />
        </div>
      </div>

      {/* Recipient Table */}
      <WaBroadcastRecipientTable broadcastId={broadcastId} />
    </div>
  );
}
