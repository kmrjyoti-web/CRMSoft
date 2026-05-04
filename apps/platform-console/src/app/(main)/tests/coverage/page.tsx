'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Loader2, HeartPulse } from 'lucide-react';
import { api } from '@/lib/api';

type ModuleCoverage = {
  moduleName: string;
  lineCoverage: number | null;
  branchCoverage: number | null;
  specFiles: number;
  tests: number;
};

type CoverageData = {
  totalModules: number;
  coveredModules: number;
  avgCoverage: number;
  modules: ModuleCoverage[];
};

function barColor(pct: number | null): string {
  if (pct == null || pct === 0) return 'bg-[#da3633]';
  if (pct >= 80) return 'bg-[#238636]';
  if (pct >= 60) return 'bg-[#d29922]';
  return 'bg-[#da3633]';
}

export default function CoveragePage() {
  const [data, setData] = useState<CoverageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCoverage = useCallback(async () => {
    setLoading(true);
    try {
      const result = (await api.tests.coverage()) as CoverageData;
      setData(result);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoverage();
  }, [fetchCoverage]);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await api.tests.refreshCoverage();
      await fetchCoverage();
    } catch {
      // ignore
    } finally {
      setRefreshing(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-[#161b22] border border-[#30363d] rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-[#161b22] border border-[#30363d] rounded-lg animate-pulse" />
      </div>
    );
  }

  const d = data ?? { totalModules: 0, coveredModules: 0, avgCoverage: 0, modules: [] };
  const covered = d.modules.filter((m) => m.lineCoverage != null && m.lineCoverage > 0);
  const uncovered = d.modules.filter((m) => m.lineCoverage == null || m.lineCoverage === 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#c9d1d9]">Coverage Report</h2>
          <p className="text-xs text-[#8b949e] mt-0.5">Test coverage across all modules</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#238636] text-white rounded-md hover:bg-[#2ea043] transition-colors disabled:opacity-50"
        >
          {refreshing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          Refresh Coverage
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
          <p className="text-xs text-[#8b949e]">Total Modules</p>
          <p className="text-2xl font-bold text-[#c9d1d9] mt-1">{d.totalModules}</p>
        </div>
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
          <p className="text-xs text-[#8b949e]">Covered Modules</p>
          <p className="text-2xl font-bold text-[#c9d1d9] mt-1">{d.coveredModules}</p>
        </div>
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
          <p className="text-xs text-[#8b949e]">Avg Coverage</p>
          <p className="text-2xl font-bold text-[#c9d1d9] mt-1">{d.avgCoverage.toFixed(1)}%</p>
        </div>
      </div>

      {/* Coverage heatmap */}
      {covered.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[#c9d1d9] mb-3">Module Coverage</h3>
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 space-y-3">
            {covered
              .sort((a, b) => (b.lineCoverage ?? 0) - (a.lineCoverage ?? 0))
              .map((mod) => {
                const pct = mod.lineCoverage ?? 0;
                return (
                  <div key={mod.moduleName} className="flex items-center gap-3">
                    <span className="text-xs text-[#c9d1d9] w-40 truncate font-mono">
                      {mod.moduleName}
                    </span>
                    <div className="flex-1 h-4 bg-[#0d1117] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${barColor(pct)}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-[#c9d1d9] w-12 text-right font-mono">
                      {pct.toFixed(0)}%
                    </span>
                    <span className="text-xs text-[#8b949e] w-32 text-right">
                      {mod.specFiles} specs, {mod.tests} tests
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Uncovered modules */}
      {uncovered.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[#c9d1d9] mb-3">
            Uncovered Modules ({uncovered.length})
          </h3>
          <div className="space-y-2">
            {uncovered.map((mod) => (
              <div
                key={mod.moduleName}
                className="bg-[#161b22] border border-[#da3633]/30 rounded-lg px-4 py-3 flex items-center justify-between"
              >
                <span className="text-xs text-[#c9d1d9] font-mono">{mod.moduleName}</span>
                <span className="text-xs text-[#da3633]">No coverage</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {d.modules.length === 0 && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-8 text-center">
          <HeartPulse className="w-8 h-8 mx-auto mb-2 text-[#8b949e] opacity-30" />
          <p className="text-sm text-[#8b949e]">No coverage data available</p>
          <p className="text-xs text-[#8b949e] mt-1">Run tests or refresh coverage to generate report</p>
        </div>
      )}
    </div>
  );
}
