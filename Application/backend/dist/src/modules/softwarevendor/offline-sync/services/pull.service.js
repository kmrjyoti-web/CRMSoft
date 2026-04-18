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
var PullService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PullService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const entity_resolver_service_1 = require("./entity-resolver.service");
const sync_scope_resolver_service_1 = require("./sync-scope-resolver.service");
let PullService = PullService_1 = class PullService {
    constructor(prisma, entityResolver, scopeResolver) {
        this.prisma = prisma;
        this.entityResolver = entityResolver;
        this.scopeResolver = scopeResolver;
        this.logger = new common_1.Logger(PullService_1.name);
    }
    async pull(params) {
        const { entityName, userId, deviceId, lastPulledAt, cursor, limit = 500 } = params;
        const startTime = Date.now();
        const serverTimestamp = new Date();
        const policy = await this.prisma.working.syncPolicy.findFirst({
            where: { entityName, isEnabled: true },
        });
        if (!policy) {
            throw new common_1.BadRequestException(`No sync policy found for entity "${entityName}"`);
        }
        if (policy.direction === 'UPLOAD_ONLY' || policy.direction === 'DISABLED') {
            throw new common_1.BadRequestException(`Download not allowed for entity "${entityName}" (direction: ${policy.direction})`);
        }
        const scopeWhere = await this.scopeResolver.resolveScope(userId, entityName, policy.downloadScope);
        const filterWhere = policy.downloadFilter
            ? this.parseDownloadFilter(policy.downloadFilter)
            : {};
        const deltaWhere = lastPulledAt ? { updatedAt: { gt: lastPulledAt } } : {};
        const cursorWhere = cursor ? { id: { gt: cursor } } : {};
        const where = { ...scopeWhere, ...filterWhere, ...deltaWhere, ...cursorWhere };
        const config = this.entityResolver.getEntityConfig(entityName);
        const delegate = this.entityResolver.getDelegate(entityName);
        const totalAvailable = await delegate.count({ where: { ...scopeWhere, ...filterWhere } });
        const effectiveLimit = policy.maxRowsOffline
            ? Math.min(limit, policy.maxRowsOffline)
            : limit;
        const records = await delegate.findMany({
            where,
            include: config.syncInclude || undefined,
            orderBy: { updatedAt: 'asc' },
            take: effectiveLimit + 1,
        });
        const hasMore = records.length > effectiveLimit;
        const actualRecords = hasMore ? records.slice(0, effectiveLimit) : records;
        const nextCursor = hasMore ? actualRecords[actualRecords.length - 1]?.id : null;
        const deletedIds = lastPulledAt
            ? await this.findDeletedIds(delegate, config, scopeWhere, filterWhere, lastPulledAt)
            : [];
        const cleanedRecords = this.stripExcludedFields(actualRecords, config.excludeFields);
        await this.updateDeviceSyncState(userId, deviceId, entityName, serverTimestamp, cleanedRecords.length);
        const durationMs = Date.now() - startTime;
        await this.prisma.working.syncAuditLog.create({
            data: {
                userId,
                deviceId,
                action: 'PULL',
                entityName,
                recordsPulled: cleanedRecords.length,
                durationMs,
                details: { lastPulledAt: lastPulledAt?.toISOString(), totalAvailable, hasMore },
            },
        });
        return {
            entityName,
            records: cleanedRecords,
            deletedIds,
            totalAvailable,
            downloadedCount: cleanedRecords.length,
            serverTimestamp,
            hasMore,
            nextCursor,
        };
    }
    async fullSync(userId, deviceId) {
        const startTime = Date.now();
        const policies = await this.prisma.working.syncPolicy.findMany({
            where: {
                isEnabled: true,
                direction: { not: 'UPLOAD_ONLY' },
            },
            orderBy: { syncPriority: 'asc' },
        });
        const entities = [];
        let totalRecords = 0;
        for (const policy of policies) {
            if (policy.direction === 'DISABLED')
                continue;
            try {
                const result = await this.pull({
                    entityName: policy.entityName,
                    userId,
                    deviceId,
                    lastPulledAt: null,
                });
                entities.push({
                    name: policy.entityName,
                    count: result.downloadedCount,
                    timestamp: result.serverTimestamp,
                });
                totalRecords += result.downloadedCount;
            }
            catch (err) {
                this.logger.warn(`Full sync skip ${policy.entityName}: ${err.message}`);
            }
        }
        return {
            entities,
            totalRecords,
            durationMs: Date.now() - startTime,
        };
    }
    async findDeletedIds(delegate, config, scopeWhere, filterWhere, lastPulledAt) {
        const ids = [];
        if (config.softDeleteField === 'isActive') {
            const deactivated = await delegate.findMany({
                where: {
                    ...scopeWhere,
                    ...filterWhere,
                    isActive: false,
                    updatedAt: { gt: lastPulledAt },
                },
                select: { id: true },
            });
            ids.push(...deactivated.map((r) => r.id));
        }
        if (config.terminalStatuses.length > 0) {
            const terminated = await delegate.findMany({
                where: {
                    ...scopeWhere,
                    ...filterWhere,
                    status: { in: config.terminalStatuses },
                    updatedAt: { gt: lastPulledAt },
                },
                select: { id: true },
            });
            ids.push(...terminated.map((r) => r.id));
        }
        return [...new Set(ids)];
    }
    stripExcludedFields(records, excludeFields) {
        if (excludeFields.length === 0)
            return records;
        return records.map((r) => {
            const clean = { ...r };
            for (const field of excludeFields) {
                delete clean[field];
            }
            return clean;
        });
    }
    async updateDeviceSyncState(userId, deviceId, entityName, timestamp, rowCount) {
        const device = await this.prisma.working.syncDevice.findFirst({
            where: { userId, deviceId },
        });
        if (!device)
            return;
        const entitySyncState = device.entitySyncState || {};
        entitySyncState[entityName] = {
            ...entitySyncState[entityName],
            lastPulledAt: timestamp.toISOString(),
            rowCount,
        };
        await this.prisma.working.syncDevice.update({
            where: { id: device.id },
            data: {
                entitySyncState,
                lastSyncAt: timestamp,
            },
        });
    }
    parseDownloadFilter(filter) {
        const where = {};
        for (const [field, condition] of Object.entries(filter)) {
            if (typeof condition === 'object' && condition !== null) {
                const prismaCondition = {};
                for (const [op, value] of Object.entries(condition)) {
                    switch (op) {
                        case 'not_in':
                            prismaCondition.notIn = value;
                            break;
                        case 'in':
                            prismaCondition.in = value;
                            break;
                        case 'gte':
                            if (value === 'last_90_days') {
                                prismaCondition.gte = new Date(Date.now() - 90 * 86400000);
                            }
                            else if (value === 'last_30_days') {
                                prismaCondition.gte = new Date(Date.now() - 30 * 86400000);
                            }
                            else {
                                prismaCondition.gte = value;
                            }
                            break;
                        default:
                            prismaCondition[op] = value;
                    }
                }
                where[field] = prismaCondition;
            }
            else {
                where[field] = condition;
            }
        }
        return where;
    }
};
exports.PullService = PullService;
exports.PullService = PullService = PullService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        entity_resolver_service_1.EntityResolverService,
        sync_scope_resolver_service_1.SyncScopeResolverService])
], PullService);
//# sourceMappingURL=pull.service.js.map