'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Building2, Mail, Phone, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { profileApi } from '@/lib/api/profile';
import { useAuthStore } from '@/stores/auth-store';

export default function ProfilePage() {
  const qc = useQueryClient();
  const { user } = useAuthStore();

  const { data: verRes, isLoading: loadingVer } = useQuery({
    queryKey: ['verification-status'],
    queryFn: () => profileApi.getVerificationStatus(),
  });

  const verification = verRes?.data;

  const [gstNumber, setGstNumber] = useState('');
  const [companyName, setCompanyName] = useState('');

  const gstMut = useMutation({
    mutationFn: () => profileApi.verifyGst(gstNumber, companyName),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['verification-status'] });
      toast.success('GST verification submitted');
    },
    onError: () => toast.error('GST verification failed'),
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500">Your vendor profile and verification status</p>
      </div>

      {/* User Info */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Account Info</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-lg">{user?.firstName} {user?.lastName}</p>
              <p className="text-gray-500">{user?.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-gray-400" /><span>{user?.email}</span></div>
            <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-gray-400" /><span>{user?.phone ?? 'Not set'}</span></div>
            <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-gray-400" /><span>{user?.registrationType}</span></div>
            <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-gray-400" /><span>{user?.verificationStatus}</span></div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Status */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Verification Status</CardTitle></CardHeader>
        <CardContent>
          {loadingVer ? <LoadingSpinner /> : verification && (
            <div className="space-y-3">
              {[
                { label: 'Email Verified', verified: verification.emailVerified },
                { label: 'Mobile Verified', verified: verification.mobileVerified },
                { label: 'GST Verified', verified: verification.gstVerified },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.verified ? (
                    <Badge variant="success" className="gap-1"><CheckCircle className="h-3 w-3" />Verified</Badge>
                  ) : (
                    <Badge variant="warning" className="gap-1"><AlertCircle className="h-3 w-3" />Pending</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* GST Verification */}
      {verification && !verification.gstVerified && (
        <Card>
          <CardHeader><CardTitle className="text-lg">GST Verification</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-500">Submit your GST details for verification to unlock B2B pricing features.</p>
            <Input label="GST Number" value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} placeholder="22AAAAA0000A1Z5" />
            <Input label="Company Name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Your registered company name" />
            <Button onClick={() => gstMut.mutate()} loading={gstMut.isPending} disabled={!gstNumber || !companyName}>
              Submit for Verification
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
