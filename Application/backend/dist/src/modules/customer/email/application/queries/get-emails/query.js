"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetEmailsQuery = void 0;
class GetEmailsQuery {
    constructor(page, limit, accountId, direction, status, isStarred, isRead) {
        this.page = page;
        this.limit = limit;
        this.accountId = accountId;
        this.direction = direction;
        this.status = status;
        this.isStarred = isStarred;
        this.isRead = isRead;
    }
}
exports.GetEmailsQuery = GetEmailsQuery;
//# sourceMappingURL=query.js.map