'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, BarChart2, RefreshCw, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/empty-state';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';

function useTestRuns(page: number) {
  return useQuery({
    queryKey: ['test-runs', page],
    queryFn: () =>
      apiClient.get('/ops/test-run', { params: { page, limit: 20 } }).then(r => (r.data as any)),
  });
}

const STATUS_CLASS: Record<string, string> = {
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  RUNNING: 'bg-blue-100 text-blue-800',
  QUEUED: 'bg-yellow-100 text-yellow-800',
  CANCELLED: 'bg-gray-100 text-gray-700',
};

const TEST_TYPES = ['UNIT', 'FUNCTIONAL', 'SMOKE', 'INTEGRATION', 'ARCHITECTURE', 'PENETRATION'];

export default function AutomatedTestsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const { data: res, isLoading, refetch } = useTestRuns(page);

  const runs = res?.data?.data ?? [];
  const meta = res?.data?.meta ?? {};

  const runMutation = useMutation({
    mutationFn: (types: string[]) =>
      apiClient.post('/ops/test-run/auto', { testTypes: types, targetModules: [] }).then(r => r.data),
    onSuccess: () => {
      toast.success('Test run queued');
      qc.invalidateQueries({ queryKey: ['test-runs'] });
    },
    onError: () => toast.error('Failed to start test run'),
  });

  const toggleType = (type: string) => {
    setSelectedTypes(s => s.includes(type) ? s.filter(t => t !== type) : [...s, type]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart2 className="h-6 w-6 text-indigo-600" />
            Automated Tests
          </h1>
          <p className="text-sm text-gray-500">Run automated test suites: Unit, Functional, Smoke, Integration, Architecture, Penetration</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>

      {/* Run Tests Card */}
      <Card>
        <CardHeader><CardTitle className="text-base">Start New Test Run</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Select test types (blank = all):</p>
            <div className="flex flex-wrap gap-2">
              {TEST_TYPES.map(type => (
                <button
                  key={type}
                  type="button"
                  className={`text-sm px-3 py-1.5 rounded border font-medium transition-colors ${
                    selectedTypes.includes(type)
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
                  }`}
                  onClick={() => toggleType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <Button
            onClick={() => runMutation.mutate(selectedTypes)}
            disabled={runMutation.isPending}
          >
            <Play className="h-4 w-4 mr-1" />
            {runMutation.isPending ? 'Queueing...' : 'Run Tests'}
          </Button>
        </CardContent>
      </Card>

      {/* Test Runs List */}
      <Card>
        <CardHeader><CardTitle className="text-base">Test Run History</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : runs.length === 0 ? (
            <EmptyState
              icon={BarChart2}
              title="No test runs"
              description="Click Run Tests above to start your first automated test run."
            />
          ) : (
            <div className="divide-y">
              {runs.map((run: any) => (
                <div key={run.id} className="py-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_CLASS[run.status] ?? 'bg-gray-100 text-gray-700'}`}>
                        {run.status}
                      </span>
                      <span className="text-sm font-medium text-gray-800">{run.runType}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Tests: {run.testTypes?.join(', ')} · Started: {formatDateTime(run.createdAt)}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {run.passed ?? 0} passed / {run.failed ?? 0} failed / {run.totalTests ?? 0} total
                      {run.progressPercent < 100 && ` · ${run.progressPercent}%`}
                    </p>
                  </div>
                  <div className="shrink-0 ml-4">
                    <span className="text-xs text-gray-400">{run.id.slice(0, 8)}…</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
