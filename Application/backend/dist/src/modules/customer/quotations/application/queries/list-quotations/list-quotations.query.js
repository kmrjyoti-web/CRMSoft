"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListQuotationsQuery = void 0;
class ListQuotationsQuery {
    constructor(page, limit, sortBy, sortOrder, search, status, leadId, userId, dateFrom, dateTo) {
        this.page = page;
        this.limit = limit;
        this.sortBy = sortBy;
        this.sortOrder = sortOrder;
        this.search = search;
        this.status = status;
        this.leadId = leadId;
        this.userId = userId;
        this.dateFrom = dateFrom;
        this.dateTo = dateTo;
    }
}
exports.ListQuotationsQuery = ListQuotationsQuery;
//# sourceMappingURL=list-quotations.query.js.map