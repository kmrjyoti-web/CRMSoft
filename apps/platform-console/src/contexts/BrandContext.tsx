'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api/v1';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BrandTheme {
  primaryColor: string;
  primaryDeep: string;
  primarySoft: string;
  primaryGlow: string;
  secondaryColor: string;
  background: string;
  backgroundDark: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
  border: string;
  borderEmphasis: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  fontHeading: string;
  fontBody: string;
  tagline?: string;
}

export interface Brand {
  code: string;
  name: string;
  shortCode: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  theme: BrandTheme;
  layoutCode: string;
  tagline?: string;
}

interface BrandContextValue {
  brand: Brand | null;
  loading: boolean;
  error: string | null;
}

// ── Fallback defaults ─────────────────────────────────────────────────────────

const DEFAULT_THEME: BrandTheme = {
  primaryColor: '#1a73e8',
  primaryDeep: '#1557b0',
  primarySoft: 'rgba(26,115,232,0.12)',
  primaryGlow: 'rgba(26,115,232,0.25)',
  secondaryColor: '#34a853',
  background: '#ffffff',
  backgroundDark: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  text: '#1f2937',
  textMuted: '#6b7280',
  textSubtle: '#9ca3af',
  cardBg: '#ffffff',
  cardBorder: '#e5e7eb',
  cardShadow: '0 1px 3px rgba(0,0,0,0.1)',
  border: '#e5e7eb',
  borderEmphasis: '#d1d5db',
  success: '#16a34a',
  warning: '#d97706',
  danger: '#dc2626',
  info: '#2563eb',
  fontHeading: 'Inter',
  fontBody: 'Inter',
  tagline: 'Power your business growth',
};

// ── Context ───────────────────────────────────────────────────────────────────

const BrandContext = createContext<BrandContextValue>({
  brand: null,
  loading: true,
  error: null,
});

export function useBrand() {
  return useContext(BrandContext);
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function BrandProvider({ brandCode, children }: { brandCode: string; children: ReactNode }) {
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!brandCode) { setLoading(false); return; }

    fetch(`${API_BASE}/pc-config/brand/${brandCode}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          const b = data.data;
          const resolved: Brand = {
            code: b.code,
            name: b.name,
            shortCode: b.shortCode ?? null,
            logoUrl: b.logoUrl ?? null,
            faviconUrl: b.faviconUrl ?? null,
            layoutCode: b.layoutCode ?? 'default',
            tagline: (b.theme as BrandTheme)?.tagline,
            theme: { ...DEFAULT_THEME, ...(b.theme as Partial<BrandTheme>) },
          };
          setBrand(resolved);
          applyBrandTheme(resolved);
        } else {
          applyBrandTheme({ code: brandCode, name: 'CRMSoft', shortCode: null, logoUrl: null, faviconUrl: null, layoutCode: 'default', theme: DEFAULT_THEME });
        }
      })
      .catch(() => {
        setError('Could not load brand config');
        applyBrandTheme({ code: brandCode, name: 'CRMSoft', shortCode: null, logoUrl: null, faviconUrl: null, layoutCode: 'default', theme: DEFAULT_THEME });
      })
      .finally(() => setLoading(false));
  }, [brandCode]);

  return (
    <BrandContext.Provider value={{ brand, loading, error }}>
      {children}
    </BrandContext.Provider>
  );
}

// ── CSS variable injection ────────────────────────────────────────────────────

function applyBrandTheme(brand: Brand) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const t = brand.theme;

  root.style.setProperty('--brand-primary', t.primaryColor);
  root.style.setProperty('--brand-primary-deep', t.primaryDeep);
  root.style.setProperty('--brand-primary-soft', t.primarySoft);
  root.style.setProperty('--brand-primary-glow', t.primaryGlow);
  root.style.setProperty('--brand-secondary', t.secondaryColor);
  root.style.setProperty('--brand-bg', t.background);
  root.style.setProperty('--brand-bg-dark', t.backgroundDark);
  root.style.setProperty('--brand-text', t.text);
  root.style.setProperty('--brand-text-muted', t.textMuted);
  root.style.setProperty('--brand-text-subtle', t.textSubtle);
  root.style.setProperty('--brand-card-bg', t.cardBg);
  root.style.setProperty('--brand-card-border', t.cardBorder);
  root.style.setProperty('--brand-card-shadow', t.cardShadow);
  root.style.setProperty('--brand-border', t.border);
  root.style.setProperty('--brand-border-emphasis', t.borderEmphasis);
  root.style.setProperty('--brand-success', t.success);
  root.style.setProperty('--brand-warning', t.warning);
  root.style.setProperty('--brand-danger', t.danger);
  root.style.setProperty('--brand-info', t.info);
  root.style.setProperty('--brand-font-heading', `"${t.fontHeading}", Georgia, serif`);
  root.style.setProperty('--brand-font-body', `"${t.fontBody}", system-ui, sans-serif`);

  // Favicon
  if (brand.faviconUrl) {
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = brand.faviconUrl;
  }

  // Google Fonts — only if not Inter (already loaded globally)
  const fonts = [t.fontHeading, t.fontBody].filter((f) => f && f !== 'Inter');
  const uniqueFonts = fonts.filter((f, i, a) => a.indexOf(f) === i);
  if (uniqueFonts.length > 0) {
    const families = uniqueFonts.map((f) => `family=${f.replace(/\s+/g, '+')}:wght@400;500;600;700`).join('&');
    const href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    if (!document.querySelector(`link[href*="${uniqueFonts[0].replace(/\s+/g, '+')}"]`)) {
      const fontLink = document.createElement('link');
      fontLink.rel = 'stylesheet';
      fontLink.href = href;
      document.head.appendChild(fontLink);
    }
  }
}
