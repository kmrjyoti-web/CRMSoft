"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListUsersQuery = void 0;
class ListUsersQuery {
    constructor(tenantId, page = 1, limit = 50, search, status, userType, roleId) {
        this.tenantId = tenantId;
        this.page = page;
        this.limit = limit;
        this.search = search;
        this.status = status;
        this.userType = userType;
        this.roleId = roleId;
    }
}
exports.ListUsersQuery = ListUsersQuery;
//# sourceMappingURL=list-users.query.js.map