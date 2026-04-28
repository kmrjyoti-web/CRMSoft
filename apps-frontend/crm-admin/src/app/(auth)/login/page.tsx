'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getBrandConfig } from '@/lib/brand/registry';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { useBrandConfigContext } from '@/contexts/BrandConfigContext';
import DomainBrandLogin from '@/components/auth/DomainBrandLogin';

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const brandCode = searchParams.get('brand');

  // 1. Static registry brand (?brand=travvellis) takes precedence
  const staticBrand = getBrandConfig(brandCode);
  if (staticBrand) {
    const BrandLogin = staticBrand.loginComponent;
    return (
      <BrandLogin onSuccess={() => router.push(searchParams.get('redirect') ?? '/dashboard')} />
    );
  }

  // 2. Domain-based brand (auto-detected from hostname via BrandConfigProvider)
  return <DomainLoginFallback redirect={searchParams.get('redirect') ?? '/dashboard'} />;
}

function DomainLoginFallback({ redirect }: { redirect: string }) {
  const router = useRouter();
  const { config: domainBrand, loading } = useBrandConfigContext();

  if (loading) {
    return <div style={{ minHeight: '100dvh', background: '#0f172a' }} />;
  }

  // Domain brand detected — render branded login
  if (domainBrand.found) {
    return (
      <DomainBrandLogin
        brand={domainBrand}
        onSuccess={() => router.push(redirect)}
      />
    );
  }

  // Generic CRMSoft login
  return <LoginForm />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100dvh', background: '#0f172a' }} />}>
      <LoginContent />
    </Suspense>
  );
}
