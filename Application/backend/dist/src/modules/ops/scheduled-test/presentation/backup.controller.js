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
var BackupController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../../../common/guards/jwt-auth.guard");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const backup_validation_service_1 = require("../infrastructure/services/backup-validation.service");
const backup_record_repository_1 = require("../infrastructure/repositories/backup-record.repository");
const common_2 = require("@nestjs/common");
const db_operations_service_1 = require("../../test-environment/infrastructure/db-operations.service");
let BackupController = BackupController_1 = class BackupController {
    constructor(backupValidation, dbOps, repo) {
        this.backupValidation = backupValidation;
        this.dbOps = dbOps;
        this.repo = repo;
        this.logger = new common_2.Logger(BackupController_1.name);
    }
    async list(tenantId) {
        const data = await this.repo.findByTenantId(tenantId, 20);
        return api_response_1.ApiResponse.success(data);
    }
    async create(tenantId, userId, body) {
        const record = await this.repo.create({
            tenantId,
            dbName: body.dbName,
            backupUrl: body.backupUrl,
            checksum: body.checksum,
            sizeBytes: BigInt(body.sizeBytes),
            tableCount: body.tableCount,
            rowCount: body.rowCount !== undefined ? BigInt(body.rowCount) : undefined,
            expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
            createdById: userId,
        });
        return api_response_1.ApiResponse.success(record, 'Backup record created');
    }
    async validate(id) {
        const result = await this.backupValidation.validateBackup(id);
        if (!result.valid) {
            return api_response_1.ApiResponse.error(result.reason ?? 'Validation failed');
        }
        return api_response_1.ApiResponse.success({ valid: true }, 'Backup validated successfully');
    }
    async createFromDump(tenantId, userId, body) {
        if (!this.dbOps.isPgDumpAvailable()) {
            return api_response_1.ApiResponse.error('pg_dump is not available on this server. Register backup records manually via POST /ops/backup.');
        }
        const { filePath, sizeBytes, checksum, tableCount } = await this.dbOps.createBackup(body.dbUrl);
        const src = this.dbOps.parseDbUrl(body.dbUrl);
        const expiresAt = body.expiresInHours
            ? new Date(Date.now() + body.expiresInHours * 3_600_000)
            : undefined;
        const record = await this.repo.create({
            tenantId,
            dbName: src.database,
            backupUrl: `file://${filePath}`,
            checksum,
            sizeBytes: BigInt(sizeBytes),
            tableCount,
            expiresAt,
            createdById: userId,
        });
        this.logger.log(`Backup created & recorded: ${record.id} for db=${src.database}`);
        return api_response_1.ApiResponse.success({ ...record, filePath }, 'Backup created successfully');
    }
    async check(tenantId) {
        const backup = await this.repo.findLatestValidated(tenantId);
        if (!backup) {
            return api_response_1.ApiResponse.success({
                hasValidBackup: false,
                message: 'No validated backup found. Please backup your database before running live DB tests.',
            });
        }
        return api_response_1.ApiResponse.success({
            hasValidBackup: true,
            backupId: backup.id,
            createdAt: backup.createdAt,
            dbName: backup.dbName,
        });
    }
};
exports.BackupController = BackupController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('validate/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "validate", null);
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "createFromDump", null);
__decorate([
    (0, common_1.Post)('check'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "check", null);
exports.BackupController = BackupController = BackupController_1 = __decorate([
    (0, common_1.Controller)('ops/backup'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, require_permissions_decorator_1.RequirePermissions)('ops:manage'),
    __param(2, (0, common_2.Inject)(backup_record_repository_1.BACKUP_RECORD_REPOSITORY)),
    __metadata("design:paramtypes", [backup_validation_service_1.BackupValidationService,
        db_operations_service_1.DbOperationsService, Object])
], BackupController);
//# sourceMappingURL=backup.controller.js.map