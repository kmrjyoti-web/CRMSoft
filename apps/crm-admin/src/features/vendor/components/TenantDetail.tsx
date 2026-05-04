'use client';

import { useState } from 'react';
import { Card, Badge, Icon, Button } from '@/components/ui';
import { useTenantProfile, useLicenses } from '../hooks/useVendor';
import { LICENSE_STATUS_MAP, formatCurrency } from '../utils/vendor-helpers';
import { TenantProfileForm } from './TenantProfileForm';
import { TenantActivityTimeline } from './TenantActivityTimeline';
import type { LicenseKeyItem } from '../types/vendor.types';

type Tab = 'overview' | 'profile' | 'license' | 'activity';

interface TenantDetailProps {
  tenantId: string;
}

export function TenantDetail({ tenantId }: TenantDetailProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const { data: profileResp, isLoading: profileLoading } = useTenantProfile(tenantId);
  const { data: licensesResp } = useLicenses({ tenantId });

  const profile = profileResp?.data;
  const allLicenses: LicenseKeyItem[] = Array.isArray(licensesResp?.data) ? licensesResp.data : [];
  const tenantLicenses = allLicenses.filter((l) => l.tenantId === tenantId);

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'overview', label: 'Overview', icon: 'layout-dashboard' },
    { key: 'profile', label: 'Profile', icon: 'user' },
    { key: 'license', label: 'Licenses', icon: 'key' },
    { key: 'activity', label: 'Activity', icon: 'clock' },
  ];

  if (profileLoading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-10 bg-gray-100 rounded" />
          <div className="h-64 bg-gray-100 rounded-lg" />
        </div>
      </div>
    );
  }

  const tenantName = profile?.tenant?.name ?? profile?.companyLegalName ?? tenantId;
  const tenantStatus = profile?.tenant?.status ?? 'Unknown';
  const diskUsagePercent = profile
    ? Math.round((profile.currentDiskUsageMb / Math.max(profile.maxDiskQuotaMb, 1)) * 100)
    : 0;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{tenantName}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={tenantStatus === 'ACTIVE' ? 'success' : 'warning'}>
              {tenantStatus}
            </Badge>
            {profile?.tenant?.slug && (
              <span className="text-sm text-gray-400">{profile.tenant.slug}</span>
            )}
            {profile?.tenant?.domain && (
              <span className="text-sm text-gray-400">{profile.tenant.domain}</span>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon name={tab.icon as any} size={16} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Status & Plan */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Icon name="building-2" size={20} className="text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">Company</span>
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {profile?.companyLegalName ?? 'Not set'}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {profile?.industry ?? 'No industry'}
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Icon name="key" size={20} className="text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">Licenses</span>
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {tenantLicenses.length} license(s)
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {tenantLicenses.filter((l) => l.status === 'LIC_ACTIVE').length} active
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Icon name="database" size={20} className="text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">DB Strategy</span>
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {profile?.dbStrategy ?? 'SHARED'}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {profile?.dbStrategy === 'DEDICATED' ? 'Isolated database' : 'Shared database'}
              </div>
            </Card>
          </div>

          {/* Disk Usage */}
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
              Disk Usage
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">
                    {profile?.currentDiskUsageMb ?? 0} MB used
                  </span>
                  <span className="text-gray-400">
                    {profile?.maxDiskQuotaMb ?? 0} MB quota
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      diskUsagePercent > 90
                        ? 'bg-red-500'
                        : diskUsagePercent > 70
                          ? 'bg-yellow-500'
                          : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(diskUsagePercent, 100)}%` }}
                  />
                </div>
              </div>
              <span className="text-sm font-medium text-gray-700">{diskUsagePercent}%</span>
            </div>
          </Card>

          {/* Contact Summary */}
          {profile?.primaryContactName && (
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
                Primary Contact
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <Icon name="user" size={20} className="text-gray-500" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{profile.primaryContactName}</div>
                  {profile.primaryContactEmail && (
                    <div className="text-sm text-gray-500">{profile.primaryContactEmail}</div>
                  )}
                  {profile.primaryContactPhone && (
                    <div className="text-sm text-gray-400">{profile.primaryContactPhone}</div>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'profile' && <TenantProfileForm tenantId={tenantId} />}

      {activeTab === 'license' && (
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
            License Keys
          </h3>
          {tenantLicenses.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {tenantLicenses.map((lic) => {
                const status = LICENSE_STATUS_MAP[lic.status] ?? {
                  label: lic.status,
                  color: 'secondary',
                };
                return (
                  <div key={lic.id} className="py-4 flex items-center justify-between">
                    <div>
                      <code className="text-sm font-mono text-gray-700 bg-gray-50 px-2 py-1 rounded">
                        {lic.licenseKey}
                      </code>
                      <div className="text-sm text-gray-500 mt-1">
                        Plan: {lic.plan?.name ?? lic.planId} | Max Users: {lic.maxUsers}
                      </div>
                      {lic.expiresAt && (
                        <div className="text-xs text-gray-400 mt-0.5">
                          Expires: {new Date(lic.expiresAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <Badge variant={status.color as any}>{status.label}</Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-6 text-center">No licenses found for this tenant</p>
          )}
        </Card>
      )}

      {activeTab === 'activity' && (
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
            Activity Log
          </h3>
          <TenantActivityTimeline tenantId={tenantId} />
        </Card>
      )}
    </div>
  );
}
