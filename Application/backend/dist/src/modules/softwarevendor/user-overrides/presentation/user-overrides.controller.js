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
exports.UserOverridesController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const ubac_engine_1 = require("../../../../core/permissions/engines/ubac.engine");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const user_override_dto_1 = require("./dto/user-override.dto");
let UserOverridesController = class UserOverridesController {
    constructor(prisma, ubacEngine) {
        this.prisma = prisma;
        this.ubacEngine = ubacEngine;
    }
    async grant(userId, dto, createdBy) {
        const existing = await this.prisma.userPermissionOverride.findFirst({
            where: { userId, action: dto.action, effect: 'grant' },
        });
        let override;
        if (existing) {
            override = await this.prisma.userPermissionOverride.update({
                where: { id: existing.id },
                data: {
                    reason: dto.reason, expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
                    createdBy,
                },
            });
        }
        else {
            override = await this.prisma.userPermissionOverride.create({
                data: {
                    userId, action: dto.action, effect: 'grant',
                    reason: dto.reason, expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
                    createdBy,
                },
            });
        }
        this.ubacEngine.invalidateUser(userId);
        return api_response_1.ApiResponse.success(override, 'Permission granted');
    }
    async deny(userId, dto, createdBy) {
        const existingDeny = await this.prisma.userPermissionOverride.findFirst({
            where: { userId, action: dto.action, effect: 'deny' },
        });
        let override;
        if (existingDeny) {
            override = await this.prisma.userPermissionOverride.update({
                where: { id: existingDeny.id },
                data: {
                    reason: dto.reason, expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
                    createdBy,
                },
            });
        }
        else {
            override = await this.prisma.userPermissionOverride.create({
                data: {
                    userId, action: dto.action, effect: 'deny',
                    reason: dto.reason, expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
                    createdBy,
                },
            });
        }
        this.ubacEngine.invalidateUser(userId);
        return api_response_1.ApiResponse.success(override, 'Permission denied');
    }
    async revoke(userId, action) {
        const deleted = await this.prisma.userPermissionOverride.deleteMany({
            where: { userId, action },
        });
        this.ubacEngine.invalidateUser(userId);
        return api_response_1.ApiResponse.success({ removed: deleted.count }, 'Override revoked');
    }
    async getOverrides(userId) {
        const overrides = await this.prisma.userPermissionOverride.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        return api_response_1.ApiResponse.success(overrides);
    }
    async listAll() {
        const overrides = await this.prisma.userPermissionOverride.findMany({
            include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
            orderBy: { createdAt: 'desc' },
        });
        return api_response_1.ApiResponse.success(overrides);
    }
};
exports.UserOverridesController = UserOverridesController;
__decorate([
    (0, common_1.Post)(':userId/grant'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_override_dto_1.GrantPermissionDto, String]),
    __metadata("design:returntype", Promise)
], UserOverridesController.prototype, "grant", null);
__decorate([
    (0, common_1.Post)(':userId/deny'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_override_dto_1.DenyPermissionDto, String]),
    __metadata("design:returntype", Promise)
], UserOverridesController.prototype, "deny", null);
__decorate([
    (0, common_1.Delete)(':userId/:action'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('action')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserOverridesController.prototype, "revoke", null);
__decorate([
    (0, common_1.Get)(':userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserOverridesController.prototype, "getOverrides", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserOverridesController.prototype, "listAll", null);
exports.UserOverridesController = UserOverridesController = __decorate([
    (0, common_1.Controller)('user-overrides'),
    (0, require_permissions_decorator_1.RequirePermissions)('permissions:manage'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ubac_engine_1.UbacEngine])
], UserOverridesController);
//# sourceMappingURL=user-overrides.controller.js.map