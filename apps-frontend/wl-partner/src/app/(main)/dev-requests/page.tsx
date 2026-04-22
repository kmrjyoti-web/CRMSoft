'use client';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, ExternalLink, X, MessageSquare, Send, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

const token =
  typeof window !== 'undefined' ? localStorage.getItem('wl_partner_token') || '' : '';
const partnerId =
  typeof window !== 'undefined' ? localStorage.getItem('wl_partner_id') || '' : '';
const BASE = 'http://localhost:3010/api/v1/wl';

const apiFetch = (url: string, opts?: RequestInit) =>
  fetch(url, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(opts?.headers || {}),
    },
  }).then((r) => r.json());

type Status =
  | 'ALL'
  | 'SUBMITTED'
  | 'REVIEWING'
  | 'APPROVED'
  | 'IN_PROGRESS'
  | 'TESTING'
  | 'DELIVERED'
  | 'ACCEPTED';

const STATUS_TABS: Status[] = [
  'ALL',
  'SUBMITTED',
  'REVIEWING',
  'APPROVED',
  'IN_PROGRESS',
  'TESTING',
  'DELIVERED',
  'ACCEPTED',
];

// Ordered workflow steps (excluding ALL)
const WORKFLOW_STEPS = STATUS_TABS.slice(1);

const statusBadgeMap: Record<string, string> = {
  SUBMITTED: 'bg-gray-700 text-gray-300',
  REVIEWING: 'bg-blue-900 text-blue-300',
  APPROVED: 'bg-indigo-900 text-indigo-300',
  IN_PROGRESS: 'bg-yellow-900 text-yellow-300',
  TESTING: 'bg-purple-900 text-purple-300',
  DELIVERED: 'bg-teal-900 text-teal-300',
  ACCEPTED: 'bg-green-900 text-green-300',
};

const priorityBadgeMap: Record<string, string> = {
  LOW: 'bg-blue-900 text-blue-300',
  MEDIUM: 'bg-yellow-900 text-yellow-300',
  HIGH: 'bg-orange-900 text-orange-300',
  CRITICAL: 'bg-red-900 text-red-300',
};

