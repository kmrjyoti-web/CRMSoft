'use client';

import { useState, useRef, useEffect } from 'react';
import { Icon } from '@/components/ui';

interface Option { value: string; label: string; }

interface InlineSelectFieldProps {
  label: string;
  value?: string | number | null;
  options: Option[];
  onSave: (v: string) => void;
  placeholder?: string;
}

export function InlineSelectField({ label, value, options, onSave, placeholder }: InlineSelectFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => { if (isEditing) selectRef.current?.focus(); }, [isEditing]);

  const displayLabel = options.find((o) => o.value === String(value ?? ''))?.label ?? null;

  if (isEditing) {
    return (
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>{label}</div>
        <select
          ref={selectRef}
          value={String(value ?? '')}
          onChange={(e) => { onSave(e.target.value); setIsEditing(false); }}
          onBlur={() => setIsEditing(false)}
          style={{
            width: '100%', borderBottom: '2px solid #2563eb', outline: 'none',
            background: 'transparent', padding: '2px 0', fontSize: 13,
          }}
        >
          <option value="">— Select —</option>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      style={{ minWidth: 0, cursor: 'pointer' }}
    >
      <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>{label}</div>
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 13, fontWeight: 500,
          color: displayLabel ? '#111827' : '#9ca3af',
          padding: '2px 4px', borderRadius: 4,
          transition: 'background 0.1s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = '#f3f4f6')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <span style={{ flex: 1 }}>{displayLabel ?? <em>{placeholder ?? 'Click to select'}</em>}</span>
        <Icon name="chevron-down" size={11} color="#9ca3af" />
      </div>
    </div>
  );
}
