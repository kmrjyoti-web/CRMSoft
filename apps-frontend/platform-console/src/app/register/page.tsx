'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DynamicRegistrationWizard from '@/components/registration/DynamicRegistrationWizard';

const BRAND_DISPLAY: Record<string, { logoText: string; accentColor: string }> = {
  travvellis: { logoText: 'Travvellis', accentColor: '#d4b878' },
  default:    { logoText: 'CRMSoft',   accentColor: '#58a6ff' },
};

function RegisterInner() {
  const searchParams = useSearchParams();
  const brand = (searchParams.get('brand') ?? 'default').toLowerCase();
  const cc    = searchParams.get('cc') ?? undefined;

  const { logoText, accentColor } = BRAND_DISPLAY[brand] ?? BRAND_DISPLAY.default;

  return (
    <DynamicRegistrationWizard
      brandCode={brand}
      initialCombinedCode={cc}
      accentColor={accentColor}
      logoText={logoText}
    />
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100dvh', background: '#0f172a' }} />}>
      <RegisterInner />
    </Suspense>
  );
}
