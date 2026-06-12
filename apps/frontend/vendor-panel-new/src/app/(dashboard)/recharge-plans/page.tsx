'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Zap, Plus, Coins, Gift, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/empty-state';
import { IndustryBadge } from '@/components/common/industry-badge';
import { IndustrySelect } from '@/components/common/industry-select';
import {
  useRechargePlans,
  useCreateRechargePlan,
  useDeleteRechargePlan,
} from '@/hooks/use-recharge-plans';
import { formatCurrency, formatNumber, extractList } from '@/lib/utils';
import type { RechargePlan } from '@/types/recharge-plan';

const rechargeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  amount: z.coerce.number().min(1, 'Amount must be > 0'),
  tokens: z.coerce.number().int().min(1, 'Tokens must be > 0'),
  bonusTokens: z.coerce.number().int().min(0).optional(),
});

type RechargeFormValues = z.infer<typeof rechargeSchema>;

export default function RechargePlansPage() {
  const [showForm, setShowForm] = useState(false);
  const [industryFilter, setIndustryFilter] = useState<string | null>(null);
  const [formIndustryCode, setFormIndustryCode] = useState<string | null>(null);

  const { data: res, isLoading } = useRechargePlans({
    industryCode: industryFilter || undefined,
  });
  const createMut = useCreateRechargePlan();
  const deactivateMut = useDeleteRechargePlan();

  const plans: RechargePlan[] = extractList(res);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RechargeFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(rechargeSchema) as any,
    defaultValues: { amount: 0, tokens: 0, bonusTokens: 0 },
  });

  const onSubmit = async (values: RechargeFormValues) => {
    try {
      await createMut.mutateAsync({ ...values, industryCode: formIndustryCode || undefined });
      toast.success('Recharge plan created');
      reset();
      setFormIndustryCode(null);
      setShowForm(false);
    } catch {
      toast.error('Failed to create recharge plan');
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await deactivateMut.mutateAsync(id);
      toast.success('Recharge plan deactivated');
    } catch {
      toast.error('Failed to deactivate');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recharge Plans</h1>
          <p className="text-sm text-gray-500">Manage token recharge options for tenants</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" />
          Add Plan
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card className="border-primary/20">
          <CardHeader><CardTitle>New Recharge Plan</CardTitle></CardHeader>
          <CardContent>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Input label="Plan Name" {...register('name')} placeholder="e.g. Starter Pack" />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <Input label="Amount (INR)" type="number" {...register('amount')} placeholder="499" />
                  {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
                </div>
                <div>
                  <Input label="Tokens" type="number" {...register('tokens')} placeholder="500" />
                  {errors.tokens && <p className="text-xs text-red-500 mt-1">{errors.tokens.message}</p>}
                </div>
                <Input label="Bonus Tokens" type="number" {...register('bonusTokens')} placeholder="50" />
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

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="w-48">
          <IndustrySelect
            value={industryFilter}
            onChange={setIndustryFilter}
            label=""
          />
        </div>
      </div>

      {/* Card Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}><CardContent className="p-4"><Skeleton className="h-36 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <EmptyState
          icon={Zap}
          title="No recharge plans"
          description="Create your first recharge plan for token top-ups"
          actionLabel="Add Plan"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card key={plan.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                      <p className="text-lg font-bold text-primary">{formatCurrency(plan.amount)}</p>
                    </div>
                  </div>
                  <Badge variant={plan.isActive ? 'success' : 'secondary'}>
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="mb-2">
                  <IndustryBadge industryCode={plan.industryCode} />
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span className="flex items-center gap-1.5">
                    <Coins className="h-4 w-4 text-gray-400" />
                    {formatNumber(plan.tokens)} tokens
                  </span>
                  {(plan.bonusTokens ?? 0) > 0 && (
                    <span className="flex items-center gap-1.5 text-green-600">
                      <Gift className="h-4 w-4" />
                      +{formatNumber(plan.bonusTokens!)} bonus
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-xs text-gray-400">
                    {formatCurrency(plan.amount / (plan.tokens + (plan.bonusTokens ?? 0)))}/token
                  </span>
                  {plan.isActive && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeactivate(plan.id)}
                      disabled={deactivateMut.isPending}
                    >
                      <Ban className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
