"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateDemoCommand = void 0;
class CreateDemoCommand {
    constructor(leadId, userId, mode, scheduledAt, duration, meetingLink, location, notes) {
        this.leadId = leadId;
        this.userId = userId;
        this.mode = mode;
        this.scheduledAt = scheduledAt;
        this.duration = duration;
        this.meetingLink = meetingLink;
        this.location = location;
        this.notes = notes;
    }
}
exports.CreateDemoCommand = CreateDemoCommand;
//# sourceMappingURL=create-demo.command.js.map