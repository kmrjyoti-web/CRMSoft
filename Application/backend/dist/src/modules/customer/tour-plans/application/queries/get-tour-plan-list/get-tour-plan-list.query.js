"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTourPlanListQuery = void 0;
class GetTourPlanListQuery {
    constructor(page = 1, limit = 20, sortBy = 'planDate', sortOrder = 'desc', search, status, salesPersonId, fromDate, toDate) {
        this.page = page;
        this.limit = limit;
        this.sortBy = sortBy;
        this.sortOrder = sortOrder;
        this.search = search;
        this.status = status;
        this.salesPersonId = salesPersonId;
        this.fromDate = fromDate;
        this.toDate = toDate;
    }
}
exports.GetTourPlanListQuery = GetTourPlanListQuery;
//# sourceMappingURL=get-tour-plan-list.query.js.map