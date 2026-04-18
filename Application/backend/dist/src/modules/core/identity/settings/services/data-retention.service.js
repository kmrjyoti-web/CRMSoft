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
var DataRetentionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataRetentionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const app_error_1 = require("../../../../../common/errors/app-error");
const ENTITY_MAP = {
    Lead: 'lead',
    Activity: 'activity',
    Notification: 'notification',
    AuditLog: 'auditLog',
    ErrorLog: 'errorLog',
    SyncChangeLog: 'syncChangeLog',
    CronJobRunLog: 'cronJobRunLog',
};
let DataRetentionService = DataRetentionService_1 = class DataRetentionService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(DataRetentionService_1.name);
    }
    async getAll(tenantId) {
        return this.prisma.identity.dataRetentionPolicy.findMany({ where: { tenantId } });
    }
    async update(tenantId, entityName, data) {
        const policy = await this.prisma.identity.dataRetentionPolicy.findUnique({
            where: { tenantId_entityName: { tenantId, entityName } },
        });
        if (!policy)
            throw app_error_1.AppError.from('NOT_FOUND');
        const { scopeFilter, ...rest } = data;
        const updateData = { ...rest };
        if (scopeFilter !== undefined)
            updateData.scopeFilter = scopeFilter;
        return this.prisma.identity.dataRetentionPolicy.update({ where: { id: policy.id }, data: updateData });
    }
    async preview(tenantId, entityName) {
        const policy = await this.prisma.identity.dataRetentionPolicy.findUnique({
            where: { tenantId_entityName: { tenantId, entityName } },
        });
        if (!policy)
            throw app_error_1.AppError.from('NOT_FOUND');
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - policy.retentionDays);
        const delegate = this.prisma[ENTITY_MAP[entityName]];
        if (!delegate)
            return { recordCount: 0, oldestRecord: null, action: policy.action };
        const where = this.buildWhere(tenantId, cutoff, policy.scopeFilter);
        const count = await delegate.count({ where });
        const oldest = await delegate.findFirst({ where, orderBy: { createdAt: 'asc' }, select: { createdAt: true } });
        return { recordCount: count, oldestRecord: oldest?.createdAt ?? null, action: policy.action };
    }
    async execute(tenantId) {
        const policies = await this.prisma.identity.dataRetentionPolicy.findMany({
            where: { tenantId, isEnabled: true },
        });
        const results = [];
        for (const policy of policies) {
            const delegate = this.prisma[ENTITY_MAP[policy.entityName]];
            if (!delegate) {
                results.push({ entityName: policy.entityName, action: policy.action, recordsAffected: 0, skipped: true, reason: 'Unknown entity' });
                continue;
            }
            if (policy.requireApproval) {
                results.push({ entityName: policy.entityName, action: policy.action, recordsAffected: 0, skipped: true, reason: 'Requires approval' });
                continue;
            }
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - policy.retentionDays);
            const where = this.buildWhere(tenantId, cutoff, policy.scopeFilter);
            let affected = 0;
            try {
                if (policy.action === 'HARD_DELETE') {
                    const result = await delegate.deleteMany({ where });
                    affected = result.count;
                }
                else {
                    const updateData = policy.action === 'ANONYMIZE'
                        ? { email: '***', phone: '***', name: '***' }
                        : {};
                    const result = await delegate.updateMany({ where, data: updateData });
                    affected = result.count;
                }
            }
            catch (err) {
                this.logger.error(`Retention failed for ${policy.entityName}: ${err.message}`);
            }
            await this.prisma.identity.dataRetentionPolicy.update({
                where: { id: policy.id },
                data: { lastExecutedAt: new Date(), lastRecordsAffected: affected },
            });
            results.push({ entityName: policy.entityName, action: policy.action, recordsAffected: affected, skipped: false });
        }
        return results;
    }
    buildWhere(tenantId, cutoff, scopeFilter) {
        const where = { tenantId, createdAt: { lt: cutoff } };
        if (scopeFilter)
            Object.assign(where, scopeFilter);
        return where;
    }
};
exports.DataRetentionService = DataRetentionService;
exports.DataRetentionService = DataRetentionService = DataRetentionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DataRetentionService);
//# sourceMappingURL=data-retention.service.js.map