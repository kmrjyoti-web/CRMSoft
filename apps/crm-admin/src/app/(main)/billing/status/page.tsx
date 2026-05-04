'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/services/api-client';

type StepStatus = 'COMPLETE' | 'IN_PROGRESS' | 'PENDING';

interface MigrationProgress {
  totalTables: number;
  completedTables: number;
  currentTable: string | null;
  totalRows: number;
  migratedRows: number;
}

interface ProvisioningStep {
  step: string;
  status: StepStatus;
  label: string;
  completedAt?: string;
  progress?: MigrationProgress;
}

interface ProvisioningStatus {
  tenantId: string;
  dbStrategy: string;
  steps: ProvisioningStep[];
  currentStep: string | null;
  estimatedTimeRemaining: number | null;
  startedAt: string | null;
  canRollback: boolean;
}

const GOLD = '#c9a25f';
const POLL_INTERVAL = 10_000;

const STEP_ICONS: Record<string, string> = {
  PAYMENT_RECEIVED:   '💳',
  DB_CREATED:         '🗄️',
  SCHEMA_INITIALIZED: '🏗️',
  DATA_MIGRATION:     '📦',
  ACTIVE:             '✅',
};

function formatSeconds(s: number): string {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${s % 60}s`;
}

function StepRow({ step, isLast }: { step: ProvisioningStep; isLast: boolean }) {
  const isComplete  = step.status === 'COMPLETE';
  const isActive    = step.status === 'IN_PROGRESS';
  const isPending   = step.status === 'PENDING';
  const prog        = step.progress;
  const pct         = prog && prog.totalRows > 0
    ? Math.round((prog.migratedRows / prog.totalRows) * 100)
    : 0;

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      {/* Spine */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: isComplete ? 16 : 14,
          background: isComplete ? '#dcfce7' : isActive ? `${GOLD}22` : '#f1f5f9',
          border: `2px solid ${isComplete ? '#16a34a' : isActive ? GOLD : '#e2e8f0'}`,
          color: isComplete ? '#16a34a' : isActive ? GOLD : '#94a3b8',
          transition: 'all 0.3s',
          flexShrink: 0,
        }}>
          {isComplete ? '✓' : isActive ? (
            <div style={{
              width: 12, height: 12, borderRadius: '50%',
              border: `2px solid ${GOLD}`, borderTopColor: 'transparent',
              animation: 'spin 0.8s linear infinite',
            }} />
          ) : STEP_ICONS[step.step] ?? '○'}
        </div>
        {!isLast && (
          <div style={{
            width: 2, flex: 1, minHeight: 24,
            background: isComplete ? '#16a34a' : '#e2e8f0',
            margin: '4px 0',
            transition: 'background 0.5s',
          }} />
        )}
      </div>

      {/* Content */}
      <div style={{ paddingBottom: isLast ? 0 : 28, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{
            fontSize: 15, fontWeight: 600,
            color: isComplete ? '#0f172a' : isActive ? '#0f172a' : '#94a3b8',
          }}>
            {step.label}
          </span>
          {isActive && (
            <span style={{
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5,
              background: `${GOLD}22`, color: GOLD, padding: '2px 8px', borderRadius: 4,
            }}>
              In progress
            </span>
          )}
        </div>

        {/* Data migration progress bar */}
        {step.step === 'DATA_MIGRATION' && isActive && prog && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>
              {prog.currentTable
                ? `Migrating: ${prog.currentTable}`
                : `Table ${prog.completedTables} of ${prog.totalTables}`}
              {prog.totalRows > 0 && ` — ${prog.migratedRows.toLocaleString()} / ${prog.totalRows.toLocaleString()} rows`}
            </div>
            <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 3,
                background: `linear-gradient(90deg, ${GOLD} 0%, ${GOLD}cc 100%)`,
                width: `${pct}%`,
                transition: 'width 1s ease',
              }} />
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
              {pct}% complete
            </div>
          </div>
        )}

        {/* Table count for complete migration */}
        {step.step === 'DATA_MIGRATION' && isComplete && prog && (
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
            {prog.migratedRows.toLocaleString()} rows migrated across {prog.totalTables} tables
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProvisioningStatusPage() {
  const [status, setStatus] = useState<ProvisioningStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await api.get('/api/v1/tenant/billing/provisioning/status');
      const data = res.data?.data as ProvisioningStatus;
      setStatus(data);
      setError(null);

      // Auto-reload when provisioning completes
      if (data.dbStrategy === 'DEDICATED' && data.steps.every((s) => s.status === 'COMPLETE')) {
        setTimeout(() => { window.location.reload(); }, 3000);
      }
    } catch {
      setError('Failed to load provisioning status.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const allDone = status?.steps.every((s) => s.status === 'COMPLETE') ?? false;
  const hasActive = status?.steps.some((s) => s.status === 'IN_PROGRESS') ?? false;

  return (
    <div style={{ padding: '32px 24px', maxWidth: 640, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 8px', color: '#0f172a' }}>
          Account Setup Progress
        </h1>
        <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
          {allDone
            ? 'Your dedicated workspace is ready!'
            : hasActive
              ? 'Setting up your workspace. This may take a few minutes.'
              : 'Provisioning your dedicated database environment.'}
        </p>
      </div>

      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
          padding: '12px 16px', marginBottom: 24, fontSize: 14, color: '#dc2626',
        }}>
          {error}
          <button
            onClick={fetchStatus}
            style={{ marginLeft: 12, color: '#c9a25f', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            Retry
          </button>
        </div>
      )}

      {loading && !status && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            border: '3px solid #e2e8f0', borderTopColor: GOLD,
            animation: 'spin 0.8s linear infinite',
          }} />
        </div>
      )}

      {status && (
        <>
          {/* Steps */}
          <div style={{
            background: '#fff',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: 16,
            padding: '28px 24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            marginBottom: 24,
          }}>
            {status.steps.map((step, i) => (
              <StepRow key={step.step} step={step} isLast={i === status.steps.length - 1} />
            ))}
          </div>

          {/* ETA */}
          {status.estimatedTimeRemaining !== null && hasActive && (
            <div style={{
              background: `${GOLD}12`, border: `1px solid ${GOLD}33`, borderRadius: 10,
              padding: '12px 16px', fontSize: 13, color: '#92400e',
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20,
            }}>
              <span>⏱</span>
              Estimated time remaining: ~{formatSeconds(status.estimatedTimeRemaining)}
            </div>
          )}

          {/* All done */}
          {allDone && (
            <div style={{
              background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12,
              padding: '16px 20px', fontSize: 14, color: '#15803d', fontWeight: 600,
              textAlign: 'center', marginBottom: 20,
            }}>
              🎉 Your account is ready! Refreshing shortly…
            </div>
          )}

          {/* Auto-refresh note */}
          {hasActive && (
            <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', margin: 0 }}>
              Auto-refreshing every 10 seconds
            </p>
          )}

          {/* Manual refresh */}
          {!hasActive && !allDone && (
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={fetchStatus}
                style={{
                  background: 'none', border: `1.5px solid ${GOLD}`, borderRadius: 8,
                  color: GOLD, fontSize: 13, fontWeight: 600, padding: '8px 20px',
                  cursor: 'pointer',
                }}
              >
                Refresh status
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
