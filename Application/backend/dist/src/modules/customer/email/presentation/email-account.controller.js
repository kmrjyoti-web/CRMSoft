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
exports.EmailAccountController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../../common/guards/jwt-auth.guard");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const connect_account_command_1 = require("../application/commands/connect-account/connect-account.command");
const disconnect_account_command_1 = require("../application/commands/disconnect-account/disconnect-account.command");
const sync_inbox_command_1 = require("../application/commands/sync-inbox/sync-inbox.command");
const query_1 = require("../application/queries/get-accounts/query");
const query_2 = require("../application/queries/get-account-detail/query");
const email_account_dto_1 = require("./dto/email-account.dto");
const imap_smtp_service_1 = require("../services/imap-smtp.service");
const gmail_service_1 = require("../services/gmail.service");
const outlook_service_1 = require("../services/outlook.service");
let EmailAccountController = class EmailAccountController {
    constructor(commandBus, queryBus, imapSmtpService, gmailService, outlookService) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
        this.imapSmtpService = imapSmtpService;
        this.gmailService = gmailService;
        this.outlookService = outlookService;
    }
    async testConnection(dto) {
        const result = await this.imapSmtpService.testConnection(dto);
        return api_response_1.ApiResponse.success(result, 'Connection test completed');
    }
    async oauthInitiate(dto, userId, tenantId) {
        const frontendOrigin = process.env.FRONTEND_URL || process.env.CORS_ORIGINS?.split(',')[0] || 'http://localhost:3005';
        const redirectUrl = `${frontendOrigin}/settings/email/oauth-callback`;
        let authUrl;
        if (dto.provider === 'GMAIL') {
            authUrl = await this.gmailService.getAuthUrl(tenantId, userId, redirectUrl);
        }
        else {
            authUrl = await this.outlookService.getAuthUrl(tenantId, userId, redirectUrl);
        }
        return api_response_1.ApiResponse.success({ authUrl, redirectUrl }, 'OAuth URL generated');
    }
    async oauthCallback(dto, userId, tenantId) {
        const frontendOrigin = process.env.FRONTEND_URL || process.env.CORS_ORIGINS?.split(',')[0] || 'http://localhost:3005';
        const redirectUrl = `${frontendOrigin}/settings/email/oauth-callback`;
        let tokens;
        if (dto.provider === 'GMAIL') {
            tokens = await this.gmailService.handleOAuthCallback(tenantId, dto.code, userId, redirectUrl);
        }
        else {
            tokens = await this.outlookService.handleOAuthCallback(tenantId, dto.code, userId, redirectUrl);
        }
        const tokenExpiresAt = new Date(Date.now() + tokens.expiresIn * 1000);
        const result = await this.commandBus.execute(new connect_account_command_1.ConnectAccountCommand(dto.provider, userId, dto.emailAddress || `${dto.provider.toLowerCase()}@oauth.pending`, dto.displayName, dto.label, tokens.accessToken, tokens.refreshToken, tokenExpiresAt));
        return api_response_1.ApiResponse.success(result, 'OAuth account connected');
    }
    async connect(dto, userId) {
        const result = await this.commandBus.execute(new connect_account_command_1.ConnectAccountCommand(dto.provider, userId, dto.emailAddress, dto.displayName, dto.label, dto.accessToken, dto.refreshToken, undefined, dto.imapHost, dto.imapPort, dto.imapSecure, dto.smtpHost, dto.smtpPort, dto.smtpSecure, dto.smtpUsername, dto.smtpPassword));
        return api_response_1.ApiResponse.success(result, 'Email account connected');
    }
    async disconnect(id, userId) {
        const result = await this.commandBus.execute(new disconnect_account_command_1.DisconnectAccountCommand(id, userId));
        return api_response_1.ApiResponse.success(result, 'Email account disconnected');
    }
    async sync(id, userId) {
        const result = await this.commandBus.execute(new sync_inbox_command_1.SyncInboxCommand(id, userId));
        return api_response_1.ApiResponse.success(result, 'Inbox sync started');
    }
    async list(userId) {
        const result = await this.queryBus.execute(new query_1.GetAccountsQuery(userId));
        return api_response_1.ApiResponse.success(result, 'Email accounts retrieved');
    }
    async getById(id) {
        const result = await this.queryBus.execute(new query_2.GetAccountDetailQuery(id));
        return api_response_1.ApiResponse.success(result, 'Email account retrieved');
    }
};
exports.EmailAccountController = EmailAccountController;
__decorate([
    (0, common_1.Post)('test-connection'),
    (0, require_permissions_decorator_1.RequirePermissions)('emails:create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [email_account_dto_1.TestConnectionDto]),
    __metadata("design:returntype", Promise)
], EmailAccountController.prototype, "testConnection", null);
__decorate([
    (0, common_1.Post)('oauth/initiate'),
    (0, require_permissions_decorator_1.RequirePermissions)('emails:create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [email_account_dto_1.OAuthInitiateDto, String, String]),
    __metadata("design:returntype", Promise)
], EmailAccountController.prototype, "oauthInitiate", null);
__decorate([
    (0, common_1.Post)('oauth/callback'),
    (0, require_permissions_decorator_1.RequirePermissions)('emails:create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [email_account_dto_1.OAuthCallbackDto, String, String]),
    __metadata("design:returntype", Promise)
], EmailAccountController.prototype, "oauthCallback", null);
__decorate([
    (0, common_1.Post)('connect'),
    (0, require_permissions_decorator_1.RequirePermissions)('emails:create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [email_account_dto_1.ConnectAccountDto, String]),
    __metadata("design:returntype", Promise)
], EmailAccountController.prototype, "connect", null);
__decorate([
    (0, common_1.Post)(':id/disconnect'),
    (0, require_permissions_decorator_1.RequirePermissions)('emails:delete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EmailAccountController.prototype, "disconnect", null);
__decorate([
    (0, common_1.Post)(':id/sync'),
    (0, require_permissions_decorator_1.RequirePermissions)('emails:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EmailAccountController.prototype, "sync", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permissions_decorator_1.RequirePermissions)('emails:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmailAccountController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('emails:read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmailAccountController.prototype, "getById", null);
exports.EmailAccountController = EmailAccountController = __decorate([
    (0, swagger_1.ApiTags)('Email Accounts'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('email-accounts'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus,
        imap_smtp_service_1.ImapSmtpService,
        gmail_service_1.GmailService,
        outlook_service_1.OutlookService])
], EmailAccountController);
//# sourceMappingURL=email-account.controller.js.map