'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ListFilter, Zap } from 'lucide-react';
import { api } from '@/lib/api';

type CombinedCode = {
  id: string;
  code: string;
  displayName: string;
  description?: string;
  userType: string;
  brandId: string;
  crmEditionId: string;
  verticalId: string;
  subTypeId: string;
  isActive: boolean;
};

type Brand = { id: string; code: string; name: string };

export default function GovernanceCombinedCodesPage() {
  const [codes, setCodes] = useState<CombinedCode[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandFilter, setBrandFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const loadBrands = useCallback(async () => {
    try {
      const data = await api.pcConfig.brands() as Brand[];
      setBrands(Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
  }, []);

  const load = useCallback(async (brandCode?: string) => {
    setLoading(true);
    try {
      const data = await api.pcConfig.combinedCodes(brandCode || undefined) as CombinedCode[];
      setCodes(Array.isArray(data) ? data : []);
    } catch {
      setCodes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBrands();
    load();
  }, [load, loadBrands]);

  const handleBrandFilter = (code: string) => {
    setBrandFilter(code);
    load(code || undefined);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-console-text flex items-center gap-2">
            <ListFilter className="w-4 h-4 text-[#ff7b72]" />
            Combined Codes
          </h2>
          <p className="text-xs text-console-muted mt-0.5">
            {codes.length} codes — fully resolved cascade identifiers
          </p>
        </div>
        <Link
          href="/governance/combined-codes/builder"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-console-accent text-white rounded-md hover:bg-console-accent/80 transition-colors"
        >
          <Zap className="w-3.5 h-3.5" /> Builder
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <select
          value={brandFilter}
          onChange={(e) => handleBrandFilter(e.target.value)}
          className="text-xs bg-console-sidebar border border-console-border rounded-md px-2.5 py-1.5 text-console-text focus:outline-none focus:border-[#58a6ff]"
        >
          <option value="">All brands</option>
          {brands.map((b) => (
            <option key={b.code} value={b.code}>{b.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-console-sidebar border border-console-border rounded-lg animate-pulse" />
          ))}
        </div>
      ) : codes.length === 0 ? (
        <div className="bg-console-sidebar border border-console-border rounded-lg p-12 text-center">
          <ListFilter className="w-10 h-10 mx-auto mb-3 text-console-muted opacity-30" />
          <p className="text-sm text-console-muted">No combined codes found</p>
          <p className="text-xs text-console-muted/60 mt-1">Use the Builder to explore cascade combinations</p>
        </div>
      ) : (
        <div className="bg-console-sidebar border border-console-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-console-border">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Code</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Display Name</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">User Type</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Status</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((c, i) => (
                <tr key={c.id} className={i < codes.length - 1 ? 'border-b border-console-border' : ''}>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs bg-[#30363d] text-[#ff7b72] px-1.5 py-0.5 rounded">{c.code}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-console-text">{c.displayName}</td>
                  <td className="px-4 py-3">
                    <span className="bg-[#58a6ff]/10 text-[#58a6ff] text-xs px-1.5 py-0.5 rounded">{c.userType}</span>
                  </td>
                  <td className="px-4 py-3">
                    {c.isActive ? (
                      <span className="bg-[#238636]/20 text-[#3fb950] text-xs px-1.5 py-0.5 rounded">Active</span>
                    ) : (
                      <span className="bg-[#30363d] text-console-muted text-xs px-1.5 py-0.5 rounded">Inactive</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
