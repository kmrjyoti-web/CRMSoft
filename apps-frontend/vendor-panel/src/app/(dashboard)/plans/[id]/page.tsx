'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowLeft, Save, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { IndustrySelect } from '@/components/common/industry-select';
import { usePlan, useUpdatePlan, useDeactivatePlan } from '@/hooks/use-plans';

const planSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  description: z.string().optional(),
  interval: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']),
  price: z.coerce.number().min(0),
  maxUsers: z.coerce.number().int().min(1),
  maxContacts: z.coerce.number().int().min(0).optional(),
  maxLeads: z.coerce.number().int().min(0).optional(),
  maxProducts: z.coerce.number().int().min(0).optional(),
  maxStorage: z.coerce.number().int().min(0).optional(),
  features: z.string().optional(),
});

type PlanFormValues = z.infer<typeof planSchema>;

const INTERVAL_OPTIONS = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'YEARLY', label: 'Yearly' },
];

export default function PlanDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [industryCode, setIndustryCode] = useState<string | null>(null);

  const { data: res, isLoading } = usePlan(id);
  const updateMut = useUpdatePlan();
  const deactivateMut = useDeactivatePlan();

  const plan = res?.data;

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<PlanFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(planSchema) as any,
    values: plan
      ? {
          name: plan.name ?? '',
          code: plan.code ?? '',
          description: plan.description ?? '',
          interval: plan.interval ?? 'MONTHLY',
          price: plan.price ?? 0,
          maxUsers: plan.maxUsers ?? 5,
          maxContacts: plan.maxContacts ?? 1000,
          maxLeads: plan.maxLeads ?? 500,
          maxProducts: plan.maxProducts ?? 100,
          maxStorage: plan.maxStorage ?? 5,
          features: plan.features?.join(', ') ?? '',
        }
      : undefined,
  });

  useEffect(() => {
    if (plan?.industryCode) setIndustryCode(plan.industryCode);
  }, [plan?.industryCode]);

  const onSubmit = async (values: PlanFormValues) => {
    try {
      const payload = {
        ...values,
        industryCode: industryCode || undefined,
        features: values.features
          ? values.features.split(',').map((f) => f.trim()).filter(Boolean)
          : [],
      };
      await updateMut.mutateAsync({ id, data: payload });
      toast.success('Plan updated');
    } catch {
      toast.error('Failed to update plan');
    }
  };

  const handleDeactivate = async () => {
    try {
      await deactivateMut.mutateAsync(id);
      toast.success('Plan deactivated');
      router.push('/plans');
    } catch {
      toast.error('Failed to deactivate plan');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <p className="text-gray-500">Plan not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/plans')}>
          Back to Plans
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{plan.name}</h1>
              <Badge variant={plan.isActive ? 'success' : 'secondary'}>
                {plan.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-sm text-gray-500">{plan.code}</p>
          </div>
        </div>
        {plan.isActive && (
          <Button variant="destructive" size="sm" onClick={() => setShowDeactivate(true)}>
            <Ban className="h-4 w-4" />
            Deactivate
          </Button>
        )}
      </div>

      {/* Deactivation Confirmation */}
      {showDeactivate && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-red-800">Deactivate this plan?</p>
              <p className="text-sm text-red-600">Existing subscribers will not be affected, but no new signups will be allowed.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowDeactivate(false)}>Cancel</Button>
              <Button variant="destructive" size="sm" onClick={handleDeactivate} loading={deactivateMut.isPending}>
                Confirm
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input label="Plan Name" {...register('name')} />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Input label="Code" {...register('code')} />
                {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code.message}</p>}
              </div>
            </div>
            <Textarea label="Description" {...register('description')} rows={3} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Billing Interval"
                options={INTERVAL_OPTIONS}
                {...register('interval')}
              />
              <div>
                <Input label="Price (INR)" type="number" {...register('price')} />
                {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
              </div>
              <IndustrySelect
                value={industryCode}
                onChange={setIndustryCode}
                label="Industry"
                showAll={false}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Limits</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Input label="Max Users" type="number" {...register('maxUsers')} />
                {errors.maxUsers && <p className="text-xs text-red-500 mt-1">{errors.maxUsers.message}</p>}
              </div>
              <Input label="Max Contacts" type="number" {...register('maxContacts')} />
              <Input label="Max Leads" type="number" {...register('maxLeads')} />
              <Input label="Max Products" type="number" {...register('maxProducts')} />
              <Input label="Max Storage (GB)" type="number" {...register('maxStorage')} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Features</CardTitle></CardHeader>
          <CardContent>
            <Textarea
              label="Features (comma-separated)"
              {...register('features')}
              rows={3}
              placeholder="e.g. Email Integration, Reports, API Access"
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" loading={updateMut.isPending} disabled={!isDirty}>
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
