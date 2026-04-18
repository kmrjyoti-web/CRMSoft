"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetActivityListQuery = void 0;
class GetActivityListQuery {
    constructor(page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', search, isActive, type, leadId, contactId, createdById, fromDate, toDate) {
        this.page = page;
        this.limit = limit;
        this.sortBy = sortBy;
        this.sortOrder = sortOrder;
        this.search = search;
        this.isActive = isActive;
        this.type = type;
        this.leadId = leadId;
        this.contactId = contactId;
        this.createdById = createdById;
        this.fromDate = fromDate;
        this.toDate = toDate;
    }
}
exports.GetActivityListQuery = GetActivityListQuery;
//# sourceMappingURL=get-activity-list.query.js.map