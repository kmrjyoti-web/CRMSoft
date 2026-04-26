'use client';

import { useState, useEffect, useCallback } from 'react';
import { Building2 } from 'lucide-react';
import { api } from '@/lib/api';

type SubType = {
  id: string;
  code: string;
  shortCode: string;
  name: string;
  description?: string;
  userType: string;
  sortOrder: number;
  isActive: boolean;
};

type Vertical = { id: string; typeCode: string; typeName: string };

const USER_TYPES = ['B2B', 'B2C', 'IND_SP', 'IND_EE'];

export default function GovernanceSubTypesPage() {
  const [subTypes, setSubTypes] = useState<SubType[]>([]);
  const [verticals, setVerticals] = useState<Vertical[]>([]);
  const [vertical, setVertical] = useState('');
  const [userType, setUserType] = useState('B2B');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const loadVerticals = useCallback(async () => {
    try {
      const data = await api.pcConfig.verticals() as Vertical[];
      setVerticals(Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadVerticals(); }, [loadVerticals]);

  const search = useCallback(async () => {
    if (!vertical) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await api.pcConfig.subTypes(vertical, userType) as SubType[];
      setSubTypes(Array.isArray(data) ? data : []);
    } catch {
      setSubTypes([]);
    } finally {
      setLoading(false);
    }
  }, [vertical, userType]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-console-text flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#ff7b72]" />
          Sub-Types
        </h2>
        <p className="text-xs text-console-muted mt-0.5">
          Layer 6 — business sub-types per vertical + user type combination
        </p>
      </div>

      <div className="bg-console-sidebar border border-console-border rounded-lg p-4 flex items-end gap-3">
        <div className="flex-1">
          <label className="block text-xs text-console-muted mb-1">Vertical</label>
          <select
            value={vertical}
            onChange={(e) => setVertical(e.target.value)}
            className="w-full text-xs bg-[#0d1117] border border-console-border rounded-md px-2.5 py-1.5 text-console-text focus:outline-none focus:border-[#58a6ff]"
          >
            <option value="">Select vertical…</option>
            {verticals.map((v) => (
              <option key={v.typeCode} value={v.typeCode}>{v.typeName} ({v.typeCode})</option>
            ))}
          </select>
        </div>
        <div className="w-36">
          <label className="block text-xs text-console-muted mb-1">User Type</label>
          <select
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
            className="w-full text-xs bg-[#0d1117] border border-console-border rounded-md px-2.5 py-1.5 text-console-text focus:outline-none focus:border-[#58a6ff]"
          >
            {USER_TYPES.map((ut) => (
              <option key={ut} value={ut}>{ut}</option>
            ))}
          </select>
        </div>
        <button
          onClick={search}
          disabled={!vertical || loading}
          className="px-3 py-1.5 text-xs bg-console-accent text-white rounded-md hover:bg-console-accent/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Search
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-console-sidebar border border-console-border rounded-lg animate-pulse" />
          ))}
        </div>
      ) : !searched ? (
        <div className="bg-console-sidebar border border-console-border rounded-lg p-8 text-center">
          <p className="text-xs text-console-muted">Select a vertical and user type to view sub-types</p>
        </div>
      ) : subTypes.length === 0 ? (
        <div className="bg-console-sidebar border border-console-border rounded-lg p-8 text-center">
          <p className="text-xs text-console-muted">No sub-types for {vertical} / {userType}</p>
        </div>
      ) : (
        <div className="bg-console-sidebar border border-console-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-console-border">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Code</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Name</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Short</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">User Type</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-console-muted">Status</th>
              </tr>
            </thead>
            <tbody>
              {subTypes.map((s, i) => (
                <tr key={s.id} className={i < subTypes.length - 1 ? 'border-b border-console-border' : ''}>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs bg-[#30363d] text-[#ff7b72] px-1.5 py-0.5 rounded">{s.code}</span>
                  </td>
                  <td className="px-4 py-3 text-console-text text-xs">{s.name}</td>
                  <td className="px-4 py-3 text-xs font-mono text-console-muted">{s.shortCode}</td>
                  <td className="px-4 py-3">
                    <span className="bg-[#58a6ff]/10 text-[#58a6ff] text-xs px-1.5 py-0.5 rounded">{s.userType}</span>
                  </td>
                  <td className="px-4 py-3">
                    {s.isActive ? (
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
