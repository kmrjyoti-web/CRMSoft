import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { DelegationService } from './delegation.service';
import { OwnershipCoreService } from './ownership-core.service';
import { WorkloadService } from './workload.service';

@Injectable()
export class OwnershipCronService {
  private readonly logger = new Logger(OwnershipCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly delegation: DelegationService,
    private readonly ownershipCore: OwnershipCoreService,
    private readonly workload: WorkloadService,
  ) {}

  /**
   * Auto-revert expired delegations.
   * Called by cron-engine (AUTO_REVERT_DELEGATIONS).
   */
  async autoRevertDelegations() {
    const expired = await this.prisma.delegationRecord.findMany({
      where: { endDate: { lte: new Date() }, isActive: true, isReverted: false },
    });

    for (const record of expired) {
      try {
        const result = await this.delegation.revertDelegation(record.id, 'system');
        this.logger.log(`Auto-reverted delegation ${record.id}: ${result.reverted} entities returned`);
      } catch (err) {
        this.logger.error(`Failed to revert delegation ${record.id}: ${(err as Error).message}`);
      }
    }
  }

  /**
   * Escalate unattended entities.
   * Called by cron-engine (ESCALATE_UNATTENDED).
   */
  async escalateUnattended() {
    const rules = await this.prisma.assignmentRule.findMany({
      where: { isActive: true, escalateAfterHours: { not: null } },
    });

    for (const rule of rules) {
      if (!rule.escalateAfterHours) continue;
      const cutoff = new Date(Date.now() - rule.escalateAfterHours * 60 * 60 * 1000);

      const staleOwners = await this.prisma.entityOwner.findMany({
        where: {
          entityType: rule.entityType, ownerType: 'PRIMARY_OWNER', isActive: true,
          createdAt: { lte: cutoff },
        },
        take: 10,
      });

      for (const owner of staleOwners) {
        if (!owner.userId) continue;
        const hasActivity = await this.prisma.ownershipLog.findFirst({
          where: { entityType: owner.entityType, entityId: owner.entityId, createdAt: { gte: cutoff } },
        });
        if (hasActivity) continue;

        const escalateTo = rule.escalateToUserId;
        if (!escalateTo) continue;

        try {
          await this.ownershipCore.transfer({
            entityType: owner.entityType, entityId: owner.entityId,
            fromUserId: owner.userId, toUserId: escalateTo,
            ownerType: 'PRIMARY_OWNER', transferredById: 'system',
            reason: 'ESCALATION', reasonDetail: `Unattended for ${rule.escalateAfterHours}h`,
          });
          this.logger.log(`Escalated ${owner.entityType}/${owner.entityId} to ${escalateTo}`);
        } catch (err) {
          this.logger.error(`Escalation failed: ${(err as Error).message}`);
        }
      }
    }
  }

  /**
   * Auto-expire time-limited ownership.
   * Called by cron-engine (EXPIRE_TIME_LIMITED_OWNERSHIP).
   */
  async expireTimeLimitedOwnership() {
    const expired = await this.prisma.entityOwner.findMany({
      where: { validTo: { lte: new Date() }, isActive: true },
    });

    for (const owner of expired) {
      await this.prisma.entityOwner.update({ where: { id: owner.id }, data: { isActive: false } });

      await this.prisma.ownershipLog.create({
        data: {
          entityType: owner.entityType, entityId: owner.entityId,
          action: 'REVOKE', ownerType: owner.ownerType,
          fromUserId: owner.userId, reasonCode: 'AUTO_EXPIRE',
          changedById: owner.assignedById, changedByName: 'System',
          isAutomated: true,
        },
      });

      if (owner.userId) {
        const field = this.getCapacityField(owner.entityType);
        if (field) {
          await this.prisma.userCapacity.update({
            where: { userId: owner.userId },
            data: { [field]: { decrement: 1 }, activeTotal: { decrement: 1 } },
          }).catch(() => {});
        }
      }
    }

    if (expired.length) this.logger.log(`Expired ${expired.length} time-limited ownerships`);
  }

  /**
   * Recalculate all user capacity counts.
   * Called by cron-engine (RECALCULATE_ALL_COUNTS).
   */
  async recalculateAllCounts() {
    const capacities = await this.prisma.userCapacity.findMany();
    for (const cap of capacities) {
      await this.workload.recalculateCounts(cap.userId);
    }
    this.logger.log(`Recalculated counts for ${capacities.length} users`);
  }

  private getCapacityField(entityType: string): string | null {
    const map: Record<string, string> = {
      LEAD: 'activeLeads', CONTACT: 'activeContacts',
      ORGANIZATION: 'activeOrganizations', QUOTATION: 'activeQuotations',
    };
    return map[entityType] || null;
  }
}
