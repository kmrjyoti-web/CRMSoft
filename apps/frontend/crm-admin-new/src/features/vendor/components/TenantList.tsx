'use client';

import { useState, useMemo } from 'react';
import { Card, Badge, Icon, Input } from '@/components/ui';
import { useLicenses } from '../hooks/useVendor';
import type { LicenseKeyItem } from '../types/vendor.types';
import { LICENSE_STATUS_MAP } from '../utils/vendor-helpers';

interface TenantRow {
  id: string;
  name: string;
  status: string;
  plan: string;
  licenseStatus: string;
  dbStrategy: string;
  maxUsers: number;
  createdAt: string;
}

interface TenantListProps {
  onSelectTenant?: (tenantId: string) => void;
}

export function TenantList({ onSelectTenant }: TenantListProps) {
  const [search, setSearch] = useState('');
  const { data: licensesResp, isLoading } = useLicenses();

  // Flatten licenses into tenant rows (group by tenant)
  const tenants: TenantRow[] = useMemo(() => {
    const rawLicenses: LicenseKeyItem[] = Array.isArray(licensesResp?.data) ? licensesResp.data : [];
    const tenantMap = new Map<string, TenantRow>();

    rawLicenses.forEach((lic) => {
      if (!tenantMap.has(lic.tenantId)) {
        tenantMap.set(lic.tenantId, {
          id: lic.tenantId,
          name: lic.tenant?.name ?? lic.tenantId,
          status: lic.status === 'LIC_ACTIVE' ? 'Active' : 'Inactive',
          plan: lic.plan?.name ?? lic.planId,
          licenseStatus: lic.status,
          dbStrategy: 'SHARED',
          maxUsers: lic.maxUsers,
          createdAt: lic.createdAt,
        });
      }
    });

    return Array.from(tenantMap.values());
  }, [licensesResp]);

  const filtered = useMemo(() => {
    if (!search.trim()) return tenants;
    const q = search.toLowerCase();
    return tenants.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.plan.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q),
    );
  }, [tenants, search]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-10 bg-gray-100 rounded" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all tenant accounts</p>
        </div>
        <Badge variant="secondary">{tenants.length} total</Badge>
      </div>

      <Card className="p-6">
        <div className="mb-4">
          <Input
            label="Search tenants"
            leftIcon={<Icon name="search" size={16} />}
            value={search}
            onChange={(v: string) => setSearch(v)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Plan</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">License</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Max Users</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((tenant) => {
                const licStatus = LICENSE_STATUS_MAP[tenant.licenseStatus] ?? {
                  label: tenant.licenseStatus,
                  color: 'secondary',
                };
                return (
                  <tr
                    key={tenant.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => onSelectTenant?.(tenant.id)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Icon name="building-2" size={16} className="text-gray-400" />
                        <span className="font-medium text-gray-900">{tenant.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={tenant.status === 'Active' ? 'success' : 'warning'}>
                        {tenant.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{tenant.plan}</td>
                    <td className="py-3 px-4">
                      <Badge variant={licStatus.color as any}>{licStatus.label}</Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{tenant.maxUsers}</td>
                    <td className="py-3 px-4 text-gray-400">
                      {new Date(tenant.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    {search ? 'No tenants match your search' : 'No tenants found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
