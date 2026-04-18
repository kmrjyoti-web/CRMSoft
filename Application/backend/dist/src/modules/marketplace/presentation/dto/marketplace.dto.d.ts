export declare class RegisterVendorDto {
    companyName: string;
    contactEmail: string;
    gstNumber?: string;
    revenueSharePct?: number;
}
export declare class ListVendorsQueryDto {
    page?: string;
    limit?: string;
    status?: string;
    search?: string;
}
export declare class CreateModuleDto {
    moduleCode: string;
    moduleName: string;
    category: string;
    shortDescription: string;
    longDescription: string;
    screenshots?: string[];
    demoVideoUrl?: string;
    documentationUrl?: string;
    version?: string;
    pricingPlans?: Record<string, unknown>[];
    usageLimits?: Record<string, any>;
    targetTypes?: string[];
    launchOfferDays?: number;
}
export declare class UpdateModuleDto {
    moduleName?: string;
    category?: string;
    shortDescription?: string;
    longDescription?: string;
    screenshots?: string[];
    demoVideoUrl?: string;
    documentationUrl?: string;
    version?: string;
    changelog?: Record<string, unknown>[];
    pricingPlans?: Record<string, unknown>[];
    usageLimits?: Record<string, any>;
    targetTypes?: string[];
    launchOfferDays?: number;
}
export declare class ListModulesQueryDto {
    page?: string;
    limit?: string;
    category?: string;
    search?: string;
    businessType?: string;
}
export declare class CreateReviewDto {
    rating: number;
    title?: string;
    comment?: string;
}
export declare class ListReviewsQueryDto {
    page?: string;
    limit?: string;
}
export declare class ActivateModuleDto {
    subscriptionId?: string;
    planId?: string;
}
