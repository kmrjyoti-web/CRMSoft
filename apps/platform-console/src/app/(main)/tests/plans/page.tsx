'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, ListFilter, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

type Plan = {
  id: string;
  name: string;
  moduleScope: string | null;
  verticalScope: string | null;
  scenarios: unknown[];
  isActive: boolean;
  createdAt: string;
};

export default function TestPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const result = (await api.tests.plans()) as { items?: Plan[] } | Plan[];
      setPlans(Array.isArray(result) ? result : (result as any).items ?? []);
    } catch {
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  async function handleDelete(id: string) {
    if (!confirm('Delete this test plan?')) return;
    try {
      await api.tests.deletePlan(id);
      await fetchPlans();
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#c9d1d9]">Test Plans</h2>
          <p className="text-xs text-[#8b949e] mt-0.5">Manage test plans with scenarios</p>
        </div>
        <Link
          href="/tests/plans/new"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#238636] text-white rounded-md hover:bg-[#2ea043] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> New Plan
        </Link>
      </div>

      <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#30363d]">
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Name</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Module Scope</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Vertical Scope</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Scenarios</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Active</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Created At</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-[#30363d]/50">
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-white/5 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : plans.length > 0 ? (
              plans.map((plan) => (
                <tr
                  key={plan.id}
                  className="border-b border-[#30363d]/50 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3 text-[#c9d1d9] font-medium">{plan.name}</td>
                  <td className="px-4 py-3 text-[#8b949e] text-xs">{plan.moduleScope ?? 'All'}</td>
                  <td className="px-4 py-3 text-[#8b949e] text-xs">{plan.verticalScope ?? 'All'}</td>
                  <td className="px-4 py-3 text-[#c9d1d9] text-xs">{plan.scenarios?.length ?? 0}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded border ${
                        plan.isActive
                          ? 'bg-green-900/50 text-green-400 border-green-800'
                          : 'bg-gray-900/50 text-gray-400 border-gray-800'
                      }`}
                    >
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#8b949e] text-xs">
                    {new Date(plan.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/tests/plans/${plan.id}`}
                        className="text-xs text-[#58a6ff] hover:underline"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDelete(plan.id)}
                        title="Delete"
                        className="p-1 rounded hover:bg-red-900/20 text-[#8b949e] hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-[#8b949e]">
                  <ListFilter className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No test plans found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
