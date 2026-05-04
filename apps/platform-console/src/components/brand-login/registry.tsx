import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

type LoginProps = {
  brandName?: string;
  onSuccess?: () => void;
};

type RegistryEntry = {
  component: ComponentType<LoginProps>;
};

const registry: Record<string, RegistryEntry> = {
  TravvellisLogin: {
    component: dynamic(
      () => import('./brands/travvellis/TravvellisLogin'),
      { ssr: false, loading: () => <LoginSkeleton /> },
    ),
  },
};

function LoginSkeleton() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f172a',
      }}
    >
      <div
        style={{
          width: 440,
          height: 520,
          background: '#1e293b',
          borderRadius: 12,
          animation: 'pulse 1.5s ease-in-out infinite',
        }}
      />
    </div>
  );
}

export function resolveLoginComponent(componentKey: string | null | undefined): ComponentType<LoginProps> | null {
  if (!componentKey) return null;
  return registry[componentKey]?.component ?? null;
}
