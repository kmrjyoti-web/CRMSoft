"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMenuTreeQuery = void 0;
class GetMenuTreeQuery {
    constructor(includeInactive = true, tenantId, isSuperAdmin, industryCode) {
        this.includeInactive = includeInactive;
        this.tenantId = tenantId;
        this.isSuperAdmin = isSuperAdmin;
        this.industryCode = industryCode;
    }
}
exports.GetMenuTreeQuery = GetMenuTreeQuery;
//# sourceMappingURL=get-menu-tree.query.js.map