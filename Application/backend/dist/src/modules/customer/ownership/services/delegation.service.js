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
var DelegationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DelegationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let DelegationService = DelegationService_1 = class DelegationService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(DelegationService_1.name);
    }
    async delegate(params) {
        const toUser = await this.prisma.user.findUnique({ where: { id: params.toUserId } });
        if (!toUser || toUser.status !== 'ACTIVE')
            throw new common_1.BadRequestException('Delegate user not found or inactive');
        const record = await this.prisma.delegationRecord.create({
            data: {
                fromUserId: params.fromUserId, toUserId: params.toUserId,
                entityType: params.entityType, startDate: params.startDate,
                endDate: params.endDate, reason: params.reason, createdById: params.delegatedById,
            },
        });
        const where = { userId: params.fromUserId, isActive: true };
        if (params.entityType)
            where.entityType = params.entityType;
        const ownerships = await this.prisma.working.entityOwner.findMany({ where });
        let count = 0;
        for (const o of ownerships) {
            const existing = await this.prisma.working.entityOwner.findFirst({
                where: { entityType: o.entityType, entityId: o.entityId, userId: params.toUserId, ownerType: 'DELEGATED_OWNER', isActive: true },
            });
            if (existing)
                continue;
            await this.prisma.working.entityOwner.create({
                data: {
                    entityType: o.entityType, entityId: o.entityId,
                    ownerType: 'DELEGATED_OWNER', userId: params.toUserId,
                    assignedById: params.delegatedById, assignmentReason: params.reason,
                    validFrom: params.startDate, validTo: params.endDate,
                },
            });
            const fromUser = await this.prisma.user.findUnique({ where: { id: params.fromUserId } });
            const changedBy = await this.prisma.user.findUnique({ where: { id: params.delegatedById } });
            await this.prisma.working.ownershipLog.create({
                data: {
                    entityType: o.entityType, entityId: o.entityId,
                    action: 'DELEGATE', ownerType: 'DELEGATED_OWNER',
                    fromUserId: params.fromUserId, fromUserName: fromUser ? `${fromUser.firstName} ${fromUser.lastName}` : '',
                    toUserId: params.toUserId, toUserName: `${toUser.firstName} ${toUser.lastName}`,
                    reasonCode: 'ON_LEAVE', reasonDetail: params.reason,
                    changedById: params.delegatedById,
                    changedByName: changedBy ? `${changedBy.firstName} ${changedBy.lastName}` : 'System',
                },
            });
            count++;
        }
        await this.prisma.userCapacity.upsert({
            where: { userId: params.fromUserId },
            create: { userId: params.fromUserId, isAvailable: false, unavailableFrom: params.startDate, unavailableTo: params.endDate, delegateToId: params.toUserId },
            update: { isAvailable: false, unavailableFrom: params.startDate, unavailableTo: params.endDate, delegateToId: params.toUserId },
        });
        this.logger.log(`Delegated ${count} entities from ${params.fromUserId} to ${params.toUserId}`);
        return { ...record, entitiesDelegated: count };
    }
    async revertDelegation(delegationId, revertedById) {
        const record = await this.prisma.delegationRecord.findUnique({ where: { id: delegationId } });
        if (!record)
            throw new common_1.NotFoundException('Delegation record not found');
        if (record.isReverted)
            throw new common_1.BadRequestException('Delegation already reverted');
        const delegatedOwners = await this.prisma.working.entityOwner.findMany({
            where: { userId: record.toUserId, ownerType: 'DELEGATED_OWNER', isActive: true,
                ...(record.entityType ? { entityType: record.entityType } : {}),
            },
        });
        let count = 0;
        for (const o of delegatedOwners) {
            await this.prisma.working.entityOwner.update({ where: { id: o.id }, data: { isActive: false, validTo: new Date() } });
            const changedBy = await this.prisma.user.findUnique({ where: { id: revertedById } });
            await this.prisma.working.ownershipLog.create({
                data: {
                    entityType: o.entityType, entityId: o.entityId,
                    action: 'AUTO_REVERT', ownerType: 'DELEGATED_OWNER',
                    fromUserId: record.toUserId, toUserId: record.fromUserId,
                    reasonCode: 'LEAVE_ENDED', changedById: revertedById,
                    changedByName: changedBy ? `${changedBy.firstName} ${changedBy.lastName}` : 'System',
                    isAutomated: revertedById === 'system',
                },
            });
            count++;
        }
        await this.prisma.delegationRecord.update({
            where: { id: delegationId },
            data: { isReverted: true, revertedAt: new Date(), isActive: false },
        });
        await this.prisma.userCapacity.update({
            where: { userId: record.fromUserId },
            data: { isAvailable: true, unavailableFrom: null, unavailableTo: null, delegateToId: null },
        }).catch(() => { });
        this.logger.log(`Reverted delegation ${delegationId}: ${count} entities returned`);
        return { reverted: count };
    }
    async getDelegationStatus(params) {
        const where = {};
        if (params.userId)
            where.OR = [{ fromUserId: params.userId }, { toUserId: params.userId }];
        if (params.isActive !== undefined)
            where.isActive = params.isActive;
        return this.prisma.delegationRecord.findMany({ where, orderBy: { createdAt: 'desc' } });
    }
};
exports.DelegationService = DelegationService;
exports.DelegationService = DelegationService = DelegationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DelegationService);
//# sourceMappingURL=delegation.service.js.map