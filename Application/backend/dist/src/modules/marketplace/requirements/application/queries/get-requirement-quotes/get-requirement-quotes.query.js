"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRequirementQuotesQuery = void 0;
class GetRequirementQuotesQuery {
    constructor(requirementId, tenantId, page = 1, limit = 20) {
        this.requirementId = requirementId;
        this.tenantId = tenantId;
        this.page = page;
        this.limit = limit;
    }
}
exports.GetRequirementQuotesQuery = GetRequirementQuotesQuery;
//# sourceMappingURL=get-requirement-quotes.query.js.map