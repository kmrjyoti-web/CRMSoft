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
var CreateCampaignHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCampaignHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const create_campaign_command_1 = require("./create-campaign.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let CreateCampaignHandler = CreateCampaignHandler_1 = class CreateCampaignHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CreateCampaignHandler_1.name);
    }
    async execute(cmd) {
        try {
            const campaign = await this.prisma.working.emailCampaign.create({
                data: {
                    name: cmd.name,
                    description: cmd.description,
                    subject: cmd.subject,
                    bodyHtml: cmd.bodyHtml,
                    bodyText: cmd.bodyText,
                    accountId: cmd.accountId,
                    fromName: cmd.fromName,
                    replyToEmail: cmd.replyToEmail,
                    templateId: cmd.templateId,
                    sendRatePerMinute: cmd.sendRatePerMinute ?? 60,
                    batchSize: cmd.batchSize ?? 100,
                    trackOpens: cmd.trackOpens ?? true,
                    trackClicks: cmd.trackClicks ?? true,
                    includeUnsubscribe: cmd.includeUnsubscribe ?? true,
                    scheduledAt: cmd.scheduledAt,
                    status: 'DRAFT',
                    createdById: cmd.userId,
                    createdByName: cmd.userName,
                },
            });
            this.logger.log(`Email campaign created: ${campaign.id} (${cmd.name})`);
            return campaign;
        }
        catch (error) {
            this.logger.error(`CreateCampaignHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CreateCampaignHandler = CreateCampaignHandler;
exports.CreateCampaignHandler = CreateCampaignHandler = CreateCampaignHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(create_campaign_command_1.CreateCampaignCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CreateCampaignHandler);
//# sourceMappingURL=create-campaign.handler.js.map