'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DynamicOnboardingWizard from '@/components/onboarding/DynamicOnboardingWizard';

const BRAND_DISPLAY: Record<string, { logoText: string; accentColor: string }> = {
  travvellis: { logoText: 'Travvellis', accentColor: '#d4b878' },
  default:    { logoText: 'CRMSoft',   accentColor: '#58a6ff' },
};

function OnboardingInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const brand = (searchParams.get('brand') ?? 'default').toLowerCase();

  const [token, setToken] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('portal_token');
    if (!stored) {
      router.replace(`/portal-login?brand=${brand}&returnUrl=/onboarding?brand=${brand}`);
    } else {
      setToken(stored);
    }
    setChecked(true);
  }, [router, brand]);

  if (!checked || !token) {
    return <div style={{ minHeight: '100dvh', background: '#0f172a' }} />;
  }

  const { logoText, accentColor } = BRAND_DISPLAY[brand] ?? BRAND_DISPLAY.default;

  const handleDone = () => {
    router.replace(`/self-care?brand=${brand}`);
  };

  return (
    <DynamicOnboardingWizard
      token={token}
      brand={brand}
      accentColor={accentColor}
      logoText={logoText}
      onDone={handleDone}
    />
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100dvh', background: '#0f172a' }} />}>
      <OnboardingInner />
    </Suspense>
  );
}
