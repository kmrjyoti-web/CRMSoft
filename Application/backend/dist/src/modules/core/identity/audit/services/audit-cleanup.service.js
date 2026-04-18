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
var AuditCleanupService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditCleanupService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const error_utils_1 = require("../../../../../common/utils/error.utils");
const DEFAULT_RETENTION_DAYS = 730;
let AuditCleanupService = AuditCleanupService_1 = class AuditCleanupService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AuditCleanupService_1.name);
    }
    async cleanupOldLogs() {
        const policies = await this.prisma.identity.auditRetentionPolicy.findMany({
            where: { isActive: true },
        });
        let totalDeleted = 0;
        for (const policy of policies) {
            const cutoff = new Date(Date.now() - policy.retentionDays * 86400000);
            try {
                await this.prisma.identity.auditFieldChange.deleteMany({
                    where: {
                        auditLog: {
                            entityType: policy.entityType,
                            createdAt: { lt: cutoff },
                        },
                    },
                });
                const result = await this.prisma.identity.auditLog.deleteMany({
                    where: {
                        entityType: policy.entityType,
                        createdAt: { lt: cutoff },
                    },
                });
                totalDeleted += result.count;
                if (result.count > 0) {
                    this.logger.log(`Cleaned ${result.count} audit logs for ${policy.entityType} (older than ${cutoff.toISOString().split('T')[0]})`);
                }
            }
            catch (error) {
                this.logger.error(`Cleanup failed for ${policy.entityType}: ${(0, error_utils_1.getErrorMessage)(error)}`);
            }
        }
        const policyEntityTypes = policies.map(p => p.entityType);
        const defaultCutoff = new Date(Date.now() - DEFAULT_RETENTION_DAYS * 86400000);
        if (policyEntityTypes.length > 0) {
            const defaultResult = await this.prisma.identity.auditLog.deleteMany({
                where: {
                    entityType: { notIn: policyEntityTypes },
                    createdAt: { lt: defaultCutoff },
                },
            });
            totalDeleted += defaultResult.count;
            if (defaultResult.count > 0) {
                this.logger.log(`Cleaned ${defaultResult.count} audit logs (default policy, older than ${defaultCutoff.toISOString().split('T')[0]})`);
            }
        }
        if (totalDeleted > 0) {
            this.logger.log(`Total cleaned: ${totalDeleted} audit logs`);
        }
        return { totalDeleted };
    }
    async getCleanupPreview() {
        const policies = await this.prisma.identity.auditRetentionPolicy.findMany({
            where: { isActive: true },
        });
        const preview = [];
        for (const policy of policies) {
            const cutoff = new Date(Date.now() - policy.retentionDays * 86400000);
            const [totalRecords, wouldDelete] = await Promise.all([
                this.prisma.identity.auditLog.count({ where: { entityType: policy.entityType } }),
                this.prisma.identity.auditLog.count({ where: { entityType: policy.entityType, createdAt: { lt: cutoff } } }),
            ]);
            preview.push({
                entityType: policy.entityType,
                totalRecords,
                wouldDelete,
                retentionDays: policy.retentionDays,
            });
        }
        return preview;
    }
};
exports.AuditCleanupService = AuditCleanupService;
exports.AuditCleanupService = AuditCleanupService = AuditCleanupService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditCleanupService);
//# sourceMappingURL=audit-cleanup.service.js.map