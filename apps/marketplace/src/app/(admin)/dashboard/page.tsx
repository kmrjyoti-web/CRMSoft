'use client';

import { useVendors } from '../../../hooks/useAdmin';
import { useAdminModules } from '../../../hooks/useAdmin';

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const { data: vendorData, isLoading: vendorsLoading } = useVendors({ limit: 1 });
  const { data: pendingVendors } = useVendors({ status: 'PENDING', limit: 1 });
  const { data: modulesData, isLoading: modulesLoading } = useAdminModules({ limit: 1 });
  const { data: reviewModules } = useAdminModules({ status: 'REVIEW', limit: 1 });

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Vendors</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label="Total Vendors"
            value={vendorsLoading ? '—' : (vendorData?.total ?? 0)}
          />
          <StatCard
            label="Pending Approval"
            value={vendorsLoading ? '—' : (pendingVendors?.total ?? 0)}
            sub="Needs review"
          />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Modules</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label="Total Modules"
            value={modulesLoading ? '—' : (modulesData?.total ?? 0)}
          />
          <StatCard
            label="Pending Review"
            value={modulesLoading ? '—' : (reviewModules?.total ?? 0)}
            sub="Awaiting publish"
          />
        </div>
      </section>
    </div>
  );
}
