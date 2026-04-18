"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.industryFilter = industryFilter;
exports.vendorIndustryFilter = vendorIndustryFilter;
function industryFilter(tenantIndustryCode) {
    if (!tenantIndustryCode) {
        return { industryCode: null };
    }
    return {
        OR: [
            { industryCode: null },
            { industryCode: tenantIndustryCode },
        ],
    };
}
function vendorIndustryFilter(industryCode) {
    if (!industryCode) {
        return {};
    }
    return { industryCode };
}
//# sourceMappingURL=industry-filter.util.js.map