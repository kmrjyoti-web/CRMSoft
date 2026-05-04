'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

type LoginProps = {
  brandName?: string;
  onSuccess?: () => void;
};

function LoginSkeleton() {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
      <div style={{ width: 440, height: 520, background: '#1e293b', borderRadius: 12 }} />
    </div>
  );
}

const registry: Record<string, ComponentType<LoginProps>> = {
  TravvellisLogin: dynamic(
    () => import('./brands/travvellis/TravvellisLogin'),
    { ssr: false, loading: () => <LoginSkeleton /> },
  ),
};

export function resolveLoginComponent(componentKey: string | null | undefined): ComponentType<LoginProps> | null {
  if (!componentKey) return null;
  return registry[componentKey] ?? null;
}
