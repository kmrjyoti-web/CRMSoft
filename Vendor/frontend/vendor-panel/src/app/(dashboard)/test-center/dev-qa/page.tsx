'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, Plus, RefreshCw, Send, Download, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  useDevQADashboard,
  useDevQAPlans,
  useGenerateDevQAPlan,
  useSyncToNotion,
  usePullFromNotion,
} from '@/hooks/use-test-errors';

const COMMON_MODULES = [
  'leads', 'contacts', 'organizations', 'invoicing', 'payments',
  'orders', 'stock', 'accounts', 'quotations', 'activities',
  'settings', 'users', 'roles', 'workflows', 'tickets',
];

const STATUS_ICON: Record<string, React.ReactNode> = {
  ACTIVE: <Clock className="h-4 w-4 text-blue-500" />,
  COMPLETED: <CheckCircle className="h-4 w-4 text-green-600" />,
  DRAFT: <AlertCircle className="h-4 w-4 text-gray-400" />,
  ARCHIVED: <XCircle className="h-4 w-4 text-gray-300" />,
};

function GeneratePlanModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState(`Dev QA Plan — ${new Date().toLocaleDateString()}`);
  const [selected, setSelected] = useState<string[]>([]);
  const generatePlan = useGenerateDevQAPlan();

  const toggle = (mod: string) =>
    setSelected(prev => prev.includes(mod) ? prev.filter(m => m !== mod) : [...prev, mod]);

  const handleSubmit = async () => {
    try {
      const result = await generatePlan.mutateAsync({
        name,
        modules: selected.length > 0 ? selected : undefined,
      });
      toast.success(`Plan created with ${result.itemCount} test items`);
      onClose();
    } catch {
      toast.error('Failed to generate plan');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4">
        <h2 className="text-lg font-bold">Generate Dev QA Plan</h2>

        <div className="space-y-1">
          <label className="text-sm font-medium">Plan Name</label>
          <Input value={name} onChange={e => setName(e.target.value)} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Modules (empty = all)</label>
          <div className="flex flex-wrap gap-2">
            {COMMON_MODULES.map(mod => (
              <button
                key={mod}
                onClick={() => toggle(mod)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  selected.includes(mod)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
                }`}
              >
                {mod}
              </button>
            ))}
          </div>
          {selected.length > 0 && (
            <p className="text-xs text-gray-500">{selected.length} module(s) selected</p>
          )}
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={generatePlan.isPending}>
            {generatePlan.isPending ? 'Generating...' : 'Generate Plan'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function PlanCard({ plan }: { plan: any }) {
  const router = useRouter();
  const syncToNotion = useSyncToNotion();
  const pullFromNotion = usePullFromNotion();

  const handleSync = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const result = await syncToNotion.mutateAsync(plan.id);
      toast.success(`Synced ${result.syncedCount} items to Notion`);
    } catch {
      toast.error('Notion sync failed. Check Notion settings.');
    }
  };

  const handlePull = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const result = await pullFromNotion.mutateAsync(plan.id);
      toast.success(`Pulled ${result.updated} update(s) from Notion`);
    } catch {
      toast.error('Failed to pull from Notion');
    }
  };

  const passRate = plan.totalItems > 0
    ? Math.round((plan.passedItems / plan.totalItems) * 100)
    : 0;

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/test-center/test-plans/${plan.id}`)}>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {STATUS_ICON[plan.status]}
              <h3 className="font-semibold text-gray-900 truncate">{plan.name}</h3>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {plan.totalItems} items · {passRate}% passed
            </p>
          </div>
          {plan.notionPageId && (
            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">Synced</span>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: `${Math.min(100, passRate)}%` }}
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="text-green-700">{plan.passedItems} passed</span>
          <span>·</span>
          <span className="text-red-600">{plan.failedItems} failed</span>
          <span>·</span>
          <span>{plan.totalItems - plan.passedItems - plan.failedItems} pending</span>
        </div>

        {/* Notion sync buttons */}
        <div className="flex gap-2 pt-1" onClick={e => e.stopPropagation()}>
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-7"
            onClick={handleSync}
            disabled={syncToNotion.isPending}
          >
            <Send className="h-3 w-3 mr-1" />
            Push to Notion
          </Button>
          {plan.notionPageId && (
            <Button
              size="sm"
              variant="ghost"
              className="text-xs h-7"
              onClick={handlePull}
              disabled={pullFromNotion.isPending}
            >
              <Download className="h-3 w-3 mr-1" />
              Pull Updates
            </Button>
          )}
        </div>

        {plan.notionSyncedAt && (
          <p className="text-xs text-gray-400">
            Last synced: {new Date(plan.notionSyncedAt).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function DevQAPage() {
  const [showModal, setShowModal] = useState(false);
  const { data: dashboard, isLoading: dashLoading } = useDevQADashboard();
  const { data: plansRes, isLoading: plansLoading } = useDevQAPlans({ limit: 50 });

  const plans = plansRes?.data ?? [];
  const stats = dashboard?.stats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Brain className="h-6 w-6 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold">Developer QA Log</h1>
            <p className="text-sm text-gray-500">Auto-generated checklists with Notion bidirectional sync</p>
          </div>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Generate New Plan
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {dashLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
        ) : (
          <>
            <Card><CardContent className="pt-5 text-center">
              <div className="text-3xl font-bold text-gray-900">{stats?.totalItems ?? 0}</div>
              <div className="text-xs text-gray-500 mt-1">Total Items</div>
            </CardContent></Card>
            <Card><CardContent className="pt-5 text-center">
              <div className="text-3xl font-bold text-green-600">{stats?.passedItems ?? 0}</div>
              <div className="text-xs text-gray-500 mt-1">Passed</div>
            </CardContent></Card>
            <Card><CardContent className="pt-5 text-center">
              <div className="text-3xl font-bold text-red-500">{stats?.failedItems ?? 0}</div>
              <div className="text-xs text-gray-500 mt-1">Failed</div>
            </CardContent></Card>
            <Card><CardContent className="pt-5 text-center">
              <div className="text-3xl font-bold text-blue-600">{stats?.overallPassRate ?? 0}%</div>
              <div className="text-xs text-gray-500 mt-1">Pass Rate</div>
            </CardContent></Card>
          </>
        )}
      </div>

      {/* Plans grid */}
      {plansLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
        </div>
      ) : plans.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-gray-500">
            <Brain className="h-10 w-10 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No Dev QA plans yet</p>
            <p className="text-sm mt-1">Generate a plan from your module registry to start structured QA testing.</p>
            <Button className="mt-4" onClick={() => setShowModal(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Generate New Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {plans.map((plan: any) => <PlanCard key={plan.id} plan={plan} />)}
        </div>
      )}

      {/* Modal */}
      {showModal && <GeneratePlanModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
