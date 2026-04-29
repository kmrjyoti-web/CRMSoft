'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Code2, ArrowRight, UserCheck, Eye, X, ChevronRight, MessageSquare, Clock, AlertTriangle, Send } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const token = typeof window !== 'undefined' ? localStorage.getItem('wl_admin_token') || '' : '';
const BASE = process.env.NEXT_PUBLIC_WL_API_URL || '/api/v1/wl';
const apiFetch = (url: string, opts?: RequestInit) =>
  fetch(url, { ...opts, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(opts?.headers || {}) } }).then((r) => r.json());

const TABS = (id: string) => [
  { label: 'Overview', href: `/partners/${id}` },
  { label: 'Branding', href: `/partners/${id}/branding` },
  { label: 'Domains', href: `/partners/${id}/domains` },
  { label: 'Pricing', href: `/partners/${id}/pricing` },
  { label: 'Provisioning', href: `/partners/${id}/provisioning` },
  { label: 'Feature Flags', href: `/partners/${id}/feature-flags` },
  { label: 'Git', href: `/partners/${id}/git` },
  { label: 'Deployments', href: `/partners/${id}/deployments` },
  { label: 'Errors', href: `/partners/${id}/errors` },
  { label: 'Tests', href: `/partners/${id}/tests` },
  { label: 'Dev Requests', href: `/partners/${id}/dev-requests` },
  { label: 'Usage', href: `/partners/${id}/usage` },
  { label: 'Billing', href: `/partners/${id}/billing` },
];

const STATUS_FLOW = ['SUBMITTED', 'REVIEWING', 'APPROVED', 'IN_PROGRESS', 'TESTING', 'DELIVERED', 'ACCEPTED'];

const PRIORITY_CONFIG: Record<string, string> = {
  LOW: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  MEDIUM: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  HIGH: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  CRITICAL: 'bg-red-500/20 text-red-400 border border-red-500/30',
};

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: 'bg-gray-600/40 text-gray-300',
  REVIEWING: 'bg-blue-500/20 text-blue-400',
  APPROVED: 'bg-cyan-500/20 text-cyan-400',
  IN_PROGRESS: 'bg-yellow-500/20 text-yellow-400',
  TESTING: 'bg-purple-500/20 text-purple-400',
  DELIVERED: 'bg-green-500/20 text-green-400',
  ACCEPTED: 'bg-emerald-500/20 text-emerald-400',
  REJECTED: 'bg-red-500/20 text-red-400',
};

function nextStatus(current: string): string | null {
  const idx = STATUS_FLOW.indexOf(current);
  return idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
}

function isOverdue(req: any): boolean {
  if (!req.dueDate) return false;
  if (['ACCEPTED', 'REJECTED'].includes(req.status)) return false;
  return new Date(req.dueDate) < new Date();
}

