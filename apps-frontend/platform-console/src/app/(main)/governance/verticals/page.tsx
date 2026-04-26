'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tag } from 'lucide-react';
import { api } from '@/lib/api';

type Vertical = {
  id: string;
  typeCode: string;
  typeName: string;
  typeNameHi?: string;
  sortOrder: number;
  isActive: boolean;
  crmEditionId?: string;
};

type CrmEdition = { id: string; code: string; name: string };

export default function GovernanceVerticalsPage() {
  const [verticals, setVerticals] = useState<Vertical[]>([]);
  const [editions, setEditions] = useState<CrmEdition[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const loadEditions = useCallback(async () => {
    try {
      const data = await api.pcConfig.crmEditions() as CrmEdition[];
      setEditions(Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
  }, []);

  const load = useCallback(async (crmEdition?: string) => {
    setLoading(true);
    try {
      const data = await api.pcConfig.verticals(crmEdition || undefined) as Vertical[];
      setVerticals(Array.isArray(data) ? data : []);
    } catch {
      setVerticals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEditions();
    load();
  }, [load, loadEditions]);

  const handleFilter = (code: string) => {
    setFilter(code);
    load(code || undefined);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-console-text flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#bc8cff]" />
            Verticals
          </h2>
          <p className="text-xs text-console-muted mt-0.5">
            Layer 4 — industry verticals (e.g. TRAVEL_TOURISM, RETAIL)
          </p>
        </div>
        <select
          value={filter}
          onChange={(e) => handleFilter(e.target.value)}
          className="text-xs bg-console-sidebar border border-console-border rounded-md px-2.5 py-1.5 text-console-text focus:outline-none focus:border-[#58a6ff]"
        >
          <option value="">All editions</option>
          {editions.map((ed) => (
            <option key={ed.code} value={ed.code}>{ed.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-console-sidebar border border-console-border rounded-lg animate-pulse" />
          ))}
        </div>
      ) : verticals.length === 0 ? (
        <div className="bg-console-sidebar border border-console-border rounded-lg p-12 text-center">
          <Tag className="w-10 h-10 mx-auto mb-3 text-console-muted opacity-30" />
          <p className="text-sm text-console-muted">No verticals found</p>
        </div>
      ) : (
        <div className="bg-console-sidebar border border-console-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-console-border">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted w-8">#</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Type Code</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Name</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Status</th>
              </tr>
            </thead>
            <tbody>
              {verticals.map((v, i) => (
                <tr key={v.id} className={i < verticals.length - 1 ? 'border-b border-console-border' : ''}>
                  <td className="px-4 py-3 text-xs text-console-muted/60">{v.sortOrder}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs bg-[#30363d] text-[#bc8cff] px-1.5 py-0.5 rounded">{v.typeCode}</span>
                  </td>
                  <td className="px-4 py-3 text-console-text text-xs">{v.typeName}</td>
                  <td className="px-4 py-3">
                    {v.isActive ? (
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
