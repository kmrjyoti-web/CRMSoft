'use client';

import { useState } from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/empty-state';
import { useWalletBalance, useWalletTransactions } from '@/hooks/use-wallet';
import { formatCurrency, formatDateTime, extractList } from '@/lib/utils';
import { TRANSACTION_TYPES } from '@/lib/constants';
import type { WalletTransaction, WalletFilters } from '@/types/wallet';

export default function WalletPage() {
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);

  const filters: WalletFilters = {
    type: typeFilter ? (typeFilter as WalletFilters['type']) : undefined,
    page,
    limit: 20,
  };

  const { data: balanceRes, isLoading: balanceLoading } = useWalletBalance();
  const { data: txnRes, isLoading: txnLoading } = useWalletTransactions(filters);

  const balance = balanceRes?.data;
  const transactions = extractList<WalletTransaction>(txnRes);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
        <p className="text-sm text-gray-500">Your wallet balance and transaction history</p>
      </div>

      {/* Balance Card */}
      {balanceLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium text-gray-600">Available Balance</span>
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-4">
              <span className="text-2xl">&#8377;</span> {formatCurrency(balance?.balance ?? 0)}
            </p>
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <ArrowDownRight className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-gray-500">Pending Credits</p>
                  <p className="font-semibold text-green-600">{formatCurrency(balance?.pendingCredits ?? 0)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                  <ArrowUpRight className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="text-gray-500">Pending Debits</p>
                  <p className="font-semibold text-red-600">{formatCurrency(balance?.pendingDebits ?? 0)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select
          options={[{ value: '', label: 'All Types' }, ...TRANSACTION_TYPES.map((t) => ({ value: t.value, label: t.label }))]}
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="w-48"
        />
      </div>

      {/* Transaction History Table */}
      {txnLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : transactions.length === 0 ? (
        <EmptyState icon={Wallet} title="No transactions" description="Your wallet transaction history will appear here" />
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Date</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Description</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Type</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Amount</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Balance After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((txn) => {
                const isCredit = txn.type === 'CREDIT';
                return (
                  <tr key={txn.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDateTime(txn.createdAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{txn.description ?? '-'}</td>
                    <td className="px-4 py-3">
                      {isCredit ? (
                        <Badge variant="success" className="text-xs">
                          <ArrowDownRight className="h-3 w-3 mr-1" />Credit
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-xs">
                          <ArrowUpRight className="h-3 w-3 mr-1" />Debit
                        </Badge>
                      )}
                    </td>
                    <td className={`px-4 py-3 text-sm font-semibold text-right ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                      {isCredit ? '+' : '-'}{formatCurrency(txn.amount ?? 0)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600">{formatCurrency(txn.balanceAfter ?? 0)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Previous</Button>
        <span className="text-sm text-gray-500">Page {page}</span>
        <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={transactions.length < 20}>Next</Button>
      </div>
    </div>
  );
}
