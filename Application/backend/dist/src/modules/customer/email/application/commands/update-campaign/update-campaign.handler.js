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
var UpdateCampaignHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCampaignHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const update_campaign_command_1 = require("./update-campaign.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let UpdateCampaignHandler = UpdateCampaignHandler_1 = class UpdateCampaignHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(UpdateCampaignHandler_1.name);
    }
    async execute(cmd) {
        try {
            const campaign = await this.prisma.working.emailCampaign.findUniqueOrThrow({
                where: { id: cmd.id },
            });
            if (campaign.status !== 'DRAFT') {
                throw new common_1.BadRequestException(`Campaign can only be updated in DRAFT status, current status: ${campaign.status}`);
            }
            const data = {};
            if (cmd.name !== undefined)
                data.name = cmd.name;
            if (cmd.description !== undefined)
                data.description = cmd.description;
            if (cmd.subject !== undefined)
                data.subject = cmd.subject;
            if (cmd.bodyHtml !== undefined)
                data.bodyHtml = cmd.bodyHtml;
            if (cmd.bodyText !== undefined)
                data.bodyText = cmd.bodyText;
            if (cmd.sendRatePerMinute !== undefined)
                data.sendRatePerMinute = cmd.sendRatePerMinute;
            if (cmd.scheduledAt !== undefined)
                data.scheduledAt = cmd.scheduledAt;
            const updated = await this.prisma.working.emailCampaign.update({
                where: { id: cmd.id },
                data,
            });
            this.logger.log(`Email campaign updated: ${cmd.id}`);
            return updated;
        }
        catch (error) {
            this.logger.error(`UpdateCampaignHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.UpdateCampaignHandler = UpdateCampaignHandler;
exports.UpdateCampaignHandler = UpdateCampaignHandler = UpdateCampaignHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(update_campaign_command_1.UpdateCampaignCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UpdateCampaignHandler);
//# sourceMappingURL=update-campaign.handler.js.map