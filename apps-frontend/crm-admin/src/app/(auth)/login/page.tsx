'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getBrandConfig } from '@/lib/brand/registry';
import { LoginForm } from '@/features/auth/components/LoginForm';

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const brandCode = searchParams.get('brand');
  const brand = getBrandConfig(brandCode);

  function handleSuccess() {
    router.push(searchParams.get('redirect') ?? '/dashboard');
  }

  if (brand) {
    const BrandLogin = brand.loginComponent;
    return <BrandLogin onSuccess={handleSuccess} />;
  }

  return <LoginForm />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100dvh', background: '#0f172a' }} />}>
      <LoginContent />
    </Suspense>
  );
}
