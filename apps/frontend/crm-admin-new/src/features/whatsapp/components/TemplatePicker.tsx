'use client';

import { useState } from 'react';

import { Button, Input, Badge, Icon } from '@/components/ui';
import { useWaTemplatesList } from '../hooks/useWaTemplates';
import { CATEGORY_BADGE } from '../utils/wa-status-badges';

interface TemplatePickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (template: any) => void;
}

export function TemplatePicker({ open, onClose, onSelect }: TemplatePickerProps) {
  const [search, setSearch] = useState('');
  const { data } = useWaTemplatesList({ status: 'APPROVED' });

  const templates = (Array.isArray(data?.data) ? data.data : []).filter(
    (t: any) =>
      !search || t.name?.toLowerCase().includes(search.toLowerCase()),
  );

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
          width: 520,
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 32px rgba(0,0,0,0.16)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1e293b' }}>Select Template</h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          >
            <Icon name="x" size={20} color="#64748b" />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '12px 20px' }}>
          <Input
            label="Search templates"
            value={search}
            onChange={setSearch}
            leftIcon={<Icon name="search" size={16} />}
          />
        </div>

        {/* Template List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 16px' }}>
          {templates.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
              No approved templates found
            </div>
          ) : (
            templates.map((t: any) => (
              <div
                key={t.id}
                onClick={() => {
                  onSelect(t);
                  onClose();
                }}
                style={{
                  padding: '12px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  marginBottom: 8,
                  cursor: 'pointer',
                  transition: 'border-color 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: '#1e293b' }}>{t.name}</span>
                  <Badge variant={CATEGORY_BADGE[t.category] ?? 'default'}>{t.category}</Badge>
                </div>
                <p style={{ fontSize: 12, color: '#64748b', marginTop: 4, lineHeight: 1.4 }}>
                  {(t.body ?? '').slice(0, 100)}
                  {(t.body ?? '').length > 100 ? '...' : ''}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
