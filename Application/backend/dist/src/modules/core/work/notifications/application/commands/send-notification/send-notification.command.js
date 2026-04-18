"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendNotificationCommand = void 0;
class SendNotificationCommand {
    constructor(templateName, recipientId, variables, senderId, entityType, entityId, priority, groupKey, channelOverrides) {
        this.templateName = templateName;
        this.recipientId = recipientId;
        this.variables = variables;
        this.senderId = senderId;
        this.entityType = entityType;
        this.entityId = entityId;
        this.priority = priority;
        this.groupKey = groupKey;
        this.channelOverrides = channelOverrides;
    }
}
exports.SendNotificationCommand = SendNotificationCommand;
//# sourceMappingURL=send-notification.command.js.map