'use client';

import React from 'react';
import { getBezierPath, type EdgeProps } from '@xyflow/react';

// ── Constants ────────────────────────────────────────────

const COLORS = {
  yes: { stroke: '#16a34a', bg: '#dcfce7', text: '#15803d' },
  no:  { stroke: '#dc2626', bg: '#fee2e2', text: '#b91c1c' },
  default: { stroke: '#94a3b8', bg: '#f1f5f9', text: '#475569' },
};

const EDGE_WIDTH = 2;

// ── Component ────────────────────────────────────────────

export function ConditionalEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  label,
  style,
  markerEnd,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const labelStr = String(label || '').toLowerCase();
  const colorSet = labelStr === 'yes' ? COLORS.yes
    : labelStr === 'no' ? COLORS.no
    : COLORS.default;

  const displayLabel = label !== undefined && label !== null && label !== ''
    ? String(label)
    : '';

  return (
    <>
      {/* Invisible wider path for easier click target */}
      <path
        id={`${id}-interaction`}
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={16}
        style={{ cursor: 'pointer' }}
      />

      {/* Visible path */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={colorSet.stroke}
        strokeWidth={EDGE_WIDTH}
        markerEnd={markerEnd as string}
        style={style}
      />

      {/* Label at midpoint */}
      {displayLabel && (
        <g transform={`translate(${labelX}, ${labelY})`}>
          <rect
            x={-16}
            y={-10}
            width={32}
            height={20}
            rx={4}
            ry={4}
            fill={colorSet.bg}
            stroke={colorSet.stroke}
            strokeWidth={1}
          />
          <text
            x={0}
            y={0}
            style={{
              fontSize: 10,
              fontWeight: 600,
              fill: colorSet.text,
              dominantBaseline: 'central',
              textAnchor: 'middle',
            } as any}
          >
            {displayLabel}
          </text>
        </g>
      )}
    </>
  );
}
