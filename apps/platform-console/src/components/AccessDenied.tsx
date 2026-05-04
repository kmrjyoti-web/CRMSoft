'use client';

import { useRouter } from 'next/navigation';
import { Lock, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { useBrand } from '@/contexts/BrandContext';

interface Props {
  pageCode?: string;
  message?: string;
}

export function AccessDenied({ pageCode, message }: Props) {
  const router = useRouter();
  const { brand } = useBrand();
  const accentColor = brand?.theme.primaryColor ?? '#1a73e8';
  const brandParam = brand ? `?brand=${brand.code}` : '';

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', padding: '40px 24px', textAlign: 'center',
      fontFamily: 'var(--brand-font-body)',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 16,
        background: `${accentColor}15`, display: 'flex', alignItems: 'center',
        justifyContent: 'center', marginBottom: 20,
        border: `1px solid ${accentColor}30`,
      }}>
        <Lock size={28} style={{ color: accentColor }} />
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--brand-text)', margin: '0 0 8px', fontFamily: 'var(--brand-font-heading)' }}>
        Access Restricted
      </h2>
      <p style={{ fontSize: 14, color: 'var(--brand-text-muted)', maxWidth: 360, margin: '0 0 28px', lineHeight: 1.6 }}>
        {message ?? "You don't have permission to view this page. Your account type may not include access to this section."}
      </p>

      {pageCode && (
        <code style={{ fontSize: 11, color: 'var(--brand-text-subtle)', fontFamily: 'monospace', marginBottom: 24, display: 'block' }}>
          {pageCode}
        </code>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={() => router.back()}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
            background: 'transparent', border: `1px solid var(--brand-border)`,
            borderRadius: 8, color: 'var(--brand-text-muted)', fontSize: 13, cursor: 'pointer',
          }}
        >
          <ArrowLeft size={14} /> Go Back
        </button>
        <button
          onClick={() => router.push(`/self-care${brandParam}`)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
            background: accentColor, border: 'none',
            borderRadius: 8, color: '#0f172a', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}
        >
          <LayoutDashboard size={14} /> Dashboard
        </button>
      </div>
    </div>
  );
}
