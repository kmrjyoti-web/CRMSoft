"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateFollowUpCommand = void 0;
class CreateFollowUpCommand {
    constructor(title, dueDate, assignedToId, createdById, entityType, entityId, description, priority) {
        this.title = title;
        this.dueDate = dueDate;
        this.assignedToId = assignedToId;
        this.createdById = createdById;
        this.entityType = entityType;
        this.entityId = entityId;
        this.description = description;
        this.priority = priority;
    }
}
exports.CreateFollowUpCommand = CreateFollowUpCommand;
//# sourceMappingURL=create-follow-up.command.js.map