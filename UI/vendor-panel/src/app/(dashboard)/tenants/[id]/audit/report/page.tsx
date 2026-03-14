'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Activity, Users, BarChart3, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { EmptyState } from '@/components/common/empty-state';
import { useAuditReport } from '@/hooks/use-tenant-audit';
import { formatDateTime } from '@/lib/utils';
import type { AuditReport } from '@/types/tenant-audit';

export default function AuditReportPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const tenantId = params.id;
  const { data: reportRes, isLoading } = useAuditReport(tenantId);
  const report: AuditReport | null = reportRes?.data ?? null;

  if (isLoading) return <LoadingSpinner />;

  if (!report) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Audit Report</h1>
        </div>
        <EmptyState icon={BarChart3} title="No report available" description="Start an audit session to generate a report" />
      </div>
    );
  }

  const { session, summary } = report;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Audit Report</h1>
          <p className="text-sm text-gray-500">
            {session.reason} &middot; Started {formatDateTime(session.startedAt)}
            {session.endedAt && ` &middot; Ended ${formatDateTime(session.endedAt)}`}
          </p>
        </div>
        <Badge variant={session.status === 'ACTIVE' ? 'success' : 'secondary'}>{session.status}</Badge>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="h-5 w-5 mx-auto text-blue-600 mb-1" />
            <p className="text-xs text-gray-500">Total Actions</p>
            <p className="text-2xl font-bold">{summary.totalActions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-5 w-5 mx-auto text-green-600 mb-1" />
            <p className="text-xs text-gray-500">Unique Users</p>
            <p className="text-2xl font-bold">{summary.uniqueUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-5 w-5 mx-auto text-purple-600 mb-1" />
            <p className="text-xs text-gray-500">Action Types</p>
            <p className="text-2xl font-bold">{summary.byAction?.length ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Layers className="h-5 w-5 mx-auto text-orange-600 mb-1" />
            <p className="text-xs text-gray-500">Entity Types</p>
            <p className="text-2xl font-bold">{summary.byEntity?.length ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown by Action Type */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Breakdown by Action Type</CardTitle>
        </CardHeader>
        <CardContent>
          {summary.byAction && summary.byAction.length > 0 ? (
            <div className="bg-white rounded-lg border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Action</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Count</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {summary.byAction.map((item) => (
                    <tr key={item.action} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.action}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-right font-semibold">{item.count}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 text-right">
                        {summary.totalActions > 0
                          ? ((item.count / summary.totalActions) * 100).toFixed(1)
                          : 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No data available</p>
          )}
        </CardContent>
      </Card>

      {/* Breakdown by User */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Breakdown by User</CardTitle>
        </CardHeader>
        <CardContent>
          {summary.byUser && summary.byUser.length > 0 ? (
            <div className="bg-white rounded-lg border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">User</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">User ID</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {summary.byUser.map((item) => (
                    <tr key={item.userId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.userName ?? '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 font-mono text-xs">{item.userId}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-right font-semibold">{item.count}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 text-right">
                        {summary.totalActions > 0
                          ? ((item.count / summary.totalActions) * 100).toFixed(1)
                          : 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No data available</p>
          )}
        </CardContent>
      </Card>

      {/* Breakdown by Entity Type */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Breakdown by Entity Type</CardTitle>
        </CardHeader>
        <CardContent>
          {summary.byEntity && summary.byEntity.length > 0 ? (
            <div className="bg-white rounded-lg border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Entity Type</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Count</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {summary.byEntity.map((item) => (
                    <tr key={item.entityType} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.entityType}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-right font-semibold">{item.count}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 text-right">
                        {summary.totalActions > 0
                          ? ((item.count / summary.totalActions) * 100).toFixed(1)
                          : 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
