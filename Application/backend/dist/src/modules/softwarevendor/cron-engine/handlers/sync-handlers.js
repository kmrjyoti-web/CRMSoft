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
var ExpireFlushCommandsHandler_1, SyncChangelogCleanupHandler_1, SyncDeviceHealthHandler_1, AutoResolveConflictsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoResolveConflictsHandler = exports.SyncDeviceHealthHandler = exports.SyncChangelogCleanupHandler = exports.ExpireFlushCommandsHandler = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const working_client_1 = require("@prisma/working-client");
let ExpireFlushCommandsHandler = ExpireFlushCommandsHandler_1 = class ExpireFlushCommandsHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.jobCode = 'EXPIRE_FLUSH_COMMANDS';
        this.logger = new common_1.Logger(ExpireFlushCommandsHandler_1.name);
    }
    async execute(params) {
        try {
            const days = params.retentionDays ?? 7;
            const cutoff = new Date(Date.now() - days * 86400000);
            const result = await this.prisma.working.syncFlushCommand.updateMany({
                where: { status: 'PENDING', createdAt: { lt: cutoff } },
                data: { status: 'FAILED' },
            });
            if (result.count > 0) {
                await this.prisma.working.syncDevice.updateMany({
                    where: { status: 'FLUSH_PENDING', pendingFlushId: { not: null } },
                    data: { pendingFlushId: null, status: 'ACTIVE' },
                });
            }
            return { recordsProcessed: result.count };
        }
        catch (error) {
            const err = error;
            this.logger.error(`ExpireFlushCommandsHandler failed: ${err.message}`, err.stack);
            throw error;
        }
    }
};
exports.ExpireFlushCommandsHandler = ExpireFlushCommandsHandler;
exports.ExpireFlushCommandsHandler = ExpireFlushCommandsHandler = ExpireFlushCommandsHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExpireFlushCommandsHandler);
let SyncChangelogCleanupHandler = SyncChangelogCleanupHandler_1 = class SyncChangelogCleanupHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.jobCode = 'SYNC_CHANGELOG_CLEANUP';
        this.logger = new common_1.Logger(SyncChangelogCleanupHandler_1.name);
    }
    async execute(params) {
        try {
            const days = params.retentionDays ?? 30;
            const cutoff = new Date(Date.now() - days * 86400000);
            const result = await this.prisma.working.syncChangeLog.deleteMany({
                where: { isPushed: true, createdAt: { lt: cutoff } },
            });
            return { recordsProcessed: result.count };
        }
        catch (error) {
            const err = error;
            this.logger.error(`SyncChangelogCleanupHandler failed: ${err.message}`, err.stack);
            throw error;
        }
    }
};
exports.SyncChangelogCleanupHandler = SyncChangelogCleanupHandler;
exports.SyncChangelogCleanupHandler = SyncChangelogCleanupHandler = SyncChangelogCleanupHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SyncChangelogCleanupHandler);
let SyncDeviceHealthHandler = SyncDeviceHealthHandler_1 = class SyncDeviceHealthHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.jobCode = 'SYNC_DEVICE_HEALTH';
        this.logger = new common_1.Logger(SyncDeviceHealthHandler_1.name);
    }
    async execute() {
        try {
            const cutoff = new Date(Date.now() - 48 * 3600000);
            const result = await this.prisma.working.syncDevice.updateMany({
                where: { status: 'ACTIVE', lastHeartbeatAt: { lt: cutoff } },
                data: { status: 'INACTIVE' },
            });
            return { recordsProcessed: result.count };
        }
        catch (error) {
            const err = error;
            this.logger.error(`SyncDeviceHealthHandler failed: ${err.message}`, err.stack);
            throw error;
        }
    }
};
exports.SyncDeviceHealthHandler = SyncDeviceHealthHandler;
exports.SyncDeviceHealthHandler = SyncDeviceHealthHandler = SyncDeviceHealthHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SyncDeviceHealthHandler);
let AutoResolveConflictsHandler = AutoResolveConflictsHandler_1 = class AutoResolveConflictsHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.jobCode = 'AUTO_RESOLVE_CONFLICTS';
        this.logger = new common_1.Logger(AutoResolveConflictsHandler_1.name);
    }
    async execute() {
        try {
            const cutoff = new Date(Date.now() - 7 * 86400000);
            const conflicts = await this.prisma.working.syncConflict.findMany({
                where: { status: 'PENDING', createdAt: { lt: cutoff } },
            });
            for (const c of conflicts) {
                await this.prisma.working.syncConflict.update({
                    where: { id: c.id },
                    data: {
                        status: 'SERVER_APPLIED',
                        resolvedBy: 'SYSTEM_AUTO',
                        resolvedStrategy: 'SERVER_WINS',
                        resolvedData: (c.serverData ?? working_client_1.Prisma.JsonNull),
                        resolvedAt: new Date(),
                    },
                });
            }
            return { recordsProcessed: conflicts.length, recordsSucceeded: conflicts.length };
        }
        catch (error) {
            const err = error;
            this.logger.error(`AutoResolveConflictsHandler failed: ${err.message}`, err.stack);
            throw error;
        }
    }
};
exports.AutoResolveConflictsHandler = AutoResolveConflictsHandler;
exports.AutoResolveConflictsHandler = AutoResolveConflictsHandler = AutoResolveConflictsHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AutoResolveConflictsHandler);
//# sourceMappingURL=sync-handlers.js.map