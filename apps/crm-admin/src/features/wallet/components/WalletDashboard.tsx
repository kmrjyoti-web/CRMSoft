'use client';

import { useState } from 'react';
import { Icon, Card, Button, Badge } from '@/components/ui';
import { useWalletBalance, useTransactions } from '../hooks/useWallet';
import {
  formatTokens, tokensToAmount, TXN_TYPE_COLORS, TXN_TYPE_ICONS, TXN_TYPE_LABELS, timeAgo,
} from '../utils/wallet-helpers';
import { RechargeFlow } from './RechargeFlow';
import { WalletTransactionHistory } from './WalletTransactionHistory';
import type { WalletTxnType } from '../types/wallet.types';

export function WalletDashboard() {
  const [showRecharge, setShowRecharge] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const { data: walletResponse, isLoading } = useWalletBalance();
  const { data: recentTxnsResponse } = useTransactions({ limit: 5 });
  const wallet = walletResponse?.data;
  const recentTxns = recentTxnsResponse?.data;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-gray-100 rounded-lg" />)}
          </div>
          <div className="h-60 bg-gray-100 rounded-lg" />
        </div>
      </div>
    );
  }

  const balance = wallet?.balance ?? 0;
  const promoBalance = wallet?.promoBalance ?? 0;
  const tokenRate = wallet?.tokenRate ?? 100;

  // Calculate this month's spend
  const transactions = Array.isArray(recentTxns) ? recentTxns : [];
  const thisMonthSpend = transactions
    .filter((t) => t.type === 'DEBIT')
    .reduce((sum, t) => sum + Math.abs(t.tokens), 0);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your token balance and transactions</p>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Icon name="wallet" size={20} className="text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Balance</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{formatTokens(balance)}</div>
          <div className="text-sm text-gray-400 mt-1">tokens ({tokensToAmount(balance, tokenRate)})</div>
          <Button
            variant="primary"
            className="w-full mt-4"
            onClick={() => setShowRecharge(true)}
          >
            <Icon name="plus" size={16} className="mr-2" />
            Recharge
          </Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Icon name="tag" size={20} className="text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Promo Balance</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{formatTokens(promoBalance)}</div>
          <div className="text-sm text-gray-400 mt-1">tokens ({tokensToAmount(promoBalance, tokenRate)})</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Icon name="bar-chart-2" size={20} className="text-amber-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Recent Spend</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{formatTokens(thisMonthSpend)}</div>
          <div className="text-sm text-gray-400 mt-1">tokens ({tokensToAmount(thisMonthSpend, tokenRate)})</div>
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => setShowHistory(true)}
          >
            View Details
          </Button>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
            Recent Transactions
          </h3>
          <button
            onClick={() => setShowHistory(true)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All
          </button>
        </div>
        <div className="divide-y divide-gray-100">
          {transactions.map((txn) => {
            const colorClass = TXN_TYPE_COLORS[txn.type as WalletTxnType] ?? 'text-gray-600 bg-gray-50';
            const iconName = TXN_TYPE_ICONS[txn.type as WalletTxnType] ?? 'hash';
            const isPositive = txn.tokens > 0;

            return (
              <div key={txn.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorClass}`}>
                    <Icon name={iconName as any} size={14} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-700">{txn.description}</div>
                    <div className="text-xs text-gray-400">{timeAgo(txn.createdAt)}</div>
                  </div>
                </div>
                <div className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? '+' : ''}{formatTokens(txn.tokens)} tokens
                </div>
              </div>
            );
          })}
          {transactions.length === 0 && (
            <p className="text-sm text-gray-400 py-6 text-center">No transactions yet</p>
          )}
        </div>
      </Card>

      {/* Recharge Modal */}
      {showRecharge && <RechargeFlow onClose={() => setShowRecharge(false)} />}

      {/* Full History Modal */}
      {showHistory && <WalletTransactionHistory onClose={() => setShowHistory(false)} />}
    </div>
  );
}
