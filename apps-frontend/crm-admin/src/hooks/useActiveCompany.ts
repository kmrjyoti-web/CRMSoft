'use client';

import { useAuthStore } from '@/stores/auth.store';
import { getBrandConfig } from '@/lib/brand/registry';

// Neutral Premium fallback — used when no brand is active
const NEUTRAL_PREMIUM_DEFAULTS = {
  primary: '#c9a25f',
  primaryDeep: '#8b6334',
  primarySoft: 'rgba(201, 162, 95, 0.15)',
  primaryGlow: 'rgba(201, 162, 95, 0.25)',
  secondary: '#3b82f6',
  background: 'linear-gradient(135deg, #0a0d1a 0%, #131826 50%, #0d1118 100%)',
  bgElevated: 'rgba(20, 24, 35, 0.85)',
  bgGlass: 'rgba(26, 31, 46, 0.6)',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  textSubtle: '#64748b',
  cardBg: 'rgba(20, 24, 35, 0.5)',
  cardBgHover: 'rgba(28, 34, 48, 0.7)',
  cardBorder: 'rgba(201, 162, 95, 0.12)',
  cardBorderHover: 'rgba(201, 162, 95, 0.25)',
  cardShadow: '0 4px 24px rgba(0, 0, 0, 0.25)',
  cardShadowHover: '0 8px 32px rgba(201, 162, 95, 0.15)',
  border: 'rgba(201, 162, 95, 0.1)',
  borderEmphasis: 'rgba(201, 162, 95, 0.2)',
  divider: 'rgba(255, 255, 255, 0.05)',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  fontHeading: 'var(--font-sans)',
  fontBody: 'var(--font-sans)',
  tagline: undefined as string | undefined,
};

/**
 * Returns the current user's active company context + resolved brand config.
 * Brand config comes from the static registry keyed by company.brandCode.
 * No API calls — reads from persisted auth store.
 */
export function useActiveCompany() {
  const user = useAuthStore((s) => s.user);
  const activeCompany = useAuthStore((s) => s.activeCompany);
  const availableCompanies = useAuthStore((s) => s.availableCompanies);
  const activeCompanyBrandCode = useAuthStore((s) => s.activeCompanyBrandCode);

  const brandConfig = getBrandConfig(activeCompanyBrandCode);
  const ext = brandConfig?.extendedTheme;

  const theme = brandConfig
    ? {
        // Base tokens from colors
        primary: brandConfig.colors.primary,
        secondary: brandConfig.colors.secondary,
        background: brandConfig.colors.background,
        text: brandConfig.colors.text,
        fontHeading: brandConfig.fonts.heading,
        fontBody: brandConfig.fonts.body,
        // Extended tokens (with neutral premium fallback)
        primaryDeep: ext?.primaryDeep ?? NEUTRAL_PREMIUM_DEFAULTS.primaryDeep,
        primarySoft: ext?.primarySoft ?? NEUTRAL_PREMIUM_DEFAULTS.primarySoft,
        primaryGlow: ext?.primaryGlow ?? NEUTRAL_PREMIUM_DEFAULTS.primaryGlow,
        bgElevated: ext?.bgElevated ?? NEUTRAL_PREMIUM_DEFAULTS.bgElevated,
        bgGlass: ext?.bgGlass ?? NEUTRAL_PREMIUM_DEFAULTS.bgGlass,
        textMuted: ext?.textMuted ?? NEUTRAL_PREMIUM_DEFAULTS.textMuted,
        textSubtle: ext?.textSubtle ?? NEUTRAL_PREMIUM_DEFAULTS.textSubtle,
        cardBg: ext?.cardBg ?? NEUTRAL_PREMIUM_DEFAULTS.cardBg,
        cardBgHover: ext?.cardBgHover ?? NEUTRAL_PREMIUM_DEFAULTS.cardBgHover,
        cardBorder: ext?.cardBorder ?? NEUTRAL_PREMIUM_DEFAULTS.cardBorder,
        cardBorderHover: ext?.cardBorderHover ?? NEUTRAL_PREMIUM_DEFAULTS.cardBorderHover,
        cardShadow: ext?.cardShadow ?? NEUTRAL_PREMIUM_DEFAULTS.cardShadow,
        cardShadowHover: ext?.cardShadowHover ?? NEUTRAL_PREMIUM_DEFAULTS.cardShadowHover,
        border: ext?.border ?? NEUTRAL_PREMIUM_DEFAULTS.border,
        borderEmphasis: ext?.borderEmphasis ?? NEUTRAL_PREMIUM_DEFAULTS.borderEmphasis,
        divider: ext?.divider ?? NEUTRAL_PREMIUM_DEFAULTS.divider,
        success: ext?.success ?? NEUTRAL_PREMIUM_DEFAULTS.success,
        warning: ext?.warning ?? NEUTRAL_PREMIUM_DEFAULTS.warning,
        danger: ext?.danger ?? NEUTRAL_PREMIUM_DEFAULTS.danger,
        info: ext?.info ?? NEUTRAL_PREMIUM_DEFAULTS.info,
        tagline: brandConfig.tagline ?? ext?.tagline,
      }
    : NEUTRAL_PREMIUM_DEFAULTS;

  return {
    user,
    company: activeCompany,
    availableCompanies,
    brandCode: activeCompanyBrandCode,
    brandConfig,
    theme,
    isBranded: !!brandConfig,
    hasCompany: !!activeCompany,
    isMultiCompany: availableCompanies.length > 1,
  };
}
