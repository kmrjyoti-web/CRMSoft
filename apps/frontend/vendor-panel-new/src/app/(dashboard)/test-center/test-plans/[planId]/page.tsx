'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, CheckCircle, XCircle, AlertCircle, Clock, Circle,
  MinusCircle, SkipForward, ChevronDown, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useTestPlan, useUpdateTestPlanItem, useUpdateTestPlan } from '@/hooks/use-test-plans';
import type { TestPlanItem } from '@/lib/api/test-plans';

const ITEM_STATUS_ICON: Record<string, React.ReactNode> = {
  NOT_STARTED: <Circle className="h-4 w-4 text-gray-400" />,
  IN_PROGRESS: <Clock className="h-4 w-4 text-blue-500" />,
  PASSED: <CheckCircle className="h-4 w-4 text-green-600" />,
  FAILED: <XCircle className="h-4 w-4 text-red-500" />,
  PARTIAL: <AlertCircle className="h-4 w-4 text-yellow-500" />,
  BLOCKED: <MinusCircle className="h-4 w-4 text-orange-500" />,
  SKIPPED: <SkipForward className="h-4 w-4 text-gray-400" />,
};

const ITEM_STATUS_LABEL: Record<string, string> = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  PASSED: 'Passed',
  FAILED: 'Failed',
  PARTIAL: 'Partial',
  BLOCKED: 'Blocked',
  SKIPPED: 'Skipped',
};

const ITEM_STATUS_OPTIONS = ['NOT_STARTED', 'IN_PROGRESS', 'PASSED', 'FAILED', 'PARTIAL', 'BLOCKED', 'SKIPPED'];

const PRIORITY_COLOR: Record<string, string> = {
  LOW: 'text-gray-400',
  MEDIUM: 'text-blue-500',
  HIGH: 'text-orange-500',
  CRITICAL: 'text-red-600',
};

const LAYER_COLOR: Record<string, string> = {
  UI: 'bg-purple-100 text-purple-700',
  API: 'bg-blue-100 text-blue-700',
  DB: 'bg-green-100 text-green-700',
  ARCH: 'bg-orange-100 text-orange-700',
  INTEGRATION: 'bg-pink-100 text-pink-700',
};

function ItemRow({ item, planId }: { item: TestPlanItem; planId: string }) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(item.notes ?? '');
  const updateItem = useUpdateTestPlanItem();

  const handleStatusChange = (status: string) => {
    updateItem.mutate(
      { planId, itemId: item.id, body: { status } },
      { onSuccess: () => toast.success('Status updated'), onError: () => toast.error('Failed to update') },
    );
  };

  const handleSaveNotes = () => {
    updateItem.mutate(
      { planId, itemId: item.id, body: { notes } },
      { onSuccess: () => toast.success('Notes saved'), onError: () => toast.error('Failed to save') },
    );
  };

  return (
    <div className={`border rounded-lg overflow-hidden ${item.status === 'PASSED' ? 'border-green-100 bg-green-50/30' : item.status === 'FAILED' ? 'border-red-100 bg-red-50/30' : 'border-gray-100'}`}>
      <div
        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-shrink-0">{ITEM_STATUS_ICON[item.status]}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm text-gray-900">{item.componentName}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${LAYER_COLOR[item.layer] ?? 'bg-gray-100 text-gray-600'}`}>{item.layer}</span>
            <span className={`text-xs font-medium ${PRIORITY_COLOR[item.priority]}`}>{item.priority}</span>
            <span className="text-xs text-gray-400">{item.moduleName}</span>
          </div>
          <p className="text-xs text-gray-600 mt-0.5 truncate">{item.functionality}</p>
        </div>
        <div className="flex-shrink-0 flex items-center gap-2">
          <select
            className="text-xs border border-gray-200 rounded px-1.5 py-1 bg-white"
            value={item.status}
            onChange={e => { e.stopPropagation(); handleStatusChange(e.target.value); }}
            onClick={e => e.stopPropagation()}
            disabled={updateItem.isPending}
          >
            {ITEM_STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{ITEM_STATUS_LABEL[s]}</option>
            ))}
          </select>
          {expanded ? <ChevronDown className="h-3.5 w-3.5 text-gray-400" /> : <ChevronRight className="h-3.5 w-3.5 text-gray-400" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-3 space-y-3 bg-white">
          <div className="text-sm text-gray-700">
            <span className="font-medium">Test: </span>{item.functionality}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">Tester Notes</label>
            <textarea
              className="w-full text-sm border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[60px]"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add notes about the test result..."
            />
            <Button size="sm" variant="outline" onClick={handleSaveNotes} disabled={updateItem.isPending}>
              Save Notes
            </Button>
          </div>
          {item.testedAt && (
            <p className="text-xs text-gray-400">
              Tested at: {new Date(item.testedAt).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function TestPlanDetailPage({ params }: { params: { planId: string } }) {
  const router = useRouter();
  const { data: plan, isLoading } = useTestPlan(params.planId);
  const updatePlan = useUpdateTestPlan();

  const handleMarkComplete = () => {
    updatePlan.mutate(
      { planId: params.planId, body: { status: 'COMPLETED' } },
      {
        onSuccess: () => toast.success('Plan marked as completed'),
        onError: () => toast.error('Failed to update plan status'),
      },
    );
  };

  if (isLoading) return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-64" />
      <Skeleton className="h-32 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );

  if (!plan) return (
    <div className="text-center py-16 text-gray-500">Test plan not found</div>
  );

  // Group items by module
  const byModule: Record<string, TestPlanItem[]> = {};
  for (const item of plan.items ?? []) {
    (byModule[item.moduleName] = byModule[item.moduleName] ?? []).push(item);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{plan.name}</h1>
            <Badge variant={plan.status === 'COMPLETED' ? 'success' : plan.status === 'ACTIVE' ? 'default' : 'secondary'}>
              {plan.status}
            </Badge>
            {plan.version && <span className="text-sm text-gray-500 font-mono">{plan.version}</span>}
          </div>
          {plan.description && <p className="text-sm text-gray-500 mt-1">{plan.description}</p>}
        </div>
        {plan.status !== 'COMPLETED' && (
          <Button size="sm" onClick={handleMarkComplete} disabled={updatePlan.isPending}>
            Mark Complete
          </Button>
        )}
      </div>

      {/* Progress Card */}
      <Card>
        <CardContent className="pt-5 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{plan.totalItems}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{plan.passedItems}</div>
              <div className="text-xs text-gray-500">Passed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-500">{plan.failedItems}</div>
              <div className="text-xs text-gray-500">Failed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{Math.round(plan.progress)}%</div>
              <div className="text-xs text-gray-500">Progress</div>
            </div>
          </div>
          <div className="mt-4 w-full bg-gray-100 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all"
              style={{ width: `${Math.min(100, plan.progress)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Items by module */}
      {Object.keys(byModule).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            No test items in this plan.
          </CardContent>
        </Card>
      ) : (
        Object.entries(byModule).map(([module, items]) => (
          <Card key={module}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="text-blue-600">{module}</span>
                <span className="text-xs font-normal text-gray-400">
                  ({items.filter(i => i.status === 'PASSED').length}/{items.length} passed)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {items.map(item => (
                <ItemRow key={item.id} item={item} planId={plan.id} />
              ))}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
