'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { BrandContextProvider } from '@/hooks/auth/useBrandContext';
import BrandLoginResolver from '@/components/brand-login/BrandLoginResolver';

function LoginInner() {
  const params = useSearchParams();
  const router = useRouter();
  const brandCode = params.get('brand');

  function handleSuccess() {
    const redirect = params.get('redirect') ?? '/dashboard';
    router.push(redirect);
  }

  return (
    <BrandContextProvider brandCode={brandCode}>
      <BrandLoginResolver onSuccess={handleSuccess} />
    </BrandContextProvider>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100dvh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0d1117',
          }}
        />
      }
    >
      <LoginInner />
    </Suspense>
  );
}
