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
var PushService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const entity_resolver_service_1 = require("./entity-resolver.service");
const conflict_resolver_service_1 = require("./conflict-resolver.service");
let PushService = PushService_1 = class PushService {
    constructor(prisma, entityResolver, conflictResolver) {
        this.prisma = prisma;
        this.entityResolver = entityResolver;
        this.conflictResolver = conflictResolver;
        this.logger = new common_1.Logger(PushService_1.name);
    }
    async push(params) {
        const { userId, deviceId, changes } = params;
        const startTime = Date.now();
        const sorted = [...changes].sort((a, b) => new Date(a.clientTimestamp).getTime() - new Date(b.clientTimestamp).getTime());
        const results = [];
        let successful = 0;
        let conflicts = 0;
        let failed = 0;
        for (const change of sorted) {
            try {
                const policy = await this.prisma.working.syncPolicy.findFirst({
                    where: { entityName: change.entityName, isEnabled: true },
                });
                if (!policy) {
                    results.push({
                        entityName: change.entityName,
                        entityId: change.entityId || null,
                        action: change.action,
                        status: 'FAILED',
                        error: `No sync policy for "${change.entityName}"`,
                    });
                    failed++;
                    continue;
                }
                if (policy.direction === 'DOWNLOAD_ONLY' || policy.direction === 'DISABLED') {
                    results.push({
                        entityName: change.entityName,
                        entityId: change.entityId || null,
                        action: change.action,
                        status: 'REJECTED',
                        error: `Upload not allowed for "${change.entityName}" (direction: ${policy.direction})`,
                    });
                    failed++;
                    continue;
                }
                const result = await this.processChange(change, userId, deviceId, policy);
                results.push(result);
                if (result.status === 'SUCCESS' || result.status === 'CREATED' || result.status === 'DELETED') {
                    successful++;
                }
                else if (result.status.startsWith('CONFLICT')) {
                    conflicts++;
                }
                else {
                    failed++;
                }
                await this.prisma.working.syncChangeLog.create({
                    data: {
                        deviceId,
                        userId,
                        entityName: change.entityName,
                        entityId: result.serverId || change.entityId || '',
                        action: change.action,
                        changedFields: change.action === 'UPDATE' ? change.data : undefined,
                        fullRecord: change.action === 'CREATE' ? change.data : undefined,
                        previousValues: change.previousValues,
                        clientTimestamp: new Date(change.clientTimestamp),
                        clientVersion: change.clientVersion,
                        isPushed: true,
                        pushedAt: new Date(),
                        pushResult: result.status,
                        conflictId: result.conflictId,
                        errorMessage: result.error,
                    },
                });
            }
            catch (err) {
                this.logger.error(`Push failed for ${change.entityName}/${change.entityId}: ${err.message}`);
                results.push({
                    entityName: change.entityName,
                    entityId: change.entityId || null,
                    action: change.action,
                    status: 'FAILED',
                    error: err.message,
                });
                failed++;
            }
        }
        await this.updateDevicePendingCount(userId, deviceId);
        const durationMs = Date.now() - startTime;
        await this.prisma.working.syncAuditLog.create({
            data: {
                userId,
                deviceId,
                action: 'PUSH',
                recordsPushed: sorted.length,
                conflictsDetected: conflicts,
                durationMs,
                details: { successful, conflicts, failed },
            },
        });
        return {
            results,
            totalProcessed: sorted.length,
            successful,
            conflicts,
            failed,
        };
    }
    async processChange(change, userId, deviceId, policy) {
        const delegate = this.entityResolver.getDelegate(change.entityName);
        const clientTimestamp = new Date(change.clientTimestamp);
        switch (change.action) {
            case 'CREATE': {
                const { id, tenantId, createdAt, updatedAt, ...createData } = change.data;
                const newRecord = await delegate.create({
                    data: {
                        ...createData,
                        createdById: userId,
                    },
                });
                return {
                    entityName: change.entityName,
                    entityId: null,
                    action: 'CREATE',
                    status: 'CREATED',
                    serverId: newRecord.id,
                };
            }
            case 'UPDATE': {
                if (!change.entityId) {
                    return {
                        entityName: change.entityName,
                        entityId: null,
                        action: 'UPDATE',
                        status: 'FAILED',
                        error: 'entityId required for UPDATE',
                    };
                }
                const serverRecord = await delegate.findUnique({
                    where: { id: change.entityId },
                });
                if (!serverRecord) {
                    return {
                        entityName: change.entityName,
                        entityId: change.entityId,
                        action: 'UPDATE',
                        status: 'FAILED',
                        error: 'Record not found on server',
                    };
                }
                if (serverRecord.updatedAt > clientTimestamp) {
                    const resolution = await this.conflictResolver.resolve({
                        entityName: change.entityName,
                        entityId: change.entityId,
                        clientData: change.data,
                        serverData: serverRecord,
                        baseData: change.previousValues,
                        clientTimestamp,
                        serverTimestamp: serverRecord.updatedAt,
                        strategy: policy.conflictStrategy,
                        userId,
                        deviceId,
                    });
                    const conflictStatus = resolution.resolved
                        ? `CONFLICT_${resolution.strategy}`
                        : 'CONFLICT_PENDING';
                    return {
                        entityName: change.entityName,
                        entityId: change.entityId,
                        action: 'UPDATE',
                        status: conflictStatus,
                        conflictId: resolution.conflictId,
                    };
                }
                const { id, tenantId, createdAt, updatedAt, createdById, createdByUser, ...updateData } = change.data;
                await delegate.update({
                    where: { id: change.entityId },
                    data: updateData,
                });
                return {
                    entityName: change.entityName,
                    entityId: change.entityId,
                    action: 'UPDATE',
                    status: 'SUCCESS',
                };
            }
            case 'DELETE':
            case 'SOFT_DELETE': {
                if (!change.entityId) {
                    return {
                        entityName: change.entityName,
                        entityId: null,
                        action: change.action,
                        status: 'FAILED',
                        error: 'entityId required for DELETE',
                    };
                }
                const config = this.entityResolver.getEntityConfig(change.entityName);
                const record = await delegate.findUnique({ where: { id: change.entityId } });
                if (!record) {
                    return {
                        entityName: change.entityName,
                        entityId: change.entityId,
                        action: change.action,
                        status: 'FAILED',
                        error: 'Record not found',
                    };
                }
                if (config.softDeleteField === 'isActive') {
                    await delegate.update({
                        where: { id: change.entityId },
                        data: { isActive: false },
                    });
                }
                else if (config.terminalStatuses.length > 0) {
                    await delegate.update({
                        where: { id: change.entityId },
                        data: { status: config.terminalStatuses[0] },
                    });
                }
                return {
                    entityName: change.entityName,
                    entityId: change.entityId,
                    action: change.action,
                    status: 'DELETED',
                };
            }
            default:
                return {
                    entityName: change.entityName,
                    entityId: change.entityId || null,
                    action: change.action,
                    status: 'FAILED',
                    error: `Unknown action: ${change.action}`,
                };
        }
    }
    async updateDevicePendingCount(userId, deviceId) {
        const device = await this.prisma.working.syncDevice.findFirst({
            where: { userId, deviceId },
        });
        if (!device)
            return;
        const pendingCount = await this.prisma.working.syncChangeLog.count({
            where: { userId, deviceId, isPushed: false },
        });
        await this.prisma.working.syncDevice.update({
            where: { id: device.id },
            data: { pendingUploadCount: pendingCount },
        });
    }
};
exports.PushService = PushService;
exports.PushService = PushService = PushService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        entity_resolver_service_1.EntityResolverService,
        conflict_resolver_service_1.ConflictResolverService])
], PushService);
//# sourceMappingURL=push.service.js.map