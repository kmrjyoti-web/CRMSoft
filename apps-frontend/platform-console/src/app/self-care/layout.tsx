'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BrandProvider } from '@/contexts/BrandContext';

function BrandShell({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const brandCode = (searchParams.get('brand') ?? 'default').toLowerCase();

  return (
    <BrandProvider brandCode={brandCode}>
      <div style={{ minHeight: '100dvh', background: 'var(--brand-bg)', color: 'var(--brand-text)', fontFamily: 'var(--brand-font-body)' }}>
        {children}
      </div>
    </BrandProvider>
  );
}

export default function SelfCareLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div style={{ minHeight: '100dvh', background: '#0f172a' }} />}>
      <BrandShell>{children}</BrandShell>
    </Suspense>
  );
}
