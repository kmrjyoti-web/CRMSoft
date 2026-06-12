'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Card, Badge, Icon, Input, Button, SelectInput } from '@/components/ui';
import { useLicenses, useActivateLicense, useSuspendLicense, useRevokeLicense } from '../hooks/useVendor';
import { LICENSE_STATUS_MAP, LICENSE_STATUS_OPTIONS } from '../utils/vendor-helpers';
import { LicenseGenerateForm } from './LicenseGenerateForm';
import type { LicenseKeyItem } from '../types/vendor.types';

export function LicenseManager() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showGenerateForm, setShowGenerateForm] = useState(false);

  const { data: licensesResp, isLoading } = useLicenses(
    statusFilter ? { status: statusFilter } : undefined,
  );
  const activateMut = useActivateLicense();
  const suspendMut = useSuspendLicense();
  const revokeMut = useRevokeLicense();

  const licenses: LicenseKeyItem[] = Array.isArray(licensesResp?.data) ? licensesResp.data : [];

  const filtered = search.trim()
    ? licenses.filter(
        (l) =>
          l.licenseKey.toLowerCase().includes(search.toLowerCase()) ||
          (l.tenant?.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
          (l.plan?.name ?? '').toLowerCase().includes(search.toLowerCase()),
      )
    : licenses;

  const handleActivate = async (id: string) => {
    try {
      await activateMut.mutateAsync(id);
      toast.success('License activated');
    } catch {
      toast.error('Failed to activate');
    }
  };

  const handleSuspend = async (id: string) => {
    if (!confirm('Suspend this license?')) return;
    try {
      await suspendMut.mutateAsync(id);
      toast.success('License suspended');
    } catch {
      toast.error('Failed to suspend');
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Revoke this license? This action cannot be undone.')) return;
    try {
      await revokeMut.mutateAsync(id);
      toast.success('License revoked');
    } catch {
      toast.error('Failed to revoke');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">License Manager</h1>
          <p className="text-sm text-gray-500 mt-1">Generate and manage license keys</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowGenerateForm(!showGenerateForm)}
        >
          <Icon name="plus" size={16} className="mr-2" />
          Generate License
        </Button>
      </div>

      {/* Generate Form (inline toggle) */}
      {showGenerateForm && (
        <LicenseGenerateForm
          onSuccess={() => setShowGenerateForm(false)}
          onCancel={() => setShowGenerateForm(false)}
        />
      )}

      {/* Search & Filter */}
      <Card className="p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <Input
              label="Search licenses"
              leftIcon={<Icon name="search" size={16} />}
              value={search}
              onChange={(v: string) => setSearch(v)}
            />
          </div>
          <div className="w-48">
            <SelectInput
              label="Status"
              options={LICENSE_STATUS_OPTIONS}
              value={statusFilter}
              onChange={(v) => setStatusFilter(String(v ?? ''))}
            />
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-gray-100 rounded" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">License Key</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Tenant</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Plan</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Expires</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((lic) => {
                  const status = LICENSE_STATUS_MAP[lic.status] ?? {
                    label: lic.status,
                    color: 'secondary',
                  };
                  return (
                    <tr key={lic.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <code className="text-xs font-mono text-gray-700 bg-gray-50 px-2 py-1 rounded">
                          {lic.licenseKey.length > 24
                            ? `${lic.licenseKey.slice(0, 24)}...`
                            : lic.licenseKey}
                        </code>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {lic.tenant?.name ?? lic.tenantId}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {lic.plan?.name ?? lic.planId}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={status.color as any}>{status.label}</Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-400">
                        {lic.expiresAt
                          ? new Date(lic.expiresAt).toLocaleDateString()
                          : 'Never'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          {lic.status !== 'LIC_ACTIVE' && lic.status !== 'LIC_REVOKED' && (
                            <button
                              onClick={() => handleActivate(lic.id)}
                              className="p-1.5 rounded hover:bg-green-50 text-green-600"
                              title="Activate"
                              disabled={activateMut.isPending}
                            >
                              <Icon name="check-circle" size={14} />
                            </button>
                          )}
                          {lic.status === 'LIC_ACTIVE' && (
                            <button
                              onClick={() => handleSuspend(lic.id)}
                              className="p-1.5 rounded hover:bg-yellow-50 text-yellow-600"
                              title="Suspend"
                              disabled={suspendMut.isPending}
                            >
                              <Icon name="pause-circle" size={14} />
                            </button>
                          )}
                          {lic.status !== 'LIC_REVOKED' && (
                            <button
                              onClick={() => handleRevoke(lic.id)}
                              className="p-1.5 rounded hover:bg-red-50 text-red-600"
                              title="Revoke"
                              disabled={revokeMut.isPending}
                            >
                              <Icon name="x-circle" size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400">
                      {search || statusFilter ? 'No licenses match your filter' : 'No licenses found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
