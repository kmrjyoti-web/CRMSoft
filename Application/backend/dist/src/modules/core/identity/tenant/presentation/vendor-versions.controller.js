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
exports.TenantForceUpdateController = exports.VendorVersionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../../../common/guards/jwt-auth.guard");
const vendor_guard_1 = require("../infrastructure/vendor.guard");
const current_user_decorator_1 = require("../../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../../common/utils/api-response");
const version_control_service_1 = require("../services/version-control.service");
const industry_patching_service_1 = require("../services/industry-patching.service");
const rollback_engine_service_1 = require("../services/rollback-engine.service");
const notion_docs_service_1 = require("../services/notion-docs.service");
let VendorVersionsController = class VendorVersionsController {
    constructor(versionService, patchingService, rollbackService, notionService) {
        this.versionService = versionService;
        this.patchingService = patchingService;
        this.rollbackService = rollbackService;
        this.notionService = notionService;
    }
    async listVersions(status, releaseType, search, page, limit) {
        const result = await this.versionService.listVersions({
            status, releaseType, search,
            page: Number(page) || 1,
            limit: Number(limit) || 20,
        });
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async getStats() {
        const stats = await this.versionService.getStats();
        return api_response_1.ApiResponse.success(stats);
    }
    async getVersion(id) {
        const version = await this.versionService.getById(id);
        return api_response_1.ApiResponse.success(version);
    }
    async createVersion(body) {
        const version = await this.versionService.create(body);
        return api_response_1.ApiResponse.success(version, 'Version created');
    }
    async updateVersion(id, body) {
        const version = await this.versionService.update(id, body);
        return api_response_1.ApiResponse.success(version, 'Version updated');
    }
    async publishVersion(id, user) {
        const version = await this.versionService.publish(id, user.email || user.id);
        return api_response_1.ApiResponse.success(version, 'Version published');
    }
    async rollbackVersion(id, user, reason) {
        const version = await this.versionService.rollback(id, reason || 'Manual rollback', user.email || user.id);
        return api_response_1.ApiResponse.success(version, 'Version rolled back');
    }
    async listPatches(versionId, industryCode, status, page, limit) {
        const result = await this.patchingService.listPatches({
            versionId, industryCode, status,
            page: Number(page) || 1,
            limit: Number(limit) || 20,
        });
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async createPatch(versionId, body) {
        const patch = await this.patchingService.create({ ...body, versionId });
        return api_response_1.ApiResponse.success(patch, 'Patch created');
    }
    async applyPatch(patchId, user) {
        const patch = await this.patchingService.applyPatch(patchId, user.email || user.id);
        return api_response_1.ApiResponse.success(patch, 'Patch applied');
    }
    async rollbackPatch(patchId) {
        const patch = await this.patchingService.rollbackPatch(patchId);
        return api_response_1.ApiResponse.success(patch, 'Patch rolled back');
    }
    async listBackups(versionId, backupType, page, limit) {
        const result = await this.rollbackService.listBackups({
            versionId, backupType,
            page: Number(page) || 1,
            limit: Number(limit) || 20,
        });
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async createBackup(versionId, body) {
        const backup = await this.rollbackService.createBackup({ ...body, versionId });
        return api_response_1.ApiResponse.success(backup, 'Backup created');
    }
    async restoreBackup(backupId, user) {
        const backup = await this.rollbackService.restoreBackup(backupId, user.email || user.id);
        return api_response_1.ApiResponse.success(backup, 'Backup restored');
    }
    async deleteBackup(backupId) {
        await this.rollbackService.deleteBackup(backupId);
        return api_response_1.ApiResponse.success(null, 'Backup deleted');
    }
    async publishToNotion(id) {
        const pageId = await this.notionService.publishReleaseNotes(id);
        return api_response_1.ApiResponse.success({ notionPageId: pageId }, pageId ? 'Published to Notion' : 'Notion not configured');
    }
    async notionStatus() {
        const status = await this.notionService.getStatus();
        return api_response_1.ApiResponse.success(status);
    }
};
exports.VendorVersionsController = VendorVersionsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all versions' }),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('releaseType')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], VendorVersionsController.prototype, "listVersions", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get version statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VendorVersionsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get version by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorVersionsController.prototype, "getVersion", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create new version' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VendorVersionsController.prototype, "createVersion", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update version' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VendorVersionsController.prototype, "updateVersion", null);
__decorate([
    (0, common_1.Post)(':id/publish'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Publish version' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VendorVersionsController.prototype, "publishVersion", null);
__decorate([
    (0, common_1.Post)(':id/rollback'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Rollback version' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], VendorVersionsController.prototype, "rollbackVersion", null);
__decorate([
    (0, common_1.Get)(':id/patches'),
    (0, swagger_1.ApiOperation)({ summary: 'List patches for a version' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('industryCode')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], VendorVersionsController.prototype, "listPatches", null);
__decorate([
    (0, common_1.Post)(':id/patches'),
    (0, swagger_1.ApiOperation)({ summary: 'Create industry patch' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VendorVersionsController.prototype, "createPatch", null);
__decorate([
    (0, common_1.Post)('patches/:patchId/apply'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Apply an industry patch' }),
    __param(0, (0, common_1.Param)('patchId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VendorVersionsController.prototype, "applyPatch", null);
__decorate([
    (0, common_1.Post)('patches/:patchId/rollback'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Rollback an industry patch' }),
    __param(0, (0, common_1.Param)('patchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorVersionsController.prototype, "rollbackPatch", null);
__decorate([
    (0, common_1.Get)(':id/backups'),
    (0, swagger_1.ApiOperation)({ summary: 'List backups for a version' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('backupType')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], VendorVersionsController.prototype, "listBackups", null);
__decorate([
    (0, common_1.Post)(':id/backups'),
    (0, swagger_1.ApiOperation)({ summary: 'Create manual backup' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VendorVersionsController.prototype, "createBackup", null);
__decorate([
    (0, common_1.Post)('backups/:backupId/restore'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Restore from backup' }),
    __param(0, (0, common_1.Param)('backupId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VendorVersionsController.prototype, "restoreBackup", null);
__decorate([
    (0, common_1.Delete)('backups/:backupId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a backup' }),
    __param(0, (0, common_1.Param)('backupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorVersionsController.prototype, "deleteBackup", null);
__decorate([
    (0, common_1.Post)(':id/notion/publish'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Publish release notes to Notion' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorVersionsController.prototype, "publishToNotion", null);
__decorate([
    (0, common_1.Get)('notion/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Check Notion integration status' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VendorVersionsController.prototype, "notionStatus", null);
exports.VendorVersionsController = VendorVersionsController = __decorate([
    (0, swagger_1.ApiTags)('Version Control'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, vendor_guard_1.VendorGuard),
    (0, common_1.Controller)('vendor/versions'),
    __metadata("design:paramtypes", [version_control_service_1.VersionControlService,
        industry_patching_service_1.IndustryPatchingService,
        rollback_engine_service_1.RollbackEngineService,
        notion_docs_service_1.NotionDocsService])
], VendorVersionsController);
let TenantForceUpdateController = class TenantForceUpdateController {
    constructor(versionService) {
        this.versionService = versionService;
    }
    async checkForceUpdate(user) {
        const tenantId = user.tenantId;
        if (!tenantId) {
            return api_response_1.ApiResponse.success({ pending: false, message: '', deadline: null });
        }
        const result = await this.versionService.checkForceUpdate(tenantId);
        return api_response_1.ApiResponse.success(result);
    }
};
exports.TenantForceUpdateController = TenantForceUpdateController;
__decorate([
    (0, common_1.Get)('force-update-check'),
    (0, swagger_1.ApiOperation)({ summary: 'Check if tenant has pending force updates' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantForceUpdateController.prototype, "checkForceUpdate", null);
exports.TenantForceUpdateController = TenantForceUpdateController = __decorate([
    (0, swagger_1.ApiTags)('Tenant Version'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('tenant'),
    __metadata("design:paramtypes", [version_control_service_1.VersionControlService])
], TenantForceUpdateController);
//# sourceMappingURL=vendor-versions.controller.js.map