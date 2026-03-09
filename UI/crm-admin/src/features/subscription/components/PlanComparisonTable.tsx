'use client';

import { Icon, Badge, Button, Card } from '@/components/ui';
import { useAvailablePlans, useChangePlan } from '../hooks/useSubscription';
import { formatCurrency, FEATURE_LABELS } from '../utils/subscription-helpers';
import toast from 'react-hot-toast';

interface PlanComparisonTableProps {
  onClose: () => void;
  currentPlanId?: string;
}

export function PlanComparisonTable({ onClose, currentPlanId }: PlanComparisonTableProps) {
  const { data: plans, isLoading } = useAvailablePlans();
  const changePlanMut = useChangePlan();

  const handleChangePlan = async (planId: string) => {
    try {
      await changePlanMut.mutateAsync(planId);
      toast.success('Plan changed successfully');
      onClose();
    } catch {
      toast.error('Failed to change plan');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Choose a Plan</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <Icon name="x" size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Plans Grid */}
        <div className="p-6">
          {isLoading ? (
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-80 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(plans ?? []).map((plan) => {
                const isCurrent = plan.id === currentPlanId;
                return (
                  <Card
                    key={plan.id}
                    className={`p-6 relative ${
                      isCurrent ? 'ring-2 ring-blue-500 bg-blue-50/30' : ''
                    }`}
                  >
                    {isCurrent && (
                      <Badge variant="primary" className="absolute top-3 right-3">Current</Badge>
                    )}
                    <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{plan.description || 'Standard plan'}</p>

                    <div className="mt-4">
                      <span className="text-3xl font-bold text-gray-900">
                        {formatCurrency(Number(plan.price))}
                      </span>
                      <span className="text-sm text-gray-400">/{plan.interval.toLowerCase()}</span>
                    </div>

                    {/* Limits */}
                    <div className="mt-6 space-y-2">
                      <div className="text-xs font-semibold text-gray-500 uppercase">Limits</div>
                      <div className="text-sm text-gray-600">
                        <div className="flex justify-between py-1">
                          <span>Users</span>
                          <span className="font-medium">{plan.maxUsers}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span>Contacts</span>
                          <span className="font-medium">{plan.maxContacts}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span>Leads</span>
                          <span className="font-medium">{plan.maxLeads}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span>Products</span>
                          <span className="font-medium">{plan.maxProducts}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span>Storage</span>
                          <span className="font-medium">{plan.maxStorage} MB</span>
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mt-4 space-y-1">
                      <div className="text-xs font-semibold text-gray-500 uppercase">Features</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {plan.features.map((f) => (
                          <span key={f} className="text-xs bg-green-50 text-green-700 rounded px-1.5 py-0.5">
                            {FEATURE_LABELS[f] ?? f}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action */}
                    <div className="mt-6">
                      {isCurrent ? (
                        <Button variant="outline" className="w-full" disabled>
                          Current Plan
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          className="w-full"
                          onClick={() => handleChangePlan(plan.id)}
                          disabled={changePlanMut.isPending}
                        >
                          {changePlanMut.isPending ? 'Processing...' : 'Select Plan'}
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
