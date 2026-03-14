'use client';

import React from 'react';
import type { NodeProps } from '@xyflow/react';
import { BaseNode, type BaseNodeData } from './BaseNode';

// ── Helpers ──────────────────────────────────────────────

function buildConditionSummary(config: Record<string, any>): string {
  const field = config?.field as string | undefined;
  const operator = config?.operator as string | undefined;
  const value = config?.value;

  if (field && operator) {
    const opLabel = operator === 'equals' ? '=' : operator === 'not_equals' ? '!=' : operator;
    return `${field} ${opLabel} ${value ?? '?'}`;
  }

  return config?.expression as string || 'No condition set';
}

// ── Component ────────────────────────────────────────────

export function ConditionNode({ data, selected }: NodeProps & { data: BaseNodeData }) {
  const summary = buildConditionSummary(data.config);

  return (
    <BaseNode
      data={{ ...data, color: '#EAB308' }}
      selected={selected}
      outputHandles={['yes', 'no']}
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
