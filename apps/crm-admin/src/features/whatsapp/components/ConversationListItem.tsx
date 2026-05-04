'use client';

import { Badge } from '@/components/ui';
import { CONVERSATION_STATUS_BADGE } from '../utils/wa-status-badges';
import type { WaConversationItem } from '../types/conversation.types';

interface ConversationListItemProps {
  conversation: WaConversationItem;
  isActive: boolean;
  onClick: () => void;
}

export function ConversationListItem({ conversation, isActive, onClick }: ConversationListItemProps) {
  const { contactName, contactPhone, lastMessageSnippet, lastMessageAt, status, unreadCount } =
    conversation;

  const timeStr = lastMessageAt
    ? new Date(lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div
      onClick={onClick}
      style={{
        padding: '12px 16px',
        cursor: 'pointer',
        borderBottom: '1px solid #f1f5f9',
        background: isActive ? '#eff6ff' : '#fff',
        transition: 'background 0.15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          {/* Avatar */}
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: '#e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              fontWeight: 600,
              color: '#64748b',
              flexShrink: 0,
            }}
          >
            {(contactName ?? contactPhone ?? '?')[0].toUpperCase()}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  color: '#1e293b',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {contactName ?? contactPhone}
              </span>
              <span style={{ fontSize: 11, color: '#94a3b8', flexShrink: 0, marginLeft: 8 }}>
                {timeStr}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
              <span
                style={{
                  fontSize: 12,
                  color: '#64748b',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                }}
              >
                {lastMessageSnippet ?? 'No messages yet'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginLeft: 8 }}>
                {unreadCount != null && unreadCount > 0 && (
                  <span
                    style={{
                      background: '#22c55e',
                      color: '#fff',
                      fontSize: 10,
                      fontWeight: 700,
                      borderRadius: '50%',
                      width: 20,
                      height: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
                <Badge variant={CONVERSATION_STATUS_BADGE[status] ?? 'default'} size="sm">
                  {status}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
