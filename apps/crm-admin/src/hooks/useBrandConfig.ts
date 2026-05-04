'use client';

import { useState, useEffect } from 'react';

const CACHE_KEY_PREFIX = 'brand_visual_config:';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min

export interface VisualBrandConfig {
  found: boolean;
  brandCode: string | null;
  brandName: string | null;
  displayName: string | null;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  designTokens: Record<string, unknown> | null;
  welcomeTitle: string | null;
  welcomeSubtitle: string | null;
}

const DEFAULT_CONFIG: VisualBrandConfig = {
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
};

function readSessionCache(domain: string): VisualBrandConfig | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY_PREFIX + domain);
    if (!raw) return null;
    const { data, expiresAt } = JSON.parse(raw);
    if (Date.now() > expiresAt) { sessionStorage.removeItem(CACHE_KEY_PREFIX + domain); return null; }
    return data;
  } catch {
    return null;
  }
}

function writeSessionCache(domain: string, data: VisualBrandConfig) {
  try {
    sessionStorage.setItem(
      CACHE_KEY_PREFIX + domain,
      JSON.stringify({ data, expiresAt: Date.now() + CACHE_TTL_MS }),
    );
  } catch {
    // sessionStorage may be unavailable (private browsing, storage full)
  }
}

export function useBrandConfig(): {
  config: VisualBrandConfig;
  loading: boolean;
} {
  const [config, setConfig] = useState<VisualBrandConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const hostname = window.location.hostname;

    // Localhost / dev: skip API call, use default branding
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.endsWith('.local')
    ) {
      return;
    }

    // Check sessionStorage cache
    const cached = readSessionCache(hostname);
    if (cached) {
      setConfig(cached);
      return;
    }

    setLoading(true);

    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? '/api/v1';
    fetch(`${apiBase}/public/brand-config/visual?domain=${encodeURIComponent(hostname)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.found) return; // domain not configured → keep defaults
        const result: VisualBrandConfig = {
          found: true,
          brandCode: data.brandCode,
          brandName: data.brandName,
          displayName: data.displayName,
          logoUrl: data.logoUrl,
          primaryColor: data.primaryColor ?? DEFAULT_CONFIG.primaryColor,
          secondaryColor: data.secondaryColor ?? DEFAULT_CONFIG.secondaryColor,
          designTokens: data.designTokens,
          welcomeTitle: data.welcomeTitle ?? `Welcome to ${data.displayName ?? data.brandName}`,
          welcomeSubtitle: data.welcomeSubtitle ?? 'Sign in to your account to continue',
        };
        setConfig(result);
        writeSessionCache(hostname, result);
      })
      .catch(() => { /* keep defaults on any error */ })
      .finally(() => setLoading(false));
  }, []);

  return { config, loading };
}
