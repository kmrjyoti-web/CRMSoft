'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, Search } from 'lucide-react';
import { api } from '@/lib/api';

type PageEntry = {
  id: string;
  pageCode?: string;
  routePath: string;
  portal: string;
  friendlyName?: string;
  category?: string;
  moduleCode?: string;
  pageType?: string;
  isDemoReady?: boolean;
  isActive: boolean;
};

const PORTALS = ['All', 'crm', 'vendor', 'marketplace', 'admin'];

export default function GovernancePageRegistryPage() {
  const [pages, setPages] = useState<PageEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [portal, setPortal] = useState('All');
  const [q, setQ] = useState('');

  const load = useCallback(async (p?: string) => {
    setLoading(true);
    try {
      const data = await api.pcConfig.pageRegistry(p === 'All' ? undefined : p) as PageEntry[];
      setPages(Array.isArray(data) ? data : []);
    } catch {
      setPages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handlePortal = (p: string) => {
    setPortal(p);
    load(p === 'All' ? undefined : p);
  };

  const filtered = q
    ? pages.filter((p) =>
        p.routePath.toLowerCase().includes(q.toLowerCase()) ||
        (p.pageCode ?? '').toLowerCase().includes(q.toLowerCase()) ||
        (p.friendlyName ?? '').toLowerCase().includes(q.toLowerCase()),
      )
    : pages;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-console-text flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#79c0ff]" />
            Page Registry
          </h2>
          <p className="text-xs text-console-muted mt-0.5">
            {filtered.length} pages — auto-discovered routes across portals
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-console-muted pointer-events-none" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search route or page code…"
            className="w-full pl-7 pr-3 py-1.5 text-xs bg-[#0d1117] border border-console-border rounded-md text-console-text placeholder:text-console-muted/50 focus:outline-none focus:border-[#58a6ff]"
          />
        </div>
        <div className="flex items-center gap-1">
          {PORTALS.map((p) => (
            <button
              key={p}
              onClick={() => handlePortal(p)}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                portal === p
                  ? 'bg-[#58a6ff]/20 text-[#58a6ff]'
                  : 'text-console-muted hover:text-console-text hover:bg-white/5'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-11 bg-console-sidebar border border-console-border rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-console-sidebar border border-console-border rounded-lg p-12 text-center">
          <FileText className="w-10 h-10 mx-auto mb-3 text-console-muted opacity-30" />
          <p className="text-sm text-console-muted">No pages found</p>
        </div>
      ) : (
        <div className="bg-console-sidebar border border-console-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-console-border">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Route</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Page Code</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Portal</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Module</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Demo</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id} className={i < filtered.length - 1 ? 'border-b border-console-border' : ''}>
                  <td className="px-4 py-2.5">
                    <p className="font-mono text-xs text-console-text">{p.routePath}</p>
                    {p.friendlyName && <p className="text-xs text-console-muted/70 mt-0.5">{p.friendlyName}</p>}
                  </td>
                  <td className="px-4 py-2.5">
                    {p.pageCode ? (
                      <span className="font-mono text-xs bg-[#30363d] text-[#79c0ff] px-1.5 py-0.5 rounded">{p.pageCode}</span>
                    ) : (
                      <span className="text-xs text-console-muted/40">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-xs text-console-muted">{p.portal}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    {p.moduleCode ? (
                      <span className="text-xs text-console-muted font-mono">{p.moduleCode}</span>
                    ) : (
                      <span className="text-xs text-console-muted/40">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    {p.isDemoReady ? (
                      <span className="bg-[#d29922]/20 text-[#d29922] text-xs px-1.5 py-0.5 rounded">Ready</span>
                    ) : (
                      <span className="text-xs text-console-muted/40">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    {p.isActive ? (
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
