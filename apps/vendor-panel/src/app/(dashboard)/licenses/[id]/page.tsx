'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, Calendar, Shield, IndianRupee, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/common/status-badge';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { useLicense } from '@/hooks/use-licenses';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function LicenseDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: res, isLoading } = useLicense(params.id);

  const license = res?.data;

  if (isLoading) return <LoadingSpinner />;
  if (!license) return <div className="text-center py-16 text-gray-500">License not found</div>;

  const daysUntilExpiry = license.expiryDate
    ? Math.ceil((new Date(license.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{license.tenantName ?? 'License'}</h1>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge value={license.status} />
            {license.packageName && <Badge variant="info">{license.packageName}</Badge>}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-5 w-5 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{license.currentUsers ?? 0}<span className="text-sm text-gray-400">/{license.maxUsers ?? '-'}</span></p>
            <p className="text-xs text-gray-500 mt-1">Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Shield className="h-5 w-5 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{license.usedStorage ?? 0}<span className="text-sm text-gray-400">/{license.maxStorage ?? '-'} GB</span></p>
            <p className="text-xs text-gray-500 mt-1">Storage</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <IndianRupee className="h-5 w-5 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{formatCurrency(license.totalPaid ?? 0)}</p>
            <p className="text-xs text-gray-500 mt-1">Total Paid</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-5 w-5 text-orange-500 mx-auto mb-2" />
            <p className={`text-2xl font-bold ${daysUntilExpiry !== null && daysUntilExpiry < 30 ? 'text-red-500' : ''}`}>
              {daysUntilExpiry !== null ? daysUntilExpiry : '-'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Days Until Expiry</p>
          </CardContent>
        </Card>
      </div>

      {/* Details Card */}
      <Card>
        <CardHeader><CardTitle className="text-lg">License Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 mb-1">License Key</p>
              <p className="font-mono bg-gray-50 px-3 py-2 rounded text-sm">
                {license.licenseKey
                  ? `${license.licenseKey.slice(0, 8)}${'*'.repeat(16)}${license.licenseKey.slice(-4)}`
                  : '-'}
              </p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Package</p>
              <p className="font-medium">{license.packageName ?? '-'}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Start Date</p>
              <p>{license.startDate ? formatDate(license.startDate) : '-'}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Expiry Date</p>
              <p>{license.expiryDate ? formatDate(license.expiryDate) : '-'}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Auto-Renew</p>
              <p>{license.autoRenew ? (
                <Badge variant="success" className="text-xs"><RefreshCw className="h-3 w-3 mr-1" />Enabled</Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">Disabled</Badge>
              )}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Next Billing</p>
              <p>{license.nextBillingDate ? formatDate(license.nextBillingDate) : '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Activity Timeline</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400 text-center py-6">No renewal history available</p>
        </CardContent>
      </Card>
    </div>
  );
}