function formatDate(ts: string) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// Simple progress bar showing current workflow position
function WorkflowProgress({ counts }: { counts: Record<string, number> }) {
  const total = WORKFLOW_STEPS.reduce((s, st) => s + (counts[st] || 0), 0);
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
      <div className="text-sm text-gray-400 mb-3 font-medium">Request Pipeline</div>
      <div className="flex gap-1">
        {WORKFLOW_STEPS.map((step) => {
          const count = counts[step] || 0;
          const pct = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={step} className="flex flex-col items-center flex-1 min-w-0">
              <div className="w-full bg-gray-800 rounded h-2 mb-1 overflow-hidden">
                <div
                  className="h-2 rounded bg-blue-500 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-500 truncate w-full text-center">
                {step.replace('_', ' ')}
              </span>
              {count > 0 && (
                <span className="text-[10px] text-blue-400 font-semibold">{count}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DevRequestsPage() {
  const [activeTab, setActiveTab] = useState<Status>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM' });
  const [chatReq, setChatReq] = useState<any>(null);
  const [commentMsg, setCommentMsg] = useState('');

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['partner-dev-requests', partnerId],
    queryFn: () => apiFetch(`${BASE}/dev-requests/partner/${partnerId}`),
    enabled: !!partnerId,
  });

  const { data: chatComments = [] } = useQuery({
    queryKey: ['partner-dev-request-comments', chatReq?.id],
    queryFn: () => apiFetch(`${BASE}/dev-requests/${chatReq?.id}/comments?isPartner=true`),
    enabled: !!chatReq?.id,
  });

  const commentMutation = useMutation({
    mutationFn: () =>
      apiFetch(`${BASE}/dev-requests/${chatReq.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ authorRole: 'PARTNER', authorName: 'Partner', message: commentMsg, isInternal: false }),
      }),
    onSuccess: () => {
      toast.success('Comment sent');
      setCommentMsg('');
      queryClient.invalidateQueries({ queryKey: ['partner-dev-request-comments', chatReq?.id] });
    },
    onError: () => toast.error('Failed to send comment'),
  });

  const createMutation = useMutation({
    mutationFn: (payload: typeof form) =>
      apiFetch(`${BASE}/dev-requests`, {
        method: 'POST',
        body: JSON.stringify({ partnerId, ...payload }),
      }),
    onSuccess: () => {
      toast.success('Development request submitted');
      setModalOpen(false);
      setForm({ title: '', description: '', priority: 'MEDIUM' });
      queryClient.invalidateQueries({ queryKey: ['partner-dev-requests', partnerId] });
    },
    onError: () => toast.error('Failed to submit request'),
  });

  const requests: any[] = data?.requests || data || [];
  const filtered =
    activeTab === 'ALL' ? requests : requests.filter((r: any) => r.status === activeTab);

  // Count by status for progress bar
  const counts: Record<string, number> = {};
  WORKFLOW_STEPS.forEach((s) => (counts[s] = 0));
  requests.forEach((r: any) => {
    if (counts[r.status] !== undefined) counts[r.status]++;
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    createMutation.mutate(form);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Development Requests</h1>
          <p className="text-sm text-gray-400 mt-1">Feature requests and custom development</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium text-white transition"
        >
          <Plus size={15} />
          New Request
        </button>
      </div>

      <WorkflowProgress counts={counts} />

      {/* Status Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            {tab.replace('_', ' ')}
            {tab !== 'ALL' && counts[tab] > 0 && (
              <span className="ml-1.5 bg-gray-700 text-gray-300 px-1.5 rounded-full text-[10px]">
                {counts[tab]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-gray-800">
            <tr>
              {['Title', 'Priority', 'Status', 'Submitted', 'Expected Delivery', 'Actions'].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-500">
                  Loading…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-500">
                  No requests found
                </td>
              </tr>
            ) : (
              filtered.map((req: any) => (
                <tr key={req.id} className="border-b border-gray-800 last:border-0">
                  <td className="px-4 py-3 text-sm font-medium text-white max-w-xs">
                    <span title={req.title}>
                      {(req.title || '').length > 60
                        ? req.title.slice(0, 60) + '…'
                        : req.title || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        priorityBadgeMap[req.priority] || 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      {req.priority || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        statusBadgeMap[req.status] || 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      {(req.status || '—').replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                    {formatDate(req.createdAt || req.submittedAt)}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                    {req.dueDate ? (
                      <span className="flex items-center gap-1">
                        <Clock size={10} /> {formatDate(req.dueDate)}
                      </span>
                    ) : formatDate(req.expectedDelivery)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => { setChatReq(req); setCommentMsg(''); }}
                      className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition"
                    >
                      <MessageSquare size={12} /> Chat
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* New Request Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-white">New Development Request</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-500 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Brief title for the request"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Describe the feature or change in detail…"
                  rows={5}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                >
                  {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 rounded-lg text-sm font-medium text-white transition"
                >
                  {createMutation.isPending ? 'Submitting…' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chat Thread Modal */}
      {chatReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <div>
                <h2 className="text-lg font-semibold text-white">{chatReq.title}</h2>
                <div className="flex gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadgeMap[chatReq.status] || 'bg-gray-800 text-gray-400'}`}>
                    {chatReq.status.replace('_', ' ')}
                  </span>
                  {chatReq.dueDate && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={10} /> Due: {formatDate(chatReq.dueDate)}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => setChatReq(null)} className="text-gray-500 hover:text-white transition"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {(chatComments as any[]).length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No messages yet. Start the conversation with your development team.</p>
              ) : (
                (chatComments as any[]).map((c: any) => (
                  <div key={c.id} className={`rounded-lg p-3 ${c.authorRole === 'PARTNER' ? 'bg-blue-900/20 border border-blue-800/30 ml-8' : 'bg-gray-800 border border-gray-700 mr-8'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-white">{c.authorName}</span>
                      <span className="text-xs text-gray-500">{c.authorRole === 'PARTNER' ? 'You' : 'Dev Team'}</span>
                      <span className="text-xs text-gray-600 ml-auto">{new Date(c.createdAt).toLocaleString('en-IN')}</span>
                    </div>
                    <p className="text-gray-300 text-sm">{c.message}</p>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-gray-800">
              <div className="flex gap-2">
                <textarea
                  value={commentMsg}
                  onChange={(e) => setCommentMsg(e.target.value)}
                  placeholder="Write a message to the development team..."
                  rows={2}
                  className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition resize-none placeholder-gray-500"
                />
                <button
                  disabled={!commentMsg.trim() || commentMutation.isPending}
                  onClick={() => commentMutation.mutate()}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-40 transition"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
