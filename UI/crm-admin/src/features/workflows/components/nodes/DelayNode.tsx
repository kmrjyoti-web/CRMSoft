'use client';

import React from 'react';
import type { NodeProps } from '@xyflow/react';
import { BaseNode, type BaseNodeData } from './BaseNode';

// ── Helpers ──────────────────────────────────────────────

function formatDelay(config: Record<string, any>): string {
  const duration = config?.duration as number | undefined;
  const unit = config?.unit as string | undefined;

  if (duration && unit) {
    const plural = duration === 1 ? '' : 's';
    return `Wait ${duration} ${unit}${plural}`;
  }

  if (config?.delayMs) {
    const ms = config.delayMs as number;
    if (ms >= 3600000) return `Wait ${Math.round(ms / 3600000)} hour${ms >= 7200000 ? 's' : ''}`;
    if (ms >= 60000) return `Wait ${Math.round(ms / 60000)} minute${ms >= 120000 ? 's' : ''}`;
    return `Wait ${Math.round(ms / 1000)} second${ms >= 2000 ? 's' : ''}`;
  }

  return 'No delay configured';
}

// ── Component ────────────────────────────────────────────

export function DelayNode({ data, selected }: NodeProps & { data: BaseNodeData }) {
  const summary = formatDelay(data.config);

  return (
    <BaseNode
      data={{ ...data, color: '#8B5CF6' }}
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
