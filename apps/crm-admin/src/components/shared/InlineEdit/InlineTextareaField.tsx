'use client';

import { useState, useRef, useEffect } from 'react';
import { Icon } from '@/components/ui';

interface Props {
  label: string;
  value?: string | null;
  onSave: (v: string) => void;
  rows?: number;
  placeholder?: string;
}

export function InlineTextareaField({ label, value, onSave, rows = 3, placeholder }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value ?? '');
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setEditValue(value ?? ''); }, [value]);
  useEffect(() => { if (isEditing) ref.current?.focus(); }, [isEditing]);

  const save = () => {
    if (editValue !== (value ?? '')) onSave(editValue);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div>
        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>{label}</div>
        <textarea
          ref={ref}
          value={editValue}
          rows={rows}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => { if (e.key === 'Escape') { setEditValue(value ?? ''); setIsEditing(false); } }}
          placeholder={placeholder}
          style={{
            width: '100%', border: '1.5px solid #2563eb', borderRadius: 6,
            padding: '6px 8px', fontSize: 13, outline: 'none', resize: 'vertical',
          }}
        />
      </div>
    );
  }

  return (
    <div onClick={() => setIsEditing(true)} style={{ cursor: 'pointer' }}>
      <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>{label}</div>
      <div
        style={{
          fontSize: 13, color: value ? '#111827' : '#9ca3af',
          padding: '6px 8px', borderRadius: 6, border: '1px dashed #e5e7eb',
          minHeight: 60, whiteSpace: 'pre-wrap', lineHeight: 1.5,
          display: 'flex', alignItems: 'flex-start', gap: 6,
        }}
        onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <span style={{ flex: 1 }}>{value || <em>{placeholder ?? 'Click to edit'}</em>}</span>
        <Icon name="pencil" size={11} color="#9ca3af" />
      </div>
    </div>
  );
}
