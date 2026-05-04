'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, IndianRupee, Users, Percent, Building2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/status-badge';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { usePartner } from '@/hooks/use-partners';
import { formatCurrency } from '@/lib/utils';

export default function PartnerDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: res, isLoading } = usePartner(params.id);

  const partner = res?.data;

  if (isLoading) return <LoadingSpinner />;
  if (!partner) return <div className="text-center py-16 text-gray-500">Partner not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{partner.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge value={partner.status} />
            {partner.type && <StatusBadge value={partner.type} />}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <IndianRupee className="h-5 w-5 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{formatCurrency(partner.totalEarnings ?? 0)}</p>
            <p className="text-xs text-gray-500 mt-1">Total Earnings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <IndianRupee className="h-5 w-5 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{formatCurrency(partner.pendingPayout ?? 0)}</p>
            <p className="text-xs text-gray-500 mt-1">Pending Payout</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <UserPlus className="h-5 w-5 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{partner.referralCount ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">Referrals</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-5 w-5 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{partner.conversionCount ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">Conversions</p>
          </CardContent>
        </Card>
      </div>

      {/* Details Card */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Partner Details</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 mb-1">Email</p>
              <p className="font-medium">{partner.email ?? '-'}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Phone</p>
              <p className="font-medium">{partner.phone ?? '-'}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Company</p>
              <p className="font-medium inline-flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-gray-400" />
                {partner.company ?? '-'}
              </p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Commission Rate</p>
              <p className="font-medium inline-flex items-center gap-1">
                <Percent className="h-3.5 w-3.5 text-gray-400" />
                {partner.commissionRate ?? 0}%
              </p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">GSTIN</p>
              <p className="font-medium">{partner.gstin ?? '-'}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">PAN</p>
              <p className="font-medium">{partner.pan ?? '-'}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Bank Account</p>
              <p className="font-medium">{partner.bankAccount ?? '-'}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">IFSC Code</p>
              <p className="font-medium">{partner.ifscCode ?? '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Card */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Address</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="md:col-span-2">
              <p className="text-gray-500 mb-1">Address</p>
              <p className="font-medium">{partner.address ?? '-'}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">City</p>
              <p className="font-medium">{partner.city ?? '-'}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">State</p>
              <p className="font-medium">{partner.state ?? '-'}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Pincode</p>
              <p className="font-medium">{partner.pincode ?? '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
