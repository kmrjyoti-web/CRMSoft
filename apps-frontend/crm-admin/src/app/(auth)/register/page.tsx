'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BrandContextProvider, useBrandContext } from '@/hooks/auth/useBrandContext';
import { getBrandRegisterComponent } from '@/components/brand-login/register-registry';
import { RegisterForm } from '@/features/registration/components/RegisterForm';

function RegisterResolver() {
  const { brand } = useBrandContext();
  const componentKey = brand?.customLoginComponent?.replace('Login', 'Register') ?? null;
  const Component = getBrandRegisterComponent(componentKey);
  return <Component />;
}

function RegisterInner() {
  const searchParams = useSearchParams();
  const brandCode = searchParams.get('brand');

  if (!brandCode) {
    return <RegisterForm />;
  }

  return (
    <BrandContextProvider brandCode={brandCode}>
      <RegisterResolver />
    </BrandContextProvider>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100dvh', background: '#0f172a' }} />}>
      <RegisterInner />
    </Suspense>
  );
}
