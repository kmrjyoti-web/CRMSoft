export type WalletTxnType = 'CREDIT' | 'DEBIT' | 'REFUND' | 'PROMO' | 'ADJUSTMENT' | 'EXPIRY';
export type WalletTxnStatus = 'WTX_PENDING' | 'WTX_COMPLETED' | 'WTX_FAILED' | 'WTX_REVERSED';
export type CouponType = 'FIXED_TOKENS' | 'PERCENTAGE';

export interface WalletBalance {
  id: string;
  balance: number;
  promoBalance: number;
  totalAvailable: number;
  lifetimeCredit: number;
  lifetimeDebit: number;
  currency: string;
  tokenRate: number;
  isActive: boolean;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  tenantId: string;
  type: WalletTxnType;
  status: WalletTxnStatus;
  tokens: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  referenceType?: string;
  referenceId?: string;
  serviceKey?: string;
  metadata?: Record<string, unknown>;
  createdById?: string;
  createdAt: string;
}

export interface RechargePlanItem {
  id: string;
  name: string;
  amount: number;
  tokens: number;
  bonusTokens: number;
  isActive: boolean;
  sortOrder: number;
  description?: string;
}

export interface CouponItem {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  maxUses: number;
  usedCount: number;
  minRecharge?: number;
  expiresAt?: string;
  isActive: boolean;
}

export interface ServiceRateItem {
  id: string;
  serviceKey: string;
  displayName: string;
  category: string;
  baseTokens: number;
  marginPct: number;
  finalTokens: number;
  description?: string;
  isActive: boolean;
}

export interface CostEstimate {
  serviceKey: string;
  displayName: string;
  category: string;
  baseTokens: number;
  marginPct: number;
  finalTokens: number;
  currentBalance: number;
  balanceAfter: number;
  sufficient: boolean;
}

export interface CouponValidation {
  valid: boolean;
  bonusTokens: number;
  message: string;
  couponId?: string;
}

export interface RechargePreview {
  planId: string;
  planName: string;
  amount: number;
  baseTokens: number;
  bonusTokens: number;
  couponBonus: number;
  totalTokens: number;
  coupon?: CouponValidation;
}

export interface TransactionQueryParams {
  type?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface RechargePlanCreateData {
  name: string;
  amount: number;
  tokens: number;
  bonusTokens?: number;
  description?: string;
  sortOrder?: number;
}

export interface CouponCreateData {
  code: string;
  type: CouponType;
  value: number;
  maxUses?: number;
  minRecharge?: number;
  expiresAt?: string;
}

export interface ServiceRateCreateData {
  serviceKey: string;
  displayName: string;
  category: string;
  baseTokens: number;
  marginPct?: number;
  description?: string;
}

export interface SpendByCategory {
  category: string;
  tokens: number;
}

export interface TopService {
  serviceKey: string;
  tokens: number;
  count: number;
}

export interface DailyTrend {
  date: string;
  tokens: number;
}

export interface RevenueSummary {
  totalRecharged: number;
  totalSpent: number;
  activeWallets: number;
  totalWallets: number;
  periodDays: number;
}
