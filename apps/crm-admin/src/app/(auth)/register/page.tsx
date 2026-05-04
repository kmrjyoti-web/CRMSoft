'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getBrandConfig } from '@/lib/brand/registry';
import { useBrandConfigContext } from '@/contexts/BrandConfigContext';
import DomainBrandRegister from '@/components/auth/DomainBrandRegister';

const GenericRegister = dynamic(() => import('@/components/auth/GenericRegister'), { ssr: false });

function RegisterContent() {
  const searchParams = useSearchParams();
  const brand = getBrandConfig(searchParams.get('brand'));

  // 1. Static registry brand (?brand=travvellis) takes precedence
  if (brand) {
    const BrandRegister = brand.registerComponent;
    return <BrandRegister />;
  }

  // 2. Domain-based brand (auto-detected from hostname via BrandConfigProvider)
  return <DomainRegisterFallback />;
}

function DomainRegisterFallback() {
  const { config: domainBrand, loading } = useBrandConfigContext();

  if (loading) {
    return <div style={{ minHeight: '100dvh', background: '#0f172a' }} />;
  }

  if (domainBrand.found) {
    return <DomainBrandRegister brand={domainBrand} />;
  }

  return <GenericRegister />;
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100dvh', background: '#0f172a' }} />}>
      <RegisterContent />
    </Suspense>
  );
}
