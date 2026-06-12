export type CouponType = 'FIXED_TOKENS' | 'PERCENTAGE';

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  maxUses: number;
  usedCount: number;
  minRecharge?: number;
  expiresAt?: string;
  isActive: boolean;
  industryCode?: string | null;
}

export interface CouponCreateData {
  code: string;
  type: CouponType;
  value: number;
  maxUses?: number;
  minRecharge?: number;
  expiresAt?: string;
  industryCode?: string;
}
