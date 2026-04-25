'use client';

import { useAuthStore } from '@/stores/auth.store';
import { getBrandConfig } from '@/lib/brand/registry';

/**
 * Returns the current user's active company context + resolved brand config.
 * Brand config comes from the static registry (PR #46) keyed by company.brandCode.
 * No API calls — reads from persisted auth store.
 */
export function useActiveCompany() {
  const user = useAuthStore((s) => s.user);
  const activeCompany = useAuthStore((s) => s.activeCompany);
  const availableCompanies = useAuthStore((s) => s.availableCompanies);
  const activeCompanyBrandCode = useAuthStore((s) => s.activeCompanyBrandCode);

  const brandConfig = getBrandConfig(activeCompanyBrandCode);

  return {
    user,
    company: activeCompany,
    availableCompanies,
    brandCode: activeCompanyBrandCode,
    brandConfig,

    // Resolved theme tokens (brand-specific or defaults)
    theme: brandConfig
      ? {
          primary: brandConfig.colors.primary,
          secondary: brandConfig.colors.secondary,
          background: brandConfig.colors.background,
          text: brandConfig.colors.text,
          fontHeading: brandConfig.fonts.heading,
          fontBody: brandConfig.fonts.body,
        }
      : {
          primary: '#3b82f6',
          secondary: '#8b5cf6',
          background: 'linear-gradient(135deg, #0a0d1a 0%, #1a1f2e 100%)',
          text: '#f1f5f9',
          fontHeading: 'Inter, sans-serif',
          fontBody: 'Inter, sans-serif',
        },

    isBranded: !!brandConfig,
    hasCompany: !!activeCompany,
    isMultiCompany: availableCompanies.length > 1,
  };
}
