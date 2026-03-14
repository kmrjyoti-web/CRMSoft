'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Tag, Plus, Search, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/empty-state';
import { IndustryBadge } from '@/components/common/industry-badge';
import { IndustrySelect } from '@/components/common/industry-select';
import { useOffers, useCreateOffer, useDeactivateOffer } from '@/hooks/use-offers';
import { useDebounce } from '@/hooks/use-debounce';
import { formatCurrency, formatDate, formatNumber, extractList, extractMeta } from '@/lib/utils';
import type { Offer } from '@/types/offer';

const OFFER_TYPES = [
  { value: 'DISCOUNT_PERCENTAGE', label: 'Discount %' },
  { value: 'DISCOUNT_FLAT', label: 'Flat Discount' },
  { value: 'TRIAL_EXTENSION', label: 'Trial Extension' },
  { value: 'BONUS_TOKENS', label: 'Bonus Tokens' },
];

const offerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  description: z.string().optional(),
  offerType: z.string().min(1, 'Type is required'),
  value: z.coerce.number().min(0),
  validFrom: z.string().min(1, 'Start date is required'),
  validTo: z.string().min(1, 'End date is required'),
  maxRedemptions: z.coerce.number().int().min(0).optional(),
});

type OfferFormValues = z.infer<typeof offerSchema>;

const TYPE_BADGE_MAP: Record<string, 'default' | 'info' | 'warning' | 'success'> = {
  DISCOUNT_PERCENTAGE: 'info',
  DISCOUNT_FLAT: 'default',
  TRIAL_EXTENSION: 'warning',
  BONUS_TOKENS: 'success',
};

export default function OffersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [industryFilter, setIndustryFilter] = useState<string | null>(null);
  const [formIndustryCode, setFormIndustryCode] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const { data: res, isLoading } = useOffers({
    search: debouncedSearch || undefined,
    industryCode: industryFilter || undefined,
    page,
    limit: 20,
  });
  const createMut = useCreateOffer();
  const deactivateMut = useDeactivateOffer();

  const offers: Offer[] = extractList(res);
  const meta = extractMeta(res);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OfferFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(offerSchema) as any,
    defaultValues: { offerType: 'DISCOUNT_PERCENTAGE', value: 0 },
  });

  const onSubmit = async (values: OfferFormValues) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await createMut.mutateAsync({ ...values, industryCode: formIndustryCode || undefined } as any);
      toast.success('Offer created');
      reset();
      setFormIndustryCode(null);
      setShowForm(false);
    } catch {
      toast.error('Failed to create offer');
    }
  };

  const handleDeactivate = async (offerId: string) => {
    try {
      await deactivateMut.mutateAsync(offerId);
      toast.success('Offer deactivated');
    } catch {
      toast.error('Failed to deactivate offer');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Software Offers</h1>
          <p className="text-sm text-gray-500">Manage promotional offers and discounts</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" />
          Create Offer
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card className="border-primary/20">
          <CardHeader><CardTitle>New Offer</CardTitle></CardHeader>
          <CardContent>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Input label="Offer Name" {...register('name')} placeholder="e.g. Launch Special" />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <Input label="Code" {...register('code')} placeholder="e.g. LAUNCH25" />
                  {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code.message}</p>}
                </div>
                <Select
                  label="Offer Type"
                  options={OFFER_TYPES}
                  {...register('offerType')}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Input label="Value" type="number" {...register('value')} />
                  {errors.value && <p className="text-xs text-red-500 mt-1">{errors.value.message}</p>}
                </div>
                <div>
                  <Input label="Valid From" type="date" {...register('validFrom')} />
                  {errors.validFrom && <p className="text-xs text-red-500 mt-1">{errors.validFrom.message}</p>}
                </div>
                <div>
                  <Input label="Valid To" type="date" {...register('validTo')} />
                  {errors.validTo && <p className="text-xs text-red-500 mt-1">{errors.validTo.message}</p>}
                </div>
                <Input label="Max Redemptions" type="number" {...register('maxRedemptions')} placeholder="Unlimited" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <IndustrySelect
                  value={formIndustryCode}
                  onChange={setFormIndustryCode}
                  label="Industry"
                  showAll={false}
                />
              </div>
              <Textarea label="Description" {...register('description')} rows={2} placeholder="Optional description..." />
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => { setShowForm(false); reset(); }}>
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
            placeholder="Search offers..."
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
      ) : offers.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No offers yet"
          description="Create a promotional offer to attract tenants"
          actionLabel="Create Offer"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Name</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Code</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Industry</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Type</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Value</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Valid Period</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Redemptions</th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {offers.map((offer) => (
                <tr key={offer.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{offer.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{offer.code}</td>
                  <td className="px-4 py-3">
                    <IndustryBadge industryCode={offer.industryCode} />
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={TYPE_BADGE_MAP[offer.offerType] ?? 'outline'}>
                      {offer.offerType?.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-right text-gray-900">
                    {offer.offerType === 'DISCOUNT_PERCENTAGE'
                      ? `${offer.value}%`
                      : offer.offerType === 'TRIAL_EXTENSION'
                        ? `${offer.value} days`
                        : formatCurrency(offer.value ?? 0)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDate(offer.validFrom)} - {formatDate(offer.validTo)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">
                    {formatNumber(offer.currentRedemptions ?? 0)}
                    {offer.maxRedemptions ? ` / ${formatNumber(offer.maxRedemptions)}` : ''}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={offer.isActive ? 'success' : 'secondary'}>
                      {offer.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {offer.isActive && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeactivate(offer.id)}
                        disabled={deactivateMut.isPending}
                      >
                        <Ban className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
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
