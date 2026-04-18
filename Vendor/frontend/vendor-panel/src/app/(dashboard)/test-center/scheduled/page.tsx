'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Plus, Play, Trash2, ToggleLeft, ToggleRight, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/empty-state';
import { useScheduledTests, useDeleteScheduledTest, useTriggerScheduledTest, useUpdateScheduledTest } from '@/hooks/use-scheduled-tests';
import { formatDateTime } from '@/lib/utils';
import type { ScheduledTest } from '@/lib/api/scheduled-test';

const STATUS_CLASS: Record<string, string> = {
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  RUNNING: 'bg-blue-100 text-blue-800',
  QUEUED: 'bg-yellow-100 text-yellow-800',
};

export default function ScheduledTestsPage() {
  const router = useRouter();
  const { data: res, isLoading } = useScheduledTests();
  const deleteMutation = useDeleteScheduledTest();
  const triggerMutation = useTriggerScheduledTest();

  const tests: ScheduledTest[] = res?.data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-green-600" />
            Scheduled Tests
          </h1>
          <p className="text-sm text-gray-500">Auto-running tests on cron schedules — always using backup DB</p>
        </div>
        <Button onClick={() => router.push('/test-center/scheduled/new')}>
          <Plus className="h-4 w-4 mr-1" />
          New Schedule
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : tests.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No scheduled tests"
          description="Create a scheduled test to automatically run tests on a cron schedule."
          actionLabel="Create Schedule"
          onAction={() => router.push('/test-center/scheduled/new')}
        />
      ) : (
        <div className="grid gap-4">
          {tests.map(test => (
            <Card key={test.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-gray-900 truncate">{test.name}</h3>
                      <Badge variant={test.isActive ? 'success' : 'secondary'}>
                        {test.isActive ? 'Active' : 'Paused'}
                      </Badge>
                      {test.lastRunStatus && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_CLASS[test.lastRunStatus] ?? 'bg-gray-100 text-gray-700'}`}>
                          {test.lastRunStatus}
                        </span>
                      )}
                    </div>
                    {test.description && (
                      <p className="text-sm text-gray-500 mb-2">{test.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {test.cronExpression}
                      </span>
                      <span>Modules: {test.targetModules.length > 0 ? test.targetModules.join(', ') : 'All'}</span>
                      <span>Tests: {test.testTypes.join(', ')}</span>
                      {test.nextRunAt && (
                        <span>Next: {formatDateTime(test.nextRunAt)}</span>
                      )}
                      {test.lastRunAt && (
                        <span>Last: {formatDateTime(test.lastRunAt)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/test-center/scheduled/${test.id}`)}
                    >
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => triggerMutation.mutate(test.id)}
                      disabled={triggerMutation.isPending}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Run Now
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => {
                        if (confirm(`Delete "${test.name}"?`)) deleteMutation.mutate(test.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
