'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

export type BrandProfile = {
  id: string;
  brandCode: string;
  brandName: string;
  displayName: string;
  description: string | null;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string | null;
  domain: string | null;
  subdomain: string | null;
  isActive: boolean;
  customLoginComponent: string | null;
  customLoginTheme: string | null;
  verticalCode: string | null;
  designTokens: Record<string, unknown> | null;
  fontConfig: Record<string, unknown> | null;
  brandAssetPath: string | null;
};

type BrandContextValue = {
  brand: BrandProfile | null;
  isLoading: boolean;
  error: string | null;
};

const BrandContext = createContext<BrandContextValue>({
  brand: null,
  isLoading: false,
  error: null,
});

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

async function fetchBrandProfile(code: string): Promise<BrandProfile> {
  const res = await fetch(`${API_BASE}/platform-console/creator/brand/${encodeURIComponent(code)}`);
  if (!res.ok) throw new Error(`Brand ${code} not found`);
  const json = await res.json();
  if (json && 'success' in json && 'data' in json) return json.data;
  return json;
}

export function BrandContextProvider({
  brandCode,
  children,
}: {
  brandCode: string | null;
  children: ReactNode;
}) {
  const [brand, setBrand] = useState<BrandProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!brandCode) return;
    setIsLoading(true);
    setError(null);
    fetchBrandProfile(brandCode)
      .then(setBrand)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [brandCode]);

  return (
    <BrandContext.Provider value={{ brand, isLoading, error }}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrandContext() {
  return useContext(BrandContext);
}
