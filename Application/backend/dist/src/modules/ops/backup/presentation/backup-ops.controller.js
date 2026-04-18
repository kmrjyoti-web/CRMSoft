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
exports.BackupOpsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../../../common/guards/jwt-auth.guard");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const backup_service_1 = require("../backup.service");
let BackupOpsController = class BackupOpsController {
    constructor(backup) {
        this.backup = backup;
    }
    async list(schema, limit) {
        const data = await this.backup.listBackups(schema, limit ? Number(limit) : 50);
        return api_response_1.ApiResponse.success(data);
    }
    async get(id) {
        const data = await this.backup.getBackup(id);
        if (!data)
            throw new common_1.NotFoundException('Backup not found');
        return api_response_1.ApiResponse.success(data);
    }
    async download(id) {
        const url = await this.backup.getPresignedDownloadUrl(id);
        if (!url)
            throw new common_1.NotFoundException('No R2 file for this backup');
        return api_response_1.ApiResponse.success({ url, expiresIn: 3600 }, 'Presigned URL valid for 1 hour');
    }
    async run(body, userId) {
        if (!this.backup.isPgDumpAvailable()) {
            return api_response_1.ApiResponse.error('pg_dump is not available on this server');
        }
        const result = await this.backup.backupSchema(body.schema, userId, body.retentionDays);
        return api_response_1.ApiResponse.success(result, result.status === 'SUCCESS' ? 'Backup completed' : 'Backup failed');
    }
    async runAll(userId) {
        if (!this.backup.isPgDumpAvailable()) {
            return api_response_1.ApiResponse.error('pg_dump is not available on this server');
        }
        const results = await this.backup.backupAllSchemas(userId);
        const succeeded = results.filter((r) => r.status === 'SUCCESS').length;
        return api_response_1.ApiResponse.success(results, `${succeeded}/${results.length} schemas backed up`);
    }
    async restore(id, userId, body) {
        const result = await this.backup.restoreFromBackup(id, userId);
        return api_response_1.ApiResponse.success(result, result.status === 'SUCCESS' ? 'Restore completed' : 'Restore failed');
    }
    async listRestores(limit) {
        const data = await this.backup.listRestores(limit ? Number(limit) : 20);
        return api_response_1.ApiResponse.success(data);
    }
    async cleanup() {
        const result = await this.backup.cleanupExpiredBackups();
        return api_response_1.ApiResponse.success(result, `Deleted ${result.deleted} expired backups`);
    }
    async pgDumpStatus() {
        return api_response_1.ApiResponse.success({ available: this.backup.isPgDumpAvailable() });
    }
};
exports.BackupOpsController = BackupOpsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('schema')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BackupOpsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BackupOpsController.prototype, "get", null);
__decorate([
    (0, common_1.Get)(':id/download'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BackupOpsController.prototype, "download", null);
__decorate([
    (0, common_1.Post)('run'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BackupOpsController.prototype, "run", null);
__decorate([
    (0, common_1.Post)('run-all'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BackupOpsController.prototype, "runAll", null);
__decorate([
    (0, common_1.Post)(':id/restore'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], BackupOpsController.prototype, "restore", null);
__decorate([
    (0, common_1.Get)('restores/list'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BackupOpsController.prototype, "listRestores", null);
__decorate([
    (0, common_1.Post)('cleanup'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BackupOpsController.prototype, "cleanup", null);
__decorate([
    (0, common_1.Get)('status/pg-dump'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BackupOpsController.prototype, "pgDumpStatus", null);
exports.BackupOpsController = BackupOpsController = __decorate([
    (0, common_1.Controller)('ops/backups'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, require_permissions_decorator_1.RequirePermissions)('ops:manage'),
    __metadata("design:paramtypes", [backup_service_1.BackupService])
], BackupOpsController);
//# sourceMappingURL=backup-ops.controller.js.map