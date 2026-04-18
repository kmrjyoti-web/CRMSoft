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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailCampaignController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../../common/guards/jwt-auth.guard");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const create_campaign_command_1 = require("../application/commands/create-campaign/create-campaign.command");
const update_campaign_command_1 = require("../application/commands/update-campaign/update-campaign.command");
const add_campaign_recipients_command_1 = require("../application/commands/add-campaign-recipients/add-campaign-recipients.command");
const start_campaign_command_1 = require("../application/commands/start-campaign/start-campaign.command");
const pause_campaign_command_1 = require("../application/commands/pause-campaign/pause-campaign.command");
const cancel_campaign_command_1 = require("../application/commands/cancel-campaign/cancel-campaign.command");
const query_1 = require("../application/queries/get-campaigns/query");
const query_2 = require("../application/queries/get-campaign-detail/query");
const query_3 = require("../application/queries/get-campaign-stats/query");
const query_4 = require("../application/queries/get-campaign-recipients/query");
const query_5 = require("../application/queries/get-unsubscribes/query");
const campaign_dto_1 = require("./dto/campaign.dto");
let EmailCampaignController = class EmailCampaignController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async create(dto, user) {
        const result = await this.commandBus.execute(new create_campaign_command_1.CreateCampaignCommand(dto.name, dto.subject, dto.bodyHtml, dto.accountId, user.id, user.name || user.email, dto.description, dto.bodyText, dto.fromName, dto.replyToEmail, dto.templateId, dto.sendRatePerMinute, dto.batchSize, dto.trackOpens, dto.trackClicks, dto.includeUnsubscribe, dto.scheduledAt ? new Date(dto.scheduledAt) : undefined));
        return api_response_1.ApiResponse.success(result, 'Campaign created successfully');
    }
    async update(id, dto) {
        const result = await this.commandBus.execute(new update_campaign_command_1.UpdateCampaignCommand(id, dto.name, dto.description, dto.subject, dto.bodyHtml, dto.bodyText, dto.sendRatePerMinute, dto.scheduledAt ? new Date(dto.scheduledAt) : undefined));
        return api_response_1.ApiResponse.success(result, 'Campaign updated successfully');
    }
    async addRecipients(id, dto) {
        const result = await this.commandBus.execute(new add_campaign_recipients_command_1.AddCampaignRecipientsCommand(id, dto.recipients));
        return api_response_1.ApiResponse.success(result, 'Recipients added successfully');
    }
    async start(id, userId) {
        const result = await this.commandBus.execute(new start_campaign_command_1.StartCampaignCommand(id, userId));
        return api_response_1.ApiResponse.success(result, 'Campaign started');
    }
    async pause(id) {
        const result = await this.commandBus.execute(new pause_campaign_command_1.PauseCampaignCommand(id));
        return api_response_1.ApiResponse.success(result, 'Campaign paused');
    }
    async cancel(id) {
        const result = await this.commandBus.execute(new cancel_campaign_command_1.CancelCampaignCommand(id));
        return api_response_1.ApiResponse.success(result, 'Campaign cancelled');
    }
    async list(query, userId) {
        const result = await this.queryBus.execute(new query_1.GetCampaignsQuery(userId, query.page || 1, query.limit || 20, query.status));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async unsubscribes(page, limit) {
        const result = await this.queryBus.execute(new query_5.GetUnsubscribesQuery(page || 1, limit || 20));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async getById(id) {
        const result = await this.queryBus.execute(new query_2.GetCampaignDetailQuery(id));
        return api_response_1.ApiResponse.success(result, 'Campaign retrieved');
    }
    async stats(id) {
        const result = await this.queryBus.execute(new query_3.GetCampaignStatsQuery(id));
        return api_response_1.ApiResponse.success(result, 'Campaign stats retrieved');
    }
    async recipients(id, query) {
        const result = await this.queryBus.execute(new query_4.GetCampaignRecipientsQuery(id, query.page || 1, query.limit || 20, query.status));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
};
exports.EmailCampaignController = EmailCampaignController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permissions_decorator_1.RequirePermissions)('emails:create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [campaign_dto_1.CreateCampaignDto, Object]),
    __metadata("design:returntype", Promise)
], EmailCampaignController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('emails:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, campaign_dto_1.UpdateCampaignDto]),
    __metadata("design:returntype", Promise)
], EmailCampaignController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/recipients'),
    (0, require_permissions_decorator_1.RequirePermissions)('emails:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, campaign_dto_1.AddCampaignRecipientsDto]),
    __metadata("design:returntype", Promise)
], EmailCampaignController.prototype, "addRecipients", null);
__decorate([
    (0, common_1.Post)(':id/start'),
    (0, require_permissions_decorator_1.RequirePermissions)('emails:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EmailCampaignController.prototype, "start", null);
__decorate([
    (0, common_1.Post)(':id/pause'),
    (0, require_permissions_decorator_1.RequirePermissions)('emails:update'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmailCampaignController.prototype, "pause", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, require_permissions_decorator_1.RequirePermissions)('emails:update'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmailCampaignController.prototype, "cancel", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permissions_decorator_1.RequirePermissions)('emails:read'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [campaign_dto_1.CampaignQueryDto, String]),
    __metadata("design:returntype", Promise)
], EmailCampaignController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('unsubscribes'),
    (0, require_permissions_decorator_1.RequirePermissions)('emails:read'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], EmailCampaignController.prototype, "unsubscribes", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('emails:read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmailCampaignController.prototype, "getById", null);
__decorate([
    (0, common_1.Get)(':id/stats'),
    (0, require_permissions_decorator_1.RequirePermissions)('emails:read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmailCampaignController.prototype, "stats", null);
__decorate([
    (0, common_1.Get)(':id/recipients'),
    (0, require_permissions_decorator_1.RequirePermissions)('emails:read'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, campaign_dto_1.CampaignRecipientQueryDto]),
    __metadata("design:returntype", Promise)
], EmailCampaignController.prototype, "recipients", null);
exports.EmailCampaignController = EmailCampaignController = __decorate([
    (0, swagger_1.ApiTags)('Email Campaigns'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('email-campaigns'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], EmailCampaignController);
//# sourceMappingURL=email-campaign.controller.js.map