'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  HeadphonesIcon, Clock, AlertCircle, CheckCircle, Timer, Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/empty-state';
import { useTickets, useTicketStats } from '@/hooks/use-support-tickets';
import { formatDateTime, truncate, extractList, extractMeta } from '@/lib/utils';
import type { SupportTicket, TicketFilters } from '@/types/support-ticket';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'WAITING_ON_CUSTOMER', label: 'Waiting on Customer' },
  { value: 'WAITING_ON_VENDOR', label: 'Waiting on Vendor' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

const PRIORITY_OPTIONS = [
  { value: '', label: 'All Priorities' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories' },
  { value: 'BUG', label: 'Bug' },
  { value: 'FEATURE_REQUEST', label: 'Feature Request' },
  { value: 'BILLING', label: 'Billing' },
  { value: 'PERFORMANCE', label: 'Performance' },
  { value: 'DATA_ISSUE', label: 'Data Issue' },
  { value: 'SECURITY', label: 'Security' },
  { value: 'OTHER', label: 'Other' },
];

const STATUS_VARIANT: Record<string, 'info' | 'warning' | 'destructive' | 'default' | 'success' | 'secondary'> = {
  OPEN: 'destructive',
  IN_PROGRESS: 'info',
  WAITING_ON_CUSTOMER: 'warning',
  WAITING_ON_VENDOR: 'warning',
  RESOLVED: 'success',
  CLOSED: 'secondary',
};

const PRIORITY_VARIANT: Record<string, 'info' | 'warning' | 'destructive' | 'default' | 'success' | 'secondary'> = {
  LOW: 'secondary',
  MEDIUM: 'info',
  HIGH: 'warning',
  URGENT: 'destructive',
};

const CATEGORY_VARIANT: Record<string, 'info' | 'warning' | 'destructive' | 'default' | 'success' | 'secondary'> = {
  BUG: 'destructive',
  FEATURE_REQUEST: 'info',
  BILLING: 'warning',
  PERFORMANCE: 'warning',
  DATA_ISSUE: 'default',
  SECURITY: 'destructive',
  OTHER: 'secondary',
};

export default function SupportPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);

  const filters: TicketFilters = {
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
    category: categoryFilter || undefined,
    page,
    limit: 20,
  };

  const { data: res, isLoading } = useTickets(filters);
  const { data: statsRes } = useTicketStats();

  const tickets: SupportTicket[] = extractList(res);
  const meta = extractMeta(res);
  const stats = statsRes?.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
        <p className="text-sm text-gray-500">Manage customer support requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-4 w-4 mx-auto text-red-500 mb-1" />
            <p className="text-xs text-gray-500">Open</p>
            <p className="text-xl font-bold text-red-600">{stats?.open ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Timer className="h-4 w-4 mx-auto text-blue-500 mb-1" />
            <p className="text-xs text-gray-500">In Progress</p>
            <p className="text-xl font-bold text-blue-600">{stats?.inProgress ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-4 w-4 mx-auto text-green-500 mb-1" />
            <p className="text-xs text-gray-500">Resolved</p>
            <p className="text-xl font-bold text-green-600">{stats?.resolved ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-4 w-4 mx-auto text-orange-500 mb-1" />
            <p className="text-xs text-gray-500">Avg Response</p>
            <p className="text-xl font-bold text-orange-600">
              {stats?.avgResponseHours != null ? `${stats.avgResponseHours.toFixed(1)}h` : '-'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-4 w-4 mx-auto text-yellow-500 mb-1" />
            <p className="text-xs text-gray-500">Satisfaction</p>
            <p className="text-xl font-bold text-yellow-600">
              {stats?.avgSatisfaction != null ? `${stats.avgSatisfaction.toFixed(1)}/5` : '-'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="w-48"
        />
        <Select
          options={PRIORITY_OPTIONS}
          value={priorityFilter}
          onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
          className="w-40"
        />
        <Select
          options={CATEGORY_OPTIONS}
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="w-44"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : tickets.length === 0 ? (
        <EmptyState icon={HeadphonesIcon} title="No tickets found" description="No support tickets match your filters" />
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Ticket #</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Tenant</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Subject</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Category</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Priority</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Assigned</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/support/${ticket.id}`)}
                >
                  <td className="px-4 py-3 text-sm font-mono font-medium text-blue-600">
                    {ticket.ticketNo}
                    {ticket.slaBreached && (
                      <span className="ml-1 text-red-500 text-xs" title="SLA Breached">!</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{ticket.tenantName ?? '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{truncate(ticket.subject, 40)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={CATEGORY_VARIANT[ticket.category] || 'default'} className="text-xs">
                      {ticket.category.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={PRIORITY_VARIANT[ticket.priority] || 'default'} className="text-xs">
                      {ticket.priority}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[ticket.status] || 'default'} className="text-xs">
                      {ticket.status.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{ticket.assignedToName ?? '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDateTime(ticket.createdAt)}
                    </span>
                  </td>
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
