'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Play, Clock, Calendar, CheckCircle, XCircle, Loader } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useScheduledTest, useScheduledTestRuns, useTriggerScheduledTest, useUpdateScheduledTest } from '@/hooks/use-scheduled-tests';
import { formatDateTime } from '@/lib/utils';

const RUN_STATUS_ICON: Record<string, React.ReactNode> = {
  COMPLETED: <CheckCircle className="h-4 w-4 text-green-500" />,
  FAILED: <XCircle className="h-4 w-4 text-red-500" />,
  RUNNING: <Loader className="h-4 w-4 text-blue-500 animate-spin" />,
  QUEUED: <Clock className="h-4 w-4 text-yellow-500" />,
};

export default function ScheduledTestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: testRes, isLoading } = useScheduledTest(id);
  const { data: runsRes, isLoading: runsLoading } = useScheduledTestRuns(id, 20);
  const triggerMutation = useTriggerScheduledTest();
  const updateMutation = useUpdateScheduledTest(id);

  const test = testRes?.data;
  const runs = runsRes?.data ?? [];

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-48 w-full" /><Skeleton className="h-96 w-full" /></div>;
  }

  if (!test) {
    return <div className="text-center py-12 text-gray-500">Schedule not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{test.name}</h1>
            <p className="text-sm text-gray-500">{test.description || 'No description'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => updateMutation.mutate({ isActive: !test.isActive })}
            disabled={updateMutation.isPending}
          >
            {test.isActive ? 'Pause' : 'Activate'}
          </Button>
          <Button
            onClick={() => triggerMutation.mutate(id)}
            disabled={triggerMutation.isPending}
          >
            <Play className="h-4 w-4 mr-1" />
            Run Now
          </Button>
        </div>
      </div>

      {/* Details Card */}
      <Card>
        <CardHeader><CardTitle className="text-base">Schedule Details</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">Status</dt>
              <dd>
                <Badge variant={test.isActive ? 'success' : 'secondary'}>
                  {test.isActive ? 'Active' : 'Paused'}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Cron</dt>
              <dd className="font-mono font-medium">{test.cronExpression}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Next Run</dt>
              <dd className="font-medium">{test.nextRunAt ? formatDateTime(test.nextRunAt) : '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Last Run</dt>
              <dd className="font-medium">{test.lastRunAt ? formatDateTime(test.lastRunAt) : 'Never'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Target Modules</dt>
              <dd>{test.targetModules.length > 0 ? test.targetModules.join(', ') : 'All modules'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Test Types</dt>
              <dd>{test.testTypes.join(', ')}</dd>
            </div>
            <div>
              <dt className="text-gray-500">DB Source</dt>
              <dd>{test.dbSourceType}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Last Status</dt>
              <dd>{test.lastRunStatus ?? '—'}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Run History */}
      <Card>
        <CardHeader><CardTitle className="text-base">Run History</CardTitle></CardHeader>
        <CardContent>
          {runsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : runs.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No runs yet.</p>
          ) : (
            <div className="divide-y">
              {runs.map((run: any) => (
                <div key={run.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {RUN_STATUS_ICON[run.status] ?? <Clock className="h-4 w-4 text-gray-400" />}
                    <div>
                      <p className="text-sm font-medium text-gray-800">{run.status}</p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(run.startedAt)}
                        {run.completedAt ? ` → ${formatDateTime(run.completedAt)}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    {run.testRunId && <p>Test Run: {run.testRunId.slice(0, 8)}…</p>}
                    {run.errorMessage && <p className="text-red-500">{run.errorMessage.slice(0, 60)}</p>}
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
