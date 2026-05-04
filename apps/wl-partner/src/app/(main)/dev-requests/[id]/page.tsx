'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

const token =
  typeof window !== 'undefined' ? localStorage.getItem('wl_partner_token') || '' : '';
const BASE = process.env.NEXT_PUBLIC_WL_API_URL || '/api/v1/wl';

const apiFetch = (url: string, opts?: RequestInit) =>
  fetch(url, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(opts?.headers || {}),
    },
  }).then((r) => r.json());

const WORKFLOW_STEPS = [
  'SUBMITTED',
  'REVIEWING',
  'APPROVED',
  'IN_PROGRESS',
  'TESTING',
  'DELIVERED',
  'ACCEPTED',
] as const;

const priorityBadgeMap: Record<string, string> = {
  LOW: 'bg-blue-900 text-blue-300',
  MEDIUM: 'bg-yellow-900 text-yellow-300',
  HIGH: 'bg-orange-900 text-orange-300',
  CRITICAL: 'bg-red-900 text-red-300',
};

const statusBadgeMap: Record<string, string> = {
  SUBMITTED: 'bg-gray-700 text-gray-300',
  REVIEWING: 'bg-blue-900 text-blue-300',
  APPROVED: 'bg-indigo-900 text-indigo-300',
  IN_PROGRESS: 'bg-yellow-900 text-yellow-300',
  TESTING: 'bg-purple-900 text-purple-300',
  DELIVERED: 'bg-teal-900 text-teal-300',
  ACCEPTED: 'bg-green-900 text-green-300',
};

function formatDate(ts: string) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function WorkflowTimeline({ currentStatus }: { currentStatus: string }) {
  const currentIdx = WORKFLOW_STEPS.indexOf(currentStatus as (typeof WORKFLOW_STEPS)[number]);

  return (
    <div className="flex flex-col gap-0">
      {WORKFLOW_STEPS.map((step, i) => {
        const completed = i < currentIdx;
        const isCurrent = i === currentIdx;
        const upcoming = i > currentIdx;

        return (
          <div key={step} className="flex items-start gap-4">
            {/* Circle + connector */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  completed
                    ? 'bg-green-600 text-white'
                    : isCurrent
                    ? 'bg-blue-600 text-white ring-4 ring-blue-600/30 animate-pulse'
                    : 'bg-gray-800 text-gray-600 border border-gray-700'
                }`}
              >
                {completed ? (
                  <CheckCircle2 size={16} />
                ) : isCurrent ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Circle size={14} />
                )}
              </div>
              {i < WORKFLOW_STEPS.length - 1 && (
                <div
                  className={`w-0.5 h-8 mt-0.5 ${completed ? 'bg-green-700' : 'bg-gray-800'}`}
                />
              )}
            </div>
            {/* Label */}
            <div className="pt-1.5 pb-4">
              <span
                className={`text-sm font-medium ${
                  completed
                    ? 'text-green-400'
                    : isCurrent
                    ? 'text-blue-400'
                    : 'text-gray-600'
                }`}
              >
                {step.replace('_', ' ')}
              </span>
              {isCurrent && (
                <span className="ml-2 text-xs bg-blue-600/20 text-blue-300 px-2 py-0.5 rounded-full">
                  Current
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function DevRequestDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['dev-request-detail', id],
    queryFn: () => apiFetch(`${BASE}/dev-requests/${id}`),
    enabled: !!id,
  });

  const acceptMutation = useMutation({
    mutationFn: () =>
      apiFetch(`${BASE}/dev-requests/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'ACCEPTED' }),
      }),
    onSuccess: () => {
      toast.success('Delivery accepted');
      queryClient.invalidateQueries({ queryKey: ['dev-request-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['partner-dev-requests'] });
    },
    onError: () => toast.error('Failed to accept delivery'),
  });

  const req: any = data?.request || data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="text-blue-400 animate-spin" />
      </div>
    );
  }

  if (!req) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p>Request not found.</p>
        <Link href="/dev-requests" className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block">
          ← Back to Dev Requests
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Back link */}
      <Link
        href="/dev-requests"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition mb-6"
      >
        <ArrowLeft size={15} />
        Back to Dev Requests
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Header Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-2xl font-bold text-white leading-snug">{req.title}</h1>
              <div className="flex gap-2 flex-shrink-0">
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    priorityBadgeMap[req.priority] || 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {req.priority}
                </span>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    statusBadgeMap[req.status] || 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {(req.status || '').replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-5">
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Submitted</div>
                <div className="text-gray-300">{formatDate(req.createdAt || req.submittedAt)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Expected Delivery</div>
                <div className="text-gray-300">{formatDate(req.expectedDelivery)}</div>
              </div>
              {req.assignedDeveloper && (
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">Assigned Developer</div>
                  <div className="text-gray-300">{req.assignedDeveloper}</div>
                </div>
              )}
            </div>

            {/* Accept Delivery Button */}
            {req.status === 'DELIVERED' && (
              <button
                onClick={() => acceptMutation.mutate()}
                disabled={acceptMutation.isPending}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-60 rounded-lg text-sm font-semibold text-white transition"
              >
                <CheckCircle2 size={16} />
                {acceptMutation.isPending ? 'Accepting…' : 'Accept Delivery'}
              </button>
            )}
          </div>

          {/* Description Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Description
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              {req.description || 'No description provided.'}
            </p>
          </div>

          {/* Notes Card */}
          {req.notes && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Notes
              </h2>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                {req.notes}
              </p>
            </div>
          )}
        </div>

        {/* Workflow Timeline Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 sticky top-6">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">
              Status Timeline
            </h2>
            <WorkflowTimeline currentStatus={req.status} />
          </div>
        </div>
      </div>
    </div>
  );
}
