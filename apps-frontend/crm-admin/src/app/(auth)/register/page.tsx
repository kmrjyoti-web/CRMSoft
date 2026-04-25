'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getBrandConfig } from '@/lib/brand/registry';

const GenericRegister = dynamic(() => import('@/components/auth/GenericRegister'), { ssr: false });

function RegisterContent() {
  const searchParams = useSearchParams();
  const brand = getBrandConfig(searchParams.get('brand'));

  if (brand) {
    const BrandRegister = brand.registerComponent;
    return <BrandRegister />;
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
