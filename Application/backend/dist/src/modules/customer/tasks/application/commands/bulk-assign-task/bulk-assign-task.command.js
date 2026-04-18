"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkAssignTaskCommand = void 0;
class BulkAssignTaskCommand {
    constructor(taskIds, assignedToId, userId, roleLevel, tenantId) {
        this.taskIds = taskIds;
        this.assignedToId = assignedToId;
        this.userId = userId;
        this.roleLevel = roleLevel;
        this.tenantId = tenantId;
    }
}
exports.BulkAssignTaskCommand = BulkAssignTaskCommand;
//# sourceMappingURL=bulk-assign-task.command.js.map