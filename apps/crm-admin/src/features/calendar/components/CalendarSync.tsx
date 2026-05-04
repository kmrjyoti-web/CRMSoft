'use client';

import toast from 'react-hot-toast';

import { Button, Icon, Card, Badge } from '@/components/ui';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatDate } from '@/lib/format-date';

import {
  useSyncStatus,
  useDisconnectSync,
  useTriggerSync,
} from '../hooks/useCalendar';
import type { SyncProvider, SyncStatus } from '../types/calendar.types';

// ── Constants ─────────────────────────────────────────────────────────

const PROVIDER_CONFIG: Record<SyncProvider, { icon: string; label: string; color: string }> = {
  GOOGLE: { icon: 'mail', label: 'Google Calendar', color: '#ea4335' },
  OUTLOOK: { icon: 'mail', label: 'Microsoft Outlook', color: '#0078d4' },
  ICAL: { icon: 'calendar', label: 'iCal', color: '#6b7280' },
};

// ── Component ─────────────────────────────────────────────────────────

export function CalendarSync() {
  const { data, isLoading } = useSyncStatus();
  const disconnectMut = useDisconnectSync();
  const triggerSyncMut = useTriggerSync();

  const syncStatuses: SyncStatus[] = (data as any)?.data ?? [];

  // ── Handlers ──────────────────────────────────────────────────────

  function handleConnect(provider: SyncProvider) {
    // In a real implementation, this would redirect to OAuth flow.
    // For now, show a placeholder message.
    toast('Redirecting to ' + PROVIDER_CONFIG[provider].label + ' authorization...');
  }

  async function handleDisconnect(provider: SyncProvider) {
    if (!window.confirm(`Disconnect ${PROVIDER_CONFIG[provider].label}?`)) return;
    try {
      await disconnectMut.mutateAsync(provider);
      toast.success(`${PROVIDER_CONFIG[provider].label} disconnected`);
    } catch {
      toast.error('Failed to disconnect');
    }
  }

  async function handleTriggerSync(provider: SyncProvider) {
    try {
      await triggerSyncMut.mutateAsync(provider);
      toast.success('Sync triggered for ' + PROVIDER_CONFIG[provider].label);
    } catch {
      toast.error('Failed to trigger sync');
    }
  }

  function getStatus(provider: SyncProvider): SyncStatus | undefined {
    return syncStatuses.find((s) => s.provider === provider);
  }

  // ── Render ────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}>
        <LoadingSpinner />
      </div>
    );
  }

  const providers: SyncProvider[] = ['GOOGLE', 'OUTLOOK'];

  return (
    <div style={{ padding: 24, maxWidth: 720 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name="refresh-cw" size={22} />
        Calendar Sync
      </h2>

      {providers.map((provider) => {
        const config = PROVIDER_CONFIG[provider];
        const status = getStatus(provider);
        const isConnected = status?.isConnected ?? false;

        return (
          <Card key={provider} style={{ padding: 20, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              {/* Provider Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    backgroundColor: config.color + '15',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name={config.icon} size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{config.label}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <Badge variant={isConnected ? 'success' : 'secondary'}>
                      {isConnected ? 'Connected' : 'Disconnected'}
                    </Badge>
                    {status?.email && (
                      <span style={{ fontSize: 12, color: '#6b7280' }}>{status.email}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8 }}>
                {isConnected ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => handleTriggerSync(provider)}
                      disabled={triggerSyncMut.isPending}
                    >
                      <Icon name="refresh-cw" size={14} />
                      Sync Now
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDisconnect(provider)}
                      disabled={disconnectMut.isPending}
                    >
                      <Icon name="unlink" size={14} />
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <Button variant="primary" onClick={() => handleConnect(provider)}>
                    <Icon name="link" size={14} />
                    Connect
                  </Button>
                )}
              </div>
            </div>

            {/* Sync Details */}
            {isConnected && status && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f3f4f6' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>Last Sync</div>
                    <div style={{ fontSize: 13, fontWeight: 500, marginTop: 2 }}>
                      {status.lastSyncAt
                        ? formatDate(status.lastSyncAt, 'dd MMM yyyy, hh:mm a')
                        : 'Never'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sync Errors */}
            {status?.syncError && (
              <div
                style={{
                  marginTop: 12,
                  padding: '10px 12px',
                  backgroundColor: '#fef2f2',
                  borderRadius: 6,
                  border: '1px solid #fecaca',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Icon name="alert-circle" size={14} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#ef4444' }}>Sync Error</span>
                </div>
                <p style={{ fontSize: 13, color: '#991b1b', margin: 0 }}>{status.syncError}</p>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
