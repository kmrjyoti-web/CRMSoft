"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCampaignCommand = void 0;
class CreateCampaignCommand {
    constructor(name, subject, bodyHtml, accountId, userId, userName, description, bodyText, fromName, replyToEmail, templateId, sendRatePerMinute, batchSize, trackOpens, trackClicks, includeUnsubscribe, scheduledAt) {
        this.name = name;
        this.subject = subject;
        this.bodyHtml = bodyHtml;
        this.accountId = accountId;
        this.userId = userId;
        this.userName = userName;
        this.description = description;
        this.bodyText = bodyText;
        this.fromName = fromName;
        this.replyToEmail = replyToEmail;
        this.templateId = templateId;
        this.sendRatePerMinute = sendRatePerMinute;
        this.batchSize = batchSize;
        this.trackOpens = trackOpens;
        this.trackClicks = trackClicks;
        this.includeUnsubscribe = includeUnsubscribe;
        this.scheduledAt = scheduledAt;
    }
}
exports.CreateCampaignCommand = CreateCampaignCommand;
//# sourceMappingURL=create-campaign.command.js.map