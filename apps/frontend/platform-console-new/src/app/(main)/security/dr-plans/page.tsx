'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';

type DRPlan = {
  service: string;
  rtoMinutes: number;
  rpoMinutes: number;
  runbook: string;
  lastTested: string | null;
};

export default function DRPlansPage() {
  const [plans, setPlans] = useState<DRPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editRunbook, setEditRunbook] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState('');
  const [testing, setTesting] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.security.drPlans() as any;
      setPlans(Array.isArray(data) ? data : data?.items ?? []);
    } catch {
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isStale = (lastTested: string | null) => {
    if (!lastTested) return true;
    return Date.now() - new Date(lastTested).getTime() > 30 * 24 * 60 * 60 * 1000;
  };

  const handleSaveRunbook = async (service: string) => {
    setSaving(service);
    try {
      await api.security.updateDRPlan(service, { runbook: editRunbook });
      setEditing(null);
      await fetchData();
    } catch {
      // error
    } finally {
      setSaving('');
    }
  };

  const handleTest = async (service: string) => {
    setTesting(service);
    try {
      await api.security.testDRPlan(service);
      await fetchData();
    } catch {
      // error
    } finally {
      setTesting('');
    }
  };

  const toggleExpanded = (service: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(service)) next.delete(service);
      else next.add(service);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-48 bg-[#161b22] border border-[#30363d] rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-[#c9d1d9]">Disaster Recovery Plans</h2>
        <p className="text-xs text-[#8b949e] mt-0.5">RTO/RPO targets and runbooks for each service</p>
      </div>

      {plans.length === 0 ? (
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-12 text-center">
          <Shield className="w-8 h-8 mx-auto mb-2 text-[#8b949e] opacity-30" />
          <p className="text-sm text-[#8b949e]">No DR plans configured yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map((plan) => {
            const stale = isStale(plan.lastTested);
            const isEditing = editing === plan.service;
            const isExpanded = expanded.has(plan.service);
            const runbookLines = (plan.runbook ?? '').split('\n');
            const longRunbook = runbookLines.length > 3;

            return (
              <div key={plan.service} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm font-semibold text-[#c9d1d9]">{plan.service}</h3>
                  {stale && <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                </div>

                <div className="flex items-center gap-4 text-xs text-[#8b949e] mb-3">
                  <span>RTO: <span className="text-[#c9d1d9] font-medium">{plan.rtoMinutes} min</span></span>
                  <span>RPO: <span className="text-[#c9d1d9] font-medium">{plan.rpoMinutes} min</span></span>
                </div>

                <div className="text-xs text-[#8b949e] mb-3">
                  Last tested:{' '}
                  {plan.lastTested ? (
                    <span className={stale ? 'text-yellow-400' : 'text-green-400'}>
                      {new Date(plan.lastTested).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </span>
                  ) : (
                    <span className="text-red-400">Never</span>
                  )}
                </div>

                {/* Runbook */}
                {isEditing ? (
                  <div className="mb-3">
                    <textarea
                      value={editRunbook}
                      onChange={(e) => setEditRunbook(e.target.value)}
                      rows={8}
                      className="w-full bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] rounded-md px-3 py-2 text-xs font-mono focus:border-[#58a6ff] focus:outline-none resize-y"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleSaveRunbook(plan.service)}
                        disabled={saving === plan.service}
                        className="px-3 py-1 text-xs bg-[#238636] text-white rounded-md hover:bg-[#2ea043] disabled:opacity-50"
                      >
                        {saving === plan.service ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => setEditing(null)}
                        className="px-3 py-1 text-xs bg-[#21262d] text-[#c9d1d9] border border-[#30363d] rounded-md hover:bg-[#30363d]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : plan.runbook ? (
                  <div className="mb-3">
                    <pre className="bg-[#0d1117] border border-[#30363d] rounded-md p-3 text-xs text-[#c9d1d9] font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                      {longRunbook && !isExpanded
                        ? runbookLines.slice(0, 3).join('\n') + '\n...'
                        : plan.runbook}
                    </pre>
                    {longRunbook && (
                      <button
                        onClick={() => toggleExpanded(plan.service)}
                        className="text-xs text-[#58a6ff] hover:underline mt-1"
                      >
                        {isExpanded ? 'Show less' : `Show all (${runbookLines.length} lines)`}
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-[#8b949e] italic mb-3">No runbook configured</p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditing(plan.service);
                      setEditRunbook(plan.runbook ?? '');
                    }}
                    className="px-3 py-1 text-xs bg-[#21262d] text-[#c9d1d9] border border-[#30363d] rounded-md hover:bg-[#30363d] transition-colors"
                  >
                    Edit Runbook
                  </button>
                  <button
                    onClick={() => handleTest(plan.service)}
                    disabled={testing === plan.service}
                    className="flex items-center gap-1 px-3 py-1 text-xs bg-[#238636] text-white rounded-md hover:bg-[#2ea043] transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-3 h-3" />
                    {testing === plan.service ? 'Testing...' : 'Mark Tested'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
