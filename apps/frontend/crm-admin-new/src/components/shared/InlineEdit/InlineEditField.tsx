'use client';

import { useState, useRef, useEffect } from 'react';
import { Icon } from '@/components/ui';

interface InlineEditFieldProps {
  label: string;
  value?: string | number | null;
  onSave: (v: string) => void;
  type?: string;
  placeholder?: string;
  className?: string;
  fullWidth?: boolean;
  readOnly?: boolean;
}

export function InlineEditField({
  label, value, onSave, type = 'text', placeholder, className, fullWidth, readOnly,
}: InlineEditFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value ?? ''));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setEditValue(String(value ?? '')); }, [value]);
  useEffect(() => { if (isEditing) inputRef.current?.focus(); }, [isEditing]);

  const save = () => {
    const v = editValue.trim();
    if (v !== String(value ?? '')) onSave(v);
    setIsEditing(false);
  };

  const displayVal = value !== null && value !== undefined && value !== '' ? String(value) : null;

  if (readOnly) {
    return (
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{displayVal ?? '—'}</div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>{label}</div>
        <input
          ref={inputRef}
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save();
            if (e.key === 'Escape') { setEditValue(String(value ?? '')); setIsEditing(false); }
          }}
          placeholder={placeholder}
          style={{
            width: '100%', borderBottom: '2px solid #2563eb', outline: 'none',
            background: 'transparent', padding: '2px 0', fontSize: 13, color: '#111827',
          }}
        />
      </div>
    );
  }

  return (
    <div
      onClick={() => !readOnly && setIsEditing(true)}
      style={{ minWidth: 0, cursor: 'pointer' }}
      className="group"
    >
      <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>{label}</div>
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 13, fontWeight: 500,
          color: displayVal ? '#111827' : '#9ca3af',
          padding: '2px 4px', borderRadius: 4,
          transition: 'background 0.1s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = '#f3f4f6')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <span className={className} style={{ flex: 1 }}>
          {displayVal ?? <em>{placeholder ?? 'Click to edit'}</em>}
        </span>
        <Icon name="pencil" size={11} color="#9ca3af" />
      </div>
    </div>
  );
}
