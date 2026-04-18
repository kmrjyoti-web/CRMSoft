"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AddCampaignRecipientsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddCampaignRecipientsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const add_campaign_recipients_command_1 = require("./add-campaign-recipients.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let AddCampaignRecipientsHandler = AddCampaignRecipientsHandler_1 = class AddCampaignRecipientsHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AddCampaignRecipientsHandler_1.name);
    }
    async execute(cmd) {
        try {
            await this.prisma.working.campaignRecipient.createMany({
                data: cmd.recipients.map((r) => ({
                    campaignId: cmd.campaignId,
                    email: r.email,
                    firstName: r.firstName,
                    lastName: r.lastName,
                    companyName: r.companyName,
                    contactId: r.contactId,
                    mergeData: r.mergeData || {},
                    status: 'PENDING',
                })),
            });
            const count = await this.prisma.working.campaignRecipient.count({
                where: { campaignId: cmd.campaignId },
            });
            await this.prisma.working.emailCampaign.update({
                where: { id: cmd.campaignId },
                data: { totalRecipients: count },
            });
            this.logger.log(`Added ${cmd.recipients.length} recipients to campaign ${cmd.campaignId} (total: ${count})`);
            return { added: cmd.recipients.length, total: count };
        }
        catch (error) {
            this.logger.error(`AddCampaignRecipientsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.AddCampaignRecipientsHandler = AddCampaignRecipientsHandler;
exports.AddCampaignRecipientsHandler = AddCampaignRecipientsHandler = AddCampaignRecipientsHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(add_campaign_recipients_command_1.AddCampaignRecipientsCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AddCampaignRecipientsHandler);
//# sourceMappingURL=add-campaign-recipients.handler.js.map