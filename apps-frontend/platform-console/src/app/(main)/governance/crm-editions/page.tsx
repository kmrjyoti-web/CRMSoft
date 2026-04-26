'use client';

import { useState, useEffect, useCallback } from 'react';
import { Factory } from 'lucide-react';
import { api } from '@/lib/api';

type CrmEdition = {
  id: string;
  code: string;
  shortCode?: string;
  name: string;
  description?: string;
  isActive: boolean;
  isBuilt: boolean;
};

export default function GovernanceCrmEditionsPage() {
  const [editions, setEditions] = useState<CrmEdition[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.pcConfig.crmEditions() as CrmEdition[];
      setEditions(Array.isArray(data) ? data : []);
    } catch {
      setEditions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-console-text flex items-center gap-2">
          <Factory className="w-4 h-4 text-[#3fb950]" />
          CRM Editions
        </h2>
        <p className="text-xs text-console-muted mt-0.5">
          Layer 3 — product editions (e.g. Travel, Retail, Healthcare)
        </p>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 bg-console-sidebar border border-console-border rounded-lg animate-pulse" />
          ))}
        </div>
      ) : editions.length === 0 ? (
        <div className="bg-console-sidebar border border-console-border rounded-lg p-12 text-center">
          <Factory className="w-10 h-10 mx-auto mb-3 text-console-muted opacity-30" />
          <p className="text-sm text-console-muted">No CRM editions found</p>
        </div>
      ) : (
        <div className="bg-console-sidebar border border-console-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-console-border">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Code</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Name</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Short</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Built</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Status</th>
              </tr>
            </thead>
            <tbody>
              {editions.map((e, i) => (
                <tr key={e.id} className={i < editions.length - 1 ? 'border-b border-console-border' : ''}>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs bg-[#30363d] text-[#3fb950] px-1.5 py-0.5 rounded">{e.code}</span>
                  </td>
                  <td className="px-4 py-3 text-console-text text-xs font-medium">{e.name}</td>
                  <td className="px-4 py-3 text-xs text-console-muted font-mono">{e.shortCode ?? '—'}</td>
                  <td className="px-4 py-3">
                    {e.isBuilt ? (
                      <span className="bg-[#238636]/20 text-[#3fb950] text-xs px-1.5 py-0.5 rounded">Yes</span>
                    ) : (
                      <span className="bg-[#30363d] text-console-muted text-xs px-1.5 py-0.5 rounded">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {e.isActive ? (
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
