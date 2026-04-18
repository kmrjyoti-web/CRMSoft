export declare class CreateCouponDto {
    code: string;
    type: 'FIXED_TOKENS' | 'PERCENTAGE';
    value: number;
    maxUses?: number;
    minRecharge?: number;
    expiresAt?: string;
}
export declare class UpdateCouponDto {
    code?: string;
    type?: 'FIXED_TOKENS' | 'PERCENTAGE';
    value?: number;
    maxUses?: number;
    minRecharge?: number;
    expiresAt?: string;
    isActive?: boolean;
}
