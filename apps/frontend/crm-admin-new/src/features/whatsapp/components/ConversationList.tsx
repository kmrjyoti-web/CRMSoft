'use client';

import { Input, Icon } from '@/components/ui';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useWaConversationsList } from '../hooks/useWaConversations';
import { useConversationStore } from '../hooks/useConversationStore';
import { ConversationListItem } from './ConversationListItem';
import type { WaConversationItem } from '../types/conversation.types';

const STATUS_CHIPS = ['ALL', 'OPEN', 'PENDING', 'RESOLVED'] as const;

export function ConversationList() {
  const {
    activeConversationId,
    setActiveConversationId,
    filterStatus,
    setFilterStatus,
    searchQuery,
    setSearchQuery,
  } = useConversationStore();

  const params: Record<string, string> = {};
  if (filterStatus && filterStatus !== 'ALL') params.status = filterStatus;
  if (searchQuery) params.search = searchQuery;

  const { data, isLoading } = useWaConversationsList(params);

  const conversations: WaConversationItem[] = Array.isArray(data?.data)
    ? data.data
    : Array.isArray((data?.data as any)?.data)
      ? (data.data as any).data
      : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', borderRight: '1px solid #e5e7eb' }}>
      {/* Search */}
      <div style={{ padding: 12, borderBottom: '1px solid #f1f5f9' }}>
        <Input
          label="Search conversations"
          value={searchQuery}
          onChange={setSearchQuery}
          leftIcon={<Icon name="search" size={16} />}
        />
      </div>

      {/* Filter Chips */}
      <div style={{ display: 'flex', gap: 4, padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>
        {STATUS_CHIPS.map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s === 'ALL' ? '' : s)}
            style={{
              padding: '4px 10px',
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              border: '1px solid',
              borderColor: (filterStatus === s || (!filterStatus && s === 'ALL')) ? '#2563eb' : '#e5e7eb',
              background: (filterStatus === s || (!filterStatus && s === 'ALL')) ? '#eff6ff' : '#fff',
              color: (filterStatus === s || (!filterStatus && s === 'ALL')) ? '#2563eb' : '#64748b',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Conversation Items */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {isLoading ? (
          <div style={{ padding: 32, display: 'flex', justifyContent: 'center' }}>
            <LoadingSpinner />
          </div>
        ) : conversations.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
            No conversations found
          </div>
        ) : (
          conversations.map((conv) => (
            <ConversationListItem
              key={conv.id}
              conversation={conv}
              isActive={conv.id === activeConversationId}
              onClick={() => setActiveConversationId(conv.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
