'use client';

import React from 'react';
import type { NodeProps } from '@xyflow/react';
import { BaseNode, type BaseNodeData } from './BaseNode';

// ── Helpers ──────────────────────────────────────────────

function buildActionSummary(config: Record<string, unknown>): string {
  const actionType = config?.actionType as string | undefined;
  const target = config?.target as string | undefined;

  if (actionType && target) {
    return `${actionType}: ${target}`;
  }

  if (actionType) {
    return actionType;
  }

  return config?.description as string || 'No action configured';
}

// ── Component ────────────────────────────────────────────

export function ActionNode({ data, selected }: NodeProps & { data: BaseNodeData }) {
  const summary = buildActionSummary(data.config);

  return (
    <BaseNode
      data={{ ...data, color: '#3B82F6' }}
      selected={selected}
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
