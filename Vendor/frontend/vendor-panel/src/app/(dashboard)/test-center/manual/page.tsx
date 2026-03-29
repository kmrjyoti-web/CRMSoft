'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardList, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/empty-state';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { formatDateTime } from '@/lib/utils';

function useManualTestLogs(filters: { module?: string; status?: string; page?: number }) {
  return useQuery({
    queryKey: ['manual-test-logs', filters],
    queryFn: () =>
      apiClient.get('/ops/manual-test', { params: filters }).then(r => (r.data as any)),
  });
}

const STATUS_CLASS: Record<string, string> = {
  PASS: 'bg-green-100 text-green-800',
  FAIL: 'bg-red-100 text-red-800',
  SKIP: 'bg-yellow-100 text-yellow-800',
  BLOCKED: 'bg-orange-100 text-orange-800',
};

const SEVERITY_CLASS: Record<string, string> = {
  LOW: 'bg-blue-100 text-blue-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-red-100 text-red-700',
  CRITICAL: 'bg-purple-100 text-purple-700',
};

export default function ManualTestsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data: res, isLoading } = useManualTestLogs({
    module: search || undefined,
    status: statusFilter || undefined,
    page,
  });

  const logs = res?.data?.data ?? [];
  const meta = res?.data?.meta ?? {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-orange-600" />
            Manual Test Logs
          </h1>
          <p className="text-sm text-gray-500">User-submitted test logs with screenshots and narration</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            className="pl-9"
            placeholder="Search by module..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="text-sm border rounded-md px-3 py-2 bg-white text-gray-700"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="PASS">Pass</option>
          <option value="FAIL">Fail</option>
          <option value="SKIP">Skip</option>
          <option value="BLOCKED">Blocked</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : logs.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<ClipboardList className="h-8 w-8" />}
                title="No manual test logs"
                description="Manual test logs submitted by testers will appear here."
              />
            </div>
          ) : (
            <div className="divide-y">
              {logs.map((log: any) => (
                <div key={log.id} className="p-4 flex items-start justify-between hover:bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_CLASS[log.status] ?? 'bg-gray-100'}`}>
                        {log.status}
                      </span>
                      {log.severity && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${SEVERITY_CLASS[log.severity] ?? 'bg-gray-100'}`}>
                          {log.severity}
                        </span>
                      )}
                      <span className="text-sm font-medium text-gray-800">{log.module} · {log.pageName}</span>
                    </div>
                    <p className="text-xs text-gray-600">{log.action}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDateTime(log.createdAt)}
                      {log.screenshotUrls?.length > 0 && ` · ${log.screenshotUrls.length} screenshot(s)`}
                      {log.bugReported && ' · Bug Reported'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {meta.totalPages > 1 && (
        <div className="flex gap-2 justify-center">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-gray-500 self-center">Page {page} of {meta.totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage(p => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
