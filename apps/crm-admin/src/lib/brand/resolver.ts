'use client';

import { getBrandConfig } from './registry';

/**
 * Hostname → brand code mappings for production deployments.
 * Each brand gets its own domain; add entries here when new brands go live.
 */
const HOSTNAME_BRAND_MAP: Record<string, string> = {
  'travvellis.com':        'travvellis',
  'www.travvellis.com':    'travvellis',
  'app.travvellis.com':    'travvellis',
  'travvellis.crmsoft.com': 'travvellis',
  // 'techbrand.com':      'techbrand',
  // 'softbrand.com':      'softbrand',
  // 'retailbrand.com':    'retailbrand',
  // 'restaurantbrand.com': 'restaurantbrand',
};

/**
 * Resolve brand code using the following priority:
 *   1. Hostname match  (production: travvellis.com → travvellis)
 *   2. NEXT_PUBLIC_DEFAULT_BRAND env var  (per-deployment override)
 *   3. URL ?brand= param  (development / multi-brand testing)
 *   4. null  (generic mode — shows brand picker)
 */
export function resolveBrand(
  hostname?: string,
  searchParam?: string | null,
): string | null {
  if (hostname) {
    const clean = hostname.replace(/^www\./, '').toLowerCase();
    if (HOSTNAME_BRAND_MAP[clean]) return HOSTNAME_BRAND_MAP[clean];
  }

  const envBrand = process.env.NEXT_PUBLIC_DEFAULT_BRAND;
  if (envBrand) return envBrand.toLowerCase();

  if (searchParam) return searchParam.toLowerCase();

  return null;
}

/**
 * Convenience: resolve brand and return config or null.
 */
export function resolveAndGetBrand(hostname?: string, searchParam?: string | null) {
  return getBrandConfig(resolveBrand(hostname, searchParam));
}
