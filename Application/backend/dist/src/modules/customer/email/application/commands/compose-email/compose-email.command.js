"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComposeEmailCommand = void 0;
class ComposeEmailCommand {
    constructor(accountId, userId, to, subject, bodyHtml, cc, bcc, bodyText, replyToEmailId, templateId, templateData, signatureId, scheduledAt, sendNow, entityType, entityId, priority, trackOpens, trackClicks) {
        this.accountId = accountId;
        this.userId = userId;
        this.to = to;
        this.subject = subject;
        this.bodyHtml = bodyHtml;
        this.cc = cc;
        this.bcc = bcc;
        this.bodyText = bodyText;
        this.replyToEmailId = replyToEmailId;
        this.templateId = templateId;
        this.templateData = templateData;
        this.signatureId = signatureId;
        this.scheduledAt = scheduledAt;
        this.sendNow = sendNow;
        this.entityType = entityType;
        this.entityId = entityId;
        this.priority = priority;
        this.trackOpens = trackOpens;
        this.trackClicks = trackClicks;
    }
}
exports.ComposeEmailCommand = ComposeEmailCommand;
//# sourceMappingURL=compose-email.command.js.map