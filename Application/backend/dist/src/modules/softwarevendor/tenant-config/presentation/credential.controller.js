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
exports.CredentialController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const swagger_1 = require("@nestjs/swagger");
const identity_client_1 = require("@prisma/identity-client");
const api_response_1 = require("../../../../common/utils/api-response");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const credential_service_1 = require("../services/credential.service");
const credential_verifier_service_1 = require("../services/credential-verifier.service");
const token_refresher_service_1 = require("../services/token-refresher.service");
const credential_schema_service_1 = require("../services/credential-schema.service");
const upsert_credential_dto_1 = require("./dto/upsert-credential.dto");
const update_credential_dto_1 = require("./dto/update-credential.dto");
const credential_log_query_dto_1 = require("./dto/credential-log-query.dto");
let CredentialController = class CredentialController {
    constructor(credentialService, verifier, tokenRefresher, schemaService) {
        this.credentialService = credentialService;
        this.verifier = verifier;
        this.tokenRefresher = tokenRefresher;
        this.schemaService = schemaService;
    }
    async list(tenantId) {
        const credentials = await this.credentialService.listForTenant(tenantId);
        return api_response_1.ApiResponse.success(credentials, 'Credentials retrieved');
    }
    async getStatusSummary(tenantId) {
        const summary = await this.credentialService.getStatusSummary(tenantId);
        return api_response_1.ApiResponse.success(summary, 'Status summary retrieved');
    }
    async getAllSchemas() {
        const schemas = this.schemaService.getAllSchemas();
        return api_response_1.ApiResponse.success(schemas, 'Schemas retrieved');
    }
    async getSchema(provider) {
        const schema = this.schemaService.getSchema(provider);
        return api_response_1.ApiResponse.success(schema, 'Schema retrieved');
    }
    async getAccessLogs(tenantId, query) {
        const result = await this.credentialService.getAccessLogs(tenantId, {
            credentialId: query.credentialId,
            action: query.action,
            dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
            dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
            page: query.page,
            limit: query.limit,
        });
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async getDetail(tenantId, id) {
        const detail = await this.credentialService.getDetail(tenantId, id);
        return api_response_1.ApiResponse.success(detail, 'Credential detail retrieved');
    }
    async getCredentialLogs(tenantId, credentialId, query) {
        const result = await this.credentialService.getAccessLogs(tenantId, {
            credentialId,
            page: query.page,
            limit: query.limit,
        });
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async upsert(tenantId, userId, userName, dto) {
        const result = await this.credentialService.upsert(tenantId, {
            provider: dto.provider,
            instanceName: dto.instanceName,
            credentials: dto.credentials,
            description: dto.description,
            isPrimary: dto.isPrimary,
            dailyUsageLimit: dto.dailyUsageLimit,
            linkedAccountEmail: dto.linkedAccountEmail,
            webhookUrl: dto.webhookUrl,
            userId,
            userName,
        });
        try {
            await this.verifier.verify(tenantId, result.id);
        }
        catch { }
        return api_response_1.ApiResponse.success({ id: result.id }, 'Credential saved and verification initiated');
    }
    async update(tenantId, userId, userName, id, dto) {
        const existing = await this.credentialService.getDetail(tenantId, id);
        if (dto.credentials) {
            await this.credentialService.upsert(tenantId, {
                provider: existing.provider,
                instanceName: existing.instanceName ?? undefined,
                credentials: dto.credentials,
                description: dto.description ?? existing.description ?? undefined,
                isPrimary: dto.isPrimary ?? existing.isPrimary,
                dailyUsageLimit: dto.dailyUsageLimit ?? existing.dailyUsageLimit ?? undefined,
                userId,
                userName,
            });
        }
        return api_response_1.ApiResponse.success(null, 'Credential updated');
    }
    async revoke(tenantId, userId, userName, id) {
        await this.credentialService.revoke(tenantId, id, userId, userName);
        return api_response_1.ApiResponse.success(null, 'Credential revoked');
    }
    async verify(tenantId, id) {
        const result = await this.verifier.verify(tenantId, id);
        return api_response_1.ApiResponse.success(result, result.success ? 'Verification passed' : 'Verification failed');
    }
    async refresh(id) {
        const result = await this.tokenRefresher.refreshToken(id);
        return api_response_1.ApiResponse.success(result, result.success ? 'Token refreshed' : 'Refresh failed');
    }
};
exports.CredentialController = CredentialController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CredentialController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('status'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CredentialController.prototype, "getStatusSummary", null);
__decorate([
    (0, common_1.Get)('schemas'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CredentialController.prototype, "getAllSchemas", null);
__decorate([
    (0, common_1.Get)('schemas/:provider'),
    __param(0, (0, common_1.Param)('provider')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CredentialController.prototype, "getSchema", null);
__decorate([
    (0, common_1.Get)('logs'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, credential_log_query_dto_1.CredentialLogQueryDto]),
    __metadata("design:returntype", Promise)
], CredentialController.prototype, "getAccessLogs", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CredentialController.prototype, "getDetail", null);
__decorate([
    (0, common_1.Get)(':id/logs'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, credential_log_query_dto_1.CredentialLogQueryDto]),
    __metadata("design:returntype", Promise)
], CredentialController.prototype, "getCredentialLogs", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('name')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, upsert_credential_dto_1.UpsertCredentialDto]),
    __metadata("design:returntype", Promise)
], CredentialController.prototype, "upsert", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('name')),
    __param(3, (0, common_1.Param)('id')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, update_credential_dto_1.UpdateCredentialDto]),
    __metadata("design:returntype", Promise)
], CredentialController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('name')),
    __param(3, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], CredentialController.prototype, "revoke", null);
__decorate([
    (0, common_1.Post)(':id/verify'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CredentialController.prototype, "verify", null);
__decorate([
    (0, common_1.Post)(':id/refresh'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CredentialController.prototype, "refresh", null);
exports.CredentialController = CredentialController = __decorate([
    (0, swagger_1.ApiTags)('Credentials'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('credentials'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [credential_service_1.CredentialService,
        credential_verifier_service_1.CredentialVerifierService,
        token_refresher_service_1.TokenRefresherService,
        credential_schema_service_1.CredentialSchemaService])
], CredentialController);
//# sourceMappingURL=credential.controller.js.map