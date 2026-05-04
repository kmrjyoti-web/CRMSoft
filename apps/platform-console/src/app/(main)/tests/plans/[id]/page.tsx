'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Play, Loader2, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '@/lib/api';

type Scenario = {
  title: string;
  steps: string;
  expectedResult: string;
  priority: string;
};

type Execution = {
  id: string;
  status: string;
  startedAt: string;
  duration: number | null;
};

type Plan = {
  id: string;
  name: string;
  description: string | null;
  moduleScope: string | null;
  verticalScope: string | null;
  scenarios: Scenario[];
  isActive: boolean;
  createdAt: string;
  createdBy: string | null;
  recentExecutions?: Execution[];
};

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: 'bg-red-900/50 text-red-400 border-red-800',
  MEDIUM: 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
  LOW: 'bg-gray-900/50 text-gray-400 border-gray-800',
};

export default function PlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  const fetchPlan = useCallback(async () => {
    setLoading(true);
    try {
      const data = (await api.tests.getPlan(id)) as Plan;
      setPlan(data);
    } catch {
      setPlan(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  async function handleRun() {
    setRunning(true);
    try {
      await api.tests.run({ planId: id });
      await fetchPlan();
    } catch {
      // ignore
    } finally {
      setRunning(false);
    }
  }

  async function handleDeactivate() {
    if (!confirm('Deactivate and delete this test plan?')) return;
    setDeactivating(true);
    try {
      await api.tests.deletePlan(id);
      router.push('/tests/plans');
    } catch {
      // ignore
    } finally {
      setDeactivating(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-[#161b22] border border-[#30363d] rounded-lg animate-pulse" />
        <div className="h-64 bg-[#161b22] border border-[#30363d] rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-8 text-center">
        <p className="text-sm text-[#8b949e]">Plan not found</p>
        <Link href="/tests/plans" className="text-xs text-[#58a6ff] hover:underline mt-2 inline-block">
          Back to Plans
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link href="/tests/plans" className="inline-flex items-center gap-1 text-xs text-[#58a6ff] hover:underline">
        <ArrowLeft className="w-3 h-3" /> Back to Plans
      </Link>

      {/* Header */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#c9d1d9]">{plan.name}</h2>
            {plan.description && <p className="text-sm text-[#8b949e] mt-1">{plan.description}</p>}
            <div className="flex items-center gap-4 mt-3 text-xs text-[#8b949e]">
              <span>Module: {plan.moduleScope ?? 'All'}</span>
              <span>Vertical: {plan.verticalScope ?? 'All'}</span>
              <span>
                Created {new Date(plan.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
              </span>
              {plan.createdBy && <span>by {plan.createdBy}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded border ${
                plan.isActive
                  ? 'bg-green-900/50 text-green-400 border-green-800'
                  : 'bg-gray-900/50 text-gray-400 border-gray-800'
              }`}
            >
              {plan.isActive ? 'Active' : 'Inactive'}
            </span>
            <button
              onClick={handleRun}
              disabled={running}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#238636] text-white rounded-md hover:bg-[#2ea043] transition-colors disabled:opacity-50"
            >
              {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              Run This Plan
            </button>
            <button
              onClick={handleDeactivate}
              disabled={deactivating}
              className="px-3 py-1.5 text-xs bg-[#da3633] text-white rounded-md hover:bg-[#f85149] transition-colors disabled:opacity-50"
            >
              {deactivating ? 'Deleting...' : 'Deactivate'}
            </button>
          </div>
        </div>
      </div>

      {/* Scenarios */}
      <div>
        <h3 className="text-sm font-semibold text-[#c9d1d9] mb-3">
          Scenarios ({plan.scenarios?.length ?? 0})
        </h3>
        <div className="space-y-3">
          {plan.scenarios && plan.scenarios.length > 0 ? (
            plan.scenarios.map((scenario, idx) => (
              <div
                key={idx}
                className="bg-[#161b22] border border-[#30363d] rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-[#c9d1d9]">
                    {idx + 1}. {scenario.title}
                  </h4>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded border ${
                      PRIORITY_COLORS[scenario.priority] ?? PRIORITY_COLORS.MEDIUM
                    }`}
                  >
                    {scenario.priority}
                  </span>
                </div>
                {scenario.steps && (
                  <div className="mb-2">
                    <p className="text-xs text-[#8b949e] mb-1">Steps:</p>
                    <pre className="text-xs text-[#c9d1d9] bg-[#0d1117] border border-[#30363d] rounded p-2 whitespace-pre-wrap font-mono">
                      {scenario.steps}
                    </pre>
                  </div>
                )}
                {scenario.expectedResult && (
                  <div>
                    <p className="text-xs text-[#8b949e] mb-1">Expected Result:</p>
                    <pre className="text-xs text-[#c9d1d9] bg-[#0d1117] border border-[#30363d] rounded p-2 whitespace-pre-wrap font-mono">
                      {scenario.expectedResult}
                    </pre>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-8 text-center">
              <p className="text-sm text-[#8b949e]">No scenarios defined</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Executions */}
      {plan.recentExecutions && plan.recentExecutions.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[#c9d1d9] mb-3">Recent Executions</h3>
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#30363d]">
                  <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Started At</th>
                  <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Duration</th>
                  <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {plan.recentExecutions.map((exec) => (
                  <tr key={exec.id} className="border-b border-[#30363d]/50 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {exec.status === 'PASSED' ? (
                          <CheckCircle2 className="w-4 h-4 text-[#238636]" />
                        ) : (
                          <XCircle className="w-4 h-4 text-[#da3633]" />
                        )}
                        <span className="text-xs text-[#c9d1d9]">{exec.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#8b949e]">
                      {new Date(exec.startedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#8b949e]">
                      {exec.duration != null ? `${exec.duration}s` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/tests/executions/${exec.id}`} className="text-xs text-[#58a6ff] hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
