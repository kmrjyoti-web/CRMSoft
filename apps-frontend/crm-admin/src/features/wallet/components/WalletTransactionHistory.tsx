'use client';

import { useState } from 'react';
import { Icon, Badge, SelectInput } from '@/components/ui';
import { useTransactions } from '../hooks/useWallet';
import {
  formatTokens, TXN_TYPE_COLORS, TXN_TYPE_ICONS, TXN_TYPE_LABELS, timeAgo,
} from '../utils/wallet-helpers';
import type { WalletTxnType } from '../types/wallet.types';

interface Props {
  onClose: () => void;
}

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'CREDIT', label: 'Credit' },
  { value: 'DEBIT', label: 'Debit' },
  { value: 'REFUND', label: 'Refund' },
  { value: 'PROMO', label: 'Promo' },
  { value: 'ADJUSTMENT', label: 'Adjustment' },
];

export function WalletTransactionHistory({ onClose }: Props) {
  const [filterType, setFilterType] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useTransactions({
    type: filterType || undefined,
    page,
    limit: 20,
  });

  const txnData = data?.data;
  const transactions = Array.isArray(txnData) ? txnData : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <Icon name="x" size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Filter */}
        <div className="px-6 py-3 border-b bg-gray-50">
          <div className="w-48">
            <SelectInput
              options={TYPE_OPTIONS}
              value={filterType}
              onChange={(v) => { setFilterType(v as string); setPage(1); }}
              label="Filter by type"
            />
          </div>
        </div>

        {/* Transactions */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 bg-gray-100 rounded" />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {transactions.map((txn) => {
                const colorClass = TXN_TYPE_COLORS[txn.type as WalletTxnType] ?? 'text-gray-600 bg-gray-50';
                const iconName = TXN_TYPE_ICONS[txn.type as WalletTxnType] ?? 'hash';
                const label = TXN_TYPE_LABELS[txn.type as WalletTxnType] ?? txn.type;
                const isPositive = txn.tokens > 0;

                return (
                  <div key={txn.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                        <Icon name={iconName as any} size={14} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm text-gray-700 truncate">{txn.description}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant={isPositive ? 'success' : 'danger'} className="text-[10px]">
                            {label}
                          </Badge>
                          {txn.serviceKey && (
                            <span className="text-[10px] text-gray-400">{txn.serviceKey}</span>
                          )}
                          <span className="text-[10px] text-gray-400">{timeAgo(txn.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                      <div className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? '+' : ''}{formatTokens(txn.tokens)}
                      </div>
                      <div className="text-xs text-gray-400 w-16 text-right">
                        bal: {formatTokens(txn.balanceAfter)}
                      </div>
                    </div>
                  </div>
                );
              })}
              {transactions.length === 0 && (
                <p className="text-sm text-gray-400 py-8 text-center">No transactions found</p>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-3 border-t bg-gray-50">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="text-sm text-blue-600 disabled:text-gray-300"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">Page {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={transactions.length < 20}
            className="text-sm text-blue-600 disabled:text-gray-300"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
