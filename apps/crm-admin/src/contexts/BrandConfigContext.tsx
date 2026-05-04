'use client';

import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useBrandConfig, type VisualBrandConfig } from '@/hooks/useBrandConfig';

interface BrandConfigContextValue {
  config: VisualBrandConfig;
  loading: boolean;
}

const BrandConfigContext = createContext<BrandConfigContextValue>({
  config: {
    found: false,
    brandCode: null,
    brandName: 'CRMSoft',
    displayName: 'CRMSoft',
    logoUrl: null,
    primaryColor: '#1e5f74',
    secondaryColor: '#2a7a94',
    designTokens: null,
    welcomeTitle: 'Welcome back',
    welcomeSubtitle: 'Sign in to your account to continue',
  },
  loading: false,
});

export function BrandConfigProvider({ children }: { children: ReactNode }) {
  const { config, loading } = useBrandConfig();

  // Inject CSS variables whenever brand config resolves
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', config.primaryColor);
    root.style.setProperty('--color-secondary', config.secondaryColor);

    // Apply extended design tokens if present
    if (config.designTokens) {
      for (const [key, value] of Object.entries(config.designTokens)) {
        if (typeof value === 'string') {
          // Convert camelCase token keys to CSS var names: primaryDeep → --brand-primary-deep
          const cssVar = '--brand-' + key.replace(/([A-Z])/g, '-$1').toLowerCase();
          root.style.setProperty(cssVar, value);
        }
      }
    }
  }, [config]);

  return (
    <BrandConfigContext.Provider value={{ config, loading }}>
      {children}
    </BrandConfigContext.Provider>
  );
}

export function useBrandConfigContext(): BrandConfigContextValue {
  return useContext(BrandConfigContext);
}
