'use client';

import { useState } from 'react';

import { Button, Badge, Icon } from '@/components/ui';
import { CONVERSATION_STATUS_BADGE } from '../utils/wa-status-badges';
import { useAssignConversation, useResolveConversation, useReopenConversation } from '../hooks/useWaConversations';
import { LinkEntityDialog } from './LinkEntityDialog';
import type { WaConversationItem } from '../types/conversation.types';

interface ConversationHeaderProps {
  conversation: WaConversationItem;
}

export function ConversationHeader({ conversation }: ConversationHeaderProps) {
  const [linkOpen, setLinkOpen] = useState(false);
  const resolveMut = useResolveConversation();
  const reopenMut = useReopenConversation();

  const isOpen = conversation.status === 'OPEN' || conversation.status === 'PENDING';
  const windowExpired = conversation.windowExpiresAt
    ? new Date(conversation.windowExpiresAt) < new Date()
    : false;

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid #e5e7eb',
          background: '#fff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              fontWeight: 600,
              color: '#64748b',
            }}
          >
            {(conversation.contactName ?? conversation.contactPhone ?? '?')[0].toUpperCase()}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 600, fontSize: 14, color: '#1e293b' }}>
                {conversation.contactName ?? conversation.contactPhone}
              </span>
              <Badge variant={CONVERSATION_STATUS_BADGE[conversation.status] ?? 'default'}>
                {conversation.status}
              </Badge>
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{conversation.contactPhone}</span>
              {windowExpired && (
                <span style={{ color: '#ef4444', fontWeight: 500 }}>
                  24h window expired
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Button variant="outline" size="sm" onClick={() => setLinkOpen(true)}>
            <Icon name="link" size={14} />
          </Button>
          {isOpen ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => resolveMut.mutate(conversation.id)}
              disabled={resolveMut.isPending}
            >
              Resolve
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => reopenMut.mutate(conversation.id)}
              disabled={reopenMut.isPending}
            >
              Reopen
            </Button>
          )}
        </div>
      </div>

      <LinkEntityDialog
        open={linkOpen}
        onClose={() => setLinkOpen(false)}
        conversationId={conversation.id}
      />
    </>
  );
}
