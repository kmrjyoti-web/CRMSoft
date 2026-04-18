"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetEligibleEntitiesQuery = void 0;
class GetEligibleEntitiesQuery {
    constructor(tenantId, entityType, search, page = 1, limit = 20) {
        this.tenantId = tenantId;
        this.entityType = entityType;
        this.search = search;
        this.page = page;
        this.limit = limit;
    }
}
exports.GetEligibleEntitiesQuery = GetEligibleEntitiesQuery;
//# sourceMappingURL=get-eligible-entities.query.js.map