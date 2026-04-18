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
var OwnershipCoreService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OwnershipCoreService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const cross_db_resolver_service_1 = require("../../../../core/prisma/cross-db-resolver.service");
let OwnershipCoreService = OwnershipCoreService_1 = class OwnershipCoreService {
    constructor(prisma, resolver) {
        this.prisma = prisma;
        this.resolver = resolver;
        this.logger = new common_1.Logger(OwnershipCoreService_1.name);
    }
    async assign(params) {
        await this.validateEntity(params.entityType, params.entityId);
        const user = await this.prisma.user.findUnique({ where: { id: params.userId } });
        if (!user || user.status !== 'ACTIVE')
            throw new common_1.BadRequestException('User not found or inactive');
        if (params.ownerType === 'PRIMARY_OWNER') {
            const existing = await this.prisma.working.entityOwner.findFirst({
                where: { entityType: params.entityType, entityId: params.entityId, ownerType: 'PRIMARY_OWNER', isActive: true },
            });
            if (existing && existing.userId !== params.userId) {
                await this.transfer({
                    entityType: params.entityType, entityId: params.entityId,
                    fromUserId: existing.userId, toUserId: params.userId,
                    ownerType: 'PRIMARY_OWNER', transferredById: params.assignedById,
                    reason: params.reason, reasonDetail: params.reasonDetail,
                });
                const owner = await this.prisma.working.entityOwner.findFirst({
                    where: { entityType: params.entityType, entityId: params.entityId, userId: params.userId, ownerType: 'PRIMARY_OWNER', isActive: true },
                });
                if (!owner)
                    return owner;
                const [resolved] = await this.resolver.resolveUsers([owner], ['userId'], { id: true, firstName: true, lastName: true, email: true, avatar: true });
                return resolved;
            }
            if (existing && existing.userId === params.userId)
                return existing;
        }
        else {
            const dup = await this.prisma.working.entityOwner.findFirst({
                where: { entityType: params.entityType, entityId: params.entityId, userId: params.userId, ownerType: params.ownerType, isActive: true },
            });
            if (dup)
                throw new common_1.BadRequestException('Already assigned with same owner type');
        }
        const ownerRaw = await this.prisma.working.entityOwner.create({
            data: {
                entityType: params.entityType, entityId: params.entityId,
                ownerType: params.ownerType, userId: params.userId,
                assignedById: params.assignedById, assignmentReason: params.reason,
                validFrom: params.validFrom || new Date(), validTo: params.validTo,
            },
        });
        const [owner] = await this.resolver.resolveUsers([ownerRaw], ['userId'], { id: true, firstName: true, lastName: true, email: true, avatar: true });
        const assignedBy = await this.prisma.user.findUnique({ where: { id: params.assignedById } });
        await this.prisma.working.ownershipLog.create({
            data: {
                entityType: params.entityType, entityId: params.entityId,
                action: 'ASSIGN', ownerType: params.ownerType,
                toUserId: params.userId, toUserName: `${user.firstName} ${user.lastName}`,
                reasonCode: params.reason, reasonDetail: params.reasonDetail,
                changedById: params.assignedById, changedByName: assignedBy ? `${assignedBy.firstName} ${assignedBy.lastName}` : 'System',
                isAutomated: params.method !== 'MANUAL' && !!params.method,
            },
        });
        await this.incrementCapacity(params.userId, params.entityType);
        if (params.entityType === 'LEAD') {
            await this.prisma.working.lead.update({ where: { id: params.entityId }, data: { allocatedToId: params.userId, allocatedAt: new Date() } }).catch(() => { });
        }
        this.logger.log(`Assigned ${params.ownerType} on ${params.entityType}/${params.entityId} to ${user.firstName} ${user.lastName}`);
        return owner;
    }
    async transfer(params) {
        const existing = await this.prisma.working.entityOwner.findFirst({
            where: { entityType: params.entityType, entityId: params.entityId, userId: params.fromUserId, ownerType: params.ownerType, isActive: true },
        });
        if (!existing)
            throw new common_1.NotFoundException('No active ownership to transfer');
        const toUser = await this.prisma.user.findUnique({ where: { id: params.toUserId } });
        if (!toUser || toUser.status !== 'ACTIVE')
            throw new common_1.BadRequestException('Target user not found or inactive');
        await this.prisma.working.entityOwner.update({ where: { id: existing.id }, data: { isActive: false, validTo: new Date() } });
        const ownerRaw = await this.prisma.working.entityOwner.create({
            data: {
                entityType: params.entityType, entityId: params.entityId,
                ownerType: params.ownerType, userId: params.toUserId,
                assignedById: params.transferredById, assignmentReason: params.reason,
            },
        });
        const [owner] = await this.resolver.resolveUsers([ownerRaw], ['userId'], { id: true, firstName: true, lastName: true, email: true, avatar: true });
        const fromUser = await this.prisma.user.findUnique({ where: { id: params.fromUserId } });
        const changedBy = await this.prisma.user.findUnique({ where: { id: params.transferredById } });
        await this.prisma.working.ownershipLog.create({
            data: {
                entityType: params.entityType, entityId: params.entityId,
                action: 'TRANSFER', ownerType: params.ownerType,
                fromUserId: params.fromUserId, fromUserName: fromUser ? `${fromUser.firstName} ${fromUser.lastName}` : '',
                toUserId: params.toUserId, toUserName: `${toUser.firstName} ${toUser.lastName}`,
                reasonCode: params.reason, reasonDetail: params.reasonDetail,
                changedById: params.transferredById, changedByName: changedBy ? `${changedBy.firstName} ${changedBy.lastName}` : 'System',
            },
        });
        await this.decrementCapacity(params.fromUserId, params.entityType);
        await this.incrementCapacity(params.toUserId, params.entityType);
        if (params.entityType === 'LEAD') {
            await this.prisma.working.lead.update({ where: { id: params.entityId }, data: { allocatedToId: params.toUserId, allocatedAt: new Date() } }).catch(() => { });
        }
        return owner;
    }
    async revoke(params) {
        const existing = await this.prisma.working.entityOwner.findFirst({
            where: { entityType: params.entityType, entityId: params.entityId, userId: params.userId, ownerType: params.ownerType, isActive: true },
        });
        if (!existing)
            throw new common_1.NotFoundException('No active ownership to revoke');
        await this.prisma.working.entityOwner.update({ where: { id: existing.id }, data: { isActive: false, validTo: new Date() } });
        const user = await this.prisma.user.findUnique({ where: { id: params.userId } });
        const changedBy = await this.prisma.user.findUnique({ where: { id: params.revokedById } });
        await this.prisma.working.ownershipLog.create({
            data: {
                entityType: params.entityType, entityId: params.entityId,
                action: 'REVOKE', ownerType: params.ownerType,
                fromUserId: params.userId, fromUserName: user ? `${user.firstName} ${user.lastName}` : '',
                reasonCode: params.reason, changedById: params.revokedById,
                changedByName: changedBy ? `${changedBy.firstName} ${changedBy.lastName}` : 'System',
            },
        });
        await this.decrementCapacity(params.userId, params.entityType);
        if (params.entityType === 'LEAD' && params.ownerType === 'PRIMARY_OWNER') {
            await this.prisma.working.lead.update({ where: { id: params.entityId }, data: { allocatedToId: null } }).catch(() => { });
        }
    }
    async getEntityOwners(entityType, entityId) {
        const owners = await this.prisma.working.entityOwner.findMany({
            where: { entityType: entityType, entityId, isActive: true },
            orderBy: [{ ownerType: 'asc' }, { createdAt: 'asc' }],
        });
        const withUsers = await this.resolver.resolveUsers(owners, ['userId'], { id: true, firstName: true, lastName: true, email: true, avatar: true });
        return this.resolver.resolveUsers(withUsers, ['assignedById'], { id: true, firstName: true, lastName: true });
    }
    async getUserEntities(params) {
        const where = { userId: params.userId, isActive: params.isActive ?? true };
        if (params.entityType)
            where.entityType = params.entityType;
        if (params.ownerType)
            where.ownerType = params.ownerType;
        const owners = await this.prisma.working.entityOwner.findMany({ where, orderBy: { createdAt: 'desc' } });
        const grouped = { LEAD: [], CONTACT: [], ORGANIZATION: [], QUOTATION: [] };
        for (const o of owners) {
            if (grouped[o.entityType])
                grouped[o.entityType].push(o);
        }
        return {
            leads: grouped.LEAD, contacts: grouped.CONTACT,
            organizations: grouped.ORGANIZATION, quotations: grouped.QUOTATION,
            summary: {
                totalLeads: grouped.LEAD.length, totalContacts: grouped.CONTACT.length,
                totalOrganizations: grouped.ORGANIZATION.length, totalQuotations: grouped.QUOTATION.length,
                total: owners.length,
            },
        };
    }
    async getHistory(params) {
        const page = params.page || 1;
        const limit = params.limit || 20;
        const [data, total] = await Promise.all([
            this.prisma.working.ownershipLog.findMany({
                where: { entityType: params.entityType, entityId: params.entityId },
                orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit,
            }),
            this.prisma.working.ownershipLog.count({ where: { entityType: params.entityType, entityId: params.entityId } }),
        ]);
        return { data, total, page, limit };
    }
    async validateEntity(entityType, entityId) {
        let entity = null;
        switch (entityType) {
            case 'LEAD':
                entity = await this.prisma.working.lead.findUnique({ where: { id: entityId } });
                break;
            case 'CONTACT':
                entity = await this.prisma.working.contact.findUnique({ where: { id: entityId } });
                break;
            case 'ORGANIZATION':
                entity = await this.prisma.working.organization.findUnique({ where: { id: entityId } });
                break;
            case 'QUOTATION':
                entity = await this.prisma.working.quotation.findUnique({ where: { id: entityId } });
                break;
            default: throw new common_1.BadRequestException(`Unsupported entity type: ${entityType}`);
        }
        if (!entity)
            throw new common_1.NotFoundException(`${entityType} ${entityId} not found`);
        return true;
    }
    async incrementCapacity(userId, entityType) {
        const field = this.getCapacityField(entityType);
        if (!field)
            return;
        await this.prisma.userCapacity.upsert({
            where: { userId },
            create: { userId, [field]: 1, activeTotal: 1 },
            update: { [field]: { increment: 1 }, activeTotal: { increment: 1 } },
        });
    }
    async decrementCapacity(userId, entityType) {
        const field = this.getCapacityField(entityType);
        if (!field)
            return;
        const cap = await this.prisma.userCapacity.findUnique({ where: { userId } });
        if (!cap)
            return;
        const current = cap[field] || 0;
        if (current <= 0)
            return;
        await this.prisma.userCapacity.update({
            where: { userId },
            data: { [field]: { decrement: 1 }, activeTotal: { decrement: 1 } },
        });
    }
    getCapacityField(entityType) {
        const map = {
            LEAD: 'activeLeads', CONTACT: 'activeContacts',
            ORGANIZATION: 'activeOrganizations', QUOTATION: 'activeQuotations',
        };
        return map[entityType] || null;
    }
};
exports.OwnershipCoreService = OwnershipCoreService;
exports.OwnershipCoreService = OwnershipCoreService = OwnershipCoreService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cross_db_resolver_service_1.CrossDbResolverService])
], OwnershipCoreService);
//# sourceMappingURL=ownership-core.service.js.map