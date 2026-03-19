// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { CreateActivityCommand } from './create-activity.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { ChannelRouterService } from '../../../../../core/work/notifications/services/channel-router.service';
import { createAutoReminder } from '../../../../../../common/utils/reminder.utils';
import { CALENDAR_COLORS } from '../../../../../../common/utils/calendar-colors';
import { getErrorMessage } from '@/common/utils/error.utils';

@CommandHandler(CreateActivityCommand)
export class CreateActivityHandler implements ICommandHandler<CreateActivityCommand> {
  private readonly logger = new Logger(CreateActivityHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly channelRouter: ChannelRouterService,
  ) {}

  async execute(cmd: CreateActivityCommand) {
    const activity = await this.prisma.activity.create({
      data: {
        tenantId: cmd.tenantId || '',
        type: cmd.type as any,
        subject: cmd.subject,
        description: cmd.description,
        scheduledAt: cmd.scheduledAt,
        endTime: cmd.endTime,
        duration: cmd.duration,
        leadId: cmd.leadId,
        contactId: cmd.contactId,
        locationName: cmd.locationName,
        latitude: cmd.latitude,
        longitude: cmd.longitude,
        createdById: cmd.userId,
      },
      include: { lead: true, contact: true, createdByUser: true },
    });

    // Auto-create Task + Reminder when reminder is selected
    if (cmd.scheduledAt && cmd.reminderMinutesBefore != null) {
      const task = await this.createLinkedTask(cmd, activity.id);
      await this.createLinkedReminder(cmd, task.id, activity.id);
    } else if (cmd.scheduledAt) {
      // Legacy: create auto-reminder without task link
      await createAutoReminder(this.prisma, {
        entityType: 'ACTIVITY',
        entityId: activity.id,
        eventDate: new Date(cmd.scheduledAt),
        title: cmd.subject,
        recipientId: cmd.userId,
        createdById: cmd.userId,
      });
    }

    // Handle tagged users: add as watchers + send notification
    if (cmd.taggedUserIds?.length) {
      await this.handleTaggedUsers(cmd, activity);
    }

    // Calendar event sync
    if (cmd.scheduledAt) {
      await this.syncCalendarEvent(cmd, activity.id);
    }

    return activity;
  }

  private async createLinkedTask(cmd: CreateActivityCommand, activityId: string) {
    const tenantId = cmd.tenantId || '';

    // Generate next task number
    const lastTask = await this.prisma.task.findFirst({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      select: { taskNumber: true },
    });
    const nextNum = lastTask?.taskNumber
      ? parseInt(lastTask.taskNumber.replace('TSK-', ''), 10) + 1
      : 1;
    const taskNumber = `TSK-${String(nextNum).padStart(4, '0')}`;

    const task = await this.prisma.task.create({
      data: {
        tenantId,
        taskNumber,
        title: `Activity Reminder: ${cmd.subject}`,
        description: cmd.description,
        type: 'ACTIVITY_LINKED',
        status: 'OPEN',
        priority: 'MEDIUM',
        dueDate: cmd.scheduledAt ? new Date(cmd.scheduledAt) : undefined,
        entityType: 'activity',
        entityId: activityId,
        assignedToId: cmd.userId,
        createdById: cmd.userId,
      },
    });

    // Add creator as watcher
    await this.prisma.taskWatcher.create({
      data: { taskId: task.id, userId: cmd.userId },
    });

    // Record creation history
    await this.prisma.taskHistory.create({
      data: {
        taskId: task.id,
        field: 'status',
        oldValue: null,
        newValue: 'OPEN',
        changedById: cmd.userId,
      },
    });

    this.logger.log(`Auto-created task ${taskNumber} for activity ${activityId}`);
    return task;
  }

  private async createLinkedReminder(cmd: CreateActivityCommand, taskId: string, activityId: string) {
    const scheduledAt = new Date(cmd.scheduledAt!);
    const reminderTime = new Date(scheduledAt.getTime() - (cmd.reminderMinutesBefore! * 60 * 1000));

    await this.prisma.reminder.create({
      data: {
        title: `Reminder: ${cmd.subject}`,
        entityType: 'ACTIVITY',
        entityId: activityId,
        scheduledAt: reminderTime,
        recipientId: cmd.userId,
        createdById: cmd.userId,
        status: 'PENDING',
        type: 'ACTIVITY_LINKED',
        taskId,
      },
    });

    this.logger.log(`Auto-created reminder for task ${taskId}, ${cmd.reminderMinutesBefore} min before activity`);
  }

  private async handleTaggedUsers(cmd: CreateActivityCommand, activity: any) {
    const creator = await this.prisma.user.findUnique({
      where: { id: cmd.userId },
      select: { firstName: true, lastName: true },
    });
    const creatorName = creator ? `${creator.firstName} ${creator.lastName}`.trim() : 'Someone';

    for (const taggedUserId of cmd.taggedUserIds!) {
      if (taggedUserId === cmd.userId) continue; // Skip creator

      // Add tagged user as watcher on any linked task
      const linkedTask = await this.prisma.task.findFirst({
        where: { entityType: 'activity', entityId: activity.id, isActive: true },
      });
      if (linkedTask) {
        await this.prisma.taskWatcher.upsert({
          where: { taskId_userId: { taskId: linkedTask.id, userId: taggedUserId } },
          create: { taskId: linkedTask.id, userId: taggedUserId },
          update: {},
        });
      }

      // Send ACTIVITY_TAGGED notification
      try {
        await this.channelRouter.send({
          templateName: 'activity_tagged',
          recipientId: taggedUserId,
          senderId: cmd.userId,
          variables: {
            taggerName: creatorName,
            activityType: cmd.type,
            activitySubject: cmd.subject,
            scheduledAt: cmd.scheduledAt ? new Date(cmd.scheduledAt).toLocaleString() : 'N/A',
          },
          entityType: 'activity',
          entityId: activity.id,
        });
      } catch (error) {
        this.logger.warn(`Failed to send ACTIVITY_TAGGED notification to ${taggedUserId}: ${getErrorMessage(error)}`);
      }
    }
  }

  private async syncCalendarEvent(cmd: CreateActivityCommand, activityId: string) {
    const existingEvent = await this.prisma.calendarEvent.findFirst({
      where: { eventType: 'ACTIVITY', sourceId: activityId },
    });
    if (existingEvent) {
      await this.prisma.calendarEvent.update({
        where: { id: existingEvent.id },
        data: {
          title: cmd.subject,
          startTime: new Date(cmd.scheduledAt!),
          endTime: cmd.endTime ? new Date(cmd.endTime) : undefined,
        },
      });
    } else {
      await this.prisma.calendarEvent.create({
        data: {
          eventType: 'ACTIVITY',
          sourceId: activityId,
          title: cmd.subject,
          description: cmd.description,
          startTime: new Date(cmd.scheduledAt!),
          endTime: cmd.endTime ? new Date(cmd.endTime) : undefined,
          color: CALENDAR_COLORS[cmd.type] || CALENDAR_COLORS.CALL,
          userId: cmd.userId,
        },
      });
    }
  }
}
