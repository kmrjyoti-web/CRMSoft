'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ArrowLeft, Settings } from 'lucide-react';
import { PageGuard } from '@/components/PageGuard';
import { useBrand } from '@/contexts/BrandContext';

function SettingsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const brand = searchParams.get('brand') ?? 'default';
  const { brand: brandConfig } = useBrand();
  const accentColor = brandConfig?.theme.primaryColor ?? '#1a73e8';

  return (
    <PageGuard pageCode="SELF_CARE_SETTINGS">
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px', fontFamily: 'var(--brand-font-body)' }}>
        <button
          onClick={() => router.push(`/self-care?brand=${brand}`)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--brand-text-muted)', fontSize: 13, cursor: 'pointer', marginBottom: 24, padding: 0 }}
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: `${accentColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accentColor }}>
            <Settings size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--brand-text)', margin: 0, fontFamily: 'var(--brand-font-heading)' }}>Account Settings</h1>
            <p style={{ fontSize: 13, color: 'var(--brand-text-muted)', margin: 0 }}>Notifications, security and preferences</p>
          </div>
        </div>

        <div style={{ background: 'var(--brand-card-bg)', border: '1px solid var(--brand-card-border)', borderRadius: 10, padding: 24, boxShadow: 'var(--brand-card-shadow)' }}>
          <p style={{ color: 'var(--brand-text-muted)', fontSize: 14 }}>Account settings management coming soon.</p>
        </div>
      </div>
    </PageGuard>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '60vh' }} />}>
      <SettingsInner />
    </Suspense>
  );
}
