'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Bug,
  Plus,
  Search,
  CircleDot,
  Clock,
  Eye,
  Rocket,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Textarea } from '@/components/ui/textarea';
import { EmptyState } from '@/components/common/empty-state';
import { useDebounce } from '@/hooks/use-debounce';
import { formatDate } from '@/lib/utils';

// ── types ───────────────────────────────────────────────────────────
type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type Status = 'OPEN' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DEPLOYED' | 'CLOSED';
type RequestType = 'BUG' | 'FEATURE' | 'ENHANCEMENT' | 'HOTFIX';

interface DevRequest {
  id: string;
  title: string;
  type: RequestType;
  priority: Priority;
  status: Status;
  tenant: string;
  module: string;
  createdAt: string;
}

// ── constants ───────────────────────────────────────────────────────
const PRIORITY_COLOR: Record<Priority, string> = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
};

const STATUS_COLOR: Record<Status, string> = {
  OPEN: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  IN_REVIEW: 'bg-purple-100 text-purple-800',
  DEPLOYED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
};

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'DEPLOYED', label: 'Deployed' },
  { value: 'CLOSED', label: 'Closed' },
];

const PRIORITY_OPTIONS = [
  { value: '', label: 'All Priority' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'BUG', label: 'Bug' },
  { value: 'FEATURE', label: 'Feature' },
  { value: 'ENHANCEMENT', label: 'Enhancement' },
  { value: 'HOTFIX', label: 'Hotfix' },
];

const TYPE_BADGE_VARIANT: Record<RequestType, 'default' | 'info' | 'warning' | 'destructive'> = {
  BUG: 'destructive',
  FEATURE: 'info',
  ENHANCEMENT: 'default',
  HOTFIX: 'warning',
};

// ── mock data ───────────────────────────────────────────────────────
const mockRequests: DevRequest[] = [
  { id: '1', title: 'Fix lead duplicate detection failing', type: 'BUG', priority: 'HIGH', status: 'OPEN', tenant: 'Acme Corp', module: 'Leads', createdAt: '2026-03-08T10:00:00Z' },
  { id: '2', title: 'Add bulk import for contacts', type: 'FEATURE', priority: 'MEDIUM', status: 'IN_PROGRESS', tenant: 'TechFlow Inc', module: 'Contacts', createdAt: '2026-03-07T14:30:00Z' },
  { id: '3', title: 'Invoice PDF generation timeout', type: 'BUG', priority: 'CRITICAL', status: 'IN_REVIEW', tenant: 'GreenLeaf', module: 'Invoicing', createdAt: '2026-03-06T09:15:00Z' },
  { id: '4', title: 'Calendar recurring event support', type: 'ENHANCEMENT', priority: 'LOW', status: 'OPEN', tenant: 'DataBridge', module: 'Calendar', createdAt: '2026-03-05T16:00:00Z' },
  { id: '5', title: 'Hotfix: payment gateway 502 errors', type: 'HOTFIX', priority: 'CRITICAL', status: 'DEPLOYED', tenant: 'PulseWave', module: 'Payments', createdAt: '2026-03-04T11:45:00Z' },
  { id: '6', title: 'Workflow email action not triggering', type: 'BUG', priority: 'HIGH', status: 'IN_PROGRESS', tenant: 'SkyHigh SaaS', module: 'Workflows', createdAt: '2026-03-03T13:20:00Z' },
  { id: '7', title: 'Add dashboard customization API', type: 'FEATURE', priority: 'MEDIUM', status: 'CLOSED', tenant: 'Acme Corp', module: 'Dashboard', createdAt: '2026-02-28T10:00:00Z' },
];

// ── component ───────────────────────────────────────────────────────
export default function DevRequestsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newType, setNewType] = useState('BUG');
  const [newPriority, setNewPriority] = useState('MEDIUM');
  const debouncedSearch = useDebounce(search, 300);

  const filtered = mockRequests.filter((r) => {
    if (debouncedSearch && !r.title.toLowerCase().includes(debouncedSearch.toLowerCase())) return false;
    if (statusFilter && r.status !== statusFilter) return false;
    if (priorityFilter && r.priority !== priorityFilter) return false;
    if (typeFilter && r.type !== typeFilter) return false;
    return true;
  });

  const statusCounts = {
    OPEN: mockRequests.filter((r) => r.status === 'OPEN').length,
    IN_PROGRESS: mockRequests.filter((r) => r.status === 'IN_PROGRESS').length,
    IN_REVIEW: mockRequests.filter((r) => r.status === 'IN_REVIEW').length,
    DEPLOYED: mockRequests.filter((r) => r.status === 'DEPLOYED').length,
  };

  const handleCreate = () => {
    if (!newTitle.trim()) {
      toast.error('Title is required');
      return;
    }
    toast.success('Dev request created');
    setShowCreate(false);
    setNewTitle('');
    setNewDescription('');
    setNewType('BUG');
    setNewPriority('MEDIUM');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dev Requests</h1>
          <p className="text-sm text-gray-500">Track bugs, features, and enhancement requests</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          New Request
        </Button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Open', count: statusCounts.OPEN, icon: CircleDot, color: 'text-blue-600 bg-blue-50' },
          { label: 'In Progress', count: statusCounts.IN_PROGRESS, icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
          { label: 'In Review', count: statusCounts.IN_REVIEW, icon: Eye, color: 'text-purple-600 bg-purple-50' },
          { label: 'Deployed', count: statusCounts.DEPLOYED, icon: Rocket, color: 'text-green-600 bg-green-50' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.count}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input
            leftIcon={<Search className="h-4 w-4" />}
            placeholder="Search requests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select options={STATUS_OPTIONS} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40" />
        <Select options={PRIORITY_OPTIONS} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="w-40" />
        <Select options={TYPE_OPTIONS} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-40" />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Bug}
          title="No dev requests"
          description="No requests match your current filters"
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="p-3 font-medium">Title</th>
                    <th className="p-3 font-medium">Type</th>
                    <th className="p-3 font-medium">Priority</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Tenant</th>
                    <th className="p-3 font-medium">Module</th>
                    <th className="p-3 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((req) => (
                    <tr
                      key={req.id}
                      className="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/dev-requests/${req.id}`)}
                    >
                      <td className="p-3 font-medium text-gray-900 max-w-xs truncate">{req.title}</td>
                      <td className="p-3">
                        <Badge variant={TYPE_BADGE_VARIANT[req.type]}>{req.type}</Badge>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${PRIORITY_COLOR[req.priority]}`}>
                          {req.priority}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLOR[req.status]}`}>
                          {req.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3 text-gray-500">{req.tenant}</td>
                      <td className="p-3 text-gray-500">{req.module}</td>
                      <td className="p-3 text-gray-500">{formatDate(req.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} size="lg">
        <div className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">New Dev Request</h3>
          <Input
            placeholder="Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <Textarea
            placeholder="Description..."
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            rows={4}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              options={TYPE_OPTIONS.filter((o) => o.value !== '')}
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
            />
            <Select
              options={PRIORITY_OPTIONS.filter((o) => o.value !== '')}
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Request</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
