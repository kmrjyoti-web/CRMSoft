'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Factory, Plus } from 'lucide-react';
import { api } from '@/lib/api';

type V2Vertical = {
  id: string;
  vertical_code: string;
  vertical_name: string;
  display_name: string;
  color_theme: string | null;
  icon_name: string | null;
  is_active: boolean;
  is_beta: boolean;
  is_coming_soon: boolean;
  _count: { pc_vertical_module: number; pc_vertical_feature: number };
};

function deriveStatus(v: V2Vertical): string {
  if (v.is_coming_soon) return 'COMING_SOON';
  if (v.is_beta) return 'BETA';
  if (v.is_active) return 'ACTIVE';
  return 'INACTIVE';
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-900/50 text-green-400 border-green-800',
  BETA: 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
  INACTIVE: 'bg-red-900/50 text-red-400 border-red-800',
  COMING_SOON: 'bg-blue-900/50 text-blue-400 border-blue-800',
};

export default function VerticalsPage() {
  const [verticals, setVerticals] = useState<V2Vertical[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = (await api.creator.listVerticals()) as any;
      setVerticals(Array.isArray(data) ? data : []);
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
        <div className="flex items-center gap-2">
          <Link
            href="/verticals/create"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#238636] text-white rounded-md hover:bg-[#2ea043] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Vertical
          </Link>
          <Link
            href="/verticals/new"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-[#30363d] text-[#8b949e] rounded-md hover:text-[#c9d1d9] transition-colors"
          >
            Register (legacy)
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {verticals.length > 0 ? (
          verticals.map((v) => {
            const status = deriveStatus(v);
            return (
              <Link
                key={v.vertical_code}
                href={`/verticals/${v.vertical_code}`}
                className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 hover:border-[#58a6ff]/50 transition-colors block"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {v.color_theme && (
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: v.color_theme }} />
                    )}
                    <p className="text-base font-bold text-[#c9d1d9] font-mono">{v.vertical_code}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded border ${STATUS_COLORS[status] ?? 'bg-gray-900/50 text-gray-400 border-gray-800'}`}>
                    {status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-[#c9d1d9]">{v.vertical_name}</p>
                <p className="text-xs text-[#8b949e]">{v.display_name}</p>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#30363d]">
                  <span className="text-xs text-[#8b949e]">{v._count.pc_vertical_module} modules</span>
                  <span className="text-xs text-[#8b949e]">{v._count.pc_vertical_feature} features</span>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="col-span-3 bg-[#161b22] border border-[#30363d] rounded-lg p-8 text-center">
            <Factory className="w-8 h-8 mx-auto mb-2 text-[#8b949e] opacity-30" />
            <p className="text-sm text-[#8b949e]">No verticals registered</p>
            <Link
              href="/verticals/create"
              className="inline-block mt-3 text-xs px-3 py-1.5 bg-[#238636] text-white rounded-md hover:bg-[#2ea043] transition-colors"
            >
              Create your first vertical
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
