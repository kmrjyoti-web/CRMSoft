'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft, Users, HardDrive, Database, Calendar, Shield,
  Key, Copy, Eye, EyeOff, Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { IndustryBadge } from '@/components/common/industry-badge';
import { useTenant, useSuspendTenant, useActivateTenant, useExtendTrial } from '@/hooks/use-tenants';
import { formatCurrency, formatDate } from '@/lib/utils';

const STATUS_VARIANT: Record<string, 'success' | 'info' | 'destructive' | 'secondary'> = {
  ACTIVE: 'success',
  TRIAL: 'info',
  SUSPENDED: 'destructive',
  CANCELLED: 'secondary',
};

export default function TenantDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: res, isLoading } = useTenant(params.id);
  const suspendMut = useSuspendTenant();
  const activateMut = useActivateTenant();
  const extendMut = useExtendTrial();
  const [showLicenseKey, setShowLicenseKey] = useState(false);

  const tenant = res?.data;

  if (isLoading) return <LoadingSpinner />;
  if (!tenant) return <div className="text-center py-16 text-gray-500">Tenant not found</div>;

  const storagePercent = tenant.storageMaxMb > 0
    ? Math.round((tenant.storageUsedMb / tenant.storageMaxMb) * 100)
    : 0;

  const handleSuspend = async () => {
    if (!confirm('Suspend this tenant? They will lose access immediately.')) return;
    try {
      await suspendMut.mutateAsync(tenant.id);
      toast.success('Tenant suspended');
    } catch {
      toast.error('Failed to suspend tenant');
    }
  };

  const handleActivate = async () => {
    try {
      await activateMut.mutateAsync(tenant.id);
      toast.success('Tenant activated');
    } catch {
      toast.error('Failed to activate tenant');
    }
  };

  const handleExtendTrial = async () => {
    try {
      await extendMut.mutateAsync({ id: tenant.id, days: 30 });
      toast.success('Trial extended by 30 days');
    } catch {
      toast.error('Failed to extend trial');
    }
  };

  const copyLicenseKey = () => {
    if (tenant.licenseKey) {
      navigator.clipboard.writeText(tenant.licenseKey);
      toast.success('License key copied');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{tenant.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={STATUS_VARIANT[tenant.status] ?? 'secondary'}>{tenant.status}</Badge>
              <IndustryBadge industryCode={tenant.industryCode} />
              <span className="text-sm text-gray-500">{tenant.slug}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {tenant.status === 'TRIAL' && (
            <Button variant="outline" onClick={handleExtendTrial} loading={extendMut.isPending}>
              <Calendar className="h-4 w-4" />
              Extend Trial (+30d)
            </Button>
          )}
          {tenant.status === 'ACTIVE' || tenant.status === 'TRIAL' ? (
            <Button variant="destructive" onClick={handleSuspend} loading={suspendMut.isPending}>
              <Shield className="h-4 w-4" />
              Suspend
            </Button>
          ) : tenant.status === 'SUSPENDED' ? (
            <Button onClick={handleActivate} loading={activateMut.isPending}>
              <Shield className="h-4 w-4" />
              Activate
            </Button>
          ) : null}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Plan', value: tenant.planName, icon: Key, color: 'text-blue-600' },
          { label: 'Users', value: String(tenant.usersCount), icon: Users, color: 'text-indigo-600' },
          { label: 'DB Strategy', value: tenant.dbStrategy, icon: Database, color: 'text-purple-600' },
          { label: 'Storage', value: `${tenant.storageUsedMb} / ${tenant.storageMaxMb} MB`, icon: HardDrive, color: 'text-orange-600' },
          { label: 'Status', value: tenant.status, icon: Shield, color: 'text-green-600' },
          { label: 'Created', value: formatDate(tenant.createdAt), icon: Calendar, color: 'text-gray-600' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-lg font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Storage Progress */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Storage Usage</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${storagePercent > 90 ? 'bg-red-500' : storagePercent > 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                style={{ width: `${Math.min(storagePercent, 100)}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-700">{storagePercent}%</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {tenant.storageUsedMb} MB used of {tenant.storageMaxMb} MB
          </p>
        </CardContent>
      </Card>

      {/* License Key */}
      {tenant.licenseKey && (
        <Card>
          <CardHeader><CardTitle className="text-lg">License Key</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <code className="flex-1 bg-gray-50 rounded-lg px-4 py-2 font-mono text-sm">
                {showLicenseKey ? tenant.licenseKey : tenant.licenseKey.replace(/./g, '\u2022')}
              </code>
              <Button variant="ghost" size="icon" onClick={() => setShowLicenseKey(!showLicenseKey)}>
                {showLicenseKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={copyLicenseKey}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscribed Modules */}
      {tenant.modules && tenant.modules.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Subscribed Modules</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tenant.modules.map((mod, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm text-gray-900">{mod.name}</span>
                  <Badge variant={mod.status === 'ACTIVE' ? 'success' : 'secondary'} className="text-xs">
                    {mod.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing History */}
      {tenant.billingHistory && tenant.billingHistory.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Billing History</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Date</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Amount</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tenant.billingHistory.map((bill, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDate(bill.date)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                      {formatCurrency(bill.amount)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Badge
                        variant={bill.status === 'PAID' ? 'success' : bill.status === 'PENDING' ? 'warning' : 'destructive'}
                        className="text-xs"
                      >
                        {bill.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
