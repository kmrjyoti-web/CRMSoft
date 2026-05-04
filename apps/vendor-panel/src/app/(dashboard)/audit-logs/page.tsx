'use client';

import { useState } from 'react';
import { Search, Clock, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/empty-state';
import { useAuditLogs } from '@/hooks/use-audit-logs';
import { useDebounce } from '@/hooks/use-debounce';
import { formatDateTime, extractList, extractMeta } from '@/lib/utils';
import type { AuditLog, AuditLogFilters, AuditAction } from '@/types/audit-log';

const ACTION_OPTIONS = [
  { value: '', label: 'All Actions' },
  { value: 'CREATE', label: 'Create' },
  { value: 'UPDATE', label: 'Update' },
  { value: 'DELETE', label: 'Delete' },
  { value: 'LOGIN', label: 'Login' },
  { value: 'EXPORT', label: 'Export' },
  { value: 'IMPORT', label: 'Import' },
];

const ENTITY_OPTIONS = [
  { value: '', label: 'All Entities' },
  { value: 'Lead', label: 'Lead' },
  { value: 'Contact', label: 'Contact' },
  { value: 'Organization', label: 'Organization' },
  { value: 'User', label: 'User' },
  { value: 'Module', label: 'Module' },
  { value: 'License', label: 'License' },
  { value: 'Tenant', label: 'Tenant' },
];

const ACTION_VARIANT: Record<AuditAction, 'success' | 'info' | 'destructive' | 'default' | 'warning' | 'secondary'> = {
  CREATE: 'success',
  UPDATE: 'info',
  DELETE: 'destructive',
  LOGIN: 'default',
  EXPORT: 'warning',
  IMPORT: 'secondary',
};

export default function AuditLogsPage() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const filters: AuditLogFilters = {
    search: debouncedSearch || undefined,
    action: actionFilter ? (actionFilter as AuditAction) : undefined,
    entityType: entityFilter || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    page,
    limit: 20,
  };

  const { data: res, isLoading } = useAuditLogs(filters);

  const logs: AuditLog[] = extractList(res);
  const meta = extractMeta(res);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-sm text-gray-500">Track all user actions and data changes</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input
            leftIcon={<Search className="h-4 w-4" />}
            placeholder="Search audit logs..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select
          options={ACTION_OPTIONS}
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          className="w-40"
        />
        <Select
          options={ENTITY_OPTIONS}
          value={entityFilter}
          onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
          className="w-40"
        />
        <Input
          type="date"
          placeholder="From"
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
          className="w-40"
        />
        <Input
          type="date"
          placeholder="To"
          value={dateTo}
          onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
          className="w-40"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : logs.length === 0 ? (
        <EmptyState icon={FileText} title="No audit logs" description="No audit logs found matching your filters" />
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="w-8 px-2 py-3" />
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Timestamp</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">User</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Action</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Entity Type</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Entity ID</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => {
                const hasChanges = log.changes && Object.keys(log.changes).length > 0;
                const isExpanded = expandedRow === log.id;
                return (
                  <>
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-2 py-3">
                        {hasChanges && (
                          <button
                            onClick={() => setExpandedRow(isExpanded ? null : log.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDateTime(log.createdAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{log.userName}</td>
                      <td className="px-4 py-3">
                        <Badge variant={ACTION_VARIANT[log.action]} className="text-xs">{log.action}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{log.entityType}</td>
                      <td className="px-4 py-3 text-sm text-gray-400 font-mono">{log.entityId}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{log.ipAddress ?? '-'}</td>
                    </tr>
                    {isExpanded && hasChanges && (
                      <tr key={`${log.id}-changes`}>
                        <td colSpan={7} className="px-4 py-3 bg-gray-50">
                          <pre className="text-xs font-mono text-gray-700 overflow-x-auto whitespace-pre-wrap">
                            {JSON.stringify(log.changes, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
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
