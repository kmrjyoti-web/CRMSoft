'use client';

import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Icon } from '@/components/ui';

// ── Types ────────────────────────────────────────────────

export interface BaseNodeData {
  label: string;
  description?: string;
  nodeCategory: 'trigger' | 'condition' | 'action' | 'flow' | 'utility';
  nodeSubType: string;
  icon: string;
  color: string;
  config: Record<string, unknown>;
  isConfigured: boolean;
  executionStatus?: 'idle' | 'running' | 'success' | 'error' | 'skipped';
  executionTime?: number;
  executionError?: string;
}

export interface BaseNodeProps {
  data: BaseNodeData;
  selected: boolean;
  children?: React.ReactNode;
  outputHandles?: string[];
  hideInputHandle?: boolean;
  hideOutputHandle?: boolean;
}

// ── Styles ───────────────────────────────────────────────

const containerStyle: React.CSSProperties = {
  minWidth: 200,
  maxWidth: 280,
  background: '#ffffff',
  borderRadius: 8,
  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
  position: 'relative',
  overflow: 'visible',
  transition: 'box-shadow 0.15s ease',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '10px 12px 4px 12px',
};

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: '#1e293b',
  lineHeight: '18px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  flex: 1,
};

const summaryStyle: React.CSSProperties = {
  fontSize: 11,
  color: '#64748b',
  padding: '0 12px 10px 36px',
  lineHeight: '16px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const iconWrapperStyle = (color: string): React.CSSProperties => ({
  width: 24,
  height: 24,
  borderRadius: 6,
  background: color + '18',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

const handleStyle: React.CSSProperties = {
  width: 10,
  height: 10,
  background: '#94a3b8',
  border: '2px solid #ffffff',
  borderRadius: '50%',
};

const badgeStyle = (bg: string, fg: string): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 3,
  fontSize: 10,
  fontWeight: 500,
  color: fg,
  background: bg,
  borderRadius: 10,
  padding: '2px 6px',
  lineHeight: '14px',
});

const warningDotStyle: React.CSSProperties = {
  position: 'absolute',
  top: -4,
  right: -4,
  width: 10,
  height: 10,
  borderRadius: '50%',
  background: '#f97316',
  border: '2px solid #ffffff',
};

const handleLabelStyle: React.CSSProperties = {
  fontSize: 9,
  fontWeight: 600,
  position: 'absolute',
  right: -4,
  transform: 'translateX(100%)',
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
  paddingLeft: 4,
};

// ── Keyframe injection ───────────────────────────────────

const PULSE_KEYFRAMES_ID = 'wf-pulse-keyframes';

function ensurePulseKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(PULSE_KEYFRAMES_ID)) return;
  const style = document.createElement('style');
  style.id = PULSE_KEYFRAMES_ID;
  style.textContent = `
    @keyframes wf-node-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
      50% { box-shadow: 0 0 0 6px rgba(59, 130, 246, 0); }
    }
    @keyframes wf-dash-flow {
      to { stroke-dashoffset: -20; }
    }
  `;
  document.head.appendChild(style);
}

// ── Execution Status Badge ───────────────────────────────

function ExecutionBadge({ status, time, error }: {
  status?: BaseNodeData['executionStatus'];
  time?: number;
  error?: string;
}) {
  if (!status || status === 'idle') return null;

  const configs: Record<string, { bg: string; fg: string; icon: string; text: string }> = {
    running: { bg: '#dbeafe', fg: '#2563eb', icon: 'loader', text: 'Running' },
    success: { bg: '#dcfce7', fg: '#16a34a', icon: 'check-circle', text: 'Success' },
    error:   { bg: '#fee2e2', fg: '#dc2626', icon: 'x-circle', text: error || 'Error' },
    skipped: { bg: '#f1f5f9', fg: '#94a3b8', icon: 'minus', text: 'Skipped' },
  };

  const cfg = configs[status];
  if (!cfg) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 12px 8px 12px', flexWrap: 'wrap' }}>
      <span style={badgeStyle(cfg.bg, cfg.fg)}>
        <Icon name={cfg.icon as any} size={10} color={cfg.fg} />
        {cfg.text}
      </span>
      {time !== undefined && status !== 'skipped' && (
        <span style={badgeStyle('#f8fafc', '#64748b')}>
          <Icon name="clock" size={10} color="#64748b" />
          {time}ms
        </span>
      )}
    </div>
  );
}

// ── Component ────────────────────────────────────────────

export function BaseNode({
  data,
  selected,
  children,
  outputHandles,
  hideInputHandle = false,
  hideOutputHandle = false,
}: BaseNodeProps) {
  ensurePulseKeyframes();

  const isRunning = data.executionStatus === 'running';

  const borderAndShadow: React.CSSProperties = {
    borderLeft: `4px solid ${data.color}`,
    boxShadow: selected
      ? `0 0 0 2px rgba(59, 130, 246, 0.5), 0 2px 8px rgba(0, 0, 0, 0.1)`
      : containerStyle.boxShadow,
    animation: isRunning ? 'wf-node-pulse 1.5s ease-in-out infinite' : undefined,
  };

  return (
    <div style={{ ...containerStyle, ...borderAndShadow }}>
      {/* Warning dot for unconfigured */}
      {!data.isConfigured && <div style={warningDotStyle} title="Not configured" />}

      {/* Input Handle */}
      {!hideInputHandle && (
        <Handle
          type="target"
          position={Position.Left}
          style={{ ...handleStyle, left: -5 }}
        />
      )}

      {/* Header: icon + label */}
      <div style={headerStyle}>
        <div style={iconWrapperStyle(data.color)}>
          <Icon name={data.icon as any} size={16} color={data.color} />
        </div>
        <span style={labelStyle} title={data.label}>{data.label}</span>
      </div>

      {/* Summary / description or children */}
      {children ? (
        <div style={{ padding: '0 12px 8px 12px' }}>{children}</div>
      ) : data.description ? (
        <div style={summaryStyle} title={data.description}>{data.description}</div>
      ) : null}

      {/* Execution Status */}
      <ExecutionBadge
        status={data.executionStatus}
        time={data.executionTime}
        error={data.executionError}
      />

      {/* Output Handles */}
      {outputHandles && outputHandles.length > 0 ? (
        outputHandles.map((handleId, idx) => {
          const total = outputHandles.length;
          const topPercent = total === 1 ? 50 : 25 + (idx * 50) / (total - 1);
          return (
            <div key={handleId} style={{ position: 'absolute', top: `${topPercent}%`, right: -5 }}>
              <Handle
                type="source"
                position={Position.Right}
                id={handleId}
                style={{ ...handleStyle, position: 'relative', top: 0, right: 0 }}
              />
              <span style={{
                ...handleLabelStyle,
                color: handleId === 'yes' ? '#16a34a' : handleId === 'no' ? '#dc2626' : '#64748b',
              }}>
                {handleId}
              </span>
            </div>
          );
        })
      ) : !hideOutputHandle ? (
        <Handle
          type="source"
          position={Position.Right}
          style={{ ...handleStyle, right: -5 }}
        />
      ) : null}
    </div>
  );
}
