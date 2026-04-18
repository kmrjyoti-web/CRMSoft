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
var PauseCampaignHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PauseCampaignHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const pause_campaign_command_1 = require("./pause-campaign.command");
const campaign_executor_service_1 = require("../../../services/campaign-executor.service");
let PauseCampaignHandler = PauseCampaignHandler_1 = class PauseCampaignHandler {
    constructor(campaignExecutor) {
        this.campaignExecutor = campaignExecutor;
        this.logger = new common_1.Logger(PauseCampaignHandler_1.name);
    }
    async execute(cmd) {
        try {
            await this.campaignExecutor.pauseCampaign(cmd.campaignId);
            this.logger.log(`Campaign paused: ${cmd.campaignId}`);
        }
        catch (error) {
            this.logger.error(`PauseCampaignHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.PauseCampaignHandler = PauseCampaignHandler;
exports.PauseCampaignHandler = PauseCampaignHandler = PauseCampaignHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(pause_campaign_command_1.PauseCampaignCommand),
    __metadata("design:paramtypes", [campaign_executor_service_1.CampaignExecutorService])
], PauseCampaignHandler);
//# sourceMappingURL=pause-campaign.handler.js.map