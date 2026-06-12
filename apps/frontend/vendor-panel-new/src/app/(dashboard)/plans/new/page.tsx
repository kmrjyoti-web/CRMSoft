'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IndustrySelect } from '@/components/common/industry-select';
import { useCreatePlan } from '@/hooks/use-plans';

const planSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  description: z.string().optional(),
  interval: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']),
  price: z.coerce.number().min(0, 'Price must be >= 0'),
  maxUsers: z.coerce.number().int().min(1, 'At least 1 user'),
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

export default function NewPlanPage() {
  const router = useRouter();
  const createMut = useCreatePlan();
  const [industryCode, setIndustryCode] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PlanFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(planSchema) as any,
    defaultValues: {
      interval: 'MONTHLY',
      price: 0,
      maxUsers: 5,
      maxContacts: 1000,
      maxLeads: 500,
      maxProducts: 100,
      maxStorage: 5,
    },
  });

  const onSubmit = async (values: PlanFormValues) => {
    try {
      const payload = {
        ...values,
        industryCode: industryCode || undefined,
        features: values.features
          ? values.features.split(',').map((f) => f.trim()).filter(Boolean)
          : [],
      };
      await createMut.mutateAsync(payload);
      toast.success('Plan created');
      router.push('/plans');
    } catch {
      toast.error('Failed to create plan');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create Plan</h1>
          <p className="text-sm text-gray-500">Define a new subscription plan</p>
        </div>
      </div>

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input label="Plan Name" {...register('name')} placeholder="e.g. Starter" />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Input label="Code" {...register('code')} placeholder="e.g. STARTER" />
                {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code.message}</p>}
              </div>
            </div>
            <Textarea label="Description" {...register('description')} rows={3} placeholder="Brief plan description..." />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Billing Interval"
                options={INTERVAL_OPTIONS}
                {...register('interval')}
              />
              <div>
                <Input label="Price (INR)" type="number" {...register('price')} placeholder="999" />
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
              placeholder="e.g. Email Integration, Reports, API Access"
              rows={3}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" loading={createMut.isPending}>
            <Save className="h-4 w-4" />
            Create Plan
          </Button>
        </div>
      </form>
    </div>
  );
}
