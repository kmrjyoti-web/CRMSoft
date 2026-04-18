"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMyTasksQuery = void 0;
class GetMyTasksQuery {
    constructor(userId, page = 1, limit = 20, status) {
        this.userId = userId;
        this.page = page;
        this.limit = limit;
        this.status = status;
    }
}
exports.GetMyTasksQuery = GetMyTasksQuery;
//# sourceMappingURL=get-my-tasks.query.js.map