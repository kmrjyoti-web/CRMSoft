"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListPortalUsersQuery = void 0;
class ListPortalUsersQuery {
    constructor(tenantId, page = 1, limit = 20, search, isActive) {
        this.tenantId = tenantId;
        this.page = page;
        this.limit = limit;
        this.search = search;
        this.isActive = isActive;
    }
}
exports.ListPortalUsersQuery = ListPortalUsersQuery;
//# sourceMappingURL=list-portal-users.query.js.map