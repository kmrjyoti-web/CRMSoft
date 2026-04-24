'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BrandContextProvider, useBrandContext } from '@/hooks/auth/useBrandContext';
import { getBrandRegisterComponent } from '@/components/brand-login/register-registry';

function RegisterResolver() {
  const { brand } = useBrandContext();
  const componentKey = brand?.customLoginComponent?.replace('Login', 'Register') ?? 'DefaultRegister';
  const Component = getBrandRegisterComponent(componentKey);
  return <Component />;
}

function RegisterInner() {
  const searchParams = useSearchParams();
  const brandCode = searchParams.get('brand');

  return (
    <BrandContextProvider brandCode={brandCode}>
      <RegisterResolver />
    </BrandContextProvider>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ background: '#0f172a', minHeight: '100dvh' }} />}>
      <RegisterInner />
    </Suspense>
  );
}
