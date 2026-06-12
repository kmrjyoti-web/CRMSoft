'use client';

import { useQuery } from '@tanstack/react-query';
import { walletApi } from '@/lib/api/wallet';
import type { WalletFilters } from '@/types/wallet';

export function useWalletBalance() {
  return useQuery({
    queryKey: ['wallet', 'balance'],
    queryFn: () => walletApi.getBalance(),
  });
}

export function useWalletTransactions(filters?: WalletFilters) {
  return useQuery({
    queryKey: ['wallet', 'transactions', filters],
    queryFn: () => walletApi.getTransactions(filters),
  });
}
