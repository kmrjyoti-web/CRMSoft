"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCampaignCommand = void 0;
class UpdateCampaignCommand {
    constructor(id, name, description, subject, bodyHtml, bodyText, sendRatePerMinute, scheduledAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.subject = subject;
        this.bodyHtml = bodyHtml;
        this.bodyText = bodyText;
        this.sendRatePerMinute = sendRatePerMinute;
        this.scheduledAt = scheduledAt;
    }
}
exports.UpdateCampaignCommand = UpdateCampaignCommand;
//# sourceMappingURL=update-campaign.command.js.map