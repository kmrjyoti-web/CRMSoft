// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { CreateTaskCommand } from './create-task.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { TaskAssignmentService } from '../../services/task-assignment.service';
import { TaskRecurrenceService } from '../../services/task-recurrence.service';
import { TaskRecurrence } from '@prisma/working-client';
import { CALENDAR_COLORS } from '../../../../../../common/utils/calendar-colors';
import { getErrorMessage } from '@/common/utils/error.utils';

@CommandHandler(CreateTaskCommand)
export class CreateTaskHandler implements ICommandHandler<CreateTaskCommand> {
  private readonly logger = new Logger(CreateTaskHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly assignmentService: TaskAssignmentService,
    private readonly recurrenceService: TaskRecurrenceService,
  ) {}

  async execute(cmd: CreateTaskCommand) {
    // RBAC assignment validation (when assigning to specific user)
    const scope = cmd.assignmentScope || 'SPECIFIC_USER';
    if (cmd.assignedToId && cmd.assignedToId !== cmd.createdById) {
      await this.assignmentService.validateAssignment(
        cmd.createdById, cmd.assignedToId, cmd.creatorRoleLevel,
        scope, cmd.assignedDepartmentId, cmd.assignedDesignationId, cmd.assignedRoleId,
      );
    }

    // Generate task number
    const count = await this.prisma.task.count({ where: { tenantId: cmd.tenantId } });
    const taskNumber = `TSK-${String(count + 1).padStart(4, '0')}`;

    const recurrence = (cmd.recurrence as TaskRecurrence) || 'NONE';
    const dueDate = cmd.dueDate ? new Date(cmd.dueDate) : null;
    const nextRecurrenceDate = dueDate && recurrence !== 'NONE'
      ? this.recurrenceService.calculateNextDate(dueDate, recurrence)
      : null;

    // Resolve lead linking
    const entityType = cmd.leadId ? 'LEAD' : cmd.entityType;
    const entityId = cmd.leadId || cmd.entityId;

    // Determine initial status — self-assigned tasks by non-managers need approval
    const assigneeId = cmd.assignedToId || cmd.createdById;
    const isSelfTask = assigneeId === cmd.createdById;
    const isNonManager = cmd.creatorRoleLevel >= 4;
    const initialStatus = (isSelfTask && isNonManager) ? 'PENDING_APPROVAL' : 'OPEN';

    const task = await this.prisma.task.create({
      data: {
        tenantId: cmd.tenantId,
        taskNumber,
        title: cmd.title,
        description: cmd.description,
        type: (cmd.type as any) || 'GENERAL',
        customTaskType: cmd.customTaskType,
        status: initialStatus,
        priority: (cmd.priority as any) || 'MEDIUM',
        assignmentScope: scope as any,
        assignedToId: assigneeId,
        assignedDepartmentId: cmd.assignedDepartmentId,
        assignedDesignationId: cmd.assignedDesignationId,
        assignedRoleId: cmd.assignedRoleId,
        dueDate,
        dueTime: cmd.dueTime,
        startDate: cmd.startDate ? new Date(cmd.startDate) : null,
        recurrence,
        recurrenceConfig: cmd.recurrenceConfig,
        nextRecurrenceDate,
        parentTaskId: cmd.parentTaskId,
        entityType,
        entityId,
        tags: cmd.tags,
        attachments: cmd.attachments,
        customFields: cmd.customFields,
        estimatedMinutes: cmd.estimatedMinutes,
        createdById: cmd.createdById,
      },
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    // Auto-add creator as watcher if different from assignee
    if (cmd.createdById !== assigneeId) {
      await this.prisma.taskWatcher.create({
        data: { taskId: task.id, userId: cmd.createdById },
      });
    }

    // Record creation in history
    await this.prisma.taskHistory.create({
      data: {
        tenantId: cmd.tenantId,
        taskId: task.id,
        action: 'CREATED',
        field: 'status',
        oldValue: null,
        newValue: initialStatus,
        changedById: cmd.createdById,
      },
    });

    // Auto-create Activity when task is directly OPEN (manager-created)
    if (initialStatus === 'OPEN') {
      await this.autoCreateActivity(cmd, task);
    }

    // Auto-create Reminder when reminderMinutesBefore is provided
    if (dueDate && cmd.reminderMinutesBefore != null) {
      await this.createLinkedReminder(cmd, task.id, dueDate);
    }

    // Sync Calendar Event when dueDate is provided
    if (dueDate) {
      await this.syncCalendarEvent(cmd, task, dueDate);
    }

    return task;
  }

  private async autoCreateActivity(cmd: CreateTaskCommand, task: any) {
    try {
      const activityType = cmd.activityType || this.mapTaskTypeToActivityType(cmd.type);

      const activity = await this.prisma.activity.create({
        data: {
          tenantId: cmd.tenantId || '',
          type: activityType as any,
          subject: cmd.title,
          description: cmd.description,
          scheduledAt: cmd.dueDate ? new Date(cmd.dueDate) : undefined,
          leadId: cmd.leadId || (cmd.entityType === 'LEAD' ? cmd.entityId : undefined),
          createdById: cmd.createdById,
        },
      });

      this.logger.log(`Auto-created activity ${activity.id} for task ${task.taskNumber}`);
    } catch (error) {
      this.logger.warn(`Failed to auto-create activity for task ${task.taskNumber}: ${getErrorMessage(error)}`);
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

  private async createLinkedReminder(cmd: CreateTaskCommand, taskId: string, dueDate: Date) {
    try {
      const reminderTime = new Date(dueDate.getTime() - (cmd.reminderMinutesBefore! * 60 * 1000));

      await this.prisma.reminder.create({
        data: {
          title: `Reminder: ${cmd.title}`,
          entityType: 'TASK',
          entityId: taskId,
          scheduledAt: reminderTime,
          recipientId: cmd.assignedToId || cmd.createdById,
          createdById: cmd.createdById,
          status: 'PENDING',
          type: 'TASK_LINKED',
          taskId,
        },
      });

      this.logger.log(`Auto-created reminder for task ${taskId}, ${cmd.reminderMinutesBefore} min before due`);
    } catch (error) {
      this.logger.warn(`Failed to create reminder for task ${taskId}: ${getErrorMessage(error)}`);
    }
  }

  private async syncCalendarEvent(cmd: CreateTaskCommand, task: any, dueDate: Date) {
    try {
      await this.prisma.calendarEvent.create({
        data: {
          eventType: 'TASK',
          sourceId: task.id,
          title: cmd.title,
          description: cmd.description,
          startTime: dueDate,
          color: CALENDAR_COLORS.TASK || '#F97316',
          userId: cmd.assignedToId || cmd.createdById,
        },
      });

      this.logger.log(`Auto-created calendar event for task ${task.taskNumber}`);
    } catch (error) {
      this.logger.warn(`Failed to sync calendar for task ${task.taskNumber}: ${getErrorMessage(error)}`);
    }
  }
}
