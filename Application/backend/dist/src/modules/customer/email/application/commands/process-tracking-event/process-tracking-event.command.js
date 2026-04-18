"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessTrackingEventCommand = void 0;
class ProcessTrackingEventCommand {
    constructor(eventType, emailId, trackingPixelId, clickedUrl, ipAddress, userAgent, bounceReason) {
        this.eventType = eventType;
        this.emailId = emailId;
        this.trackingPixelId = trackingPixelId;
        this.clickedUrl = clickedUrl;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
        this.bounceReason = bounceReason;
    }
}
exports.ProcessTrackingEventCommand = ProcessTrackingEventCommand;
//# sourceMappingURL=process-tracking-event.command.js.map