import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { TaskRecurrence } from '@prisma/working-client';
import { getErrorMessage } from '@/common/utils/error.utils';

@Injectable()
export class TaskRecurrenceService {
  private readonly logger = new Logger(TaskRecurrenceService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Calculate the next occurrence date based on the recurrence pattern. */
  calculateNextDate(fromDate: Date, recurrence: TaskRecurrence): Date | null {
    if (recurrence === 'NONE') return null;

    const next = new Date(fromDate);
    switch (recurrence) {
      case 'DAILY':
        next.setDate(next.getDate() + 1);
        break;
      case 'WEEKLY':
        next.setDate(next.getDate() + 7);
        break;
      case 'BIWEEKLY':
        next.setDate(next.getDate() + 14);
        break;
      case 'MONTHLY':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'QUARTERLY':
        next.setMonth(next.getMonth() + 3);
        break;
    }
    return next;
  }

  /** Process recurring tasks: create next occurrence for completed recurring tasks. */
  async processRecurringTasks(): Promise<number> {
    const completedRecurring = await this.prisma.working.task.findMany({
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

        // Generate task number
        const count = await this.prisma.working.task.count({ where: { tenantId: task.tenantId } });
        const taskNumber = `TSK-${String(count + 1).padStart(4, '0')}`;

        await this.prisma.working.task.create({
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

        // Clear the nextRecurrenceDate on the completed task
        await this.prisma.working.task.update({
          where: { id: task.id },
          data: { nextRecurrenceDate: null },
        });

        created++;
      } catch (error) {
        this.logger.error(`Failed to create recurrence for task ${task.id}: ${getErrorMessage(error)}`);
      }
    }

    return created;
  }
}
