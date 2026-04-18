"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeTaskStatusCommand = void 0;
class ChangeTaskStatusCommand {
    constructor(taskId, newStatus, userId, reason) {
        this.taskId = taskId;
        this.newStatus = newStatus;
        this.userId = userId;
        this.reason = reason;
    }
}
exports.ChangeTaskStatusCommand = ChangeTaskStatusCommand;
//# sourceMappingURL=change-task-status.command.js.map