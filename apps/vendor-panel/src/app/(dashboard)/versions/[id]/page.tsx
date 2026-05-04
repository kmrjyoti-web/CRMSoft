'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  useVersion, useVersionPatches, useVersionBackups,
  usePublishVersion, useRollbackVersion,
  useCreatePatch, useApplyPatch, useRollbackPatch,
  useCreateBackup, useRestoreBackup,
  usePublishToNotion, useNotionStatus,
} from '@/hooks/use-versions';
import type { AppVersion, IndustryPatch, VersionBackup, ChangelogSection, CreatePatchDto, PatchStatus } from '@/types/version';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  TESTING: 'bg-blue-100 text-blue-700',
  STAGED: 'bg-yellow-100 text-yellow-700',
  PUBLISHED: 'bg-green-100 text-green-700',
  ROLLED_BACK: 'bg-red-100 text-red-700',
  DEPRECATED: 'bg-gray-200 text-gray-500',
};

const PATCH_STATUS_COLORS: Record<PatchStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPLIED: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
  ROLLED_BACK: 'bg-gray-100 text-gray-700',
};

export default function VersionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: versionData, isLoading } = useVersion(id);
  const { data: patchesData } = useVersionPatches(id);
  const { data: backupsData } = useVersionBackups(id);
  const { data: notionData } = useNotionStatus();

  const publishMutation = usePublishVersion();
  const rollbackMutation = useRollbackVersion();
  const createPatchMutation = useCreatePatch();
  const applyPatchMutation = useApplyPatch();
  const rollbackPatchMutation = useRollbackPatch();
  const createBackupMutation = useCreateBackup();
  const restoreBackupMutation = useRestoreBackup();
  const notionMutation = usePublishToNotion();

  const [showPatchForm, setShowPatchForm] = useState(false);
  const [newPatch, setNewPatch] = useState<CreatePatchDto>({ industryCode: '', patchName: '' });
  const [activeTab, setActiveTab] = useState<'overview' | 'patches' | 'backups' | 'changelog'>('overview');

  const version = versionData?.data as AppVersion | undefined;
  const patchesPaginated = patchesData?.data as { data?: IndustryPatch[] } | undefined;
  const patches: IndustryPatch[] = patchesPaginated?.data ?? [];
  const backupsPaginated = backupsData?.data as { data?: VersionBackup[] } | undefined;
  const backups: VersionBackup[] = backupsPaginated?.data ?? [];
  const notionConfigured = notionData?.data?.configured;

  if (isLoading) return <div className="p-6 text-center text-gray-400">Loading...</div>;
  if (!version) return <div className="p-6 text-center text-gray-400">Version not found</div>;

  const handleCreatePatch = async () => {
    if (!newPatch.industryCode || !newPatch.patchName) return;
    await createPatchMutation.mutateAsync({ versionId: id, data: newPatch });
    setShowPatchForm(false);
    setNewPatch({ industryCode: '', patchName: '' });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/versions')} className="text-gray-400 hover:text-gray-600 text-lg">&larr;</button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-mono">v{version.version}</h1>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[version.status]}`}>{version.status}</span>
            </div>
            {version.codeName && <p className="text-sm text-gray-500 mt-1">{version.codeName}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {notionConfigured && (
            <button onClick={() => notionMutation.mutate(id)} disabled={notionMutation.isPending} className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50">
              {notionMutation.isPending ? 'Publishing...' : 'Publish to Notion'}
            </button>
          )}
          {['DRAFT', 'TESTING', 'STAGED'].includes(version.status) && (
            <button onClick={() => publishMutation.mutate(id)} disabled={publishMutation.isPending} className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">Publish</button>
          )}
          {version.status === 'PUBLISHED' && (
            <button onClick={() => rollbackMutation.mutate({ id, reason: 'Manual rollback from detail page' })} disabled={rollbackMutation.isPending} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Rollback</button>
          )}
        </div>
      </div>

      <div className="flex border-b">
        {(['overview', 'patches', 'backups', 'changelog'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'patches' && patches.length > 0 && <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-gray-100 rounded">{patches.length}</span>}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border p-5 space-y-4">
            <h3 className="font-semibold text-gray-900">Version Info</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-gray-500">Release Type</dt><dd className="font-medium">{version.releaseType}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Git Branch</dt><dd className="font-mono text-xs">{version.gitBranch || '\u2014'}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Git Tag</dt><dd className="font-mono text-xs">{version.gitTag || '\u2014'}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Deployed At</dt><dd>{version.deployedAt ? new Date(version.deployedAt).toLocaleString() : '\u2014'}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Deployed By</dt><dd>{version.deployedBy || '\u2014'}</dd></div>
              {version.notionPageId && <div className="flex justify-between"><dt className="text-gray-500">Notion Page</dt><dd className="text-indigo-600 text-xs">{version.notionPageId}</dd></div>}
            </dl>
          </div>
          <div className="bg-white rounded-xl border p-5 space-y-4">
            <h3 className="font-semibold text-gray-900">Statistics</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-gray-500">Industry Patches</dt><dd className="font-medium">{version._count?.patches ?? 0}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Tenant Deployments</dt><dd className="font-medium">{version._count?.tenantVersions ?? 0}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Backups</dt><dd className="font-medium">{version._count?.backups ?? 0}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Modules Updated</dt><dd className="font-medium">{version.modulesUpdated?.length ?? 0}</dd></div>
            </dl>
            {version.modulesUpdated && version.modulesUpdated.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {version.modulesUpdated.map((m: string) => <span key={m} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs">{m}</span>)}
              </div>
            )}
          </div>
          {version.migrationNotes && (
            <div className="md:col-span-2 bg-yellow-50 border border-yellow-200 rounded-xl p-5">
              <h3 className="font-semibold text-yellow-800 mb-2">Migration Notes</h3>
              <pre className="text-sm text-yellow-700 whitespace-pre-wrap">{version.migrationNotes}</pre>
            </div>
          )}
          {version.rollbackReason && (
            <div className="md:col-span-2 bg-red-50 border border-red-200 rounded-xl p-5">
              <h3 className="font-semibold text-red-800 mb-2">Rollback Reason</h3>
              <p className="text-sm text-red-700">{version.rollbackReason}</p>
              {version.rollbackAt && <p className="text-xs text-red-500 mt-2">Rolled back at: {new Date(version.rollbackAt).toLocaleString()}</p>}
            </div>
          )}
        </div>
      )}

      {activeTab === 'patches' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Industry Patches</h3>
            <button onClick={() => setShowPatchForm(true)} className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">+ Add Patch</button>
          </div>
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Patch Name</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Industry</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Force Update</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Applied</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {patches.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No patches</td></tr>
                ) : patches.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-medium">{p.patchName}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{p.industryCode}</span></td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${PATCH_STATUS_COLORS[p.status as PatchStatus] || ''}`}>{p.status}</span></td>
                    <td className="px-4 py-3">{p.forceUpdate ? <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded text-xs">Yes</span> : <span className="text-gray-400">No</span>}</td>
                    <td className="px-4 py-3 text-gray-500">{p.appliedAt ? new Date(p.appliedAt).toLocaleDateString() : '\u2014'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {p.status === 'PENDING' && <button onClick={() => applyPatchMutation.mutate(p.id)} disabled={applyPatchMutation.isPending} className="px-2 py-1 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100">Apply</button>}
                        {p.status === 'APPLIED' && <button onClick={() => rollbackPatchMutation.mutate(p.id)} disabled={rollbackPatchMutation.isPending} className="px-2 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100">Rollback</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {showPatchForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 space-y-4">
                <h2 className="text-lg font-bold">Create Industry Patch</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry Code *</label>
                    <input type="text" placeholder="e.g., PHARMA, REAL_ESTATE" className="w-full px-3 py-2 border rounded-lg" value={newPatch.industryCode} onChange={(e) => setNewPatch((p) => ({ ...p, industryCode: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Patch Name *</label>
                    <input type="text" placeholder="e.g., pharma-menu-update" className="w-full px-3 py-2 border rounded-lg" value={newPatch.patchName} onChange={(e) => setNewPatch((p) => ({ ...p, patchName: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea placeholder="What does this patch do?" className="w-full px-3 py-2 border rounded-lg" rows={2} value={newPatch.description || ''} onChange={(e) => setNewPatch((p) => ({ ...p, description: e.target.value }))} />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="forceUpdate" checked={newPatch.forceUpdate || false} onChange={(e) => setNewPatch((p) => ({ ...p, forceUpdate: e.target.checked }))} />
                    <label htmlFor="forceUpdate" className="text-sm text-gray-700">Force update for affected tenants</label>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setShowPatchForm(false)} className="px-4 py-2 text-sm border rounded-lg">Cancel</button>
                  <button onClick={handleCreatePatch} disabled={!newPatch.industryCode || !newPatch.patchName || createPatchMutation.isPending} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">Create Patch</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'backups' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Backups</h3>
            <button onClick={() => createBackupMutation.mutate({ versionId: id, data: { backupType: 'MANUAL' } })} disabled={createBackupMutation.isPending} className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              {createBackupMutation.isPending ? 'Creating...' : '+ Create Backup'}
            </button>
          </div>
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Created</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Restored</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {backups.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No backups</td></tr>
                ) : backups.map((b) => (
                  <tr key={b.id}>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{b.backupType}</span></td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${b.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : b.status === 'RESTORED' ? 'bg-blue-100 text-blue-700' : b.status === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{b.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{new Date(b.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-500">{b.restoredAt ? new Date(b.restoredAt).toLocaleString() : '\u2014'}</td>
                    <td className="px-4 py-3 text-right">
                      {b.status === 'COMPLETED' && <button onClick={() => restoreBackupMutation.mutate(b.id)} disabled={restoreBackupMutation.isPending} className="px-2 py-1 text-xs bg-yellow-50 text-yellow-700 rounded hover:bg-yellow-100">Restore</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'changelog' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border p-5">
            <h3 className="font-semibold mb-4">Changelog</h3>
            {(!version.changelog || version.changelog.length === 0) ? (
              <p className="text-sm text-gray-400">No changelog entries</p>
            ) : (
              <div className="space-y-4">
                {version.changelog.map((section: ChangelogSection, i: number) => (
                  <div key={i}>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">{section.category}</h4>
                    <ul className="space-y-1">
                      {(section.items || []).map((item: string, j: number) => (
                        <li key={j} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-indigo-400 mt-1">&bull;</span>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
          {version.breakingChanges && version.breakingChanges.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <h3 className="font-semibold text-red-800 mb-3">Breaking Changes</h3>
              <ul className="space-y-1">
                {version.breakingChanges.map((bc: string, i: number) => (
                  <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                    <span className="text-red-400 mt-1">!</span>{typeof bc === 'string' ? bc : JSON.stringify(bc)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
