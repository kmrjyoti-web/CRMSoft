"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateReminderCommand = void 0;
class CreateReminderCommand {
    constructor(title, scheduledAt, recipientId, createdById, entityType, entityId, channel, message) {
        this.title = title;
        this.scheduledAt = scheduledAt;
        this.recipientId = recipientId;
        this.createdById = createdById;
        this.entityType = entityType;
        this.entityId = entityId;
        this.channel = channel;
        this.message = message;
    }
}
exports.CreateReminderCommand = CreateReminderCommand;
//# sourceMappingURL=create-reminder.command.js.map