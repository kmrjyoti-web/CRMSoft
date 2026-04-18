"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListTargetsQuery = void 0;
class ListTargetsQuery {
    constructor(page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', userId, period, metric, isActive) {
        this.page = page;
        this.limit = limit;
        this.sortBy = sortBy;
        this.sortOrder = sortOrder;
        this.userId = userId;
        this.period = period;
        this.metric = metric;
        this.isActive = isActive;
    }
}
exports.ListTargetsQuery = ListTargetsQuery;
//# sourceMappingURL=list-targets.query.js.map