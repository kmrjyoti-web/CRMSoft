'use client';

import { useEffect } from 'react';

import { Icon } from '@/components/ui';
import { useWaConversationDetail } from '../hooks/useWaConversations';
import { useConversationStore } from '../hooks/useConversationStore';
import { ConversationList } from './ConversationList';
import { ConversationThread } from './ConversationThread';
import { ConversationHeader } from './ConversationHeader';
import { MessageComposer } from './MessageComposer';

interface ConversationLayoutProps {
  conversationId?: string;
}

export function ConversationLayout({ conversationId }: ConversationLayoutProps) {
  const { activeConversationId, setActiveConversationId } = useConversationStore();

  // Set initial conversation from URL param
  useEffect(() => {
    if (conversationId) {
      setActiveConversationId(conversationId);
    }
  }, [conversationId, setActiveConversationId]);

  const activeId = activeConversationId || conversationId;
  const { data: convDetail } = useWaConversationDetail(activeId ?? '');
  const conversation = convDetail?.data;

  const windowExpired = conversation?.windowExpiresAt
    ? new Date(conversation.windowExpiresAt) < new Date()
    : false;

  return (
    <div
      style={{
        display: 'flex',
        height: 'calc(100vh - 180px)',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        overflow: 'hidden',
        background: '#fff',
      }}
    >
      {/* Left: Conversation List */}
      <div style={{ width: 340, flexShrink: 0 }}>
        <ConversationList />
      </div>

      {/* Right: Thread */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {activeId && conversation ? (
          <>
            <ConversationHeader conversation={conversation} />
            <ConversationThread conversationId={activeId} />
            <MessageComposer conversationId={activeId} windowExpired={windowExpired} />
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
            }}
          >
            <Icon name="message-square" size={48} color="#e2e8f0" />
            <p style={{ marginTop: 16, fontSize: 14 }}>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
