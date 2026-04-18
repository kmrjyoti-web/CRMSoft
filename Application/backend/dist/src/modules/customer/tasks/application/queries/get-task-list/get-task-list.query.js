"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTaskListQuery = void 0;
class GetTaskListQuery {
    constructor(userId, roleLevel, tenantId, page = 1, limit = 20, status, priority, assignedToId, search, sortBy = 'createdAt', sortOrder = 'desc') {
        this.userId = userId;
        this.roleLevel = roleLevel;
        this.tenantId = tenantId;
        this.page = page;
        this.limit = limit;
        this.status = status;
        this.priority = priority;
        this.assignedToId = assignedToId;
        this.search = search;
        this.sortBy = sortBy;
        this.sortOrder = sortOrder;
    }
}
exports.GetTaskListQuery = GetTaskListQuery;
//# sourceMappingURL=get-task-list.query.js.map