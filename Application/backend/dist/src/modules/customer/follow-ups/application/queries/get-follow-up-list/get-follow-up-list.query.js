"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetFollowUpListQuery = void 0;
class GetFollowUpListQuery {
    constructor(page = 1, limit = 20, sortBy = 'dueDate', sortOrder = 'asc', search, priority, assignedToId, isOverdue, entityType, entityId) {
        this.page = page;
        this.limit = limit;
        this.sortBy = sortBy;
        this.sortOrder = sortOrder;
        this.search = search;
        this.priority = priority;
        this.assignedToId = assignedToId;
        this.isOverdue = isOverdue;
        this.entityType = entityType;
        this.entityId = entityId;
    }
}
exports.GetFollowUpListQuery = GetFollowUpListQuery;
//# sourceMappingURL=get-follow-up-list.query.js.map