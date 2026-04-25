'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { getBrandConfig, type BrandConfig } from '@/lib/brand/registry';

export function useBrandContext() {
  const searchParams = useSearchParams();
  const brandCode = searchParams.get('brand')?.toLowerCase() ?? null;

  const config = useMemo<BrandConfig | null>(() => getBrandConfig(brandCode), [brandCode]);

  /**
   * Build a URL that preserves the current brand context.
   *   buildBrandUrl('/register') → '/register?brand=travvellis'  (brand active)
   *   buildBrandUrl('/register') → '/register'                    (no brand)
   */
  const buildBrandUrl = (path: string): string => {
    if (!brandCode) return path;
    const sep = path.includes('?') ? '&' : '?';
    return `${path}${sep}brand=${brandCode}`;
  };

  return {
    brandCode,
    config,
    isBranded: !!config,
    colors: config?.colors ?? null,
    fonts: config?.fonts ?? null,
    buildBrandUrl,
  };
}
