'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

function RegisterSkeleton() {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
      <div style={{ width: 440, height: 520, background: '#1e293b', borderRadius: 12 }} />
    </div>
  );
}

const TravvellisRegister = dynamic(
  () => import('./brands/travvellis/register/TravvellisRegister'),
  { ssr: false, loading: () => <RegisterSkeleton /> },
);

const DefaultRegister = dynamic(
  () => import('./DefaultRegister'),
  { ssr: false },
);

export const BRAND_REGISTER_REGISTRY: Record<string, ComponentType<any>> = {
  TravvellisRegister,
  DefaultRegister,
};

export function getBrandRegisterComponent(key: string | null | undefined): ComponentType<any> {
  if (!key) return BRAND_REGISTER_REGISTRY.DefaultRegister;
  return BRAND_REGISTER_REGISTRY[key] ?? BRAND_REGISTER_REGISTRY.DefaultRegister;
}
