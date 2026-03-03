import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { ICronJobHandler, CronJobResult } from '../services/job-registry.service';

/** Auto-expire stale leads beyond configured days. */
@Injectable()
export class LeadAutoExpireHandler implements ICronJobHandler {
  readonly jobCode = 'LEAD_AUTO_EXPIRE';
  constructor(private readonly prisma: PrismaService) {}

  async execute(params: Record<string, any>): Promise<CronJobResult> {
    const expiryDays = params.expiryDays ?? 90;
    const cutoff = new Date(Date.now() - expiryDays * 86400000);
    const result = await this.prisma.lead.updateMany({
      where: {
        status: { in: ['NEW', 'VERIFIED', 'ALLOCATED', 'IN_PROGRESS'] },
        updatedAt: { lt: cutoff },
      },
      data: { status: 'LOST' },
    });
    return { recordsProcessed: result.count };
  }
}

/** Expire quotations past their validity date. */
@Injectable()
export class QuotationExpiryHandler implements ICronJobHandler {
  readonly jobCode = 'QUOTATION_EXPIRY';
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<CronJobResult> {
    const now = new Date();
    const result = await this.prisma.quotation.updateMany({
      where: {
        status: { in: ['SENT', 'VIEWED', 'NEGOTIATION'] },
        validUntil: { lt: now },
      },
      data: { status: 'EXPIRED' },
    });
    return { recordsProcessed: result.count };
  }
}

/** Recalculate sales targets vs achievement. */
@Injectable()
export class RecalcSalesTargetsHandler implements ICronJobHandler {
  readonly jobCode = 'RECALC_SALES_TARGETS';
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<CronJobResult> {
    const targets = await this.prisma.salesTarget.findMany({
      where: { periodEnd: { gte: new Date() } },
    });
    for (const target of targets) {
      const wonLeads = await this.prisma.lead.aggregate({
        where: {
          allocatedToId: target.userId,
          status: 'WON',
          updatedAt: { gte: target.periodStart, lte: target.periodEnd },
        },
        _sum: { expectedValue: true },
      });
      const achieved = wonLeads._sum?.expectedValue?.toNumber() ?? 0;
      await this.prisma.salesTarget.update({
        where: { id: target.id },
        data: {
          currentValue: achieved,
          achievedPercent: target.targetValue.toNumber() > 0
            ? (achieved / target.targetValue.toNumber()) * 100 : 0,
        },
      });
    }
    return { recordsProcessed: targets.length, recordsSucceeded: targets.length };
  }
}

/** Process due reminders. */
@Injectable()
export class ProcessRemindersHandler implements ICronJobHandler {
  readonly jobCode = 'PROCESS_REMINDERS';
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<CronJobResult> {
    const now = new Date();
    const due = await this.prisma.reminder.findMany({
      where: { scheduledAt: { lte: now }, isSent: false, isActive: true },
    });
    for (const r of due) {
      await this.prisma.reminder.update({
        where: { id: r.id },
        data: { isSent: true, sentAt: now },
      });
    }
    return { recordsProcessed: due.length, recordsSucceeded: due.length };
  }
}

/** Check and mark overdue follow-ups. */
@Injectable()
export class CheckOverdueFollowUpsHandler implements ICronJobHandler {
  readonly jobCode = 'CHECK_OVERDUE_FOLLOWUPS';
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<CronJobResult> {
    const now = new Date();
    const result = await this.prisma.followUp.updateMany({
      where: { dueDate: { lt: now }, isOverdue: false, isActive: true, completedAt: null },
      data: { isOverdue: true },
    });
    return { recordsProcessed: result.count };
  }
}

/** Generate recurring event occurrences. */
@Injectable()
export class GenerateRecurrencesHandler implements ICronJobHandler {
  readonly jobCode = 'GENERATE_RECURRENCES';
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<CronJobResult> {
    const events = await this.prisma.recurringEvent.findMany({
      where: { isActive: true },
    });
    return { recordsProcessed: events.length };
  }
}

/** Check SLA breaches — delegates to SlaMonitorService logic. */
@Injectable()
export class CheckSlaBreachesHandler implements ICronJobHandler {
  readonly jobCode = 'CHECK_SLA_BREACHES';
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<CronJobResult> {
    const instances = await this.prisma.workflowInstance.findMany({
      where: { isActive: true, completedAt: null },
      include: { currentState: true },
    });
    let breached = 0;
    for (const instance of instances) {
      const metadata = (instance.currentState as any)?.metadata as any;
      if (!metadata?.slaHours) continue;
      const slaHours = Number(metadata.slaHours);
      const hoursInState = (Date.now() - new Date(instance.updatedAt).getTime()) / (1000 * 60 * 60);
      if (hoursInState <= slaHours) continue;
      const escalationLevel = Math.min(Math.floor(hoursInState / slaHours), 3);
      const exists = await this.prisma.workflowSlaEscalation.findFirst({
        where: { instanceId: instance.id, stateId: instance.currentStateId, escalationLevel, isResolved: false },
      });
      if (!exists) {
        await this.prisma.workflowSlaEscalation.create({
          data: { instanceId: instance.id, stateId: instance.currentStateId, slaHours, escalationLevel },
        });
        breached++;
      }
    }
    return { recordsProcessed: instances.length, recordsSucceeded: breached };
  }
}
