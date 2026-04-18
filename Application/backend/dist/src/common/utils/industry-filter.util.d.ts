export declare function industryFilter(tenantIndustryCode?: string | null): {
    industryCode: null;
    OR?: undefined;
} | {
    OR: ({
        industryCode: null;
    } | {
        industryCode: string;
    })[];
    industryCode?: undefined;
};
export declare function vendorIndustryFilter(industryCode?: string | null): {
    industryCode?: undefined;
} | {
    industryCode: string;
};
