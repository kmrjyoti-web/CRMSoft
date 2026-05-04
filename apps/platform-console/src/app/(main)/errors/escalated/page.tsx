'use client';

import { useState, useCallback } from 'react';
import { SeverityBadge } from '@/components/ui/SeverityBadge';
import { AlertTriangle, CheckCircle, UserPlus, MessageSquare, X } from 'lucide-react';
import { api } from '@/lib/api';
import { useEffect } from 'react';
import Link from 'next/link';

type EscalatedError = {
  id: string;
  errorCode: string;
  message: string;
  severity: string;
  brandId?: string;
  verticalType?: string;
  escalatedAt: string;
  assignedTo?: string;
  resolvedAt?: string;
};

type EscalatedResponse = {
  items: EscalatedError[];
  total: number;
  page: number;
  totalPages: number;
};

function ResolveModal({
  errorId,
  onClose,
  onSuccess,
}: {
  errorId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [resolution, setResolution] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!resolution.trim()) {
      setError('Resolution text is required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.errors.resolve(errorId, resolution);
      onSuccess();
      onClose();
    } catch {
      setError('Failed to resolve. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#c9d1d9]">Resolve Error</h3>
          <button onClick={onClose} className="text-[#8b949e] hover:text-[#c9d1d9]">
            <X className="w-4 h-4" />
          </button>
        </div>
        <textarea
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          placeholder="Describe how this was resolved..."
          rows={4}
          className="w-full bg-[#0d1117] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] placeholder-[#8b949e] p-3 resize-none focus:outline-none focus:border-[#58a6ff]"
        />
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs border border-[#30363d] text-[#8b949e] rounded-md hover:text-[#c9d1d9]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-3 py-1.5 text-xs bg-[#238636] text-white rounded-md hover:bg-[#2ea043] disabled:opacity-50"
          >
            {loading ? 'Resolving...' : 'Mark Resolved'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AssignModal({
  errorId,
  onClose,
  onSuccess,
}: {
  errorId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [assigneeId, setAssigneeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!assigneeId.trim()) {
      setError('Assignee ID is required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.errors.assign(errorId, assigneeId);
      onSuccess();
      onClose();
    } catch {
      setError('Failed to assign. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#c9d1d9]">Assign Error</h3>
          <button onClick={onClose} className="text-[#8b949e] hover:text-[#c9d1d9]">
            <X className="w-4 h-4" />
          </button>
        </div>
        <input
          type="text"
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
          placeholder="Developer user ID"
          className="w-full bg-[#0d1117] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] placeholder-[#8b949e] p-2.5 focus:outline-none focus:border-[#58a6ff]"
        />
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs border border-[#30363d] text-[#8b949e] rounded-md hover:text-[#c9d1d9]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-3 py-1.5 text-xs bg-[#1f6feb] text-white rounded-md hover:bg-[#388bfd] disabled:opacity-50"
          >
            {loading ? 'Assigning...' : 'Assign'}
          </button>
        </div>
      </div>
    </div>
  );
}

function NoteModal({
  errorId,
  onClose,
}: {
  errorId: string;
  onClose: () => void;
}) {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit() {
    if (!note.trim()) {
      setError('Note text is required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.errors.addNote(errorId, note);
      setSuccess(true);
      setTimeout(onClose, 800);
    } catch {
      setError('Failed to add note. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#c9d1d9]">Add Note</h3>
          <button onClick={onClose} className="text-[#8b949e] hover:text-[#c9d1d9]">
            <X className="w-4 h-4" />
          </button>
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a developer note..."
          rows={4}
          className="w-full bg-[#0d1117] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] placeholder-[#8b949e] p-3 resize-none focus:outline-none focus:border-[#58a6ff]"
        />
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        {success && <p className="text-xs text-green-400 mt-1">Note added.</p>}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs border border-[#30363d] text-[#8b949e] rounded-md hover:text-[#c9d1d9]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || success}
            className="px-3 py-1.5 text-xs bg-[#6e40c9] text-white rounded-md hover:bg-[#8957e5] disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Add Note'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EscalatedErrorsPage() {
  const [data, setData] = useState<EscalatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [resolveId, setResolveId] = useState<string | null>(null);
  const [assignId, setAssignId] = useState<string | null>(null);
  const [noteId, setNoteId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = (await api.errors.escalated({ page, limit: 20 })) as EscalatedResponse;
      setData(result);
    } catch {
      setData({ items: [], total: 0, page: 1, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#c9d1d9]">Escalated Errors</h2>
          <p className="text-xs text-[#8b949e] mt-0.5">
            Errors escalated to developer level for resolution
          </p>
        </div>
        {data && (
          <span className="text-xs text-[#8b949e]">{data.total} escalated</span>
        )}
      </div>

      <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#30363d]">
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Severity</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Error Code</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Message</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Brand</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Vertical</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Escalated At</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Assigned To</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-[#30363d]/50">
                  {Array.from({ length: 8 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-white/5 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data?.items?.length ? (
              data.items.map((e) => (
                <tr
                  key={e.id}
                  className="border-b border-[#30363d]/50 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3">
                    <SeverityBadge severity={e.severity} />
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/errors/${e.id}`} className="text-[#58a6ff] hover:underline">
                      <code className="text-xs bg-white/5 px-1.5 py-0.5 rounded">{e.errorCode}</code>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[#c9d1d9] max-w-xs truncate" title={e.message}>
                    {e.message}
                  </td>
                  <td className="px-4 py-3 text-[#8b949e] text-xs">{e.brandId ?? '—'}</td>
                  <td className="px-4 py-3 text-[#8b949e] text-xs">{e.verticalType ?? '—'}</td>
                  <td className="px-4 py-3 text-[#8b949e] text-xs">
                    {new Date(e.escalatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  </td>
                  <td className="px-4 py-3 text-[#8b949e] text-xs">
                    {e.assignedTo ? (
                      <span className="text-[#58a6ff]">{e.assignedTo}</span>
                    ) : (
                      <span className="text-[#8b949e]/60 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {!e.resolvedAt && (
                        <button
                          onClick={() => setResolveId(e.id)}
                          title="Resolve"
                          className="p-1 rounded hover:bg-green-900/30 text-[#8b949e] hover:text-green-400 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setAssignId(e.id)}
                        title="Assign"
                        className="p-1 rounded hover:bg-blue-900/30 text-[#8b949e] hover:text-blue-400 transition-colors"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setNoteId(e.id)}
                        title="Add Note"
                        className="p-1 rounded hover:bg-purple-900/30 text-[#8b949e] hover:text-purple-400 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-[#8b949e]">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No escalated errors
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: Math.min(data.totalPages, 5) }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                page === p
                  ? 'bg-[#1f6feb]/20 border-[#1f6feb] text-[#58a6ff]'
                  : 'border-[#30363d] text-[#8b949e] hover:text-[#c9d1d9]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Modals */}
      {resolveId && (
        <ResolveModal errorId={resolveId} onClose={() => setResolveId(null)} onSuccess={fetchData} />
      )}
      {assignId && (
        <AssignModal errorId={assignId} onClose={() => setAssignId(null)} onSuccess={fetchData} />
      )}
      {noteId && (
        <NoteModal errorId={noteId} onClose={() => setNoteId(null)} />
      )}
    </div>
  );
}
