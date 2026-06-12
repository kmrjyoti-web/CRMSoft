'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Ticket, Plus, Search, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/empty-state';
import { IndustryBadge } from '@/components/common/industry-badge';
import { IndustrySelect } from '@/components/common/industry-select';
import { useCoupons, useCreateCoupon, useDeleteCoupon } from '@/hooks/use-coupons';
import { useDebounce } from '@/hooks/use-debounce';
import { formatNumber, formatDate, extractList, extractMeta } from '@/lib/utils';
import type { Coupon } from '@/types/coupon';

const COUPON_TYPES = [
  { value: 'FIXED_TOKENS', label: 'Fixed Tokens' },
  { value: 'PERCENTAGE', label: 'Percentage' },
];

const couponSchema = z.object({
  code: z.string().min(1, 'Code is required').max(20),
  type: z.enum(['FIXED_TOKENS', 'PERCENTAGE']),
  value: z.coerce.number().min(1, 'Value must be > 0'),
  maxUses: z.coerce.number().int().min(1, 'At least 1 use'),
  expiresAt: z.string().min(1, 'Expiry date is required'),
});

type CouponFormValues = z.infer<typeof couponSchema>;

export default function CouponsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [industryFilter, setIndustryFilter] = useState<string | null>(null);
  const [formIndustryCode, setFormIndustryCode] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const { data: res, isLoading } = useCoupons({
    search: debouncedSearch || undefined,
    industryCode: industryFilter || undefined,
    page,
    limit: 20,
  });
  const createMut = useCreateCoupon();
  const deactivateMut = useDeleteCoupon();

  const coupons: Coupon[] = extractList(res);
  const meta = extractMeta(res);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CouponFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(couponSchema) as any,
    defaultValues: { type: 'FIXED_TOKENS', value: 0, maxUses: 100 },
  });

  const onSubmit = async (values: CouponFormValues) => {
    try {
      await createMut.mutateAsync({ ...values, industryCode: formIndustryCode || undefined });
      toast.success('Coupon created');
      reset();
      setFormIndustryCode(null);
      setShowForm(false);
    } catch {
      toast.error('Failed to create coupon');
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await deactivateMut.mutateAsync(id);
      toast.success('Coupon deactivated');
    } catch {
      toast.error('Failed to deactivate');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-sm text-gray-500">Manage discount and token coupons</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" />
          Create Coupon
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card className="border-primary/20">
          <CardHeader><CardTitle>New Coupon</CardTitle></CardHeader>
          <CardContent>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <Input label="Coupon Code" {...register('code')} placeholder="e.g. WELCOME50" />
                  {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code.message}</p>}
                </div>
                <Select
                  label="Type"
                  options={COUPON_TYPES}
                  {...register('type')}
                />
                <div>
                  <Input label="Value" type="number" {...register('value')} placeholder="50" />
                  {errors.value && <p className="text-xs text-red-500 mt-1">{errors.value.message}</p>}
                </div>
                <div>
                  <Input label="Max Uses" type="number" {...register('maxUses')} placeholder="100" />
                  {errors.maxUses && <p className="text-xs text-red-500 mt-1">{errors.maxUses.message}</p>}
                </div>
                <div>
                  <Input label="Expires At" type="date" {...register('expiresAt')} />
                  {errors.expiresAt && <p className="text-xs text-red-500 mt-1">{errors.expiresAt.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <IndustrySelect
                  value={formIndustryCode}
                  onChange={setFormIndustryCode}
                  label="Industry"
                  showAll={false}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => { setShowForm(false); reset(); setFormIndustryCode(null); }}>
                  Cancel
                </Button>
                <Button type="submit" loading={createMut.isPending}>Create</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input
            leftIcon={<Search className="h-4 w-4" />}
            placeholder="Search coupons..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="w-48">
          <IndustrySelect
            value={industryFilter}
            onChange={(v) => { setIndustryFilter(v); setPage(1); }}
            label=""
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
      ) : coupons.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No coupons yet"
          description="Create your first coupon code"
          actionLabel="Create Coupon"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Code</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Industry</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Type</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Value</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Usage</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Expires</th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.map((coupon) => {
                const expired = coupon.expiresAt ? new Date(coupon.expiresAt) < new Date() : false;
                return (
                  <tr key={coupon.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-mono font-semibold text-sm text-gray-900">{coupon.code}</span>
                    </td>
                    <td className="px-4 py-3">
                      <IndustryBadge industryCode={coupon.industryCode} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={coupon.type === 'PERCENTAGE' ? 'info' : 'warning'}>
                        {coupon.type === 'PERCENTAGE' ? 'Percentage' : 'Fixed Tokens'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-right text-gray-900">
                      {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : `${formatNumber(coupon.value)} tokens`}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600">
                      {formatNumber(coupon.usedCount ?? 0)} / {formatNumber(coupon.maxUses ?? 0)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {coupon.expiresAt ? formatDate(coupon.expiresAt) : 'Never'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {expired ? (
                        <Badge variant="secondary">Expired</Badge>
                      ) : (
                        <Badge variant={coupon.isActive ? 'success' : 'secondary'}>
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {coupon.isActive && !expired && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeactivate(coupon.id)}
                          disabled={deactivateMut.isPending}
                        >
                          <Ban className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {meta?.totalPages && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
            Previous
          </Button>
          <span className="text-sm text-gray-500">Page {page} of {meta.totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= meta.totalPages}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
