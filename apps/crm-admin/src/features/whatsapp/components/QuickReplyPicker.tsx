'use client';

import { useState } from 'react';

import { Button, Icon } from '@/components/ui';
import { useWaQuickReplies } from '../hooks/useWaQuickReplies';

interface QuickReplyPickerProps {
  onSelect: (text: string) => void;
}

export function QuickReplyPicker({ onSelect }: QuickReplyPickerProps) {
  const [open, setOpen] = useState(false);
  const { data } = useWaQuickReplies();

  const replies = Array.isArray(data?.data) ? data.data : [];

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        title="Quick Replies"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 6,
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Icon name="zap" size={18} color="#64748b" />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            width: 280,
            maxHeight: 240,
            overflowY: 'auto',
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            zIndex: 50,
            marginBottom: 4,
          }}
        >
          <div style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
            Quick Replies
          </div>
          {replies.length === 0 ? (
            <div style={{ padding: 16, textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>
              No quick replies
            </div>
          ) : (
            replies.map((reply: any) => (
              <button
                key={reply.id}
                onClick={() => {
                  onSelect(reply.content ?? reply.body ?? '');
                  setOpen(false);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f8fafc',
                  fontSize: 13,
                  color: '#475569',
                }}
              >
                <span style={{ fontWeight: 500, color: '#1e293b' }}>{reply.title ?? reply.shortcut}</span>
                <br />
                <span style={{ fontSize: 12, color: '#94a3b8' }}>
                  {(reply.content ?? reply.body ?? '').slice(0, 60)}...
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
