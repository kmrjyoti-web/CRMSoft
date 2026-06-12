'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft,
  User,
  Building2,
  Layers,
  Calendar,
  UserCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

// ── types ───────────────────────────────────────────────────────────
type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type Status = 'OPEN' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DEPLOYED' | 'CLOSED';
type RequestType = 'BUG' | 'FEATURE' | 'ENHANCEMENT' | 'HOTFIX';

interface DevRequestDetail {
  id: string;
  title: string;
  description: string;
  type: RequestType;
  priority: Priority;
  status: Status;
  tenant: string;
  module: string;
  assignee: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
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

const TYPE_VARIANT: Record<RequestType, 'default' | 'info' | 'warning' | 'destructive'> = {
  BUG: 'destructive',
  FEATURE: 'info',
  ENHANCEMENT: 'default',
  HOTFIX: 'warning',
};

const STATUS_FLOW: Status[] = ['OPEN', 'IN_PROGRESS', 'IN_REVIEW', 'DEPLOYED', 'CLOSED'];

const STATUS_OPTIONS = STATUS_FLOW.map((s) => ({
  value: s,
  label: s.replace(/_/g, ' '),
}));

// ── mock data ───────────────────────────────────────────────────────
const mockDetail: Record<string, DevRequestDetail> = {
  '1': {
    id: '1',
    title: 'Fix lead duplicate detection failing',
    description:
      'The lead duplicate detection is not working correctly when leads are imported via CSV. The system should check for duplicate phone numbers and email addresses, but currently it only checks name matches.\n\nSteps to reproduce:\n1. Import a CSV with a lead that has the same phone number as an existing lead\n2. The system does not flag it as a duplicate\n3. A new lead is created instead of merging\n\nExpected: Duplicates should be detected based on phone, email, and name.\nActual: Only name-based matching is happening.',
    type: 'BUG',
    priority: 'HIGH',
    status: 'OPEN',
    tenant: 'Acme Corp',
    module: 'Leads',
    assignee: 'Rahul Sharma',
    createdBy: 'Priya Patel',
    createdAt: '2026-03-08T10:00:00Z',
    updatedAt: '2026-03-08T10:00:00Z',
  },
  '2': {
    id: '2',
    title: 'Add bulk import for contacts',
    description:
      'Feature request to allow bulk import of contacts via CSV and Excel files. This should include:\n- Upload file interface\n- Column mapping step\n- Duplicate detection preview\n- Import progress with error summary\n\nThis is a high-demand request from multiple tenants.',
    type: 'FEATURE',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    tenant: 'TechFlow Inc',
    module: 'Contacts',
    assignee: 'Amit Kumar',
    createdBy: 'Sneha Gupta',
    createdAt: '2026-03-07T14:30:00Z',
    updatedAt: '2026-03-08T09:00:00Z',
  },
  '3': {
    id: '3',
    title: 'Invoice PDF generation timeout',
    description:
      'When generating PDF invoices for large orders (50+ line items), the request times out after 30 seconds. This is a critical issue as tenants cannot generate invoices for their larger orders.\n\nWe need to either optimize the PDF generation or move it to a background job with notification on completion.',
    type: 'BUG',
    priority: 'CRITICAL',
    status: 'IN_REVIEW',
    tenant: 'GreenLeaf',
    module: 'Invoicing',
    assignee: 'Vikram Singh',
    createdBy: 'Arjun Mehta',
    createdAt: '2026-03-06T09:15:00Z',
    updatedAt: '2026-03-08T16:20:00Z',
  },
};

// ── component ───────────────────────────────────────────────────────
export default function DevRequestDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const detail = mockDetail[params.id];
  const [currentStatus, setCurrentStatus] = useState<Status>(detail?.status ?? 'OPEN');

  if (!detail) {
    return (
      <div className="text-center py-16 text-gray-500">
        Dev request not found
      </div>
    );
  }

  const handleStatusChange = (newStatus: string) => {
    setCurrentStatus(newStatus as Status);
    toast.success(`Status changed to ${newStatus.replace(/_/g, ' ')}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{detail.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLOR[currentStatus]}`}>
                {currentStatus.replace(/_/g, ' ')}
              </span>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${PRIORITY_COLOR[detail.priority]}`}>
                {detail.priority}
              </span>
              <Badge variant={TYPE_VARIANT[detail.type]}>{detail.type}</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Status change */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Update Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Select
              options={STATUS_OPTIONS}
              value={currentStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-52"
            />
            <div className="flex items-center gap-1 text-xs text-gray-400">
              {STATUS_FLOW.map((s, i) => (
                <span key={s} className="flex items-center gap-1">
                  <span
                    className={`${
                      STATUS_FLOW.indexOf(currentStatus) >= i
                        ? 'text-primary font-medium'
                        : 'text-gray-300'
                    }`}
                  >
                    {s.replace(/_/g, ' ')}
                  </span>
                  {i < STATUS_FLOW.length - 1 && <span className="text-gray-300">&rarr;</span>}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-gray-500">
              <Building2 className="h-4 w-4" />
              <span>Tenant:</span>
              <span className="font-medium text-gray-900">{detail.tenant}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Layers className="h-4 w-4" />
              <span>Module:</span>
              <span className="font-medium text-gray-900">{detail.module}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <User className="h-4 w-4" />
              <span>Assignee:</span>
              <span className="font-medium text-gray-900">{detail.assignee}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <UserCircle className="h-4 w-4" />
              <span>Created By:</span>
              <span className="font-medium text-gray-900">{detail.createdBy}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>Created:</span>
              <span className="font-medium text-gray-900">{formatDate(detail.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>Updated:</span>
              <span className="font-medium text-gray-900">{formatDate(detail.updatedAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{detail.description}</p>
        </CardContent>
      </Card>
    </div>
  );
}
