'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Clock, Globe, User, Shield, Bell,
  CheckCircle, XCircle, UserPlus, Timer, Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { useErrorLog, useResolveError, useIgnoreError } from '@/hooks/use-error-logs';
import { formatDateTime } from '@/lib/utils';
import type { ErrorSeverity } from '@/types/error-log';

const SEVERITY_VARIANT: Record<ErrorSeverity, 'info' | 'warning' | 'destructive' | 'default'> = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'destructive',
  CRITICAL: 'default',
};

const STATUS_VARIANT: Record<string, 'info' | 'warning' | 'destructive' | 'default' | 'success' | 'secondary'> = {
  OPEN: 'destructive',
  INVESTIGATING: 'warning',
  RESOLVED: 'success',
  IGNORED: 'secondary',
};

function JsonViewer({ data, label }: { data: Record<string, unknown> | string | null | undefined; label: string }) {
  const [expanded, setExpanded] = useState(false);
  if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) return null;

  return (
    <div className="space-y-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
      >
        {expanded ? 'Hide' : 'Show'} {label}
      </button>
      {expanded && (
        <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto text-xs font-mono leading-relaxed text-gray-700 max-h-80 overflow-y-auto">
          <code>{typeof data === 'string' ? data : JSON.stringify(data, null, 2)}</code>
        </pre>
      )}
    </div>
  );
}

export default function ErrorLogDetailPage({ params }: { params: { traceId: string } }) {
  const router = useRouter();
  const { data: res, isLoading } = useErrorLog(params.traceId);
  const log = res?.data;

  const [resolution, setResolution] = useState('');
  const [showResolveForm, setShowResolveForm] = useState(false);

  const resolveError = useResolveError();
  const ignoreError = useIgnoreError();

  if (isLoading) return <LoadingSpinner />;
  if (!log) return <div className="text-center py-16 text-gray-500">Error log not found</div>;

  const handleResolve = () => {
    if (!resolution.trim()) return;
    resolveError.mutate({ id: log.id, resolution });
    setShowResolveForm(false);
    setResolution('');
  };

  const handleIgnore = () => {
    ignoreError.mutate(log.id);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold font-mono">{log.errorCode}</h1>
            <Badge variant={SEVERITY_VARIANT[log.severity]}>{log.severity}</Badge>
            {log.status && (
              <Badge variant={STATUS_VARIANT[log.status] || 'default'}>{log.status}</Badge>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatDateTime(log.createdAt)}
          </p>
        </div>
        {/* Action Buttons */}
        <div className="flex gap-2">
          {log.status !== 'RESOLVED' && log.status !== 'IGNORED' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResolveForm(!showResolveForm)}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Resolve
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleIgnore}
                disabled={ignoreError.isPending}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Ignore
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Resolution Form */}
      {showResolveForm && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4 space-y-3">
            <label className="text-sm font-medium text-gray-700">Resolution Details</label>
            <textarea
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[80px]"
              placeholder="Describe how this error was resolved..."
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleResolve} disabled={resolveError.isPending || !resolution.trim()}>
                Submit Resolution
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowResolveForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resolution Info */}
      {log.status === 'RESOLVED' && log.resolution && (
        <Card className="border-green-200">
          <CardHeader><CardTitle className="text-sm flex items-center gap-2 text-green-700"><CheckCircle className="h-4 w-4" />Resolved</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-gray-700">{log.resolution}</p>
            {log.resolvedAt && (
              <p className="text-xs text-gray-500">Resolved at: {formatDateTime(log.resolvedAt)}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Error Message</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700">{log.message}</p>
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Request Info */}
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Globe className="h-4 w-4" />Request Info</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Method</span>
              <span className="font-mono font-medium">{log.method ?? '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Endpoint</span>
              <span className="font-mono text-xs truncate max-w-[140px]">{log.endpoint ?? '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status Code</span>
              <span className="font-mono font-medium">{log.statusCode ?? '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Response Time</span>
              <span className="font-mono font-medium">
                {log.responseTimeMs != null ? (
                  <span className="inline-flex items-center gap-1">
                    <Timer className="h-3 w-3" />
                    {log.responseTimeMs}ms
                  </span>
                ) : '-'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* User Info */}
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><User className="h-4 w-4" />User Context</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Name</span>
              <span className="truncate max-w-[140px]">{log.userName ?? '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Role</span>
              <span>{log.userRole ?? '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">User ID</span>
              <span className="font-mono text-xs truncate max-w-[140px]">{log.userId ?? 'Anonymous'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Tenant / Trace */}
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Building2 className="h-4 w-4" />Tenant &amp; Trace</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Tenant</span>
              <span className="truncate max-w-[140px]">{log.tenantName ?? '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Industry</span>
              <span>{log.industryCode ?? '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Trace ID</span>
              <span className="font-mono text-xs truncate max-w-[140px]">{log.traceId}</span>
            </div>
            {log.assignedToName && (
              <div className="flex justify-between">
                <span className="text-gray-500">Assigned To</span>
                <span className="inline-flex items-center gap-1 text-green-700">
                  <UserPlus className="h-3 w-3" />
                  {log.assignedToName}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Request Headers */}
      <JsonViewer data={log.requestHeaders} label="Request Headers" />

      {/* Response Body */}
      <JsonViewer data={log.responseBody} label="Response Body" />

      {/* Stack Trace */}
      {log.stackTrace && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Stack Trace</CardTitle></CardHeader>
          <CardContent>
            <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-xs font-mono leading-relaxed max-h-96 overflow-y-auto">
              <code>{log.stackTrace}</code>
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Auto-Report Info */}
      {log.isAutoReported && (
        <Card className="border-amber-200">
          <CardHeader><CardTitle className="text-sm flex items-center gap-2 text-amber-700"><Bell className="h-4 w-4" />Auto-Reported</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {log.autoReportedAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">Reported At</span>
                <span>{formatDateTime(log.autoReportedAt)}</span>
              </div>
            )}
            {log.autoReportedTo && log.autoReportedTo.length > 0 && (
              <div>
                <span className="text-gray-500 text-xs">Reported To:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {log.autoReportedTo.map((recipient, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{recipient}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Linked Support Ticket */}
      {log.supportTicketId && (
        <Card className="border-blue-200">
          <CardHeader><CardTitle className="text-sm flex items-center gap-2 text-blue-700"><Shield className="h-4 w-4" />Linked Support Ticket</CardTitle></CardHeader>
          <CardContent>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/support/${log.supportTicketId}`)}
            >
              View Ticket {log.supportTicketId}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      {log.metadata && Object.keys(log.metadata).length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Metadata</CardTitle></CardHeader>
          <CardContent>
            <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto text-xs font-mono leading-relaxed text-gray-700">
              <code>{JSON.stringify(log.metadata, null, 2)}</code>
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
