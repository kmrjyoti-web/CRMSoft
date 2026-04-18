"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignTaskCommand = void 0;
class AssignTaskCommand {
    constructor(taskId, newAssigneeId, userId, userRoleLevel) {
        this.taskId = taskId;
        this.newAssigneeId = newAssigneeId;
        this.userId = userId;
        this.userRoleLevel = userRoleLevel;
    }
}
exports.AssignTaskCommand = AssignTaskCommand;
//# sourceMappingURL=assign-task.command.js.map