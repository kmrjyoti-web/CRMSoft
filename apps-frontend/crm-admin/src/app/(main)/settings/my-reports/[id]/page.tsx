'use client';

import { ErrorReportDetail } from '@/features/error-report/ErrorReportDetail';
import { useRouter } from 'next/navigation';

export default function ReportDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <nav style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>
          <button
            onClick={() => router.push('/settings/my-reports')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#9ca3af', fontSize: 12 }}
          >
            Settings
          </button>
          {' \u203a '}
          <button
            onClick={() => router.push('/settings/my-reports')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#9ca3af', fontSize: 12 }}
          >
            My Reports
          </button>
          {' \u203a '} Report Detail
        </nav>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>
          Report Detail
        </h1>
      </div>
      <ErrorReportDetail id={params.id} />
    </div>
  );
}
