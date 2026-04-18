"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateBroadcastCommand = void 0;
class CreateBroadcastCommand {
    constructor(wabaId, name, templateId, scheduledAt, throttlePerSecond, userId = '', userName = '') {
        this.wabaId = wabaId;
        this.name = name;
        this.templateId = templateId;
        this.scheduledAt = scheduledAt;
        this.throttlePerSecond = throttlePerSecond;
        this.userId = userId;
        this.userName = userName;
    }
}
exports.CreateBroadcastCommand = CreateBroadcastCommand;
//# sourceMappingURL=create-broadcast.command.js.map