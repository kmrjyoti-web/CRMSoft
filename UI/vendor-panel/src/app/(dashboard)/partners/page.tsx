'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Users, Plus, Search, IndianRupee, Percent, UserPlus, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/empty-state';
import { StatusBadge } from '@/components/common/status-badge';
import { usePartners, useCreatePartner } from '@/hooks/use-partners';
import { useDebounce } from '@/hooks/use-debounce';
import { formatCurrency, extractList } from '@/lib/utils';
import { PARTNER_STATUS, PARTNER_TYPES } from '@/lib/constants';
import type { Partner, PartnerFilters, CreatePartnerDto } from '@/types/partner';

export default function PartnersPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  // Inline form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formType, setFormType] = useState('');
  const [formCommission, setFormCommission] = useState('');

  const filters = {
    search: debouncedSearch || undefined,
    status: statusFilter ? (statusFilter as PartnerFilters['status']) : undefined,
    type: typeFilter ? (typeFilter as PartnerFilters['type']) : undefined,
    page,
    limit: 20,
  };

  const { data: res, isLoading, refetch } = usePartners(filters);
  const createPartner = useCreatePartner();
  const partners = extractList<Partner>(res);

  const handleCreate = async () => {
    if (!formName || !formEmail) {
      toast.error('Name and Email are required');
      return;
    }
    try {
      await createPartner.mutateAsync({
        name: formName,
        email: formEmail,
        phone: formPhone || undefined,
        company: formCompany || undefined,
        type: (formType || 'RESELLER') as CreatePartnerDto['type'],
        commissionRate: formCommission ? parseFloat(formCommission) : undefined,
      });
      toast.success('Partner created successfully');
      setFormName(''); setFormEmail(''); setFormPhone('');
      setFormCompany(''); setFormType(''); setFormCommission('');
      setShowForm(false);
      refetch();
    } catch {
      toast.error('Failed to create partner');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Partners</h1>
          <p className="text-sm text-gray-500">Manage your referral and reseller partners</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Partner
        </Button>
      </div>

      {/* Inline Create Form */}
      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-lg">New Partner</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                leftIcon={<UserPlus className="h-4 w-4" />}
                label="Name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Partner name"
              />
              <Input
                label="Email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="email@example.com"
                type="email"
              />
              <Input
                label="Phone"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
              <Input
                leftIcon={<Building2 className="h-4 w-4" />}
                label="Company"
                value={formCompany}
                onChange={(e) => setFormCompany(e.target.value)}
                placeholder="Company name"
              />
              <Select
                options={[{ value: '', label: 'Select Type' }, ...PARTNER_TYPES.map((t) => ({ value: t.value, label: t.label }))]}
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
              />
              <Input
                leftIcon={<Percent className="h-4 w-4" />}
                label="Commission Rate %"
                value={formCommission}
                onChange={(e) => setFormCommission(e.target.value)}
                placeholder="e.g. 10"
                type="number"
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleCreate} loading={createPartner.isPending}>Create Partner</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input leftIcon={<Search className="h-4 w-4" />} placeholder="Search by name or company..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Select
          options={[{ value: '', label: 'All Status' }, ...PARTNER_STATUS.map((s) => ({ value: s.value, label: s.label }))]}
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="w-44"
        />
        <Select
          options={[{ value: '', label: 'All Types' }, ...PARTNER_TYPES.map((t) => ({ value: t.value, label: t.label }))]}
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="w-44"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : partners.length === 0 ? (
        <EmptyState icon={Users} title="No partners yet" description="Add your first partner to start building your referral network" />
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Name</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Company</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Type</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Commission</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Earnings</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Referrals</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {partners.map((partner) => (
                <tr key={partner.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/partners/${partner.id}`)}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{partner.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{partner.company ?? '-'}</td>
                  <td className="px-4 py-3"><StatusBadge value={partner.type} /></td>
                  <td className="px-4 py-3 text-sm">
                    <span className="inline-flex items-center gap-1">
                      <Percent className="h-3.5 w-3.5 text-gray-400" />
                      {partner.commissionRate ?? 0}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold">
                    <span className="inline-flex items-center gap-1">
                      <IndianRupee className="h-3.5 w-3.5 text-green-500" />
                      {formatCurrency(partner.totalEarnings ?? 0)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{partner.referralCount ?? 0}</td>
                  <td className="px-4 py-3"><StatusBadge value={partner.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Previous</Button>
        <span className="text-sm text-gray-500">Page {page}</span>
        <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={partners.length < 20}>Next</Button>
      </div>
    </div>
  );
}
