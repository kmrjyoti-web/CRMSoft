'use client';

import { useRouter } from 'next/navigation';
import { AlertTriangle, BarChart2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useErrorLogs, useErrorStats } from '@/hooks/use-error-logs';
import { formatDateTime } from '@/lib/utils';

const SEVERITY_CLASS: Record<string, string> = {
  INFO: 'bg-blue-100 text-blue-800',
  WARNING: 'bg-yellow-100 text-yellow-800',
  ERROR: 'bg-red-100 text-red-800',
  CRITICAL: 'bg-purple-100 text-purple-800',
};

const CATEGORY_COLORS: Record<string, string> = {
  FUNCTIONAL: 'bg-indigo-500',
  VALIDATION: 'bg-yellow-500',
  DATABASE: 'bg-red-600',
  UI: 'bg-blue-400',
  PERFORMANCE: 'bg-orange-500',
  OTHER: 'bg-gray-400',
};

export default function TestCenterErrorsPage() {
  const router = useRouter();
  const { data: logsRes, isLoading: logsLoading, refetch } = useErrorLogs({ severity: 'CRITICAL', status: 'OPEN', limit: 10 });
  const { data: statsRes } = useErrorStats();

  const criticalLogs = logsRes?.data?.data ?? [];
  const stats = statsRes?.data;

  // Simulate category breakdown from stats
  const categories = [
    { key: 'DATABASE', label: 'Database Errors', count: stats?.byLayer?.DB ?? 0 },
    { key: 'FUNCTIONAL', label: 'Functional Errors', count: stats?.byLayer?.BE ?? 0 },
    { key: 'UI', label: 'UI Errors', count: stats?.byLayer?.FE ?? 0 },
    { key: 'VALIDATION', label: 'Validation Errors', count: 0 },
    { key: 'PERFORMANCE', label: 'Performance', count: 0 },
    { key: 'OTHER', label: 'Other', count: stats?.byLayer?.MOB ?? 0 },
  ];

  const maxCount = Math.max(...categories.map(c => c.count), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            Error Dashboard
          </h1>
          <p className="text-sm text-gray-500">Critical errors and category breakdown</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => router.push('/error-logs')}>
            View All Errors
          </Button>
        </div>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-indigo-500" />
          Error Category Breakdown
        </CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {categories.map(cat => (
            <div key={cat.key} className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-36 shrink-0">{cat.label}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full rounded-full ${CATEGORY_COLORS[cat.key]}`}
                  style={{ width: `${(cat.count / maxCount) * 100}%`, minWidth: cat.count > 0 ? '8px' : '0' }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700 w-10 text-right">{cat.count}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Open Critical Errors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-red-700 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Open Critical Errors
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : criticalLogs.length === 0 ? (
            <div className="text-center py-8 text-green-600">
              <p className="font-medium">No open critical errors</p>
              <p className="text-sm text-gray-400 mt-1">All clear!</p>
            </div>
          ) : (
            <div className="divide-y">
              {criticalLogs.map((log: any) => (
                <div
                  key={log.id}
                  className="py-3 flex items-start justify-between cursor-pointer hover:bg-gray-50 px-2 rounded"
                  onClick={() => router.push(`/error-logs/${log.requestId}`)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SEVERITY_CLASS[log.severity]}`}>
                        {log.severity}
                      </span>
                      <span className="text-sm font-medium text-gray-800 truncate">{log.errorCode}</span>
                    </div>
                    <p className="text-xs text-gray-600 truncate">{log.message}</p>
                    <p className="text-xs text-gray-400">{formatDateTime(log.createdAt)} · {log.path}</p>
                  </div>
                  {!log.reportedToProvider && (
                    <span className="text-xs text-red-600 font-medium ml-3 shrink-0">Not Reported</span>
                  )}
                </div>
              ))}
            </div>
          )}
          {criticalLogs.length > 0 && (
            <div className="mt-4 pt-3 border-t">
              <Button variant="outline" size="sm" onClick={() => router.push('/error-logs')}>
                View All Errors →
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
