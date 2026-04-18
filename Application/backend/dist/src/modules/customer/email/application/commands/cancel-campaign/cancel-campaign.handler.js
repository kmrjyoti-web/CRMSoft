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
var CancelCampaignHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancelCampaignHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const cancel_campaign_command_1 = require("./cancel-campaign.command");
const campaign_executor_service_1 = require("../../../services/campaign-executor.service");
let CancelCampaignHandler = CancelCampaignHandler_1 = class CancelCampaignHandler {
    constructor(campaignExecutor) {
        this.campaignExecutor = campaignExecutor;
        this.logger = new common_1.Logger(CancelCampaignHandler_1.name);
    }
    async execute(cmd) {
        try {
            await this.campaignExecutor.cancelCampaign(cmd.campaignId);
            this.logger.log(`Campaign cancelled: ${cmd.campaignId}`);
        }
        catch (error) {
            this.logger.error(`CancelCampaignHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CancelCampaignHandler = CancelCampaignHandler;
exports.CancelCampaignHandler = CancelCampaignHandler = CancelCampaignHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(cancel_campaign_command_1.CancelCampaignCommand),
    __metadata("design:paramtypes", [campaign_executor_service_1.CampaignExecutorService])
], CancelCampaignHandler);
//# sourceMappingURL=cancel-campaign.handler.js.map