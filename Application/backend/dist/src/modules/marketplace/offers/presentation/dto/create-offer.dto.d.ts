export declare enum OfferTypeEnum {
    ONE_TIME = "ONE_TIME",
    DAILY_RECURRING = "DAILY_RECURRING",
    WEEKLY_RECURRING = "WEEKLY_RECURRING",
    FIRST_N_ORDERS = "FIRST_N_ORDERS",
    LAUNCH = "LAUNCH",
    CUSTOM = "CUSTOM"
}
export declare enum DiscountTypeEnum {
    PERCENTAGE = "PERCENTAGE",
    FLAT_AMOUNT = "FLAT_AMOUNT",
    FREE_SHIPPING = "FREE_SHIPPING",
    BUY_X_GET_Y = "BUY_X_GET_Y",
    BUNDLE_PRICE = "BUNDLE_PRICE"
}
export declare class CreateOfferDto {
    title: string;
    description?: string;
    mediaUrls?: string[];
    offerType: OfferTypeEnum;
    discountType: DiscountTypeEnum;
    discountValue: number;
    linkedListingIds?: string[];
    linkedCategoryIds?: string[];
    primaryListingId?: string;
    conditions?: Record<string, unknown>;
    maxRedemptions?: number;
    autoCloseOnLimit?: boolean;
    resetTime?: string;
    publishAt?: string;
    expiresAt?: string;
}
