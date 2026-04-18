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
var SyncSchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const working_client_1 = require("@prisma/working-client");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let SyncSchedulerService = SyncSchedulerService_1 = class SyncSchedulerService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(SyncSchedulerService_1.name);
    }
    async expireStaleFlushCommands() {
        const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
        const result = await this.prisma.working.syncFlushCommand.updateMany({
            where: {
                status: 'PENDING',
                createdAt: { lt: sevenDaysAgo },
            },
            data: { status: 'FAILED' },
        });
        if (result.count > 0) {
            this.logger.log(`Expired ${result.count} stale flush commands`);
            await this.prisma.working.syncDevice.updateMany({
                where: {
                    status: 'FLUSH_PENDING',
                    pendingFlushId: { not: null },
                },
                data: { pendingFlushId: null, status: 'ACTIVE' },
            });
        }
    }
    async cleanOldChangeLogs() {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
        const result = await this.prisma.working.syncChangeLog.deleteMany({
            where: {
                isPushed: true,
                createdAt: { lt: thirtyDaysAgo },
            },
        });
        if (result.count > 0) {
            this.logger.log(`Cleaned ${result.count} old sync change logs`);
        }
    }
    async cleanOldAuditLogs() {
        const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000);
        const result = await this.prisma.working.syncAuditLog.deleteMany({
            where: {
                createdAt: { lt: ninetyDaysAgo },
            },
        });
        if (result.count > 0) {
            this.logger.log(`Cleaned ${result.count} old sync audit logs`);
        }
    }
    async deviceHealthCheck() {
        const fortyEightHoursAgo = new Date(Date.now() - 48 * 3600000);
        const result = await this.prisma.working.syncDevice.updateMany({
            where: {
                status: 'ACTIVE',
                lastHeartbeatAt: { lt: fortyEightHoursAgo },
            },
            data: { status: 'INACTIVE' },
        });
        if (result.count > 0) {
            this.logger.log(`Marked ${result.count} devices as INACTIVE (no heartbeat > 48h)`);
        }
    }
    async autoResolveOldConflicts() {
        const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
        const oldConflicts = await this.prisma.working.syncConflict.findMany({
            where: {
                status: 'PENDING',
                createdAt: { lt: sevenDaysAgo },
            },
        });
        if (oldConflicts.length === 0)
            return;
        for (const conflict of oldConflicts) {
            await this.prisma.working.syncConflict.update({
                where: { id: conflict.id },
                data: {
                    status: 'SERVER_APPLIED',
                    resolvedBy: 'SYSTEM_AUTO',
                    resolvedStrategy: 'SERVER_WINS',
                    resolvedData: (conflict.serverData ?? working_client_1.Prisma.JsonNull),
                    resolvedAt: new Date(),
                },
            });
        }
        this.logger.log(`Auto-resolved ${oldConflicts.length} old conflicts with SERVER_WINS`);
    }
    async recalculateDeviceStorage() {
        const activeDevices = await this.prisma.working.syncDevice.findMany({
            where: { status: { in: ['ACTIVE', 'FLUSH_PENDING'] } },
        });
        for (const device of activeDevices) {
            const pendingCount = await this.prisma.working.syncChangeLog.count({
                where: { userId: device.userId, deviceId: device.deviceId, isPushed: false },
            });
            const oldestPending = pendingCount > 0
                ? await this.prisma.working.syncChangeLog.findFirst({
                    where: { userId: device.userId, deviceId: device.deviceId, isPushed: false },
                    orderBy: { clientTimestamp: 'asc' },
                    select: { clientTimestamp: true },
                })
                : null;
            await this.prisma.working.syncDevice.update({
                where: { id: device.id },
                data: {
                    pendingUploadCount: pendingCount,
                    oldestPendingAt: oldestPending?.clientTimestamp || null,
                },
            });
        }
        if (activeDevices.length > 0) {
            this.logger.log(`Recalculated storage for ${activeDevices.length} active devices`);
        }
    }
    async syncAnalyticsSnapshot() {
        const yesterday = new Date(Date.now() - 86400000);
        yesterday.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [pullCount, pushCount, conflictsCreated, conflictsResolved] = await Promise.all([
            this.prisma.working.syncAuditLog.count({
                where: { action: 'PULL', createdAt: { gte: yesterday, lt: today } },
            }),
            this.prisma.working.syncAuditLog.count({
                where: { action: 'PUSH', createdAt: { gte: yesterday, lt: today } },
            }),
            this.prisma.working.syncConflict.count({
                where: { createdAt: { gte: yesterday, lt: today } },
            }),
            this.prisma.working.syncConflict.count({
                where: { resolvedAt: { gte: yesterday, lt: today } },
            }),
        ]);
        this.logger.log(`Daily sync snapshot: pulls=${pullCount}, pushes=${pushCount}, ` +
            `conflicts_created=${conflictsCreated}, conflicts_resolved=${conflictsResolved}`);
    }
};
exports.SyncSchedulerService = SyncSchedulerService;
exports.SyncSchedulerService = SyncSchedulerService = SyncSchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SyncSchedulerService);
//# sourceMappingURL=sync-scheduler.service.js.map