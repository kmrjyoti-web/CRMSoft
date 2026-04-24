'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { BrandContextProvider } from '@/hooks/auth/useBrandContext';
import BrandLoginResolver from '@/components/brand-login/BrandLoginResolver';
import { LoginForm } from '@/features/auth/components/LoginForm';

function LoginInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const brandCode = searchParams.get('brand');

  function handleSuccess() {
    const redirect = searchParams.get('redirect') ?? '/dashboard';
    router.push(redirect);
  }

  if (!brandCode) {
    return <LoginForm />;
  }

  return (
    <BrandContextProvider brandCode={brandCode}>
      <BrandLoginResolver onSuccess={handleSuccess} />
    </BrandContextProvider>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100dvh', background: '#0f172a' }} />}>
      <LoginInner />
    </Suspense>
  );
}
