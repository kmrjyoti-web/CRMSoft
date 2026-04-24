import { api } from '@/services/api-client';
import type { ApiResponse } from '@/types/api-response';
import type {
  WalletBalance,
  WalletTransaction,
  RechargePlanItem,
  CouponValidation,
  RechargePreview,
  CostEstimate,
  TransactionQueryParams,
} from '../types/wallet.types';

const BASE_URL = '/api/v1/wallet';

export const walletService = {
  getBalance: () =>
    api.get<ApiResponse<WalletBalance>>(BASE_URL).then((r) => r.data),

  getTransactions: (params?: TransactionQueryParams) =>
    api.get<ApiResponse<WalletTransaction[]>>(`${BASE_URL}/transactions`, { params }).then((r) => r.data),

  getRechargePlans: () =>
    api.get<ApiResponse<RechargePlanItem[]>>(`${BASE_URL}/recharge-plans`).then((r) => r.data),

  initiateRecharge: (planId: string, couponCode?: string) =>
    api.post<ApiResponse<RechargePreview>>(`${BASE_URL}/recharge`, { planId, couponCode }).then((r) => r.data),

  completeRecharge: (planId: string, paymentId: string, couponCode?: string) =>
    api.post<ApiResponse<{ transaction: WalletTransaction; newBalance: number }>>(
      `${BASE_URL}/recharge/verify`,
      { planId, paymentId, couponCode },
    ).then((r) => r.data),

  applyCoupon: (code: string, rechargeAmount?: number) =>
    api.post<ApiResponse<CouponValidation>>(`${BASE_URL}/apply-coupon`, { code, rechargeAmount }).then((r) => r.data),

  estimateCost: (serviceKey: string) =>
    api.post<ApiResponse<CostEstimate>>(`${BASE_URL}/estimate`, { serviceKey }).then((r) => r.data),
};
