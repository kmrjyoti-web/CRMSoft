'use client';

import { useBrand } from '@/contexts/BrandContext';

interface Props {
  height?: number;
  className?: string;
}

export function BrandLogo({ height = 36, className = '' }: Props) {
  const { brand, loading } = useBrand();

  if (loading) {
    return (
      <div
        style={{ height, width: 140, background: 'rgba(255,255,255,0.08)', borderRadius: 6, animation: 'pulse 1.5s infinite' }}
        className={className}
      />
    );
  }

  if (brand?.logoUrl) {
    return (
      <img
        src={brand.logoUrl}
        alt={brand.name}
        style={{ height, width: 'auto', display: 'block' }}
        className={className}
      />
    );
  }

  return (
    <span
      style={{
        fontSize: height * 0.55,
        fontWeight: 700,
        color: 'var(--brand-primary)',
        fontFamily: 'var(--brand-font-heading)',
        lineHeight: 1,
        display: 'block',
      }}
      className={className}
    >
      {brand?.name ?? 'CRMSoft'}
    </span>
  );
}
