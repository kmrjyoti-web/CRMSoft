'use client';

import { useState, useEffect, useCallback } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { SeverityBadge } from '@/components/ui/SeverityBadge';
import {
  ArrowLeft,
  CheckCircle,
  UserPlus,
  MessageSquare,
  ChevronRight,
  User,
  Building2,
  Code,
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

type EscalationStep = {
  level: number;
  label: string;
  actor?: string;
  timestamp?: string;
  note?: string;
};

type ErrorDetail = {
  id: string;
  errorCode: string;
  message: string;
  severity: string;
  module?: string;
  component?: string;
  endpoint?: string;
  httpStatus?: number;
  brandId?: string;
  tenantId?: string;
  verticalType?: string;
  userId?: string;
  ipAddress?: string;
  stackTrace?: string;
  createdAt: string;
  resolvedAt?: string;
  resolution?: string;
  assignedTo?: string;
  escalation?: {
    level: number;
    developerNotes?: string;
    escalatedAt?: string;
    chain?: EscalationStep[];
  };
  notes?: Array<{ id: string; note: string; author?: string; createdAt: string }>;
};

const BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

async function fetchError(id: string): Promise<ErrorDetail | null> {
  try {
    const res = await fetch(`${BASE}/platform-console/errors/${id}`, { cache: 'no-store' });
    if (res.status === 404) return null;
    return res.ok ? res.json() : null;
  } catch {
    return null;
  }
}

function EscalationTimeline({ error }: { error: ErrorDetail }) {
  const chain: EscalationStep[] = error.escalation?.chain ?? [
    { level: 1, label: 'Customer', timestamp: error.createdAt },
    ...(error.escalation ? [
      { level: 2, label: 'Brand Admin', timestamp: error.escalation.escalatedAt },
      { level: 3, label: 'Developer', timestamp: error.escalation.escalatedAt, note: error.escalation.developerNotes },
    ] : []),
  ];

  const icons: React.ElementType[] = [User, Building2, Code];

  return (
    <div className="bg-[#161b22] border border-[#f0883e]/30 rounded-lg p-4">
      <p className="text-xs text-[#f0883e] mb-3 uppercase tracking-wider font-medium">
        Escalation Chain — Level {error.escalation?.level ?? 1}
      </p>
      <div className="flex items-start gap-0">
        {chain.map((step, idx) => {
          const Icon = icons[idx] ?? Code;
          const isActive = step.level <= (error.escalation?.level ?? 1);
          return (
            <div key={step.level} className="flex items-start flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    isActive
                      ? 'bg-[#f0883e]/20 border-[#f0883e] text-[#f0883e]'
                      : 'bg-white/5 border-[#30363d] text-[#8b949e]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <p className={`text-xs mt-1 font-medium ${isActive ? 'text-[#c9d1d9]' : 'text-[#8b949e]'}`}>
                  {step.label}
                </p>
                {step.timestamp && (
                  <p className="text-[10px] text-[#8b949e] mt-0.5">
                    {new Date(step.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  </p>
                )}
                {step.note && (
                  <p className="text-xs text-[#c9d1d9] mt-1 max-w-[120px] text-center">{step.note}</p>
                )}
              </div>
              {idx < chain.length - 1 && (
                <div className="flex-1 flex items-center mt-3.5 px-2">
                  <div className={`h-0.5 w-full ${isActive ? 'bg-[#f0883e]' : 'bg-[#30363d]'}`} />
                  <ChevronRight className={`w-3 h-3 flex-shrink-0 ${isActive ? 'text-[#f0883e]' : 'text-[#30363d]'}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ErrorDetailPage({ params }: { params: { id: string } }) {
  const [error, setError] = useState<ErrorDetail | null | undefined>(undefined);
  const [resolving, setResolving] = useState(false);
  const [resolution, setResolution] = useState('');
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [assigneeId, setAssigneeId] = useState('');
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [note, setNote] = useState('');
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const router = useRouter();

  const load = useCallback(async () => {
    const data = await fetchError(params.id);
    setError(data);
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  if (error === undefined) {
    return (
      <div className="space-y-4 max-w-4xl">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 bg-[#161b22] border border-[#30363d] rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error === null) {
    notFound();
  }

  const fields = [
    { label: 'Error Code', value: error.errorCode },
    { label: 'Module', value: error.module },
    { label: 'Component', value: error.component },
    { label: 'Endpoint', value: error.endpoint },
    { label: 'HTTP Status', value: error.httpStatus },
    { label: 'Brand ID', value: error.brandId },
    { label: 'Tenant ID', value: error.tenantId },
    { label: 'Vertical', value: error.verticalType },
    { label: 'User ID', value: error.userId },
    { label: 'IP Address', value: error.ipAddress },
  ];

  async function handleResolve() {
    if (!resolution.trim()) return;
    setActionLoading(true);
    try {
      await api.errors.resolve(params.id, resolution);
      setActionMsg('Resolved successfully.');
      setShowResolveForm(false);
      setResolution('');
      await load();
    } catch {
      setActionMsg('Failed to resolve.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAssign() {
    if (!assigneeId.trim()) return;
    setActionLoading(true);
    try {
      await api.errors.assign(params.id, assigneeId);
      setActionMsg('Assigned successfully.');
      setShowAssignForm(false);
      setAssigneeId('');
      await load();
    } catch {
      setActionMsg('Failed to assign.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAddNote() {
    if (!note.trim()) return;
    setActionLoading(true);
    try {
      await api.errors.addNote(params.id, note);
      setActionMsg('Note added.');
      setShowNoteForm(false);
      setNote('');
      await load();
    } catch {
      setActionMsg('Failed to add note.');
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Link
        href="/errors"
        className="flex items-center gap-1 text-sm text-[#8b949e] hover:text-[#c9d1d9] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to errors
      </Link>

      {/* Header */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
        <div className="flex items-start gap-3 mb-4">
          <SeverityBadge severity={error.severity} />
          <h2 className="text-base font-semibold text-[#c9d1d9] leading-snug">
            {error.message}
          </h2>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <p className="text-xs text-[#8b949e]">
            {new Date(error.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
          </p>
          {error.resolvedAt && (
            <span className="text-xs text-green-400">
              Resolved {new Date(error.resolvedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
            </span>
          )}
          {error.assignedTo && (
            <span className="text-xs text-[#58a6ff]">Assigned: {error.assignedTo}</span>
          )}
        </div>

        {/* Action buttons */}
        {!error.resolvedAt && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#30363d]">
            <button
              onClick={() => { setShowResolveForm((v) => !v); setShowAssignForm(false); setShowNoteForm(false); }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#238636] text-white rounded-md hover:bg-[#2ea043] transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Resolve
            </button>
            <button
              onClick={() => { setShowAssignForm((v) => !v); setShowResolveForm(false); setShowNoteForm(false); }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-[#30363d] text-[#8b949e] rounded-md hover:text-[#c9d1d9] hover:border-[#58a6ff] transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" /> Assign
            </button>
            <button
              onClick={() => { setShowNoteForm((v) => !v); setShowResolveForm(false); setShowAssignForm(false); }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-[#30363d] text-[#8b949e] rounded-md hover:text-[#c9d1d9] hover:border-[#58a6ff] transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Add Note
            </button>
          </div>
        )}

        {/* Resolve form */}
        {showResolveForm && (
          <div className="mt-3 space-y-2">
            <textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="Describe the resolution..."
              rows={3}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] placeholder-[#8b949e] p-3 resize-none focus:outline-none focus:border-[#58a6ff]"
            />
            <div className="flex gap-2">
              <button
                onClick={handleResolve}
                disabled={actionLoading || !resolution.trim()}
                className="px-3 py-1.5 text-xs bg-[#238636] text-white rounded-md hover:bg-[#2ea043] disabled:opacity-50"
              >
                {actionLoading ? 'Saving...' : 'Confirm Resolve'}
              </button>
              <button onClick={() => setShowResolveForm(false)} className="px-3 py-1.5 text-xs border border-[#30363d] text-[#8b949e] rounded-md">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Assign form */}
        {showAssignForm && (
          <div className="mt-3 space-y-2">
            <input
              type="text"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              placeholder="Developer user ID"
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] placeholder-[#8b949e] p-2.5 focus:outline-none focus:border-[#58a6ff]"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAssign}
                disabled={actionLoading || !assigneeId.trim()}
                className="px-3 py-1.5 text-xs bg-[#1f6feb] text-white rounded-md hover:bg-[#388bfd] disabled:opacity-50"
              >
                {actionLoading ? 'Assigning...' : 'Assign'}
              </button>
              <button onClick={() => setShowAssignForm(false)} className="px-3 py-1.5 text-xs border border-[#30363d] text-[#8b949e] rounded-md">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Note form */}
        {showNoteForm && (
          <div className="mt-3 space-y-2">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a developer note..."
              rows={3}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] placeholder-[#8b949e] p-3 resize-none focus:outline-none focus:border-[#58a6ff]"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddNote}
                disabled={actionLoading || !note.trim()}
                className="px-3 py-1.5 text-xs bg-[#6e40c9] text-white rounded-md hover:bg-[#8957e5] disabled:opacity-50"
              >
                {actionLoading ? 'Saving...' : 'Add Note'}
              </button>
              <button onClick={() => setShowNoteForm(false)} className="px-3 py-1.5 text-xs border border-[#30363d] text-[#8b949e] rounded-md">
                Cancel
              </button>
            </div>
          </div>
        )}

        {actionMsg && (
          <p className="text-xs text-green-400 mt-2">{actionMsg}</p>
        )}
      </div>

      {/* Escalation chain */}
      {error.escalation && <EscalationTimeline error={error} />}

      {/* Resolution (if resolved) */}
      {error.resolvedAt && error.resolution && (
        <div className="bg-[#161b22] border border-green-800/30 rounded-lg p-4">
          <p className="text-xs text-green-400 mb-2 uppercase tracking-wider font-medium">Resolution</p>
          <p className="text-sm text-[#c9d1d9]">{error.resolution}</p>
        </div>
      )}

      {/* Fields grid */}
      <div className="grid grid-cols-2 gap-3">
        {fields.map(
          ({ label, value }) =>
            value != null && value !== '' && (
              <div key={label} className="bg-[#161b22] border border-[#30363d] rounded-lg p-3">
                <p className="text-xs text-[#8b949e] mb-1">{label}</p>
                <p className="text-sm text-[#c9d1d9] font-mono">{String(value)}</p>
              </div>
            ),
        )}
      </div>

      {/* Stack trace */}
      {error.stackTrace && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
          <p className="text-xs text-[#8b949e] mb-2 uppercase tracking-wider">Stack Trace</p>
          <pre className="text-xs text-[#c9d1d9]/80 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
            {error.stackTrace}
          </pre>
        </div>
      )}

      {/* Notes */}
      {error.notes && error.notes.length > 0 && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
          <p className="text-xs text-[#8b949e] mb-3 uppercase tracking-wider">Developer Notes</p>
          <div className="space-y-3">
            {error.notes.map((n) => (
              <div key={n.id} className="border-l-2 border-[#58a6ff]/50 pl-3">
                <p className="text-sm text-[#c9d1d9]">{n.note}</p>
                <p className="text-xs text-[#8b949e] mt-1">
                  {n.author && <span className="text-[#58a6ff] mr-2">{n.author}</span>}
                  {new Date(n.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
