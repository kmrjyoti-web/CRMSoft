'use client';

import React from 'react';
import { Icon } from '@/components/ui';

// ── Types ────────────────────────────────────────────────

interface NoteNodeData {
  label: string;
  text?: string;
  color?: string;
}

interface NoteNodeProps {
  data: NoteNodeData;
  selected: boolean;
}

// ── Styles ───────────────────────────────────────────────

const noteContainerStyle: React.CSSProperties = {
  minWidth: 160,
  maxWidth: 240,
  background: '#fef9c3',
  borderRadius: 4,
  padding: '10px 12px',
  position: 'relative',
  cursor: 'default',
  transition: 'box-shadow 0.15s ease',
  fontFamily: 'inherit',
};

const noteLabelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 12,
  fontWeight: 600,
  color: '#854d0e',
  marginBottom: 4,
};

const noteTextStyle: React.CSSProperties = {
  fontSize: 11,
  color: '#713f12',
  lineHeight: '16px',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
};

// ── Component ────────────────────────────────────────────

export function NoteNode({ data, selected }: NoteNodeProps) {
  const bg = data.color || '#fef9c3';

  return (
    <div style={{
      ...noteContainerStyle,
      background: bg,
      boxShadow: selected
        ? '0 0 0 2px rgba(234, 179, 8, 0.5), 0 2px 8px rgba(0, 0, 0, 0.1)'
        : '0 1px 3px rgba(0, 0, 0, 0.06)',
    }}>
      <div style={noteLabelStyle}>
        <Icon name="sticky-note" size={14} color="#854d0e" />
        {data.label || 'Note'}
      </div>
      {data.text && (
        <div style={noteTextStyle}>{data.text}</div>
      )}
    </div>
  );
}
