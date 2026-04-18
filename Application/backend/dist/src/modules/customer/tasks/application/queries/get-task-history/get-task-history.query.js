"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTaskHistoryQuery = void 0;
class GetTaskHistoryQuery {
    constructor(taskId, page = 1, limit = 50) {
        this.taskId = taskId;
        this.page = page;
        this.limit = limit;
    }
}
exports.GetTaskHistoryQuery = GetTaskHistoryQuery;
//# sourceMappingURL=get-task-history.query.js.map