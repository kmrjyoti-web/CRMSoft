"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetEntityTimelineQuery = void 0;
class GetEntityTimelineQuery {
    constructor(entityType, entityId, page, limit, action, dateFrom, dateTo) {
        this.entityType = entityType;
        this.entityId = entityId;
        this.page = page;
        this.limit = limit;
        this.action = action;
        this.dateFrom = dateFrom;
        this.dateTo = dateTo;
    }
}
exports.GetEntityTimelineQuery = GetEntityTimelineQuery;
//# sourceMappingURL=get-entity-timeline.query.js.map