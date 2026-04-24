'use client';

/**
 * Brand Registry — Static Code-Based (no API calls)
 *
 * To add a new brand:
 * 1. Create src/components/brands/<code>/BrandLogin.tsx + BrandRegister.tsx
 * 2. Add an entry to BRAND_REGISTRY below
 * 3. Route /login?brand=<code> works automatically
 *
 * Future verticals: ELECTRONIC, SOFTWARE, RETAIL, RESTAURANT — same pattern.
 */

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

export interface BrandColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
}

export interface BrandConfig {
  code: string;
  name: string;
  vertical: string;
  description: string;
  loginComponent: ComponentType<{ onSuccess?: () => void }>;
  registerComponent: ComponentType<Record<string, never>>;
  colors: BrandColors;
  fonts: { heading: string; body: string };
}

// ── Dynamic imports (code-split per brand) ────────────────────────────────────

const TravvellisLogin = dynamic(
  () => import('@/components/brand-login/brands/travvellis/TravvellisLogin'),
  { ssr: false, loading: () => <div style={{ background: '#0a0d1a', minHeight: '100dvh' }} /> },
);

const TravvellisRegister = dynamic(
  () => import('@/components/brand-login/brands/travvellis/register/TravvellisRegister'),
  { ssr: false, loading: () => <div style={{ background: '#0a0d1a', minHeight: '100dvh' }} /> },
);

// ── Registry ──────────────────────────────────────────────────────────────────

export const BRAND_REGISTRY: Record<string, BrandConfig> = {
  travvellis: {
    code: 'travvellis',
    name: 'Travvellis',
    vertical: 'TRAVEL',
    description: 'Luxury & adventure travel experiences',
    loginComponent: TravvellisLogin,
    registerComponent: TravvellisRegister,
    colors: {
      primary: '#1e3a5f',
      secondary: '#d4b878',
      background: '#0a0d1a',
      text: '#fef8e8',
    },
    fonts: {
      heading: 'Fraunces, serif',
      body: 'Inter, sans-serif',
    },
  },

  // ── Future brands (add here) ─────────────────────────────────────────────
  // electronic_brand: { vertical: 'ELECTRONIC', ... }
  // software_brand:   { vertical: 'SOFTWARE',   ... }
  // retail_brand:     { vertical: 'RETAIL',     ... }
  // restaurant_brand: { vertical: 'RESTAURANT', ... }
};

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getBrandConfig(code?: string | null): BrandConfig | null {
  if (!code) return null;
  return BRAND_REGISTRY[code.toLowerCase()] ?? null;
}

export function getAllBrands(): BrandConfig[] {
  return Object.values(BRAND_REGISTRY);
}
