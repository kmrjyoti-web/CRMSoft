'use client';

import { useState } from 'react';
import { useVendors, useApproveVendor, useSuspendVendor } from '../../../hooks/useAdmin';
import type { Vendor } from '../../../services/admin.service';

const STATUS_TABS = ['ALL', 'PENDING', 'APPROVED', 'SUSPENDED'] as const;
type StatusFilter = (typeof STATUS_TABS)[number];

const STATUS_BADGE: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  SUSPENDED: 'bg-red-100 text-red-800',
};

function VendorRow({ vendor }: { vendor: Vendor }) {
  const approve = useApproveVendor();
  const suspend = useSuspendVendor();

  const busy = approve.isPending || suspend.isPending;

  return (
    <tr className="border-t border-gray-100 hover:bg-gray-50">
      <td className="px-4 py-3">
        <p className="font-medium text-gray-900 text-sm">{vendor.companyName}</p>
        <p className="text-xs text-gray-500">{vendor.contactEmail}</p>
      </td>
      <td className="px-4 py-3 text-xs text-gray-500">{vendor.gstNumber ?? '—'}</td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[vendor.status] ?? 'bg-gray-100 text-gray-700'}`}>
          {vendor.status}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-gray-400">
        {new Date(vendor.createdAt).toLocaleDateString('en-IN')}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          {vendor.status === 'PENDING' && (
            <button
              onClick={() => approve.mutate(vendor.id)}
              disabled={busy}
              className="px-3 py-1 text-xs font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            >
              Approve
            </button>
          )}
          {vendor.status === 'APPROVED' && (
            <button
              onClick={() => suspend.mutate(vendor.id)}
              disabled={busy}
              className="px-3 py-1 text-xs font-medium rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 disabled:opacity-50"
            >
              Suspend
            </button>
          )}
          {vendor.status === 'SUSPENDED' && (
            <button
              onClick={() => approve.mutate(vendor.id)}
              disabled={busy}
              className="px-3 py-1 text-xs font-medium rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 disabled:opacity-50"
            >
              Re-approve
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function VendorsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useVendors({
    page,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    search: search || undefined,
  });

  const totalPages = data ? Math.ceil(data.total / 20) : 1;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Vendors</h1>
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
              {tab}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search by name or email…"
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
          <div className="py-12 text-center text-sm text-gray-400">No vendors found</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Company</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">GST</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Joined</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((vendor) => (
                <VendorRow key={vendor.id} vendor={vendor} />
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
