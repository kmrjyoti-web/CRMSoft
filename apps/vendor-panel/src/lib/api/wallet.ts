import apiClient from './client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { WalletBalance, WalletTransaction, WalletFilters } from '@/types/wallet';

export const walletApi = {
  getBalance: () =>
    apiClient.get<ApiResponse<WalletBalance>>('/vendor/wallet').then((r) => r.data),

  getTransactions: (filters?: WalletFilters) =>
    apiClient.get<ApiResponse<PaginatedResponse<WalletTransaction>>>('/vendor/wallet/transactions', { params: filters }).then((r) => r.data),
};
