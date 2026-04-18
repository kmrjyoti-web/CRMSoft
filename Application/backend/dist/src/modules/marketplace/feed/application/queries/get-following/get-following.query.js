"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetFollowingQuery = void 0;
class GetFollowingQuery {
    constructor(userId, tenantId, page = 1, limit = 20) {
        this.userId = userId;
        this.tenantId = tenantId;
        this.page = page;
        this.limit = limit;
    }
}
exports.GetFollowingQuery = GetFollowingQuery;
//# sourceMappingURL=get-following.query.js.map