'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVersions, useVersionStats, useCreateVersion, usePublishVersion, useRollbackVersion } from '@/hooks/use-versions';
import type { VersionStatus, ReleaseType, CreateVersionDto, AppVersion } from '@/types/version';

const STATUS_COLORS: Record<VersionStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  TESTING: 'bg-blue-100 text-blue-700',
  STAGED: 'bg-yellow-100 text-yellow-700',
  PUBLISHED: 'bg-green-100 text-green-700',
  ROLLED_BACK: 'bg-red-100 text-red-700',
  DEPRECATED: 'bg-gray-200 text-gray-500',
};

const RELEASE_COLORS: Record<ReleaseType, string> = {
  MAJOR: 'bg-purple-100 text-purple-700',
  MINOR: 'bg-blue-100 text-blue-700',
  PATCH: 'bg-teal-100 text-teal-700',
  HOTFIX: 'bg-red-100 text-red-700',
};

export default function VersionsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<{ status?: VersionStatus; releaseType?: ReleaseType; search?: string; page: number }>({ page: 1 });
  const [showCreate, setShowCreate] = useState(false);
  const [showRollbackId, setShowRollbackId] = useState<string | null>(null);
  const [rollbackReason, setRollbackReason] = useState('');
  const [newVersion, setNewVersion] = useState<CreateVersionDto>({ version: '' });

  const { data: versionsData, isLoading } = useVersions(filters);
  const { data: statsData } = useVersionStats();
  const createMutation = useCreateVersion();
  const publishMutation = usePublishVersion();
  const rollbackMutation = useRollbackVersion();

  const paginated = versionsData?.data as { data?: AppVersion[]; meta?: { total: number } } | undefined;
  const versions: AppVersion[] = paginated?.data ?? [];
  const total = paginated?.meta?.total ?? 0;
  const stats = statsData?.data;

  const handleCreate = async () => {
    if (!newVersion.version) return;
    await createMutation.mutateAsync(newVersion);
    setShowCreate(false);
    setNewVersion({ version: '' });
  };

  const handleRollback = async () => {
    if (!showRollbackId) return;
    await rollbackMutation.mutateAsync({ id: showRollbackId, reason: rollbackReason });
    setShowRollbackId(null);
    setRollbackReason('');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Version Control</h1>
          <p className="text-sm text-gray-500 mt-1">Manage releases, patches, and deployments</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + New Version
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border p-4">
            <p className="text-sm text-gray-500">Total Versions</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          {stats.byStatus.slice(0, 3).map((s) => (
            <div key={s.status} className="bg-white rounded-xl border p-4">
              <p className="text-sm text-gray-500">{s.status}</p>
              <p className="text-2xl font-bold">{s.count}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search versions..."
          className="px-3 py-2 border rounded-lg text-sm w-64"
          value={filters.search || ''}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))}
        />
        <select
          className="px-3 py-2 border rounded-lg text-sm"
          value={filters.status || ''}
          onChange={(e) => setFilters((f) => ({ ...f, status: (e.target.value || undefined) as VersionStatus | undefined, page: 1 }))}
        >
          <option value="">All Statuses</option>
          {['DRAFT', 'TESTING', 'STAGED', 'PUBLISHED', 'ROLLED_BACK', 'DEPRECATED'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          className="px-3 py-2 border rounded-lg text-sm"
          value={filters.releaseType || ''}
          onChange={(e) => setFilters((f) => ({ ...f, releaseType: (e.target.value || undefined) as ReleaseType | undefined, page: 1 }))}
        >
          <option value="">All Types</option>
          {['MAJOR', 'MINOR', 'PATCH', 'HOTFIX'].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Version</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Code Name</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Type</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Patches</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Deployed</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : versions.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No versions found</td></tr>
            ) : (
              versions.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/versions/${v.id}`)}>
                  <td className="px-4 py-3 font-mono font-semibold text-indigo-600">v{v.version}</td>
                  <td className="px-4 py-3 text-gray-700">{v.codeName || '\u2014'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${RELEASE_COLORS[v.releaseType as ReleaseType] || ''}`}>
                      {v.releaseType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[v.status as VersionStatus] || ''}`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{v._count?.patches ?? 0}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {v.deployedAt ? new Date(v.deployedAt).toLocaleDateString() : '\u2014'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      {v.status === 'DRAFT' || v.status === 'TESTING' || v.status === 'STAGED' ? (
                        <button
                          onClick={() => publishMutation.mutate(v.id)}
                          className="px-2 py-1 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100"
                          disabled={publishMutation.isPending}
                        >
                          Publish
                        </button>
                      ) : null}
                      {v.status === 'PUBLISHED' ? (
                        <button
                          onClick={() => setShowRollbackId(v.id)}
                          className="px-2 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100"
                        >
                          Rollback
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {total > 20 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <span className="text-sm text-gray-500">Page {filters.page} of {Math.ceil(total / 20)}</span>
            <div className="flex gap-2">
              <button disabled={filters.page <= 1} onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))} className="px-3 py-1 text-sm border rounded disabled:opacity-50">Prev</button>
              <button disabled={filters.page >= Math.ceil(total / 20)} onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))} className="px-3 py-1 text-sm border rounded disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 space-y-4">
            <h2 className="text-lg font-bold">Create New Version</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Version *</label>
                <input type="text" placeholder="1.0.0" className="w-full px-3 py-2 border rounded-lg" value={newVersion.version} onChange={(e) => setNewVersion((v) => ({ ...v, version: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code Name</label>
                <input type="text" placeholder="e.g., Phoenix" className="w-full px-3 py-2 border rounded-lg" value={newVersion.codeName || ''} onChange={(e) => setNewVersion((v) => ({ ...v, codeName: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Release Type</label>
                <select className="w-full px-3 py-2 border rounded-lg" value={newVersion.releaseType || 'MINOR'} onChange={(e) => setNewVersion((v) => ({ ...v, releaseType: e.target.value as ReleaseType }))}>
                  <option value="MAJOR">Major</option>
                  <option value="MINOR">Minor</option>
                  <option value="PATCH">Patch</option>
                  <option value="HOTFIX">Hotfix</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Git Branch</label>
                <input type="text" placeholder="e.g., release/1.0.0" className="w-full px-3 py-2 border rounded-lg" value={newVersion.gitBranch || ''} onChange={(e) => setNewVersion((v) => ({ ...v, gitBranch: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Migration Notes</label>
                <textarea placeholder="Any migration notes..." className="w-full px-3 py-2 border rounded-lg" rows={3} value={newVersion.migrationNotes || ''} onChange={(e) => setNewVersion((v) => ({ ...v, migrationNotes: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm border rounded-lg">Cancel</button>
              <button onClick={handleCreate} disabled={!newVersion.version || createMutation.isPending} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {createMutation.isPending ? 'Creating...' : 'Create Version'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRollbackId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 space-y-4">
            <h2 className="text-lg font-bold text-red-600">Rollback Version</h2>
            <p className="text-sm text-gray-600">This will rollback the published version. This action can be reversed.</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
              <textarea placeholder="Why are you rolling back?" className="w-full px-3 py-2 border rounded-lg" rows={3} value={rollbackReason} onChange={(e) => setRollbackReason(e.target.value)} />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowRollbackId(null); setRollbackReason(''); }} className="px-4 py-2 text-sm border rounded-lg">Cancel</button>
              <button onClick={handleRollback} disabled={!rollbackReason || rollbackMutation.isPending} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                {rollbackMutation.isPending ? 'Rolling back...' : 'Confirm Rollback'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
