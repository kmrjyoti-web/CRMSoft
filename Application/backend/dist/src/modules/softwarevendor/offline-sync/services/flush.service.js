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
var FlushService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlushService = void 0;
const common_1 = require("@nestjs/common");
const working_client_1 = require("@prisma/working-client");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let FlushService = FlushService_1 = class FlushService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(FlushService_1.name);
    }
    async issueFlush(params) {
        const { flushType, targetUserId, targetDeviceId, targetEntity, reason, redownloadAfter = true, issuedById, issuedByName, } = params;
        if (flushType === 'ENTITY' && !targetEntity) {
            throw new common_1.BadRequestException('targetEntity required for ENTITY flush');
        }
        if (flushType === 'DEVICE' && !targetDeviceId) {
            throw new common_1.BadRequestException('targetDeviceId required for DEVICE flush');
        }
        const command = await this.prisma.working.syncFlushCommand.create({
            data: {
                flushType: flushType,
                targetUserId,
                targetDeviceId,
                targetEntity,
                reason,
                redownloadAfter,
                status: 'PENDING',
                issuedById,
                issuedByName,
            },
        });
        if (targetDeviceId) {
            await this.prisma.working.syncDevice.updateMany({
                where: { deviceId: targetDeviceId },
                data: { pendingFlushId: command.id, status: 'FLUSH_PENDING' },
            });
        }
        else if (targetUserId) {
            await this.prisma.working.syncDevice.updateMany({
                where: { userId: targetUserId, status: 'ACTIVE' },
                data: { pendingFlushId: command.id, status: 'FLUSH_PENDING' },
            });
        }
        this.logger.log(`Flush command issued: ${flushType} by ${issuedByName} - ${reason}`);
        return command;
    }
    async acknowledgeFlush(flushId, deviceId) {
        const command = await this.prisma.working.syncFlushCommand.findUnique({
            where: { id: flushId },
        });
        if (!command)
            throw new common_1.NotFoundException(`Flush command "${flushId}" not found`);
        if (command.status !== 'PENDING') {
            throw new common_1.BadRequestException(`Flush "${flushId}" is not in PENDING state`);
        }
        await this.prisma.working.syncFlushCommand.update({
            where: { id: flushId },
            data: { status: 'ACKNOWLEDGED', acknowledgedAt: new Date() },
        });
        const device = await this.prisma.working.syncDevice.findFirst({
            where: { deviceId },
        });
        if (device) {
            await this.prisma.working.syncDevice.update({
                where: { id: device.id },
                data: { pendingFlushId: null, status: 'ACTIVE' },
            });
        }
        await this.prisma.working.syncAuditLog.create({
            data: {
                userId: command.targetUserId || '',
                deviceId,
                action: 'FLUSH',
                details: { flushId, flushType: command.flushType, acknowledged: true },
            },
        });
    }
    async executeFlush(flushId, deviceId) {
        const command = await this.prisma.working.syncFlushCommand.findUnique({
            where: { id: flushId },
        });
        if (!command)
            throw new common_1.NotFoundException(`Flush command "${flushId}" not found`);
        await this.prisma.working.syncFlushCommand.update({
            where: { id: flushId },
            data: { status: 'EXECUTED', executedAt: new Date() },
        });
        const device = await this.prisma.working.syncDevice.findFirst({
            where: { deviceId },
        });
        if (device) {
            const entitySyncState = command.targetEntity
                ? this.clearEntityFromState(device.entitySyncState, command.targetEntity)
                : {};
            await this.prisma.working.syncDevice.update({
                where: { id: device.id },
                data: {
                    pendingFlushId: null,
                    status: 'ACTIVE',
                    entitySyncState: command.flushType === 'FULL' ? {} : entitySyncState,
                    recordCounts: command.flushType === 'FULL' ? {} : (device.recordCounts ?? working_client_1.Prisma.JsonNull),
                    storageUsedMb: command.flushType === 'FULL' ? 0 : device.storageUsedMb,
                },
            });
        }
    }
    async cancelFlush(flushId) {
        const command = await this.prisma.working.syncFlushCommand.findUnique({
            where: { id: flushId },
        });
        if (!command)
            throw new common_1.NotFoundException(`Flush command "${flushId}" not found`);
        if (command.status !== 'PENDING') {
            throw new common_1.BadRequestException(`Cannot cancel flush in "${command.status}" state`);
        }
        await this.prisma.working.syncFlushCommand.update({
            where: { id: flushId },
            data: { status: 'FAILED' },
        });
        await this.prisma.working.syncDevice.updateMany({
            where: { pendingFlushId: flushId },
            data: { pendingFlushId: null, status: 'ACTIVE' },
        });
    }
    async getFlushCommands(filters) {
        const where = {};
        if (filters.targetUserId)
            where.targetUserId = filters.targetUserId;
        if (filters.status)
            where.status = filters.status;
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const [data, total] = await Promise.all([
            this.prisma.working.syncFlushCommand.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.working.syncFlushCommand.count({ where }),
        ]);
        return { data, total };
    }
    clearEntityFromState(state, entityName) {
        if (!state)
            return {};
        const updated = { ...state };
        delete updated[entityName];
        return updated;
    }
};
exports.FlushService = FlushService;
exports.FlushService = FlushService = FlushService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FlushService);
//# sourceMappingURL=flush.service.js.map