'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';

type Brand = {
  id: string;
  brandCode: string;
  brandName: string;
  displayName: string;
  description?: string;
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  domain?: string;
};

type VerticalSummary = {
  id: string;
  vertical_code: string;
  vertical_name: string;
  display_name: string;
  color_theme?: string;
  is_enabled_for_brand: boolean;
};

type EffectiveConfig = {
  vertical: Record<string, unknown>;
  modules: Record<string, unknown>[];
  menus: Record<string, unknown>[];
  features: Record<string, unknown>[];
  brand_config: Record<string, unknown> | null;
};

interface BrandPreviewContextValue {
  brand: Brand | null;
  verticals: VerticalSummary[];
  selectedVerticalCode: string | null;
  effectiveConfig: EffectiveConfig | null;
  setSelectedVerticalCode: (code: string) => void;
  loading: boolean;
  effectiveLoading: boolean;
}

const BrandPreviewContext = createContext<BrandPreviewContextValue | null>(null);

export function BrandPreviewProvider({
  brandId,
  children,
}: {
  brandId: string;
  children: React.ReactNode;
}) {
  const [brand, setBrand] = useState<Brand | null>(null);
  const [verticals, setVerticals] = useState<VerticalSummary[]>([]);
  const [selectedVerticalCode, setSelectedVerticalCode] = useState<string | null>(null);
  const [effectiveConfig, setEffectiveConfig] = useState<EffectiveConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [effectiveLoading, setEffectiveLoading] = useState(false);

  useEffect(() => {
    if (!brandId) return;
    Promise.all([
      api.brandConfig.get(brandId),
      api.brandConfig.verticals(brandId),
    ])
      .then(([brandData, verticalsData]) => {
        setBrand(brandData as Brand);
        const all = Array.isArray(verticalsData) ? verticalsData : [];
        const enabled = all.filter((v: VerticalSummary) => v.is_enabled_for_brand);
        setVerticals(enabled);
        if (enabled.length > 0) {
          setSelectedVerticalCode(enabled[0].vertical_code);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [brandId]);

  const loadEffective = useCallback(
    async (code: string) => {
      setEffectiveLoading(true);
      try {
        const data = await api.brandConfig.effectiveConfig(brandId, code);
        setEffectiveConfig(data as EffectiveConfig);
      } catch {
        setEffectiveConfig(null);
      } finally {
        setEffectiveLoading(false);
      }
    },
    [brandId],
  );

  useEffect(() => {
    if (selectedVerticalCode) {
      loadEffective(selectedVerticalCode);
    }
  }, [selectedVerticalCode, loadEffective]);

  return (
    <BrandPreviewContext.Provider
      value={{
        brand,
        verticals,
        selectedVerticalCode,
        effectiveConfig,
        setSelectedVerticalCode,
        loading,
        effectiveLoading,
      }}
    >
      {children}
    </BrandPreviewContext.Provider>
  );
}

export function useBrandPreview() {
  const ctx = useContext(BrandPreviewContext);
  if (!ctx) throw new Error('useBrandPreview must be used within BrandPreviewProvider');
  return ctx;
}
