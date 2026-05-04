'use client';

import { useReportById } from './useErrorReport';
import type { ErrorReportStatus, ErrorReportSeverity } from './error-report.service';
import { formatDate } from '@/lib/format-date';
import { Badge } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const STATUS_BADGE: Record<ErrorReportStatus, 'warning' | 'secondary' | 'success' | 'danger'> = {
  OPEN: 'warning',
  ACKNOWLEDGED: 'secondary',
  RESOLVED: 'success',
  ESCALATED: 'danger',
};

const SEVERITY_BADGE: Record<ErrorReportSeverity, 'danger' | 'warning' | 'secondary' | 'default'> = {
  CRITICAL: 'danger',
  HIGH: 'warning',
  MEDIUM: 'secondary',
  LOW: 'default',
};

interface ErrorReportDetailProps {
  id: string;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      style={{
        borderBottom: '1px solid #f3f4f6',
        paddingBottom: 12,
        marginBottom: 12,
        display: 'grid',
        gridTemplateColumns: '140px 1fr',
        gap: 8,
        alignItems: 'flex-start',
      }}
    >
      <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 14, color: '#1f2937' }}>{value}</span>
    </div>
  );
}

export function ErrorReportDetail({ id }: ErrorReportDetailProps) {
  const { data: report, isLoading, isError } = useReportById(id);
  const router = useRouter();

  if (isLoading) {
    return (
      <div style={{ padding: 24 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{ height: 40, background: '#f3f4f6', borderRadius: 6, marginBottom: 12, animation: 'pulse 1.5s infinite' }}
          />
        ))}
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div style={{ padding: 24, color: '#ef4444', fontSize: 14 }}>
        Report not found or failed to load.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <button
        onClick={() => router.back()}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 13,
          color: '#6b7280',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          marginBottom: 20,
        }}
      >
        <ArrowLeft size={14} /> Back
      </button>

      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <Badge variant={SEVERITY_BADGE[report.severity] ?? 'default'}>{report.severity}</Badge>
          <Badge variant={STATUS_BADGE[report.status] ?? 'default'}>{report.status}</Badge>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0, flex: 1 }}>
            {report.title}
          </h2>
        </div>

        <Field label="Description" value={<span style={{ whiteSpace: 'pre-wrap' }}>{report.description}</span>} />
        {report.errorCode && (
          <Field
            label="Error Code"
            value={
              <code style={{ fontSize: 13, background: '#f3f4f6', padding: '2px 8px', borderRadius: 4 }}>
                {report.errorCode}
              </code>
            }
          />
        )}
        <Field label="Severity" value={<Badge variant={SEVERITY_BADGE[report.severity] ?? 'default'}>{report.severity}</Badge>} />
        <Field label="Status" value={<Badge variant={STATUS_BADGE[report.status] ?? 'default'}>{report.status}</Badge>} />
        <Field label="Created At" value={formatDate(report.createdAt)} />
        <Field label="Updated At" value={formatDate(report.updatedAt)} />

        {report.screenshotUrl && (
          <Field
            label="Screenshot"
            value={
              <a
                href={report.screenshotUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#2563eb', fontSize: 13 }}
              >
                View Screenshot
              </a>
            }
          />
        )}

        {report.resolution && (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 6,
            }}
          >
            <p style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, marginBottom: 4 }}>
              RESOLUTION
            </p>
            <p style={{ fontSize: 14, color: '#1f2937', whiteSpace: 'pre-wrap' }}>
              {report.resolution}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
