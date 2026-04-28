'use client';

import dynamic from 'next/dynamic';
import type { VisualBrandConfig } from '@/hooks/useBrandConfig';

const GenericRegister = dynamic(() => import('@/components/auth/GenericRegister'), { ssr: false });

interface Props {
  brand: VisualBrandConfig;
}

/**
 * Registration page for white-label tenants accessed via their custom domain.
 * Shows the brand logo and colors, delegates the actual form to GenericRegister.
 */
export default function DomainBrandRegister({ brand }: Props) {
  const primary = brand.primaryColor;
  const secondary = brand.secondaryColor;

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: `linear-gradient(135deg, ${secondary}22 0%, #0a0d1a 100%)`,
        padding: '40px 20px',
      }}
    >
      {/* Brand header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        {brand.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={brand.logoUrl}
            alt={brand.displayName ?? ''}
            style={{ height: 40, objectFit: 'contain', margin: '0 auto 16px', display: 'block' }}
          />
        ) : (
          <div
            style={{
              width: 48, height: 48, borderRadius: 12, background: primary,
              margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <span style={{ color: '#fff', fontSize: 22, fontWeight: 700 }}>
              {(brand.displayName ?? brand.brandName ?? 'B')[0].toUpperCase()}
            </span>
          </div>
        )}
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: '0 0 6px' }}>
          Create your account
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.85)', margin: 0 }}>
          {brand.displayName ?? brand.brandName ?? 'Join us today'}
        </p>
      </div>

      {/* Delegate to the dynamic register form */}
      <GenericRegister />
    </div>
  );
}
