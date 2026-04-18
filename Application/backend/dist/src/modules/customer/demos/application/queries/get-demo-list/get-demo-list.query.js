"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetDemoListQuery = void 0;
class GetDemoListQuery {
    constructor(page = 1, limit = 20, sortBy = 'scheduledAt', sortOrder = 'desc', search, status, mode, conductedById, fromDate, toDate) {
        this.page = page;
        this.limit = limit;
        this.sortBy = sortBy;
        this.sortOrder = sortOrder;
        this.search = search;
        this.status = status;
        this.mode = mode;
        this.conductedById = conductedById;
        this.fromDate = fromDate;
        this.toDate = toDate;
    }
}
exports.GetDemoListQuery = GetDemoListQuery;
//# sourceMappingURL=get-demo-list.query.js.map