'use client';

import { useMemo } from 'react';

import { Icon, Button, Badge } from '@/components/ui';

import type { WorkflowExecutionResult, WorkflowExecutionLog } from '../../types/visual-workflow.types';

// ── Props ───────────────────────────────────────────────

export interface MockResultsPanelProps {
  result: WorkflowExecutionResult | null;
  isOpen: boolean;
  onToggle: () => void;
  onRerun: () => void;
}

// ── Styles ──────────────────────────────────────────────

const PANEL_STYLE: React.CSSProperties = {
  background: '#fff',
  borderTop: '2px solid #e5e7eb',
  flexShrink: 0,
};

const HEADER_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '8px 16px',
  cursor: 'pointer',
  userSelect: 'none',
  background: '#f9fafb',
  borderBottom: '1px solid #f3f4f6',
};

const BODY_STYLE: React.CSSProperties = {
  height: 240,
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
};

const TABLE_STYLE: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 12,
  flex: 1,
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
  position: 'sticky',
  top: 0,
  zIndex: 1,
};

const TD_STYLE: React.CSSProperties = {
  padding: '6px 12px',
  borderBottom: '1px solid #f3f4f6',
  color: '#374151',
};

const SUMMARY_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 16px',
  background: '#f9fafb',
  borderTop: '1px solid #e5e7eb',
  fontSize: 12,
  color: '#6b7280',
};

// ── Helpers ─────────────────────────────────────────────

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

function formatTimestamp(ts: string | undefined): string {
  if (!ts) return '--:--:--';
  return new Date(ts).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

// ── MockResultsPanel ──────────────────────────────────

export function MockResultsPanel({ result, isOpen, onToggle, onRerun }: MockResultsPanelProps) {
  const summary = useMemo(() => {
    if (!result) return null;
    const passed = result.logs.filter((l) => l.status === 'success').length;
    const failed = result.logs.filter((l) => l.status === 'error').length;
    const skipped = result.logs.filter((l) => l.status === 'skipped').length;
    return { passed, failed, skipped, total: result.logs.length };
  }, [result]);

  if (!result) return null;

  const overallPassed = result.status === 'completed';

  return (
    <div style={PANEL_STYLE}>
      {/* Header / Toggle Bar */}
      <div style={HEADER_STYLE} onClick={onToggle} role="button" tabIndex={0}>
        <Icon
          name={isOpen ? 'chevron-down' : 'chevron-up'}
          size={14}
          color="#6b7280"
        />
        <Icon name="check-square" size={14} color="#6b7280" />
        <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
          Test Results
        </span>

        {/* Overall status badge */}
        <Badge variant={overallPassed ? 'success' : 'danger'}>
          {overallPassed ? 'Passed' : 'Failed'}
        </Badge>

        {/* Duration */}
        {result.duration != null && (
          <span style={{ fontSize: 12, color: '#9ca3af' }}>
            {formatMs(result.duration)}
          </span>
        )}

        {/* Actions on the right */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }} onClick={(e) => e.stopPropagation()}>
          <Button variant="outline" size="sm" onClick={onRerun}>
            <Icon name="play" size={14} />
            <span style={{ marginLeft: 4 }}>Re-run</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            <Icon name="x" size={14} />
          </Button>
        </div>
      </div>

      {/* Expanded Body */}
      {isOpen && (
        <>
          <div style={BODY_STYLE}>
            <table style={TABLE_STYLE}>
              <thead>
                <tr>
                  <th style={TH_STYLE}>Node</th>
                  <th style={{ ...TH_STYLE, width: 90 }}>Status</th>
                  <th style={{ ...TH_STYLE, width: 80 }}>Duration</th>
                  <th style={TH_STYLE}>Output / Error</th>
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
                    <td style={{ ...TD_STYLE, fontWeight: 500 }}>{log.nodeLabel}</td>
                    <td style={TD_STYLE}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Icon
                          name={getStatusIcon(log.status) as any}
                          size={13}
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
                    <td style={TD_STYLE}>{formatMs(log.endTime - log.startTime)}</td>
                    <td
                      style={{
                        ...TD_STYLE,
                        maxWidth: 320,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {log.error ? (
                        <span style={{ color: '#ef4444' }}>{log.error}</span>
                      ) : log.output != null ? (
                        <span
                          style={{
                            color: '#6b7280',
                            fontFamily: 'monospace',
                            fontSize: 11,
                          }}
                        >
                          {typeof log.output === 'string'
                            ? log.output
                            : JSON.stringify(log.output)}
                        </span>
                      ) : (
                        <span style={{ color: '#d1d5db' }}>&mdash;</span>
                      )}
                    </td>
                  </tr>
                ))}
                {result.logs.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      style={{ ...TD_STYLE, textAlign: 'center', color: '#9ca3af', padding: 24 }}
                    >
                      No execution logs available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Summary Bar */}
          {summary && (
            <div style={SUMMARY_STYLE}>
              <span>
                {summary.passed}/{summary.total} nodes passed &bull; Duration: {formatMs(result.duration || 0)} &bull; Executed at: {formatTimestamp(result.startedAt)}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
