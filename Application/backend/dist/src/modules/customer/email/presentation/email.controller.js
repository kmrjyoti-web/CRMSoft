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
exports.EmailController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../../common/guards/jwt-auth.guard");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const compose_email_command_1 = require("../application/commands/compose-email/compose-email.command");
const reply_email_command_1 = require("../application/commands/reply-email/reply-email.command");
const send_email_command_1 = require("../application/commands/send-email/send-email.command");
const schedule_email_command_1 = require("../application/commands/schedule-email/schedule-email.command");
const cancel_scheduled_email_command_1 = require("../application/commands/cancel-scheduled-email/cancel-scheduled-email.command");
const star_email_command_1 = require("../application/commands/star-email/star-email.command");
const mark_read_command_1 = require("../application/commands/mark-read/mark-read.command");
const link_email_to_entity_command_1 = require("../application/commands/link-email-to-entity/link-email-to-entity.command");
const unlink_email_from_entity_command_1 = require("../application/commands/unlink-email-from-entity/unlink-email-from-entity.command");
const query_1 = require("../application/queries/get-email/query");
const query_2 = require("../application/queries/get-emails/query");
const query_3 = require("../application/queries/get-email-thread/query");
const query_4 = require("../application/queries/get-entity-emails/query");
const query_5 = require("../application/queries/search-emails/query");
const query_6 = require("../application/queries/get-email-analytics/query");
const compose_email_dto_1 = require("./dto/compose-email.dto");
const email_query_dto_1 = require("./dto/email-query.dto");
let EmailController = class EmailController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async compose(dto, userId) {
        const result = await this.commandBus.execute(new compose_email_command_1.ComposeEmailCommand(dto.accountId, userId, dto.to, dto.subject, dto.bodyHtml, dto.cc, dto.bcc, dto.bodyText, dto.replyToEmailId, dto.templateId, dto.templateData, dto.signatureId, dto.scheduledAt ? new Date(dto.scheduledAt) : undefined, dto.sendNow, dto.entityType, dto.entityId, dto.priority, dto.trackOpens, dto.trackClicks));
        return api_response_1.ApiResponse.success(result, 'Email composed successfully');
    }
    async reply(dto, userId) {
        const result = await this.commandBus.execute(new reply_email_command_1.ReplyEmailCommand(dto.originalEmailId, userId, dto.replyType, dto.bodyHtml, dto.to, dto.bodyText));
        return api_response_1.ApiResponse.success(result, 'Reply sent successfully');
    }
    async send(id, userId) {
        const result = await this.commandBus.execute(new send_email_command_1.SendEmailCommand(id, userId));
        return api_response_1.ApiResponse.success(result, 'Email sent successfully');
    }
    async schedule(id, scheduledAt, userId) {
        const result = await this.commandBus.execute(new schedule_email_command_1.ScheduleEmailCommand(id, new Date(scheduledAt), userId));
        return api_response_1.ApiResponse.success(result, 'Email scheduled successfully');
    }
    async cancelSchedule(id, userId) {
        const result = await this.commandBus.execute(new cancel_scheduled_email_command_1.CancelScheduledEmailCommand(id, userId));
        return api_response_1.ApiResponse.success(result, 'Scheduled email cancelled');
    }
    async star(id, starred) {
        const result = await this.commandBus.execute(new star_email_command_1.StarEmailCommand(id, starred));
        return api_response_1.ApiResponse.success(result, 'Email star updated');
    }
    async markRead(id, isRead) {
        const result = await this.commandBus.execute(new mark_read_command_1.MarkReadCommand(id, isRead));
        return api_response_1.ApiResponse.success(result, 'Email read status updated');
    }
    async linkToEntity(id, entityType, entityId, userId) {
        const result = await this.commandBus.execute(new link_email_to_entity_command_1.LinkEmailToEntityCommand(id, entityType, entityId, userId));
        return api_response_1.ApiResponse.success(result, 'Email linked to entity');
    }
    async unlinkFromEntity(id, userId) {
        const result = await this.commandBus.execute(new unlink_email_from_entity_command_1.UnlinkEmailFromEntityCommand(id, userId));
        return api_response_1.ApiResponse.success(result, 'Email unlinked from entity');
    }
    async list(query) {
        const result = await this.queryBus.execute(new query_2.GetEmailsQuery(query.page || 1, query.limit || 20, query.accountId, query.direction, query.status, query.isStarred, query.isRead));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async search(query) {
        const result = await this.queryBus.execute(new query_5.SearchEmailsQuery(query.query || '', query.page || 1, query.limit || 20, query.accountId));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async analytics(userId, dateFrom, dateTo) {
        const result = await this.queryBus.execute(new query_6.GetEmailAnalyticsQuery(userId, dateFrom ? new Date(dateFrom) : undefined, dateTo ? new Date(dateTo) : undefined));
        return api_response_1.ApiResponse.success(result, 'Email analytics retrieved');
    }
    async entityEmails(entityType, entityId, page, limit) {
        const result = await this.queryBus.execute(new query_4.GetEntityEmailsQuery(entityType, entityId, page || 1, limit || 20));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async thread(threadId) {
        const result = await this.queryBus.execute(new query_3.GetEmailThreadQuery(threadId));
        return api_response_1.ApiResponse.success(result, 'Email thread retrieved');
    }
    async getById(id) {
        const result = await this.queryBus.execute(new query_1.GetEmailQuery(id));
        return api_response_1.ApiResponse.success(result, 'Email retrieved');
    }
};
exports.EmailController = EmailController;
__decorate([
    (0, common_1.Post)('compose'),
    (0, require_permissions_decorator_1.RequirePermissions)('emails:create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [compose_email_dto_1.ComposeEmailDto, String]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "compose", null);
__decorate([
    (0, common_1.Post)('reply'),
    (0, require_permissions_decorator_1.RequirePermissions)('emails:create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [compose_email_dto_1.ReplyEmailDto, String]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "reply", null);
__decorate([
    (0, common_1.Post)(':id/send'),
    (0, require_permissions_decorator_1.RequirePermissions)('emails:create'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "send", null);
__decorate([
    (0, common_1.Post)(':id/schedule'),
    (0, require_permissions_decorator_1.RequirePermissions)('emails:create'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('scheduledAt')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "schedule", null);
__decorate([
    (0, common_1.Post)(':id/cancel-schedule'),
    (0, require_permissions_decorator_1.RequirePermissions)('emails:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "cancelSchedule", null);
__decorate([
    (0, common_1.Post)(':id/star'),
    (0, require_permissions_decorator_1.RequirePermissions)('emails:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('starred')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "star", null);
__decorate([
    (0, common_1.Post)(':id/read'),
    (0, require_permissions_decorator_1.RequirePermissions)('emails:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('isRead')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "markRead", null);
__decorate([
    (0, common_1.Post)(':id/link'),
    (0, require_permissions_decorator_1.RequirePermissions)('emails:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('entityType')),
    __param(2, (0, common_1.Body)('entityId')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "linkToEntity", null);
__decorate([
    (0, common_1.Post)(':id/unlink'),
    (0, require_permissions_decorator_1.RequirePermissions)('emails:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "unlinkFromEntity", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permissions_decorator_1.RequirePermissions)('emails:read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [email_query_dto_1.EmailQueryDto]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, require_permissions_decorator_1.RequirePermissions)('emails:read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [email_query_dto_1.SearchEmailsDto]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('analytics'),
    (0, require_permissions_decorator_1.RequirePermissions)('emails:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Query)('dateFrom')),
    __param(2, (0, common_1.Query)('dateTo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "analytics", null);
__decorate([
    (0, common_1.Get)('entity/:entityType/:entityId'),
    (0, require_permissions_decorator_1.RequirePermissions)('emails:read'),
    __param(0, (0, common_1.Param)('entityType')),
    __param(1, (0, common_1.Param)('entityId')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "entityEmails", null);
__decorate([
    (0, common_1.Get)('thread/:threadId'),
    (0, require_permissions_decorator_1.RequirePermissions)('emails:read'),
    __param(0, (0, common_1.Param)('threadId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "thread", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('emails:read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "getById", null);
exports.EmailController = EmailController = __decorate([
    (0, swagger_1.ApiTags)('Emails'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('emails'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], EmailController);
//# sourceMappingURL=email.controller.js.map