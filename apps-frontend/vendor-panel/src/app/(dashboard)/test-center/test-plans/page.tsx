'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardList, Plus, Search, ChevronRight, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useTestPlans } from '@/hooks/use-test-plans';
import type { TestPlan } from '@/lib/api/test-plans';

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'success' | 'destructive'> = {
  DRAFT: 'secondary',
  ACTIVE: 'default',
  COMPLETED: 'success',
  ARCHIVED: 'secondary',
};

const PRIORITY_COLOR: Record<string, string> = {
  LOW: 'text-gray-500',
  MEDIUM: 'text-blue-600',
  HIGH: 'text-orange-600',
  CRITICAL: 'text-red-600',
};

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-2">
      <div
        className="bg-green-500 h-2 rounded-full transition-all"
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
  );
}

function PlanCard({ plan }: { plan: TestPlan }) {
  const router = useRouter();
  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => router.push(`/test-center/test-plans/${plan.id}`)}
    >
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 truncate">{plan.name}</h3>
              <Badge variant={STATUS_VARIANT[plan.status] ?? 'default'}>{plan.status}</Badge>
              {plan.version && (
                <span className="text-xs text-gray-500 font-mono">{plan.version}</span>
              )}
            </div>
            {plan.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{plan.description}</p>
            )}
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-gray-500">
            <span>{plan.completedItems}/{plan.totalItems} complete</span>
            <span className="font-medium">{Math.round(plan.progress)}%</span>
          </div>
          <ProgressBar value={plan.progress} />
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1 text-green-700">
            <CheckCircle className="h-3 w-3" />
            {plan.passedItems} passed
          </span>
          <span className="flex items-center gap-1 text-red-600">
            <XCircle className="h-3 w-3" />
            {plan.failedItems} failed
          </span>
          <span className="flex items-center gap-1 text-gray-500">
            <Clock className="h-3 w-3" />
            {plan.totalItems - plan.completedItems} pending
          </span>
        </div>

        {/* Modules */}
        {plan.targetModules.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {plan.targetModules.slice(0, 4).map(m => (
              <span key={m} className="text-xs bg-blue-50 text-blue-700 rounded px-1.5 py-0.5">{m}</span>
            ))}
            {plan.targetModules.length > 4 && (
              <span className="text-xs text-gray-400">+{plan.targetModules.length - 4} more</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function TestPlansPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const { data: res, isLoading } = useTestPlans({
    search: search || undefined,
    status: status || undefined,
    limit: 50,
  });

  const plans: TestPlan[] = res?.data ?? [];
  const meta = res?.meta;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-6 w-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold">Test Plans</h1>
            <p className="text-sm text-gray-500">Structured QA checklists for manual testing</p>
          </div>
        </div>
        <Button onClick={() => router.push('/test-center/test-plans/new')}>
          <Plus className="h-4 w-4 mr-1" />
          New Test Plan
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            className="pl-9"
            placeholder="Search plans..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-white"
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {/* Stats summary */}
      {meta && (
        <p className="text-sm text-gray-500">{meta.total} test plan{meta.total !== 1 ? 's' : ''}</p>
      )}

      {/* Plans grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-gray-500">
            <ClipboardList className="h-10 w-10 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No test plans found</p>
            <p className="text-sm mt-1">Create your first test plan to start structured QA testing.</p>
            <Button className="mt-4" onClick={() => router.push('/test-center/test-plans/new')}>
              <Plus className="h-4 w-4 mr-1" />
              New Test Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {plans.map(plan => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}
    </div>
  );
}
