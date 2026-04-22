'use client';

import { MyErrorReports } from '@/features/error-report/MyErrorReports';

export default function MyReportsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <nav style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>
          Settings &rsaquo; My Reports
        </nav>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>
          My Error Reports
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
          Issues you have submitted to our support team.
        </p>
      </div>
      <MyErrorReports />
    </div>
  );
}
