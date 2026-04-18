"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTaskCommand = void 0;
class UpdateTaskCommand {
    constructor(taskId, userId, title, description, priority, dueDate, recurrence) {
        this.taskId = taskId;
        this.userId = userId;
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.dueDate = dueDate;
        this.recurrence = recurrence;
    }
}
exports.UpdateTaskCommand = UpdateTaskCommand;
//# sourceMappingURL=update-task.command.js.map