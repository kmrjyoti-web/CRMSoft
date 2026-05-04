'use client';

import { Icon, Button, Card } from '@/components/ui';
import { formatTokens, tokensToAmount } from '../utils/wallet-helpers';
import type { CostEstimate } from '../types/wallet.types';

interface CostEstimateDialogProps {
  estimate: CostEstimate;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function CostEstimateDialog({
  estimate,
  onConfirm,
  onCancel,
  isLoading,
}: CostEstimateDialogProps) {
  const insufficient = !estimate.sufficient;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full mx-4">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Icon name="zap" size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Confirm AI Action</h3>
              <p className="text-xs text-gray-400">Token cost estimation</p>
            </div>
          </div>

          <Card className="p-4 bg-gray-50 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Service</span>
              <span className="font-medium text-gray-900">{estimate.displayName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Category</span>
              <span className="text-gray-600">{estimate.category}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Estimated Cost</span>
              <span className="font-bold text-blue-600">
                {formatTokens(estimate.finalTokens)} tokens
                <span className="text-xs text-gray-400 ml-1">
                  ({tokensToAmount(estimate.finalTokens)})
                </span>
              </span>
            </div>
            <hr />
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Current Balance</span>
              <span className="font-medium">{formatTokens(estimate.currentBalance)} tokens</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">After</span>
              <span className={`font-medium ${insufficient ? 'text-red-600' : 'text-green-600'}`}>
                {formatTokens(estimate.balanceAfter)} tokens
              </span>
            </div>
          </Card>

          {insufficient && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 text-sm text-red-600">
                <Icon name="alert-circle" size={14} />
                <span>Insufficient balance. Please recharge your wallet.</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            disabled={insufficient || isLoading}
          >
            <Icon name="zap" size={16} className="mr-2" />
            {isLoading ? 'Processing...' : 'Proceed'}
          </Button>
        </div>
      </div>
    </div>
  );
}
