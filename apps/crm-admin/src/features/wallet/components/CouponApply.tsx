'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Icon, Input, Button, Card, Badge } from '@/components/ui';
import { useApplyCoupon } from '../hooks/useWallet';
import { formatTokens } from '../utils/wallet-helpers';

export function CouponApply() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<{ valid: boolean; bonusTokens: number; message: string } | null>(null);

  const couponMut = useApplyCoupon();

  const handleValidate = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    try {
      const response = await couponMut.mutateAsync({ code: trimmed });
      const res = (response as any)?.data ?? response;
      setResult(res);
      if (res.valid) {
        toast.success(`Coupon valid! +${formatTokens(res.bonusTokens)} bonus tokens`);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error('Failed to validate coupon');
    }
  };

  const handleClear = () => {
    setCode('');
    setResult(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Apply Coupon</h1>
        <p className="text-sm text-gray-500 mt-1">
          Validate a coupon code to earn bonus wallet tokens during recharge
        </p>
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              label="Coupon Code"
              leftIcon={<Icon name="tag" size={16} />}
              value={code}
              onChange={(v: string) => {
                setCode(v.toUpperCase());
                setResult(null);
              }}
              placeholder="e.g. WELCOME50"
            />
          </div>
          <div className="flex items-end gap-2">
            <Button
              variant="primary"
              onClick={handleValidate}
              disabled={!code.trim() || couponMut.isPending}
              loading={couponMut.isPending}
            >
              Validate
            </Button>
            {code && (
              <Button variant="outline" onClick={handleClear}>
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Result */}
        {result && (
          <div
            className={`rounded-lg p-4 flex items-start gap-3 ${
              result.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}
          >
            <Icon
              name={result.valid ? 'check-circle' : 'x-circle'}
              size={20}
              className={result.valid ? 'text-green-600 mt-0.5' : 'text-red-500 mt-0.5'}
            />
            <div className="flex-1">
              <p className={`text-sm font-medium ${result.valid ? 'text-green-800' : 'text-red-700'}`}>
                {result.message}
              </p>
              {result.valid && result.bonusTokens > 0 && (
                <p className="text-sm text-green-700 mt-1">
                  You will receive <strong>{formatTokens(result.bonusTokens)} bonus tokens</strong> when you
                  use this code during wallet recharge.
                </p>
              )}
            </div>
            {result.valid && (
              <Badge variant="success">{formatTokens(result.bonusTokens)} tokens</Badge>
            )}
          </div>
        )}
      </Card>

      {/* CTA — go to wallet to redeem */}
      {result?.valid && (
        <Card className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-800">Ready to recharge?</p>
            <p className="text-sm text-gray-500 mt-0.5">
              Use coupon <strong>{code}</strong> during wallet recharge to claim your bonus tokens.
            </p>
          </div>
          <Link href="/settings/wallet">
            <Button variant="primary">
              <Icon name="wallet" size={16} />
              Go to Wallet
            </Button>
          </Link>
        </Card>
      )}

      {/* Info box */}
      <Card className="p-5 bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <Icon name="info" size={18} className="text-blue-500 mt-0.5 shrink-0" />
          <div className="text-sm text-blue-700 space-y-1">
            <p className="font-medium">How coupons work</p>
            <ul className="list-disc list-inside space-y-0.5 text-blue-600">
              <li>Validate your coupon code here first</li>
              <li>Go to <strong>Settings → Wallet</strong> and click <strong>Recharge</strong></li>
              <li>Select a plan, enter the coupon code, and click <strong>Apply</strong></li>
              <li>Bonus tokens are added automatically to your wallet</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
