import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Injectable()
export class DelegationService {
  private readonly logger = new Logger(DelegationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Delegate all ownership from one user to another (e.g., on leave). */
  async delegate(params: {
    fromUserId: string; toUserId: string; entityType?: string;
    startDate: Date; endDate: Date; reason: string; delegatedById: string;
  }) {
    const toUser = await this.prisma.user.findUnique({ where: { id: params.toUserId } });
    if (!toUser || toUser.status !== 'ACTIVE') throw new BadRequestException('Delegate user not found or inactive');

    const record = await this.prisma.delegationRecord.create({
      data: {
        fromUserId: params.fromUserId, toUserId: params.toUserId,
        entityType: params.entityType as any, startDate: params.startDate,
        endDate: params.endDate, reason: params.reason, createdById: params.delegatedById,
      },
    });

    const where: any = { userId: params.fromUserId, isActive: true };
    if (params.entityType) where.entityType = params.entityType;

    const ownerships = await this.prisma.entityOwner.findMany({ where });
    let count = 0;

    for (const o of ownerships) {
      const existing = await this.prisma.entityOwner.findFirst({
        where: { entityType: o.entityType, entityId: o.entityId, userId: params.toUserId, ownerType: 'DELEGATED_OWNER', isActive: true },
      });
      if (existing) continue;

      await this.prisma.entityOwner.create({
        data: {
          entityType: o.entityType, entityId: o.entityId,
          ownerType: 'DELEGATED_OWNER', userId: params.toUserId,
          assignedById: params.delegatedById, assignmentReason: params.reason,
          validFrom: params.startDate, validTo: params.endDate,
        },
      });

      const fromUser = await this.prisma.user.findUnique({ where: { id: params.fromUserId } });
      const changedBy = await this.prisma.user.findUnique({ where: { id: params.delegatedById } });
      await this.prisma.ownershipLog.create({
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

    // Mark from-user as unavailable
    await this.prisma.userCapacity.upsert({
      where: { userId: params.fromUserId },
      create: { userId: params.fromUserId, isAvailable: false, unavailableFrom: params.startDate, unavailableTo: params.endDate, delegateToId: params.toUserId },
      update: { isAvailable: false, unavailableFrom: params.startDate, unavailableTo: params.endDate, delegateToId: params.toUserId },
    });

    this.logger.log(`Delegated ${count} entities from ${params.fromUserId} to ${params.toUserId}`);
    return { ...record, entitiesDelegated: count };
  }

  /** Revert a delegation — return all delegated ownership back. */
  async revertDelegation(delegationId: string, revertedById: string) {
    const record = await this.prisma.delegationRecord.findUnique({ where: { id: delegationId } });
    if (!record) throw new NotFoundException('Delegation record not found');
    if (record.isReverted) throw new BadRequestException('Delegation already reverted');

    const delegatedOwners = await this.prisma.entityOwner.findMany({
      where: { userId: record.toUserId, ownerType: 'DELEGATED_OWNER', isActive: true,
        ...(record.entityType ? { entityType: record.entityType } : {}),
      },
    });

    let count = 0;
    for (const o of delegatedOwners) {
      await this.prisma.entityOwner.update({ where: { id: o.id }, data: { isActive: false, validTo: new Date() } });

      const changedBy = await this.prisma.user.findUnique({ where: { id: revertedById } });
      await this.prisma.ownershipLog.create({
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

    // Mark from-user as available again
    await this.prisma.userCapacity.update({
      where: { userId: record.fromUserId },
      data: { isAvailable: true, unavailableFrom: null, unavailableTo: null, delegateToId: null },
    }).catch(() => {});

    this.logger.log(`Reverted delegation ${delegationId}: ${count} entities returned`);
    return { reverted: count };
  }

  /** Get active delegation status. */
  async getDelegationStatus(params: { userId?: string; isActive?: boolean }) {
    const where: any = {};
    if (params.userId) where.OR = [{ fromUserId: params.userId }, { toUserId: params.userId }];
    if (params.isActive !== undefined) where.isActive = params.isActive;

    return this.prisma.delegationRecord.findMany({ where, orderBy: { createdAt: 'desc' } });
  }
}
