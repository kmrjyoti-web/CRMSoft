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
exports.CredentialAdminController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const swagger_1 = require("@nestjs/swagger");
const identity_client_1 = require("@prisma/identity-client");
const api_response_1 = require("../../../../common/utils/api-response");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const encryption_service_1 = require("../services/encryption.service");
const credential_schema_service_1 = require("../services/credential-schema.service");
const global_default_credential_dto_1 = require("./dto/global-default-credential.dto");
const super_admin_guard_1 = require("../../../core/identity/tenant/infrastructure/super-admin.guard");
let CredentialAdminController = class CredentialAdminController {
    constructor(prisma, encryption, schemaService) {
        this.prisma = prisma;
        this.encryption = encryption;
        this.schemaService = schemaService;
    }
    async listDefaults() {
        const defaults = await this.prisma.globalDefaultCredential.findMany({
            orderBy: { provider: 'asc' },
        });
        const result = defaults.map((d) => {
            const decrypted = this.encryption.decrypt(d.encryptedData);
            const masked = {};
            for (const [key, val] of Object.entries(decrypted)) {
                masked[key] = this.encryption.mask(String(val));
            }
            return {
                id: d.id,
                provider: d.provider,
                status: d.status,
                description: d.description,
                isEnabled: d.isEnabled,
                maskedCredentials: masked,
                createdAt: d.createdAt,
                updatedAt: d.updatedAt,
            };
        });
        return api_response_1.ApiResponse.success(result, 'Global defaults retrieved');
    }
    async createDefault(dto) {
        const validation = this.schemaService.validate(dto.provider, dto.credentials);
        if (!validation.valid) {
            return api_response_1.ApiResponse.error(validation.errors.join('; '));
        }
        const encryptedData = this.encryption.encrypt(dto.credentials);
        const result = await this.prisma.globalDefaultCredential.upsert({
            where: { provider: dto.provider },
            create: {
                provider: dto.provider,
                encryptedData,
                description: dto.description,
                isEnabled: dto.isEnabled ?? false,
                status: 'ACTIVE',
            },
            update: {
                encryptedData,
                description: dto.description,
                isEnabled: dto.isEnabled,
            },
        });
        return api_response_1.ApiResponse.success({ id: result.id }, 'Global default credential saved');
    }
    async updateDefault(provider, dto) {
        const encryptedData = this.encryption.encrypt(dto.credentials);
        await this.prisma.globalDefaultCredential.update({
            where: { provider },
            data: {
                encryptedData,
                description: dto.description,
                isEnabled: dto.isEnabled,
            },
        });
        return api_response_1.ApiResponse.success(null, 'Global default credential updated');
    }
    async rotateKey(body) {
        const result = await this.encryption.rotateEncryptionKey(body.oldKey, body.newKey);
        return api_response_1.ApiResponse.success(result, `${result.rotated} credentials re-encrypted`);
    }
};
exports.CredentialAdminController = CredentialAdminController;
__decorate([
    (0, common_1.Get)('defaults'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CredentialAdminController.prototype, "listDefaults", null);
__decorate([
    (0, common_1.Post)('defaults'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [global_default_credential_dto_1.GlobalDefaultCredentialDto]),
    __metadata("design:returntype", Promise)
], CredentialAdminController.prototype, "createDefault", null);
__decorate([
    (0, common_1.Put)('defaults/:provider'),
    __param(0, (0, common_1.Param)('provider')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, global_default_credential_dto_1.GlobalDefaultCredentialDto]),
    __metadata("design:returntype", Promise)
], CredentialAdminController.prototype, "updateDefault", null);
__decorate([
    (0, common_1.Post)('rotate-key'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CredentialAdminController.prototype, "rotateKey", null);
exports.CredentialAdminController = CredentialAdminController = __decorate([
    (0, swagger_1.ApiTags)('Credential Admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('admin/credentials'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), super_admin_guard_1.SuperAdminGuard),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        encryption_service_1.EncryptionService,
        credential_schema_service_1.CredentialSchemaService])
], CredentialAdminController);
//# sourceMappingURL=credential-admin.controller.js.map