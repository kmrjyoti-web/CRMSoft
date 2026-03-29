// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ApproveTaskCommand } from './approve-task.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { CALENDAR_COLORS } from '../../../../../../common/utils/calendar-colors';
import { getErrorMessage } from '@/common/utils/error.utils';

@CommandHandler(ApproveTaskCommand)
export class ApproveTaskHandler implements ICommandHandler<ApproveTaskCommand> {
  private readonly logger = new Logger(ApproveTaskHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: ApproveTaskCommand) {
    const existing = await this.prisma.working.task.findUnique({
      where: { id: cmd.id },
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!existing) throw new NotFoundException('Task not found');
    if (existing.status !== 'PENDING_APPROVAL') {
      throw new BadRequestException('Task is not pending approval');
    }

    const task = await this.prisma.working.task.update({
      where: { id: cmd.id },
      data: {
        status: 'OPEN',
        approvedById: cmd.userId,
        approvedAt: new Date(),
      },
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    // Record approval in history
    await this.prisma.working.taskHistory.create({
      data: {
        tenantId: cmd.tenantId,
        taskId: cmd.id,
        action: 'STATUS_CHANGED',
        field: 'status',
        oldValue: 'PENDING_APPROVAL',
        newValue: 'OPEN',
        changedById: cmd.userId,
      },
    });

    // Auto-create Activity on approval
    await this.autoCreateActivity(existing, cmd);

    // Sync Calendar Event on approval
    if (existing.dueDate) {
      await this.syncCalendarEvent(existing, cmd);
    }

    return task;
  }

  private async autoCreateActivity(task: any, cmd: ApproveTaskCommand) {
    try {
      const activityType = this.mapTaskTypeToActivityType(task.type);

      await this.prisma.working.activity.create({
        data: {
          tenantId: cmd.tenantId || '',
          type: activityType as any,
          subject: task.title,
          description: task.description,
          scheduledAt: task.dueDate,
          leadId: task.entityType === 'LEAD' ? task.entityId : undefined,
          createdById: cmd.userId,
        },
      });

      this.logger.log(`Auto-created activity on approval for task ${task.taskNumber}`);
    } catch (error) {
      this.logger.warn(`Failed to auto-create activity on approval for task ${task.taskNumber}: ${getErrorMessage(error)}`);
    }
  }

  private mapTaskTypeToActivityType(taskType?: string): string {
    const mapping: Record<string, string> = {
      CALL_BACK: 'CALL',
      MEETING: 'MEETING',
      DEMO: 'MEETING',
      FOLLOW_UP: 'CALL',
      REVIEW: 'NOTE',
    };
    return mapping[taskType || ''] || 'NOTE';
  }

  private async syncCalendarEvent(task: any, cmd: ApproveTaskCommand) {
    try {
      const existing = await this.prisma.working.calendarEvent.findFirst({
        where: { eventType: 'TASK', sourceId: task.id },
      });
      if (!existing) {
        await this.prisma.working.calendarEvent.create({
          data: {
            eventType: 'TASK',
            sourceId: task.id,
            title: task.title,
            description: task.description,
            startTime: task.dueDate,
            color: CALENDAR_COLORS.TASK || '#F97316',
            userId: task.assignedToId || task.createdById,
          },
        });
      }
    } catch (error) {
      this.logger.warn(`Failed to sync calendar on approval for task ${task.taskNumber}: ${getErrorMessage(error)}`);
    }
  }
}
