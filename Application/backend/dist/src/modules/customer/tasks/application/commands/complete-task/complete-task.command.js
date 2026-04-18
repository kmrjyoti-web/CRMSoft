"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompleteTaskCommand = void 0;
class CompleteTaskCommand {
    constructor(taskId, userId, completionNotes, actualMinutes) {
        this.taskId = taskId;
        this.userId = userId;
        this.completionNotes = completionNotes;
        this.actualMinutes = actualMinutes;
    }
}
exports.CompleteTaskCommand = CompleteTaskCommand;
//# sourceMappingURL=complete-task.command.js.map