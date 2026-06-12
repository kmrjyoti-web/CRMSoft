'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

import { Button, Icon, Badge } from '@/components/ui';

// ── Props ───────────────────────────────────────────────

export interface WorkflowHeaderProps {
  workflowId?: string;
  name: string;
  isActive: boolean;
  isDirty: boolean;
  onNameChange: (name: string) => void;
  onSave: () => void;
  onTestRun: () => void;
  onAutoLayout: () => void;
  onBack: () => void;
  onOpenTemplates?: () => void;
  onOpenAi?: () => void;
}

// ── Styles ──────────────────────────────────────────────

const HEADER_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '8px 16px',
  background: '#fff',
  borderBottom: '1px solid #e5e7eb',
  height: 52,
  flexShrink: 0,
};

const DIVIDER_STYLE: React.CSSProperties = {
  width: 1,
  height: 24,
  background: '#e5e7eb',
  margin: '0 4px',
};

// ── Inline Editable Name ────────────────────────────────

interface EditableNameProps {
  value: string;
  onChange: (value: string) => void;
}

function EditableName({ value, onChange }: EditableNameProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const commit = useCallback(() => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) {
      onChange(trimmed);
    } else {
      setDraft(value);
    }
    setIsEditing(false);
  }, [draft, value, onChange]);

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') {
            setDraft(value);
            setIsEditing(false);
          }
        }}
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: '#1f2937',
          border: '1px solid #3b82f6',
          borderRadius: 4,
          padding: '2px 8px',
          outline: 'none',
          background: '#eff6ff',
          minWidth: 200,
        }}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '2px 4px',
        borderRadius: 4,
      }}
      title="Click to edit name"
    >
      <span style={{ fontSize: 16, fontWeight: 600, color: '#1f2937' }}>{value}</span>
      <Icon name="edit" size={13} color="#9ca3af" />
    </button>
  );
}

// ── WorkflowHeader ──────────────────────────────────────

export function WorkflowHeader({
  name,
  isActive,
  isDirty,
  onNameChange,
  onSave,
  onTestRun,
  onAutoLayout,
  onBack,
  onOpenTemplates,
  onOpenAi,
}: WorkflowHeaderProps) {
  // Ctrl+S / Cmd+S shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onSave();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSave]);

  return (
    <div style={HEADER_STYLE}>
      {/* Back */}
      <Button variant="ghost" onClick={onBack} style={{ padding: '4px 8px' }}>
        <Icon name="arrow-left" size={16} />
        Back
      </Button>

      <div style={DIVIDER_STYLE} />

      {/* Name */}
      <EditableName value={name || 'Untitled Workflow'} onChange={onNameChange} />

      {/* Status Badge */}
      <Badge variant={isActive ? 'success' : 'secondary'}>
        {isActive ? 'Active' : 'Draft'}
      </Badge>

      {/* Dirty Dot */}
      {isDirty && (
        <span
          title="Unsaved changes"
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#f59e0b',
            flexShrink: 0,
          }}
        />
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Actions */}
      {onOpenTemplates && (
        <Button variant="outline" onClick={onOpenTemplates}>
          <Icon name="file-text" size={14} />
          Templates
        </Button>
      )}

      {onOpenAi && (
        <Button variant="outline" onClick={onOpenAi}>
          <Icon name="sparkles" size={14} />
          AI Builder
        </Button>
      )}

      <Button variant="outline" onClick={onAutoLayout}>
        <Icon name="layout-grid" size={14} />
        Auto Layout
      </Button>

      <Button variant="outline" onClick={onTestRun}>
        <Icon name="play" size={14} />
        Test Run
      </Button>

      <Button variant="primary" onClick={onSave}>
        <Icon name="save" size={14} />
        Save
      </Button>
    </div>
  );
}
