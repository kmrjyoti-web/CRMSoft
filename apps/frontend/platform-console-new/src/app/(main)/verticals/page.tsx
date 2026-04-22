'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Factory, Plus } from 'lucide-react';
import { api } from '@/lib/api';

type Vertical = {
  code: string;
  name: string;
  nameHi: string;
  status: string;
  modulesCount: number;
  latestAuditScore?: number;
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-900/50 text-green-400 border-green-800',
  BETA: 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
  DEPRECATED: 'bg-red-900/50 text-red-400 border-red-800',
};

export default function VerticalsPage() {
  const [verticals, setVerticals] = useState<Vertical[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = (await api.verticals.list()) as any;
      setVerticals(Array.isArray(data) ? data : data.items ?? []);
    } catch {
      setVerticals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-48 bg-[#161b22] rounded animate-pulse" />
          <div className="h-8 w-32 bg-[#161b22] rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 bg-[#161b22] border border-[#30363d] rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#c9d1d9]">Vertical Registry</h2>
          <p className="text-xs text-[#8b949e] mt-0.5">Manage trade verticals and their configurations</p>
        </div>
        <Link
          href="/verticals/new"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#238636] text-white rounded-md hover:bg-[#2ea043] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Register Vertical
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {verticals.length > 0 ? (
          verticals.map((v) => (
            <Link
              key={v.code}
              href={`/verticals/${v.code}`}
              className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 hover:border-[#58a6ff]/50 transition-colors block"
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-base font-bold text-[#c9d1d9]">{v.code}</p>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded border ${
                    STATUS_COLORS[v.status] ?? 'bg-gray-900/50 text-gray-400 border-gray-800'
                  }`}
                >
                  {v.status}
                </span>
              </div>
              <p className="text-sm text-[#c9d1d9]">{v.name}</p>
              <p className="text-xs text-[#8b949e]">{v.nameHi}</p>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#30363d]">
                <span className="text-xs text-[#8b949e]">
                  Score: {v.latestAuditScore != null ? `${v.latestAuditScore}/100` : '\u2014'}
                </span>
                <span className="text-xs text-[#8b949e]">{v.modulesCount ?? 0} modules</span>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-3 bg-[#161b22] border border-[#30363d] rounded-lg p-8 text-center">
            <Factory className="w-8 h-8 mx-auto mb-2 text-[#8b949e] opacity-30" />
            <p className="text-sm text-[#8b949e]">No verticals registered</p>
          </div>
        )}
      </div>
    </div>
  );
}
