'use client';

import React from 'react';
import type { NodeProps } from '@xyflow/react';
import { BaseNode, type BaseNodeData } from './BaseNode';

// ── Component ────────────────────────────────────────────

export function TriggerNode({ data, selected }: NodeProps & { data: BaseNodeData }) {
  const eventName = data.config?.eventName as string | undefined;
  const summary = eventName || data.description || 'No trigger configured';

  return (
    <BaseNode
      data={{ ...data, color: '#22C55E' }}
      selected={selected}
      hideInputHandle
    >
      <div style={{
        fontSize: 11,
        color: '#64748b',
        lineHeight: '16px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }} title={summary}>
        {summary}
      </div>
    </BaseNode>
  );
}
