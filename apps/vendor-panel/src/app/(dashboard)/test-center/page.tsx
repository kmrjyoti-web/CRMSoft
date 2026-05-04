'use client';

import { useRouter } from 'next/navigation';
import { FlaskConical, Clock, BarChart2, AlertTriangle, Play, Calendar, List, ClipboardList, Brain, FileText, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { useScheduledTests } from '@/hooks/use-scheduled-tests';
import { formatDateTime } from '@/lib/utils';

function useTestRunSummary() {
  return useQuery({
    queryKey: ['test-run-summary'],
    queryFn: () =>
      apiClient.get('/ops/test-run', { params: { limit: 5 } }).then(r => (r.data as any).data),
  });
}

function useManualTestSummary() {
  return useQuery({
    queryKey: ['manual-test-summary'],
    queryFn: () =>
      apiClient.get('/ops/manual-test/summary').then(r => (r.data as any).data),
  });
}

function useCriticalErrors() {
  return useQuery({
    queryKey: ['critical-error-count'],
    queryFn: () =>
      apiClient.get('/admin/errors/logs', { params: { severity: 'CRITICAL', status: 'OPEN', limit: 1 } })
        .then(r => (r.data as any)?.meta?.total ?? 0),
  });
}

const STATUS_CLASS: Record<string, string> = {
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  RUNNING: 'bg-blue-100 text-blue-800',
  QUEUED: 'bg-yellow-100 text-yellow-800',
  CANCELLED: 'bg-gray-100 text-gray-700',
};

export default function TestCenterPage() {
  const router = useRouter();
  const { data: runsRes, isLoading: runsLoading } = useTestRunSummary();
  const { data: scheduledRes, isLoading: scheduledLoading } = useScheduledTests({ isActive: true });
  const { data: criticalCount } = useCriticalErrors();

  const recentRuns = runsRes?.data ?? [];
  const activeSchedules = scheduledRes?.data?.total ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-indigo-600" />
            Test Center
          </h1>
          <p className="text-sm text-gray-500">Manual, Automated &amp; Scheduled testing in one place</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/test-center/automated')}>
            <Play className="h-4 w-4 mr-1" />
            Run Tests
          </Button>
          <Button onClick={() => router.push('/test-center/scheduled/new')}>
            <Calendar className="h-4 w-4 mr-1" />
            New Schedule
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/test-center/automated')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-indigo-500" />
              Recent Test Runs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{recentRuns.length}</p>
            <p className="text-xs text-gray-500 mt-1">Last 5 runs shown below</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/test-center/scheduled')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-500" />
              Active Schedules
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scheduledLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-3xl font-bold text-gray-900">{activeSchedules}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">Running automatically</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/test-center/manual')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 flex items-center gap-2">
              <List className="h-4 w-4 text-orange-500" />
              Manual Test Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">—</p>
            <p className="text-xs text-gray-500 mt-1">View manual test history</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/test-center/errors')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Open Critical Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{criticalCount ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">Require immediate attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Test Runs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Test Runs</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => router.push('/test-center/automated')}>
            View All
          </Button>
        </CardHeader>
        <CardContent>
          {runsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : recentRuns.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FlaskConical className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No test runs yet. Start your first automated test.</p>
            </div>
          ) : (
            <div className="divide-y">
              {recentRuns.slice(0, 5).map((run: any) => (
                <div
                  key={run.id}
                  className="py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 px-2 rounded"
                  onClick={() => router.push(`/test-center/automated`)}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {run.runType} — {run.testTypes?.join(', ')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDateTime(run.createdAt)} · {run.passed ?? 0}/{run.totalTests ?? 0} passed
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_CLASS[run.status] ?? 'bg-gray-100 text-gray-700'}`}>
                    {run.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: 'Manual Testing', icon: List, href: '/test-center/manual', color: 'text-orange-500' },
          { label: 'Automated Runs', icon: Play, href: '/test-center/automated', color: 'text-indigo-500' },
          { label: 'Schedules', icon: Calendar, href: '/test-center/scheduled', color: 'text-green-500' },
          { label: 'Test Plans', icon: ClipboardList, href: '/test-center/test-plans', color: 'text-blue-500' },
          { label: 'Dev QA Log', icon: Brain, href: '/test-center/dev-qa', color: 'text-purple-500' },
          { label: 'Reports', icon: FileText, href: '/test-center/reports', color: 'text-teal-500' },
          { label: 'DB Backups', icon: Database, href: '/test-center/database', color: 'text-emerald-500' },
          { label: 'Error Logs', icon: AlertTriangle, href: '/test-center/errors', color: 'text-red-500' },
        ].map(link => (
          <Card
            key={link.href}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push(link.href)}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <link.icon className={`h-5 w-5 ${link.color}`} />
              <span className="text-sm font-medium text-gray-700">{link.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
