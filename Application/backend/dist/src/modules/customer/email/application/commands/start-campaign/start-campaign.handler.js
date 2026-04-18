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
var StartCampaignHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartCampaignHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const start_campaign_command_1 = require("./start-campaign.command");
const campaign_executor_service_1 = require("../../../services/campaign-executor.service");
let StartCampaignHandler = StartCampaignHandler_1 = class StartCampaignHandler {
    constructor(campaignExecutor) {
        this.campaignExecutor = campaignExecutor;
        this.logger = new common_1.Logger(StartCampaignHandler_1.name);
    }
    async execute(cmd) {
        try {
            await this.campaignExecutor.executeCampaign(cmd.campaignId);
            this.logger.log(`Campaign started: ${cmd.campaignId} by user ${cmd.userId}`);
        }
        catch (error) {
            this.logger.error(`StartCampaignHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.StartCampaignHandler = StartCampaignHandler;
exports.StartCampaignHandler = StartCampaignHandler = StartCampaignHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(start_campaign_command_1.StartCampaignCommand),
    __metadata("design:paramtypes", [campaign_executor_service_1.CampaignExecutorService])
], StartCampaignHandler);
//# sourceMappingURL=start-campaign.handler.js.map