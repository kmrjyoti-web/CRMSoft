'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Search, Clock, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/empty-state';
import { useErrorLogs, useErrorStats } from '@/hooks/use-error-logs';
import { useDebounce } from '@/hooks/use-debounce';
import { formatDateTime, truncate, extractList, extractMeta } from '@/lib/utils';
import type { ErrorLog, ErrorLogFilters, ErrorSeverity, ErrorStatus } from '@/types/error-log';

const SEVERITY_OPTIONS = [
  { value: '', label: 'All Severities' },
  { value: 'INFO', label: 'Info' },
  { value: 'WARNING', label: 'Warning' },
  { value: 'ERROR', label: 'Error' },
  { value: 'CRITICAL', label: 'Critical' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'OPEN', label: 'Open' },
  { value: 'INVESTIGATING', label: 'Investigating' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'IGNORED', label: 'Ignored' },
];

const SEVERITY_VARIANT: Record<ErrorSeverity, 'info' | 'warning' | 'destructive' | 'default'> = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'destructive',
  CRITICAL: 'default',
};

const SEVERITY_CLASS: Record<ErrorSeverity, string> = {
  INFO: 'bg-blue-100 text-blue-800',
  WARNING: 'bg-yellow-100 text-yellow-800',
  ERROR: 'bg-red-100 text-red-800',
  CRITICAL: 'bg-purple-100 text-purple-800',
};

const STATUS_VARIANT: Record<string, 'info' | 'warning' | 'destructive' | 'default' | 'success' | 'secondary'> = {
  OPEN: 'destructive',
  INVESTIGATING: 'warning',
  RESOLVED: 'success',
  IGNORED: 'secondary',
};

export default function ErrorLogsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const filters: ErrorLogFilters = {
    search: debouncedSearch || undefined,
    severity: severityFilter ? (severityFilter as ErrorSeverity) : undefined,
    status: statusFilter ? (statusFilter as ErrorStatus) : undefined,
    page,
    limit: 20,
  };

  const { data: res, isLoading } = useErrorLogs(filters);
  const { data: statsRes } = useErrorStats();

  const logs: ErrorLog[] = extractList(res);
  const meta = extractMeta(res);
  const stats = statsRes?.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Error Logs</h1>
        <p className="text-sm text-gray-500">Monitor application errors and exceptions</p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-gray-500">Total (24h)</p>
            <p className="text-xl font-bold">{stats?.total24h ?? 0}</p>
          </CardContent>
        </Card>
        {(['INFO', 'WARNING', 'ERROR', 'CRITICAL'] as ErrorSeverity[]).map((sev) => (
          <Card key={sev}>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-gray-500">{sev}</p>
              <p className="text-xl font-bold">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${SEVERITY_CLASS[sev]}`}>
                  {stats?.bySeverity?.[sev] ?? 0}
                </span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input
            leftIcon={<Search className="h-4 w-4" />}
            placeholder="Search error logs..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select
          options={SEVERITY_OPTIONS}
          value={severityFilter}
          onChange={(e) => { setSeverityFilter(e.target.value); setPage(1); }}
          className="w-44"
        />
        <Select
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="w-44"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : logs.length === 0 ? (
        <EmptyState icon={AlertTriangle} title="No error logs" description="No error logs found matching your filters" />
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Timestamp</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Severity</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Error Code</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Message</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Endpoint</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Assigned To</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Trace ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/error-logs/${log.traceId}`)}
                >
                  <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDateTime(log.createdAt)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={SEVERITY_VARIANT[log.severity]} className="text-xs">{log.severity}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {log.status ? (
                      <Badge variant={STATUS_VARIANT[log.status] || 'default'} className="text-xs">{log.status}</Badge>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-900">{log.errorCode}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{truncate(log.message, 60)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 font-mono">{log.endpoint ?? '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {log.assignedToName ? (
                      <span className="inline-flex items-center gap-1">
                        <UserCheck className="h-3.5 w-3.5 text-green-600" />
                        {log.assignedToName}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400 font-mono">{truncate(log.traceId, 12)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {meta?.totalPages && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
            Previous
          </Button>
          <span className="text-sm text-gray-500">Page {page} of {meta.totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= meta.totalPages}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
