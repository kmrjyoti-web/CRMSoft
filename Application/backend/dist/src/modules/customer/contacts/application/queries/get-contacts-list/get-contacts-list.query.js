"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetContactsListQuery = void 0;
class GetContactsListQuery {
    constructor(page, limit, sortBy, sortOrder, search, isActive, designation, department, organizationId) {
        this.page = page;
        this.limit = limit;
        this.sortBy = sortBy;
        this.sortOrder = sortOrder;
        this.search = search;
        this.isActive = isActive;
        this.designation = designation;
        this.department = department;
        this.organizationId = organizationId;
    }
}
exports.GetContactsListQuery = GetContactsListQuery;
//# sourceMappingURL=get-contacts-list.query.js.map