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
exports.VersionControlController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const create_version_command_1 = require("../application/commands/create-version.command");
const publish_version_command_1 = require("../application/commands/publish-version.command");
const rollback_version_command_1 = require("../application/commands/rollback-version.command");
const create_patch_command_1 = require("../application/commands/create-patch.command");
const list_versions_query_1 = require("../application/queries/list-versions.query");
const get_version_query_1 = require("../application/queries/get-version.query");
const create_version_dto_1 = require("./dto/create-version.dto");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let VersionControlController = class VersionControlController {
    constructor(commandBus, queryBus, prisma) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
        this.prisma = prisma;
    }
    async create(dto, user) {
        const result = await this.commandBus.execute(new create_version_command_1.CreateVersionCommand(dto.version, dto.releaseType, dto.changelog ?? [], dto.breakingChanges ?? [], dto.migrationNotes, dto.codeName, dto.gitBranch, user.id));
        return api_response_1.ApiResponse.success(result, 'Version created');
    }
    async list(page = '1', limit = '20', status, releaseType) {
        const result = await this.queryBus.execute(new list_versions_query_1.ListVersionsQuery(+page, +limit, status, releaseType));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async getCurrent() {
        const result = await this.queryBus.execute(new get_version_query_1.GetCurrentVersionQuery());
        return api_response_1.ApiResponse.success(result);
    }
    async stats() {
        const [total, byVersion] = await Promise.all([
            this.prisma.identity.tenantVersion.count({ where: { isActive: true, isDeleted: false } }),
            this.prisma.identity.tenantVersion.groupBy({
                by: ['currentVersion'],
                where: { isActive: true, isDeleted: false },
                _count: { _all: true },
            }),
        ]);
        const distribution = byVersion.map((r) => ({
            version: r.currentVersion,
            count: r._count._all,
            percent: total > 0 ? Math.round((r._count._all / total) * 100) : 0,
        }));
        return api_response_1.ApiResponse.success({ total, distribution });
    }
    async getById(id) {
        const result = await this.queryBus.execute(new get_version_query_1.GetVersionQuery(id));
        return api_response_1.ApiResponse.success(result);
    }
    async update(id, dto) {
        const result = await this.prisma.platform.appVersion.update({ where: { id }, data: dto });
        return api_response_1.ApiResponse.success(result, 'Version updated');
    }
    async publish(id, dto, user) {
        const result = await this.commandBus.execute(new publish_version_command_1.PublishVersionCommand(id, user.id, dto.gitTag, dto.gitCommitHash));
        return api_response_1.ApiResponse.success(result, 'Version published');
    }
    async rollback(id, dto, user) {
        const result = await this.commandBus.execute(new rollback_version_command_1.RollbackVersionCommand(id, user.id, dto.rollbackReason));
        return api_response_1.ApiResponse.success(result, 'Rollback complete');
    }
    async createPatch(versionId, dto, user) {
        const result = await this.commandBus.execute(new create_patch_command_1.CreatePatchCommand(versionId, dto.industryCode, dto.patchName, dto.description, dto.schemaChanges, dto.configOverrides, dto.menuOverrides, dto.forceUpdate ?? false, user.id));
        return api_response_1.ApiResponse.success(result, 'Patch created');
    }
    async listPatches(versionId, industryCode) {
        const where = { versionId };
        if (industryCode)
            where.industryCode = industryCode;
        const patches = await this.prisma.platform.industryPatch.findMany({ where, orderBy: { createdAt: 'desc' } });
        return api_response_1.ApiResponse.success(patches);
    }
    async applyPatch(patchId, user) {
        const patch = await this.prisma.platform.industryPatch.update({
            where: { id: patchId },
            data: { status: 'APPLIED', appliedAt: new Date(), appliedBy: user.id },
        });
        return api_response_1.ApiResponse.success(patch, 'Patch applied');
    }
    async rollbackPatch(patchId) {
        const patch = await this.prisma.platform.industryPatch.update({
            where: { id: patchId },
            data: { status: 'ROLLED_BACK' },
        });
        return api_response_1.ApiResponse.success(patch, 'Patch rolled back');
    }
    async listBackups(versionId) {
        const backups = await this.prisma.identity.versionBackup.findMany({
            where: { versionId },
            orderBy: { createdAt: 'desc' },
        });
        return api_response_1.ApiResponse.success(backups);
    }
    async tenantVersions(page = '1', limit = '20') {
        const p = +page, l = +limit;
        const [data, total] = await Promise.all([
            this.prisma.identity.tenantVersion.findMany({
                where: { isDeleted: false },
                skip: (p - 1) * l,
                take: l,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.identity.tenantVersion.count({ where: { isDeleted: false } }),
        ]);
        return api_response_1.ApiResponse.paginated(data, total, p, l);
    }
    async forceUpdate(body) {
        const where = body.tenantIds?.length ? { tenantId: { in: body.tenantIds }, isDeleted: false } : { isDeleted: false };
        const { count } = await this.prisma.identity.tenantVersion.updateMany({
            where,
            data: {
                forceUpdatePending: true,
                forceUpdateMessage: body.message,
                forceUpdateDeadline: body.deadline ? new Date(body.deadline) : undefined,
            },
        });
        return api_response_1.ApiResponse.success({ tenantsUpdated: count }, 'Force update triggered');
    }
};
exports.VersionControlController = VersionControlController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new version (DRAFT)' }),
    (0, require_permissions_decorator_1.RequirePermissions)('versions:create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_version_dto_1.CreateVersionDto, Object]),
    __metadata("design:returntype", Promise)
], VersionControlController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all versions' }),
    (0, require_permissions_decorator_1.RequirePermissions)('versions:read'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('releaseType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], VersionControlController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('current'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current LIVE version' }),
    (0, require_permissions_decorator_1.RequirePermissions)('versions:read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VersionControlController.prototype, "getCurrent", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Version distribution stats (% of tenants per version)' }),
    (0, require_permissions_decorator_1.RequirePermissions)('versions:read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VersionControlController.prototype, "stats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get version detail' }),
    (0, require_permissions_decorator_1.RequirePermissions)('versions:read'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VersionControlController.prototype, "getById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update version (DRAFT only)' }),
    (0, require_permissions_decorator_1.RequirePermissions)('versions:update'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VersionControlController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/publish'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Publish version (backup ? live)' }),
    (0, require_permissions_decorator_1.RequirePermissions)('versions:publish'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_version_dto_1.PublishVersionDto, Object]),
    __metadata("design:returntype", Promise)
], VersionControlController.prototype, "publish", null);
__decorate([
    (0, common_1.Post)(':id/rollback'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Rollback to this version (backup current ? restore target)' }),
    (0, require_permissions_decorator_1.RequirePermissions)('versions:rollback'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_version_dto_1.RollbackVersionDto, Object]),
    __metadata("design:returntype", Promise)
], VersionControlController.prototype, "rollback", null);
__decorate([
    (0, common_1.Post)(':versionId/patches'),
    (0, swagger_1.ApiOperation)({ summary: 'Create industry patch for this version' }),
    (0, require_permissions_decorator_1.RequirePermissions)('versions:create'),
    __param(0, (0, common_1.Param)('versionId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_version_dto_1.CreatePatchDto, Object]),
    __metadata("design:returntype", Promise)
], VersionControlController.prototype, "createPatch", null);
__decorate([
    (0, common_1.Get)(':versionId/patches'),
    (0, swagger_1.ApiOperation)({ summary: 'List patches for this version' }),
    (0, require_permissions_decorator_1.RequirePermissions)('versions:read'),
    __param(0, (0, common_1.Param)('versionId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('industryCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], VersionControlController.prototype, "listPatches", null);
__decorate([
    (0, common_1.Post)('patches/:patchId/apply'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Apply patch (mark as APPLIED)' }),
    (0, require_permissions_decorator_1.RequirePermissions)('versions:publish'),
    __param(0, (0, common_1.Param)('patchId', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VersionControlController.prototype, "applyPatch", null);
__decorate([
    (0, common_1.Post)('patches/:patchId/rollback'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Rollback patch' }),
    (0, require_permissions_decorator_1.RequirePermissions)('versions:rollback'),
    __param(0, (0, common_1.Param)('patchId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VersionControlController.prototype, "rollbackPatch", null);
__decorate([
    (0, common_1.Get)(':versionId/backups'),
    (0, swagger_1.ApiOperation)({ summary: 'List backups for this version' }),
    (0, require_permissions_decorator_1.RequirePermissions)('versions:read'),
    __param(0, (0, common_1.Param)('versionId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VersionControlController.prototype, "listBackups", null);
__decorate([
    (0, common_1.Get)('tenant-versions/list'),
    (0, swagger_1.ApiOperation)({ summary: 'List tenant version assignments' }),
    (0, require_permissions_decorator_1.RequirePermissions)('versions:read'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VersionControlController.prototype, "tenantVersions", null);
__decorate([
    (0, common_1.Post)('tenant-versions/force-update'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger force update for tenants on old versions' }),
    (0, require_permissions_decorator_1.RequirePermissions)('versions:publish'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VersionControlController.prototype, "forceUpdate", null);
exports.VersionControlController = VersionControlController = __decorate([
    (0, swagger_1.ApiTags)('Version Control'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('vendor/versions'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus,
        prisma_service_1.PrismaService])
], VersionControlController);
//# sourceMappingURL=version-control.controller.js.map