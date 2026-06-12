'use client';

import { useState } from 'react';

import { Button, Input, SelectInput, Icon } from '@/components/ui';
import { useLinkConversation } from '../hooks/useWaConversations';

interface LinkEntityDialogProps {
  open: boolean;
  onClose: () => void;
  conversationId: string;
}

export function LinkEntityDialog({ open, onClose, conversationId }: LinkEntityDialogProps) {
  const [entityType, setEntityType] = useState<string>('CONTACT');
  const [entityId, setEntityId] = useState('');
  const linkMut = useLinkConversation();

  const handleLink = () => {
    if (!entityId) return;
    linkMut.mutate(
      { id: conversationId, data: { entityType: entityType as any, entityId } },
      {
        onSuccess: () => {
          setEntityId('');
          onClose();
        },
      },
    );
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          width: 420,
          padding: 24,
          boxShadow: '0 8px 32px rgba(0,0,0,0.16)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1e293b' }}>Link to CRM Entity</h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          >
            <Icon name="x" size={20} color="#64748b" />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <SelectInput
            label="Entity Type"
            value={entityType}
            onChange={(v) => setEntityType(v as string)}
            options={[
              { value: 'CONTACT', label: 'Contact' },
              { value: 'LEAD', label: 'Lead' },
              { value: 'ORGANIZATION', label: 'Organization' },
            ]}
          />
          <Input
            label="Entity ID"
            value={entityId}
            onChange={setEntityId}
            leftIcon={<Icon name="link" size={16} />}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            onClick={handleLink}
            disabled={!entityId || linkMut.isPending}
          >
            {linkMut.isPending ? 'Linking...' : 'Link'}
          </Button>
        </div>
      </div>
    </div>
  );
}
