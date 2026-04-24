'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const CRM_PORTAL = process.env.NEXT_PUBLIC_CRM_PORTAL_URL ?? 'http://localhost:3005';

function RegisterRedirectInner() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const brand = searchParams.get('brand');
    const params = new URLSearchParams();
    if (brand) params.set('brand', brand);
    const qs = params.toString();
    window.location.replace(`${CRM_PORTAL}/register${qs ? `?${qs}` : ''}`);
  }, [searchParams]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', background: '#0f172a', color: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ opacity: 0.6 }}>Redirecting to CRM Portal…</p>
        <p style={{ fontSize: 13, marginTop: 8, opacity: 0.4 }}>
          <a href={`${CRM_PORTAL}/register`} style={{ color: '#d4b878' }}>Click here</a> if not redirected automatically.
        </p>
      </div>
    </div>
  );
}

export default function RegisterRedirectPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100dvh', background: '#0f172a' }} />}>
      <RegisterRedirectInner />
    </Suspense>
  );
}
