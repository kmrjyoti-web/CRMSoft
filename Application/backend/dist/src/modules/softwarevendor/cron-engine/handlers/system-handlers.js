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
var ExportFileCleanupHandler_1, BackupDbHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupDbHandler = exports.ExportFileCleanupHandler = exports.ResetDailyCountersHandler = exports.AuditLogCleanupHandler = exports.CredentialHealthCheckHandler = exports.TokenRefreshHandler = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let TokenRefreshHandler = class TokenRefreshHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.jobCode = 'TOKEN_REFRESH';
    }
    async execute() {
        const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
        const expiring = await this.prisma.tenantCredential.findMany({
            where: {
                status: 'ACTIVE',
                provider: { in: ['GMAIL', 'OUTLOOK', 'GOOGLE_DRIVE', 'ONEDRIVE', 'DROPBOX'] },
                tokenExpiresAt: { lt: oneHourFromNow },
            },
        });
        return { recordsProcessed: expiring.length, details: { expiringTokens: expiring.length } };
    }
};
exports.TokenRefreshHandler = TokenRefreshHandler;
exports.TokenRefreshHandler = TokenRefreshHandler = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TokenRefreshHandler);
let CredentialHealthCheckHandler = class CredentialHealthCheckHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.jobCode = 'CREDENTIAL_HEALTH_CHECK';
    }
    async execute() {
        const active = await this.prisma.tenantCredential.findMany({
            where: { status: 'ACTIVE' },
        });
        return { recordsProcessed: active.length };
    }
};
exports.CredentialHealthCheckHandler = CredentialHealthCheckHandler;
exports.CredentialHealthCheckHandler = CredentialHealthCheckHandler = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CredentialHealthCheckHandler);
let AuditLogCleanupHandler = class AuditLogCleanupHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.jobCode = 'AUDIT_LOG_CLEANUP';
    }
    async execute(params) {
        const days = params.retentionDays ?? 180;
        const cutoff = new Date(Date.now() - days * 86400000);
        const policies = await this.prisma.auditRetentionPolicy.findMany({
            where: { isActive: true },
        });
        let total = 0;
        for (const policy of policies) {
            const policyCutoff = new Date(Date.now() - policy.retentionDays * 86400000);
            const result = await this.prisma.auditLog.deleteMany({
                where: { entityType: policy.entityType, createdAt: { lt: policyCutoff } },
            });
            total += result.count;
        }
        return { recordsProcessed: total };
    }
};
exports.AuditLogCleanupHandler = AuditLogCleanupHandler;
exports.AuditLogCleanupHandler = AuditLogCleanupHandler = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditLogCleanupHandler);
let ResetDailyCountersHandler = class ResetDailyCountersHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.jobCode = 'RESET_DAILY_COUNTERS';
    }
    async execute() {
        const result = await this.prisma.tenantCredential.updateMany({
            where: { dailyUsageCount: { gt: 0 } },
            data: { dailyUsageCount: 0 },
        });
        return { recordsProcessed: result.count };
    }
};
exports.ResetDailyCountersHandler = ResetDailyCountersHandler;
exports.ResetDailyCountersHandler = ResetDailyCountersHandler = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ResetDailyCountersHandler);
let ExportFileCleanupHandler = ExportFileCleanupHandler_1 = class ExportFileCleanupHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.jobCode = 'EXPORT_FILE_CLEANUP';
        this.logger = new common_1.Logger(ExportFileCleanupHandler_1.name);
    }
    async execute(params) {
        const days = params.retentionDays ?? 30;
        const cutoff = new Date(Date.now() - days * 86400000);
        const result = await this.prisma.working.reportExportLog.deleteMany({
            where: { status: 'DONE', createdAt: { lt: cutoff } },
        });
        this.logger.log(`Cleaned ${result.count} old export records`);
        return { recordsProcessed: result.count };
    }
};
exports.ExportFileCleanupHandler = ExportFileCleanupHandler;
exports.ExportFileCleanupHandler = ExportFileCleanupHandler = ExportFileCleanupHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExportFileCleanupHandler);
let BackupDbHandler = BackupDbHandler_1 = class BackupDbHandler {
    constructor() {
        this.jobCode = 'BACKUP_DB';
        this.logger = new common_1.Logger(BackupDbHandler_1.name);
    }
    async execute(params) {
        this.logger.log(`Backup job triggered (placeholder) — path: ${params.backupPath ?? '/backups'}`);
        return { recordsProcessed: 1, details: { status: 'placeholder' } };
    }
};
exports.BackupDbHandler = BackupDbHandler;
exports.BackupDbHandler = BackupDbHandler = BackupDbHandler_1 = __decorate([
    (0, common_1.Injectable)()
], BackupDbHandler);
//# sourceMappingURL=system-handlers.js.map