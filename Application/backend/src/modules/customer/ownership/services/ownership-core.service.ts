// @ts-nocheck
import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class OwnershipCoreService {
  private readonly logger = new Logger(OwnershipCoreService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Assign owner to entity. Creates EntityOwner + OwnershipLog. */
  async assign(params: {
    entityType: string; entityId: string; userId: string; ownerType: string;
    assignedById: string; reason: string; reasonDetail?: string;
    method?: string; validFrom?: Date; validTo?: Date;
  }) {
    await this.validateEntity(params.entityType, params.entityId);
    const user = await this.prisma.user.findUnique({ where: { id: params.userId } });
    if (!user || user.status !== 'ACTIVE') throw new BadRequestException('User not found or inactive');

    if (params.ownerType === 'PRIMARY_OWNER') {
      const existing = await this.prisma.working.entityOwner.findFirst({
        where: { entityType: params.entityType as any, entityId: params.entityId, ownerType: 'PRIMARY_OWNER', isActive: true },
      });
      if (existing && existing.userId !== params.userId) {
        await this.transfer({
          entityType: params.entityType, entityId: params.entityId,
          fromUserId: existing.userId!, toUserId: params.userId,
          ownerType: 'PRIMARY_OWNER', transferredById: params.assignedById,
          reason: params.reason, reasonDetail: params.reasonDetail,
        });
        return this.prisma.working.entityOwner.findFirst({
          where: { entityType: params.entityType as any, entityId: params.entityId, userId: params.userId, ownerType: 'PRIMARY_OWNER', isActive: true },
          include: { user: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } } },
        });
      }
      if (existing && existing.userId === params.userId) return existing;
    } else {
      const dup = await this.prisma.working.entityOwner.findFirst({
        where: { entityType: params.entityType as any, entityId: params.entityId, userId: params.userId, ownerType: params.ownerType as any, isActive: true },
      });
      if (dup) throw new BadRequestException('Already assigned with same owner type');
    }

    const owner = await this.prisma.working.entityOwner.create({
      data: {
        entityType: params.entityType as any, entityId: params.entityId,
        ownerType: params.ownerType as any, userId: params.userId,
        assignedById: params.assignedById, assignmentReason: params.reason,
        validFrom: params.validFrom || new Date(), validTo: params.validTo,
      },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } } },
    });

    const assignedBy = await this.prisma.user.findUnique({ where: { id: params.assignedById } });
    await this.prisma.working.ownershipLog.create({
      data: {
        entityType: params.entityType as any, entityId: params.entityId,
        action: 'ASSIGN', ownerType: params.ownerType as any,
        toUserId: params.userId, toUserName: `${user.firstName} ${user.lastName}`,
        reasonCode: params.reason, reasonDetail: params.reasonDetail,
        changedById: params.assignedById, changedByName: assignedBy ? `${assignedBy.firstName} ${assignedBy.lastName}` : 'System',
        isAutomated: params.method !== 'MANUAL' && !!params.method,
      },
    });

    await this.incrementCapacity(params.userId, params.entityType);

    if (params.entityType === 'LEAD') {
      await this.prisma.working.lead.update({ where: { id: params.entityId }, data: { allocatedToId: params.userId, allocatedAt: new Date() } }).catch(() => {});
    }

    this.logger.log(`Assigned ${params.ownerType} on ${params.entityType}/${params.entityId} to ${user.firstName} ${user.lastName}`);
    return owner;
  }

  /** Transfer ownership from one user to another. */
  async transfer(params: {
    entityType: string; entityId: string; fromUserId: string; toUserId: string;
    ownerType: string; transferredById: string; reason: string; reasonDetail?: string;
  }) {
    const existing = await this.prisma.working.entityOwner.findFirst({
      where: { entityType: params.entityType as any, entityId: params.entityId, userId: params.fromUserId, ownerType: params.ownerType as any, isActive: true },
    });
    if (!existing) throw new NotFoundException('No active ownership to transfer');

    const toUser = await this.prisma.user.findUnique({ where: { id: params.toUserId } });
    if (!toUser || toUser.status !== 'ACTIVE') throw new BadRequestException('Target user not found or inactive');

    await this.prisma.working.entityOwner.update({ where: { id: existing.id }, data: { isActive: false, validTo: new Date() } });

    const owner = await this.prisma.working.entityOwner.create({
      data: {
        entityType: params.entityType as any, entityId: params.entityId,
        ownerType: params.ownerType as any, userId: params.toUserId,
        assignedById: params.transferredById, assignmentReason: params.reason,
      },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } } },
    });

    const fromUser = await this.prisma.user.findUnique({ where: { id: params.fromUserId } });
    const changedBy = await this.prisma.user.findUnique({ where: { id: params.transferredById } });
    await this.prisma.working.ownershipLog.create({
      data: {
        entityType: params.entityType as any, entityId: params.entityId,
        action: 'TRANSFER', ownerType: params.ownerType as any,
        fromUserId: params.fromUserId, fromUserName: fromUser ? `${fromUser.firstName} ${fromUser.lastName}` : '',
        toUserId: params.toUserId, toUserName: `${toUser.firstName} ${toUser.lastName}`,
        reasonCode: params.reason, reasonDetail: params.reasonDetail,
        changedById: params.transferredById, changedByName: changedBy ? `${changedBy.firstName} ${changedBy.lastName}` : 'System',
      },
    });

    await this.decrementCapacity(params.fromUserId, params.entityType);
    await this.incrementCapacity(params.toUserId, params.entityType);

    if (params.entityType === 'LEAD') {
      await this.prisma.working.lead.update({ where: { id: params.entityId }, data: { allocatedToId: params.toUserId, allocatedAt: new Date() } }).catch(() => {});
    }

    return owner;
  }

  /** Revoke ownership from a user. */
  async revoke(params: {
    entityType: string; entityId: string; userId: string; ownerType: string;
    revokedById: string; reason: string;
  }) {
    const existing = await this.prisma.working.entityOwner.findFirst({
      where: { entityType: params.entityType as any, entityId: params.entityId, userId: params.userId, ownerType: params.ownerType as any, isActive: true },
    });
    if (!existing) throw new NotFoundException('No active ownership to revoke');

    await this.prisma.working.entityOwner.update({ where: { id: existing.id }, data: { isActive: false, validTo: new Date() } });

    const user = await this.prisma.user.findUnique({ where: { id: params.userId } });
    const changedBy = await this.prisma.user.findUnique({ where: { id: params.revokedById } });
    await this.prisma.working.ownershipLog.create({
      data: {
        entityType: params.entityType as any, entityId: params.entityId,
        action: 'REVOKE', ownerType: params.ownerType as any,
        fromUserId: params.userId, fromUserName: user ? `${user.firstName} ${user.lastName}` : '',
        reasonCode: params.reason, changedById: params.revokedById,
        changedByName: changedBy ? `${changedBy.firstName} ${changedBy.lastName}` : 'System',
      },
    });

    await this.decrementCapacity(params.userId, params.entityType);

    if (params.entityType === 'LEAD' && params.ownerType === 'PRIMARY_OWNER') {
      await this.prisma.working.lead.update({ where: { id: params.entityId }, data: { allocatedToId: null } }).catch(() => {});
    }
  }

  /** Get all owners of an entity. */
  async getEntityOwners(entityType: string, entityId: string) {
    return this.prisma.working.entityOwner.findMany({
      where: { entityType: entityType as any, entityId, isActive: true },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } }, assignedByUser: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: [{ ownerType: 'asc' }, { createdAt: 'asc' }],
    });
  }

  /** Get all entities owned by a user. */
  async getUserEntities(params: { userId: string; entityType?: string; ownerType?: string; isActive?: boolean }) {
    const where: any = { userId: params.userId, isActive: params.isActive ?? true };
    if (params.entityType) where.entityType = params.entityType;
    if (params.ownerType) where.ownerType = params.ownerType;

    const owners = await this.prisma.working.entityOwner.findMany({ where, orderBy: { createdAt: 'desc' } });
    const grouped: Record<string, any[]> = { LEAD: [], CONTACT: [], ORGANIZATION: [], QUOTATION: [] };
    for (const o of owners) { if (grouped[o.entityType]) grouped[o.entityType].push(o); }

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

  /** Get ownership audit trail. */
  async getHistory(params: { entityType: string; entityId: string; page?: number; limit?: number }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const [data, total] = await Promise.all([
      this.prisma.working.ownershipLog.findMany({
        where: { entityType: params.entityType as any, entityId: params.entityId },
        orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit,
      }),
      this.prisma.working.ownershipLog.count({ where: { entityType: params.entityType as any, entityId: params.entityId } }),
    ]);
    return { data, total, page, limit };
  }

  /** Validate entity exists by type. */
  async validateEntity(entityType: string, entityId: string) {
    let entity: any = null;
    switch (entityType) {
      case 'LEAD': entity = await this.prisma.working.lead.findUnique({ where: { id: entityId } }); break;
      case 'CONTACT': entity = await this.prisma.working.contact.findUnique({ where: { id: entityId } }); break;
      case 'ORGANIZATION': entity = await this.prisma.working.organization.findUnique({ where: { id: entityId } }); break;
      case 'QUOTATION': entity = await this.prisma.working.quotation.findUnique({ where: { id: entityId } }); break;
      default: throw new BadRequestException(`Unsupported entity type: ${entityType}`);
    }
    if (!entity) throw new NotFoundException(`${entityType} ${entityId} not found`);
    return true;
  }

  /** Increment user capacity count for entity type. */
  private async incrementCapacity(userId: string, entityType: string) {
    const field = this.getCapacityField(entityType);
    if (!field) return;
    await this.prisma.userCapacity.upsert({
      where: { userId },
      create: { userId, [field]: 1, activeTotal: 1 },
      update: { [field]: { increment: 1 }, activeTotal: { increment: 1 } },
    });
  }

  /** Decrement user capacity count for entity type. */
  private async decrementCapacity(userId: string, entityType: string) {
    const field = this.getCapacityField(entityType);
    if (!field) return;
    const cap = await this.prisma.userCapacity.findUnique({ where: { userId } });
    if (!cap) return;
    const current = (cap as any)[field] || 0;
    if (current <= 0) return;
    await this.prisma.userCapacity.update({
      where: { userId },
      data: { [field]: { decrement: 1 }, activeTotal: { decrement: 1 } },
    });
  }

  private getCapacityField(entityType: string): string | null {
    const map: Record<string, string> = {
      LEAD: 'activeLeads', CONTACT: 'activeContacts',
      ORGANIZATION: 'activeOrganizations', QUOTATION: 'activeQuotations',
    };
    return map[entityType] || null;
  }
}
