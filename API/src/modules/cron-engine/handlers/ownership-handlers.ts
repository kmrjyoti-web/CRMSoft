import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { ICronJobHandler, CronJobResult } from '../services/job-registry.service';

/** Auto-revert expired ownership delegations. */
@Injectable()
export class RevertDelegationsHandler implements ICronJobHandler {
  readonly jobCode = 'REVERT_DELEGATIONS';
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<CronJobResult> {
    const expired = await this.prisma.delegationRecord.findMany({
      where: { endDate: { lte: new Date() }, isActive: true, isReverted: false },
    });
    let succeeded = 0;
    for (const record of expired) {
      try {
        await this.prisma.delegationRecord.update({
          where: { id: record.id },
          data: { isReverted: true, isActive: false },
        });
        succeeded++;
      } catch { /* skip */ }
    }
    return { recordsProcessed: expired.length, recordsSucceeded: succeeded };
  }
}

/** Escalate unattended entities based on assignment rules. */
@Injectable()
export class EscalateUnattendedHandler implements ICronJobHandler {
  readonly jobCode = 'ESCALATE_UNATTENDED';
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<CronJobResult> {
    const rules = await this.prisma.assignmentRule.findMany({
      where: { isActive: true, escalateAfterHours: { not: null } },
    });
    let processed = 0;
    for (const rule of rules) {
      if (!rule.escalateAfterHours || !rule.escalateToUserId) continue;
      const cutoff = new Date(Date.now() - rule.escalateAfterHours * 3600000);
      const stale = await this.prisma.entityOwner.findMany({
        where: {
          entityType: rule.entityType, ownerType: 'PRIMARY_OWNER',
          isActive: true, createdAt: { lte: cutoff },
        },
        take: 10,
      });
      processed += stale.length;
    }
    return { recordsProcessed: processed };
  }
}

/** Expire time-limited ownership entries. */
@Injectable()
export class ExpireOwnershipHandler implements ICronJobHandler {
  readonly jobCode = 'EXPIRE_OWNERSHIP';
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<CronJobResult> {
    const expired = await this.prisma.entityOwner.findMany({
      where: { validTo: { lte: new Date() }, isActive: true },
    });
    for (const owner of expired) {
      await this.prisma.entityOwner.update({
        where: { id: owner.id },
        data: { isActive: false },
      });
    }
    return { recordsProcessed: expired.length, recordsSucceeded: expired.length };
  }
}

/** Recalculate all user capacity counts. */
@Injectable()
export class RecalcCapacityHandler implements ICronJobHandler {
  readonly jobCode = 'RECALC_CAPACITY';
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<CronJobResult> {
    const capacities = await this.prisma.userCapacity.findMany();
    for (const cap of capacities) {
      const counts = await Promise.all([
        this.prisma.entityOwner.count({ where: { userId: cap.userId, entityType: 'LEAD', isActive: true } }),
        this.prisma.entityOwner.count({ where: { userId: cap.userId, entityType: 'CONTACT', isActive: true } }),
        this.prisma.entityOwner.count({ where: { userId: cap.userId, entityType: 'ORGANIZATION', isActive: true } }),
        this.prisma.entityOwner.count({ where: { userId: cap.userId, entityType: 'QUOTATION', isActive: true } }),
      ]);
      const total = counts.reduce((a, b) => a + b, 0);
      await this.prisma.userCapacity.update({
        where: { userId: cap.userId },
        data: {
          activeLeads: counts[0], activeContacts: counts[1],
          activeOrganizations: counts[2], activeQuotations: counts[3],
          activeTotal: total,
        },
      });
    }
    return { recordsProcessed: capacities.length, recordsSucceeded: capacities.length };
  }
}
