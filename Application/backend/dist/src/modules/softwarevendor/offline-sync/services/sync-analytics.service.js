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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let SyncAnalyticsService = class SyncAnalyticsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboard() {
        const [totalDevices, activeDevices, inactiveDevices, blockedDevices, totalConflicts, pendingConflicts, totalFlushCommands, pendingFlushCommands, devices, conflictsByEntity,] = await Promise.all([
            this.prisma.working.syncDevice.count(),
            this.prisma.working.syncDevice.count({ where: { status: 'ACTIVE' } }),
            this.prisma.working.syncDevice.count({ where: { status: 'INACTIVE' } }),
            this.prisma.working.syncDevice.count({ where: { status: 'BLOCKED' } }),
            this.prisma.working.syncConflict.count(),
            this.prisma.working.syncConflict.count({ where: { status: 'PENDING' } }),
            this.prisma.working.syncFlushCommand.count(),
            this.prisma.working.syncFlushCommand.count({ where: { status: 'PENDING' } }),
            this.prisma.working.syncDevice.findMany({
                where: { status: 'ACTIVE' },
                select: { pendingUploadCount: true },
            }),
            this.prisma.working.syncConflict.groupBy({
                by: ['entityName'],
                _count: { id: true },
                orderBy: { _count: { id: 'desc' } },
                take: 5,
            }),
        ]);
        const avgPendingUploads = devices.length > 0
            ? Math.round(devices.reduce((sum, d) => sum + d.pendingUploadCount, 0) / devices.length)
            : 0;
        return {
            totalDevices,
            activeDevices,
            inactiveDevices,
            blockedDevices,
            totalConflicts,
            pendingConflicts,
            totalFlushCommands,
            pendingFlushCommands,
            avgPendingUploads,
            entitiesWithMostConflicts: conflictsByEntity.map((c) => ({
                entityName: c.entityName,
                count: c._count.id,
            })),
        };
    }
    async getAuditLog(filters) {
        const where = {};
        if (filters.userId)
            where.userId = filters.userId;
        if (filters.deviceId)
            where.deviceId = filters.deviceId;
        if (filters.action)
            where.action = filters.action;
        if (filters.entityName)
            where.entityName = filters.entityName;
        if (filters.dateFrom || filters.dateTo) {
            where.createdAt = {};
            if (filters.dateFrom)
                where.createdAt.gte = filters.dateFrom;
            if (filters.dateTo)
                where.createdAt.lte = filters.dateTo;
        }
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const [data, total] = await Promise.all([
            this.prisma.working.syncAuditLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.working.syncAuditLog.count({ where }),
        ]);
        return { data, total };
    }
    async getAnalytics(dateFrom, dateTo) {
        const where = {};
        if (dateFrom || dateTo) {
            where.createdAt = {};
            if (dateFrom)
                where.createdAt.gte = dateFrom;
            if (dateTo)
                where.createdAt.lte = dateTo;
        }
        const [pullLogs, pushLogs, conflicts] = await Promise.all([
            this.prisma.working.syncAuditLog.findMany({
                where: { ...where, action: 'PULL' },
                select: { durationMs: true, recordsPulled: true, entityName: true },
            }),
            this.prisma.working.syncAuditLog.findMany({
                where: { ...where, action: 'PUSH' },
                select: { durationMs: true, recordsPushed: true, conflictsDetected: true },
            }),
            this.prisma.working.syncConflict.count({ where }),
        ]);
        const avgPullDurationMs = pullLogs.length > 0
            ? Math.round(pullLogs.reduce((sum, l) => sum + (l.durationMs || 0), 0) / pullLogs.length)
            : 0;
        const avgPushDurationMs = pushLogs.length > 0
            ? Math.round(pushLogs.reduce((sum, l) => sum + (l.durationMs || 0), 0) / pushLogs.length)
            : 0;
        const totalRecordsPulled = pullLogs.reduce((sum, l) => sum + (l.recordsPulled || 0), 0);
        const totalRecordsPushed = pushLogs.reduce((sum, l) => sum + (l.recordsPushed || 0), 0);
        const entityFrequency = {};
        for (const log of pullLogs) {
            if (log.entityName) {
                entityFrequency[log.entityName] = (entityFrequency[log.entityName] || 0) + 1;
            }
        }
        const topEntitiesBySync = Object.entries(entityFrequency)
            .map(([entityName, count]) => ({ entityName, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        return {
            totalPulls: pullLogs.length,
            totalPushes: pushLogs.length,
            totalRecordsPulled,
            totalRecordsPushed,
            avgPullDurationMs,
            avgPushDurationMs,
            totalConflicts: conflicts,
            conflictRate: pushLogs.length > 0
                ? Math.round((pushLogs.reduce((sum, l) => sum + (l.conflictsDetected || 0), 0) / pushLogs.length) * 100) / 100
                : 0,
            topEntitiesBySync,
        };
    }
};
exports.SyncAnalyticsService = SyncAnalyticsService;
exports.SyncAnalyticsService = SyncAnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SyncAnalyticsService);
//# sourceMappingURL=sync-analytics.service.js.map