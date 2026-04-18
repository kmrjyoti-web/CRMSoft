export declare class ValidateCouponDto {
    couponCode: string;
    packageCode?: string;
    amount?: number;
}
export declare class RedeemCouponDto {
    couponCode: string;
    discountApplied: number;
}
export declare class CreateCouponDto {
    code: string;
    type: 'FIXED_TOKENS' | 'PERCENTAGE';
    value: number;
    maxUses?: number;
    minRecharge?: number;
    expiresAt?: string;
    isActive?: boolean;
    description?: string;
    discountType?: 'PERCENT' | 'FLAT_INR';
    discountValue?: number;
    maxDiscountInr?: number;
    applicablePackages?: string[];
    applicableTypes?: string[];
    validFrom?: string;
    validUntil?: string;
    perUserLimit?: number;
    firstTimeOnly?: boolean;
    packageId?: string;
}
export declare class UpdateCouponDto {
    code?: string;
    type?: 'FIXED_TOKENS' | 'PERCENTAGE';
    value?: number;
    maxUses?: number;
    minRecharge?: number;
    expiresAt?: string;
    isActive?: boolean;
    description?: string;
    discountType?: 'PERCENT' | 'FLAT_INR';
    discountValue?: number;
    maxDiscountInr?: number;
    applicablePackages?: string[];
    applicableTypes?: string[];
    validFrom?: string;
    validUntil?: string;
    perUserLimit?: number;
    firstTimeOnly?: boolean;
    packageId?: string;
}
export declare class CouponListQueryDto {
    page?: number;
    limit?: number;
    isActive?: boolean;
    search?: string;
}