export default function DevRequestsPage() {
  const { id } = useParams() as { id: string };
  const qc = useQueryClient();
  const [assignTarget, setAssignTarget] = useState<any>(null);
  const [developer, setDeveloper] = useState('');
  const [detailReq, setDetailReq] = useState<any>(null);
  const [slaTarget, setSlaTarget] = useState<any>(null);
  const [dueDate, setDueDate] = useState('');
  const [slaHours, setSlaHours] = useState('');
  const [commentMsg, setCommentMsg] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['dev-requests', id],
    queryFn: () => apiFetch(`${BASE}/dev-requests?partnerId=${id}`).then((r) => r?.data ?? r ?? []),
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['dev-request-comments', detailReq?.id],
    queryFn: () => apiFetch(`${BASE}/dev-requests/${detailReq?.id}/comments`),
    enabled: !!detailReq?.id,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ reqId, action }: { reqId: string; action: 'APPROVE' | 'REJECT' }) =>
      apiFetch(`${BASE}/dev-requests/${reqId}/review`, { method: 'POST', body: JSON.stringify({ action }) }),
    onSuccess: (_, { action }) => { toast.success(`Request ${action}D`); qc.invalidateQueries({ queryKey: ['dev-requests', id] }); },
    onError: () => toast.error('Action failed'),
  });

  const assignMutation = useMutation({
    mutationFn: ({ reqId, dev }: { reqId: string; dev: string }) =>
      apiFetch(`${BASE}/dev-requests/${reqId}/assign`, { method: 'POST', body: JSON.stringify({ assignedDeveloper: dev }) }),
    onSuccess: () => {
      toast.success('Developer assigned');
      setAssignTarget(null);
      setDeveloper('');
      qc.invalidateQueries({ queryKey: ['dev-requests', id] });
    },
    onError: () => toast.error('Failed to assign'),
  });

  const deliverMutation = useMutation({
    mutationFn: (reqId: string) => apiFetch(`${BASE}/dev-requests/${reqId}/deliver`, { method: 'POST' }),
    onSuccess: () => { toast.success('Marked as delivered'); qc.invalidateQueries({ queryKey: ['dev-requests', id] }); },
    onError: () => toast.error('Failed'),
  });

  const slaMutation = useMutation({
    mutationFn: ({ reqId }: { reqId: string }) =>
      apiFetch(`${BASE}/dev-requests/${reqId}/due-date`, {
        method: 'PATCH',
        body: JSON.stringify({ dueDate, slaHours: slaHours ? parseInt(slaHours) : undefined }),
      }),
    onSuccess: () => {
      toast.success('SLA / Due date set');
      setSlaTarget(null);
      setDueDate('');
      setSlaHours('');
      qc.invalidateQueries({ queryKey: ['dev-requests', id] });
    },
    onError: () => toast.error('Failed to set SLA'),
  });

  const commentMutation = useMutation({
    mutationFn: () =>
      apiFetch(`${BASE}/dev-requests/${detailReq.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ authorRole: 'MASTER_ADMIN', authorName: 'Admin', message: commentMsg, isInternal }),
      }),
    onSuccess: () => {
      toast.success('Comment added');
      setCommentMsg('');
      qc.invalidateQueries({ queryKey: ['dev-request-comments', detailReq?.id] });
    },
    onError: () => toast.error('Failed to add comment'),
  });

  const overdueCount = (requests as any[]).filter(isOverdue).length;

  if (isLoading) return <div className="text-gray-400 p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex gap-2 overflow-x-auto text-sm">
        {TABS(id).map((t) => (
          <Link key={t.href} href={t.href}
            className={`px-3 py-1.5 rounded whitespace-nowrap ${t.label === 'Dev Requests' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-800 hover:text-white'}`}>
            {t.label}
          </Link>
        ))}
      </nav>

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Code2 className="text-blue-400" size={24} /> Development Requests
            {overdueCount > 0 && (
              <span className="flex items-center gap-1 text-sm bg-red-900/40 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">
                <AlertTriangle size={12} /> {overdueCount} overdue
              </span>
            )}
          </h1>
        </div>

        {/* Status Flow */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6 overflow-x-auto">
          <div className="flex items-center gap-1 min-w-max">
            {STATUS_FLOW.map((status, idx) => (
              <div key={status} className="flex items-center gap-1">
                <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${STATUS_COLORS[status]}`}>{status}</span>
                {idx < STATUS_FLOW.length - 1 && <ChevronRight className="w-3 h-3 text-gray-600" />}
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Title</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Priority</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Developer</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Due</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(requests as any[]).length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No development requests</td></tr>
              ) : (
                (requests as any[]).map((req: any) => {
                  const overdue = isOverdue(req);
                  return (
                    <tr key={req.id} className={`border-b border-gray-800 hover:bg-gray-800/50 ${overdue ? 'bg-red-950/10' : ''}`}>
                      <td className="px-4 py-3 text-white text-sm max-w-[200px]">
                        <div className="truncate" title={req.title}>{req.title}</div>
                        {overdue && <div className="text-xs text-red-400 flex items-center gap-1 mt-0.5"><AlertTriangle size={10} /> Overdue</div>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_CONFIG[req.priority] ?? 'bg-gray-700 text-gray-300'}`}>
                          {req.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[req.status] ?? 'bg-gray-700 text-gray-300'}`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-xs">{req.assignedDeveloper ?? '—'}</td>
                      <td className="px-4 py-3 text-xs">
                        {req.dueDate ? (
                          <span className={overdue ? 'text-red-400' : 'text-gray-300'}>
                            {new Date(req.dueDate).toLocaleDateString('en-IN')}
                          </span>
                        ) : <span className="text-gray-600">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5 flex-wrap">
                          {req.status === 'SUBMITTED' && (
                            <>
                              <button onClick={() => reviewMutation.mutate({ reqId: req.id, action: 'APPROVE' })}
                                className="px-2 py-1 bg-green-900/40 text-green-400 text-xs rounded hover:bg-green-900/60 transition">Approve</button>
                              <button onClick={() => reviewMutation.mutate({ reqId: req.id, action: 'REJECT' })}
                                className="px-2 py-1 bg-red-900/40 text-red-400 text-xs rounded hover:bg-red-900/60 transition">Reject</button>
                            </>
                          )}
                          {req.status === 'APPROVED' && (
                            <button onClick={() => { setAssignTarget(req); setDeveloper(req.assignedDeveloper ?? ''); }}
                              className="flex items-center gap-1 px-2 py-1 bg-blue-900/40 text-blue-400 text-xs rounded hover:bg-blue-900/60 transition">
                              <UserCheck size={10} /> Assign
                            </button>
                          )}
                          {(req.status === 'IN_PROGRESS' || req.status === 'TESTING') && (
                            <button onClick={() => deliverMutation.mutate(req.id)}
                              className="flex items-center gap-1 px-2 py-1 bg-green-900/40 text-green-400 text-xs rounded hover:bg-green-900/60 transition">
                              <ArrowRight size={10} /> Deliver
                            </button>
                          )}
                          <button onClick={() => { setSlaTarget(req); setDueDate(req.dueDate ? req.dueDate.split('T')[0] : ''); setSlaHours(req.slaHours?.toString() ?? ''); }}
                            className="flex items-center gap-1 px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded hover:bg-gray-600 transition">
                            <Clock size={10} /> SLA
                          </button>
                          <button onClick={() => setDetailReq(req)}
                            className="flex items-center gap-1 px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded hover:bg-gray-600 transition">
                            <MessageSquare size={10} /> Chat
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Modal */}
      {assignTarget && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Assign Developer</h2>
              <button onClick={() => setAssignTarget(null)}><X size={20} className="text-gray-400 hover:text-white" /></button>
            </div>
            <p className="text-gray-400 text-sm mb-4">Request: <span className="text-white">{assignTarget.title}</span></p>
            <input value={developer} onChange={(e) => setDeveloper(e.target.value)} placeholder="Developer name or username"
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4" />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setAssignTarget(null)} className="px-4 py-2 bg-gray-700 text-white text-sm rounded-lg">Cancel</button>
              <button disabled={!developer || assignMutation.isPending}
                onClick={() => assignMutation.mutate({ reqId: assignTarget.id, dev: developer })}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg disabled:opacity-40">
                {assignMutation.isPending ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SLA Modal */}
      {slaTarget && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Clock size={18} className="text-yellow-400" /> Set SLA / Due Date</h2>
              <button onClick={() => setSlaTarget(null)}><X size={20} className="text-gray-400 hover:text-white" /></button>
            </div>
            <p className="text-gray-400 text-sm mb-4">{slaTarget.title}</p>
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Due Date *</label>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">SLA Hours (optional)</label>
                <input type="number" value={slaHours} onChange={(e) => setSlaHours(e.target.value)} placeholder="e.g. 72"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setSlaTarget(null)} className="px-4 py-2 bg-gray-700 text-white text-sm rounded-lg">Cancel</button>
              <button disabled={!dueDate || slaMutation.isPending}
                onClick={() => slaMutation.mutate({ reqId: slaTarget.id })}
                className="px-4 py-2 bg-yellow-600 text-white text-sm rounded-lg disabled:opacity-40">
                {slaMutation.isPending ? 'Saving...' : 'Set SLA'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comment Thread Modal */}
      {detailReq && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <div>
                <h2 className="text-lg font-semibold text-white">{detailReq.title}</h2>
                <div className="flex gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${PRIORITY_CONFIG[detailReq.priority]}`}>{detailReq.priority}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_COLORS[detailReq.status]}`}>{detailReq.status}</span>
                  {detailReq.dueDate && <span className="text-xs text-gray-500 flex items-center gap-1"><Clock size={10} /> Due: {new Date(detailReq.dueDate).toLocaleDateString('en-IN')}</span>}
                </div>
              </div>
              <button onClick={() => setDetailReq(null)}><X size={20} className="text-gray-400 hover:text-white" /></button>
            </div>

            {detailReq.description && (
              <div className="px-5 py-3 bg-gray-800/50 border-b border-gray-800 text-sm text-gray-300">{detailReq.description}</div>
            )}

            {/* Comments */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {(comments as any[]).length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-6">No comments yet. Start the conversation.</p>
              ) : (
                (comments as any[]).map((c: any) => (
                  <div key={c.id} className={`rounded-lg p-3 ${c.isInternal ? 'bg-yellow-900/20 border border-yellow-800/30' : 'bg-gray-800 border border-gray-700'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-white">{c.authorName}</span>
                      <span className="text-xs text-gray-500">{c.authorRole}</span>
                      {c.isInternal && <span className="text-xs bg-yellow-900/40 text-yellow-400 px-1.5 py-0.5 rounded">Internal</span>}
                      <span className="text-xs text-gray-600 ml-auto">{new Date(c.createdAt).toLocaleString('en-IN')}</span>
                    </div>
                    <p className="text-gray-300 text-sm">{c.message}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment */}
            <div className="p-4 border-t border-gray-800">
              <div className="flex gap-2 mb-2">
                <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer">
                  <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} className="rounded" />
                  Internal note (hidden from partner)
                </label>
              </div>
              <div className="flex gap-2">
                <textarea
                  value={commentMsg}
                  onChange={(e) => setCommentMsg(e.target.value)}
                  placeholder="Add a comment or internal note..."
                  rows={2}
                  className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <button
                  disabled={!commentMsg.trim() || commentMutation.isPending}
                  onClick={() => commentMutation.mutate()}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 transition"
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
