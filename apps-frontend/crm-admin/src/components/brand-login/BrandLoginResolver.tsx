'use client';

import { useBrandContext } from '@/hooks/auth/useBrandContext';
import { resolveLoginComponent } from './registry';
import DefaultLogin from './DefaultLogin';

type Props = {
  onSuccess?: () => void;
};

export default function BrandLoginResolver({ onSuccess }: Props) {
  const { brand, isLoading, error } = useBrandContext();

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0d1117',
        }}
      >
        <div
          style={{
            width: 360,
            height: 480,
            background: '#161b22',
            borderRadius: 12,
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
      </div>
    );
  }

  if (error || !brand) {
    return <DefaultLogin onSuccess={onSuccess} />;
  }

  const BrandComponent = resolveLoginComponent(brand.customLoginComponent);

  if (!BrandComponent) {
    return <DefaultLogin brandName={brand.displayName} onSuccess={onSuccess} />;
  }

  return <BrandComponent brandName={brand.displayName} onSuccess={onSuccess} />;
}
