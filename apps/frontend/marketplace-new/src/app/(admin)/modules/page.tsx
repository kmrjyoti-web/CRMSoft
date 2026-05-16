'use client';

import { useState } from 'react';
import { useAdminModules, usePublishModule } from '../../../hooks/useAdmin';
import type { MarketplaceModule } from '../../../services/admin.service';

const STATUS_TABS = ['ALL', 'REVIEW', 'PUBLISHED', 'DRAFT'] as const;
type StatusFilter = (typeof STATUS_TABS)[number];

const STATUS_BADGE: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  REVIEW: 'bg-yellow-100 text-yellow-800',
  PUBLISHED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};

function ModuleRow({ mod }: { mod: MarketplaceModule }) {
  const publish = usePublishModule();

  return (
    <tr className="border-t border-gray-100 hover:bg-gray-50">
      <td className="px-4 py-3">
        <p className="font-medium text-gray-900 text-sm">{mod.moduleName}</p>
        <p className="text-xs text-gray-400 font-mono">{mod.moduleCode}</p>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">{mod.category}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{mod.vendor?.companyName ?? '—'}</td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[mod.status] ?? 'bg-gray-100 text-gray-600'}`}>
          {mod.status}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-gray-400">
        {mod.version ?? '—'}
      </td>
      <td className="px-4 py-3 text-xs text-gray-400">
        {new Date(mod.updatedAt).toLocaleDateString('en-IN')}
      </td>
      <td className="px-4 py-3 text-right">
        {mod.status === 'REVIEW' && (
          <button
            onClick={() => publish.mutate(mod.id)}
            disabled={publish.isPending}
            className="px-3 py-1 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Publish
          </button>
        )}
      </td>
    </tr>
  );
}

export default function ModulesPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('REVIEW');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAdminModules({
    page,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    search: search || undefined,
  });

  const totalPages = data ? Math.ceil(data.total / 20) : 1;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Modules</h1>
        <span className="text-sm text-gray-500">{data?.total ?? 0} total</span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-white shrink-0">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => { setStatusFilter(tab); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === tab
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab === 'REVIEW' ? 'Pending Review' : tab}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search by name or code…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-sm text-gray-400">Loading…</div>
        ) : !data?.items.length ? (
          <div className="py-12 text-center text-sm text-gray-400">No modules found</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Module</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Vendor</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Version</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Updated</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((mod) => (
                <ModuleRow key={mod.id} mod={mod} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
          >
            Prev
          </button>
          <span className="text-sm text-gray-600">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
