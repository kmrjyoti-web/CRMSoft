'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Settings2, Plus, Search, Pencil, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/empty-state';
import { IndustryBadge } from '@/components/common/industry-badge';
import { IndustrySelect } from '@/components/common/industry-select';
import {
  useServiceRates,
  useCreateServiceRate,
  useUpdateServiceRate,
  useDeleteServiceRate,
} from '@/hooks/use-service-rates';
import { useDebounce } from '@/hooks/use-debounce';
import { formatNumber, extractList, extractMeta } from '@/lib/utils';
import type { ServiceRate } from '@/types/service-rate';

const CATEGORIES = [
  { value: 'AI', label: 'AI' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'SMS', label: 'SMS' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'STORAGE', label: 'Storage' },
  { value: 'OTHER', label: 'Other' },
];

const rateSchema = z.object({
  serviceKey: z.string().min(1, 'Service key is required'),
  displayName: z.string().min(1, 'Display name is required'),
  category: z.string().min(1, 'Category is required'),
  baseTokens: z.coerce.number().min(0),
  marginPct: z.coerce.number().min(0).max(100),
});

type RateFormValues = z.infer<typeof rateSchema>;

const CATEGORY_BADGE: Record<string, 'default' | 'info' | 'warning' | 'success' | 'secondary'> = {
  AI: 'default',
  EMAIL: 'info',
  SMS: 'warning',
  WHATSAPP: 'success',
  STORAGE: 'secondary',
};

export default function ServiceRatesPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [industryFilter, setIndustryFilter] = useState<string | null>(null);
  const [formIndustryCode, setFormIndustryCode] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const { data: res, isLoading } = useServiceRates({
    search: debouncedSearch || undefined,
    category: categoryFilter || undefined,
    industryCode: industryFilter || undefined,
    page,
    limit: 20,
  });
  const createMut = useCreateServiceRate();
  const updateMut = useUpdateServiceRate();
  const deactivateMut = useDeleteServiceRate();

  const rates: ServiceRate[] = extractList(res);
  const meta = extractMeta(res);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<RateFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(rateSchema) as any,
    defaultValues: { baseTokens: 1, marginPct: 20, category: 'AI' },
  });

  const startEdit = (rate: ServiceRate) => {
    setEditingId(rate.id);
    setShowForm(true);
    setValue('serviceKey', rate.serviceKey);
    setValue('displayName', rate.displayName);
    setValue('category', rate.category);
    setValue('baseTokens', rate.baseTokens);
    setValue('marginPct', rate.marginPct);
    setFormIndustryCode(rate.industryCode ?? null);
  };

  const onSubmit = async (values: RateFormValues) => {
    try {
      const payload = { ...values, industryCode: formIndustryCode || undefined };
      if (editingId) {
        await updateMut.mutateAsync({ id: editingId, data: payload });
        toast.success('Service rate updated');
      } else {
        await createMut.mutateAsync(payload);
        toast.success('Service rate created');
      }
      reset();
      setFormIndustryCode(null);
      setShowForm(false);
      setEditingId(null);
    } catch {
      toast.error(editingId ? 'Failed to update' : 'Failed to create');
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await deactivateMut.mutateAsync(id);
      toast.success('Rate deactivated');
    } catch {
      toast.error('Failed to deactivate');
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormIndustryCode(null);
    reset();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Rates</h1>
          <p className="text-sm text-gray-500">Configure token rates for each service</p>
        </div>
        <Button onClick={() => { cancelForm(); setShowForm(true); }}>
          <Plus className="h-4 w-4" />
          Add Rate
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Service Rate' : 'New Service Rate'}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <Input label="Service Key" {...register('serviceKey')} placeholder="e.g. gpt-4o" disabled={!!editingId} />
                  {errors.serviceKey && <p className="text-xs text-red-500 mt-1">{errors.serviceKey.message}</p>}
                </div>
                <div>
                  <Input label="Display Name" {...register('displayName')} placeholder="e.g. GPT-4o Chat" />
                  {errors.displayName && <p className="text-xs text-red-500 mt-1">{errors.displayName.message}</p>}
                </div>
                <Select label="Category" options={CATEGORIES} {...register('category')} />
                <div>
                  <Input label="Base Tokens" type="number" {...register('baseTokens')} />
                  {errors.baseTokens && <p className="text-xs text-red-500 mt-1">{errors.baseTokens.message}</p>}
                </div>
                <div>
                  <Input label="Margin %" type="number" {...register('marginPct')} />
                  {errors.marginPct && <p className="text-xs text-red-500 mt-1">{errors.marginPct.message}</p>}
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
                <Button variant="outline" type="button" onClick={cancelForm}>Cancel</Button>
                <Button type="submit" loading={createMut.isPending || updateMut.isPending}>
                  {editingId ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input
            leftIcon={<Search className="h-4 w-4" />}
            placeholder="Search rates..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select
          options={[{ value: '', label: 'All Categories' }, ...CATEGORIES]}
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="w-44"
        />
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
      ) : rates.length === 0 ? (
        <EmptyState
          icon={Settings2}
          title="No service rates"
          description="Configure your first service rate"
          actionLabel="Add Rate"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Service Key</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Display Name</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Industry</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Category</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Base Tokens</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Margin %</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Final Tokens</th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rates.map((rate) => {
                const finalTokens = Math.ceil(rate.baseTokens * (1 + rate.marginPct / 100));
                return (
                  <tr key={rate.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm text-gray-900">{rate.serviceKey}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{rate.displayName}</td>
                    <td className="px-4 py-3">
                      <IndustryBadge industryCode={rate.industryCode} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={CATEGORY_BADGE[rate.category] ?? 'outline'}>
                        {rate.category}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600">{formatNumber(rate.baseTokens)}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600">{rate.marginPct}%</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{formatNumber(finalTokens)}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={rate.isActive ? 'success' : 'secondary'}>
                        {rate.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => startEdit(rate)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        {rate.isActive && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeactivate(rate.id)}
                            disabled={deactivateMut.isPending}
                          >
                            <Ban className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
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
