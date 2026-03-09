import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletService } from '../services/wallet.service';
import type { TransactionQueryParams } from '../types/wallet.types';

const KEY = 'wallet';

export function useWalletBalance() {
  return useQuery({
    queryKey: [KEY, 'balance'],
    queryFn: () => walletService.getBalance(),
  });
}

export function useTransactions(params?: TransactionQueryParams) {
  return useQuery({
    queryKey: [KEY, 'transactions', params],
    queryFn: () => walletService.getTransactions(params),
  });
}

export function useRechargePlans() {
  return useQuery({
    queryKey: [KEY, 'recharge-plans'],
    queryFn: () => walletService.getRechargePlans(),
  });
}

export function useInitiateRecharge() {
  return useMutation({
    mutationFn: ({ planId, couponCode }: { planId: string; couponCode?: string }) =>
      walletService.initiateRecharge(planId, couponCode),
  });
}

export function useCompleteRecharge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, paymentId, couponCode }: { planId: string; paymentId: string; couponCode?: string }) =>
      walletService.completeRecharge(planId, paymentId, couponCode),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
    },
  });
}

export function useApplyCoupon() {
  return useMutation({
    mutationFn: ({ code, rechargeAmount }: { code: string; rechargeAmount?: number }) =>
      walletService.applyCoupon(code, rechargeAmount),
  });
}

export function useEstimateCost() {
  return useMutation({
    mutationFn: (serviceKey: string) => walletService.estimateCost(serviceKey),
  });
}
