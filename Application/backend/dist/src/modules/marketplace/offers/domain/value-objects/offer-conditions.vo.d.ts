export interface GeoCondition {
    allowedStates?: string[];
    allowedCities?: string[];
    allowedPincodes?: string[];
    blockedStates?: string[];
    blockedCities?: string[];
}
export interface CustomerGroupCondition {
    allowedGrades?: string[];
    allowedGroupIds?: string[];
    requiresVerification?: boolean;
}
export interface OrderBasedCondition {
    minOrderValue?: number;
    maxOrderValue?: number;
    minQuantity?: number;
    maxQuantity?: number;
    productIds?: string[];
    categoryIds?: string[];
}
export interface TimeWindowCondition {
    cron?: string;
    startTime?: string;
    endTime?: string;
    activeDays?: number[];
    timezone?: string;
}
export interface OfferConditions {
    geo?: GeoCondition;
    customerGroup?: CustomerGroupCondition;
    orderBased?: OrderBasedCondition;
    timeWindow?: TimeWindowCondition;
    maxPerUser?: number;
    requiresLogin?: boolean;
    customRules?: Record<string, any>;
}
export declare class OfferConditionsVO {
    readonly geo?: GeoCondition;
    readonly customerGroup?: CustomerGroupCondition;
    readonly orderBased?: OrderBasedCondition;
    readonly timeWindow?: TimeWindowCondition;
    readonly maxPerUser?: number;
    readonly requiresLogin?: boolean;
    readonly customRules?: Record<string, any>;
    constructor(raw: OfferConditions);
    static fromJson(json: Record<string, unknown>): OfferConditionsVO;
    isWithinTimeWindow(): boolean;
    isGeoAllowed(params: {
        city?: string;
        state?: string;
        pincode?: string;
    }): boolean;
    isCustomerGroupAllowed(params: {
        grade?: string;
        groupId?: string;
        isVerified?: boolean;
    }): boolean;
    isOrderEligible(params: {
        orderValue?: number;
        quantity?: number;
        productId?: string;
        categoryId?: string;
    }): boolean;
}
