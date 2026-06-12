'use client';

import { useState } from 'react';

import { Button, Icon, TextareaInput } from '@/components/ui';
import { useSendTextMessage, useSendTemplateMessage } from '../hooks/useWaConversations';
import { QuickReplyPicker } from './QuickReplyPicker';
import { TemplatePicker } from './TemplatePicker';

interface MessageComposerProps {
  conversationId: string;
  windowExpired?: boolean;
}

export function MessageComposer({ conversationId, windowExpired }: MessageComposerProps) {
  const [text, setText] = useState('');
  const [templateOpen, setTemplateOpen] = useState(false);
  const sendTextMut = useSendTextMessage();
  const sendTemplateMut = useSendTemplateMessage();

  const handleSend = () => {
    if (!text.trim()) return;
    sendTextMut.mutate(
      { id: conversationId, data: { body: text.trim() } },
      { onSuccess: () => setText('') },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickReply = (replyText: string) => {
    setText(replyText);
  };

  const handleTemplateSelect = (template: any) => {
    sendTemplateMut.mutate({
      id: conversationId,
      data: { templateId: template.id, templateName: template.name, language: template.language },
    });
  };

  return (
    <>
      {windowExpired && (
        <div
          style={{
            padding: '8px 16px',
            background: '#fef3c7',
            borderTop: '1px solid #fde68a',
            fontSize: 12,
            color: '#92400e',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Icon name="alert-triangle" size={14} color="#f59e0b" />
          24-hour window expired. You can only send template messages.
        </div>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 8,
          padding: '12px 16px',
          borderTop: '1px solid #e5e7eb',
          background: '#fff',
        }}
      >
        <QuickReplyPicker onSelect={handleQuickReply} />

        <button
          onClick={() => setTemplateOpen(true)}
          title="Send Template"
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
          <Icon name="file-text" size={18} color="#64748b" />
        </button>

        <div style={{ flex: 1 }}>
          <TextareaInput
            label="Message"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={windowExpired}
            rows={2}
          />
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleSend}
          disabled={!text.trim() || sendTextMut.isPending || windowExpired}
        >
          <Icon name="send" size={16} />
        </Button>
      </div>

      <TemplatePicker
        open={templateOpen}
        onClose={() => setTemplateOpen(false)}
        onSelect={handleTemplateSelect}
      />
    </>
  );
}
