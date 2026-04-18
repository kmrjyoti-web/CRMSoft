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
var ConflictResolverService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictResolverService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const working_client_1 = require("@prisma/working-client");
const entity_resolver_service_1 = require("./entity-resolver.service");
let ConflictResolverService = ConflictResolverService_1 = class ConflictResolverService {
    constructor(prisma, entityResolver) {
        this.prisma = prisma;
        this.entityResolver = entityResolver;
        this.logger = new common_1.Logger(ConflictResolverService_1.name);
    }
    async resolve(params) {
        const { entityName, entityId, clientData, serverData, baseData, clientTimestamp, serverTimestamp, strategy, userId, deviceId, entityLabel, } = params;
        const { conflicts, clientOnly, serverOnly } = this.detectFieldConflicts(clientData, serverData, baseData);
        let resolved = false;
        let finalData = null;
        let autoMergedFields = [];
        let statusToSet = 'PENDING';
        let resolvedStrategy = strategy;
        switch (strategy) {
            case 'SERVER_WINS':
                finalData = serverData;
                resolved = true;
                statusToSet = 'SERVER_APPLIED';
                break;
            case 'CLIENT_WINS':
                finalData = { ...serverData, ...clientData };
                resolved = true;
                statusToSet = 'CLIENT_APPLIED';
                await this.applyToDatabase(entityName, entityId, clientData);
                break;
            case 'LATEST_WINS':
                if (clientTimestamp > serverTimestamp) {
                    finalData = { ...serverData, ...clientData };
                    statusToSet = 'CLIENT_APPLIED';
                    await this.applyToDatabase(entityName, entityId, clientData);
                }
                else {
                    finalData = serverData;
                    statusToSet = 'SERVER_APPLIED';
                }
                resolved = true;
                break;
            case 'MERGE_FIELDS':
                const merged = this.mergeFields(clientData, serverData, baseData, conflicts, clientOnly, serverOnly);
                finalData = merged.mergedData;
                autoMergedFields = merged.autoMerged;
                if (conflicts.length === 0) {
                    resolved = true;
                    statusToSet = 'AUTO_RESOLVED';
                    await this.applyToDatabase(entityName, entityId, finalData);
                }
                else {
                    resolved = false;
                    statusToSet = 'PENDING';
                }
                break;
            case 'MANUAL':
            default:
                resolved = false;
                statusToSet = 'PENDING';
                break;
        }
        const conflict = await this.prisma.working.syncConflict.create({
            data: {
                deviceId,
                userId,
                entityName,
                entityId,
                entityLabel,
                clientData,
                serverData,
                baseData,
                clientModifiedAt: clientTimestamp,
                serverModifiedAt: serverTimestamp,
                conflictingFields: conflicts,
                nonConflictingMerge: autoMergedFields.length > 0 ? autoMergedFields : working_client_1.Prisma.JsonNull,
                status: statusToSet,
                resolvedBy: resolved ? 'SYSTEM_AUTO' : undefined,
                resolvedStrategy: resolved ? resolvedStrategy : undefined,
                resolvedData: finalData === null ? working_client_1.Prisma.JsonNull : finalData,
                resolvedAt: resolved ? new Date() : undefined,
            },
        });
        return {
            resolved,
            strategy: resolvedStrategy,
            finalData,
            conflictId: conflict.id,
            conflictingFields: conflicts,
            autoMergedFields,
        };
    }
    async manualResolve(conflictId, resolution) {
        const conflict = await this.prisma.working.syncConflict.findUnique({
            where: { id: conflictId },
        });
        if (!conflict) {
            throw new common_1.NotFoundException(`Conflict "${conflictId}" not found`);
        }
        if (conflict.status !== 'PENDING') {
            throw new common_1.NotFoundException(`Conflict "${conflictId}" is already resolved`);
        }
        await this.applyToDatabase(conflict.entityName, conflict.entityId, resolution.resolvedData);
        await this.prisma.working.syncConflict.update({
            where: { id: conflictId },
            data: {
                status: 'MANUALLY_RESOLVED',
                resolvedBy: resolution.userId,
                resolvedStrategy: 'MANUAL',
                resolvedData: resolution.resolvedData,
                resolvedAt: new Date(),
            },
        });
    }
    async getPendingConflicts(userId) {
        return this.prisma.working.syncConflict.findMany({
            where: { userId, status: 'PENDING' },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getConflictDetail(conflictId) {
        const conflict = await this.prisma.working.syncConflict.findUnique({
            where: { id: conflictId },
        });
        if (!conflict)
            throw new common_1.NotFoundException(`Conflict "${conflictId}" not found`);
        return conflict;
    }
    detectFieldConflicts(clientData, serverData, baseData) {
        const conflicts = [];
        const clientOnly = [];
        const serverOnly = [];
        const skipFields = new Set(['id', 'tenantId', 'createdAt', 'updatedAt', 'createdById']);
        const allFields = new Set([...Object.keys(clientData), ...Object.keys(serverData)]);
        for (const field of allFields) {
            if (skipFields.has(field))
                continue;
            const cv = clientData[field];
            const sv = serverData[field];
            const bv = baseData?.[field];
            if (JSON.stringify(cv) === JSON.stringify(sv))
                continue;
            if (baseData) {
                const clientChanged = JSON.stringify(cv) !== JSON.stringify(bv);
                const serverChanged = JSON.stringify(sv) !== JSON.stringify(bv);
                if (clientChanged && serverChanged) {
                    conflicts.push({ field, clientValue: cv, serverValue: sv, baseValue: bv });
                }
                else if (clientChanged && !serverChanged) {
                    clientOnly.push({ field, value: cv, source: 'CLIENT' });
                }
                else if (!clientChanged && serverChanged) {
                    serverOnly.push({ field, value: sv, source: 'SERVER' });
                }
            }
            else {
                conflicts.push({ field, clientValue: cv, serverValue: sv });
            }
        }
        return { conflicts, clientOnly, serverOnly };
    }
    mergeFields(clientData, serverData, baseData, conflicts, clientOnly, serverOnly) {
        const mergedData = { ...serverData };
        const autoMerged = [];
        for (const change of clientOnly) {
            mergedData[change.field] = change.value;
            autoMerged.push(change);
        }
        for (const change of serverOnly) {
            autoMerged.push(change);
        }
        return { mergedData, autoMerged };
    }
    async applyToDatabase(entityName, entityId, data) {
        const delegate = this.entityResolver.getDelegate(entityName);
        const { id, tenantId, createdAt, createdById, createdByUser, ...updateData } = data;
        try {
            await delegate.update({
                where: { id: entityId },
                data: updateData,
            });
        }
        catch (err) {
            this.logger.error(`Failed to apply conflict resolution to ${entityName}/${entityId}: ${err.message}`);
            throw err;
        }
    }
};
exports.ConflictResolverService = ConflictResolverService;
exports.ConflictResolverService = ConflictResolverService = ConflictResolverService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        entity_resolver_service_1.EntityResolverService])
], ConflictResolverService);
//# sourceMappingURL=conflict-resolver.service.js.map