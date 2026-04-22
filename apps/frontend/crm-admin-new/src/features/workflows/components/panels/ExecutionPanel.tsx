'use client';

import { useMemo } from 'react';

import { Icon, Badge } from '@/components/ui';

import type { WorkflowExecutionResult, WorkflowExecutionLog } from '../../types/visual-workflow.types';

// ── Props ───────────────────────────────────────────────

export interface ExecutionPanelProps {
  result: WorkflowExecutionResult | null;
  isOpen: boolean;
  onToggle: () => void;
}

// ── Styles ──────────────────────────────────────────────

const PANEL_STYLE: React.CSSProperties = {
  background: '#fff',
  borderTop: '1px solid #e5e7eb',
  flexShrink: 0,
};

const TOGGLE_BAR_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '8px 16px',
  cursor: 'pointer',
  userSelect: 'none',
  background: '#f9fafb',
  borderBottom: '1px solid #f3f4f6',
};

const TABLE_STYLE: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 12,
};

const TH_STYLE: React.CSSProperties = {
  padding: '8px 12px',
  textAlign: 'left',
  fontWeight: 600,
  color: '#6b7280',
  borderBottom: '1px solid #e5e7eb',
  background: '#f9fafb',
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const TD_STYLE: React.CSSProperties = {
  padding: '6px 12px',
  borderBottom: '1px solid #f3f4f6',
  color: '#374151',
};

// ── Status helpers ──────────────────────────────────────

function getStatusBadgeVariant(status: WorkflowExecutionLog['status']): 'success' | 'danger' | 'secondary' {
  switch (status) {
    case 'success':
      return 'success';
    case 'error':
      return 'danger';
    case 'skipped':
      return 'secondary';
    default:
      return 'secondary';
  }
}

function getStatusIcon(status: WorkflowExecutionLog['status']): string {
  switch (status) {
    case 'success':
      return 'check-circle';
    case 'error':
      return 'x-circle';
    case 'skipped':
      return 'minus';
    default:
      return 'circle';
  }
}

function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

// ── ExecutionPanel ──────────────────────────────────────

export function ExecutionPanel({ result, isOpen, onToggle }: ExecutionPanelProps) {
  const summary = useMemo(() => {
    if (!result) return null;
    const successCount = result.logs.filter((l) => l.status === 'success').length;
    const errorCount = result.logs.filter((l) => l.status === 'error').length;
    const skippedCount = result.logs.filter((l) => l.status === 'skipped').length;
    return { successCount, errorCount, skippedCount, total: result.logs.length };
  }, [result]);

  if (!result) return null;

  return (
    <div style={PANEL_STYLE}>
      {/* Toggle Bar */}
      <div style={TOGGLE_BAR_STYLE} onClick={onToggle} role="button" tabIndex={0}>
        <Icon
          name={isOpen ? 'chevron-down' : 'chevron-up'}
          size={14}
          color="#6b7280"
        />
        <Icon name="activity" size={14} color="#6b7280" />
        <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
          Execution Log
        </span>

        {/* Overall status */}
        <Badge variant={result.status === 'completed' ? 'success' : result.status === 'failed' ? 'danger' : 'warning'}>
          {result.status}
        </Badge>

        {/* Summary counts */}
        {summary && (
          <span style={{ fontSize: 12, color: '#6b7280' }}>
            {summary.total} node{summary.total !== 1 ? 's' : ''} &middot;{' '}
            {summary.successCount} passed &middot;{' '}
            {summary.errorCount} failed &middot;{' '}
            {summary.skippedCount} skipped
          </span>
        )}

        {/* Duration */}
        {result.duration != null && (
          <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 'auto' }}>
            Total: {formatMs(result.duration)}
          </span>
        )}
      </div>

      {/* Expanded Table */}
      {isOpen && (
        <div style={{ maxHeight: 240, overflowY: 'auto' }}>
          <table style={TABLE_STYLE}>
            <thead>
              <tr>
                <th style={TH_STYLE}>Status</th>
                <th style={TH_STYLE}>Node</th>
                <th style={TH_STYLE}>Start</th>
                <th style={TH_STYLE}>Duration</th>
                <th style={TH_STYLE}>Result / Error</th>
              </tr>
            </thead>
            <tbody>
              {result.logs.map((log, idx) => (
                <tr
                  key={`${log.nodeId}-${idx}`}
                  style={{
                    background: log.status === 'error' ? '#fef2f2' : undefined,
                  }}
                >
                  <td style={TD_STYLE}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Icon
                        name={getStatusIcon(log.status) as any}
                        size={14}
                        color={
                          log.status === 'success'
                            ? '#22c55e'
                            : log.status === 'error'
                              ? '#ef4444'
                              : '#9ca3af'
                        }
                      />
                      <Badge variant={getStatusBadgeVariant(log.status)}>
                        {log.status}
                      </Badge>
                    </div>
                  </td>
                  <td style={{ ...TD_STYLE, fontWeight: 500 }}>{log.nodeLabel}</td>
                  <td style={TD_STYLE}>{formatTimestamp(log.startTime)}</td>
                  <td style={TD_STYLE}>{formatMs(log.endTime - log.startTime)}</td>
                  <td style={{ ...TD_STYLE, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {log.error ? (
                      <span style={{ color: '#ef4444' }}>{log.error}</span>
                    ) : log.output != null ? (
                      <span style={{ color: '#6b7280', fontFamily: 'monospace', fontSize: 11 }}>
                        {typeof log.output === 'string' ? log.output : JSON.stringify(log.output)}
                      </span>
                    ) : (
                      <span style={{ color: '#d1d5db' }}>&mdash;</span>
                    )}
                  </td>
                </tr>
              ))}
              {result.logs.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ ...TD_STYLE, textAlign: 'center', color: '#9ca3af', padding: 16 }}>
                    No execution logs available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
