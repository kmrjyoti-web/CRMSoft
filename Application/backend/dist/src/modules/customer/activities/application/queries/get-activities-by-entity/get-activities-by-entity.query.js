"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetActivitiesByEntityQuery = void 0;
class GetActivitiesByEntityQuery {
    constructor(entityType, entityId, page = 1, limit = 20) {
        this.entityType = entityType;
        this.entityId = entityId;
        this.page = page;
        this.limit = limit;
    }
}
exports.GetActivitiesByEntityQuery = GetActivitiesByEntityQuery;
//# sourceMappingURL=get-activities-by-entity.query.js.map