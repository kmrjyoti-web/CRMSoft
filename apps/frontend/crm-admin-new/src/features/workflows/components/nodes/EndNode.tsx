'use client';

import React from 'react';
import type { NodeProps } from '@xyflow/react';
import { BaseNode, type BaseNodeData } from './BaseNode';

// ── Component ────────────────────────────────────────────

export function EndNode({ data, selected }: NodeProps & { data: BaseNodeData }) {
  const outcome = data.config?.outcome as string | undefined;
  const summary = outcome || data.description || 'End of workflow';

  return (
    <BaseNode
      data={{ ...data, color: '#EF4444' }}
      selected={selected}
      hideOutputHandle
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
