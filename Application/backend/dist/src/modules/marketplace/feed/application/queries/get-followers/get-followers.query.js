"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetFollowersQuery = void 0;
class GetFollowersQuery {
    constructor(userId, tenantId, page = 1, limit = 20) {
        this.userId = userId;
        this.tenantId = tenantId;
        this.page = page;
        this.limit = limit;
    }
}
exports.GetFollowersQuery = GetFollowersQuery;
//# sourceMappingURL=get-followers.query.js.map