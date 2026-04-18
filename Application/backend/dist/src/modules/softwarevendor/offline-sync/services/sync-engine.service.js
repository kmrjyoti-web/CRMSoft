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
var SyncEngineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncEngineService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const warning_evaluator_service_1 = require("./warning-evaluator.service");
let SyncEngineService = SyncEngineService_1 = class SyncEngineService {
    constructor(prisma, warningEvaluator) {
        this.prisma = prisma;
        this.warningEvaluator = warningEvaluator;
        this.logger = new common_1.Logger(SyncEngineService_1.name);
    }
    async getConfig(userId) {
        const policies = await this.prisma.working.syncPolicy.findMany({
            where: { isEnabled: true },
            orderBy: { syncPriority: 'asc' },
        });
        const rules = await this.prisma.working.syncWarningRule.findMany({
            where: { isEnabled: true },
            include: { policy: true },
            orderBy: { priority: 'asc' },
        });
        return {
            policies: policies.map((p) => ({
                entityName: p.entityName,
                displayName: p.displayName,
                direction: p.direction,
                syncIntervalMinutes: p.syncIntervalMinutes,
                maxRowsOffline: p.maxRowsOffline,
                maxDataAgeDays: p.maxDataAgeDays,
                conflictStrategy: p.conflictStrategy,
                downloadScope: p.downloadScope,
                syncPriority: p.syncPriority,
            })),
            warningRules: rules.map((r) => ({
                ruleId: r.id,
                name: r.name,
                trigger: r.trigger,
                entity: r.policy?.entityName || null,
                level1: {
                    threshold: r.level1Threshold ? Number(r.level1Threshold) : null,
                    action: r.level1Action,
                    message: r.level1Message,
                },
                level2: r.level2Action
                    ? {
                        threshold: r.level2Threshold ? Number(r.level2Threshold) : null,
                        action: r.level2Action,
                        delayMinutes: r.level2DelayMinutes,
                        message: r.level2Message,
                    }
                    : null,
                level3: r.level3Action
                    ? {
                        threshold: r.level3Threshold ? Number(r.level3Threshold) : null,
                        action: r.level3Action,
                        message: r.level3Message,
                    }
                    : null,
            })),
            globalSettings: {
                maxTotalStorageMb: 500,
                heartbeatIntervalMinutes: 15,
                syncOnAppOpen: true,
                syncOnNetworkRestore: true,
                requireSyncBeforeActivity: false,
                maxOfflineDaysBeforeLock: 30,
            },
            serverTimestamp: new Date().toISOString(),
        };
    }
    async getSyncStatus(userId, deviceId) {
        const device = await this.prisma.working.syncDevice.findFirst({
            where: { userId, deviceId },
        });
        const warnings = await this.warningEvaluator.evaluateWarnings(userId, deviceId);
        return { device, warnings };
    }
    async registerDevice(userId, deviceInfo) {
        const existing = await this.prisma.working.syncDevice.findFirst({
            where: { userId, deviceId: deviceInfo.deviceId },
        });
        if (existing) {
            return this.prisma.working.syncDevice.update({
                where: { id: existing.id },
                data: {
                    deviceName: deviceInfo.deviceName ?? existing.deviceName,
                    deviceType: deviceInfo.deviceType ?? existing.deviceType,
                    platform: deviceInfo.platform ?? existing.platform,
                    appVersion: deviceInfo.appVersion ?? existing.appVersion,
                    status: 'ACTIVE',
                    lastHeartbeatAt: new Date(),
                },
            });
        }
        const device = await this.prisma.working.syncDevice.create({
            data: {
                userId,
                deviceId: deviceInfo.deviceId,
                deviceName: deviceInfo.deviceName,
                deviceType: deviceInfo.deviceType,
                platform: deviceInfo.platform,
                appVersion: deviceInfo.appVersion,
                status: 'ACTIVE',
                lastHeartbeatAt: new Date(),
            },
        });
        await this.prisma.working.syncAuditLog.create({
            data: {
                userId,
                deviceId: deviceInfo.deviceId,
                action: 'DEVICE_REGISTER',
                details: deviceInfo,
            },
        });
        return device;
    }
    async removeDevice(userId, deviceId) {
        const device = await this.prisma.working.syncDevice.findFirst({
            where: { userId, deviceId },
        });
        if (!device)
            throw new common_1.NotFoundException(`Device "${deviceId}" not found`);
        await this.prisma.working.syncDevice.update({
            where: { id: device.id },
            data: { status: 'INACTIVE' },
        });
        await this.prisma.working.syncAuditLog.create({
            data: {
                userId,
                deviceId,
                action: 'DEVICE_REMOVE',
            },
        });
    }
    async heartbeat(userId, deviceId, statusData, ipAddress) {
        const device = await this.prisma.working.syncDevice.findFirst({
            where: { userId, deviceId },
        });
        if (!device)
            return;
        const updateData = {
            lastHeartbeatAt: new Date(),
            lastIpAddress: ipAddress,
        };
        if (statusData.pendingUploadCount !== undefined) {
            updateData.pendingUploadCount = statusData.pendingUploadCount;
        }
        if (statusData.storageUsedMb !== undefined) {
            updateData.storageUsedMb = statusData.storageUsedMb;
        }
        if (statusData.recordCounts !== undefined) {
            updateData.recordCounts = statusData.recordCounts;
        }
        if (statusData.entitySyncState !== undefined) {
            updateData.entitySyncState = statusData.entitySyncState;
        }
        if (statusData.pendingUploadCount !== undefined && statusData.pendingUploadCount > 0) {
            if (!device.oldestPendingAt) {
                updateData.oldestPendingAt = new Date();
            }
        }
        else if (statusData.pendingUploadCount === 0) {
            updateData.oldestPendingAt = null;
        }
        await this.prisma.working.syncDevice.update({
            where: { id: device.id },
            data: updateData,
        });
        await this.prisma.working.syncAuditLog.create({
            data: {
                userId,
                deviceId,
                action: 'HEARTBEAT',
                details: { pendingUploadCount: statusData.pendingUploadCount, storageUsedMb: statusData.storageUsedMb },
            },
        });
    }
    async blockDevice(deviceDbId) {
        await this.prisma.working.syncDevice.update({
            where: { id: deviceDbId },
            data: { status: 'BLOCKED' },
        });
    }
    async getDevices(filters) {
        const where = {};
        if (filters.userId)
            where.userId = filters.userId;
        if (filters.status)
            where.status = filters.status;
        return this.prisma.working.syncDevice.findMany({
            where,
            orderBy: { lastHeartbeatAt: 'desc' },
        });
    }
};
exports.SyncEngineService = SyncEngineService;
exports.SyncEngineService = SyncEngineService = SyncEngineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        warning_evaluator_service_1.WarningEvaluatorService])
], SyncEngineService);
//# sourceMappingURL=sync-engine.service.js.map