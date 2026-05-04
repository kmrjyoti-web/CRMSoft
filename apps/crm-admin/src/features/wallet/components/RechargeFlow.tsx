'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Icon, Button, Card, Input, Badge } from '@/components/ui';
import { useRechargePlans, useInitiateRecharge, useApplyCoupon } from '../hooks/useWallet';
import { formatTokens, formatCurrency } from '../utils/wallet-helpers';

interface Props {
  onClose: () => void;
}

export function RechargeFlow({ onClose }: Props) {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState<{ valid: boolean; bonusTokens: number; message: string } | null>(null);

  const { data: plansResponse, isLoading } = useRechargePlans();
  const initiateMut = useInitiateRecharge();
  const couponMut = useApplyCoupon();
  const plans = Array.isArray(plansResponse?.data) ? plansResponse.data : [];

  const selectedPlan = plans.find((p: any) => p.id === selectedPlanId);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const response = await couponMut.mutateAsync({
        code: couponCode.trim(),
        rechargeAmount: selectedPlan ? Number(selectedPlan.amount) : undefined,
      });
      const result = (response as any)?.data ?? response;
      setCouponResult(result);
      if (result.valid) {
        toast.success(`Coupon applied! +${formatTokens(result.bonusTokens)} bonus tokens`);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error('Failed to validate coupon');
    }
  };

  const handleRecharge = async () => {
    if (!selectedPlanId) return;
    try {
      const response = await initiateMut.mutateAsync({
        planId: selectedPlanId,
        couponCode: couponResult?.valid ? couponCode : undefined,
      });
      const preview = (response as any)?.data ?? response;

      // In production, this would redirect to payment gateway
      // For now, show the preview
      toast.success(
        `Recharge: ${formatTokens(preview.totalTokens)} tokens for ${formatCurrency(Number(preview.amount))}`,
      );
      onClose();
    } catch {
      toast.error('Failed to initiate recharge');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Recharge Wallet</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <Icon name="x" size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Recharge Plans */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
              Select a Plan
            </h3>
            {isLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-28 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {plans.map((plan: any) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedPlanId === plan.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg font-bold text-gray-900">
                      {formatCurrency(Number(plan.amount))}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {formatTokens(plan.tokens)} tokens
                    </div>
                    {plan.bonusTokens > 0 && (
                      <Badge variant="success" className="mt-2">
                        +{formatTokens(plan.bonusTokens)} bonus
                      </Badge>
                    )}
                    {plan.description && (
                      <p className="text-xs text-gray-400 mt-1">{plan.description}</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Coupon Code */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
              Have a Coupon?
            </h3>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  label="Coupon Code"
                  leftIcon={<Icon name="tag" size={16} />}
                  value={couponCode}
                  onChange={(v: string) => {
                    setCouponCode(v);
                    setCouponResult(null);
                  }}
                />
              </div>
              <Button
                variant="outline"
                onClick={handleApplyCoupon}
                disabled={!couponCode.trim() || couponMut.isPending}
                className="mt-1"
              >
                Apply
              </Button>
            </div>
            {couponResult && (
              <div className={`mt-2 text-sm ${couponResult.valid ? 'text-green-600' : 'text-red-500'}`}>
                {couponResult.message}
                {couponResult.valid && ` (+${formatTokens(couponResult.bonusTokens)} bonus tokens)`}
              </div>
            )}
          </div>

          {/* Summary */}
          {selectedPlan && (
            <Card className="p-4 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-medium">{formatCurrency(Number(selectedPlan.amount))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Base Tokens</span>
                  <span className="font-medium">{formatTokens(selectedPlan.tokens)}</span>
                </div>
                {selectedPlan.bonusTokens > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Bonus Tokens</span>
                    <span className="font-medium">+{formatTokens(selectedPlan.bonusTokens)}</span>
                  </div>
                )}
                {couponResult?.valid && couponResult.bonusTokens > 0 && (
                  <div className="flex justify-between text-purple-600">
                    <span>Coupon Bonus</span>
                    <span className="font-medium">+{formatTokens(couponResult.bonusTokens)}</span>
                  </div>
                )}
                <hr />
                <div className="flex justify-between text-base font-bold">
                  <span>Total Tokens</span>
                  <span>
                    {formatTokens(
                      selectedPlan.tokens +
                        selectedPlan.bonusTokens +
                        (couponResult?.valid ? couponResult.bonusTokens : 0),
                    )}
                  </span>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            onClick={handleRecharge}
            disabled={!selectedPlanId || initiateMut.isPending}
          >
            <Icon name="credit-card" size={16} className="mr-2" />
            {initiateMut.isPending ? 'Processing...' : 'Pay & Recharge'}
          </Button>
        </div>
      </div>
    </div>
  );
}
