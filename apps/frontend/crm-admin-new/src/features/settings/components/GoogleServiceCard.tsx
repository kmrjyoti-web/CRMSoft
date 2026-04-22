'use client';

import { Icon, Badge, Button, Switch } from '@/components/ui';

import type { GoogleServiceMeta } from '../utils/google-services';
import type { GoogleServiceStatusItem } from '../types/google-integration.types';

const STATUS_BADGE: Record<string, 'success' | 'danger' | 'primary' | 'default'> = {
  connected: 'success',
  error: 'danger',
  syncing: 'primary',
  disconnected: 'default',
};

interface GoogleServiceCardProps {
  meta: GoogleServiceMeta;
  /** Selection mode (before connection) */
  selectable?: boolean;
  selected?: boolean;
  onToggle?: (checked: boolean) => void;
  /** Status mode (after connection) */
  status?: GoogleServiceStatusItem;
  onSync?: () => void;
  syncing?: boolean;
}

export function GoogleServiceCard({
  meta,
  selectable,
  selected,
  onToggle,
  status,
  onSync,
  syncing,
}: GoogleServiceCardProps) {
  const isConnected = status?.status === 'connected' || status?.status === 'syncing';

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-4"
      style={{
        opacity: selectable && !selected ? 0.6 : 1,
        transition: 'opacity 0.15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: `${meta.color}12`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name={meta.icon} size={20} color={meta.color} />
          </div>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{meta.label}</h3>
            <p style={{ fontSize: 12, color: '#64748b', marginTop: 2, maxWidth: 280 }}>
              {meta.description}
            </p>
          </div>
        </div>

        {selectable && (
          <Switch
            checked={selected ?? false}
            onChange={(v) => onToggle?.(v)}
          />
        )}

        {status && (
          <Badge variant={STATUS_BADGE[status.status] ?? 'default'}>
            {status.status.toUpperCase()}
          </Badge>
        )}
      </div>

      {/* Connected: show last sync + actions */}
      {status && isConnected && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 12,
            paddingTop: 12,
            borderTop: '1px solid #f1f5f9',
          }}
        >
          <span style={{ fontSize: 12, color: '#94a3b8' }}>
            {status.lastSyncAt
              ? `Last sync: ${new Date(status.lastSyncAt).toLocaleString()}`
              : 'Not synced yet'}
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            {onSync && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSync}
                disabled={syncing}
              >
                {syncing ? 'Syncing...' : 'Sync Now'}
              </Button>
            )}
            {meta.settingsRoute && (
              <a href={meta.settingsRoute}>
                <Button variant="outline" size="sm">
                  Settings
                </Button>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Error state */}
      {status?.status === 'error' && status.errorMessage && (
        <div
          style={{
            marginTop: 12,
            padding: '8px 12px',
            background: '#fef2f2',
            borderRadius: 6,
            fontSize: 12,
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Icon name="alert-circle" size={14} color="#dc2626" />
          {status.errorMessage}
        </div>
      )}
    </div>
  );
}
