"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateActivityCommand = void 0;
class CreateActivityCommand {
    constructor(type, subject, userId, description, scheduledAt, endTime, duration, leadId, contactId, locationName, latitude, longitude, reminderMinutesBefore, taggedUserIds, tenantId) {
        this.type = type;
        this.subject = subject;
        this.userId = userId;
        this.description = description;
        this.scheduledAt = scheduledAt;
        this.endTime = endTime;
        this.duration = duration;
        this.leadId = leadId;
        this.contactId = contactId;
        this.locationName = locationName;
        this.latitude = latitude;
        this.longitude = longitude;
        this.reminderMinutesBefore = reminderMinutesBefore;
        this.taggedUserIds = taggedUserIds;
        this.tenantId = tenantId;
    }
}
exports.CreateActivityCommand = CreateActivityCommand;
//# sourceMappingURL=create-activity.command.js.map