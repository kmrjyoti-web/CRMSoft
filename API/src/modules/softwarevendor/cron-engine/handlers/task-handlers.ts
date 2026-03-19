import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ICronJobHandler, CronJobResult } from '../services/job-registry.service';

/** Mark tasks as OVERDUE when dueDate has passed. */
@Injectable()
export class CheckOverdueTasksHandler implements ICronJobHandler {
  readonly jobCode = 'CHECK_OVERDUE_TASKS';
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<CronJobResult> {
    const now = new Date();
    const result = await this.prisma.task.updateMany({
      where: {
        isActive: true,
        status: { in: ['OPEN', 'IN_PROGRESS'] },
        dueDate: { lt: now },
      },
      data: { status: 'OVERDUE' },
    });

    // Record history for each overdue task
    if (result.count > 0) {
      const overdueTasks = await this.prisma.task.findMany({
        where: { isActive: true, status: 'OVERDUE', dueDate: { lt: now } },
        select: { id: true, createdById: true },
        take: result.count,
      });
      await this.prisma.taskHistory.createMany({
        data: overdueTasks.map(t => ({
          taskId: t.id,
          field: 'status',
          oldValue: 'IN_PROGRESS',
          newValue: 'OVERDUE',
          changedById: t.createdById, // system action
        })),
      });
    }

    return { recordsProcessed: result.count };
  }
}

/** Run escalation rules for overdue tasks. Uses EscalationService. */
@Injectable()
export class CheckTaskEscalationsHandler implements ICronJobHandler {
  readonly jobCode = 'CHECK_TASK_ESCALATIONS';
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<CronJobResult> {
    // Escalation logic is in EscalationService
    // This handler fetches rules and processes them directly via Prisma
    const rules = await this.prisma.escalationRule.findMany({
      where: { isActive: true, entityType: 'task' },
    });

    let escalated = 0;
    for (const rule of rules) {
      const thresholdDate = new Date(Date.now() - rule.triggerAfterHours * 60 * 60 * 1000);
      const overdueTasks = await this.prisma.task.findMany({
        where: {
          isActive: true,
          status: { in: ['OVERDUE'] },
          dueDate: { lt: thresholdDate },
        },
        include: {
          assignedTo: { select: { id: true, reportingToId: true, firstName: true, lastName: true } },
        },
        take: 50,
      });

      for (const task of overdueTasks) {
        try {
          if (rule.action === 'NOTIFY_MANAGER' && task.assignedTo?.reportingToId) {
            // Create in-app notification for manager
            await this.prisma.notification.create({
              data: {
                category: 'SYSTEM_ALERT',
                title: `Escalation: Task ${task.taskNumber} overdue`,
                message: `Task "${task.title}" assigned to ${task.assignedTo.firstName} ${task.assignedTo.lastName} is overdue and has been escalated.`,
                recipientId: task.assignedTo.reportingToId,
                entityType: 'task',
                entityId: task.id,
                priority: 'HIGH',
              },
            });
            escalated++;
          } else if (rule.action === 'AUTO_CLOSE') {
            await this.prisma.task.update({ where: { id: task.id }, data: { status: 'CANCELLED' } });
            escalated++;
          }
        } catch (error) {
          // Log but continue
        }
      }
    }

    return { recordsProcessed: escalated };
  }
}

/** Generate next occurrence for recurring tasks. */
@Injectable()
export class ProcessTaskRecurrenceHandler implements ICronJobHandler {
  readonly jobCode = 'PROCESS_TASK_RECURRENCE';
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<CronJobResult> {
    const completedRecurring = await this.prisma.task.findMany({
      where: {
        status: 'COMPLETED',
        recurrence: { not: 'NONE' },
        nextRecurrenceDate: { lte: new Date() },
        isActive: true,
      },
      take: 100,
    });

    let created = 0;
    for (const task of completedRecurring) {
      try {
        const nextDue = this.calculateNextDate(task.nextRecurrenceDate || task.dueDate || new Date(), task.recurrence);
        if (!nextDue) continue;

        const count = await this.prisma.task.count({ where: { tenantId: task.tenantId } });
        const taskNumber = `TSK-${String(count + 1).padStart(4, '0')}`;

        await this.prisma.task.create({
          data: {
            tenantId: task.tenantId,
            taskNumber,
            title: task.title,
            description: task.description,
            type: task.type,
            priority: task.priority,
            recurrence: task.recurrence,
            dueDate: nextDue,
            nextRecurrenceDate: this.calculateNextDate(nextDue, task.recurrence),
            entityType: task.entityType,
            entityId: task.entityId,
            assignedToId: task.assignedToId,
            createdById: task.createdById,
          },
        });

        await this.prisma.task.update({
          where: { id: task.id },
          data: { nextRecurrenceDate: null },
        });

        created++;
      } catch (_) {}
    }

    return { recordsProcessed: completedRecurring.length, recordsSucceeded: created };
  }

  private calculateNextDate(fromDate: Date, recurrence: string): Date | null {
    if (recurrence === 'NONE') return null;
    const next = new Date(fromDate);
    switch (recurrence) {
      case 'DAILY': next.setDate(next.getDate() + 1); break;
      case 'WEEKLY': next.setDate(next.getDate() + 7); break;
      case 'BIWEEKLY': next.setDate(next.getDate() + 14); break;
      case 'MONTHLY': next.setMonth(next.getMonth() + 1); break;
      case 'QUARTERLY': next.setMonth(next.getMonth() + 3); break;
    }
    return next;
  }
}

/** Mark PENDING reminders > 1h past scheduledAt as MISSED. */
@Injectable()
export class CheckMissedRemindersHandler implements ICronJobHandler {
  readonly jobCode = 'CHECK_MISSED_REMINDERS';
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<CronJobResult> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const result = await this.prisma.reminder.updateMany({
      where: {
        isActive: true,
        status: 'PENDING',
        scheduledAt: { lt: oneHourAgo },
      },
      data: { status: 'MISSED', missedAt: new Date() },
    });
    return { recordsProcessed: result.count };
  }
}
