'use client';

import { useEffect, useRef } from 'react';

import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useWaConversationMessages, useMarkConversationRead } from '../hooks/useWaConversations';
import { MessageBubble } from './MessageBubble';
import type { WaMessageItem } from '../types/conversation.types';

interface ConversationThreadProps {
  conversationId: string;
}

export function ConversationThread({ conversationId }: ConversationThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data, isLoading } = useWaConversationMessages(conversationId);
  const markRead = useMarkConversationRead();

  const messages: WaMessageItem[] = Array.isArray(data?.data)
    ? data.data
    : Array.isArray((data?.data as any)?.data)
      ? (data.data as any).data
      : [];

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  // Mark as read on mount
  useEffect(() => {
    if (conversationId) {
      markRead.mutate(conversationId);
    }
  }, [conversationId]);

  if (isLoading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner />
      </div>
    );
  }

  // Group messages by date
  const grouped = messages.reduce<Record<string, WaMessageItem[]>>((acc, msg) => {
    const date = msg.createdAt
      ? new Date(msg.createdAt).toLocaleDateString()
      : 'Unknown';
    if (!acc[date]) acc[date] = [];
    acc[date].push(msg);
    return acc;
  }, {});

  return (
    <div
      ref={scrollRef}
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: 16,
        background: '#f0f2f5',
      }}
    >
      {Object.entries(grouped).map(([date, msgs]) => (
        <div key={date}>
          <div
            style={{
              textAlign: 'center',
              margin: '16px 0',
            }}
          >
            <span
              style={{
                background: '#e2e8f0',
                padding: '4px 12px',
                borderRadius: 12,
                fontSize: 11,
                color: '#64748b',
                fontWeight: 500,
              }}
            >
              {date}
            </span>
          </div>
          {msgs.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </div>
      ))}

      {messages.length === 0 && (
        <div style={{ textAlign: 'center', color: '#94a3b8', paddingTop: 80, fontSize: 14 }}>
          No messages yet. Start a conversation!
        </div>
      )}
    </div>
  );
}
