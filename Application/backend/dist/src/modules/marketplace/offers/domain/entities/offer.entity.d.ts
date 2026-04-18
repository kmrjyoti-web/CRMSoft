import { OfferConditionsVO } from '../value-objects/offer-conditions.vo';
export type OfferType = 'ONE_TIME' | 'DAILY_RECURRING' | 'WEEKLY_RECURRING' | 'FIRST_N_ORDERS' | 'LAUNCH' | 'CUSTOM';
export type DiscountType = 'PERCENTAGE' | 'FLAT_AMOUNT' | 'FREE_SHIPPING' | 'BUY_X_GET_Y' | 'BUNDLE_PRICE';
export type OfferStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'EXPIRED' | 'CLOSED' | 'ARCHIVED';
export interface EligibilityParams {
    userId?: string;
    city?: string;
    state?: string;
    pincode?: string;
    grade?: string;
    groupId?: string;
    isVerified?: boolean;
    orderValue?: number;
    quantity?: number;
    productId?: string;
    categoryId?: string;
    userRedemptionCount?: number;
}
export interface EligibilityResult {
    eligible: boolean;
    reason?: string;
}
export interface OfferProps {
    id: string;
    tenantId: string;
    authorId: string;
    title: string;
    description?: string;
    mediaUrls?: string[];
    offerType: OfferType;
    discountType: DiscountType;
    discountValue: number;
    linkedListingIds?: string[];
    linkedCategoryIds?: string[];
    primaryListingId?: string;
    conditions?: Record<string, unknown>;
    maxRedemptions?: number;
    currentRedemptions?: number;
    autoCloseOnLimit?: boolean;
    resetTime?: string;
    lastResetAt?: Date;
    status?: OfferStatus;
    publishAt?: Date;
    expiresAt?: Date;
    publishedAt?: Date;
    closedAt?: Date;
    closedReason?: string;
    createdById: string;
}
export declare class OfferEntity {
    readonly id: string;
    readonly tenantId: string;
    readonly authorId: string;
    title: string;
    description?: string;
    mediaUrls?: string[];
    readonly offerType: OfferType;
    readonly discountType: DiscountType;
    discountValue: number;
    linkedListingIds: string[];
    linkedCategoryIds: string[];
    primaryListingId?: string;
    conditions: OfferConditionsVO;
    maxRedemptions?: number;
    currentRedemptions: number;
    autoCloseOnLimit: boolean;
    resetTime?: string;
    lastResetAt?: Date;
    status: OfferStatus;
    publishAt?: Date;
    expiresAt?: Date;
    publishedAt?: Date;
    closedAt?: Date;
    closedReason?: string;
    readonly createdById: string;
    createdAt: Date;
    updatedAt: Date;
    private constructor();
    static create(props: OfferProps): OfferEntity;
    static fromPrisma(raw: any): OfferEntity;
    isActiveNow(): boolean;
    isEligible(params: EligibilityParams): EligibilityResult;
    redeem(userId: string, orderInfo?: {
        orderValue?: number;
        quantity?: number;
    }): void;
    resetCounter(): void;
    close(reason: string): void;
    activate(): void;
    calculateDiscount(orderValue: number, quantity?: number): number;
}
