'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, XCircle, Loader2, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';

type ExecutionDetail = {
  id: string;
  status: string;
  triggerType: string;
  moduleScope: string | null;
  verticalScope: string | null;
  startedAt: string;
  completedAt: string | null;
  duration: number | null;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  coverage: number | null;
  output: string | null;
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PASSED: 'bg-green-900/50 text-green-400 border-green-800',
    FAILED: 'bg-red-900/50 text-red-400 border-red-800',
    RUNNING: 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
    ERROR: 'bg-red-900/50 text-red-400 border-red-800',
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded border ${map[status] ?? map.ERROR}`}>
      {status}
    </span>
  );
}

export default function ExecutionDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [exec, setExec] = useState<ExecutionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [outputExpanded, setOutputExpanded] = useState(false);

  const fetchExec = useCallback(async () => {
    setLoading(true);
    try {
      const data = (await api.tests.getExecution(id)) as ExecutionDetail;
      setExec(data);
    } catch {
      setExec(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchExec();
  }, [fetchExec]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-[#161b22] border border-[#30363d] rounded-lg animate-pulse" />
        <div className="h-16 bg-[#161b22] border border-[#30363d] rounded-lg animate-pulse" />
        <div className="h-64 bg-[#161b22] border border-[#30363d] rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!exec) {
    return (
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-8 text-center">
        <p className="text-sm text-[#8b949e]">Execution not found</p>
        <Link href="/tests/executions" className="text-xs text-[#58a6ff] hover:underline mt-2 inline-block">
          Back to Executions
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link href="/tests/executions" className="inline-flex items-center gap-1 text-xs text-[#58a6ff] hover:underline">
        <ArrowLeft className="w-3 h-3" /> Back to Executions
      </Link>

      {/* Top section */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <StatusBadge status={exec.status} />
              <code className="text-xs bg-white/5 px-1.5 py-0.5 rounded text-[#8b949e]">
                {exec.triggerType}
              </code>
            </div>
            <p className="text-xs text-[#8b949e]">Execution ID: {exec.id}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <p className="text-[#8b949e]">Module Scope</p>
            <p className="text-[#c9d1d9] mt-0.5">{exec.moduleScope ?? 'All'}</p>
          </div>
          <div>
            <p className="text-[#8b949e]">Vertical Scope</p>
            <p className="text-[#c9d1d9] mt-0.5">{exec.verticalScope ?? 'All'}</p>
          </div>
          <div>
            <p className="text-[#8b949e]">Started At</p>
            <p className="text-[#c9d1d9] mt-0.5">
              {new Date(exec.startedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
            </p>
          </div>
          <div>
            <p className="text-[#8b949e]">Completed At</p>
            <p className="text-[#c9d1d9] mt-0.5">
              {exec.completedAt
                ? new Date(exec.completedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
                : 'In progress...'}
            </p>
          </div>
          <div>
            <p className="text-[#8b949e]">Duration</p>
            <p className="text-[#c9d1d9] mt-0.5">{exec.duration != null ? `${exec.duration}s` : '-'}</p>
          </div>
        </div>
      </div>

      {/* Results bar */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-lg font-bold text-[#c9d1d9]">{exec.totalTests}</p>
            <p className="text-xs text-[#8b949e]">Total</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-[#238636]">{exec.passed}</p>
            <p className="text-xs text-[#8b949e]">Passed</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-[#da3633]">{exec.failed}</p>
            <p className="text-xs text-[#8b949e]">Failed</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-[#8b949e]">{exec.skipped}</p>
            <p className="text-xs text-[#8b949e]">Skipped</p>
          </div>
          {exec.coverage != null && (
            <div className="text-center ml-auto">
              <p className="text-lg font-bold text-[#c9d1d9]">{exec.coverage.toFixed(1)}%</p>
              <p className="text-xs text-[#8b949e]">Coverage</p>
            </div>
          )}
        </div>
        {/* Progress bar */}
        {exec.totalTests > 0 && (
          <div className="flex h-2 rounded-full overflow-hidden mt-3 bg-[#0d1117]">
            <div
              className="bg-[#238636]"
              style={{ width: `${(exec.passed / exec.totalTests) * 100}%` }}
            />
            <div
              className="bg-[#da3633]"
              style={{ width: `${(exec.failed / exec.totalTests) * 100}%` }}
            />
            <div
              className="bg-[#484f58]"
              style={{ width: `${(exec.skipped / exec.totalTests) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Output */}
      {exec.output && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
          <button
            onClick={() => setOutputExpanded((v) => !v)}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[#c9d1d9] hover:bg-white/[0.03] transition-colors"
          >
            {outputExpanded ? (
              <ChevronDown className="w-4 h-4 text-[#8b949e]" />
            ) : (
              <ChevronRight className="w-4 h-4 text-[#8b949e]" />
            )}
            View Full Output
          </button>
          {outputExpanded && (
            <div className="border-t border-[#30363d]">
              <pre className="text-xs text-[#c9d1d9] bg-[#0d1117] p-4 overflow-auto font-mono" style={{ maxHeight: 500 }}>
                {exec.output}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
