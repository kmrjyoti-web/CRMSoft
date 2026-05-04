'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function StageProfileRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.push('/profile/setup');
  }, [router]);

  return (
    <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
      <p style={{ fontSize: 14 }}>Almost there — redirecting to profile setup…</p>
    </div>
  );
}
