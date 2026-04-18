"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRawContactsListQuery = void 0;
class GetRawContactsListQuery {
    constructor(page, limit, sortBy, sortOrder, search, isActive, status, source, companyName, firstName, lastName, createdAtFrom, createdAtTo) {
        this.page = page;
        this.limit = limit;
        this.sortBy = sortBy;
        this.sortOrder = sortOrder;
        this.search = search;
        this.isActive = isActive;
        this.status = status;
        this.source = source;
        this.companyName = companyName;
        this.firstName = firstName;
        this.lastName = lastName;
        this.createdAtFrom = createdAtFrom;
        this.createdAtTo = createdAtTo;
    }
}
exports.GetRawContactsListQuery = GetRawContactsListQuery;
//# sourceMappingURL=get-raw-contacts-list.query.js.map