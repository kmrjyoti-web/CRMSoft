'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Rocket, RotateCcw } from 'lucide-react';
import { api } from '@/lib/api';

type VersionDetail = {
  id: string;
  version: string;
  verticalType?: string;
  releaseType: string;
  status: string;
  releaseNotes?: string;
  gitTag?: string;
  gitCommitHash?: string;
  releasedAt?: string;
  releasedBy?: string;
  createdAt: string;
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-900/50 text-gray-400 border-gray-800',
  STAGING: 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
  RELEASED: 'bg-green-900/50 text-green-400 border-green-800',
  ROLLED_BACK: 'bg-red-900/50 text-red-400 border-red-800',
};

const RELEASE_TYPE_COLORS: Record<string, string> = {
  MAJOR: 'bg-red-900/50 text-red-400 border-red-800',
  MINOR: 'bg-blue-900/50 text-blue-400 border-blue-800',
  PATCH: 'bg-gray-900/50 text-gray-400 border-gray-800',
};

export default function VersionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [data, setData] = useState<VersionDetail | null | undefined>(undefined);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [showRollback, setShowRollback] = useState(false);
  const [rollbackReason, setRollbackReason] = useState('');

  const load = useCallback(async () => {
    try {
      const result = (await api.versions.get(id)) as VersionDetail;
      setData(result);
    } catch {
      setData(null);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (data === undefined) {
    return (
      <div className="space-y-4 max-w-3xl">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 bg-[#161b22] border border-[#30363d] rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="max-w-3xl space-y-4">
        <Link href="/versions" className="flex items-center gap-1 text-sm text-[#8b949e] hover:text-[#c9d1d9]">
          <ArrowLeft className="w-4 h-4" /> Back to versions
        </Link>
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-8 text-center">
          <p className="text-sm text-[#8b949e]">Version not found</p>
        </div>
      </div>
    );
  }

  async function handlePublish() {
    setActionLoading(true);
    setActionMsg('');
    try {
      await api.versions.publish(id, 'developer');
      setActionMsg('Release published successfully.');
      await load();
    } catch {
      setActionMsg('Failed to publish release.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRollback() {
    if (!rollbackReason.trim()) return;
    setActionLoading(true);
    setActionMsg('');
    try {
      await api.versions.rollback(id, rollbackReason, 'developer');
      setActionMsg('Rollback completed successfully.');
      setShowRollback(false);
      setRollbackReason('');
      await load();
    } catch {
      setActionMsg('Failed to rollback.');
    } finally {
      setActionLoading(false);
    }
  }

  const fields = [
    { label: 'Version', value: data.version },
    { label: 'Vertical', value: data.verticalType ?? 'PLATFORM' },
    { label: 'Git Tag', value: data.gitTag },
    { label: 'Git Commit', value: data.gitCommitHash },
    { label: 'Released By', value: data.releasedBy },
    { label: 'Released At', value: data.releasedAt ? new Date(data.releasedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : null },
    { label: 'Created At', value: new Date(data.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) },
  ];

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        href="/versions"
        className="flex items-center gap-1 text-sm text-[#8b949e] hover:text-[#c9d1d9] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to versions
      </Link>

      {/* Header card */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#c9d1d9] font-mono">{data.version}</h2>
            <p className="text-xs text-[#8b949e] mt-1">{data.verticalType ?? 'PLATFORM'}</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded border ${
                RELEASE_TYPE_COLORS[data.releaseType] ?? RELEASE_TYPE_COLORS.PATCH
              }`}
            >
              {data.releaseType}
            </span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded border ${
                STATUS_COLORS[data.status] ?? STATUS_COLORS.DRAFT
              }`}
            >
              {data.status}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-4 border-t border-[#30363d]">
          {(data.status === 'DRAFT' || data.status === 'STAGING') && (
            <button
              onClick={handlePublish}
              disabled={actionLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#238636] text-white rounded-md hover:bg-[#2ea043] disabled:opacity-50 transition-colors"
            >
              <Rocket className="w-3.5 h-3.5" /> Publish Release
            </button>
          )}
          {data.status === 'RELEASED' && (
            <button
              onClick={() => setShowRollback((v) => !v)}
              disabled={actionLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#da3633] text-white rounded-md hover:bg-[#f85149] disabled:opacity-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Rollback
            </button>
          )}
        </div>

        {/* Rollback form */}
        {showRollback && (
          <div className="mt-3 space-y-2">
            <textarea
              value={rollbackReason}
              onChange={(e) => setRollbackReason(e.target.value)}
              placeholder="Reason for rollback..."
              rows={3}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] placeholder-[#8b949e] p-3 resize-none focus:outline-none focus:border-[#58a6ff]"
            />
            <div className="flex gap-2">
              <button
                onClick={handleRollback}
                disabled={actionLoading || !rollbackReason.trim()}
                className="px-3 py-1.5 text-xs bg-[#da3633] text-white rounded-md hover:bg-[#f85149] disabled:opacity-50"
              >
                {actionLoading ? 'Rolling back...' : 'Confirm Rollback'}
              </button>
              <button
                onClick={() => setShowRollback(false)}
                className="px-3 py-1.5 text-xs border border-[#30363d] text-[#8b949e] rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {actionMsg && <p className="text-xs text-green-400 mt-2">{actionMsg}</p>}
      </div>

      {/* Release Notes */}
      {data.releaseNotes && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
          <p className="text-xs text-[#8b949e] mb-2 uppercase tracking-wider font-medium">Release Notes</p>
          <p className="text-sm text-[#c9d1d9] whitespace-pre-wrap">{data.releaseNotes}</p>
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
    </div>
  );
}
