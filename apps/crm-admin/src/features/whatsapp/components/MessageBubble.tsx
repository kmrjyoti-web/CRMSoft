'use client';

import { Icon } from '@/components/ui';
import type { WaMessageItem } from '../types/conversation.types';

interface MessageBubbleProps {
  message: WaMessageItem;
}

const STATUS_ICONS: Record<string, { icon: string; color: string }> = {
  PENDING: { icon: 'clock', color: '#94a3b8' },
  QUEUED: { icon: 'clock', color: '#94a3b8' },
  SENT: { icon: 'check', color: '#94a3b8' },
  DELIVERED: { icon: 'check', color: '#94a3b8' },
  READ: { icon: 'check', color: '#3b82f6' },
  FAILED: { icon: 'alert-circle', color: '#ef4444' },
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const isOutbound = message.direction === 'OUTBOUND';
  const timeStr = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  const statusInfo = STATUS_ICONS[message.status] ?? STATUS_ICONS.PENDING;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isOutbound ? 'flex-end' : 'flex-start',
        marginBottom: 8,
        paddingLeft: isOutbound ? 48 : 0,
        paddingRight: isOutbound ? 0 : 48,
      }}
    >
      <div
        style={{
          maxWidth: '75%',
          padding: '8px 12px',
          borderRadius: 8,
          background: isOutbound ? '#dcfce7' : '#fff',
          border: isOutbound ? 'none' : '1px solid #e5e7eb',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        }}
      >
        {/* Media */}
        {message.mediaUrl && (
          <div style={{ marginBottom: 6 }}>
            {message.messageType === 'IMAGE' ? (
              <img
                src={message.mediaUrl}
                alt="Media"
                style={{ maxWidth: '100%', borderRadius: 6 }}
              />
            ) : message.messageType === 'VIDEO' ? (
              <video src={message.mediaUrl} controls style={{ maxWidth: '100%', borderRadius: 6 }} />
            ) : message.messageType === 'DOCUMENT' ? (
              <div
                style={{
                  padding: 8,
                  background: '#f1f5f9',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Icon name="file-text" size={16} color="#64748b" />
                <a
                  href={message.mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 12, color: '#2563eb' }}
                >
                  {message.mediaCaption ?? 'Document'}
                </a>
              </div>
            ) : (
              <a href={message.mediaUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#2563eb' }}>
                View attachment
              </a>
            )}
          </div>
        )}

        {/* Text */}
        {message.body && (
          <p style={{ fontSize: 14, color: '#1e293b', whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.5 }}>
            {message.body}
          </p>
        )}

        {/* Time + Status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 4,
            marginTop: 4,
          }}
        >
          <span style={{ fontSize: 11, color: '#94a3b8' }}>{timeStr}</span>
          {isOutbound && (
            <span style={{ display: 'flex', alignItems: 'center' }}>
              {message.status === 'DELIVERED' || message.status === 'READ' ? (
                <>
                  <Icon name="check" size={12} color={statusInfo.color} />
                  <Icon name="check" size={12} color={statusInfo.color} style={{ marginLeft: -6 }} />
                </>
              ) : (
                <Icon name={statusInfo.icon as any} size={12} color={statusInfo.color} />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
