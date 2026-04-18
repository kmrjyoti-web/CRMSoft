"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCommentsByEntityQuery = void 0;
class GetCommentsByEntityQuery {
    constructor(entityType, entityId, userId, roleLevel, page = 1, limit = 50) {
        this.entityType = entityType;
        this.entityId = entityId;
        this.userId = userId;
        this.roleLevel = roleLevel;
        this.page = page;
        this.limit = limit;
    }
}
exports.GetCommentsByEntityQuery = GetCommentsByEntityQuery;
//# sourceMappingURL=get-comments-by-entity.query.js.map