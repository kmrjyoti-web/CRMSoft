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

/** Extended visual tokens for richer brand experiences */
export interface ExtendedBrandTheme {
  primaryDeep: string;
  primarySoft: string;
  primaryGlow: string;

  bgElevated: string;
  bgGlass: string;

  textMuted: string;
  textSubtle: string;

  cardBg: string;
  cardBgHover: string;
  cardBorder: string;
  cardBorderHover: string;
  cardShadow: string;
  cardShadowHover: string;

  border: string;
  borderEmphasis: string;
  divider: string;

  success: string;
  warning: string;
  danger: string;
  info: string;

  tagline?: string;
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
  extendedTheme?: ExtendedBrandTheme;
  tagline?: string;
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
    tagline: 'Curated journeys, golden moments',
    loginComponent: TravvellisLogin,
    registerComponent: TravvellisRegister,

    // Golden Hour palette
    colors: {
      primary: '#b8894a',
      secondary: '#1e3a5f',
      background: 'linear-gradient(135deg, #faf6ed 0%, #f5ebd5 100%)',
      text: '#2c1810',
    },
    fonts: {
      heading: 'var(--font-serif)',  // Playfair Display
      body: 'var(--font-sans)',       // Inter
    },

    // Golden Hour extended tokens
    extendedTheme: {
      primaryDeep: '#8b6334',
      primarySoft: 'rgba(184, 137, 74, 0.12)',
      primaryGlow: 'rgba(184, 137, 74, 0.25)',

      bgElevated: '#ffffff',
      bgGlass: 'rgba(255, 255, 255, 0.85)',

      textMuted: '#6b5544',
      textSubtle: '#a08870',

      cardBg: 'rgba(255, 255, 255, 0.95)',
      cardBgHover: '#ffffff',
      cardBorder: 'rgba(184, 137, 74, 0.18)',
      cardBorderHover: 'rgba(184, 137, 74, 0.4)',
      cardShadow: '0 4px 24px rgba(184, 137, 74, 0.08)',
      cardShadowHover: '0 12px 48px rgba(184, 137, 74, 0.18)',

      border: 'rgba(184, 137, 74, 0.15)',
      borderEmphasis: 'rgba(184, 137, 74, 0.3)',
      divider: 'rgba(44, 24, 16, 0.06)',

      success: '#3a8c5f',
      warning: '#d4a85e',
      danger: '#c25555',
      info: '#5a7ba5',

      tagline: 'Curated journeys, golden moments',
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
