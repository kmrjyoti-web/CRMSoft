'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Play, Square, Activity, FileText,
  Clock, Monitor, Smartphone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/empty-state';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import {
  useAuditStatus,
  useAuditLogs,
  useAuditHistory,
  useStartAudit,
  useStopAudit,
} from '@/hooks/use-tenant-audit';
import { formatDateTime, extractList, extractMeta } from '@/lib/utils';
import type { TenantAuditLog, TenantAuditSession } from '@/types/tenant-audit';

const ACTION_TYPE_OPTIONS = [
  { value: '', label: 'All Actions' },
  { value: 'PAGE_VISIT', label: 'Page Visit' },
  { value: 'CREATE', label: 'Create' },
  { value: 'UPDATE', label: 'Update' },
  { value: 'DELETE', label: 'Delete' },
  { value: 'LOGIN', label: 'Login' },
  { value: 'LOGOUT', label: 'Logout' },
  { value: 'EXPORT', label: 'Export' },
  { value: 'IMPORT', label: 'Import' },
  { value: 'SETTINGS_CHANGE', label: 'Settings Change' },
  { value: 'PERMISSION_DENIED', label: 'Permission Denied' },
  { value: 'API_CALL', label: 'API Call' },
  { value: 'FILE_UPLOAD', label: 'File Upload' },
  { value: 'FILE_DOWNLOAD', label: 'File Download' },
  { value: 'SEARCH', label: 'Search' },
  { value: 'BULK_ACTION', label: 'Bulk Action' },
];

const ACTION_VARIANT: Record<string, 'info' | 'warning' | 'destructive' | 'default' | 'success' | 'secondary'> = {
  CREATE: 'success',
  UPDATE: 'info',
  DELETE: 'destructive',
  LOGIN: 'success',
  LOGOUT: 'secondary',
  PERMISSION_DENIED: 'destructive',
  SETTINGS_CHANGE: 'warning',
  EXPORT: 'info',
  IMPORT: 'info',
  BULK_ACTION: 'warning',
};

const SESSION_STATUS_VARIANT: Record<string, 'info' | 'warning' | 'destructive' | 'default' | 'success' | 'secondary'> = {
  ACTIVE: 'success',
  COMPLETED: 'secondary',
  CANCELLED: 'warning',
};

export default function TenantAuditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const tenantId = params.id;

  const [reason, setReason] = useState('');
  const [scheduledDays, setScheduledDays] = useState('7');
  const [showStartForm, setShowStartForm] = useState(false);
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data: statusRes, isLoading: statusLoading } = useAuditStatus(tenantId);
  const session: TenantAuditSession | null = statusRes?.data ?? null;
  const isActive = session?.status === 'ACTIVE';

  const { data: logsRes, isLoading: logsLoading } = useAuditLogs(
    tenantId,
    isActive ? { actionType: actionFilter || undefined, page, limit: 20 } : undefined,
  );
  const logs: TenantAuditLog[] = extractList(logsRes);
  const logsMeta = extractMeta(logsRes);

  const { data: historyRes } = useAuditHistory(tenantId);
  const history: TenantAuditSession[] = extractList(historyRes);

  const startAudit = useStartAudit();
  const stopAudit = useStopAudit();

  const handleStart = () => {
    if (!reason.trim()) return;
    startAudit.mutate({
      tenantId,
      reason,
      scheduledDays: parseInt(scheduledDays) || 7,
    });
    setShowStartForm(false);
    setReason('');
  };

  const handleStop = () => {
    stopAudit.mutate(tenantId);
  };

  if (statusLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/tenants/${tenantId}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Tenant Audit</h1>
          <p className="text-sm text-gray-500">Monitor tenant activity in real-time</p>
        </div>
        <div className="flex gap-2">
          {isActive ? (
            <Button variant="destructive" size="sm" onClick={handleStop} disabled={stopAudit.isPending}>
              <Square className="h-4 w-4 mr-1" />
              Stop Audit
            </Button>
          ) : (
            <Button size="sm" onClick={() => setShowStartForm(!showStartForm)}>
              <Play className="h-4 w-4 mr-1" />
              Start Audit
            </Button>
          )}
          {isActive && (
            <Button variant="outline" size="sm" onClick={() => router.push(`/tenants/${tenantId}/audit/report`)}>
              <FileText className="h-4 w-4 mr-1" />
              View Report
            </Button>
          )}
        </div>
      </div>

      {/* Start Audit Form */}
      {showStartForm && !isActive && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 space-y-3">
            <label className="text-sm font-medium text-gray-700">Reason for Audit</label>
            <textarea
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]"
              placeholder="Why are you starting this audit?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Duration (days):</label>
                <Input
                  type="number"
                  value={scheduledDays}
                  onChange={(e) => setScheduledDays(e.target.value)}
                  className="w-20"
                />
              </div>
              <Button size="sm" onClick={handleStart} disabled={startAudit.isPending || !reason.trim()}>
                Start
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowStartForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Session Info */}
      {isActive && session && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-gray-500">Total Actions</p>
                <p className="text-2xl font-bold text-blue-600">{session.totalActions}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-gray-500">Unique Users</p>
                <p className="text-2xl font-bold text-green-600">{session.uniqueUsers}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-gray-500">Started At</p>
                <p className="text-sm font-medium">{formatDateTime(session.startedAt)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-gray-500">Scheduled End</p>
                <p className="text-sm font-medium">
                  {session.scheduledEndAt ? formatDateTime(session.scheduledEndAt) : '-'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <Select
              options={ACTION_TYPE_OPTIONS}
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
              className="w-48"
            />
          </div>

          {/* Activity Table */}
          {logsLoading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : logs.length === 0 ? (
            <EmptyState icon={Activity} title="No activity yet" description="No audit logs recorded for this session" />
          ) : (
            <div className="bg-white rounded-lg border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Timestamp</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">User</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Action</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Entity</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Description</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">IP</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Device</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDateTime(log.createdAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-gray-900">{log.userName ?? log.userId}</div>
                        {log.userRole && <div className="text-xs text-gray-500">{log.userRole}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={ACTION_VARIANT[log.actionType] || 'default'} className="text-xs">
                          {log.actionType}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {log.entityType ? (
                          <span className="font-mono text-xs">{log.entityType}</span>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 max-w-[200px] truncate">
                        {log.description}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 font-mono text-xs">
                        {log.ipAddress ?? '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {log.deviceType === 'mobile' ? (
                          <Smartphone className="h-4 w-4" />
                        ) : log.deviceType === 'desktop' ? (
                          <Monitor className="h-4 w-4" />
                        ) : (
                          <span className="text-xs">{log.deviceType ?? '-'}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {logsMeta?.totalPages && logsMeta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                Previous
              </Button>
              <span className="text-sm text-gray-500">Page {page} of {logsMeta.totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= logsMeta.totalPages}>
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Audit History (when no active session) */}
      {!isActive && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Audit History</h2>
          {history.length === 0 ? (
            <EmptyState icon={Activity} title="No audit history" description="No audits have been performed for this tenant" />
          ) : (
            <div className="bg-white rounded-lg border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Reason</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Started By</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Started</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Ended</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Users</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{s.reason}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{s.startedByName ?? s.startedById}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{formatDateTime(s.startedAt)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{s.endedAt ? formatDateTime(s.endedAt) : '-'}</td>
                      <td className="px-4 py-3">
                        <Badge variant={SESSION_STATUS_VARIANT[s.status] || 'default'} className="text-xs">{s.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">{s.totalActions}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{s.uniqueUsers}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
