"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetLeadsListQuery = void 0;
class GetLeadsListQuery {
    constructor(page, limit, sortBy, sortOrder, search, isActive, status, priority, allocatedToId, contactId, organizationId) {
        this.page = page;
        this.limit = limit;
        this.sortBy = sortBy;
        this.sortOrder = sortOrder;
        this.search = search;
        this.isActive = isActive;
        this.status = status;
        this.priority = priority;
        this.allocatedToId = allocatedToId;
        this.contactId = contactId;
        this.organizationId = organizationId;
    }
}
exports.GetLeadsListQuery = GetLeadsListQuery;
//# sourceMappingURL=get-leads-list.query.js.map