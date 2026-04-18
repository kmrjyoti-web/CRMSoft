export declare class CreateSubscriptionPackageDto {
    packageCode: string;
    packageName: string;
    tagline?: string;
    applicableTypes?: Record<string, unknown>;
    includedModules?: Record<string, unknown>;
    limits?: Record<string, unknown>;
    priceMonthlyInr: number;
    priceYearlyInr: number;
    yearlyDiscountPct?: number;
    trialDays?: number;
    featureFlags?: Record<string, unknown>;
    planLevel: number;
    isActive?: boolean;
    isFeatured?: boolean;
    sortOrder?: number;
}
export declare class UpdateSubscriptionPackageDto {
    packageName?: string;
    tagline?: string;
    applicableTypes?: Record<string, unknown>;
    includedModules?: Record<string, unknown>;
    limits?: Record<string, unknown>;
    priceMonthlyInr?: number;
    priceYearlyInr?: number;
    yearlyDiscountPct?: number;
    trialDays?: number;
    featureFlags?: Record<string, unknown>;
    planLevel?: number;
    isActive?: boolean;
    isFeatured?: boolean;
    sortOrder?: number;
}
export declare class ListPackagesQueryDto {
    activeOnly?: boolean;
}
