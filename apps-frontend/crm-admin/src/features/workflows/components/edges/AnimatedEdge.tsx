'use client';

import React from 'react';
import { getBezierPath, type EdgeProps } from '@xyflow/react';

// ── Styles ───────────────────────────────────────────────

const EDGE_COLOR = '#94a3b8';
const EDGE_WIDTH = 2;

const labelBgStyle: React.CSSProperties = {
  fill: '#ffffff',
  stroke: '#e2e8f0',
  strokeWidth: 1,
  rx: 4,
  ry: 4,
};

const labelTextStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 500,
  fill: '#475569',
  dominantBaseline: 'central',
  textAnchor: 'middle',
};

// ── Component ────────────────────────────────────────────

export function AnimatedEdge({
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

  const hasLabel = label !== undefined && label !== null && label !== '';

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

      {/* Visible animated path */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={EDGE_COLOR}
        strokeWidth={EDGE_WIDTH}
        strokeDasharray="6 4"
        markerEnd={markerEnd as string}
        style={{
          ...style,
          animation: 'wf-dash-flow 0.6s linear infinite',
        }}
      />

      {/* Optional label */}
      {hasLabel && (
        <g transform={`translate(${labelX}, ${labelY})`}>
          <rect
            x={-20}
            y={-10}
            width={40}
            height={20}
            style={labelBgStyle}
          />
          <text x={0} y={0} style={labelTextStyle as any}>
            {String(label)}
          </text>
        </g>
      )}
    </>
  );
}
